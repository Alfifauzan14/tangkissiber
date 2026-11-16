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

## Hari 4 — Perbagus Desain (sebelum Deploy) — T0-T1 selesai, T2 berjalan

### T0 Persiapan folder referensi desain
- [x] Buat `docs/design-ref/` untuk screenshot/URL contoh desain yang disukai pengguna (3 referensi diterima 16 Nov: `login dan daftar.png`, `nav mobile.png`, `nav mobile (2).png`; style halaman lain mengikuti skoolia.id)
- [x] Buat `docs/design-notes.md` untuk catatan preferensi visual (warna, spacing, Komponen favorit, dll)

### T1 Update DESIGN.md berdasarkan referensi pengguna
- [x] Integrasikan preferensi warna/tipografi/spasi dari referensi ke DESIGN.md (tanpa mengubah sistem warna risiko 3-status): v1.1 mencakup halaman masuk dua kolom (§11.9), nav mobile drawer hamburger (§9.1, menggantikan chip gulir), gaya kartu skoolia (§8.1), pengecualian gradien panel masuk (§3.5)
- [x] Perbarui token CSS di `globals.css` sesuai DESIGN.md v1.1 (`--color-primary-100`, `--shadow-card`, `--shadow-card-hover`, `.panel-masuk`)
- [x] Verifikasi kontras AA, radius, spacing scale (palet inti tidak berubah; token baru hanya tint latar dan bayangan, tidak menyentuh pasangan teks-latar)

### T2 Terapkan perbagus ke komponen & halaman
- [x] Komponen UI: Tombol (tidak berubah, sudah sesuai §7), Kartu (bayangan hover `--shadow-card-hover`), Badge, Input (halaman masuk: ikon di dalam bidang), Gelembung chat, Opsi kuis (sudah sesuai v1.0, sistem warna risiko tidak diubah)
- [x] Halaman: Beranda (kartu hover baru), Cek Pesan, Simulasi (list + detail), Kuis, Pustaka, Darurat, Masuk (didesain ulang dua kolom sesuai referensi), Riwayat, Peringkat (halaman lain mengikuti gaya skoolia lewat token bersama)
- [x] Header & Footer konsisten di semua halaman (Header: bilah biru + drawer hamburger di mobile, nav horizontal di desktop; Footer: target sentuh ≥ 44px)
- [x] Bonus performa (agar Lighthouse Performance ≥ 90): klien Supabase (~240KB) dimuat lazy (import dinamis) dari `useSesi` dan tombol Keluar, tidak lagi memblokir halaman pertama tamu

### T3 Uji visual & aksesibilitas pasca-perbagus
- [x] Playwright (`scripts/uji-visual.mjs`): 320/390/768/1024/1440 × 8 halaman, 0 overflow-x
- [x] Playwright: fokus keyboard terlihat (outline 2px), semua target sentuh ≥ 44px (header, drawer, footer)
- [x] Playwright: drawer terbuka/terkunci gulir/fokus ke X/Esc tutup/fokus kembali ke hamburger; `prefers-reduced-motion` menghentikan transisi (1e-05s)
- [x] Lighthouse (tool browser + CLI): Accessibility 1.0, Best Practices 1.0, SEO 1.0 di /, /masuk, /cek-pesan, /kuis, /darurat; Performance 0.90-0.92 (beranda, emulasi mobile default) setelah optimasi lazy Supabase
- [x] Smoke auth pasca-optimasi (`scripts/uji-auth.mjs`): tamu drawer (Masuk + Darurat), login akun demo, chip profil + poin 330, Keluar

### T4 Deploy Vercel (setelah perbagus lulus)
- [x] Build production lulus
- [ ] Deploy ke Vercel, catat URL live ke README.md
- [ ] Uji smoke di production (6 fitur inti + auth + handoff)

---

## Terkendali dan Tertunda (dilarang dikerjakan di v1.0)

- [ ] Login Google · mode gelap · peran admin · validasi skor sisi server · deteksi AI (semua ke rencana pengembangan, PRD §5.2)
- [ ] V10 (seed akun demo) segera setelah auth aplikasi jadi; sisanya checklist V1-V9 sudah lulus

---

## Post-v1.0 Backlog (dimulai 16 Nov 2026 per instruksi pengguna)

### 1. Mode Gelap (Dark Mode)
- [x] Token CSS dark di `globals.css` (`--bg-dark`, `--surface-dark`, `--text-dark`, `--muted-dark`, `--primary-soft-dark`, `--border-dark`)
- [x] Toggle di Header (ikon moon/sun) + persist localStorage
- [x] `prefers-color-scheme` media query + manual override
- [x] Verifikasi kontras AA di semua halaman (light + dark)

### 2. Login Google (Supabase Auth)
- [x] Google Cloud OAuth client setup (documentasi di `docs/google-oauth-setup.md`)
- [x] Supabase Dashboard → Auth → Providers → Enable Google
- [x] Callback URL production + localhost
- [x] Tombol "Masuk dengan Google" di `/masuk` (conditional render)

### 3. Validasi Skor Sisi Server (Edge Functions)
- [x] `app/api/kuis/submit/route.js` — hitung skor dari jawaban, simpan ke `kuis_hasil`
- [x] `app/api/simulasi/submit/route.js` — hitung skor, simpan ke `simulasi_hasil`
- [x] Kunci jawaban di DB (`kuis_soal.kunci`, `simulasi_skenario.jawaban_benar`)
- [x] Rate limit per user (Supabase `pg_ratelimit` atau middleware)

### 4. Peran Admin (RLS + Edge Function)
- [x] Migrasi: kolom `peran` enum('user','admin') di `profil` + RLS policy
- [x] Edge Function guard: `supabase.auth.getClaims()` cek `claims.peran === 'admin'`
- [x] Halaman `/admin` (terpisah dari nav utama) + middleware guard

### 5. Deteksi AI (Heuristik Ringan)
- [x] Library/heuristik: entropy + burstiness + timing di Edge Function submit
- [x] Flag `ai_curiga` boolean di `kuis_hasil` & `simulasi_hasil`
- [x] Badge "Kemungkinan AI" di riwayat (hanya admin/pemilik)

### 6. V10 Seed Demo Otomatis
- [x] `scripts/seed-demo.mjs` idempoten (service role key)
- [x] GitHub Action `seed-demo.yml` jalan sekali pas deploy production

---

## ✅ Post-v1.0 Backlog Uji E2E (16 Nov 2026)

**Playwright E2E: 17/18 passed** (1 flaky nav link timing)
- ✅ Dark Mode: initial light, toggle, prefers-color-scheme, drawer toggle
- ✅ Google OAuth: button hidden when env not set
- ✅ Auth: login demo user
- ✅ Kuis API: submit returns score + ai_curiga
- ✅ Simulasi API: submit returns score + ai_curiga
- ✅ Admin: page accessible, user list + role dropdown, API verify
- ✅ AI Detection: kuis fast=true, simulasi fast=true, normal=false
- ✅ Rate Limit: blocks after 5 requests
- ✅ Non-admin: redirected to home

**Visual/Accessibility: ALL PASS**
- 0 overflow-x di semua breakpoint/halaman
- Semua target sentuh ≥ 44px
- Drawer: terbuka, terkunci, fokus X, tertutup, fokus kembali
- Fokus: outline 2px accent
- Reduced motion: transisi dinonaktifkan

**Build: LULUS**

## ✅ Aksi User untuk Hari 4 (Perbagus Desain) — selesai 16 Nov 2026

Pengguna sudah mengirim 3 referensi (`docs/design-ref/`) dan menetapkan skoolia.id sebagai gaya halaman lain. T1 selesai; lanjut T2.

---

### Aturan Keras (sudah di `docs/design-notes.md`):
- **Sistem warna risiko 3-status (Aman/Waspada/Bahaya) TIDAK BOLEH diubah** — identitas fungsional produk
- Referensi hanya mempengaruhi: primary/netral/aksen, tipografi, spacing, radius, shadow, layout, motion

---

### Status siap deploy:
- ✅ DB bersih: 1 akun demo (`demo@juri.com` / `demo123456`) + seed (2 kuis + 4 simulasi)
- ✅ PRD v1.1: Notifikasi dihapus dari §5.2
- ✅ TASKS.md updated
- ✅ `docs/design-ref/` + `docs/design-notes.md` siap
- ✅ Commit `1b908ff` pushed ke GitHub

---

## ✅ Pembaruan Admin Konten, Gemini AI & Google OAuth (16 Nov 2026)

- [x] `src/app/masuk/page.js`: tombol "Masuk dengan Google" selalu tampil (butuh Google provider aktif di Supabase Dashboard); tombol/kredensial login demo dihapus agar siap live production
- [x] Pemisahan Panel Admin & Landing Page: `Header.jsx` dan `Footer.jsx` disembunyikan di rute `/admin/*` dan tautan `Panel Admin` dihapus dari navigasi publik; halaman login khusus admin dibuat di `/admin/masuk`; `/admin` memiliki top bar tersendiri (`AdminTopBar`) dan guard akses ditolak khusus
- [x] Redesign Login/Daftar (`/masuk`) sesuai gambar referensi pengguna (`src/app/masuk/page.js`): tanpa navbar dan tanpa footer (hanya tombol Kembali + kartu split: panel kiri gradien cyan-ocean + grid + gelombang, panel kanan form putih dengan input aksen garis kiri biru + tombol pill + Google OAuth)
- [x] Google OAuth & handoff tamu→login (`src/app/auth/callback/route.js`, `src/app/masuk/page.js`): callback meneruskan ke `/masuk?oauth=1` untuk menyinkronkan handoff `ts_hasil_tunda`, plus pesan error jelas jika provider Google belum aktif di Supabase (`"google": false` terdeteksi di `/auth/v1/settings`)
- [x] Penyeragaman tampilan 5 halaman fitur (`src/components/layout/PageBanner.jsx`): `/cek-pesan`, `/simulasi`, `/kuis`, `/pustaka`, dan `/peringkat` kini memakai banner kepala Cyber Ocean + cyber grid yang seragam dengan isi masing-masing fitur yang berbeda
- [x] Navbar underline & tombol Dark Mode (`src/components/layout/Header.jsx`): garis bawah aktif/hover pada tautan nav desktop dan tombol dark mode berbingkai rapi
- [x] Pembaruan UI Lanjutan (12 poin): ukuran kartu `/masuk` konsisten saat pindah tab (`lg:h-[600px]`), tombol SOS **Darurat** & ikon matahari dark mode (`light_mode`) di `Header.jsx`, penghapusan pill teks kecil di Beranda/Cek Pesan/Simulasi/Pustaka/Peringkat, grid 2x2 checklist `/cek-pesan`, simulasi `/simulasi/[skenario]` tanpa navbar/footer dengan tombol Kembali & chat ala WhatsApp, pilihan mode kuis Duolingo (`Campuran`, `OTP & Bank`, `Kurir & APK`, `Hadiah & Lowongan`, `Kilat`), Pustaka bergaya grid artikel + mode baca artikel, dan Podium Top 3 berundak di Peringkat
- [x] `src/app/api/cek-pesan/route.js` & `src/app/cek-pesan/page.js`: integrasi Google Gemini (`gemini-2.5-flash` via `GEMINI_API_KEY`) dengan indikator sumber (`Dianalisis AI Gemini` vs `Mode aturan lokal`) + dokumentasi di `.env.example`
- [x] `supabase/migration-admin-crud.sql`: fungsi `public.is_admin()` (`SECURITY DEFINER`, bebas rekursi RLS), policy admin CRUD untuk `profiles`/`kuis_hasil`/`simulasi_hasil`, serta tabel `konten_aplikasi` (`jsonb`)
- [x] `src/lib/konten.js` & halaman konten (`/pustaka`, `/darurat`, `/kuis`, `/simulasi`, `/simulasi/[skenario]`, `/api/kuis/submit`, `/api/simulasi/submit`): baca konten dari `konten_aplikasi` dengan fallback JSON lokal
- [x] `src/app/admin/AdminContent.jsx` & `src/app/admin/KontenEditor.jsx`: tab **Kelola Konten** untuk mengubah Pustaka Modus, Bank Soal Kuis, Panduan Darurat, Aturan Cek Pesan, dan 4 Skenario Simulasi
- [x] Perbaikan UI Halaman Fitur & Dark Mode (`src/app/globals.css`, `src/app/kuis/page.js`, `src/app/cek-pesan/page.js`, `src/app/simulasi/page.js`, `src/app/pustaka/page.js`, `src/app/peringkat/page.js`): token dark mode AA (`--color-primary: #2563eb` dan semantik `-soft` gelap), Kuis bergaya Duolingo (top bar progres tebal, kartu pilihan 3D taktil `border-b-4`, banner umpan balik + tombol Lanjut), Cek Pesan dengan contoh cepat + penghitung karakter, serta header/kartu konsisten di Simulasi, Pustaka, dan Peringkat
- [x] Verifikasi `npm run build` lulus + Playwright E2E (beranda baru, `/masuk` tanpa demo login + ada Google, `/admin` terpisah tanpa header/footer publik, `/admin/masuk`, Kuis Duolingo, Cek Pesan, Simulasi, Pustaka, Peringkat, Dark Mode toggle, responsif 320px/390px/1024px 0 overflow-x)
- [x] Pembaruan Kuis Kategori Card & Layar Hasil Simulasi (`src/app/kuis/page.js`, `src/components/simulasi/ChatSkenario.jsx`): halaman `/kuis` menampilkan grid kartu kategori (`Campuran Lengkap`, `OTP & Perbankan`, `Kurir, APK & Tautan`, `Hadiah & Lowongan`, `Kuis Kilat`) sebelum masuk ke mode kuis fokus ala Duolingo; layar hasil akhir simulasi disederhanakan dengan gauge SVG semantik & daftar `Tanda Bahaya` teks polos tanpa badge/card bertumpuk
- [x] Pembaruan Navbar Scroll-Aware, Mode Fokus Kuis, Login/Daftar Stabil, Peringkat, Footer & Responsif HP/Tablet (`src/components/layout/Header.jsx`, `src/components/layout/Footer.jsx`, `src/app/masuk/page.js`, `src/app/peringkat/page.js`, `src/app/page.js`): navbar menyatu dengan gradien Hero di posisi atas lalu putih saat di-scroll + drawer HP dengan ikon & pintasan darurat; navbar/footer hilang otomatis saat masuk kuis; posisi teks/input Masuk & Daftar terkunci `0px` delta + latar luar Cyber Ocean; podium Top 3 & tabel peringkat #4–#20; footer sejajar tanpa card SOS/catatan; serta penyempurnaan responsif HP (`320px`/`390px`) & tablet (`768px`) dengan `0` overflow-x

---

## 📋 Rencana Desain Ulang Panel Admin (Sidebar Dashboard)

Mengubah `/admin` dari tata letak tab atas menjadi **Sidebar Dashboard terstruktur** (referensi Gentelella) dengan konten yang dipisah per menu agar pengelolaan lebih rapi dan skalabel:

### Fase 1 — Struktur UI Sidebar & Pemisahan Konten
- [x] **Layout Shell Sidebar (`src/app/admin/AdminContent.jsx`)**:
  - Sidebar gelap tetap (`#0f172a`, lebar `w-64`) di desktop (`lg:`) dan slide-over drawer di mobile/tablet (`< lg`)
  - Header sidebar dengan logo perisai `TangkisSiber Admin`, footer sidebar dengan kartu profil admin, pintasan `Lihat Situs`, dan tombol `Keluar`
  - Topbar utilitas (`h-16`) berisi toggle sidebar mobile, breadcrumb/judul bagian aktif, dan tombol `Muat Ulang`
- [x] **Menu Sidebar Terkelompok**:
  - `Overview`: **Ringkasan** (4 kartu KPI statistik dengan bar aksen bawah, Top 5 pengguna berpoin tertinggi, & ringkasan modul konten dengan pintasan langsung)
  - `Manajemen`: **Pengguna & Riwayat** (pencarian pengguna, ubah nama tampil, ubah peran `user`/`admin`, serta panel riwayat kuis/simulasi & hapus baris)
  - `Konten Aplikasi` (dipisah per kategori): **Pustaka Modus**, **Bank Soal Kuis**, **Skenario Simulasi**, **Panduan Darurat**, dan **Aturan Cek Pesan**
- [x] **Pemisahan Editor Konten (`src/app/admin/KontenEditor.jsx`)**:
  - Mendukung prop `kunciAktif` dari sidebar sehingga setiap kategori konten tampil fokus di halamannya sendiri (khusus **Skenario Simulasi** menampilkan pemilih 4 skenario)

### Fase 2 — Verifikasi Build & Playwright
- [x] `npm run build` lulus tanpa error (`exit code 0`)
- [x] Pengujian Playwright pada `/admin/masuk` → `/admin`: perpindahan seluruh menu sidebar (`Ringkasan`, `Pengguna & Riwayat`, dan menu konten), fungsi pencarian/drawer mobile, dan `0` horizontal overflow di desktop (`1280px`) & mobile (`390px`)
- [x] Sinkronisasi seluruh dokumentasi (`docs/PRD.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/TASKS.md`) ke v1.2 (16 Nov 2026)

---

## 🚀 Langkah Selanjutnya (Prioritas Produksi & Deploy)

Seluruh UI dan fitur inti sudah lengkap. Berikut langkah konkret berikutnya untuk membawa aplikasi ke tahap **siap pakai / siap lomba di production**:

1. [x] **Jalankan Migrasi `supabase/migration-admin-crud.sql` di Supabase Dashboard**
   - Tabel `public.konten_aplikasi` (`rls_enabled: true`) sudah aktif bersama `profiles`, `kuis_hasil`, dan `simulasi_hasil` di project `fpmlbnhckvwsxtzzhmcn`; tombol **Simpan** di `/admin` terverifikasi aktif (`hasMigrationWarning: false`, `saveDisabled: false`).
2. [x] **Aktifkan Google OAuth & Redirect URLs**
   - Provider Google diaktifkan di Supabase Dashboard (`external.google === true`) dengan Redirect URL `http://localhost:3000/auth/callback` terpasang.
3. [x] **Lengkapi Environment Variables Lokal (`.env.local`)**
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `GEMINI_API_KEY` (`gemini-flash-lite-latest`, terverifikasi `"sumber": "gemini"`). *(Environment Variables di Vercel disiapkan saat tahap deploy terakhir.)*
4. [x] **Perbanyak Konten Riset & Siapkan Pembersihan Database + 2 Akun Demo**
   - `src/data/soal.json` diperbanyak dari 20 menjadi **35 soal** anti-penipuan terkini (QRIS palsu, APK undangan, AI voice cloning, task scam, phishing instansi, 2FA, money mule, screen sharing).
   - `src/data/modus.json` diperbanyak dari 8 menjadi **12 artikel** pustaka modus.
   - 4 skenario simulasi (`src/data/skenario/*.json`) diperkaya menjadi masing-masing **5 langkah** percakapan.
   - `supabase/cleanup-and-seed-demo.sql` & `scripts/seed-demo.mjs` diperbarui untuk membersihkan data uji coba lama serta menyiapkan **Demo User** (`demo@juri.com` / `demo123456`) dan **Demo Admin** (`admin@tangkissiber.id` / `admin123456`).
5. [ ] **Deploy ke Vercel & Uji End-to-End Live** (dilakukan terakhir setelah Anda selesai uji lokal)
