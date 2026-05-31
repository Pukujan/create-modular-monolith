#!/usr/bin/env node
import { access, readFile } from "fs/promises";
import { join } from "path";
import {
  artifactPaths,
  findLatestPlanFolder,
  resolveAuditLogMd,
  resolvePlanArtifacts
} from "./lib/plan-artifacts.mjs";
import { getCliArg } from "./lib/parse-cli-args.mjs";

const repoRoot = join(import.meta.dirname, "..");
const argv = process.argv.slice(2);
const slug = getCliArg(argv, "--slug");

if (!slug) {
  console.error("Usage: npm run plan:gate -- --slug <plan-slug> [--plan-id <id>]");
  process.exit(1);
}

const planningDir = join(repoRoot, "work-log/planning");
const planId =
  getCliArg(argv, "--plan-id")
  ?? (await findLatestPlanFolder(planningDir, slug))
  ?? slug;
const errors = [];

async function fileExists(relPath) {
  try {
    await access(join(repoRoot, relPath));
    return true;
  } catch {
    return false;
  }
}

const manifestPath = join(repoRoot, "work-log/planning", `${planId}.json`);
let manifest;
try {
  const raw = await readFile(manifestPath, "utf8");
  manifest = JSON.parse(raw);
} catch {
  errors.push(`Missing manifest work-log/planning/${planId}.json — run npm run plan:finalize`);
}

if (manifest) {
  if (manifest.status !== "approved") {
    errors.push(`Manifest status is ${manifest.status}, expected approved`);
  }
  const files = await resolvePlanArtifacts(planningDir, slug);
  const paths = artifactPaths(repoRoot, files);
  const auditLogMd = resolveAuditLogMd(manifest, paths);

  if (!auditLogMd) {
    errors.push("Manifest missing artifacts.auditLogMd — re-run npm run plan:finalize");
  } else if (!(await fileExists(auditLogMd))) {
    errors.push(`Planning audit log not found: ${auditLogMd}`);
  }
  if (!manifest.artifacts?.planPackageMd) {
    errors.push("Manifest missing artifacts.planPackageMd");
  } else if (!(await fileExists(manifest.artifacts.planPackageMd))) {
    errors.push(`Plan package not found: ${manifest.artifacts.planPackageMd}`);
  }
  if (manifest.artifacts?.designMd && !(await fileExists(manifest.artifacts.designMd))) {
    errors.push(`Design MD not found: ${manifest.artifacts.designMd}`);
  }
} else {
  const files = await resolvePlanArtifacts(planningDir, slug);
  const paths = artifactPaths(repoRoot, files);
  if (!paths.auditLogMd) {
    errors.push(`Missing audit-log.md in work-log/planning/{NNN}_{date}_{time}_${slug}/ for slug ${slug}`);
  }
  if (!paths.planPackageMd) {
    errors.push(`Missing plan.md in the same plan folder for slug ${slug}`);
  }
}

if (errors.length) {
  console.error("Plan gate FAILED:\n", errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log(`Plan gate passed for ${planId} (${slug})`);
