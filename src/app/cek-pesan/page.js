"use client";

// Halaman Cek Pesan (FR-F2 — Fitur Utama Spesial):
// Hero banner Cyber Ocean + konsol pemeriksa pesan/tautan + checklist sinyal.
// Analisis via API /api/cek-pesan: Google Gemini bila GEMINI_API_KEY aktif,
// fallback mesin aturan lokal. Hasil TIDAK disimpan ke database (AC Cek Pesan 4).
import { useState } from "react";
import Container from "@/components/layout/Container";
import PageBanner from "@/components/layout/PageBanner";
import Tombol from "@/components/ui/Tombol";
import Ikon from "@/components/ui/Ikon";
import KartuHasilRisiko from "@/components/ui/KartuHasilRisiko";

const CONTOH_PESAN = [
  {
    label: "Kurir APK",
    isi: "Paket Anda tertahan di gudang. Segera unduh aplikasi pelacak di bit.ly/kurir-paket sebelum dikembalikan hari ini.",
  },
  {
    label: "Minta OTP",
    isi: "Peringatan Bank: Akun Anda terdeteksi login mencurigakan. Segera kirim kode OTP 6 digit untuk membatalkan transaksi.",
  },
  {
    label: "Undian Palsu",
    isi: "Selamat! Nomor Anda terpilih menang hadiah Rp 25 juta. Transfer biaya admin Rp 150rb dalam 2 jam ke rekening ini.",
  },
];

const SINYAL_DIPERIKSA = [
  { ikon: "warning", judul: "Desakan waktu buatan", ket: "Kalimat panik seperti 'hari ini hangus' atau 'akun diblokir'." },
  { ikon: "lock", judul: "Permintaan OTP / PIN / Sandi", ket: "Pihak resmi tidak pernah meminta kode rahasia." },
  { ikon: "dangerous", judul: "Ajakan pasang file APK", ket: "Aplikasi kurir atau undangan dari luar toko resmi." },
  { ikon: "open_in_new", judul: "Tautan pendek & domain palsu", ket: "Shortener, alamat IP, tanpa HTTPS, atau domain mirip merek." },
];

export default function HalamanCekPesan() {
  const [teks, setTeks] = useState("");
  const [hasil, setHasil] = useState(null);
  const [sumber, setSumber] = useState(null); // "gemini" | "lokal"
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState(null);

  async function periksa(e) {
    e.preventDefault();
    if (!teks.trim() || proses) return;
    setProses(true);
    setGalat(null);
    setHasil(null);
    setSumber(null);
    try {
      const res = await fetch("/api/cek-pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teks }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setGalat(data.error || "Pemeriksaan gagal. Coba lagi.");
        return;
      }
      setHasil(data.hasil);
      setSumber(data.sumber);
    } catch {
      setGalat("Koneksi bermasalah. Periksa internet Anda dan coba lagi.");
    } finally {
      setProses(false);
    }
  }

  return (
    <div>
      <PageBanner
        eyebrow="Fitur Utama • Deteksi Penipuan"
        judul="Cek Pesan & Tautan Mencurigakan"
        deskripsi="Tempelkan pesan WhatsApp, SMS, atau tautan yang baru Anda terima. Sistem akan memeriksa tanda bahaya secara instan dan menjelaskan alasannya dalam bahasa awam."
      />

      <Container className="py-8 lg:py-10">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <form
            onSubmit={periksa}
            className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Ikon nama="content_paste_search" ukuran={18} />
                </span>
                <label htmlFor="pesan-masukan" className="text-sm font-bold text-ink">
                  Tempel Pesan atau Tautan
                </label>
              </div>
              <span className="angka rounded-full border border-line bg-bg px-2.5 py-0.5 text-xs font-semibold text-muted">
                {teks.length}/2000
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <textarea
                id="pesan-masukan"
                value={teks}
                onChange={(e) => setTeks(e.target.value)}
                rows={8}
                maxLength={2000}
                placeholder="Contoh: Selamat! Anda menang undian, bayar biaya kirim di bit.ly/xxx"
                className="min-h-[190px] w-full flex-1 rounded-xl border border-line bg-bg p-4 text-sm leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/30"
              />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted">Contoh cepat:</span>
                {CONTOH_PESAN.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setTeks(c.isi)}
                    className="min-h-9 rounded-full border border-line bg-bg px-3 text-xs font-semibold text-primary transition-colors duration-150 hover:border-primary/40 hover:bg-primary-soft"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Tombol
                  gaya="primary"
                  ikon="content_paste_search"
                  type="submit"
                  disabled={!teks.trim() || proses}
                  className="w-full sm:w-auto"
                >
                  {proses ? "Menganalisis..." : "Periksa Sekarang"}
                </Tombol>
                {teks.trim() && !proses ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTeks("");
                      setHasil(null);
                      setSumber(null);
                      setGalat(null);
                    }}
                    className="min-h-10 rounded-md px-3 text-xs font-semibold text-muted hover:text-ink"
                  >
                    Bersihkan
                  </button>
                ) : (
                  <span className="text-xs text-muted">Gratis • Tanpa simpan data</span>
                )}
              </div>
              {galat ? (
                <p role="alert" className="mt-3 rounded-md bg-bahaya-soft px-3 py-2 text-sm text-bahaya">
                  {galat}
                </p>
              ) : null}
            </div>
          </form>

          <section aria-live="polite" aria-label="Hasil pemeriksaan" className="flex flex-col">
            {hasil ? (
              <div className="flex-1 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] md:p-6">
                {sumber === "gemini" ? (
                  <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    <Ikon nama="auto_awesome" ukuran={15} />
                    Dianalisis AI Gemini
                  </p>
                ) : sumber === "lokal" ? (
                  <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted">
                    <Ikon nama="info" ukuran={15} />
                    Mode aturan lokal (aktifkan GEMINI_API_KEY untuk analisis AI Gemini)
                  </p>
                ) : null}
                <KartuHasilRisiko
                  tingkat={hasil.tingkat}
                  label={hasil.label}
                  sinyal={hasil.sinyal}
                  saran={hasil.saran}
                />
                <p className="mt-4 flex items-start gap-2 text-xs text-muted">
                  <Ikon nama="info" ukuran={16} className="mt-0.5 shrink-0" />
                  Ini alat bantu edukasi, bukan jaminan 100%. Keputusan akhir tetap milik Anda.
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Ikon nama="verified_user" ukuran={18} />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-ink">Apa saja yang diperiksa?</h2>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {SINYAL_DIPERIKSA.map((s) => (
                      <div
                        key={s.judul}
                        className="rounded-xl border border-line bg-bg p-4 transition-colors duration-150 hover:border-primary/40"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <Ikon nama={s.ikon} ukuran={18} />
                        </span>
                        <p className="mt-3 text-sm font-bold text-ink">{s.judul}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{s.ket}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex items-center gap-2 border-t border-line pt-3.5 text-xs text-muted">
                    <Ikon nama="info" ukuran={15} className="shrink-0" />
                    Tempel pesan di sebelah kiri untuk melihat tingkat risiko (Aman, Waspada, atau Bahaya).
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
