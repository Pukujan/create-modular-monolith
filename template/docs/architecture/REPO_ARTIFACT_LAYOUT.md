# Repository artifact layout

Canonical paths for platform artifacts and human↔agent exchange.

## Roots

| Root | Writable at runtime | Purpose |
|------|---------------------|---------|
| `file-exchange/imports\|exports/` | Yes | Dated human↔agent handoff |
| `work-log/dev-logs/human\|agent/` | Yes | Pre-push audit pairs |
| `models/consolidated-*.json` | Yes | Mirror of `file-exchange/exports/consolidated-*.json` |
| `work-log/handoffs/` | Yes | Session handoffs (markdown) |
| `data/` | Yes | **Your** domain runtime data (gitignore by default) |
| `evals/golden/{caseId}/` | Optional | Per-case regression fixtures when you add them |

## File exchange

Imports: `file-exchange/imports/{2026-05-23_15-59-43Z}/`  
Session exports: `file-exchange/exports/{stamp}/`  
Consolidated snapshots: `file-exchange/exports/consolidated-*.json`

See [file-exchange/README.md](../../file-exchange/README.md).

## Pre-push dev logs

```text
work-log/dev-logs/human/{NNN}_{date}_{time}_dev-log_{slug}.md
work-log/dev-logs/agent/{NNN}_{date}_{time}_dev-log-agent_{slug}.json
```

## Domain modules

When you add features with `npm run new:module`, colocate runtime data under `data/<module>/` and optional `evals/golden/` per [EVAL_AND_CI.md](./EVAL_AND_CI.md).
