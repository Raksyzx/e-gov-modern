import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Anon Key dari dashboard Supabase Anda
// (Buka Supabase -> Project Settings -> API)
const supabaseUrl = 'https://hwajykehhncjnpowrbox.supabase.co'
const supabaseKey = 'sb_publishable_REDACTED_KEY_ROTATE_THIS' 

export const supabase = createClient(supabaseUrl, supabaseKey)