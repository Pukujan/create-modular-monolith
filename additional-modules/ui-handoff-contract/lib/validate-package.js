import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

const REQUIRED_FILES = [
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

const REQUIRED_SERVICE_FUNCTIONS = [
  'getDashboardStats',
  'getWorkoutPlans',
  'createWorkoutPlan',
  'updateWorkoutPlan',
  'deleteWorkoutPlan',
  'getExercises',
  'createExercise',
  'getWorkoutLogs',
  'createWorkoutLog'
];

const FUNCTION_ROUTE_PAIRS = [
  ['getDashboardStats', '/dashboard-stats'],
  ['getWorkoutPlans', '/workout-plans'],
  ['createWorkoutPlan', '/workout-plans'],
  ['updateWorkoutPlan', '/workout-plans/${planId}'],
  ['deleteWorkoutPlan', '/workout-plans/${planId}'],
  ['getExercises', '/workout-plans/${planId}/exercises'],
  ['createExercise', '/workout-plans/${planId}/exercises'],
  ['getWorkoutLogs', '/workout-logs'],
  ['createWorkoutLog', '/workout-logs']
];

const REQUIRED_ROUTES = [
  'GET /api/dashboard-stats',
  'GET /api/workout-plans',
  'POST /api/workout-plans',
  'PATCH /api/workout-plans/:planId',
  'DELETE /api/workout-plans/:planId',
  'GET /api/workout-plans/:planId/exercises',
  'POST /api/workout-plans/:planId/exercises',
  'GET /api/workout-logs',
  'POST /api/workout-logs'
];

export async function validatePackage(packagePath) {
  const errors = [];
  const requiredFiles = [];

  for (const file of REQUIRED_FILES) {
    const full = join(packagePath, file);
    try {
      const fileStat = await stat(full);
      if (!fileStat.isFile()) throw new Error('not a file');
      requiredFiles.push(file);
    } catch {
      errors.push(`Missing required package file: ${file}`);
    }
  }

  if (errors.length) {
    return { ok: false, errors, requiredFiles };
  }

  const [uiContract, apiContract, handoff, serviceAdapter] = await Promise.all([
    readFile(join(packagePath, 'docs/ui-contract.md'), 'utf8'),
    readFile(join(packagePath, 'docs/api-contract.md'), 'utf8'),
    readFile(join(packagePath, 'docs/handoff.md'), 'utf8'),
    readFile(join(packagePath, 'frontend/src/services/workoutApi.ts'), 'utf8')
  ]);

  for (const name of ['WorkoutPlan', 'Exercise', 'WorkoutLog', 'DashboardStats']) {
    if (!uiContract.includes(name)) {
      errors.push(`docs/ui-contract.md is missing ${name}`);
    }
  }

  const normalizedApiContract = apiContract.replace(/`/g, '');
  for (const route of REQUIRED_ROUTES) {
    const routePath = route.replace(/^(GET|POST|PATCH|DELETE)\s+/, '');
    if (!normalizedApiContract.includes(routePath)) {
      errors.push(`docs/api-contract.md is missing ${route}`);
    }
  }

  for (const fn of REQUIRED_SERVICE_FUNCTIONS) {
    if (!new RegExp(`export\\s+async\\s+function\\s+${fn}\\b`).test(serviceAdapter)) {
      errors.push(`frontend/src/services/workoutApi.ts is missing export ${fn}`);
    }
  }

  for (const [fn, routePath] of FUNCTION_ROUTE_PAIRS) {
    const body = extractFunctionBody(serviceAdapter, fn);
    if (!body) {
      errors.push(`frontend/src/services/workoutApi.ts is missing export ${fn}`);
      continue;
    }
    if (!body.includes(routePath)) {
      errors.push(`frontend/src/services/workoutApi.ts is missing route path ${routePath} in ${fn}`);
    }
  }

  const fetchViolations = await scanForFetchCalls(packagePath);
  if (fetchViolations.length) {
    errors.push(...fetchViolations);
  }

  if (/[Rr]edesign the UI|you may redesign|replace the UI/.test(handoff)) {
    errors.push('docs/handoff.md allows redesigning or replacing the UI');
  }

  return { ok: errors.length === 0, errors, requiredFiles };
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`export async function ${functionName}`);
  if (start === -1) return '';
  const nextExport = source.indexOf('\nexport async function ', start + 1);
  const end = nextExport === -1 ? source.length : nextExport;
  return source.slice(start, end);
}

async function scanForFetchCalls(packagePath) {
  const matches = [];
  await walk(packagePath, '', matches);
  return matches;
}

async function walk(dir, relative, matches) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, nextRelative, matches);
      continue;
    }
    if (!entry.isFile()) continue;
    if (nextRelative === 'frontend/src/services/workoutApi.ts') continue;
    const content = await readFile(full, 'utf8');
    if (content.includes('fetch(')) {
      matches.push(`Direct fetch call found outside service adapter: ${nextRelative}`);
    }
  }
}
