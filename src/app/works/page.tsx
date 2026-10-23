import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "实验",
  description: "Ezma 的实验与作品：一些不一定要上线的尝试。",
};

const WORKS = [
  {
    index: "01",
    title: "套印",
    desc: "一个把文字错版叠印出来的排版工具。三层位移、三种字重，用 CSS 变量控制错位量。",
    year: "2026",
  },
  {
    index: "02",
    title: "慢滚",
    desc: "Lenis + GSAP 的滚动同步参考实现。重点不是平滑，是让滚动量和动画时间在同一个帧里读。",
    year: "2026",
  },
  {
    index: "03",
    title: "遗迹",
    desc: "一个自毁型笔记应用。七天不打开，内容自动降解成噪点。",
    year: "2025",
  },
  {
    index: "04",
    title: "无光标",
    desc: "把手势完全交给键盘的编辑器原型。光标只在该出现的时候出现。",
    year: "2025",
  },
];

export default function WorksPage() {
  return (
    <>
      <header className="page-head">
        <div className="shell">
          <p className="t-mono" style={{ margin: "0 0 18px", color: "var(--ink-faint)" }}>
            WORK / 实验
          </p>
          <h1 className="page-title">实验</h1>
          <p className="page-desc">
            不一定要上线的尝试。做完之后通常只剩一个结论：这个方向不值钱。
          </p>
        </div>
      </header>

      <section className="section" style={{ borderTop: 0 }}>
        <div className="shell">
          <div className="work-grid">
            {WORKS.map((w, i) => (
              <Reveal key={w.index} delay={i * 0.06}>
                <article className="work-card" data-cursor-view>
                  <div>
                    <span className="work-num t-mono">{w.index}</span>
                    <h2 className="work-title" style={{ margin: "10px 0 0" }}>
                      {w.title}
                    </h2>
                  </div>
                  <p className="work-desc">{w.desc}</p>
                  <span className="t-meta">{w.year}</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
