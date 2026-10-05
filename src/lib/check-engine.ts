import { Type } from "@google/genai";

import { generateJson } from "@/lib/ai";
import { COMPLIANCE_SYSTEM_INSTRUCTION } from "@/lib/compliance-prompt";
import { complianceResultSchema, type ComplianceResult } from "@/lib/compliance-schema";
import { CATEGORIES } from "@/lib/regulatory-rules";

export const RESPONSE_LANGUAGES: Record<string, string> = {
  en: "English",
  ms: "Bahasa Melayu",
  zh: "Simplified Chinese",
  ta: "Tamil",
};

export interface ProductContext {
  name: string;
  registrationNo?: string;
  approvedClaims?: string[];
  avoidTerms?: string[];
}

const CHECK_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    flagged_phrases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING },
          reason: { type: Type.STRING },
          regulation_reference: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["critical", "high", "medium", "low"] },
        },
        required: ["phrase", "reason", "regulation_reference", "severity"],
      },
    },
    safe_rewrite_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["score", "flagged_phrases", "safe_rewrite_suggestions"],
};

function productBlock(product?: ProductContext): string {
  if (!product) return "";
  const lines = [`\n\nBrand vault (for product "${product.name}"):`];
  if (product.registrationNo) lines.push(`- Registration / notification no.: ${product.registrationNo}`);
  if (product.approvedClaims?.length) {
    lines.push(`- Approved claims (registered / substantiated by the brand):\n${product.approvedClaims.map((c) => `  * ${c}`).join("\n")}`);
  }
  if (product.avoidTerms?.length) {
    lines.push(`- Terms the brand wants to avoid: ${product.avoidTerms.join(", ")}`);
  }
  return lines.join("\n");
}

/**
 * Runs one compliance check. Used by /api/check and by the Content Studio
 * (which checks every variant it writes). Reasons are written in the UI
 * language; rewrites stay in the language of the original copy.
 */
export async function runComplianceCheck({
  adCopy,
  category,
  locale,
  product,
}: {
  adCopy: string;
  category: string;
  locale: string;
  product?: ProductContext;
}): Promise<ComplianceResult> {
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const responseLanguage = RESPONSE_LANGUAGES[locale] ?? "English";

  const userText = `Category: ${categoryLabel} (category_id: "${category}")

EXPLANATION LANGUAGE (mandatory): write every "reason" string entirely in ${responseLanguage}, even if the copy is in another language. Keep each "phrase" exactly as written in the copy, and keep "regulation_reference" verbatim from the rules block. Write "safe_rewrite_suggestions" in the SAME language as the copy below (NOT necessarily ${responseLanguage}).${productBlock(product)}

Copy to review:
"""
${adCopy}
"""

Reminder: "reason" must be in ${responseLanguage}; rewrites must match the copy's own language.`;

  return generateJson({
    systemInstruction: COMPLIANCE_SYSTEM_INSTRUCTION,
    userText,
    responseSchema: CHECK_RESPONSE_SCHEMA,
    schema: complianceResultSchema,
  });
}
