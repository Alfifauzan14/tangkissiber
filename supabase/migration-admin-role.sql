-- Migrasi: Tambah kolom peran ke profiles (Post-v1.0 #4)
-- Jalankan di SQL Editor Supabase setelah schema.sql

-- 1. Buat tipe enum
create type peran_enum as enum ('user', 'admin');

-- 2. Tambah kolom peran ke profiles (default 'user')
alter table public.profiles
add column peran peran_enum not null default 'user';

-- 3. Update RLS policy untuk profiles: admin bisa baca semua
create policy "Admin baca semua profil" on public.profiles
  for select using (
    (select auth.uid()) = id
    or
    (select peran from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- 4. Admin bisa baca kuis_hasil semua user
create policy "Admin baca kuis semua" on public.kuis_hasil
  for select using (
    (select auth.uid()) = user_id
    or
    (select peran from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- 5. Admin bisa baca simulasi_hasil semua user
create policy "Admin baca simulasi semua" on public.simulasi_hasil
  for select using (
    (select auth.uid()) = user_id
    or
    (select peran from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- 6. Grant select ke authenticated (sudah ada dari schema.sql, ini untuk memastikan)
grant select on public.profiles to authenticated;
grant select on public.kuis_hasil to authenticated;
grant select on public.simulasi_hasil to authenticated;

-- 7. Komentar
comment on column public.profiles.peran is 'Peran pengguna: user atau admin. Admin bisa akses halaman /admin dan baca data semua user.';