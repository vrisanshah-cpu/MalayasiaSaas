"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Tier } from "@/lib/plans";

export function BillingPageClient({
  tier,
  isOwner,
  freeLimit,
}: {
  tier: Tier;
  isOwner: boolean;
  freeLimit: number;
}) {
  const { t } = useLocale();
  const [redirecting, setRedirecting] = useState(false);

  async function handleUpgrade() {
    setRedirecting(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // fall through to reset the button below
    }
    setRedirecting(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">{t.billing.title}</h2>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>{t.billing.currentPlan}</span>
            <Badge variant={tier === "free" ? "secondary" : "default"}>
              {tier === "free" ? t.billing.freePlan : t.billing.proPlan}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {tier === "free"
              ? t.billing.freeDescription(freeLimit)
              : t.billing.proDescription}
          </p>
          {isOwner && tier === "free" && (
            <div className="flex flex-col gap-2">
              <Button onClick={handleUpgrade} disabled={redirecting} className="w-fit">
                {redirecting ? (
                  <>
                    <Loader2 className="animate-spin" /> {t.billing.upgrading}
                  </>
                ) : (
                  t.billing.upgradeButton
                )}
              </Button>
              <p className="text-muted-foreground text-xs">{t.billing.trialNote}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
