# ARCHITECTURE.md

## TangkisSiber: Arsitektur Aplikasi

| | |
|---|---|
| **Versi Dokumen** | 1.0 (Disetujui) |
| **Status** | **Disetujui** — disetujui pemilik produk pada 14 November 2026; diselaraskan dengan DATABASE.md v1.1 (default `auth.uid()` pada `user_id`) |
| **Tanggal** | 14 November 2026 |
| **Prasyarat** | PRD v1.0 (Disetujui) · DESIGN.md v1.0 (Disetujui) |
| **Prinsip** | Tanpa server API khusus; Supabase dipanggil langsung dari sisi klien (sesuai PRD) |

---

## 0. Peta Besar

```
┌────────────────────────────────────────────────────────────┐
│                 PERAMBAN PENGGUNA (HP/desktop)              │
│                                                            │
│  Next.js App Router (statis + komponen klien)              │
│  ├── Halaman & UI (Tailwind, DESIGN.md sebagai acuan)      │
│  ├── Konten JSON (modus, soal, skenario, aturan, darurat)  │
│  ├── lib/poin.js      (hitung poin & level, murni)         │
│  ├── lib/cekPesan.js  (mesin aturan Cek Pesan, murni)      │
│  └── lib/supabase.js  (satu klien Supabase untuk semua)    │
└───────────────┬────────────────────────────────────────────┘
                │ HTTPS (dua jalur saja)
                ▼
┌────────────────────────────────────────────────────────────┐
│                      SUPABASE (BaaS)                       │
│  ├── Auth (email + password, konfirmasi email mati/demo)   │
│  └── Postgres                                              │
│      ├── profiles · kuis_hasil · simulasi_hasil (RLS)      │
│      └── peringkat (view, tanpa email)                     │
└────────────────────────────────────────────────────────────┘
```

Semua logika domain (aturan cek, skoring, poin, level) hidup di klien sebagai kode murni yang mudah diuji. Supabase hanya menyimpan hasil dan menyediakan autentikasi. Ini sesuai keputusan PRD dan mempercepat pengiriman 3 hari.

### Keputusan arsitektur (dengan alasan)

| # | Keputusan | Alasan |
|---|-----------|--------|
| K1 | Tanpa server API khusus | Ketentuan PRD; lomba 3 hari; Supabase menyediakan API otomatis (PostgREST) dengan RLS sebagai penjaga |
| K2 | Halaman sebagai Client Components | Semua interaksi (kuis, chat, cek) berjalan di klien; tidak ada kebutuhan rendering server yang bergantung data pengguna |
| K3 | Konten dari JSON statis di repo | Ketentuan PRD; cepat (terbundel), tanpa fetch, mudah diperbarui tanpa menyentuh UI |
| K4 | Poin/level dihitung ulang, tidak disimpan | Poin = fungsi murni dari skor terbaik; view `peringkat` menghitung di database; tidak ada angka yang bisa basi |
| K5 | Skor divalidasi constraint 0-100 di database | Ketentuan PRD; validasi penuh sisi server ditunda (tercatat di PRD §5.2) |
| K6 | Handoff tamu→login lewat localStorage | Ketentuan PRD + keputusan A7: hanya 1 hasil terakhir yang dibawa |

---

## 1. Frontend

| Aspek | Keputusan |
|---|---|
| Kerangka | **Next.js (App Router), JavaScript** (bukan TypeScript, sesuai PRD) |
| Styling | **Tailwind CSS**, token DESIGN.md dipetakan ke `globals.css` sebagai CSS variables |
| Rendering | Halaman disajikan statis; interaktivitas lewat Client Components (`"use client"`) |
| State | React state lokal per halaman; tidak ada state manager global. Sesi auth dibaca via hook `useSesi()` (lib) |
| Konten | Import langsung dari `src/data/*.json` (terbundel saat build, tanpa fetch runtime) |
| Ikon | Material Symbols Rounded (fill), sesuai DESIGN.md |
| Font | Poppins, dimuat via `next/font` (self-hosted, tanpa render-blocking) |

Halaman (rute) beserta jenisnya:

| Rute | Isi | Interaktif |
|---|---|---|
| `/` | Beranda: pintasan 6 fitur + status login/level | sedang |
| `/cek-pesan` | Form tempel pesan/tautan + hasil risiko + disclaimer | ya |
| `/pustaka` | 8 kartu modus, pencarian, filter | ya (filter klien) |
| `/darurat` | Langkah berurutan + kontak resmi | tidak |
| `/simulasi` | Daftar 4 skenario | sedang |
| `/simulasi/[id]` | Chat simulasi + hasil skor | ya |
| `/kuis` | Kuis 10 soal acak + hasil | ya |
| `/peringkat` | Top 20 dari view | sedang |
| `/riwayat` | Riwayat pengguna login (guard tamu) | sedang |
| `/masuk` | Tab masuk/daftar (guard: tamu saja) | ya |

---

## 2. Backend

**Tidak ada backend kustom.** Peran backend diisi Supabase:

| Layanan Supabase | Pemakaian di TangkisSiber |
|---|---|
| **Auth** | signUp, signInWithPassword, signOut, onAuthStateChange |
| **PostgREST (otomatis)** | CRUD tabel + baca view, dijaga RLS |
| **Postgres** | 3 tabel + 1 view + trigger profil + constraint skor |

Aturan lib klien:

- `lib/supabase.js` membuat **satu instance** `createClient` (URL + anon key dari `NEXT_PUBLIC_*`), dipakai semua halaman.
- Hanya **anon key** yang pernah masuk bundel klien. Service key tidak pernah ada di repo atau bundel.
- Semua query data pengguna selalu dalam konteks sesi; tidak ada panggilan dengan kredensial admin.

---

## 3. Database

Postgres (Supabase), 3 tabel + 1 view, semua dalam satu file `supabase/schema.sql` di repo.

### 3.1 Tabel

```sql
profiles
  id            uuid PK          -- sama dengan auth.users.id
  nama_tampil   text NOT NULL
  created_at    timestamptz DEFAULT now()

kuis_hasil
  id            uuid PK DEFAULT gen_random_uuid()
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id)
  skor          int NOT NULL CHECK (skor BETWEEN 0 AND 100)
  created_at    timestamptz DEFAULT now()

simulasi_hasil
  id            uuid PK DEFAULT gen_random_uuid()
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id)
  skenario_id   text NOT NULL    -- 'kurir-apk' | 'hadiah-palsu' | 'otp-bank' | 'lowongan-palsu'
  skor          int NOT NULL CHECK (skor BETWEEN 0 AND 100)
  created_at    timestamptz DEFAULT now()
```

### 3.2 Trigger profil otomatis

Trigger `AFTER INSERT ON auth.users` membuat baris `profiles` (nama_tampil diambil dari metadata pendaftaran), `SECURITY DEFINER` agar berjalan tanpa menyimpang dari RLS.

### 3.3 View peringkat

```sql
CREATE VIEW peringkat AS
SELECT
  p.id,
  p.nama_tampil,
  COALESCE(
    (SELECT MAX(k.skor) FROM kuis_hasil k WHERE k.user_id = p.id), 0)
  + COALESCE(
    (SELECT SUM(s.best) FROM
      (SELECT MAX(x.skor) AS best FROM simulasi_hasil x
       WHERE x.user_id = p.id GROUP BY x.skenario_id) s), 0)
  AS total_poin
FROM profiles p
ORDER BY total_poin DESC;
```

Definisi ini **mengunci aturan poin di database**: skor terbaik kuis (maks 100) + skor terbaik tiap skenario (4 × 100) = maks 500. Poin naik otomatis hanya bila rekor terlampaui, tanpa logika tambahan.

### 3.4 RLS (aktif di ketiga tabel)

| Tabel | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| `profiles` | sendiri (`auth.uid() = id`) | sendiri (trigger) | sendiri |
| `kuis_hasil` | sendiri | sendiri | tidak ada (riwayat bersifat lampiran) |
| `simulasi_hasil` | sendiri | sendiri | tidak ada |

View `peringkat` dibaca publik (anon) tetapi **hanya memaparkan `id`, `nama_tampil`, `total_poin`**; email dan data lain tidak pernah lewat view (kepatuhan PRD §7.13).

### 3.5 Ketentuan skema lain

- File SQL menyertakan: tabel, trigger, view, policy, index (`user_id`, `created_at`).
- Migrasi tidak dipakai pada versi 1.0; satu file skema utuh agar juri mudah menyiapkan sendiri (README menjelaskan langkahnya).

---

## 4. Authentication

| Aspek | Keputusan |
|---|---|
| Metode | Email + password (Supabase Auth), tanpa OAuth (login Google ditunda sesuai PRD) |
| Konfirmasi email | **Mati** untuk demo lomba (dicatat sebagai keterbatasan) |
| Sesi | Dikelola `supabase-js` di klien (penyimpanan bawaan peramban); halaman membaca sesi via `onAuthStateChange` |
| Nama tampil | Dikirim sebagai metadata saat signUp; trigger memindahkannya ke `profiles` |
| Keluar | `signOut()` lalu arahkan ke beranda |

**Guard halaman (di klien, karena tidak ada middleware kustom):**

- `/riwayat`: tanpa sesi → arahkan ke `/masuk` (sesuai alur PRD).
- `/masuk`: sudah login → arahkan kembali ke halaman sebelumnya.
- Redirect mengingat rute asal (query `?kembali=`) untuk memenuhi FR-F7-04.

---

## 5. API

Tidak ada REST API kustom. "API" aplikasi = **panggilan pustaka Supabase** dari klien:

| Aksi | Panggilan | Catatan keamanan |
|---|---|---|
| Daftar | `auth.signUp({ email, password, options.data.nama_tampil })` | konfirmasi email mati (demo) |
| Masuk | `auth.signInWithPassword({ email, password })` | |
| Keluar | `auth.signOut()` | |
| Sesi | `auth.getSession()` / `auth.onAuthStateChange()` | |
| Baca profil sendiri | `from('profiles').select().eq('id', user.id).single()` | RLS |
| Simpan hasil kuis | `from('kuis_hasil').insert({ skor })` | RLS mengisi `user_id` pemanggil |
| Simpan hasil simulasi | `from('simulasi_hasil').insert({ skenario_id, skor })` | RLS |
| Riwayat sendiri | `from('kuis_hasil').select().order('created_at')` + idem simulasi | RLS |
| Peringkat | `from('peringkat').select().order('total_poin', { ascending: false }).limit(20)` | view publik, tanpa email |

**Handoff tamu→login (FR-F12):** setelah auth berhasil, klien membaca kunci `ts_hasil_tunda` di localStorage (`{ jenis, skenario_id?, skor }`), melakukan insert yang sesuai, lalu menghapus kunci dan menandai layar hasil "Tersimpan ✓".

**Cek Pesan tidak memanggil jaringan sama sekali:** mesin aturan `lib/cekPesan.js` murni berjalan di klien atas data `aturan-cek.json`.

---

## 6. Struktur Folder

```
tangkissiber/
├─ docs/
│  ├─ PRD.md                      # disetujui
│  ├─ DESIGN.md                   # disetujui
│  └─ ARCHITECTURE.md             # dokumen ini
├─ supabase/
│  └─ schema.sql                  # skema utuh: tabel, trigger, view, RLS, index
├─ src/
│  ├─ app/
│  │  ├─ layout.js                # root layout, font, global css
│  │  ├─ page.js                  # beranda
│  │  ├─ globals.css              # token DESIGN.md sebagai CSS variables
│  │  ├─ cek-pesan/page.js
│  │  ├─ pustaka/page.js
│  │  ├─ darurat/page.js
│  │  ├─ simulasi/page.js
│  │  ├─ simulasi/[skenario]/page.js
│  │  ├─ kuis/page.js
│  │  ├─ peringkat/page.js
│  │  ├─ riwayat/page.js
│  │  └─ masuk/page.js
│  ├─ components/
│  │  ├─ layout/                  # Header, TabBar, Container
│  │  ├─ ui/                      # Button, Card, Badge, Input, KeadaanKosong/Memuat/Gagal
│  │  └─ fitur/                   # GelembungChat, OpsiKuis, KartuModus, KartuHasilRisiko
│  ├─ lib/
│  │  ├─ supabase.js              # satu instance klien
│  │  ├─ sesi.js                  # hook useSesi (sesi + profil + level)
│  │  ├─ poin.js                  # hitungPoin, hitungLevel (murni, mengikuti aturan PRD)
│  │  └─ cekPesan.js              # mesin aturan (murni)
│  └─ data/
│     ├─ modus.json               # 8 modus
│     ├─ soal.json                # bank 20 soal
│     ├─ skenario/                # 4 file skenario percakapan
│     ├─ aturan-cek.json          # aturan pesan & tautan
│     └─ darurat.json             # langkah + kontak resmi
├─ .env.example                   # NEXT_PUBLIC_SUPABASE_URL / ANON_KEY, tanpa nilai rahasia
├─ .env.local                     # tidak pernah di-commit
├─ .gitignore                     # .env.local, node_modules, .next
└─ README.md                      # sesuai daftar syarat lomba (PRD §12)
```

Prinsip penataan: `data/` (isi), `lib/` (logika murni), `components/` (tampilan), `app/` (rute). Tidak ada logika domain di dalam komponen UI.

---

## 7. Alur Data

### 7.1 Kuis (pengguna login)

```
/kuis → ambil 10 soal acak dari soal.json (klien)
      → pengguna menjawab, penjelasan tampil per soal
      → skor akhir = benar/total × 100 (dibulatkan)
      → insert kuis_hasil { skor }            (RLS mengisi user_id)
      → lib/poin: baca rekor lama, hitung poin & level baru
      → layar hasil: skor + level + status "Tersimpan"
```

### 7.2 Kuis (tamu → handoff)

```
/kuis (tamu) → hasil di layar + ajakan "Masuk untuk menyimpan"
      → klik → simpan { jenis:'kuis', skor } ke localStorage (ts_hasil_tunda)
      → /masuk?kembali=/kuis → auth berhasil
      → baca ts_hasil_tunda → insert ke tabel sesuai jenis → hapus kunci
      → kembali ke /kuis → layar hasil berstatus "Tersimpan ✓"
```

### 7.3 Cek Pesan

```
/cek-pesan → teks/tautan pengguna → lib/cekPesan (murni, tanpa jaringan)
      → hasil { tingkat, alasan[], saran } → kartu hasil + disclaimer
      → tidak ada penyimpanan di mana pun (keputusan terdokumentasi)
```

### 7.4 Peringkat

```
/peringkat → select peringkat (limit 20) → render
      → jika login: cari posisi user di hasil; bila di luar 20 besar,
        ambil baris user sendiri untuk disorot terpisah
```

### 7.5 Sesi

```
layout root → useSesi() → onAuthStateChange
      → sesi ada: header tampil nama + level; halaman terkunci membuka
      → sesi tiada: fitur tetap terbuka (mode tamu), Riwayat dialihkan ke /masuk
```

---

## 8. Keamanan

| Lapis | Langkah | Merujuk |
|---|---|---|
| **Akses data** | RLS aktif di semua tabel: baca/tulis hanya data sendiri; riwayat tanpa UPDATE/DELETE | PRD §7.13 |
| **Privasi peringkat** | View hanya memaparkan nama tampil + poin; email tidak pernah keluar | PRD §7.13, R-25 |
| **Kunci** | Hanya anon key di klien; service key tidak ada di repo/bundel; `.env.local` di gitignore; `.env.example` tanpa nilai rahasia | PRD FR-F14-04 |
| **Validasi skor** | Constraint `CHECK 0-100` di database; nilai di luar rentang ditolak server | PRD FR-F13-01 |
| **Batas validasi (diterima)** | Klien tepercaya menyisakan celah skor fiktif oleh pengguna yang mengubah kode klien; ditunda ke rencana pengembangan (PRD §5.2), dicatat sebagai keterbatasan di README | keputusan PRD |
| **Auth demo** | Konfirmasi email mati: siapa pun bisa mendaftar dengan email apa pun; diterima untuk demo, dicatat sebagai keterbatasan | PRD R8 |
| **Injeksi** | Tidak ada SQL dinamis dari klien; semua lewat PostgREST berparameter; konten JSON terbundel | |
| **XSS** | Konten JSON dirender sebagai teks React (bukan HTML mentah); "contoh pesan penipu" tidak pernah dirender sebagai markup | |
| **Transport** | HTTPS wajib (Vercel); Supabase hanya via HTTPS | |
| **Aksesibilitas sebagai keamanan pengguna** | Kontras AA, fokus keyboard, label terlihat, tanpa `outline: none` | DESIGN.md §11, R-32/R-39 |

**Yang sengaja tidak ada di versi 1.0** (agar tidak mengarang keamanan palsu, R-36): rate limiting, CAPTCHA, enkripsi tambahan, audit log, admin panel. Semuanya masuk rencana pengembangan bila nanti diminta.

---

*Akhir dokumen. Implementasi tidak dimulai sebelum dokumen ini disetujui pemilik produk.*
