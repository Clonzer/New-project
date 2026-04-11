import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. App will use fallback data.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
