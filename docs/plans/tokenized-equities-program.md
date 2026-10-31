# 链上美股内容计划（bStocks 首发）

> 数据口径：CoinMarketCap RWA 列表，`issuer_id=6a2aed5097c45356b1a5f710`，快照时间 **2026-10-31 06:06 UTC**。
> 本次返回 100 条，CMC `totalCount` 为 **105**，余下 5 条在下一页，未取。
> 仓库现值 `instrumentCount: 80`、`onchainValueUsd: 914_000_000`（`DATA_AS_OF = '2026-10-16'`）均已过期。

---

## 0. 先承认缺口在哪

`src/data/tokenized-equities.ts` 现在是**两层**模型：发行方层（法律包装 / 托管 / 赎回 / PoR）+ 工具层（场所 / 深度 / 价差）。
缺的是中间那层：**标的**。

- `Issuer` 只有 `instrumentCount?: number`，是一个硬编码的数字，背后没有列表。和 10-28 修掉的 `postCount` / `projectCount` 同一类问题，必然漂移 —— 现在就已经漂了（80 → 105）。
- `TokenRow` 是全站扁平榜 `TOP_TOKENS`，不挂在发行方下面，无法回答"bStocks 发了哪些"。
- 行情硬编码在 TS 里，`DATA_AS_OF` 已经 15 天没动。

所以「基础股票信息 + 行情 + 研报」这三件，目前只有第一件有地方放，而且放不全。

---

## 1. 这 100 条代币的整体画像

| 指标 | 值 |
|---|---|
| 合计市值 | ≈ **13.2 亿美元** |
| 合计 24h 成交额 | ≈ **8.73 亿美元** |
| 整体换手（成交额 / 市值） | **0.66** |
| 前 5 名市值合计 | 6.254 亿 = **47%** |
| 最早上线 | 2026-06-11（6 个首发：SPCXB / CRCLB / SNDKB / MUB / NVDAB / TSLAB） |
| 最新上线 | 2026-10-26（GEVB / APPB / SKUUB） |

**换手率是这个发行方最反常的地方**，也是全站最值得写的一组事实：

| 代币 | 标的 | 市值 (USD) | 24h 成交 (USD) | 换手 | 30d |
|---|---|---|---|---|---|
| INTWB | GraniteShares 2x Long INTC | 1,443,974 | 55,535,063 | **38.46×** | −78.0% |
| MRNAB | Moderna | 2,295,908 | 23,663,196 | **10.31×** | +15.3% |
| ALABB | Astera Labs | 673,616 | 3,441,479 | **5.11×** | −29.5% |
| SNXXB | Tradr 2X Long SNDK | 6,818,194 | 28,423,246 | **4.17×** | −61.2% |
| UVXYB | ProShares Ultra VIX | 463,055 | 1,728,019 | 3.73× | +20.1% |
| RDDTB | Reddit | 463,691 | 1,713,512 | 3.70× | −36.3% |
| … | | | | | |
| TMFB | 20+ Yr Treasury Bull 3X | 425,433 | 91,625 | 0.22× | +4.8% |
| BRKBB | Berkshire Hathaway | 562,552 | 125,323 | 0.22× | +1.1% |
| VSTB | Vistra | 505,955 | 105,315 | 0.21× | −9.9% |
| CRMB | Salesforce | 501,880 | 91,803 | 0.18× | −1.1% |
| AMATB | Applied Materials | 9,024,342 | 1,170,325 | **0.13×** | −26.3% |

一句话：**在这个渠道里，蓝筹代币几乎没有人碰，杠杆与叙事代币一天换手几倍到几十倍。** 这不是一篇文章的素材，这是整个系列的主线。

---

## 2. 三个会坑到实现的数据细节

1. **不能用 `fullyDilluttedMarketCap`。** `NBISB` 的 `totalSupply` 是 `0E-8`，所以它的 `fullyDilluttedMarketCap` 和 `marketCapByTotalSupply` 都返回 **0.00**，只有 USD quote 的 `marketCap` 是真值（12,819,574）。取错字段会让 Nebius 显示市值 0。
2. **6 个代币缺 `underlyingRwaName`**：`SECZB`(Securitize)、`CYPHB`(Cypherpunk Technologies)、`BRKBB`(Berkshire Hathaway)、`USDEB`(StablecoinX)、`SKUUB`(2x SK Hynix)、`BOTB`(RoboStrategy)。标的名只能从 `name` 字段反推，需人工补并标记来源。
3. **代币单价不是标的股价的 1:1，且乘数因标的而异。** `SNDKB $1,155.20`、`MUB $902.01`、`LITEB $844.45` 明显高出对应普通股报价一个量级；`AAPLB $345.04`、`SPYB $756.65` 又接近 1:1。
   **这直接否掉了「溢价/折价」作为第一版指标。** 它本来是相对 CMC 最有差异化的一列，但必须先对每个代币标定「代币单价 / 标的股价」的比例，否则算出来的每一个溢价数都是错的。详见 §6 决策点 1。

另外：所有 `ath` / `atl` 都落在 2026-06-11 之后，是**代币上线后的区间**，不是标的的历史高低点。页面上必须写清楚，否则读者会当成股票的 ATH。

---

## 3. 数据层：补上标的这一层

### 3.1 新类型（加在 `src/data/tokenized-equities.ts`）

```ts
export type UnderlyingKind =
  | 'common-stock' | 'adr' | 'etf' | 'leveraged-etf' | 'inverse-etf' | 'pre-ipo' | 'unknown';

export type Instrument = {
  ticker: string;                    // SPCXB
  issuerSlug: string;                // bstocks
  underlying: {
    symbol: string | null;           // SPCX / null（pre-IPO 或元数据缺失）
    name: string;                    // SpaceX
    kind: UnderlyingKind;
    leverage?: number;               // 2 / 3 / -3
  };
  listedAt: string;                  // 2026-06-11
  chains: string[];                  // ['BNB Chain']
  cmcId?: number;
  cmcSlug?: string;
  articleKey?: string;               // 绑定研报的 translationKey
};
```

`instrumentCount` 从 `Issuer` 删掉，改成 `getInstrumentCount(issuerSlug)` 现算 —— 和 10-28 的 `getTopicPostCount` 同一个修法。

### 3.2 两类数据分开存

| 性质 | 位置 | 是否提交 | 更新方式 |
|---|---|---|---|
| 元数据（标的、上线日、链、乘数） | `src/data/instruments/bstocks.json` | **提交** | 人工 review 后合并 |
| 行情（价格、市值、成交、换手、涨跌） | `.generated/instrument-quotes.json` | 不提交（已 gitignore） | 构建时生成 |

元数据用 JSON 而不是 TS，这样加新标的不需要改代码。

### 3.3 摄入脚本 `scripts/sync-instruments.mjs`

吃 CMC 的 `cryptoCurrencyList` 这个形状（也就是你这次给的 JSON），输出上面两份。

**硬约束**：
- 读写 `.generated/` **必须** `import { ... } from './lib/content/paths.mjs'`，不能自己拼路径。这是 10-30 那次 `check-i18n.mjs` 在 Vercel 上 ENOENT 的同一个坑；`resolveGeneratedDir()` 在 `env.VERCEL` 下会指到 `${NEXT_DIST_DIR}/cache/content/`。这是第四处需要同步这套解析的地方。
- `marketCapUsd` 取 `quotes[name==='USD'].marketCap`，**不取** `fullyDilluttedMarketCap`。
- `turnover` CMC 已给（`quotes[].turnover`），直接用，不自己算。
- API 失败时**回退到上一次提交的快照**，不让一次拉取失败把线上构建弄挂。

---

## 4. 页面：三级

### `/stocks`（保留 10-28 减密后的形态，不推翻）
加一列「已发行标的数」，现算，链到发行方页。

### `/stocks/[issuer]` —— 新增
发行方档案（现有 `Issuer` 字段全部复用）+ 该发行方**全部标的表**（可按市值 / 成交 / 换手 / 上线日排序）+ 该发行方相关研报列表。

### `/stocks/[issuer]/[ticker]` —— 新增，这就是「基础信息 + 行情 + 研报」
- **基础**：标的公司或 ETF、类型与杠杆倍数、发行方包装方式、链与合约地址、分红与投票、赎回条件与门槛、美国人限制
- **行情**：价格、市值、24h 成交、换手、7d/30d/90d、流通量、上线以来高低（**明确标注是上线后区间，不是标的 ATH**）
- **研报**：绑定的 MDX 文章

**三语是硬要求**（build 末尾的 `check-i18n` 会卡住）：105 标的 × 3 = **315 页**，加发行方页 10 × 3 = 30 页。相对现有 7,347 篇文章可忽略。

---

## 5. 内容：5 个一组，但不是 5 篇/天

**先说产能这件事。** 三语意味着每篇研报 = 3 个 MDX。5 篇/天 = **15 个 MDX/天**。10-30 那天做 12 个 MDX（4 篇 × 三语，含逐条核数）是一整轮高强度工作。15 个/天不可持续，而且会把质量稀释到和 AI 生成的 SEO 农场没区别 —— 那样引流也白引。

**所以把「覆盖」和「深度」拆开：**

| 层 | 产物 | 数量 | 节奏 |
|---|---|---|---|
| 标的档案页 | 数据驱动，不是文章，不进 `/blog` | 105 × 3 语 = 315 页 | 一次建成 |
| 分组研报 | MDX × 三语 | 20 组 × 3 = 60 MDX | **1 组/天，20 天走完** |
| 行情异动笔记 | `thoughts`，短文 | 不定 | 换手异常时写 |

**每天上线的新 URL = 1 组研报 3 语（3 页）+ 该组 5 个标的页 3 语（15 页）= 18 个页面。**
写作量是 3 MDX/天。20 天后全站 105 个标的页 + 20 篇对比研报全部就位。

长尾 SEO 靠标的页（"SPCXB 价格"、"SpaceX 代币化股票"这类词 315 个落地页），权威性靠研报。这个拆分比 20 篇独立研报的引流效果更好，写作负担只有五分之一。

---

## 6. 需要你定的三件事

1. **美股价格源**。算溢价/折价必须有标的实时价，而且要先标定乘数（§2.3）。免费选项：Yahoo Finance 非官方接口、Alpha Vantage free tier、Finnhub free。**不定的话第一版就不出溢价列** —— 这比出一列错数好。
2. **行情刷新方式**。站点是 `output: 'export'` 静态导出，`/api/*` 线上 404（Worker 从未部署）。建议**构建时拉取**，因为这 20 天本来每天都要部署；页面标注快照时间。另一条路是客户端拉公共 API，但会暴露限流且不可缓存。
3. **315 个标的页进不进 sitemap / RSS**。进 sitemap 有长尾收益，但薄内容页批量进站有被降权的风险；RSS 我倾向**不进**，否则订阅端会被 315 条灌满。

---

## 7. 20 组 × 5 个标的（按论点分组，非按市值硬切）

每组一篇三语对比研报。前 8 组论点已有数据支撑，后 12 组按赛道归类、论点待写时确定。

| # | 组名 | 5 个标的 | 论点 |
|---|---|---|---|
| 01 | 旗舰与五种定价锚 | SPCXB · CRCLB · MSTRB · GOOGLB · QQQB | 最大的 5 个占全盘 47%，却是 5 种完全不同的定价机制：pre-IPO 无公开锚、新股、BTC 代理、蓝筹、指数 |
| 02 | **单票 2x 杠杆 ETF** | INTWB · SNXXB · MVLLB · MUUB · SKUUB | 换手 38.46× / 4.17× / 2.60× / 0.58× / 0.96×，30d −78% / −61% / −52%。发行方给同一批标的同时上了现货和杠杆版，交易量全在杠杆版 |
| 03 | 内存超级周期 | SNDKB · MUB · SKHYB · DRAMB · WDCB | 押得最重的赛道。SNDKB 市值 7,698 万、日成交 9,780 万（换手 1.27），而同赛道 ETF 的 DRAMB 只有 0.19 —— 单票和 ETF 的流动性差 7 倍 |
| 04 | 半导体设计与制造 | NVDAB · AVGOB · AMDB · TSMB · ARMB | 同一赛道内注意力分布：NVDAB 0.89 vs TSMB 0.32 vs ARMB 0.77 |
| 05 | 方向性 3X 与波动率 | SOXLB · SOXSB · TQQQB · SQQQB · UVXYB | 多空 3X 同时上架。SOXLB 30d −51.9%，SOXSB 30d +70.8% —— 纯方向赌注工具，不是投资标的 |
| 06 | 加密财库股 | BNCB · BMNRB · FWDIB · CYPHB · USDEB | 交易所自营发行"持币公司"的股票代币。BNCB（BNB 财库）9-14 上线已是第 10 大。利益冲突要写明 |
| 07 | **Mag7 的冷门一半** | AAPLB · MSFTB · AMZNB · METAB · TSLAB | TSLAB 市值 2,368 万，比 AAPLB(545 万) + MSFTB(437 万) + AMZNB(373 万) + METAB(746 万) 加起来还多 12.7%。加密渠道的偏好和公开市场完全不同 |
| 08 | 亚洲敞口 | EWYB · KORUB · KSTRB · BABAB · PDDB | 韩国这条线被重复下注三次（SKHYB 现货 + SKUUB 2x + KORUB 3X + EWYB 宽基）。KORUB 30d −49.7% |
| 09 | 光模块与互联 | AAOIB · LITEB · COHRB · CRDOB · MRVLB | AI 资本开支的第二层受益者 |
| 10 | 新算力与数据中心 | CRWVB · NBISB · CBRSB · IRENB · SMCIB | 顺带讲 NBISB 的 `totalSupply: 0` 导致第三方 FDV 显示 0 的数据质量问题 |
| 11 | AI 的物理瓶颈 | GEVB · VSTB · FLNCB · BEB · USARB | 电力与材料。VSTB 换手 0.21、GEVB 0.31 —— 加密渠道对基础设施股没兴趣 |
| 12 | **没有公开锚的标的** | QNTB · AGPUB · SHAZB · BOTB · SECZB | 这 5 个都缺少公开股票对照，后 3 个在 CMC 上连标的名都没有。没有锚的"代币化股票"，价格是什么？ |
| 13 | 散户叙事股 | GMEB · AMCB · DJTB · HIMSB · GPROB | DJTB 30d −38%、90d −52% |
| 14 | 老牌科技的转型 | INTCB · IBMB · NOKB · BBB · QCOMB | INTCB 换手 1.75、24h −8.1%、30d −47.6%，是前 10 大市值里换手最高的（第二是 SNDKB 1.27） |
| 15 | 宽基与设备 | SPYB · SMHB · ASMLB · AMATB · TMFB | 换手 0.13（AMATB）–1.09（ASMLB），中位数最低的一组 |
| 16 | 软件与 SaaS | ORCLB · CRMB · ADBEB · PLTRB · CRWDB | CRMB 日成交仅 9.2 万 |
| 17 | 金融与支付 | JPMB · GSB · PYPLB · HOODB · COINB | 交易所发券商与交易所的股票 |
| 18 | 存储硬件与整机 | STXB · DELLB · PENGB · ALABB · GLWB | ALABB 换手 5.11，和同组其他差一个量级 |
| 19 | 太空与材料 | RKLBB · ASTSB · AXTIB · APPB · RDDTB | |
| 20 | 医药与消费 | LLYB · MRNAB · NFLXB · WENB · BRKBB | MRNAB 换手 10.31 —— 一只医药股在加密渠道换手第二高，原因待查 |
| 21 | （待取） | CMC 第二页的 5 条 | 先补数据 |

完整的 100 个标的明细（市值 / 成交 / 换手 / 上线日 / 流通量 / CMC id）在摄入脚本第一次运行后落到 `src/data/instruments/bstocks.json`。

---

## 8. 落地顺序

| 阶段 | 内容 | 验收 |
|---|---|---|
| P1 | `Instrument` 类型 + `bstocks.json` + `sync-instruments.mjs` | 105 条齐全（含第二页 5 条）；`getInstrumentCount('bstocks')` 返回 105；6 个缺名标的已人工补并标来源 |
| P2 | `instrumentCount` 字段退役，改现算 | `pnpm typecheck` 干净；`/stocks` 上的数字变成真值 |
| P3 | `/stocks/[issuer]` 三语 | 3 语 × 10 发行方 = 30 页；`check-i18n` 过 |
| P4 | `/stocks/[issuer]/[ticker]` 三语 | 315 页；canonical + 3 条 alternate 正确 |
| P5 | 行情接入构建链 | 走 `paths.mjs`；两种布局（默认 `.generated` / `VERCEL=1`）都实测；API 失败回退快照 |
| P6 | 第 1 组研报（旗舰与定价锚）三语 | 口径与数字逐条核过；绑定到 5 个标的页 |
| P7 | 第 02–20 组，1 组/天 | 每组研报与 5 个标的页同日上线 |

**每个阶段的验收里必须有一条"某个数字变小或变真"** —— 这是 10-28 那次改版的教训：把"分类更细"做成"展示更多"，结果是「感觉没什么变化」且「更挤了」。

