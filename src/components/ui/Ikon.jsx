// Ikon Material Symbols Rounded, gaya fill, bobot 500 (DESIGN.md §6).
// Stylesheet dimuat sekali di layout root. Glyph dirender lewat codepoint
// (CSS content) alih-alih teks ligature, supaya nama ikon tidak menjadi
// teks tampak yang memicu gagal rule aksesibilitas "label-content-name-mismatch"
// pada tombol berikon (audit Lighthouse Hari 4).
// Codepoints: variablefont/MaterialSymbolsRounded.codepoints (google/material-design-icons).
const CODEPOINT = {
  arrow_right: "e5df",
  cancel: "e888",
  check_circle: "f0be",
  chat_bubble: "e0cb",
  close: "e5cd",
  content_paste_search: "ea9b",
  dangerous: "e99a",
  error: "f8b6",
  forum: "e8af",
  info: "e88e",
  keyboard_arrow_down: "e313",
  keyboard_arrow_up: "e316",
  leaderboard: "f20c",
  lock: "e899",
  login: "ea77",
  logout: "e9ba",
  mail: "e159",
  menu: "e5d2",
  menu_book: "ea19",
  military_tech: "ea3f",
  open_in_new: "e89e",
  person: "f0d3",
  person_add: "ea4d",
  quiz: "f04c",
  replay: "e042",
  search_off: "ea76",
  sos: "ebf7",
  verified_user: "f013",
  visibility: "e8f4",
  visibility_off: "e8f5",
  warning: "f083",
};

export default function Ikon({ nama, ukuran = 20, className = "" }) {
  const cp = CODEPOINT[nama];
  if (!cp) return null; // nama tak dikenal: lebih baik tanpa ikon daripada glyph salah
  return (
    <span
      aria-hidden="true"
      className={`ikon-glyph leading-none select-none ${className}`}
      style={{ fontSize: ukuran, "--glyph": `"\\${cp}"` }}
    />
  );
}
