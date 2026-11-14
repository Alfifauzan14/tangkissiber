// Mesin aturan Cek Pesan (fungsi murni, tanpa jaringan).
// Sumber aturan: src/data/aturan-cek.json (terbundel saat build).
import aturan from "../data/aturan-cek.json" with { type: "json" };

const URUT_TINGKAT = { aman: 0, waspada: 1, bahaya: 2 };
const POLA_IP = /^(http|https):\/\/\d+\.\d+\.\d+\.\d+/;
const POLA_TANPA_HTTPS = /^http:\/\//;
const POLA_SUBDOMAIN = /^(http|https):\/\/[^/]*\.[^/]*\.[^/]*\.[^/]*\//;

// Ambil semua tautan dari satu teks tempelan.
// Tautan dengan protokol (https:// atau www.) dan tautan pendek telanjang
// (bit.ly/xxx tanpa protokol) keduanya terekstrak.
export function ambilTautan(teks) {
  if (!teks) return [];
  const standar = teks.match(/(?:https?:\/\/|www\.)[^\s<>"']+/gi) || [];
  const polaPendek = aturan.tautan.aturan.find((a) => a.id === "tautan-pendek").pola
    .map((p) => p.replace(/\./g, "\\."));
  const telanjang = teks.match(
    new RegExp(`(?:${polaPendek.join("|")})[^\\s<>"']+`, "gi")
  ) || [];
  return [...new Set([...standar, ...telanjang])];
}

// Periksa satu tautan terhadap aturan tautan.
// return: { tingkat, sinyal: [aturan yang cocok] }
function periksaSatuTautan(tautanMentah) {
  let t = tautanMentah.trim().toLowerCase();
  if (t.startsWith("www.")) t = "https://" + t;
  if (!/^[a-z]+:\/\//.test(t)) t = "https://" + t;
  const cocok = [];

  for (const aturanT of aturan.tautan.aturan) {
    let kena = false;
    if (aturanT.id === "simbol-at") {
      // Tanda @ di bagian sebelum garis miring pertama (setelah skema dibuang)
      const tanpaSkema = t.replace(/^[a-z]+:\/\//, "");
      kena = /^[^/]*@/.test(tanpaSkema);
    } else if (aturanT.id === "alamat-ip") {
      kena = POLA_IP.test(t);
    } else if (aturanT.id === "tanpa-https") {
      kena = POLA_TANPA_HTTPS.test(t);
    } else if (aturanT.id === "subdomain-berlebih") {
      kena = POLA_SUBDOMAIN.test(t);
    } else if (aturanT.id === "tautan-pendek") {
      kena = aturanT.pola.some((p) => t.includes(p.toLowerCase()));
    } else if (aturanT.id === "menyerupai-merek") {
      kena = aturanT.pola.some((p) => t.includes(p.toLowerCase()));
    }
    if (kena) cocok.push(aturanT);
  }
  return cocok;
}

// Periksa teks pesan terhadap aturan pesan.
function periksaTeksPesan(teks) {
  const t = teks.toLowerCase();
  const cocok = [];
  for (const aturanP of aturan.pesan.aturan) {
    if (aturanP.pola.some((p) => t.includes(p.toLowerCase()))) cocok.push(aturanP);
  }
  return cocok;
}

// periksaPesan(teks) -> hasil lengkap untuk layar hasil.
// return { tingkat: 'aman'|'waspada'|'bahaya', sinyal: [{id, judul, tingkat, alasan, saran}], alasan: [], saran: [] }
export function periksaPesan(teksMentah) {
  const teks = (teksMentah || "").trim();
  const hasil = [];

  if (teks.length > 0) hasil.push(...periksaTeksPesan(teks));
  for (const tautan of ambilTautan(teks)) {
    hasil.push(...periksaSatuTautan(tautan));
  }

  // Hapus aturan kembar (satu aturan bisa terpicu pesan dan tautan sekaligus)
  const unik = [];
  const sudah = new Set();
  for (const a of hasil) {
    if (!sudah.has(a.id)) {
      sudah.add(a.id);
      unik.push(a);
    }
  }

  const tingkat = unik.reduce(
    (tertinggi, a) =>
      URUT_TINGKAT[a.tingkat] > URUT_TINGKAT[tertinggi] ? a.tingkat : tertinggi,
    "aman"
  );

  return {
    tingkat,
    label: aturan.tingkat[tingkat],
    sinyal: unik.map(({ id, judul, tingkat: t, alasan, saran }) => ({
      id,
      judul,
      tingkat: t,
      alasan,
      saran,
    })),
    alasan: unik.map((a) => a.alasan),
    saran: unik.length
      ? unik.map((a) => a.saran)
      : [
          "Tidak ada tanda bahaya yang dikenali dari aturan kami. Ini bukan jaminan pesan tersebut sah: tetap jangan beri OTP, PIN, sandi, atau uang ke siapa pun.",
        ],
  };
}
