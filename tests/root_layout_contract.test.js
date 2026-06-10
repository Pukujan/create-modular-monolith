import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert';
import { mkdtemp, readdir, rm, stat } from 'fs/promises';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

const REPO_ROOT = process.cwd();
const ROOT_ALLOWLIST = new Set([
  'AGENTS.md',
  'MEMORY.md',
  'README.md',
  '.agents',
  '.github',
  '.gitignore',
  'LICENSE',
  'NOTICE',
  'backend',
  'frontend',
  'additional-modules',
  'package.json'
]);

const ADDON_OWNED_ROOTS = ['docs', 'file-exchange', 'scripts', 'work-log'];

describe('clean scaffold root contract', () => {
  it('keeps addon-owned infrastructure under additional-modules, not at the scaffold root', async () => {
    const projectRoot = await scaffoldProject();
    const entries = await readdir(projectRoot, { withFileTypes: true });
    const names = entries.filter((entry) => entry.isDirectory() || entry.isFile()).map((entry) => entry.name);

    for (const forbidden of ADDON_OWNED_ROOTS) {
      ok(!names.includes(forbidden), `unexpected root entry in generated scaffold: ${forbidden}`);
    }

    for (const allowed of ROOT_ALLOWLIST) {
      ok(names.includes(allowed), `expected root entry in generated scaffold: ${allowed}`);
    }

    await rm(projectRoot, { recursive: true, force: true });
  });

  it('places architecture, file-exchange, scripts, and work-log under additional-modules', async () => {
    const projectRoot = await scaffoldProject();
    const expected = [
      join(projectRoot, 'additional-modules', 'docs'),
      join(projectRoot, 'additional-modules', 'file-exchange'),
      join(projectRoot, 'additional-modules', 'scripts'),
      join(projectRoot, 'additional-modules', 'work-log'),
      join(projectRoot, 'additional-modules', 'phase-builder'),
      join(projectRoot, 'additional-modules', 'context-engineering')
    ];

    for (const path of expected) {
      const fileStat = await stat(path);
      ok(fileStat.isDirectory(), `expected directory at ${path}`);
    }

    await rm(projectRoot, { recursive: true, force: true });
  });

  async function scaffoldProject() {
    const tempDir = await mkdtemp(join(tmpdir(), 'cmm-root-layout-'));
    const target = join(tempDir, 'generated');
    const result = spawnSync('node', [join(REPO_ROOT, 'index.js'), target], {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    });

    equal(result.status, 0, result.stderr || result.stdout);
    return target;
  }
});
