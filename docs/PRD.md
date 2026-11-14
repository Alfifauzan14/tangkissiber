# Product Requirements Document (PRD)

## TangkisSiber: Website Latihan dan Edukasi Menangkis Penipuan Digital

| | |
|---|---|
| **Nama Produk** | TangkisSiber |
| **Tagline** | Latihan Menangkis Penipuan Digital |
| **Versi Dokumen** | 1.0 (Disetujui) |
| **Status** | **Disetujui** — disetujui pemilik produk pada 14 November 2026; §11 disetujui tanpa perubahan |
| **Tanggal** | 14 November 2026 |
| **Batas Waktu Pengiriman** | 3 hari sejak dokumen ini disetujui |
| **Repo** | https://github.com/Alfifauzan14/tangkissiber.git |

---

## 1. Ringkasan & Pemahaman Ide

TangkisSiber adalah **web app edukasi interaktif** yang melatih pengguna mengenali dan menangkis penipuan digital melalui **pembelajaran berbasis latihan**, bukan sekadar membaca materi.

**Premis inti produk:** banyak korban penipuan online tidak tertipu karena tidak peduli, melainkan karena **belum pernah berlatih** menghadapi situasinya. TangkisSiber menjawabnya dengan memberi tempat berlatih yang aman:

1. **Mengenali modus** melalui Pustaka Modus,
2. **Berlatih** melalui simulasi percakapan seperti aplikasi chat,
3. **Diujis** melalui kuis,
4. **Memeriksa** pesan atau tautan sungguhan lewat alat cek berbasis aturan,
5. **Tahu langkah penyelamatan** lewat halaman darurat.

Progres pengguna disimpan dan dapat dibandingkan melalui **sistem poin, level, dan peringkat**. Aplikasi responsif (mobile-first), dapat dipakai tanpa login (mode tamu), dan menyimpan progres bagi yang login.

**Konteks pengembangan:** project ini dibuat untuk **lomba dengan tenggat 3 hari**, sehingga ruang lingkup versi 1.0 harus tetap ketat mengikuti spesifikasi yang telah disepakati dan tidak boleh melebar.

---

## 2. Masalah Pengguna

| # | Masalah | Bukti/Penjelasan |
|---|---------|------------------|
| M1 | Korban belum pernah berlatih menghadapi situasi penipuan | Ketika pesan "petugas bank" minta OTP datang, korban tidak punya pengalaman menolak — panik dan mengikuti instruksi |
| M2 | Materi edukasi yang ada bersifat pasif | Artikel dan video hanya dibaca/ditonton; tidak melatih pengambilan keputusan di bawah tekanan |
| M3 | Modus terus berubah dan menyesuaikan konteks lokal | Kurir APK, hadiah palsu, OTP bank, lowongan kerja palsu — korban tidak mengenali ciri-cirinya |
| M4 | Tidak ada alat cepat untuk memeriksa pesan/tautan mencurigakan | Pengguna awam tidak tahu cara mengecek tautan pendek, domain palsu, dsb. |
| M5 | Korban panik dan tidak tahu langkah pertama saat sudah terlanjur | Tidak tahu harus blokir rekening, laporkan ke mana, atau urutan langkahnya |
| M6 | Motivasi belajar rendah tanpa umpan balik dan progres | Tidak ada skor, level, atau pembanding yang membuat latihan terasa berdampak |

---

## 3. Target Pengguna

### 3.1 Pengguna Utama
- **Pelajar SMA/SMK dan mahasiswa** — kelompok yang aktif di WhatsApp dan media sosial, rentan terhadap modus hadiah/kurir/lowongan kerja, dan terbiasa dengan aplikasi chat.

### 3.2 Pengguna Sekunder
- **Keluarga dan masyarakat umum** yang sering menerima pesan atau tautan mencurigakan, terutama lewat WhatsApp dan media sosial.

### 3.3 Konteks Pemakaian
- Melalui **HP (mobile-first)**.
- **Tanpa keahlian teknis** — semua bahasa harus awam.

### 3.4 Pengguna Khusus
- **Juri lomba** — menggunakan akun demo untuk mencoba fitur penyimpanan progres tanpa harus mendaftar.

### Persona ringkas

**Rara (17, pelajar SMK):** menerima link "menang undian" di WhatsApp group. Ingin tahu apakah itu penipuan, tapi tidak tahu cara mengeceknya. Punya HP, tidak punya keahlian teknis.

**Bapak Hendra (45, orang tua Rara):** sering menerima pesan "kurir" yang minta pasang APK. Tidak mau register akun apa pun — mau langsung coba.

**Juri Lomba:** ingin melihat seluruh fitur dalam waktu singkat, termasuk bukti bahwa data tersimpan (riwayat, peringkat) — menggunakan akun demo.

---

## 4. Tujuan Produk

### 4.1 Tujuan Produk
1. Membuat pengguna **terlatih** menghadapi 4 modus penipuan utama melalui simulasi interaktif.
2. Memberi **alat bantu edukasi** untuk memeriksa pesan dan tautan sungguhan secara instan.
3. Menyediakan **panduan darurat** yang jelas dan berurutan dengan kontak resmi terverifikasi.
4. Mendorong pengulangan latihan melalui **poin, level, dan peringkat**.
5. Menyediakan **mode tamu tanpa hambatan** — semua fitur inti bisa dicoba tanpa login.

### 4.2 Ukuran Keberhasilan (untuk konteks lomba)
- Juri dapat mencoba **seluruh fitur** dalam < 10 menit tanpa bantuan.
- Alur tamu → daftar → skor tersimpan → muncul di peringkat, berjalan mulus tanpa error.
- Akun demo juri berfungsi dan memiliki beberapa hasil yang sudah tersimpan.

---

## 5. Ruang Lingkup: Fitur

### 5.1 Fitur Utama (P0 — harus ada di versi 1.0)

| # | Fitur | Ringkasan |
|---|-------|-----------|
| F1 | **Beranda & Navigasi** | Landing dengan pilihan 6 fitur; menu menampilkan nama, level, dan Riwayat Saya saat login |
| F2 | **Cek Pesan** | Tempel pesan/tautan → analisis rule-based → tingkat risiko, alasan awam, saran tindakan, disclaimer |
| F3 | **Simulasi Chat** | UI seperti aplikasi chat; 4 skenario; pilih respons per langkah; umpan balik langsung; skor + ringkasan tanda bahaya di akhir |
| F4 | **Pustaka Modus** | 8 kartu modus; pencarian dan filter; ciri-ciri, contoh pesan, cara kerja, apa yang dilakukan |
| F5 | **Kuis** | 10 soal acak dari bank 20; penjelasan per jawaban; skor dan level di akhir |
| F6 | **Halaman Darurat ("Sudah Terlanjur?")** | Langkah cepat berurutan + kontak/kanal pelaporan resmi terverifikasi |
| F7 | **Masuk / Daftar** | Email + password + nama tampil; konfirmasi email mati (demo); tombol keluar |
| F8 | **Riwayat Saya** | Khusus login: daftar hasil kuis & simulasi, skor terbaik, level, total poin |
| F9 | **Peringkat** | Top 20 berdasarkan total poin; posisi pengguna disorot; tamu hanya melihat |
| F10 | **Poin & Level** | Maks 500 poin; 4 level (lihat §7) |
| F11 | **Mode Tamu** | Semua fitur inti bisa dicoba; hasil tidak disimpan; ajakan "Masuk untuk menyimpan" |
| F12 | **Peralihan Tamu → Login** | Hasil terakhir dibawa lewat proses masuk dan otomatis tersimpan; status "Tersimpan ✓" |
| F13 | **Akun Demo Juri** | Berisi beberapa hasil; kredensial di README dan proposal |

### 5.2 Fitur Tambahan (di luar versi 1.0 — dilarang dikerjakan saat ini)

Fitur berikut **sengaja ditunda** ke rencana pengembangan (tercatat agar tidak dianggap lupa):

- Login Google
- Mode gelap
- Peran admin
- Validasi skor di sisi server
- Notifikasi
- Deteksi berbasis AI pada Cek Pesan

---

## 6. User Journey & User Flow

### 6.1 Journey Tamu

> Beranda → pilih fitur (Cek Pesan / Pustaka / Darurat / Simulasi / Kuis / Peringkat) → pakai fitur → hasil tampil di layar (**tidak tersimpan**) → ajakan "Masuk untuk menyimpan".

Halaman Riwayat Saya yang dibuka oleh tamu mengarahkan ke halaman Masuk.

### 6.2 Journey Daftar & Masuk

> Klik Masuk → pilih tab **Masuk** atau **Daftar** → isi data (nama tampil, email, password untuk daftar) → akun dan profil otomatis terbentuk → langsung masuk → **kembali ke halaman sebelumnya**.

### 6.3 Journey Pengguna Login

> Masuk → menu menampilkan nama, level, dan Riwayat Saya → pakai fitur → skor **otomatis tersimpan** setelah simulasi/kuis selesai → poin naik hanya bila melampaui rekor sebelumnya → lihat Riwayat Saya dan Peringkat.

### 6.4 Journey Peralihan Tamu → Login

> Selesai kuis sebagai tamu → klik "Masuk untuk menyimpan" → hasil disimpan sementara di browser → masuk atau daftar berhasil → skor otomatis tersimpan → layar hasil berstatus **"Tersimpan ✓"**.

### 6.5 Diagram Alur Utama

```
                 ┌──────────────┐
                 │   Beranda    │
                 └──────┬───────┘
      ┌─────────┬───────┼────────┬──────────┬──────────┐
      ▼         ▼       ▼        ▼          ▼          ▼
  Cek Pesan  Pustaka  Darurat  Simulasi    Kuis     Peringkat
      │         │       │        │          │          │
      ▼         ▼       ▼        ▼          ▼          ▼
   Hasil     Kartu   Langkah  Skor +     Skor +     Top 20
   (layar)   modus   resmi    ringkasan  level      (lihat saja
      │                        │          │        jika tamu)
      └────────────┬───────────┴──────────┘
                   ▼
        [Tamu] "Masuk untuk menyimpan"
                   │
                   ▼
          Masuk / Daftar ──► hasil tamu otomatis tersimpan
                   │
                   ▼
        [Login] Riwayat Saya + Peringkat + poin naik
```

---

## 7. Functional Requirements

Penomoran: `FR-<fitur>-<nn>`. Setiap butir adalah kebutuhan wajib versi 1.0 kecuali dinyatakan lain.

### 7.1 Beranda & Navigasi (F1)
- **FR-F1-01** Beranda menampilkan judul/tagline dan kartu pintasan ke 6 fitur: Cek Pesan, Pustaka, Darurat, Simulasi, Kuis, Peringkat.
- **FR-F1-02** Menu/header menampilkan tombol Masuk (tamu), atau nama + level + tautan Riwayat Saya + tombol Keluar (login).
- **FR-F1-03** Semua halaman dapat diakses dari navigasi di semua ukuran layar (mobile-first).

### 7.2 Cek Pesan (F2) — rule-based, hasil tidak disimpan untuk siapa pun
- **FR-F2-01** Pengguna menempel teks pesan **dan/atau** tautan, lalu menekan tombol periksa.
- **FR-F2-02** Analisis pesan mendeteksi sinyal: (a) nada mendesak/batas waktu, (b) permintaan OTP/PIN/password, (c) iming-iming hadiah, (d) permintaan transfer/uang, (e) ajakan memasang APK.
- **FR-F2-03** Analisis tautan mendeteksi: (a) tautan pendek (shortener), (b) alamat berbentuk IP, (c) tanpa HTTPS, (d) subdomain berlebihan, (e) karakter `@`, (f) domain yang menyerupai merek (lookalike).
- **FR-F2-04** Hasil menampilkan **tingkat risiko**: **Aman / Waspada / Bahaya**, beserta **alasan dalam bahasa awam** untuk setiap sinyal yang terdeteksi, dan **saran tindakan**.
- **FR-F2-05** Hasil selalu disertai **disclaimer**: ini alat bantu edukasi, bukan jaminan 100%.
- **FR-F2-06** Aturan cek disimpan sebagai data aturan yang dapat diperbarui tanpa mengubah logika halaman.

### 7.3 Simulasi Chat (F3)
- **FR-F3-01** Tampilan menyerupai aplikasi chat: gelembung pesan penipu, waktu berjalan, dan pilihan respons pengguna di setiap langkah.
- **FR-F3-02** Tersedia **4 skenario**: (1) kurir & APK, (2) hadiah palsu, (3) "petugas bank" minta OTP, (4) lowongan kerja palsu.
- **FR-F3-03** Setiap pilihan respons langsung mendapat **umpan balik** (benar/berisiko/bahaya + penjelasan singkat).
- **FR-F3-04** Di akhir skenario: **skor 0–100** dan **ringkasan tanda bahaya** yang muncul di percakapan.
- **FR-F3-05** Skenario dan pohon percakapan disimpan sebagai JSON di dalam repo.

### 7.4 Pustaka Modus (F4)
- **FR-F4-01** Menampilkan **8 kartu modus** dalam layout kartu yang responsif.
- **FR-F4-02** Setiap kartu berisi: **ciri-ciri**, **contoh pesan**, **cara kerja penipu**, dan **apa yang sebaiknya dilakukan**.
- **FR-F4-03** Tersedia **pencarian** (kata kunci) dan **filter** (kategori modus).
- **FR-F4-04** Data modus disimpan sebagai JSON di dalam repo.

### 7.5 Kuis (F5)
- **FR-F5-01** Setiap percobaan mengambil **10 soal acak** dari bank **20 soal** (acak penuh tiap sesi, pengulangan soal antar percobaan diizinkan).
- **FR-F5-02** Setiap jawaban langsung ditampilkan **penjelasannya** (benar/salah + mengapa).
- **FR-F5-03** Di akhir kuis: **skor 0–100** dan **level** pengguna.
- **FR-F5-04** Soal, pilihan, jawaban benar, dan penjelasan disimpan sebagai JSON di repo.

### 7.6 Halaman Darurat (F6)
- **FR-F6-01** Halaman berjudul "Sudah Terlanjur?" berisi **langkah cepat berurutan** (mis. jangan kirim uang lagi → blokir rekening → laporkan → ubah sandi).
- **FR-F6-02** Menampilkan **kontak dan kanal pelaporan resmi** yang telah diverifikasi dari sumber resmi.
- **FR-F6-03** Kontak tampil sebagai tautan/telepon yang dapat diklik dari HP.

### 7.7 Masuk / Daftar (F7)
- **FR-F7-01** Halaman Masuk memiliki **tab Masuk** dan **tab Daftar**.
- **FR-F7-02** Daftar meminta: **nama tampil**, **email**, **password**.
- **FR-F7-03** Autentikasi memakai **Supabase Auth (email + password)**; konfirmasi email dimatikan untuk demo.
- **FR-F7-04** Setelah daftar/masuk berhasil, pengguna **kembali ke halaman sebelumnya**.
- **FR-F7-05** Tersedia tombol **Keluar**.

### 7.8 Riwayat Saya (F8)
- **FR-F8-01** Hanya untuk pengguna login; tamu diarahkan ke halaman Masuk.
- **FR-F8-02** Menampilkan daftar hasil **kuis** dan **simulasi**, **skor terbaik**, **level**, dan **total poin**.

### 7.9 Peringkat (F9)
- **FR-F9-01** Menampilkan **Top 20** pengguna berdasarkan **total poin** (dari view `peringkat`).
- **FR-F9-02** Posisi pengguna yang sedang login **disorot**.
- **FR-F9-03** Tamu hanya dapat **melihat**, tanpa posisi disorot.
- **FR-F9-04** Yang tampil hanya **nama tampil** dan **poin** — tanpa email (lihat §7.13).

### 7.10 Sistem Poin & Level (F10)
- **FR-F10-01** Total poin = **skor terbaik kuis** (maks 100) + **skor terbaik tiap skenario simulasi** (4 × 100) → **maksimum 500**.
- **FR-F10-02** Poin naik **hanya bila melampaui rekor** sebelumnya (skor terbaik per kategori).
- **FR-F10-03** Level berdasarkan total poin:

| Level | Rentang Poin |
|-------|--------------|
| Pemula | < 150 |
| Waspada | 150–349 |
| Penangkis | 350–499 |
| Penjaga Siber | ≥ 500 |

### 7.11 Mode Tamu (F11)
- **FR-F11-01** Semua fitur inti (Cek Pesan, Pustaka, Darurat, Simulasi, Kuis, Peringkat) **terbuka untuk tamu**.
- **FR-F11-02** Hasil fitur tamu **tidak tersimpan** di database, hanya tampil di layar.
- **FR-F11-03** Setelah tamu menyelesaikan kuis/simulasi, tampil ajakan **"Masuk untuk menyimpan"**.

### 7.12 Peralihan Tamu → Login (F12)
- **FR-F12-01** Hasil terakhir tamu disimpan sementara **di browser** (localStorage) saat menekan "Masuk untuk menyimpan".
- **FR-F12-02** Setelah masuk/daftar berhasil, hasil tersebut **otomatis tersimpan** ke akun.
- **FR-F12-03** Layar hasil berubah status menjadi **"Tersimpan ✓"**.

### 7.13 Basis Data (Supabase Postgres)

3 tabel + 1 view, RLS aktif di semua tabel:

| Objek | Isi |
|-------|-----|
| `profiles` | `id` (sama dengan id user), `nama_tampil`, `created_at` |
| `kuis_hasil` | `id`, `user_id`, `skor` (0–100), `created_at` |
| `simulasi_hasil` | `id`, `user_id`, `skenario_id`, `skor` (0–100), `created_at` |
| `peringkat` (view) | `id`, `nama_tampil`, `total_poin` — **hanya nama tampil dan poin, tanpa email** |

- **FR-F13-01** Skor dibatasi **0–100** lewat constraint database.
- **FR-F13-02** RLS: pengguna hanya bisa **membaca dan menulis datanya sendiri**; view `peringkat` mengekspos hanya nama tampil + poin.
- **FR-F13-03** File SQL untuk menyiapkan seluruh skema (tabel, view, RLS, constraint, trigger pembuatan profil) **disertakan di repo**.

> Validasi penuh skor di sisi server dicatat sebagai **rencana pengembangan** (lihat §5.2).

### 7.14 Teknologi & Arsitektur
- **FR-F14-01** Next.js (App Router) dengan **JavaScript**; Tailwind CSS, mobile-first, responsif.
- **FR-F14-02** **Tidak ada server API khusus**; Supabase dipanggil langsung dari sisi klien.
- **FR-F14-03** Hosting **Vercel**; source code di GitHub (`tangkissiber`, publik).
- **FR-F14-04** Kredensial Supabase di `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`); repo menyediakan `.env.example` **tanpa nilai rahasia**.

### 7.15 Deliverables Lomba (README & lainnya)
- **FR-F15-01** README di repo memuat: nama, tagline, deskripsi singkat; link website live; daftar fitur; teknologi; cara menjalankan (clone, `npm install`, isi `.env.local`, `npm run dev`); cara menyiapkan Supabase (file SQL disertakan); akun demo (email & password); sumber library; catatan keterbatasan (alat cek adalah alat bantu edukasi, bukan jaminan 100%).
- **FR-F15-02** Akun demo juri berisi beberapa hasil dan kredensialnya dicantumkan di README dan proposal.

---

## 8. Non-Functional Requirements

| Kategori | Kebutuhan |
|----------|-----------|
| **Responsivitas** | Mobile-first; tampil dan fungsional mulai dari layar ~360px hingga desktop; semua kontrol mudah disentuh (target sentuh cukup besar) |
| **Kemudahan pakai** | Bahasa sepenuhnya awam (tidak ada istilah teknis tanpa penjelasan); pengguna tanpa keahlian teknis dapat menyelesaikan alur tanpa panduan |
| **Performa** | Konten dibaca dari JSON lokal (tanpa fetch berat); halaman ringan agar nyaman di jaringan HP biasa; gambar seminimal mungkin |
| **Keamanan** | RLS aktif di semua tabel; view peringkat tidak mengekspos email; anon key saja yang masuk bundle klien (tanpa service key); password ditangani Supabase Auth |
| **Privasi** | Data yang dikumpulkan hanya email + nama tampil + skor; peringkat hanya menampilkan nama tampil dan poin |
| **Keandalan** | Kegagalan penyimpanan skor menampilkan pesan kesalahan yang jelas dan tidak merusak alur; percobaan ulang dimungkinkan |
| **Kompatibilitas** | Peramban seluler modern (Chrome, Safari) dan desktop modern |
| **Konsistensi** | Bahasa Indonesia di seluruh UI; terminologi poin/level konsisten di semua halaman |
| **Maintainability** | Konten (modus, skenario, soal, aturan cek) dalam JSON terpisah agar mudah diperbarui tanpa menyentuh komponen UI |

---

## 9. Acceptance Criteria

Kriteria diuji manual di HP (ukuran ~360px) dan desktop. Setiap kriteria wajib lulus sebelum fitur dinyatakan selesai.

### AC — Mode Tamu
1. Tanpa login, semua 6 fitur dapat dibuka dan dipakai sampai selesai.
2. Setelah tamu menyelesaikan kuis/simulasi, hasil hanya tampil di layar; **tidak ada baris baru** di `kuis_hasil`/`simulasi_hasil`.
3. Ajakan "Masuk untuk menyimpan" tampil setelah tamu menyelesaikan kuis/simulasi.
4. Tamu yang membuka Riwayat Saya diarahkan ke halaman Masuk.
5. Tamu dapat melihat Peringkat tanpa baris yang disorot.

### AC — Cek Pesan
1. Menempel pesan dengan nada mendesak + permintaan OTP → hasil **Bahaya** dengan alasan awam yang menyebut kedua sinyal.
2. Menempel tautan pendek tanpa HTTPS → sinyal terdeteksi dan dijelaskan.
3. Hasil selalu menampilkan disclaimer alat bantu edukasi.
4. Hasil pengecekan tidak tersimpan ke database (baik tamu maupun login).

### AC — Simulasi Chat
1. Keempat skenario dapat dimainkan dari awal hingga ringkasan tanpa error.
2. Setiap pilihan respons memunculkan umpan balik sebelum langkah berikutnya.
3. Skor akhir berada dalam rentang 0–100 dan ringkasan tanda bahaya relevan dengan percakapan.
4. Login: skor otomatis tersimpan di `simulasi_hasil` dengan `skenario_id` yang benar; hanya skor yang melampaui rekor yang menaikkan poin.

### AC — Pustaka Modus
1. 8 kartu tampil lengkap (ciri-ciri, contoh pesan, cara kerja, tindakan).
2. Pencarian dengan kata kunci memfilter kartu yang relevan; filter kategori berfungsi.

### AC — Kuis
1. Setiap percobaan menampilkan 10 soal dari bank 20.
2. Penjelasan muncul setiap kali jawaban dipilih.
3. Skor akhir 0–100 + level ditampilkan; login: hasil tersimpan otomatis.

### AC — Darurat
1. Langkah tampil berurutan dan dapat diikuti dari HP.
2. Semua kontak/kanal adalah sumber resmi yang telah diverifikasi dan tautannya dapat diklik.

### AC — Masuk / Daftar
1. Daftar dengan nama tampil + email + password berhasil tanpa konfirmasi email.
2. Profil otomatis terbentuk di `profiles` saat pendaftaran.
3. Setelah berhasil, pengguna kembali ke halaman sebelumnya.
4. Tombol Keluar mengembalikan ke status tamu.
5. Email/password salah menampilkan pesan kesalahan yang jelas.

### AC — Riwayat Saya & Peringkat
1. User login melihat daftar riwayat kuis & simulasi, skor terbaik, level, dan total poin yang konsisten dengan database.
2. Peringkat menampilkan maksimal 20 pengguna terurut poin menurun.
3. Posisi pengguna login disorot bila masuk Top 20.
4. Tidak ada email yang tampil di halaman peringkat.
5. Pengguna lain tidak dapat membaca data riwayat pengguna lain (RLS teruji).

### AC — Peralihan Tamu → Login
1. Tamu menyelesaikan kuis → "Masuk untuk menyimpan" → masuk/daftar → skor otomatis tersimpan → layar hasil berstatus "Tersimpan ✓".
2. Poin dan level ter-update sesuai hasil yang dibawa.

### AC — Akun Demo & Deliverables
1. Akun demo dapat masuk dan menampilkan beberapa riwayat tersimpan.
2. Kredensial demo ada di README dan proposal.
3. Website live di Vercel; README lengkap sesuai daftar di FR-F15-01; `.env.example` ada tanpa nilai rahasia; file SQL ada di repo.

---

## 10. Risiko & Asumsi

### 10.1 Risiko

| ID | Risiko | Dampak | Mitigasi |
|----|--------|--------|----------|
| R1 | **Tenggat 3 hari sangat ketat** untuk 6 fitur + auth + deploy | Tinggi | Ruang lingkup terkunci (tidak ada fitur tambahan); kerjakan P0 saja sesuai urutan §11; deploy Vercel sejak hari pertama agar integrasi teruji awal |
| R2 | Alat cek rule-based bisa salah mengklasifikasi | Sedang | Disclaimer wajib di setiap hasil ("alat bantu edukasi, bukan jaminan 100%"); hasil selalu disertai saran tindakan aman |
| R3 | **Volume konten besar** (20 soal, 8 modus, 4 skenario percakapan, aturan cek) menunda fitur | Tinggi | Tulis konten JSON lebih dulu (hari 1) secara paralel dengan struktur aplikasi; jumlah konten dikunci sesuai spesifikasi, tidak menambah |
| R4 | Kesalahan konfigurasi RLS membocorkan data | Tinggi | File SQL tunggal yang teruji; uji manual: user A tidak bisa baca data user B; view peringkat tanpa email |
| R5 | Kontak darurat tidak akurat/kedaluwarsa | Sedang | Verifikasi manual dari sumber resmi saat penulisan konten; cantumkan sumber |
| R6 | Akun demo kosong saat juri mengecek | Sedang | Seed beberapa hasil ke akun demo sebelum pengiriman; uji login demo |
| R7 | Masalah env/integrasi Vercel ↔ Supabase di saat mepet | Sedang | Setup env + deploy skeleton di jam-jam pertama, bukan di akhir |
| R8 | Konfirmasi email mati menimbulkan akun dengan email palsu | Rendah | Tolerabel untuk konteks demo lomba; dicatat sebagai keterbatasan |

### 10.2 Asumsi

| ID | Asumsi |
|----|--------|
| A1 | Seluruh konten (modus, skenario, soal, kontak darurat, aturan cek) ditulis manual dan berbahasa Indonesia |
| A2 | Data pribadi yang dikumpulkan hanya email + nama tampil + skor; tidak ada PII lain |
| A3 | Skala penggunaan versi 1.0 (demo lomba) kecil; tidak perlu rate limiting atau anti-abuse khusus |
| A4 | Tidak ada kebutuhan internasionalisasi (bahasa Indonesia saja) |
| A5 | Akun Supabase dan Vercel (atau GitHub) sudah tersedia |
| A6 | Konfirmasi email dimatikan hanya untuk keperluan demo lomba |
| A7 | **Keputusan:** handoff tamu→login membawa **hanya 1 hasil percobaan terakhir** (disimpan di localStorage). Alasan: sesuai alur yang disetujui (hasil terakhir), paling sederhana dan andal dalam tenggat 3 hari; membawa banyak hasil menambah kompleksitas tanpa manfaat berarti |

---

## 11. Usulan Rencana Pengerjaan 3 Hari

> Usulan dari PM — menunggu persetujuan pemilik produk. Tidak mengubah ruang lingkup §5.

**Hari 1 — Fondasi & Konten**
- Setup Next.js + Tailwind + Supabase client; deploy skeleton ke Vercel (deploy awal = mitigasi R7).
- Tulis seluruh konten JSON: 8 modus, 20 soal, 4 skenario, aturan cek pesan/tautan, kontak darurat.
- Siapkan SQL Supabase (tabel, view, RLS, constraint) dan jalankan; buat akun demo.
- Bangun Beranda, navigasi, halaman statis (Darurat, Pustaka).

**Hari 2 — Fitur Inti**
- Cek Pesan (rule-based), Simulasi Chat (4 skenario), Kuis (10 dari 20).
- Auth (masuk/daftar/keluar) + profil otomatis.
- Penyimpanan skor + poin/level + Riwayat Saya + Peringkat (Top 20).

**Hari 3 — Mode Tamu, Handoff, dan Kilat Akhir**
- Mode tamu penuh + handoff "Masuk untuk menyimpan" → "Tersimpan ✓".
- Uji seluruh acceptance criteria (§9), termasuk uji RLS antar dua akun.
- Seed akun demo; tulis README lengkap + `.env.example`; finalisasi Vercel; kirim.

---

## 12. Lampiran — Daftar Isi README (syarat lomba)

README wajib memuat: nama/tagline/deskripsi singkat · link website live · daftar fitur · teknologi · cara menjalankan lokal (clone, `npm install`, isi `.env.local`, `npm run dev`) · cara menyiapkan Supabase (file SQL disertakan) · akun demo juri · sumber library · catatan keterbatasan · `.env.example` tanpa nilai rahasia.

---

*Akhir dokumen. Menunggu persetujuan sebelum implementasi dimulai.*
