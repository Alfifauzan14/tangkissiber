// Tiga keadaan sistem (DESIGN.md §11.7, R-27): kosong, memuat, gagal.
// Semua komponen data wajib punya ketiganya.
import Link from "next/link";
import Kartu from "./Kartu";
import Tombol from "./Tombol";
import Ikon from "./Ikon";

// Kosong: gelembung motif kecil + satu kalimat awam + tombol tindakan.
export function KeadaanKosong({ pesan, labelAksi, tujuanAksi, ikon = "chat_bubble" }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary"
      >
        <Ikon nama={ikon} ukuran={24} />
      </span>
      <p className="max-w-xs text-sm text-muted">{pesan}</p>
      {labelAksi && tujuanAksi ? (
        <Link
          href={tujuanAksi}
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary-soft px-5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-[#e0e7ff] md:min-h-11"
        >
          {labelAksi}
        </Link>
      ) : null}
    </div>
  );
}

// Memuat: skeleton abu lembut tanpa animasi berlebihan, maksimal 2 elemen.
export function KeadaanMemuat({ baris = 2 }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Sedang memuat">
      {Array.from({ length: Math.min(2, baris) }).map((_, i) => (
        <div key={i} className="h-5 w-full rounded-sm bg-line/70" />
      ))}
    </div>
  );
}

// Gagal: kartu tint merah lembut + kalimat awam + tombol Coba Lagi.
export function KeadaanGagal({ pesan = "Gagal memuat data. Periksa koneksi internet Anda.", cobaLagi }) {
  return (
    <Kartu className="border-bahaya/30 bg-bahaya-soft/60 text-center">
      <p className="text-sm font-medium text-bahaya">{pesan}</p>
      {cobaLagi ? (
        <Tombol gaya="tonal" className="mt-3" onClick={cobaLagi}>
          Coba Lagi
        </Tombol>
      ) : null}
    </Kartu>
  );
}
