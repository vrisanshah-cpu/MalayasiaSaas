import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/lib/accounts";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type ErrorCode = "unauthorized" | "forbidden" | "not_configured" | "checkout_failed";

function errorResponse(code: ErrorCode, status: number) {
  return NextResponse.json({ errorCode: code }, { status });
}

export async function POST(request: Request) {
  const account = await getCurrentAccount();
  if (!account) return errorResponse("unauthorized", 401);
  if (account.role !== "owner") return errorResponse("forbidden", 403);

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return errorResponse("not_configured", 500);

  const { origin } = new URL(request.url);

  try {
    const stripe = getStripeClient();
    const admin = createAdminClient();

    // Reuse an existing Stripe customer for this account if we already
    // created one on a prior (possibly abandoned) checkout attempt.
    const { data: existing } = await admin
      .from("accounts")
      .select("stripe_customer_id")
      .eq("id", account.accountId)
      .single();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: existing?.stripe_customer_id ?? undefined,
      customer_email: existing?.stripe_customer_id ? undefined : account.email ?? undefined,
      client_reference_id: account.accountId,
      subscription_data: { metadata: { account_id: account.accountId } },
      success_url: `${origin}/dashboard/billing?checkout=success`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
    });

    if (!session.url) return errorResponse("checkout_failed", 502);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return errorResponse("checkout_failed", 502);
  }
}
