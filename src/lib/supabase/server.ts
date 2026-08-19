import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client (for Server Components / Route Handlers).
 * Not used anywhere yet in Phase 1 (no auth, no saved history) — this is
 * scaffolding ahead of Phase 2. Requires NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component without a surrounding Route
            // Handler/Server Action — safe to ignore since middleware (added
            // in Phase 2) will refresh the session cookie instead.
          }
        },
      },
    }
  );
}
