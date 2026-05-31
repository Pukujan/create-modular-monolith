# Agent instructions (Cursor / automation)

Repo-wide rules for AI agents. Module-specific rules live under `.cursor/rules/`.

## Mandatory: file-exchange before processing inbound files

Copy user bundles into a dated import folder before processing:

```bash
npm run import:file-exchange -- "/path/to/bundle"
```

Stamp format: `2026-05-23_15-59-43Z` via `formatExchangeTimestamp` in `backend/src/shared/utils/formatExchangeTimestamp.js`.

Deliverables → `file-exchange/exports/{stamp}/`. Consolidated snapshots → `file-exchange/exports/consolidated-*.json` (`npm run condense:all`).

See [file-exchange/README.md](file-exchange/README.md) and [docs/architecture/CONTRACTS_OVERVIEW.md](docs/architecture/CONTRACTS_OVERVIEW.md).

## Planning before implementation

Before building a tier-L feature:

1. Create a **plan folder** `work-log/planning/{NNN}_{date}_{time}_{slug}/` with:
   - `audit-log.md` — planning conversation (You raw + Cursor summary) — see `.cursor/commands/planning-audit-log.md`
   - `plan.md` — plan package for implementers
   - `design.md` — optional
2. Finalize and gate:

```bash
npm run plan:finalize -- --slug <plan-slug> [--plan-id <id>]
npm run plan:gate -- --slug <plan-slug> [--plan-id <id>]
```

Default `--plan-id` = plan folder name. Manifest → `work-log/planning/{planId}.json`.

**Study logs** (`work-log/study-logs/`) are owner-only — agents must not read or write them.

See [planningPhase contract](docs/architecture/contracts/planningPhase.contract.md).

## Pre-push dev log

When the user asks you to **push**, use **`npm run agent:push`** (creates dev logs, fills them, commits, pushes). Do not run bare `git push`.

```bash
npm run agent:push -- --slug <topic>
# fill FILL sections if exit 2
npm run agent:push -- --slug <topic> --commit
```

Manual dev log only (no push): `npm run dev-log:pre-push -- --slug <topic>` · verify: `npm run dev-log:verify`

**Enforcement:** `.cursor/hooks.json` blocks bare agent `git push`. Terminal pushes by the user are not blocked.

## Architecture checks

```bash
npm run lint:architecture
npm run lint:contracts
npm run lint:repo-artifacts
npm run lint:api-docs
```

## Work log

Planning audit logs, plan packages, and planning manifests under `work-log/planning/` per [work-log/README.md](work-log/README.md). Study logs under `work-log/study-logs/` are owner-only. Pre-push dev-logs record what shipped.
