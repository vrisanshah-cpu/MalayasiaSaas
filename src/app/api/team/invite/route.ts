import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAccount } from "@/lib/accounts";
import { createAdminClient } from "@/lib/supabase/admin";

const requestSchema = z.object({ email: z.string().trim().email() });

type ErrorCode = "unauthorized" | "forbidden" | "invalid_request" | "invite_failed";

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
    const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { invited_account_id: account.accountId },
      redirectTo: `${origin}/auth/confirm?next=/dashboard`,
    });
    if (error) {
      console.error("Invite failed:", error);
      return errorResponse("invite_failed", 502);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return errorResponse("invite_failed", 500);
  }
}
