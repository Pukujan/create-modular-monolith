#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  if (!args.out) throw new Error("Missing --out");

  const recommendText = await runRecommend(args);
  const recommendation = JSON.parse(recommendText);
  const packet = {
    taskType: recommendation.taskType,
    profile: recommendation.profile,
    selectedCapabilities: recommendation.recommended,
    proofSchema: "phase-proof.v1",
    estimatedTokens: recommendation.estimatedPacketTokens,
    estimatedPacketTokens: recommendation.estimatedPacketTokens,
    sources: ["registry/decision-graph.json", "registry/skills.manifest.json"]
  };

  await mkdir(args.out, { recursive: true });
  await writeFile(join(args.out, "context-packet.json"), `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  await writeFile(join(args.out, "TASK.md"), `# ${recommendation.taskType}\n\nCompact agent packet.\n`, "utf8");
  await writeFile(join(args.out, "proof-template.json"), `${JSON.stringify({ phaseId: "", status: "passed" }, null, 2)}\n`, "utf8");
  await writeFile(join(args.out, "required-output.schema.json"), `${JSON.stringify({ type: "phase-proof.v1" }, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}

async function runRecommend(args) {
  const { spawn } = await import("node:child_process");
  const child = spawn(process.execPath, [join(root, "bin/agent-capabilities-recommend.js"), "--task-type", args["task-type"] || "ui-contract", "--profile", args.profile || "qwen-20k"], { stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `recommend failed with code ${code}`));
    });
  });
  return stdout.trim();
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
