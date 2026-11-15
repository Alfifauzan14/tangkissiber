// Comprehensive E2E Test for All 6 Post-v1.0 Features
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    failed++;
  }
}

async function getAuthCookies(context) {
  const cookies = await context.cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // ===== 1. DARK MODE =====
  await test("Dark Mode: initial light", async () => {
    await page.goto(BASE, { waitUntil: "load" });
    const cls = await page.evaluate(() => document.documentElement.className);
    if (!cls.includes("light")) throw new Error(`Expected light, got: ${cls}`);
  });

  await test("Dark Mode: toggle to dark", async () => {
    await page.click('button[aria-label*="mode"]');
    await page.waitForTimeout(200);
    const cls = await page.evaluate(() => document.documentElement.className);
    if (!cls.includes("dark")) throw new Error(`Expected dark, got: ${cls}`);
    const stored = await page.evaluate(() => localStorage.getItem("tema"));
    if (stored !== "dark") throw new Error(`localStorage not dark: ${stored}`);
  });

  await test("Dark Mode: toggle back to light", async () => {
    await page.click('button[aria-label*="mode"]');
    await page.waitForTimeout(200);
    const cls = await page.evaluate(() => document.documentElement.className);
    if (!cls.includes("light")) throw new Error(`Expected light, got: ${cls}`);
  });

  await test("Dark Mode: prefers-color-scheme dark", async () => {
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE, { waitUntil: "load" });
    await p2.waitForTimeout(300);
    const cls = await p2.evaluate(() => document.documentElement.className);
    if (!cls.includes("dark")) throw new Error(`Expected dark from media query, got: ${cls}`);
    await ctx2.close();
  });

  await test("Dark Mode: drawer toggle works", async () => {
    const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p3 = await ctx3.newPage();
    await p3.goto(BASE, { waitUntil: "load" });
    await p3.click('button[aria-label="Buka menu navigasi"]');
    await p3.waitForSelector('[role="dialog"]');
    await p3.click('[role="dialog"] button[aria-label*="mode"]');
    await p3.waitForTimeout(200);
    const cls = await p3.evaluate(() => document.documentElement.className);
    if (!cls.includes("dark")) throw new Error(`Drawer toggle failed: ${cls}`);
    await ctx3.close();
  });

  // ===== 2. GOOGLE OAUTH =====
  await test("Google OAuth: button hidden when env not set", async () => {
    await page.goto(`${BASE}/masuk`, { waitUntil: "load" });
    const count = await page.$$eval('button:has-text("Masuk dengan Google")', els => els.length);
    if (count !== 0) throw new Error(`Google button should be hidden, found ${count}`);
  });

  // ===== 3. AUTH FLOW (login demo) =====
  await test("Auth: login demo user", async () => {
    await page.goto(`${BASE}/masuk`, { waitUntil: "load" });
    await page.fill('input[type="email"]', "demo@juri.com");
    await page.fill('input[type="password"]', "demo123456");
    // Press Enter on password field to trigger form submit (click doesn't work)
    await page.press('input[type="password"]', 'Enter');
    // Wait for redirect to home
    await page.waitForURL(`${BASE}*`, { timeout: 15000 });
    // Give time for session cookies to be set
    await page.waitForTimeout(2000);
  });

  // ===== 3. KUIS SUBMIT API =====
  await test("Kuis API: submit returns score", async () => {
    const cookieHeader = await getAuthCookies(context);
    const res = await fetch(`${BASE}/api/kuis/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ jawaban: { "s01": 1, "s02": 2, "s03": 2, "s04": 1, "s05": 2, "s06": 1, "s07": 0, "s08": 0, "s09": 1, "s10": 2 }, timing: { mulai: Date.now()-60000, selesai: Date.now(), perSoal: {} } }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`Kuis submit failed: ${JSON.stringify(data)}`);
    if (typeof data.skor !== "number") throw new Error(`No skor in response`);
    console.log(`   Skor: ${data.skor}, ai_curiga: ${data.ai_curiga}`);
  });

  // ===== 3. SIMULASI SUBMIT API =====
  await test("Simulasi API: submit returns score", async () => {
    const cookieHeader = await getAuthCookies(context);
    const res = await fetch(`${BASE}/api/simulasi/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ skenario_id: "kurir-apk", jawaban: { "0": { nilai: "aman" }, "1": { nilai: "aman" }, "2": { nilai: "aman" }, "3": { nilai: "aman" } }, timing: { mulai: Date.now()-30000, selesai: Date.now(), perLangkah: {} } }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`Simulasi submit failed: ${JSON.stringify(data)}`);
    if (typeof data.skor !== "number") throw new Error(`No skor in response`);
    console.log(`   Skor: ${data.skor}, ai_curiga: ${data.ai_curiga}`);
  });

  // ===== 4. ADMIN PAGE =====
  await test("Admin: page accessible for admin user", async () => {
    await page.goto(`${BASE}/admin`, { waitUntil: "load" });
    if (page.url().includes("?error=unauthorized")) throw new Error("Admin redirected - not recognized as admin");
    // Wait for client-side content to load (Suspense)
    await page.waitForSelector('text="Panel Admin"', { timeout: 10000 });
    const content = await page.content();
    if (!content.includes("Panel Admin")) throw new Error("Admin content not found");
    if (!content.includes("Total Pengguna")) throw new Error("Stats not found");
  });

  await test("Admin: nav link visible", async () => {
    await page.goto(BASE, { waitUntil: "load" });
    // Nav link only visible for admin users - wait for client-side profile load
    // Wait for user avatar in header which indicates profile is loaded
    await page.waitForSelector('a[href="/riwayat"]', { timeout: 10000 });
    await page.waitForTimeout(1000);
    // Check if admin link exists in DOM (desktop nav or drawer)
    const navCount = await page.$$eval('a[href="/admin"]', els => els.length);
    if (navCount === 0) throw new Error("Admin nav link not visible");
  });

  await test("Admin: can see user list with role dropdown", async () => {
    await page.goto(`${BASE}/admin`, { waitUntil: "load" });
    // Wait for client-side content
    await page.waitForSelector('text="Panel Admin"', { timeout: 10000 });
    const content = await page.content();
    if (!content.includes("Pengguna") || !content.includes("Peran")) throw new Error("User table not rendered");
    const selects = await page.$$eval('select', els => els.length);
    if (selects === 0) throw new Error("Role dropdown not found");
  });

  await test("Admin: API verify returns admin=true", async () => {
    const cookieHeader = await getAuthCookies(context);
    const res = await fetch(`${BASE}/api/admin/verify`, { headers: { "Cookie": cookieHeader } });
    const data = await res.json();
    if (!data.admin) throw new Error(`Admin verify failed: ${JSON.stringify(data)}`);
  });

  // ===== 5. AI DETECTION =====
  await test("AI Detection: kuis returns ai_curiga flag for fast submit", async () => {
    const cookieHeader = await getAuthCookies(context);
    const res = await fetch(`${BASE}/api/kuis/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ jawaban: { "s01": 1, "s02": 2, "s03": 2, "s04": 1, "s05": 2, "s06": 1, "s07": 0, "s08": 0, "s09": 1, "s10": 2 }, timing: { mulai: Date.now()-5000, selesai: Date.now(), perSoal: {} } }),
    });
    const data = await res.json();
    if (data.ai_curiga !== true) throw new Error(`Expected ai_curiga=true for fast submit, got: ${data.ai_curiga}`);
    console.log(`   ✓ Fast submit correctly flagged ai_curiga=true`);
  });

  await test("AI Detection: simulasi returns ai_curiga flag for fast submit", async () => {
    const cookieHeader = await getAuthCookies(context);
    const res = await fetch(`${BASE}/api/simulasi/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ skenario_id: "kurir-apk", jawaban: { "0": { nilai: "aman" }, "1": { nilai: "aman" }, "2": { nilai: "aman" }, "3": { nilai: "aman" } }, timing: { mulai: Date.now()-2000, selesai: Date.now(), perLangkah: {} } }),
    });
    const data = await res.json();
    if (data.ai_curiga !== true) throw new Error(`Expected ai_curiga=true for fast submit, got: ${data.ai_curiga}`);
    console.log(`   ✓ Fast submit correctly flagged ai_curiga=true`);
  });

  await test("AI Detection: normal timing returns ai_curiga=false", async () => {
    const cookieHeader = await getAuthCookies(context);
    const res = await fetch(`${BASE}/api/kuis/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ jawaban: { "s01": 1, "s02": 2, "s03": 2, "s04": 1, "s05": 2, "s06": 1, "s07": 0, "s08": 0, "s09": 1, "s10": 2 }, timing: { mulai: Date.now()-120000, selesai: Date.now(), perSoal: {} } }),
    });
    const data = await res.json();
    if (data.ai_curiga !== false) throw new Error(`Expected ai_curiga=false for normal timing, got: ${data.ai_curiga}`);
    console.log(`   ✓ Normal timing correctly ai_curiga=false`);
  });

  // ===== 6. RATE LIMIT =====
  await test("Rate Limit: blocks after 5 requests", async () => {
    const cookieHeader = await getAuthCookies(context);
    let blocked = false;
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${BASE}/api/kuis/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
        body: JSON.stringify({ jawaban: { "s01": 1 }, timing: { mulai: Date.now(), selesai: Date.now(), perSoal: {} } }),
      });
      if (res.status === 429) { blocked = true; break; }
    }
    if (!blocked) throw new Error("Rate limit not triggered after 7 requests");
    console.log(`   ✓ Rate limit working`);
  });

  // ===== NON-ADMIN REDIRECT =====
  await test("Admin: non-admin redirected", async () => {
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p2 = await ctx2.newPage();
    await p2.goto(`${BASE}/admin`, { waitUntil: "load" });
    if (!p2.url().includes("?error=unauthorized")) throw new Error(`Non-admin not redirected: ${p2.url()}`);
    await ctx2.close();
  });

  // ===== SUMMARY =====
  await browser.close();
  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });