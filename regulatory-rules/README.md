# Regulatory rules — editable source of truth

This folder is the **only** place compliance rules live. The API route
(`src/app/api/check/route.ts`) loads these files at request time and builds
the system prompt from them — nothing about actual claim rules is hardcoded
in prompt strings or application code.

## ⚠️ Current status: PLACEHOLDER DATA

Every claim, reason, and regulation reference in these files is currently a
`[PLACEHOLDER — ...]` string, not real regulatory text. **Do not launch with
real customers until every placeholder below has been replaced with sourced
text from an actual regulatory document**, and a domain expert has reviewed
the file and filled in `last_reviewed_by`.

Files to replace:
- `cosmetics.json`
- `food-beverage.json`
- `health-supplements.json`
- `general-advertising-code.json`

## How to edit

Each file is plain JSON — no build step, no code changes needed. Edit it,
save it, redeploy (or just restart `npm run dev` locally). The app reads
these files fresh from source at build time via a static import, so a
deploy is required to pick up changes in production.

### Schema

Each category file (`cosmetics.json`, `food-beverage.json`,
`health-supplements.json`) has this shape:

```jsonc
{
  "category_id": "cosmetics",        // must stay stable — used as the value in the category dropdown
  "category_label": "Cosmetics",     // shown to users in the dropdown
  "source": {
    "title": "...",                  // the actual regulation/guideline document name
    "citation": "...",               // clause/section numbers, edition, effective date
    "last_reviewed_by": "..."        // name + date of the domain expert who verified this file
  },
  "permitted_claims": [
    { "claim": "...", "notes": "..." }
  ],
  "prohibited_claims": [
    { "claim": "...", "reason": "...", "regulation_reference": "..." }
  ],
  "restricted_or_conditional_claims": [
    { "claim": "...", "condition": "...", "regulation_reference": "..." }
  ]
}
```

`general-advertising-code.json` holds cross-category principles (MCMC
advertising code — misleading claims, substantiation, testimonials,
superlatives) and has a `principles` array instead of the claim arrays.

### Validation

`src/lib/regulatory-rules.ts` validates every file against a Zod schema on
load. If a file is malformed (missing a required field, wrong type), the API
route will fail loudly with a clear error at request time rather than
silently sending broken data to the model — check the server logs if
`/api/check` starts erroring after an edit here.

### Adding a new category

1. Copy an existing category file, give it a new `category_id` /
   `category_label`, fill in real sourced content.
2. Import and register it in `src/lib/regulatory-rules.ts`
   (`CATEGORY_RULES` array).
3. The dropdown on the check page and the API route both derive their
   category list from that same file — no other code changes needed.

## Why this structure

- **Auditable**: a non-engineer (compliance/legal reviewer) can open these
  files and read exactly what the model is told, without touching app code.
- **Cacheable**: all category files are concatenated into a single static
  system-instruction block that is byte-identical on every API call, which
  is what makes Gemini's context caching kick in (see comments in
  `src/app/api/check/route.ts`).
- **Traceable**: every prohibited/restricted claim carries a
  `regulation_reference`, which the model is instructed to echo back in its
  `flagged_phrases` output — so a flagged phrase always points back to a
  specific rule in these files, not a model guess.
