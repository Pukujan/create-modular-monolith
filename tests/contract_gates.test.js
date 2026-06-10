import { describe, it, afterEach } from 'node:test';
import { equal, ok } from 'node:assert';
import { cpSync } from 'fs';
import { mkdir, readFile, rm as rmAsync, writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const REPO_ROOT = process.cwd();
const TEMPLATE_ROOT = resolve(REPO_ROOT, 'template');

describe('contract gates', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(tempRoots.map((root) => rmAsync(root, { recursive: true, force: true })));
    tempRoots.length = 0;
  });

  it('template lint-contracts passes', () => {
    const result = spawnSync(
      'node',
      [resolve(TEMPLATE_ROOT, 'scripts/lint-contracts.mjs')],
      { cwd: TEMPLATE_ROOT, encoding: 'utf8' }
    );

    equal(result.status, 0, result.stderr || result.stdout);
  });

  it('template lint-deploy passes', () => {
    const result = spawnSync(
      'node',
      [resolve(TEMPLATE_ROOT, 'scripts/lint-deploy.mjs')],
      { cwd: TEMPLATE_ROOT, encoding: 'utf8' }
    );

    equal(result.status, 0, result.stderr || result.stdout);
  });

  it('template check-api-docs passes', () => {
    const result = spawnSync(
      'node',
      [resolve(TEMPLATE_ROOT, 'scripts/check-api-docs.mjs')],
      { cwd: TEMPLATE_ROOT, encoding: 'utf8' }
    );

    equal(result.status, 0, result.stderr || result.stdout);
  });

  it('plan-finalize and plan-gate accept a phase folder with plan and audit logs', async () => {
    const sandbox = await cloneTemplate();
    const slug = 'contract-smoke';
    const planId = '001';
    const phaseDir = join(sandbox, 'work-log', 'planning', `${planId}_2026-05-28_10-00_${slug}`);
    await mkdir(phaseDir, { recursive: true });
    await writeFile(join(phaseDir, 'plan-log.md'), '# plan\n');
    await writeFile(join(phaseDir, 'audit-log.md'), '# audit\n');

    const finalize = spawnSync(
      'node',
      ['scripts/plan-finalize.mjs', '--slug', slug, '--plan-id', planId],
      { cwd: sandbox, encoding: 'utf8' }
    );

    equal(finalize.status, 0, finalize.stderr || finalize.stdout);

    const manifest = JSON.parse(await readFile(join(phaseDir, 'manifest.json'), 'utf8'));
    equal(manifest.planId, planId);
    equal(manifest.slug, slug);
    equal(manifest.status, 'approved');
    ok(manifest.artifacts.planLogMd.endsWith('/plan-log.md'));
    ok(manifest.artifacts.auditLogMd.endsWith('/audit-log.md'));

    const gate = spawnSync(
      'node',
      ['scripts/plan-gate.mjs', '--slug', slug],
      { cwd: sandbox, encoding: 'utf8' }
    );

    equal(gate.status, 0, gate.stderr || gate.stdout);
    ok(gate.stdout.includes(`Plan gate passed for ${planId} (${slug})`));
  });

  async function cloneTemplate() {
    const root = await mkdtemp(join(tmpdir(), 'cmm-contracts-'));
    tempRoots.push(root);
    const sandbox = join(root, 'template');
    cpSync(TEMPLATE_ROOT, sandbox, { recursive: true });
    return sandbox;
  }
});
