import type { z } from "zod";

import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";

export class AiError extends Error {
  constructor(
    public code: "missing_api_key" | "empty_response" | "malformed_response" | "invalid_shape" | "check_failed",
    message?: string
  ) {
    super(message ?? code);
  }
}

const REQUEST_TIMEOUT_MS = 40_000;

function isTransient(err: unknown): boolean {
  const text = `${(err as Error)?.message ?? ""} ${(err as { cause?: { code?: string } })?.cause?.code ?? ""}`;
  return /ECONNRESET|ETIMEDOUT|fetch failed|timed out|timeout|503|429|UNAVAILABLE|overloaded|abort/i.test(text);
}

/**
 * One structured-JSON Gemini call: constrained by `responseSchema`, then
 * re-validated with Zod. Retries once on transient network / overload
 * errors (a hung or reset connection was observed in testing) and enforces
 * a timeout so a request never hangs for over a minute.
 *
 * `systemInstruction` must be a stable string (identical across calls) so
 * Gemini's implicit context caching can reuse the large rules block.
 */
export async function generateJson<T extends z.ZodType>({
  systemInstruction,
  userText,
  responseSchema,
  schema,
  temperature = 0.2,
}: {
  systemInstruction: string;
  userText: string;
  responseSchema: unknown;
  schema: T;
  temperature?: number;
}): Promise<z.infer<T>> {
  let ai;
  try {
    ai = getGeminiClient();
  } catch (err) {
    console.error(err);
    throw new AiError("missing_api_key");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema as never,
          temperature,
          httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        },
        contents: [{ role: "user", parts: [{ text: userText }] }],
      });

      const rawText = response.text;
      if (!rawText) throw new AiError("empty_response");

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        console.error("Gemini returned non-JSON output:", rawText.slice(0, 500));
        throw new AiError("malformed_response");
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        console.error("Gemini output failed schema validation:", result.error.issues.slice(0, 3));
        throw new AiError("invalid_shape");
      }
      return result.data;
    } catch (err) {
      lastError = err;
      if (err instanceof AiError && err.code !== "empty_response") throw err;
      if (attempt === 0 && (err instanceof AiError || isTransient(err))) continue;
      break;
    }
  }
  console.error("Gemini call failed:", lastError);
  if (lastError instanceof AiError) throw lastError;
  throw new AiError("check_failed");
}
