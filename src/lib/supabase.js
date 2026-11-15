import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client using cookie-based storage (required for @supabase/ssr server client)
// This replaces the old @supabase/supabase-js createClient with localStorage
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(url, anonKey);