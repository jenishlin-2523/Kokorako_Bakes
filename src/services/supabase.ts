import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (url: string) => {
    try {
        return url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your_supabase_url_here')
    } catch {
        return false
    }
}

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
    console.error('❌ Invalid or missing Supabase credentials in .env file.')
    // Export a dummy client or handle it to prevent total crash
}

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
