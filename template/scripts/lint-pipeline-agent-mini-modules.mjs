#!/usr/bin/env node
/**
 * Validates pipeline agent mini-module registry parity (frontend ↔ backend).
 */
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  PIPELINE_AGENT_REGISTRY_PATH,
  PIPELINE_AGENT_REGISTRY_FRONTEND_MIRROR,
  loadPipelineAgentRegistry,
  listBackendPipelineMiniModuleSlugs,
  listFrontendAiOpsMiniModules
} from "./lib/pipeline-agent-mini-modules.mjs";
import {
  PARENT_MINI_MODULES,
  BACKEND_PARENT_MINI_MODULES
} from "./lib/parent-mini-modules.config.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const frontendAiOps = join(repoRoot, "frontend/src/modules/ai-ops");
const backendAiOps = join(repoRoot, "backend/src/modules/ai-ops");
const pipelineStepsPath = join(
  frontendAiOps,
  "rule-discovery/data/rule-discovery-pipeline-steps.js"
);

const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!existsSync(backendAiOps)) {
  console.log("Pipeline agent mini-module lint skipped (no backend/src/modules/ai-ops).");
  process.exit(0);
}

const mirrorPath = join(repoRoot, PIPELINE_AGENT_REGISTRY_FRONTEND_MIRROR);
if (!existsSync(mirrorPath)) {
  fail(`Missing frontend registry mirror: ${PIPELINE_AGENT_REGISTRY_FRONTEND_MIRROR}`);
} else {
  const backendJson = readFileSync(PIPELINE_AGENT_REGISTRY_PATH, "utf8").trim();
  const frontendJson = readFileSync(mirrorPath, "utf8").trim();
  if (backendJson !== frontendJson) {
    fail(
      "Frontend registry mirror out of sync with backend — copy backend/src/shared/contracts/pipeline-agent-mini-modules.registry.json"
    );
  }
}

const registry = loadPipelineAgentRegistry();
const HUMAN_GATE = "human_review_gate";

if (existsSync(pipelineStepsPath)) {
  const source = readFileSync(pipelineStepsPath, "utf8");
  const agentIdMatches = [...source.matchAll(/agentId:\s*"([^"]+)"/g)].map((m) => m[1]);
  const registered = new Set(
    registry.miniModules.flatMap((e) => e.logicalAgentIds ?? [])
  );
  registered.add(HUMAN_GATE);

  for (const agentId of agentIdMatches) {
    if (!registered.has(agentId)) {
      fail(`Pipeline step agentId not in registry: ${agentId}`);
    }
  }
}

for (const entry of registry.miniModules) {
  const beStatus = entry.backend?.status;
  if (beStatus === "implemented" || beStatus === "partial") {
    const dir = join(backendAiOps, entry.slug);
    if (!existsSync(dir)) {
      fail(`Backend mini-module folder missing: ai-ops/${entry.slug}`);
    } else if (entry.backend?.manifest) {
      const manifest = join(dir, entry.backend.manifest);
      if (!existsSync(manifest)) {
        fail(`Backend manifest missing: ai-ops/${entry.slug}/${entry.backend.manifest}`);
      }
    }
  }

  const fe = entry.frontend;
  if (!fe?.slug) continue;
  if (fe.status === "planned") continue;

  for (const slug of [fe.slug, fe.legacySlug].filter(Boolean)) {
    const dir = join(frontendAiOps, slug);
    if (!existsSync(dir)) {
      fail(`Frontend mini-module folder missing: ai-ops/${slug} (${entry.slug})`);
    } else if (!existsSync(join(dir, "index.js"))) {
      fail(`Frontend mini-module barrel missing: ai-ops/${slug}/index.js`);
    }
  }
}

const expectedBackend = listBackendPipelineMiniModuleSlugs().sort();
const configuredBackend = [...(BACKEND_PARENT_MINI_MODULES["ai-ops"] ?? [])].sort();
if (JSON.stringify(expectedBackend) !== JSON.stringify(configuredBackend)) {
  fail(
    `BACKEND_PARENT_MINI_MODULES["ai-ops"] mismatch.\n  expected: ${expectedBackend.join(", ")}\n  actual:   ${configuredBackend.join(", ")}`
  );
}

const expectedFrontend = listFrontendAiOpsMiniModules().sort();
const configuredFrontend = [...(PARENT_MINI_MODULES["ai-ops"] ?? [])].sort();
if (JSON.stringify(expectedFrontend) !== JSON.stringify(configuredFrontend)) {
  fail(
    `PARENT_MINI_MODULES["ai-ops"] mismatch.\n  expected: ${expectedFrontend.join(", ")}\n  actual:   ${configuredFrontend.join(", ")}`
  );
}

const parentManifest = join(backendAiOps, "agent-registry.manifest.json");
if (existsSync(parentManifest)) {
  const parent = JSON.parse(readFileSync(parentManifest, "utf8"));
  const listed = new Set((parent.agents ?? []).map((a) => a.miniModule ?? a.id));
  for (const slug of expectedBackend) {
    if (!listed.has(slug)) {
      fail(`agent-registry.manifest.json missing mini-module: ${slug}`);
    }
  }
}

if (failures.length) {
  console.error("Pipeline agent mini-module lint failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `Pipeline agent mini-modules OK (${registry.miniModules.length} registry entries, ${expectedBackend.length} backend, ${expectedFrontend.length} frontend folders)`
);
