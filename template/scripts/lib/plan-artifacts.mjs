import { readdir } from "fs/promises";
import { PLANNING_DIR } from "../../backend/src/shared/contracts/planningPhase.contract.js";

/**
 * Resolve planning artifact paths under work-log/planning for a slug.
 * @param {string} planningDir absolute path
 * @param {string} slug
 */
export async function resolvePlanArtifacts(planningDir, slug) {
  const entries = await readdir(planningDir);
  const studyLog = entries.find(
    (f) => f.includes(slug) && f.includes("_study-log_") && f.endsWith(".md")
  );
  const design = entries.find(
    (f) => f.includes(slug) && f.includes("_design_") && f.endsWith(".md")
  );
  const planPkg = entries.find(
    (f) => f.includes(slug) && f.includes("_plan_") && f.endsWith(".md")
  );
  return { studyLog, design, planPkg };
}

export function artifactPaths(_repoRoot, files) {
  const rel = (name) => `${PLANNING_DIR}/${name}`.replace(/\\/g, "/");
  return {
    studyLogMd: files.studyLog ? rel(files.studyLog) : null,
    designMd: files.design ? rel(files.design) : null,
    planPackageMd: files.planPkg ? rel(files.planPkg) : null
  };
}
