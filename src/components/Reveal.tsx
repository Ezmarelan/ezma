"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 滚动进入。一个极简的 reveal：位移 24px + 淡入，600ms。
 *
 * 为什么不用 CSS transition + IntersectionObserver：ScrollTrigger 已经
 * 在跑，再加一套 observer 就是第二个时间线，两者的触发精度不同步。
 * 统一交给 ScrollTrigger，滚动到哪一帧进入，和其它滚动动画完全一致。
 *
 * once: true —— 只播一次。往回滚不再重复，这是「内容」不是「装饰」。
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y]);

  return <Tag ref={ref}>{children}</Tag>;
}
