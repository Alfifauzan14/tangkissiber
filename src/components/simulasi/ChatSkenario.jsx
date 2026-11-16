"use client";

// Percakapan simulasi (FR-F3): gelembung chat motif (tiga sudut 16px,
// satu sudut ekor 4px), pilihan respons per langkah, umpan balik langsung,
// skor 0-100 + ringkasan tanda bahaya di akhir (DESIGN.md §11.3).
// Skor: aman=100, waspada=50, bahaya=0 per langkah; rata-rata dibulatkan.
// Validasi skor via API /api/simulasi/submit (Post-v1.0 #3).
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSesi } from "@/lib/sesi";
import { simpanTunda, ambilPulang, hapusPulang } from "@/lib/handoff";
import Tombol from "@/components/ui/Tombol";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";
import { KeadaanGagal } from "@/components/ui/Keadaan";

const NILAI_SKOR = { aman: 100, waspada: 50, bahaya: 0 };
const LABEL = { aman: "Aman", waspada: "Waspada", bahaya: "Bahaya" };
const GARIS = { aman: "border-l-aman", waspada: "border-l-waspada", bahaya: "border-l-bahaya" };
const TEKS = { aman: "text-aman", waspada: "text-waspada", bahaya: "text-bahaya" };

function fmtWaktu(t) {
  return `${String(t.getHours()).padStart(2, "0")}.${String(t.getMinutes()).padStart(2, "0")}`;
}

function Waktu({ t }) {
  if (!t) return null;
  return <span className="mt-1 block text-[11px] text-muted">{fmtWaktu(t)}</span>;
}

export default function ChatSkenario({ data }) {
  const { pengguna } = useSesi();
  const router = useRouter();
  // Waktu diinisialisasi di klien saja: prerender harus deterministik
  // (Next.js 16 Cache Components menolak new Date() saat prerender).
  const [mulai, setMulai] = useState(null);
  const [sekarang, setSekarang] = useState(null);
  const [idx, setIdx] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [selesai, setSelesai] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState("idle"); // idle|menyimpan|tersimpan|gagal
  const [percobaan, setPercobaan] = useState(0);
  const simpanRef = useRef("idle"); // guard agar insert hanya sekali (tanpa abort)
  const [pulang, setPulang] = useState(null); // sinyal handoff selesai
  const ujungRef = useRef(null);
  
  // Timing untuk deteksi AI (Post-v1.0 #5)
  const [waktuMulaiSim, setWaktuMulaiSim] = useState(null);
  const [waktuPerLangkah, setWaktuPerLangkah] = useState({}); // { langkahIndex: ms }
  const langkahMulaiRef = useRef(Date.now());

  // Jam berjalan di header chat (FR-F3-01), segar tiap 30 detik
  useEffect(() => {
    setMulai(new Date());
    setSekarang(new Date());
    setWaktuMulaiSim(Date.now());
    langkahMulaiRef.current = Date.now();
    const t = setInterval(() => setSekarang(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Baca sinyal pulang dari handoff SEKALI di mount (deps kosong).
  // Harus jalan SEBELUM efek auto-simpan agar simpanRef="tersimpan"
  // dan auto-simpan skip insert. Tanpa ini, jika selesai=true dari cache,
  // auto-simpan jalan dan insert ganda.
  useEffect(() => {
    const info = ambilPulang();
    if (info && info.jenis === "simulasi" && info.skenario_id === data.id) {
      hapusPulang();
      setPulang(info);
      simpanRef.current = "tersimpan";
    }
  }, [data.id]);

  // Gulir ke pesan terbaru
  useEffect(() => {
    ujungRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [idx, jawaban, selesai]);

  const skor = useMemo(() => {
    const semua = Object.values(jawaban);
    if (semua.length === 0) return 0;
    const jumlah = semua.reduce((a, j) => a + NILAI_SKOR[j.nilai], 0);
    return Math.round(jumlah / data.langkah.length);
  }, [jawaban, data.langkah.length]);

  // Skor tersimpan otomatis sekali untuk pengguna login (AC Simulasi no. 4).
  // Panggil API /api/simulasi/submit untuk validasi sisi server (Post-v1.0 #3).
  useEffect(() => {
    if (!selesai || !pengguna) return;
    if (simpanRef.current === "menyimpan" || simpanRef.current === "tersimpan") return;
    // Fallback: cek sinyal pulang langsung (aman jika efek terpisah belum jalan)
    const info = ambilPulang();
    if (info && info.jenis === "simulasi" && info.skenario_id === data.id) {
      hapusPulang();
      setPulang(info);
      simpanRef.current = "tersimpan";
      return;
    }
    simpanRef.current = "menyimpan";
    setStatusSimpan("menyimpan");
    (async () => {
      try {
        // Format jawaban untuk API: { langkahIndex: { nilai: "aman"|"waspada"|"bahaya" } }
        const jawabanAPI = {};
        Object.entries(jawaban).forEach(([i, j]) => {
          jawabanAPI[i] = { nilai: j.nilai };
        });
        const res = await fetch("/api/simulasi/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            skenario_id: data.id, 
            jawaban: jawabanAPI,
            timing: { 
              mulai: waktuMulaiSim, 
              selesai: Date.now(), 
              perLangkah: waktuPerLangkah 
            } 
          }),
        });
        const result = await res.json();
        if (!res.ok || !result.ok) {
          simpanRef.current = "gagal";
          setStatusSimpan("gagal");
          return;
        }
        simpanRef.current = "tersimpan";
        setStatusSimpan("tersimpan");
      } catch (e) {
        console.error("Gagal submit simulasi:", e);
        simpanRef.current = "gagal";
        setStatusSimpan("gagal");
      }
    })();
  }, [selesai, pengguna, jawaban, data.id, percobaan]);

  function jawab(pilihan) {
    const sekarang = Date.now();
    const durasi = sekarang - langkahMulaiRef.current;
    setJawaban((j) => ({
      ...j,
      [idx]: { teks: pilihan.teks, nilai: pilihan.nilai, umpan_balik: pilihan.umpan_balik },
    }));
    setWaktuPerLangkah((prev) => ({ ...prev, [idx]: durasi }));
  }

  function lanjut() {
    const sekarang = Date.now();
    if (idx + 1 >= data.langkah.length) {
      setSelesai(true);
    } else {
      setIdx(idx + 1);
      langkahMulaiRef.current = sekarang;
    }
  }

  function ulang() {
    setIdx(0);
    setJawaban({});
    setWaktuPerLangkah({});
    setWaktuMulaiSim(Date.now());
    langkahMulaiRef.current = Date.now();
    setSelesai(false);
    setStatusSimpan("idle");
    setPercobaan(0);
    setPulang(null);
    simpanRef.current = "idle";
  }

  const semuaLangkah = data.langkah.map((l, i) => ({ l, i }));
  const langkahTerjawabSemua = Object.keys(jawaban).length === data.langkah.length;
  const langkahAktif = !selesai ? data.langkah[idx] : null;
  const sudahJawabAktif = Boolean(jawaban[idx]);

  return (
    <div className="mx-auto flex h-dvh w-full flex-col overflow-hidden bg-[#efeae2] dark:bg-[#0b141a] sm:h-[780px] sm:max-h-[88dvh] sm:max-w-[420px] sm:rounded-[38px] sm:border-[8px] sm:border-[#1e293b] sm:shadow-2xl">
      {/* Status Bar HP (jam + wifi + sinyal + baterai) */}
      <div
        aria-hidden="true"
        className="flex items-center justify-between bg-[#054c44] px-5 pb-1 pt-2 text-[11px] font-semibold text-white/95 dark:bg-[#182229]"
      >
        <span className="angka">{sekarang ? fmtWaktu(sekarang) : "11.35"}</span>
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.5 16.4 10.7 16 12 16s2.5.4 3.5 1.1l1.4-1.4C15.5 14.6 13.8 14 12 14s-3.5.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.3 13 9.6 12 12 12s4.7 1 6.3 2.3l1.4-1.4C17.7 11.1 15 10 12 10s-5.7 1.1-7.7 2.9z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M2 22h20V2z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
          </svg>
        </div>
      </div>

      {/* Kepala chat ala WhatsApp + tombol Kembali */}
      <header className="z-30 flex shrink-0 items-center gap-2.5 bg-[#075e54] px-3 py-2.5 text-white shadow-sm dark:bg-[#1f2c34]">
        <Link
          href="/simulasi"
          aria-label="Kembali ke daftar simulasi"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-150 hover:bg-white/15"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-sm font-bold text-[#075e54]"
        >
          {data.penipu.nama.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{data.penipu.nama}</p>
          <p className="truncate text-[11px] text-white/80">
            {data.penipu.peran} • online
          </p>
        </div>
        <div className="flex items-center gap-3.5 pr-1 text-white/90" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </div>
      </header>

      {/* Aliran pesan ala WhatsApp dengan wallpaper doodle SVG asli (scrollable tanpa scrollbar OS) */}
      {!(selesai && langkahTerjawabSemua) ? (
        <div
          className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain p-3.5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23000000' stroke-opacity='0.06' stroke-width='1.4'%3E%3Crect x='14' y='14' width='18' height='13' rx='3'/%3E%3Ccircle cx='78' cy='24' r='8'/%3E%3Cpath d='M74 24h8M78 20v8'/%3E%3Cpath d='M24 72l8-6 8 6v10H24z'/%3E%3Cpath d='M76 74c0-5 12-5 12 0v6H76z'/%3E%3Ccircle cx='52' cy='52' r='6'/%3E%3Cpath d='M100 50l6 6-6 6'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px",
          }}
        >
        {/* Pill tanggal ala WhatsApp */}
        <div className="my-1 flex justify-center">
          <span className="rounded-lg bg-[#d1e7f5] px-3 py-1 text-[11px] font-medium text-[#111b21] shadow-xs dark:bg-[#182229] dark:text-[#8696a0]">
            Hari Ini
          </span>
        </div>

        {/* Pesan awal penipu dengan ekor segitiga kiri */}
        <div className="relative max-w-[85%] self-start pl-2">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-0 w-0 border-r-[10px] border-t-[10px] border-r-white border-t-transparent rotate-90 dark:border-r-[#202c33]"
          />
          <div className="rounded-lg rounded-tl-none bg-white px-3.5 py-2 text-sm text-[#111b21] shadow-xs dark:bg-[#202c33] dark:text-[#e9edef]">
            <p className="leading-relaxed">{data.pesan_awal}</p>
            <span className="mt-0.5 block text-right text-[10px] text-[#667781] dark:text-[#8696a0]">
              {mulai ? fmtWaktu(mulai) : ""}
            </span>
          </div>
        </div>

        {semuaLangkah.map(({ l, i }) => {
          if (i > idx) return null;
          const waktu = mulai ? new Date(mulai.getTime() + (i + 1) * 60000) : null;
          return (
            <div key={i} className="flex flex-col gap-2">
              {/* Pesan penipu untuk langkah ini */}
              <div className="relative max-w-[85%] self-start pl-2">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-0 w-0 border-r-[10px] border-t-[10px] border-r-white border-t-transparent rotate-90 dark:border-r-[#202c33]"
                />
                <div className="rounded-lg rounded-tl-none bg-white px-3.5 py-2 text-sm text-[#111b21] shadow-xs dark:bg-[#202c33] dark:text-[#e9edef]">
                  <p className="leading-relaxed">{l.pesan}</p>
                  <span className="mt-0.5 block text-right text-[10px] text-[#667781] dark:text-[#8696a0]">
                    {waktu ? fmtWaktu(waktu) : ""}
                  </span>
                </div>
              </div>

              {/* Jawaban pengguna (bubble hijau WA dengan ekor kanan) + umpan balik langsung */}
              {jawaban[i] ? (
                <div className="flex flex-col items-end gap-1.5">
                  <div className="relative max-w-[85%] pr-2">
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-0 h-0 w-0 border-l-[10px] border-t-[10px] border-l-[#dcf8c6] border-t-transparent -rotate-90 dark:border-l-[#005c4b]"
                    />
                    <div className="rounded-lg rounded-tr-none bg-[#dcf8c6] px-3.5 py-2 text-sm text-[#111b21] shadow-xs dark:bg-[#005c4b] dark:text-[#e9edef]">
                      <p className="leading-relaxed">{jawaban[i].teks}</p>
                      <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-[#8696a0]">
                        {waktu ? fmtWaktu(waktu) : ""}
                        <span className="font-bold text-[#34b7f1]">✓✓</span>
                      </span>
                    </div>
                  </div>
                  <div
                    className={`max-w-[90%] rounded-xl border-l-4 bg-surface p-3 text-xs shadow-xs ${GARIS[jawaban[i].nilai]}`}
                  >
                    <p className="leading-relaxed text-muted">
                      <strong className={`font-bold ${TEKS[jawaban[i].nilai]}`}>
                        {LABEL[jawaban[i].nilai]}.
                      </strong>{" "}
                      {jawaban[i].umpan_balik}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        <div ref={ujungRef} />
        </div>
      ) : null}

      {/* Layar hasil ringkas & bersih di dalam layar HP */}
      {selesai && langkahTerjawabSemua ? (
        <div className="no-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-auto bg-surface px-6 py-8 text-center">
          {/* Gauge skor SVG */}
          <div className="relative flex h-24 w-24 items-center justify-center">
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
              <span className="angka text-2xl font-extrabold leading-none text-ink">{skor}</span>
              <span className="mt-0.5 text-[10px] font-semibold text-muted">/ 100</span>
            </div>
          </div>

          <h2 className="mt-3 text-lg font-bold text-ink">
            {skor >= 80 ? "Sangat Tangguh!" : skor >= 50 ? "Cukup Waspada" : "Perlu Latihan"}
          </h2>

          {statusSimpan === "tersimpan" || pulang ? (
            <div className="mt-2">
              <Badge warna="primary" ikon="check_circle">
                Skor Tersimpan
              </Badge>
            </div>
          ) : statusSimpan === "menyimpan" ? (
            <p className="mt-1 text-xs text-muted">Menyimpan skor...</p>
          ) : null}

          {statusSimpan === "gagal" ? (
            <div className="mt-3 w-full">
              <KeadaanGagal
                pesan="Gagal menyimpan skor. Periksa koneksi internet Anda."
                cobaLagi={() => {
                  simpanRef.current = "idle";
                  setPercobaan((c) => c + 1);
                }}
              />
            </div>
          ) : null}

          <div className="mt-5 w-full border-t border-line pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Tanda Bahaya
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-bahaya">
              {data.tanda_bahaya.join("  •  ")}
            </p>
          </div>

          <div className="mt-6 flex w-full flex-col gap-2">
            <Tombol gaya="primary" ikon="replay" onClick={ulang} className="w-full md:w-full">
              Coba Lagi
            </Tombol>
            {!pengguna ? (
              <div className="grid grid-cols-2 gap-2">
                <Tombol
                  gaya="tonal"
                  className="w-full px-3 md:w-full"
                  onClick={() => {
                    simpanTunda({ jenis: "simulasi", skenario_id: data.id, skor });
                    router.push(`/masuk?kembali=/simulasi/${data.id}`);
                  }}
                >
                  Simpan Skor
                </Tombol>
                <Tombol gaya="ghost" href="/simulasi" className="w-full border border-line px-3 md:w-full">
                  Skenario Lain
                </Tombol>
              </div>
            ) : (
              <Tombol gaya="ghost" href="/simulasi" className="w-full border border-line md:w-full">
                Pilih Skenario Lain
              </Tombol>
            )}
          </div>
        </div>
      ) : (
        <div className="z-20 shrink-0 space-y-2 bg-[#efeae2]/95 px-3 pb-3 pt-2 backdrop-blur-xs dark:bg-[#0b141a]/95">
          {sudahJawabAktif ? (
            <button
              type="button"
              onClick={lanjut}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#00a884] px-5 text-sm font-bold text-white shadow-md transition-opacity duration-150 hover:opacity-95"
            >
              {idx + 1 >= data.langkah.length ? "Lihat Hasil Simulasi" : "Lanjutkan Percakapan"}
              <span aria-hidden="true">→</span>
            </button>
          ) : langkahAktif ? (
            <div className="flex flex-col gap-1.5">
              {langkahAktif.pilihan.map((p, pi) => (
                <button
                  key={pi}
                  type="button"
                  onClick={() => jawab(p)}
                  className="min-h-10 rounded-xl border border-line bg-white px-3.5 py-2 text-left text-xs font-medium leading-snug text-[#111b21] shadow-sm transition-colors duration-150 hover:border-[#00a884] hover:bg-[#dcf8c6]/50 dark:bg-[#202c33] dark:text-[#e9edef] dark:hover:bg-[#005c4b]/50"
                >
                  {p.teks}
                </button>
              ))}
            </div>
          ) : null}

          {/* Bilah ketik pesan ala WhatsApp di paling bawah */}
          <div className="flex items-center gap-2" aria-hidden="true">
            <div className="flex h-11 flex-1 items-center gap-2.5 rounded-full bg-white px-3.5 text-[#667781] shadow-sm dark:bg-[#202c33] dark:text-[#8696a0]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8" strokeLinecap="round" />
                <circle cx="9.5" cy="10" r="0.8" fill="currentColor" />
                <circle cx="14.5" cy="10" r="0.8" fill="currentColor" />
              </svg>
              <span className="flex-1 truncate text-sm">
                {sudahJawabAktif ? "Klik Lanjutkan di atas..." : "Pilih balasan di atas..."}
              </span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a1 1 0 10-2 0 3 3 0 01-6 0 1 1 0 10-2 0 5 5 0 004 4.9V19H9a1 1 0 100 2h6a1 1 0 100-2h-2v-3.1A5 5 0 0017 11z" />
              </svg>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
