import { describe, it, afterEach } from 'node:test';
import { equal, ok } from 'node:assert';
import { copyFile, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { resolve } from 'path';

const RENDERERS = [
  'additional-modules/scripts/render_memory.py',
  'additional-modules/context-engineering/templates/scripts/render_memory.py'
];

function createState() {
  return {
    version: '1.0.0',
    branch: 'feature/cache-prefix',
    latestCommit: 'abc1234',
    projectDescription: 'Stable architecture context belongs at the top.',
    activeModule: {
      slug: 'pipeline-agent-mini-modules',
      kind: 'architecture',
      parentModule: 'none',
      startedAt: '2026-06-09T12:00:00.000Z',
      phase: 'implementation',
      backendStatus: 'in-progress',
      frontendStatus: 'not-started',
      tasks: {
        completed: [],
        inProgress: ['stabilize contracts'],
        next: ['repair phase-builder install']
      }
    },
    modules: {},
    architecture: {
      registryPath: 'additional-modules/docs/architecture/contracts/manifest.json',
      registryVersion: '1.0.0',
      miniModuleCount: 3,
      implemented: 1,
      planned: 2,
      gate: 1
    },
    lint: {
      lastRun: '2026-06-09T12:30:00.000Z',
      lastResult: 'passed',
      lastPass: true
    },
    sessions: {
      currentId: 'session-alpha',
      lastSessionId: 'session-before',
      archive: ['session-before']
    },
    contextBudget: {
      hardLimit: 28000,
      currentUsage: 12345,
      remaining: 15655,
      sessionStart: '2026-06-09T12:00:00.000Z'
    }
  };
}

describe('MEMORY.md cache-prefix contract', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(tempRoots.map((root) => rm(root, { recursive: true, force: true })));
    tempRoots.length = 0;
  });

  for (const renderer of RENDERERS) {
    it(`${renderer} keeps volatile metadata below stable context`, async () => {
      const projectRoot = await mkdtempTracked();
      await mkdir(resolve(projectRoot, 'additional-modules', 'scripts'), { recursive: true });
      await mkdir(resolve(projectRoot, 'additional-modules', 'buildplan'), { recursive: true });
      await copyFile(resolve(renderer), resolve(projectRoot, 'additional-modules', 'scripts', 'render_memory.py'));
      await writeFile(
        resolve(projectRoot, 'additional-modules', 'buildplan', 'agent_state.json'),
        JSON.stringify(createState(), null, 2) + '\n'
      );

      const result = spawnSync(
        'python3',
        [
          'additional-modules/scripts/render_memory.py',
          '--state',
          'additional-modules/buildplan/agent_state.json',
          '--out',
          'MEMORY.md'
        ],
        { cwd: projectRoot, encoding: 'utf8' }
      );

      equal(result.status, 0, result.stderr || result.stdout);
      const memory = await readFile(resolve(projectRoot, 'MEMORY.md'), 'utf8');
      const first25 = memory.split('\n').slice(0, 25).join('\n');
      const activeHeadings = memory.match(/^## ACTIVE MODULE$/gm) || [];

      ok(memory.indexOf('## PROJECT OVERVIEW') < memory.indexOf('## ACTIVE MODULE'));
      ok(memory.indexOf('## STATE MANAGEMENT') < memory.indexOf('## DYNAMIC METADATA'));
      equal(activeHeadings.length, 1);
      ok(!first25.includes('Last updated'));
      ok(!first25.includes('Branch'));
      ok(!first25.includes('Latest commit'));
      ok(!first25.includes('Current usage'));
      ok(!first25.includes('Session start'));
      ok(memory.includes('## DYNAMIC METADATA'));
      ok(memory.includes('**Branch:** `feature/cache-prefix`'));
      ok(memory.includes('**Latest commit:** `abc1234`'));
      ok(memory.includes('Current usage: 12,345 tokens'));
      ok(!memory.includes('SESSION ARCHIVES'));
      ok(!memory.includes('work-log/sessions/INDEX.md'));
      ok(memory.includes('additional-modules/buildplan/agent_state.json'));
    });
  }

  async function mkdtempTracked() {
    const root = await import('fs/promises').then(({ mkdtemp }) =>
      mkdtemp(resolve(tmpdir(), 'cmm-memory-cache-'))
    );
    tempRoots.push(root);
    return root;
  }
});
