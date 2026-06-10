# Handoff 006: UI Handoff Contract Addon + Phase Builder Proof

## Agent Role

You are the implementer. Build the contract-enforcement workflow described here. Do not redesign the workout UI and do not build a full workout product. The workout package is a fixture used to prove the handoff and phase-building workflow.

Primary input package:

```txt
/Users/teresaguajardo/Downloads/june 2026/june 4/workout-contract-handoff-package.zip
```

Main goal:

```txt
polished UI handoff package
-> machine-readable UI/API contracts
-> strict no-drift rules
-> Phase Builder TDD phases
-> compact coding-agent context packets
-> clean scaffold root with addon-owned infrastructure under additional-modules
-> tests proving agents cannot skip contracts or drift the UI
```

## Current Repo Context

The repo is already dirty from prior contract cleanup and test stabilization. Do not revert unrelated changes.

Important existing work:

- Root tests already cover contract gates, file exchange, starter export, memory cache stability, architecture grounding, and module cleanup.
- `npm test` was passing after the previous contract-gate work.
- `additional-modules/phase-builder/` exists and currently has Python phases for state, budget, and gates.
- The next feature should be additive and test-driven.

## Non-Negotiable Rules

- Use TDD. Add failing tests before implementation.
- Do not implement the actual workout CRUD app as the primary deliverable.
- Do not redesign or rewrite the polished UI fixture.
- Do not create replacement UI components for the workout fixture.
- Do not allow direct `fetch` calls in UI files; only the service adapter may call `fetch`.
- Preserve the API response wrappers from the package: `{ stats }`, `{ plans }`, `{ plan }`, `{ exercises }`, `{ exercise }`, `{ logs }`, `{ log }`.
- Keep `ui-handoff-contract` separate from Phase Builder.
- Phase Builder consumes contract output; it does not extract UI contracts itself.
- Keep generated phase context small and explicit.
- Do not solve coding-agent guidance by pasting full architecture docs into every prompt.
- Full contracts stay in repo docs and machine JSON; coding agents receive tiny phase packets.
- Context budget rules must be enforced by tests, not only described in prose.
- Keep scaffold root clean. Infrastructure docs, logs, exchange folders, addon scripts, and generated planning artifacts belong under `additional-modules/` unless they are required root entrypoints.

## Files To Read First

Read these before changing code:

```txt
additional-modules/docs/architecture/CONTRACTS_OVERVIEW.md
additional-modules/docs/architecture/MODULE_INTERNAL_CONTRACT.md
additional-modules/docs/architecture/contracts/planningPhase.contract.md
additional-modules/phase-builder/phase_builder/phase_01/state.py
additional-modules/phase-builder/phase_builder/phase_02/budget.py
additional-modules/phase-builder/phase_builder/phase_03/gates.py
tests/contract_gates.test.js
tests/file_exchange_contracts.test.js
```

Inspect the zip contents:

```bash
unzip -l "/Users/teresaguajardo/Downloads/june 2026/june 4/workout-contract-handoff-package.zip"
```

The package should contain:

```txt
workout-contract-handoff-package/README.md
workout-contract-handoff-package/landing-ui/forgefit-landing.html
workout-contract-handoff-package/docs/ui-contract.md
workout-contract-handoff-package/docs/api-contract.md
workout-contract-handoff-package/docs/handoff.md
workout-contract-handoff-package/docs/acceptance-tests.md
workout-contract-handoff-package/frontend/src/services/workoutApi.ts
workout-contract-handoff-package/tests/contract/workout-contract.test.ts
workout-contract-handoff-package/prompts/codex-opencode-handoff-prompt.md
```

## Implementation Scope

Allowed primary paths:

```txt
additional-modules/ui-handoff-contract/
additional-modules/phase-builder/
additional-modules/docs/architecture/
template/docs/architecture/
template/docs/README.md
additional-modules/docs/README.md
template/package.json
package.json
tests/
```

Allowed fixture path:

```txt
tests/fixtures/workout-contract-handoff-package/
```

Do not modify unrelated product modules. A tiny workout proof app may be built only inside a test fixture or temp sandbox when needed to live-test the contract workflow. The proof app exists to verify the addon and phase packets, not to turn this repo into a workout product.

## Phase 0: Root Layout Contract And Migration Plan

Before adding more addon output, define and test the clean scaffold root contract.

The generated scaffold root should contain only project entrypoints and application roots:

```txt
backend/
frontend/
additional-modules/
agents/ or .agents/
AGENTS.md
MEMORY.md
README.md
package.json
package-lock.json when present
.gitignore
.env.example when present
LICENSE / NOTICE when present
deployment config files only when required by host tooling
```

These infrastructure trees should live under `additional-modules/`:

```txt
additional-modules/docs/
additional-modules/file-exchange/
additional-modules/scripts/
additional-modules/work-log/
additional-modules/phase-builder/
additional-modules/context-engineering/
additional-modules/ui-handoff-contract/
```

The template currently has some root-level infrastructure paths. Migrate them deliberately instead of scattering new files:

```txt
template/docs/            -> template/additional-modules/docs/
template/file-exchange/   -> template/additional-modules/file-exchange/
template/scripts/         -> template/additional-modules/scripts/
template/work-log/        -> template/additional-modules/work-log/
```

Keep compatibility wrappers only when needed. For example, root `package.json` may expose scripts that call `node additional-modules/scripts/...`, but the script implementation should live under `additional-modules/scripts/`.

TDD tests must prove:

- a freshly generated scaffold does not contain root `docs/`, `file-exchange/`, `scripts/`, or `work-log/`
- generated scaffolds do contain `backend/`, `frontend/`, `additional-modules/`, agent rules, `AGENTS.md`, and `package.json`
- root `package.json` scripts point to `additional-modules/scripts/` for addon tooling
- architecture docs are found at `additional-modules/docs/architecture/`
- file exchange is found at `additional-modules/file-exchange/`
- work logs and planning artifacts are found at `additional-modules/work-log/`
- old root-path references in docs, contracts, tests, and scripts are updated or intentionally supported through compatibility aliases
- addon code does not write new generated artifacts to repo root unless the root layout contract explicitly allows that path

Add or update tests, likely:

```txt
tests/root_layout_contract.test.js
tests/file_exchange_contracts.test.js
tests/contract_gates.test.js
tests/architecture_grounding.test.js
```

Acceptance rule:

```txt
Root files are launch/control surfaces. Addon systems live in additional-modules.
```

Do not start by moving files manually. First add failing tests for the intended generated scaffold shape, then update `index.js`, template paths, docs, and scripts until those tests pass.

## Phase 1: Add Workout Fixture

Create a test fixture from the zip under:

```txt
tests/fixtures/workout-contract-handoff-package/
```

Include only the package files needed for tests. Preserve package paths.

Add tests that assert the fixture contains:

- `landing-ui/forgefit-landing.html`
- `docs/ui-contract.md`
- `docs/api-contract.md`
- `docs/handoff.md`
- `docs/acceptance-tests.md`
- `frontend/src/services/workoutApi.ts`
- `tests/contract/workout-contract.test.ts`
- `prompts/codex-opencode-handoff-prompt.md`

## Phase 2: Add `ui-handoff-contract` Addon

Create:

```txt
additional-modules/ui-handoff-contract/
```

Minimum suggested structure:

```txt
additional-modules/ui-handoff-contract/bin/ui-handoff-contract.js
additional-modules/ui-handoff-contract/lib/validate-package.js
additional-modules/ui-handoff-contract/lib/extract-contracts.js
additional-modules/ui-handoff-contract/lib/generate-phase-input.js
additional-modules/ui-handoff-contract/README.md
```

Public command behavior:

```bash
node additional-modules/ui-handoff-contract/bin/ui-handoff-contract.js \
  --package tests/fixtures/workout-contract-handoff-package \
  --out /tmp/workout-contract-out
```

Expected output files:

```txt
ui-contract.json
api-contract.json
handoff-contract.md
allowed-files.json
no-drift.rules.md
phase-input.json
contract-report.json
```

Validation rules:

- fail if any required package file is missing
- fail if `docs/ui-contract.md` does not define `WorkoutPlan`, `Exercise`, `WorkoutLog`, and `DashboardStats`
- fail if `docs/api-contract.md` does not include all required routes
- fail if `frontend/src/services/workoutApi.ts` does not export all required service functions
- fail if service route strings do not match the API contract
- fail if UI files outside `frontend/src/services/workoutApi.ts` contain direct `fetch(`
- fail if handoff text allows replacing or redesigning the UI, unless an explicit future design phase marker exists

Required service functions:

```txt
getDashboardStats
getWorkoutPlans
createWorkoutPlan
updateWorkoutPlan
deleteWorkoutPlan
getExercises
createExercise
getWorkoutLogs
createWorkoutLog
```

Required routes:

```txt
GET /api/dashboard-stats
GET /api/workout-plans
POST /api/workout-plans
PATCH /api/workout-plans/:planId
DELETE /api/workout-plans/:planId
GET /api/workout-plans/:planId/exercises
POST /api/workout-plans/:planId/exercises
GET /api/workout-logs
POST /api/workout-logs
```

## Phase 3: Generate Phase Builder Input

`phase-input.json` must contain exactly these implementation phases:

```txt
phase-001-contract-lock
phase-002-dashboard-and-plans-read
phase-003-create-workout-plan
phase-004-update-delete-workout-plan
phase-005-exercises
phase-006-workout-logs-history
phase-007-browser-contract-smoke
```

Each phase must include:

- `id`
- `goal`
- `allowedFiles`
- `forbiddenFiles`
- `contractExcerpts`
- `testsToWriteFirst`
- `implementationChecklist`
- `passCondition`
- `failCondition`
- `proofReportTemplate`
- `maxContextTokens`

Default `maxContextTokens`:

```txt
8000
```

No implementation phase may omit `testsToWriteFirst` or `allowedFiles`.

## Phase 3B: Generate Compact Coding-Agent Packets

This phase exists because every coding agent that touches the modular monolith needs the same rails: Hermes, OpenCode, Cursor, Claude, Codex/5.4 mini, and future local agents. Some agents may have small context windows, but even large-context agents should receive focused packets so the architecture stays enforceable instead of becoming prompt noise.

The addon or Phase Builder must produce compact per-phase agent packets under:

```txt
agent-packets/
  phase-001-contract-lock/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
  phase-002-dashboard-and-plans-read/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
  phase-003-create-workout-plan/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
  phase-004-update-delete-workout-plan/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
  phase-005-exercises/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
  phase-006-workout-logs-history/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
  phase-007-browser-contract-smoke/
    TASK.md
    contract-slice.json
    allowed-files.json
    proof-required.md
```

Each `TASK.md` must be the only file a coding agent needs as its first prompt for that slice. It may reference the JSON files beside it, but it must not paste entire architecture docs, full handoff docs, full UI files, or full contract manuals.

Required packet fields:

- phase id and one-sentence goal
- exact allowed files
- exact forbidden files
- tests to write first
- the smallest contract excerpt needed for this phase
- pass condition
- fail condition
- proof required
- max coding-agent context target

Default packet budgets:

```txt
maxAgentPacketTokens: 3000
maxContractSliceTokens: 1500
maxTaskMarkdownTokens: 1800
defaultSmallAgentContextTokens: 20000
```

Packet generation must follow this rule:

```txt
Full docs = human/reference source of truth
Machine JSON = contract source of truth
Agent packets = tiny implementation context
Tests/gates = real enforcement
```

TDD tests must prove:

- generated packets exist for all seven phases
- each packet stays under `maxAgentPacketTokens`
- `TASK.md` does not include full architecture docs
- `TASK.md` does not include the full UI handoff or full HTML
- contract slices include only routes/entities needed by that phase
- each packet includes allowed files, forbidden files, tests-first plan, and proof requirements
- coding-agent guidance tells Hermes, OpenCode, Cursor, Claude, Codex/5.4 mini, and future agents to read only the packet first, then open referenced files only as needed
- a packet that exceeds budget is rejected by Phase Builder
- a packet that omits allowed files or tests-first instructions is rejected

The packet format must be tool-neutral. Do not include instructions that only work in one agent product unless they are marked as optional adapter notes.

## Phase 4: Extend Phase Builder

Add a Phase Builder module that consumes `phase-input.json` and writes markdown phase files.

Suggested path:

```txt
additional-modules/phase-builder/phase_builder/phase_04/handoff_phases.py
additional-modules/phase-builder/tests/phase_04/test_handoff_phases.py
```

Required behavior:

- load `phase-input.json`
- validate required phase fields
- reject broad context packets above the max token budget
- reject agent packets above the configured coding-agent packet budget
- reject phase packets that paste full architecture docs instead of compact contract slices
- reject implementation phases without prior `phase-001-contract-lock`
- reject phases without `testsToWriteFirst`
- reject phases without `allowedFiles`
- render markdown phase files under `phases/`
- render compact agent packets under `agent-packets/`
- include proof report template in each phase file

Phase Builder does not need to implement the workout app. It only needs to produce enforceable phase plans from the handoff contract.

## Phase 5: Add Workflow Docs

Create mirrored docs:

```txt
template/docs/architecture/AGENT_WORKFLOW_CONTRACTS.md
additional-modules/docs/architecture/AGENT_WORKFLOW_CONTRACTS.md
```

The doc must explain:

- why polished UI handoffs fail without contract extraction
- how the clean root layout keeps agent-visible structure simple
- which files are allowed at scaffold root and which addon-owned files live under `additional-modules/`
- what `ui-handoff-contract` owns
- what Phase Builder owns
- what context-engineering owns
- how ChatGPT UI output becomes enforceable agent work
- how the same packets guide Hermes, OpenCode, Cursor, Claude, Codex/5.4 mini, and future coding agents
- how tests are written before implementation
- how allowed files prevent UI drift
- how browser-visible proof is required before slice completion
- how to use the workout package as the reference fixture
- why full architecture docs should not be pasted into every coding-agent task
- how compact agent packets keep small-context agents usable while keeping larger agents focused
- how repo-side tests and gates enforce full contracts without making the agent reread all docs

Add links to this doc from:

```txt
template/docs/README.md
additional-modules/docs/README.md
template/docs/architecture/CONTRACTS_OVERVIEW.md
additional-modules/docs/architecture/CONTRACTS_OVERVIEW.md
```

## Phase 6: Root Test Coverage

Add root Node tests for the addon.

Suggested file:

```txt
tests/ui_handoff_contract.test.js
```

Required tests:

- clean root layout contract rejects root `docs/`, `file-exchange/`, `scripts/`, and `work-log` in a generated scaffold
- clean root layout contract accepts root `backend/`, `frontend/`, `additional-modules/`, agent rules, `AGENTS.md`, and `package.json`
- accepts valid workout handoff package
- rejects missing `docs/ui-contract.md`
- rejects missing `docs/api-contract.md`
- rejects service adapter missing required exported function
- rejects service adapter using wrong route path
- rejects direct `fetch(` in UI files outside service adapter
- rejects handoff that allows UI replacement/redesign
- generated `phase-input.json` includes all required phases
- generated phase records include allowed files, forbidden files, tests first, pass/fail conditions, and context budget
- generated coding-agent packets exist for all required phases
- generated agent packets stay under the configured coding-agent packet budget
- generated agent packets do not paste full architecture docs, full handoff docs, or full HTML
- generated contract slices contain only the route/entity subset required for that phase
- generated packets are tool-neutral and name Hermes, OpenCode, Cursor, Claude, and Codex/5.4 mini as supported consumers

Add Python tests for Phase Builder:

```txt
additional-modules/phase-builder/tests/phase_04/test_handoff_phases.py
```

Required tests:

- consumes generated `phase-input.json`
- renders all seven markdown phase files
- rejects phase missing tests-first plan
- rejects phase missing allowed files
- rejects implementation phase without contract-lock phase
- rejects over-budget context packet
- rejects over-budget coding-agent packet
- rejects packet content that includes full architecture docs instead of compact excerpts
- renders all seven `agent-packets/<phase-id>/TASK.md` files
- includes browser-visible proof template in rendered phase

## Phase 7: Live Workout Proof App Smoke Test

After the addon and packet generator pass unit tests, use the workout package to live-test the workflow in a disposable fixture app or temp sandbox.

This is not a product build. It is a proof that a coding agent can follow the generated packets and that the gates catch drift while building a small vertical slice.

Required behavior:

- generate contract output from the workout handoff package
- generate the seven phase files
- generate the seven coding-agent packet folders
- pick the smallest useful slice, preferably `phase-002-dashboard-and-plans-read`
- write the tests first from that packet
- implement only the allowed files for that slice in the disposable proof app
- prove `GET /api/dashboard-stats` returns `{ stats }`
- prove `GET /api/workout-plans` returns `{ plans }`
- prove frontend calls go through `workoutApi.ts`
- prove no direct `fetch(` exists in UI components
- prove the existing polished UI is not replaced
- produce a proof report showing pass/fail evidence

TDD tests must prove:

- the proof app cannot pass with backend-only success
- the proof app cannot pass with frontend mock-only success
- the proof app cannot pass if the UI component calls `fetch(` directly
- the proof app cannot pass if the response wrapper is wrong
- the proof app cannot pass if files outside the packet's `allowed-files.json` are changed
- the proof report is required before a phase is marked complete

5.4 mini implementation instruction:

```txt
Use the generated coding-agent packets yourself while building the workout proof slice. Do not rely on the full handoff after packet generation. If the packet is missing information needed for the slice, fix the packet generator and add a failing test for that missing information.
```

## Commands To Run

Run root tests:

```bash
npm test
```

Run focused root tests:

```bash
node --test tests/ui_handoff_contract.test.js
node --test tests/contract_gates.test.js
node --test tests/file_exchange_contracts.test.js
```

Run Phase Builder tests:

```bash
cd additional-modules/phase-builder
python3 -m pytest
```

If Python dependencies are unavailable, report that clearly and still run the Node suite.

## Definition Of Done

This handoff is complete when:

- generated scaffold root is clean and enforced by tests
- infrastructure folders live under `additional-modules/`
- root scripts delegate to addon-owned scripts without duplicating implementation at root
- `ui-handoff-contract` accepts the provided workout package
- invalid package variants fail with clear error messages
- generated contract outputs exist and are deterministic enough for tests
- generated `phase-input.json` contains all seven phases
- Phase Builder renders the phase files from `phase-input.json`
- Phase Builder renders compact coding-agent packet folders from `phase-input.json`
- tests prove packets stay small enough for constrained coding-agent context windows
- tests prove UI drift rules and service-layer rules are enforced
- a disposable workout proof slice is built through the generated packet workflow
- tests prove the workout proof slice cannot pass with backend-only, mock-only, direct-fetch, wrong-wrapper, or out-of-bounds-file changes
- docs explain the workflow in a way another agent can follow
- `npm test` passes
- Phase Builder pytest suite passes or the blocker is clearly documented

## Final Report Required

When finished, report:

- files added
- files changed
- tests added
- commands run
- whether `npm test` passed
- whether Phase Builder pytest passed
- any remaining gaps
