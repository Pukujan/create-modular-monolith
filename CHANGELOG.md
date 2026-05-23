# Changelog

All notable changes to `@pukujan/create-modular-monolith` are documented here.

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
