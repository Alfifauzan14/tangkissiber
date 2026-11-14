// Tombol: 4 gaya saja (DESIGN.md §7). Satu pasangan bentuk (radius-md),
// satu skala tinggi (48px mobile / 44px desktop).
import Ikon from "./Ikon";

const GAYA = {
  primary:
    "bg-primary text-white hover:bg-[#011c7d] disabled:hover:bg-primary",
  tonal:
    "bg-primary-soft text-primary hover:bg-[#e0e7ff] disabled:hover:bg-primary-soft",
  ghost:
    "bg-transparent text-muted hover:text-primary hover:bg-primary-soft/60",
  danger: "bg-bahaya text-white hover:bg-[#991b1b] disabled:hover:bg-bahaya",
};

export default function Tombol({
  gaya = "primary",
  ikon,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:min-h-11 md:w-auto ${GAYA[gaya]} ${className}`}
      {...props}
    >
      {ikon ? <Ikon nama={ikon} ukuran={18} /> : null}
      {children}
    </button>
  );
}
