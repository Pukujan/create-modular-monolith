const PHASES = [
  {
    id: 'phase-001-contract-lock',
    goal: 'Lock the workout UI/API contract before implementation.',
    allowedFiles: ['docs/ui-contract.md', 'docs/api-contract.md', 'docs/handoff.md', 'docs/acceptance-tests.md', 'frontend/src/services/workoutApi.ts', 'tests/contract/workout-contract.test.ts'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html', 'frontend/src/components/*', 'frontend/src/modules/*'],
    contractExcerpts: ['WorkoutPlan', 'Exercise', 'WorkoutLog', 'DashboardStats', 'GET /api/workout-plans'],
    testsToWriteFirst: ['Add contract acceptance tests for the extracted package fixture.'],
    implementationChecklist: ['Freeze model shapes.', 'Freeze route list.', 'Freeze service adapter names.'],
    passCondition: 'The contract report accepts the package and records the frozen shapes.',
    failCondition: 'Any contract mismatch or redesign permission causes rejection.',
    proofReportTemplate: 'Report the accepted contract snapshot and the frozen route/model list.',
    maxContextTokens: 8000
  },
  {
    id: 'phase-002-dashboard-and-plans-read',
    goal: 'Wire dashboard stats and workout plans read flows.',
    allowedFiles: ['frontend/src/services/workoutApi.ts', 'backend/src/modules/*', 'tests/*'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html', 'frontend/src/modules/landing/*'],
    contractExcerpts: ['GET /api/dashboard-stats', 'GET /api/workout-plans'],
    testsToWriteFirst: ['Assert dashboard and plan reads use the service adapter and real backend.'],
    implementationChecklist: ['Write failing tests.', 'Implement route handlers.', 'Render returned data in existing UI.'],
    passCondition: 'Existing dashboard renders backend stats and plans.',
    failCondition: 'Mock-only or backend-only success is not allowed.',
    proofReportTemplate: 'Report the dashboard and plan read proof.',
    maxContextTokens: 8000
  },
  {
    id: 'phase-003-create-workout-plan',
    goal: 'Create workout plans through the existing UI.',
    allowedFiles: ['frontend/src/services/workoutApi.ts', 'backend/src/modules/*', 'tests/*'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html'],
    contractExcerpts: ['POST /api/workout-plans'],
    testsToWriteFirst: ['Assert create-plan form sends POST /api/workout-plans.'],
    implementationChecklist: ['Write request/response tests.', 'Update plan list from real response.'],
    passCondition: 'Created plan appears in the existing plan list.',
    failCondition: 'Local fake save or replacement UI.',
    proofReportTemplate: 'Report the create-plan proof.',
    maxContextTokens: 8000
  },
  {
    id: 'phase-004-update-delete-workout-plan',
    goal: 'Update and delete workout plans through the existing UI.',
    allowedFiles: ['frontend/src/services/workoutApi.ts', 'backend/src/modules/*', 'tests/*'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html'],
    contractExcerpts: ['PATCH /api/workout-plans/:planId', 'DELETE /api/workout-plans/:planId'],
    testsToWriteFirst: ['Assert edit and delete controls hit the real routes.'],
    implementationChecklist: ['Write failing route tests.', 'Make the UI update from real responses.'],
    passCondition: 'Plan changes persist and reflect in the existing UI.',
    failCondition: 'Visual-only change without backend request.',
    proofReportTemplate: 'Report the update/delete proof.',
    maxContextTokens: 8000
  },
  {
    id: 'phase-005-exercises',
    goal: 'Connect exercise reads and creation to the real backend.',
    allowedFiles: ['frontend/src/services/workoutApi.ts', 'backend/src/modules/*', 'tests/*'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html'],
    contractExcerpts: ['GET /api/workout-plans/:planId/exercises', 'POST /api/workout-plans/:planId/exercises'],
    testsToWriteFirst: ['Assert the selected plan drives exercise routes.'],
    implementationChecklist: ['Write request tests.', 'Render backend exercises in the existing UI.'],
    passCondition: 'Exercise list and creation work from the selected plan.',
    failCondition: 'Wrong planId or mock-only exercise data.',
    proofReportTemplate: 'Report the exercises proof.',
    maxContextTokens: 8000
  },
  {
    id: 'phase-006-workout-logs-history',
    goal: 'Save and view workout logs in the existing history/progress UI.',
    allowedFiles: ['frontend/src/services/workoutApi.ts', 'backend/src/modules/*', 'tests/*'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html'],
    contractExcerpts: ['POST /api/workout-logs', 'GET /api/workout-logs'],
    testsToWriteFirst: ['Assert logging a workout hits the real log routes.'],
    implementationChecklist: ['Write failing log/history tests.', 'Update the history UI from the real response.'],
    passCondition: 'Workout logs appear in the existing UI and backend.',
    failCondition: 'Fake history or missing response wrappers.',
    proofReportTemplate: 'Report the workout log proof.',
    maxContextTokens: 8000
  },
  {
    id: 'phase-007-browser-contract-smoke',
    goal: 'Prove the full workout slice in the browser without drifting from the contract.',
    allowedFiles: ['frontend/src/services/workoutApi.ts', 'backend/src/modules/*', 'tests/*'],
    forbiddenFiles: ['landing-ui/forgefit-landing.html'],
    contractExcerpts: ['All routes', 'All response wrappers'],
    testsToWriteFirst: ['Add browser-visible proof tests that reject drift.'],
    implementationChecklist: ['Run the browser smoke proof.', 'Record the proof report.'],
    passCondition: 'Browser-visible workflow matches the frozen contract.',
    failCondition: 'Backend-only or mock-only success.',
    proofReportTemplate: 'Report browser-visible proof and contract coverage.',
    maxContextTokens: 8000
  }
];

export function generatePhaseInput(contracts) {
  return {
    packageName: contracts.uiContract.packageName,
    generatedAt: new Date().toISOString(),
    phases: PHASES
  };
}
