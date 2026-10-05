import { z } from "zod";

export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const flaggedPhraseSchema = z.object({
  phrase: z.string(),
  reason: z.string(),
  regulation_reference: z.string(),
  // Older saved checks (before severity existed) have no severity; treat as medium.
  severity: z.enum(SEVERITIES).default("medium"),
});

export const complianceResultSchema = z.object({
  score: z.number().min(0).max(100),
  flagged_phrases: z.array(flaggedPhraseSchema),
  safe_rewrite_suggestions: z.array(z.string()),
});

export type FlaggedPhrase = z.infer<typeof flaggedPhraseSchema>;
export type ComplianceResult = z.infer<typeof complianceResultSchema>;
