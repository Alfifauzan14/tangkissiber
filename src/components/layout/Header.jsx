"use client";

// Header (DESIGN.md §9.1/§9.2): 56px di mobile (logo kiri, aksi kanan),
// nav horizontal penuh di desktop. Belum ada menu hamburger: semua tujuan tampak.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./Container";
import Tombol from "../ui/Tombol";
import { useSesi } from "@/lib/sesi";

const NAV_DESKTOP = [
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
    <header className="border-b border-line bg-surface">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-base font-bold text-ink" aria-label="TangkisSiber, ke beranda">
          Tangkis<span className="text-primary">Siber</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {NAV_DESKTOP.map((item) => {
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

        <div className="flex items-center gap-3">
          <Link
            href="/darurat"
            className="hidden rounded-sm px-3 py-2 text-sm font-bold text-bahaya transition-colors duration-150 hover:text-[#7f1010] lg:inline-flex"
          >
            Sudah Terlanjur?
          </Link>
          {memuat ? null : pengguna ? (
            <Link
              href="/riwayat"
              className="flex items-center gap-2 rounded-full bg-primary-soft py-1.5 pl-1.5 pr-3 text-sm font-semibold text-primary"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-white"
              >
                {(profil?.nama_tampil || pengguna.email || "?").charAt(0).toUpperCase()}
              </span>
              <span className="max-w-28 truncate">{profil?.nama_tampil || "Pengguna"}</span>
            </Link>
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
    </header>
  );
}
