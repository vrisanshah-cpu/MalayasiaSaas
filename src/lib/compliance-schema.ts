import { z } from "zod";

export const flaggedPhraseSchema = z.object({
  phrase: z.string(),
  reason: z.string(),
  regulation_reference: z.string(),
});

export const complianceResultSchema = z.object({
  score: z.number().min(0).max(100),
  flagged_phrases: z.array(flaggedPhraseSchema),
  safe_rewrite_suggestions: z.array(z.string()),
});

export type FlaggedPhrase = z.infer<typeof flaggedPhraseSchema>;
export type ComplianceResult = z.infer<typeof complianceResultSchema>;
