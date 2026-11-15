"use client";

// Halaman Masuk / Daftar (FR-F7): tab Masuk dan tab Daftar, Supabase Auth
// email + password, konfirmasi email mati (demo). Setelah berhasil kembali
// ke halaman sebelumnya via ?kembali= (FR-F7-04). Sudah login -> diarahkan
// pergi (ARCHITECTURE.md §4). Kesalahan ditampilkan di bawah field-nya.
// Presentasi mengikuti DESIGN.md v1.1 §11.9 (referensi `login dan daftar.png`):
// desktop dua kolom (form kiri, panel ilustrasi orbit kanan), mobile satu kolom.
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSesi } from "@/lib/sesi";
import { ambilTunda, hapusTunda, simpanPulang } from "@/lib/handoff";
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

function PanelOrbit() {
  // Panel kolom kanan (DESIGN.md §11.9): gradien biru muda (§3.5), judul
  // dengan satu frasa disorot, orbit perisai + chip tanda bahaya (§2.3),
  // caption. Statis: tanpa titik karosel karena tidak ada yang berganti.
  return (
    <div className="panel-masuk hidden items-center justify-center rounded-xl lg:flex lg:min-h-[600px] lg:px-12 lg:py-12">
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-center text-2xl font-bold text-ink">
          Tangkis penipuan <span className="text-primary">sejak chat pertama</span>
        </h2>
        <svg
          viewBox="0 0 360 360"
          className="w-full max-w-[340px]"
          role="img"
          aria-label="Perisai melindungi di tengah cincin; ancaman kode OTP, hadiah, APK, dan transfer berada di sekelilingnya"
        >
          <circle cx="180" cy="180" r="150" fill="none" stroke="#01239c" strokeOpacity="0.18" />
          <circle cx="180" cy="180" r="100" fill="none" stroke="#01239c" strokeOpacity="0.18" />
          <g fontFamily="Poppins, sans-serif" fontSize="13" fontWeight="600">
            {[
              { x: 74, y: 74, teks: "Kode OTP" },
              { x: 286, y: 74, teks: "Hadiah" },
              { x: 74, y: 286, teks: "APK" },
              { x: 286, y: 286, teks: "Transfer" },
            ].map((c) => (
              <g key={c.teks}>
                <rect x={c.x - 55} y={c.y - 16} width="110" height="32" rx="16" fill="#ffffff" stroke="#01239c" strokeOpacity="0.3" />
                <text x={c.x} y={c.y + 5} textAnchor="middle" fill="#01239c">
                  {c.teks}
                </text>
              </g>
            ))}
          </g>
          {/* Lingkaran pusat biru + perisai putih */}
          <circle cx="180" cy="180" r="52" fill="#01239c" />
          <path
            d="M180 150 L204 160 V186 C204 210 194 222 180 228 C166 222 156 210 156 186 V160 Z"
            fill="#ffffff"
          />
          <path
            d="M168 188 L178 198 L194 178"
            fill="none"
            stroke="#01239c"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="max-w-[300px] text-center text-sm leading-relaxed text-muted">
          Latih keputusanmu lewat cek pesan, simulasi chat, dan kuis; bila sudah terlanjur, halaman darurat siap membantu.
        </p>
      </div>
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
  const handoffRef = useRef(false); // guard agar handoff hanya sekali

  const kembali = params.get("kembali") || "/";
  const aman = kembali.startsWith("/") ? kembali : "/";

  // Sudah login: langsung pergi (ARCHITECTURE.md §4).
  // Tapi jika handoff belum selesai, jangan redirect dulu.
  useEffect(() => {
    if (!memuat && pengguna && !handoffRef.current) {
      // biarkan kirim handler yang handle redirect setelah handoff
    } else if (!memuat && pengguna && handoffRef.current) {
      router.replace(aman);
    }
  }, [memuat, pengguna, router, aman]);

  async function kirim(e) {
    e.preventDefault();
    if (proses) return; // guard: jangan submit dua kali
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
    // Berhasil: handoff tamu→login (FR-F12). Jika ada hasil tamu yang
    // menunggu di localStorage, sisipkan ke tabel sesuai jenis, lalu
    // simpan sinyal pulang agar halaman asal tampil "Tersimpan".
    // Guard ref: pastikan handoff hanya jalan sekali (onAuthStateChange
    // bisa memicu re-render tapi tidak boleh insert ulang).
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
          // Beri jeda microtask agar sessionStorage benar-benar tertulis
          // sebelum router.replace mentrigger navigasi.
          await Promise.resolve();
        }
      }
    }
    router.replace(aman);
  }

  if (memuat) {
    return (
      <Container className="py-10">
        <KeadaanMemuat />
      </Container>
    );
  }

  const kelasInput = (ada) =>
    `h-12 w-full rounded-md border bg-surface text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:ring-2 ${
      ada ? "border-bahaya focus:border-bahaya focus:ring-bahaya/30" : "border-line focus:border-accent focus:ring-accent/30"
    }`;

  return (
    <Container className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-2 lg:gap-10 lg:py-10">
      {/* Kolom kiri: form */}
      <div className="flex flex-col justify-center">
        <div className="mx-auto w-full max-w-[440px]">
          {/* Ikon masuk dengan pola grid samar (pengecualian DESIGN.md §3.4) */}
          <div className="relative mb-5 flex justify-center">
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 h-32 w-40 -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,black,transparent)]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(1,35,156,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(1,35,156,0.08) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            <span
              aria-hidden="true"
              className="relative flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white"
            >
              <Ikon nama={tab === "masuk" ? "login" : "person_add"} ukuran={24} />
            </span>
          </div>

          <h1 className="text-center text-2xl font-bold text-ink md:text-3xl">
            {tab === "masuk" ? "Masuk ke akunmu" : "Daftar akun baru"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            {tab === "masuk"
              ? "Masuk agar skor kuis dan simulasi Anda tersimpan dan tercatat di peringkat."
              : "Buat akun untuk menyimpan progres belajar Anda dan naik peringkat."}
          </p>

          {/* Tab Masuk / Daftar (FR-F7-01) */}
          <div className="mt-6 grid grid-cols-2 rounded-md bg-primary-soft p-1" role="tablist" aria-label="Pilih masuk atau daftar">
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
                  tab === t ? "bg-surface text-primary shadow-[0_1px_2px_rgba(21,22,42,0.1)]" : "text-ink/80 hover:text-ink"
                }`}
              >
                {t === "masuk" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={kirim} className="mt-6 flex flex-col gap-4" noValidate>
            {tab === "daftar" ? (
              <div>
                <label htmlFor="nama-tampil" className="mb-1.5 block text-sm font-semibold text-ink">
                  Nama tampil
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <Ikon nama="person" ukuran={18} />
                  </span>
                  <input
                    id="nama-tampil"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama yang tampil di peringkat"
                    autoComplete="nickname"
                    className={`${kelasInput(galat.nama)} pl-10`}
                  />
                </div>
                {galat.nama ? <p className="mt-1 text-xs text-bahaya">{galat.nama}</p> : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Ikon nama="mail" ukuran={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={`${kelasInput(galat.email)} pl-10`}
                />
              </div>
              {galat.email ? <p className="mt-1 text-xs text-bahaya">{galat.email}</p> : null}
            </div>

            <div>
              <label htmlFor="sandi" className="mb-1.5 block text-sm font-semibold text-ink">
                Kata sandi
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Ikon nama="lock" ukuran={18} />
                </span>
                <input
                  id="sandi"
                  type={lihatSandi ? "text" : "password"}
                  value={sandi}
                  onChange={(e) => setSandi(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete={tab === "daftar" ? "new-password" : "current-password"}
                  className={`${kelasInput(galat.sandi)} pr-11 pl-10`}
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

            <Tombol gaya="primary" type="submit" disabled={proses} className="mt-2 w-full">
              {proses ? "Memproses..." : tab === "masuk" ? "Masuk" : "Daftar"}
            </Tombol>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
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

      {/* Kolom kanan: panel ilustrasi (disembunyikan di bawah 1024px, §11.9) */}
      <PanelOrbit />
    </Container>
  );
}

export default function HalamanMasuk() {
  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <KeadaanMemuat />
        </Container>
      }
    >
      <FormulirMasuk />
    </Suspense>
  );
}
