// Handoff tamu→login (FR-F12, ARCHITECTURE.md §5).
// Hasil terakhir tamu disimpan sementara di browser (localStorage) saat
// menekan "Masuk untuk menyimpan", lalu disisipkan ke tabel setelah auth
// berhasil. Hanya 1 hasil terakhir yang dibawa (keputusan A7).
//
// Dua kunci penyimpanan (keduanya localStorage agar persisten saat navigasi):
// - ts_hasil_tunda (localStorage): { jenis, skenario_id?, skor }. Ditulis
//   halaman kuis/simulasi saat tamu klik "Masuk untuk menyimpan", dibaca
//   dan dihapus halaman masuk setelah insert berhasil.
// - ts_pulang (localStorage): { jenis, skenario_id?, skor }. Sinyal ke
//   halaman asal bahwa handoff baru selesai, supaya layar hasil langsung
//   tampil "Tersimpan". Dibaca sekali lalu dihapus.

const KUNCI_TUNDA = "ts_hasil_tunda";
const KUNCI_PULANG = "ts_pulang";

// Simpan hasil tamu yang menunggu disimpan (sebelum redirect ke /masuk)
export function simpanTunda(hasil) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KUNCI_TUNDA, JSON.stringify(hasil));
  } catch (e) {
    // localStorage penuh atau tidak tersedia; abaikan diam-diam
  }
}

// Baca hasil yang menunggu (dipanggil halaman masuk setelah auth berhasil)
export function ambilTunda() {
  if (typeof window === "undefined") return null;
  try {
    const mentah = localStorage.getItem(KUNCI_TUNDA);
    return mentah ? JSON.parse(mentah) : null;
  } catch (e) {
    return null;
  }
}

// Hapus hasil yang menunggu (setelah insert berhasil)
export function hapusTunda() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KUNCI_TUNDA);
  } catch (e) {
    // abaikan
  }
}

// Simpan sinyal pulang untuk halaman asal (setelah handoff selesai)
// Gunakan localStorage agar persisten saat navigasi client-side.
export function simpanPulang(info) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KUNCI_PULANG, JSON.stringify(info));
  } catch (e) {
    // abaikan
  }
}

// Baca sinyal pulang (dipanggil halaman asal saat mount)
// Hapus setelah dibaca agar tidak muncul lagi.
export function ambilPulang() {
  if (typeof window === "undefined") return null;
  try {
    const mentah = localStorage.getItem(KUNCI_PULANG);
    return mentah ? JSON.parse(mentah) : null;
  } catch (e) {
    return null;
  }
}

// Hapus sinyal pulang (setelah dibaca halaman asal)
export function hapusPulang() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KUNCI_PULANG);
  } catch (e) {
    // abaikan
  }
}
