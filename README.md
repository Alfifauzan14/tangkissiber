# TangkisSiber

**Latihan Menangkis Penipuan Digital**

TangkisSiber adalah platform web edukasi interaktif yang melatih masyarakat mengenali dan menangkis penipuan digital melalui **pembelajaran berbasis latihan**, bukan sekadar membaca artikel pasif. Pengguna dapat memeriksa pesan atau tautan mencurigakan dengan bantuan AI, berlatih menghadapi pelaku lewat simulasi percakapan ala chat, menguji pemahaman melalui kuis kategori, mempelajari berbagai modus penipuan lokal, hingga melihat langkah penyelamatan darurat beserta kanal pelaporan resmi.

---

## Link Website Live

- **Production URL:** https://tangkissiber.vercel.app

---

## Daftar Fitur

1. **Cek Pesan & Tautan (`/cek-pesan`)**  
   Tempel teks pesan atau tautan mencurigakan (atau coba 3 contoh cepat: *Kurir APK*, *Minta OTP*, *Undian Palsu*). Pesan dianalisis menggunakan **Google Gemini (`gemini-flash-lite-latest`)** dengan fallback otomatis ke mesin aturan lokal (`src/data/aturan-cek.json`), menghasilkan tingkat risiko (**Aman / Waspada / Bahaya**), alasan berbahasa awam, saran tindakan, serta disclaimer edukatif.
2. **Simulasi Chat Interaktif (`/simulasi`)**  
   **4 skenario** percakapan berbalas bergaya aplikasi pesan ponsel (*Kurir dan APK*, *Hadiah Palsu*, *Petugas Bank Minta OTP*, *Lowongan Kerja Palsu*), masing-masing **5 langkah** dengan umpan balik langsung di setiap pilihan, validasi skor di server (`0–100`), dan ringkasan tanda bahaya di akhir.
3. **Kuis Anti Penipuan (`/kuis`)**  
   Bank **35 soal** terkurasi yang dikemas dalam **5 paket kategori** (*Campuran Lengkap*, *OTP & Perbankan*, *Kurir, APK & Tautan*, *Hadiah & Lowongan*, dan *Kuis Kilat*). Dilengkapi mode fokus bebas distraksi, penjelasan langsung tiap jawaban, validasi jawaban di sisi server, serta skor gauge SVG dan level.
4. **Pustaka Modus (`/pustaka`)**  
   **12 artikel modus penipuan digital terkini** lengkap dengan fitur pencarian kata kunci, filter kategori, ciri-ciri pelaku, contoh pesan asli, cara kerja penipu, dan langkah pencegahan.
5. **Halaman Darurat — "Sudah Terlanjur?" (`/darurat`)**  
   Panduan langkah penyelamatan cepat yang berurutan saat sudah terlanjur tertipu, disertai daftar kontak dan kanal pelaporan resmi yang dapat langsung diklik dari ponsel.
6. **Peringkat & Sistem Poin Level (`/peringkat`)**  
   Papan peringkat **Top 20** berdasarkan total poin (maksimum **500 poin**: skor terbaik kuis maks 100 + skor terbaik 4 skenario simulasi maks 400). Level: **Pemula** (`< 150`), **Waspada** (`150–349`), **Penangkis** (`350–499`), dan **Penjaga Siber** (`≥ 500`). Halaman peringkat hanya menampilkan nama tampilan dan poin tanpa mengekspos email.
7. **Riwayat Saya (`/riwayat`)**  
   Khusus pengguna login; menampilkan seluruh daftar percobaan kuis dan simulasi, skor terbaik per kategori, level saat ini, dan total poin.
8. **Mode Tamu & Handoff Skor Otomatis**  
   Semua fitur latihan inti dapat dicoba **tanpa wajib login**. Saat tamu selesai mengerjakan kuis/simulasi dan menekan **"Masuk untuk menyimpan"**, hasil terakhir disimpan sementara di peramban dan otomatis disimpan ke akun setelah masuk atau mendaftar.
9. **Autentikasi, Mode Gelap & Kebijakan Privasi (`/masuk`, `/privasi`)**  
   Mendukung login/daftar Email & Password serta Google OAuth (`/auth/callback`), pergantian tema Terang/Gelap yang tersimpan di peramban, dan halaman Kebijakan Privasi di `/privasi`.
10. **Panel Admin (`/admin`, `/admin/masuk`)**  
    Dashboard terpisah khusus peran `admin` dengan navigasi sidebar untuk melihat ringkasan statistik, mengelola pengguna & riwayat, serta mengedit konten aplikasi secara dinamis (`Pustaka Modus`, `Bank Soal Kuis`, `Skenario Simulasi`, `Panduan Darurat`, dan `Aturan Cek Pesan`). Dilengkapi pintasan `Ke Situs` ↔ `Panel Admin` di header.

---

## Teknologi yang Dipakai

| Lapisan | Teknologi |
|---|---|
| **Framework & UI** | Next.js `16.4.6` (App Router, JavaScript), React `19.3.0`, Tailwind CSS `v4` (mobile-first, light & dark mode) |
| **Backend & Database** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — Postgres, Row Level Security (RLS), Auth (Email/Password + Google OAuth) |
| **AI & API Server** | Next.js Route Handlers (`/api/cek-pesan`, `/api/kuis/submit`, `/api/simulasi/submit`, `/api/admin/verify`) & Google Gemini API (`gemini-flash-lite-latest`) |
| **Konten Aplikasi** | JSON terkurasi di `src/data/` (`soal.json`, `modus.json`, `darurat.json`, `aturan-cek.json`, `skenario/*.json`) dengan override dinamis di tabel `konten_aplikasi` |
| **Pengujian** | Playwright (`1.64.1`) |
| **Hosting & CI/CD** | Vercel (https://tangkissiber.vercel.app) & GitHub |

---

## Cara Menjalankan di Komputer Sendiri

```bash
# 1. Clone repository
git clone https://github.com/Alfifauzan14/tangkissiber.git
cd tangkissiber

# 2. Pasang dependensi
npm install

# 3. Salin .env.example menjadi .env.local lalu isi nilainya
#    (Windows PowerShell: copy .env.example .env.local)
#    (macOS/Linux     : cp .env.example .env.local)
#
#    Variabel wajib:
#    NEXT_PUBLIC_SUPABASE_URL=https://<ref-proyek>.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_proyek_anda>
#
#    Variabel opsional:
#    GEMINI_API_KEY=<api_key_gemini_anda>          # tanpa ini, /cek-pesan pakai aturan lokal
#    SUPABASE_SERVICE_ROLE_KEY=<service_role_key>   # hanya untuk skrip seed lokal

# 4. Jalankan server pengembangan
npm run dev
```

Buka `http://localhost:3000` di peramban.

> File [`.env.example`](.env.example) sudah tersedia di root repository **tanpa nilai rahasia**.

---

## Cara Menyiapkan Supabase

Seluruh skrip SQL sudah disertakan di folder [`supabase/`](supabase):

1. Buat project baru di [supabase.com](https://supabase.com) (paket gratis sudah mencukupi).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan file SQL berikut secara berurutan:
   - [`supabase/schema.sql`](supabase/schema.sql) — membuat tabel inti (`profiles`, `kuis_hasil`, `simulasi_hasil`), constraint skor `0–100`, index, trigger pembuatan profil otomatis, kebijakan Row Level Security (RLS), dan view `peringkat`.
   - [`supabase/migration-admin-role.sql`](supabase/migration-admin-role.sql) — menambahkan kolom `peran` (`user` / `admin`) pada tabel `profiles`.
   - [`supabase/migration-ai-detection.sql`](supabase/migration-ai-detection.sql) — menambahkan kolom deteksi anomali `ai_curiga` pada tabel hasil kuis & simulasi.
   - [`supabase/migration-admin-crud.sql`](supabase/migration-admin-crud.sql) — membuat tabel `konten_aplikasi` beserta kebijakan RLS baca publik dan tulis khusus admin.
   - [`supabase/cleanup-and-seed-demo.sql`](supabase/cleanup-and-seed-demo.sql) — *(opsional untuk demo/lomba)* membersihkan data uji coba serta membuat 2 akun demo (`demo@juri.com` dan `admin@tangkissiber.id`) beserta riwayat awal.
3. Di dashboard Supabase, buka **Authentication → Sign In / Providers** dan matikan **Confirm email** bila ingin pendaftaran email langsung aktif untuk demo (dan aktifkan provider **Google** bila ingin menguji Google OAuth).
4. Salin **Project URL** dan **anon key** dari **Project Settings → API** ke dalam `.env.local` (atau Environment Variables di Vercel).

---

## Akun Demo (untuk Juri)

| Peran | Email | Password | Keterangan Data Awal |
|---|---|---|---|
| **Demo User** | `demo@juri.com` | `demo123456` | Berisi 3 riwayat kuis (`70`, `80`, `90`) & 4 skenario simulasi (`75`, `80`, `85`, `90`) dengan total **420 poin (Level Penangkis)** |
| **Demo Admin** | `admin@tangkissiber.id` | `admin123456` | Dapat login lewat [`/admin/masuk`](https://tangkissiber.vercel.app/admin/masuk) untuk mengakses Panel Admin dan mengelola pengguna/konten |

---

## Sumber Library

- [Next.js](https://nextjs.org/docs) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) & [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Material Symbols Rounded](https://fonts.google.com/icons) (ikon UI)
- [Poppins](https://fonts.google.com/specimen/Poppins) (tipografi)
- [Playwright](https://playwright.dev/) (pengujian end-to-end)

---

## Catatan Keterbatasan

- **Alat Cek Pesan (`/cek-pesan`) adalah alat bantu edukasi, bukan jaminan keamanan 100%.** Baik analisis AI maupun mesin aturan lokal dapat keliru menandai pesan sah atau melewatkan modus penipuan baru yang sangat canggih. Selalu verifikasi langsung melalui kanal resmi instansi terkait sebelum mengklik tautan atau memberikan data apa pun.
- Kontak darurat dan kanal pelaporan pada halaman `/darurat` disusun dari sumber resmi saat penulisan konten; selalu pastikan ulang ke situs/call center resmi terbaru sebelum bertindak.
- Untuk kemudahan demo lomba, konfirmasi email dapat dinonaktifkan di Supabase Auth, dan fitur **Masuk dengan Google** dalam mode *Testing* hanya dapat digunakan oleh akun Gmail yang terdaftar sebagai *Test users* sebelum verifikasi aplikasi eksternal Google dipublikasikan (login **Email & Password** tetap tersedia untuk semua pengguna).
