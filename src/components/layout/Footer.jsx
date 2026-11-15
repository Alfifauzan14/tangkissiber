// Footer satu bagian: identitas + tautan nav ringkas + disclaimer.
// Disclaimer penting untuk produk ini: alat bantu edukasi, bukan kanal
// pelaporan resmi, bukan jaminan (selaras dengan disclaimer Cek Pesan).
import Link from "next/link";
import Container from "./Container";

const NAV = [
  { href: "/cek-pesan", label: "Cek Pesan" },
  { href: "/simulasi", label: "Simulasi" },
  { href: "/kuis", label: "Kuis" },
  { href: "/pustaka", label: "Pustaka" },
  { href: "/peringkat", label: "Peringkat" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-8">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-bold text-ink">
              Tangkis<span className="text-primary">Siber</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Latihan mengenali dan menangkis penipuan digital, gratis untuk semua.
            </p>
            <Link
              href="/darurat"
              className="mt-1 inline-flex min-h-11 items-center -my-2 text-sm font-bold text-bahaya underline-offset-2 hover:underline"
            >
              Sudah terlanjur? Ikuti langkah darurat
            </Link>
          </div>

          <nav aria-label="Tautan footer" className="flex flex-wrap items-center gap-x-5 gap-y-1 content-start">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-muted underline-offset-2 transition-colors duration-150 hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <p className="text-xs text-muted">
            TangkisSiber adalah alat bantu edukasi, bukan jaminan keamanan dan bukan kanal
            pelaporan resmi. Untuk melapor, gunakan kanal resmi di halaman darurat.
          </p>
          <p className="mt-1 text-xs text-muted">© 2026 TangkisSiber</p>
        </div>
      </Container>
    </footer>
  );
}
