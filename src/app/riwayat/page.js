"use client";

// Riwayat Saya (FR-F8): khusus login. Daftar hasil kuis & simulasi,
// skor terbaik, level, total poin. Tamu diarahkan ke /masuk (FR-F8-01).
// Poin & level dibaca dari view `peringkat` (dihitung ulang di database).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/sesi";
import { hitungLevel, POIN_MAKS } from "@/lib/poin";
import Container from "@/components/layout/Container";
import { KeadaanMemuat, KeadaanGagal, KeadaanKosong } from "@/components/ui/Keadaan";
import Badge from "@/components/ui/Badge";

const JUDUL_SKENARIO = {
  "kurir-apk": "Kurir dan APK",
  "hadiah-palsu": "Hadiah Palsu",
  "otp-bank": "Petugas Bank Minta OTP",
  "lowongan-palsu": "Lowongan Kerja Palsu",
};

function fmtTanggal(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HalamanRiwayat() {
  const router = useRouter();
  const { memuat, pengguna } = useSesi();
  const uid = pengguna ? pengguna.id : null;
  const [data, setData] = useState(null);
  const [gagal, setGagal] = useState(false);
  const [coba, setCoba] = useState(0);

  // Guard klien: tamu diarahkan ke /masuk (ARCHITECTURE.md §4)
  useEffect(() => {
    if (!memuat && !pengguna) router.replace("/masuk?kembali=/riwayat");
  }, [memuat, pengguna, router]);

  useEffect(() => {
    if (!uid) return;
    let aktif = true;
    (async () => {
      const [kuis, sim, rank] = await Promise.all([
        supabase.from("kuis_hasil").select("skor, created_at").order("created_at", { ascending: false }),
        supabase
          .from("simulasi_hasil")
          .select("skenario_id, skor, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("peringkat").select("total_poin").eq("id", uid).single(),
      ]);
      if (!aktif) return;
      if (kuis.error || sim.error || rank.error) {
        setGagal(true);
        return;
      }
      setData({ kuis: kuis.data, sim: sim.data, totalPoin: rank.data ? rank.data.total_poin : 0 });
    })();
    return () => {
      aktif = false;
    };
  }, [uid, coba]);

  if (memuat || !pengguna) {
    return (
      <Container className="py-10">
        <KeadaanMemuat />
      </Container>
    );
  }

  if (gagal) {
    return (
      <Container className="py-10">
        <KeadaanGagal
          pesan="Gagal memuat riwayat. Periksa koneksi internet Anda."
          cobaLagi={() => {
            setGagal(false);
            setData(null);
            setCoba((c) => c + 1);
          }}
        />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="py-10">
        <KeadaanMemuat />
      </Container>
    );
  }

  const kuisTerbaik = data.kuis.reduce((a, k) => Math.max(a, k.skor), 0);
  const simTerbaik = {};
  for (const s of data.sim) {
    simTerbaik[s.skenario_id] = Math.max(simTerbaik[s.skenario_id] || 0, s.skor);
  }
  const level = hitungLevel(data.totalPoin);

  return (
    <Container className="py-8 lg:py-10">
      <header className="max-w-xl">
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Riwayat Saya</h1>
        <p className="mt-2 text-sm text-muted">
          Semua hasil kuis dan simulasi yang tersimpan, plus skor terbaik Anda.
        </p>
      </header>

      {/* Ringkasan: total poin, level, skor terbaik (FR-F8-02) */}
      <section aria-label="Ringkasan progres" className="mt-6 rounded-lg border border-line bg-surface p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-muted">Total poin</p>
            <p className="angka text-5xl font-bold text-primary">{data.totalPoin}</p>
            <p className="text-xs text-muted">dari maksimum {POIN_MAKS}</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <Badge warna="primary" ikon="military_tech">
              Level {level}
            </Badge>
            <p className="text-xs text-muted">
              Skor terbaik kuis: <strong className="text-ink angka">{kuisTerbaik}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Skor terbaik per skenario simulasi */}
      <section aria-label="Skor terbaik simulasi" className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Skor terbaik simulasi</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.keys(JUDUL_SKENARIO).map((id) => (
            <div key={id} className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
              <span className="text-sm font-medium text-ink">{JUDUL_SKENARIO[id]}</span>
              <span className="angka text-sm font-bold text-primary">
                {simTerbaik[id] !== undefined ? simTerbaik[id] : "-"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Riwayat kuis */}
      <section aria-label="Riwayat kuis" className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Hasil kuis</h2>
        {data.kuis.length === 0 ? (
          <KeadaanKosong
            ikon="quiz"
            pesan="Belum ada hasil kuis tersimpan. Kerjakan kuis pertama Anda."
            labelAksi="Kerjakan Kuis"
            tujuanAksi="/kuis"
          />
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {data.kuis.map((k, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
                <span className="text-sm text-muted">{fmtTanggal(k.created_at)}</span>
                <span className="angka text-sm font-bold text-primary">Skor {k.skor}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Riwayat simulasi */}
      <section aria-label="Riwayat simulasi" className="mt-6 pb-4">
        <h2 className="text-sm font-semibold text-ink">Hasil simulasi</h2>
        {data.sim.length === 0 ? (
          <KeadaanKosong
            ikon="forum"
            pesan="Belum ada hasil simulasi tersimpan. Coba skenario pertama Anda."
            labelAksi="Coba Simulasi"
            tujuanAksi="/simulasi"
          />
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {data.sim.map((s, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
                <span className="text-sm font-medium text-ink">
                  {JUDUL_SKENARIO[s.skenario_id] || s.skenario_id}
                  <span className="ml-2 text-xs text-muted">{fmtTanggal(s.created_at)}</span>
                </span>
                <span className="angka text-sm font-bold text-primary">Skor {s.skor}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
