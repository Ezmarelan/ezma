import type { Metadata } from "next";
import Link from "next/link";
import { HeroScene } from "@/components/HeroScene";
import { Reveal } from "@/components/Reveal";
import { notes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "首页",
};

export default function HomePage() {
  return (
    <>
      <HeroScene />

      {/* 索引：像档案柜的抽屉标签 */}
      <section className="section" id="index">
        <div className="shell">
          <div className="section-head">
            <h2 className="t-mono section-eyebrow">INDEX / 目录</h2>
            <p className="section-count t-meta">{notes.length} 条记录</p>
          </div>

          <ul className="index-list">
            {notes.map((note, i) => (
              <Reveal key={note.slug} as="li" delay={i * 0.06}>
                <Link href={`/notes/${note.slug}`} className="index-row">
                  <span className="index-num t-mono">{note.index}</span>
                  <span className="index-title">{note.title}</span>
                  <span className="index-tag t-meta">{note.tag}</span>
                  <span className="index-date t-meta">{note.date}</span>
                  <span className="index-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 一段自述，用大字 */}
      <section className="section section--deep">
        <div className="shell">
          <Reveal>
            <blockquote className="statement">
              <p>
                我做东西的方式是先删掉，再删掉，
                <br />
                直到剩下的那一点<b>无法再删</b>。
              </p>
              <footer className="t-meta">— Ezma，2026</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell cta-row">
          <Reveal>
            <h2 className="t-h2">去看点别的</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="cta-links">
              <Link href="/works" className="big-link" data-cursor-view>
                实验 <span aria-hidden="true">→</span>
              </Link>
              <Link href="/about" className="big-link" data-cursor-view>
                关于 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
