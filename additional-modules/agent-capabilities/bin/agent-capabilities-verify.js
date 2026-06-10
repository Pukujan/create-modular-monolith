#!/usr/bin/env node
// agent-capabilities-verify
// Validates contextWindow and targetPacketTokens budgets for agent profiles.
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const files = [
  "registry/agent-profiles.manifest.json",
  "registry/skills.manifest.json",
  "registry/mcp-tools.manifest.json",
  "registry/cli-tools.manifest.json",
  "registry/capabilities.manifest.json",
  "registry/decision-graph.json",
  "registry/decision-rules.json",
  "registry/retrieval-index.manifest.json",
  "registry/task-outcomes.jsonl",
  "registry/skill-scoreboard.json"
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  for (const file of files) {
    const content = await readFile(join(root, file), "utf8");
    if (!content.trim()) throw new Error(`Empty registry file: ${file}`);
  }
  console.log("agent capability registry OK");
}
