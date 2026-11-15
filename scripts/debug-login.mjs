import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
page.on('response', resp => {
  if (resp.url().includes('supabase') || resp.url().includes('auth') || resp.url().includes('login')) {
    console.log('RESPONSE:', resp.url(), resp.status());
  }
});

await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
console.log("Page loaded");

await page.fill('input[type="email"]', "demo@juri.com");
await page.fill('input[type="password"]', "demo123456");
console.log("Filled form");

// Try pressing Enter on password field to trigger form submit
await page.press('input[type="password"]', 'Enter');
console.log("Pressed Enter on password field");

// Wait and check URL
await page.waitForTimeout(8000);
console.log("Current URL:", page.url());

const cookies = await context.cookies();
console.log("Cookies:", cookies.map(c => `${c.name}=${c.value.substring(0,20)}...`).join("; "));

// Check page content
const bodyText = await page.evaluate(() => document.body.innerText);
console.log("Body contains 'salah':", bodyText.includes("salah"));
console.log("Body contains 'Error':", bodyText.includes("Error"));
console.log("Body contains 'Terjadi':", bodyText.includes("Terjadi"));
console.log("Body contains 'Memproses':", bodyText.includes("Memproses"));

await browser.close();