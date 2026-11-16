// Uji Playwright: 4 fitur baru (tombol Google, isi demo admin, admin CRUD UI, API cek pesan AI)
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
    passed++;
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
    failed++;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Tombol Google selalu tampil di /masuk
  await test("Masuk: tombol Google tampil", async () => {
    await page.goto(`${BASE}/masuk`, { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const count = await page.$$eval('button:has-text("Masuk dengan Google")', els => els.length);
    if (count === 0) throw new Error("Tombol Google tidak ditemukan");
  });

  // 2. Tombol isi demo admin mengisi email + sandi
  await test("Masuk: tombol isi demo admin", async () => {
    const email = await page.$eval('input[type="email"]', el => el.value);
    if (email) throw new Error("Email seharusnya kosong dulu");
    await page.click('button:has-text("Isi akun demo Admin")');
    await page.waitForTimeout(300);
    const isi = await page.evaluate(() => ({
      email: document.querySelector('input[type="email"]').value,
      sandi: document.querySelector('input[type="password"]').value,
    }));
    if (isi.email !== "demo@juri.com") throw new Error(`Email salah: ${isi.email}`);
    if (isi.sandi !== "demo123456") throw new Error("Sandi tidak terisi");
  });

  // 3. Login admin via tombol isi + Masuk
  await test("Masuk: login admin berhasil", async () => {
    await page.press('input[type="password"]', "Enter");
    await page.waitForURL(`${BASE}*`, { timeout: 15000 });
    await page.waitForTimeout(1500);
  });

  // 4. API cek pesan (fallback lokal karena tanpa GEMINI_API_KEY)
  await test("API cek pesan: respons ok dengan bentuk kartu", async () => {
    const res = await fetch(`${BASE}/api/cek-pesan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teks: "Selamat! Anda menang undian, bayar biaya kirim di bit.ly/xxx" }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`API gagal: ${JSON.stringify(data)}`);
    if (!["gemini", "lokal"].includes(data.sumber)) throw new Error(`sumber aneh: ${data.sumber}`);
    const h = data.hasil;
    if (!["aman", "waspada", "bahaya"].includes(h.tingkat)) throw new Error(`tingkat: ${h.tingkat}`);
    if (!Array.isArray(h.sinyal)) throw new Error("sinyal bukan array");
    if (!Array.isArray(h.saran)) throw new Error("saran bukan array");
    console.log(`   sumber=${data.sumber} tingkat=${h.tingkat} sinyal=${h.sinyal.length}`);
  });

  await test("API cek pesan: body kosong ditolak 400", async () => {
    const res = await fetch(`${BASE}/api/cek-pesan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teks: "" }),
    });
    if (res.status !== 400) throw new Error(`status: ${res.status}`);
  });

  // 5. Halaman cek pesan pakai API + label sumber
  await test("Cek pesan: form menghasilkan kartu via API", async () => {
    await page.goto(`${BASE}/cek-pesan`, { waitUntil: "load" });
    await page.fill("#pesan-masukan", "Kemenkeu: Anda diberi bantuan Rp 3 juta, klik link dan isi OTP untuk pencairan");
    await page.click('button:has-text("Periksa Pesan")');
    await page.waitForSelector("text=sinyal terdeteksi", { timeout: 20000 });
    const teks = await page.evaluate(() => document.body.innerText);
    if (!/Dianalisis AI Gemini|sinyal terdeteksi/.test(teks)) throw new Error("Kartu hasil tidak tampil");
  });

  // 6. Admin: tombol Riwayat membuka panel (DB belum ada policy delete, tapi tombol harus ada)
  await test("Admin: tombol Riwayat dan edit nama tampil", async () => {
    await page.goto(`${BASE}/admin`, { waitUntil: "load" });
    await page.waitForSelector('text="Panel Admin"', { timeout: 15000 });
    const btnRiwayat = await page.$$eval('button:has-text("Riwayat")', els => els.length);
    if (btnRiwayat === 0) throw new Error("Tombol Riwayat tidak ada");
    const btnNama = await page.$$eval('button[aria-label*="Ubah nama tampil"]', els => els.length);
    if (btnNama === 0) throw new Error("Tombol edit nama tidak ada");
  });

  // 7. Admin: klik Riwayat membuka panel dengan judul Riwayat
  await test("Admin: panel riwayat terbuka", async () => {
    await page.click('button:has-text("Riwayat")');
    await page.waitForSelector('button:has-text("Hapus semua riwayat")', { timeout: 15000 });
    const teks = await page.evaluate(() => document.body.innerText);
    if (!teks.includes("Hapus semua riwayat")) throw new Error("Tombol hapus semua tidak tampil");
  });

  await browser.close();
  console.log(`\n=== HASIL: ${passed} lulus, ${failed} gagal ===`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
