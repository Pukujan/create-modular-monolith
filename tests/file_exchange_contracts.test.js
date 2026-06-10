import { describe, it, afterEach } from 'node:test';
import { equal, ok } from 'node:assert';
import { cpSync } from 'fs';
import { access, mkdir, rm as rmAsync, writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const REPO_ROOT = process.cwd();
const TEMPLATE_ROOT = resolve(REPO_ROOT, 'template');

describe('file-exchange and starter export contracts', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(tempRoots.map((root) => rmAsync(root, { recursive: true, force: true })));
    tempRoots.length = 0;
  });

  it('template lint-repo-artifacts accepts the starter layout', async () => {
    const result = spawnSync(
      'node',
      [resolve(TEMPLATE_ROOT, 'scripts/lint-repo-artifacts.mjs')],
      { cwd: TEMPLATE_ROOT, encoding: 'utf8' }
    );

    equal(result.status, 0, result.stderr || result.stdout);
  });

  it('resolveImportStamp accepts human-readable and legacy stamps', async () => {
    const sandbox = await cloneTemplate();
    const importsRoot = join(sandbox, 'file-exchange', 'imports');
    await mkdir(join(importsRoot, '2026-05-23_15-59-43Z'), { recursive: true });
    await mkdir(join(importsRoot, '2026-05-24_10-00-00Z'), { recursive: true });
    await mkdir(join(importsRoot, '2026-05-25_11-12-13Z'), { recursive: true });

    const { resolveImportStamp } = await import(
      pathToFileURL(resolve(sandbox, 'scripts/resolve-import-stamp.mjs')).href
    );

    equal(await resolveImportStamp('2026-05-23_15-59-43Z'), '2026-05-23_15-59-43Z');
    equal(await resolveImportStamp('20260525T111213Z'), '2026-05-25_11-12-13Z');
    equal(await resolveImportStamp(), '2026-05-25_11-12-13Z');
  });

  it('import-to-file-exchange accepts in-repo bundles and preserves external bundles', async () => {
    const sandbox = await cloneTemplate();
    const insideSource = join(sandbox, 'inbound-bundle');
    await mkdir(insideSource, { recursive: true });
    await writeFile(join(insideSource, 'payload.txt'), 'hello import\n');

    const insideStamp = '2026-05-26_12-34-56Z';
    const insideRun = spawnSync(
      'node',
      ['scripts/import-to-file-exchange.mjs', insideSource, insideStamp],
      { cwd: sandbox, encoding: 'utf8' }
    );

    equal(insideRun.status, 0, insideRun.stderr || insideRun.stdout);
    await access(join(sandbox, 'file-exchange', 'imports', insideStamp, 'inbound-bundle', 'payload.txt'));

    let sourceRemoved = false;
    try {
      await access(insideSource);
      sourceRemoved = false;
    } catch {
      sourceRemoved = true;
    }
    ok(sourceRemoved, 'repo-root inbound bundles should be removed after import');

    const externalRoot = await mkdtemp(join(tmpdir(), 'cmm-external-'));
    tempRoots.push(externalRoot);
    const externalSource = join(externalRoot, 'bundle-outside-repo');
    await mkdir(externalSource, { recursive: true });
    await writeFile(join(externalSource, 'payload.txt'), 'outside repo\n');

    const outsideStamp = '2026-05-27_10-11-12Z';
    const outsideRun = spawnSync(
      'node',
      ['scripts/import-to-file-exchange.mjs', externalSource, outsideStamp],
      { cwd: sandbox, encoding: 'utf8' }
    );

    equal(outsideRun.status, 0, outsideRun.stderr || outsideRun.stdout);
    await access(join(sandbox, 'file-exchange', 'imports', outsideStamp, 'bundle-outside-repo', 'payload.txt'));
    await access(externalSource);
  });

  it('export-architecture-starter produces a lint-clean starter copy', async () => {
    const sandbox = await cloneTemplate();
    const exported = join(sandbox, 'exported-starter');
    const exportRun = spawnSync(
      'node',
      ['scripts/export-architecture-starter.mjs', '--to', exported],
      { cwd: sandbox, encoding: 'utf8' }
    );

    equal(exportRun.status, 0, exportRun.stderr || exportRun.stdout);

    const lintRun = spawnSync(
      'node',
      ['scripts/lint-repo-artifacts.mjs'],
      { cwd: exported, encoding: 'utf8' }
    );

    equal(lintRun.status, 0, lintRun.stderr || lintRun.stdout);
    ok(!(await pathExists(join(exported, 'work-log', 'sessions'))));
    ok(!(await pathExists(join(exported, 'work-log', 'study-docs'))));
    await access(join(exported, 'work-log', 'dev-logs', 'human'));
    await access(join(exported, 'work-log', 'dev-logs', 'agent'));
  });

  async function cloneTemplate() {
    const root = await mkdtemp(join(tmpdir(), 'cmm-template-'));
    tempRoots.push(root);
    const sandbox = join(root, 'template');
    cpSync(TEMPLATE_ROOT, sandbox, { recursive: true });
    return sandbox;
  }

  async function pathExists(path) {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }
});
