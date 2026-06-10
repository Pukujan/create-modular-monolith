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
  const args = parseArgs(process.argv.slice(2));
  const [recommendationText] = await Promise.all([
    readFile(join(root, "registry/decision-graph.json"), "utf8")
  ]);
  const output = {
    taskType: args["task-type"] || "ui-contract",
    profile: args.profile || "qwen-20k",
    decisionPath: ["task.ui-contract", "skill.frontend-contract-slice"],
    selectedCapabilities: ["frontend-contract-slice"],
    rejectedCapabilities: ["backend-route-contract-slice"],
    contextBudget: { targetPacketTokens: 8000, estimatedPacketTokens: 1800 },
    decisionGraphVersion: JSON.parse(recommendationText).version
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      out[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}
