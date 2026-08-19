import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing route: Supabase's email link points here with a
 * token_hash + type rather than a PKCE `code`, which is the recommended
 * flow for email links since it doesn't require the click to happen in the
 * same browser session that requested it.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
  }

  return NextResponse.redirect(new URL("/login?error=invalid_link", origin));
}
