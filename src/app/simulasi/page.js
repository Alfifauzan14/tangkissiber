// Daftar skenario simulasi (FR-F3-02): 4 skenario dari JSON di repo.
import kurir from "@/data/skenario/kurir-apk.json";
import hadiah from "@/data/skenario/hadiah-palsu.json";
import otp from "@/data/skenario/otp-bank.json";
import lowongan from "@/data/skenario/lowongan-palsu.json";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";

const SEMUA = [kurir, hadiah, otp, lowongan];

export const metadata = { title: "Simulasi Percakapan | TangkisSiber" };

export default function HalamanSimulasi() {
  return (
    <Container className="py-8 lg:py-10">
      <header className="max-w-xl">
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Simulasi Percakapan</h1>
        <p className="mt-2 text-sm text-muted">
          Latihan membalas chat penipu langkah demi langkah. Setiap jawaban langsung
          mendapat umpan balik, lalu di akhir ada skor dan ringkasan tanda bahayanya.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {SEMUA.map((s) => (
          <a
            key={s.id}
            href={`/simulasi/${s.id}`}
            className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(21,22,42,0.06)] transition-transform duration-200 ease-out hover:-translate-y-0.5 md:p-6"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
              >
                {s.penipu.nama.charAt(0)}
              </span>
              <span>
                <h2 className="font-semibold text-ink">{s.judul}</h2>
                <p className="text-xs text-muted">
                  Penipu: {s.penipu.nama} ({s.penipu.peran})
                </p>
              </span>
            </span>
            <p className="mt-3 flex-1 text-sm text-muted">{s.deskripsi}</p>
            <p className="mt-3 text-xs font-medium text-primary">
              {s.langkah.length} langkah → Coba Skenario
            </p>
          </a>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted">
        <Badge warna="bahaya" ikon="warning">
          Tanda bahaya
        </Badge>
        Kumpulkan keputusan tepat: skornya naik kalau Anda memilih respons yang aman.
      </p>
    </Container>
  );
}
