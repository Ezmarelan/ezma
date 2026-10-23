"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * 页面过渡：擦除（erase），不是淡入淡出。
 *
 * 动作分两拍：
 *
 *   ① 旧页被「擦掉」——一块纸色的矩形从下往上扫过视口，同时旧内容
 *      所在的那层被 clip-path 收成一条线。观感上像有人用橡皮从下往上
 *      擦掉这一页。
 *
 *   ② 新页从**同一个视觉锚点**长出来——不再是整屏换掉，而是从擦除线
 *      停留的位置向上展开。
 *
 * 为什么用 clip-path 而不是 shader：这里的过渡只需要「一条扫描线」，
 * clip-path: inset() 一个属性就能表达，且在合成层上跑，不需要 WebGL
 * 上下文。路径 C 的项目才值得为过渡养一个 canvas。
 *
 * 可中断：连续点击时旧 timeline 被 kill，新的一拍立刻接管，
 * 不会出现「两个遮罩叠在一起」。
 *
 * 与开屏的区别：开屏只播一次，过渡每次导航都播——所以这里的时长必须
 * 短得多（总共 620ms，开屏是 2200ms）。
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const veilRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const pendingRef = useRef<string | null>(null);

  /** ① 退出：擦除。返回一条已完成的时间轴。 */
  const cover = useCallback(() => {
    const veil = veilRef.current;
    if (!veil) return null;

    tlRef.current?.kill();

    const tl = gsap.timeline();
    tl.set(veil, { display: "block" })
      /*
       * 从底边扫上来：inset(top right bottom left)。
       * 起始时 100% 在 top，意味着整块不可见；扫到 0 就铺满。
       */
      .fromTo(
        veil,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.32,
          ease: "power3.inOut",
        },
      )
      /*
       * 扫描亮线：一条 2px 的 rust 色横线跟着擦除线上移。
       * 它是「橡皮的边缘」，不是装饰——有它，擦除才有方向。
       */
      .fromTo(
        veil.querySelector(".veil-edge"),
        { yPercent: 100 * 0, opacity: 0 },
        { opacity: 1, duration: 0.06 },
        0,
      )
      .to(
        veil.querySelector(".veil-edge"),
        { yPercent: -100, duration: 0.32, ease: "power3.inOut" },
        0,
      )
      .to(veil.querySelector(".veil-edge"), { opacity: 0, duration: 0.06 }, 0.3);

    tlRef.current = tl;
    return tl;
  }, []);

  /** ② 进入：从擦除线位置向上揭开。 */
  const reveal = useCallback(() => {
    const veil = veilRef.current;
    if (!veil) return;

    tlRef.current?.kill();
    const tl = gsap.timeline();
    tl.to(veil, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.3,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(veil, { display: "none", clipPath: "inset(100% 0% 0% 0%)" });
        // 新页已就位，让 ScrollTrigger 重算（pin 距离依赖新的高度）。
        window.dispatchEvent(new Event("ezma:refresh"));
      },
    });
    tlRef.current = tl;
  }, []);

  // 路由提交后（pathname 变了）播进入。
  useEffect(() => {
    if (pendingRef.current === null) return;
    pendingRef.current = null;
    // 等一帧，让新页完成首次绘制再揭开，否则会露出半张旧页。
    const id = window.requestAnimationFrame(() => reveal());
    return () => window.cancelAnimationFrame(id);
  }, [pathname, reveal]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.tagName !== "A") return;
      if (anchor.hasAttribute("data-no-transition")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.closest('[role="dialog"]')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // 只换 hash 的锚点不接管。
      if (url.pathname === window.location.pathname && url.hash) return;
      // 后台不接管。
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

      e.preventDefault();
      pendingRef.current = url.pathname;

      const tl = cover();
      const go = () => router.push(url.pathname + url.search);

      /*
       * 关键：如果时间轴被 kill（连点），onComplete 不会触发，
       * 所以用 tl.eventCallback 而不是 setTimeout —— kill 之后
       * 回调一并失效，不会有排队推挤。
       */
      if (tl) {
        tl.eventCallback("onComplete", go);
      } else {
        go();
      }
    }

    // 捕获阶段：要抢在 Next 的 Link 处理器之前。
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [cover, router]);

  return (
    <div ref={veilRef} className="veil" aria-hidden="true">
      <div className="veil-edge" />
      {/*
       * 遮罩铺满的那一瞬不是空白——它是「档案正在调取」的一张卡。
       * 这一笔很轻，但它把 620ms 的等待从「断片」变成了「换页」。
       * 没有进度条，因为没有真实进度可显示；只有编号和一句状态。
       */}
      <div className="veil-card">
        <span className="veil-mark t-mono">EZMA</span>
        <span className="veil-sub t-mono">档案调取中</span>
        <span className="veil-rule" />
        <span className="veil-no t-mono">REEL / 2026</span>
      </div>
    </div>
  );
}
