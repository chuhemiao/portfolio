# 网站三语与文章翻译

网站支持 `zh-CN`、`en`、`ja`，使用 Next.js 静态导出，继续通过 Cloudflare Pages / Workers 部署。

## 页面入口

- 中文：`/zh-CN`
- 英文：`/en`
- 日文：`/ja`

首页、博客、研究地图、主题、随想和各个看板都有三语入口。页面内导航保留当前界面语言。全站仅保留顶部的语言下拉菜单，切换时保留 URL 查询参数和片段；文章页面只将实际存在的译文列入 `hreflang`。

原有 `/blog`、`/research` 等地址继续提供英文界面。原有 `/blog/<slug>` 继续显示原文，文档语言与原文一致，canonical 指向对应语言的新地址。

Blog、首页和主题列表默认按文章组去重，优先显示当前语言的完整译文；尚未补齐的文章显示原文及其实际语言。`?lang=all` 可查看所有版本，`?lang=zh-CN`、`?lang=en`、`?lang=ja` 只显示对应语言的真实正文。文章页的全局语言切换在没有对应译文时打开目标语言的博客列表。

Research 卡片说明和分类、Telegram 随想、Weekly Research 与首页周报使用独立三语资源。资源绑定原始说明或正文：原文变更、新条目或不完整资源会回退到原文并显示提示，不继续使用旧译文。历史日期、数值、链接和行情保持原始口径，翻译不代表数据刷新。Research 卡片说明的三语覆盖与长篇报告正文的翻译覆盖分别维护。

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

## 离线 Research 正文翻译

`content:translate:research` 使用已逐段翻译的中文、日文模板字典和精确匹配的独立段落，不调用外部翻译 API。当前仅处理历史 CMC / CGO 全深度模板报告；其他独立报告和博客文章继续逐篇翻译。

```bash
# 默认只检查可翻译范围，不创建 MDX
pnpm content:translate:research -- --dry-run

# 仅创建所有正文块都已完整翻译的版本，保留已有人工译文
pnpm content:translate:research -- --write --report

# 核对现有生成译文与原文、字典，更新待处理清单
pnpm content:translate:research -- --check --report
```

`--source <原文slug>` 可限定一篇，`--limit <正整数>` 可限定扫描数量。`--report` 写入 `scripts/lib/translations/research-template-status.json`，其中记录支持范围、完整报告、待翻译块和失败原因；它不是全站历史文章的覆盖统计。

未知段落、未翻译字段及已知项目身份冲突不会生成半成品正文。只补摘要、保留整段外语或复制原文不能作为完整译文。代码、数字、URL、章节及表格结构必须保留；已有译文不自动覆盖，源变更后需要显式审阅并重新绑定来源。

生成 MDX 包含 `translationSourceHash`、`translationMethod` 与 `translationRuleHash`。内容检查和构建会核对原文 SHA-256；原文变化而译文未更新时拒绝构建，防止静默发布过期译文。字典扩展不会自动重写先前已完成的译文。

资源位置：

- `src/data/research-descriptions.json`：Research 卡片说明的完整译文；分类标签位于 `src/data/research-localization.ts`。
- `content/thought-translations.json`：按消息 ID 和原文绑定的随想译文。
- `src/data/weekly-research-localizations.json`：完整周报对象和三语版本。
- `scripts/lib/translations/`：Research 正文模板、术语、来源标签及独立段落译文。

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

RSS 入口为 `/rss-zh-CN.xml`、`/rss-en.xml`、`/rss-ja.xml`，各 feed 仅包含对应语言的真实文章。`/rss.xml` 保留混合语言内容。

路由位于 `src/app/(legacy)`、`src/app/(legacy-articles)` 和 `src/app/(localized)/[locale]`。它们共用 `src/components/site-document.tsx`，分别生成准确的 `<html lang>`。新增页面时，需要同时添加语言入口、页面 metadata 和 `scripts/check-i18n.mjs` 的检查项。
