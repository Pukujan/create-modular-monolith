import { access, readdir } from "fs/promises";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { collectGitSnapshot } from "./git-snapshot.mjs";
import {
  DEV_LOG_AGENT_DIR,
  DEV_LOG_HUMAN_DIR
} from "../../backend/src/shared/contracts/prePushDevLog.contract.js";

const exec = promisify(execFile);

async function git(args, cwd) {
  try {
    const { stdout } = await exec("git", args, { cwd, maxBuffer: 10 * 1024 * 1024 });
    return stdout.trim();
  } catch (err) {
    return err.stdout?.trim() || "";
  }
}

async function fileExists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

function humanNameForAgent(agentName) {
  return agentName.replace("_dev-log-agent_", "_dev-log_").replace(/\.json$/, ".md");
}

async function fileInHeadCommit(repoRoot, relPath, headSha) {
  if (!headSha || headSha === "unknown") return false;
  const tip = await git(["log", "-1", "--format=%H", "--", relPath], repoRoot);
  return tip === headSha;
}

/**
 * Verify paired dev logs are committed on the current HEAD commit.
 * @param {string} repoRoot
 */
export async function checkDevLogForHead(repoRoot) {
  const gitSnap = await collectGitSnapshot(repoRoot);
  const agentDir = join(repoRoot, DEV_LOG_AGENT_DIR);
  let files;

  try {
    files = await readdir(agentDir);
  } catch {
    return {
      ok: false,
      sha: gitSnap.shortSha,
      reason: `No paired dev logs for HEAD (${gitSnap.shortSha}). Run: npm run agent:push -- --slug <topic>`
    };
  }

  for (const name of files.filter((f) => f.endsWith(".json")).sort().reverse()) {
    const humanName = humanNameForAgent(name);
    const agentRel = `${DEV_LOG_AGENT_DIR}/${name}`.replace(/\\/g, "/");
    const humanRel = `${DEV_LOG_HUMAN_DIR}/${humanName}`.replace(/\\/g, "/");
    const humanPath = join(repoRoot, humanRel);

    if (!(await fileExists(humanPath))) continue;

    const agentInHead = await fileInHeadCommit(repoRoot, agentRel, gitSnap.sha);
    const humanInHead = await fileInHeadCommit(repoRoot, humanRel, gitSnap.sha);
    if (agentInHead && humanInHead) {
      return {
        ok: true,
        sha: gitSnap.shortSha,
        agentPath: agentRel,
        humanPath: humanRel
      };
    }
  }

  return {
    ok: false,
    sha: gitSnap.shortSha,
    reason: `No paired dev logs for HEAD (${gitSnap.shortSha}). Run: npm run agent:push -- --slug <topic>`
  };
}

/**
 * Newest paired dev log files on disk (may be uncommitted).
 * @param {string} repoRoot
 */
export async function findLatestDevLogPairOnDisk(repoRoot) {
  const agentDir = join(repoRoot, DEV_LOG_AGENT_DIR);
  let files;
  try {
    files = await readdir(agentDir);
  } catch {
    return null;
  }

  for (const name of files.filter((f) => f.endsWith(".json")).sort().reverse()) {
    const humanName = humanNameForAgent(name);
    const humanPath = join(repoRoot, DEV_LOG_HUMAN_DIR, humanName);
    if (await fileExists(humanPath)) {
      return {
        agentPath: `${DEV_LOG_AGENT_DIR}/${name}`.replace(/\\/g, "/"),
        humanPath: `${DEV_LOG_HUMAN_DIR}/${humanName}`.replace(/\\/g, "/")
      };
    }
  }
  return null;
}
