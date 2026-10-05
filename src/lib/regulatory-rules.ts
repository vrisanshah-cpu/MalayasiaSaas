/**
 * Loader + Zod validation for the sourced regulatory rules that live in
 * /regulatory-rules (project root). See regulatory-rules/README.md for the
 * editing workflow — that folder is the single source of truth for claim
 * rules; nothing about actual regulation content should be hardcoded here
 * or in the API route's prompt strings.
 */
import { z } from "zod";

import cosmeticsData from "../../regulatory-rules/cosmetics.json";
import foodBeverageData from "../../regulatory-rules/food-beverage.json";
import healthSupplementsData from "../../regulatory-rules/health-supplements.json";
import generalAdvertisingCodeData from "../../regulatory-rules/general-advertising-code.json";

const referenceSchema = z.object({ label: z.string(), url: z.string().url() });

const sourceSchema = z.object({
  title: z.string(),
  citation: z.string(),
  last_reviewed_by: z.string(),
});

const categoryRulesSchema = z.object({
  category_id: z.string(),
  category_label: z.string(),
  source: sourceSchema,
  references: z.array(referenceSchema).default([]),
  permitted_claims: z.array(
    z.object({ claim: z.string(), notes: z.string() })
  ),
  prohibited_claims: z.array(
    z.object({
      claim: z.string(),
      reason: z.string(),
      regulation_reference: z.string(),
    })
  ),
  restricted_or_conditional_claims: z.array(
    z.object({
      claim: z.string(),
      condition: z.string(),
      regulation_reference: z.string(),
    })
  ),
});

const generalCodeSchema = z.object({
  applies_to: z.literal("all_categories"),
  label: z.string(),
  source: sourceSchema,
  references: z.array(referenceSchema).default([]),
  principles: z.array(
    z.object({ principle: z.string(), regulation_reference: z.string() })
  ),
});

export type CategoryRules = z.infer<typeof categoryRulesSchema>;
export type GeneralCode = z.infer<typeof generalCodeSchema>;

/**
 * Register every category file here. The dropdown on the check page and the
 * API route both derive their category list from this array, so adding a
 * new regulatory-rules/*.json file + an entry here is the only step needed
 * to add a category.
 */
export const CATEGORY_RULES: CategoryRules[] = [
  categoryRulesSchema.parse(cosmeticsData),
  categoryRulesSchema.parse(foodBeverageData),
  categoryRulesSchema.parse(healthSupplementsData),
];

export const GENERAL_ADVERTISING_CODE = generalCodeSchema.parse(
  generalAdvertisingCodeData
);

export const CATEGORIES = CATEGORY_RULES.map((rules) => ({
  id: rules.category_id,
  label: rules.category_label,
}));

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

/** Total number of individual sourced rules loaded - shown on marketing pages. */
export const RULE_COUNT =
  GENERAL_ADVERTISING_CODE.principles.length +
  CATEGORY_RULES.reduce(
    (n, r) =>
      n +
      r.permitted_claims.length +
      r.prohibited_claims.length +
      r.restricted_or_conditional_claims.length,
    0
  );

function formatCategoryRules(rules: CategoryRules): string {
  const lines: string[] = [];
  lines.push(`### ${rules.category_label} (category_id: "${rules.category_id}")`);
  lines.push(
    `Source: ${rules.source.title} — ${rules.source.citation}`
  );

  lines.push("\nPermitted claims:");
  for (const c of rules.permitted_claims) {
    lines.push(`- "${c.claim}" — ${c.notes}`);
  }

  lines.push("\nProhibited claims:");
  for (const c of rules.prohibited_claims) {
    lines.push(
      `- "${c.claim}" — ${c.reason} [regulation_reference: ${c.regulation_reference}]`
    );
  }

  lines.push("\nRestricted / conditional claims:");
  for (const c of rules.restricted_or_conditional_claims) {
    lines.push(
      `- "${c.claim}" — permitted only if: ${c.condition} [regulation_reference: ${c.regulation_reference}]`
    );
  }

  return lines.join("\n");
}

function formatGeneralCode(): string {
  const lines: string[] = [];
  lines.push(`### ${GENERAL_ADVERTISING_CODE.label}`);
  lines.push(
    `Source: ${GENERAL_ADVERTISING_CODE.source.title} — ${GENERAL_ADVERTISING_CODE.source.citation}`
  );
  lines.push("\nPrinciples (apply to every category):");
  for (const p of GENERAL_ADVERTISING_CODE.principles) {
    lines.push(`- ${p.principle} [regulation_reference: ${p.regulation_reference}]`);
  }
  return lines.join("\n");
}

/**
 * The full rules text, identical on every call. This is deliberately the
 * ENTIRE rule set (all categories, not just the one being checked) so the
 * text passed as the model's system instruction never changes between
 * requests — that byte-for-byte stability is what makes Gemini's context
 * caching apply. See the caching comment in src/app/api/check/route.ts.
 */
export function buildRulesPromptBlock(): string {
  const sections = [
    formatGeneralCode(),
    ...CATEGORY_RULES.map(formatCategoryRules),
  ];
  return sections.join("\n\n");
}
