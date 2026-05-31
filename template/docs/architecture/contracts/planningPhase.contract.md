# planningPhase contract

**Version:** v001  
**Code:** `backend/src/shared/contracts/planningPhase.contract.js`

## Purpose

Audit trail **before** implementation:

1. **Study log** — `work-log/planning/{NNN}_*_study-log_{slug}.md` (You raw + Cursor summary per turn; see `.cursor/commands/planning-study-log.md`)
2. **Design** (optional) — `work-log/planning/{NNN}_*_design_{slug}.md`
3. **Plan package** — `work-log/planning/{NNN}_*_plan_{slug}*.md`
4. **Manifest** — `work-log/planning/{planId}.json` via `npm run plan:finalize` (links all three paths)

## Gate

Run `npm run plan:gate -- --slug <slug>` before executing a tier-L plan.

CLI flags are parsed safely when `--plan-id` is omitted (defaults to `--slug`, not `process.argv[0]`).

## API

`GET /api/platform/planning/:planId/download?format=md`
