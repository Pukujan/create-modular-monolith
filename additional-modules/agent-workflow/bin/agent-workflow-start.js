#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const machine = JSON.parse(await readFile(join(root, "registry/workflow.machine.json"), "utf8"));
  process.stdout.write(`${JSON.stringify({ state: machine.initial, workflowId: "workflow-demo" }, null, 2)}\n`);
}
