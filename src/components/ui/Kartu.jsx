// Kartu permukaan standar (DESIGN.md §8.1 v1.1): surface, garis 1px, radius-lg,
// padding 16 mobile / 24 desktop. Kartu tertaut: bayangan satu tingkat saat
// diam, saat hover naik 2px dan bayangan menguat satu tingkat.
export default function Kartu({ tertaut = false, className = "", children }) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface p-4 md:p-6 ${
        tertaut
          ? "shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
