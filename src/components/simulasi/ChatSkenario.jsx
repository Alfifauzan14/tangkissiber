"use client";

// Percakapan simulasi (FR-F3): gelembung chat motif (tiga sudut 16px,
// satu sudut ekor 4px), pilihan respons per langkah, umpan balik langsung,
// skor 0-100 + ringkasan tanda bahaya di akhir (DESIGN.md §11.3).
// Skor: aman=100, waspada=50, bahaya=0 per langkah; rata-rata dibulatkan.
// Validasi skor via API /api/simulasi/submit (Post-v1.0 #3).
import { useEffect, useMemo, useRef, useState } from "react";
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

  return (
    <div className="mx-auto max-w-[640px]">
      {/* Kepala chat: penipu + jam berjalan */}
      <div className="flex items-center gap-3 rounded-t-xl border border-line bg-surface p-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
        >
          {data.penipu.nama.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{data.penipu.nama}</p>
          <p className="truncate text-xs text-muted">{data.penipu.peran}</p>
        </div>
        <span className="angka text-sm font-semibold text-muted">
          {sekarang ? fmtWaktu(sekarang) : "...."}
        </span>
      </div>

      {/* Aliran pesan */}
      <div className="flex flex-col gap-3 border-x border-line bg-bg p-4">
        {/* Pesan awal penipu */}
        <div className="max-w-[85%] self-start">
          <div className="rounded-2xl rounded-bl-[4px] border border-line bg-surface px-4 py-2.5 text-sm text-ink">
            {data.pesan_awal}
          </div>
          <Waktu t={mulai} />
        </div>

        {semuaLangkah.map(({ l, i }) => {
          if (i > idx) return null;
          const waktu = mulai ? new Date(mulai.getTime() + (i + 1) * 60000) : null;
          return (
            <div key={i} className="flex flex-col gap-1.5">
              {/* Pesan penipu untuk langkah ini */}
              <div className="max-w-[85%] self-start">
                <div className="rounded-2xl rounded-bl-[4px] border border-line bg-surface px-4 py-2.5 text-sm text-ink">
                  {l.pesan}
                </div>
                <Waktu t={waktu} />
              </div>

              {/* Jawaban pengguna + umpan balik langsung */}
              {jawaban[i] ? (
                <div className="max-w-[85%] self-end">
                  <div className="rounded-2xl rounded-br-[4px] bg-primary-soft px-4 py-2.5 text-sm text-ink">
                    {jawaban[i].teks}
                  </div>
                  <span className="mt-1 block text-right text-[11px] text-muted">
                    {fmtWaktu(waktu)} · Anda
                  </span>
                  <div
                    className={`mt-1 rounded-md border-l-4 bg-surface p-3 text-sm ${GARIS[jawaban[i].nilai]}`}
                  >
                    <p className="text-muted">
                      <strong className={`font-semibold ${TEKS[jawaban[i].nilai]}`}>
                        {LABEL[jawaban[i].nilai]}.
                      </strong>{" "}
                      {jawaban[i].umpan_balik}
                    </p>
                  </div>
                  {!selesai && i === idx ? (
                    <Tombol gaya="primary" className="mt-2 w-full" onClick={lanjut}>
                      {i + 1 >= data.langkah.length ? "Lihat Hasil" : "Lanjutkan Percakapan"}
                    </Tombol>
                  ) : null}
                </div>
              ) : i === idx && !selesai ? (
                /* Pilihan respons untuk langkah ini */
                <div className="mt-1 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted">Pilih respons Anda:</p>
                  {l.pilihan.map((p, pi) => (
                    <button
                      key={pi}
                      type="button"
                      onClick={() => jawab(p)}
                      className="min-h-11 rounded-md border border-line bg-surface px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors duration-150 hover:border-accent"
                    >
                      {p.teks}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        <div ref={ujungRef} />
      </div>

      {/* Layar hasil: skor + ringkasan tanda bahaya */}
      {selesai && langkahTerjawabSemua ? (
        <div className="rounded-b-xl border border-t-0 border-line bg-surface p-4 md:p-6">
          <p className="text-sm font-semibold text-muted">Skor Anda</p>
          <p className="angka text-5xl font-bold text-primary">{skor}</p>
          <p className="text-xs text-muted">dari 100 (aman=100, waspada=50, bahaya=0 per langkah)</p>

          <h2 className="mt-4 text-sm font-semibold text-ink">Tanda bahaya di percakapan ini</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.tanda_bahaya.map((t) => (
              <Badge key={t} warna="bahaya" ikon="warning">
                {t}
              </Badge>
            ))}
          </div>

          {/* Status penyimpanan */}
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
            ) : null}
            {!pengguna && statusSimpan === "idle" && !pulang ? (
              <Tombol
                gaya="tonal"
                onClick={() => {
                  simpanTunda({ jenis: "simulasi", skenario_id: data.id, skor });
                  router.push(`/masuk?kembali=/simulasi/${data.id}`);
                }}
              >
                Masuk untuk menyimpan
              </Tombol>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Tombol gaya="primary" ikon="replay" onClick={ulang}>
              Coba Lagi
            </Tombol>
            <Tombol gaya="tonal" href="/simulasi">
              Coba Skenario Lain
            </Tombol>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-b-xl border border-line bg-surface p-3">
          <p className="text-xs text-muted">
            Langkah {Math.min(idx + 1, data.langkah.length)} dari {data.langkah.length}
          </p>
          <Ikon nama="lock" ukuran={16} className="text-muted" />
        </div>
      )}
    </div>
  );
}
