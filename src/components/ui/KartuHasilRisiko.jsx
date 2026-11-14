// Kartu hasil risiko (DESIGN.md §8.2): kartu khas produk.
// Struktur: garis tebal 4px tepi kiri warna status, latar tint status,
// judul status besar, daftar alasan, lalu blok "Saran tindakan" berlatar surface.
import Ikon from "./Ikon";

const STATUS = {
  aman: {
    teks: "text-aman",
    tint: "bg-aman-soft",
    garis: "border-l-aman",
    ikon: "check_circle",
  },
  waspada: {
    teks: "text-waspada",
    tint: "bg-waspada-soft",
    garis: "border-l-waspada",
    ikon: "warning",
  },
  bahaya: {
    teks: "text-bahaya",
    tint: "bg-bahaya-soft",
    garis: "border-l-bahaya",
    ikon: "dangerous",
  },
};

export default function KartuHasilRisiko({ tingkat, label, sinyal, saran }) {
  const s = STATUS[tingkat] || STATUS.aman;

  return (
    <div className={`rounded-lg border border-line border-l-4 ${s.tint} ${s.garis} p-4 md:p-6`}>
      {/* Status dulu */}
      <div className="flex items-center gap-2">
        <Ikon nama={s.ikon} ukuran={28} className={s.teks} />
        <h2 className={`text-2xl font-bold ${s.teks}`}>{label}</h2>
        <span className="ml-auto text-sm font-medium text-muted">
          {sinyal.length} sinyal terdeteksi
        </span>
      </div>

      {/* Alasan kemudian */}
      {sinyal.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {sinyal.map((n) => (
            <li key={n.id} className="flex items-start gap-2 text-sm">
              <Ikon nama="error" ukuran={16} className={`mt-0.5 shrink-0 ${s.teks}`} />
              <span className="text-ink">
                <strong className="font-semibold">{n.judul}:</strong>{" "}
                <span className="text-muted">{n.alasan}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Tidak ada tanda bahaya yang dikenali dari aturan kami.
        </p>
      )}

      {/* Tindakan terakhir */}
      <div className="mt-4 rounded-md bg-surface p-3">
        <h3 className="text-sm font-semibold text-ink">Saran tindakan</h3>
        <ul className="mt-2 flex flex-col gap-1.5">
          {saran.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <Ikon nama="arrow_right" ukuran={16} className="mt-0.5 shrink-0 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
