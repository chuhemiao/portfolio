# Trust Wallet 与 DarkSword 三语复核

2026 年 11 月 24 日 · 博客「思考」分类

| 语言 | 原稿或翻译初稿 | 前后差异 | 成稿 |
| --- | --- | --- | --- |
| 简体中文 | [原稿](baseline.zh-CN.md) | [简中差异](comparison.zh-CN.diff) | [简中 MDX](../../../content/blog/2026/thoughts/trust-wallet-ios-security-after-darksword.mdx) |
| English | [英文初稿](baseline.en.md) | [英文差异](comparison.en.diff) | [英文 MDX](../../../content/blog/2026/thoughts/trust-wallet-ios-security-after-darksword-en.mdx) |
| 日本語 | [日文初稿](baseline.ja.md) | [日文差异](comparison.ja.diff) | [日文 MDX](../../../content/blog/2026/thoughts/trust-wallet-ios-security-after-darksword-ja.mdx) |

## 数据与判断

| 核对项 | 三语采用的口径 |
| --- | --- |
| DarkSword 与 P7 | 保留 6 个漏洞、iOS 18.4–18.7、iOS 26.3 修复、2025 年 11 月起的四国观察，以及 P7 的 15 秒默认通信间隔。iVerify 记录的采集能力只用于讨论设备风险，资金归因另看链上调查。 |
| Censys 与 MoldyRoost | 保留单份服务器样本中的 11 条助记词、179 个设备目录、75 个面板账号和 18 个钱包模块。Confiant 的调查期为 2026 年 5 月 12 日至 11 月 17 日，按其原文写为 480 多个广告域名、目标覆盖超过 47 个国家。 |
| 链上损失 | 10 月 5 日至 11 月 4 日 TRON 样本为 365 个地址和至少 406 万美元 USDT。原稿的约 430 个地址和 416 万美元由 TRON 加上其他 8 条链的 65 个地址和至少 10.3 万美元得出。11 月 23 日的更新把 TRON 窗口拉长至 11 月 21 日，得到 535 个地址、至少 599 万美元 USDT。链上调查只把一例公开个案联系到 iPhone。 |
| worse_query | 分开写 11 月 8 日公开、11 月 9 日发布 iOS 27.2.1、11 月 10 日研究者声明及 11 月 11 日钱包回应。27.2.1 与 27.3 beta 1 的修复状态按研究者披露时点表述。设备上已有恶意 App 是讨论容器读取风险的前提。 |
| 账户及恢复 | 保留 2024 年 2 月 19 日 SWIFT 测试版、ERC-4337、passkey、12 词、Barz 和云账户恢复。按官方资料区分 Phantom 的外部账户登录及旧版四位 PIN，更新 Coinbase Smart Wallet 的现行名称及适用恢复方式。防护矩阵限定独立签名、守护人和硬件密钥各自起效的条件。 |
| 安全、市场和品牌数字 | 将 4.58 亿美元与 2025 年 1.91 亿美元写为 CEO 披露的标记和提示金额。原稿 11 月 23 日 01:30 UTC 的 TWT 价格、市值、FDV、24 小时量及两组 X 粉丝数保留。CoinGecko 同期数据只供历史量级对照，原始精确时点与粉丝计数未独立复现。代币市值和品牌触达不作为公司预算证据。 |
| 投入建议 | 保留账户架构与恢复 50%、设备完整性与事件响应 30%、备份可用性与用户习惯 20%，以及用户规模有限时先做 20% 档的备选。90 秒用作换机演练目标。保留恢复 SLA、四组评估指标及监控前置风险的原有功能。 |

同一段中使用“端侧检查可能失真”和“密钥隔离条件”替代无条件的“有效”。将被盗迁移限定为从可信设备发起，照片与备忘录只提示用户自行检查。保留了无助记词账户默认化、恢复可演练和公开验证的原有判断。比较依据是公开文档，未开展实机或攻击测试。

威胁数据和时间线依据调查机构及官方公告。 [Google 威胁情报组](https://cloud.google.com/blog/topics/threat-intelligence/darksword-ios-exploit-chain) · [iVerify](https://www.iverify.com/blog/darksword-variant-threat-research) · [Censys](https://censys.com/blog/darksword-coruna-open-directory-finding-report) · [Confiant](https://blog.confiant.com/p/moldyroost-a-malvertising-machine) · [Bitquery](https://bitquery.io/investigations/iphone-wallet-drain-tron-usdt) · [Apple 的 27.2.1 安全公告](https://support.apple.com/en-us/149715)

账户、密钥存储和恢复能力依据平台及产品文档。Scanner 数据来自 CEO 的访谈自报。 [Apple 钥匙串保护](https://support.apple.com/en-is/guide/security/secb0694df1a/web) · [SWIFT 恢复说明](https://trustwallet.com/blog/company/trust-wallet-swift-understanding-passkeys-and-recoverability) · [Phantom 恢复说明](https://help.phantom.com/articles/sign-in-to-or-import-your-phantom-wallet-15079894392851) · [Coinbase Base Account](https://help.coinbase.com/en/wallet/getting-started/smart-wallet-passkeys) · [Trust Wallet CEO 访谈](https://cryptopotato.com/self-custody-has-won-the-argument-now-it-has-to-work-trust-wallet-ceo-interview/)

## 表达复测

中文对原稿和成稿分别运行 `lieflat-less-ai-tone`。原稿 45 条和成稿 37 条语义候选均逐条判读，用于编辑定位。英文直接区分 `recovery phrase`、`exportable seed` 与 `passkey`，日文按使用场景区分「復旧フレーズ」「シード」「パスキー」。两种译文均按各自语言复核，比较记录见上表。

| 项目 | 改前 | 改后 |
| --- | ---: | ---: |
| 翻案腔命中 | 4 | 0 |
| 结论提示冒号（语义判读） | 6 | 0 |
| 顿号并列命中 | 16 | 6 |
| 破折号密度（每千汉字） | 3.870 | 0 |
| 同义重命名（次数／候选段） | 6／15 | 2／18 |
| 最长明确承接（候选接口） | 3 | 4 |
| 高度同构三连（语义判读） | 0 | 0 |
| 句长变异系数 | 0.542 | 0.807 |

开头“该挪，但不该挪到……”改成直接说明增量投入对象。假设用例中的“当一部测试手机失守时”和“就容器文件读取而言”分别限定悬赏场景和防护范围，原义保留。剩余顿号命中用于列出受影响地区、数据表面、故障情形和度量项。成稿的三连候选分别说明三个时间或链范围，判为语义并列。章节与段落数量相同，篇幅变化主要来自补足统计口径和防护成立条件。

脚本原始结果和语义判读可复查。 [改前检测](tone-before.json) · [改后检测](tone-after.json) · [改前语义记录](semantic-before.json) · [改后语义记录](semantic-after.json)

## 验收

- `pnpm content:check` 通过，共检查 7,512 篇 MDX。
- `pnpm build` 通过，生成 8,394 个静态页面，总检查覆盖 717 个本地化页面、7,512 篇文章和三份 RSS。构建保留 Turbopack 关于文件匹配范围过宽的警告。
- 三语各有 7 个正文小节、6 行防护矩阵、3 行钱包比较、4 项预算列表及 21 个相同的来源链接。核对原始数值和各语言单位，验证两个损失范围、三个预算比例与恢复条件。
- 构建内容索引确认同一语言组的 3 篇文章均在 `thoughts` 分类。逐一读回三份静态正文、各语言博客索引、canonical、9 个语言对应链接、每页的顶部语言下拉及三份 RSS 的同语条目。
