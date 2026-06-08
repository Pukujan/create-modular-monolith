import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { RULE_CATALOG_TABLES, DISCOVERY_CHANNELS } from "../src/shared/contracts/ruleCatalog.contract.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(
  repoRoot,
  "src/modules/ai-ops/source-discovery-agent/data"
);
const auditSeedPath = join(
  repoRoot,
  "src/modules/ai-ops/filing-audit-agent/data/demo-rule-filing-audit.json"
);
const candidateSeedPath = join(
  repoRoot,
  "src/modules/ai-ops/filing-audit-agent/data/demo-candidate-authorities.json"
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * Bootstrap catalog rows from repo JSON (one-time seed only — not read at runtime).
 * @param {{ isEmpty: () => Promise<boolean>, insertBootstrap: (rows: object) => Promise<void> }} repo
 */
export async function seedRuleCatalogIfEmpty(repo) {
  if (!(await repo.isEmpty())) return false;

  const trustedIndex = readJson(join(dataDir, "trusted-source-index.json"));
  const googleSeed = readJson(join(dataDir, "google-scout-seed.json"));
  const auditEvents = readJson(auditSeedPath);
  const candidateSeed = readJson(candidateSeedPath);

  const hosts = Object.entries(trustedIndex.registry ?? {}).map(([hostKey, row]) => ({
    hostKey,
    label: row.label,
    publisher: row.publisher ?? null,
    trustWeight: row.trustWeight ?? 1
  }));

  const countyMap = Object.entries(trustedIndex.countySupremeAuthorityId ?? {}).map(
    ([countyKey, authorityId]) => ({ countyKey, authorityId })
  );

  /** @type {Map<string, object>} */
  const authorityById = new Map();

  for (const row of candidateSeed.candidates ?? []) {
    authorityById.set(row.authorityId, {
      authorityId: row.authorityId,
      name: row.name,
      authorityTier: inferTier(row.authorityId),
      tierLabel: row.tier,
      authorityRank: row.authorityRank ?? 70,
      agentId: row.agentId ?? "agent_rule_authority_v1",
      judgeMatchPatterns: [],
      countyKeys: [],
      caseTypePatterns: [],
      alwaysInclude: row.authorityId === "auth_cplr_3216",
      requiresKnownCounty: row.authorityId === "auth_uniform"
    });
  }

  for (const [authorityId, entry] of Object.entries(trustedIndex.authorities ?? {})) {
    const existing = authorityById.get(authorityId) ?? {};
    authorityById.set(authorityId, {
      authorityId,
      name: entry.name ?? existing.name ?? authorityId,
      authorityTier: entry.authorityTier ?? inferTier(authorityId),
      tierLabel: existing.tierLabel ?? tierLabelFor(entry.authorityTier ?? inferTier(authorityId)),
      authorityRank: existing.authorityRank ?? rankFor(entry.authorityTier ?? inferTier(authorityId)),
      agentId: existing.agentId ?? "agent_rule_authority_v1",
      judgeMatchPatterns: entry.judgeParts ?? [],
      countyKeys: entry.counties ?? [],
      caseTypePatterns: entry.caseTypes ?? [],
      alwaysInclude: existing.alwaysInclude ?? false,
      requiresKnownCounty: existing.requiresKnownCounty ?? false
    });
  }

  if (!authorityById.has("auth_med_mal_part")) {
    authorityById.set("auth_med_mal_part", {
      authorityId: "auth_med_mal_part",
      name: "Medical Malpractice Part Rules",
      authorityTier: "case_type",
      tierLabel: "Same Case Type",
      authorityRank: 82,
      agentId: "agent_rule_authority_v1",
      judgeMatchPatterns: [],
      countyKeys: [],
      caseTypePatterns: ["medical malpractice", "med mal", "malpractice", "med"],
      alwaysInclude: false,
      requiresKnownCounty: false
    });
  }

  const trustedSources = [];
  for (const [authorityId, entry] of Object.entries(trustedIndex.authorities ?? {})) {
    for (const source of entry.sources ?? []) {
      trustedSources.push({
        sourceRowId: randomUUID(),
        authorityId,
        url: source.url,
        label: source.label ?? source.url,
        priority: source.priority ?? 99,
        sourceType: source.sourceType ?? (String(source.url).endsWith(".pdf") ? "pdf" : "html"),
        discoveryChannel: DISCOVERY_CHANNELS.TRUSTED_INDEX
      });
    }
  }

  const googleSources = [];
  for (const [authorityId, urls] of Object.entries(googleSeed)) {
    for (const [idx, url] of urls.entries()) {
      googleSources.push({
        sourceRowId: randomUUID(),
        authorityId,
        url,
        label: `Google scout seed ${idx + 1}`,
        priority: idx + 1,
        sourceType: url.endsWith(".pdf") ? "pdf" : "html",
        discoveryChannel: DISCOVERY_CHANNELS.GOOGLE_SEED
      });
    }
  }

  await repo.insertBootstrap({
    hosts,
    authorities: [...authorityById.values()],
    countyMap,
    trustedSources,
    googleSources,
    auditEvents
  });

  return true;
}

function inferTier(authorityId) {
  if (authorityId.startsWith("auth_judge_")) return "judge_part";
  if (authorityId.endsWith("_supreme")) return "county";
  if (authorityId === "auth_med_mal_part") return "case_type";
  if (authorityId === "auth_uniform") return "uniform";
  if (authorityId.startsWith("auth_cplr")) return "cplr";
  return "county";
}

function tierLabelFor(tier) {
  const map = {
    judge_part: "Same Judge / Part",
    county: "Same County",
    case_type: "Same Case Type",
    uniform: "Uniform Court Rules",
    cplr: "CPLR Rules"
  };
  return map[tier] ?? "Same County";
}

function rankFor(tier) {
  const map = { judge_part: 95, county: 88, case_type: 82, uniform: 70, cplr: 65 };
  return map[tier] ?? 70;
}

export { RULE_CATALOG_TABLES, DISCOVERY_CHANNELS };
