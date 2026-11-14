"use client";

// Halaman Masuk / Daftar (FR-F7): tab Masuk dan tab Daftar, Supabase Auth
// email + password, konfirmasi email mati (demo). Setelah berhasil kembali
// ke halaman sebelumnya via ?kembali= (FR-F7-04). Sudah login -> diarahkan
// pergi (ARCHITECTURE.md §4). Kesalahan ditampilkan di bawah field-nya.
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/sesi";
import Container from "@/components/layout/Container";
import Tombol from "@/components/ui/Tombol";
import Ikon from "@/components/ui/Ikon";
import { KeadaanMemuat } from "@/components/ui/Keadaan";

const TEKS_GAGAL = {
  "Invalid login credentials": "Email atau kata sandi salah.",
  "User already registered": "Email ini sudah terdaftar. Silakan masuk.",
  "Email not confirmed": "Email belum dikonfirmasi. Cek kotak masuk Anda.",
};

function pesanGagal(pesan) {
  if (TEKS_GAGAL[pesan]) return TEKS_GAGAL[pesan];
  if (/password/i.test(pesan)) return "Kata sandi terlalu lemah, minimal 6 karakter.";
  if (/rate|too many/i.test(pesan)) return "Terlalu banyak percobaan. Coba lagi beberapa saat.";
  return "Terjadi kesalahan. Periksa koneksi internet Anda.";
}

function PanelIlustrasi() {
  // Panel biru muda, komposisi orbit (DESIGN.md §2, §4):
  // perisai di pusat, chip tanda bahaya mengelilinginya. SVG garis sederhana.
  return (
    <div className="flex h-[120px] items-center justify-center rounded-xl bg-primary-soft lg:h-auto lg:min-h-[420px]">
      <svg
        viewBox="0 0 320 420"
        className="hidden h-full max-h-[380px] w-auto lg:block"
        role="img"
        aria-label="Ilustrasi perisai melindungi dari pesan penipuan"
      >
        {/* Orbit: garis elips + chip tanda bahaya di sekeliling perisai */}
        <ellipse cx="160" cy="230" rx="140" ry="110" fill="none" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="6 6" />
        <g fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="600">
          <g>
            <rect x="96" y="76" width="128" height="36" rx="18" fill="#eef2ff" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="160" y="99" textAnchor="middle" fill="#312e81">Kode OTP</text>
          </g>
          <g>
            <rect x="16" y="212" width="112" height="36" rx="18" fill="#eef2ff" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="72" y="235" textAnchor="middle" fill="#312e81">Hadiah</text>
          </g>
          <g>
            <rect x="192" y="212" width="112" height="36" rx="18" fill="#eef2ff" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="248" y="235" textAnchor="middle" fill="#312e81">APK</text>
          </g>
          <g>
            <rect x="104" y="332" width="112" height="36" rx="18" fill="#eef2ff" stroke="#4f46e5" strokeWidth="1.5" />
            <text x="160" y="355" textAnchor="middle" fill="#312e81">Transfer</text>
          </g>
        </g>
        {/* Perisai di pusat */}
        <g>
          <path
            d="M160 150 L232 178 V232 C232 288 202 318 160 336 C118 318 88 288 88 232 V178 Z"
            fill="#4338ca"
          />
          <path
            d="M126 236 L152 262 L200 206"
            fill="none"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      {/* Mobile: perisai kecil tanpa orbit */}
      <svg viewBox="0 0 64 64" className="h-[88px] w-[88px] lg:hidden" role="img" aria-label="Perisai TangkisSiber">
        <path d="M32 8 L54 17 V33 C54 46 46 54 32 60 C18 54 10 46 10 33 V17 Z" fill="#4338ca" />
        <path d="M20 33 L28 41 L45 23" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function FormulirMasuk() {
  const router = useRouter();
  const params = useSearchParams();
  const { memuat, pengguna } = useSesi();

  const [tab, setTab] = useState("masuk"); // masuk | daftar
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);
  const [galat, setGalat] = useState({}); // { nama, email, sandi, umum }
  const [proses, setProses] = useState(false);

  const kembali = params.get("kembali") || "/";
  const aman = kembali.startsWith("/") ? kembali : "/";

  // Sudah login: langsung pergi (ARCHITECTURE.md §4)
  useEffect(() => {
    if (!memuat && pengguna) router.replace(aman);
  }, [memuat, pengguna, router, aman]);

  async function kirim(e) {
    e.preventDefault();
    const g = {};
    if (tab === "daftar" && nama.trim().length < 2) g.nama = "Nama tampil minimal 2 huruf.";
    if (!/^\S+@\S+\.\S+$/.test(email)) g.email = "Format email tidak valid.";
    if (sandi.length < 6) g.sandi = "Kata sandi minimal 6 karakter.";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setProses(true);
    if (tab === "daftar") {
      const { error } = await supabase.auth.signUp({
        email,
        password: sandi,
        options: { data: { nama_tampil: nama.trim() } },
      });
      if (error) {
        setGalat({ umum: pesanGagal(error.message) });
        setProses(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: sandi });
      if (error) {
        setGalat({ umum: pesanGagal(error.message) });
        setProses(false);
        return;
      }
    }
    // Berhasil: kembali ke halaman sebelumnya (FR-F7-04)
    router.replace(aman);
  }

  if (memuat) {
    return (
      <Container className="max-w-[960px] py-10">
        <KeadaanMemuat />
      </Container>
    );
  }

  const kelasInput = (ada) =>
    `h-12 w-full rounded-md border bg-surface px-3 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:ring-2 ${
      ada ? "border-bahaya focus:border-bahaya focus:ring-bahaya/30" : "border-line focus:border-accent focus:ring-accent/30"
    }`;

  return (
    <Container className="max-w-[960px] py-8 lg:py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <PanelIlustrasi />

        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">
            {tab === "masuk" ? "Masuk ke TangkisSiber" : "Daftar Akun Baru"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {tab === "masuk"
              ? "Masuk agar skor kuis dan simulasi Anda tersimpan dan tercatat di peringkat."
              : "Buat akun untuk menyimpan progres belajar Anda dan naik peringkat."}
          </p>

          {/* Tab Masuk / Daftar (FR-F7-01) */}
          <div className="mt-5 grid grid-cols-2 rounded-md bg-primary-soft p-1" role="tablist" aria-label="Pilih masuk atau daftar">
            {["masuk", "daftar"].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setGalat({});
                }}
                className={`min-h-11 rounded-sm text-sm font-semibold transition-colors duration-150 ${
                  tab === t ? "bg-surface text-primary shadow-[0_1px_2px_rgba(21,22,42,0.1)]" : "text-muted hover:text-ink"
                }`}
              >
                {t === "masuk" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={kirim} className="mt-5 flex flex-col gap-4" noValidate>
            {tab === "daftar" ? (
              <div>
                <label htmlFor="nama-tampil" className="mb-1.5 block text-sm font-semibold text-ink">
                  Nama tampil
                </label>
                <input
                  id="nama-tampil"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama yang tampil di peringkat"
                  autoComplete="nickname"
                  className={kelasInput(galat.nama)}
                />
                {galat.nama ? <p className="mt-1 text-xs text-bahaya">{galat.nama}</p> : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className={kelasInput(galat.email)}
              />
              {galat.email ? <p className="mt-1 text-xs text-bahaya">{galat.email}</p> : null}
            </div>

            <div>
              <label htmlFor="sandi" className="mb-1.5 block text-sm font-semibold text-ink">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="sandi"
                  type={lihatSandi ? "text" : "password"}
                  value={sandi}
                  onChange={(e) => setSandi(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete={tab === "daftar" ? "new-password" : "current-password"}
                  className={`${kelasInput(galat.sandi)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setLihatSandi((v) => !v)}
                  aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:text-primary"
                >
                  <Ikon nama={lihatSandi ? "visibility_off" : "visibility"} ukuran={20} />
                </button>
              </div>
              {galat.sandi ? <p className="mt-1 text-xs text-bahaya">{galat.sandi}</p> : null}
            </div>

            {galat.umum ? (
              <p role="alert" className="rounded-md bg-bahaya-soft px-3 py-2 text-sm text-bahaya">
                {galat.umum}
              </p>
            ) : null}

            <Tombol gaya="primary" type="submit" disabled={proses} className="w-full">
              {proses ? "Memproses..." : tab === "masuk" ? "Masuk" : "Daftar"}
            </Tombol>
          </form>

          <p className="mt-4 text-xs text-muted">
            {tab === "masuk" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => {
                setTab(tab === "masuk" ? "daftar" : "masuk");
                setGalat({});
              }}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {tab === "masuk" ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </p>
        </div>
      </div>
    </Container>
  );
}

export default function HalamanMasuk() {
  return (
    <Suspense
      fallback={
        <Container className="max-w-[960px] py-10">
          <KeadaanMemuat />
        </Container>
      }
    >
      <FormulirMasuk />
    </Suspense>
  );
}
