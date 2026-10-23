import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 Ezma：我在做什么，以及为什么这样做。",
};

export default function AboutPage() {
  return (
    <>
      <header className="page-head">
        <div className="shell">
          <p className="t-mono" style={{ margin: "0 0 18px", color: "var(--ink-faint)" }}>
            WHO / 关于
          </p>
          <h1 className="page-title">Ezma</h1>
          <p className="page-desc">
            前端工程师。做界面，也做界面下面的那一层。
          </p>
        </div>
      </header>

      <section className="section" style={{ borderTop: 0 }}>
        <div className="shell about-grid">
          <Reveal>
            <p className="about-lead">
              我相信一件东西的质感来自它的限制。
              <br />
              纸张的限制让印刷变得讲究，
              <br />
              屏幕没有限制，所以我们得自己造。
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="fact-list">
              <li>
                <span className="fact-key t-meta">现在</span>
                <span>做前端工程，主要在设计系统与动效层</span>
              </li>
              <li>
                <span className="fact-key t-meta">曾经</span>
                <span>在一个做排版工具的小团队待过两年</span>
              </li>
              <li>
                <span className="fact-key t-meta">相信</span>
                <span>速度是设计的一部分，不是工程指标</span>
              </li>
              <li>
                <span className="fact-key t-meta">不擅长</span>
                <span>把话说明白。这篇关于页改了三遍还是很绕</span>
              </li>
              <li>
                <span className="fact-key t-meta">联系</span>
                <span>
                  <a href="mailto:hi@ezma.studio" className="link-u">
                    hi@ezma.studio
                  </a>
                </span>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section section--deep">
        <div className="shell">
          <Reveal>
            <h2 className="t-h2" style={{ maxWidth: "18ch", margin: 0 }}>
              这个名字来自 Ezmarelan，一个我用了很久的 ID。
            </h2>
            <p
              className="prose"
              style={{ marginTop: "clamp(20px, 3vw, 36px)" }}
            >
              它听起来像一个人名，实际是我十七岁那年随手拼的。后来我查了一下，
              「ezma」在某些语言里接近「守护」的意思。我不确定这是不是巧合，
              但我留下来了——一个随手拼的词，慢慢被我做的事赋予了意思。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell cta-row">
          <Reveal>
            <h2 className="t-h2">继续看</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="cta-links">
              <Link href="/works" className="big-link" data-cursor-view>
                实验 <span aria-hidden="true">→</span>
              </Link>
              <Link href="/notes" className="big-link" data-cursor-view>
                笔记 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
