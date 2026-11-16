# Product Requirements Document (PRD)

## TangkisSiber: Website Latihan dan Edukasi Menangkis Penipuan Digital

| | |
|---|---|
| **Nama Produk** | TangkisSiber |
| **Tagline** | Latihan Menangkis Penipuan Digital |
| **Versi Dokumen** | 2.0 (Versi Production & Rilis Lengkap) |
| **Status** | **Live di Production** — https://tangkissiber.vercel.app |
| **Tanggal Pembaruan** | 16 November 2026 (v1.0: 14 November 2026; v1.2–2.0: 16 November 2026) |
| **Repositori** | https://github.com/Alfifauzan14/tangkissiber |

---

## 1. Ringkasan & Pemahaman Ide

TangkisSiber adalah **web app edukasi interaktif** yang melatih masyarakat mengenali dan menangkis penipuan digital melalui **pembelajaran berbasis latihan (practice-based learning)**, bukan sekadar membaca materi pasif.

**Premis inti produk:** banyak korban penipuan daring tidak tertipu karena tidak peduli, melainkan karena **belum pernah berlatih** menghadapi tekanannya. TangkisSiber menyediakan ruang latihan yang aman dan praktis:

1. **Mengenali modus** melalui **Pustaka Modus** (12 artikel modus penipuan digital terkini).
2. **Berlatih menghadapi pelaku** melalui **Simulasi Chat** interaktif bergaya percakapan ponsel.
3. **Menguji pemahaman** melalui **Kuis Anti Penipuan** berpola kategori & mode fokus.
4. **Memeriksa pesan atau tautan sungguhan** lewat **Cek Pesan** berbasis AI Google Gemini dengan fallback mesin aturan lokal.
5. **Mengetahui langkah penyelamatan cepat** lewat halaman **Darurat ("Sudah Terlanjur?")** berisi kontak resmi terverifikasi.

Seluruh fitur latihan inti dapat diakses **tanpa login wajib (Mode Tamu)**. Bagi pengguna yang masuk (email/password atau Google OAuth), progres tersimpan otomatis dengan validasi skor di sisi server, lengkap dengan sistem **poin, level, Riwayat Saya, Peringkat Top 20**, serta **Panel Admin** terpisah untuk pengelolaan pengguna dan konten aplikasi secara dinamis.

---

## 2. Masalah Pengguna

| # | Masalah | Bukti/Penjelasan |
|---|---------|------------------|
| M1 | Korban belum pernah berlatih menghadapi situasi penipuan | Saat pesan "petugas bank" meminta OTP atau kurir mengirim file APK datang, korban panik dan mengikuti instruksi |
| M2 | Materi edukasi yang ada bersifat pasif | Artikel/poster hanya dibaca sekali tanpa melatih pengambilan keputusan di bawah tekanan sosial |
| M3 | Modus terus berevolusi mengikuti konteks lokal | Kurir APK, undangan pernikahan APK, QRIS palsu, AI voice cloning, task scam, hingga phishing instansi |
| M4 | Tidak ada alat cepat berbahasa awam untuk memeriksa pesan/tautan | Pengguna awam kesulitan membedakan domain resmi vs domain lookalike, tautan pendek, dan rekayasa sosial |
| M5 | Korban panik dan tidak tahu urutan penyelamatan saat terlanjur | Tidak tahu harus memutus kontak, memblokir rekening, dan melapor ke kanal resmi mana terlebih dahulu |
| M6 | Motivasi belajar rendah tanpa umpan balik terukur | Tidak ada skor, penjelasan langsung, level kesiapsiagaan, atau papan peringkat |

---

## 3. Target Pengguna

### 3.1 Pengguna Utama
- **Pelajar SMA/SMK dan mahasiswa** — pengguna aktif WhatsApp dan media sosial yang akrab dengan antarmuka chat dan rentan terhadap modus hadiah, lowongan kerja, task scam, maupun tautan phishing.

### 3.2 Pengguna Sekunder
- **Keluarga dan masyarakat umum** yang sering menerima pesan/tautan mencurigakan (kurir paket, undian, pesan mengatasnamakan bank atau instansi).

### 3.3 Konteks Pemakaian
- **Mobile-first & responsif desktop** (nyaman mulai lebar layar `360px` hingga desktop `1280px+`).
- **Bahasa awam** — istilah teknis (phishing, OTP, APK, lookalike domain) selalu dijelaskan secara sederhana dalam bahasa Indonesia.
- **Mode Terang & Mode Gelap** — dapat diganti langsung dari header/drawer dan tersimpan di peramban.

### 3.4 Pengguna Khusus
- **Juri lomba / penguji** — tersedia **Akun Demo User** (`demo@juri.com`) untuk menguji alur pengguna & riwayat tersimpan, serta **Akun Demo Admin** (`admin@tangkissiber.id`) untuk menguji Panel Admin.

---

## 4. Tujuan & Ukuran Keberhasilan

1. Pengguna dapat langsung mencoba seluruh 6 fitur utama **tanpa hambatan login (Mode Tamu)**.
2. Pengguna dapat melatih respons terhadap **4 skenario penipuan utama (masing-masing 5 langkah)** dan **5 paket kuis kategori (total bank 35 soal)**.
3. Pengguna memperoleh analisis cepat atas pesan/tautan sungguhan dengan tingkat risiko yang jelas (`Aman`, `Waspada`, `Bahaya`) beserta disclaimer edukatif.
4. Pengunjung yang sebelumnya berlatih sebagai tamu tidak kehilangan skor terakhir saat memutuskan masuk/daftar (**handoff tamu → login**).
5. Admin dapat memperbarui konten aplikasi (`Pustaka Modus`, `Bank Soal Kuis`, `Skenario Simulasi`, `Panduan Darurat`, `Aturan Cek Pesan`) langsung dari Panel Admin tanpa ubah kode.

---

## 5. Arsitektur Rute & Fitur Lengkap (Versi 2.0)

### 5.1 Peta Rute Aplikasi

| Rute | Jenis | Deskripsi |
|---|---|---|
| `/` | Publik | Beranda (Hero Cyber Ocean, ringkasan fitur, statistik konten, ajakan latihan, Footer dengan tautan Kebijakan Privasi) |
| `/cek-pesan` | Publik | Alat periksa pesan & tautan mencurigakan (`POST /api/cek-pesan`) + 3 contoh cepat (`Kurir APK`, `Minta OTP`, `Undian Palsu`) |
| `/simulasi` | Publik | Daftar 4 skenario simulasi chat interaktif |
| `/simulasi/[skenario]` | Publik | Ruang simulasi chat bergaya ponsel (`kurir-apk`, `hadiah-palsu`, `otp-bank`, `lowongan-palsu`) tanpa header/footer publik |
| `/kuis` | Publik | Pilihan 5 paket kuis + mode fokus ala Duolingo + ringkasan skor gauge SVG |
| `/pustaka` | Publik | Pustaka Modus (12 artikel terkurasi dengan pencarian kata kunci & filter kategori) |
| `/darurat` | Publik | Panduan "Sudah Terlanjur?" langkah berurutan + kanal pelaporan resmi terverifikasi |
| `/peringkat` | Publik | Top 20 pengguna berdasarkan total poin (hanya nama tampil & poin, tanpa email) |
| `/riwayat` | Khusus Login | Daftar riwayat kuis & simulasi, skor terbaik, level, total poin |
| `/masuk` | Publik | Masuk & Daftar (Email/Password + Google OAuth) dengan kartu split tanpa navbar/footer |
| `/auth/callback` | Auth Callback | Penanganan pertukaran kode OAuth Supabase → redirect kembali ke halaman tujuan |
| `/privasi` | Publik | Halaman Kebijakan Privasi resmi TangkisSiber |
| `/admin/masuk` | Auth Admin | Halaman login khusus pengelola/admin |
| `/admin` | Khusus Admin | Panel Admin dengan sidebar 7 menu & tombol `Ke Situs` |

### 5.2 API Endpoints (Next.js App Router)

| Endpoint | Metode | Fungsi |
|---|---|---|
| `/api/cek-pesan` | `POST` | Menganalisis teks/tautan via Google Gemini (`gemini-flash-lite-latest`), fallback otomatis ke mesin aturan lokal (`src/lib/cekPesan.js`) jika API key kosong/gagal |
| `/api/kuis/submit` | `POST` | Memvalidasi jawaban kuis di sisi server terhadap kunci jawaban bank soal, menghitung skor `0–100`, mendeteksi anomali kecepatan/pola (`ai_curiga`), lalu menyimpan ke `kuis_hasil` |
| `/api/simulasi/submit` | `POST` | Memvalidasi pilihan langkah simulasi di sisi server, menghitung skor `0–100`, mendeteksi anomali (`ai_curiga`), lalu menyimpan ke `simulasi_hasil` |
| `/api/admin/verify` | `POST` / `GET` | Verifikasi peran admin dari sesi Supabase untuk akses panel pengelola |

### 5.3 Daftar Fitur Terimplementasi

| # | Fitur | Spesifikasi Terimplementasi |
|---|---|---|
| F1 | **Beranda & Navigasi Adaptif** | Header transparan di atas hero dan solid saat scroll; navigasi desktop + drawer mobile; tombol **Mode Gelap/Terang**; pill profil (nama + total poin), tombol **Panel Admin** otomatis bila `peran === "admin"`, dan tombol **Keluar** yang mengarahkan bersih ke `/` tanpa terjebak loop `/riwayat`. |
| F2 | **Cek Pesan & Tautan** | Tempel teks/tautan atau pilih 3 preset contoh (`Kurir APK`, `Minta OTP`, `Undian Palsu`). Analisis memakai **Google Gemini (`gemini-flash-lite-latest`)** dengan fallback otomatis ke mesin aturan lokal (`src/data/aturan-cek.json` & override `konten_aplikasi`). Menampilkan tingkat risiko (`Aman`, `Waspada`, `Bahaya`), sinyal bahaya berbahasa awam, saran tindakan, sumber analisis (`AI Gemini` / `Aturan Lokal`), dan disclaimer edukasi. Hasil tidak disimpan ke database. |
| F3 | **Simulasi Chat** | **4 skenario** (`kurir-apk`, `hadiah-palsu`, `otp-bank`, `lowongan-palsu`), masing-masing **5 langkah** di dalam frame chat bergaya ponsel dengan area pesan scroll terisolasi, umpan balik langsung di setiap pilihan, skor `0–100` tervalidasi server, dan ringkasan tanda bahaya di akhir. |
| F4 | **Pustaka Modus** | **12 artikel** modus penipuan terkini (termasuk kurir APK, undangan APK, OTP bank, lowongan palsu, hadiah palsu, QRIS palsu, AI voice cloning, task scam, phishing instansi, dll.) dengan pencarian kata kunci, filter kategori, ciri-ciri, contoh pesan, cara kerja, dan langkah pencegahan. |
| F5 | **Kuis Anti Penipuan** | Bank **35 soal** terkurasi yang dapat dimainkan lewat **5 paket kategori** (`Campuran Lengkap` 10 soal, `OTP & Perbankan` 10 soal, `Kurir, APK & Tautan` 10 soal, `Hadiah & Lowongan` 10 soal, dan `Kuis Kilat` 5 soal). Mode fokus ala Duolingo, umpan balik/penjelasan tiap soal, penghitungan skor di server, serta gauge SVG & badge level di layar hasil. |
| F6 | **Halaman Darurat ("Sudah Terlanjur?")** | Langkah penyelamatan cepat berurutan dan daftar kanal pelaporan resmi terverifikasi yang dapat diklik langsung dari ponsel. |
| F7 | **Masuk, Daftar & Google OAuth** | Tab Masuk & Daftar (Email + Password + Nama Tampil) serta tombol **Masuk dengan Google** (Supabase OAuth + `/auth/callback`). Tombol `← Kembali` otomatis mengarah ke `/` jika berasal dari rute berproteksi (`/riwayat` atau `/admin`) agar tidak terjadi redirect loop. |
| F8 | **Riwayat Saya** | Khusus pengguna login; tamu diarahkan ke `/masuk?kembali=/riwayat`. Menampilkan daftar percobaan kuis & simulasi, skor terbaik per kategori, level saat ini, dan total poin. |
| F9 | **Peringkat** | Menampilkan **Top 20** pengguna dari view `peringkat` terurut poin menurun; baris pengguna aktif disorot; tamu hanya melihat tanpa sorotan. Hanya menampilkan `nama_tampil` dan `total_poin` (tanpa email). |
| F10 | **Sistem Poin & Level** | Total poin = skor terbaik kuis (maks 100) + skor terbaik tiap skenario simulasi (4 × 100) → **maksimum 500 poin**. Level: **Pemula** (`< 150`), **Waspada** (`150–349`), **Penangkis** (`350–499`), **Penjaga Siber** (`≥ 500`). |
| F11 | **Mode Tamu & Handoff Skor** | Tamu dapat mencoba semua fitur inti; skor terakhir disimpan sementara di `localStorage` (`src/lib/handoff.js`) saat klik `"Masuk untuk menyimpan"` dan otomatis dikirim ke akun setelah login/daftar berhasil hingga berstatus `"Tersimpan ✓"`. |
| F12 | **Mode Gelap (Dark Mode)** | Tersedia di navbar desktop & drawer mobile, menyimpan preferensi ke `localStorage` dan kelas `.dark` pada `<html>`. |
| F13 | **Panel Admin (`/admin`)** | Akses khusus pengguna dengan `profiles.peran = 'admin'`. Memiliki navigasi sidebar 3 grup & 7 menu: `Ringkasan` (statistik pengguna, kuis, simulasi), `Pengguna & Riwayat` (cari, filter peran, ubah nama tampil, kelola riwayat), dan `Konten Aplikasi` (`Pustaka Modus`, `Bank Soal Kuis`, `Skenario Simulasi`, `Panduan Darurat`, `Aturan Cek Pesan`) yang tersimpan ke tabel `konten_aplikasi`. Tersedia tautan `Ke Situs` dan tombol kembali `Panel Admin` di header publik. |
| F14 | **Kebijakan Privasi (`/privasi`)** | Halaman kebijakan privasi resmi yang ditautkan di footer situs untuk transparansi pengelolaan data akun & kesiapan verifikasi OAuth. |

---

## 6. User Flow Utama

### 6.1 Alur Tamu → Login
> Beranda → pilih fitur (`Cek Pesan` / `Simulasi` / `Kuis` / `Pustaka` / `Darurat` / `Peringkat`) → selesaikan latihan → hasil tampil di layar (tidak masuk DB) → klik **"Masuk untuk menyimpan"** → hasil tersimpan sementara di `localStorage` → login/daftar via `/masuk` → hasil otomatis terkirim ke `/api/kuis/submit` atau `/api/simulasi/submit` → status berubah menjadi **"Tersimpan ✓"**.

### 6.2 Alur Admin
> Buka `/admin/masuk` → login akun admin (`admin@tangkissiber.id`) → masuk ke `/admin` → kelola ringkasan, pengguna, atau konten aplikasi → klik **Ke Situs** untuk meninjau tampilan publik / landing page → klik **Panel Admin** di header untuk langsung kembali ke `/admin`.

---

## 7. Basis Data & Keamanan (Supabase Postgres)

Skema lengkap didefinisikan melalui file SQL di folder `supabase/`:

1. `supabase/schema.sql` — Skema inti: tabel `profiles`, `kuis_hasil`, `simulasi_hasil`, constraint skor `0–100`, index, trigger pembuatan profil otomatis (`handle_new_user`), kebijakan RLS, dan view `peringkat`.
2. `supabase/migration-admin-role.sql` — Penambahan kolom `peran` (`'user'` | `'admin'`) pada `profiles`.
3. `supabase/migration-ai-detection.sql` — Penambahan kolom `ai_curiga` pada `kuis_hasil` dan `simulasi_hasil` untuk menandai anomali pengerjaan.
4. `supabase/migration-admin-crud.sql` — Pembuatan tabel `konten_aplikasi` (`kunci`, `data` JSONB, `updated_at`) dengan RLS baca publik dan tulis khusus admin.
5. `supabase/cleanup-and-seed-demo.sql` — Pembersihan data uji coba dan penyediaan 2 akun demo (`demo@juri.com` dan `admin@tangkissiber.id`).

| Objek Database | Kolom Utama | Kebijakan Akses (RLS) |
|---|---|---|
| `profiles` | `id`, `nama_tampil`, `peran`, `created_at` | Pengguna baca/ubah profil sendiri; Admin kelola pengguna |
| `kuis_hasil` | `id`, `user_id`, `skor` (`0–100`), `ai_curiga`, `created_at` | Pengguna hanya baca/tambah milik sendiri |
| `simulasi_hasil` | `id`, `user_id`, `skenario_id`, `skor` (`0–100`), `ai_curiga`, `created_at` | Pengguna hanya baca/tambah milik sendiri |
| `konten_aplikasi` | `kunci`, `data` (`jsonb`), `updated_at` | Baca publik (`SELECT`); tulis khusus admin |
| `peringkat` (view) | `id`, `nama_tampil`, `total_poin` | Terbuka untuk publik **tanpa mengekspos email** |

---

## 8. Non-Functional Requirements

| Kategori | Implementasi |
|---|---|
| **Responsivitas** | Mobile-first Tailwind CSS v4, fungsional dari lebar `~360px` hingga desktop. |
| **Performa** | Default konten dibaca cepat dari JSON lokal (`src/data/*`) dengan override dinamis opsional dari Supabase `konten_aplikasi`; klien auth dimuat efisien. |
| **Keamanan & Privasi** | RLS aktif di semua tabel; view `peringkat` bebas email; validasi kunci jawaban kuis & simulasi dilakukan di API route server; tidak ada `service_role` key atau `GEMINI_API_KEY` yang terekspos ke bundle klien. |
| **Reliabilitas AI** | Jika `GEMINI_API_KEY` tidak diatur, kuota habis, atau API gagal, `/api/cek-pesan` otomatis fallback ke mesin aturan lokal tanpa error ke pengguna. |
| **Maintainability** | Seluruh modul konten terpisah dari komponen UI dan dapat diperbarui melalui file JSON di `src/data/` maupun langsung dari Panel Admin. |

---

## 9. Akun Demo & Kredensial Pengujian

| Peran | Email | Password | Keterangan |
|---|---|---|---|
| **Demo User (Juri)** | `demo@juri.com` | `demo123456` | Berisi riwayat awal 3 percobaan kuis (70, 80, 90) & 4 skenario simulasi (75, 80, 85, 90) = **420 poin (Level Penangkis)** |
| **Demo Admin** | `admin@tangkissiber.id` | `admin123456` | Akses penuh Panel Admin (`/admin`) dan pintasan `Panel Admin` di header |

---

## 10. Keterbatasan yang Dicatat

1. **Cek Pesan adalah alat bantu edukasi, bukan jaminan keamanan 100%.** Pesan penipuan yang sangat canggih bisa lolos, dan pesan sah bisa tertandai. Pengguna tetap wajib melakukan verifikasi ke kanal resmi instansi terkait.
2. **Kontak darurat** diverifikasi dari sumber resmi saat penyusunan konten; pengguna dianjurkan memeriksa kembali kanal resmi terbaru sebelum melapor.
3. **Google OAuth (`Masuk dengan Google`)** pada mode *Testing* hanya mengizinkan akun Gmail yang terdaftar sebagai *Test users* pada Google Cloud Console sampai verifikasi aplikasi eksternal Google selesai dipublikasikan; login **Email & Password** tetap terbuka penuh untuk seluruh pengguna dan juri.
