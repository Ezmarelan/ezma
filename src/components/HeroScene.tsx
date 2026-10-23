"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Hero 即第一个场景。
 *
 * 第一次滚动必须立刻产生位移感——这是 Awwwards 那类站点最容易被做丢的
 * 一件事：hero 静止、内容开始滚，等于「上面挂了一张图」。这里的做法是
 * 把 hero 钉住（pin），让它在滚动的头 100vh 里**不移动位置、只改变
 * 内部关系**：
 *
 *   0.00 → 0.42   三层字错位加大，标题开始「散开」；副标题上浮淡出
 *   0.42 → 0.78   大字被推向远景（scale 缩 + 平面位移），像镜头后拉
 *   0.78 → 1.00   整个场景被一条水平线切成上下两半，各自向外滑走
 *
 * 为什么用「散开」而不是「放大」：放大是最廉价的推进，任何模板都有；
 * 散开是把同一句话拆回零件，读起来像「这段记忆正在失焦」——这才是
 * 「数字遗迹」这个母题该有的动作。
 *
 * 性能：全程只动 transform / opacity / clip-path。pin 用
 * ScrollTrigger 的 pinType: "transform"（Lenis 是 translate 式滚动，
 * 用 fixed 会打架）。
 */
export function HeroScene() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>(".hero-layer");
      const kicker = root.querySelector(".hero-kicker");
      const sub = root.querySelector(".hero-sub");
      const meta = root.querySelector(".hero-meta");
      const slits = gsap.utils.toArray<HTMLElement>(".hero-slit");

      /*
       * 主时间轴：钉住 hero，用 scrub 跟滚动进度 1:1。
       * end: "+=140%" 意味着 hero 会在视口里停 1.4 屏的时间——
       * 足够做完「散开 → 后拉 → 切断」三步，又不至于让人觉得卡住。
       */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=140%",
          scrub: 0.6,
          pin: true,
          pinType: "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ① 三层字散开：位移与字距同时变化
      tl.to(
        layers,
        {
          xPercent: (i: number) => (i - 1) * 9,
          yPercent: (i: number) => (i - 1) * 6,
          scale: 1.06,
          ease: "none",
          duration: 0.42,
          stagger: 0.02,
        },
        0,
      );

      // 副标题与元信息先退场（它们是「可读」的部分，先让位给体感）
      tl.to(
        [sub, meta],
        { opacity: 0, y: -24, ease: "power1.out", duration: 0.2 },
        0,
      );
      tl.to(kicker, { opacity: 0, ease: "none", duration: 0.14 }, 0);

      // ② 整体后拉：缩小 + 上移，制造「镜头拉远」
      tl.to(
        ".hero-stack",
        {
          scale: 0.72,
          yPercent: -12,
          ease: "power2.inOut",
          duration: 0.36,
        },
        0.42,
      );

      // ③ 水平切分：两条 slit 从中间张开，把场景切成上下两半
      tl.to(
        slits,
        {
          scaleY: 1,
          ease: "power3.inOut",
          duration: 0.24,
          stagger: 0.04,
        },
        0.76,
      );

      tl.to(
        ".hero-stack",
        { opacity: 0, ease: "none", duration: 0.16 },
        0.84,
      );

      /*
       * 每一层的视差：滚动时三层以不同速度上移，制造纵深。
       * 系数很小（0.04–0.12），大了会晕。
       */
      layers.forEach((layer, i) => {
        gsap.to(layer, {
          yPercent: -6 * (i + 1),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=140%",
            scrub: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero scanlines" data-hero>
      {/* 两条切线：初始 scaleY(0)，滚动到 76% 时张开。
          它们把画面切成上下两块，是「遗迹被拆开」的那一刀。 */}
      <div className="hero-slit hero-slit--top" aria-hidden="true" />
      <div className="hero-slit hero-slit--bottom" aria-hidden="true" />

      <div className="shell hero-inner">
        <p className="hero-kicker t-mono">EZMA — DIGITAL RELIC</p>

        <div className="hero-stack">
          {/* 三层错位叠字。DOM 里是同一句话的三份，CSS 用不同的
              位移、字重、透明度做出套印错版。 */}
          <h1 className="hero-layer hero-layer--1 t-display">数字遗迹</h1>
          <p className="hero-layer hero-layer--2 t-display" aria-hidden="true">
            数字遗迹
          </p>
          <p className="hero-layer hero-layer--3 t-display" aria-hidden="true">
            数字遗迹
          </p>
        </div>

        <div className="hero-foot">
          <p className="hero-sub">
            这是一个关于代码与记忆的私人空间。
            <br />
            它保存了我删掉的东西留下的形状。
          </p>
          <p className="hero-meta t-meta">
            EST. 2021 · 上海
            <br />
            向下滚动进入
          </p>
        </div>
      </div>
    </section>
  );
}
