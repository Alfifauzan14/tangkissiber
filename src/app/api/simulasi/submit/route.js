// Edge Function: Validasi Skor Simulasi Sisi Server + Deteksi AI (Post-v1.0 #5)
// POST /api/simulasi/submit
// Body: { skenario_id: string, jawaban: { langkahIndex: { nilai: "aman"|"waspada"|"bahaya" } }, timing: { mulai: timestamp, selesai: timestamp, perLangkah: { langkahIndex: ms } } }
// Validasi: cek jawaban user vs kunci di skenario JSON, hitung skor, simpan ke simulasi_hasil + ai_curiga
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import kurir from "@/data/skenario/kurir-apk.json";
import hadiah from "@/data/skenario/hadiah-palsu.json";
import otp from "@/data/skenario/otp-bank.json";
import lowongan from "@/data/skenario/lowongan-palsu.json";

const SEMUA = { "kurir-apk": kurir, "hadiah-palsu": hadiah, "otp-bank": otp, "lowongan-palsu": lowongan };
const NILAI_SKOR = { aman: 100, waspada: 50, bahaya: 0 };

// Heuristik AI thresholds untuk simulasi
const AI_THRESHOLD_SIM = {
  // Terlalu cepat: < 3 detik per langkah rata-rata (manusia butuh baca chat+pilih ~5-15 detik)
  MIN_WAKTU_PER_LANGKAH_MS: 3000,
  // Skor sempurna (100) + waktu sangat cepat
  SKOR_SEMPURNA_MAX_WAKTU_TOTAL_MS: 20000, // 20 detik untuk 4 langkah
  // Pola burst
  BURST_THRESHOLD_MS: 800,
  MIN_BURST_COUNT: 2,
};

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

// Heuristik deteksi AI untuk simulasi
function deteksiAI_Simulasi({ jawaban, timing, langkahCount }) {
  if (!timing || !timing.mulai || !timing.selesai) return false;
  
  const totalWaktu = timing.selesai - timing.mulai;
  const rataWaktuPerLangkah = totalWaktu / langkahCount;
  
  // Hitung skor
  let totalSkor = 0;
  let amanCount = 0;
  for (let i = 0; i < langkahCount; i++) {
    const userJawab = jawaban[i];
    if (userJawab?.nilai === "aman") {
      amanCount++;
      totalSkor += NILAI_SKOR.aman;
    } else if (userJawab?.nilai === "waspada") {
      totalSkor += NILAI_SKOR.waspada;
    } else if (userJawab?.nilai === "bahaya") {
      totalSkor += NILAI_SKOR.bahaya;
    }
  }
  const skor = Math.round(totalSkor / langkahCount);
  
  // Flag 1: Terlalu cepat secara umum
  if (rataWaktuPerLangkah < AI_THRESHOLD_SIM.MIN_WAKTU_PER_LANGKAH_MS) {
    return true;
  }
  
  // Flag 2: Skor sempurna (100 = semua aman) + waktu total sangat cepat
  if (skor === 100 && amanCount === langkahCount && totalWaktu < AI_THRESHOLD_SIM.SKOR_SEMPURNA_MAX_WAKTU_TOTAL_MS) {
    return true;
  }
  
  // Flag 3: Pola burst - banyak jawaban cepat berturut-turut
  if (timing.perLangkah) {
    let burstCount = 0;
    for (let i = 0; i < langkahCount; i++) {
      const ms = timing.perLangkah[i];
      if (ms && ms < AI_THRESHOLD_SIM.BURST_THRESHOLD_MS) {
        burstCount++;
        if (burstCount >= AI_THRESHOLD_SIM.MIN_BURST_COUNT) return true;
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
    const { skenario_id, jawaban, timing } = body;

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
    const langkahCount = langkah.length;

    // Validasi: cek jawaban vs kunci
    let totalSkor = 0;
    const detail = [];

    for (let i = 0; i < langkahCount; i++) {
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

    const skor = Math.round(totalSkor / langkahCount);

    // Deteksi AI
    const ai_curiga = deteksiAI_Simulasi({ jawaban, timing, langkahCount });

    // Simpan ke simulasi_hasil
    const { error: insertError } = await supabase
      .from("simulasi_hasil")
      .insert({ user_id: user.id, skenario_id, skor, ai_curiga });

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
      ai_curiga,
    });
  } catch (e) {
    console.error("Error simulasi submit:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}