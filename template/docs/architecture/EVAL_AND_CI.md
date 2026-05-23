# Evals, regression, and CI gates

Plain-language guide for **domain-agnostic** projects scaffolded from this template.

---

## What is a “gate”?

A **gate** is an automatic check that must pass before code is merged.

| Gate | What it blocks |
|------|----------------|
| `npm run lint:contracts` | Broken contract paths in `manifest.json` |
| `npm run lint:repo-artifacts` | Missing platform folders (file-exchange, dev-logs, …) |
| `npm run lint:architecture` | Module boundary / layer / API doc violations |
| `npm test` | Unit/integration failures |
| `npm run test:evals` | Module `evals/runners/*.eval.mjs` failures |

GitHub Actions runs these on push/PR (see `.github/workflows/ci.yml`). Locally: **`npm run test:ci`**.

---

## What is “eval / regression”?

**Eval** = automated check that output meets expectations.

**Regression** = re-run evals after a change to catch quality going **down**.

### Golden data is per domain case — not universal

Every product case is different (different users, documents, rules). You **do not** ship one golden dataset for all future cases.

| Pattern | When to use |
|---------|-------------|
| **Module example evals** | Shipped in `_reference` — smoke tests, no API keys |
| **Optional `evals/golden/{caseId}/`** | When **you** curate expected JSON for one fixed regression case |
| **Live runs only** | New cases with no golden yet — process, review, optionally add golden later |

Golden answers the question: *“On **this** known fixture, did we get worse than last time?”*  
Not: *“We already know the truth for every new case.”*

When you add a domain module (`npm run new:module`), add `evals/runners/` and optional `evals/golden/` for cases you control.

---

## Trace IDs (observability)

Use `backend/src/shared/utils/traceId.js` in long-running workflows:

```js
import { createTraceId, docTraceId } from "../shared/utils/traceId.js";

const batchTraceId = createTraceId("batch_my-job");
const traceId = docTraceId(batchTraceId, 1);
```

Log both IDs in JSONL or structured logs so agents and humans can correlate steps. Plug the same IDs into Langfuse/OpenTelemetry later if needed.

---

## CI workflow

`.github/workflows/ci.yml`:

1. Install backend + frontend  
2. `lint:contracts` · `lint:repo-artifacts` · `lint:architecture`  
3. `npm test` · `npm run test:evals`

---

## Adding domain evals

```bash
npm run new:module -- billing --label "Billing"
# Add backend/src/modules/billing/evals/runners/my-check.eval.mjs
npm run test:evals -- billing
```

See [MODULE_INTERNAL_CONTRACT.md](./MODULE_INTERNAL_CONTRACT.md) for colocated `prompts/` and `evals/`.
