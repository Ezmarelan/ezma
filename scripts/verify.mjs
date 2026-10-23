import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";

const base = "http://localhost:3100";
const c = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
let ep = null;
for (const p of c) { try { await readFile(p); ep = p; break; } catch { /* next */ } }
const browser = await chromium.launch({ executablePath: ep, headless: true });

let passes = 0;
let fails = 0;
const check = (name, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  pass ? passes++ : fails++;
};

// ── 1. 光标只在精确指针启用 ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    cursorOn: document.body.dataset.cursor === "on",
    cursorNone: getComputedStyle(document.body).cursor,
    ringExists: !!document.querySelector(".cursor-ring"),
  }));
  check("桌面启用自定义光标", r.cursorOn && r.cursorNone === "none", `cursor=${r.cursorNone}`);
  await ctx.close();
}

// ── 2. 触屏不启用光标 ──
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    cursorOn: document.body.dataset.cursor,
    ringDisplay: getComputedStyle(document.querySelector(".cursor-ring")).display,
    ringOpacity: getComputedStyle(document.querySelector(".cursor-root")).display,
  }));
  check("触屏不启用光标", r.cursorOn !== "on" && r.ringOpacity === "none", JSON.stringify(r));
  await ctx.close();
}

// ── 3. 移动端导航可用，触控目标 ≥44 ──
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const burger = await page.evaluate(() => {
    const b = document.querySelector(".nav-burger");
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { h: Math.round(r.height), visible: getComputedStyle(b).display !== "none" };
  });
  check("移动端显示菜单按钮", !!burger && burger.visible);
  check("菜单按钮触控 ≥44px", burger && burger.h >= 44, `h=${burger?.h}`);

  await page.locator(".nav-burger").click();
  await page.waitForTimeout(500);
  const opened = await page.evaluate(() => {
    const m = document.querySelector(".nav-mobile");
    return { open: m.dataset.open === "true", clip: getComputedStyle(m).clipPath };
  });
  check("点击展开菜单", opened.open);
  await ctx.close();
}

// ── 4. reduced-motion：hero 不 pin、不散开 ──
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const l2 = document.querySelector(".hero-layer--2");
    const slits = document.querySelectorAll(".hero-slit");
    const pinSpacer = document.querySelector(".pin-spacer");
    return {
      layer2Display: l2 ? getComputedStyle(l2).display : null,
      slitDisplay: slits[0] ? getComputedStyle(slits[0]).display : null,
      hasPin: !!pinSpacer,
      cursorOn: document.body.dataset.cursor,
    };
  });
  check("reduced-motion 收起叠印层", r.layer2Display === "none");
  check("reduced-motion 不 pin", !r.hasPin);
  check("reduced-motion 不启用光标", r.cursorOn !== "on");
  await ctx.close();
}

// ── 5. 键盘可达：skip link 与焦点 ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.keyboard.press("Tab");
  const first = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, cls: el?.className, text: el?.textContent?.trim().slice(0, 20) };
  });
  check("Tab 首个焦点是跳转链接", first.tag === "A" && /跳过|跳到/.test(first.text || ""), JSON.stringify(first));
  await ctx.close();
}

// ── 6. 滚动驱动：hero 确实随滚动变化 ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => {
    const s = document.querySelector(".hero-stack");
    return { t: getComputedStyle(s).transform, h: document.querySelector("[data-hero]").getBoundingClientRect().height };
  });
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => {
    const s = document.querySelector(".hero-stack");
    return { t: getComputedStyle(s).transform };
  });
  check("hero 随滚动发生位移", before.t !== after.t, `${before.t.slice(0, 30)} → ${after.t.slice(0, 30)}`);
  await ctx.close();
}

console.log(`\n${passes} passed, ${fails} failed`);
await browser.close();
process.exit(fails > 0 ? 1 : 0);
