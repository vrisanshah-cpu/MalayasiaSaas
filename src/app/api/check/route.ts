import { NextResponse } from "next/server";
import { z } from "zod";

import { AiError } from "@/lib/ai";
import { RESPONSE_LANGUAGES, runComplianceCheck, type ProductContext } from "@/lib/check-engine";
import { isCategoryId } from "@/lib/regulatory-rules";
import { getCurrentAccount } from "@/lib/accounts";
import { createClient } from "@/lib/supabase/server";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";
import { getUsage, overQuota } from "@/lib/usage";

const MAX_AD_COPY_LENGTH = 4000;

// Signed-out visitors get a few free checks per hour per IP (best effort);
// signed-in usage is metered exactly per account by plan.
const ANON_CHECKS_PER_HOUR = Number(process.env.ANON_CHECKS_PER_HOUR ?? 6);

const requestSchema = z.object({
  adCopy: z.string().trim().min(1).max(MAX_AD_COPY_LENGTH),
  category: z.string().refine(isCategoryId),
  locale: z
    .string()
    .refine((v) => v in RESPONSE_LANGUAGES)
    .default("en"),
  productId: z.string().uuid().optional(),
});

// Stable machine-readable codes so the client can render a translated
// message in the user's selected UI language.
type ErrorCode =
  | "invalid_request"
  | "missing_api_key"
  | "empty_response"
  | "malformed_response"
  | "invalid_shape"
  | "check_failed"
  | "quota_exceeded"
  | "rate_limited";

function errorResponse(code: ErrorCode, status: number) {
  return NextResponse.json({ errorCode: code }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_request", 400);
  }

  const parsedRequest = requestSchema.safeParse(body);
  if (!parsedRequest.success) return errorResponse("invalid_request", 400);
  const { adCopy, category, locale, productId } = parsedRequest.data;

  const account = await getCurrentAccount();
  const supabase = account ? await createClient() : null;

  if (!account) {
    const limit = hitRateLimit(`check:${clientIp(request)}`, ANON_CHECKS_PER_HOUR, 60 * 60 * 1000);
    if (!limit.ok) return errorResponse("rate_limited", 429);
  } else if (supabase) {
    const usage = await getUsage(supabase, account.accountId);
    if (overQuota(account.tier, "check", usage)) return errorResponse("quota_exceeded", 402);
  }

  // Optional brand-vault context (signed-in only; RLS restricts to the account's own products).
  let product: ProductContext | undefined;
  if (account && supabase && productId) {
    const { data } = await supabase
      .from("products")
      .select("name, registration_no, approved_claims, avoid_terms")
      .eq("id", productId)
      .eq("account_id", account.accountId)
      .maybeSingle();
    if (data) {
      product = {
        name: data.name,
        registrationNo: data.registration_no ?? "",
        approvedClaims: data.approved_claims ?? [],
        avoidTerms: data.avoid_terms ?? [],
      };
    }
  }

  try {
    const result = await runComplianceCheck({ adCopy, category, locale, product });

    if (account && supabase) {
      const { error: insertError } = await supabase.from("checks").insert({
        account_id: account.accountId,
        user_id: account.userId,
        category,
        locale,
        ad_copy: adCopy,
        score: result.score,
        flagged_phrases: result.flagged_phrases,
        safe_rewrite_suggestions: result.safe_rewrite_suggestions,
      });
      // Don't fail the request over a history-save error - the user still
      // gets their result, it just won't show up in the dashboard.
      if (insertError) console.error("Failed to save check to history:", insertError);
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiError) return errorResponse(err.code, err.code === "missing_api_key" ? 500 : 502);
    console.error(err);
    return errorResponse("check_failed", 502);
  }
}
