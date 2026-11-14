# TASKS.md

## TangkisSiber: Daftar Tugas

| | |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 14 November 2026 |
| **Acuan** | PRD v1.0 · DESIGN.md v1.0 · ARCHITECTURE.md v1.0 · DATABASE.md v1.1 |
| **Ketentuan tanda** | `[x]` selesai · `[ ]` belum · status hari mengikuti rencana PRD §11 |

---

## Sebelum Hari 1 (Dokumen dan Fondasi Data) — selesai

- [x] PRD disusun dan disetujui (`docs/PRD.md`)
- [x] DESIGN.md disusun dan disetujui (`docs/DESIGN.md`)
- [x] ARCHITECTURE.md disusun dan disetujui (`docs/ARCHITECTURE.md`)
- [x] Project Supabase baru `tangkissiber` dibuat (region ap-southeast-1, biaya $0)
- [x] DATABASE.md disusun, disetujui, dan diterapkan ke project
- [x] `supabase/schema.sql` dibuat di repo (satu file utuh: tabel, index, trigger, RLS, grants, view)
- [x] Konfirmasi email dimatikan (`mailer_autoconfirm = true`)
- [x] Checklist verifikasi database V1-V9 lulus; pemeriksaan Advisors dibersihkan
- [x] Daftar tugas ini (`docs/TASKS.md`)

---

## Hari 1 — Fondasi dan Konten

### Setup aplikasi
- [x] Scaffold Next.js (App Router, **JavaScript**) + Tailwind, struktur folder sesuai ARCHITECTURE.md §6
- [x] Token desain DESIGN.md diterapkan di `globals.css` (CSS variables: warna, spacing, radius, tipografi)
- [x] Font Poppins via `next/font`, ikon Material Symbols Rounded
- [x] `lib/supabase.js`: satu instance klien; `.env.local` diisi URL + anon key (ambil via MCP); `.env.example` tanpa nilai rahasia; `.gitignore` menutup `.env.local`
- [x] `lib/poin.js`, `lib/sesi.js`, `lib/cekPesan.js` (logika murni)
- [ ] **Deploy skeleton ke Vercel di hari ini** (mitigasi risiko integrasi R7) — ditunda oleh pengguna ("Lain kali saja")
- [x] Commit awal ke GitHub (docs + schema + scaffold) — `2e30b39` + `4550ac4`, sudah di-push

### Konten JSON (semua di `src/data/`)
- [x] `modus.json`: 8 kartu modus (ciri-ciri, contoh pesan, cara kerja, tindakan)
- [x] `soal.json`: bank 20 soal + penjelasan tiap jawaban
- [x] `skenario/`: 4 skenario percakapan (kurir-apk, hadiah-palsu, otp-bank, lowongan-palsu)
- [x] `aturan-cek.json`: aturan pesan (5 sinyal) dan tautan (6 sinyal)
- [x] `darurat.json`: langkah berurutan + kontak resmi terverifikasi (cantumkan sumber)

### Halaman statis dan kerangka UI
- [x] Layout root + navigasi (revisi: header atas dua baris di mobile, tanpa tab bar bawah; nav desktop tidak berubah) sesuai DESIGN.md §9 hasil revisi
- [x] Komponen ui dasar: Button (4 gaya), Card, Badge, Input, keadaan Kosong/Memuat/Gagal
- [x] Beranda `/` dengan 6 kartu pintasan
- [x] `/darurat` (halaman statis dari `darurat.json`)
- [x] `/pustaka` (8 kartu + pencarian + filter)
- [x] Verifikasi visual terhadap DESIGN.md (kontras, radius, nav atas)
- [x] Footer satu bagian di semua halaman (wordmark, tautan nav, disclaimer, hak cipta; DESIGN.md §9.4)
- [x] Revisi desain atas permintaan pengguna: navigasi dipindah ke atas (tab bar bawah dihapus; chip nav horizontal di header mobile; verifikasi ulang Playwright)

---

## Hari 2 — Fitur Inti — selesai

### Cek Pesan
- [x] `/cek-pesan`: form tempel pesan/tautan
- [x] Mesin aturan `lib/cekPesan.js` membaca `aturan-cek.json` (tanpa jaringan)
- [x] Kartu hasil risiko (garis status 4px + tint) + alasan awam + saran tindakan + disclaimer

### Simulasi Chat
- [x] `/simulasi`: daftar 4 skenario
- [x] `/simulasi/[skenario]`: gelembung chat (motif sudut ekor), pilihan respons per langkah, umpan balik langsung
- [x] Akhir: skor 0-100 + ringkasan tanda bahaya

### Kuis
- [x] `/kuis`: 10 soal acak dari 20, penjelasan per jawaban, skor akhir + level

### Auth dan penyimpanan
- [x] `/masuk`: tab Masuk/Daftar (nama tampil, email, password), redirect `?kembali=`
- [x] Guard `/riwayat` dan `/masuk` (klien, via `useSesi`)
- [x] Header: nama + level + Riwayat Saya + Keluar (login); tombol Masuk (tamu)
- [x] Simpan skor otomatis setelah kuis/simulasi selesai (insert; `user_id` default database)
- [x] `/riwayat`: daftar hasil kuis + simulasi, skor terbaik, level, total poin (poin dari view `peringkat` atau hitung ulang via `lib/poin.js`)
- [x] `/peringkat`: Top 20 dari view, posisi pengguna disorot, tamu hanya melihat

### Catatan verifikasi Hari 2 (commit `9f1da41`)
- Semua AC PRD §9 Hari 2 lulus via Playwright: Cek Pesan 1-4, Simulasi 1-3, Kuis 1-2, Masuk/Daftar 1-5, Riwayat & Peringkat 1-4, Tamu 2-5.
- Bug diperbaiki: (1) Next 16 Cache Components menolak `new Date()` saat prerender, waktu dipindah ke `useEffect`; (2) pola `<a><button>` diubah jadi prop `href` di `Tombol`; (3) efek simpan macet di "Menyimpan..." karena `statusSimpan` di deps + cleanup abort, diganti guard `useRef`; (4) `onAuthStateChange` selalu set `profil: null`, kini ambil profil ulang di kedua jalur.
- `useSesi` mengambil profil (nama_tampil, total_poin) dari view `peringkat`, bukan tabel `profiles`.
- 0 error console di semua halaman teruji. 320px muat tanpa overflow.
- Data uji dibersihkan dari database (0 baris di kuis_hasil, simulasi_hasil, profiles) agar Hari 3 mulai dari kondisi bersih.

---

## Hari 3 — Mode Tamu, Handoff, dan Kirim

### T1 Handoff tamu->login (FR-F12)
- [x] `lib/handoff.js`: simpan/baca/hapus `ts_hasil_tunda` di localStorage (`{ jenis, skenario_id?, skor }`)
- [x] Tombol "Masuk untuk menyimpan" di kuis & simulasi: simpan hasil ke localStorage sebelum redirect ke `/masuk?kembali=...`
- [x] Setelah auth berhasil, baca `ts_hasil_tunda`, insert ke tabel sesuai jenis, hapus kunci, arahkan kembali ke halaman asal yang kini berstatus "Tersimpan"

**Verifikasi T1**: Kuis handoff (1 baris di DB) ✓, Simulasi handoff (1 baris di DB) ✓, "Tersimpan" tampil ✓, double-insert bug terpecahkan (guard `proses` + `handoffRef` + `ambilPulang` fallback di auto-save effects).

### T2 Verifikasi mode tamu penuh (FR-F11)
- [x] Tanpa login: 6 fitur inti dapat dibuka dan dipakai sampai selesai (AC Tamu 1)
- [x] Tamu selesai kuis/simulasi: tidak ada baris baru di `kuis_hasil`/`simulasi_hasil` (AC Tamu 2)
- [x] Ajakan "Masuk untuk menyimpan" tampil setelah tamu selesai (AC Tamu 3)
- [x] Guard `/riwayat` -> `/masuk` (AC Tamu 4); Peringkat tanpa sorotan (AC Tamu 5)

**Verifikasi T2**: Cek Pesan ✓, Simulasi list ✓, Simulasi detail ✓, Kuis ✓, Pustaka ✓, Darurat ✓, Peringkat (view only) ✓. Guard riwayat → masuk ✓. Kuis tamu (0 insert) ✓, Simulasi tamu (0 insert) ✓. "Masuk untuk menyimpan" tampil ✓.

### T3 Uji AC Peralihan Tamu->Login (AC §9)
- [x] Tamu selesai kuis -> "Masuk untuk menyimpan" -> daftar/masuk -> skor otomatis tersimpan -> layar hasil "Tersimpan" (AC Peralihan 1)
- [x] Poin dan level ter-update sesuai hasil yang dibawa (AC Peralihan 2)
- [x] Uji jalur simulasi (dengan skenario_id)

**Verifikasi T3**: Kuis peralihan (1 baris, skor 10, "Tersimpan" ✓, poin 10 di peringkat ✓) ✓, Simulasi peralihan (1 baris, skor 100, "Tersimpan" ✓, poin 100 di peringkat ✓) ✓. AC Peralihan 1-3 semua lulus.

### T4 Akun demo juri + seed data (DATABASE.md §6)
- [x] Daftar akun demo lewat aplikasi (trigger buat profil otomatis)
- [x] Seed hasil kuis (2 baris) + simulasi (4 skenario) lewat SQL Editor
- [x] Verifikasi login demo: Riwayat menampilkan daftar, Peringkat menampilkan posisi (AC Akun Demo 1)
- [x] Catat kredensial demo untuk README

**Verifikasi T4**: Akun demo `demo@juri.com` / `demo123456` dibuat ✓. Seed: 2 kuis (80, 60) + 4 simulasi (kurir-apk:100, hadiah-palsu:75, otp-bank:50, lowongan-palsu:25) ✓. Login demo → Riwayat menampilkan 2 kuis + 4 simulasi + total poin 330 + level Waspada ✓. Peringkat menampilkan posisi Demo Juri ✓.

### T5 Uji RLS + responsif + aksesibilitas
- [x] Uji RLS: dua akun sungguhan, user A tidak bisa baca data user B (AC Riwayat & Peringkat 5)
- [x] Uji responsif 320 / 390 / 768 / 1024 / 1440, 0 overflow horizontal
- [x] Fokus keyboard: tab order logis, target sentuh >= 44px, fokus terlihat
- [x] `prefers-reduced-motion`: transisi dinonaktifkan (DESIGN.md)

**Verifikasi T5**: RLS Riwayat (User B hanya lihat data sendiri: kuis 90 + simulasi 80 ✓) ✓, Peringkat view publik (User B highlighted "(Anda)" ✓) ✓. Responsif: 320/390/768/1024/1440 0 overflow-x ✓. Fokus: `:focus-visible` outline 2px accent ✓, tap targets >=44px ✓. `prefers-reduced-motion` CSS media query added ✓.

### T6 README + TASKS.md + commit + kirim
- [x] Isi README: akun demo, kredensial, catatan keterbatasan (placeholder URL live sampai deploy)
- [x] Verifikasi `.env.example` tanpa nilai rahasia, file SQL ada di repo (AC Akun Demo & Deliverables 3)
- [x] Update TASKS.md: tandai Hari 3 selesai + catatan verifikasi
- [x] Commit + push
- [x] Deploy Vercel: DITUNDA oleh pengguna (README pakai placeholder URL)

**Verifikasi T6**: README terupdate dengan akun demo `demo@juri.com` / `demo123456` ✓, `.env.example` bersih ✓, `supabase/schema.sql` ada di repo ✓. Hari 3 semua task selesai.

---

## Terkendali dan Tertunda (dilarang dikerjakan di v1.0)

- [ ] Login Google · mode gelap · peran admin · validasi skor sisi server · notifikasi · deteksi AI (semua ke rencana pengembangan, PRD §5.2)
- [ ] V10 (seed akun demo) segera setelah auth aplikasi jadi; sisanya checklist V1-V9 sudah lulus
