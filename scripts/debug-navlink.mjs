// Debug: kenapa nav link admin tidak muncul di header setelah login
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

page.on("console", (msg) => console.log("PAGE:", msg.type(), msg.text().slice(0, 200)));
page.on("pageerror", (err) => console.log("PAGEERROR:", err.message.slice(0, 300)));

await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
await page.fill('input[type="email"]', "demo@juri.com");
await page.fill('input[type="password"]', "demo123456");
await page.press('input[type="password"]', "Enter");
await page.waitForURL("http://localhost:3000*", { timeout: 15000 });

// Tunggu lama sampai profil client termuat
await page.waitForTimeout(4000);

// Apa isi header?
const header = await page.evaluate(() => {
  const h = document.querySelector("header");
  return h ? h.innerText.replace(/\n+/g, " | ").slice(0, 300) : "NO HEADER";
});
console.log("HEADER:", header);

const navAdmin = await page.$$eval('a[href="/admin"]', (els) => els.length);
console.log("LINK /admin:", navAdmin);

// Query profil dari klien (sama dengan useSesi)
const profil = await page.evaluate(async () => {
  const mod = await import("/_next/static/chunks/pages/_app.js").catch(() => null);
  return null;
});
console.log("done");

await browser.close();
