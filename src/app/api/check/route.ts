import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { z } from "zod";

import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { COMPLIANCE_SYSTEM_INSTRUCTION } from "@/lib/compliance-prompt";
import { CATEGORIES, isCategoryId } from "@/lib/regulatory-rules";
import { complianceResultSchema } from "@/lib/compliance-schema";

const MAX_AD_COPY_LENGTH = 4000;

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
  | "check_failed";

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
              text: `Category: ${categoryLabel} (category_id: "${category}")\n\nWrite the "reason" fields and "safe_rewrite_suggestions" in ${responseLanguage}. Keep each "phrase" in the exact original wording/language it appears in below (do not translate the quoted phrase itself). Keep "regulation_reference" as-is from the rules block.\n\nAd copy to review:\n"""\n${adCopy}\n"""`,
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

    return NextResponse.json(result.data);
  } catch (err) {
    console.error(err);
    return errorResponse("check_failed", 502);
  }
}
