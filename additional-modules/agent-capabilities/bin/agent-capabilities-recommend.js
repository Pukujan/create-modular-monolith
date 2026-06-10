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
  const profile = args.profile || "qwen-20k";
  const taskType = args["task-type"] || "ui-contract";
  const [skillsText, profilesText, graphText] = await Promise.all([
    readFile(join(root, "registry/skills.manifest.json"), "utf8"),
    readFile(join(root, "registry/agent-profiles.manifest.json"), "utf8"),
    readFile(join(root, "registry/decision-graph.json"), "utf8")
  ]);

  const skills = JSON.parse(skillsText).skills;
  const profileRecord = JSON.parse(profilesText).profiles.find((item) => item.id === profile);
  if (!profileRecord) throw new Error(`Unknown profile: ${profile}`);

  const matches = skills.filter((skill) => (skill.bestFor || []).includes(taskType));
  const selected = matches.slice(0, profileRecord.maxRecommendedCapabilities || 5);
  const estimatedPacketTokens = selected.reduce((sum, skill) => sum + (skill.contextCostTokens || 0), 0) + 800;

  const output = {
    taskType,
    profile,
    targetPacketTokens: profileRecord.targetPacketTokens || 8000,
    estimatedPacketTokens,
    decisionGraphVersion: JSON.parse(graphText).version,
    recommended: selected.map((skill) => ({
      capabilityId: skill.id,
      type: "skill",
      whySelected: [
        `task.${taskType} -> skill.${skill.id}`,
        "RULE:USE_SKILL_FOR_PROCEDURAL_GUIDANCE"
      ],
      whyNotMcp: "No external live tool/data lookup required."
    })),
    excluded: skills
      .filter((skill) => !selected.includes(skill))
      .map((skill) => ({ capabilityId: skill.id, reason: "not selected for this task/profile" }))
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      out[key] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}
