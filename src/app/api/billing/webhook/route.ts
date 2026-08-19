import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe webhook. Configure this URL (https://your-domain/api/billing/webhook)
 * in the Stripe dashboard, subscribed to at least: checkout.session.completed,
 * customer.subscription.updated, customer.subscription.deleted. Uses the
 * service-role Supabase client since there's no signed-in user on a webhook
 * request - this is the one place account.tier is allowed to change.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const accountId = session.client_reference_id;
        if (accountId && session.customer) {
          await admin
            .from("accounts")
            .update({
              tier: "pro",
              stripe_customer_id: String(session.customer),
              stripe_subscription_id: session.subscription
                ? String(session.subscription)
                : null,
            })
            .eq("id", accountId);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = subscription.metadata?.account_id;
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        if (accountId) {
          await admin
            .from("accounts")
            .update({ tier: isActive ? "pro" : "free" })
            .eq("id", accountId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = subscription.metadata?.account_id;
        if (accountId) {
          await admin.from("accounts").update({ tier: "free" }).eq("id", accountId);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Failed to process Stripe webhook event:", err);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
