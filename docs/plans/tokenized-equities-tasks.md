# 任务拆分：链上美股标的库

> 规格：[tokenized-equities-prd.md](./tokenized-equities-prd.md) · 内容计划：[tokenized-equities-program.md](./tokenized-equities-program.md)
> 22 个任务，分 5 个阶段。**阶段 A 的 T01 是全局前置**，其余同阶段内可并行。

---

## 进度（2026-10-31）

**阶段 A、B、C、D 已完成，T19 已完成**，`T01` 与 `T22` 挂账，`T20`（第 2–20 组）待做。
写研报的规范已固化为 `.claude/skills/stocks-research-report/SKILL.md`，配套统计脚本 `pnpm stats:group <slug|index>`。

| 任务 | 状态 | 落地 |
|---|---|---|
| T01 取 CMC 第二页 5 条 | **挂账** | 需站主提供数据；现有 100 条已够开工，缺的 5 条显示 `—` |
| T02 类型 | 完成 | `src/data/tokenized-equities.ts`：`UnderlyingKind` / `UNDERLYING_KIND_LABEL` / `Instrument` / `InstrumentGroup` |
| T03 摄入脚本 | 完成 | `scripts/sync-instruments.mjs` + `pnpm sync:instruments` |
| T04 元数据 | 完成 | `src/data/instruments/bstocks.json`（100 条）+ `bstocks.review.json`（人工复核） |
| T05 20 组 | 完成 | `src/data/instrument-groups.ts`，三语标题与论点，100 条全覆盖 |
| T06 计数现算 | 完成 | `instrumentCountFor()`；`Issuer.instrumentCount` → `reportedInstrumentCount` |
| T07 格式化 | 完成 | `src/lib/instrument-format.ts`，换手四档 + 缺失值 |
| T08 总览页加列 | 完成 | `/stocks` 第四列「标的数」；展开行的换手改 `×` 口径 |
| T09 发行方页路由 | 完成 | `(localized)/[locale]/stocks/[issuer]/page.tsx` + `src/components/stocks/issuer-view.tsx` |
| T10 发行方页聚合 | 完成 | `getIssuerTotals()`：标的数 / 合计市值 / 24h 成交 / 整体换手 / 首发 / 最新 |
| T11 标的表 | 完成 | `instrument-table.tsx`，4 种排序 + 7 档类型筛选，客户端组件直接 import JSON |
| T12 标的页路由 | 完成 | `[locale]/stocks/[issuer]/[ticker]`，100 × 3 = 300 页 |
| T13 标的页三段 | 完成 | 基础信息 12 格 / 行情 8 格 + 大价格 / 研报组卡 |
| T14 面包屑 + 同组互链 | 完成 | 每页恰好 4 条同组链接，单测钉住全部可解析 |
| T16 sitemap | 完成 | `pages.xml` 69 → 375 个 URL，标的页 priority 0.6 |
| T17 JSON-LD | 完成 | 发行方页 `BreadcrumbList`；标的页 `BreadcrumbList` + `FinancialProduct`（不带 offers） |
| T18 回归测试 | 完成 | 27 条新测试；全量 148/148 |

**未验证的部分**：三类页面的视觉效果都没在浏览器里看过 —— 本机不跑服务也不跑全量 build（会把机器内存耗尽）。结构性验证是 `typecheck` 干净、`pnpm test` 148/148、`pnpm lint` 0 error，以及把 `check-i18n` 的链接不变量写成了单测（`src/lib/stocks-routes.test.mjs`）。真正那一关在 Vercel 上跑。

**两处实现决定**：

1. **`localizeHref` 的路由白名单必须加 `stocks(?:\/[^/]+){0,2}`**。它原本只认 `/stocks`，所以 `/stocks/bstocks/SPCXB` 会原样返回不带语言前缀 —— 和 `/blog/*` 一样的沉默失败：页面照样渲染、链接照样能点，只有 canonical 和 hreflang 是错的。`/stocks` **此前从来不在 `check-i18n` 的清单里**（那 69 页是 23 × 3，没有 stocks），所以这个洞不会被现有检查发现。现已把 `stocks` 连同 101 个新页一起加进去，清单从 23 页涨到 125 页（375 个本地化页）。
2. **新的动态路由不生成 legacy（无语言前缀）版本**。`/stocks` 自己还有 legacy 版，但那 101 个新页的 legacy 版会是 `/en/...` 的逐字节副本、canonical 还指向 `/en/`，正是 2026-10-17 删掉 `/blog/[slug]` 时清掉的那种重复。**代价**：`/stocks/bstocks/SPCXB` 这种不带语言前缀的深层 URL 会 404 —— 这些 URL 从未存在过，站内也没有指向它们的链接（legacy `/stocks` 页的 `useI18n()` 拿到 `DEFAULT_LOCALE = 'en'`，所以它链的是 `/en/stocks/bstocks`）。

---

## 阶段 A — 数据层（T01–T07）

没有这一层，后面每一页都只能显示手写数字。

| # | 任务 | 依赖 | 产出 | 验收 |
|---|---|---|---|---|
| **T01** | 取齐 CMC 第二页 5 条 | — | 完整 105 条原始 JSON | `totalCount` 与条数一致，105/105 |
| **T02** | 加 `UnderlyingKind` / `Instrument` / `InstrumentGroup` 类型 | — | `src/data/tokenized-equities.ts` 新增三个类型 | `pnpm typecheck` 干净 |
| **T03** | 摄入脚本 `scripts/sync-instruments.mjs` | T02 | 脚本 + 两份输出 | 五条硬约束逐条验证（见下） |
| **T04** | 生成并人工 review `src/data/instruments/bstocks.json` | T01 T03 | 元数据 + `bstocks.review.json`，均提交 | 6 个缺名从 `name` 反推并标 `nameSource:'derived'`；杠杆/反向 ETF 的 `leverage` 已标；无法确认上市状态的保持 `unknown` |
| **T05** | 20 组 `InstrumentGroup` 数据（三语标题 + 论点） | T04 | 组数据，105 条全覆盖 | 每条标的恰好属于 1 组；无重复无遗漏 |
| **T06** | `instrumentCount` 退役 → 现算 | T04 | `Issuer.instrumentCount` 改名 `reportedInstrumentCount`，新增 `instrumentCountFor()` | 有摄入数据的按清单计数，没有的退回发行方公布值并标记 `counted:false` |
| **T07** | 格式化工具抽成共享模块 | — | `formatTurnover` / `formatPrice` / `formatChange` / `usd` | 单测钉住 PRD §6.1 四档色阶与 §6.8 各格式 |

**T03 的五条硬约束**（每条都有真实反例，必须逐条测）：
1. ~~走 `paths.mjs`~~ → **已改设计**，快照提交进 `src/data/instruments/quotes.json`（PRD §6.9）；验收改为「拿不到数据源时 exit 0、保留快照」
2. 市值取 USD quote 的 `marketCap`，不取 `fullyDilluttedMarketCap` → 用 NBISB 验证（应为 12.8M 非 0）
3. `turnover` 用 CMC 原值不自己除 → 用 INTWB 验证（38.45987317）
4. `ath`/`atl` 落到 `listedHigh`/`listedLow` → 字段名不含 `ath`
5. 拉取失败回退上次快照 + stderr 警告 → 断网实测，构建不失败

---

## 阶段 B — 总览页改动（T08）

| # | 任务 | 依赖 | 产出 | 验收 |
|---|---|---|---|---|
| **T08** | `/stocks` 加「标的数」列，去 `+` 后缀 | T06 | 改 `stocks-client.tsx` | 显示 `105` 不是 `80+`；链到发行方页；三语列头 |

改动刻意最小 —— 10-28 刚做完减密，不推翻。

---

## 阶段 C — 发行方页（T09–T11）

| # | 任务 | 依赖 | 产出 | 验收 |
|---|---|---|---|---|
| **T09** | `/stocks/[issuer]` 路由 + 三语 | T04 | `(legacy)/stocks/[issuer]/page.tsx` 导出 `renderPage(locale, params)`；`(localized)/[locale]/stocks/[issuer]/page.tsx` import 调用 | 10 发行方 × 3 语 = 30 页；`generateStaticParams` + `dynamicParams = false` |
| **T10** | 发行方页聚合指标 | T09 T15 | 标的数 / 合计市值 / 合计成交 / 整体换手 / 首发日 | bStocks 显示 ≈13.2 亿、≈8.73 亿、0.66×；脚注有「105 条中的 100 条」 |
| **T11** | 发行方页标的表（排序 + 类型筛选） | T09 T07 | 全部标的行 | 4 种排序可用；类型筛选含「杠杆 ETF」分档（因换手差一个量级） |

---

## 阶段 D — 标的页（T12–T18）

| # | 任务 | 依赖 | 产出 | 验收 |
|---|---|---|---|---|
| **T12** | `/stocks/[issuer]/[ticker]` 路由 + 三语 | T04 T09 | 同 T09 的双文件形状 | 105 × 3 = 315 页 |
| **T13** | 标的页三段式内容 | T12 T07 | 基础信息 / 行情 / 研报 | A2 A3 A4 A5 全过（见 PRD §8） |
| **T14** | 面包屑 + 同组其他 4 个标的互链 | T12 T05 | 导航区块 | 每页恰好 4 条同组链接，全部解析到存在的本地化页 |
| **T15** | 行情刷新接进 workflow | T03 | 定时跑 `sync:instruments` 并提交 | 参照 `sync-telegram.yml` 的「同步 → 提交」形状；页面显示 `asOf` |
| **T16** | sitemap 接入 | T12 · **决策 3** | 345 页进 sitemap 分片 | 按决策执行；RSS 默认不进 |
| **T17** | 标的页 JSON-LD | T13 | schema 结构 | 用 `FinancialProduct` 而非 `Dataset`（总览页才是 Dataset） |
| **T18** | 回归测试 | T07 T13 | 新测试文件 | `pnpm test` 全绿；新增至少 4 条：换手四档、NBISB 市值、组覆盖完整性、三语组完整性 |

---

## 阶段 E — 内容（T19–T20）

| # | 任务 | 依赖 | 产出 | 验收 |
|---|---|---|---|---|
| **T19** | 第 1 组研报《旗舰与五种定价锚》三语 | T05 T13 | ✅ `bstocks-flagship-pricing-anchors{,-en,-ja}` | 55 个成员数字逐条回查快照；`articleSlugs` 已回填；5 个标的页链到它；三语渲染结构一致、空 `<p></p>` 归零 |
| **T20** | 第 2–20 组，1 组/天 | T19 | 19 × 3 = 57 MDX | 每组研报与其 5 个标的页同日上线；走 `stocks-research-report` skill 的验收门 |

**产能口径**：3 MDX/天，不是 15。每天上线 18 个新 URL（3 研报页 + 该组 5 标的页 × 3 语）。
理由见 program 文档 §5 —— 5 篇/天 × 三语 = 15 MDX/天 不可持续，会把质量稀释成 SEO 农场。

---

## 阶段 F — 挂账（T21–T22，不阻塞上线）

| # | 任务 | 依赖 | 说明 |
|---|---|---|---|
| **T21** | 补 105 个合约地址 | T04 | CMC 数据里**没有**这个字段（PRD §6.7）。第一版显示 `—` + 链到 CMC 页，不编造 |
| **T22** | 溢价/折价 | **决策 1** | 必须先逐个标定乘数（PRD §6.3）。标定前任何溢价数都是错的 |

---

## 关键路径

```
T01 ──┬─ T04 ──┬─ T05 ── T14
      │        ├─ T06 ── T08
T02 ── T03 ─────┤        
      └─ T15 ───┼─ T09 ──┬─ T10
                │        └─ T11
T07 ────────────┴─ T12 ── T13 ──┬─ T17
                                ├─ T18
                                └─ T19 ── T20
```

**T01 → T04 → T12 → T13 → T19 是关键路径。**
T02 / T07 可立即开工，不等任何东西。

## 验证纪律

- **本地不跑全量 `pnpm build`** —— 曾把站主机器内存耗尽冻死。用 `pnpm content:check` + `pnpm content:build`（增量、hash 缓存）+ `pnpm typecheck` + `pnpm test`，全量交给 Vercel。
- 新页面涉及 i18n 结构，所以 **T09 / T12 这两步必须过一次全量 build 的 `check-i18n`** —— 这一关只能在 Vercel 上过，本地不跑；推之前心里有数：i18n 结构坏了会直接让部署失败（10-30 刻意接进 `build` 链末尾的）。
- 提交需站主确认（CLAUDE.md），不自动 commit。
