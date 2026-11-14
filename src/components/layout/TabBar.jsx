"use client";

// Bottom tab bar mobile (DESIGN.md §9.1): 64px + safe-area, 5 tujuan saja.
// Tab aktif: ikon + label warna --primary; nonaktif --text-muted.
// Hilang di desktop, dan tidak tampil di halaman masuk/daftar (fokus form).
import Link from "next/link";
import { usePathname } from "next/navigation";
import Ikon from "../ui/Ikon";

const TAB = [
  { href: "/", label: "Beranda", ikon: "home" },
  { href: "/cek-pesan", label: "Cek Pesan", ikon: "content_paste_search" },
  { href: "/kuis", label: "Kuis", ikon: "quiz" },
  { href: "/simulasi", label: "Simulasi", ikon: "forum" },
  { href: "/riwayat", label: "Riwayat", ikon: "history" },
];

export default function TabBar() {
  const pathname = usePathname();
  if (pathname === "/masuk") return null;

  return (
    <nav
      aria-label="Navigasi tab"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-16 max-w-[720px] items-stretch">
        {TAB.map((t) => {
          const aktif = pathname === t.href;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[12px] font-medium transition-colors duration-150 ${
                  aktif ? "text-primary" : "text-muted hover:text-primary"
                }`}
              >
                <Ikon nama={t.ikon} ukuran={22} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
