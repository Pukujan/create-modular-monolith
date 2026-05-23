import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const SKIP_MODULES = new Set(["_reference"]);
const ROUTE_RE = /router\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/gi;
const BASE_PATH_RE = /app\.use\(\s*["'`](\/api\/[^"'`]+)["'`]/;

function readText(path) {
  return readFileSync(path, "utf8");
}

function parseRegistryRows(masterText) {
  const start = masterText.indexOf("## Endpoint registry");
  if (start < 0) return [];
  const section = masterText.slice(start);
  const end = section.indexOf("\n## ", 4);
  const body = end >= 0 ? section.slice(0, end) : section;
  const rows = [];
  for (const line of body.split("\n")) {
    if (!line.startsWith("|") || line.includes("---") || line.toLowerCase().includes("method")) {
      continue;
    }
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length >= 4) {
      rows.push({
        method: cols[0].toUpperCase(),
        path: cols[1].replace(/^`/, "").replace(/`$/, ""),
        module: cols[2],
        description: cols[3]
      });
    }
  }
  return rows;
}

function parseModuleIndex(masterText) {
  const start = masterText.indexOf("## Module index");
  if (start < 0) return [];
  const section = masterText.slice(start);
  const end = section.indexOf("\n## ", 4);
  const body = end >= 0 ? section.slice(0, end) : section;
  const rows = [];
  for (const line of body.split("\n")) {
    if (!line.startsWith("|") || line.includes("---") || line.toLowerCase().includes("module")) {
      continue;
    }
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length >= 3) {
      rows.push({
        module: cols[0],
        basePath: cols[1].replace(/^`/, "").replace(/`$/, ""),
        status: cols[3] || cols[2]
      });
    }
  }
  return rows;
}

function classifyRoute(row) {
  const desc = row.description.toLowerCase();
  if (desc.includes("deprecated")) return "deprecated";
  if (desc.includes("stub") || desc.includes("health only")) return "stub";
  return "active";
}

/**
 * @param {string} repoRoot
 */
export async function collectApiInventory(repoRoot) {
  const masterApiPath = join(repoRoot, "docs/API.md");
  const masterText = existsSync(masterApiPath) ? readText(masterApiPath) : "";
  const registry = parseRegistryRows(masterText);
  const moduleIndex = parseModuleIndex(masterText);

  const http = { active: [], stub: [], deprecated: [] };
  for (const row of registry) {
    const bucket = classifyRoute(row);
    http[bucket].push({
      method: row.method,
      path: row.path,
      module: row.module,
      description: row.description
    });
  }

  const promptVersions = {
    defaultEnv: "n/a",
    envVar: "MASTER_PROMPT_VERSION",
    allowed: [],
    specs: {},
    notes: ["Add promptVersions.js in your domain module when you introduce LLM workflows"]
  };

  const pkg = JSON.parse(readText(join(repoRoot, "package.json")));
  const pipelineVersions = {
    app: pkg.version ?? "2.0.0",
    note: "Add pipelineVersions.contract.js in domain modules for batch/runtime versioning"
  };

  const versioned = {
    pipeline: pipelineVersions,
    prompts: promptVersions,
    storage: {},
    app: { packageJson: pkg.version }
  };

  const deprecated = { http: http.deprecated, cli: [], prompts: [], notes: [] };
  const exportDeprecated = join(repoRoot, "scripts/export-consolidated-models.mjs");
  if (existsSync(exportDeprecated)) {
    const t = readText(exportDeprecated);
    if (/@deprecated/i.test(t)) {
      deprecated.cli.push({
        command: "scripts/export-consolidated-models.mjs",
        replacement: "npm run condense-models or POST /api/model-condenser/condense"
      });
    }
  }

  const cli = [
    { command: "npm run dev-log:pre-push", purpose: "Paired human + agent dev logs" },
    { command: "npm run condense:all", purpose: "Snapshots → file-exchange/exports/" },
    { command: "npm run import:file-exchange", purpose: "Inbound → file-exchange/imports/{stamp}/" },
    { command: "npm run lint:contracts", purpose: "Verify contract manifest paths" },
    { command: "npm --prefix backend run condense-models", purpose: "Regenerate consolidated-models.json" }
  ];

  return {
    capturedAt: new Date().toISOString(),
    sourceDocs: ["docs/API.md", "backend/src/modules/*/routes/"],
    http,
    moduleStatus: moduleIndex.map((m) => ({
      module: m.module,
      basePath: m.basePath,
      status: m.status
    })),
    versioned,
    deprecated,
    cli
  };
}

/**
 * @param {Awaited<ReturnType<typeof collectApiInventory>>} apis
 */
export function formatApisMarkdown(apis) {
  const lines = [
    "### HTTP — active",
    "",
    "| Method | Path | Module | Description |",
    "|--------|------|--------|-------------|"
  ];
  for (const r of apis.http.active) {
    lines.push(`| ${r.method} | \`${r.path}\` | ${r.module} | ${r.description} |`);
  }
  lines.push("", "### HTTP — stub (health only)", "");
  if (apis.http.stub.length) {
    lines.push("| Method | Path | Module | Description |", "|--------|------|--------|-------------|");
    for (const r of apis.http.stub) {
      lines.push(`| ${r.method} | \`${r.path}\` | ${r.module} | ${r.description} |`);
    }
  } else {
    lines.push("_none_");
  }
  lines.push("", "### HTTP — deprecated", "");
  if (apis.http.deprecated.length) {
    lines.push("| Method | Path | Module | Description |", "|--------|------|--------|-------------|");
    for (const r of apis.http.deprecated) {
      lines.push(`| ${r.method} | \`${r.path}\` | ${r.module} | ${r.description} |`);
    }
  } else {
    lines.push("_none registered in docs/API.md_");
  }
  lines.push("", "### Versioned contracts (platform)", "", "```json");
  lines.push(JSON.stringify(apis.versioned.pipeline, null, 2));
  lines.push("```");
  if (apis.deprecated.cli.length) {
    lines.push("", "### Deprecated CLI", "");
    for (const d of apis.deprecated.cli) {
      lines.push(`- \`${d.command}\` → ${d.replacement}`);
    }
  }
  return lines.join("\n");
}
