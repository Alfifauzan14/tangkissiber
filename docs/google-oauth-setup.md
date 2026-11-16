# Setup Google OAuth untuk Supabase Auth

## 1. Google Cloud Console

1. Buka https://console.cloud.google.com/
2. Buat project baru atau pilih existing: `tangkissiber-auth`
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Name: `TangkisSiber Web`
6. **Authorized JavaScript origins**:
   - `http://localhost:3000` (dev)
   - `https://tangkissiber.vercel.app` (production)
7. **Authorized redirect URIs** (di Google Cloud Console):
   - `https://fpmlbnhckvwsxtzzhmcn.supabase.co/auth/v1/callback`
8. Simpan → dapatkan **Client ID** dan **Client Secret**

## 2. Supabase Dashboard

1. Buka project `tangkissiber` di https://supabase.com/dashboard
2. **Authentication** → **Providers** → **Google** → **Enable**
3. Paste **Client ID** dan **Client Secret** dari Google Cloud → **Save**
4. **Authentication** → **URL Configuration** → **Redirect URLs**, tambahkan:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://domain-vercel-anda.vercel.app/auth/callback` (production)

## 3. Environment Variables (Vercel)

Tambah di Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://fpmlbnhckvwsxtzzhmcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sudah ada>
```
> Catatan: Supabase Auth menggunakan anon key yang sudah ada; tidak perlu env baru untuk Google OAuth.

## 4. Testing Local

1. `npm run dev`
2. Buka `http://localhost:3000/masuk`
3. Klik "Masuk dengan Google" → redirect ke Google → kembali ke `/` dengan session aktif

## 5. Catatan Implementasi

- Tombol "Masuk dengan Google" selalu tampil di `/masuk` (menampilkan pesan jelas jika provider Google belum aktif di Supabase)
- Menggunakan `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback?kembali=...' } })`
- Callback route: `src/app/auth/callback/route.js` menukar code menjadi session lalu meneruskan ke `/masuk?oauth=1&kembali=...` agar handoff skor tamu (`ts_hasil_tunda`) tersinkron otomatis sebelum redirect ke tujuan akhir

## 6. Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `redirect_uri_mismatch` | URI di Google Cloud ≠ Supabase | Pastikan sama persis (termasuk trailing slash) |
| `invalid_client` | Client ID/Secret salah | Copy ulang dari Google Cloud |
| `access_blocked` | App belum verified Google | Tambah test user di OAuth consent screen |
| Cookie/session hilang | `localhost` vs `127.0.0.1` | Pakai `localhost` konsisten |

---

**Status**: Dokumentasi siap. Implementasi UI → `src/app/masuk/page.js` + callback route.