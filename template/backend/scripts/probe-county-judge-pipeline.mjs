#!/usr/bin/env node
/**
 * Manual probe: filing audit + source discovery for Bronx / Queens / Kings judges.
 * Run: node scripts/probe-county-judge-pipeline.mjs
 */
import { runFilingAuditPipeline } from "../src/modules/ai-ops/filing-audit-agent/services/filing-audit.service.js";
import { runSourceDiscoveryAsync } from "../src/modules/ai-ops/source-discovery-agent/services/source-discovery.service.js";

import { initRuleCatalogForTests } from "../src/shared/testing/rule-catalog-test-setup.js";

const SCENARIOS = [
  {
    label: "Queens — Justice Kerrigan (med mal)",
    caseProfile: {
      county: "Queens",
      court: "Supreme Court, Queens County",
      judgePart: "Hon. John Kerrigan",
      caseType: "Medical Malpractice"
    }
  },
  {
    label: "Kings — Part 42 (med mal)",
    caseProfile: {
      county: "Kings",
      court: "Supreme Court, Kings County",
      judgePart: "Part 42",
      caseType: "Medical Malpractice"
    }
  },
  {
    label: "Bronx — Hon. Moylan (contract)",
    caseProfile: {
      county: "Bronx",
      court: "Supreme Court, Bronx County",
      judgePart: "Hon. Moylan",
      caseType: "Contract Dispute"
    }
  }
];

const documentMap = {
  doc_probe: { documentId: "doc_probe", filedDate: "2028-01-15", receivedDate: "2028-01-16" }
};

function summarizeSources(sources) {
  return sources.map((row) => ({
    authorityId: row.authorityId,
    label: row.sourceLabel ?? row.url,
    host: row.trustedHost ?? row.trustedIndex,
    score: row.verificationScore
  }));
}

let failed = 0;

await initRuleCatalogForTests();

for (const scenario of SCENARIOS) {
  console.log(`\n=== ${scenario.label} ===`);

  const { auditLookup, authorities } = runFilingAuditPipeline({
    documentIds: ["doc_probe"],
    caseProfile: scenario.caseProfile,
    documentMap
  });

  const authorityIds = authorities.map((row) => row.authorityId);
  console.log("Authorities:", authorityIds.join(", "));
  console.log("Audit:", auditLookup.summary);

  const online = authorities.map((row) => ({ ...row, resolution: "online" }));
  const { sources, discoveryMeta } = await runSourceDiscoveryAsync({
    authorities: online,
    caseProfile: scenario.caseProfile
  });

  console.log(
    "Discovery:",
    `trusted=${discoveryMeta.trustedCandidates}`,
    `verified=${discoveryMeta.verifiedCandidates}`,
    `google=${discoveryMeta.googleSource}`
  );

  const countyAuth = authorityIds.find((id) => id.endsWith("_supreme"));
  const countySources = sources.filter((row) => row.authorityId === countyAuth);
  const judgeSources = sources.filter((row) => row.authorityId.startsWith("auth_judge_"));

  console.log("County supreme sources:", countySources.length);
  if (countySources[0]) {
    console.log("  top:", countySources[0].sourceLabel ?? countySources[0].url);
  }
  console.log("Judge part sources:", judgeSources.length);

  const ok =
    auditLookup.status === "completed" &&
    countyAuth &&
    countySources.length > 0 &&
    discoveryMeta.verifiedCandidates > 0;

  if (!ok) {
    failed += 1;
    console.log("RESULT: FAIL");
  } else {
    console.log("RESULT: PASS");
    console.log("Sample sources:", JSON.stringify(summarizeSources(sources.slice(0, 3)), null, 2));
  }
}

console.log(`\n--- ${SCENARIOS.length - failed}/${SCENARIOS.length} scenarios passed ---`);
process.exit(failed > 0 ? 1 : 0);
