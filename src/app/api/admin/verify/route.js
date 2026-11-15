// Edge Function: Guard Admin - Cek apakah user adalah admin
// GET /api/admin/verify
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    // Verifikasi user login
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi", code: "UNAUTHORIZED", admin: false },
        { status: 401 }
      );
    }

    // Cek peran dari profiles
    const { data: profil, error: profilError } = await supabase
      .from("profiles")
      .select("peran")
      .eq("id", user.id)
      .single();

    if (profilError || !profil) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan", code: "PROFILE_NOT_FOUND", admin: false },
        { status: 404 }
      );
    }

    const isAdmin = profil.peran === "admin";

    return NextResponse.json({
      ok: true,
      admin: isAdmin,
      peran: profil.peran,
    });
  } catch (e) {
    console.error("Error admin verify:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", code: "SERVER_ERROR", admin: false },
      { status: 500 }
    );
  }
}