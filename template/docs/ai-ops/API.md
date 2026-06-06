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
| rule-discovery-run | implemented | planned |
| parser-agent | implemented | stub |
| ocr-agent | implemented | partial |
| extractor-agent | implemented | stub |
| filing-audit-agent | implemented | stub |
| authority-planner-agent | planned | stub |
| rule-applicability-agent | implemented | stub |
| source-discovery-agent | implemented | stub |
| source-crawler-agent | implemented | stub |
| source-verifier-agent | implemented | stub |
| rule-relevance-agent | planned | stub |
| rule-filing-persist-agent | planned | stub |
| human-review | orchestrated | partial |
