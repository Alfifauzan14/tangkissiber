// Simple test - single feature
import { chromium } from "playwright";

async function main() {
  console.log("Testing dark mode toggle...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/", { waitUntil: "load" });
  await page.waitForTimeout(500);

  const cls1 = await page.evaluate(() => document.documentElement.className);
  console.log("Initial class:", cls1);

  await page.click('button[aria-label*="mode"]');
  await page.waitForTimeout(300);

  const cls2 = await page.evaluate(() => document.documentElement.className);
  console.log("After toggle:", cls2);

  const stored = await page.evaluate(() => localStorage.getItem("tema"));
  console.log("localStorage:", stored);

  await browser.close();
  console.log("Done");
}

main().catch(e => { console.error(e); process.exit(1); });