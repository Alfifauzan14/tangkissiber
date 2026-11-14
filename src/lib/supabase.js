import { createClient } from "@supabase/supabase-js";

// Satu instance klien Supabase untuk seluruh aplikasi (ARCHITECTURE.md §2).
// Hanya anon key yang masuk bundel klien; service key tidak pernah dipakai.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);
