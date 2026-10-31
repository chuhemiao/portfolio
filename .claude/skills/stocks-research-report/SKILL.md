---
name: stocks-research-report
description: "写一篇链上美股研报（zh-CN/en/ja 三个 MDX），对应 src/data/instrument-groups.ts 里的一个分组。触发语如「写第 2 组研报」「写 memory-supercycle 那组」「下一组研报」。涵盖数据来源、数字纪律、三文件布局、markdown 管线限制与验收门。不用于 registry 自动生成的项目研报，也不用于 /stocks 之外的内容。"
---

# stocks-research-report

一次产出 = 一个分组 = 三个 MDX（zh-CN / en / ja）+ 回填 `articleSlugs`。
分组定义在 `src/data/instrument-groups.ts`，共 20 组，`index` 即发布顺序。

## 第 0 步：先算，再写

**动手写任何一个数字之前，先跑一次统计，整篇文章只用它的输出。**

```bash
pnpm stats:group <group-slug|index>
```

它给出：成员的全部行情与派生值（区间宽度 = 上市以来最高 ÷ 最低、距最高、区间位置、挂牌天数、占全盘市值/成交额比例）、本组 vs 其余标的的换手对比、**每个成员同一上市日的同批标的（用来找反例）**、全盘分布与中位数、按类型的宽度中位数（只统计挂牌 ≥100 天的）、按上市月份的汇总。

三条硬规则：

- **不联网取数**。数据就是 `src/data/instruments/quotes.json` 这一张快照（`asOf` 带时间戳）。站主明确说过数据由他提供，不要去抓 CMC、CoinGecko 或 Surf。
- **不凭印象写底层股价**。快照里没有底层参考价，任何「对应的美股现在多少钱」都是编的。
- **每个出现在正文里的数字都要能在上面那份输出里指出来源**。写完用脚本回查一遍（见「验收门」）。

## 必须写进去的「算不出来」

这几条是这份数据的真实边界，每篇都要在口径章节里写明，不要悄悄跳过：

- **没有溢价/折价。** 快照没有底层参考价；更关键的是 bStocks 的分红是「扣 30% 美国预扣税后按乘数复投」，**不知道当前乘数，代币单价和股价就不可比**。所以一个溢价数字都不要给。
- **算不出一枚代币对应几股。** 快照里没有转换比例，流通量不能换算成份额。
- **区间宽度的窗口不等长。** 挂得越久越容易走出极值，所以全盘对比只取挂牌 ≥100 天的那批；即便如此窗口仍差一个多月。新上市标的的窄区间**不含信息**（BRKBB 12 天 1.031×）。
- **市值是 CMC 口径**（价格 × 流通量）。本组合计是快照各行相加，而 `/stocks` 页上 bStocks 那一行的 `onchainValueUsd`（$9.14 亿）**来源和时点都不同，不会对平** —— 要说清本文用的是哪个。
- **105 个里只有 100 个。** 缺的 5 个不进任何统计。
- **换手 = 24h 成交额 ÷ 市值。** 分母小的时候比值天然变大，尾部的高换手首先是市值小的结果，**不能读成尾部流动性更好**。

## 文章结构

照 `bstocks-flagship-pricing-anchors` 这一篇的骨架（它是模板）：

1. `## TL;DR` —— 一句加粗的主论点，然后 5–6 条加粗开头的要点，每条带具体数字，行内数字用反引号。
2. `---`
3. `## 一、这几个是什么`（en/ja 用 `## 1.`）—— 发行方背景一段、快照时间戳、全盘量级，然后一张成员总表（代币链接 / 底层 / 类型 / 上市日 / 价格 / 市值 / 24h 成交 / 换手 / 30 日）。
4. **论点章节**，把分组的 `thesis` 展开成可验证的排序或对比，配表。
5. **反例章节 —— 这一节不能省。** 用同批上市的标的去打自己的论点，找到了就写出来并说明论点的适用边界。上一篇的反例是 SNDKB（普通普通股，窗口与 SPCXB 完全相同，宽度却更大）。**找不到反例时要说明找过哪些、为什么没有**，而不是沉默。
6. 一到两节横向背景（全盘换手分布、上市月份、类型构成、全盘跌幅中位数），用来把本组放回分布里 —— 常见结论是「这不是头部故事，是全盘下跌」。
7. **结构章节** —— 法律包装、投票权、分红、储备证明、赎回门槛、美国人准入，全部取自 `src/data/tokenized-equities.ts` 的发行方记录，不要另造。写成结构描述，不要写成指控。
8. `## 七、这张快照是什么时候取的` —— 看 `asOf` 的星期与 UTC 时间，交代美股当时开没开盘。周末快照要链到 `aapl-four-books-tokenized-equity-liquidity`（**非交易时段的报价是做市商的意见，不是市场价格**）。
9. `## 八、这个方法算不出什么` —— 上面「算不出来」那六条，逐条加粗开头。
10. `---`，`**结论。**` 一到两段，最后一行斜体来源脚注：数据来源 + 时间戳 + 覆盖范围 + `/stocks/<issuer>` 链接 + `本文为研究整理，不构成投资建议。DYOR。`

风格：短句，加粗承载论点，表格承载数字，不写「我们认为」。数字后面紧跟它的含义。

## 三个文件

目录 `content/blog/2026/research/`，三份共享 `translationKey` 与 `sourceSlug`，各自的 `slug` 必须等于文件名：

| 语言 | 文件名 | `slug` | `language` |
|---|---|---|---|
| zh-CN | `<slug>.mdx` | `<slug>` | `zh-CN` |
| en | `<slug>-en.mdx` | `<slug>-en` | `en` |
| ja | `<slug>-ja.mdx` | `<slug>-ja` | `ja` |

frontmatter 键序固定：

```yaml
---
title: '...'
publishedAt: 'YYYY-MM-DD'
summary: '...'
slug: '...'
category: 'research'
language: 'zh-CN'
translationKey: '<slug>'
sourceSlug: '<slug>'
---
```

- `slug` 建议 `<issuer>-<group-slug>`，例如 `bstocks-memory-supercycle`。
- `translationSourceHash` 可选，不写就不会触发 stale 校验，**不要写**。
- **英文 frontmatter 里不要用撇号**。`summary` 用单引号定界，`OKX's` 会提前闭合标量导致 `content:check` 报 "a multiline key may not be an implicit key"。改写成 `the OKX rule` 这类说法，不要写 `''` 转义。中日文用「」不受影响。
- 章节编号：zh 用 `## 一、`，en/ja 用 `## 1.`。

## markdown 管线只有 remark-gfm + rehype-pretty-code

没有 `rehype-raw`、没有组件映射、没有 remark-math。所以：

- **任何未知 raw HTML 标签会被连同它包住的文字一起整块丢掉**，读者看到的是一个空 `<p></p>`。不要写 `<chart>`、`<tokentable>`、`<u>`、`<reference>`，也不要写 `\<u>` 这种转义 —— 救不回来。
- 数学不要写 `\[ ... \]`，会原样渲染成乱码。要等宽就用 ` ```text ` 围栏。
- 图表就写 markdown 表格。**不要在正文里承诺一张不存在的图**（「下面的图展示…」）。
- 相邻两个 `>` 之间留空行会渲染成两个独立 blockquote。

## 站内链接

**全部写成带语言前缀的绝对路径，每种语言写自己那套**：

- 标的页 `/zh-CN/stocks/bstocks/SPCXB`、`/en/stocks/bstocks/SPCXB`、`/ja/stocks/bstocks/SPCXB`
- 发行方页 `/<locale>/stocks/<issuer>`，列表页 `/<locale>/stocks`
- 文章 `/<locale>/blog/<slug>`，**注意 en/ja 文章的 slug 自带后缀**：`/ja/blog/xxx-ja`

不带前缀的 `/stocks/bstocks/SPCXB` 会 404 —— `/stocks` 下的动态路由只有本地化版本。

## 写完要做的三件事

1. **回填 `articleSlugs`**，否则 5 个标的页的「研报」区块会显示「研报尚未发布」：

```ts
    articleSlugs: {
      'zh-CN': '<slug>',
      en: '<slug>-en',
      ja: '<slug>-ja',
    },
```

2. **`tickers` 按市值降序排**（统计脚本的 members 表就是降序），顺手让 `thesis` 的列举顺序与之一致。
3. **发现与既有文案冲突就改既有文案。** 上一篇查出发行方 note 里「SPCXB 一天成交额约等于自身市值」是错的（实际 0.458×），三语一起改掉了。研报暴露出的旧口径错误属于本次工作，不要留着让两个页面互相打脸。

## 验收门

逐条跑，全绿才算完：

```bash
pnpm content:check          # 篇数应 +3
pnpm content:build          # Compiled 应恰好是 3
pnpm typecheck
pnpm test
```

然后做渲染审查（**不要跑 `pnpm build`，也不要起 dev server —— 会把机器的内存吃光**，三语结构那道闸交给 Vercel）：

```bash
node -e "
const c=require('crypto'), fs=require('fs');
for (const slug of ['<slug>','<slug>-en','<slug>-ja']) {
  const h=c.createHash('sha256').update(slug).digest('hex');
  const html=fs.readFileSync('.generated/posts/'+h+'.html','utf8');
  const k=(re)=>(html.match(re)||[]).length;
  console.log(slug, 'empty<p>', k(/<p><\/p>/g), 'tables', k(/<table>/g), 'h2', k(/<h2/g),
    'tr', k(/<tr>/g), 'links', k(/<a href=/g), 'stray', k(/<(chart|reference|tokentable|u)\b/g),
    'math', k(/\\\\\[|\\\\\]/g));
  console.log('  ', [...html.matchAll(/<a href=\"([^\"]+)\"/g)].map(m=>m[1]).join(' '));
}
"
```

通过标准：

- **空 `<p></p>` 必须是 0**，残留标签与 `\[` 必须是 0。审这类问题要数空 `<p></p>`，**grep 标签名查不出来**（标签已经被丢掉了）。
- 三语的 `table` / `h2` / `tr` / `links` 计数应一致 —— 不一致说明某一语漏了一节或一行。
- 打印出来的每个 href 都要有真实路由：标的页对 `instrumentRouteParams()`，文章对 `.generated/blog-index.json` 的 slug 集合。
- 三语组完整：`blog-index.json` 里该 `translationKey` 应有且仅有 3 篇，语言各一。
- **数字平行性**：抽出三份正文里所有带小数点的数字，zh 与 ja 的出现次数应完全一致（两者都用 亿/万，en 用 M/B 所以单位串不同，需要换算后比）。不一致就是抄串了。
- **逐数回查**：用 `getQuote()` 重算成员表的每一格（价格/市值/成交/换手/30 日/最高/最低/宽度/距最高/区间位置/上市日），断言这些字符串在英文版里逐字出现。

## CJK 自查

**自造的中日文词必须逐字复核** —— 历史上出过 `模倣`、`診理`、`利潦`、日文段落里混进韩文 `분`、中文里写出「普通普通股」。

```bash
# ja 文件里不该出现的简体字
grep -no '[们这发现过场单实对为说话产构证币链额规则组论据换转开关门问题买卖读风险资总标节乘无样价间时个值]' <ja-file>
# zh 文件里不该出现的假名/韩文
grep -no '[ぁ-んァ-ヴ가-힣]' <zh-file>
```

注意 `数`、`値`、`間`、`時`、`個` 在日文里都是正常字，不要加进上面那个字符类；反过来「大多数」在日文里也是正常词，**别拿过宽的词表制造假警报**。

## 不要做的事

- 不要 commit —— 站主要求每次提交都由他确认。
- 不要起服务、不要跑全量 build。
- 不要为了让论点漂亮而丢掉反例。
- 不要在没有反例章节的情况下发布一条看起来像规律的排序。
