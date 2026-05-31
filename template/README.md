# Modular Monolith Platform

**Your scaffolded app** — Express + React modular monolith with architecture contracts, file-exchange, agent dev logs, and CI gates.

| | |
|---|---|
| **Architecture** | This repo layout and contracts |
| **npm package** | [@pukujan/create-modular-monolith](https://www.npmjs.com/package/@pukujan/create-modular-monolith) |
| **Example product** | [litigation-prompt-engineering](https://github.com/Pukujan/litigation-prompt-engineering) (domain-filled reference) |

---

## Updates (platform v2.3.4)

Scaffolded from `@pukujan/create-modular-monolith@2.3.4` includes dated plan folders and a separate study-logs area.

### Changed in 2.3.4

| Area | Layout |
| --- | --- |
| **Planning phase** | `work-log/planning/{NNN}_{date}_{time}_{slug}/` |
| **Inside each folder** | `audit-log.md` (Cursor conversation) + `plan.md` (+ optional `design.md`) |
| **Manifest** | `work-log/planning/{folder-name}.json` — run `npm run plan:finalize -- --slug {slug}` |
| **Study logs** | **`work-log/study-logs/`** — your portfolio notes; agents must **not** read or write |

Workflow: create folder → fill `audit-log.md` + `plan.md` → `plan:finalize` → `plan:gate` before tier-L build. See [work-log/planning/README.md](work-log/planning/README.md) and `.cursor/commands/planning-audit-log.md`.

Legacy flat `*_audit-log_*` files at `planning/` root still resolve for migration.

---

## Updates (platform v2.3.3)

Scaffolded from `@pukujan/create-modular-monolith@2.3.3` includes agent push tooling and planning path fixes.

### Fixed in 2.3.3

| Issue | What you saw | What we fixed |
| --- | --- | --- |
| **`plan:gate`** | `npm run plan:gate -- --slug x` failed without `--plan-id` (wrong manifest name, e.g. `node.exe.json`) | Safe CLI parsing in `parse-cli-args.mjs` |
| **`dev-log:pre-push`** | Crash: `Cannot read properties of null` on starter apps | Generator works without domain pipeline/prompt registries |
| **Planning split** | Notes in `study-docs/`, manifests in `planning/` | Everything under **`work-log/planning/`** |
| **Windows** | Bad manifest slashes; `agent:push` git commit split on spaces | Forward-slash paths; git without shell splitting |

### Added in 2.3.3

- **`npm run agent:push`** — dev logs first, then push (when Cursor agent pushes for you)
- **`.cursor/hooks.json`** — blocks bare agent `git push` without paired dev logs on `HEAD`
- **`npm run smoke:gates`** — quick check that planning gate + push gate work

Your terminal `git push` is still allowed without dev logs. Only agent shell pushes are enforced.

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
| [work-log/README.md](work-log/README.md) | Planning folders, dev logs, study logs |
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
npm run agent:push -- --slug your-topic    # agent push: dev logs then git push
npm run dev-log:pre-push -- --slug your-topic
npm run plan:finalize -- --slug your-plan-slug
npm run plan:gate -- --slug your-plan-slug
npm run smoke:gates
npm run test:ci
npm run import:file-exchange -- "/path/to/bundle"
npm run condense:all
npm run condense-contracts
npm run new:module -- billing --label "Billing"
```

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Pukujan. Scaffolded from [@pukujan/create-modular-monolith](https://www.npmjs.com/package/@pukujan/create-modular-monolith). Optional credit: [NOTICE](NOTICE).
