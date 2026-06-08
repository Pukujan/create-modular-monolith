# @pukujan/context-engineering

Standalone npm package for agent memory, hard state management, **28k warn-only** token budgeting, optional phase-builder, and OpenCode compaction config.

No Express/React scaffold, no architecture contracts — use [@pukujan/create-modular-monolith](https://github.com/Pukujan/create-modular-monolith) on `main` for the full modular monolith.

## What's new in 2.2.1: compaction thresholds, checksums, OpenCode fix

Version 2.2.1 ports the same fixes from create-modular-monolith 2.6.4, adapted for standalone root-level paths:

- `context_budget.json` includes `warningAt` / `compactAt` / `stopAt` thresholds and a compaction strategy
- `init` writes and patches `agent_state.sha256`; `render_memory.py` refreshes the checksum on every render
- Fixed broken OpenCode discovery text in `AGENTS.md`
- `init --opencode` writes `opencode.json` to the **project root** (OpenCode auto-discovery — no symlink needed)
- Re-run `init` patches missing thresholds on existing projects; warns when `opencode.json` is absent
- Standalone `agent_state.json` no longer references monolith-only registry paths

```bash
npm install -g @pukujan/context-engineering@2.2.1
# or
npx @pukujan/context-engineering@2.2.1 init --phase-builder --opencode
```

## Install

```bash
npm install -g @pukujan/context-engineering
```

Or run without installing:

```bash
npx @pukujan/context-engineering init --phase-builder --opencode
```

## Usage

```bash
context-engineering init --phase-builder --opencode
python3 scripts/measure_context.py --tokens 0 --start-session
python3 scripts/render_memory.py
python3 scripts/measure_context.py --status
```

Re-run safely on existing projects (resolves `{{placeholders}}`, syncs scripts, renders `MEMORY.md`):

```bash
context-engineering init --phase-builder --opencode
```

Copies templates into your **project root** with variable substitution (`{{DATE}}`, `{{BRANCH}}`, `{{COMMIT}}`, `{{TOKEN_LIMIT}}`).

## What it scaffolds

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Agent rules and memory workflow |
| `MEMORY.md` | Read-only session view (regenerated) |
| `buildplan/agent_state.json` | Hard state source of truth |
| `buildplan/agent_state.sha256` | Integrity checksum (auto-written by init/render) |
| `buildplan/context_budget.json` | 28k token budget tracker with compaction thresholds (warn-only) |
| `scripts/measure_context.py` | Token budget warnings — never aborts |
| `scripts/render_memory.py` | MEMORY.md generator |
| `scripts/check_gate.py` | Phase transition gate (optional lint if host has `lint:architecture`) |
| `work-log/` | Session archive structure |
| `phase_builder/` | Optional addon (`--phase-builder`) |
| `opencode.json` | Optional OpenCode compaction config (`--opencode`) |

## OpenCode (live compaction)

| System | Role |
|---|---|
| **OpenCode** (`opencode.json`) | Auto-compact before overflow in the current chat |
| **This package** (`measure_context.py`, `MEMORY.md`) | Cross-session memory and budget tracking |

Shared **28k ceiling** — compact around **25.2k** (90%). Shipped `compaction.reserved: 3472` with `limit.context: 28672` on your provider model (see `AGENTS.md` after init).

`init --opencode` writes `opencode.json` to the **project root** so OpenCode discovers it automatically.

## Phase-builder tests

Source and tests ship in the npm package under `additional-modules/phase-builder/` (package layout only — not copied to your project):

```bash
cd node_modules/@pukujan/context-engineering/additional-modules/phase-builder
python3 -m venv .venv && .venv/bin/pip install pytest && .venv/bin/pytest
```

After `init --phase-builder`, runtime code is copied to `phase_builder/` in your project root.

## Relationship to create-modular-monolith

| Package | Branch | Scope |
|---------|--------|-------|
| `@pukujan/create-modular-monolith` | `main` | Full scaffold: Express + React, contracts, `additional-modules/` layout |
| `@pukujan/context-engineering` | `context-engineering` | Memory + budgeting only; writes to project root |

The monolith embeds this package under `additional-modules/context-engineering/` and uses nested paths (`additional-modules/buildplan/`, etc.). This standalone package uses root-level paths instead.

## Requirements

- Node >= 20
- Python >= 3.10

## Changelog

### 2.2.1 (2026-06-08)

- `context_budget.json` includes warning/compact/stop thresholds and compaction strategy
- Fixed broken OpenCode discovery text in `AGENTS.md` template
- Re-run `init` patches missing compaction thresholds and writes `agent_state.sha256`
- `render_memory.py` updates checksum when regenerating `MEMORY.md`
- Standalone `agent_state.json` no longer references monolith-only registry paths

### 2.2.0 (2026-06-08)

- 28k token ceiling aligned across measure_context, buildplan, and phase-builder
- `init --opencode` writes project-root `opencode.json`
- Fixed phase-builder pytest path in init next-steps
- Warn-only budget (exit 0 always)

### 2.1.1

- Init re-run on existing projects; `--status` and `--archive-session`

## License

MIT — Copyright (c) 2026 Pukujan.
