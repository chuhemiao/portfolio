# 链上美股实验室｜bStocks 视频系列规划

规划日期为 2026 年 11 月 7 日，北京时间。主线面向熟悉币圈、但对美股代币结构还不熟悉的中文观众。每期回答三个问题：底层资产靠什么赚钱或追踪什么，代币持有人实际拥有什么，给定时间和订单规模时能否以合理成本买卖。视频提出问题，Portfolio 保存标的卡和原始出处，观众反馈用于检验 BFunds 的组合需求。

## 已核对的起点

- 用户提供的 CoinMarketCap（CMC）发行方快照时间为北京时间 **2026-11-07 12:52:43**。附件有 **100 条不同的 CMC ID**，返回的 `totalCount` 为 **105**。这 100 条合计约 **14.29 亿美元代币市值**、**8.30 亿美元 24 小时成交额**，前五条约占样本市值的 **48.9%**。统计只基于附件的 USD 报价，成交额为 CMC 口径。
- [CMC bStocks 第二页](https://coinmarketcap.com/view/bstocks/?page=2) 另列 **ZMB、BSPB、SKUUB、MDBB、HPEB**。与附件按代码核对无重叠，合并得到 105 个栏目候选。正式冻结名单时在同一次拉取中按 CMC ID 去重，单独确认当时的发行、场所支持和状态。
- [Portfolio 标的库](../../src/data/instruments/bstocks.json) 有 100 个标的，[分组表](../../src/data/instrument-groups.ts) 有 20 个五标的分组。与附件有 **99 个 CMC ID 相同**。附件含 2 倍做空 SK Hynix 的 **SKDDB**，库中含 2 倍做多的 **SKUUB**，且后者见于 CMC 第二页。两者各占一个标的，分开核验。
- [Binance Research 的 bStocks 报告](https://www.binance.com/en/research/analysis/bstocks-by-the-numbers) 披露，上线 125 天后 AUM 达 10 亿美元，约 56% 的上线以来成交发生在美股常规交易时段以外。这说明休市交易值得观察，实际成交质量与持续需求由每期的取样和后续数据检验。
- **发行、交易和持有分开讲。** bStocks 是 BTech Holdings Limited 发行、运行在 BNB Smart Chain 的代币化证券凭证。Binance Spot 是二级市场渠道，Binance Wallet 是可自托管和访问链上报价的入口，底层正股由对应证券市场定价。发行方披露了托管和抵押证明机制，持有人权利与参与资格按各产品文件确认。 [Binance 上线公告](https://www.binance.com/en/support/announcement/detail/2c0c92ed15ac42d1b14bb1eac00d22bb) · [ADGM FSRA 招股书目录](https://www.adgm.com/financial-services-regulatory-authority/listing-authority/approved-prospectuses/) · [BNB Chain 与 Binance Wallet 的产品说明](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition-with-binance-web3-wallet)
- **录制前更新旧稿。** [旗舰研报](../../content/blog/2026/research/bstocks-flagship-pricing-anchors.mdx) 和标的库把 SPCXB 对应的 SpaceX 标为未上市。SpaceX IR 和 SEC 文件确认其 A 类普通股已于 **2026 年 6 月 12 日**以 **SPCX** 开始交易。视频按对应产品条款核实 SPCXB 的底层证券与权益，使用有时间戳的 SPCX 参照价。[SpaceX IR](https://ir.spacex.com/faqs-and-contact/) · [SpaceX 10-Q](https://www.sec.gov/Archives/edgar/data/1181412/000162828026052535/spcx-20260630.htm)
- [分发与换手研报](../../content/blog/2026/research/bstocks-binance-distribution-turnover-single-chain-research.mdx) 的 AAPLB 示例将卖盘薄解释成难卖。复测时按盘口方向计算，买入用卖盘，卖出用买盘。旧稿将高换手描述为高流动性的段落也需重新取证。[Binance 盘口字段说明](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market)

## 每只标的采用同一套评测

| 维度 | 必填内容 | 主要证据 |
| --- | --- | --- |
| 底层资产 | 公司业务、收入和现金流、一个催化剂与一个反例。ETF 记录跟踪对象、集中度、费率。杠杆和反向 ETF 记录每日目标与路径依赖 | 公司 IR、SEC 文件、交易所或基金产品文件 |
| 代币权利 | 正股或基金份额代码、发行人、链 ID、官方合约、托管或抵押证明日期、分红和拆股、投票、转换与转让条件 | 适用的发行条款、上市公告、抵押证明、浏览器与合约 |
| 市场关注 | 价格、流通量、代币市值、24 小时成交额及 7 日趋势，注明来源、货币和统计范围 | CMC 发行方名单与币种报价 |
| 定价跟踪 | 将代币价格换算为同一底层份额和币种，与同一时间的正股或 ETF 价格比较。标注美股常规时段、盘后、周末或对应海外交易所时段 | 交易场所报价、底层行情、适用的 Multiplier 与汇率 |
| 成交与退出 | 报价所在场所、买卖价差、双边深度，模拟 1,000 和 10,000 美元双向成交的滑点，记录费用和深度不足。另核对允许的转换、转账或赎回方式 | 受支持交易对的公开盘口、已核验的链上报价和发行文件 |
| 结论 | 最适合说明的使用场景、主要限制、下次更新要看的变量。每项证据标注「已核验」「待核验」或「不适用」 | 标的卡汇总，风险与证据分开描述 |

每集用同一名义金额和同一窗口对比。开盘时使用同步底层报价，休市时将曲线标为「相对最近有效底层报价」，标出报价时间和交易时段。只有确认报价单位、每单位对应权益、币种和时间口径后才计算溢折价。发行方的 1:1 支持、合约原始数量、界面显示数量、可成交价格分别记录。 [bStocks 官方 FAQ](https://www.binance.com/en-AE/support/faq/detail/f0c03cd6509a4085b4cce1636f16be38) · [bStocks 抵押证明](https://www.binance.com/en/proof-of-collateral/bstocks)

成交额和换手反映成交活动，执行能力看双边深度和指定金额模拟。模拟记录市场、交易对、时间戳和成交边；买卖两侧使用相同的比较口径。对可核验的资产，试点从美股常规时段、盘后和周末各取一个观测窗口。数据缺失时标出缺项，收窄结论。对不明身份或权益的标的，先做公开资料核验篇，再决定是否可以做成交对比。

## 首季安排与首片

首季建议 **6 周、7 集主题评测加 1 集组合专题**。默认每周一条长片，资料齐备的两周加更。主片 15–30 分钟，优先 18–22 分钟。每条主片配两条 30–60 秒短剪、一篇研报更新、一张封面和中英文 SRT。每个标的在主归属节目有自己的章节，片尾和视频简介链接到 Portfolio 对应标的卡。

| 周次 | 主题 | 这一集解决的问题 | 主覆盖组 |
| --- | --- | --- | --- |
| 第 1 周 | **01 闪迪成交第一，真的更好买卖吗？** | 对比同主题单股和 ETF，实测前先公开成交额和可成交深度的差异 | 03 |
| 第 2 周 | **02 币安链上美股，你买到的是什么？** | 用 SPCXB、CRCLB、GOOGLB、MSTRB、QQQB 解释正股、凭证、底层定价和持有人权利 | 01 |
| 第 2 周 | **03 链上的英伟达，和正股差在哪？** | 比较 NVDAB 的价格跟踪和休市报价，用 AMD、Broadcom、台积电和 Arm 解释半导体资产的不同风险 | 04 |
| 第 3 周 | **04 一只股票做成 2 倍 ETF，长期会差多少？** | 拆单票日度目标、涨跌路径和分母造成的高换手，纳入 SK Hynix 多空版本 | 02 |
| 第 4 周 | **05 从标普到半导体，买一篮子和买一只的差别** | 对比宽基、行业 ETF、设备股和利率工具，明确每个底层风险 | 15 |
| 第 5 周 | **06 把 BTC、ETH 或 BNB 放进上市公司以后** | 拆经营业务、币储备、融资、稀释和代币凭证，引用 MSTRB 作比较 | 06 |
| 第 5 周 | **07 三倍做多、三倍做空和波动率，有什么不同？** | 用同一段日线和演算解释每日再平衡，区分反向 ETF 和波动率期货 ETF | 05 |
| 第 6 周 | **08 从一只代币到可复核的链上篮子** | 用示例权重展示成分核验、参考净值、模拟调仓成本和退出压力，引到 BFunds 规划 | 专题 |

首期片头用附件快照的具体问题切入。**SNDKB 的 24 小时成交约 1.09 亿美元，在附件 100 条里第一，占 SNDKB、MUB、SKHYB、WDCB、DRAMB 五个样本成交额的约 66.2%。** 接下来从公司与产品差异切到报价实测。主结论由新采的盘口决定。 [存储专题研报](../../content/blog/2026/research/bstocks-memory-supercycle.mdx) · [CMC SNDKB](https://coinmarketcap.com/currencies/sandisk-tokenized-bstocks/)

| 拟定时间 | 声画与内容 |
| --- | --- |
| 00:00–00:40 | 上一期芯片视频的自有画面短切，紧接五个标的成交柱图，提出「想买卖 1 万美元，还能看到同样的价格吗」 |
| 00:40–03:00 | 出示快照日期、样本范围、代币市值与成交额，说明这次比较的两种数据 |
| 03:00–08:00 | 标的卡逐一呈现，配存储器、机房情境画面和 ETF 持仓结构图 |
| 08:00–13:00 | 用真实时间序列并列正股和代币报价，标出闭市窗口、参考价日期与可用性 |
| 13:00–17:00 | 用公开盘口模拟两种金额的买卖。先让观众读清买卖方向，再显示滑点和深度不足 |
| 17:00–20:00 | 回答开场问题，保留一项待验证的观察。用标的卡和下一期链接收尾 |

复用前一条长片的 1080p 横屏、Fish Audio 指定中文音色、保音高 1.5 倍速和同屏双语字幕。现场感来自与行业对应的图、盘口揭示的轻音效和章节转场。图表根据冻结数据渲染，标明时间和单位。ImageGen 或 LibTV 只用于情境画面，标注示意。长片先按实际旁白定时，再导出竖版短剪。

## 105 个候选的节目归属

保留原有 20 个研报分组的主线。把 **SKDDB** 加入单票杠杆，**BSPB** 加入身份核验，**HPEB** 加入硬件。软件分成企业应用与企业数据、AI 和安全两组，分别纳入 **ZMB、MDBB**，并将 **IBMB** 调整到后者。下面 21 组的 105 个代码各有一个主归属。后续作为对照再次出现不重复计数。资格未核实的标的先制作证据卡，并保留为待核验状态。

| 组 | 主题 | 主评测标的 | 制作批次 |
| --- | --- | --- | --- |
| 01 | 旗舰与定价依据 | SPCXB、CRCLB、GOOGLB、MSTRB、QQQB | 首季 |
| 02 | 单票杠杆与反向 | MUUB、SNXXB、INTWB、MVLLB、SKUUB、SKDDB | 首季 |
| 03 | 存储芯片与存储 ETF | SNDKB、MUB、SKHYB、DRAMB、WDCB | 首季 |
| 04 | 芯片设计与代工 | NVDAB、AVGOB、AMDB、TSMB、ARMB | 首季 |
| 05 | 方向性 3 倍及波动率 ETF | SOXLB、SOXSB、TQQQB、SQQQB、UVXYB | 首季 |
| 06 | 加密资产财库公司 | BNCB、BMNRB、FWDIB、CYPHB、USDEB | 首季 |
| 07 | 大型科技股 | AAPLB、MSFTB、AMZNB、METAB、TSLAB | 第二批 |
| 08 | 亚洲资产与交易时区 | EWYB、KORUB、KSTRB、BABAB、PDDB | 第三批 |
| 09 | 光模块与互联 | AAOIB、LITEB、COHRB、CRDOB、MRVLB | 第二批 |
| 10 | 新算力与数据中心 | CRWVB、NBISB、CBRSB、IRENB、SMCIB | 第二批 |
| 11 | 电力与 AI 基础设施 | GEVB、VSTB、FLNCB、BEB、USARB | 第二批 |
| 12 | 身份与报价核验 | QNTB、AGPUB、SHAZB、BOTB、SECZB、BSPB | 第三批 |
| 13 | 散户交易主题 | GMEB、AMCB、DJTB、HIMSB、GPROB | 第三批 |
| 14 | 成熟科技公司的转型 | INTCB、NOKB、BBB、QCOMB | 第二批 |
| 15 | 宽基、行业设备与利率 | SPYB、SMHB、ASMLB、AMATB、TMFB | 首季 |
| 16 | 企业应用与办公 | ORCLB、CRMB、ADBEB、ZMB | 第二批 |
| 17 | 金融、支付与交易平台 | JPMB、GSB、PYPLB、HOODB、COINB | 第三批 |
| 18 | 存储硬件与计算系统 | STXB、DELLB、PENGB、ALABB、GLWB、HPEB | 第二批 |
| 19 | 太空及小盘题材 | RKLBB、ASTSB、AXTIB、APPB、RDDTB | 第三批 |
| 20 | 医药与消费 | LLYB、MRNAB、NFLXB、WENB、BRKBB | 第三批 |
| 21 | 企业数据、AI 与安全 | PLTRB、CRWDB、MDBB、IBMB | 第三批 |

首季主题片主评测 **36 个**，第二批 **34 个**，第三批 **35 个**。每批按数据可用性、财报日和观众点题调整顺序，保留每只标的的归属。新增、停牌或下架的候选在目录里带日期，不在已有快照中覆盖历史状态。

## 数据与制作任务

| 次序 | 任务 | 验收条件 |
| --- | --- | --- |
| T1 | 冻结全量目录 | 使用同批 CMC 发行方结果。去重 ID 后数量等于该批声明总数，记录时间、版本和新增差异。同步脚本写入前先核查接口形状和权限 |
| T2 | 核验身份、权利与变更 | 首季先做 36 张研究卡。每张有发行条款或待核验原因，底层股和代币合约独立标识，分开记录 CMC 收录、场所支持和交易状态 |
| T3 | 试点市场实测 | 先做存储五个标的。按场所保存行情和报价、对照时间与金额，确认原始和显示单位，输出双边模拟与缺项 |
| T4 | 生成图表、脚本和交付包 | 一份已核验事实表生成视频图表和文稿，复用长片模板。每集输出 MP4、两条竖版、封面、标题、简介、章节、中英字幕和来源清单 |
| T5 | 试行分发和反馈 | 视频简介落到对应标的或主题页。每个平台记录来源，按周检查留存、标的卡点击、回访和组合研究反馈 |
| T6 | 按批推进余下标的 | 每个候选有节目章节或明确待核验原因。发布后保留纠错记录和新快照，对财报与条款变化做短更新 |

CMC 官方发行方接口 `/v5/real-world-assets/issuers` 支持单发行方关联代币和 `start`、`limit`，文档列出 Basic 可用，单次上限 250。规划使用附件与公开页面做试点，有已获授权的 API 凭证后再验证响应并适配 [现有摄入脚本](../../scripts/sync-instruments.mjs)。用户提供的网页快照与 Pro API 响应结构要分别处理。正式公开图表注明来源，批量公开或再分发数据前核对所用计划的授权范围。 [CMC RWA API](https://coinmarketcap.com/api/documentation/pro-api-reference/real-world-assets/) · [CMC 商业 API 条款](https://pro.coinmarketcap.com/user-agreement-commercial/)

Portfolio 已有发行方页、标的页和按组文章。先把旧研报作为选题素材，录制前逐条刷新关键数据和权利描述。保存快照、出处、采集时间、用在视频的数字和更正历史。对发稿用的新研报沿用 Portfolio 的中文、英文、日文发布约定。

## 分发、Binance 社区与 BFunds

| 渠道 | 内容和入口 | 衡量什么 |
| --- | --- | --- |
| YouTube | 以「公司或 ETF + bStocks + 一个具体问题」作为标题结构。主片进入系列播放列表，说明栏首个相关链接指向标的或主题页 | 前 30 秒留存、平均观看比例、系列回访、资料页点击 |
| Portfolio | 用既有 `/stocks/bstocks` 和标的详情页承载证据、分组、视频、更新日期和纠错记录 | 从视频到资料页的访问、继续查看其他标的、回访 |
| Binance Square 与 BNB Chain 社区 | 每集改成一段独立可读的证据帖和一条短视频。积累 3–4 期后，用带出处的标的卡、价差和深度图、观众问题整理合作提案，候选形式为专题问答、社区 AMA 或共写行业报告 | 有实质问题的回复、资料页转介、合作沟通和受众反馈 |
| BFunds | 首季前段以研报入口为主。组合专题展示示例 Index Recipe，收集对成分、集中度、再平衡和退出的需求。测试网或正式入口按项目实际状态另行核验 | 有效反馈、同一主题的回访、对篮子规则的具体需求 |

BNB Chain 与 Binance Wallet 有过代币化股票主题活动，可作为拟合作选题的背景。正式合作前按实际关系标明独立制作、赞助或利益关系，标题和封面按真实授权使用品牌。内容页以研究和教育为入口。出现可申购、推广或邀请动作时，依据当时适用的产品条款、平台规则和地区资格核验。 [BNB Chain 代币化股票活动](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition-with-binance-web3-wallet)

BFunds 按现有研究属于项目规划。第一阶段用经过核验的 bStocks 建候选池，展示 Index Recipe 和模拟再平衡，把参考净值、可执行报价、费用和退出条件分开。Index Vault、实物申赎和基金份额按后续产品状态介绍。优先验证宽基 ETF 已经解决不了的问题，例如股票和加密资产的组合规则，或主题成分和风险上限能否被用户看懂。 [Portfolio 的 BFunds 战略研究](../../content/blog/2026/thoughts/tokenized-equities-rwa-2026-market-structure-onchain-index-funds.mdx)

第一周交付目标是同批全量目录、存储五标的的研究卡、同步报价和盘口取样，继而锁定首期脚本。首季结束按前 3 条视频建立的频道基线复盘。能否从视频吸引观众反复查阅标的卡、提出具体组合问题，比单期播放峰值更能检验这个系列的长期用途。
