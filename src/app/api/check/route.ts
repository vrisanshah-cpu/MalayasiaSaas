import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { z } from "zod";

import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { COMPLIANCE_SYSTEM_INSTRUCTION } from "@/lib/compliance-prompt";
import { CATEGORIES, isCategoryId } from "@/lib/regulatory-rules";
import { complianceResultSchema } from "@/lib/compliance-schema";

const MAX_AD_COPY_LENGTH = 4000;

const requestSchema = z.object({
  adCopy: z
    .string()
    .trim()
    .min(1, "Ad copy is required.")
    .max(
      MAX_AD_COPY_LENGTH,
      `Ad copy must be ${MAX_AD_COPY_LENGTH} characters or fewer.`
    ),
  category: z
    .string()
    .refine(isCategoryId, { message: "Unknown category." }),
});

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
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedRequest = requestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }
  const { adCopy, category } = parsedRequest.data;
  const categoryLabel =
    CATEGORIES.find((c) => c.id === category)?.label ?? category;

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server is not configured with a Gemini API key." },
      { status: 500 }
    );
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
              text: `Category: ${categoryLabel} (category_id: "${category}")\n\nAd copy to review:\n"""\n${adCopy}\n"""`,
            },
          ],
        },
      ],
    });

    const rawText = response.text;
    if (!rawText) {
      return NextResponse.json(
        { error: "The model returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      console.error("Gemini returned non-JSON output:", rawText);
      return NextResponse.json(
        { error: "The model returned a malformed response. Please try again." },
        { status: 502 }
      );
    }

    const result = complianceResultSchema.safeParse(parsedJson);
    if (!result.success) {
      console.error("Gemini output failed schema validation:", result.error);
      return NextResponse.json(
        { error: "The model returned a response in an unexpected shape. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "The compliance check failed. Please try again." },
      { status: 502 }
    );
  }
}
