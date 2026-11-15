// Edge Function: Validasi Skor Simulasi Sisi Server
// POST /api/simulasi/submit
// Body: { skenario_id: string, jawaban: { langkahIndex: { nilai: "aman"|"waspada"|"bahaya" } } }
// Validasi: cek jawaban user vs kunci di skenario JSON, hitung skor, simpan ke simulasi_hasil
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import kurir from "@/data/skenario/kurir-apk.json";
import hadiah from "@/data/skenario/hadiah-palsu.json";
import otp from "@/data/skenario/otp-bank.json";
import lowongan from "@/data/skenario/lowongan-palsu.json";

const SEMUA = { "kurir-apk": kurir, "hadiah-palsu": hadiah, "otp-bank": otp, "lowongan-palsu": lowongan };
const NILAI_SKOR = { aman: 100, waspada: 50, bahaya: 0 };

// In-memory rate limit
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
    const { skenario_id, jawaban } = body;

    if (!skenario_id || !SEMUA[skenario_id]) {
      return NextResponse.json(
        { error: "Skenario tidak valid", code: "INVALID_SKENARIO" },
        { status: 400 }
      );
    }

    if (!jawaban || typeof jawaban !== "object") {
      return NextResponse.json(
        { error: "Format jawaban tidak valid", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const data = SEMUA[skenario_id];
    const langkah = data.langkah;

    // Validasi: cek jawaban vs kunci
    let totalSkor = 0;
    const detail = [];

    for (let i = 0; i < langkah.length; i++) {
      const userJawab = jawaban[i];
      const pilihanBenar = langkah[i].pilihan.find((p) => p.nilai === "aman");
      const benar = userJawab?.nilai === "aman";
      
      const skorLangkah = userJawab ? NILAI_SKOR[userJawab.nilai] : 0;
      totalSkor += skorLangkah;
      
      detail.push({
        langkah: i,
        jawaban_user: userJawab?.nilai ?? null,
        jawaban_benar: pilihanBenar ? "aman" : null,
        nilai: userJawab?.nilai ?? null,
        skor: skorLangkah,
        benar,
      });
    }

    const skor = Math.round(totalSkor / langkah.length);

    // Simpan ke simulasi_hasil
    const { error: insertError } = await supabase
      .from("simulasi_hasil")
      .insert({ user_id: user.id, skenario_id, skor });

    if (insertError) {
      console.error("Gagal simpan simulasi_hasil:", insertError);
      return NextResponse.json(
        { error: "Gagal menyimpan skor", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      skor,
      skenario_id,
      detail,
    });
  } catch (e) {
    console.error("Error simulasi submit:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}