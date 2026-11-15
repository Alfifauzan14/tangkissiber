import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
await page.fill('input[type="email"]', "demo@juri.com");
await page.fill('input[type="password"]', "demo123456");
await page.press('input[type="password"]', 'Enter');
await page.waitForURL("http://localhost:3000*", { timeout: 15000 });
await page.waitForTimeout(1000);

const cookies = await context.cookies();
const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
console.log("Cookie header length:", cookieHeader.length);

// Test kuis API
const res = await fetch("http://localhost:3000/api/kuis/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
  body: JSON.stringify({ jawaban: { "s01": 1, "s02": 2, "s03": 2, "s04": 1, "s05": 2, "s06": 1, "s07": 0, "s08": 0, "s09": 1, "s10": 2 }, timing: { mulai: Date.now()-60000, selesai: Date.now(), perSoal: {} } }),
});
console.log("Response status:", res.status);
const data = await res.json();
console.log("Response:", JSON.stringify(data, null, 2));

await browser.close();