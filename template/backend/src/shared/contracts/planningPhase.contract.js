export const PLANNING_PHASE_VERSION = "v001";
export const PLANNING_DIR = "work-log/planning";

/** User-owned portfolio notes — not used by agents (see work-log/study-logs/README.md). */
export const STUDY_LOGS_DIR = "work-log/study-logs";

export const PLANNING_STATUSES = ["draft", "approved", "executing", "done"];

/** Fixed filenames inside each `{NNN}_{date}_{time}_{slug}/` plan folder. */
export const PLANNING_AUDIT_LOG_FILE = "audit-log.md";
export const PLANNING_PLAN_FILE = "plan.md";
export const PLANNING_DESIGN_FILE = "design.md";

/** Plan folder: `{NNN}_{YYYY-MM-DD}_{HH-MM}_{slug}` */
export const PLAN_FOLDER_PATTERN = "{NNN}_{YYYY-MM-DD}_{HH-MM}_{slug}";

/** Required planning artifact kinds (audit log + plan; design optional). */
export function requiredPlanningArtifactKinds() {
  return ["auditLog", "plan", "design"];
}

/** @deprecated use requiredPlanningArtifactKinds */
export function requiredStudyDocPatterns(slug) {
  return requiredPlanningArtifactKinds();
}

export function planningManifestFilename(planId) {
  return `${planId}.json`;
}

export const PLANNING_AUDIT_LOG_KIND = "audit-log";
