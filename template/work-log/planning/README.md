# Planning

Design rationale, planning conversations, study logs, and plan packages. Parent: [work-log](../README.md).

Implementation specs are in **[../handoffs/](../handoffs/)**.

## Planning artifacts (before build)

For each program tier, commit **in this order** before implementation:

1. **Study log** — `*_study-log_{slug}.md` — your messages verbatim + Cursor summaries ([planning-study-log](../../.cursor/commands/planning-study-log.md))
2. **Design** (optional) — `*_design_{slug}.md`
3. **Plan package** — `*_plan_{slug}*.md`
4. **Manifest** — `npm run plan:finalize -- --slug {slug} --plan-id {NNN}-{slug}` → `{planId}.json` in this folder

Gate: `npm run plan:gate -- --slug {slug} --plan-id {planId}`

Reference: program **008** (full audit) · program **007** (retroactive study log after build).

## Filename convention

Same as [handoffs](../handoffs/README.md) and [dev-logs](../dev-logs/README.md):

`{NNN}_{YYYY-MM-DD}_{HH-MM}_study-log_{slug}.md`

Full index: [../INDEX.md](../INDEX.md).
