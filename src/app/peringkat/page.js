"use client";

// Peringkat (FR-F9): Top 20 pengguna dari view `peringkat` berdasarkan
// total poin menurun. Posisi pengguna login disorot (FR-F9-02); tamu
// hanya melihat tanpa sorotan (FR-F9-03). Hanya nama_tampil + poin,
// tanpa email (FR-F9-04, view sudah membatasi kolom).
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/sesi";
import { hitungLevel } from "@/lib/poin";
import Container from "@/components/layout/Container";
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
    <Container className="py-8 lg:py-10">
      <header className="max-w-xl">
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Peringkat</h1>
        <p className="mt-2 text-sm text-muted">
          Top 20 pengguna berdasarkan total poin. Poin = skor terbaik kuis + skor
          terbaik tiap skenario simulasi (maksimum 500).
        </p>
      </header>

      {baris.length === 0 ? (
        <div className="mt-6">
          <KeadaanKosong
            ikon="leaderboard"
            pesan="Belum ada pengguna di peringkat. Jadilah yang pertama menyimpan skor."
          />
        </div>
      ) : (
        <ol className="mt-6 flex flex-col gap-2">
          {baris.map((b, i) => {
            const saya = b.id === uid;
            const medali = i === 0 ? "emoji_events" : i === 1 ? "stars" : i === 2 ? "workspace_premium" : null;
            return (
              <li
                key={b.id}
                className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
                  saya ? "border-primary bg-primary-soft" : "border-line bg-surface"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`angka flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    saya ? "bg-primary text-white" : "bg-primary-soft text-primary"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {b.nama_tampil}
                    {saya ? <span className="ml-2 text-xs font-bold text-primary">(Anda)</span> : null}
                  </p>
                  <p className="text-xs text-muted">Level {hitungLevel(b.total_poin)}</p>
                </div>
                {medali ? (
                  <Ikon nama={medali} ukuran={18} className={i === 0 ? "text-[#d4a017]" : "text-muted"} />
                ) : null}
                <span className="angka text-base font-bold text-primary">{b.total_poin}</span>
              </li>
            );
          })}
        </ol>
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
        <p className="mt-6 flex items-center gap-2 text-xs text-muted">
          <Ikon nama="info" ukuran={16} className="shrink-0" />
          Masuk dan simpan skor agar nama Anda tampil di peringkat.
        </p>
      ) : null}
    </Container>
  );
}
