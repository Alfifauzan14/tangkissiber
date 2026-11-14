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
