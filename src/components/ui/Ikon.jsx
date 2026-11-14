// Ikon Material Symbols Rounded, gaya fill, bobot 500 (DESIGN.md §6).
// Stylesheet dimuat sekali di layout root.
export default function Ikon({ nama, ukuran = 20, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded leading-none select-none ${className}`}
      style={{ fontSize: ukuran }}
    >
      {nama}
    </span>
  );
}
