# Modular Monolith Platform

**Your scaffolded app** — Express + React modular monolith with architecture contracts, file-exchange, agent dev logs, and CI gates.

| | |
|---|---|
| **Architecture** | This repo layout and contracts |
| **npm package** | [@pukujan/create-modular-monolith](https://github.com/Pukujan/create-modular-monolith) |
| **Example product** | [litigation-prompt-engineering](https://github.com/Pukujan/litigation-prompt-engineering) (domain-filled reference) |

---

## Start here

| Doc | Purpose |
|-----|---------|
| [docs/architecture/PLATFORM_ARCHITECTURE.md](docs/architecture/PLATFORM_ARCHITECTURE.md) | How the platform works (agents + humans) |
| [docs/architecture/CONTRACTS_OVERVIEW.md](docs/architecture/CONTRACTS_OVERVIEW.md) | Contract manifest and enforcement |
| [docs/architecture/EVAL_AND_CI.md](docs/architecture/EVAL_AND_CI.md) | CI gates, evals, golden (per-case) |
| [AGENTS.md](AGENTS.md) | **Required for Cursor / automation** |
| [docs/README.md](docs/README.md) | Full documentation index |

---

## Quick start

**Requirements:** Node.js 20+

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

cd backend && npm install && npm run dev
# new terminal:
cd frontend && npm install && npm run dev
```

- API: `http://localhost:3001` — [docs/API.md](docs/API.md)
- UI: Vite dev server — see `frontend/package.json`

---

## Daily commands

```bash
# Before every git push
npm run dev-log:pre-push -- --slug your-topic
npm run test:ci

# Inbound files for agents (never process from Downloads/ directly)
npm run import:file-exchange -- "/path/to/bundle"

# Refresh agent-readable snapshots
npm run condense:all

# New feature
npm run new:module -- billing --label "Billing"
```

---

## Repository map

```text
my-modular-monolith/
├── backend/src/modules/       # add features here (_reference = layout example)
├── frontend/src/modules/
├── docs/architecture/         # contracts, guardrails
├── file-exchange/             # imports/{stamp}/ exports/consolidated-*.json
├── work-log/                  # handoffs + dev-logs (human + agent)
├── scripts/                   # lint, condense, dev-log, new-module
└── .github/workflows/ci.yml
```

Canonical paths: [docs/architecture/REPO_ARTIFACT_LAYOUT.md](docs/architecture/REPO_ARTIFACT_LAYOUT.md)

---

## What is included

- **Modules:** `_reference` (example layout), `model-condenser` (schema inventory API)
- **Platform contracts** v001 — file exchange, dev logs, consolidated exports, API registry
- **Lint:** `lint:architecture`, `lint:contracts`, `lint:repo-artifacts`
- **CI:** GitHub Actions runs the same checks as `npm run test:ci`
- **Observability:** `backend/src/shared/utils/traceId.js` for correlating workflow steps

---

## What you add

- Domain modules under `backend/src/modules/<name>/` and `frontend/src/modules/<name>/`
- Prompts in each module’s `prompts/`
- Optional `evals/golden/{caseId}/` when you have curated expected JSON for regression
- Runtime data under `data/` (gitignored by default)

---

## Architecture checks

```bash
npm run test:ci              # recommended before push
npm run lint:architecture
npm run test:evals           # module example eval runners (offline)
```

---

## License

MIT (add `LICENSE` at repo root if your project needs one).
