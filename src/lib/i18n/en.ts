import type { Messages } from "./types";

const en: Messages = {
  tagline:
    "Screen ad copy for likely Malaysian advertising compliance issues before you publish — F&B, cosmetics, and health supplement claim rules.",
  categoryLabel: "Category",
  adCopyLabel: "Ad copy",
  adCopyPlaceholder:
    "Paste your caption, product description, or ad copy here — English, Bahasa Melayu, or Manglish all work.",
  submitButton: "Check compliance",
  checking: "Checking...",
  checkFailedTitle: "Check failed",
  errors: {
    missingKey: "Server is not configured with a Gemini API key.",
    emptyResponse: "The model returned an empty response. Please try again.",
    malformedResponse:
      "The model returned a malformed response. Please try again.",
    invalidShape:
      "The model returned a response in an unexpected shape. Please try again.",
    checkFailed: "The compliance check failed. Please try again.",
    invalidRequest: "Please check your ad copy and category, then try again.",
  },
  advisoryTitle:
    "Advisory tool — not a substitute for legal or regulatory review",
  advisoryBody:
    "This score and these flags are guidance only. Ambiguous claims are called out with lower confidence rather than a false guarantee — always confirm borderline claims with qualified regulatory or legal counsel before publishing.",
  scoreCardTitle: "Compliance score",
  scoreLow: "Low concern",
  scoreMedium: "Needs review",
  scoreHigh: "High risk",
  yourAdCopyTitle: "Your ad copy",
  flaggedPhrasesTitle: (count) => `Flagged phrases (${count})`,
  safeRewriteTitle: "Safe rewrite suggestions",
  useThisRewrite: "Use this rewrite",
  categories: {
    cosmetics: "Cosmetics",
    food_beverage: "Food & Beverage",
    health_supplements: "Health Supplements",
  },
  languageLabel: "Language",
};

export default en;
