"use client";

// Pustaka: 8 kartu modus yang bisa diperluas (DESIGN.md §8.3).
// Pencarian + filter kategori di atas. Contoh pesan tampil sebagai
// gelembung chat motif (tiga sudut 16px, satu sudut ekor 4px, §11.3).
import { useMemo, useState } from "react";
import modus from "@/data/modus.json";
import Container from "@/components/layout/Container";
import Ikon from "@/components/ui/Ikon";
import Badge from "@/components/ui/Badge";
import { KeadaanKosong } from "@/components/ui/Keadaan";

export default function HalamanPustaka() {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [terbuka, setTerbuka] = useState(null);

  const kategoriList = useMemo(
    () => ["Semua", ...new Set(modus.map((m) => m.kategori))],
    []
  );

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return modus.filter((m) => {
      const cocokKategori = kategori === "Semua" || m.kategori === kategori;
      const cocokCari =
        !q ||
        m.judul.toLowerCase().includes(q) ||
        m.ringkas.toLowerCase().includes(q);
      return cocokKategori && cocokCari;
    });
  }, [cari, kategori]);

  return (
    <Container className="max-w-[720px] py-8 lg:py-10">
      <header>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Pustaka Modus</h1>
        <p className="mt-2 text-sm text-muted">
          Kenali 8 modus penipuan digital paling umum. Buka kartunya untuk melihat ciri,
          contoh pesan, dan cara menangkisnya.
        </p>
      </header>

      {/* Pencarian dan filter kategori */}
      <div className="mt-6 flex flex-col gap-3">
        <label className="sr-only" htmlFor="cari-modus">
          Cari modus penipuan
        </label>
        <input
          id="cari-modus"
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari modus, misalnya OTP atau kurir"
          className="h-12 w-full rounded-md border border-line bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
          {kategoriList.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              aria-pressed={kategori === k}
              className={`min-h-11 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                kategori === k
                  ? "bg-primary text-white"
                  : "bg-primary-soft text-primary hover:bg-[#e0e7ff]"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar kartu modus */}
      <div className="mt-6 flex flex-col gap-3">
        {hasil.length === 0 ? (
          <KeadaanKosong
            ikon="search_off"
            pesan="Tidak ada modus yang cocok dengan pencarian Anda. Coba kata kunci lain atau pilih kategori Semua."
          />
        ) : (
          hasil.map((m) => {
            const buka = terbuka === m.id;
            return (
              <article key={m.id} className="rounded-lg border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => setTerbuka(buka ? null : m.id)}
                  aria-expanded={buka}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left md:p-5"
                >
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink">{m.judul}</h2>
                      <Badge warna="primary">{m.kategori}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-muted">{m.ringkas}</span>
                  </span>
                  <Ikon
                    nama={buka ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    ukuran={22}
                    className="mt-0.5 shrink-0 text-muted"
                  />
                </button>

                {buka ? (
                  <div className="border-t border-line p-4 md:p-5">
                    <h3 className="text-sm font-semibold text-ink">Ciri-cirinya</h3>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {m.ciri.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted">
                          <Ikon nama="error" ukuran={16} className="mt-0.5 shrink-0 text-waspada" />
                          {c}
                        </li>
                      ))}
                    </ul>

                    <h3 className="mt-5 text-sm font-semibold text-ink">Contoh pesan penipu</h3>
                    <p className="mt-2 rounded-2xl rounded-bl-[4px] border border-line bg-surface px-4 py-3 text-sm text-ink">
                      {m.contoh_pesanan}
                    </p>

                    <h3 className="mt-5 text-sm font-semibold text-ink">Cara kerjanya</h3>
                    <ol className="mt-2 flex flex-col gap-1.5">
                      {m.cara_kerja.map((ck, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted">
                          <span className="angka mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                            {i + 1}
                          </span>
                          {ck}
                        </li>
                      ))}
                    </ol>

                    <h3 className="mt-5 text-sm font-semibold text-aman">Cara menangkisnya</h3>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {m.tindakan.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted">
                          <Ikon nama="check_circle" ukuran={16} className="mt-0.5 shrink-0 text-aman" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </Container>
  );
}
