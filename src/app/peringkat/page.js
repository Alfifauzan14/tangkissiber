"use client";

// Peringkat (FR-F9): Top 20 pengguna dari view `peringkat` berdasarkan
// total poin menurun. Posisi pengguna login disorot (FR-F9-02); tamu
// hanya melihat tanpa sorotan (FR-F9-03). Hanya nama_tampil + poin,
// tanpa email (FR-F9-04, view sudah membatasi kolom).
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/sesi";
import { hitungLevel } from "@/lib/poin";
import Container from "@/components/layout/Container";
import PageBanner from "@/components/layout/PageBanner";
import Ikon from "@/components/ui/Ikon";
import Badge from "@/components/ui/Badge";
import { KeadaanMemuat, KeadaanGagal, KeadaanKosong } from "@/components/ui/Keadaan";

export default function HalamanPeringkat() {
  const { memuat, pengguna } = useSesi();
  const uid = pengguna ? pengguna.id : null;
  const [baris, setBaris] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [coba, setCoba] = useState(0);

  useEffect(() => {
    let aktif = true;
    (async () => {
      const { data, error } = await supabase
        .from("peringkat")
        .select("id, nama_tampil, total_poin")
        .order("total_poin", { ascending: false })
        .limit(20);
      if (!aktif) return;
      if (error) {
        setGagal(true);
        return;
      }
      setBaris(data);
    })();
    return () => {
      aktif = false;
    };
  }, [coba]);

  if (gagal) {
    return (
      <Container className="py-10">
        <KeadaanGagal
          pesan="Gagal memuat peringkat. Periksa koneksi internet Anda."
          cobaLagi={() => {
            setGagal(false);
            setBaris(null);
            setCoba((c) => c + 1);
          }}
        />
      </Container>
    );
  }

  if (!baris) {
    return (
      <Container className="py-10">
        <KeadaanMemuat />
      </Container>
    );
  }

  const posisiSaya = uid ? baris.findIndex((b) => b.id === uid) : -1;

  return (
    <div>
      <PageBanner
        eyebrow="Papan Peringkat"
        judul="Peringkat"
        deskripsi="Top 20 pengguna berdasarkan total poin. Poin = skor terbaik kuis + skor terbaik tiap skenario simulasi (maksimum 500)."
      />

      <Container className="max-w-[820px] py-8 lg:py-10">

      {baris.length === 0 ? (
        <div className="mt-6">
          <KeadaanKosong
            ikon="leaderboard"
            pesan="Belum ada pengguna di peringkat. Jadilah yang pertama menyimpan skor."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-8">
          {/* Podium Top 3 berundak di desktop (#2 kiri, #1 tengah, #3 kanan) */}
          {baris.length >= 3 ? (
            <div className="grid grid-cols-1 items-end gap-4 pt-4 sm:grid-cols-3">
              {[1, 0, 2].map((pos) => {
                const b = baris[pos];
                const saya = b.id === uid;
                const inisial = (b.nama_tampil || "?").charAt(0).toUpperCase();
                const gayaPodium =
                  pos === 0
                    ? "border-[#f59e0b]/60 bg-gradient-to-b from-[#fef3c7]/60 via-surface to-surface sm:pb-8 sm:pt-7 dark:from-[#78350f]/25"
                    : pos === 1
                    ? "border-slate-300 bg-surface dark:border-slate-600"
                    : "border-[#d97706]/40 bg-surface";
                const warnaBadge =
                  pos === 0
                    ? "bg-[#f59e0b] text-white"
                    : pos === 1
                    ? "bg-slate-500 text-white"
                    : "bg-[#b45309] text-white";

                const urutanMobile =
                  pos === 0 ? "order-1 sm:order-2" : pos === 1 ? "order-2 sm:order-1" : "order-3";

                return (
                  <div
                    key={b.id}
                    className={`relative flex flex-col items-center rounded-2xl border-2 p-5 text-center shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5 ${urutanMobile} ${gayaPodium} ${
                      saya ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : ""
                    }`}
                  >
                    {pos === 0 ? (
                      <span
                        aria-hidden="true"
                        className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fef3c7] text-[#d97706] dark:bg-[#78350f]/50 dark:text-[#fbbf24]"
                      >
                        <Ikon nama="military_tech" ukuran={20} />
                      </span>
                    ) : null}

                    {/* Avatar inisial + nomor juara */}
                    <div className="relative">
                      <div
                        className={`flex items-center justify-center rounded-full font-bold text-white shadow-sm ${
                          pos === 0
                            ? "h-16 w-16 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-xl"
                            : "h-13 w-13 bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-lg"
                        }`}
                      >
                        {inisial}
                      </div>
                      <span
                        className={`angka absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[11px] font-extrabold ${warnaBadge}`}
                      >
                        {pos + 1}
                      </span>
                    </div>

                    <p className="mt-3 w-full truncate text-base font-bold text-ink">
                      {b.nama_tampil}
                      {saya ? (
                        <span className="ml-1.5 text-xs font-semibold text-primary">(Anda)</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-muted">
                      Level {hitungLevel(b.total_poin)}
                    </p>
                    <span className="angka mt-3 rounded-full bg-primary px-4 py-1 text-sm font-bold text-white shadow-xs">
                      {b.total_poin} poin
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Daftar peringkat #4 - #20 dalam satu kartu tabel rapi */}
          {(baris.length >= 3 ? baris.slice(3) : baris).length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-line bg-bg/70 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
                <span>Peringkat &amp; Pengguna</span>
                <span>Total Poin</span>
              </div>
              <ol className="divide-y divide-line">
                {(baris.length >= 3 ? baris.slice(3) : baris).map((b, idx) => {
                  const i = baris.length >= 3 ? idx + 3 : idx;
                  const saya = b.id === uid;
                  const inisial = (b.nama_tampil || "?").charAt(0).toUpperCase();
                  return (
                    <li
                      key={b.id}
                      className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-150 ${
                        saya
                          ? "border-l-4 border-l-primary bg-primary-soft/50"
                          : "hover:bg-bg/60"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`angka w-6 shrink-0 text-center text-sm font-bold ${
                          saya ? "text-primary" : "text-muted"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          saya
                            ? "bg-primary text-white"
                            : "bg-primary-soft text-primary"
                        }`}
                      >
                        {inisial}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">
                          {b.nama_tampil}
                          {saya ? (
                            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                              Anda
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted">Level {hitungLevel(b.total_poin)}</p>
                      </div>
                      <span className="angka shrink-0 rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary">
                        {b.total_poin} poin
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </div>
      )}

      {/* Info pengguna login di luar Top 20 */}
      {uid && posisiSaya === -1 ? (
        <div className="mt-6 rounded-md border border-dashed border-primary bg-primary-soft/60 px-4 py-3">
          <p className="text-sm text-muted">
            Anda belum masuk Top 20. Mainkan kuis dan simulasi lagi untuk menaikkan poin.
          </p>
        </div>
      ) : null}

      {/* Tamu: ajakan masuk untuk ikut peringkat */}
      {!memuat && !pengguna ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-3.5 shadow-xs">
          <p className="flex items-center gap-2 text-xs font-medium text-muted">
            <Ikon nama="info" ukuran={16} className="shrink-0 text-primary" />
            Masuk dan simpan skor agar nama Anda tampil di papan peringkat.
          </p>
          <Link
            href="/masuk?kembali=/peringkat"
            className="text-xs font-bold text-primary hover:underline"
          >
            Masuk sekarang →
          </Link>
        </div>
      ) : null}
      </Container>
    </div>
  );
}
