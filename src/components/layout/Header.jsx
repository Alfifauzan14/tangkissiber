"use client";

// Header (DESIGN.md v1.1 §9, referensi docs/design-ref/nav mobile*.png):
// mobile = bilah biru sticky + tombol hamburger yang membuka drawer layar
// penuh; desktop = nav horizontal satu baris. Halaman masuk memakai header
// ringkas logo saja (§9.5).
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import Ikon from "../ui/Ikon";
import { useSesi } from "@/lib/sesi";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/cek-pesan", label: "Cek Pesan" },
  { href: "/simulasi", label: "Simulasi" },
  { href: "/kuis", label: "Kuis" },
  { href: "/pustaka", label: "Pustaka" },
  { href: "/peringkat", label: "Peringkat" },
];

// Dark Mode Toggle: ikon sun/moon, persist localStorage, apply class ke <html>
function DarkModeToggle({ dalamDrawer = false }) {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const tersimpan = localStorage.getItem("tema");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const awal = tersimpan ? tersimpan === "dark" : prefersDark;
    setGelap(awal);
    document.documentElement.classList.toggle("dark", awal);
    document.documentElement.classList.toggle("light", !awal);
  }, []);

  function toggle() {
    const baru = !gelap;
    setGelap(baru);
    localStorage.setItem("tema", baru ? "dark" : "light");
    document.documentElement.classList.toggle("dark", baru);
    document.documentElement.classList.toggle("light", !baru);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={gelap ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      aria-pressed={gelap}
      className={`inline-flex items-center justify-center rounded-md bg-primary-soft text-primary transition-colors duration-150 hover:bg-primary-soft/80 ${
        dalamDrawer ? "h-11 w-11" : "h-10 w-10 lg:h-9 lg:w-9"
      }`}
    >
      <Ikon nama={gelap ? "light_mode" : "dark_mode"} ukuran={22} />
    </button>
  );
}

function Wordmark({ terang = false }) {
  return (
    <Link
      href="/"
      aria-label="TangkisSiber, ke beranda"
      className={`inline-flex min-h-11 items-center text-base font-bold ${terang ? "text-white" : "text-ink"}`}
    >
      Tangkis<span className={terang ? "text-white" : "text-primary"}>Siber</span>
    </Link>
  );
}

// Tombol Keluar (FR-F7-05): icon-only di header desktop, teks penuh di drawer.
// Supabase diimpor dinamis di handler agar bundel auth tidak menghalangi
// halaman pertama yang dibuka tamu (performa Lighthouse).
function TombolKeluar({ penuh = false, className = "", saatSelesai }) {
  const router = useRouter();
  async function keluar() {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    saatSelesai?.();
    router.replace("/");
  }
  return (
    <button
      type="button"
      onClick={keluar}
      aria-label="Keluar"
      className={
        penuh
          ? `flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-muted transition-colors duration-150 hover:text-bahaya ${className}`
          : `inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-primary-soft hover:text-primary ${className}`
      }
    >
      <Ikon nama="logout" ukuran={18} />
      {penuh ? <span>Keluar</span> : <span className="hidden lg:inline">Keluar</span>}
    </button>
  );
}

// Drawer layar penuh (§9.1): bar biru + X putih, daftar halaman, bagian bawah
// darurat + masuk/profil. Terbuka fade 200ms (keyframes `muncul` di globals).
// Esc menutup; fokus dipindah ke tombol X saat terbuka, kembali ke hamburger.
function Drawer({ terbuka, tutup, refHamburger }) {
  const pathname = usePathname();
  const { memuat, pengguna, profil } = useSesi();
  const refX = useRef(null);

  useEffect(() => {
    if (!terbuka) return;
    document.body.style.overflow = "hidden";
    refX.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") tutup();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      refHamburger.current?.focus();
    };
  }, [terbuka, tutup, refHamburger]);

  if (!terbuka) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-[muncul_200ms_ease-out] flex-col bg-surface lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
    >
      {/* Bar biru: wordmark + X putih (referensi nav mobile.png) */}
      <div className="flex h-14 shrink-0 items-center justify-between bg-primary px-4">
        <span className="text-base font-bold text-white">TangkisSiber</span>
        <button
          ref={refX}
          type="button"
          onClick={tutup}
          aria-label="Tutup menu navigasi"
          className="flex h-11 w-11 items-center justify-center rounded-sm bg-white text-primary"
        >
          <Ikon nama="close" ukuran={22} />
        </button>
      </div>

      {/* Daftar halaman: satu baris per tujuan, garis pemisah */}
      <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto">
        {NAV.map((item) => {
          const aktif = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={tutup}
              aria-current={aktif ? "page" : undefined}
              className={`flex min-h-[52px] items-center border-b border-line px-5 text-[15px] font-semibold transition-colors duration-150 ${
                aktif ? "text-primary" : "text-ink hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bawah drawer: pintasan darurat, lalu toggle, lalu masuk atau profil */}
      <div className="flex shrink-0 flex-col gap-3 border-t border-line bg-surface p-5">
        <Link
          href="/darurat"
          onClick={tutup}
          className="flex min-h-11 items-center gap-2 text-sm font-bold text-bahaya"
        >
          <Ikon nama="sos" ukuran={18} />
          Sudah Terlanjur?
        </Link>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm font-medium text-ink">Mode Gelap</span>
          <DarkModeToggle dalamDrawer={true} />
        </div>
        {memuat ? null : pengguna ? (
          <>
            <Link
              href="/riwayat"
              onClick={tutup}
              className="flex min-h-11 items-center gap-3 rounded-md bg-primary-soft px-3 text-sm font-semibold text-primary"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white"
              >
                {(profil?.nama_tampil || pengguna.email || "?").charAt(0).toUpperCase()}
              </span>
              {profil?.nama_tampil || "Pengguna"}
            </Link>
            <TombolKeluar penuh saatSelesai={tutup} />
          </>
        ) : (
          <Link
            href="/masuk"
            onClick={tutup}
            className="flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#011c7d]"
          >
            Masuk
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { memuat, pengguna, profil } = useSesi();
  const [terbuka, setTerbuka] = useState(false);
  const refHamburger = useRef(null);
  const diMasuk = pathname === "/masuk";

  // Header ringkas halaman masuk/daftar (§9.5): logo saja, tanpa nav.
  if (diMasuk) {
    return (
      <header className="bg-primary lg:border-b lg:border-line lg:bg-surface">
        <Container className="flex h-14 items-center">
          <Link
            href="/"
            aria-label="TangkisSiber, ke beranda"
            className="inline-flex min-h-11 items-center text-base font-bold text-white lg:text-ink"
          >
            Tangkis<span className="text-white lg:text-primary">Siber</span>
          </Link>
        </Container>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      {/* Mobile: bilah biru + hamburger (referensi nav mobile (2).png) */}
      <div className="bg-primary lg:hidden">
        <Container className="flex h-14 items-center justify-between">
          <Wordmark terang={true} />
          <button
            ref={refHamburger}
            type="button"
            onClick={() => setTerbuka(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={terbuka}
            aria-haspopup="dialog"
            className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/15 text-white"
          >
            <Ikon nama="menu" ukuran={22} />
          </button>
        </Container>
      </div>

      {/* Desktop: satu baris, semua tujuan tampak (§9.2) */}
      <Container className="hidden h-14 items-center justify-between gap-3 lg:flex">
        <Wordmark />
        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          {NAV.map((item) => {
            const aktif = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  aktif ? "bg-primary-soft text-primary" : "text-muted hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <Link
            href="/darurat"
            className="rounded-sm px-3 py-2 text-sm font-bold text-bahaya transition-colors duration-150 hover:text-[#7f1010]"
          >
            Sudah Terlanjur?
          </Link>
          {memuat ? null : pengguna ? (
            <div className="flex items-center gap-2">
              <Link
                href="/riwayat"
                className="flex items-center gap-2 rounded-full bg-primary-soft py-1.5 pl-1.5 pr-3 text-sm font-semibold text-primary"
                aria-label={`${profil?.nama_tampil || "Akun"} - lihat riwayat`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-white"
                >
                  {(profil?.nama_tampil || pengguna.email || "?").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">
                  {profil?.nama_tampil || "Pengguna"}
                </span>
                {profil?.total_poin !== undefined && profil?.total_poin !== null ? (
                  <span className="angka rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                    {profil.total_poin}
                  </span>
                ) : null}
              </Link>
              <TombolKeluar />
            </div>
          ) : (
            <Link
              href="/masuk"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#011c7d]"
            >
              Masuk
            </Link>
          )}
        </div>
      </Container>

      <Drawer terbuka={terbuka} tutup={() => setTerbuka(false)} refHamburger={refHamburger} />
    </header>
  );
}
