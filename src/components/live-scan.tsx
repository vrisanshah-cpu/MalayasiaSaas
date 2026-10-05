"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";


/**
 * A looping "live scan" of a realistic Malaysian seller listing. It exists to
 * show the product doing its job rather than describing it: the visitor sees
 * their own category of copy get flagged, with the rule named, before they
 * have typed anything.
 */
type Token = { text: string; flag?: string; fix?: string };

const SAMPLE: Token[] = [
  { text: "MIRACLE GLOW SERUM — " },
  { text: "anti-aging", flag: "MAB Guideline App. 3", fix: "supports the appearance of" },
  { text: " formula " },
  { text: "cures acne", flag: "NPRA Claims Guideline", fix: "helps control breakouts" },
  { text: " in " },
  { text: "7 days", flag: "Unverified quantitative claim", fix: "over time" },
  { text: ". " },
  { text: "100% guaranteed", flag: "MAB Guideline App. 3", fix: "backed by our returns policy" },
  { text: " results, " },
  { text: "no side effects", flag: "MAB Guideline App. 3", fix: "dermatologist-tested" },
  { text: ". Shop now!" },
];

export function LiveScan() {
  // null until we know: avoids rendering the animated version for someone who
  // asked for reduced motion, without setting state synchronously in an effect.
  const [revealed, setRevealed] = useState<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = window.setTimeout(() => setRevealed(SAMPLE.length), 0);
      return () => window.clearTimeout(id);
    }
    const id = setInterval(() => {
      setRevealed((n) => {
        const current = n ?? 0;
        return current >= SAMPLE.length ? 0 : current + 1;
      });
    }, 260);
    return () => clearInterval(id);
  }, []);

  const shown = revealed ?? 0;
  const done = shown >= SAMPLE.length;
  const flags = SAMPLE.slice(0, shown).filter((t) => t.flag).length;
  const score = Math.max(4, 100 - flags * 24);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-background/15 bg-background/[0.06] shadow-2xl backdrop-blur-sm">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-background/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-[11px] font-medium tracking-wide text-background/45">
          adcheck-my — live scan
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[11px] uppercase tracking-wider text-background/40">
          Cosmetics · Shopee listing
        </p>

        <p className="mt-3 text-sm leading-loose text-background/85 sm:text-[15px]">
          {SAMPLE.slice(0, shown).map((t, i) =>
            t.flag ? (
              <span
                key={i}
                className="relative mx-0.5 inline-block animate-[flagIn_320ms_ease-out] rounded bg-destructive/25 px-1 text-background underline decoration-destructive decoration-2 underline-offset-2"
              >
                {t.text}
              </span>
            ) : (
              <span key={i}>{t.text}</span>
            ),
          )}
          {!done && (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-background/70 align-middle" />
          )}
        </p>

        {/* result strip */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-background/10 pt-4">
          {done ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/20 px-2.5 py-1 text-xs font-semibold text-background">
                <AlertTriangle className="size-3.5" />
                {flags} blocked phrases
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-2.5 py-1 text-xs font-semibold text-background/70">
                <ShieldAlert className="size-3.5" />
                Risk {score}/100
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300/90">
                <CheckCircle2 className="size-3.5" />
                Rewrite ready
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-2.5 py-1 text-xs font-medium text-background/70">
                <Loader2 className="size-3.5 animate-spin" />
                Scanning…
              </span>
              <span className="text-xs text-background/40">
                {flags > 0 ? `${flags} flagged so far` : "checking against 122 rules"}
              </span>
            </>
          )}
        </div>

        {/* the payoff: a rewrite */}
        {done && (
          <div className="mt-3 animate-[flagIn_400ms_ease-out] rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-3">
            <p className="text-[11px] uppercase tracking-wider text-emerald-300/80">
              Safe rewrite
            </p>
            <p className="mt-1 text-sm text-background/85">
              MIRACLE GLOW SERUM — a formula that{" "}
              <span className="rounded bg-emerald-400/20 px-1">
                supports the appearance of
              </span>{" "}
              clearer-looking skin{" "}
              <span className="rounded bg-emerald-400/20 px-1">over time</span>.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flagIn {
          from { opacity: 0; transform: translateY(2px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
