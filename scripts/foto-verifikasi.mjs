// Screenshot verifikasi visual Hari 4 (simpan ke .playwright-mcp, tidak di-commit)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
mkdirSync(".playwright-mcp", { recursive: true });
const browser = await chromium.launch();

// Tunggu font ikon + konten halaman benar-benar siap sebelum screenshot
async function tungguFont(page, tunggu = null) {
  if (tunggu) await page.waitForSelector(tunggu, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('24px "Material Symbols Rounded"'));
  await page.waitForTimeout(300);
}

// 1. Masuk dua kolom di 1440
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let page = await ctx.newPage();
await page.goto(BASE + "/masuk", { waitUntil: "load" });
await tungguFont(page, 'button[type="submit"]');
await page.screenshot({ path: ".playwright-mcp/masuk-1440.png" });
await page.close();
await ctx.close();

// 2. Drawer terbuka di 390 (halaman beranda)
ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "load" });
await tungguFont(page, 'button[aria-label="Buka menu navigasi"]');
await page.click('button[aria-label="Buka menu navigasi"]');
await page.waitForSelector('[role="dialog"]');
await page.screenshot({ path: ".playwright-mcp/drawer-390.png" });
await page.close();
await ctx.close();

// 3. Header mobile tertutup di 390
ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "load" });
await tungguFont(page, 'button[aria-label="Buka menu navigasi"]');
await page.screenshot({ path: ".playwright-mcp/beranda-390.png" });
await page.close();
await ctx.close();

// 4. Beranda desktop 1440
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "load" });
await tungguFont(page, 'a[href="/cek-pesan"]');
await page.screenshot({ path: ".playwright-mcp/beranda-1440.png" });
await page.close();
await ctx.close();

await browser.close();
console.log("OK: 4 screenshot tersimpan di .playwright-mcp/");

