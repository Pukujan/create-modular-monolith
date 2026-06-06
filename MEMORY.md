# MEMORY.md - Persistent Context

**Last updated:** 2026-06-06
**Branch:** context-engineering
**Latest commit:** 2443f85 feat: extract context-engineering scaffold package

---

## PROJECT OVERVIEW

`@pukujan/context-engineering` - Reusable npm package for scaffolding agent memory, hard state management, token budgeting, and lint gates. Package lives at repo root on the dedicated `context-engineering` branch. No monolith code.

---

## ARCHITECTURE GUARDRAILS

### Module Contract
Package CLI exposes `init` command. `lib/init.js` copies templates with `{{VAR}}` substitution. Python scripts default to repo root paths.

### Boundary Rules
- `context-engineering` branch is dedicated exclusively to this scaffold package.
- `MEMORY.md` is read-only; agent writes to `agent_state.json`.
- Templates use `{{DATE}}`, `{{BRANCH}}`, `{{COMMIT}}`, `{{TOKEN_LIMIT}}` substitution.

### Enforcement
- `scripts/measure_context.py`: Hard 24k token limit, atomic writes, aborts with exit 1.
- `scripts/check_gate.py`: Runs `npm run lint:architecture` from repo root.
- `scripts/render_memory.py`: Generates MEMORY.md from agent_state.json.

---

## SESSION ARCHIVES

Index: `work-log/sessions/INDEX.md`
(None yet)

## AGENT RULES
- Hard 24000 token limit with compact procedure
- Session memory: read MEMORY.md on start, archive + prune on end
- Terse bullets, no prose
