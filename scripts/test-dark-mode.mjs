// Test Dark Mode Toggle
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto("http://localhost:3000/", { waitUntil: "load" });
await page.waitForSelector('button[aria-label*="mode"]');

const htmlClass = await page.evaluate(() => document.documentElement.className);
console.log("Initial html class:", htmlClass);

await page.click('button[aria-label*="mode"]');
await page.waitForTimeout(300);

const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
console.log("After toggle html class:", htmlClassAfter);

const tema = await page.evaluate(() => localStorage.getItem("tema"));
console.log("localStorage tema:", tema);

await page.click('button[aria-label*="mode"]');
await page.waitForTimeout(300);

const htmlClassBack = await page.evaluate(() => document.documentElement.className);
console.log("After second toggle html class:", htmlClassBack);

await browser.close();