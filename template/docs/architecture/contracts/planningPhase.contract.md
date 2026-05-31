# planningPhase contract

**Version:** v001  
**Code:** `backend/src/shared/contracts/planningPhase.contract.js`

## Purpose

Audit trail **before** implementation. Each planning phase lives in one **dated folder**:

```text
work-log/planning/{NNN}_{YYYY-MM-DD}_{HH-MM}_{slug}/
  audit-log.md    ← Cursor conversation (You raw + Cursor summary)
  plan.md         ← plan package for implementers
  design.md       ← optional
work-log/planning/{planId}.json   ← manifest (npm run plan:finalize)
```

See `.cursor/commands/planning-audit-log.md`.

> **Study logs are separate.** Personal notes live in `work-log/study-logs/` — **not** used by agents or `plan:gate`. Legacy flat `*_audit-log_*` / `*_study-log_*` files at `planning/` root still resolve for migration.

## Gate

Run `npm run plan:gate -- --slug <slug>` before executing a tier-L plan.

CLI flags are parsed safely when `--plan-id` is omitted (defaults to folder name or `--slug`, not `process.argv[0]`).

## API

`GET /api/platform/planning/:planId/download?format=md`
