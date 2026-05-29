#!/usr/bin/env node
/**
 * Bundle architecture contracts into consolidated-contracts.json.
 */
import { readFile, access } from "fs/promises";
import { join, dirname, isAbsolute } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { writeConsolidatedArtifact } from "./consolidated-output.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(repoRoot, "docs/architecture/contracts/manifest.json");
const OVERVIEW_PATH = join(repoRoot, "docs/architecture/CONTRACTS_OVERVIEW.md");
const CHANGELOG_PATH = join(repoRoot, "docs/architecture/contracts/changelog.jsonl");
const TEMPLATES_ROOT = join(repoRoot, "docs/architecture/templates");

const CONTRACT_TEMPLATE_DIRS = {
  documentPersistence: "document-persistence",
  moduleAgentStateMachine: "module-agent-state-machine",
  asyncJobQueue: "async-job-queue"
};

const RUNTIME_STACK = {
  documentPersistence: {
    storage: "SQL + data/uploads",
    not: "file-exchange",
    contractId: "documentPersistence"
  },
  moduleAgentStateMachine: {
    controller: "FSM in agents/*.machine.js",
    state: "agent_runs table",
    contractId: "moduleAgentStateMachine"
  },
  asyncJobQueue: {
    queue: "BullMQ",
    backend: "Redis",
    note: "Redis is not a substitute for BullMQ or SQL",
    contractId: "asyncJobQueue"
  }
};

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function serializeExport(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "function") return undefined;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(serializeExport);
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    const serialized = serializeExport(v);
    if (serialized !== undefined) out[k] = serialized;
  }
  return out;
}

/**
 * @param {Record<string, unknown>} mod
 */
function extractCodeExports(mod) {
  const code = { exports: {}, functionNames: [] };
  for (const [key, value] of Object.entries(mod)) {
    if (key === "default") continue;
    if (typeof value === "function") {
      code.functionNames.push(key);
      continue;
    }
    const serialized = serializeExport(value);
    if (serialized !== undefined) {
      code.exports[key] = serialized;
    }
  }
  return code;
}

/**
 * @param {string} markdown
 * @returns {string[]}
 */
function parseRelatedContractIds(markdown) {
  const ids = new Set();
  const re = /\]\(\.\/([a-zA-Z]+)\.contract\.md\)/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    ids.add(m[1]);
  }
  const re2 = /\[([a-zA-Z]+)\.contract\.md\]/g;
  while ((m = re2.exec(markdown)) !== null) {
    ids.add(m[1]);
  }
  return [...ids].sort();
}

/**
 * @param {string} absPath
 */
async function pathExists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} contractId
 * @param {Record<string, string>} entry
 */
async function collectImplementationGuides(contractId, entry) {
  const guides = [];
  const seen = new Set();

  /**
   * @param {string} rel
 * @param {{ kind?: string }} [meta]
   */
  async function addGuide(rel, meta = {}) {
    const normalized = rel.replace(/\\/g, "/");
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    const abs = isAbsolute(normalized) ? normalized : join(repoRoot, normalized);
    guides.push({
      path: normalized,
      exists: await pathExists(abs),
      ...meta
    });
  }

  if (entry.userDoc) {
    await addGuide(entry.userDoc);
  }

  if (entry.schema) {
    await addGuide(entry.schema, { kind: "migrationSql" });
  }

  if (CONTRACT_TEMPLATE_DIRS[contractId]) {
    const dir = CONTRACT_TEMPLATE_DIRS[contractId];
    await addGuide(`docs/architecture/templates/${dir}/README.md`);
    await addGuide(`docs/architecture/templates/${dir}/`, { kind: "templateDirectory" });
  }

  return guides;
}

/**
 * @param {Record<string, Record<string, string>>} manifest
 */
async function buildContractEntries(manifest) {
  const contracts = [];

  for (const [id, entry] of Object.entries(manifest)) {
    const docRel = entry.doc;
    const docAbs = join(repoRoot, docRel);
    let docMarkdown = "";
    try {
      docMarkdown = await readFile(docAbs, "utf8");
    } catch {
      docMarkdown = "";
    }

    let code = null;
    if (entry.file) {
      const fileAbs = join(repoRoot, entry.file);
      try {
        const mod = await import(pathToFileURL(fileAbs).href);
        code = {
          file: entry.file,
          ...extractCodeExports(mod)
        };
      } catch (error) {
        code = {
          file: entry.file,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    contracts.push({
      id,
      version: entry.version ?? null,
      manifest: { ...entry },
      docPath: docRel,
      docMarkdown,
      code,
      implementationGuides: await collectImplementationGuides(id, entry),
      relatedContractIds: parseRelatedContractIds(docMarkdown)
    });
  }

  return contracts.sort((a, b) => a.id.localeCompare(b.id));
}

async function loadChangelog() {
  try {
    const raw = await readFile(CHANGELOG_PATH, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const overviewMarkdown = await readFile(OVERVIEW_PATH, "utf8").catch(() => "");
  const contracts = await buildContractEntries(manifest);

  const doc = {
    meta: {
      generatedAt: new Date().toISOString(),
      repositoryRoot: ".",
      condensedBy: "condense-contracts",
      description:
        "Full architecture contract bundle for agent handoff (markdown, manifest paths, JS constants).",
      contractCount: contracts.length,
      manifestPath: "docs/architecture/contracts/manifest.json"
    },
    overview: {
      path: "docs/architecture/CONTRACTS_OVERVIEW.md",
      markdown: overviewMarkdown
    },
    changelog: await loadChangelog(),
    runtimeStack: RUNTIME_STACK,
    contracts
  };

  const { exportPath, datedExportDir, mirrorPath, latestExportPath } =
    await writeConsolidatedArtifact("contracts", doc);

  console.log(
    `Consolidated ${contracts.length} contracts → ${exportPath}\n` +
      `  dated: ${datedExportDir}/\n` +
      `  mirror: ${mirrorPath}\n` +
      `  latest: ${latestExportPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
