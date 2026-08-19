import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentAccount } from "@/lib/accounts";
import { BillingPageClient } from "@/components/billing-page-client";

const FREE_TIER_MONTHLY_LIMIT = Number(process.env.FREE_TIER_MONTHLY_LIMIT ?? 20);

export default async function BillingPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-12">
      <SiteHeader />
      <BillingPageClient
        tier={account.tier}
        isOwner={account.role === "owner"}
        freeLimit={FREE_TIER_MONTHLY_LIMIT}
      />
    </div>
  );
}
