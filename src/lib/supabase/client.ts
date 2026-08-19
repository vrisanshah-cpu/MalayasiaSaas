import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Not used anywhere yet in Phase 1 (no auth,
 * no saved history) — this is scaffolding ahead of Phase 2. Requires
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
