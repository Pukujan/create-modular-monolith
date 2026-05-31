import {
  PLANNING_AUDIT_LOG_FILE,
  PLANNING_DESIGN_FILE,
  PLANNING_DIR,
  PLANNING_PLAN_FILE
} from "../../backend/src/shared/contracts/planningPhase.contract.js";

/** `{NNN}_{YYYY-MM-DD}_{HH-MM}_{slug}` */
export const PLAN_FOLDER_RE = /^(\d{3})_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2})_([a-z0-9-]+)$/;

export function slugifyPlanSlug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPlanFolderName(entryId, date, time, slug) {
  const id = String(entryId).padStart(3, "0");
  return `${id}_${date}_${time}_${slugifyPlanSlug(slug)}`;
}

export function folderMatchesSlug(folderName, slug) {
  const m = folderName.match(PLAN_FOLDER_RE);
  if (!m) return folderName.includes(slug);
  return m[4] === slugifyPlanSlug(slug) || folderName.includes(slug);
}

export function relPlanPath(folderName, fileName) {
  return `${PLANNING_DIR}/${folderName}/${fileName}`.replace(/\\/g, "/");
}

export { PLANNING_AUDIT_LOG_FILE, PLANNING_DESIGN_FILE, PLANNING_PLAN_FILE };
