# DESIGN.md

## TangkisSiber: Website Latihan dan Edukasi Menangkis Penipuan Digital

| | |
|---|---|
| **Versi Dokumen** | 1.1 |
| **Status** | **Disetujui** — revisi 16 November 2026 menyetujui tiga referensi visual pengguna |
| **Tanggal** | 16 November 2026 (v1.0: 14 November 2026) |
| **Prasyarat** | PRD v1.1 (Disetujui) |
| **Referensi karakter** | skoolia.id (gaya halaman umum) + `docs/design-ref/` (authoritative untuk halaman masuk dan navigasi mobile) |
| **Filter kualitas** | Taste Skill + Anti-Slop diterapkan pada setiap keputusan |

**Dial desain (Anti-Slop Part 3):** Membaca ini sebagai: web app edukasi interaktif untuk pelajar dan keluarga Indonesia, dengan bahasa visual "ramah tapi tegas", dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

**Riwayat revisi:**
- **v1.1 (16 Nov 2026):** pengguna mengirim tiga referensi visual (`login dan daftar.png`, `nav mobile.png`, `nav mobile (2).png`). Halaman masuk mengikuti referensi dua kolom dengan panel ilustrasi orbit (§11.9); navigasi mobile kembali memakai pola drawer hamburger, menggantikan keputusan chip gulir 14 Nov (§9.1); halaman lain mengikuti karakter gaya skoolia.id. Sistem warna risiko tiga status tetap dijaga (aturan keras `design-notes.md`).
- **v1.0 (14 Nov 2026):** versi awal disetujui.

---

## 0. Cara Referensi Dipakai

skoolia.id dipakai sebagai **arah karakter**, bukan templat yang disalin. Yang diambil dari karakternya: keceriaan edukasi, kepercayaan, keluarga warna biru, tipografi Poppins, radius lembut, panel ilustrasi di halaman masuk. Yang **sengaja dibedakan** supaya TangkisSiber punya identitas sendiri:

| Aspek | skoolia.id | TangkisSiber |
|---|---|---|
| Bahasa warna | Biru sebagai satu-satunya warna | Biru + **sistem warna risiko tiga status** (inti identitas produk) |
| Pola navigasi | Drawer hamburger dengan bilah biru | **Diadopsi dari referensi pengguna** (revisi 16 Nov 2026, menggantikan chip gulir): bilah biru + tombol hamburger, drawer layar penuh berisi daftar halaman (§9.1) |
| Ilustrasi | Orbit ikon produk di panel biru | Bentuk orbit **diadopsi dari referensi**; isi diganti: perisai dan chip tanda bahaya mengelilinginya |
| Panel masuk | Panel gradien biru muda, dua kolom | **Diadopsi dari referensi pengguna** (§11.9); baris "login with" sosial tidak diadopsi karena fitur ditunda PRD §5.2 |
| Suara desain | Lembut, administratif | Tegas, waspada, melatih pengambilan keputusan |

---

## 1. Art Direction

**"Waspada yang ramah."** TangkisSiber bukan situs antivirus yang menakut-nakuti, dan bukan aplikasi permainan yang mengabaikan seriusnya masalah. Karakternya ada di tengah: **hangat dan mudah diikuti seperti aplikasi belajar, tegas dan jelas seperti papan rambu jalan.**

Tiga prinsip arah:

1. **Keputusan lebih penting dari dekorasi.** Setiap layar memusatkan perhatian pada satu hal: pesan yang sedang dicek, percakapan yang sedang dilatih, atau soal yang sedang dijawab. Dekorasi mundur.
2. **Bahasa risiko yang konsisten.** Satu-satunya "ornamen" yang diizinkan berulang adalah kode warna risiko (Aman/Waspada/Bahaya), karena itulah isi produknya. Warna lain tidak berebut peran.
3. **Tenang di permukaan, hidup di interaksi.** Halaman tidak bergerak sendiri. Yang bergerak adalah jawaban pengguna: umpan balik langsung, skor, level yang naik. Energi produk keluar dari umpan balik, bukan dari animasi layar (MOTION 1).

Rasional palet: biru royal dipilih karena referensi dan karena makna psikologisnya: tepercaya, resmi, edukatif. Biru royal (bukan biru-ungu, bukan neon) menjauhkan produk dari kesan "AI default" sekaligus menjaga keterbacaan di layar HP di bawah sinar matahari.

---

## 2. Visual Identity

### 2.1 Motif identitas (diulang di seluruh produk)

**Motif: gelembung percakapan "tertangkis".** Bentuk gelembung chat dengan satu sudut yang tidak membulat (sudut bawah kiri untuk penipu, bawah kanan untuk pengguna) dipakai sebagai bahasa visual di luar halaman chat: di empty state, di kartu modus sebagai tempat "contoh pesan", di panel halaman masuk. Bentuk yang sama, makna yang sama: *ini tentang percakapan yang bisa menyelamatkan Anda.*

**Sistem warna risiko tiga status** adalah identitas fungsional produk: hijau (Aman), amber (Waspada), merah (Bahaya). Ketiganya hanya boleh muncul untuk makna risiko/status, tidak pernah dekoratif.

### 2.2 Logo

> Menunggu persetujuan pemilik produk (belum ada instruksi aset final, mengikuti aturan placeholder jujur).

- **Proposal:** wordmark "TangkisSiber" (Poppins Bold, ink navy) + chip perisai kecil biru royal di sebelah kiri.
- Placeholder yang jujur sampai disetujui: **wordmark teks saja**, tanpa ikon buatan.

### 2.3 Ilustrasi

Satu keluarga ilustrasi saja: **SVG garis-garis sederhana warna biru royal di atas panel biru muda**, bertema percakapan dan perisai. Tidak ada ilustrasi stok (Undraw/Storyset terlarang), tidak ada karakter blob 3D. Panel halaman masuk memakai komposisi orbit referensi: perisai di pusat dalam lingkaran biru, chip tanda bahaya (OTP, hadiah, APK, transfer) mengelilinginya pada lingkaran konsentris bergaris tipis (disetujui via referensi 16 Nov 2026; SVG tetap digambar sendiri, bukan aset stok).

### 2.4 Ikon

**Material Symbols Rounded, gaya fill, bobot 500**, ukuran 20-24px. Alasan: goresan tebal tetap terbaca pada ukuran kecil di layar HP, tersedia lengkap dan gratis, dan bentuknya membulat cocok dengan radius lembut produk. Dilarang: ikon sparkle/star/magic/lightning/robot, dan dilarang memakai ikon yang tidak relevan dengan isinya. Bila tidak ada ikon yang pas, lebih baik tanpa ikon.

---

## 3. Color Palette

Maksimal 3 warna inti + 1 aksen (kepatuhan Anti-Slop R-29). Netral tidak dihitung.

### 3.1 Warna inti

| Token | Hex | Peran | Alasan |
|---|---|---|---|
| `--ink` | `#15162A` | Teks utama, heading | Navy tinta dari referensi; kontras tinggi di latar terang |
| `--primary` | `#01239C` | Tombol utama, tautan, status aktif | Biru royal: tepercaya, resmi, edukatif (karakter referensi) |
| `--primary-soft` | `#EEF2FF` | Latar panel/tint, hover sekunder | Tint biru untuk luas permukaan tanpa bersaing dengan primary |

### 3.2 Aksen tunggal

| Token | Hex | Peran | Alasan |
|---|---|---|---|
| `--accent` | `#2E95FF` | Fokus ring, indikator kecil, sorot halus | Biru terang yang hanya dipakai hemat: pemandu perhatian, bukan dekorasi |

### 3.3 Warna semantik risiko (bagian identitas, bukan dekorasi)

| Status | Teks/ikon | Latar tint | Pemakaian |
|---|---|---|---|
| Aman | `#15803D` | `#DCFCE7` | Hasil cek aman, jawaban benar |
| Waspada | `#B45309` | `#FEF3C7` | Hasil cek waspada, jawaban berisiko |
| Bahaya | `#B91C1C` | `#FEE2E2` | Hasil cek bahaya, jawaban salah, error |

**Aturan pakai:** warna semantik hanya menyentuh badge status, garis tepi kiri kartu hasil, opsi kuis, dan pesan error/berhasil. Dilarang untuk tombol dekoratif, heading, atau latar halaman.

### 3.4 Netral

| Token | Hex | Peran |
|---|---|---|
| `--bg` | `#F8FAFC` | Latar halaman |
| `--surface` | `#FFFFFF` | Kartu, input, panel |
| `--border` | `#E2E8F0` | Garis pembatas 1px |
| `--text-muted` | `#64748B` | Teks sekunder (kontras ≥ 4.5:1 di surface, sesuai R-25) |

Dilarang: gradien biru-ungu, glow, skema ungu-hitam, palet pastel neon, dan pola grid/dot sebagai latar (kegagalan R-01/R-07). Dilarang ungu dalam bentuk apa pun (aturan Taste Skill). **Dua pengecualian dari referensi 16 Nov 2026:** (1) gradien biru-ke-biru-muda hanya pada panel ilustrasi halaman masuk (§3.5), (2) pola grid samar hanya di belakang ikon masuk (§11.9).

### 3.5 Gradien panel masuk (pengecualian tunggal)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--primary-100` | `#DBEAFE` | Ujung atas dan bawah gradien panel masuk |

Panel ilustrasi halaman masuk memakai `linear-gradient(180deg, #DBEAFE, #EEF2FF)`; lingkaran pusat orbit memakai `--primary` sebagai titik warna paling kuat di panel. Token `--primary-100` ditambahkan ke `globals.css`. Di luar panel ini, gradien tetap terlarang.

---

## 4. Typography

| Peran | Font | Alasan |
|---|---|---|
| Heading dan UI | **Poppins** (600, 700) | Keluarga huruf dari referensi; geometris dan bersahabat, cocok untuk pelajar; satu keluarga saja menjaga konsistensi dan beban unduhan kecil |
| Body | **Poppins** (400, 500) | Satu keluarga untuk seluruh UI; di body memakai ukuran yang cukup besar agar tetap nyaman dibaca |

- Skala (mobile-first): `h1` 28/36, `h2` 24/32, `h3` 20/28, `body` 16/24, `small` 14/20, `caption` 12/16. Desktop: h1 naik ke 40/48.
- Lebar baris maksimal **68 karakter** untuk paragraf panjang.
- **Dilarang:** huruf monospace besar, label KAPITAL dengan letter-spacing lebar, dan pemakaian font tanpa alasan tertulis.
- Angka skor dan poin memakai fitur tabular (`font-variant-numeric: tabular-nums`) agar tidak bergoyang saat berubah.

---

## 5. Spacing System

Skala 4px, dipilih agar ritme sisa udara terasa konsisten di semua layar:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

| Token | Nilai | Pemakaian |
|---|---|---|
| `space-1` | 4px | Celah mikro (ikon-teks) |
| `space-2` | 8px | Celah dalam komponen |
| `space-3` | 12px | Padding input, celah antar item list |
| `space-4` | 16px | Padding kartu di mobile, jarak antar elemen standar |
| `space-5` | 20px | Gutter halaman mobile |
| `space-6` | 24px | Jarak antar kartu, gutter tablet |
| `space-8` | 32px | Jarak antar bagian kecil, gutter desktop |
| `space-10` | 40px | Padding kartu di desktop |
| `space-12` | 48px | Jarak antar bagian di mobile |
| `space-16` | 64px | Jarak antar bagian di desktop |

- Kontainer: maksimal **1120px**, gutter 20px (mobile), 24px (tablet), 32px (desktop).
- Teks jarak sentuh minimal 44px tinggi targetnya (R-03).
- Dilarang padding seragam tanpa alasan; jarak menyatakan hierarki: anak 8-12px, saudara 24px, bagian 48-64px.

---

## 6. Border Radius

Radius lembut seperti referensi, tetapi **dengan skala dan tujuan** (Anti-Slop R-11: tidak semua elemen pil):

| Token | Nilai | Pemakaian |
|---|---|---|
| `radius-sm` | 8px | Chip/badge kecil, thumbnail |
| `radius-md` | 12px | **Tombol, input, select** |
| `radius-lg` | 16px | **Kartu** |
| `radius-xl` | 24px | Panel besar, modal, panel ilustrasi halaman masuk |
| `full` | 9999px | Hanya untuk: avatar, titik indikator, dot status |

**Aturan:** tombol tidak pil (12px, bukan 9999px); input mengikuti tombol (12px) agar pasangan label-input terlihat satu keluarga; kartu lebih membulat dari isinya; gelembung chat memakai pengecualian motif: tiga sudut 16px, satu sudut 4px (sudut "ekor" percakapan).

---

## 7. Button Styles

Empat gaya saja. Satu pasangan bentuk, satu skala ukuran.

| Gaya | Bentuk | Pemakaian |
|---|---|---|
| **Primary** | Latar `--primary`, teks putih, `radius-md`, tinggi 48px (mobile) / 44px (desktop) | Satu aksi utama per layar: "Periksa Pesan", "Kirim Jawaban", "Masuk" |
| **Tonal** | Latar `--primary-soft`, teks `--primary`, tanpa garis tepi | Aksi kedua: "Coba Skenario Lain", "Lihat Pustaka" |
| **Ghost** | Tanpa latar, teks `--text-muted`, teks jadi `--primary` saat hover | Aksi tersier: "Nanti saja", tautan batal |
| **Danger** | Latar `#B91C1C`, teks putih | Hanya aksi merusak/menetapkan status: konfirmasi keluar akun |

**Interaksi (aturan Taste Skill):** hover = warna sedikit menggelap + naik 2px; klik = turun kembali (scale 0.98); fokus keyboard = ring `--accent` 2px dengan offset 2px (R-32); nonaktif = opasitas 0.5 + `cursor: not-allowed`.

**Dilarang:** panah (→/↗) sebagai identitas semua tombol, glow pada tombol, tombol pil, dan lebih dari satu tombol primary dalam satu layar.

Label tombol: **kata kerja + objek**, spesifik konteks. "Periksa Pesan", "Simpan Skor", bukan "Get Started"/"Learn More" (R-15).

Di halaman masuk/daftar, tombol primary membentang penuh selebar form, seperti referensi (§11.9).

---

## 8. Card Styles

Dua keluarga kartu, bukan grid kartu kembar (R-14):

### 8.1 Kartu permukaan (standar)
Latar `--surface`, garis `--border` 1px, `radius-lg`, padding 16px (mobile) / 24px (desktop), bayangan **satu tingkat saat diam** (`--shadow-card` = `0 1px 2px rgba(21,22,42,0.06)`) dan hanya untuk kartu yang bisa diklik. Kartu tertaut saat hover naik 2px dan bayangan menguat satu tingkat ke `--shadow-card-hover` (`0 12px 28px -10px rgba(21,22,42,0.18)`): kesan kedalaman kartu skoolia.id yang dibuat lebih tenang (MOTION 1). Foto/ilustrasi di dalam kartu tertaut membesar maksimal 1.02 saat hover, terpotong oleh frame-nya.

### 8.2 Kartu hasil risiko (kartu khas produk)
Struktur berbeda dari kartu standar: **garis tebal 4px di tepi kiri dengan warna status**, latar tint status yang sangat lembut, judul status besar ("Bahaya"), daftar alasan sebagai butir pendek, lalu blok "Saran tindakan" dengan latar surface. Hierarkinya jelas: status dulu, alasan kemudian, tindakan terakhir.

### 8.3 Aturan variasi
- Kartu fitur beranda: ikon + judul + satu kalimat; ukuran mengikuti isinya, bukan seragam paksa.
- Kartu modus (Pustaka): bisa diperluas; contoh pesan tampil **di dalam gelembung chat motif**, bukan blok kutipan biasa.
- Kartu peringkat: baris ringkas dengan nomor posisi; posisi pengguna disorot latar `--primary-soft`.
- Dilarang: bento grid penuh, kartu kembar identik tanpa alasan hierarki, kartu di dalam kartu lebih dari dua lapis.

---

## 9. Navigation

### 9.1 Mobile (utama, ≤ 767px) — revisi 16 Nov 2026: drawer hamburger (referensi `nav mobile.png` + `nav mobile (2).png`)

- **Header bilah biru, menempel saat digulir (sticky), tinggi 56px:** wordmark "TangkisSiber" putih di kiri; kanan tombol hamburger kotak membulat (radius-sm, latar putih 15% transparan, ikon putih) yang membuka drawer.
- **Drawer layar penuh** menutupi seluruh viewport saat terbuka:
  - **Bar biru di atas (56px):** wordmark putih + tombol X kotak putih dengan ikon `--primary` (radius-sm).
  - **Daftar halaman** di atas latar `--surface`: satu baris per tujuan (**Beranda, Cek Pesan, Simulasi, Kuis, Pustaka, Peringkat**), teks Poppins 600 `--ink`, tinggi sentuh 52px, garis `--border` 1px antar baris. Halaman yang sedang dibuka ditandai teks `--primary`.
  - **Bagian bawah drawer:** baris tegas "Sudah Terlanjur?" berwarna `#B91C1C` (pintasan darurat), lalu tombol "Masuk" (tamu) atau chip avatar + nama + "Keluar" (login).
- Drawer terbuka dengan fade 200ms (berhenti total saat `prefers-reduced-motion`); gulir latar halaman terkunci selama drawer terbuka; menutup lewat tombol X atau tombol Esc; fokus kembali ke tombol hamburger saat drawer tertutup (aksesibilitas).
- **Pustaka, Darurat, Peringkat** juga ditonjolkan sebagai kartu pintasan di Beranda.
- Konten halaman tidak pernah tersembunyi di belakang navigasi; header menempel sehingga pintasan drawer selalu terjangkau.
- Halaman masuk/daftar memakai header ringkas khusus (§9.5), bukan header utama.

### 9.2 Desktop (≥ 1024px)

Header satu baris memuat: logo kiri, nav horizontal (Beranda, Cek Pesan, Simulasi, Kuis, Pustaka, Peringkat), kanan: "Sudah Terlanjur?" sebagai tautan tegas berwarna `#B91C1C` (masuk akal: pintasan darurat), lalu tombol "Masuk" atau chip profil.

### 9.3 Aturan
- Setiap tautan nav punya halaman nyata (R-24). Tidak ada nav item untuk fitur yang belum ada.
- Drawer hamburger di mobile (§9.1, referensi pengguna); desktop menampilkan semua tujuan langsung tanpa hamburger (§9.2).
- Tidak ada tab bar bawah: navigasi seluruhnya di header atas.

### 9.4 Footer (revisi 14 Nov 2026)
Satu bagian saja di semua halaman, ringkas dan tidak mengulang halaman:
- Kiri: wordmark + satu kalimat misi + tautan tegas "Sudah terlanjur?" berwarna `#B91C1C` ke halaman darurat.
- Kanan: tautan nav ringkas (Cek Pesan, Simulasi, Kuis, Pustaka, Peringkat).
- Bawah, di atas garis: disclaimer 12px `--text-muted`: TangkisSiber alat bantu edukasi, bukan jaminan keamanan dan bukan kanal pelaporan resmi; laporan lewat kanal resmi di halaman darurat. Lalu baris hak cipta.
- Latar `--surface`, garis atas `--border` 1px, tanpa kolom berlebihan dan tanpa newsletter.

### 9.5 Header halaman masuk (revisi 16 Nov 2026, referensi `login dan daftar.png`)

Halaman masuk dan daftar memakai header ringkas khusus, bukan header utama: logo (ikon + wordmark) di kiri atas, tanpa nav dan tanpa tombol "Masuk" (pengguna sudah berada di sana). Mobile: bilah biru penuh dengan wordmark putih, konsisten dengan header drawer. Desktop: latar transparan, ikon biru + wordmark `--ink`.

---

## 10. Responsive Design

Mobile-first, dari 320px.

| Breakpoint | Target | Perubahan kunci |
|---|---|---|
| `< 640px` (dasar) | HP 320-639 | 1 kolom; tombol full-width; header bilah biru + drawer hamburger (§9.1); panel ilustrasi masuk disembunyikan, form satu kolom |
| `640-767px` | HP besar | Sama, gutter 24px |
| `768-1023px` | Tablet | Kartu fitur 2 kolom; kuis dan simulasi tetap 1 kolom (fokus); container 720px |
| `≥ 1024px` | Desktop | Nav atas; layout 2 kolom untuk hasil cek (form kiri, hasil kanan); panel masuk 2 kolom seperti referensi; container 1120px |

Kewajiban (R-03, R-32, R-39):
- Nol overflow horizontal di 320px; teks tidak keluar wadah; kartu tidak bertabrakan.
- Semua target sentuh ≥ 44px; label form selalu terlihat (bukan placeholder-saja).
- Fokus keyboard terlihat di semua kontrol; `lang="id"`; semua media punya dimensi (R-40).
- Uji wajib di 320, 390, 768, 1024, 1440.

---

## 11. UI Component Guidelines

Semua komponen wajib punya **tiga keadaan: kosong, memuat, gagal** (R-27). Ringkasan komponen inti:

### 11.1 Input & form
Label di atas, 14px/600 `--ink`; input 48px, `radius-md`, latar surface, garis `--border`; fokus: garis `--accent` + ring. Error: garis merah + pesan 12px di bawah **field itu sendiri**. Password punya tombol lihat/sembunyi.

### 11.2 Badge status
Kapsul kecil `radius-sm`, tint latar + teks warna semantik (pasangan §3.3), ikon 14px. Hanya untuk status nyata (risiko, level, "Tersimpan").

### 11.3 Gelembung chat (Simulasi)
- Penipu: kiri, surface + garis border, sudut ekor kiri-bawah 4px.
- Pengguna: kanan, `--primary-soft`, teks `--ink`, ekor kanan-bawah 4px. (Teks pengguna di latar tint biru, bukan solid primary, agar tak bersaing dengan tombol.)
- Umpan balik: strip 8px di bawah gelembung yang baru dijawab: garis warna semantik + satu kalimat alasan.
- Chip tanda bahaya yang terkumpul tampil sebagai deretan badge di bagian akhir.

### 11.4 Opsi kuis
Baris penuh (bukan kartu kembar 2 kolom di mobile): huruf pilihan (A-D) dalam kotak 32px `radius-sm`, teks jawaban. Keadaan: default (garis border), dipilih (garis `--primary`), benar (tint hijau + ikon centang), salah (tint merah + ikon silang), lalu panel penjelasan mengikuti.

### 11.5 Skor, level, poin
- Skor besar: angka 48px Poppins 700 `--primary`, tabular-nums, satu angka fokus per layar.
- Badge level: kapsul tint `--primary-soft` + teks `--primary`, nama level + poin. **Dilarang memberi warna semantik risiko pada level** (risiko dan level tidak boleh berebut makna warna).
- Progres poin: bar 8px `radius-full` di atas `--primary-soft`, isi `--primary`, dengan teks "…/500 poin".

### 11.6 Halaman hasil (Cek Pesan)
Komposisi satu fokus: badge status besar di atas, kartu hasil risiko (§8.2) di tengah, disclaimer 12px `--text-muted` di bawah dengan ikon informasi. Disclaimer wajib di semua hasil.

### 11.7 Keadaan sistem
- **Kosong:** ilustrasi gelembung motif kecil + satu kalimat awam + tombol tindakan ("Belum ada riwayat. Mulai dari Kuis.").
- **Memuat:** skeleton abu lembut `#E2E8F0` tanpa animasi berlebihan; maksimal 2 elemen.
- **Gagal:** kartu tint merah lembut, kalimat awam ("Gagal menyimpan skor. Periksa koneksi."), tombol "Coba Lagi".

### 11.8 Motion
- Transisi: 150ms (warna/status), 200ms (lift kartu, tombol). Kurva `ease-out`.
- Yang bergerak: hover kartu (+2px), tekan tombol (0.98), perubahan skor (angka bergeser sekali), badge status muncul dengan fade 150ms.
- Yang **tidak** bergerak: fade-in scroll tiap bagian, parallax, bounce, stagger, apa pun yang bergerak karena halaman di-scroll (MOTION 1).
- `prefers-reduced-motion: reduce`: semua animasi berhenti, konten tidak pernah tersembunyi (R-39).

### 11.9 Halaman masuk/daftar (revisi 16 Nov 2026, referensi `login dan daftar.png`)

Desktop (≥ 1024px): dua kolom, tinggi mengikuti viewport.
- **Kolom kiri (form, maks 480px, terpusat vertikal):** ikon masuk dalam kotak `--primary` radius-md dengan pola grid samar di belakangnya (pengecualian §3.4); heading h1 ("Masuk ke akunmu") + satu kalimat bantuan; input surel dan sandi dengan ikon di dalamnya (depan: ikon bidang; sandi: tombol lihat/sembunyi di belakang); tombol primary "Masuk" membentang penuh. Halaman daftar memakai struktur sama dengan tombol "Daftar". **Baris "Remember me" + "Forgot Password?" dari referensi tidak diadopsi:** sesi selalu tersimpan (persistSession) sehingga checkbox akan jadi kontrol palsu, dan pemulihan sandi bukan fitur PRD v1.1 (R-24: tidak ada tautan ke fitur yang belum ada).
- **Kolom kanan (panel ilustrasi, radius-xl, gradien §3.5, inset dari tepi):** judul h2 dengan satu frasa disorot `--primary`, ilustrasi orbit (§2.3), caption satu kalimat di bawah. Titik indikator karosel hanya dipakai jika caption benar-benar berganti (3 kalimat, berganti tiap 5 detik, berhenti saat `prefers-reduced-motion`); bila statis, titik dihilangkan agar tidak menjadi elemen palsu.
- **Baris "Atau masuk dengan" dari referensi tidak diadopsi:** masuk Google berada di daftar fitur yang ditunda PRD §5.2, dan R-24 melarang elemen UI untuk fitur yang belum ada.

Mobile (< 1024px): panel disembunyikan; form satu kolom penuh dengan ikon dan heading di atas; header ringkas bilah biru (§9.5).

---

## 12. Pintasan Kepatuhan (filter Anti-Slop diterapkan)

| Aturan | Penerapan di TangkisSiber |
|---|---|
| R-02 | Tanpa em dash di seluruh teks UI; dokumen ini pun bebas em dash |
| R-15/R-16 | CTA spesifik; tanpa "AI Powered", "Seamless", dan kawan-kawannya |
| R-17/R-18/R-36 | Tanpa statistik palsu; tanpa testimoni fiktif; skor juri berasal dari data nyata |
| R-23 | Logo dan ilustrasi ditandai proposal, menunggu persetujuan; tanpa aset final yang mengarang |
| R-24 | Nav hanya memuat halaman yang benar-benar ada |
| R-25 | Semua pasangan warna teks-latar diperiksa AA; `#64748B` hanya di atas surface |
| R-27 | Kosong/memuat/gagal di setiap tampilan data |
| R-29 | 3 warna inti + 1 aksen; semantik risiko adalah pengecualian fungsional yang terdokumentasi |
| R-30 | Referensi dijadikan arah karakter, bukan salinan; yang diadopsi (drawer nav, panel masuk, gaya kartu) dan yang dibedakan didokumentasikan di §0 dan §11.9 |
| R-31 | Setiap keputusan di dokumen ini punya kolom alasan |

**Uji akhir identitas:** jika logo "TangkisSiber" diganti dengan nama lain, desain ini masih terasa khas karena motif gelembung tertangkis dan sistem warna risiko milik konten penipuan digital, bukan milik templat.

---

*Akhir dokumen. Implementasi tidak dimulai sebelum dokumen ini disetujui pemilik produk.*
