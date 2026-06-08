# MEMORY.md - Persistent Context

**Last updated:** 2026-06-06
**Branch:** `architecture/pipeline-agent-mini-modules-v001`
**Latest commit:** `73ca5c8 feat(architecture): rename pipeline agents to generic slugs, add enforcement test`

---

## PROJECT OVERVIEW

Scaffold/template for modular monolith with pipeline agent mini-modules. Generic-purpose, not domain-specific.

```
create-modular-monolith/template/
├── backend/       ← Node.js modular monolith
├── frontend/      ← React + Vite
├── scripts/       ← Lint, scaffolding tools
├── docs/          ← Architecture contracts
└── work-log/      ← Sessions, planning, dev-logs
```

---

## ARCHITECTURE GUARDRAILS

### Module Contract
- Backend: `register(app, context)` from `backend/src/modules/<name>/index.js`
- Frontend: `{route, label, Component}` default from `frontend/src/modules/<name>/index.jsx`
- Module loader skips `_` / `.` prefixed dirs; parent modules may omit `index.jsx`

### Boundary Rules
- Modules import from: own folder, `src/shared/*`, npm packages only
- Allowlisted pair: `app-shell` ↔ `case-management` only
- Sibling mini-module imports: barrel `../<mini-module>` ONLY (no deep imports)
- Enforced: `lint:boundaries`, `lint:mini-modules`, `lint:layers`

### Mini-Module Structure
- Backend: `index.js → services/routes/agents/schemas/prompts/evals/tests/`
- Frontend: `index.jsx → pages → components/hooks/services`

### Enforcement verified
- `lint:mini-modules` catches deep sibling imports and points to barrel pattern
- `lint:pipeline-agent-mini-modules` validates registry ↔ folder ↔ manifest alignment

---

## PIPELINE AGENT MINI-MODULES (Generic)

**Registry:** `backend/src/shared/contracts/pipeline-agent-mini-modules.registry.json`
**Parent module:** `ai-ops`
**Mirror:** `frontend/src/modules/ai-ops/shared/data/pipeline-agent-mini-modules.registry.json`

### Pipeline Mini-Modules (13 total)
| Slug | Kind | Backend | Frontend |
|------|------|---------|----------|
| run-orchestrator | orchestrator | implemented | planned |
| ingest-router | assigner | implemented | stub |
| document-processor | worker | implemented | partial (legacy: ocr) |
| data-extractor | worker | implemented | stub |
| audit-agent | worker | implemented | stub |
| planner-agent | worker | planned | stub |
| applicability-agent | worker | implemented | stub |
| source-discovery | worker | implemented | stub |
| source-crawler | worker | implemented | stub |
| source-verifier | worker | implemented | stub |
| relevance-agent | worker | planned | stub |
| persist-agent | worker | planned | stub |
| human-review | gate | orchestrated | partial |

### Infrastructure Mini-Modules (Frontend)
shared, state-machine, agent-runs, document-intelligence, rule-discovery, source-verification, human-review, memory

---

## LINT COMMANDS

| Command | Checks |
|---------|--------|
| `lint:architecture` | Composite: boundaries + mini-modules + layers + api-docs |
| `lint:boundaries` | Cross-module imports |
| `lint:mini-modules` | Barrel-only sibling imports |
| `lint:layers` | Intra-module layer rules |
| `lint:pipeline-agent-mini-modules` | Registry parity, folder/manifest existence |

---

## SESSION ARCHIVES

Index: `work-log/sessions/INDEX.md`
- `2026-06-06-audit-and-memory-setup` — Registry audit, MEMORY.md creation
- `2026-06-06-generic-rename-and-enforcement-test` — Generic rename, boundary test

## AGENT RULES
- Hard ~30k token limit with compact procedure
- Session memory: read MEMORY.md on start, archive + prune on end
- Terse bullets, no prose
