// Test Dark Mode di Mobile Drawer
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.goto("http://localhost:3000/", { waitUntil: "load" });
await page.waitForSelector('button[aria-label="Buka menu navigasi"]');

// Buka drawer
await page.click('button[aria-label="Buka menu navigasi"]');
await page.waitForSelector('[role="dialog"]');

// Cari toggle di drawer
await page.waitForSelector('[role="dialog"] button[aria-label*="mode"]');
const drawerHtmlClass = await page.evaluate(() => document.documentElement.className);
console.log("Drawer initial html class:", drawerHtmlClass);

// Toggle di drawer
await page.click('[role="dialog"] button[aria-label*="mode"]');
await page.waitForTimeout(300);

const drawerHtmlAfter = await page.evaluate(() => document.documentElement.className);
console.log("Drawer after toggle html class:", drawerHtmlAfter);

const tema = await page.evaluate(() => localStorage.getItem("tema"));
console.log("localStorage tema:", tema);

await browser.close();