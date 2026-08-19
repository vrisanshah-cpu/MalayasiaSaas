export const LOCALES = ["en", "ms", "zh", "ta"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ms: "Bahasa Melayu",
  zh: "中文",
  ta: "தமிழ்",
};

export const DEFAULT_LOCALE: Locale = "en";

export interface Messages {
  tagline: string;
  categoryLabel: string;
  adCopyLabel: string;
  adCopyPlaceholder: string;
  submitButton: string;
  checking: string;
  checkFailedTitle: string;
  errors: {
    missingKey: string;
    emptyResponse: string;
    malformedResponse: string;
    invalidShape: string;
    checkFailed: string;
    invalidRequest: string;
  };
  advisoryTitle: string;
  advisoryBody: string;
  scoreCardTitle: string;
  scoreLow: string;
  scoreMedium: string;
  scoreHigh: string;
  yourAdCopyTitle: string;
  flaggedPhrasesTitle: (count: number) => string;
  safeRewriteTitle: string;
  useThisRewrite: string;
  categories: {
    cosmetics: string;
    food_beverage: string;
    health_supplements: string;
  };
  languageLabel: string;
}
