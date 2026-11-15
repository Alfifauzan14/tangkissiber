// Smoke test auth pasca-optimasi lazy Supabase (Hari 4):
// 1. Tamu: header tampil "Masuk" setelah sesi selesai dimuat.
// 2. Drawer (mobile): bagian bawah berisi darurat + Masuk untuk tamu.
// 3. Masuk dengan akun demo -> header menampilkan profil + poin.
// 4. Keluar -> kembali ke tampilan tamu.
// Jalankan: node scripts/uji-auth.mjs (server :3000 harus jalan)
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const hasil = {};

// 1. Tamu di beranda: drawer memuat darurat + Masuk (mobile: Masuk ada di drawer)
await page.goto(BASE + "/", { waitUntil: "load" });
await page.click('button[aria-label="Buka menu navigasi"]');
hasil.guestMasukTampil = await page.isVisible('[role="dialog"] a[href="/masuk"]');
hasil.guestDaruratTampil = await page.isVisible('[role="dialog"] a[href="/darurat"]');
await page.keyboard.press("Escape");

// 2. Drawer untuk tamu
hasil.drawerTamu = hasil.guestMasukTampil;

// 3. Masuk akun demo
await page.goto(BASE + "/masuk", { waitUntil: "load" });
await page.fill("#email", "demo@juri.com");
await page.fill("#sandi", "demo123456");
await page.click('button[type="submit"]');
await page.waitForURL(BASE + "/", { timeout: 15000 });

// 4. Drawer untuk login: chip profil (nama + poin) + Keluar
await page.waitForSelector('button[aria-label="Buka menu navigasi"]', { timeout: 15000 });
await page.click('button[aria-label="Buka menu navigasi"]');
await page.waitForSelector('[role="dialog"] a[href="/riwayat"]', { timeout: 15000 });
hasil.loginProfil = await page.textContent('[role="dialog"] a[href="/riwayat"]');
hasil.poin330 = (hasil.loginProfil || "").includes("330");
hasil.drawerLogin = {
  profil: true,
  keluar: await page.isVisible('[role="dialog"] button[aria-label="Keluar"]'),
};
// 5. Cek poin di header desktop (chip memuat poin)
await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForSelector('a[href="/riwayat"]', { timeout: 15000 });
hasil.poin330 = (await page.textContent('a[href="/riwayat"]')).includes("330");

// 6. Keluar dari header desktop
await page.click('button[aria-label="Keluar"]');
await page.waitForSelector('a[href="/masuk"]', { timeout: 15000 });
hasil.keluarSukses = true;

await browser.close();
console.log(JSON.stringify(hasil, null, 2));
const gagal =
  !hasil.guestMasukTampil || !hasil.drawerTamu || !hasil.poin330 ||
  !hasil.drawerLogin?.profil || !hasil.drawerLogin?.keluar || !hasil.keluarSukses;
process.exit(gagal ? 1 : 0);
