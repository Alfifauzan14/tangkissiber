# Design Notes: Referensi Visual Pengguna

File ini untuk mencatat preferensi desain dari pengguna sebelum tahap perbagus (Hari 4).

---

## Format Catatan

Untuk setiap referensi yang dikirim, catat:

| Bidang | Isi |
|--------|-----|
| **Nama/Label** | Nama singkat (mis. "Hero Sekai", "Card Pinterest") |
| **Sumber** | URL / screenshot (simpan di `docs/design-ref/`) |
| **Aspek yang Disukai** | Warna / Tipografi / Spasi / Radius / Komponen / Motion / Layout |
| **Catatan Khusus** | Detail apa yang ingin diadopsi / dihindari |

---

## Daftar Referensi (akan diisi pengguna)

### 1. Halaman Masuk/Daftar (disetujui 16 Nov 2026)
- **Sumber:** `docs/design-ref/login dan daftar.png`
- **Aspek:** Layout dua kolom; kiri form (ikon kotak biru + grid samar, judul, input dengan ikon di dalam, baris "ingat saya" + lupa sandi, tombol primary full-width); kanan panel gradien biru muda radius besar dengan judul (satu frasa disorot), ilustrasi orbit, titik indikator, caption
- **Catatan:** Baris "login with" sosial TIDAK diadopsi (fitur ditunda PRD §5.2). Spesifikasi final di DESIGN.md §11.9.

### 2. Nav Mobile: Drawer Terbuka (disetujui 16 Nov 2026)
- **Sumber:** `docs/design-ref/nav mobile.png`
- **Aspek:** Drawer layar penuh; bar biru dengan wordmark putih + tombol X kotak putih; daftar halaman per baris dengan garis pemisah, tinggi baris lega
- **Catatan:** Daftar item mengikuti halaman TangkisSiber (Beranda, Cek Pesan, Simulasi, Kuis, Pustaka, Peringkat), bukan item referensi. Plus baris darurat dan tombol Masuk/Keluar di bawah. Spesifikasi di DESIGN.md §9.1.

### 3. Nav Mobile: Header Tertutup (disetujui 16 Nov 2026)
- **Sumber:** `docs/design-ref/nav mobile (2).png`
- **Aspek:** Bilah biru sticky, wordmark putih kiri, tombol hamburger kotak membulat kanan
- **Catatan:** Tombol hamburger latar putih 15% transparan, ikon putih. Menggantikan keputusan chip gulir 14 Nov.

---

## Preferensi Global (ringkasan)

| Token | Preferensi | Catatan |
|-------|------------|---------|
| Primary hue | `#01239C` (biru royal) + tint `#EEF2FF`/`#DBEAFE` | Kontras AA terjaga di atas surface |
| Radius scale | Tombol/input 12px, Kartu 16px, Panel 24px | Tombol tidak pil |
| Spacing scale | Skala 4px, gutter 20/24/32px | Sesuai DESIGN.md §5 |
| Motion level | MOTION 1 (lift 2px, fade 150-200ms, tanpa animasi scroll) | `prefers-reduced-motion` menghentikan semua |
| Font weight heading | Poppins 600/700 | Satu keluarga untuk semua UI |
| Shadow style | Satu tingkat saat diam (`--shadow-card`), menguat saat hover (`--shadow-card-hover`) | Kartu tertaut saja |

---

## Aturan Keras (tidak bisa diubah)

Sistem warna risiko 3-status (Aman/Waspada/Bahaya) **wajib dijaga** karena identitas fungsional produk. Referensi hanya boleh mempengaruhi:
- Warna primary/netral/aksen
- Tipografi, spacing, radius, shadow
- Layout & komposisi halaman
- Gaya interaksi (hover, focus, transition)

---

*File ini akan diupdate saat pengguna mengirim referensi. Setelah lengkap, DESIGN.md akan diperbarui ke v1.1.*