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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Admin client - uses service role key (only use server-side or in protected admin routes)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null

export default supabase
