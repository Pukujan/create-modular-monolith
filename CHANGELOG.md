# Changelog

All notable changes to `@pukujan/create-modular-monolith` are documented here.

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
