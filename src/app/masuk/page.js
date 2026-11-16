"use client";

// Halaman Masuk / Daftar (FR-F7): tanpa navbar & footer, hanya tombol kembali + kartu split
// mengikuti referensi gambar pengguna (panel kiri gelombang biru + grid, panel kanan form putih).
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/sesi";
import { ambilTunda, hapusTunda, simpanPulang } from "@/lib/handoff";
import Ikon from "@/components/ui/Ikon";
import { KeadaanMemuat } from "@/components/ui/Keadaan";

const TEKS_GAGAL = {
  "Invalid login credentials": "Email atau kata sandi salah.",
  "User already registered": "Email ini sudah terdaftar. Silakan masuk.",
  "Email not confirmed": "Email belum dikonfirmasi. Cek kotak masuk Anda.",
};

function pesanGagal(pesan) {
  if (TEKS_GAGAL[pesan]) return TEKS_GAGAL[pesan];
  if (/provider is not enabled|unsupported provider/i.test(pesan)) {
    return "Login Google belum diaktifkan di Supabase Dashboard (Authentication → Providers → Google).";
  }
  if (/password/i.test(pesan)) return "Kata sandi terlalu lemah, minimal 6 karakter.";
  if (/rate|too many/i.test(pesan)) return "Terlalu banyak percobaan. Coba lagi beberapa saat.";
  return "Terjadi kesalahan. Periksa koneksi internet Anda.";
}

function PanelKiriMasuk() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#0369a1] p-10 text-white lg:flex">
      {/* Grid samar + gelombang organik + lingkaran aksen ala referensi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.28) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <svg
        viewBox="0 0 480 600"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
      >
        <path
          fill="#ffffff"
          fillOpacity="0.22"
          d="M0,110 C120,170 220,40 340,120 C410,165 450,120 480,90 L480,0 L0,0 Z"
        />
        <path
          fill="#075985"
          fillOpacity="0.45"
          d="M0,490 C110,430 230,540 360,460 C420,425 460,465 480,485 L480,600 L0,600 Z"
        />
        <circle cx="385" cy="95" r="20" fill="#ffffff" fillOpacity="0.3" />
        <circle cx="90" cy="495" r="14" fill="#ffffff" fillOpacity="0.25" />
      </svg>

      {/* Logo kiri atas */}
      <div className="relative z-10 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
          <Ikon nama="verified_user" ukuran={18} />
        </span>
        <span className="text-sm font-bold tracking-wide uppercase text-white">
          TangkisSiber
        </span>
      </div>

      {/* Konten tengah: teks statis agar posisi identik di Masuk & Daftar */}
      <div className="relative z-10 my-auto text-center">
        <p className="text-sm font-medium text-white/90">
          Senang melihat Anda kembali
        </p>
        <h2 className="mt-2 whitespace-nowrap text-2xl font-bold uppercase tracking-wide text-white xl:text-3xl">
          SELAMAT DATANG
        </h2>
        <div className="mx-auto my-4 h-1 w-10 rounded-full bg-white" aria-hidden="true" />
        <p className="mx-auto max-w-[300px] text-xs leading-relaxed text-white/85">
          Masuk atau daftar untuk menyimpan skor kuis dan simulasi, memantau level Anda, dan melihat posisi di peringkat.
        </p>
      </div>

      <p className="relative z-10 text-center text-[11px] text-white/75">
        Edukasi Anti Penipuan Digital • Gratis untuk Semua
      </p>
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
  const [galat, setGalat] = useState({});
  const [proses, setProses] = useState(false);
  const handoffRef = useRef(false);

  const kembali = params.get("kembali") || "/";
  const aman = kembali.startsWith("/") ? kembali : "/";
  const oauthError = params.get("error");

  useEffect(() => {
    if (oauthError === "oauth_failed") {
      setGalat({ umum: "Login Google gagal atau dibatalkan. Silakan coba lagi." });
    }
  }, [oauthError]);

  async function masukGoogle() {
    if (proses) return;
    setProses(true);
    setGalat({});
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(aman)}`,
      },
    });
    if (error) {
      setGalat({ umum: pesanGagal(error.message) });
      setProses(false);
    }
  }

  useEffect(() => {
    if (memuat || !pengguna || handoffRef.current) return;
    handoffRef.current = true;
    (async () => {
      const tunda = ambilTunda();
      if (tunda) {
        let suksesHandoff = false;
        if (tunda.jenis === "kuis") {
          const { error } = await supabase.from("kuis_hasil").insert({ skor: tunda.skor });
          suksesHandoff = !error;
        } else if (tunda.jenis === "simulasi" && tunda.skenario_id) {
          const { error } = await supabase
            .from("simulasi_hasil")
            .insert({ skenario_id: tunda.skenario_id, skor: tunda.skor });
          suksesHandoff = !error;
        }
        if (suksesHandoff) {
          hapusTunda();
          simpanPulang(tunda);
          await Promise.resolve();
        }
      }
      router.replace(aman);
    })();
  }, [memuat, pengguna, router, aman]);

  async function kirim(e) {
    e.preventDefault();
    if (proses) return;
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

    if (!handoffRef.current) {
      handoffRef.current = true;
      const tunda = ambilTunda();
      if (tunda) {
        let suksesHandoff = false;
        if (tunda.jenis === "kuis") {
          const { error } = await supabase.from("kuis_hasil").insert({ skor: tunda.skor });
          suksesHandoff = !error;
        } else if (tunda.jenis === "simulasi" && tunda.skenario_id) {
          const { error } = await supabase
            .from("simulasi_hasil")
            .insert({ skenario_id: tunda.skenario_id, skor: tunda.skor });
          suksesHandoff = !error;
        }
        if (suksesHandoff) {
          hapusTunda();
          simpanPulang(tunda);
          await Promise.resolve();
        }
      }
    }
    router.replace(aman);
  }

  if (memuat) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg p-6">
        <KeadaanMemuat />
      </div>
    );
  }

  // Input bergaya referensi gambar: latar lembut + garis aksen kiri biru
  const kelasInput = (ada) =>
    `h-12 w-full rounded-r-md border border-l-4 bg-bg text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:bg-surface focus:ring-2 ${
      ada
        ? "border-bahaya border-l-bahaya focus:ring-bahaya/30"
        : "border-line border-l-primary focus:border-accent focus:border-l-primary focus:ring-accent/30"
    }`;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f9ff] via-bg to-[#e0f2fe] px-4 py-6 sm:px-6 dark:from-[#061224] dark:via-bg dark:to-[#0c2340]">
      {/* Latar luar Cyber Ocean halus agar tidak polos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(3,105,161,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(3,105,161,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#0ea5e9]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#0369a1]/20 blur-3xl"
      />

      {/* Hanya tombol kembali + kartu login (tanpa navbar dan footer) */}
      <div className="relative z-10 mb-4 w-full max-w-[940px]">
        <Link
          href={aman}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-sm transition-colors duration-150 hover:bg-primary-soft hover:text-primary"
        >
          <span aria-hidden="true">←</span>
          Kembali
        </Link>
      </div>

      <div className="relative z-10 grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl lg:min-h-[620px] lg:grid-cols-2">
        <PanelKiriMasuk />

        {/* Kolom kanan: tinggi grup input tetap agar posisi elemen identik di Masuk & Daftar */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
          <div className="mx-auto flex w-full max-w-[360px] flex-col">
            <h1 className="text-center text-2xl font-bold text-primary">
              {tab === "masuk" ? "Masuk Akun" : "Daftar Akun"}
            </h1>
            <p className="mt-1.5 text-center text-xs text-muted">
              {tab === "masuk"
                ? "Masuk untuk menyimpan skor dan pantau peringkat."
                : "Buat akun baru untuk menyimpan progres belajar Anda."}
            </p>

            {/* Tab Masuk / Daftar */}
            <div
              className="mt-5 grid grid-cols-2 rounded-full bg-bg p-1 border border-line"
              role="tablist"
              aria-label="Pilih masuk atau daftar"
            >
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
                  className={`min-h-10 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
                    tab === t ? "bg-primary text-white shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  {t === "masuk" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            <form onSubmit={kirim} className="mt-5 flex flex-col gap-3.5" noValidate>
              <div className="flex min-h-[168px] flex-col justify-center gap-3">
                {tab === "daftar" ? (
                  <div>
                    <label htmlFor="nama-tampil" className="sr-only">
                      Nama tampil
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                        <Ikon nama="person" ukuran={18} />
                      </span>
                      <input
                        id="nama-tampil"
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Nama tampil"
                        autoComplete="nickname"
                        className={`${kelasInput(galat.nama)} pl-10 pr-3`}
                      />
                    </div>
                    {galat.nama ? <p className="mt-1 text-xs text-bahaya">{galat.nama}</p> : null}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                      <Ikon nama="mail" ukuran={18} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Alamat Email"
                      autoComplete="email"
                      className={`${kelasInput(galat.email)} pl-10 pr-3`}
                    />
                  </div>
                  {galat.email ? <p className="mt-1 text-xs text-bahaya">{galat.email}</p> : null}
                </div>

                <div>
                  <label htmlFor="sandi" className="sr-only">
                    Kata sandi
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                      <Ikon nama="lock" ukuran={18} />
                    </span>
                    <input
                      id="sandi"
                      type={lihatSandi ? "text" : "password"}
                      value={sandi}
                      onChange={(e) => setSandi(e.target.value)}
                      placeholder="Kata Sandi"
                      autoComplete={tab === "daftar" ? "new-password" : "current-password"}
                      className={`${kelasInput(galat.sandi)} pl-10 pr-11`}
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
              </div>

              {galat.umum ? (
                <p role="alert" className="rounded-md bg-bahaya-soft px-3 py-2 text-xs font-medium text-bahaya">
                  {galat.umum}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={proses}
                className="mt-2 min-h-12 w-full rounded-full bg-primary px-6 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-150 hover:opacity-95 disabled:opacity-60"
              >
                {proses ? "Memproses..." : tab === "masuk" ? "Masuk" : "Daftar"}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-surface px-2.5 text-muted">Atau</span>
                </div>
              </div>

              <button
                type="button"
                disabled={proses}
                onClick={masukGoogle}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-bg disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.45 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Masuk dengan Google
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted">
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
      </div>
    </div>
  );
}

export default function HalamanMasuk() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-bg p-6">
          <KeadaanMemuat />
        </div>
      }
    >
      <FormulirMasuk />
    </Suspense>
  );
}
