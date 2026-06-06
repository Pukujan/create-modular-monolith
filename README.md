# @pukujan/context-engineering

Reusable scaffold for agent memory, hard state management, token budgeting, and lint gates.

## Install

```bash
npm install -g @pukujan/context-engineering
```

## Usage

```bash
context-engineering init
```

Copies templates into your project with variable substitution (`{{DATE}}`, `{{BRANCH}}`, `{{COMMIT}}`, `{{TOKEN_LIMIT}}`).

## What it scaffolds

- `AGENTS.md` - Agent rules and guardrails
- `MEMORY.md` - Persistent session memory
- `buildplan/agent_state.json` - Hard state file
- `buildplan/context_budget.json` - Token budget config
- `scripts/measure_context.py` - Token limit enforcement
- `scripts/render_memory.py` - MEMORY.md generator
- `scripts/check_gate.py` - Lint gate enforcement
- `work-log/` - Session archive structure

## Requirements

- Node >= 20
- Python >= 3.10
