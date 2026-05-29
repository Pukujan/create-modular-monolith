# Modular Monolith Platform

**Your scaffolded app** — Express + React modular monolith with architecture contracts, file-exchange, agent dev logs, and CI gates.

| | |
|---|---|
| **Architecture** | This repo layout and contracts |
| **npm package** | [@pukujan/create-modular-monolith](https://github.com/Pukujan/create-modular-monolith) |
| **Example product** | [litigation-prompt-engineering](https://github.com/Pukujan/litigation-prompt-engineering) (domain-filled reference) |

---

## Updates (platform v2.3.0)

Scaffolded from `@pukujan/create-modular-monolith@2.3.0` includes:

- **New contracts** — `documentPersistence`, `moduleAgentStateMachine`, `asyncJobQueue` (templates under `docs/architecture/templates/`)
- **Agent runtime** — `backend/src/shared/agent-runtime/createAgentRuntime.js`
- **Contract export** — `npm run condense-contracts` → `file-exchange/exports/consolidated-contracts.json`
- **External artifacts** — copy `local-artifacts.example.json` → `local-artifacts.json` (gitignored) when needed
- **Module scaffold** — `npm run new:module` creates an `agents/` folder for FSM definitions

Contracts are documentation + copy-paste templates until you implement upload APIs, DB, and workers in your modules.

---

## Start here

| Doc | Purpose |
|-----|---------|
| [docs/architecture/CONTRACTS_OVERVIEW.md](docs/architecture/CONTRACTS_OVERVIEW.md) | Contract manifest (9 IDs) and enforcement |
| [docs/architecture/ARCHITECTURE_GUARDRAILS.md](docs/architecture/ARCHITECTURE_GUARDRAILS.md) | Module boundaries and loader rules |
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

---

## Daily commands

```bash
npm run dev-log:pre-push -- --slug your-topic
npm run test:ci
npm run import:file-exchange -- "/path/to/bundle"
npm run condense:all
npm run condense-contracts
npm run new:module -- billing --label "Billing"
```

---

## License & attribution

Platform files from [@pukujan/create-modular-monolith](https://github.com/Pukujan/create-modular-monolith). See [LICENSE](LICENSE) and [NOTICE](NOTICE).
