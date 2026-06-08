/** Demo session overlay — ai-ops approve → filing audit events (no cross-module imports). */

let sessionFilingAuditEvents = [];
let revision = 0;
const listeners = new Set();

function bump() {
  revision += 1;
  listeners.forEach((fn) => fn());
}

export function subscribeDemoBridge(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoBridgeRevision() {
  return revision;
}

/** @deprecated use getSessionFilingAuditEvents */
export function getSessionCacheEntries() {
  return getSessionFilingAuditEvents().map((event) => ({
    cacheEntryId: event.eventId,
    caseId: null,
    authorityId: event.metadata?.authorityId,
    ruleSummary: event.ruleVersion,
    lastVerifiedAt: event.lifecycle?.activeAt,
    sourceRunId: event.provenance?.discoveryRunId,
    confidence: "verified"
  }));
}

export function getSessionFilingAuditEvents() {
  return sessionFilingAuditEvents;
}

/**
 * Apply rule-discovery output after human approve (session-only audit overlay).
 * @param {{ runId: string, caseId?: string, output: Record<string, unknown>, context?: Record<string, unknown> }} input
 */
export function applyApprovedRunOutput({ runId, caseId, output, context }) {
  if (!output) return;

  const now = new Date().toISOString();
  const approvedSources = (context?.sources ?? []).filter((s) => s.verificationStatus === "verified");

  for (const source of approvedSources) {
    const eventId = `audit_session_${runId}_${source.authorityId}`;
    if (sessionFilingAuditEvents.some((e) => e.eventId === eventId)) continue;

    sessionFilingAuditEvents = [
      ...sessionFilingAuditEvents,
      {
        eventId,
        ruleVersion: `session_${source.authorityId}`,
        tier: "county",
        metadata: {
          county: context?.caseProfile?.county ?? "Queens",
          authorityId: source.authorityId,
          authorityName: source.authorityId
        },
        lifecycle: {
          releasedAt: now.slice(0, 10),
          activeAt: now.slice(0, 10),
          supersededAt: null
        },
        source: {
          url: source.url,
          trustedIndex: source.trustedIndex,
          sourceType: source.sourceType
        },
        content: {
          parsedText: `Verified in run ${runId} via online discovery.`
        },
        provenance: {
          discoveryRunId: runId,
          agentIds: ["agent_rule_filing_persist_v1"],
          discoveryMethod: "online",
          verifiedAt: now.slice(0, 10),
          approvedBy: "session"
        },
        recordedAt: now
      }
    ];
  }

  bump();
}
