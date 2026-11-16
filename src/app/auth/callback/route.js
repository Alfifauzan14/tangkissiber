// Auth Callback Route (Supabase OAuth)
// Handle exchange code for session setelah redirect dari Google OAuth
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") || "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Lewati /masuk?oauth=1 agar handoff tamu->login (localStorage) ikut tersimpan jika ada
      return NextResponse.redirect(`${origin}/masuk?kembali=${encodeURIComponent(next)}&oauth=1`);
    }
  }

  // Gagal: redirect ke halaman masuk dengan error
  return NextResponse.redirect(`${origin}/masuk?error=oauth_failed`);
}