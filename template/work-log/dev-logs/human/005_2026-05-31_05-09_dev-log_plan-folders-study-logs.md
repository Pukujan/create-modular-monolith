# Dev log (human): plan folders study logs

| Field | Value |
|-------|--------|
| **Entry** | 005 |
| **Date** | 2026-05-31 |
| **Time** | 05-09 |
| **Filename** | `005_2026-05-31_05-09_dev-log_plan-folders-study-logs.md` |
| **Agent audit** | [005_2026-05-31_05-09_dev-log-agent_plan-folders-study-logs.json](../agent/005_2026-05-31_05-09_dev-log-agent_plan-folders-study-logs.json) |
| **Git** | `main` @ `73c6de4` |

## Table of contents

### [Part I — Summary](#part-i-summary) _(read first)_
- [I.1 At a glance](#i1-at-a-glance)
- [I.2 Diagrams](#i2-diagrams)
- [I.3 API surface (summary)](#i3-api-surface-summary)
- [I.4 Version & prompt audit](#i4-version-prompt-audit)
- [I.5 Test audit](#i5-test-audit)
- [I.6 Git audit](#i6-git-audit)
- [I.7 Repository shape](#i7-repository-shape)

### [Part II — Detailed](#part-ii-detailed) _(full audit trail)_
- [II.1 Goals and scope](#ii1-goals-and-scope)
- [II.2 Decisions](#ii2-decisions)
- [II.3 Changes by area](#ii3-changes-by-area)
- [II.4 Iterations](#ii4-iterations)
- [II.5 Tests (detail)](#ii5-tests-detail)
- [II.6 What got better / trade-offs / risks](#ii6-outcomes)
- [II.7 Follow-ups](#ii7-follow-ups)
- [II.8 APIs (full registry)](#ii8-apis-full-registry)
- [II.9 Git snapshot (full)](#ii9-git-snapshot-full)
- [II.10 Repository tree (full)](#repository-tree-full)

---

## Part I — Summary {#part-i-summary}

> **Purpose:** One-screen picture for reviewers — APIs, versions, tests, git, repo shape.  
> **Detail:** [Part II](#part-ii-detailed) below.

### I.1 At a glance {#i1-at-a-glance}

Shipped **v2.3.4**: planning phases live in dated folders (`audit-log.md` + `plan.md` inside), study logs moved to owner-only `work-log/study-logs/`, and README/CHANGELOG updated for npm. `npm run smoke:gates` passes. Blocker for publish: npm auth if not logged in.

### I.2 Diagrams {#i2-diagrams}

**HTTP modules (active + stub)**

```mermaid
flowchart LR
  client[Client / Frontend]
  client --> m0[Reference]
  client --> m1[Model condenser]
```

**Pipeline versions (defaults at push)**

```mermaid
flowchart TB
  client[Client] --> api[HTTP API]
  api --> modules[Modular monolith]
  modules --> data[(Storage / DB)]
```

**Pre-push dev log flow**

```mermaid
flowchart LR
  code[Code changes] --> devlog[npm run dev-log:pre-push]
  devlog --> human[human/*.md]
  devlog --> agent[agent/*.json]
  human --> push[git push]
  agent --> push
```

### I.3 API surface (summary) {#i3-api-surface-summary}

| Kind | Count | Notes |
|------|------:|-------|
| Active HTTP routes | 4 | Case-filing-ai + condenser + pipeline |
| Stub modules (health only) | 0 | Workflow, court-rules, vault, review, docketing |
| Deprecated HTTP | 0 | From docs/API.md descriptions |
| Deprecated CLI | 0 | See version audit |

**Key routes this program:**

| Method | Path |
|--------|------|
| GET | `/api/model-condenser/health` |
| POST | `/api/model-condenser/condense` |
| GET | `/api/model-condenser/consolidated` |

_Session API changes not in docs/API.md — FILL in [II.8](#ii8-apis-full-registry)._

### I.4 Version & prompt audit {#i4-version-prompt-audit}

| Contract | Version | Status |
|----------|---------|--------|
| App (package.json) | 2.0.0 | current |
| Architecture contracts | manifest.json | see docs/architecture/CONTRACTS_OVERVIEW.md |
| Domain pipeline / prompts | — | not registered in starter template |

### I.5 Test audit {#i5-test-audit}

| Status | Value |
|--------|-------|
| Ran | yes |
| Exit code | 1 |
| Summary | exit=1 |
| Passed (sample) | 1 lines captured |
| Failed (sample) | 4 lines captured |

### I.6 Git audit {#i6-git-audit}

| Field | Value |
|-------|-------|
| Branch | `main` |
| Commit | `73c6de4` (`73c6de42fc4538116a1e5ffabadf8f4d853b7276`) |
| Changed paths (porcelain) | 25 |
| Recent commits | 5 listed below |

### I.7 Repository shape {#i7-repository-shape}

| Metric | Value |
|--------|------:|
| Files | 202 |
| Directories | 99 |
| Tree ignores | node_modules, .git, dist, build |
| Top extensions | .js (77), .md (45), .mjs (38), (no extension) (12), .json (12) |

_Condensed tree (full tree in [II.10](#repository-tree-full)):_

```text
C:\Users\pujan\OneDrive\Desktop\web dev\webdev 2.0\create-modular-monolith\template/
├── .gitignore
├── AGENTS.md
├── ARCHITECTURE_EXPORT_README.md
├── EXPORT_MANIFEST.json
├── LICENSE
├── local-artifacts.example.json
├── NOTICE
├── package.json
├── README.md
├── .cursor/
│   ├── hooks.json
│   ├── commands/
│   │   ├── architecture-push-log.md
│   │   ├── planning-audit-log.md
│   │   ├── pre-push-dev-log.md
│   │   └── push.md
│   ├── hooks/
│   │   └── before-agent-push.mjs
│   └── rules/
│       ├── agent-push-dev-log.mdc
│       ├── api-documentation.mdc
│       ├── file-exchange-inbox.mdc
│       └── study-logs-user-only.mdc
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   ├── db/
│   │   └── migrations/
│   │       └── .gitkeep
│   ├── scripts/
│   │   ├── check-module-boundaries.mjs
│   │   └── check-module-layers.mjs
│   └── src/
│       ├── core/
│       │   ├── module-loader.js
│       │   └── server.js
│       ├── modules/
│       │   ├── .gitkeep
│       │   ├── _reference/
│       │   │   ├── index.js
│       │   │   ├── README.md
│       │   │   ├── adapters/
│       │   │   │   └── README.md
│   └── … (254 more lines — [full tree](#repository-tree-full))
```

---

## Part II — Detailed {#part-ii-detailed}

> **Purpose:** Decisions, iterations, narrative, and full machine-captured snapshots.

### II.1 Goals and scope {#ii1-goals-and-scope}

- **In scope:** Dated plan folders, study-logs separation, audit-log terminology, gate/finalize resolver, docs, v2.3.4 release
- **Out of scope:** Migrating existing product repos' flat planning files (legacy still resolves)

### II.2 Decisions {#ii2-decisions}

| ID | Decision | Rationale | Alternatives rejected |
|----|----------|-----------|------------------------|
| D1 | One folder per planning phase with fixed filenames inside | Clear audit trail per phase; manifest links folder | Flat files at planning root |
| D2 | `study-logs/` excluded from agent tooling | Owner portfolio notes ≠ planning gate artifacts | Reusing study log name for audit logs |

### II.3 Changes by area {#ii3-changes-by-area}

#### Backend / API
- _FILL_

#### Frontend
- _FILL_

#### Data / contracts / prompts
- _FILL_

#### Tooling / CI / docs
- `plan-artifacts.mjs`, `plan-folder.mjs`, `plan-gate.mjs`, `plan-finalize.mjs`, smoke tests
- Root + template README, CHANGELOG, planningPhase contract, AGENTS.md, study-logs rule
- Package version **2.3.4**

### II.4 Iterations {#ii4-iterations}

1. **Attempt 1** — `npm run smoke:gates` → pass

### II.5 Tests (detail) {#ii5-tests-detail}

#### Passed
- `npm run smoke:gates` (planning + agent push gate)

#### Failed
- Pre-push `npm test` in dev-log generator (4 backend tests — pre-existing env, not this change)

#### Raw tail (auto)

```
odular-monolith/template/backend/src/shared/storage/resolveDocumentStoragePaths.test.js:11:10)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.start (node:internal/test_runner/test:944:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
  ...
# Subtest: resolveDocumentStoragePaths reads local-artifacts.json
ok 13 - resolveDocumentStoragePaths reads local-artifacts.json
  ---
  duration_ms: 19.4711
  type: 'test'
  ...
# Subtest: UPLOADS_ROOT overrides artifact layout
ok 14 - UPLOADS_ROOT overrides artifact layout
  ---
  duration_ms: 3.0388
  type: 'test'
  ...
# Subtest: documentBlobPath builds original.{ext} under document folder
ok 15 - documentBlobPath builds original.{ext} under document folder
  ---
  duration_ms: 2.4159
  type: 'test'
  ...
# Subtest: writeConsolidatedExport writes dated folder and latest copy
ok 16 - writeConsolidatedExport writes dated folder and latest copy
  ---
  duration_ms: 45.2417
  type: 'test'
  ...
# Subtest: clearFileExchange dryRun previews removable paths
ok 17 - clearFileExchange dryRun previews removable paths
  ---
  duration_ms: 21.8228
  type: 'test'
  ...
# Subtest: clearFileExchange confirm removes dated folders
ok 18 - clearFileExchange confirm removes dated folders
  ---
  duration_ms: 15.9113
  type: 'test'
  ...
# Subtest: formatExchangeTimestamp
ok 19 - formatExchangeTimestamp
  ---
  duration_ms: 3.5448
  type: 'test'
  ...
# Subtest: normalizeExchangeStamp converts legacy compact stamps
ok 20 - normalizeExchangeStamp converts legacy compact stamps
  ---
  duration_ms: 0.3588
  type: 'test'
  ...
# Subtest: formatWorkLogTimestamp
ok 21 - formatWorkLogTimestamp
  ---
  duration_ms: 0.2379
  type: 'test'
  ...
# Subtest: formatHumanReadableUtc
ok 22 - formatHumanReadableUtc
  ---
  duration_ms: 24.8364
  type: 'test'
  ...
1..22
# tests 22
# suites 0
# pass 18
# fail 4
# cancelled 0
# skipped 0
# todo 0
# duration_ms 362.1744


```

### II.6 What got better / trade-offs / risks {#ii6-outcomes}

**Better**
- _FILL_

**Trade-offs**
- _FILL_

**Regressions / risks**
- _FILL_

### II.7 Follow-ups {#ii7-follow-ups}

- [ ] _FILL_

### II.8 APIs (full registry) {#ii8-apis-full-registry}

### HTTP — active

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| GET | `/api/_reference/health` | Reference | Example module health |
| GET | `/api/model-condenser/health` | Model condenser | Module health |
| POST | `/api/model-condenser/condense` | Model condenser | Regenerate consolidated-models.json |
| GET | `/api/model-condenser/consolidated` | Model condenser | Read consolidated schema inventory |

### HTTP — stub (health only)

_none_

### HTTP — deprecated

_none registered in docs/API.md_

### II.9 Git snapshot (full) {#ii9-git-snapshot-full}

**Changed files (porcelain)**

```
M CHANGELOG.md
 M README.md
 M package.json
 D template/.cursor/commands/planning-study-log.md
 M template/AGENTS.md
 M template/ARCHITECTURE_EXPORT_README.md
 M template/README.md
 M template/backend/src/shared/contracts/planningPhase.contract.js
 M template/docs/architecture/CONTRACTS_OVERVIEW.md
 M template/docs/architecture/contracts/manifest.json
 M template/docs/architecture/contracts/planningPhase.contract.md
 M template/scripts/export-architecture-starter.mjs
 M template/scripts/lib/plan-artifacts.mjs
 M template/scripts/plan-finalize.mjs
 M template/scripts/plan-gate.mjs
 M template/scripts/smoke-gates.mjs
 M template/work-log/README.md
 D template/work-log/dev-logs/agent/005_2026-05-31_04-44_dev-log-agent_planning-push-gates.json
 D template/work-log/dev-logs/human/005_2026-05-31_04-44_dev-log_planning-push-gates.md
 M template/work-log/handoffs/README.md
 M template/work-log/planning/README.md
?? template/.cursor/commands/planning-audit-log.md
?? template/.cursor/rules/study-logs-user-only.mdc
?? template/scripts/lib/plan-folder.mjs
?? template/work-log/study-logs/
```

**Diff stat vs HEAD**

```
CHANGELOG.md                                       |  17 +-
 README.md                                          |  47 +-
 package.json                                       |   2 +-
 template/.cursor/commands/planning-study-log.md    |  25 -
 template/AGENTS.md                                 |  16 +-
 template/ARCHITECTURE_EXPORT_README.md             |   2 +-
 template/README.md                                 | 211 ++++----
 .../src/shared/contracts/planningPhase.contract.js |  21 +-
 template/docs/architecture/CONTRACTS_OVERVIEW.md   |   2 +-
 template/docs/architecture/contracts/manifest.json |   2 +-
 .../contracts/planningPhase.contract.md            |  53 +-
 template/scripts/export-architecture-starter.mjs   |   7 +-
 template/scripts/lib/plan-artifacts.mjs            | 108 +++-
 template/scripts/plan-finalize.mjs                 |  23 +-
 template/scripts/plan-gate.mjs                     |  34 +-
 template/scripts/smoke-gates.mjs                   | 254 ++++-----
 template/work-log/README.md                        |  67 ++-
 ...31_04-44_dev-log-agent_planning-push-gates.json | 212 --------
 ...2026-05-31_04-44_dev-log_planning-push-gates.md | 587 ---------------------
 template/work-log/handoffs/README.md               |   4 +-
 template/work-log/planning/README.md               |  35 +-
 21 files changed, 571 insertions(+), 1158 deletions(-)
```

**Recent commits**

```
73c6de4 docs: 2.3.3 release notes — fixes for plan gate, dev logs, planning paths
3831eb8 release: v2.3.3 planning folder and agent push gate
cfeec0a dev log: planning-push-gates
6284b77 feat: consolidate planning artifacts and enforce agent push dev logs
cd2d6e4 feat: postinstall message linking to GitHub and npm
```

### II.10 Repository tree (full) {#repository-tree-full}

_Ignores: `node_modules`, `.git`, `dist`, `build` — equivalent to `tree -I "node_modules|.git|dist|build"`._

```text
C:\Users\pujan\OneDrive\Desktop\web dev\webdev 2.0\create-modular-monolith\template/
├── .gitignore
├── AGENTS.md
├── ARCHITECTURE_EXPORT_README.md
├── EXPORT_MANIFEST.json
├── LICENSE
├── local-artifacts.example.json
├── NOTICE
├── package.json
├── README.md
├── .cursor/
│   ├── hooks.json
│   ├── commands/
│   │   ├── architecture-push-log.md
│   │   ├── planning-audit-log.md
│   │   ├── pre-push-dev-log.md
│   │   └── push.md
│   ├── hooks/
│   │   └── before-agent-push.mjs
│   └── rules/
│       ├── agent-push-dev-log.mdc
│       ├── api-documentation.mdc
│       ├── file-exchange-inbox.mdc
│       └── study-logs-user-only.mdc
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   ├── db/
│   │   └── migrations/
│   │       └── .gitkeep
│   ├── scripts/
│   │   ├── check-module-boundaries.mjs
│   │   └── check-module-layers.mjs
│   └── src/
│       ├── core/
│       │   ├── module-loader.js
│       │   └── server.js
│       ├── modules/
│       │   ├── .gitkeep
│       │   ├── _reference/
│       │   │   ├── index.js
│       │   │   ├── README.md
│       │   │   ├── adapters/
│       │   │   │   └── README.md
│       │   │   ├── config/
│       │   │   │   └── index.js
│       │   │   ├── domain/
│       │   │   │   └── README.md
│       │   │   ├── events/
│       │   │   │   └── index.js
│       │   │   ├── prompts/
│       │   │   │   ├── manifest.json
│       │   │   │   └── templates/
│       │   │   │       └── example.prompt.js
│       │   │   ├── repositories/
│       │   │   │   └── .gitkeep
│       │   │   ├── routes/
│       │   │   │   ├── health.routes.js
│       │   │   │   └── index.js
│       │   │   ├── schemas/
│       │   │   │   └── health.schema.js
│       │   │   ├── services/
│       │   │   │   └── health.service.js
│       │   │   ├── tests/
│       │   │   │   ├── integration/
│       │   │   │   │   └── health.routes.test.js
│       │   │   │   └── unit/
│       │   │   │       └── health.service.test.js
│       │   │   └── utils/
│       │   │       └── index.js
│       │   └── model-condenser/
│       │       ├── index.js
│       │       ├── README.md
│       │       ├── config/
│       │       │   └── index.js
│       │       ├── events/
│       │       │   └── index.js
│       │       ├── routes/
│       │       │   ├── health.routes.js
│       │       │   ├── index.js
│       │       │   └── modelCondenser.routes.js
│       │       ├── services/
│       │       │   ├── health.service.js
│       │       │   ├── modelCondenser.facade.js
│       │       │   └── modelCondenser.service.js
│       │       ├── tests/
│       │       │   ├── integration/
│       │       │   │   └── modelCondenser.routes.test.js
│       │       │   └── unit/
│       │       │       └── modelCondenser.service.test.js
│       │       └── utils/
│       │           └── index.js
│       └── shared/
│           ├── agent-runtime/
│           │   ├── createAgentRuntime.js
│           │   ├── createAgentRuntime.test.js
│           │   └── createAgentRuntime.types.js
│           ├── ai/
│           │   └── prompt-registry.js
│           ├── config/
│           │   ├── resolveArtifactPaths.js
│           │   ├── resolveArtifactPaths.test.js
│           │   └── resolveArtifactPaths.types.js
│           ├── contracts/
│           │   ├── architecturePushDevLog.contract.js
│           │   ├── asyncJobQueue.contract.js
│           │   ├── consolidatedExports.contract.js
│           │   ├── documentPersistence.contract.js
│           │   ├── moduleAgentStateMachine.contract.js
│           │   ├── planningPhase.contract.js
│           │   └── prePushDevLog.contract.js
│           ├── domain/
│           │   └── case-filing/
│           │       └── core-models.js
│           ├── events/
│           │   └── index.js
│           ├── http/
│           │   └── errors.js
│           ├── storage/
│           │   ├── resolveDocumentStoragePaths.js
│           │   ├── resolveDocumentStoragePaths.test.js
│           │   └── resolveDocumentStoragePaths.types.js
│           ├── testing/
│           │   └── create-test-app.js
│           └── utils/
│               ├── consolidatedExport.js
│               ├── consolidatedExport.test.js
│               ├── fileExchangeCleanup.js
│               ├── fileExchangeCleanup.test.js
│               ├── formatExchangeTimestamp.js
│               ├── formatExchangeTimestamp.test.js
│               ├── traceId.js
│               └── zipDirectory.js
├── docs/
│   ├── API.md
│   ├── DEVLOG_V2.md
│   ├── PUBLISHING.md
│   ├── README.md
│   ├── STARTER_PACK.md
│   ├── architecture/
│   │   ├── API_DOCUMENTATION_CONTRACT.md
│   │   ├── ARCHITECTURE_GUARDRAILS.md
│   │   ├── CONTRACTS_OVERVIEW.md
│   │   ├── EVAL_AND_CI.md
│   │   ├── MODULE_INTERNAL_CONTRACT.md
│   │   ├── REPO_ARTIFACT_LAYOUT.md
│   │   ├── contracts/
│   │   │   ├── apiDocumentationRegistry.contract.md
│   │   │   ├── architecturePushDevLog.contract.md
│   │   │   ├── asyncJobQueue.contract.md
│   │   │   ├── changelog.jsonl
│   │   │   ├── consolidatedExports.contract.md
│   │   │   ├── documentPersistence.contract.md
│   │   │   ├── fileExchange.contract.md
│   │   │   ├── manifest.json
│   │   │   ├── moduleAgentStateMachine.contract.md
│   │   │   ├── planningPhase.contract.md
│   │   │   └── prePushDevLog.contract.md
│   │   └── templates/
│   │       ├── async-job-queue/
│   │       │   ├── createQueueConnection.template.js
│   │       │   ├── enqueue.template.js
│   │       │   ├── inMemoryQueue.adapter.template.js
│   │       │   ├── parse-document.worker.template.js
│   │       │   ├── README.md
│   │       │   └── run-agent-action.worker.template.js
│   │       ├── document-persistence/
│   │       │   ├── README.md
│   │       │   ├── adapters/
│   │       │   │   ├── file-storage.adapter.template.js
│   │       │   │   └── parser.adapter.template.js
│   │       │   ├── migrations/
│   │       │   │   └── 001_document_persistence.sql
│   │       │   ├── repositories/
│   │       │   │   └── document.repository.template.js
│   │       │   ├── routes/
│   │       │   │   └── upload.routes.template.js
│   │       │   └── services/
│   │       │       └── document-ingest.service.template.js
│   │       └── module-agent-state-machine/
│   │           ├── README.md
│   │           ├── agents/
│   │           │   ├── example-agent.machine.template.js
│   │           │   └── manifest.template.json
│   │           ├── events/
│   │           │   └── agent-triggers.template.js
│   │           ├── migrations/
│   │           │   └── 001_agent_state_machine.sql
│   │           ├── repositories/
│   │           │   └── agent-run.repository.template.js
│   │           ├── routes/
│   │           │   └── agent.routes.template.js
│   │           └── services/
│   │               ├── agent-actions.template.js
│   │               └── agent-runner.service.template.js
│   └── model-condenser/
│       └── API.md
├── file-exchange/
│   ├── README.md
│   ├── exports/
│   │   └── .gitkeep
│   └── imports/
│       └── .gitkeep
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── core/
│       │   ├── App.jsx
│       │   └── moduleRegistry.jsx
│       ├── modules/
│       │   └── _reference/
│       │       ├── index.jsx
│       │       ├── README.md
│       │       ├── components/
│       │       │   └── ModuleHealthCard.jsx
│       │       ├── hooks/
│       │       │   └── use-module-health.js
│       │       ├── pages/
│       │       │   └── _referencePage.jsx
│       │       ├── prompts/
│       │       │   └── README.md
│       │       ├── schemas/
│       │       │   └── health.schema.js
│       │       ├── services/
│       │       │   └── health-api.js
│       │       ├── tests/
│       │       │   └── unit/
│       │       │       └── health.schema.test.js
│       │       └── utils/
│       │           └── index.js
│       └── shared/
│           └── api/
│               └── client.js
├── scripts/
│   ├── agent-push.mjs
│   ├── check-api-docs.mjs
│   ├── condense-all.mjs
│   ├── condense-contracts.mjs
│   ├── condense-file-structure.mjs
│   ├── condense-models.mjs
│   ├── condense-prompts.mjs
│   ├── consolidated-output.mjs
│   ├── export-architecture-starter.mjs
│   ├── export-consolidated-models.mjs
│   ├── import-to-file-exchange.mjs
│   ├── lint-contracts.mjs
│   ├── lint-repo-artifacts.mjs
│   ├── new-module.mjs
│   ├── plan-finalize.mjs
│   ├── plan-gate.mjs
│   ├── postinstall-message.mjs
│   ├── resolve-import-stamp.mjs
│   ├── run-module-evals.mjs
│   ├── smoke-gates.mjs
│   ├── sync-cli-template.mjs
│   ├── verify-dev-log.mjs
│   ├── write-pre-push-dev-log.mjs
│   ├── git-hooks/
│   │   └── pre-push.sample
│   └── lib/
│       ├── api-inventory.mjs
│       ├── arch-push-human-format.mjs
│       ├── check-dev-log-for-head.mjs
│       ├── collect-starter-export-changes.mjs
│       ├── dev-log-human-format.mjs
│       ├── git-snapshot.mjs
│       ├── module-scaffold.mjs
│       ├── parse-cli-args.mjs
│       ├── plan-artifacts.mjs
│       ├── plan-folder.mjs
│       ├── repo-tree.mjs
│       └── run-tests.mjs
└── work-log/
    ├── INDEX.md
    ├── README.md
    ├── dev-logs/
    │   ├── README.md
    │   ├── agent/
    │   │   └── .gitkeep
    │   ├── human/
    │   │   └── .gitkeep
    │   ├── schemas/
    │   │   └── dev-log-agent.v1.schema.json
    │   └── templates/
    │       └── dev-log-human.template.md
    ├── handoffs/
    │   └── README.md
    ├── planning/
    │   ├── .gitkeep
    │   └── README.md
    └── study-logs/
        ├── .gitkeep
        └── README.md
```