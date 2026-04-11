import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

// Use placeholders if variables are missing to avoid crash, 
// AuthProvider will skip initialization if it detects placeholders.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabasePublishableKey || 'placeholder-key'
)
