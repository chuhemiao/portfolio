# 网站三语与文章翻译

网站支持 `zh-CN`、`en`、`ja`，使用 Next.js 静态导出，继续通过 Cloudflare Pages / Workers 部署。

## 页面入口

- 中文：`/zh-CN`
- 英文：`/en`
- 日文：`/ja`

首页、博客、研究地图、主题、随想和各个看板都有三语入口。页面内导航保留当前界面语言。全站仅保留顶部的语言下拉菜单，切换时保留 URL 查询参数和片段；文章页面只将实际存在的译文列入 `hreflang`。

原有 `/blog`、`/research` 等地址继续提供英文界面。原有 `/blog/<slug>` 继续显示原文，文档语言与原文一致，canonical 指向对应语言的新地址。

历史文章正文、研究摘要、周报和 Telegram 消息保留原文。界面语言切换不会自动翻译正文；缺失译文会显示提示。文章页的全局语言切换在没有对应译文时打开目标语言的博客列表。

## 添加译文

每种语言保存一个 MDX 文件。推荐显式设置 `language`、`translationKey` 和 `sourceSlug`。

假设既有原文的 slug 为 `bitcoin-research`：

```yaml
# 原文
language: en
translationKey: bitcoin-research
sourceSlug: bitcoin-research
slug: bitcoin-research
```

```yaml
# 中文译文
language: zh-CN
translationKey: bitcoin-research
sourceSlug: bitcoin-research
slug: bitcoin-research-zh-CN
```

```yaml
# 日文译文
language: ja
translationKey: bitcoin-research
sourceSlug: bitcoin-research
slug: bitcoin-research-ja
```

同一 `translationKey` 每种语言只能有一篇文章。`sourceSlug` 指向原文，不能指向不存在的文章。已有 `translationSlug` 双语配对和 `-en` 文件名仍兼容，不需要批量修改旧文章。

草稿不会出现在语言切换和 SEO 链接中。主题归属在译文组内共享，相关文章会排除本篇的其他语言版本。Research registry 只索引组内原文；专题研究继续通过 `researchProjectSlug` 归属到既有项目。

快捷创建默认 dry-run：

```bash
pnpm quick:add -- "日本語の研究記事" --category research --language ja --translation-key bitcoin-research --source-slug bitcoin-research
```

补齐正文后再加 `--write` 创建文件，并检查生成的 frontmatter。脚本只创建文章骨架，不翻译正文。

## 验证与维护

```bash
pnpm content:check
pnpm test:i18n
pnpm content:prepare
pnpm typecheck
pnpm build
pnpm check:i18n
```

`check:i18n` 检查静态导出中的页面语言、canonical、真实译文链接和旧文章地址。新增译文后，语言切换、SEO、sitemap 和分语言 RSS 会随构建更新。

RSS 入口为 `/rss-zh-CN.xml`、`/rss-en.xml`、`/rss-ja.xml`，各 feed 仅包含对应语言的真实文章。`/rss.xml` 保留混合语言内容。没有日文正文时，日文 feed 为空。

路由位于 `src/app/(legacy)`、`src/app/(legacy-articles)` 和 `src/app/(localized)/[locale]`。它们共用 `src/components/site-document.tsx`，分别生成准确的 `<html lang>`。新增页面时，需要同时添加语言入口、页面 metadata 和 `scripts/check-i18n.mjs` 的检查项。
