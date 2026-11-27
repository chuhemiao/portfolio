# Bullpen 私钥导入事件三语复核

2026 年 11 月 27 日 · 博客「思考」

| 语言 | 基线 | 前后差异 | 成稿 |
| --- | --- | --- | --- |
| 简体中文 | [原稿](baseline.zh-CN.md) | [简中差异](comparison.zh-CN.diff) | [简中 MDX](../../../content/blog/2026/thoughts/bullpen-private-key-import-noncustodial-trust.mdx) |
| English | [译稿](baseline.en.md) | [英文差异](comparison.en.diff) | [英文 MDX](../../../content/blog/2026/thoughts/bullpen-private-key-import-noncustodial-trust-en.mdx) |
| 日本語 | [訳稿](baseline.ja.md) | [日文差异](comparison.ja.diff) | [日文 MDX](../../../content/blog/2026/thoughts/bullpen-private-key-import-noncustodial-trust-ja.mdx) |

## 数据与判断

| 项目 | 三语采用的口径 |
| --- | --- |
| 事件范围 | 保留 4–6 月的 2024 年 beta、初报 18–19、次日终报 19、单账户占转出资金 99.8%、初报不到 0.005%。只在后一比例适用于最终样本的条件下估算注册账户超过 38 万。 |
| 链上估计与调查 | 区分初报约 200 万美元与链上约 257 万美元，保留 8,750 万枚 ANSEM、总量约 8.8%、24 小时价格约跌 41% 及 42.24 BTC 的追踪规模。未移动结论限于 11 月 25 日 14:40 UTC。2FA 属于当事人说法，Turnkey、签名者身份和赔付仍待证实。 |
| 权限边界 | 说明旧系统关停和当前产品分别来自事件公告与产品文档。CLI 的四项 EVM 钱包限制及仍提供 Solana 导入限定在文档覆盖范围。中文「由 Bullpen 管理的交易操作」对应 `managed trading`。日文将平台持钥、冻结或找回写为不同可能条件。 |
| 费用与成交 | 15,278.99 美元按 365／30 折算 **185,894.38 美元**，正文取约 18.6 万美元／年，修正原稿 49 万。10 月同比约下降 85.16%，2026 Q4 截至 11 月 26 日约 36,551 美元，2025 Q4 全季约 314,616 美元。保留永续 30 日 3,366 万美元与累计 24.87 亿美元。 |
| 投资与竞争判断 | 保留积分总量及未分配量、Season 3、预期代码、投资方和三种情景的排序。基准仍是分层限制，未来 2–4 周观察调查及赔偿、导入权限和两周内的存款与成交恢复。 |

公开事件资料用于核实账户范围，资金转移规模及时间来自独立链上追踪。费用时间窗口及日值已保存在本目录。 [Bullpen 更新](https://x.com/BullpenFi/status/2125585437687181318) · [Bitquery](https://bitquery.io/investigations/ansem-solana-wallet-drain) · [DefiLlama 费用 API](https://api.llama.fi/summary/fees/bullpen?excludeTotalDataChartBreakdown=true&dataType=dailyFees) · [费用数据存档](fee-observations.json)

## 表达复测

简中先陈述分层限制判断，按公司、链上和产品文档分别归属证据。英文明确由 Bullpen 管理的操作及资金单位，调整了预测句和费用比较。日文修正操作权限并简化分散的名词表达。三语保留原稿三个情景与各自后果。

| 指标 | 改前 | 改后 |
| --- | ---: | ---: |
| 翻案腔（脚本） | 2 | 0 |
| 结论提示冒号（语义） | 1 | 0 |
| 顿号并列（脚本） | 7 | 7 |
| 同义重命名（次数／候选段） | 4／9 | 1／9 |
| 最长明确承接（候选接口） | 2 | 2 |
| 高度同构三连（语义） | 0 | 0 |
| 句长变异系数 | 0.672 | 0.680 |

改后并列包括产品控制项、候选终端、投资方和一体化市场，作为需要保留的清单。私钥和钥匙指代一致，语义候选记为普通换称。脚本统计用于版本比较，各项原始候选和判读均可回查。 [改前检测](tone-before.json) · [改后检测](tone-after.json) · [改前语义](semantic-before.json) · [改后语义](semantic-after.json)

## 验收

- 独立复核三语事件数字、三种情景和结尾跟踪条件，并采纳两处权限表述修正。
- `pnpm content:check` 检查 7,527 篇 MDX 通过。`pnpm build` 导出 8,409 个静态页面，语言检查通过。构建报告五处既有的 Turbopack 文件匹配范围警告。
- 三语各有 6 个正文小节、3 行情景表及顺序一致的 27 个来源链接（含重复引用）。静态检查通过 Thoughts 分类、博客列表数据、canonical、9 个语言对应链接、单个可见语言下拉、旧入口和同语 RSS。
