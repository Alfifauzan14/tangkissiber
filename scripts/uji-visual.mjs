// Uji visual & aksesibilitas Hari 4 T3 (docs/TASKS.md):
// 1. Lima breakpoint (320/390/768/1024/1440) di 8 halaman: nol overflow-x.
// 2. Target sentuh >= 44px di header, drawer, dan footer.
// 3. Drawer mobile terbuka/tutup (klik hamburger, Esc).
// 4. Fokus keyboard terlihat (:focus-visible punya outline).
// 5. prefers-reduced-motion: transisi berhenti.
// Jalankan: node scripts/uji-visual.mjs  (server harus jalan di :3000)
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const LEBAR = [320, 390, 768, 1024, 1440];
const HALAMAN = ["/", "/masuk", "/cek-pesan", "/simulasi", "/kuis", "/pustaka", "/peringkat", "/darurat"];

const browser = await chromium.launch();
const laporan = { overflow: [], sentuh: [], drawer: null, fokus: null, reducedMotion: null };

// 1. Overflow per breakpoint per halaman
for (const lebar of LEBAR) {
  const ctx = await browser.newContext({ viewport: { width: lebar, height: 900 } });
  const page = await ctx.newPage();
  for (const h of HALAMAN) {
    await page.goto(BASE + h, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (over > 0) laporan.overflow.push({ lebar, halaman: h, over });
  }
  await ctx.close();
}

// 2-3. Target sentuh + drawer di mobile (390px)
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  const ukur = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("header a, header button, footer a, footer button")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({
          el: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30),
          w: Math.round(el.getBoundingClientRect().width),
          h: Math.round(el.getBoundingClientRect().height),
        }))
        .filter((t) => t.h < 44 || t.w < 44)
    );
  laporan.sentuh = await ukur();

  // Drawer: buka
  await page.click('button[aria-label="Buka menu navigasi"]');
  const drawer = page.locator('[role="dialog"]');
  const terbuka = await drawer.isVisible();
  const terkunci = await page.evaluate(() => document.body.style.overflow === "hidden");
  const fokusX = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") === "Tutup menu navigasi"
  );
  // Esc: tutup
  await page.keyboard.press("Escape");
  const tertutup = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  const fokusKembali = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") === "Buka menu navigasi"
  );
  laporan.drawer = { terbuka, terkunci, fokusX, tertutup, fokusKembali };

  // Target sentuh di dalam drawer (buka lagi setelah uji Esc)
  await page.click('button[aria-label="Buka menu navigasi"]');
  const kecilDrawer = await page.evaluate(() =>
    [...document.querySelectorAll('[role="dialog"] a, [role="dialog"] button')]
      .map((el) => ({
        el: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30),
        h: Math.round(el.getBoundingClientRect().height),
      }))
      .filter((t) => t.h < 44)
  );
  laporan.sentuh.push(...kecilDrawer.map((t) => ({ ...t, konteks: "drawer" })));
  await ctx.close();
}

// 4. Fokus keyboard terlihat (outline --accent) di halaman beranda
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const fokus = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { tag: el.tagName, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor };
  });
  laporan.fokus = fokus;
  await ctx.close();
}

// 5. prefers-reduced-motion: transisi kartu berhenti
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/simulasi", { waitUntil: "load" });
  const durasi = await page.evaluate(() => {
    const kartu = document.querySelector("main .rounded-lg");
    return kartu ? getComputedStyle(kartu).transitionDuration : "tidak ada kartu";
  });
  laporan.reducedMotion = { transitionDuration: durasi };
  await ctx.close();
}

await browser.close();

let gagal = false;
if (laporan.overflow.length) { console.log("OVERFLOW-X DITEMUKAN:", JSON.stringify(laporan.overflow, null, 2)); gagal = true; }
else console.log("OK: nol overflow-x di semua breakpoint/halaman");
if (laporan.sentuh.length) { console.log("TARGET SENTUH < 44px:", JSON.stringify(laporan.sentuh, null, 2)); gagal = true; }
else console.log("OK: semua target sentuh >= 44px");
console.log("Drawer:", JSON.stringify(laporan.drawer));
if (!laporan.drawer?.terbuka || !laporan.drawer?.terkunci || !laporan.drawer?.tertutup) gagal = true;
console.log("Fokus:", JSON.stringify(laporan.fokus));
if (laporan.fokus?.outlineWidth === "0px") gagal = true;
console.log("Reduced motion:", JSON.stringify(laporan.reducedMotion));
process.exit(gagal ? 1 : 0);
