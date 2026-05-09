import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Returns null if Supabase env vars are not configured.
 * This allows the app to build and run without Supabase (open-source / local mode).
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Whether Supabase is configured in this environment */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
