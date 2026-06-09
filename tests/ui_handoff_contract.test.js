import { describe, it, beforeEach, afterEach } from 'node:test';
import { equal, ok } from 'node:assert';
import { mkdtemp, readFile, rm, copyFile, mkdir, writeFile, access } from 'fs/promises';
import { spawnSync } from 'child_process';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const REPO_ROOT = process.cwd();
const CLI = resolve(REPO_ROOT, 'additional-modules/ui-handoff-contract/bin/ui-handoff-contract.js');
const FIXTURE = resolve(REPO_ROOT, 'tests/fixtures/workout-contract-handoff-package');

describe('ui handoff contract addon', () => {
  let roots = [];

  beforeEach(() => {
    roots = [];
  });

  afterEach(async () => {
    await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  });

  it('accepts the workout handoff package and writes contract outputs', async () => {
    const out = await runCli(FIXTURE);

    equal(out.status, 0, out.stderr || out.stdout);
    await expectFiles(out.outDir, [
      'ui-contract.json',
      'api-contract.json',
      'handoff-contract.md',
      'allowed-files.json',
      'no-drift.rules.md',
      'phase-input.json',
      'contract-report.json'
    ]);

    const report = JSON.parse(await readFile(join(out.outDir, 'contract-report.json'), 'utf8'));
    ok(report.accepted);
    equal(report.packageName, 'workout-contract-handoff-package');
  });

  it('rejects a package missing docs/ui-contract.md', async () => {
    const pkg = await cloneFixture();
    await rm(join(pkg, 'docs', 'ui-contract.md'));

    const out = await runCli(pkg);
    ok(out.status !== 0);
    ok((out.stderr || out.stdout).includes('docs/ui-contract.md'));
  });

  it('rejects a package missing docs/api-contract.md', async () => {
    const pkg = await cloneFixture();
    await rm(join(pkg, 'docs', 'api-contract.md'));

    const out = await runCli(pkg);
    ok(out.status !== 0);
    ok((out.stderr || out.stdout).includes('docs/api-contract.md'));
  });

  it('rejects wrong route strings in the service adapter', async () => {
    const pkg = await cloneFixture();
    await writeFile(
      join(pkg, 'frontend', 'src', 'services', 'workoutApi.ts'),
      (await readFile(join(pkg, 'frontend', 'src', 'services', 'workoutApi.ts'), 'utf8')).replace(
        '/workout-plans',
        '/bad-path'
      )
    );

    const out = await runCli(pkg);
    ok(out.status !== 0);
    ok((out.stderr || out.stdout).includes('missing route path'));
  });

  it('rejects direct fetch calls outside the service adapter', async () => {
    const pkg = await cloneFixture();
    const uiDir = join(pkg, 'landing-ui');
    await writeFile(join(uiDir, 'debug.tsx'), 'export const bad = () => fetch("/api/workout-plans")');

    const out = await runCli(pkg);
    ok(out.status !== 0);
    ok((out.stderr || out.stdout).includes('fetch'));
  });

  it('rejects handoff text that allows redesigning the UI', async () => {
    const pkg = await cloneFixture();
    await writeFile(
      join(pkg, 'docs', 'handoff.md'),
      `${await readFile(join(pkg, 'docs', 'handoff.md'), 'utf8')}\n\nYou may redesign the UI if needed.`
    );

    const out = await runCli(pkg);
    ok(out.status !== 0);
    ok((out.stderr || out.stdout).includes('redesign'));
  });

  it('emits a phase input with the required implementation phases', async () => {
    const out = await runCli(FIXTURE);
    equal(out.status, 0, out.stderr || out.stdout);

    const phaseInput = JSON.parse(await readFile(join(out.outDir, 'phase-input.json'), 'utf8'));
    const ids = phaseInput.phases.map((phase) => phase.id);
    equal(ids.length, 7);
    ok(ids.includes('phase-001-contract-lock'));
    ok(ids.includes('phase-007-browser-contract-smoke'));
    for (const phase of phaseInput.phases) {
      ok(Array.isArray(phase.allowedFiles));
      ok(Array.isArray(phase.forbiddenFiles));
      ok(Array.isArray(phase.testsToWriteFirst));
      ok(phase.passCondition);
      ok(phase.failCondition);
      ok(Number.isFinite(phase.maxContextTokens));
    }
  });

  async function runCli(packagePath) {
    const outDir = await mkdtemp(join(tmpdir(), 'cmm-ui-contract-'));
    roots.push(outDir);
    const result = spawnSync('node', [CLI, '--package', packagePath, '--out', outDir], {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    });
    return { ...result, outDir };
  }

  async function cloneFixture() {
    const root = await mkdtemp(join(tmpdir(), 'cmm-workout-fixture-'));
    roots.push(root);
    const pkg = join(root, 'workout-contract-handoff-package');
    await mkdir(pkg, { recursive: true });
    const files = [
      'README.md',
      'landing-ui/forgefit-landing.html',
      'docs/ui-contract.md',
      'docs/api-contract.md',
      'docs/handoff.md',
      'docs/acceptance-tests.md',
      'frontend/src/services/workoutApi.ts',
      'tests/contract/workout-contract.test.ts',
      'prompts/codex-opencode-handoff-prompt.md'
    ];
    for (const file of files) {
      const src = join(FIXTURE, file);
      const dest = join(pkg, file);
      await mkdir(join(dest, '..'), { recursive: true });
      await copyFile(src, dest);
    }
    return pkg;
  }

  async function expectFiles(dir, files) {
    for (const file of files) {
      await access(join(dir, file));
    }
  }
});
