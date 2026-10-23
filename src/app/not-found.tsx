import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section" style={{ borderTop: 0, minHeight: "70vh" }}>
      <div className="shell">
        <p className="t-mono" style={{ color: "var(--ink-faint)" }}>
          ERROR / 404
        </p>
        <h1 className="page-title" style={{ marginTop: 18 }}>
          这一页被删了
        </h1>
        <p className="page-desc">
          或者它从来没有存在过。这两件事在这里没有区别。
        </p>
        <p style={{ marginTop: 32 }}>
          <Link href="/" className="big-link" data-cursor-view>
            回首页 <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
