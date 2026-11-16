// Edge Function: Validasi Skor Kuis Sisi Server + Deteksi AI (Post-v1.0 #5)
// POST /api/kuis/submit
// Body: { jawaban: { soalId: pilihanIndex }, timing: { mulai: timestamp, selesai: timestamp, perSoal: { soalId: ms } } }
// Validasi: cek jawaban user vs kunci di soal.json, hitung skor, simpan ke kuis_hasil + ai_curiga
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ambilKontenServer } from "@/lib/konten";

const POIN_PER_SOAL = 10;
const JUMLAH_SOAL = 10;

// Heuristik AI thresholds (conservative - hanya flag yang jelas mencurigakan)
const AI_THRESHOLD = {
  // Terlalu cepat: < 2 detik per soal rata-rata (manusia butuh baca+pilih ~5-10 detik)
  MIN_WAKTU_PER_SOAL_MS: 2000,
  // Terlalu sempurna: skor 100 + waktu sangat cepat
  SKOR_SEMPURNA_MAX_WAKTU_TOTAL_MS: 30000, // 30 detik untuk 10 soal = 3 detik/soal
  // Pola burst: banyak jawaban dalam < 500ms berturut-turut
  BURST_THRESHOLD_MS: 500,
  MIN_BURST_COUNT: 3,
};

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

// Heuristik deteksi AI untuk kuis
function deteksiAI_Kuis({ jawaban, timing, soalSemua }) {
  if (!timing || !timing.mulai || !timing.selesai) return false;
  
  const totalWaktu = timing.selesai - timing.mulai;
  const rataWaktuPerSoal = totalWaktu / JUMLAH_SOAL;
  
  // Hitung skor
  let benar = 0;
  for (const soal of soalSemua) {
    if (jawaban[soal.id] === soal.jawaban) benar++;
  }
  const skor = benar * POIN_PER_SOAL;
  
  // Flag 1: Terlalu cepat secara umum
  if (rataWaktuPerSoal < AI_THRESHOLD.MIN_WAKTU_PER_SOAL_MS) {
    return true;
  }
  
  // Flag 2: Skor sempurna (100) + waktu total sangat cepat
  if (skor === 100 && totalWaktu < AI_THRESHOLD.SKOR_SEMPURNA_MAX_WAKTU_TOTAL_MS) {
    return true;
  }
  
  // Flag 3: Pola burst - banyak jawaban cepat berturut-turut
  if (timing.perSoal) {
    let burstCount = 0;
    for (const soal of soalSemua) {
      const ms = timing.perSoal[soal.id];
      if (ms && ms < AI_THRESHOLD.BURST_THRESHOLD_MS) {
        burstCount++;
        if (burstCount >= AI_THRESHOLD.MIN_BURST_COUNT) return true;
      } else {
        burstCount = 0;
      }
    }
  }
  
  return false;
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
    const { jawaban, timing } = body; // timing: { mulai, selesai, perSoal }

    if (!jawaban || typeof jawaban !== "object") {
      return NextResponse.json(
        { error: "Format jawaban tidak valid", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    // Validasi: cek jawaban vs kunci (dari konten_aplikasi atau fallback soal.json)
    const soalSemua = await ambilKontenServer("soal");
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

    // Deteksi AI
    const ai_curiga = deteksiAI_Kuis({ jawaban, timing, soalSemua });

    // Simpan ke kuis_hasil
    const { error: insertError } = await supabase
      .from("kuis_hasil")
      .insert({ user_id: user.id, skor, ai_curiga });

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
      ai_curiga,
    });
  } catch (e) {
    console.error("Error kuis submit:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}