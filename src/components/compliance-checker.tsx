"use client";

import { useState } from "react";
import { AlertTriangle, FileText, Flag, Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { CATEGORIES, type CategoryId } from "@/lib/regulatory-rules";
import type { ComplianceResult } from "@/lib/compliance-schema";
import { highlightPhrases } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Messages } from "@/lib/i18n/types";

const MAX_AD_COPY_LENGTH = 4000;

function scoreVisual(score: number, t: Messages) {
  if (score >= 80) {
    return {
      label: t.scoreLow,
      ring: "text-emerald-500",
      chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      badgeVariant: "secondary" as const,
    };
  }
  if (score >= 50) {
    return {
      label: t.scoreMedium,
      ring: "text-amber-500",
      chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      badgeVariant: "secondary" as const,
    };
  }
  return {
    label: t.scoreHigh,
    ring: "text-red-500",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
    badgeVariant: "destructive" as const,
  };
}

function ScoreRing({ score, ringClassName }: { score: number; ringClassName: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex size-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", ringClassName)}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums">{score}</span>
        <span className="text-muted-foreground text-[11px]">/100</span>
      </div>
    </div>
  );
}

export function ComplianceChecker() {
  const { locale, t } = useLocale();
  const [adCopy, setAdCopy] = useState("");
  const [category, setCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  // The reasons/rewrites inside `result` are only ever in the language that
  // was selected at submit time — switching the language dropdown alone
  // doesn't retranslate a result already on screen. Rather than leave a
  // stale-language result sitting under freshly-translated UI chrome (which
  // reads as broken translation), clear it so the user re-submits and gets
  // a result in the language they're now looking at. This is React's
  // "adjust state during render" pattern rather than an effect, so the
  // reset happens before paint with no stale-content flash.
  const [resultLocale, setResultLocale] = useState(locale);
  if (locale !== resultLocale) {
    setResultLocale(locale);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adCopy.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adCopy, category, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errorCode === "quota_exceeded") {
          throw new Error(t.billing.quotaExceeded);
        }
        const code = (data.errorCode as keyof Messages["errors"]) ?? "checkFailed";
        throw new Error(t.errors[code] ?? t.errors.checkFailed);
      }
      setResult(data as ComplianceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.checkFailed);
    } finally {
      setLoading(false);
    }
  }

  function applyRewrite(suggestion: string) {
    setAdCopy(suggestion);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const visual = result ? scoreVisual(result.score, t) : null;

  return (
    <>
      <Card className="border-border/60 gap-5 rounded-2xl py-5 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="category">
              {t.categoryLabel}
            </label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as CategoryId)}
            >
              <SelectTrigger id="category" className="w-full sm:w-64">
                <SelectValue>
                  {(value: CategoryId) =>
                    t.categories[value as keyof Messages["categories"]]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {t.categories[c.id as keyof Messages["categories"]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="ad-copy">
              {t.adCopyLabel}
            </label>
            <Textarea
              id="ad-copy"
              value={adCopy}
              onChange={(e) => setAdCopy(e.target.value.slice(0, MAX_AD_COPY_LENGTH))}
              placeholder={t.adCopyPlaceholder}
              rows={8}
              maxLength={MAX_AD_COPY_LENGTH}
              className="resize-none"
            />
            <div className="text-muted-foreground text-right text-xs tabular-nums">
              {adCopy.length} / {MAX_AD_COPY_LENGTH}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !adCopy.trim()}
            className="w-fit shadow-sm"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> {t.checking}
              </>
            ) : (
              <>
                <Sparkles /> {t.submitButton}
              </>
            )}
          </Button>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTriangle />
          <AlertTitle>{t.checkFailedTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && visual && (
        <div className="flex flex-col gap-5">
          <Alert className="rounded-2xl">
            <AlertTriangle />
            <AlertTitle>{t.advisoryTitle}</AlertTitle>
            <AlertDescription>{t.advisoryBody}</AlertDescription>
          </Alert>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center gap-5">
              <ScoreRing score={result.score} ringClassName={visual.ring} />
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {t.scoreCardTitle}
                </span>
                <Badge
                  variant={visual.badgeVariant}
                  className={cn("w-fit", visual.badgeVariant === "secondary" && visual.chip)}
                >
                  {visual.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="text-muted-foreground size-4" />
                {t.yourAdCopyTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed whitespace-pre-wrap">
                {highlightPhrases(adCopy, result.flagged_phrases).map((seg, i) =>
                  seg.type === "text" ? (
                    <span key={i}>{seg.text}</span>
                  ) : (
                    <Tooltip key={i}>
                      <TooltipTrigger
                        render={
                          <mark className="bg-red-200 dark:bg-red-900/60 cursor-help rounded px-0.5">
                            {seg.text}
                          </mark>
                        }
                      />
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium">{seg.flag.reason}</p>
                        <p className="text-muted-foreground mt-1">
                          {seg.flag.regulation_reference}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                )}
              </p>
            </CardContent>
          </Card>

          {result.flagged_phrases.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flag className="text-muted-foreground size-4" />
                  {t.flaggedPhrasesTitle(result.flagged_phrases.length)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {result.flagged_phrases.map((flag, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {i > 0 && <Separator className="mb-2" />}
                    <span className="font-medium">&ldquo;{flag.phrase}&rdquo;</span>
                    <span className="text-muted-foreground text-sm">{flag.reason}</span>
                    <span className="text-muted-foreground text-xs">
                      {flag.regulation_reference}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.safe_rewrite_suggestions.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="text-muted-foreground size-4" />
                  {t.safeRewriteTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {result.safe_rewrite_suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="bg-secondary/40 flex flex-col gap-2 rounded-xl border p-3"
                  >
                    <p className="whitespace-pre-wrap text-sm">{suggestion}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => applyRewrite(suggestion)}
                    >
                      {t.useThisRewrite}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
