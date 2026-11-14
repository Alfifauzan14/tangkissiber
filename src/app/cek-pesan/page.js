"use client";

// Halaman Cek Pesan (FR-F2): form tempel pesan/tautan + kartu hasil risiko.
// Analisis murni di klien lewat lib/cekPesan.js (tanpa jaringan).
// Hasil TIDAK disimpan ke database (AC Cek Pesan no. 4).
// Desktop: 2 kolom, form kiri hasil kanan (DESIGN.md §10).
import { useState } from "react";
import { periksaPesan } from "@/lib/cekPesan";
import Container from "@/components/layout/Container";
import Tombol from "@/components/ui/Tombol";
import Ikon from "@/components/ui/Ikon";
import KartuHasilRisiko from "@/components/ui/KartuHasilRisiko";
import { KeadaanKosong } from "@/components/ui/Keadaan";

export default function HalamanCekPesan() {
  const [teks, setTeks] = useState("");
  const [hasil, setHasil] = useState(null);

  function periksa(e) {
    e.preventDefault();
    setHasil(periksaPesan(teks));
  }

  return (
    <Container className="py-8 lg:py-10">
      <header className="max-w-xl">
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Cek Pesan</h1>
        <p className="mt-2 text-sm text-muted">
          Tempelkan pesan atau tautan yang dicurigai. Kami periksa lewat aturan tanda bahaya
          yang umum dipakai penipu, lalu jelaskan alasannya.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <form onSubmit={periksa}>
          <label
            htmlFor="pesan-masukan"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Pesan atau tautan
          </label>
          <textarea
            id="pesan-masukan"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            rows={8}
            placeholder="Contoh: Selamat! Anda menang undian, bayar biaya kirim di bit.ly/xxx"
            className="w-full rounded-md border border-line bg-surface p-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tombol gaya="primary" ikon="content_paste_search" type="submit" disabled={!teks.trim()}>
              Periksa Pesan
            </Tombol>
            <p className="text-xs text-muted">Tanpa internet dan tidak disimpan ke mana pun.</p>
          </div>
        </form>

        <section aria-live="polite" aria-label="Hasil pemeriksaan">
          {hasil ? (
            <div>
              <KartuHasilRisiko
                tingkat={hasil.tingkat}
                label={hasil.label}
                sinyal={hasil.sinyal}
                saran={hasil.saran}
              />
              <p className="mt-3 flex items-start gap-2 text-xs text-muted">
                <Ikon nama="info" ukuran={16} className="mt-0.5 shrink-0" />
                Ini alat bantu edukasi, bukan jaminan 100%. Keputusan akhir tetap milik Anda.
              </p>
            </div>
          ) : (
            <KeadaanKosong
              ikon="content_paste_search"
              pesan="Hasil pemeriksaan tampil di sini. Tempelkan dulu pesan atau tautan yang mau diperiksa."
            />
          )}
        </section>
      </div>
    </Container>
  );
}
