# Work log

Planning artifacts for this repo: **what to build** (handoffs) and **how we decided** (planning).

```text
work-log/
  README.md       ← you are here
  INDEX.md        ← full index (handoffs + planning + dev-logs + checkpoints)
  handoffs/       ← numbered specs, starter packs (002, 005, …)
  planning/       ← study logs, plan packages, and plan:finalize JSON manifests — BEFORE build
  checkpoints/    ← runtime proof only (e.g. batch-002 eval evidence), not conversation
  dev-logs/       ← pre-push audit: human/ + agent/ (paired per push) — what shipped
  architecture-push-logs/  ← npm export to create-modular-monolith only (separate from dev-logs)
```

## When to use which folder

| Folder | Put here |
|--------|----------|
| **handoffs/** | Implementation specs, second/third handoffs, starter pack snapshots |
| **planning/** | **Plan + conversation** — study logs (`You` verbatim + `Cursor` summary), plan packages, and finalize manifests; write **before** implementation ([planning-study-log](../.cursor/commands/planning-study-log.md)) |
| **checkpoints/** | Post-run evidence (batch evals, pass/fail tables) — supplements study log, does not replace it |
| **dev-logs/** | What shipped — **paired human MD + agent JSON** before each product push |
| **architecture-push-logs/** | Platform/npm sync — paired logs before pushing [create-modular-monolith](https://github.com/Pukujan/create-modular-monolith) |

## Filename convention (all three folders)

```text
{NNN}_{YYYY-MM-DD}_{HH-MM}_{kind}_{short-slug}.md
```

| Folder | `kind` value | Example |
|--------|----------------|---------|
| handoffs/ | `handoff`, `handoff-v2`, `handoff-original`, … | `005_2026-05-23_10-49_handoff-original_…` |
| planning/ | `study-log`, `design`, `plan` | `006_2026-05-23_11-21_study-log_cursor-planning-phase` |
| dev-logs/ | `dev-log` (fixed) | `001_2026-05-24_14-30_dev-log_work-log-reorg` |

Details: [handoffs/README.md](./handoffs/README.md) · [planning/README.md](./planning/README.md) · [dev-logs/README.md](./dev-logs/README.md) · [architecture-push-logs/README.md](./architecture-push-logs/README.md)

## 005 program order

1. Original spec → [handoffs/005_…_handoff-original_…](./handoffs/005_2026-05-23_10-49_handoff-original_parsed-cache-rule-authority.md)
2. v3 architecture → [handoffs/005_…_handoff-v3_…](./handoffs/005_2026-05-23_11-20_handoff-v3_filing-structure-architecture.md)
3. v2 pipeline → [handoffs/005_…_handoff-v2_…](./handoffs/005_2026-05-23_11-14_handoff-v2_planned-review-in-cursor.md)
