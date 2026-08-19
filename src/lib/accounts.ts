import { createClient } from "./supabase/server";

export interface CurrentAccount {
  userId: string;
  email: string | null;
  accountId: string;
  accountName: string;
  role: "owner" | "member";
  tier: "free" | "pro";
}

interface AccountMemberRow {
  account_id: string;
  role: "owner" | "member";
  accounts: { name: string; tier: "free" | "pro" } | null;
}

/**
 * Resolves the signed-in user's account membership. Returns null when
 * signed out, and also when Supabase isn't configured yet (no
 * NEXT_PUBLIC_SUPABASE_URL) - lets every page render in a signed-out state
 * rather than 500ing before a real Supabase project is wired up. There's no
 * generated-types setup for this project yet (no live Supabase project to
 * run `supabase gen types` against), so the joined row is cast through an
 * explicit interface rather than inferred.
 */
export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("account_members")
    .select("account_id, role, accounts(name, tier)")
    .eq("user_id", user.id)
    .single();

  const membership = data as unknown as AccountMemberRow | null;
  if (!membership || !membership.accounts) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    accountId: membership.account_id,
    accountName: membership.accounts.name,
    role: membership.role,
    tier: membership.accounts.tier,
  };
}
