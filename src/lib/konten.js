// Helper baca konten aplikasi dari Supabase (tabel `konten_aplikasi`)
// dengan fallback otomatis ke JSON statis di `src/data/` bila tabel belum ada
// atau belum pernah diubah oleh admin.
import modusDefault from "@/data/modus.json";
import soalDefault from "@/data/soal.json";
import daruratDefault from "@/data/darurat.json";
import aturanCekDefault from "@/data/aturan-cek.json";
import kurirDefault from "@/data/skenario/kurir-apk.json";
import hadiahDefault from "@/data/skenario/hadiah-palsu.json";
import otpDefault from "@/data/skenario/otp-bank.json";
import lowonganDefault from "@/data/skenario/lowongan-palsu.json";

export const KONTEN_DEFAULT = {
  modus: modusDefault,
  soal: soalDefault,
  darurat: daruratDefault,
  "aturan-cek": aturanCekDefault,
  "skenario-kurir-apk": kurirDefault,
  "skenario-hadiah-palsu": hadiahDefault,
  "skenario-otp-bank": otpDefault,
  "skenario-lowongan-palsu": lowonganDefault,
};

/**
 * Ambil satu dataset konten dari Supabase (sisi klien).
 * Mengembalikan fallback JSON jika tabel belum ada atau belum diisi.
 */
export async function ambilKontenKlien(kunci) {
  const fallback = KONTEN_DEFAULT[kunci];
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("konten_aplikasi")
      .select("data")
      .eq("kunci", kunci)
      .maybeSingle();
    if (!error && data?.data != null) return data.data;
  } catch {
    // Abaikan: pakai fallback JSON lokal
  }
  return fallback;
}

/**
 * Ambil satu dataset konten dari Supabase (sisi server / Route Handler).
 * Menggunakan anon key lewat fetch REST ringan tanpa butuh cookie sesi.
 */
export async function ambilKontenServer(kunci) {
  const fallback = KONTEN_DEFAULT[kunci];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback;

  try {
    const res = await fetch(
      `${url}/rest/v1/konten_aplikasi?kunci=eq.${encodeURIComponent(kunci)}&select=data&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) return fallback;
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0]?.data != null) return rows[0].data;
  } catch {
    // Abaikan: pakai fallback JSON lokal
  }
  return fallback;
}
