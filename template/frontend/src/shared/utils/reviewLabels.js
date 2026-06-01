/** Attorney/paralegal-facing review labels — not provenance or extraction metadata. */

export const REVIEW_LABELS = {
  REVIEWED: "Reviewed",
  FILED: "Filed",
  NEEDS_REVIEW: "Needs Review",
  ATTORNEY_REVIEW: "Attorney Review Required",
  CRITICAL_DEADLINE: "Critical Deadline"
};

function normalizeStatusText(status) {
  return String(status ?? "").trim();
}

export function getReviewLabel(record = {}) {
  const status = normalizeStatusText(record.status ?? record.reviewStatus ?? "");

  if (/filed/i.test(status) && record.status === "Filed") {
    return REVIEW_LABELS.FILED;
  }
  if (/attorney review/i.test(status) || record.attorneyReviewRequired) {
    return REVIEW_LABELS.ATTORNEY_REVIEW;
  }
  if (/critical/i.test(status) || record.criticalDeadline) {
    return REVIEW_LABELS.CRITICAL_DEADLINE;
  }
  if (/needs review|pending review|partially superseded|duplicate|verification|method verification/i.test(status)) {
    return REVIEW_LABELS.NEEDS_REVIEW;
  }
  if (/reviewed|verified|completed|active|scheduled|archived|sent manually|approved/i.test(status)) {
    return REVIEW_LABELS.REVIEWED;
  }
  if (/source-backed|ocr/i.test(status)) {
    return /filed/i.test(record.status ?? "") ? REVIEW_LABELS.FILED : REVIEW_LABELS.REVIEWED;
  }
  return REVIEW_LABELS.NEEDS_REVIEW;
}

export function normalizeRuleStatusLabel(status) {
  const s = normalizeStatusText(status).toLowerCase();
  if (s.includes("controlling")) return "Controlling";
  if (s.includes("partially superseded")) return "Partially superseded";
  if (s.includes("supporting")) return "Supporting";
  if (s.includes("statutory baseline")) return "Statutory baseline";
  if (s.includes("statutory risk") || s.includes("filing validation") || s.includes("task trigger")) {
    return "Needs Review";
  }
  if (s.includes("superseded")) return "Superseded";
  return status || "Needs Review";
}
