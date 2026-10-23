import { chromium } from "playwright-core";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL || "http://localhost:3100";
const out = path.join(process.cwd(), "shots");
await mkdir(out, { recursive: true });

const candidates = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
let executablePath = null;
for (const c of candidates) {
  try { await readFile(c); executablePath = c; break; } catch { /* next */ }
}
if (!executablePath) throw new Error("no browser");

const browser = await chromium.launch({ executablePath, headless: true });

const jobs = [
  { name: "home-top", url: "/", w: 1440, h: 900, scroll: 0 },
  { name: "home-scrolled", url: "/", w: 1440, h: 900, scroll: 0.55 },
  { name: "home-index", url: "/", w: 1440, h: 900, scroll: 1.55 },
  { name: "notes", url: "/notes", w: 1440, h: 900, scroll: 0 },
  { name: "article", url: "/notes/relic-01", w: 1440, h: 900, scroll: 0 },
  { name: "about", url: "/about", w: 1440, h: 900, scroll: 0 },
  { name: "works", url: "/works", w: 1440, h: 900, scroll: 0 },
  { name: "mobile-home", url: "/", w: 390, h: 844, scroll: 0 },
  { name: "mobile-notes", url: "/notes", w: 390, h: 844, scroll: 0 },
];

const errors = [];

for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: j.w, height: j.h },
    locale: "zh-CN",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${j.name}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${j.name} console: ${m.text()}`);
  });

  await page.goto(`${base}${j.url}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(900);

  if (j.scroll) {
    // 用 Lenis 的滚动接口，别用 window.scrollTo（会被 lenis 覆盖）
    await page.evaluate(async (frac) => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const target = h * frac;
      // 直接写 lenis 实例不可达，改用滚动事件循环
      window.scrollTo(0, target);
      await new Promise((r) => setTimeout(r, 900));
    }, j.scroll);
    await page.waitForTimeout(700);
  }

  await page.screenshot({ path: path.join(out, `${j.name}.png`) });
  console.log(`shot ${j.name}`);
  await ctx.close();
}

if (errors.length) {
  console.log("ERRORS:");
  for (const e of [...new Set(errors)].slice(0, 12)) console.log("  " + e);
} else {
  console.log("no page errors");
}

await browser.close();
