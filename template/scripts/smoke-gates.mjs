#!/usr/bin/env node
/**
 * Smoke tests for planning gate and agent push gate.
 * Creates temporary fixtures, runs checks, cleans up.
 */
import { mkdir, writeFile, rm, readFile } from "fs/promises";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { checkDevLogForHead } from "./lib/check-dev-log-for-head.mjs";
import { getCliArg } from "./lib/parse-cli-args.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = "gate-smoke";
const planId = slug;
const studyLog = `999_2026-05-31_12-00_study-log_${slug}.md`;
const planPkg = `999_2026-05-31_12-00_plan_${slug}.md`;
const manifestFile = `${planId}.json`;
const planningDir = join(repoRoot, "work-log/planning");

let failed = 0;

function assert(name, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`  ${mark} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
}

function runNpm(args, { expect = 0 } = {}) {
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32"
  });
  const code = result.status ?? 1;
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  return { code, output, ok: code === expect };
}

function runNode(scriptRel, args, input = "") {
  const result = spawnSync(process.execPath, [join(repoRoot, scriptRel), ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    input
  });
  const code = result.status ?? 1;
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  return { code, output, stdout: result.stdout || "" };
}

async function setupPlanningFixtures() {
  await mkdir(planningDir, { recursive: true });
  await writeFile(join(planningDir, studyLog), "# gate smoke study log\n");
  await writeFile(join(planningDir, planPkg), "# gate smoke plan package\n");
}

async function cleanup() {
  await rm(join(planningDir, studyLog), { force: true });
  await rm(join(planningDir, planPkg), { force: true });
  await rm(join(planningDir, manifestFile), { force: true });
}

async function main() {
  console.log("Smoke: planning gate\n");

  // plan-id default must not become process.argv[0]
  const planGateArgv = ["--slug", slug];
  const parsedPlanId = getCliArg(planGateArgv, "--plan-id") ?? slug;
  assert("plan-id defaults to slug (not node path)", parsedPlanId === slug, parsedPlanId);

  const failGate = runNpm(["run", "plan:gate", "--", "--slug", slug], { expect: 1 });
  assert("plan:gate fails without artifacts", failGate.ok);
  assert("plan:gate error mentions slug", failGate.output.includes(slug));

  await setupPlanningFixtures();

  const finalize = runNpm(["run", "plan:finalize", "--", "--slug", slug]);
  assert("plan:finalize succeeds", finalize.code === 0, finalize.output.trim().split("\n").pop());

  const manifestRaw = await readFile(join(planningDir, manifestFile), "utf8");
  const manifest = JSON.parse(manifestRaw);
  assert("manifest planId correct", manifest.planId === planId);
  assert("manifest paths under work-log/planning", manifest.artifacts.studyLogMd.startsWith("work-log/planning/"));

  const passGate = runNpm(["run", "plan:gate", "--", "--slug", slug]);
  assert("plan:gate passes after finalize", passGate.code === 0, passGate.output.trim().split("\n").pop());

  const passGateExplicit = runNpm(["run", "plan:gate", "--", "--slug", slug, "--plan-id", planId]);
  assert("plan:gate passes with explicit plan-id", passGateExplicit.code === 0);

  console.log("\nSmoke: agent push gate\n");

  const headCheck = await checkDevLogForHead(repoRoot);
  assert("dev logs missing for HEAD (expected)", headCheck.ok === false);

  const hookAllow = runNode(".cursor/hooks/before-agent-push.mjs", [], '{"command":"npm test"}');
  assert("hook allows non-push commands", hookAllow.code === 0 && hookAllow.stdout.includes('"allow"'));

  const hookDeny = runNode(".cursor/hooks/before-agent-push.mjs", [], '{"command":"git push origin main"}');
  const denyPayload = JSON.parse(hookDeny.stdout.trim());
  assert("hook denies bare git push without dev logs", denyPayload.permission === "deny");

  const agentPush = runNpm(["run", "agent:push", "--", "--slug", "gate-smoke", "--no-tests"], { expect: 2 });
  assert("agent:push creates dev log skeletons (exit 2)", agentPush.ok);
  assert("agent:push mentions work-log/dev-logs", agentPush.output.includes("work-log/dev-logs"));

  // cleanup dev logs created by agent:push (newest pair)
  const { findLatestDevLogPairOnDisk } = await import("./lib/check-dev-log-for-head.mjs");
  const pair = await findLatestDevLogPairOnDisk(repoRoot);
  if (pair) {
    await rm(join(repoRoot, pair.agentPath), { force: true });
    await rm(join(repoRoot, pair.humanPath), { force: true });
  }

  await cleanup();

  console.log(failed === 0 ? "\nAll smoke gate checks passed." : `\n${failed} smoke gate check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  cleanup().finally(() => process.exit(1));
});
