"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * 非常规导航：跟随光标的**遮罩菜单**。
 *
 * 不是下拉、不是抽屉，而是一块会跟着光标走的实心墨块。鼠标移到哪个
 * 条目，墨块就滑到哪，字在墨块经过时反白——像盖章盖过去。
 *
 * 三个设计决策：
 *
 * 1. **墨块是唯一指示器**。没有下划线、没有背景色变化、没有当前项
 *    的小圆点。指示就是那一声「盖下去」。
 *
 * 2. **用 transform 位移而不是改每个条目的样式**。一个墨块 + 一组
 *    文本，CSS 只需要给文本 mix-blend-mode: difference，墨块滑过
 *    哪里，哪里的字自动反白。这是最省的一笔。
 *
 * 3. **键盘与触屏走另一套**。墨块是 hover 的产物，键盘用户看不到它。
 *    所以 :focus-visible 单独给一条硬边轮廓，触屏上则显示静态的
 *    当前项标记。不是「降级」，是两套等价的表达。
 */
const NAV = [
  { href: "/", label: "首页", index: "01" },
  { href: "/notes", label: "笔记", index: "02" },
  { href: "/works", label: "实验", index: "03" },
  { href: "/about", label: "关于", index: "04" },
];

export function Nav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  /*
   * 墨块跟随。用 getBoundingClientRect 读条目位置，写 transform 到墨块——
   * 只读一次布局、只写一次合成属性，没有逐帧 rAF。
   *
   * 为什么不在 pointermove 里算：那是每帧都跑的热路径。菜单只有
   * 4 项，切换时算一次就够。
   */
  const moveBlob = (el: HTMLElement) => {
    const blob = blobRef.current;
    const list = listRef.current;
    if (!blob || !list) return;
    const a = el.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    blob.style.opacity = "1";
    blob.style.transform = `translate3d(${a.left - b.left}px, ${a.top - b.top}px, 0)`;
    blob.style.width = `${a.width}px`;
    blob.style.height = `${a.height}px`;

    /*
     * 反白靠打类，不靠 mix-blend-mode。
     * 墨块是实心墨，盖到哪一项，那一项的字就换纸色——
     * 这个关系必须显式写出来，混合模式在「半透明导航条 +
     * backdrop-filter」的叠层下算不准。
     */
    list.querySelectorAll(".nav-item.is-blob").forEach((n) => {
      n.classList.remove("is-blob");
    });
    el.classList.add("is-blob");
  };

  const hideBlob = () => {
    if (blobRef.current) blobRef.current.style.opacity = "0";
    listRef.current
      ?.querySelectorAll(".nav-item.is-blob")
      .forEach((n) => n.classList.remove("is-blob"));
  };

  // 移动端菜单打开时锁滚动。
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // 路由变化时收起移动菜单。
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Link href="/" className="nav-brand" aria-label="Ezma 首页">
          <span className="nav-brand-mark">◱</span>
          <span className="nav-brand-text t-mono">EZMA</span>
        </Link>

        {/* 桌面导航 */}
        <nav aria-label="主导航" className="nav-desktop">
          <ul
            ref={listRef}
            className="nav-list"
            onMouseLeave={hideBlob}
          >
            {/* 墨块：先于文本存在，z-index 在文本之下 */}
            <div ref={blobRef} className="nav-blob" aria-hidden="true" />
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="nav-item"
                    data-active={active ? "true" : undefined}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={(e) => moveBlob(e.currentTarget)}
                  >
                    <span className="nav-index t-mono">{item.index}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 移动端：一个需要「按」下去才展开的按钮 */}
        <button
          type="button"
          className="nav-burger"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="t-mono">{open ? "关闭" : "菜单"}</span>
          <span className="nav-burger-lines" data-open={open ? "true" : undefined}>
            <i />
            <i />
          </span>
        </button>
      </div>

      {/* 移动端全屏菜单 */}
      <div id="mobile-nav" className="nav-mobile" data-open={open ? "true" : undefined}>
        <ul>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="nav-mobile-item">
                <span className="t-mono nav-index">{item.index}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
