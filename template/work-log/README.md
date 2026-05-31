# Work log

Planning artifacts for this repo: **what to build** (handoffs) and **how we decided** (planning folders).

```text
work-log/
  README.md
  INDEX.md
  handoffs/           ← implementation specs
  planning/           ← one folder per phase: audit-log.md + plan.md (+ manifest JSON)
  study-logs/         ← owner-only portfolio notes (agents must not touch)
  checkpoints/        ← runtime proof
  dev-logs/           ← pre-push: what shipped
  architecture-push-logs/
```

## Planning phase folder

Each plan is a **dated folder** inside `planning/`:

```text
planning/{NNN}_{YYYY-MM-DD}_{HH-MM}_{short-slug}/
  audit-log.md    ← Cursor planning conversation (agents write here)
  plan.md         ← plan package
  design.md       ← optional
```

Manifest: `planning/{folder-name}.json` from `npm run plan:finalize`.

## Artifact roles

| Artifact | Location | Agents? | Gate? |
|----------|----------|---------|-------|
| **Planning audit log** | `planning/…/audit-log.md` | Yes | `plan:gate` |
| **Plan package** | `planning/…/plan.md` | Yes | `plan:gate` |
| **Study log** | `study-logs/` | **No — owner only** | No |
| **Dev log** | `dev-logs/` | Yes (push) | Agent push hook |

## When to use which folder

| Folder | Put here |
|--------|----------|
| **handoffs/** | Implementation specs, starter packs |
| **planning/** | Dated plan folders before build ([planning-audit-log](../.cursor/commands/planning-audit-log.md)) |
| **study-logs/** | Your personal study / portfolio notes — **not for Cursor** |
| **checkpoints/** | Batch eval evidence |
| **dev-logs/** | Paired human + agent audit per push |

Details: [handoffs](./handoffs/README.md) · [planning](./planning/README.md) · [study-logs](./study-logs/README.md) · [dev-logs](./dev-logs/README.md)

## 005 program order

1. [Original handoff](./handoffs/005_2026-05-23_10-49_handoff-original_parsed-cache-rule-authority.md)
2. [v3 architecture](./handoffs/005_2026-05-23_11-20_handoff-v3_filing-structure-architecture.md)
3. [v2 pipeline](./handoffs/005_2026-05-23_11-14_handoff-v2_planned-review-in-cursor.md)
