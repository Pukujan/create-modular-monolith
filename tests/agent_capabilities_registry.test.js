import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT = "/Users/teresaguajardo/Documents/coding/create-modular-monolith";
const REGISTRY_DIR = join(ROOT, "additional-modules/agent-capabilities/registry");
const BIN_DIR = join(ROOT, "additional-modules/agent-capabilities/bin");

test("agent capability registry seed manifests exist and validate", async () => {
  const files = [
    "agent-profiles.manifest.json",
    "skills.manifest.json",
    "mcp-tools.manifest.json",
    "cli-tools.manifest.json",
    "capabilities.manifest.json",
    "decision-graph.json",
    "decision-rules.json",
    "retrieval-index.manifest.json",
    "task-outcomes.jsonl",
    "skill-scoreboard.json"
  ];

  for (const file of files) {
    const content = await readFile(join(REGISTRY_DIR, file), "utf8");
    assert.ok(content.length > 0, `${file} should not be empty`);
  }
});

test("registry verification rejects malformed profile or skill records", async () => {
  const tempDir = join(ROOT, "tmp-agent-capabilities-test");
  await mkdir(tempDir, { recursive: true });

  const malformed = join(tempDir, "broken-profile.json");
  await writeFile(
    malformed,
    JSON.stringify([{ id: "broken", contextWindow: 20000 }], null, 2),
    "utf8"
  );

  const source = await readFile(join(BIN_DIR, "agent-capabilities-verify.js"), "utf8");
  assert.match(source, /agent-capabilities-verify/);
  assert.match(source, /contextWindow/);
  assert.match(source, /targetPacketTokens/);
  assert.match(source, /skill-scoreboard/);
});

test("recommendation and packet builders are present", async () => {
  const recommend = await readFile(join(BIN_DIR, "agent-capabilities-recommend.js"), "utf8");
  const packet = await readFile(join(BIN_DIR, "agent-capabilities-build-packet.js"), "utf8");
  const explain = await readFile(join(BIN_DIR, "agent-capabilities-explain.js"), "utf8");

  assert.match(recommend, /whySelected/);
  assert.match(recommend, /targetPacketTokens/);
  assert.match(packet, /context-packet/);
  assert.match(packet, /estimatedTokens/);
  assert.match(explain, /decisionPath/);
});
