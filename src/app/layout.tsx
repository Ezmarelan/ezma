import type { Metadata } from "next";
import "./globals.css";
import "./nav.css";
import "./hero.css";
import "./transition.css";
import "./cursor.css";
import "./pages.css";
import "./article.css";
import { ScrollCore } from "@/lib/scroll-core";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  metadataBase: new URL("https://ezma.studio"),
  title: {
    default: "Ezma — 数字遗迹",
    template: "%s — Ezma",
  },
  description:
    "Ezma 是一个关于代码与记忆的私人空间。保存了我删掉的东西留下的形状。",
  openGraph: {
    title: "Ezma — 数字遗迹",
    description: "一个关于代码与记忆的私人空间。",
    type: "website",
    locale: "zh_CN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body
        /*
         * data-cursor 由 Cursor 组件在确认「有精确指针 + 没开减少动态」
         * 之后才写。所以默认不隐藏系统光标 —— 万一 JS 失败，
         * 用户不会得到一个没有光标的页面。
         */
        data-cursor-off=""
      >
        <a href="#main" className="skip-link">
          跳到正文
        </a>

        <Nav />

        <main id="main">{children}</main>

        <footer className="foot">
          <div className="shell foot-inner">
            <p className="t-mono">EZMA © 2026</p>
            <p className="t-meta">用一个夏天搭起来，然后慢慢拆</p>
          </div>
        </footer>

        {/* 全站颗粒层：必须在最上，且 pointer-events: none */}
        <div className="grain" aria-hidden="true" />

        <Cursor />
        <PageTransition />
        <ScrollCore />
      </body>
    </html>
  );
}
