const NOTES = [
  {
    slug: "relic-01",
    index: "001",
    date: "2026.08.14",
    title: "我删掉的代码留下了形状",
    excerpt:
      "每一次重构都是在覆盖，不是在删除。旧的写法还留在那里，只是被压在下面看不见了。",
    tag: "工程",
    read: "6 分钟",
  },
  {
    slug: "relic-02",
    index: "002",
    date: "2026.07.02",
    title: "关于把博客做成一个空间",
    excerpt:
      "页面不是文档，是一间屋子。读者推门进来，第一件事是感到自己在哪，而不是读到什么。",
    tag: "设计",
    read: "9 分钟",
  },
  {
    slug: "relic-03",
    index: "003",
    date: "2026.05.21",
    title: "颗粒、扫描线与不完美",
    excerpt:
      "数字界面太干净了。干净到没有证据说明它被人碰过。",
    tag: "材质",
    read: "4 分钟",
  },
  {
    slug: "relic-04",
    index: "004",
    date: "2026.03.09",
    title: "慢下来的那 1.05 秒",
    excerpt:
      "平滑滚动不是为了好看，是为了让滚动这件事重新有重量。",
    tag: "动效",
    read: "7 分钟",
  },
];

export const notes = NOTES;

export function getNote(slug: string) {
  return NOTES.find((n) => n.slug === slug);
}
