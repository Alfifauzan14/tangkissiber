// Test Google OAuth button render
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto("http://localhost:3000/masuk", { waitUntil: "load" });
await page.waitForSelector('button:has-text("Masuk dengan Google")');

const exists = await page.$eval('button:has-text("Masuk dengan Google")', el => true);
console.log("Google button exists:", exists);

const html = await page.$eval('button:has-text("Masuk dengan Google")', el => el.outerHTML);
console.log("Button HTML:", html);

await browser.close();