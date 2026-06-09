# Handoff 008: Agent Workflow Orchestrator + Capability Registry + Workout Proof

## Agent Role

You are the implementer. Build this through TDD in small phases. Do not skip tests, do not build a giant prompt-memory blob, and do not let a coding agent become planner, implementer, reviewer, and judge at the same time.

Main objective:

```txt
workflow state machine
-> phase builder
-> capability registry
-> decision graph / retrieval manifest
-> compact context packet
-> worker or subagent dispatch
-> structured output proof
-> deterministic gates
-> task outcome memory
-> workout app proof
```

The goal is an agent-first development environment that works for low-context agents like `qwen-20k`, cloud agents like Hermes, and higher-capability reviewers like Codex.

## Existing Context

The repo already has:

- `ui-handoff-contract` addon
- Phase Builder handoff-phase support
- workout fixture and workout app proof module
- architecture and data handoff docs
- root layout cleanup tests
- AGENTS / memory cache rules
- module agent state machine contract
- handoff 007 for the capability registry

Read first:

```txt
additional-modules/work-log/handoffs/007_2026-06-09_19-43_handoff-agent-capability-registry-low-context.md
template/docs/architecture/contracts/moduleAgentStateMachine.contract.md
template/backend/src/shared/agent-runtime/createAgentRuntime.js
additional-modules/phase-builder/phase_builder/phase_04/handoff_phases.py
tests/ui_handoff_contract.test.js
tests/workout_ui_contract.test.js
tests/workout_data_contract.test.js
```

The workflow orchestrator should extend the state-machine idea. Do not replace the existing module FSM contract. Add an addon-level development workflow FSM that coordinates phase work.

## Architectural Decision

The state machine is the orchestrator.

Workers and subagents execute bounded tasks.

The capability registry recommends tools and skills.

The output schemas and tests decide whether a worker result is accepted.

```txt
state machine = orchestrator / policy executor
agent worker = performs one bounded task
subagent = specialized worker for a narrow check
capability registry = memory and recommendation source
decision graph = explainable why
phase builder = task slicer
context packet builder = low-context interface
output proof schemas = completion gate
tests / CLI = deterministic proof
```

Do not let a worker self-approve.

## Workflow State Machine

Create:

```txt
additional-modules/agent-workflow/
  README.md
  registry/
    workflow.machine.json
  schemas/
    workflow-machine.schema.json
    workflow-run.schema.json
    worker-dispatch.schema.json
    worker-result.schema.json
    gate-result.schema.json
  bin/
    agent-workflow-start.js
    agent-workflow-status.js
    agent-workflow-dispatch.js
    agent-workflow-advance.js
    agent-workflow-verify.js
```

Suggested states:

```txt
intake
contract_lock
phase_planned
capabilities_selected
packet_built
worker_dispatched
proof_received
proof_validated
tests_verified
outcome_recorded
done
blocked
```

Suggested transitions:

```txt
START -> intake
CONTRACTS_LOCKED -> contract_lock
PHASES_READY -> phase_planned
CAPABILITIES_READY -> capabilities_selected
PACKET_READY -> packet_built
WORKER_DISPATCHED -> worker_dispatched
PROOF_RECEIVED -> proof_received
PROOF_VALID -> proof_validated
TESTS_PASS -> tests_verified
OUTCOME_RECORDED -> outcome_recorded
COMPLETE -> done
BLOCK -> blocked
```

The workflow run record should be JSON and append-only event history should be JSONL:

```txt
additional-modules/work-log/agent-workflows/
  {workflowId}/
    workflow-run.json
    workflow-events.jsonl
    packets/
    proofs/
    gate-results/
```

## Worker And Subagent Model

Workers are not autonomous orchestrators.

They receive:

```txt
TASK.md
context-packet.json
allowed-files.json
forbidden-files.json
required-output.schema.json
proof-template.json
```

They return:

```txt
phase-proof.json
worker-notes.md
test-output.txt
```

Suggested worker types:

```txt
implementation-worker
review-worker
ui-drift-worker
api-contract-worker
context-budget-worker
docs-worker
security-worker
```

Each worker type should be a profile or dispatch target, not a new unbounded agent personality.

## Capability Registry Integration

Implement handoff 007 first or in parallel, but this orchestrator must call the registry conceptually like this:

```txt
workflow phase
-> task type + profile + budget
-> capability recommendation
-> decision explanation
-> compact context packet
```

The workflow state machine advances from `phase_planned` to `capabilities_selected` only if:

- recommended capabilities validate against manifests
- decision graph explanation exists
- profile context budget exists
- output proof schema is selected
- no capability exceeds risk limits for the profile

## Decision Graph, Retrieval, Vector Storage

Use symbolic-first decision graph enforcement.

Vector or graph storage may help find similar prior outcomes, but it cannot decide permissions.

Required rule:

```txt
retrieval/vector candidates are suggestions
decision graph + manifests + risk policy + context budget are gates
```

For v1, set retrieval backend to `none` and implement a manifest that can later point to:

```txt
sqlite-vec
pgvector
chroma
external-mcp-vector-store
```

Add tests proving the recommender works without vector search.

## Context Management Contract

This is central. The system fails if it makes low-context models read everything.

Enforce:

```txt
full registry stays in repo
recommendation returns selected ids + short reasons
packet includes short summaries + pointers
packet never includes full manifests
packet has estimated tokens
proof must report context usage
workflow blocks if packet exceeds profile budget
```

Use approximate token counting for v1:

```js
Math.ceil(text.length / 4)
```

This is good enough for tests as long as the estimate is conservative.

## Workout App Proof Expansion

Use the workout app as the live proof. Do not replace its UI.

Add a workflow fixture around one or more workout phases:

```txt
tests/fixtures/agent-workflow/workout-ui-contract/
  phase-input.json
  expected-recommendation.json
  expected-context-packet.json
  valid-phase-proof.json
  invalid-phase-proof-over-budget.json
  invalid-phase-proof-missing-tests-first.json
```

The workflow should prove:

```txt
workout UI contract phase
-> selects frontend-contract-slice skill
-> selects npm-test or workout UI contract test CLI
-> does not select DB migration skill
-> builds packet under qwen-20k / hermes-cloud target
-> requires phase-proof.schema.json
-> validates proof
-> records outcome
```

For a persistence phase, prove a different recommendation:

```txt
workout data persistence phase
-> selects backend-route-contract-slice
-> selects workout-data-contract
-> selects backend route test CLI
-> does not select UI drift skill unless frontend files are allowed
```

## TDD Development Plan

### Phase 1: Output Proof Schemas

Write failing tests first:

```txt
tests/agent_output_proof_schema.test.js
```

Assertions:

- valid phase proof passes
- proof fails without `phaseId`
- proof fails without `testsWrittenFirst`
- proof fails if `status` is not allowed
- proof fails if `estimatedPacketTokens > targetPacketTokens`
- proof fails if `filesChanged` is not an array
- proof fails if `contractsSatisfied` is missing
- proof fails if proof does not name the `agentProfile`

Implement:

```txt
additional-modules/agent-capabilities/schemas/phase-proof.schema.json
additional-modules/agent-capabilities/lib/validate-json.js
```

Keep validation dependency-free for v1 unless already present. A small schema validator is acceptable.

### Phase 2: Capability Registry

Write failing tests:

```txt
tests/agent_capabilities_registry.test.js
```

Assertions:

- all manifests exist
- valid manifests pass
- missing profile `contextWindow` fails
- missing profile `targetPacketTokens` fails
- missing skill `bestFor` fails
- missing skill `contextCostTokens` fails
- missing MCP `riskLevel` fails
- missing CLI `command` fails
- task outcomes JSONL validates line by line
- scoreboard validates and only uses known skill ids

Implement:

```txt
additional-modules/agent-capabilities/registry/*.json
additional-modules/agent-capabilities/bin/agent-capabilities-verify.js
```

Seed only a tiny registry.

### Phase 3: Decision Graph And Rules

Write failing tests:

```txt
tests/agent_capabilities_decision_graph.test.js
```

Assertions:

- graph validates node ids and edge endpoints
- every edge has a reason
- every edge has a weight between 0 and 1
- every `capabilityId` exists in manifests
- every decision rule has `id`, `if`, `then`, `because`
- vector/retrieval candidates cannot reference unknown capabilities
- recommender still works when retrieval backend is `none`
- recommendation includes `whySelected`
- recommendation includes `whyRejected` for excluded candidates

Implement:

```txt
additional-modules/agent-capabilities/registry/decision-graph.json
additional-modules/agent-capabilities/registry/decision-rules.json
additional-modules/agent-capabilities/registry/retrieval-index.manifest.json
```

### Phase 4: Recommendation Engine

Write failing tests:

```txt
tests/agent_capabilities_recommendation.test.js
```

Assertions:

- `ui-contract + qwen-20k` selects `frontend-contract-slice`
- `ui-contract + qwen-20k` selects output proof schema
- `ui-contract` excludes DB migration skill
- `workout-data-persistence` selects workout data contract guidance
- recommendation respects `maxRecommendedCapabilities`
- recommendation respects `targetPacketTokens`
- recommendation fails when required capabilities exceed budget
- recommendation fails when MCP risk exceeds profile allowance

Implement:

```txt
additional-modules/agent-capabilities/bin/agent-capabilities-recommend.js
additional-modules/agent-capabilities/bin/agent-capabilities-explain.js
additional-modules/agent-capabilities/lib/recommend.js
```

### Phase 5: Context Packet Builder

Write failing tests:

```txt
tests/agent_capabilities_context_budget.test.js
```

Assertions:

- packet validates against `context-packet.schema.json`
- packet contains selected capability ids
- packet contains short summaries
- packet contains source pointers
- packet does not contain full registry JSON
- packet does not contain full architecture docs
- packet estimates tokens
- packet fails above profile budget
- `ui-contract + qwen-20k` packet is below 8k estimated tokens
- `ui-contract + hermes-cloud` packet is below 8k estimated tokens

Implement:

```txt
additional-modules/agent-capabilities/bin/agent-capabilities-build-packet.js
additional-modules/agent-capabilities/lib/token-budget.js
```

### Phase 6: Workflow State Machine

Write failing tests:

```txt
tests/agent_workflow_state_machine.test.js
```

Assertions:

- workflow machine validates
- invalid transition fails
- cannot dispatch worker before packet is built
- cannot validate proof before proof is received
- cannot mark done before outcome recorded
- `BLOCK` transitions to blocked from any non-final state
- workflow event log is append-only
- workflow run snapshot stores current state

Implement:

```txt
additional-modules/agent-workflow/registry/workflow.machine.json
additional-modules/agent-workflow/lib/workflow-runtime.js
additional-modules/agent-workflow/bin/agent-workflow-start.js
additional-modules/agent-workflow/bin/agent-workflow-advance.js
additional-modules/agent-workflow/bin/agent-workflow-status.js
additional-modules/agent-workflow/bin/agent-workflow-verify.js
```

### Phase 7: Dispatch And Proof Gates

Write failing tests:

```txt
tests/agent_workflow_dispatch_gates.test.js
```

Assertions:

- dispatch file validates against `worker-dispatch.schema.json`
- dispatch includes worker type, profile, allowed files, packet path, output schema path
- worker result validates against `worker-result.schema.json`
- workflow rejects missing `phase-proof.json`
- workflow rejects proof with over-budget context
- workflow rejects proof with changed forbidden files
- workflow rejects proof without tests-first
- workflow accepts valid workout UI contract proof

Implement dispatch/gate functions. Do not run real subagents in v1. Generate dispatch packets and validate simulated worker results.

### Phase 8: Outcome Recorder And Scoreboard

Write failing tests:

```txt
tests/agent_capabilities_outcomes.test.js
```

Assertions:

- valid proof appends one outcome row
- outcome rows are append-only
- passing task increments skill `uses` and `passes`
- failing task increments skill `uses` and `failures`
- unknown skill in proof fails
- outcome update does not rewrite old JSONL rows
- scoreboard remains valid JSON

Implement:

```txt
additional-modules/agent-capabilities/bin/agent-capabilities-record-outcome.js
```

### Phase 9: Workout End-To-End Eval

Write failing tests:

```txt
tests/agent_workflow_workout_eval.test.js
```

Eval scenarios:

1. `workout-ui-contract-happy-path`
   - builds qwen-20k packet
   - selects frontend contract skill
   - validates proof
   - records outcome

2. `workout-ui-direct-fetch-rejected`
   - simulated proof reports direct UI fetch
   - gate fails

3. `workout-api-wrapper-drift-rejected`
   - proof reports wrong wrapper shape
   - gate fails

4. `workout-context-over-budget-rejected`
   - packet/proof above budget
   - gate fails

5. `workout-persistence-phase-selects-data-contract`
   - persistence phase selects data contract guidance
   - does not select frontend UI skill by default

These are not model evals. They are architecture evals: they prove the scaffold catches bad agent behavior.

## Required Scripts

Add root or template scripts pointing to addon binaries:

```json
{
  "agent-capabilities:verify": "node additional-modules/agent-capabilities/bin/agent-capabilities-verify.js",
  "agent-capabilities:recommend": "node additional-modules/agent-capabilities/bin/agent-capabilities-recommend.js",
  "agent-capabilities:explain": "node additional-modules/agent-capabilities/bin/agent-capabilities-explain.js",
  "agent-capabilities:build-packet": "node additional-modules/agent-capabilities/bin/agent-capabilities-build-packet.js",
  "agent-capabilities:record-outcome": "node additional-modules/agent-capabilities/bin/agent-capabilities-record-outcome.js",
  "agent-workflow:verify": "node additional-modules/agent-workflow/bin/agent-workflow-verify.js",
  "agent-workflow:start": "node additional-modules/agent-workflow/bin/agent-workflow-start.js",
  "agent-workflow:advance": "node additional-modules/agent-workflow/bin/agent-workflow-advance.js",
  "agent-workflow:status": "node additional-modules/agent-workflow/bin/agent-workflow-status.js"
}
```

Keep implementation under `additional-modules/`.

## Docs To Add

Add:

```txt
template/docs/architecture/AGENT_WORKFLOW_ORCHESTRATOR.md
additional-modules/docs/architecture/AGENT_WORKFLOW_ORCHESTRATOR.md
template/docs/architecture/AGENT_CAPABILITY_REGISTRY.md
additional-modules/docs/architecture/AGENT_CAPABILITY_REGISTRY.md
```

Link from:

```txt
template/docs/architecture/CONTRACTS_OVERVIEW.md
additional-modules/docs/architecture/CONTRACTS_OVERVIEW.md
template/docs/README.md
additional-modules/docs/README.md
```

Docs must explain:

- state machine is orchestrator
- agents/subagents are workers
- registry recommends but does not approve
- decision graph explains why
- vector search is optional and cannot bypass gates
- output proof is mandatory
- context budget is enforced
- workout app is the reference proof

## Acceptance Test Commands

Run:

```bash
npm test
node --test tests/agent_output_proof_schema.test.js
node --test tests/agent_capabilities_registry.test.js
node --test tests/agent_capabilities_decision_graph.test.js
node --test tests/agent_capabilities_recommendation.test.js
node --test tests/agent_capabilities_context_budget.test.js
node --test tests/agent_workflow_state_machine.test.js
node --test tests/agent_workflow_dispatch_gates.test.js
node --test tests/agent_capabilities_outcomes.test.js
node --test tests/agent_workflow_workout_eval.test.js
```

Also keep these green:

```bash
node --test tests/ui_handoff_contract.test.js
node --test tests/workout_ui_contract.test.js
node --test tests/workout_data_contract.test.js
node --test tests/contract_gates.test.js
node --test tests/file_exchange_contracts.test.js
```

If frontend/backend workout files are touched:

```bash
cd template/frontend
node --test src/services/workoutApi.test.js
npm run build

cd ../backend
node --test src/modules/workout/tests/integration/workout.routes.test.js
```

## What Not To Build In This Pass

- Do not build real vector embeddings yet.
- Do not connect pgvector, Chroma, or sqlite-vec yet.
- Do not implement actual cloud Hermes API dispatch.
- Do not run autonomous subagents from scripts yet.
- Do not build a full MCP server yet.
- Do not make recommendation model-based.
- Do not move workflow state into a database yet.

V1 should be deterministic, local, schema-validated, and easy to test.

## Final Success Definition

This is complete when the scaffold can prove this story:

```txt
A workout UI contract task enters the workflow.
The workflow FSM locks contracts and phase.
The capability registry recommends only relevant skills/tools.
The decision graph explains why.
The packet builder emits a tiny packet under qwen-20k and Hermes budgets.
A simulated worker returns structured proof.
The workflow validates the proof, tests, allowed files, and context budget.
The outcome recorder updates capability memory.
The workflow advances to done.
Bad proofs fail.
Over-budget packets fail.
Unknown or risky capabilities fail.
```

That is the agent-first SWE architecture we want: small context, strong proof, and no invisible orchestration.

