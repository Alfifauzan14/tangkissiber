# TangkisSiber

**Latihan Menangkis Penipuan Digital**

TangkisSiber adalah website edukasi interaktif yang melatih pengguna mengenali dan menangkis penipuan online. Banyak korban penipuan digital (phishing, tautan palsu, modus hadiah, kurir APK, hingga lowongan kerja palsu) tidak tertipu karena tidak peduli, melainkan karena belum pernah berlatih menghadapi situasinya. TangkisSiber menjawabnya dengan pembelajaran berbasis latihan: mengenali modus, berlatih lewat simulasi percakapan, diuji lewat kuis, memeriksa pesan atau tautan sungguhan, dan tahu langkah yang harus diambil kalau sudah terlanjur. Progres tersimpan dan bisa dibandingkan lewat level dan peringkat.

## Link Website Live

- URL: `https://tangkissiber.vercel.app` *(placeholder; deploy ke Vercel ditunda, lihat bagian Catatan Keterbatasan)*

## Daftar Fitur

1. **Cek Pesan**: tempel pesan atau tautan, dianalisis dengan aturan sederhana, hasil berupa tingkat risiko (Aman / Waspada / Bahaya), alasan dalam bahasa awam, dan saran tindakan.
2. **Simulasi Chat**: 4 skenario percakapan (kurir dan APK, hadiah palsu, petugas bank minta OTP, lowongan kerja palsu) dengan umpan balik langsung, skor, dan ringkasan tanda bahaya.
3. **Pustaka Modus**: 8 kartu modus penipuan dengan pencarian dan filter.
4. **Kuis**: 10 soal acak dari bank 20 soal, penjelasan tiap jawaban, skor, dan level.
5. **Halaman Darurat ("Sudah Terlanjur?")**: langkah cepat berurutan dan kontak pelaporan resmi yang diverifikasi.
6. **Masuk dan Daftar**: email dan password dengan nama tampil; konfirmasi email dimatikan untuk demo.
7. **Riwayat Saya**: riwayat kuis dan simulasi, skor terbaik, level, dan total poin (khusus pengguna login).
8. **Peringkat**: Top 20 pengguna berdasarkan total poin, posisi sendiri disorot; tamu hanya bisa melihat.
9. **Sistem Poin dan Level**: maksimal 500 poin (skor terbaik kuis + skor terbaik tiap skenario). Level: Pemula (< 150), Waspada (150-349), Penangkis (350-499), Penjaga Siber (>= 500).
10. **Mode Tamu**: semua fitur inti bisa dicoba tanpa login; hasilnya tidak disimpan.
11. **Peralihan Tamu ke Login**: hasil terakhir dibawa lewat proses masuk dan otomatis tersimpan ke akun.
12. **Akun Demo Juri**: berisi beberapa hasil tersimpan, kredensial dicantumkan di bagian bawah README ini.

## Teknologi yang Dipakai

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js (App Router, JavaScript), Tailwind CSS (mobile-first) |
| Backend | Supabase (Authentication email + password, Postgres dengan Row Level Security) |
| Konten | File JSON di dalam repo (modus, soal, skenario, aturan cek, kontak darurat) |
| Hosting | Vercel; source code di GitHub |

## Cara Menjalankan di Komputer Sendiri

```bash
# 1. Clone repository
git clone https://github.com/Alfifauzan14/tangkissiber.git
cd tangkissiber

# 2. Pasang dependensi
npm install

# 3. Isi .env.local (salin dari .env.example lalu isi nilainya)
#    NEXT_PUBLIC_SUPABASE_URL=https://<ref-proyek>.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key proyek Anda>

# 4. Jalankan
npm run dev
```

Buka `http://localhost:3000` di peramban.

## Cara Menyiapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (paket gratis sudah cukup).
2. Buka **SQL Editor** di dashboard Supabase.
3. Salin dan jalankan seluruh isi file [`supabase/schema.sql`](supabase/schema.sql) dari repo ini. Satu file tersebut memuat: tabel (`profiles`, `kuis_hasil`, `simulasi_hasil`), index, trigger pembuatan profil otomatis, kebijakan Row Level Security, hak akses, dan view `peringkat`.
4. Di dashboard, buka **Authentication > Sign In / Providers** dan matikan **Confirm email** (untuk demo).
5. Salin **Project URL** dan **anon key** (Project Settings > API) ke `.env.local`.

## Akun Demo (untuk juri)

| | |
|---|---|
| Email | `demo@juri.com` |
| Password | `demo123456` |

Akun demo berisi beberapa hasil kuis (80, 60) dan simulasi (kurir-apk: 100, hadiah-palsu: 75, otp-bank: 50, lowongan-palsu: 25) total poin 330 (Level Waspada). Riwayat Saya dan Peringkat langsung terlihat berisi.

## Sumber Library

- [Next.js](https://nextjs.org/docs) (App Router)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript)
- [Material Symbols Rounded](https://fonts.google.com/icons) (ikon)
- [Poppins](https://fonts.google.com/specimen/Poppins) (huruf)

## Catatan Keterbatasan

- **Alat Cek Pesan adalah alat bantu edukasi, bukan jaminan 100%.** Analisisnya berbasis aturan sederhana, bukan deteksi komprehensif. Pesan penipuan yang canggih bisa lolos dari deteksi, dan pesan sah bisa tertandai. Selalu verifikasi lewat kanal resmi.
- Skor dikirim dari sisi klien dan divalidasi rentang 0-100 di database; validasi penuh di sisi server belum termasuk di versi ini.
- Konfirmasi email dimatikan untuk keperluan demo; siapa pun bisa mendaftar dengan email apa pun.
- Kontak darurat dan kanal pelaporan disalin dari sumber resmi pada saat penulisan konten; verifikasi ulang sebelum bertindak.
