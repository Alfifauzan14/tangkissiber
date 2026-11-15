// Retake drawer screenshot setelah animasi fade selesai (600ms)
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.goto("http://localhost:3000/", { waitUntil: "load" });
await page.waitForSelector('button[aria-label="Buka menu navigasi"]');
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.fonts.load('24px "Material Symbols Rounded"'));
await page.click('button[aria-label="Buka menu navigasi"]');
await page.waitForSelector('[role="dialog"]');
await page.waitForTimeout(600);
await page.screenshot({ path: ".playwright-mcp/drawer-390.png" });
await browser.close();
console.log("OK");
