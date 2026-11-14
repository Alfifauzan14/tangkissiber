"use client";

// Header (revisi desain: navigasi seluruhnya di atas, tanpa tab bar bawah).
// Mobile: baris logo + aksi darurat/masuk, lalu baris chip nav yang bisa
// digulir horizontal (semua tujuan tampak, tanpa menu hamburger).
// Desktop: nav horizontal di dalam header seperti semula.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "./Container";
import Ikon from "../ui/Ikon";
import { useSesi } from "@/lib/sesi";
import { supabase } from "@/lib/supabase";

// Tombol Keluar (FR-F7-05): icon-only di mobile, teks penuh di desktop.
function TombolKeluar() {
  const router = useRouter();
  async function keluar() {
    await supabase.auth.signOut();
    router.replace("/");
  }
  return (
    <button
      type="button"
      onClick={keluar}
      aria-label="Keluar"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-primary-soft hover:text-primary lg:h-9 lg:w-auto lg:gap-2 lg:rounded-md lg:px-3 lg:text-sm lg:font-semibold"
    >
      <Ikon nama="logout" ukuran={18} />
      <span className="hidden lg:inline">Keluar</span>
    </button>
  );
}

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/cek-pesan", label: "Cek Pesan" },
  { href: "/simulasi", label: "Simulasi" },
  { href: "/kuis", label: "Kuis" },
  { href: "/pustaka", label: "Pustaka" },
  { href: "/peringkat", label: "Peringkat" },
];

export default function Header() {
  const pathname = usePathname();
  const { memuat, pengguna, profil } = useSesi();
  const diMasuk = pathname === "/masuk";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      {/* Baris 1: logo + nav desktop + aksi */}
      <Container className="flex h-14 items-center justify-between gap-3">
        <Link href="/" className="text-base font-bold text-ink" aria-label="TangkisSiber, ke beranda">
          Tangkis<span className="text-primary">Siber</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
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
          {/* Mobile: ikon darurat saja supaya baris logo muat di 320px.
              Teks penuh "Sudah Terlanjur?" tampil kembali di desktop. */}
          <Link
            href="/darurat"
            aria-label="Sudah Terlanjur? Buka halaman darurat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-bahaya-soft text-bahaya transition-colors duration-150 hover:bg-[#fee2e2]/70 lg:hidden"
          >
            <Ikon nama="sos" ukuran={18} />
          </Link>
          <Link
            href="/darurat"
            className="hidden rounded-sm px-3 py-2 text-sm font-bold text-bahaya transition-colors duration-150 hover:text-[#7f1010] lg:inline-flex"
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
                <span className="hidden max-w-24 truncate sm:inline">
                  {profil?.nama_tampil || "Pengguna"}
                </span>
                {profil?.total_poin !== undefined && profil?.total_poin !== null ? (
                  <span className="angka hidden rounded-full bg-primary px-1.5 text-[11px] font-bold text-white md:inline">
                    {profil.total_poin}
                  </span>
                ) : null}
              </Link>
              <TombolKeluar />
            </div>
          ) : diMasuk ? null : (
            <Link
              href="/masuk"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#011c7d]"
            >
              Masuk
            </Link>
          )}
        </div>
      </Container>

      {/* Baris 2 (mobile/tablet): chip nav yang bisa digulir */}
      <div className="border-t border-line lg:hidden">
        <Container className="tanpa-gulir flex gap-2 overflow-x-auto py-2">
          {NAV.map((item) => {
            const aktif = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors duration-150 ${
                  aktif
                    ? "bg-primary text-white"
                    : "bg-primary-soft/60 text-muted hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </Container>
      </div>
    </header>
  );
}
