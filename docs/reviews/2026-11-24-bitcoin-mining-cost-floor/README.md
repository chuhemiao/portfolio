# 比特币挖矿成本与矿工抛售三语复核

2026 年 11 月 24 日 · 博客「思考」分类

| 语言 | 原稿或翻译初稿 | 前后差异 | 成稿 |
| --- | --- | --- | --- |
| 简体中文 | [原稿](baseline.zh-CN.md) | [简中差异](comparison.zh-CN.diff) | [简中 MDX](../../../content/blog/2026/thoughts/bitcoin-mining-cost-floor-miner-selling.mdx) |
| English | [英文初稿](baseline.en.md) | [英文差异](comparison.en.diff) | [英文 MDX](../../../content/blog/2026/thoughts/bitcoin-mining-cost-floor-miner-selling-en.mdx) |
| 日本語 | [日文初稿](baseline.ja.md) | [日文差异](comparison.ja.diff) | [日文 MDX](../../../content/blog/2026/thoughts/bitcoin-mining-cost-floor-miner-selling-ja.mdx) |

## 数据与判断

| 核对项 | 三语采用的口径 |
| --- | --- |
| 电费、公司样本与生产成本 | 保留原稿 61,210 美元现货价、55,000 至 65,000 美元观察区间和 60,000 至 63,000 美元压力区间。约 60,000 美元为 20 J/TH、0.05 美元/kWh 的电费情景。62,862 美元为根据 MARA 披露推算的不含折旧的公司级成本，含其他运营支出。86,000 美元采用 JPMorgan 11 月 18 日的生产成本估计。280 天对应 9 月报告拿现货与浮动成本序列的比较。 |
| 难度与算力 | 确认区块 975,744 将难度从 148.36 T 降至 134.82 T，降幅 9.13%。保留快照中的 77.1% 与 461 块，复核时为 77.28% 与 458 块，预估增幅仍约 9.96%。北京时间 11 月 27 日与 UTC 11 月 26 日为同一预估。149.3 T 是 2025 年 11 月 27 日水平，公开序列内最高为 2025 年 10 月 29 日的 155.97 T。此前同日 1,245 EH/s 用作日期对照。 |
| 收入与关机电价 | 把 24.6 → 22.4 美元／PH/s／日标作归一化情景，保留原稿的 22 至 23 美元范围和 30 J/TH、13.5 J/TH 电价门槛。实际难度下的补贴收入另算约 28.5 → 25.9 美元，暂不计交易费。11 月 23 日 Hashrate Index 现货为 28.62 美元。约 66,000 美元的电费是以相同电价和效率外推的成本敏感性。 |
| 融资与估值 | 保留 500% 债务增幅和 IREN 211 亿美元，标明为样本、终点或单项金额未独立复核的原稿估计。VanEck 500 亿美元为 6 月的计划开工模型。保留 IREN 36.5 亿美元约 6%、24 亿美元固定 9% 与 Cipher 担保 14 亿美元、认股权证约 5.4%。股价按原稿快照处理，ATM 比较的是同额融资所需股份数量。 |
| 持仓与累计出售 | 保留 Blockware 样本的 127,000 → 99,000 BTC、28,000 BTC 净减及 17.8 亿美元当时估值。按 127,000 BTC 起点推算到 65,000 至 70,000 BTC，减少 44.9% 至 48.8%，将“过半”改为“近半”。Glassnode 的观察有独立公司范围，推算余量不作为逐家公司余额合计。108,247 BTC、80.8 亿美元为 Coinpedia 转述的另一组累计出售。 |
| ETF 与发行 | 保留原稿 30 日净流出 41.8 亿美元、约 6.85 万枚当量，用已注明窗口的 Farside 数据复算得 43.394 亿美元、约 7.11 万枚当量。用统一币价对照资金流出与约五个月的目标产出。区块补贴 3.125 BTC、目标 450 BTC／日、365 日折算 164,250 BTC／年仍在发行小节。 |

原稿的 280 天数据与生产成本估计分属 9 月和 11 月报告。MARA、IREN、Cipher 的数据以当期公司披露和有日期的报道为准。矿机个别盈利与六个月股票观察保留原稿来源边界。 [JPMorgan 9 月观察](https://www.theblock.co/news/markets/2026-09-24-jpmorgan-bitcoin-production-cost-miners-relief-416283) · [JPMorgan 11 月估计](https://www.theblock.co/news/markets/2026-11-20-jpmorgan-bitcoin-price-correction-gap-86000-production-cost-444763) · [MARA 当期披露](https://www.sec.gov/Archives/edgar/data/1507605/000150760526000026/q326shareholderletter.htm) · [IREN 财年披露](https://www.sec.gov/Archives/edgar/data/1878848/000187884826000051/irenreportsfy26results.htm) · [Cipher 年报](https://www.sec.gov/Archives/edgar/data/1819989/000181998926000018/cipher2025arsvf.pdf)

保留原稿对融资分层、矿工卖压和 ETF 边际需求的权重判断，以及 30／60 日算力、两次难度调整、ETF 周流向三个观察项。12 月中旬的下调依赖实际停机与出块，在三语中均用条件表述。

## 计算与图表

- 电价乘每日用电量得到全网电费。1.126 ZH/s 换算为 11.26 亿 TH/s，按每行 J/TH 转为功率后乘以 24 小时。日账单分别为 19,457,280、27,024,000、32,699,040、40,536,000 美元。按 450 枚新增 BTC 分摊。原稿图表标记改为共享 PNG，原表四组参数均保留。 [计算存档](calculations.json) · [电费图](../../../public/images/blog/bitcoin-mining-cost-floor-miner-selling/electricity-cost.png)
- 归一化日收入采用 453 BTC × 61,176 美元 ÷ 1,126,000 PH/s，得 24.61 美元，再除以 1.0996 得 22.38 美元。按当期难度计算时，预期区块数为 10¹⁵ × 86,400 ÷ 难度 ÷ 2³²，乘 3.125 BTC 与售价，得到 28.52 和 25.94 美元。保持其他输入固定时，难度下调 10% 也会让单位电费下降约 10%。 [mempool 难度预估](https://mempool.space/api/v1/difficulty-adjustment) · [mempool 历史序列](https://mempool.space/api/v1/mining/hashrate/3y) · [Hashrate Index 指标](https://data.hashrateindex.com/bitcoin-compute-data/bitcoin-hashprice-index)
- Farside 复算使用 10 月 24 日至 11 月 22 日内的 20 日交易数据，合计净流出 4,339.4 百万美元。11 月 19、20 日分别为 582.3、669.2 百万美元净流出。按 61,000 美元折算约 71,138 BTC。这个量表示资本流出的币价当量。 [Farside 每日资金流](https://farside.co.uk/bitcoin-etf-flow-all-data/)

## 表达复测

中文对原稿和成稿分别运行 `lieflat-less-ai-tone`。逐条复核了改前 65 条和改后 33 条候选。主要修改是把“底”“关机价”“成本线”落到各自的电费情景或生产成本估计，把市场推断和确定的协议数字放在对应段落。英文区分 `electricity cost`、`production cost`、`gross sales` 与 `net change in holdings`。日文区分「電気代」「生産コスト」「累計売却」「保有高の純減」。

| 项目 | 改前 | 改后 |
| --- | ---: | ---: |
| 翻案腔（脚本命中） | 5 | 0 |
| 结论提示冒号（语义判读） | 13 | 0 |
| 顿号并列（脚本命中） | 4 | 3 |
| 破折号密度（每千汉字） | 4.192 | 0 |
| 同义重命名（次数／候选段） | 13／22 | 0／16 |
| 最长明确承接（候选接口） | 7 | 3 |
| 高度同构三连（语义判读） | 0 | 0 |
| 句长变异系数 | 0.458 | 0.534 |

保留硬件型号、四种电价组合和三项观察指标。扩写主要用于解释不同收入基数、ETF 复算窗口和持仓估计范围。改后两条并列候选关联同一结尾观察清单，属于功能性列举。 [改前检测](tone-before.json) · [改后检测](tone-after.json) · [改前语义记录](semantic-before.json) · [改后语义记录](semantic-after.json)

## 验收

- `pnpm content:check` 通过，共检查 7,518 篇 MDX。
- `pnpm build` 通过，生成 8,400 个静态页面。导出检查覆盖 717 个本地化页面、7,518 篇文章及三份 RSS。构建仍有 5 条既有的 Turbopack 文件匹配范围警告。
- 三篇均归入 `thoughts` 并使用同一个语言组。各有 7 个正文小节、4 行电费表、2 项规模比较、24 个相同来源和 1 张图。核对了三语各自的博客索引、canonical、9 个语言对应链接、顶部语言下拉和同语 RSS 条目。
- 读回静态 PNG 与源文件字节一致，尺寸为 1275 × 585。按存档独立复算电费、收入、库存降幅和 ETF 流量。
