"use client";

import { useEffect, useRef } from "react";

/**
 * 自定义光标。
 *
 * 三层结构，每层用不同的跟随系数（不是 CSS transition，是 rAF 里
 * 手动 lerp）：
 *
 *   dot    1:1 跟手，无延迟。它是「你在哪」的精确读数。
 *   ring   lerp 0.18，轻微滞后。它是「刚才在哪」，产生拖曳感。
 *   label  状态文字，只在悬停可交互元素时出现。
 *
 * 为什么不用 CSS transition 跟鼠标：transition 有固定的时长曲线，
 * 快速移动时会明显「追不上然后弹过去」。手动的 lerp 是每帧逼近
 * 当前目标，速度由距离决定——近处快、远处慢，这才是惯性的物理感。
 *
 * 状态：
 *   default  小圆点 + 细环
 *   hover    环放大 2.4 倍，变细
 *   view     环变成实心，并显示「看」
 *   drag     环变成方形，显示「拖」
 *
 * 触屏、减少动态、无精确指针时完全不启用（返回 null，不加任何监听）。
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 三个提前退出条件，一个都不能少。
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduced.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.body.dataset.cursor = "on";

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    // ring 的位置（滞后量就藏在这两个变量里）
    let rx = mx;
    let ry = my;
    let raf = 0;
    let visible = false;

    /* 状态：换 class 而不是写内联样式，样式表负责形状与时长。 */
    type State = "default" | "hover" | "view" | "drag";
    let state: State = "default";

    const setState = (next: State, text = "") => {
      if (state === next && label.textContent === text) return;
      state = next;
      ring.dataset.state = next;
      dot.dataset.state = next;
      label.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        // 首次出现时把 ring 直接放到指针上，否则会从左上角飞过来。
        rx = mx;
        ry = my;
        document.body.dataset.cursorVisible = "on";
      }
    };

    /*
     * 状态判定用事件代理而不是给每个元素绑监听：
     * 站内元素是服务端渲染的，切换页面时 DOM 会整体换掉，
     * 代理在 document 上永远有效。
     */
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(
        "a, button, [data-cursor-view], [data-cursor-drag], input, textarea, select",
      );
      if (!target) {
        setState("default");
        return;
      }
      if (target.hasAttribute("data-cursor-drag")) {
        setState("drag", "拖");
      } else if (target.hasAttribute("data-cursor-view")) {
        setState("view", "看");
      } else {
        setState("hover");
      }
    };

    const onLeave = () => {
      visible = false;
      delete document.body.dataset.cursorVisible;
    };

    const onDown = () => {
      dot.dataset.pressed = "true";
    };
    const onUp = () => {
      delete dot.dataset.pressed;
    };

    /*
     * 帧循环。两件事：
     *   1. lerp 逼近，ring 滞后
     *   2. 手写 transform，避免读 layout（只用 translate3d 走合成层）
     *
     * lerp 系数 0.18 是「跟得上但不生硬」的分界线：再高（0.3+）
     * 就和 dot 重合了，看不出拖曳；再低（0.08）会像在冰上滑。
     */
    const frame = () => {
      raf = window.requestAnimationFrame(frame);
      if (!visible) return;

      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;

      // dot 精确跟手
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      // ring 滞后
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      delete document.body.dataset.cursor;
      delete document.body.dataset.cursorVisible;
    };
  }, []);

  return (
    <div className="cursor-root" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" data-state="default">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" data-state="default" />
    </div>
  );
}
