import { readFile } from 'fs/promises';
import { join } from 'path';

const PHASE_IDS = [
  'phase-001-contract-lock',
  'phase-002-dashboard-and-plans-read',
  'phase-003-create-workout-plan',
  'phase-004-update-delete-workout-plan',
  'phase-005-exercises',
  'phase-006-workout-logs-history',
  'phase-007-browser-contract-smoke'
];

export async function extractContracts(packagePath) {
  const [uiContract, apiContract, handoff] = await Promise.all([
    readFile(join(packagePath, 'docs/ui-contract.md'), 'utf8'),
    readFile(join(packagePath, 'docs/api-contract.md'), 'utf8'),
    readFile(join(packagePath, 'docs/handoff.md'), 'utf8')
  ]);

  return {
    uiContract: {
      packageName: 'workout-contract-handoff-package',
      models: ['WorkoutPlan', 'Exercise', 'WorkoutLog', 'DashboardStats'],
      sourcePath: 'docs/ui-contract.md',
      raw: uiContract
    },
    apiContract: {
      sourcePath: 'docs/api-contract.md',
      routes: [
        'GET /api/dashboard-stats',
        'GET /api/workout-plans',
        'POST /api/workout-plans',
        'PATCH /api/workout-plans/:planId',
        'DELETE /api/workout-plans/:planId',
        'GET /api/workout-plans/:planId/exercises',
        'POST /api/workout-plans/:planId/exercises',
        'GET /api/workout-logs',
        'POST /api/workout-logs'
      ],
      raw: apiContract
    },
    handoffContractMd: [
      '# Extracted Handoff Contract',
      '',
      'This artifact freezes the workout handoff into machine-readable output for agents.',
      '',
      'Source: `docs/handoff.md`',
      '',
      handoff.trim()
    ].join('\n'),
    allowedFiles: [
      'landing-ui/forgefit-landing.html',
      'docs/ui-contract.md',
      'docs/api-contract.md',
      'docs/handoff.md',
      'docs/acceptance-tests.md',
      'frontend/src/services/workoutApi.ts',
      'tests/contract/workout-contract.test.ts',
      'prompts/codex-opencode-handoff-prompt.md'
    ],
    noDriftRulesMd: [
      '# No Drift Rules',
      '',
      '- Do not redesign the polished UI.',
      '- Do not replace existing UI components.',
      '- Do not call `fetch(` directly outside the service adapter.',
      '- Do not treat backend-only success as completion.',
      '- Keep all UI calls inside `frontend/src/services/workoutApi.ts`.'
    ].join('\n'),
    phaseIds: PHASE_IDS
  };
}
