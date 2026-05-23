# Modular monolith platform (scaffolded)

Architecture-first Express + React starter for products that scale with **human + agent** engineering.

**Read first:** [docs/architecture/PLATFORM_ARCHITECTURE.md](docs/architecture/PLATFORM_ARCHITECTURE.md)  
**Contracts:** [docs/architecture/CONTRACTS_OVERVIEW.md](docs/architecture/CONTRACTS_OVERVIEW.md)  
**Evals & CI gates:** [docs/architecture/EVAL_AND_CI.md](docs/architecture/EVAL_AND_CI.md)  
**Agents:** [AGENTS.md](AGENTS.md)

## Quick start

```bash
cd backend && npm install && npm run dev
# other terminal:
cd frontend && npm install && npm run dev
```

## Quality gates

```bash
npm run test:ci             # lint + unit tests + module evals (same as GitHub Actions)
npm run lint:contracts
npm run lint:architecture
npm run test:evals
```

## Architecture commands

```bash
npm run import:file-exchange -- ./my-bundle
npm run dev-log:pre-push -- --slug initial-setup
npm run condense:all
npm run new:module -- my-feature --label "My Feature"
```

## What ships in this template

- `_reference` + `model-condenser` modules (no domain logic)
- File exchange, work-log dev logs (human + agent), contract manifest v001
- CI workflow (`.github/workflows/ci.yml`), trace ID helper
- Lint and condense tooling for trees, prompts, and schemas

Built with [@pukujan/create-modular-monolith](https://github.com/Pukujan/create-modular-monolith).
