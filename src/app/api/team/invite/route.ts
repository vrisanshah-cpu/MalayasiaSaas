import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAccount } from "@/lib/accounts";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/plans";

const requestSchema = z.object({ email: z.string().trim().email() });

type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "invalid_request"
  | "seat_limit"
  | "invite_failed";

function errorResponse(code: ErrorCode, status: number) {
  return NextResponse.json({ errorCode: code }, { status });
}

export async function POST(request: Request) {
  const account = await getCurrentAccount();
  if (!account) return errorResponse("unauthorized", 401);
  if (account.role !== "owner") return errorResponse("forbidden", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_request", 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("invalid_request", 400);

  const { origin } = new URL(request.url);

  try {
    const admin = createAdminClient();

    // Seats are capped per plan; without this a free account (1 seat) could
    // invite unlimited members.
    const { count } = await admin
      .from("account_members")
      .select("user_id", { count: "exact", head: true })
      .eq("account_id", account.accountId);
    const seatLimit = PLANS[account.tier].limits.seats;
    if ((count ?? 0) >= seatLimit) {
      return errorResponse("seat_limit", 409);
    }

    // generateLink (rather than inviteUserByEmail) creates the invited user
    // and returns the link without Supabase sending anything itself - its
    // outbound email sender has a strict rate limit on the free plan that
    // team invites kept hitting. The owner copies this link and sends it
    // however they want instead. We build our own /auth/confirm link from
    // the hashed_token rather than using the returned action_link, since
    // that one points at Supabase's own domain and redirects with a
    // fragment-based session instead of going through our token_hash-based
    // confirm route.
    const { data, error } = await admin.auth.admin.generateLink({
      type: "invite",
      email: parsed.data.email,
      options: {
        data: { invited_account_id: account.accountId },
        redirectTo: `${origin}/auth/confirm?next=/dashboard`,
      },
    });
    if (error || !data.properties) {
      console.error("Invite failed:", error);
      return errorResponse("invite_failed", 502);
    }
    const inviteLink = `${origin}/auth/confirm?token_hash=${data.properties.hashed_token}&type=invite&next=/dashboard`;
    return NextResponse.json({ ok: true, inviteLink });
  } catch (err) {
    console.error(err);
    return errorResponse("invite_failed", 500);
  }
}
