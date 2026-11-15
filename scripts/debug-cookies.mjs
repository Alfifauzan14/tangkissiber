import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

page.on('response', resp => {
  const headers = resp.headers();
  const setCookie = headers['set-cookie'];
  if (setCookie) {
    console.log('SET-COOKIE from', resp.url(), ':', setCookie);
  }
});

await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
await page.fill('input[type="email"]', "demo@juri.com");
await page.fill('input[type="password"]', "demo123456");
await page.press('input[type="password"]', 'Enter');
await page.waitForURL("http://localhost:3000*", { timeout: 15000 });
await page.waitForTimeout(2000);

const cookies = await context.cookies();
console.log("\nAll cookies after login:");
cookies.forEach(c => {
  console.log(`  ${c.name}=${c.value.substring(0,50)}... (domain: ${c.domain}, httpOnly: ${c.httpOnly})`);
});

await browser.close();