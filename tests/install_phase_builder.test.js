import { describe, it } from 'node:test';
import { ok } from 'node:assert';
import { mkdtemp, access, rm } from 'fs/promises';
import { constants } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { resolve } from 'path';

describe('starter install phase-builder addon', () => {
  it('copies a usable phase-builder addon into the generated project', async () => {
    const target = await mkdtemp(resolve(tmpdir(), 'cmm-install-'));

    try {
      const result = spawnSync(
        'node',
        [resolve(process.cwd(), 'index.js'), target],
        { cwd: resolve(process.cwd()), encoding: 'utf8' }
      );

      ok(result.status === 0, result.stderr || result.stdout);

      const addonRoot = resolve(target, 'additional-modules', 'phase-builder');
      const runtimeInit = resolve(addonRoot, 'phase_builder', '__init__.py');
      const pytestIni = resolve(addonRoot, 'pytest.ini');
      const testState = resolve(addonRoot, 'tests', 'phase_01', 'test_state.py');
      const venvPath = resolve(addonRoot, '.venv');

      await access(runtimeInit, constants.F_OK);
      await access(pytestIni, constants.F_OK);
      await access(testState, constants.F_OK);

      let venvExists = true;
      try {
        await access(venvPath, constants.F_OK);
      } catch {
        venvExists = false;
      }
      ok(!venvExists, '.venv should not be copied into starter installs');
    } finally {
      await rm(target, { recursive: true, force: true });
    }
  });
});
