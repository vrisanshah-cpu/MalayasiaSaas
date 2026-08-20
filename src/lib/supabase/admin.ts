import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client - bypasses RLS entirely. Server-only, never import
 * this from a client component. Used for privileged operations the anon
 * key can't do: inviting teammates and (in the billing webhook) updating
 * an account's tier from Stripe events without a signed-in user present.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) is not set."
    );
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    // See the matching comment in supabase/server.ts - Next.js caches
    // fetch() by default, which can leak one request's response to
    // another's if not disabled here too.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
