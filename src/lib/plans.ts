export type Tier = "free" | "pro" | "business";

export interface PlanLimits {
  /** Compliance checks per calendar month (Infinity = fair-use unlimited). */
  checks: number;
  /** Content Studio generations per month (one generation = one batch of variants). */
  generations: number;
  /** Campaign Planner runs per month. */
  planner: number;
  /** Products in the brand vault. */
  products: number;
  /** Team seats including the owner. */
  seats: number;
}

export interface Plan {
  id: Tier;
  /** Monthly price in MYR (Stripe price is created separately, see scripts/setup-stripe.mjs). */
  priceMYR: number;
  limits: PlanLimits;
}

export const TRIAL_DAYS = 14;

export const PLANS: Record<Tier, Plan> = {
  free: {
    id: "free",
    priceMYR: 0,
    limits: { checks: 15, generations: 5, planner: 1, products: 1, seats: 1 },
  },
  pro: {
    id: "pro",
    priceMYR: 99,
    limits: { checks: Infinity, generations: 300, planner: 20, products: 15, seats: 3 },
  },
  business: {
    id: "business",
    priceMYR: 299,
    limits: { checks: Infinity, generations: 1500, planner: Infinity, products: 100, seats: 10 },
  },
};

export function isTier(value: unknown): value is Tier {
  return value === "free" || value === "pro" || value === "business";
}

export function isPaid(tier: Tier): boolean {
  return tier !== "free";
}

export function formatLimit(n: number): string {
  return Number.isFinite(n) ? String(n) : "∞";
}
