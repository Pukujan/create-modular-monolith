# Agent instructions (Cursor / automation)

Repo-wide rules for AI agents. Module-specific rules live under `.agents/rules/`.

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

Prompt and reference image live under **`file-exchange/imports/{stamp}/trialworks_figma_mcp_prompt/`** (manifest: `import-manifest.json` inside that bundle). No prompt files at repo root or `imports/` root. Agent rule: `.agents/rules/figma-mcp-imports.mdc`. Command: `.agents/commands/figma-mcp-trialworks.md`.

## Planning before implementation

Before building a tier-L feature:

1. Create a **phase folder** `work-log/planning/{NNN}_{date}_{time}_{slug}/` — see `.agents/commands/planning-plan-package.md`
2. Write **plan-log.md** (build spec) and **audit-log.md** (gap/spec audit) inside that folder
3. Finalize and gate:

```bash
npm run plan:finalize -- --slug <plan-slug> [--plan-id <id>]
npm run plan:gate -- --slug <plan-slug> [--plan-id <id>]
```

Manifest → `{phase-folder}/manifest.json`. See [planningPhase contract](docs/architecture/contracts/planningPhase.contract.md).

**Do not** read or write `work-log/study-docs/` — study logs are user-owned personal notes (`.agents/rules/study-log-user-only.mdc`).

## Pre-push dev log (push gate)

When the user asks to **commit and push** (or only **push**), **never push first**. Write paired dev logs, verify, then commit, then push.

Agent rule: `.agents/rules/pre-push-dev-log-gate.mdc` (always applied).

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

Paired logs: `work-log/dev-logs/human/` + `work-log/dev-logs/agent/`. See `.agents/commands/pre-push-dev-log.md`.

## Architecture checks

```bash
npm run lint:architecture
npm run lint:contracts
npm run lint:repo-artifacts
npm run lint:api-docs
```

## Work log

Planning phase folders and dev-logs under `work-log/` per [work-log/README.md](work-log/README.md). Pre-push dev-logs record what shipped.

## Context window management

**Hard limit:** If context usage approaches ~35k tokens, STOP and compact immediately:
1. Write a concise session summary to `work-log/sessions/{YYYY-MM-DD}-{slug}.md`
2. Update `MEMORY.md` to current state only
3. Ask the user to start a new session

**Read discipline:** Never read large files or multiple files if not strictly necessary. Prefer `grep`/`glob` over `read`. Minimize tool calls that consume context.

## Session memory (cross-session persistence)

**On session start:** Read `MEMORY.md` to restore project context.

**On session end:** Archive session details to `work-log/sessions/{YYYY-MM-DD}-{slug}.md`, update `work-log/sessions/INDEX.md`, then prune `MEMORY.md` to current state only (remove completed items, keep next steps and guardrails).
