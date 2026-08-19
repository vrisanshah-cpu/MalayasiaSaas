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
 * Cost-efficient model for classification/flagging tasks (the Haiku
 * equivalent in the Gemini lineup). gemini-2.5-flash returns a 404 for new
 * API keys as of this build (Gemini API error: "no longer available to new
 * users, use models/gemini-3.6-flash") — confirmed live against the API,
 * not assumed. Override with GEMINI_MODEL to try a different tier (e.g. a
 * "-lite" variant for lower cost, or a "-pro" variant for more careful
 * reasoning on ambiguous claims) once you've checked what's currently
 * available in Google AI Studio.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
