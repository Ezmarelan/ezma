import { chromium } from "playwright-core";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const out = path.join(process.cwd(), "shots");
await mkdir(out, { recursive: true });
const c = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
let ep = null;
for (const p of c) { try { await readFile(p); ep = p; break; } catch { /* next */ } }

const browser = await chromium.launch({ executablePath: ep, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "zh-CN" });
const page = await ctx.newPage();
await page.goto("http://localhost:3100/notes", { waitUntil: "networkidle" });
await page.waitForTimeout(900);

// 点第一篇文章，并在过渡进行中抓帧
await page.locator(".index-row").first().click();

const frames = [];
for (const ms of [90, 180, 280, 380, 500, 700]) {
  await page.waitForTimeout(ms === 90 ? 90 : 60);
  const veil = await page.evaluate(() => {
    const el = document.querySelector(".veil");
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { display: cs.display, clip: cs.clipPath };
  });
  frames.push({ t: ms, veil });
  await page.screenshot({ path: path.join(out, `trans-${String(ms).padStart(3, "0")}.png`) });
}

console.log(JSON.stringify(frames, null, 1));
await page.waitForTimeout(1500);
console.log("final url:", page.url());
await browser.close();
