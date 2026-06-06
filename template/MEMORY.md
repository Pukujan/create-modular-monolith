# MEMORY.md - Persistent Context for Long-Lived Tasks

**Last updated:** 2026-06-06
**Branch:** `architecture/pipeline-agent-mini-modules-v001`
**Session count:** 1+

---

## PROJECT OVERVIEW

Monorepo structure:
```
create-modular-monolith/
├── template/          ← Main platform starter (monorepo)
│   ├── backend/       ← Node.js modular monolith
│   ├── frontend/      ← React + Vite
│   ├── scripts/       ← Lint, scaffolding, planning tools
│   ├── docs/          ← Architecture contracts
│   └── work-log/      ← Planning, dev-logs, study-docs
└── package.json       ← Root package (scaffold/CLI)
```

**Active branch:** `architecture/pipeline-agent-mini-modules-v001`
**Latest commit:** `c6e428e chore(architecture): sync platform starter with pipeline agent mini-modules v001`

---

## ARCHITECTURE GUARDRAILS (Critical Rules)

### Module Contract
- **Backend:** Each module exports `register(app, context)` from `backend/src/modules/<name>/index.js`
- **Frontend:** Each module exports `{route, label, Component}` default from `frontend/src/modules/<name>/index.jsx`
- Module loader skips directories starting with `_` or `.`
- Parent modules (`case-management`, `ai-ops`) may omit `index.jsx`

### Boundary Rules (STRICT)
- Modules MAY import from: own folder, `src/shared/*`, npm packages
- Modules MUST NOT import from: other module folders (`modules/<other>/`)
- **Allowlisted pair:** `app-shell` ↔ `case-management` only
- All other cross-module imports fail CI

### Mini-Module Rules (Under Parents)
- Sibling code imports ONLY via barrel `../<mini-module>` or `../<mini-module>/index.js`
- NO deep imports into sibling internals (e.g., `../other/services/Foo.js`)
- Enforced via `npm run lint:mini-modules`
- Config: `scripts/lib/parent-mini-modules.config.mjs`

### Internal Module Contract
```
backend module:
  index.js → routes → services → repositories/domain/adapters/agents
  Plus: prompts/, evals/, schemas/, events/, utils/, config/, tests/

frontend module:
  index.jsx → pages → components/hooks/services
  Plus: schemas/, utils/, prompts/, tests/

backend mini-module (under ai-ops/):
  index.js → services/routes/agents/schemas/prompts/evals/tests/
```

### Layer Import Rules
- routes → services only (NOT repositories, adapters, domain directly)
- domain → pure only (NO services, routes, repositories, adapters)
- prompts → declarative only (NO services, routes, repositories)
- utils → leaf nodes (NO services, routes, repositories)
- Enforced via `npm run lint:layers`

---

## PIPELINE AGENT MINI-MODULES REGISTRY

**Registry file:** `backend/src/shared/contracts/pipeline-agent-mini-modules.registry.json`
**Version:** v001
**Parent module:** `ai-ops`

### Infrastructure Mini-Modules (Frontend)
- shared
- state-machine
- agent-runs
- document-intelligence
- rule-discovery
- source-verification
- human-review
- memory

### Backend Parent Layers (Not mini-modules)
- services, routes, repositories, events, config, tests

### Pipeline Mini-Modules (13 total)

| Slug | Kind | Backend Status | Frontend Status |
|------|------|----------------|-----------------|
| rule-discovery-run | orchestrator | implemented | planned |
| parser-agent | assigner | implemented | stub |
| ocr-agent | worker | implemented | partial (legacy: ocr) |
| extractor-agent | worker | implemented | stub |
| filing-audit-agent | worker | implemented | stub |
| authority-planner-agent | worker | planned | stub |
| rule-applicability-agent | worker | implemented | stub |
| source-discovery-agent | worker | implemented | stub |
| source-crawler-agent | worker | implemented | stub |
| source-verifier-agent | worker | implemented | stub |
| rule-relevance-agent | worker | planned | stub |
| rule-filing-persist-agent | worker | planned | stub |
| human-review | gate | orchestrated | partial |

### Contract Functions (pipelineAgentMiniModules.contract.js)
- `listBackendPipelineMiniModuleSlugs()` → slugs with backend status "implemented" or "partial"
- `listFrontendPipelineMiniModuleSlugs()` → slugs with frontend status != "planned"
- `listFrontendAiOpsMiniModules()` → infrastructure + pipeline frontend slugs
- `listInfrastructureFrontendMiniModules()` → infrastructure frontend slugs

### Frontend Mirror
Registry must be mirrored to: `frontend/src/modules/ai-ops/shared/data/pipeline-agent-mini-modules.registry.json`
(Linted via `scripts/lint-pipeline-agent-mini-modules.mjs`)

---

## CURRENT DISK STATE (Critical Findings)

### Backend Modules (`backend/src/modules/`)
- `_reference/` ✓ (reference module, skipped by loader)
- `model-condenser/` ✓ (standalone module, has full structure)
- **`ai-ops/` ✗ MISSING** ← Critical: registry expects this with 9+ implemented mini-modules
- **`case-management/` ✗ MISSING** ← Parent workspace module expected
- **`app-shell/` ✗ MISSING** ← Parent workspace module expected
- **`documents/` ✗ MISSING** ← Referenced in architecture docs

### Frontend Modules (`frontend/src/modules/`)
- `_reference/` ✓ (reference module)
- **`ai-ops/` ✗ MISSING** ← Critical: registry expects this with infrastructure + pipeline mini-modules
- **`case-management/` ✗ MISSING**
- **`app-shell/` ✗ MISSING**
- **`documents/` ✗ MISSING**

### What `listBackendPipelineMiniModuleSlugs()` Returns (from registry)
Expected 9 backend mini-modules under `ai-ops/`:
1. rule-discovery-run
2. parser-agent
3. ocr-agent
4. extractor-agent
5. filing-audit-agent
6. rule-applicability-agent
7. source-discovery-agent
8. source-crawler-agent
9. source-verifier-agent

### What `listFrontendAiOpsMiniModules()` Returns (from registry)
Expected frontend mini-modules (infrastructure + pipeline):
Infrastructure: shared, state-machine, agent-runs, document-intelligence, rule-discovery, source-verification, human-review, memory
Pipeline (non-planned): parser-agent, ocr-agent, ocr(legacy), extractor-agent, filing-audit-agent, rule-applicability-agent, source-discovery-agent, source-crawler-agent, source-verifier-agent, authority-planner-agent, rule-relevance-agent, rule-filing-persist-agent, human-review

---

## LINT SCRIPTS & ENFORCEMENT

| Command | Script | What It Checks |
|---------|--------|----------------|
| `lint:boundaries` | `backend/scripts/check-module-boundaries.mjs` | Cross-module imports |
| `lint:mini-modules` | `backend/scripts/check-parent-mini-modules.mjs` | Parent mini-module barrel imports |
| `lint:layers` | `backend/scripts/check-module-layers.mjs` | Intra-module layer rules |
| `lint:pipeline-agent-mini-modules` | `scripts/lint-pipeline-agent-mini-modules.mjs` | Registry parity, folder existence, manifest presence |
| `lint:architecture` | (composite) | Multiple architecture checks |
| `lint:contracts` | (composite) | Contract validation |

**Important:** `lint:pipeline-agent-mini-modules` skips entirely if `backend/src/modules/ai-ops/` doesn't exist (line 34-37).

---

## KEY FILES TO KNOW

### Configuration
- `scripts/lib/parent-mini-modules.config.mjs` - Mini-module config (derived from registry)
- `scripts/lib/pipeline-agent-mini-modules.mjs` - Re-exports from contract

### Contracts
- `backend/src/shared/contracts/pipelineAgentMiniModules.contract.js` - Registry loading functions
- `backend/src/shared/contracts/pipeline-agent-mini-modules.registry.json` - Source of truth
- `docs/architecture/contracts/moduleAgentStateMachine.contract.md` - FSM agent contract

### Lint Scripts
- `backend/scripts/check-module-boundaries.mjs`
- `backend/scripts/check-parent-mini-modules.mjs`
- `backend/scripts/check-module-layers.mjs`
- `scripts/lint-pipeline-agent-mini-modules.mjs`

### Core
- `backend/src/core/module-loader.js` - Dynamic module loading
- `frontend/src/core/moduleRegistry.jsx` - Frontend route discovery
- `scripts/new-module.mjs` - Module scaffolder

### References
- `backend/src/modules/_reference/` - Backend module template
- `frontend/src/modules/_reference/` - Frontend module template
- `backend/src/modules/model-condenser/` - Only actual backend module on disk

---

## WORK LOG STRUCTURE

- `work-log/planning/{NNN}_{date}_{time}_{slug}/` - Planning phase folders
- `work-log/dev-logs/human/` + `agent/` - Paired dev logs
- `work-log/INDEX.md` - Index of all logs
- **DO NOT** read/write `work-log/study-docs/` (user-owned)

### Planning Workflow
1. Create phase folder with plan-log.md + audit-log.md
2. `npm run plan:finalize -- --slug <slug>`
3. `npm run plan:gate -- --slug <slug>`
4. Implement

### Pre-push Workflow
```
npm run dev-log:pre-push -- --slug <topic> --program <NNN>
npm run dev-log:verify
git commit
npm run dev-log:sync-head -- --latest
npm run dev-log:pre-push -- --check
git push
```

---

## AGENT RULES & CONSTRAINTS

### From AGENTS.md
- **File exchange:** Use `npm run import:file-exchange` before processing inbound files
- **Figma MCP:** Prompt at `file-exchange/imports/{stamp}/trialworks_figma_mcp_prompt/`
- **Planning:** MUST create phase folder before building tier-L features
- **Pre-push:** NEVER push first; write dev logs, verify, commit, then push
- **Architecture checks:** Run `lint:architecture`, `lint:contracts`, `lint:repo-artifacts`, `lint:api-docs`

### Session Preferences
- Terse bullets, no prose paragraphs
- Preserve exact file paths and identifiers
- 32k compaction trigger (max 40k context)

---

## SESSION ARCHIVES

Completed work is archived to `work-log/sessions/`. Full index: [work-log/sessions/INDEX.md](work-log/sessions/INDEX.md)

## CURRENT STATE

- Session archival system in place (`work-log/sessions/`)
- `MEMORY.md` pruned: only current state and next steps remain

## IMMEDIATE NEXT STEPS
1. Create `backend/src/modules/ai-ops/` with proper structure
2. Create frontend `ai-ops/` with infrastructure + pipeline mini-modules
3. Create missing parent modules: `case-management/`, `app-shell/`, `documents/`
4. Wire up frontend registry mirror
5. Verify all lint scripts pass
6. Address `model-condenser` compliance with internal contract
