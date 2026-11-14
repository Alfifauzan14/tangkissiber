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
- [ ] **Deploy skeleton ke Vercel di hari ini** (mitigasi risiko integrasi R7)
- [ ] Commit awal ke GitHub (docs + schema + scaffold)

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

## Hari 2 — Fitur Inti

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

---

## Hari 3 — Mode Tamu, Handoff, dan Kirim

- [ ] Mode tamu penuh: semua fitur inti terbuka, hasil tidak tersimpan, ajakan "Masuk untuk menyimpan"
- [ ] Handoff tamu->login via localStorage `ts_hasil_tunda` (1 hasil terakhir) -> "Tersimpan ✓"
- [ ] Akun demo juri: daftar lewat aplikasi, seed hasil (DATABASE.md §6), uji login demo
- [ ] Uji seluruh acceptance criteria PRD §9, termasuk uji RLS dengan dua akun sungguhan
- [ ] Uji responsif 320 / 390 / 768 / 1024 / 1440 + fokus keyboard + `prefers-reduced-motion`
- [ ] README lengkap sesuai PRD §12 (nama, tagline, link live, fitur, teknologi, cara jalan, cara Supabase, akun demo, sumber library, keterbatasan)
- [ ] Finalisasi deploy Vercel (domain live), `.env` production
- [ ] Kirim

---

## Terkendali dan Tertunda (dilarang dikerjakan di v1.0)

- [ ] Login Google · mode gelap · peran admin · validasi skor sisi server · notifikasi · deteksi AI (semua ke rencana pengembangan, PRD §5.2)
- [ ] V10 (seed akun demo) segera setelah auth aplikasi jadi; sisanya checklist V1-V9 sudah lulus
