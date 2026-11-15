-- Migrasi: Tambah kolom ai_curiga untuk deteksi AI (Post-v1.0 #5)
-- Jalankan di SQL Editor Supabase

-- 1. Tambah kolom ke kuis_hasil
alter table public.kuis_hasil
add column if not exists ai_curiga boolean not null default false;

-- 2. Tambah kolom ke simulasi_hasil
alter table public.simulasi_hasil
add column if not exists ai_curiga boolean not null default false;

-- 3. Update RLS policy untuk admin bisa baca ai_curiga
-- (sudah tercover oleh policy "Admin baca kuis semua" dan "Admin baca simulasi semua")

-- 4. Komentar
comment on column public.kuis_hasil.ai_curiga is 'Flag heuristik: true jika pola jawaban mencurigakan (terlalu cepat/terlalu sempurna)';
comment on column public.simulasi_hasil.ai_curiga is 'Flag heuristik: true jika pola jawaban mencurigakan (terlalu cepat/terlalu sempurna)';

-- 5. Index untuk query admin
create index if not exists kuis_hasil_ai_idx on public.kuis_hasil (ai_curiga) where ai_curiga = true;
create index if not exists simulasi_hasil_ai_idx on public.simulasi_hasil (ai_curiga) where ai_curiga = true;