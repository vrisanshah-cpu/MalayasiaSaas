import type { SupabaseClient } from "@supabase/supabase-js";

import { PLANS, type Tier } from "@/lib/plans";

export type UsageKind = "check" | "generate" | "planner";

export interface Usage {
  checks: number;
  generations: number;
  planner: number;
}

export function startOfMonthISO(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * This month's usage for an account. Checks are counted from the existing
 * `checks` history table; generations and planner runs from `usage_events`.
 * If the workspace migration hasn't been applied yet, the usage_events
 * query errors and we treat those counts as zero rather than blocking.
 */
export async function getUsage(supabase: SupabaseClient, accountId: string): Promise<Usage> {
  const since = startOfMonthISO();

  const [checks, events] = await Promise.all([
    supabase
      .from("checks")
      .select("id", { count: "exact", head: true })
      .eq("account_id", accountId)
      .gte("created_at", since),
    supabase
      .from("usage_events")
      .select("kind")
      .eq("account_id", accountId)
      .gte("created_at", since),
  ]);

  const rows = (events.data ?? []) as { kind: string }[];
  return {
    checks: checks.count ?? 0,
    generations: rows.filter((r) => r.kind === "generate").length,
    planner: rows.filter((r) => r.kind === "planner").length,
  };
}

export function overQuota(tier: Tier, kind: UsageKind, usage: Usage): boolean {
  const limits = PLANS[tier].limits;
  if (kind === "check") return usage.checks >= limits.checks;
  if (kind === "generate") return usage.generations >= limits.generations;
  return usage.planner >= limits.planner;
}

export async function recordUsage(
  supabase: SupabaseClient,
  event: { accountId: string; userId: string; kind: "generate" | "planner" }
) {
  const { error } = await supabase.from("usage_events").insert({
    account_id: event.accountId,
    user_id: event.userId,
    kind: event.kind,
  });
  if (error) console.error("Failed to record usage event:", error);
}
