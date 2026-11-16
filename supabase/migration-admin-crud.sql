-- Migrasi: Admin CRUD + Kelola Konten (Post-v1.0 lanjutan)
-- Jalankan di SQL Editor Supabase setelah schema.sql + migration-admin-role.sql.
-- Menggunakan fungsi public.is_admin() (SECURITY DEFINER) agar tidak terjadi
-- rekursi tak terbatas pada RLS tabel profiles.

-- 1. Helper aman untuk cek peran admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and peran = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2. Grant select, update, delete ke authenticated (RLS tetap membatasi barisnya)
grant select, update, delete on public.profiles to authenticated;
grant select, update, delete on public.kuis_hasil to authenticated;
grant select, update, delete on public.simulasi_hasil to authenticated;

-- 3. RLS admin untuk profiles
drop policy if exists "Admin baca semua profil" on public.profiles;
create policy "Admin baca semua profil" on public.profiles
  for select using (public.is_admin());

drop policy if exists "Admin ubah semua profil" on public.profiles;
create policy "Admin ubah semua profil" on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin hapus semua profil" on public.profiles;
create policy "Admin hapus semua profil" on public.profiles
  for delete using (public.is_admin());

-- 4. RLS admin untuk kuis_hasil
drop policy if exists "Admin baca kuis semua" on public.kuis_hasil;
create policy "Admin baca kuis semua" on public.kuis_hasil
  for select using (public.is_admin());

drop policy if exists "Admin ubah kuis semua" on public.kuis_hasil;
create policy "Admin ubah kuis semua" on public.kuis_hasil
  for update using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin hapus kuis semua" on public.kuis_hasil;
create policy "Admin hapus kuis semua" on public.kuis_hasil
  for delete using (public.is_admin());

-- 5. RLS admin untuk simulasi_hasil
drop policy if exists "Admin baca simulasi semua" on public.simulasi_hasil;
create policy "Admin baca simulasi semua" on public.simulasi_hasil
  for select using (public.is_admin());

drop policy if exists "Admin ubah simulasi semua" on public.simulasi_hasil;
create policy "Admin ubah simulasi semua" on public.simulasi_hasil
  for update using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin hapus simulasi semua" on public.simulasi_hasil;
create policy "Admin hapus simulasi semua" on public.simulasi_hasil
  for delete using (public.is_admin());

-- 6. Tabel konten_aplikasi agar admin bisa mengubah data konten
--    (modus, soal, darurat, aturan-cek, skenario-*)
create table if not exists public.konten_aplikasi (
  kunci text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.konten_aplikasi enable row level security;

revoke all on public.konten_aplikasi from anon, authenticated;
grant select on public.konten_aplikasi to anon, authenticated;
grant insert, update, delete on public.konten_aplikasi to authenticated;

drop policy if exists "Konten bisa dibaca publik" on public.konten_aplikasi;
create policy "Konten bisa dibaca publik" on public.konten_aplikasi
  for select using (true);

drop policy if exists "Admin kelola konten" on public.konten_aplikasi;
create policy "Admin kelola konten" on public.konten_aplikasi
  for all using (public.is_admin())
  with check (public.is_admin());
