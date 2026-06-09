# Agent Workflow Contracts

This document explains how polished UI handoffs become small, enforceable coding tasks instead of giant prompt blobs.

## Why this exists

Agents keep drifting when the repo hands them too much context at once. The fix is not more prose in the prompt. The fix is:

1. Extract the handoff into machine-readable contracts.
2. Compile those contracts into small phase packets.
3. Enforce the packets with tests and gates.
4. Keep the full architecture docs in the repo as source of truth.

## Ownership

- `ui-handoff-contract` freezes a polished UI handoff into contract outputs.
- Phase Builder turns those outputs into phase plans and coding-agent packets.
- Context engineering keeps session memory and budget state stable.
- The coding agent implements only the current phase from the packet, not the whole repo story.

## Root layout

The scaffold root should stay calm and small. Root is for launch surfaces, not for every infrastructure subsystem.

Allowed root surface:

- `backend/`
- `frontend/`
- `additional-modules/`
- `AGENTS.md`
- `MEMORY.md`
- `README.md`
- `package.json`
- agent rule folders

Addon-owned systems live under `additional-modules/`:

- `docs/`
- `file-exchange/`
- `scripts/`
- `work-log/`
- `phase-builder/`
- `context-engineering/`
- `ui-handoff-contract/`

## TDD flow

1. Write the failing contract test.
2. Generate the contract artifact.
3. Render a tiny phase packet.
4. Implement only the allowed files.
5. Prove the browser-visible behavior.
6. Reject the slice if it passes only in the backend or only with mock data.

## Why the workout fixture matters

The workout package is the smoke test for the workflow. It proves that a polished UI, a service adapter, backend routes, and browser-visible proof all line up before the slice is marked complete.

