import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentAccount } from "@/lib/accounts";
import { createClient } from "@/lib/supabase/server";
import { TeamPageClient, type MemberRow } from "@/components/team-page-client";

export default async function TeamPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_members")
    .select("user_id, email, role, created_at")
    .eq("account_id", account.accountId)
    .order("created_at", { ascending: true });

  if (error) console.error("Failed to load team members:", error);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <SiteHeader />
      <TeamPageClient members={(data as MemberRow[]) ?? []} isOwner={account.role === "owner"} />
    </div>
  );
}
