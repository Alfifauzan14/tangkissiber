// Aturan poin dan level sesuai PRD FR-F10 (fungsi murni, tanpa efek samping).
//
// Total poin = skor terbaik kuis (maks 100) + skor terbaik tiap skenario
// simulasi (4 x 100). Maksimum 500. Level dihitung dari total poin.

export const POIN_MAKS = 500;

export const LEVEL = [
  { nama: "Pemula", batasBawah: 0, batasAtas: 150 },
  { nama: "Waspada", batasBawah: 150, batasAtas: 350 },
  { nama: "Penangkis", batasBawah: 350, batasAtas: 500 },
  { nama: "Penjaga Siber", batasBawah: 500, batasAtas: Infinity },
];

// hitungLevel(totalPoin) -> nama level. Rentang: Pemula < 150,
// Waspada 150-349, Penangkis 350-499, Penjaga Siber >= 500.
export function hitungLevel(totalPoin) {
  const poin = Math.max(0, Number(totalPoin) || 0);
  for (const l of LEVEL) {
    if (poin >= l.batasBawah && poin < l.batasAtas) return l.nama;
  }
  return LEVEL[0].nama;
}

// hitungTotalPoin({ kuisTerbaik, simulasiTerbaik: { [skenarioId]: skor } })
// -> total poin sesuai rumus PRD, dibatasi maks 500.
export function hitungTotalPoin({ kuisTerbaik = 0, simulasiTerbaik = {} } = {}) {
  const kuis = Math.max(0, Math.min(100, Number(kuisTerbaik) || 0));
  const jumlahSimulasi = Object.values(simulasiTerbaik)
    .map((s) => Math.max(0, Math.min(100, Number(s) || 0)))
    .reduce((a, b) => a + b, 0);
  return Math.min(POIN_MAKS, kuis + jumlahSimulasi);
}
