# Planning

One **plan folder** per planning phase — dated, timestamped, short slug summary. Parent: [work-log](../README.md).

Implementation specs stay in **[../handoffs/](../handoffs/)**.

## Layout

```text
work-log/planning/
  006_2026-05-31_14-30_cursor-planning-phase/
    audit-log.md     ← Cursor conversation (planningPhase audit)
    plan.md          ← plan package — what to build
    design.md        ← optional
  006_2026-05-31_14-30_cursor-planning-phase.json   ← manifest (plan:finalize)
```

Folder name: `{NNN}_{YYYY-MM-DD}_{HH-MM}_{slug}` (UTC from `formatWorkLogTimestamp`).

Default `--plan-id` for finalize/gate = folder name (without `.json`).

## Workflow

1. Create folder + `audit-log.md` + `plan.md` ([planning-audit-log](../../.cursor/commands/planning-audit-log.md))
2. Optional `design.md`
3. `npm run plan:finalize -- --slug {slug}`
4. `npm run plan:gate -- --slug {slug}` before tier-L implementation

## Study logs

Personal notes live in **[../study-logs/](../study-logs/)** — **not** used by agents or `plan:gate`.

Legacy flat files at `planning/*_audit-log_*` still resolve for migration.

Full index: [../INDEX.md](../INDEX.md).
