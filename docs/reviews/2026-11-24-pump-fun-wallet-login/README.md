# pump.fun 网页登录与 Privy 钱包迁移三语复核

2026 年 11 月 24 日 · 博客「思考」分类

| 语言 | 原稿或翻译初稿 | 前后差异 | 成稿 |
| --- | --- | --- | --- |
| 简体中文 | [原稿](baseline.zh-CN.md) | [简中差异](comparison.zh-CN.diff) | [简中 MDX](../../../content/blog/2026/thoughts/pump-fun-phantom-login-privy-wallet-migration.mdx) |
| English | [英文初稿](baseline.en.md) | [英文差异](comparison.en.diff) | [英文 MDX](../../../content/blog/2026/thoughts/pump-fun-phantom-login-privy-wallet-migration-en.mdx) |
| 日本語 | [日文初稿](baseline.ja.md) | [日文差异](comparison.ja.diff) | [日文 MDX](../../../content/blog/2026/thoughts/pump-fun-phantom-login-privy-wallet-migration-ja.mdx) |

## 事实核对

| 核对项 | 三语采用的口径 |
| --- | --- |
| 公告与迁移 | 保留 2026 年 11 月 22 日公告、11 月 30 日 15:00 UTC 截止、4 种新登录方式与 3 条迁移路径。旧会话在截止后仍可添加登录方式。保留账号与地址的路径要求导入原钱包，独立新账号的旧平台资料留在原处。 |
| 签名、密钥与账户 | 将原稿的“私钥就是登录凭证”改为“平台验证钱包给出的登录签名”，删去对旧版数据库的未经证实推断。SIWS 可以证明控制地址和辅助账号关联。同一普通地址在 Privy 内直接签名则要用同一个密钥。原钱包仍具签名能力，Privy 内签名与导出适用其权限策略。 |
| 权限与风险 | 区分浏览器到 TEE 的 HPKE 传输、在 TEE 内签名及平台访问限制。保留 Karpelès 对传输端点和界面信任的批评，并注明公开材料没有披露 pump.fun 的具体签名配置和删号后的密钥留存策略。覆盖第 12.2(c) 和第 30.1 节与导入流程的关系，保留审计是作者主张。 |
| 永续、多链和入金 | 保留 10 月接入消息、11 月 10 日更新以及限价、TWAP、跨保证金和 Pro mode。11 月 19 日由“部分强平”改为“部分平仓”。第 30B.5 和 30B.6 节约定 Hyperliquid 触发条件单、用户钱包密钥签指令。保留 Monad、Sui 和 Apple Pay，Monad 的 8 月 12 日为早期报道，8 月 26 日为 Phantom 文档确认的结束日。 |
| 产品限制与账号价值 | 保留永续对美国、安大略、制裁辖区及受限人士的限制，预测市场的美国限制，以及 Pump Bridge 的证券资产限制。跨链桥适用的欧洲范围按第 30D.5 节写为 EEA。区分钱包层也能实施的筛查、统一账号带来的运营便利，以及作者对长期合规和分发动机的判断。Stripe 的时间标为 Privy 在 2025 年 6 月宣布加入。 |
| 市场与商业判断 | 保留原稿 11 月 24 日 00:40 UTC 的 PUMP 价格 0.00253 美元、市值 8.93 亿美元、30 天回报 −41.3%。同期公开报价可对照量级，原稿精确时点未独立复现。区分 4 月 28 日回购销毁公告约 50% 的收入口径和下方费用序列。保留留存压力与平台动机为作者判断。 |

公告和权限依据平台、钱包文档及公开的批评。 [pump.fun 迁移公告](https://pump.fun/docs/wallet-login-changes) · [pump.fun 使用条款](https://pump.fun/docs/terms-and-conditions) · [Solana 签名与认证](https://solana.com/docs/frontend/messages-and-auth) · [Privy 导入架构](https://docs.privy.io/wallets/wallets/import-a-wallet/architecture) · [Privy 钱包权限](https://docs.privy.io/security/wallet-infrastructure/policy-and-controls) · [Karpelès 的批评报道](https://tech.yahoo.com/cybersecurity/articles/pump-fun-faces-pushback-asking-213700831.html)

永续功能与多链支持按发布记录核对。 [11 月功能时间线](https://pumpfyi.com/news/2026-11-10-pump-fun-perps-add-limit-orders-cross-margin/) · [部分平仓公告](https://t.me/pumpfun/327) · [Phantom 的 Monad 支持说明](https://help.phantom.com/articles/ending-support-for-monad-in-phantom-38674346854931) · [Pump App 的 Sui 接入公告](https://t.me/pumpfun/341) · [pump.fun 4 月 28 日公告](https://pump.fun/docs/april-28-announcement)

## 费用图与统计

原稿留有 `pump_fees_7d` 图表标记。三语成稿使用同一张 PNG，配各语言替代文字和图注。图的数据是 DefiLlama 的 `pump.fun` 项目 `dailyFees`。使用 2026 年 9 月 25 日至 11 月 22 日的 59 个 UTC 日值，对 10 月 1 日至 11 月 22 日绘制 53 个当日向前 7 日均值。数据采集于 11 月 24 日 01:03:20 UTC。 [数据存档](fee-series.json) · [PNG 图表](../../../public/images/blog/pump-fun-phantom-login-privy-wallet-migration/fees-7d.png) · [原始接口](https://api.llama.fi/summary/fees/pump.fun?excludeTotalDataChartBreakdown=true&dataType=dailyFees)

| 观察值 | 原稿快照（USD） | 公开系列复算（USD） |
| --- | ---: | ---: |
| 截至 10 月 7 日的 7 日均值 | 2,440,000／日 | 2,422,427.71／日 |
| 截至 11 月 22 日的 7 日均值 | 1,290,000／日 | 1,266,429.00／日 |
| 7 日均值降幅 | 约 47% | 47.72% |
| 10 月 1 日单日费用 | 2,400,000 | 2,400,773 |
| 11 月 22 日单日费用 | 940,000 | 955,779 |

两个口径在正文各自标明。保留原稿费用数值和降幅用于前后追溯，图只使用可以从存档复算的项目序列。DefiLlama 聚合类别 Pump 的费用和净收入是另一组统计。 [DefiLlama 项目页](https://defillama.com/protocol/pump.fun?denomination=USD)

## 表达复测

中文基线保存了用户原稿。中文改前的 29 条候选及改后的 25 条候选逐条判读。将“新版反过来”“真正的逻辑是”等提示换成直接陈述，明确产品推断和公开条款的边界。英文区分账户关联、签名授权和密钥导入，日文统一「秘密鍵」「署名権限」「部分決済」。两种译文均按各自语言复核。

| 项目 | 改前 | 改后 |
| --- | ---: | ---: |
| 提示语冒号（脚本命中） | 1 | 0 |
| 结论提示冒号（语义判读） | 4 | 0 |
| 顿号并列（脚本命中） | 14 | 9 |
| 破折号密度（每千汉字） | 1.752 | 0 |
| 同义重命名（次数／候选段） | 2／11 | 0／13 |
| 最长明确承接（候选接口） | 1 | 2 |
| 高度同构三连（语义判读） | 0 | 0 |
| 句长变异系数 | 0.723 | 0.498 |

保留涉及登录方式、订单类型、司法辖区和权限责任的必要并列。段落数保持一致，新增篇幅主要用于写明项目费数据差异和签名、权限条件。检测用于定位局部表达。 [改前检测](tone-before.json) · [改后检测](tone-after.json) · [改前语义记录](semantic-before.json) · [改后语义记录](semantic-after.json)

## 验收

- `pnpm content:check` 通过，共检查 7,515 篇 MDX。
- `pnpm build` 通过，生成 8,397 个静态页面。导出检查覆盖 717 个本地化页面、7,515 篇文章及三份 RSS。仍有 5 条既有的 Turbopack 文件匹配范围警告。
- 三语同组，均在博客的 `thoughts` 分类。每篇读回 7 个正文小节、3 行迁移方案、26 个相同来源、1 张图以及对应语言的标题、摘要和 RSS 条目。核对了 canonical、9 个语言对应链接、博客索引和每页的顶部语言下拉。
- 读回静态 PNG 与源文件的字节一致，尺寸为 1350 × 502。用存档复算了两组费用均值、降幅与两个单日值。
