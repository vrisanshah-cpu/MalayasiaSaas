import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { z } from "zod";

import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { COMPLIANCE_SYSTEM_INSTRUCTION } from "@/lib/compliance-prompt";
import { CATEGORIES, isCategoryId } from "@/lib/regulatory-rules";
import { complianceResultSchema } from "@/lib/compliance-schema";
import { getCurrentAccount } from "@/lib/accounts";
import { createClient } from "@/lib/supabase/server";

const MAX_AD_COPY_LENGTH = 4000;

// Free-tier monthly check cap per account (shared across team members).
// Only enforced for signed-in users - anonymous checks (no account) stay
// unmetered since they're never saved to history in the first place.
const FREE_TIER_MONTHLY_LIMIT = Number(process.env.FREE_TIER_MONTHLY_LIMIT ?? 20);

const RESPONSE_LANGUAGES: Record<string, string> = {
  en: "English",
  ms: "Bahasa Melayu",
  zh: "Simplified Chinese",
  ta: "Tamil",
};

const requestSchema = z.object({
  adCopy: z.string().trim().min(1).max(MAX_AD_COPY_LENGTH),
  category: z.string().refine(isCategoryId),
  locale: z
    .string()
    .refine((v) => v in RESPONSE_LANGUAGES)
    .default("en"),
});

// Stable machine-readable codes so the client can render a translated
// message in the user's selected UI language rather than an English-only
// string baked into the API response. See src/lib/i18n/*.ts errors keys.
type ErrorCode =
  | "invalid_request"
  | "missing_api_key"
  | "empty_response"
  | "malformed_response"
  | "invalid_shape"
  | "check_failed"
  | "quota_exceeded";

function errorResponse(code: ErrorCode, status: number) {
  return NextResponse.json({ errorCode: code }, { status });
}

// The response schema Gemini is constrained to. Kept in lockstep with
// complianceResultSchema (Zod) below, which re-validates the parsed JSON as
// a defense-in-depth check before it reaches the client.
const RESPONSE_SCHEMA = {
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
        },
        required: ["phrase", "reason", "regulation_reference"],
      },
    },
    safe_rewrite_suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["score", "flagged_phrases", "safe_rewrite_suggestions"],
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_request", 400);
  }

  const parsedRequest = requestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse("invalid_request", 400);
  }
  const { adCopy, category, locale } = parsedRequest.data;
  const categoryLabel =
    CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const responseLanguage = RESPONSE_LANGUAGES[locale];

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err) {
    console.error(err);
    return errorResponse("missing_api_key", 500);
  }

  // Signed-in users get their check saved to account history; anonymous
  // users can still use the checker (Phase 1 behavior preserved), it's
  // just never persisted. account is null when signed out.
  const account = await getCurrentAccount();

  if (account && account.tier === "free") {
    const supabase = await createClient();
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("checks")
      .select("id", { count: "exact", head: true })
      .eq("account_id", account.accountId)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= FREE_TIER_MONTHLY_LIMIT) {
      return errorResponse("quota_exceeded", 402);
    }
  }

  try {
    // systemInstruction is COMPLIANCE_SYSTEM_INSTRUCTION unmodified on every
    // call (see that file for why) — this is the piece Gemini's implicit
    // context caching can reuse across requests, since only the "contents"
    // user turn below changes per submission. No explicit cache management
    // code is needed for this to take effect; if the rules block grows
    // large enough to warrant guaranteed (rather than best-effort) cache
    // discounts, switch to ai.caches.create() and pass the resulting name
    // via config.cachedContent instead.
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: COMPLIANCE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Category: ${categoryLabel} (category_id: "${category}")\n\nRESPONSE LANGUAGE (mandatory): write every "reason" string and every "safe_rewrite_suggestions" entry entirely in ${responseLanguage}. This applies even if the ad copy below is in a different language. Do not fall back to English unless ${responseLanguage} is English. Two exceptions only: keep each "phrase" in the exact original wording/language it appears in below (do not translate the quoted phrase itself), and keep "regulation_reference" as-is from the rules block.\n\nAd copy to review:\n"""\n${adCopy}\n"""\n\nReminder: "reason" and "safe_rewrite_suggestions" must be in ${responseLanguage}, not English.`,
            },
          ],
        },
      ],
    });

    const rawText = response.text;
    if (!rawText) {
      return errorResponse("empty_response", 502);
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      console.error("Gemini returned non-JSON output:", rawText);
      return errorResponse("malformed_response", 502);
    }

    const result = complianceResultSchema.safeParse(parsedJson);
    if (!result.success) {
      console.error("Gemini output failed schema validation:", result.error);
      return errorResponse("invalid_shape", 502);
    }

    if (account) {
      const supabase = await createClient();
      const { error: insertError } = await supabase.from("checks").insert({
        account_id: account.accountId,
        user_id: account.userId,
        category,
        locale,
        ad_copy: adCopy,
        score: result.data.score,
        flagged_phrases: result.data.flagged_phrases,
        safe_rewrite_suggestions: result.data.safe_rewrite_suggestions,
      });
      if (insertError) {
        // Don't fail the request over a history-save error - the user
        // still gets their result, it just won't show up in the dashboard.
        console.error("Failed to save check to history:", insertError);
      }
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error(err);
    return errorResponse("check_failed", 502);
  }
}
