import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT = "/Users/teresaguajardo/Documents/coding/create-modular-monolith";

test("workflow state machine handoff exists and names the bounded states", async () => {
  const handoff = await readFile(
    join(ROOT, "additional-modules/work-log/handoffs/008_2026-06-09_19-43_handoff-agent-workflow-orchestrator-capability-registry.md"),
    "utf8"
  );
  assert.match(handoff, /state machine = orchestrator/);
  assert.match(handoff, /workflow state machine/);
  assert.match(handoff, /packet builder/);
  assert.match(handoff, /phase-proof.schema.json/);
});

test("workflow states are declared in the existing module contract", async () => {
  const contract = await readFile(
    join(ROOT, "template/backend/src/shared/contracts/moduleAgentStateMachine.contract.js"),
    "utf8"
  );
  assert.match(contract, /AGENT_RUN_STATUSES/);
  assert.match(contract, /agent\.run\.started/);
  assert.match(contract, /agent\.run\.transitioned/);
  assert.match(contract, /agent\.run\.completed/);
  assert.match(contract, /agent\.run\.failed/);
});
