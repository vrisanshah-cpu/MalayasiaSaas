/**
 * Best-effort in-memory limiter for ANONYMOUS "try it now" usage, so a
 * free demo can't be used to drain the Gemini budget. On serverless each
 * instance keeps its own counters, so this is a soft cap, not a guarantee -
 * it stops casual abuse and loops, and signed-in usage is metered exactly
 * (per account, in the database) instead.
 */
const buckets = new Map<string, number[]>();

export interface LimitResult {
  ok: boolean;
  remaining: number;
}

export function hitRateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, remaining: 0 };
  }
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, remaining: limit - hits.length };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
