# Handoff 007: Agent Capability Registry + Low-Context Enforcement

## Agent Role

You are the implementer. Build the next agent-first architecture layer without turning the repo into a high-context prompt dump.

Primary goal:

```txt
agent capabilities, skills, MCP tools, CLI tools, and task outcomes
-> stored as manifests
-> validated by schemas
-> recommended by task type and agent profile
-> packed into tiny context packets
-> proven by TDD and context-budget tests
```

This is for every future coding environment: Codex, Hermes cloud, OpenCode, Cursor, Claude Code, local Qwen, and any other agent that touches the modular monolith.

## Why This Exists

The scaffold already has input contracts, phase builder, UI handoff contracts, docs, and TDD gates. The next problem is tool and skill selection:

```txt
Which skill should this agent load?
Which MCP tools are available?
Which CLI commands are allowed?
Which output schema is required?
Which skill worked before for this task type?
How much context does each capability cost?
```

Do not solve this by loading every manifest into every prompt. That would make the architecture worse for 10k-20k context models.

The registry must be a searchable, testable source of truth. The generated context packet must be small.

## Non-Negotiable Rules

- Use TDD. Write failing tests first.
- Do not implement a giant free-form memory blob.
- Do not load all skills, tools, or manifests into every phase packet.
- Do not make Hermes special. Hermes is one profile among several.
- Keep the registry under `additional-modules/`.
- Keep generated agent packets small enough for 10k-20k models.
- Every recommendation must be explainable from manifest fields.
- Every task outcome must be append-only JSONL.
- Every output proof must validate against a JSON schema.
- Context budget must be enforced by tests.
- The default packet for a coding phase should target under 8k estimated tokens unless the profile says otherwise.

## Suggested New Addon

Create:

```txt
additional-modules/agent-capabilities/
```

Suggested structure:

```txt
additional-modules/agent-capabilities/
  README.md
  registry/
    capabilities.manifest.json
    skills.manifest.json
    mcp-tools.manifest.json
    cli-tools.manifest.json
    agent-profiles.manifest.json
    task-outcomes.jsonl
    skill-scoreboard.json
  schemas/
    capability.schema.json
    skill.schema.json
    mcp-tool.schema.json
    cli-tool.schema.json
    agent-profile.schema.json
    task-outcome.schema.json
    recommendation.schema.json
    context-packet.schema.json
    phase-proof.schema.json
  bin/
    agent-capabilities-list.js
    agent-capabilities-recommend.js
    agent-capabilities-record-outcome.js
    agent-capabilities-build-packet.js
    agent-capabilities-verify.js
```

## Core Concept

The registry is the memory.

The recommendation is the filter.

The context packet is the only thing handed to a low-context coding agent.

```txt
full registry
-> recommend capabilities for task/profile
-> build tiny packet
-> agent executes
-> agent writes structured proof
-> proof and outcome update scoreboard
```

## Decision Graph And Retrieval Layer

Add a small, explicit decision layer before any future vector search.

The first version should be a deterministic decision graph, not an embedding-only system. Vector search can help find related prior outcomes later, but it must not be the only reason a tool is selected.

Suggested files:

```txt
additional-modules/agent-capabilities/registry/
  decision-graph.json
  decision-rules.json
  retrieval-index.manifest.json

additional-modules/agent-capabilities/schemas/
  decision-graph.schema.json
  decision-rule.schema.json
  retrieval-index.schema.json
```

Decision graph shape:

```json
{
  "nodes": [
    {
      "id": "task.ui-contract",
      "type": "taskType",
      "label": "UI contract enforcement"
    },
    {
      "id": "skill.frontend-contract-slice",
      "type": "skill",
      "capabilityId": "frontend-contract-slice"
    },
    {
      "id": "cli.npm-test",
      "type": "cli",
      "capabilityId": "npm-test"
    }
  ],
  "edges": [
    {
      "from": "task.ui-contract",
      "to": "skill.frontend-contract-slice",
      "relation": "recommends",
      "reason": "UI contract tasks need adapter and no-direct-fetch checks.",
      "weight": 0.9,
      "requiredContractIds": ["CONTRACT:UI:NO_DIRECT_FETCH"]
    }
  ]
}
```

Decision rules shape:

```json
{
  "rules": [
    {
      "id": "RULE:USE_MCP_ONLY_FOR_EXTERNAL_CONTEXT",
      "if": {
        "needsExternalToolOrLiveLookup": true
      },
      "then": {
        "allowTypes": ["mcp"],
        "requireRiskLevelAtMost": "medium"
      },
      "because": "MCP is for tool/data access, not for static repo guidance."
    },
    {
      "id": "RULE:USE_SKILL_FOR_PROCEDURAL_GUIDANCE",
      "if": {
        "needsWorkflowPattern": true
      },
      "then": {
        "allowTypes": ["skill"]
      },
      "because": "Skills are procedural knowledge packets."
    },
    {
      "id": "RULE:USE_CLI_FOR_VERIFICATION",
      "if": {
        "needsDeterministicProof": true
      },
      "then": {
        "allowTypes": ["cli"]
      },
      "because": "CLI tools produce reproducible test and validation proof."
    }
  ]
}
```

Retrieval index manifest shape:

```json
{
  "version": "v001",
  "backend": "none",
  "mode": "symbolic-first",
  "records": [
    {
      "id": "outcome.workout-ui-contract-proof",
      "source": "registry/task-outcomes.jsonl",
      "taskType": "ui-contract",
      "capabilitiesUsed": ["frontend-contract-slice", "npm-test"],
      "summary": "Adapter test caught environment boundary issue.",
      "tags": ["ui-contract", "adapter", "test-proof"]
    }
  ]
}
```

Future vector storage is allowed only behind this manifest. Do not hardcode a vector DB provider in v1.

Supported future backends may include:

```txt
none
sqlite-vec
pgvector
chroma
external-mcp-vector-store
```

The manifest must record:

- backend
- index path or connection alias
- embedding model name if embeddings exist
- source manifest checksum
- last indexed timestamp
- record count

The recommender must work without vector search. If vector search exists, it can add candidates, but the deterministic decision graph and rules still filter them.

## Required Manifest Types

### 1. Agent Profiles

Define profiles such as:

```txt
codex-review
hermes-cloud
opencode-local
cursor
claude-code
qwen-20k
```

Each profile should include:

```json
{
  "id": "qwen-20k",
  "contextWindow": 20000,
  "targetPacketTokens": 8000,
  "canRunBrowser": false,
  "canInstallDependencies": false,
  "canUseMcp": true,
  "requiresStructuredOutput": true,
  "defaultOutputSchema": "phase-proof.v1",
  "maxRecommendedCapabilities": 5
}
```

### 2. Skills Manifest

Each skill entry should include:

```json
{
  "id": "frontend-contract-slice",
  "type": "skill",
  "description": "Frontend UI contract enforcement for adapter-only API calls and no UI drift.",
  "bestFor": ["ui-contract", "frontend-adapter", "browser-proof"],
  "avoidFor": ["backend-only", "database-migration"],
  "contextCostTokens": 900,
  "requiredContractIds": ["CONTRACT:UI:NO_DIRECT_FETCH"],
  "sourceFiles": ["additional-modules/docs/architecture/AGENT_WORKFLOW_CONTRACTS.md"],
  "score": {
    "uses": 0,
    "passes": 0,
    "failures": 0
  }
}
```

### 3. MCP Tools Manifest

Each MCP tool should include:

```json
{
  "id": "filesystem-search",
  "type": "mcp",
  "transport": "stdio",
  "capabilities": ["search-files", "read-files"],
  "riskLevel": "low",
  "allowedProfiles": ["codex-review", "hermes-cloud", "qwen-20k"],
  "requiresApproval": false,
  "contextCostTokens": 250
}
```

### 4. CLI Tools Manifest

Each CLI tool should include:

```json
{
  "id": "phase-builder-plan",
  "type": "cli",
  "command": "npm run phase-builder:plan",
  "purpose": "Generate TDD implementation phases from contract input.",
  "inputs": ["phase-input.json"],
  "outputs": ["phases/", "agent-packets/"],
  "proofRequired": true,
  "contextCostTokens": 300
}
```

### 5. Task Outcomes

Task outcomes are append-only JSONL:

```json
{
  "taskId": "workout-ui-contract-proof",
  "taskType": "ui-contract",
  "agentProfile": "codex-review",
  "skillsUsed": ["frontend-contract-slice"],
  "mcpToolsUsed": [],
  "cliToolsUsed": ["npm-test"],
  "contextTokensEstimated": 7400,
  "status": "passed",
  "notes": "Adapter test caught node env issue."
}
```

## Required Commands

Add root or template scripts that call addon binaries without moving addon code to the repo root:

```bash
npm run agent-capabilities:list
npm run agent-capabilities:recommend -- --task-type ui-contract --profile qwen-20k
npm run agent-capabilities:explain -- --task-type ui-contract --profile qwen-20k
npm run agent-capabilities:build-packet -- --task-type ui-contract --profile qwen-20k --out additional-modules/work-log/agent-packets/demo/
npm run agent-capabilities:record-outcome -- --file proof.json
npm run agent-capabilities:verify
```

If script names conflict with existing conventions, choose nearby names but keep the addon under `additional-modules/agent-capabilities/`.

## Required Output Schemas

Add `phase-proof.schema.json` first, because this is the highest-leverage output contract.

Minimum proof shape:

```json
{
  "phaseId": "phase-003-create-workout-plan",
  "status": "passed",
  "taskType": "ui-contract",
  "agentProfile": "qwen-20k",
  "testsWrittenFirst": true,
  "testsRun": [],
  "filesChanged": [],
  "contractsSatisfied": [],
  "contractViolations": [],
  "context": {
    "contextWindow": 20000,
    "targetPacketTokens": 8000,
    "estimatedPacketTokens": 6200
  },
  "proofArtifacts": [],
  "handoffSummary": ""
}
```

## Context Management Enforcement

This is the most important part.

The tests must prove:

- the full registry is not copied into generated context packets
- packet output includes only selected capability IDs plus short summaries
- packet output includes source pointers, not full docs
- packet output estimates context tokens
- recommendation fails if selected capabilities exceed the profile packet budget
- recommendation trims optional capabilities before exceeding budget
- packet builder refuses profiles without `contextWindow` and `targetPacketTokens`
- packet builder refuses task packets over budget
- output proof refuses `estimatedPacketTokens > targetPacketTokens`
- qwen-20k and hermes-cloud profiles can build packets below 8k estimated tokens for the workout UI contract task
- decision graph explanations include only selected node summaries, not the full graph
- vector or retrieval candidates cannot bypass allowlists, risk levels, context budget, or output schema requirements

Use approximate token counting if no tokenizer is available. A conservative `Math.ceil(text.length / 4)` is acceptable for the first version as long as it is tested.

## TDD Test Plan

Add tests, likely:

```txt
tests/agent_capabilities_registry.test.js
tests/agent_capabilities_context_budget.test.js
tests/agent_output_proof_schema.test.js
tests/agent_capabilities_decision_graph.test.js
```

Required assertions:

- valid manifests pass schema validation
- missing profile context budget fails
- missing skill `bestFor` fails
- missing MCP `riskLevel` fails
- missing CLI `command` fails
- recommendation returns relevant skills for `ui-contract`
- recommendation excludes skills listed in `avoidFor`
- recommendation respects `maxRecommendedCapabilities`
- recommendation respects `targetPacketTokens`
- packet contains compact summaries and pointers
- packet does not contain full registry JSON
- packet validates against `context-packet.schema.json`
- phase proof validates against `phase-proof.schema.json`
- phase proof fails without `testsWrittenFirst`
- phase proof fails when context estimate exceeds budget
- recording a passed task updates the scoreboard
- recording a failed task increments failures
- decision graph validates node ids, edge endpoints, relation names, reasons, and weights
- recommendations include `whySelected` explanations from decision rules or graph edges
- recommendations fail when a selected MCP tool exceeds the profile risk allowance
- recommendations fail when a vector candidate is not present in the capability manifests
- recommender still works when retrieval backend is `none`
- explanation output validates against `recommendation.schema.json`

## Suggested Implementation Phases

### Phase 1: Schemas And Seed Manifests

Add JSON schemas and small seed manifests.

Seed only a few capabilities:

```txt
skills:
- frontend-contract-slice
- backend-route-contract-slice
- api-docs-contract-slice
- output-proof-contract

cli tools:
- npm-test
- frontend-build
- backend-workout-route-test
- phase-builder-plan

mcp tools:
- filesystem-search
- browser-proof-placeholder

profiles:
- codex-review
- hermes-cloud
- qwen-20k
```

Do not add a giant catalog.

### Phase 2: Verify Command

Implement `agent-capabilities-verify.js`.

It should validate all manifests and schemas. Keep dependencies minimal. If adding `ajv`, update package files and tests deliberately. If avoiding dependencies, implement narrow validation by hand for v1.

### Phase 3: Recommendation Command

Implement `agent-capabilities-recommend.js`.

Inputs:

```txt
--task-type <type>
--profile <profile-id>
```

Output:

```json
{
  "taskType": "ui-contract",
  "profile": "qwen-20k",
  "estimatedPacketTokens": 4200,
  "recommended": {
    "skills": [],
    "mcpTools": [],
    "cliTools": []
  },
  "excluded": []
}
```

The recommendation result must include why each capability was selected:

```json
{
  "capabilityId": "frontend-contract-slice",
  "type": "skill",
  "whySelected": [
    "task.ui-contract -> skill.frontend-contract-slice",
    "RULE:USE_SKILL_FOR_PROCEDURAL_GUIDANCE"
  ],
  "whyNotMcp": "No external live tool/data lookup required."
}
```

### Phase 3.5: Explain Command

Implement `agent-capabilities-explain.js`.

It should show the decision path without requiring the agent to read the full registry:

```json
{
  "taskType": "ui-contract",
  "profile": "qwen-20k",
  "decisionPath": [],
  "selectedCapabilities": [],
  "rejectedCapabilities": [],
  "contextBudget": {}
}
```

This is the human/agent-readable audit trail for why a skill, MCP tool, or CLI command was chosen.

### Phase 4: Context Packet Builder

Implement `agent-capabilities-build-packet.js`.

Output:

```txt
TASK.md
context-packet.json
required-output.schema.json
proof-template.json
```

Packet must be compact.

Do not include full docs. Include pointers and contract IDs.

### Phase 5: Outcome Recorder

Implement `agent-capabilities-record-outcome.js`.

It should:

- validate phase proof
- append to `task-outcomes.jsonl`
- update `skill-scoreboard.json`
- never rewrite historical outcome rows

### Phase 6: Docs And Architecture Index

Add docs:

```txt
additional-modules/agent-capabilities/README.md
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

## Acceptance Criteria

The work is done when:

```bash
npm test
npm run agent-capabilities:verify
npm run agent-capabilities:recommend -- --task-type ui-contract --profile qwen-20k
npm run agent-capabilities:build-packet -- --task-type ui-contract --profile qwen-20k --out /tmp/agent-packet-proof
```

all pass, and the generated packet is demonstrably under the profile budget.

Also run the existing important tests:

```bash
node --test tests/contract_gates.test.js
node --test tests/file_exchange_contracts.test.js
node --test tests/ui_handoff_contract.test.js
node --test tests/workout_ui_contract.test.js
node --test tests/workout_data_contract.test.js
```

If frontend/backend package tests were touched, also run:

```bash
cd template/frontend && node --test src/services/workoutApi.test.js && npm run build
cd template/backend && node --test src/modules/workout/tests/integration/workout.routes.test.js
```

## What Not To Build Yet

Do not build a full MCP server in this phase.

Do not build an AI model-based recommender.

Do not add vector DB memory.

Do not make the registry modify prompts directly.

Do not let task outcomes become the only source of truth. They inform recommendations, but schemas and manifests remain authoritative.

## Mental Model

```txt
AGENTS.md tells agents the durable repo rules.
Contracts define what must not drift.
Phase Builder defines small TDD work.
Agent Capability Registry chooses the smallest useful tools/skills.
Context Packet Builder keeps the model under budget.
Output Proof Schema makes the agent prove completion.
Task Outcomes remember what worked.
```

The win condition is not “more agent memory.”

The win condition is:

```txt
less context, better recommendations, stronger proof.
```
