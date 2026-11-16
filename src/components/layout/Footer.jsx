"use client";

// Footer gelap navy bergaya Skoolia.id (#030712), 4 kolom seimbang, tersembunyi di /admin/*.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "./Container";
import Ikon from "../ui/Ikon";

const LATIHAN = [
  { href: "/cek-pesan", label: "Cek Pesan" },
  { href: "/simulasi", label: "Simulasi Chat" },
  { href: "/kuis", label: "Kuis Anti Penipuan" },
];

const RUJUKAN = [
  { href: "/pustaka", label: "Pustaka Modus" },
  { href: "/peringkat", label: "Peringkat" },
  { href: "/darurat", label: "Sudah Terlanjur?" },
];

export default function Footer() {
  const pathname = usePathname();
  const [kuisFokus, setKuisFokus] = useState(false);

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

  if (
    pathname.startsWith("/admin") ||
    pathname === "/masuk" ||
    pathname.startsWith("/simulasi/") ||
    (pathname === "/kuis" && kuisFokus)
  ) {
    return null;
  }

  return (
    <footer
      data-site-footer
      className="relative overflow-hidden bg-[#060d1b] text-slate-400"
    >
      {/* Garis aksen Cyber Ocean di atas footer */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#0c4a6e] via-[#0ea5e9] to-[#0369a1]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#0ea5e9]/10 blur-3xl"
      />

      <Container className="relative z-10 py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Kolom 1: Brand & pintasan darurat */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0369a1] text-white shadow-sm">
                <Ikon nama="verified_user" ukuran={18} />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Tangkis<span className="text-[#38bdf8]">Siber</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Platform edukasi interaktif untuk melatih masyarakat mengenali dan menangkis
              penipuan digital, gratis untuk semua.
            </p>
            <Link
              href="/darurat"
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-[#f87171] underline-offset-2 transition-colors duration-150 hover:text-[#fca5a5] hover:underline"
            >
              <Ikon nama="sos" ukuran={16} />
              Langkah Darurat →
            </Link>
          </div>

          {/* Kolom 2 & 3: Latihan & Rujukan berdampingan di HP (grid-cols-2), tetap sejajar di desktop */}
          <div className="grid grid-cols-2 gap-6 sm:col-span-2 lg:col-span-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Latihan
              </h2>
              <nav aria-label="Tautan latihan footer" className="mt-3 flex flex-col gap-0.5">
                {LATIHAN.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex min-h-9 items-center text-sm text-slate-400 transition-colors duration-150 hover:text-[#38bdf8]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Rujukan
              </h2>
              <nav aria-label="Tautan rujukan footer" className="mt-3 flex flex-col gap-0.5">
                {RUJUKAN.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex min-h-9 items-center text-sm text-slate-400 transition-colors duration-150 hover:text-[#38bdf8]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Kolom 4: Catatan edukasi sejajar tanpa kotak */}
          <div className="lg:col-span-4">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Ikon nama="info" ukuran={15} className="text-[#38bdf8]" />
              Catatan Edukasi
            </h2>
            <p className="mt-3 border-l-2 border-[#0ea5e9]/40 pl-3.5 text-xs leading-relaxed text-slate-400">
              TangkisSiber adalah alat bantu edukasi, bukan jaminan keamanan 100% dan bukan
              kanal pelaporan resmi. Untuk melapor tindak penipuan, gunakan kanal resmi di
              halaman darurat.
            </p>
            <Link
              href="/darurat"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#38bdf8] underline-offset-2 hover:underline"
            >
              Lihat kanal pelaporan resmi →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800/80 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TangkisSiber. Edukasi Anti Penipuan Digital.</p>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <Link
              href="/privasi"
              className="underline-offset-2 transition-colors duration-150 hover:text-[#38bdf8] hover:underline"
            >
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <span>Gratis • Tanpa Login Wajib</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
