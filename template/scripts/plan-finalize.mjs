#!/usr/bin/env node
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { artifactPaths, resolvePlanArtifacts } from "./lib/plan-artifacts.mjs";
import { getCliArg } from "./lib/parse-cli-args.mjs";

const repoRoot = join(import.meta.dirname, "..");
const argv = process.argv.slice(2);
const slug = getCliArg(argv, "--slug");

if (!slug) {
  console.error("Usage: npm run plan:finalize -- --slug <plan-slug> [--plan-id <id>]");
  process.exit(1);
}

const planningDir = join(repoRoot, "work-log/planning");
const files = await resolvePlanArtifacts(planningDir, slug);
const paths = artifactPaths(repoRoot, files);

const planId = getCliArg(argv, "--plan-id") ?? files.folder ?? slug;

const missing = [];
if (!paths.auditLogMd) {
  missing.push(`audit-log.md in work-log/planning/{NNN}_{date}_{time}_${slug}/`);
}
if (!paths.planPackageMd) {
  missing.push(`plan.md in the same plan folder`);
}

if (missing.length) {
  console.error(`Cannot finalize — missing in work-log/planning/:\n  - ${missing.join("\n  - ")}`);
  console.error("\nCreate a dated plan folder with audit-log.md + plan.md, then retry.");
  console.error("See .cursor/commands/planning-audit-log.md");
  process.exit(1);
}

const artifacts = { auditLogMd: paths.auditLogMd, planPackageMd: paths.planPackageMd };
if (paths.designMd) artifacts.designMd = paths.designMd;

const manifest = {
  planId,
  slug,
  status: "approved",
  finalizedAt: new Date().toISOString(),
  planFolder: paths.planFolder,
  artifacts
};

const dir = join(repoRoot, "work-log/planning");
await mkdir(dir, { recursive: true });
await writeFile(join(dir, `${planId}.json`), JSON.stringify(manifest, null, 2));
console.log(`Wrote work-log/planning/${planId}.json`);
if (paths.planFolder) console.log(`  folder:    ${paths.planFolder}`);
console.log(`  auditLog:  ${paths.auditLogMd}`);
console.log(`  design:    ${paths.designMd ?? "(none)"}`);
console.log(`  plan:      ${paths.planPackageMd}`);
