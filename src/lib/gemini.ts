import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/**
 * Lazily-constructed singleton so a missing GEMINI_API_KEY only throws when
 * a request actually needs it, not at module import / build time.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example)."
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Cost-efficient model for classification/flagging and copywriting. Override
 * with GEMINI_MODEL to try a lighter (cheaper, less nuanced) or
 * a Pro (pricier, more careful on ambiguous claims) model.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
