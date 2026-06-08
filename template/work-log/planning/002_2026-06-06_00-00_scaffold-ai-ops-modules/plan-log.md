# Plan Log — scaffold-ai-ops-modules

**Date:** 2026-06-06
**Slug:** scaffold-ai-ops-modules
**Branch:** architecture/pipeline-agent-mini-modules-v001

## Goal

Create missing parent modules and ai-ops mini-module structure per the v001 registry.

## What to Build

### Phase 1: Parent Modules
1. `backend/src/modules/ai-ops/` — parent with layers: services, routes, repositories, events, config, tests
2. `backend/src/modules/case-management/` — scaffold via `new-module.mjs`
3. `backend/src/modules/app-shell/` — scaffold via `new-module.mjs`
4. `backend/src/modules/documents/` — scaffold via `new-module.mjs`
5. Same 4 modules in frontend

### Phase 2: Backend Pipeline Mini-Modules (under ai-ops/)
Create folders for all 13 mini-modules from registry:
- rule-discovery-run (orchestrator)
- parser-agent (assigner)
- ocr-agent (worker)
- extractor-agent (worker)
- filing-audit-agent (worker)
- authority-planner-agent (worker, planned)
- rule-applicability-agent (worker)
- source-discovery-agent (worker)
- source-crawler-agent (worker)
- source-verifier-agent (worker)
- rule-relevance-agent (worker, planned)
- rule-filing-persist-agent (worker, planned)
- human-review (gate, no separate folder — owned by rule-discovery-run FSM)

Each backend mini-module structure:
```
index.js
services/
routes/
agents/
schemas/
prompts/
evals/
tests/
```

### Phase 3: Frontend Mini-Modules (under ai-ops/)
Infrastructure (8): shared, state-machine, agent-runs, document-intelligence, rule-discovery, source-verification, human-review, memory
Pipeline (13): mirror backend slugs with stub status

Each frontend mini-module structure:
```
index.jsx
components/
hooks/
pages/
services/
```

### Phase 4: Registry Mirror
- Mirror `backend/src/shared/contracts/pipeline-agent-mini-modules.registry.json` to `frontend/src/modules/ai-ops/shared/data/pipeline-agent-mini-modules.registry.json`
- Verify `lint:pipeline-agent-mini-modules` passes

## Acceptance Criteria
- All 4 parent modules exist with proper scaffold
- All backend pipeline mini-module folders created with index.js stubs
- All frontend mini-module folders created with index.jsx stubs
- Registry mirror in place
- `npm run lint:pipeline-agent-mini-modules` passes
- `npm run lint:architecture` passes
