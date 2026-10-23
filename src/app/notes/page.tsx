import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { notes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "笔记",
  description: "Ezma 的笔记归档。关于工程、设计与材质。",
};

export default function NotesPage() {
  return (
    <>
      <header className="page-head">
        <div className="shell">
          <p className="t-mono" style={{ margin: "0 0 18px", color: "var(--ink-faint)" }}>
            ARCHIVE / 归档 2026
          </p>
          <h1 className="page-title">笔记</h1>
          <p className="page-desc">
            写下来的东西大多会过期。留下的是当时为什么会那样想。
          </p>
        </div>
      </header>

      <section className="section" style={{ borderTop: 0 }}>
        <div className="shell">
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
    </>
  );
}
