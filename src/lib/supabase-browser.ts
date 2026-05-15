import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Cookie-aware Supabase client for use in Client Components.
 * Uses @supabase/ssr's createBrowserClient so auth tokens are stored in
 * cookies (not localStorage), making them visible to middleware on every
 * request and ensuring the session auto-refreshes without logging the user out.
 */
export function getAdminClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
