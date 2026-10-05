"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileSearch,
  Languages,
  Layers,
  ShieldAlert,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ComplianceChecker } from "@/components/compliance-checker";
import { useLocale } from "@/lib/i18n/locale-context";

// Real prohibited terms pulled from the loaded rule files, kept short so each
// one reads as a genuine ad phrase rather than a regex.
const BANNED_TERMS = [
  { text: "anti-aging", rule: "MAB Guideline App. 3" },
  { text: "no side effect", rule: "MAB Guideline App. 3" },
  { text: "miracle", rule: "MAB Guideline App. 3" },
  { text: "cure", rule: "Medicines Act 1956 s.3" },
  { text: "No. 1", rule: "MAB Guideline App. 3" },
  { text: "100% guaranteed", rule: "MAB Guideline App. 3" },
  { text: "grow hair in 7 days", rule: "NPRA Claims Guideline" },
  { text: "best quality", rule: "Food Regulations 1985" },
  { text: "instant cure", rule: "MAB Guideline App. 3" },
  { text: "the only", rule: "MAB Guideline App. 3" },
  { text: "100% pure", rule: "Food Regulations 1985" },
  { text: "wonders", rule: "MAB Guideline App. 3" },
];

export function LandingPage({
  ruleCount,
  header,
}: {
  ruleCount: number;
  header?: React.ReactNode;
}) {
  const { t } = useLocale();
  const l = t.landing;

  return (
    <div className="flex flex-col">
      {/* Hero — the site header sits inside it so there is no colour seam. */}
      <section className="relative overflow-hidden border-b bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl sm:h-[42rem] sm:w-[42rem]"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:pb-24">
          {header}
          <div className="mt-14 sm:mt-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
              <ShieldAlert className="size-3.5" />
              {l.badge}
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {l.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-background/70 sm:text-lg">
              {l.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-11 px-5 text-base"
                render={<a href="#checker" />}
                nativeButton={false}
              >
                {l.heroCta}
                <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 border-background/25 bg-transparent px-5 text-base text-background hover:bg-background/10 hover:text-background"
                render={<a href="#banned" />}
                nativeButton={false}
              >
                {l.heroCtaSecondary}
              </Button>
            </div>
            <p className="mt-4 text-sm text-background/50">{l.heroNote}</p>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-background/15 pt-8 sm:grid-cols-4">
            <Stat value={String(ruleCount)} label={l.statsRules} />
            <Stat value="3" label={l.statsCategories} />
            <Stat value="4" label={l.statsLanguages} />
            <Stat value="~10s" label={l.statsTime} />
          </dl>
        </div>
      </section>

      {/* The checker, front and centre */}
      <section id="checker" className="mx-auto w-full max-w-3xl scroll-mt-8 px-4 py-14">
        <ComplianceChecker />
      </section>

      {/* Banned words */}
      <section id="banned" className="scroll-mt-8 border-y bg-muted/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            {l.bannedTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {l.bannedSubtitle}
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {BANNED_TERMS.map((term) => (
              <li
                key={term.text}
                className="group flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-destructive/40"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="bg-destructive/15 px-1.5 py-0.5 text-destructive line-through decoration-destructive/60">
                    {term.text}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{term.rule}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{l.bannedNote}</p>

          <div className="mt-8 rounded-xl border bg-card p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="size-4 text-primary" />
              {l.evidenceTitle}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {l.evidenceBody}
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{l.howTitle}</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          <Step
            n={1}
            icon={<FileSearch className="size-5" />}
            title={l.howStep1Title}
            body={l.howStep1Body}
          />
          <Step
            n={2}
            icon={<Layers className="size-5" />}
            title={l.howStep2Title}
            body={l.howStep2Body}
          />
          <Step
            n={3}
            icon={<Wand2 className="size-5" />}
            title={l.howStep3Title}
            body={l.howStep3Body}
          />
        </ol>
      </section>

      {/* Who it's for */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{l.whoTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {l.whoBody}
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Languages className="size-4 text-primary" />
              English · BM · 中文 · தமிழ்
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              ~10s to a verdict
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Rewrites, not just warnings
            </li>
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{l.ctaTitle}</h2>
          <p className="mt-3 text-sm text-background/70">{l.ctaBody}</p>
          <div className="mt-7 flex justify-center">
            <Button
              size="lg"
              className="h-11 px-5 text-base"
              render={<a href="#checker" />}
              nativeButton={false}
            >
              {l.ctaButton}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer — kept visible, not buried in a footer */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="size-4 text-amber-600" />
              {l.disclaimerTitle}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {l.disclaimerBody}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</dt>
      <dd className="mt-1 text-xs uppercase tracking-wider text-background/50">{label}</dd>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {n}
        </span>
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </li>
  );
}
