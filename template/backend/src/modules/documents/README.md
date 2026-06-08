# Documents

See [Module internal contract](../../../docs/architecture/MODULE_INTERNAL_CONTRACT.md).

**HTTP API:** [docs/documents/API.md](../../../docs/documents/API.md) · [All modules](../../../docs/API.md)

## Layout

`routes` → `services` → `repositories` / `domain` / `adapters` / `agents`

`agents/` holds FSM definitions; `services/agent-runner.service.js` owns lifecycle (see moduleAgentStateMachine contract).

`prompts` + `evals` for AI workflows. `tests/` for unit and integration coverage.
