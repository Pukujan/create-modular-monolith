import { readdir } from "fs/promises";
import { join } from "path";
import {
  PLANNING_AUDIT_LOG_FILE,
  PLANNING_DESIGN_FILE,
  PLANNING_DIR,
  PLANNING_PLAN_FILE
} from "../../backend/src/shared/contracts/planningPhase.contract.js";
import {
  folderMatchesSlug,
  PLAN_FOLDER_RE,
  relPlanPath
} from "./plan-folder.mjs";

const LEGACY_AUDIT_MARKERS = ["_audit-log_", "_study-log_"];

function legacyFlatAudit(name, slug) {
  return (
    name.includes(slug)
    && LEGACY_AUDIT_MARKERS.some((m) => name.includes(m))
    && name.endsWith(".md")
  );
}

async function readPlanFolder(planningDir, folderName) {
  const dirPath = join(planningDir, folderName);
  let files;
  try {
    files = await readdir(dirPath);
  } catch {
    return null;
  }

  const auditLog = files.includes(PLANNING_AUDIT_LOG_FILE)
    ? PLANNING_AUDIT_LOG_FILE
    : files.find((f) => legacyFlatAudit(f, folderName.split("_").pop() ?? ""));

  const planPkg = files.includes(PLANNING_PLAN_FILE)
    ? PLANNING_PLAN_FILE
    : files.find((f) => f.includes("_plan_") && f.endsWith(".md"));

  const design = files.includes(PLANNING_DESIGN_FILE)
    ? PLANNING_DESIGN_FILE
    : files.find((f) => f.includes("_design_") && f.endsWith(".md"));

  if (!auditLog || !planPkg) return null;

  return { folder: folderName, auditLog, planPkg, design: design ?? null };
}

async function listPlanFolders(planningDir) {
  const entries = await readdir(planningDir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory() && PLAN_FOLDER_RE.test(e.name)).map((e) => e.name);
}

/**
 * Resolve planning artifact paths for a slug (newest matching plan folder first).
 * @param {string} planningDir absolute path
 * @param {string} slug
 */
export async function resolvePlanArtifacts(planningDir, slug) {
  const folders = (await listPlanFolders(planningDir))
    .filter((name) => folderMatchesSlug(name, slug))
    .sort((a, b) => b.localeCompare(a));

  for (const folderName of folders) {
    const resolved = await readPlanFolder(planningDir, folderName);
    if (resolved) return resolved;
  }

  // Legacy flat files at planning root
  const entries = await readdir(planningDir);
  const auditLog = entries.find((f) => legacyFlatAudit(f, slug));
  const design = entries.find(
    (f) => f.includes(slug) && f.includes("_design_") && f.endsWith(".md")
  );
  const planPkg = entries.find(
    (f) => f.includes(slug) && f.includes("_plan_") && f.endsWith(".md")
  );
  return { folder: null, auditLog, design, planPkg };
}

export function artifactPaths(_repoRoot, files) {
  if (files.folder) {
    return {
      auditLogMd: files.auditLog ? relPlanPath(files.folder, files.auditLog) : null,
      designMd: files.design ? relPlanPath(files.folder, files.design) : null,
      planPackageMd: files.planPkg ? relPlanPath(files.folder, files.planPkg) : null,
      planFolder: `${PLANNING_DIR}/${files.folder}`.replace(/\\/g, "/")
    };
  }

  const rel = (name) => `${PLANNING_DIR}/${name}`.replace(/\\/g, "/");
  return {
    auditLogMd: files.auditLog ? rel(files.auditLog) : null,
    designMd: files.design ? rel(files.design) : null,
    planPackageMd: files.planPkg ? rel(files.planPkg) : null,
    planFolder: null
  };
}

/** @deprecated legacy manifest key */
export function legacyStudyLogMd(manifest) {
  return manifest?.artifacts?.studyLogMd ?? null;
}

export function resolveAuditLogMd(manifest, paths) {
  return manifest?.artifacts?.auditLogMd ?? legacyStudyLogMd(manifest) ?? paths.auditLogMd;
}

/** Newest plan folder for slug (may be missing audit-log.md / plan.md). */
export async function findLatestPlanFolder(planningDir, slug) {
  const folders = (await listPlanFolders(planningDir))
    .filter((name) => folderMatchesSlug(name, slug))
    .sort((a, b) => b.localeCompare(a));
  return folders[0] ?? null;
}

export async function folderHasRequiredFiles(planningDir, folderName) {
  const resolved = await readPlanFolder(planningDir, folderName);
  return Boolean(resolved);
}
