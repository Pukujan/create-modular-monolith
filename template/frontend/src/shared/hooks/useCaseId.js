import { createContext, useContext, createElement, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { listCase } from "../../modules/case-management/services/case.service.js";
import { DEFAULT_CASE_ID } from "../constants/case.js";

const CaseIdContext = createContext(null);

/** Route segments that are tabs, not case ids (bad /cases/{tab} URLs). */
const TAB_PATH_SEGMENTS = new Set([
  "case-info",
  "documents",
  "correspondence",
  "emails",
  "court-alerts",
  "conferences",
  "defense-contacts",
  "rules-authority",
  "docket",
  "calendar",
  "tasks",
  "discovery",
  "depositions",
  "pleadings",
  "medical",
  "experts",
  "insurance",
  "liens-costs",
  "notes",
  "history",
  "contacts",
  "liens",
  "costs"
]);

const KNOWN_CASE_IDS = () => new Set(listCase().map((c) => c.caseId));

function decodeSegment(raw) {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function parseCaseIdFromPath(pathname) {
  const match = pathname.match(/\/cases\/([^/?#]+)(?:\/|$)/);
  if (!match) return null;
  const segment = decodeSegment(match[1]);
  if (!segment || segment === "undefined" || segment === "null") return null;
  if (TAB_PATH_SEGMENTS.has(segment)) return null;
  return segment;
}

function parseRestPath(pathname) {
  const match = pathname.match(/\/cases\/[^/?#]+(\/.*)?$/);
  return match?.[1] ?? "";
}

export function isValidCaseId(caseId) {
  if (!caseId || caseId === "undefined" || caseId === "null") return false;
  if (TAB_PATH_SEGMENTS.has(caseId)) return false;
  return KNOWN_CASE_IDS().has(caseId);
}

export function normalizeCaseId(caseId) {
  if (isValidCaseId(caseId)) return caseId;
  return DEFAULT_CASE_ID;
}

export function resolveCaseId(caseId) {
  return normalizeCaseId(caseId || null);
}

function resolveFromRoute() {
  const { caseId } = useParams();
  const { pathname } = useLocation();
  const fromParam = caseId && isValidCaseId(caseId) ? caseId : null;
  const fromPath = parseCaseIdFromPath(pathname);
  return fromParam ?? fromPath ?? DEFAULT_CASE_ID;
}

/** Redirect /cases/undefined/... or /cases/documents/... to /cases/{default}/... */
export function CaseIdRedirect() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const match = pathname.match(/^(\/(?:demo|app))\/cases\/([^/?#]+)(\/.*)?$/);
    if (!match) return;
    const prefix = match[1];
    const segment = decodeSegment(match[2]);
    const rest = match[3] ?? "";
    if (isValidCaseId(segment)) return;
    const suffix = TAB_PATH_SEGMENTS.has(segment) ? `/${segment}${rest}` : rest;
    navigate(`${prefix}/cases/${DEFAULT_CASE_ID}${suffix}`, { replace: true });
  }, [pathname, navigate]);

  return null;
}

export function CaseIdProvider({ children }) {
  const resolved = resolveFromRoute();
  return createElement(CaseIdContext.Provider, { value: resolved }, children);
}

/** Active case id for the current workspace route. */
export function useCaseId() {
  const fromContext = useContext(CaseIdContext);
  if (fromContext) return fromContext;
  return resolveFromRoute();
}

export { parseRestPath };
