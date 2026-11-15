import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

// Login first
await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
await page.fill('input[type="email"]', "demo@juri.com");
await page.fill('input[type="password"]', "demo123456");
await page.press('input[type="password"]', 'Enter');
await page.waitForURL("http://localhost:3000*", { timeout: 15000 });
await page.waitForTimeout(1000);

console.log("After login, URL:", page.url());

// Check nav
const navCount = await page.$$eval('a[href="/admin"]', els => els.length);
console.log("Admin nav links:", navCount);

// Check header for admin link
const headerContent = await page.content();
console.log("Header has 'Admin':", headerContent.includes("Admin"));

// Go to admin page
await page.goto("http://localhost:3000/admin", { waitUntil: "load" });
console.log("Admin URL:", page.url());

await page.waitForTimeout(2000);

const content = await page.content();
console.log("Content length:", content.length);
console.log("Has 'Panel Admin':", content.includes("Panel Admin"));
console.log("Has 'Total Pengguna':", content.includes("Total Pengguna"));
console.log("Has 'Pengguna':", content.includes("Pengguna"));
console.log("Has 'Peran':", content.includes("Peran"));

// Check for any error
console.log("Has 'unauthorized':", content.includes("unauthorized"));
console.log("Has 'redirect':", content.includes("redirect"));
console.log("Has 'Error':", content.includes("Error"));

// Check what's actually on the page
const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log("Body text preview:", bodyText);

await browser.close();