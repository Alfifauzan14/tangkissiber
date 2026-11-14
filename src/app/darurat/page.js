// Halaman darurat: 6 langkah pertolongan pertama + 6 kanal resmi.
// Konten dari darurat.json, semua kanal sudah diverifikasi lewat situs resmi.
import darurat from "@/data/darurat.json";
import Container from "@/components/layout/Container";
import Kartu from "@/components/ui/Kartu";
import Badge from "@/components/ui/Badge";
import Ikon from "@/components/ui/Ikon";

export const metadata = { title: "Sudah Terlanjur? | TangkisSiber" };

export default function HalamanDarurat() {
  return (
    <Container className="max-w-[720px] py-8 lg:py-10">
      <header>
        <Badge warna="bahaya" ikon="sos">
          Pertolongan pertama
        </Badge>
        <h1 className="mt-3 text-2xl font-bold text-ink md:text-3xl">{darurat.judul}</h1>
        <p className="mt-2 text-sm text-muted md:text-base">{darurat.pengantar}</p>
      </header>

      {/* Langkah berurutan */}
      <section aria-label="Langkah penanganan" className="mt-8 flex flex-col gap-3">
        {darurat.langkah.map((l) => (
          <Kartu key={l.urutan} className="flex gap-4">
            <span
              aria-hidden="true"
              className="angka flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
            >
              {l.urutan}
            </span>
            <div>
              <h2 className="font-semibold text-ink">{l.judul}</h2>
              <p className="mt-1 text-sm text-muted">{l.isi}</p>
              {l.tautan?.url ? (
                <a
                  href={l.tautan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {l.tautan.teks}
                  <Ikon nama="open_in_new" ukuran={14} />
                </a>
              ) : null}
            </div>
          </Kartu>
        ))}
      </section>

      {/* Kanal resmi */}
      <section aria-labelledby="judul-kanal" className="mt-10">
        <h2 id="judul-kanal" className="text-lg font-bold text-ink">
          Kanal resmi untuk melapor
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {darurat.kanal.map((k) => (
            <Kartu key={k.nama} className="flex flex-col">
              <h3 className="font-semibold text-ink">{k.nama}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{k.keterangan}</p>
              <p className="mt-2 text-xs text-muted">Sumber: {k.sumber}</p>
              <a
                href={k.aksi.url}
                target={k.aksi.url.startsWith("tel:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-1 rounded-md bg-primary-soft px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-[#e0e7ff]"
              >
                {k.aksi.teks}
                {k.aksi.url.startsWith("tel:") ? null : <Ikon nama="open_in_new" ukuran={14} />}
              </a>
            </Kartu>
          ))}
        </div>
      </section>

      <p className="mt-8 flex items-start gap-2 text-xs text-muted">
        <Ikon nama="info" ukuran={16} className="mt-0.5 shrink-0" />
        {darurat.catatan}
      </p>
    </Container>
  );
}
