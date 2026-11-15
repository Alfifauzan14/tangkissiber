// Test Google OAuth button conditional (should not show if provider not enabled)
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
await page.waitForTimeout(500);

// Check if button exists
const btnCount = await page.$$eval('button:has-text("Masuk dengan Google")', els => els.length);
console.log("Google button count:", btnCount);

// Run visual + a11y tests
const { chromium: cr } = await import("playwright");
const b = await cr.launch();
const pg = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await pg.goto("http://localhost:3000/", { waitUntil: "load" });
await pg.waitForTimeout(500);

// Run through all pages
const pages = ["/", "/masuk", "/cek-pesan", "/simulasi", "/kuis", "/pustaka", "/peringkat", "/darurat"];
let overflowFound = false;
for (const h of pages) {
  await pg.goto("http://localhost:3000" + h, { waitUntil: "load" });
  const over = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (over > 0) {
    console.log("OVERFLOW:", h, over);
    overflowFound = true;
  }
}
console.log("Overflow check:", overflowFound ? "FAIL" : "PASS");

// Touch targets
const pg2 = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await pg2.goto("http://localhost:3000/", { waitUntil: "load" });
const small = await pg2.evaluate(() =>
  [...document.querySelectorAll("header a, header button, footer a, footer button, [role='dialog'] a, [role='dialog'] button")]
    .filter(el => el.offsetParent !== null)
    .map(el => ({ el: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30), h: Math.round(el.getBoundingClientRect().height) }))
    .filter(t => t.h < 44)
);
console.log("Touch targets < 44px:", small.length === 0 ? "PASS" : "FAIL", small);

await b.close();