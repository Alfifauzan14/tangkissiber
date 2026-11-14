// Halaman penanda untuk rute yang fiturnya dijadwalkan pada tahap berikutnya
// (R-24: setiap tautan nav harus punya halaman nyata, bukan 404).
import Container from "./layout/Container";
import Kartu from "./ui/Kartu";

export default function HalamanPenanda({ judul, deskripsi, jadwal }) {
  return (
    <Container className="py-10">
      <Kartu className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-bold text-ink">{judul}</h1>
        <p className="mt-2 text-sm text-muted">{deskripsi}</p>
        <p className="mt-4 inline-block rounded-sm bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
          Fitur ini sedang dibangun ({jadwal})
        </p>
      </Kartu>
    </Container>
  );
}
