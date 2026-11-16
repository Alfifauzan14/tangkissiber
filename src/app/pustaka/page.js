"use client";

// Pustaka Modus (FR-F4): tampilan editorial seperti artikel edukasi.
// Grid kartu artikel (2 kolom desktop) + mode baca artikel penuh saat diklik.
import { useEffect, useMemo, useRef, useState } from "react";
import modusDefault from "@/data/modus.json";
import { ambilKontenKlien } from "@/lib/konten";
import Container from "@/components/layout/Container";
import PageBanner from "@/components/layout/PageBanner";
import Ikon from "@/components/ui/Ikon";
import Badge from "@/components/ui/Badge";
import { KeadaanKosong } from "@/components/ui/Keadaan";

export default function HalamanPustaka() {
  const [modus, setModus] = useState(modusDefault);
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [artikelAktif, setArtikelAktif] = useState(null);
  const [menuKategoriBuka, setMenuKategoriBuka] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function tutupLuar(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuKategoriBuka(false);
      }
    }
    function tutupEsc(e) {
      if (e.key === "Escape") setMenuKategoriBuka(false);
    }
    document.addEventListener("mousedown", tutupLuar);
    document.addEventListener("keydown", tutupEsc);
    return () => {
      document.removeEventListener("mousedown", tutupLuar);
      document.removeEventListener("keydown", tutupEsc);
    };
  }, []);

  useEffect(() => {
    let aktif = true;
    ambilKontenKlien("modus").then((data) => {
      if (aktif && Array.isArray(data) && data.length > 0) setModus(data);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const kategoriList = useMemo(
    () => ["Semua", ...new Set(modus.map((m) => m.kategori))],
    [modus]
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
  }, [modus, cari, kategori]);

  if (artikelAktif) {
    return (
      <Container className="max-w-[780px] py-8 lg:py-12">
        <button
          type="button"
          onClick={() => setArtikelAktif(null)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-sm transition-colors duration-150 hover:bg-primary-soft hover:text-primary"
        >
          <span aria-hidden="true">←</span>
          Semua Artikel
        </button>

        <article className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {artikelAktif.kategori}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-ink md:text-3xl">
            {artikelAktif.judul}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
            {artikelAktif.ringkas}
          </p>

          <div className="my-6 border-t border-line" />

          <section>
            <h2 className="text-base font-bold text-ink">Ciri-Ciri Utama</h2>
            <ul className="mt-3 space-y-2.5">
              {artikelAktif.ciri.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/90">
                  <Ikon nama="error" ukuran={18} className="mt-0.5 shrink-0 text-waspada" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold text-ink">Contoh Pesan Penipu</h2>
            <blockquote className="mt-3 rounded-2xl rounded-bl-[4px] border border-line bg-bg px-5 py-4 text-sm italic leading-relaxed text-ink">
              &ldquo;{artikelAktif.contoh_pesanan}&rdquo;
            </blockquote>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold text-ink">Bagaimana Penipu Bekerja?</h2>
            <ol className="mt-3 space-y-2.5">
              {artikelAktif.cara_kerja.map((ck, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-ink/90">
                  <span className="angka mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{ck}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8 rounded-2xl border border-aman/30 bg-aman-soft/40 p-5">
            <h2 className="text-base font-bold text-aman">Cara Menangkisnya</h2>
            <ul className="mt-3 space-y-2">
              {artikelAktif.tindakan.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
                  <Ikon nama="check_circle" ukuran={18} className="mt-0.5 shrink-0 text-aman" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </Container>
    );
  }

  return (
    <div>
      <PageBanner
        eyebrow="Artikel Edukasi"
        judul="Pustaka Modus"
        deskripsi={`Kumpulan artikel ringkas tentang ${modus.length} modus penipuan digital paling umum. Pilih artikel untuk membaca ciri, contoh kasus, dan langkah pencegahannya.`}
      />

      <Container className="max-w-[960px] py-8 lg:py-10">

      {/* Pencarian dan filter kategori tersambung dalam satu bilah */}
      <div className="relative flex flex-col rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-colors duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center">
          <span className="pointer-events-none pl-4 text-muted">
            <Ikon nama="content_paste_search" ukuran={18} />
          </span>
          <label className="sr-only" htmlFor="cari-modus">
            Cari artikel modus penipuan
          </label>
          <input
            id="cari-modus"
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari artikel, misalnya OTP, kurir, atau lowongan"
            className="h-12 w-full bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted/70"
          />
        </div>

        <div className="h-px w-full bg-line sm:h-7 sm:w-px" aria-hidden="true" />

        {/* Dropdown kategori kustom */}
        <div ref={dropdownRef} className="relative sm:w-56">
          <button
            type="button"
            onClick={() => setMenuKategoriBuka((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={menuKategoriBuka}
            className="flex h-12 w-full items-center justify-between gap-2 px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:text-primary focus:outline-none"
          >
            <span className="truncate">
              {kategori === "Semua" ? "Semua Kategori" : kategori}
            </span>
            <Ikon
              nama={menuKategoriBuka ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              ukuran={18}
              className="shrink-0 text-muted"
            />
          </button>

          {menuKategoriBuka ? (
            <ul
              role="listbox"
              aria-label="Filter kategori"
              className="absolute right-0 top-[calc(100%+6px)] z-30 w-full min-w-[220px] overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl"
            >
              {kategoriList.map((k) => {
                const aktif = kategori === k;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={aktif}
                      onClick={() => {
                        setKategori(k);
                        setMenuKategoriBuka(false);
                      }}
                      className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                        aktif
                          ? "bg-primary-soft font-semibold text-primary"
                          : "text-ink hover:bg-bg hover:text-primary"
                      }`}
                    >
                      <span>{k === "Semua" ? "Semua Kategori" : k}</span>
                      {aktif ? <Ikon nama="check" ukuran={16} className="text-primary" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted">
        <span>Menampilkan {hasil.length} dari {modus.length} artikel</span>
        {kategori !== "Semua" || cari ? (
          <button
            type="button"
            onClick={() => {
              setCari("");
              setKategori("Semua");
            }}
            className="font-semibold text-primary hover:underline"
          >
            Reset filter
          </button>
        ) : null}
      </div>

      {/* Grid Artikel 2 kolom */}
      {hasil.length === 0 ? (
        <div className="mt-4">
          <KeadaanKosong
            ikon="search_off"
            pesan="Tidak ada artikel yang cocok dengan pencarian Anda. Coba kata kunci lain atau pilih kategori Semua."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {hasil.map((m) => (
            <article
              key={m.id}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge warna="primary">{m.kategori}</Badge>
                <span className="text-xs font-medium text-muted">
                  {m.ciri?.length || 0} ciri utama
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold leading-snug text-ink group-hover:text-primary">
                {m.judul}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{m.ringkas}</p>
              <div className="mt-5 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setArtikelAktif(m)}
                  className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                >
                  Baca Artikel
                  <Ikon nama="arrow_right" ukuran={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      </Container>
    </div>
  );
}
