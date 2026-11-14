"use client";

// Kuis (FR-F5): 10 soal acak dari bank 20 setiap percobaan, penjelasan
// langsung per jawaban (§11.4), skor 0-100 + level di akhir (§11.5).
// Login: skor tersimpan otomatis ke kuis_hasil; tamu: ajakan masuk.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import soalSemua from "@/data/soal.json";
import { hitungLevel } from "@/lib/poin";
import { useSesi } from "@/lib/sesi";
import { supabase } from "@/lib/supabase";
import { ambilPulang, hapusPulang, simpanTunda } from "@/lib/handoff";
import Container from "@/components/layout/Container";
import Tombol from "@/components/ui/Tombol";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";
import { KeadaanMemuat, KeadaanGagal } from "@/components/ui/Keadaan";

const HURUF = ["A", "B", "C", "D", "E"];
const POIN_PER_SOAL = 10;

function acak10() {
  const salinan = [...soalSemua];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan.slice(0, 10);
}

export default function HalamanKuis() {
  const { pengguna } = useSesi();
  const router = useRouter();
  const [soal, setSoal] = useState(null); // null = memuat (acak di klien)
  const [idx, setIdx] = useState(0);
  const [pilih, setPilih] = useState(null);
  const [benar, setBenar] = useState(0);
  const [selesai, setSelesai] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState("idle");
  const [totalPoin, setTotalPoin] = useState(null); // poin terkini (login)
  const [percobaan, setPercobaan] = useState(0);
  const simpanRef = useRef("idle"); // guard agar insert hanya sekali (tanpa abort)
  const [pulang, setPulang] = useState(null); // sinyal handoff selesai

  useEffect(() => {
    setSoal(acak10());
  }, []);

  // Baca sinyal pulang dari handoff SEKALI di mount (deps kosong).
  // Harus jalan SEBELUM efek auto-simpan agar simpanRef="tersimpan"
  // dan auto-simpan skip insert.
  useEffect(() => {
    const info = ambilPulang();
    if (info && info.jenis === "kuis") {
      hapusPulang();
      setPulang(info);
      simpanRef.current = "tersimpan";
    }
  }, []);

  // Skor tersimpan otomatis untuk pengguna login (AC Kuis no. 3).
  // Cek pulang di dalam efek ini JUGA sebagai fallback (bukan hanya efek terpisah)
  // agar tidak ada race condition: jika handoff baru selesai, skip insert.
  useEffect(() => {
    if (!selesai || !pengguna) return;
    if (simpanRef.current === "menyimpan" || simpanRef.current === "tersimpan") return;
    // Fallback: cek sinyal pulang langsung (aman jika efek terpisah belum jalan)
    const info = ambilPulang();
    if (info && info.jenis === "kuis") {
      hapusPulang();
      setPulang(info);
      simpanRef.current = "tersimpan";
      return;
    }
    simpanRef.current = "menyimpan";
    setStatusSimpan("menyimpan");
    (async () => {
      const skor = benar * POIN_PER_SOAL;
      const { error } = await supabase.from("kuis_hasil").insert({ skor });
      if (error) {
        simpanRef.current = "gagal";
        setStatusSimpan("gagal");
        return;
      }
      simpanRef.current = "tersimpan";
      setStatusSimpan("tersimpan");
      // level sesuai total poin terkini dari view peringkat
      const { data: baris } = await supabase
        .from("peringkat")
        .select("total_poin")
        .eq("id", pengguna.id)
        .single();
      setTotalPoin(baris ? baris.total_poin : skor);
    })();
  }, [selesai, pengguna, benar, percobaan]);

  function jawab(i) {
    if (pilih !== null) return;
    setPilih(i);
    if (i === soal[idx].jawaban) setBenar((b) => b + 1);
  }

  function lanjut() {
    if (idx + 1 >= soal.length) {
      setSelesai(true);
    } else {
      setIdx(idx + 1);
      setPilih(null);
    }
  }

  function ulang() {
    setSoal(acak10());
    setIdx(0);
    setPilih(null);
    setBenar(0);
    setSelesai(false);
    setStatusSimpan("idle");
    setTotalPoin(null);
    setPercobaan(0);
    setPulang(null);
    simpanRef.current = "idle";
  }

  if (!soal) {
    return (
      <Container className="max-w-[720px] py-10">
        <KeadaanMemuat />
      </Container>
    );
  }

  const q = soal[idx];
  const skor = benar * POIN_PER_SOAL;
  const levelTerpilih = totalPoin !== null ? hitungLevel(totalPoin) : hitungLevel(skor);

  return (
    <Container className="max-w-[720px] py-8 lg:py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Kuis</h1>
          <p className="mt-1 text-sm text-muted">
            10 soal acak dari bank 20 soal. Jawab, baca penjelasannya, lanjut.
          </p>
        </div>
        <span className="angka shrink-0 text-sm font-semibold text-muted">
          {Math.min(idx + 1, soal.length)}/{soal.length}
        </span>
      </header>

      {/* Progres soal */}
      <div className="mt-3 h-2 w-full rounded-full bg-primary-soft">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${((selesai ? soal.length : idx) / soal.length) * 100}%` }}
        />
      </div>

      {!selesai ? (
        <article className="mt-6 rounded-lg border border-line bg-surface p-4 md:p-6">
          <h2 className="font-semibold text-ink">{q.pertanyaan}</h2>

          <div className="mt-4 flex flex-col gap-2">
            {q.pilihan.map((teks, i) => {
              const sudahJawab = pilih !== null;
              const iniBenar = i === q.jawaban;
              const iniPilihan = i === pilih;
              let kelas = "border-line bg-surface";
              let kotak = "border-line text-primary";
              let ikon = null;
              if (sudahJawab && iniBenar) {
                kelas = "border-aman bg-aman-soft";
                kotak = "border-aman bg-aman text-white";
                ikon = <Ikon nama="check_circle" ukuran={18} className="ml-auto text-aman" />;
              } else if (sudahJawab && iniPilihan && !iniBenar) {
                kelas = "border-bahaya bg-bahaya-soft";
                kotak = "border-bahaya bg-bahaya text-white";
                ikon = <Ikon nama="cancel" ukuran={18} className="ml-auto text-bahaya" />;
              } else if (sudahJawab) {
                kelas = "border-line bg-surface opacity-60";
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jawab(i)}
                  disabled={sudahJawab}
                  aria-pressed={iniPilihan}
                  className={`flex min-h-11 items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors duration-150 ${kelas} ${
                    sudahJawab ? "cursor-default" : "hover:border-accent"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border text-xs font-bold ${kotak}`}
                  >
                    {HURUF[i]}
                  </span>
                  <span className="flex-1">{teks}</span>
                  {ikon}
                </button>
              );
            })}
          </div>

          {/* Penjelasan muncul langsung setelah memilih (FR-F5-02) */}
          {pilih !== null ? (
            <div
              className={`mt-4 rounded-md border-l-4 p-3 text-sm ${
                pilih === q.jawaban
                  ? "border-l-aman bg-aman-soft/60"
                  : "border-l-bahaya bg-bahaya-soft/60"
              }`}
            >
              <p className="text-muted">
                <strong
                  className={`font-semibold ${
                    pilih === q.jawaban ? "text-aman" : "text-bahaya"
                  }`}
                >
                  {pilih === q.jawaban ? "Benar." : "Belum tepat."}
                </strong>{" "}
                {q.penjelasan}
              </p>
              <Tombol gaya="primary" className="mt-3 w-full sm:w-auto" onClick={lanjut}>
                {idx + 1 >= soal.length ? "Lihat Hasil" : "Soal Berikutnya"}
              </Tombol>
            </div>
          ) : null}
        </article>
      ) : (
        <article className="mt-6 rounded-lg border border-line bg-surface p-4 text-center md:p-6">
          <p className="text-sm font-semibold text-muted">Skor kuis Anda</p>
          <p className="angka text-5xl font-bold text-primary">{skor}</p>
          <div className="mt-2 flex justify-center">
            <Badge warna="primary" ikon="military_tech">
              Level {levelTerpilih}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted">
            {benar} dari {soal.length} jawaban tepat (10 poin per soal)
          </p>

          <div className="mt-4">
            {statusSimpan === "tersimpan" || pulang ? (
              <Badge warna="primary" ikon="check_circle">
                Tersimpan
              </Badge>
            ) : statusSimpan === "gagal" ? (
              <KeadaanGagal
                pesan="Gagal menyimpan skor. Periksa koneksi internet Anda."
                cobaLagi={() => {
                  simpanRef.current = "idle";
                  setPercobaan((c) => c + 1);
                }}
              />
            ) : statusSimpan === "menyimpan" ? (
              <p className="text-sm text-muted">Menyimpan skor...</p>
            ) : !pengguna ? (
              <Tombol
                gaya="tonal"
                onClick={() => {
                  simpanTunda({ jenis: "kuis", skor });
                  router.push("/masuk?kembali=/kuis");
                }}
              >
                Masuk untuk menyimpan
              </Tombol>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Tombol gaya="primary" ikon="replay" onClick={ulang}>
              Kerjakan Kuis Baru
            </Tombol>
            <Tombol gaya="tonal" href="/peringkat">
              Lihat Peringkat
            </Tombol>
          </div>
        </article>
      )}
    </Container>
  );
}
