// Daftar skenario simulasi (FR-F3-02): 4 skenario dari Supabase `konten_aplikasi` (fallback JSON).
export const dynamic = "force-dynamic";

import { ambilKontenServer } from "@/lib/konten";
import Container from "@/components/layout/Container";
import PageBanner from "@/components/layout/PageBanner";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";

const KUNCI_SKENARIO = [
  "skenario-kurir-apk",
  "skenario-hadiah-palsu",
  "skenario-otp-bank",
  "skenario-lowongan-palsu",
];

const IKON_SKENARIO = {
  "kurir-apk": "content_paste_search",
  "hadiah-palsu": "military_tech",
  "otp-bank": "lock",
  "lowongan-palsu": "person",
};

export const metadata = { title: "Simulasi Percakapan | TangkisSiber" };

export default async function HalamanSimulasi() {
  const SEMUA = await Promise.all(KUNCI_SKENARIO.map((k) => ambilKontenServer(k)));
  return (
    <div>
      <PageBanner
        eyebrow="Latihan Chat Interaktif"
        judul="Simulasi Percakapan"
        deskripsi="Latihan membalas chat penipu langkah demi langkah. Setiap jawaban langsung mendapat umpan balik, lalu di akhir ada skor dan ringkasan tanda bahayanya."
      />

      <Container className="py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {SEMUA.map((s) => (
            <a
              key={s.id}
              href={`/simulasi/${s.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)]"
            >
              {/* Header kontak ala chat */}
              <div className="flex items-center gap-3.5 border-b border-line bg-bg/70 px-5 py-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                >
                  <Ikon nama={IKON_SKENARIO[s.id] || "forum"} ukuran={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold text-ink group-hover:text-primary">
                    {s.judul}
                  </h2>
                  <p className="truncate text-xs text-muted">
                    {s.penipu.nama} • {s.penipu.peran}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {s.langkah.length} langkah
                </span>
              </div>

              {/* Isi & cuplikan chat tanpa terpotong setengah baris */}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-relaxed text-muted">{s.deskripsi}</p>
                {s.langkah?.[0]?.pesan ? (
                  <div className="mt-4 rounded-2xl rounded-tl-xs border border-line bg-bg px-4 py-3">
                    <p className="line-clamp-2 text-xs leading-5 italic text-ink/90">
                      &ldquo;{s.langkah[0].pesan}&rdquo;
                    </p>
                  </div>
                ) : null}

                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-4 py-2 text-xs font-bold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                    Mulai Simulasi Chat
                    <Ikon nama="arrow_right" ukuran={16} />
                  </span>
                </div>
              </div>
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
    </div>
  );
}
