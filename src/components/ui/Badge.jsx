// Badge status (DESIGN.md §11.2): kapsul kecil radius-sm, pasangan tint+teks
// semantik §3.3, ikon 14px. Hanya untuk status nyata.
import Ikon from "./Ikon";

const WARNA = {
  aman: "bg-aman-soft text-aman",
  waspada: "bg-waspada-soft text-waspada",
  bahaya: "bg-bahaya-soft text-bahaya",
  primary: "bg-primary-soft text-primary",
};

export default function Badge({ warna = "primary", ikon, className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold ${WARNA[warna]} ${className}`}
    >
      {ikon ? <Ikon nama={ikon} ukuran={14} /> : null}
      {children}
    </span>
  );
}
