#!/usr/bin/env node
/**
 * Agent push — create dev logs if needed, commit them, then git push.
 *
 * Usage:
 *   npm run agent:push -- --slug my-feature
 *   npm run agent:push -- --slug my-feature --commit
 *   npm run agent:push -- --slug my-feature --commit -- origin main
 */
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  checkDevLogForHead,
  findLatestDevLogPairOnDisk
} from "./lib/check-dev-log-for-head.mjs";
import { collectGitSnapshot } from "./lib/git-snapshot.mjs";
import {
  DEV_LOG_AGENT_DIR,
  DEV_LOG_HUMAN_DIR
} from "../backend/src/shared/contracts/prePushDevLog.contract.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const out = {
    slug: "",
    program: "005",
    noTests: false,
    commit: false,
    title: "",
    pushArgs: []
  };
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--") {
      out.pushArgs = argv.slice(i + 1);
      break;
    }
    if (a === "--slug" && argv[i + 1]) out.slug = argv[++i];
    else if (a === "--program" && argv[i + 1]) out.program = argv[++i];
    else if (a === "--title" && argv[i + 1]) out.title = argv[++i];
    else if (a === "--no-tests") out.noTests = true;
    else if (a === "--commit") out.commit = true;
    i += 1;
  }
  return out;
}

function slugFromBranch(branch) {
  const tail = branch.includes("/") ? branch.split("/").pop() : branch;
  return tail
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function run(cmd, args, { allowFail = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (result.status !== 0 && !allowFail) {
    process.exit(result.status ?? 1);
  }
  return result.status ?? 1;
}

function generateDevLogs(args) {
  const genArgs = ["run", "dev-log:pre-push", "--", "--slug", args.slug, "--program", args.program];
  if (args.noTests) genArgs.push("--no-tests");
  if (args.title) genArgs.push("--title", args.title);
  return run(process.platform === "win32" ? "npm.cmd" : "npm", genArgs);
}

function commitDevLogs(slug) {
  run("git", ["add", DEV_LOG_HUMAN_DIR, DEV_LOG_AGENT_DIR]);
  const message = `dev log: ${slug}`;
  const status = run("git", ["commit", "-m", message], { allowFail: true });
  if (status !== 0) {
    console.error("Nothing to commit under work-log/dev-logs/ — fill FILL sections first.");
    process.exit(1);
  }
}

function tellFillAndCommit(slug) {
  console.log("\nFill every FILL section in:");
  console.log("  work-log/dev-logs/agent/");
  console.log("  work-log/dev-logs/human/");
  console.log(`\nThen run:\n  npm run agent:push -- --slug ${slug} --commit`);
  process.exit(2);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const git = await collectGitSnapshot(repoRoot);

  if (!args.slug) {
    args.slug = slugFromBranch(git.branch);
  }
  if (!args.slug) {
    console.error("Usage: npm run agent:push -- --slug <kebab-topic> [--commit] [-- git push args...]");
    process.exit(1);
  }

  let check = await checkDevLogForHead(repoRoot);
  if (check.ok) {
    const pushArgs = args.pushArgs.length ? args.pushArgs : [];
    console.log(`Pushing (${check.sha}) with paired dev logs…`);
    run("git", ["push", ...pushArgs]);
    return;
  }

  const onDisk = await findLatestDevLogPairOnDisk(repoRoot);

  if (args.commit && onDisk) {
    commitDevLogs(args.slug);
    check = await checkDevLogForHead(repoRoot);
    if (check.ok) {
      const pushArgs = args.pushArgs.length ? args.pushArgs : [];
      console.log(`Pushing (${check.sha}) with paired dev logs…`);
      run("git", ["push", ...pushArgs]);
      return;
    }
    console.error(check.reason);
    process.exit(1);
  }

  if (onDisk) {
    tellFillAndCommit(args.slug);
  }

  console.log(`Creating dev log skeletons for "${args.slug}"…`);
  generateDevLogs(args);
  tellFillAndCommit(args.slug);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
