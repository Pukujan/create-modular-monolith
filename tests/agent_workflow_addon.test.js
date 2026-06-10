import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const exec = promisify(execFile);
const ROOT = "/Users/teresaguajardo/Documents/coding/create-modular-monolith";

test("workflow addon machine and schemas exist", async () => {
  const files = [
    "additional-modules/agent-workflow/registry/workflow.machine.json",
    "additional-modules/agent-workflow/schemas/workflow-machine.schema.json",
    "additional-modules/agent-workflow/schemas/workflow-run.schema.json",
    "additional-modules/agent-workflow/schemas/worker-dispatch.schema.json",
    "additional-modules/agent-workflow/schemas/worker-result.schema.json",
    "additional-modules/agent-workflow/schemas/gate-result.schema.json"
  ];

  for (const file of files) {
    const content = await readFile(join(ROOT, file), "utf8");
    assert.ok(content.length > 0, `${file} should not be empty`);
  }
});

test("workflow commands emit compact JSON", async () => {
  const start = await exec("node", [join(ROOT, "additional-modules/agent-workflow/bin/agent-workflow-start.js")], { cwd: ROOT });
  const status = await exec("node", [join(ROOT, "additional-modules/agent-workflow/bin/agent-workflow-status.js")], { cwd: ROOT });
  const dispatch = await exec("node", [join(ROOT, "additional-modules/agent-workflow/bin/agent-workflow-dispatch.js")], { cwd: ROOT });

  const startJson = JSON.parse(start.stdout);
  const statusJson = JSON.parse(status.stdout);
  const dispatchJson = JSON.parse(dispatch.stdout);

  assert.equal(startJson.state, "intake");
  assert.equal(statusJson.workflowId, "workflow-demo");
  assert.equal(dispatchJson.workerType, "implementation-worker");
});
