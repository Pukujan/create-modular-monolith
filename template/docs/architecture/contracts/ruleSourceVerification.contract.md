# Contract: rule source verification

**Version:** `v001`  
**Backend modules:** `source-crawler-agent`, `source-verifier-agent`, `rule-applicability-agent`

## Purpose

After URL discovery, every candidate is fetched, parsed (with always-on PDF OCR), checked against hard guardrails and an applicability brief, then scored by a checker agent. Human approval remains mandatory for survivors.

## Pipeline order

1. `runRuleApplicabilityResearch` — once per run → `applicabilityBrief`
2. `runSourceDiscoveryAsync` — trusted index + Google scout → crawl → verify

## Crawl payload (`source.crawl`)

```javascript
{
  status: "fetched" | "fetch_failed",
  httpStatus: number | null,
  extractionMethod: "html_text" | "pdf_text" | "ocr" | "ocr+pdf_text" | null,
  ocrUsed: boolean,
  textQuality: { usable: boolean, wordCount: number, alnumRatio: number },
  pageTitle: string,
  parsedText: string,
  parsedTextLength: number,
  textTruncated: boolean,
  error: string | null,
  durationMs: number | null,
  fetchedAt: string
}
```

## Applicability brief

```javascript
{
  expectedRules: [{
    authorityId: string,
    description: string,
    expectedSignals: string[],
    citationUrls: string[]
  }],
  exclusions: [{ reason: string, description: string }],
  openQuestions: string[],
  confidence: number,
  researchMeta: {
    provider: "openrouter_web_search" | "catalog_fallback",
    degraded: boolean,
    latencyMs?: number
  }
}
```

## Checker output (`source.checker`)

```javascript
{
  verdict: "match" | "mismatch" | "unclear",
  confidence: number,
  failReasons: string[],
  explanation: string,
  detectedSignals: { counties: string[], judges: string[], caseTypes: string[] }
}
```

## Fail reason enum

| Reason | Layer |
|--------|-------|
| `fetch_failed` | crawl |
| `empty_content` | crawl / parser |
| `page_not_found`, `sorry_missing`, `http_404_copy`, `unable_to_find`, `no_longer_available`, `access_denied`, `under_construction`, `login_required` | hard guardrails |
| `wrong_judge`, `wrong_county`, `wrong_case_type` | mismatch guards |
| `cplr_not_applicable`, `unrelated_court_rules`, `error_page` | checker LLM |

## Status mapping

| verdict | confidence | `verificationStatus` |
|---------|------------|----------------------|
| mismatch | any | `rejected` |
| unclear | any | `unclear` |
| match | ≥ 0.7 | `pending` |
| match | < 0.7 | `unclear` |

## Env

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | OCR + research + checker |
| `MODEL_EXTRACT_LIGHT` | Research + checker model |
| `SOURCE_OCR_MAX_PAGES` | PDF OCR page cap (default 5) |
| `SOURCE_CRAWL_MOCK` | Mock HTTP fetch in tests |
| `SOURCE_CHECKER_MOCK` | Stub checker responses in tests |
