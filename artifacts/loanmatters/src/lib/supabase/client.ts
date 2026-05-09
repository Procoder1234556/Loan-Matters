import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
