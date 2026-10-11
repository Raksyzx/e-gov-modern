import { createClient } from '@supabase/supabase-js'

// Supabase config from environment variables (CRA prefix: REACT_APP_).
// Copy frontend/.env.example → frontend/.env.local and fill values.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '⚠️ Supabase credentials missing. Create frontend/.env.local with:\n' +
      'REACT_APP_SUPABASE_URL=your-url\n' +
      'REACT_APP_SUPABASE_ANON_KEY=your-anon-key'
    )
  }
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase credentials. Set REACT_APP_SUPABASE_URL and ' +
    'REACT_APP_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)