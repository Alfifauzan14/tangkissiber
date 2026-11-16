# DATABASE.md

## TangkisSiber: Rancangan Database (Supabase Postgres)

| | |
|---|---|
| **Versi Dokumen** | 1.2 |
| **Status** | **Disetujui & Diimplementasikan** — v1.1 berjalan di `tangkissiber`; v1.2 menambahkan migrasi Admin CRUD & `konten_aplikasi` (16 November 2026) |
| **Tanggal** | 16 November 2026 (v1.1: 14 November 2026) |
| **Prasyarat** | PRD v1.0 (Disetujui) · DESIGN.md v1.0 (Disetujui) · ARCHITECTURE.md v1.0 (Disetujui) |
| **Sumber rujukan** | Skill supabase-postgres-best-practices · Dokumentasi resmi Supabase (Context7) · Supabase MCP |

---

## 1. Keputusan Penempatan (sudah dieksekusi)

Database TangkisSiber dibuat sebagai **project Supabase baru** (keputusan Anda), terpisah dari Arenivo yang sedang dipakai aplikasi lain:

| Item | Nilai |
|---|---|
| Nama project | `tangkissiber` |
| Project ID (ref) | `fpmlbnhckvwsxtzzhmcn` |
| Region | `ap-southeast-1` (Singapura, terdekat dengan Indonesia) |
| URL API | `https://fpmlbnhckvwsxtzzhmcn.supabase.co` |
| Status | `ACTIVE_HEALTHY`, schema `public` masih kosong (0 tabel) |
| Biaya | $0 (paket gratis, tanpa perubahan tagihan) |

URL dan anon key akan ditulis hanya di `.env.local` (gitignored) saat implementasi, tidak pernah masuk dokumen atau repo.

Keputusan desain utama (dengan alasan):

| # | Keputusan | Alasan |
|---|-----------|--------|
| D1 | Satu file SQL utuh: `supabase/schema.sql` di repo | Ketentuan ARCHITECTURE.md; juri dapat menyiapkan database sendiri dengan satu kali jalankan |
| D2 | PK `uuid` dengan `gen_random_uuid()` | Fungsi inti Postgres 13+; **tanpa ekstensi tambahan** |
| D3 | `user_id` merujuk `auth.users(id) on delete cascade` | Hapus akun otomatis membersihkan datanya (privasi) |
| D4 | Pola RLS `(select auth.uid()) = user_id` | Pola resmi Supabase; `select` di dalam subekspresi membuat pemanggilan `auth.uid()` sekali per statement, lebih cepat |
| D5 | Riwayat tanpa UPDATE/DELETE | Sesuai ARCHITECTURE.md; riwayat bersifat lampiran yang tidak boleh diubah |
| D6 | View `peringkat` memakai mode definer (bukan `security_invoker`) | Lihat analisis di §5.2; pengguna tamu tetap bisa melihat peringkat |
| D7 | `skenario_id` divalidasi `CHECK IN ('kurir-apk', ...)` | Nilai tetap sesuai PRD; lebih ringan daripada tabel referensi |
| D8 | Trigger profil `SECURITY DEFINER` dengan `set search_path = ''` | Pola resmi Supabase; mencegah injeksi lewat `search_path` |

---

## 2. Ringkasan Objek Database

| Objek | Jenis | Isi |
|---|---|---|
| `profiles` | tabel | `id` (= id user), `nama_tampil`, `created_at` |
| `kuis_hasil` | tabel | `id`, `user_id`, `skor` (0-100), `created_at` |
| `simulasi_hasil` | tabel | `id`, `user_id`, `skenario_id`, `skor` (0-100), `created_at` |
| `peringkat` | view | `id`, `nama_tampil`, `total_poin` (tanpa email) |

Rumus `total_poin` (terkunci di SQL view): skor terbaik kuis (maks 100) + skor terbaik tiap skenario (4 × 100) = **maks 500**, sesuai PRD FR-F10-01.

---

## 3. SQL Lengkap (isi `supabase/schema.sql`)

> File ini akan dibuat di repo setelah dokumen disetujui, lalu dijalankan di SQL Editor project `tangkissiber`.

```sql
-- ============================================================
-- TangkisSiber: Skema Database (Supabase Postgres)
-- Satu file utuh. Jalankan sekali di SQL Editor project baru.
-- Tanpa ekstensi tambahan: gen_random_uuid() sudah inti Postgres.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabel
-- ------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nama_tampil text not null,
  created_at  timestamptz not null default now()
);

create table public.kuis_hasil (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skor       int  not null check (skor between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.simulasi_hasil (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skenario_id text not null check (skenario_id in
    ('kurir-apk', 'hadiah-palsu', 'otp-bank', 'lowongan-palsu')),
  skor        int  not null check (skor between 0 and 100),
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Index (mengikuti pola akses: riwayat per user + hitung poin)
-- ------------------------------------------------------------

create index kuis_hasil_user_idx
  on public.kuis_hasil (user_id, created_at desc, id desc);

create index simulasi_hasil_user_idx
  on public.simulasi_hasil (user_id, created_at desc, id desc);

create index simulasi_hasil_skenario_idx
  on public.simulasi_hasil (user_id, skenario_id, skor desc);

-- ------------------------------------------------------------
-- 3. Trigger pembuatan profil otomatis
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nama_tampil)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nama_tampil',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- fungsi trigger tidak boleh dipanggil langsung lewat RPC
revoke execute on function public.handle_new_user() from public;

-- ------------------------------------------------------------
-- 4. Row Level Security
-- ------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.kuis_hasil     enable row level security;
alter table public.simulasi_hasil enable row level security;

-- profiles: lihat dan ubah baris sendiri (insert dilakukan trigger)
create policy "Lihat profil sendiri" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "Ubah profil sendiri" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- kuis_hasil: baca dan tambah sendiri; tanpa update/delete (riwayat)
create policy "Baca kuis sendiri" on public.kuis_hasil
  for select using ((select auth.uid()) = user_id);

create policy "Tambah kuis sendiri" on public.kuis_hasil
  for insert with check ((select auth.uid()) = user_id);

-- simulasi_hasil: aturan sama
create policy "Baca simulasi sendiri" on public.simulasi_hasil
  for select using ((select auth.uid()) = user_id);

create policy "Tambah simulasi sendiri" on public.simulasi_hasil
  for insert with check ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- 5. Hak akses (grants)
-- Supabase secara bawaan memberi semua hak ke anon/authenticated
-- pada tabel public. Kita rapikan sesuai kebutuhan.
-- ------------------------------------------------------------

revoke all on public.profiles from anon;
revoke all on public.kuis_hasil from anon;
revoke all on public.simulasi_hasil from anon;

-- riwayat tidak boleh diubah atau dihapus lewat API
revoke update, delete on public.kuis_hasil from authenticated;
revoke update, delete on public.simulasi_hasil from authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert on public.kuis_hasil to authenticated;
grant select, insert on public.simulasi_hasil to authenticated;

-- ------------------------------------------------------------
-- 6. View peringkat
-- ------------------------------------------------------------

create view public.peringkat as
select
  p.id,
  p.nama_tampil,
  coalesce(
    (select max(k.skor) from public.kuis_hasil k where k.user_id = p.id),
    0
  )
  + coalesce((
      select sum(t.best)
      from (
        select max(s.skor) as best
        from public.simulasi_hasil s
        where s.user_id = p.id
        group by s.skenario_id
      ) t
    ), 0)
  as total_poin
from public.profiles p;

comment on view public.peringkat is
  'Peringkat publik: hanya id, nama_tampil, total_poin. Tanpa email.';

grant select on public.peringkat to anon, authenticated;
```

---

## 4. Penjelasan Desain

### 4.1 Kolom dan tipe

| Keputusan | Alasan |
|---|---|
| `id uuid` dengan default `gen_random_uuid()` | ID teracak dan tidak berurutan; Postgres 13+ punya fungsi ini di inti, tanpa `pgcrypto` |
| `skor int not null check (skor between 0 and 100)` | Ketentuan PRD FR-F13-01; validasi minimum di level database |
| `skenario_id text not null check (in ...)` | Empat nilai terkunci sesuai PRD; kesalahan ketik aplikasi ditolak database |
| `user_id not null default auth.uid()` | Aplikasi cukup mengirim `{skor}`; database mengisi user pemanggil sendiri, dan RLS tetap menegakkan hanya baris sendiri |
| `created_at timestamptz not null default now()` | `timestamptz` selalu benar untuk zona waktu; urutan riwayat dari `desc` |
| `nama_tampil text not null` | Wajib ada; fallback trigger mengisi dari email bila metadata kosong |

### 4.2 RLS (matrix final)

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | sendiri | lewat trigger (definer) | sendiri | tidak ada |
| `kuis_hasil` | sendiri | sendiri | ditolak (tanpa policy + revoke) | ditolak |
| `simulasi_hasil` | sendiri | sendiri | ditolak | ditolak |

- Tamu (`anon`) tidak punya hak apa pun pada ketiga tabel (revoke penuh).
- Perubahan riwayat tidak mungkin lewat API: tidak ada policy, dan haknya di-revoke. Dua lapis pertahanan.
- Pemakaian `(select auth.uid())` di dalam policy mengikuti anjuran dokumentasi Supabase untuk performa.

### 4.3 Mengapa view `peringkat` memakai mode definer (bukan `security_invoker`)

`security_invoker = true` membuat view mengikuti RLS tabel di bawahnya. Konsekuensinya: **tamu tidak bisa melihat peringkat sama sekali**, karena `anon` sengaja tidak diberi akses ke ketiga tabel. Ini melanggar FR-F9-03 ("Tamu hanya dapat melihat").

Jadi view ini sengaja definer (pemilik `postgres`), dengan dua pengaman:

1. Kolom view **hanya** `id`, `nama_tampil`, `total_poin`. Email tidak pernah masuk SELECT, jadi tidak mungkin bocor lewat view.
2. Hak `anon` dan `authenticated` hanya `SELECT` di view; tabel aslinya tetap terkunci RLS.

Keterbatasan ini diakui terbuka: siapa pun yang bisa membaca view bisa melihat nama tampil dan poin semua pengguna. Itu memang perilaku yang diinginkan untuk halaman peringkat publik.

### 4.4 Trigger profil

- Dijalankan `AFTER INSERT ON auth.users`, jadi profil selalu terbentuk saat daftar (AC Masuk/Daftar no. 2).
- `security definer` karena tabel `auth.users` tidak bisa disentuh peran `authenticated`.
- `set search_path = ''` mengikuti anjuran Supabase agar fungsi tidak bisa dibajak lewat skema lain (`pg_catalog` tetap dicari otomatis, jadi `split_part` aman).
- Nama tampil diambil dari metadata pendaftaran (`nama_tampil` dikirim aplikasi lewat `options.data`); bila kosong, dipakai bagian sebelum `@` dari email.

### 4.5 Index

| Index | Melayani |
|---|---|
| `kuis_hasil (user_id, created_at desc, id desc)` | Riwayat kuis per pengguna, terbaru dulu (Riwayat Saya) |
| `simulasi_hasil (user_id, created_at desc, id desc)` | Riwayat simulasi per pengguna |
| `simulasi_hasil (user_id, skenario_id, skor desc)` | Perhitungan `max(skor) group by skenario_id` di view peringkat |

Skala data versi 1.0 kecil, tapi index ini membuat view tetap cepat dan polanya sudah benar sejak awal.

---

## 5. Pengaturan yang Bukan SQL

| Pengaturan | Nilai | Cara | Alasan |
|---|---|---|---|
| Konfirmasi email | **Mati** | Dashboard: Authentication > Sign In / Providers > Email | Ketentuan PRD FR-F7-03 (demo lomba); SQL tidak bisa mengatur ini |
| Panjang sandi minimum | 6 (bawaan) | Biarkan bawaan | Cukup untuk demo; tidak perlu diperketat |
| Redirect URL Auth | `http://localhost:3000/**` dan domain Vercel | Dashboard: Authentication > URL Configuration | Diperlukan saat alur masuk memakai redirect |

---

## 6. Akun Demo Juri dan Rencana Seed

1. Daftarkan akun demo lewat aplikasi (mis. `demo@tangkissiber.id`), sehingga trigger membuat profilnya otomatis.
2. Ambil `id` profil demo, lalu isi beberapa hasil lewat SQL Editor (SQL Editor berjalan sebagai `postgres`, tidak terkena RLS):

```sql
-- contoh seed (ganti <uuid-demo> dengan id profil demo)
insert into public.kuis_hasil (user_id, skor)
values ('<uuid-demo>', 70), ('<uuid-demo>', 90);

insert into public.simulasi_hasil (user_id, skenario_id, skor)
values
  ('<uuid-demo>', 'kurir-apk', 80),
  ('<uuid-demo>', 'hadiah-palsu', 60),
  ('<uuid-demo>', 'otp-bank', 90),
  ('<uuid-demo>', 'lowongan-palsu', 50);
```

3. Uji login akun demo: Riwayat Saya menampilkan daftar itu, Peringkat menampilkan posisinya.

Kredensial demo dicantumkan di README dan proposal (ketentuan PRD), tidak di dokumen ini.

---

## 7. Langkah Penerapan (setelah dokumen disetujui)

1. Buat file `supabase/schema.sql` di repo dengan isi §3.
2. Jalankan seluruh isi file di SQL Editor project `tangkissiber` (via Supabase MCP).
3. Matikan konfirmasi email (§5).
4. Ambil anon key via MCP (`get_publishable_keys`), tulis `.env.local` (URL + anon key), gitignore `.env.local`.
5. Verifikasi dengan checklist §8.
6. Baru mulai implementasi halaman.

---

## 8. Checklist Verifikasi Database

Diuji lewat MCP/SQL Editor dan lewat aplikasi dengan dua akun sungguhan.

| # | Uji | Hasil yang diharapkan |
|---|-----|----------------------|
| V1 | Daftar akun baru lewat aplikasi | Baris `profiles` terbentuk otomatis dengan `nama_tampil` yang diisi |
| V2 | `set local role anon; select * from public.kuis_hasil;` | Error permission denied (anon tanpa hak) |
| V3 | Dua akun: A membuka Riwayat, B juga. Query B dengan sesi A | Data B tidak terlihat dari akun A (0 baris) |
| V4 | Simpan skor 101 (mengubah nilai lewat devtools) | Ditolak: `check (skor between 0 and 100)` |
| V5 | Insert `skenario_id = 'skenario-ajaib'` | Ditolak: check daftar skenario |
| V6 | Percobaan `update`/`delete` riwayat lewat API | Ditolak (tanpa policy + revoke) |
| V7 | Buka view `peringkat` sebagai tamu | Kolom hanya `id`, `nama_tampil`, `total_poin`; email tidak ada |
| V8 | Selesaikan kuis dengan skor lebih rendah dari rekor | `total_poin` tidak turun (rumus max di view) |
| V9 | Selesaikan skenario baru dengan skor tinggi | `total_poin` naik sesuai rumus (maks 500) |
| V10 | Seed akun demo (§6) | Riwayat demo tampil dan masuk peringkat |

---

## 8a. Hasil Verifikasi (dijalankan 14 November 2026, lewat endpoint auth dan PostgREST asli)

| # | Uji | Hasil |
|---|-----|-------|
| V1 | Daftar 2 akun uji lewat `/auth/v1/signup` | **Lulus** — 2 baris `profiles` terbentuk otomatis oleh trigger, `nama_tampil` dari metadata pendaftaran |
| V2 | Tamu (anon) membaca `kuis_hasil` | **Lulus** — ditolak 401, permission denied |
| V3 | Pengguna A menyimpan skor, pengguna B membaca | **Lulus** — A melihat barisnya sendiri; B melihat 0 baris |
| V4 | Skor 101 | **Lulus** — ditolak kode 23514 (check constraint) |
| V5 | `skenario_id` di luar 4 nilai resmi | **Lulus** — ditolak kode 23514 |
| V6 | UPDATE dan DELETE riwayat lewat API | **Lulus** — keduanya 403; data tetap utuh |
| V7 | Tamu membaca view `peringkat` | **Lulus** — 200 OK; kolom tepat `id, nama_tampil, total_poin`, tanpa email |
| V8 | Rumus poin (80+40=120; kuis 50 tidak menaikkan; otp-bank 90 jadi 210) | **Lulus** |
| V9 | Urutan peringkat menurun | **Lulus** |
| V10 | Seed akun demo | **Tertunda** — menunggu akun demo dibuat setelah fitur auth aplikasi selesai |

Setelah uji, pengguna uji dihapus (cascade membersihkan profil dan hasilnya), database kembali bersih untuk data sungguhan.

**Pemeriksaan silang Supabase Advisors (security lint):** tersisa 1 temuan `security_definer_view` pada `peringkat`; itu **disengaja** (alasan di §4.3: agar tamu tetap bisa melihat peringkat, sementara kolom yang bocor hanya kolom aman). Temuan `handle_new_user` yang bisa dieksekusi lewat RPC **sudah diperbaiki** dengan `revoke execute ... from public`.

**Perbaikan kecil saat verifikasi:** kolom `user_id` di `kuis_hasil` dan `simulasi_hasil` diberi `default auth.uid()` sehingga aplikasi cukup mengirim `{skor}`; `schema.sql`, dokumen ini, dan sketsa ARCHITECTURE.md §3.1 sudah diselaraskan.

---

## 9. Risiko dan Keterbatasan Database

| ID | Hal | Status |
|---|---|---|
| B1 | Skor dikirim dari klien; pengguna yang mengubah kode klien bisa mengirim skor fiktif (valid penuh di server ditunda, sesuai PRD §5.2) | Diterima, dicatat di README |
| B2 | View peringkat definer mengekspos nama tampil + poin semua pengguna ke publik | Disengaja, sesuai FR-F9-03 |
| B3 | Konfirmasi email mati membuat siapa pun bisa mendaftar dengan email apa pun | Diterima untuk demo (PRD R8) |
| B4 | Paket gratis bisa pause project bila tidak dipakai lama | Sebelum demo, pastikan project aktif kembali (restore via MCP) |
| B5 | Seed akun demo memakai SQL Editor (bypass RLS) hanya boleh dilakukan pemilik project | Diterima; SQL tetap di-repo hanya untuk skema, bukan seed |

---

## 10. Migrasi Post-v1.0 & Admin CRUD (`v1.2`)

Penambahan skema di repo (selain `supabase/schema.sql`):
- `supabase/migration-admin-role.sql` & `supabase/migration-ai-detection.sql`: Menambahkan kolom `profiles.peran` (`'user' | 'admin'`) serta kolom `ai_curiga boolean default false` pada `kuis_hasil` dan `simulasi_hasil`.
- `supabase/migration-admin-crud.sql`:
  - Fungsi `public.is_admin()` (`SECURITY DEFINER`, `set search_path = ''`) untuk memeriksa peran admin secara aman tanpa memicu rekursi RLS pada `profiles`.
  - Policy CRUD admin untuk `profiles`, `kuis_hasil`, dan `simulasi_hasil`.
  - Tabel `public.konten_aplikasi` (`kunci text primary key`, `data jsonb not null`, `updated_at timestamptz`) dengan RLS publik baca (`select`) dan hanya admin yang dapat menulis (`insert`, `update`, `delete`).
  - **Status di project `fpmlbnhckvwsxtzzhmcn` (16 Nov 2026):** `profiles`, `kuis_hasil`, `simulasi_hasil`, dan `konten_aplikasi` (`rls_enabled: true`) sudah aktif seluruhnya.

---

*Akhir dokumen.*
