// API Cek Pesan (Gemini AI): analisis pesan lewat Google Gemini.
// Tanpa GEMINI_API_KEY atau saat API gagal: fallback ke mesin aturan lokal.
// Output selalu satu bentuk: { tingkat, label, sinyal[], saran[] }
import { NextResponse } from "next/server";
import { periksaPesan as periksaLokal } from "@/lib/cekPesan";

const TINGKAT_VALID = new Set(["aman", "waspada", "bahaya"]);

const PROMPT = `Kamu pemeriksa pesan penipuan digital di Indonesia. Analisis pesan pengguna berikut.

Balas HANYA JSON murni tanpa markdown dengan bentuk:
{"tingkat":"aman|waspada|bahaya","sinyal":[{"judul":"nama tanda bahaya singkat","tingkat":"aman|waspada|bahaya","alasan":"penjelasan bahasa awam 1 kalimat","saran":"tindakan 1 kalimat"}],"saran":["saran tindakan utama"]}

Ketentuan:
- "tingkat" utama memakai skala 3: aman, waspada, bahaya.
- "sinyal" boleh kosong jika pesan tampak wajar.
- Bahasa Indonesia, bahasa awam, tanpa emoji.
- Fokus: hadiah palsu, kurir/APK, kode OTP, transfer, lowongan palsu, phishing tautan, penyamaran pihak resmi.

Pesan pengguna:`;

// Ubah jawaban Gemini mentah menjadi bentuk kartu hasil yang sama
// dengan mesin aturan lokal; field tidak valid diganti default.
function rapikanHasilGemini(mentah) {
  const tingkat = TINGKAT_VALID.has(mentah.tingkat) ? mentah.tingkat : "waspada";
  const label = { aman: "Aman", waspada: "Waspada", bahaya: "Bahaya" }[tingkat];

  const sinyal = Array.isArray(mentah.sinyal)
    ? mentah.sinyal
        .filter((s) => s && typeof s === "object")
        .map((s, i) => ({
          id: `ai-${i}`,
          judul: String(s.judul || "Tanda bahaya").slice(0, 60),
          tingkat: TINGKAT_VALID.has(s.tingkat) ? s.tingkat : tingkat,
          alasan: String(s.alasan || "").slice(0, 300),
          saran: String(s.saran || "").slice(0, 300),
        }))
        .filter((s) => s.alasan)
    : [];

  let saran = Array.isArray(mentah.saran)
    ? mentah.saran.map((t) => String(t).slice(0, 300)).filter(Boolean)
    : [];
  if (saran.length === 0) {
    saran = [
      "Tetap jangan beri OTP, PIN, sandi, atau uang ke siapa pun sebelum memastikan kebenarannya lewat kanal resmi.",
    ];
  }

  return { tingkat, label, sinyal, saran };
}

async function tanyaGemini(teks, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT + teks }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  const teksJawaban = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .filter(Boolean)
    .join("")
    ?.replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  if (!teksJawaban) throw new Error("Gemini jawaban kosong");

  return rapikanHasilGemini(JSON.parse(teksJawaban));
}

export async function POST(request) {
  try {
    const { teks } = await request.json();
    if (!teks || typeof teks !== "string" || !teks.trim()) {
      return NextResponse.json(
        { error: "Teks tidak valid", code: "INVALID_BODY" },
        { status: 400 }
      );
    }
    if (teks.length > 2000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maksimal 2000 karakter)", code: "TOO_LONG" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const hasil = await tanyaGemini(teks.trim(), apiKey);
        return NextResponse.json({ ok: true, hasil, sumber: "gemini" });
      } catch (e) {
        console.error("Gemini gagal, pakai aturan lokal:", e.message);
      }
    }

    return NextResponse.json({ ok: true, hasil: periksaLokal(teks), sumber: "lokal" });
  } catch (e) {
    console.error("Error cek pesan:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
