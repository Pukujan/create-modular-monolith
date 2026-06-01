# Agent instructions (Cursor / automation)

Repo-wide rules for AI agents. Module-specific rules live under `.cursor/rules/`.

## Mandatory: file-exchange before processing inbound files

Copy user bundles into a dated import folder before processing:

```bash
npm run import:file-exchange -- "/path/to/bundle"
```

If the bundle sits at **repo root**, the script removes it after a successful import (see [fileExchange contract](docs/architecture/contracts/fileExchange.contract.md)). Work only from `file-exchange/imports/{stamp}/` afterward.

Stamp format: `2026-05-23_15-59-43Z` via `formatExchangeTimestamp` in `backend/src/shared/utils/formatExchangeTimestamp.js`.

Deliverables → `file-exchange/exports/{stamp}/`. Consolidated snapshots → `file-exchange/exports/consolidated-*.json` (`npm run condense:all`).

See [file-exchange/README.md](file-exchange/README.md) and [docs/architecture/CONTRACTS_OVERVIEW.md](docs/architecture/CONTRACTS_OVERVIEW.md).

## Figma MCP (TrialWorks UI)

Prompt and reference image live under **`file-exchange/imports/{stamp}/trialworks_figma_mcp_prompt/`** (manifest: `import-manifest.json` inside that bundle). No prompt files at repo root or `imports/` root. Cursor rule: `.cursor/rules/figma-mcp-imports.mdc`. Command: `.cursor/commands/figma-mcp-trialworks.md`.

## Planning before implementation

Before building a tier-L feature:

1. Create a **phase folder** `work-log/planning/{NNN}_{date}_{time}_{slug}/` — see `.cursor/commands/planning-plan-package.md`
2. Write **plan-log.md** (build spec) and **audit-log.md** (gap/spec audit) inside that folder
3. Finalize and gate:

```bash
npm run plan:finalize -- --slug <plan-slug> [--plan-id <id>]
npm run plan:gate -- --slug <plan-slug> [--plan-id <id>]
```

Manifest → `{phase-folder}/manifest.json`. See [planningPhase contract](docs/architecture/contracts/planningPhase.contract.md).

**Do not** read or write `work-log/study-docs/` — study logs are user-owned personal notes (`.cursor/rules/study-log-user-only.mdc`).

## Pre-push dev log (push gate)

When the user asks to **commit and push** (or only **push**), **never push first**. Write paired dev logs, verify, then commit, then push.

Cursor rule: `.cursor/rules/pre-push-dev-log-gate.mdc` (always applied).

```bash
# 1. Generate + fill human + agent logs; update work-log/INDEX.md
npm run dev-log:pre-push -- --slug <topic> --program <NNN>

# 2. Verify filled logs
npm run dev-log:verify

# 3. Commit (include dev logs + INDEX)

# 4. Align agent log SHA with HEAD after commit
npm run dev-log:sync-head -- --latest

# 5. Gate check, then push
npm run dev-log:pre-push -- --check
git push
```

Optional local hook: `npm run dev-log:install-hook` (runs verify + `--check` on every push).

Paired logs: `work-log/dev-logs/human/` + `work-log/dev-logs/agent/`. See `.cursor/commands/pre-push-dev-log.md`.

## Architecture checks

```bash
npm run lint:architecture
npm run lint:contracts
npm run lint:repo-artifacts
npm run lint:api-docs
```

## Work log

Planning phase folders and dev-logs under `work-log/` per [work-log/README.md](work-log/README.md). Pre-push dev-logs record what shipped.
