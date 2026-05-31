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

const planId = getCliArg(argv, "--plan-id") ?? slug;

const planningDir = join(repoRoot, "work-log/planning");
const files = await resolvePlanArtifacts(planningDir, slug);
const paths = artifactPaths(repoRoot, files);

const missing = [];
if (!paths.studyLogMd) missing.push(`study-log (*_study-log_*${slug}*.md)`);
if (!paths.planPackageMd) missing.push(`plan package (*_plan_*${slug}*.md)`);

if (missing.length) {
  console.error(`Cannot finalize — missing in work-log/planning/:\n  - ${missing.join("\n  - ")}`);
  console.error("\nRun /planning-study-log or add files manually, then retry.");
  process.exit(1);
}

const artifacts = { studyLogMd: paths.studyLogMd, planPackageMd: paths.planPackageMd };
if (paths.designMd) artifacts.designMd = paths.designMd;

const manifest = {
  planId,
  slug,
  status: "approved",
  finalizedAt: new Date().toISOString(),
  artifacts
};

const dir = join(repoRoot, "work-log/planning");
await mkdir(dir, { recursive: true });
await writeFile(join(dir, `${planId}.json`), JSON.stringify(manifest, null, 2));
console.log(`Wrote work-log/planning/${planId}.json`);
console.log(`  studyLog:  ${paths.studyLogMd}`);
console.log(`  design:    ${paths.designMd}`);
console.log(`  plan:      ${paths.planPackageMd}`);
