# Ezma — 数字遗迹

一个以「套印错版」为母题的个人博客。纸张、油墨、错位、颗粒——把「锐利、守护、直率」转译成一种**被扫描过的纸质档案**的质感，而不是直译三个形容词。

## 跑起来

```bash
pnpm install
pnpm dev          # http://localhost:3100（默认 3000）
pnpm build && pnpm start
```

## 结构

```
src/
├── app/
│   ├── layout.tsx            根布局：导航 / 页脚 / 颗粒层 / 光标 / 过渡
│   ├── globals.css           设计 token、排印、颗粒层
│   ├── nav.css               导航（墨块跟随）
│   ├── hero.css              滚动驱动 hero
│   ├── transition.css        擦除式页面过渡
│   ├── cursor.css            自定义光标
│   ├── pages.css             通用版式
│   ├── page.tsx              首页
│   ├── notes/                归档 + 文章
│   ├── works/                实验
│   └── about/                关于
├── components/
│   ├── HeroScene.tsx         滚动叙事：散开 → 后拉 → 切断
│   ├── PageTransition.tsx    clip-path 擦除
│   ├── Cursor.tsx            三层惯性光标
│   ├── Nav.tsx               墨块跟随导航
│   └── Reveal.tsx            滚动入场
└── lib/
    ├── scroll-core.tsx       Lenis × GSAP 单帧循环
    └── notes.ts              内容
```

## 关键实现

**滚动同步**：Lenis 的 `autoRaf: false`，由 `gsap.ticker` 驱动。DOM、GSAP、Lenis 在同一帧读同一个 scrollY。这是 ScrollTrigger 触发点不慢半拍的前提。

**Hero**：`pin + scrub`，滚动头 140% 里做完「三层字散开 → 整体 1.02→0.72 后拉 → 两条 slit 切断画面」三步。

**页面过渡**：`clip-path: inset()` 从下往上擦除，配一条 rust 色扫描线。可中断——连续点击时旧 timeline 被 `kill()`，回调一并失效，不会排队。

**光标**：dot 1:1 跟手，ring lerp 0.18 滞后。形状变化走 CSS transition，位置走 JS transform——两者混用会让光标「追不上然后弹过去」。

## 验证

```bash
node scripts/verify.mjs        # 10 项交互与降级断言
node scripts/shoot.mjs         # 各页截图（需本地 Chrome/Edge）
```

当前：typecheck ✓ / build ✓ / 10 项断言全过。

## 降级

- `prefers-reduced-motion`：hero 不 pin、叠印层收起、光标禁用、过渡退化为 150ms
- 触屏：不启用光标，导航改为全屏菜单，触控目标 ≥ 44px
- 无精确指针：墨块不渲染，当前项用左侧竖条标记
- JS 失败：`data-cursor` 不写入，系统光标保留
