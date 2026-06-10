# ui-handoff-contract

Validates polished UI handoff packages and turns them into machine-readable contract outputs for phase planning.

## Inputs

- polished UI fixture package
- `docs/ui-contract.md`
- `docs/api-contract.md`
- `docs/handoff.md`
- `frontend/src/services/workoutApi.ts`

## Outputs

- `ui-contract.json`
- `api-contract.json`
- `handoff-contract.md`
- `allowed-files.json`
- `no-drift.rules.md`
- `phase-input.json`
- `contract-report.json`

## Rule

The polished UI is authoritative, but it is only complete when the service adapter, backend routes, and browser-visible proof all line up with the extracted contract.
