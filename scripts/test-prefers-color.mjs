// Test prefers-color-scheme media query
import { chromium } from "playwright";

const browser = await chromium.launch();

// Test dengan prefers-color-scheme: dark
const contextDark = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  colorScheme: "dark"
});
const pageDark = await contextDark.newPage();
await pageDark.goto("http://localhost:3000/", { waitUntil: "load" });
await pageDark.waitForTimeout(500);

const htmlDark = await pageDark.evaluate(() => document.documentElement.className);
console.log("With prefers-color-scheme: dark, html class:", htmlDark);

const temaDark = await pageDark.evaluate(() => localStorage.getItem("tema"));
console.log("localStorage tema (should be null initially):", temaDark);
await contextDark.close();

// Test dengan prefers-color-scheme: light
const contextLight = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  colorScheme: "light"
});
const pageLight = await contextLight.newPage();
await pageLight.goto("http://localhost:3000/", { waitUntil: "load" });
await pageLight.waitForTimeout(500);

const htmlLight = await pageLight.evaluate(() => document.documentElement.className);
console.log("With prefers-color-scheme: light, html class:", htmlLight);

await browser.close();