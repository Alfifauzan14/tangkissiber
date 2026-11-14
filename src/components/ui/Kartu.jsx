// Kartu permukaan standar (DESIGN.md §8.1): surface, garis 1px, radius-lg,
// padding 16 mobile / 24 desktop. Bayangan satu tingkat hanya saat bisa diklik,
// dan kartu tertaut naik 2px saat hover.
export default function Kartu({ tertaut = false, className = "", children }) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface p-4 md:p-6 ${
        tertaut
          ? "shadow-[0_1px_2px_rgba(21,22,42,0.06)] transition-transform duration-200 ease-out hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
