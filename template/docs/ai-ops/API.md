# AI Ops — HTTP API

**Base path:** `/api/ai-ops`

Parent module for pipeline agent mini-modules. Provides orchestration, state machine infrastructure, and agent management.

**Routes:** [`backend/src/modules/ai-ops/routes/`](../../backend/src/modules/ai-ops/routes/)

**Contract:** [API documentation contract](../architecture/API_DOCUMENTATION_CONTRACT.md)

---

## Endpoint quick reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Module health |

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Module health and config summary |

---

## Mini-modules

Pipeline agents are nested under `ai-ops/` — see [pipeline-agent-mini-modules.registry.json](../../backend/src/shared/contracts/pipeline-agent-mini-modules.registry.json).

| Mini-module | Backend Status | Frontend Status |
|-------------|---------------|-----------------|
| run-orchestrator | implemented | planned |
| ingest-router | implemented | stub |
| document-processor | implemented | partial |
| data-extractor | implemented | stub |
| audit-agent | implemented | stub |
| planner-agent | planned | stub |
| applicability-agent | implemented | stub |
| source-discovery | implemented | stub |
| source-crawler | implemented | stub |
| source-verifier | implemented | stub |
| relevance-agent | planned | stub |
| persist-agent | planned | stub |
| human-review | orchestrated | partial |
