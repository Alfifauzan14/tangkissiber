"use client";

// Kuis (FR-F5): 10 soal acak dari bank 20 setiap percobaan, penjelasan
// langsung per jawaban (§11.4), skor 0-100 + level di akhir (§11.5).
// Login: skor tersimpan otomatis ke kuis_hasil; tamu: ajakan masuk.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import soalDefault from "@/data/soal.json";
import { ambilKontenKlien } from "@/lib/konten";
import { hitungLevel } from "@/lib/poin";
import { useSesi } from "@/lib/sesi";
import { ambilPulang, hapusPulang, simpanTunda } from "@/lib/handoff";
import Container from "@/components/layout/Container";
import PageBanner from "@/components/layout/PageBanner";
import Tombol from "@/components/ui/Tombol";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";
import { KeadaanMemuat, KeadaanGagal } from "@/components/ui/Keadaan";

const HURUF = ["A", "B", "C", "D", "E"];

const MODE_KUIS = [
  {
    id: "campuran",
    label: "Campuran Lengkap",
    deskripsi: "Uji insting Anda dari berbagai modus penipuan digital sekaligus.",
    ikon: "quiz",
    jumlah: 10,
    pola: null,
  },
  {
    id: "otp",
    label: "OTP & Perbankan",
    deskripsi: "Kenali jebakan kode OTP, PIN, serta oknum petugas bank palsu.",
    ikon: "lock",
    jumlah: 10,
    pola: /otp|pin|bank|rekening|sandi|password/i,
  },
  {
    id: "kurir",
    label: "Kurir, APK & Tautan",
    deskripsi: "Waspadai file APK berbahaya, tautan pendek, dan domain tiruan.",
    ikon: "content_paste_search",
    jumlah: 10,
    pola: /kurir|apk|paket|tautan|link|domain|https|bit\.ly/i,
  },
  {
    id: "hadiah",
    label: "Hadiah & Lowongan",
    deskripsi: "Bedakan undian resmi dengan penipuan hadiah dan kerja fiktif.",
    ikon: "military_tech",
    jumlah: 10,
    pola: /hadiah|undian|lowongan|kerja|biaya|transfer/i,
  },
  {
    id: "kilat",
    label: "Kuis Kilat",
    deskripsi: "Latihan cepat 5 soal untuk mengasah kewaspadaan harian Anda.",
    ikon: "auto_awesome",
    jumlah: 5,
    pola: null,
  },
];

function acakSoal(daftar = soalDefault, modeId = "campuran") {
  const mode = MODE_KUIS.find((m) => m.id === modeId) || MODE_KUIS[0];
  let kandidat = mode.pola
    ? daftar.filter((s) => mode.pola.test(`${s.pertanyaan} ${s.penjelasan}`))
    : [...daftar];
  if (kandidat.length < mode.jumlah) {
    const sisa = daftar.filter((s) => !kandidat.some((k) => k.id === s.id));
    kandidat = [...kandidat, ...sisa];
  }
  const salinan = [...kandidat];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan.slice(0, Math.min(mode.jumlah, salinan.length));
}

export default function HalamanKuis() {
  const { pengguna } = useSesi();
  const router = useRouter();
  const [bankSoal, setBankSoal] = useState(soalDefault);
  const [modeId, setModeId] = useState("campuran");
  const [mulaiKuis, setMulaiKuis] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("kuis-fokus", mulaiKuis);
    window.dispatchEvent(new CustomEvent("ts-kuis-fokus", { detail: mulaiKuis }));
    return () => {
      document.documentElement.classList.remove("kuis-fokus");
      window.dispatchEvent(new CustomEvent("ts-kuis-fokus", { detail: false }));
    };
  }, [mulaiKuis]);
  const [soal, setSoal] = useState(null); // null = memuat (acak di klien)
  const [idx, setIdx] = useState(0);
  const [pilih, setPilih] = useState(null);
  const [jawaban, setJawaban] = useState({}); // { soalId: pilihanIndex }
  const [selesai, setSelesai] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState("idle");
  const [totalPoin, setTotalPoin] = useState(null); // poin terkini (login)
  const [percobaan, setPercobaan] = useState(0);
  const simpanRef = useRef("idle"); // guard agar insert hanya sekali (tanpa abort)
  const [pulang, setPulang] = useState(null); // sinyal handoff selesai
  
  // Timing untuk deteksi AI (Post-v1.0 #5)
  const [waktuMulai, setWaktuMulai] = useState(null);
  const [waktuPerSoal, setWaktuPerSoal] = useState({}); // { soalId: ms }
  const soalMulaiRef = useRef(Date.now());

  useEffect(() => {
    let aktif = true;
    ambilKontenKlien("soal").then((data) => {
      if (!aktif) return;
      const daftar = Array.isArray(data) && data.length > 0 ? data : soalDefault;
      setBankSoal(daftar);
      setSoal(acakSoal(daftar, "campuran"));
      setWaktuMulai(Date.now());
      soalMulaiRef.current = Date.now();
    });
    return () => {
      aktif = false;
    };
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

  // Hitung jumlah benar dari state jawaban
  const benar = Object.entries(jawaban).filter(([id, j]) => {
    const soalItem = bankSoal.find((s) => s.id === id);
    return soalItem && j === soalItem.jawaban;
  }).length;

  // Skor tersimpan otomatis untuk pengguna login (AC Kuis no. 3).
  // Panggil API /api/kuis/submit untuk validasi sisi server.
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
      try {
        const res = await fetch("/api/kuis/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            jawaban, 
            timing: { 
              mulai: waktuMulai, 
              selesai: Date.now(), 
              perSoal: waktuPerSoal 
            } 
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          simpanRef.current = "gagal";
          setStatusSimpan("gagal");
          return;
        }
        simpanRef.current = "tersimpan";
        setStatusSimpan("tersimpan");
        setTotalPoin(data.total_poin);
      } catch (e) {
        console.error("Gagal submit kuis:", e);
        simpanRef.current = "gagal";
        setStatusSimpan("gagal");
      }
    })();
  }, [selesai, pengguna, jawaban, percobaan]);

  function jawab(i) {
    if (pilih !== null) return;
    const sekarang = Date.now();
    const soalId = soal[idx].id;
    const durasi = sekarang - soalMulaiRef.current;
    setPilih(i);
    setJawaban((prev) => ({ ...prev, [soalId]: i }));
    setWaktuPerSoal((prev) => ({ ...prev, [soalId]: durasi }));
  }

  function lanjut() {
    const sekarang = Date.now();
    if (idx + 1 >= soal.length) {
      setSelesai(true);
    } else {
      setIdx(idx + 1);
      setPilih(null);
      soalMulaiRef.current = sekarang;
    }
  }

  function ulang(nextMode = modeId) {
    setModeId(nextMode);
    setSoal(acakSoal(bankSoal, nextMode));
    setIdx(0);
    setPilih(null);
    setJawaban({});
    setWaktuPerSoal({});
    setWaktuMulai(Date.now());
    soalMulaiRef.current = Date.now();
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
  const skor = Math.round((benar / soal.length) * 100);
  const levelTerpilih = totalPoin !== null ? hitungLevel(totalPoin) : hitungLevel(skor);

  return (
    <div>
      {!mulaiKuis ? (
        <PageBanner
          eyebrow="Latihan Pengetahuan"
          judul="Kuis Anti Penipuan"
          deskripsi="Pilih kategori kuis di bawah ini, jawab soalnya, lalu pelajari penjelasannya."
        />
      ) : null}

      {!mulaiKuis ? (
        <Container className="py-10 lg:py-12">
          {pulang ? (
            <div className="mb-6 flex items-center justify-center">
              <Badge warna="primary" ikon="check_circle">
                Skor kuis terakhir Anda telah tersimpan
              </Badge>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MODE_KUIS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  ulang(m.id);
                  setMulaiKuis(true);
                }}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Ikon nama={m.ikon} ukuran={24} />
                    </span>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                      {m.jumlah} Soal
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-ink">{m.label}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.deskripsi}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs font-bold text-primary">
                  <span>Mulai Kuis</span>
                  <span className="transition-transform duration-150 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Container>
      ) : (
        <Container className="max-w-[720px] py-8 lg:py-10">
          {/* Top Bar ala Duolingo: tombol kembali ke kategori, progress bar tebal, skor berjalan, penghitung soal */}
          <header className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMulaiKuis(false)}
              aria-label="Kembali ke pilihan kategori kuis"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors duration-150 hover:bg-primary-soft hover:text-primary"
            >
              <Ikon nama="close" ukuran={20} />
            </button>
            <div
              className="h-3.5 flex-1 overflow-hidden rounded-full bg-primary-soft"
              role="progressbar"
              aria-valuenow={selesai ? soal.length : idx + (pilih !== null ? 1 : 0)}
              aria-valuemin={0}
              aria-valuemax={soal.length}
              aria-label="Progres kuis"
            >
              <div
                className="h-full rounded-full bg-aman transition-all duration-300"
                style={{
                  width: `${
                    ((selesai ? soal.length : idx + (pilih !== null ? 1 : 0)) / soal.length) * 100
                  }%`,
                }}
              />
            </div>
            <span className="angka shrink-0 rounded-full bg-aman-soft px-3 py-1 text-xs font-bold text-aman">
              Skor: {skor}
            </span>
            <span className="angka shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              {Math.min(idx + 1, soal.length)} / {soal.length}
            </span>
          </header>

      {!selesai ? (
        <article className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Pertanyaan {idx + 1}
          </p>
          <h1 className="mt-2 text-lg font-bold leading-snug text-ink md:text-xl">
            {q.pertanyaan}
          </h1>

          {/* Kartu pilihan taktil ala Duolingo (border-2 border-b-4) */}
          <div className="mt-6 flex flex-col gap-3">
            {q.pilihan.map((teks, i) => {
              const sudahJawab = pilih !== null;
              const iniBenar = i === q.jawaban;
              const iniPilihan = i === pilih;
              let kelas =
                "border-line border-b-line bg-surface hover:border-primary/50 hover:bg-primary-soft/30 active:translate-y-0.5 active:border-b-2";
              let kotak = "border-line bg-bg text-primary";
              let ikon = null;
              if (sudahJawab && iniBenar) {
                kelas = "border-aman border-b-aman bg-aman-soft";
                kotak = "border-aman bg-aman text-white";
                ikon = <Ikon nama="check_circle" ukuran={20} className="ml-auto shrink-0 text-aman" />;
              } else if (sudahJawab && iniPilihan && !iniBenar) {
                kelas = "border-bahaya border-b-bahaya bg-bahaya-soft";
                kotak = "border-bahaya bg-bahaya text-white";
                ikon = <Ikon nama="cancel" ukuran={20} className="ml-auto shrink-0 text-bahaya" />;
              } else if (sudahJawab) {
                kelas = "border-line border-b-line bg-surface opacity-55";
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jawab(i)}
                  disabled={sudahJawab}
                  aria-pressed={iniPilihan}
                  className={`flex min-h-14 items-center gap-3.5 rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-sm font-semibold text-ink transition-all duration-150 ${kelas} ${
                    sudahJawab ? "cursor-default" : ""
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-bold ${kotak}`}
                  >
                    {HURUF[i]}
                  </span>
                  <span className="flex-1 leading-snug">{teks}</span>
                  {ikon}
                </button>
              );
            })}
          </div>

          {/* Banner umpan balik ala Duolingo (FR-F5-02) */}
          {pilih !== null ? (
            <div
              className={`mt-6 rounded-2xl border-2 p-4 md:p-5 ${
                pilih === q.jawaban
                  ? "border-aman/40 bg-aman-soft"
                  : "border-bahaya/40 bg-bahaya-soft"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Ikon
                  nama={pilih === q.jawaban ? "check_circle" : "cancel"}
                  ukuran={22}
                  className={`mt-0.5 shrink-0 ${pilih === q.jawaban ? "text-aman" : "text-bahaya"}`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      pilih === q.jawaban ? "text-aman" : "text-bahaya"
                    }`}
                  >
                    {pilih === q.jawaban ? "Hebat! Jawaban Benar" : "Kurang Tepat"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/90">{q.penjelasan}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={lanjut}
                className={`mt-4 flex min-h-12 w-full items-center justify-center rounded-xl border-b-4 px-5 text-sm font-bold uppercase tracking-wide text-white transition-all duration-150 active:translate-y-0.5 active:border-b-2 ${
                  pilih === q.jawaban
                    ? "border-[#14532d] bg-aman hover:opacity-95"
                    : "border-[#7f1d1d] bg-bahaya hover:opacity-95"
                }`}
              >
                {idx + 1 >= soal.length ? "Lihat Hasil" : "Lanjut"}
              </button>
            </div>
          ) : null}
        </article>
      ) : (
        <article className="mt-6 rounded-2xl border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)] md:p-8">
          {/* Gauge skor SVG */}
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="8"
                stroke="currentColor"
                className="text-line"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 * (1 - skor / 100)}
                className={`transition-all duration-500 ${
                  skor >= 80 ? "text-aman" : skor >= 50 ? "text-waspada" : "text-bahaya"
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="angka text-3xl font-extrabold leading-none text-ink">{skor}</span>
              <span className="mt-1 text-[11px] font-semibold text-muted">/ 100</span>
            </div>
          </div>

          <h2 className="mt-4 text-xl font-bold text-ink">
            {skor >= 80 ? "Luar Biasa!" : skor >= 50 ? "Cukup Bagus!" : "Terus Berlatih!"}
          </h2>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Badge warna="primary" ikon="military_tech">
              Level {levelTerpilih}
            </Badge>
            {statusSimpan === "tersimpan" || pulang ? (
              <Badge warna="aman" ikon="check_circle">
                Tersimpan
              </Badge>
            ) : null}
          </div>

          {/* Ringkasan ringkas 2 kolom */}
          <div className="mx-auto mt-5 grid max-w-xs grid-cols-2 divide-x divide-line rounded-xl border border-line bg-bg py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Jawaban Benar
              </p>
              <p className="angka mt-0.5 text-base font-bold text-ink">
                {benar} / {soal.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Akurasi
              </p>
              <p className="angka mt-0.5 text-base font-bold text-primary">{skor}%</p>
            </div>
          </div>

          {statusSimpan === "gagal" ? (
            <div className="mt-4">
              <KeadaanGagal
                pesan="Gagal menyimpan skor. Periksa koneksi internet Anda."
                cobaLagi={() => {
                  simpanRef.current = "idle";
                  setPercobaan((c) => c + 1);
                }}
              />
            </div>
          ) : statusSimpan === "menyimpan" ? (
            <p className="mt-3 text-xs text-muted">Menyimpan skor...</p>
          ) : null}

          {/* Tombol aksi tersusun rapi */}
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-2.5">
            <div className={`grid gap-2.5 ${!pengguna ? "sm:grid-cols-2" : "grid-cols-1"}`}>
              <Tombol gaya="primary" ikon="replay" onClick={() => ulang()} className="w-full md:w-full">
                Kerjakan Kuis Baru
              </Tombol>
              {!pengguna ? (
                <Tombol
                  gaya="tonal"
                  className="w-full md:w-full"
                  onClick={() => {
                    simpanTunda({ jenis: "kuis", skor });
                    router.push("/masuk?kembali=/kuis");
                  }}
                >
                  Masuk untuk Simpan
                </Tombol>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Tombol gaya="ghost" href="/peringkat" className="w-full border border-line md:w-full">
                Lihat Peringkat
              </Tombol>
              <Tombol
                gaya="ghost"
                onClick={() => setMulaiKuis(false)}
                className="w-full border border-line md:w-full"
              >
                Kategori Lain
              </Tombol>
            </div>
          </div>
        </article>
      )}
        </Container>
      )}
    </div>
  );
}
