// Edge Function: Validasi Skor Kuis Sisi Server
// POST /api/kuis/submit
// Body: { jawaban: { soalId: pilihanIndex } }
// Validasi: cek jawaban user vs kunci di soal.json, hitung skor, simpan ke kuis_hasil
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import soalSemua from "@/data/soal.json";

const POIN_PER_SOAL = 10;
const JUMLAH_SOAL = 10;

// In-memory rate limit (simple sliding window)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const RATE_LIMIT_MAX = 5; // max 5 request per menit per user

function cekRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  const validRequests = userRequests.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(userId, validRequests);
  return true;
}

export async function POST(request) {
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
        { error: "Tidak terautentikasi", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Rate limit
    if (!cekRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi sebentar.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();
    const { jawaban } = body; // { soalId: pilihanIndex }

    if (!jawaban || typeof jawaban !== "object") {
      return NextResponse.json(
        { error: "Format jawaban tidak valid", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    // Validasi: cek jawaban vs kunci
    let benar = 0;
    const detail = [];

    for (const soal of soalSemua) {
      const userJawab = jawaban[soal.id];
      const benarSoal = userJawab === soal.jawaban;
      
      if (benarSoal) benar++;
      
      detail.push({
        soal_id: soal.id,
        jawaban_user: userJawab ?? null,
        jawaban_benar: soal.jawaban,
        benar: benarSoal,
      });
    }

    const skor = benar * POIN_PER_SOAL;

    // Simpan ke kuis_hasil
    const { error: insertError } = await supabase
      .from("kuis_hasil")
      .insert({ user_id: user.id, skor });

    if (insertError) {
      console.error("Gagal simpan kuis_hasil:", insertError);
      return NextResponse.json(
        { error: "Gagal menyimpan skor", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    // Ambil total poin terkini dari view peringkat
    const { data: baris } = await supabase
      .from("peringkat")
      .select("total_poin")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      ok: true,
      skor,
      benar,
      total: JUMLAH_SOAL,
      total_poin: baris ? baris.total_poin : skor,
      detail,
    });
  } catch (e) {
    console.error("Error kuis submit:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}