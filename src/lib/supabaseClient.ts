import { createClient } from '@supabase/supabase-js'

// Read keys from environment variables injected at build/runtime.
// In Vite, set them as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep this as a console warning during development. In production ensure vars are set.
  // eslint-disable-next-line no-console
  console.warn('Supabase URL or ANON KEY is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Single instance of supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Admin client - uses service role key (only use server-side or in protected admin routes)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (!supabaseAdminInstance && supabaseServiceKey) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseAdminInstance
}

export const supabaseAdmin = getSupabaseAdmin()

export default supabase
