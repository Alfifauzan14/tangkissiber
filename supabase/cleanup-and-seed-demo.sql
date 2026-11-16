-- ============================================================
-- TangkisSiber: Bersihkan Data Sampah & Siapkan 2 Akun Demo
-- 1. Demo User  : demo@juri.com / demo123456 (peran: user)
-- 2. Demo Admin : admin@tangkissiber.id / admin123456 (peran: admin)
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1. Bersihkan data riwayat & konten uji coba lama
truncate table public.kuis_hasil restart identity;
truncate table public.simulasi_hasil restart identity;
delete from public.konten_aplikasi;

-- Hapus akun uji coba selain demo@juri.com dan admin@tangkissiber.id
delete from auth.users
where email not in ('demo@juri.com', 'admin@tangkissiber.id');

-- 2. Pastikan Akun Demo User (demo@juri.com / demo123456)
do $$
declare
  v_user_id uuid;
  v_admin_id uuid;
begin
  select id into v_user_id from auth.users where email = 'demo@juri.com' limit 1;
  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated',
      'demo@juri.com', crypt('demo123456', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nama_tampil":"Demo User"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  else
    update auth.users
    set encrypted_password = crypt('demo123456', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_user_id;
  end if;

  insert into public.profiles (id, nama_tampil, peran)
  values (v_user_id, 'Demo User', 'user')
  on conflict (id) do update
    set nama_tampil = 'Demo User',
        peran = 'user';

  -- Isi ulang 3 kuis + 4 simulasi bersih untuk Demo User
  insert into public.kuis_hasil (user_id, skor, ai_curiga, created_at) values
    (v_user_id, 70, false, now() - interval '3 days'),
    (v_user_id, 80, false, now() - interval '2 days'),
    (v_user_id, 90, false, now() - interval '1 day');

  insert into public.simulasi_hasil (user_id, skenario_id, skor, ai_curiga, created_at) values
    (v_user_id, 'kurir-apk', 75, false, now() - interval '4 days'),
    (v_user_id, 'hadiah-palsu', 80, false, now() - interval '3 days'),
    (v_user_id, 'otp-bank', 85, false, now() - interval '2 days'),
    (v_user_id, 'lowongan-palsu', 90, false, now() - interval '1 day');

  -- 3. Pastikan Akun Demo Admin (admin@tangkissiber.id / admin123456)
  select id into v_admin_id from auth.users where email = 'admin@tangkissiber.id' limit 1;
  if v_admin_id is null then
    v_admin_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id, 'authenticated', 'authenticated',
      'admin@tangkissiber.id', crypt('admin123456', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nama_tampil":"Demo Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  else
    update auth.users
    set encrypted_password = crypt('admin123456', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_admin_id;
  end if;

  insert into public.profiles (id, nama_tampil, peran)
  values (v_admin_id, 'Demo Admin', 'admin')
  on conflict (id) do update
    set nama_tampil = 'Demo Admin',
        peran = 'admin';
end $$;
