# @pukujan/context-engineering

Standalone npm package for agent memory, hard state management, token budgeting, and optional phase-builder addon.

No Express/React scaffold, no architecture contracts, no template enforcement — use [@pukujan/create-modular-monolith](https://github.com/Pukujan/create-modular-monolith) on `main` for the full modular monolith.

## Install

```bash
npm install -g @pukujan/context-engineering
```

Or run without installing:

```bash
npx @pukujan/context-engineering init
npx @pukujan/context-engineering init --phase-builder
```

## Usage

```bash
context-engineering init --phase-builder
python3 scripts/measure_context.py --tokens 0 --start-session
python3 scripts/render_memory.py
```

Re-run safely on existing projects (resolves `{{placeholders}}`, syncs scripts, renders MEMORY.md):

```bash
context-engineering init --phase-builder
```

Copies templates into your **project root** with variable substitution (`{{DATE}}`, `{{BRANCH}}`, `{{COMMIT}}`, `{{TOKEN_LIMIT}}`).

## What it scaffolds

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Agent rules and memory workflow |
| `MEMORY.md` | Read-only session view (regenerated) |
| `buildplan/agent_state.json` | Hard state source of truth |
| `buildplan/context_budget.json` | 30k token budget tracker |
| `scripts/measure_context.py` | Token limit enforcement |
| `scripts/render_memory.py` | MEMORY.md generator |
| `scripts/check_gate.py` | Phase transition gate (optional lint if host has `lint:architecture`) |
| `work-log/` | Session archive structure |
| `phase_builder/` | Optional addon (`--phase-builder`) |

## Relationship to create-modular-monolith

| Package | Branch | Scope |
|---------|--------|-------|
| `@pukujan/create-modular-monolith` | `main` | Full scaffold: Express + React, contracts, lint gates, `additional-modules/` layout |
| `@pukujan/context-engineering` | `context-engineering` | Memory + budgeting only; writes to project root |

The monolith embeds this package under `additional-modules/context-engineering/` and uses nested paths (`additional-modules/buildplan/`, etc.). This standalone package uses root-level paths instead.

## Requirements

- Node >= 20
- Python >= 3.10
