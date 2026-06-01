# Contract: rule filing audit

**Version:** `v001`  
**Frontend service:** `frontend/src/modules/ai-ops/memory/services/rule-filing-audit.service.js`  
**Demo seeds:** `frontend/src/modules/ai-ops/memory/data/demo-rule-filing-audit.json`, `demo-rule-source-artifacts.json`

## Purpose

Append-only **rule filing audit log** queried by metadata and document-anchored `asOfDate`. Replaces cache-key reuse for official rule sources.

| Concern | Audit log | Legacy cache panel |
|---------|-----------|-------------------|
| Lookup | `queryApplicableFiling({ tier, metadata, asOfDate })` | County + case type key |
| History | Never overwrite; `supersededAt` closes prior version | Single row per profile |
| Applicability | `activeAt <= asOfDate < supersededAt` | Last verified date only |

## RuleFilingAuditEvent

```javascript
{
  eventId: string,
  ruleVersion: string,
  tier: "county" | "case_type" | "judge_part" | "uniform" | "cplr" | "case_order",
  metadata: { county, caseType, judgePart, court, authorityId, authorityName },
  lifecycle: {
    releasedAt: string | null,
    activeAt: string,
    supersededAt: string | null
  },
  source: { url, trustedIndex, sourceType },
  content: { parsedText, parsedTextRef, structuredSections },
  provenance: { discoveryRunId, agentIds, discoveryMethod, verifiedAt, approvedBy },
  recordedAt: string
}
```

## Document anchor

Documents carry `filedDate` (preferred) or `receivedDate`. Audit query uses:

`asOfDate = filedDate ?? receivedDate`

Upload timestamp alone is not used for scanned legacy PDFs.

## Query API

`queryApplicableFiling({ tier, metadata, asOfDate })`:

1. Match events on `tier` + metadata facets (county required; judgePart fuzzy when tier is `judge_part`).
2. Keep events where `activeAt <= asOfDate` and (`supersededAt` is null or `supersededAt > asOfDate`).
3. Return `{ resolution: "reuse" | "gap" | "ambiguous", event?, ruleVersion? }`.
4. Events with `releasedAt` but `activeAt > asOfDate` are **not** reused.

Orchestrator runs per **document × tier** (or distinct `asOfDate` slice).

## Append API

`appendFilingAuditEvent(event)` — append after human approve (step 10). Session overlay via `demo-session-bridge` until DB persistence.

## Demo scenario (Maria Santos / Queens / Kerrigan)

| Document | filedDate | judge_part tier |
|----------|-----------|-----------------|
| doc_013 | 2028-03-01 | Kerrigan rules **v2** active |
| doc_014 | 2028-09-01 | Kerrigan rules **v3** active |

v2: `activeAt` 2027-07-01, `supersededAt` 2028-06-01  
v3: `activeAt` 2028-06-01, `supersededAt` null
