import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentAccount } from "@/lib/accounts";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/regulatory-rules";
import { DashboardTable, type CheckRow } from "@/components/dashboard-table";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");

  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("checks")
    .select("id, category, score, ad_copy, created_at")
    .eq("account_id", account.accountId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (category && CATEGORIES.some((c) => c.id === category)) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) console.error("Failed to load check history:", error);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12">
      <SiteHeader />
      <DashboardTable rows={(data as CheckRow[]) ?? []} activeCategory={category ?? ""} />
    </div>
  );
}
