# PRD：链上美股标的库（/stocks 三级化）

> 配套文档：[tokenized-equities-program.md](./tokenized-equities-program.md)（内容计划与 20 组选题）
> 数据口径：CMC RWA 列表 `issuer_id=6a2aed5097c45356b1a5f710`，快照 **2026-10-31 06:06 UTC**，100/105 条
> 状态：**待批准**。按 10-28 的顺序，原型批准后才写代码。

---

## 1. 要解决的问题

现在 `/stocks` 只能回答「有哪些发行方、它们的法律包装和评级如何」。
不能回答读者真正会搜的那个问题：**「bStocks 的 SPCXB 是什么、现在多少钱、靠不靠得住」**。

三个具体缺口：

| 缺口 | 现状 | 证据 |
|---|---|---|
| 没有标的目录 | `Issuer` 只有 `instrumentCount?: number`，硬编码 | 写的是 `80`，实际 **105** |
| 行情不可更新 | 硬编码在 TS 里 | `DATA_AS_OF = '2026-10-16'`，已 15 天未动 |
| 研报不挂在标的上 | 文章和标的之间没有关联字段 | `/stocks` 只有一处 `CASE_STUDY_SLUG` 手写映射 |

## 2. 目标与非目标

**目标**
1. 每个发行方下能列出它发行的全部标的，数字现算、不手写。
2. 每个标的有自己的页面：基础信息 + 行情 + 研报，三语。
3. 行情可以每天随构建刷新，页面明示快照时间。
4. 研报与标的双向关联：标的页列出写过它的研报，研报指回标的页。

**非目标（本期明确不做）**
- **不做溢价/折价**。需要先标定乘数（§6.3），缺标定就是错数。
- 不做实时行情、不做 WebSocket、不做图表。站点是 `output: 'export'` 静态导出。
- 不做跨发行方的同一标的比价（如 xStocks 的 AAPLx vs bStocks 的 AAPLB）。等第二个发行方的目录齐了再说。
- 不做用户自选/关注列表。无后端。

## 3. 信息架构

```
/stocks                           总览（保留 10-28 减密后形态，仅加一列）
└─ /stocks/bstocks                发行方档案 + 全部标的表 + 相关研报
   └─ /stocks/bstocks/spcxb       标的页：基础信息 + 行情 + 研报
```

三语各一份：`/zh-CN/stocks/bstocks/spcxb`、`/en/...`、`/ja/...`
页数：105 标的 × 3 + 10 发行方 × 3 = **345 页**（现有 7,347 篇文章，可忽略）

路由实现沿用现有形状：`(legacy)/stocks/[issuer]/page.tsx` 导出 `renderPage(locale, params)`，`(localized)/[locale]/stocks/[issuer]/page.tsx` import 并调用。

## 4. 数据模型

### 4.1 新类型（`src/data/tokenized-equities.ts`）

```ts
export type UnderlyingKind =
  | 'common-stock' | 'adr' | 'etf' | 'leveraged-etf' | 'inverse-etf' | 'pre-ipo' | 'unknown';

export type Instrument = {
  ticker: string;                  // 'SPCXB'
  issuerSlug: string;              // 'bstocks'
  underlying: {
    symbol: string | null;         // 'SPCX' | null（pre-IPO 或元数据缺失）
    name: string;                  // 'SpaceX'
    kind: UnderlyingKind;
    leverage?: number;             // 2 | 3 | -3
  };
  listedAt: string;                // '2026-06-11'
  chains: string[];
  cmcId?: number;
  cmcSlug?: string;
  nameSource?: 'derived';          // 6 个缺 underlyingRwaName 的，从 `name` 反推
};

export type InstrumentGroup = {
  slug: string;                    // 'flagship-pricing-anchors'
  index: number;                   // 1..21，发布顺序
  issuerSlug: string;
  tickers: string[];               // 5 个
  title: L10n;
  thesis: L10n;
  articleSlugs?: Record<Locale, string>; // 研报三语 slug，发布后填
};
```

`instrumentCount` 从 `Issuer` **删除**，改 `getInstrumentCount(issuerSlug)` 现算。
（同 10-28 的 `getTopicPostCount` / `countProjectsByType` 修法，原因相同：手写计数必然漂移。）

### 4.2 元数据与行情分离

| | 位置 | 提交 | 更新 |
|---|---|---|---|
| 元数据 | `src/data/instruments/bstocks.json` | **是** | 人工 review 后合并 |
| 行情 | `src/data/instruments/quotes.json` | **是** | `pnpm sync:instruments` 刷新后提交 |

行情文件形状：
```json
{
  "asOf": "2026-10-31T06:06:52Z",
  "source": "coinmarketcap",
  "rows": {
    "SPCXB": { "priceUsd": 136.975434, "marketCapUsd": 173962370.51,
               "volume24hUsd": 79663821.85, "turnover": 0.45793709,
               "circulatingSupply": 1270026.05,
               "change24h": -2.08, "change7d": -7.06, "change30d": -9.77,
               "listedHigh": 229.175716, "listedLow": 105.692358 }
  }
}
```

### 4.3 摄入脚本 `scripts/sync-instruments.mjs`

输入 CMC 的 `cryptoCurrencyList` 形状，输出上面两份。**五条硬约束**：

1. ~~读写 `.generated/` 必须走 `paths.mjs`~~ —— **已改设计**：行情快照不进 `.generated/`，而是提交进 `src/data/instruments/quotes.json`。原因见 §6.9。
   10-30 的 `check-i18n.mjs` 就是栽在这里：`resolveGeneratedDir()` 在 `env.VERCEL` 下指向 `${NEXT_DIST_DIR}/cache/content/`，自己拼路径会在部署时 ENOENT 把线上构建弄挂。**这是第四处需要同步这套解析的地方。**
2. `marketCapUsd` 取 `quotes[name==='USD'].marketCap`，**绝不取** `fullyDilluttedMarketCap`（§6.2）。
3. `turnover` 直接用 CMC 的 `quotes[].turnover`，不自己除。
4. `ath`/`atl` 落到 `listedHigh`/`listedLow`，字段名就不许叫 ATH（§6.4）。
5. 拉取失败 → **回退到上一次的快照**并在 stderr 警告，不让一次 API 抖动把构建弄挂。

## 5. 页面规格

### 5.1 `/stocks` 总览（改动最小）

只加一处：发行方表新增一列「标的数」，值来自 `getInstrumentCount()`，链到发行方页。
`detailFields` 里原有的 `Instruments` 项去掉 `+` 后缀（和 10-28 topic 徽章去 `+` 同一个理由：数字变真了）。

### 5.2 `/stocks/[issuer]` 发行方档案

| 区块 | 内容 | 来源 |
|---|---|---|
| 页头 | 发行方名、法律实体、司法管辖、评级徽章 | `Issuer` |
| 事实栏 | 法律包装 / 投票 / 股息 / 赎回 / PoR / 美国准入 / 链 / 标的数 | `Issuer` + 现算 |
| 聚合指标 | 标的数、合计市值、合计 24h 成交、**整体换手**、首发日 | `Instrument[]` + 行情现算 |
| 标的表 | 全部 105 行：代码 / 标的 / 类型 / 市值 / 24h / 换手 / 7d / 上线日 | 元数据 + 行情 |
| 相关研报 | 该发行方的 `InstrumentGroup[]` | `articleSlugs`（未发布时显示组名与论点） |
| 快照脚注 | `asOf` + 来源链接 + 「105 条中的 100 条」口径说明 | 行情文件 |

标的表默认按市值降序，可切换排序（市值 / 成交 / 换手 / 上线日）。
**按类型筛选**：全部 / 普通股 / ETF / 杠杆 ETF —— 因为杠杆类的换手和其他差一个量级，混在一起看不出东西。

### 5.3 `/stocks/[issuer]/[ticker]` 标的页

三段式，顺序即优先级：

**① 基础信息**（不随行情变，是这一页的长期价值）
标的公司/ETF 全名、标的代码、类型与杠杆倍数、发行方、法律包装、链与合约地址、投票权、股息处理、赎回条件与门槛、美国人限制、上线日。

**② 行情**（快照）
价格、市值、24h 成交、**换手**、7d / 30d / 90d、流通量、上线以来高/低。
每个数字旁边或区块顶部标 `asOf`。

**③ 研报**
所属组、组的论点一句话、已发布研报链接（三语各指向本语言版本）。
未发布时显示「这一组的研报在排期中（第 N 组）」，不留空白。

**导航**：面包屑 `/stocks` › 发行方 › 代码；同组其他 4 个标的的横向链接（这是组内互链，对 SEO 和阅读都有用）。

## 6. 格式化规则与边界情况

**这一节是实现时最容易出错的地方，逐条都有真实反例。**

### 6.1 换手率必须改格式（现有代码会被冲爆）

`stocks-client.tsx:303` 现在是 `${turnover.toFixed(0)}%`，高亮阈值 `> 50`。
INTWB 的换手是 **38.46**，渲染出来是 `3846%`，而阈值 50 在这个量级上毫无意义。

**新规则：统一用倍数 `×`，不混用百分比。**

| 区间 | 格式 | 色阶 | 例 |
|---|---|---|---|
| < 0.30 | 2 位小数 | `text-subtle` | `0.13×`（AMATB） |
| 0.30 – 0.99 | 2 位小数 | 默认 | `0.66×`（全盘） |
| 1.00 – 4.99 | 2 位小数 | `text-brand` | `1.27×`（SNDKB） |
| ≥ 5.00 | 1 位小数 | `text-negative` | `38.5×`（INTWB） |

`≥ 5` 用警示色，因为一天换手 5 倍以上自身市值的不是投资标的，是赌具。

### 6.2 市值绝不取 `fullyDilluttedMarketCap`

`NBISB` 的 `totalSupply` 是 `0E-8`，所以它的 `fullyDilluttedMarketCap` 和 `marketCapByTotalSupply` **都返回 `0.00`**，只有 USD quote 的 `marketCap` 是真值 `12,819,574`。取错字段 Nebius 会显示市值 0。

### 6.3 溢价/折价本期不做

代币单价不是标的股价的 1:1，**且乘数因标的而异**：

| 代币 | 代币单价 | 量级判断 |
|---|---|---|
| SNDKB | $1,155.20 | 远高于 SanDisk 普通股报价 |
| MUB | $902.01 | 远高于 Micron 普通股报价 |
| LITEB | $844.45 | 远高于 Lumentum 普通股报价 |
| AAPLB | $345.04 | 接近 1:1 量级 |
| SPYB | $756.65 | 接近 1:1 量级 |

同一发行方内部比例不一致，所以不存在一个全局常数。要做溢价必须逐个标定乘数（发行方文档或赎回条款），标定前任何溢价数都是错的。**本期页面不出这一列**，PRD 里写明原因，等 §9 决策点 1 定了再开。

### 6.4 `ath` / `atl` 不能叫「历史高/低」

全部 100 条的 `dateAdded` 都在 2026-06-11 之后，所以 CMC 的 `ath`/`atl` 是**代币上线后的区间**，不是标的股票的历史高低点。字段名用 `listedHigh`/`listedLow`，页面文案写「上线以来」，否则读者会当成股票 ATH。

### 6.5 6 个标的缺标的名

`SECZB`(Securitize)、`CYPHB`(Cypherpunk Technologies)、`BRKBB`(Berkshire Hathaway)、`USDEB`(StablecoinX)、`SKUUB`(GraniteShares 2x Long SK Hynix)、`BOTB`(RoboStrategy) 在 CMC 上没有 `underlyingRwaName`。
从 `name` 字段反推（CMC 的 `name` 恒为 `<标的> Tokenized bStocks`）并标 `nameSource: 'derived'`，页面上对这类标的名加一个脚注标记。

### 6.6 105 vs 100

CMC `totalCount: 105`，本次只取到第一页 100 条。
聚合指标的脚注必须写「105 条中的 100 条，合计口径不完整」，**不能**把 100 条的合计说成 bStocks 的全量。P1 补齐后去掉这句。

### 6.7 合约地址不在这份数据里

CMC 的 `cryptoCurrencyList` **没有** `platform` 或合约地址字段，只有 `issuer` / `underlyingRwaId` / `cmcSlug`。
所以 §5.3「链与合约地址」这一项**第一版拿不到**，必须另找来源：bStocks 官方文档，或按 `cmcSlug` 逐个抓 CMC 币种页，或 BscScan 按代币名搜（105 次，且同名风险高）。

**第一版的处理**：链显示 `BNB Chain`（来自 `Issuer.chains`，可靠），合约地址一栏显示 `—` 并链到该标的的 CMC 页，不编造地址。地址补齐作为独立任务（见任务表 T21）。

### 6.8 其他格式

- 价格：≥ $1 保留 2 位（`$136.98`）；< $1 保留 4 位有效数字（`$0.9590`，GPROB）
- 涨跌：带符号 1 位小数，`text-positive` / `text-negative`
- 缺失值：统一 `—`，不显示 0、不显示 `N/A`
- 所有数字用 `font-mono` + `tnum`（沿用现有约定）

## 7. 三语

按 memory 的 trilingual rule：三语同时上线，不允许先中文后补。

- 标的公司名：**不翻译**（SpaceX / Micron Technology），公司名三语通用，翻译反而降低可搜性
- 标的类型、字段标签、论点、脚注：三语，用现有 `L10n = readonly [en, zh, ja]` 三元组 + `pick()`
- 组标题与论点：三语，存在 `InstrumentGroup`
- `check-i18n` 在 `build` 末尾强制：新页面缺任何一个语言版本、canonical/hreflang 写错、站内链接指向不存在的本地化页，都会卡住构建。**这是刻意的**（10-30 接进去的）。

## 8. 验收标准

| # | 验收项 | 判据 |
|---|---|---|
| A1 | 标的数现算 | `getInstrumentCount('bstocks')` === 105；`/stocks` 上显示 105 不是 80 |
| A2 | NBISB 市值正确 | 标的页显示 `$12.8M`，不是 `$0` |
| A3 | 换手格式 | INTWB 显示 `38.5×` 且为警示色；AMATB 显示 `0.13×` 且为 subtle |
| A4 | 无溢价列 | 页面上不存在「溢价」「premium」「プレミアム」任何一处 |
| A5 | 上线区间语义 | 页面文案为「上线以来高/低」，无「历史最高」字样 |
| A6 | 三语完整 | `pnpm build` 末尾 `check-i18n` 全绿；345 个新页面各有 canonical + 3 条 alternate |
| A7 | 离线可构建 | `sync-instruments.mjs` 拿不到数据源时 exit 0 并保留已提交快照；构建全程不联网 |
| A8 | 降级 | 断网跑 `sync-instruments.mjs`：回退到上次快照 + stderr 警告，构建不失败 |
| A9 | 口径脚注 | 聚合指标下方有「105 条中的 100 条」，补齐后移除 |
| A10 | 回归 | `pnpm typecheck` 干净；`pnpm test` 全绿（现 121 个） |

**每个阶段至少有一条「某个数字变真或变小」** —— 10-28 的教训：把「分类更细」做成「展示更多」，结果是「感觉没什么变化」且「更挤了」。

### 6.9 行情快照提交进仓库，不进 `.generated/`

PRD 原本把行情写进 `.generated/instrument-quotes.json`，实现时改了，理由是具体的：

- `.generated/` 的路径解析要用 `resolveGeneratedDir()`，而这套解析**已经有两份**必须同步（`scripts/lib/content/paths.mjs` 与 `src/data/blog.ts`）。2026-10-30 加第三份（`check-i18n.mjs` 自己拼路径）直接把 Vercel 构建弄挂过一次。再加一份是明知的雷。
- 这个文件约 30 KB，不是 7,356 篇文章的内容缓存，没有「不能进 git」的体量理由。
- 仓库里**已有同形状的先例**：`src/data/weekly-research-localizations.json`、`src/data/research-descriptions.json` 都是同步脚本产出、提交进仓库、由 TS 直接 `import ... with { type: 'json' }`。
- 提交进仓库后静态导出全程不联网，Vercel 零配置；每次刷新的 `asOf` 落在 git 历史里，正好是页面要展示的来源信息。

**代价**：刷新行情从「构建副作用」变成「一次提交」。站点本来就是按 commit 部署的静态导出，而且仓库里 `sync-telegram.yml` 和 `weekly-research.yml` 已经是「同步 → 提交」这个形状，所以这不是新增机制。T15 因此从「接进 build 链」变成「接进一个 workflow」。

## 9. 需要决策（阻塞项）

1. **美股价格源** —— 溢价/折价的前提。不定则 §6.3 维持「本期不做」。
   候选：Alpha Vantage free / Finnhub free / Yahoo 非官方。
2. **行情刷新方式** —— 建议构建时拉（这 20 天本就每天部署）。替代方案客户端拉公共 API，但暴露限流且不可缓存，且 `/api/*` 线上 404（Worker 从未部署）。
3. **345 个新页进不进 sitemap / RSS** —— 建议进 sitemap、**不进 RSS**（否则订阅端被 345 条灌满）。

## 10. 风险

| 风险 | 影响 | 对策 |
|---|---|---|
| 薄内容页批量进站 | 345 页低文字量，可能被判薄内容降权 | 标的页必须有不可自动生成的部分（法律包装、赎回条款、组论点）；研报跟上后互链 |
| CMC 单一数据源 | 口径变了或字段改名则全线失真 | 元数据提交进仓库，行情失败回退快照；`nameSource` 记录来源 |
| 发行方停发/下架 | 标的页变成死页 | `Instrument` 加 `delistedAt?: string`，下架不删页，标注状态 |
| 全量 build 压力 | 站主机器曾被内存耗尽冻死 | **本地不跑全量 build**，增量内容管线 + typecheck + test 验证，全量交给 Vercel |
