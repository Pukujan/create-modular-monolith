# @pukujan/create-modular-monolith

**npm create** scaffold for a modular monolith built for **human + agent** engineering at scale.

```bash
npm create @pukujan/modular-monolith@2.2.0 my-platform
cd my-platform
npm install --prefix backend && npm install --prefix frontend
```

Published package: `@pukujan/create-modular-monolith`  
Product reference implementation: [litigation-prompt-engineering](https://github.com/Pukujan/litigation-prompt-engineering)

---

## What you get

This is **not** a minimal Express/React demo. It is an **architecture platform**:

| Layer | Purpose |
|-------|---------|
| **Module contract** | Backend `register(app)` + frontend route modules — add features without rewriting core |
| **Architecture contracts** | Versioned manifest (`docs/architecture/contracts/`) — paths, APIs, exports, dev logs |
| **File exchange** | Dated `imports/` / `exports/` for human↔agent file handoff |
| **Pre-push dev logs** | Paired **human markdown** (summary + detail, mermaid, TOC) + **agent JSON** audit |
| **Consolidated snapshots** | `condense:all` → models, prompts, file tree in `file-exchange/exports/` |
| **Lint automation** | Boundaries, layers, contracts, repo artifacts, API registry |
| **Cursor-native** | `AGENTS.md`, `.cursor/rules`, `.cursor/commands` for repeatable agent workflows |

Domain business logic is **yours to add** via `npm run new:module`. The repo ships with `_reference` and `model-condenser` only.

---

## Why this architecture exists

Modern products are built as much by **agents** as by humans. This template encodes:

1. **Discoverability** — Agents read JSON audits and contract manifests instead of guessing folder layout.
2. **Repeatability** — Every push can produce the same artifact set (dev log pair, tree, API inventory, test results).
3. **Scale** — New modules plug in under `backend/src/modules/` and `frontend/src/modules/` with enforced boundaries.
4. **Governance** — `lint:contracts` fails CI if a contract path is missing; `lint:api-docs` keeps routes documented.

Read **`template/docs/architecture/PLATFORM_ARCHITECTURE.md`** (in this repo) for the full narrative. After scaffold, start at **`docs/architecture/CONTRACTS_OVERVIEW.md`** in your project.

---

## Repository layout (this GitHub repo)

```text
create-modular-monolith/
  README.md              ← you are here (npm package docs)
  package.json           ← @pukujan/create-modular-monolith
  index.js               ← copies template/ into target directory
  template/              ← full starter app (architecture only)
```

---

## Architecture scripts (in every scaffolded project)

These live under `template/scripts/` and are copied into new projects:

| Script | npm command | Role |
|--------|-------------|------|
| `lint-contracts.mjs` | `npm run lint:contracts` | Verify `manifest.json` paths exist |
| `lint-repo-artifacts.mjs` | `npm run lint:repo-artifacts` | Verify exchange, dev-log, contract docs |
| `check-api-docs.mjs` | `npm run lint:api-docs` | Routes ⊆ `docs/API.md` registry |
| `write-pre-push-dev-log.mjs` | `npm run dev-log:pre-push` | Human + agent pre-push audit pair |
| `verify-dev-log.mjs` | `npm run dev-log:verify` | Validate latest dev-log structure |
| `condense-file-structure.mjs` | `npm run condense-file-structure` | Repo tree → `exports/consolidated-file-structure.json` |
| `condense-prompts.mjs` | `npm run condense-prompts` | All prompts → consolidated JSON |
| `import-to-file-exchange.mjs` | `npm run import:file-exchange` | Inbound bundles → `imports/{stamp}/` |
| `new-module.mjs` | `npm run new:module` | Scaffold backend + frontend module |

Scaffolded projects also ship **`npm run test:ci`**, **`.github/workflows/ci.yml`**, **`traceId.js`**, and **[EVAL_AND_CI.md](template/docs/architecture/EVAL_AND_CI.md)** (gates + per-case golden guidance).

Supporting libraries: `scripts/lib/repo-tree.mjs`, `api-inventory.mjs`, `dev-log-human-format.mjs`, `git-snapshot.mjs`, `run-tests.mjs`.

---

## Contract catalog (v001)

Registered in `template/docs/architecture/contracts/manifest.json`:

- **fileExchange** — dated imports/exports, human-readable stamps
- **consolidatedExports** — snapshot JSON in `file-exchange/exports/`
- **prePushDevLog** — paired human MD + agent JSON before push
- **apiDocumentationRegistry** — `docs/API.md` as HTTP source of truth
- **repoArtifactLayout** — canonical data roots

Module-level contracts (storage layout, pipeline versions) are added when you build domain modules.

---

## Publishing this package

```bash
cd packages/create-modular-monolith   # or repo root if package.json is here
npm version patch|minor|major
npm publish --access public
```

Users install with:

```bash
npm create @pukujan/modular-monolith@2 <folder-name>
```

---

## Version

Package version tracks **architecture platform** releases (contracts, agent tooling, template layout).  
See `package.json` and git tags. Domain app code lives in separate product repos.
