import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { notes, getNote } from "@/lib/notes";

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "未找到" };
  return { title: note.title, description: note.excerpt };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const idx = notes.findIndex((n) => n.slug === slug);
  const next = notes[(idx + 1) % notes.length];

  return (
    <article className="article">
      <div className="shell">
        <header className="article-head">
          <div className="article-meta t-meta">
            <span>{note.index}</span>
            <span>{note.date}</span>
            <span>{note.tag}</span>
            <span>{note.read}</span>
          </div>
          <h1 className="article-title">{note.title}</h1>
        </header>

        <div className="prose">
          <p>
            这是一段占位的正文。它要说明的事情很简单：每一次重写都不是从空白开始，
            而是从上一版留下的形状开始。编辑器里看不到那些形状，但你写下的每一行
            都在被它们推着走。
          </p>
          <p>
            我习惯先把结构立起来，再往里填。填到一半常常发现结构是错的——不是细节
            不对，是那句话从一开始就没说对。这时候正确的做法是把整段删掉，而不是
            修补它。修补会让错误变得体面。
          </p>
          <h2>一、删掉比加上难</h2>
          <p>
            加上一个功能只要一次决定，删掉一个功能要说服所有用过它的人。
            所以真正决定一个东西长什么样的，往往不是设计者，是那些不肯删的部分。
          </p>
          <blockquote>
            <p>
              如果你不能用一句话说清它为什么在这里，那它就不该在这里。
            </p>
          </blockquote>
          <h2>二、留白的重量</h2>
          <p>
            版面上的空白不是没有内容，是把注意力按在了某个地方。控制留白比控制
            字号更需要判断力，因为空白没有参照物——你不知道多一毫米是更好还是更糟。
          </p>
          <p>
            这也是我为什么喜欢纸质物的排版：它们被印刷成本逼着做过取舍，
            每一次取舍都留下了痕迹。
          </p>
        </div>

        <nav className="article-next" aria-label="下一篇">
          <span className="t-mono">下一篇</span>
          <Link href={`/notes/${next.slug}`} className="big-link">
            {next.title} <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
