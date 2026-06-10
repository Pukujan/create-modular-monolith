# Documentation

This folder describes the **modular monolith platform starter** and how **architecture guardrails** keep feature modules isolated and easy to extend.

| Document | Purpose |
| --- | --- |
| [**HTTP API reference**](./API.md) | All backend module endpoints (master index + endpoint registry) |
| [API documentation contract](./architecture/API_DOCUMENTATION_CONTRACT.md) | Required when adding routes (`npm run lint:api-docs`) |
| [Dev log: v2](./DEVLOG_V2.md) | Changes from `main`, contract rationale, benefits/cons, challenges, growth path |
| [Work log / dev-logs](../work-log/dev-logs/) | Per-session **shipped work** — `{NNN}_{date}_{time}_dev-log_{slug}.md`; see [work-log/](../work-log/) |
| [Starter pack](./STARTER_PACK.md) | What ships in the repo, how to run it, and how to add modules |
| [Architecture guardrails](./architecture/ARCHITECTURE_GUARDRAILS.md) | Module contracts, boundaries, naming, and how enforcement works |
| [Module internal contract](./architecture/MODULE_INTERNAL_CONTRACT.md) | MVC layers, prompts, evals, tests inside each feature module |
| [Agent workflow contracts](./architecture/AGENT_WORKFLOW_CONTRACTS.md) | Handoff packets, root layout, and tiny phase context |
| [Data handoff contracts](./architecture/DATA_HANDOFF_CONTRACTS.md) | Repo handoff artifacts, manifests, and future DB-backed state |
| [Agent capability registry](../additional-modules/agent-capabilities/README.md) | Skills, MCP tools, CLI tools, profiles, and context packets |
| [Agent workflow](../additional-modules/agent-workflow/README.md) | Workflow orchestrator, worker dispatch, and proof gates |
| [Evals, regression, and CI gates](./architecture/EVAL_AND_CI.md) | Golden evals, `test:evals`, GitHub Actions gates |
| [Publishing the CLI](./PUBLISHING.md) | Release `@pukujan/create-modular-monolith` to npm |
| [Workout module contracts](./workout/README.md) | Workout API, data contract, and persistence handoff rules |
| [Case Filing AI starter](./case-filing-ai/README.md) | Domain blueprint, module split, pipeline, guardrails, and DB schema |

## Next Up

Short-term architecture work planned for the agent-first workflow:

1. Agent capability registry with skill, MCP, and CLI manifests.
2. Decision graph plus retrieval index, symbolic-first and vector-ready later.
3. Context packet builder with strict token budget checks.
4. Workflow state machine that orchestrates worker/subagent phases.
5. Output proof schemas and outcome recording for low-context agents.

Canonical repository: [https://github.com/Pukujan/litigation-prompt-engineering](https://github.com/Pukujan/litigation-prompt-engineering)
