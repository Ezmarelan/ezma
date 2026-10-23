"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 滚动内核：Lenis 负责平滑滚动，GSAP 的 ticker 负责驱动它。
 *
 * ── 为什么必须挂在 gsap.ticker 上 ──
 *
 * 常见错误是 Lenis 自己用 requestAnimationFrame 跑，GSAP 用另一个
 * rAF 跑。两条独立的时间线，同一个滚动量在两帧里读到不同的值：
 * 表现是 ScrollTrigger 的触发点总比视觉慢半拍，粘性元素会抖。
 *
 * 正确做法只有一个帧循环：gsap.ticker 调 lenis.raf(time*1000)，
 * 然后用 ScrollTrigger.update 把滚动量同步给它。这样 DOM、GSAP、
 * Lenis 在同一帧里读同一个 scrollY。
 *
 * ── 为什么用 autoRaf: false ──
 *
 * Lenis 默认自带 rAF。设成 false 才轮到我们自己的 ticker 驱动它。
 *
 * ── 与原生滚动的兼容 ──
 *
 * 只接管滚动，不接管锚点：hashes 交给浏览器；scrollTo 走 Lenis，
 * 但保留 native 的可见性语义（focus 触发的滚动不能被平滑掉，
 * 否则键盘用户会失去定位感）。
 */

/** 全局单例，供组件读取当前滚动进度。 */
let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function ScrollCore() {
  useEffect(() => {
    // 减少动态：完全不用平滑滚动，保留浏览器原生行为。
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      document.documentElement.dataset.reducedMotion = "";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      // 触控板用户对平滑不敏感，鼠标滚轮才明显。用 lerp 更跟手。
      lerp: 0.092,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Lenis 自带的 rAF 关掉，改由 gsap.ticker 驱动（见下）。
      autoRaf: false,
      // 尊重系统的减少动态。
      smoothWheel: true,
    });

    lenisInstance = lenis;

    // Lenis 滚动时通知 ScrollTrigger：每一帧都要。
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      // gsap.ticker 给的是秒，Lenis 要毫秒。
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(300, 33);

    /*
     * .lenis-stopped 会把 html 的 overflow 改成 hidden，可 ScrollTrigger
     * 在容器尺寸变化后需要重算。开屏锁滚动之后要 refresh 一次，
     * 否则 hero 的 pin 距离是整个视口高度算错的。
     */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("ezma:refresh", refresh);

    /*
     * 字体加载完成后 pin 距离会变（行高变了），必须重算。
     * document.fonts.ready 是唯一可靠的时机。
     */
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("ezma:refresh", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}

/** 手动刷新（开屏结束、路由切换后调用）。 */
export function refreshScroll() {
  window.dispatchEvent(new Event("ezma:refresh"));
}

/** 锁定/解锁滚动，用于开屏与页面过渡。 */
export function lockScroll(locked: boolean) {
  const lenis = lenisInstance;
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
