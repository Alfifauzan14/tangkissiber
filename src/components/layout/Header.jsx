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
  { href: "/", label: "Beranda", ikon: "verified_user" },
  { href: "/cek-pesan", label: "Cek Pesan", ikon: "content_paste_search" },
  { href: "/simulasi", label: "Simulasi", ikon: "forum" },
  { href: "/kuis", label: "Kuis", ikon: "quiz" },
  { href: "/pustaka", label: "Pustaka", ikon: "menu_book" },
  { href: "/peringkat", label: "Peringkat", ikon: "leaderboard" },
];

// Dark Mode Toggle: ikon sun/moon, persist localStorage, apply class ke <html>
function DarkModeToggle({ dalamDrawer = false, terang = false }) {
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
      title={gelap ? "Mode Gelap Aktif (Klik untuk Terang)" : "Mode Terang (Klik untuk Gelap)"}
      className={`inline-flex items-center justify-center rounded-xl border shadow-sm transition-all duration-150 ${
        terang
          ? "border-white/25 bg-white/15 text-white hover:bg-white/25"
          : "border-line bg-surface text-ink hover:border-primary/50 hover:bg-primary-soft hover:text-primary"
      } ${dalamDrawer ? "h-11 w-11" : "h-10 w-10"}`}
    >
      {/* Ikon matahari SVG presisi agar selalu tampil tajam */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`h-5 w-5 ${gelap ? "text-[#fbbf24]" : terang ? "text-white" : "text-primary"}`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}

function Wordmark({ terang = false }) {
  return (
    <Link
      href="/"
      aria-label="TangkisSiber, ke beranda"
      className={`inline-flex min-h-11 items-center gap-2 text-base font-bold tracking-tight ${terang ? "text-white" : "text-ink"}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          terang ? "bg-white/20 text-white" : "bg-primary text-white"
        }`}
      >
        <Ikon nama="verified_user" ukuran={18} />
      </span>
      <span>
        Tangkis<span className={terang ? "text-white" : "text-primary"}>Siber</span>
      </span>
    </Link>
  );
}

// Tombol Keluar (FR-F7-05): icon-only di header desktop, teks penuh di drawer.
// Supabase diimpor dinamis di handler agar bundel auth tidak menghalangi
// halaman pertama yang dibuka tamu (performa Lighthouse).
function TombolKeluar({ penuh = false, className = "", saatSelesai, terang = false }) {
  async function keluar() {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    saatSelesai?.();
    window.location.assign("/");
  }
  return (
    <button
      type="button"
      onClick={keluar}
      aria-label="Keluar"
      className={
        penuh
          ? `flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-muted transition-colors duration-150 hover:text-bahaya ${className}`
          : `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-150 lg:w-auto lg:gap-1.5 lg:px-3 ${
              terang
                ? "text-white/90 hover:bg-white/15 hover:text-white"
                : "text-muted hover:bg-primary-soft hover:text-primary"
            } ${className}`
      }
    >
      <Ikon nama="logout" ukuran={18} />
      {penuh ? <span>Keluar</span> : <span className="hidden lg:inline">Keluar</span>}
    </button>
  );
}

function DrawerDarkModeButton() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const tersimpan = localStorage.getItem("tema");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setGelap(tersimpan ? tersimpan === "dark" : prefersDark);
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
      aria-pressed={gelap}
      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-bg px-3 text-xs font-semibold text-ink transition-colors hover:border-primary/40 hover:bg-primary-soft/50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`h-4 w-4 ${gelap ? "text-[#fbbf24]" : "text-primary"}`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <span>{gelap ? "Mode Terang" : "Mode Gelap"}</span>
    </button>
  );
}

// Drawer slide-over (§9.1): bar Cyber Ocean + X putih, daftar halaman berikon,
// dan panel aksi bawah ringkas (Darurat + Dark Mode + Masuk/Profil).
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
      className="fixed inset-0 z-50 flex animate-[muncul_200ms_ease-out] justify-end bg-ink/40 backdrop-blur-xs lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
      onClick={(e) => {
        if (e.target === e.currentTarget) tutup();
      }}
    >
      <div className="flex h-full w-full max-w-[340px] flex-col bg-surface shadow-2xl">
        {/* Bar Cyber Ocean: wordmark perisai + X */}
        <div className="flex h-14 shrink-0 items-center justify-between bg-gradient-to-r from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9] px-4">
          <Wordmark terang={true} />
          <button
            ref={refX}
            type="button"
            onClick={tutup}
            aria-label="Tutup menu navigasi"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <Ikon nama="close" ukuran={22} />
          </button>
        </div>

        {/* Daftar halaman: ikon berbingkai + label + indikator aktif */}
        <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            Menu Utama
          </p>
          <div className="flex flex-col gap-1">
            {NAV.map((item) => {
              const aktif = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={tutup}
                  aria-current={aktif ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-150 ${
                    aktif
                      ? "bg-primary-soft text-primary"
                      : "text-ink hover:bg-bg hover:text-primary"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      aktif ? "bg-primary text-white" : "bg-bg text-muted"
                    }`}
                  >
                    <Ikon nama={item.ikon} ukuran={18} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`text-xs ${aktif ? "text-primary" : "text-muted/60"}`}
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bawah drawer: Darurat & Mode Gelap berdampingan + Masuk/Profil di bawahnya */}
        <div className="flex shrink-0 flex-col gap-2.5 border-t border-line bg-surface p-4">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/darurat"
              onClick={tutup}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-bahaya/30 bg-bahaya-soft/50 px-3 text-xs font-bold text-bahaya transition-colors hover:bg-bahaya hover:text-white"
            >
              <Ikon nama="sos" ukuran={16} />
              Darurat
            </Link>
            <DrawerDarkModeButton />
          </div>
          {memuat ? null : pengguna ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/riwayat"
                onClick={tutup}
                className="flex min-h-11 items-center gap-3 rounded-xl bg-primary-soft px-3.5 text-sm font-semibold text-primary"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white"
                >
                  {(profil?.nama_tampil || pengguna.email || "?").charAt(0).toUpperCase()}
                </span>
                {profil?.nama_tampil || "Pengguna"}
              </Link>
              {profil?.peran === "admin" ? (
                <Link
                  href="/admin"
                  onClick={tutup}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#075985]"
                >
                  <Ikon nama="admin_panel_settings" ukuran={18} />
                  Panel Admin
                </Link>
              ) : null}
              <TombolKeluar penuh saatSelesai={tutup} />
            </div>
          ) : (
            <Link
              href="/masuk"
              onClick={tutup}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#075985]"
            >
              <Ikon nama="login" ukuran={18} />
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { memuat, pengguna, profil } = useSesi();
  const [terbuka, setTerbuka] = useState(false);
  const [kuisFokus, setKuisFokus] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const refHamburger = useRef(null);
  const diMasuk = pathname === "/masuk";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/kuis") {
      setKuisFokus(false);
      return;
    }
    const sync = (e) => setKuisFokus(Boolean(e?.detail));
    setKuisFokus(document.documentElement.classList.contains("kuis-fokus"));
    window.addEventListener("ts-kuis-fokus", sync);
    return () => window.removeEventListener("ts-kuis-fokus", sync);
  }, [pathname]);

  // Panel admin, halaman login/daftar, ruang chat simulasi, dan mode fokus kuis memakai tampilan tersendiri.
  if (
    pathname.startsWith("/admin") ||
    pathname === "/masuk" ||
    pathname.startsWith("/simulasi/") ||
    (pathname === "/kuis" && kuisFokus)
  ) {
    return null;
  }

  const diAtas = !scrolled;

  return (
    <header
      data-site-header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        diAtas
          ? "border-b border-white/10 bg-gradient-to-r from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9]"
          : "border-b border-line bg-surface/95 shadow-xs backdrop-blur-md"
      }`}
    >
      {/* Mobile & Tablet (< lg): menyatu dengan hero saat di atas, putih saat di-scroll */}
      <div className="lg:hidden">
        <Container className="flex h-14 items-center justify-between gap-2">
          <Wordmark terang={diAtas} />
          <div className="flex items-center gap-1.5">
            <Link
              href="/darurat"
              className={`hidden h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors sm:inline-flex ${
                diAtas
                  ? "border-white/30 bg-white/15 text-white hover:border-bahaya hover:bg-bahaya"
                  : "border-bahaya/40 bg-surface text-bahaya hover:bg-bahaya hover:text-white"
              }`}
            >
              <Ikon nama="sos" ukuran={15} />
              Darurat
            </Link>
            <DarkModeToggle terang={diAtas} />
            <button
              ref={refHamburger}
              type="button"
              onClick={() => setTerbuka(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={terbuka}
              aria-haspopup="dialog"
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                diAtas
                  ? "border-white/25 bg-white/15 text-white hover:bg-white/25"
                  : "border-line bg-primary-soft text-primary hover:bg-primary hover:text-white"
              }`}
            >
              <Ikon nama="menu" ukuran={22} />
            </button>
          </div>
        </Container>
      </div>

      {/* Desktop: satu baris, semua tujuan tampak (§9.2) */}
      <Container className="hidden h-16 items-center justify-between gap-3 lg:flex">
        <Wordmark terang={diAtas} />
        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          {NAV.map((item) => {
            const aktif = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`relative whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors duration-150 after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-0.5 after:origin-center after:rounded-full after:transition-transform after:duration-200 ${
                  diAtas
                    ? aktif
                      ? "text-white after:scale-x-100 after:bg-white"
                      : "text-white/80 hover:text-white after:scale-x-0 after:bg-white hover:after:scale-x-100"
                    : aktif
                      ? "text-primary after:scale-x-100 after:bg-primary"
                      : "text-muted hover:text-primary after:scale-x-0 after:bg-primary hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <DarkModeToggle terang={diAtas} />
          <Link
            href="/darurat"
            className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-xs font-bold shadow-sm transition-all duration-150 ${
              diAtas
                ? "border-white/30 bg-white/15 text-white hover:border-bahaya hover:bg-bahaya"
                : "border-bahaya/40 bg-surface text-bahaya hover:bg-bahaya hover:text-white"
            }`}
          >
            <Ikon nama="sos" ukuran={16} />
            Darurat
          </Link>
          {memuat ? null : pengguna ? (
            <div className="flex items-center gap-2">
              <Link
                href="/riwayat"
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition-colors ${
                  diAtas
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-primary-soft text-primary"
                }`}
                aria-label={`${profil?.nama_tampil || "Akun"} - lihat riwayat`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    diAtas ? "bg-white text-primary" : "bg-primary text-white"
                  }`}
                >
                  {(profil?.nama_tampil || pengguna.email || "?").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">
                  {profil?.nama_tampil || "Pengguna"}
                </span>
                {profil?.total_poin !== undefined && profil?.total_poin !== null ? (
                  <span
                    className={`angka rounded-full px-1.5 text-[11px] font-bold ${
                      diAtas ? "bg-white text-primary" : "bg-primary text-white"
                    }`}
                  >
                    {profil.total_poin}
                  </span>
                ) : null}
              </Link>
              {profil?.peran === "admin" ? (
                <Link
                  href="/admin"
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors ${
                    diAtas
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-white hover:bg-[#075985]"
                  }`}
                >
                  <Ikon nama="admin_panel_settings" ukuran={16} />
                  <span>Panel Admin</span>
                </Link>
              ) : null}
              <TombolKeluar terang={diAtas} />
            </div>
          ) : (
            <Link
              href="/masuk"
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:opacity-95 ${
                diAtas ? "bg-white text-primary" : "bg-primary text-white"
              }`}
            >
              <Ikon nama="login" ukuran={17} />
              Masuk
            </Link>
          )}
        </div>
      </Container>

      <Drawer terbuka={terbuka} tutup={() => setTerbuka(false)} refHamburger={refHamburger} />
    </header>
  );
}
