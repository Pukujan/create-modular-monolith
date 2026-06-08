/** @readonly Pipeline agent / assigner mini-module parity contract. */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const CONTRACT_DIR = dirname(fileURLToPath(import.meta.url));

export const PIPELINE_AGENT_MINI_MODULES_VERSION = "v001";

export const PIPELINE_AGENT_REGISTRY_FILENAME = "pipeline-agent-mini-modules.registry.json";

export const PIPELINE_AGENT_REGISTRY_PATH = join(CONTRACT_DIR, PIPELINE_AGENT_REGISTRY_FILENAME);

/** Frontend mirror path (must stay byte-identical; see lint:pipeline-agent-mini-modules). */
export const PIPELINE_AGENT_REGISTRY_FRONTEND_MIRROR = join(
  "frontend/src/modules/ai-ops/shared/data",
  PIPELINE_AGENT_REGISTRY_FILENAME
);

export const PIPELINE_AGENT_KINDS = ["orchestrator", "assigner", "worker", "gate"];

export const MINI_MODULE_IMPLEMENTATION_STATUSES = [
  "planned",
  "stub",
  "partial",
  "implemented",
  "orchestrated"
];

let cachedRegistry = null;

export function loadPipelineAgentRegistry() {
  if (!cachedRegistry) {
    cachedRegistry = JSON.parse(readFileSync(PIPELINE_AGENT_REGISTRY_PATH, "utf8"));
  }
  return cachedRegistry;
}

export function listRegistryMiniModules() {
  return loadPipelineAgentRegistry().miniModules ?? [];
}

export function listInfrastructureFrontendMiniModules() {
  return loadPipelineAgentRegistry().infrastructureMiniModules?.frontend ?? [];
}

/** Backend agent mini-module folder slugs under `backend/src/modules/ai-ops/`. */
export function listBackendPipelineMiniModuleSlugs() {
  return listRegistryMiniModules()
    .filter((entry) => {
      const status = entry.backend?.status;
      return status === "implemented" || status === "partial";
    })
    .map((entry) => entry.slug);
}

/** Frontend mini-module folder slugs under `frontend/src/modules/ai-ops/`. */
export function listFrontendPipelineMiniModuleSlugs() {
  const slugs = new Set();
  for (const entry of listRegistryMiniModules()) {
    const fe = entry.frontend;
    if (!fe?.slug) continue;
    if (fe.status === "planned") continue;
    slugs.add(fe.slug);
    if (fe.legacySlug) slugs.add(fe.legacySlug);
  }
  return [...slugs];
}

export function listFrontendAiOpsMiniModules() {
  return [...listInfrastructureFrontendMiniModules(), ...listFrontendPipelineMiniModuleSlugs()];
}

export function getMiniModuleBySlug(slug) {
  return listRegistryMiniModules().find((entry) => entry.slug === slug) ?? null;
}

export function getMiniModuleByLogicalAgentId(logicalAgentId) {
  return (
    listRegistryMiniModules().find((entry) =>
      (entry.logicalAgentIds ?? []).includes(logicalAgentId)
    ) ?? null
  );
}

export function getFrontendSlugForLogicalAgentId(logicalAgentId) {
  const entry = getMiniModuleByLogicalAgentId(logicalAgentId);
  if (!entry?.frontend?.slug) return null;
  return entry.frontend.legacySlug && entry.frontend.status === "partial"
    ? entry.frontend.legacySlug
    : entry.frontend.slug;
}

export function getBackendSlugForLogicalAgentId(logicalAgentId) {
  return getMiniModuleByLogicalAgentId(logicalAgentId)?.slug ?? null;
}
