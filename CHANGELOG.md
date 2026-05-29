# Changelog

All notable changes to `@pukujan/create-modular-monolith` are documented here.

## [2.3.0] - 2026-05-29

### Added

- **Architecture contracts (v001)** — `documentPersistence`, `moduleAgentStateMachine`, `asyncJobQueue` in `manifest.json` with implementation templates under `docs/architecture/templates/`
- **Shared agent runtime** — `backend/src/shared/agent-runtime/createAgentRuntime.js` + tests
- **Document storage helpers** — `resolveDocumentStoragePaths.js` + tests; `data/uploads/.gitkeep`
- **`npm run condense-contracts`** — bundles all manifest contracts into `file-exchange/exports/consolidated-contracts.json` (wired into `condense:all`)
- **`local-artifacts.example.json`** — optional external artifact root + layout keys
- **Module scaffold** — `agents/` layer in `new:module` output; `lint:layers` recognizes `agents/`

### Changed

- **CONTRACTS_OVERVIEW** — starter catalog lists 9 manifest IDs only; product-only contracts moved out of boilerplate table
- **condense-contracts** — repo-relative paths in export JSON; `repositoryRoot: "."`
- **architecturePushDevLog** — documented as maintainer-repo-only (not in starter `manifest.json`)
- Frontend starter — removed default `index.css` / `className` styling from reference module shell

### Notes

- Contracts are **spec + templates** only — no `documents` module, BullMQ deps, or upload API wired in yet (Phase 1 is your project’s job).

## [2.2.5] - 2026-05-24

### Added

- **Planning gate** — `plan:finalize`, `plan:gate`, `work-log/planning/` manifests; study log required before build (`planningPhase` contract)
- **Architecture push logs** — `arch-log:push` / `arch-log:verify` contract docs in template (product repo runs export audit)
- `formatHumanReadableUtc` for work-log headers; `fileExchangeCleanup`, `zipDirectory` platform utils
- Starter templates: planning study-log command, updated `AGENTS.md` and work-log README

### Changed

- Export script sync from `legal-prmpt-eng` @ `d696d6e` (planning + arch-push contracts)

## [2.2.3] - 2026-05-23

### Fixed

- Removed litigation-domain consolidated artifacts and model condenser from template
- Starter export: generic prompts condenser, platform-only model inventory, `treeText`-only file structure
- `TREE_IGNORE_PREFIXES` in starter is `["data"]` only (not product batch paths)

## [2.2.2] - 2026-05-23

### Fixed

- `node --test` without shell globs — fixes CI on Linux (quoted `**` paths are literal on Ubuntu)

## [2.2.1] - 2026-05-23

### Changed

- Replaced MIT with **Pukujan Modular Monolith Platform License** (proprietary, all rights reserved)
- Required attribution when retaining substantial platform files from the template
- Scaffold now includes `template/LICENSE` and `template/NOTICE` for generated projects

## [2.2.0] - 2026-05-23

### Added

- Template: GitHub Actions CI (`.github/workflows/ci.yml`) and `npm run test:ci`
- `docs/architecture/EVAL_AND_CI.md` — gates, regression, golden-is-per-case (not universal)
- `backend/src/shared/utils/traceId.js` for batch/document correlation
- `model-condenser` exempt from false-positive boundary lint (path inventory strings)

### Changed

- Synced platform scripts and docs from litigation-prompt-engineering (architecture layer only)
- Generic `api-inventory.mjs` and `condense-prompts.mjs` (no case-filing-ai dependency)
- Starter `lint:repo-artifacts` paths for platform-only layout

## [2.1.0] - 2026-05-23

### Added

- Architecture-only template: `_reference`, `model-condenser`, no domain modules
- `docs/architecture/PLATFORM_ARCHITECTURE.md` — agent-scale platform narrative
- Contract manifest v001: file exchange, consolidated exports, pre-push dev logs, API registry
- Scripts: `lint:contracts`, `dev-log:pre-push`, `condense:all`, `import:file-exchange`, `new:module`
- Cursor: `AGENTS.md`, `.cursor/rules`, `.cursor/commands/pre-push-dev-log.md`
- Generic `api-inventory.mjs` (no domain pipeline imports)

### Changed

- Bumped from 2.0.0 — aligns with litigation-prompt-engineering v3 architecture platform

## [2.0.0]

- Initial npm publish (minimal template)
