"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

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

const MAX_AD_COPY_LENGTH = 4000;

function scoreVisual(score: number) {
  if (score >= 80) {
    return {
      label: "Low concern",
      className: "text-emerald-600 dark:text-emerald-400",
      badgeVariant: "secondary" as const,
    };
  }
  if (score >= 50) {
    return {
      label: "Needs review",
      className: "text-amber-600 dark:text-amber-400",
      badgeVariant: "secondary" as const,
    };
  }
  return {
    label: "High risk",
    className: "text-red-600 dark:text-red-400",
    badgeVariant: "destructive" as const,
  };
}

export function ComplianceChecker() {
  const [adCopy, setAdCopy] = useState("");
  const [category, setCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceResult | null>(null);

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
        body: JSON.stringify({ adCopy, category }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setResult(data as ComplianceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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

  const visual = result ? scoreVisual(result.score) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">AdCheck MY</h1>
        <p className="text-muted-foreground text-sm">
          Screen ad copy for likely Malaysian advertising compliance issues
          before you publish — F&amp;B, cosmetics, and health supplement
          claim rules.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="category">
            Category
          </label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as CategoryId)}
          >
            <SelectTrigger id="category" className="w-full sm:w-64">
              <SelectValue>
                {(value: CategoryId) =>
                  CATEGORIES.find((c) => c.id === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="ad-copy">
            Ad copy
          </label>
          <Textarea
            id="ad-copy"
            value={adCopy}
            onChange={(e) => setAdCopy(e.target.value.slice(0, MAX_AD_COPY_LENGTH))}
            placeholder="Paste your caption, product description, or ad copy here — English, Bahasa Melayu, or Manglish all work."
            rows={8}
            maxLength={MAX_AD_COPY_LENGTH}
          />
          <div className="text-muted-foreground text-right text-xs">
            {adCopy.length} / {MAX_AD_COPY_LENGTH}
          </div>
        </div>

        <Button type="submit" disabled={loading || !adCopy.trim()} className="w-fit">
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Checking...
            </>
          ) : (
            <>
              <Sparkles /> Check compliance
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Check failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && visual && (
        <div className="flex flex-col gap-4">
          <Alert>
            <AlertTriangle />
            <AlertTitle>Advisory tool — not a substitute for legal or regulatory review</AlertTitle>
            <AlertDescription>
              This score and these flags are guidance only. Ambiguous claims
              are called out with lower confidence rather than a false
              guarantee — always confirm borderline claims with qualified
              regulatory or legal counsel before publishing.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Compliance score</span>
                <Badge variant={visual.badgeVariant}>{visual.label}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-5xl font-bold", visual.className)}>
                {result.score}
                <span className="text-muted-foreground text-xl font-normal">/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your ad copy</CardTitle>
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
                          <mark className="bg-red-200 dark:bg-red-900/60 rounded px-0.5 cursor-help">
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
            <Card>
              <CardHeader>
                <CardTitle>Flagged phrases ({result.flagged_phrases.length})</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Safe rewrite suggestions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {result.safe_rewrite_suggestions.map((suggestion, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
                    <p className="whitespace-pre-wrap text-sm">{suggestion}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => applyRewrite(suggestion)}
                    >
                      Use this rewrite
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
