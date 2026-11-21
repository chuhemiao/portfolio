# 市场看板、链上股票与卡牌周报实施计划

2026-11-20 · Portfolio · 默认支持 `zh-CN`、`en`、`ja`

## 本地实施与验收

以下记录 2026-11-20 起的本地导出与后续代码验证。时间均为 UTC。下方保留 M0 首次同步结果，便于比较覆盖变化。

| 阶段 | 已实现与核验的范围 |
|---|---|
| H1 首页 | 主栏为近期更新，侧栏为简报和一个 US$300/月广告位。精选研究、市场工具与交易所链接铺整行。默认和中英日入口在 390、768、1024、1440 px 共 16 组离线检查通过。1440 px 时侧栏多出约 62–86 px。 |
| W1 Watch | 最新库存含 516 个标的，其中 135 个有上市时间、394 个有报价。13 个必需的市场清单请求全部通过校验才可写入。显示 7 个有来源的现货、永续及 Alpha 事件，分别列出公告和 EQN 时间、计划、确认生效与市场观测。Bithumb KNTQ/KRW 的排期为 07:00，最早查到的成交分钟为 07:05。此前四个入口在 390、1440 px 共 8 组离线交互检查通过。 [市场清单与写入校验](#watch) |
| O1 Oscillator | 35 个关注标的均有 ALT/BTC 日度历史。最新 500 个标的样本的美元涨幅广度为 7 天 83/500、30 天 74/499，持平计入有效分母。身份按已核实的精确 ID 取数，源暂缺时沿用符合身份的历史快照。 [刷新时间与方程式新闻](#oscillator) |
| F1 Fear | 显示评分贡献、阈值、连续天数、历史触发图及确认日明细。2026-05-25 至 11-20 的 180 个已收盘 UTC 日均有 Bitview 实现价格、BTC/USD 日收盘价、200 周均线、MVRV 比率和 Z-score。资金费率覆盖 180 日，连续地址窗口覆盖 161 日。最新评分 51。 [配对口径与缺失处理](#fear) |
| S0–S3 bStocks | 113 个唯一 ISIN 及对应 BNB Chain 合约，339 个三语详情、1,017 条语言对应链接。基本面覆盖 88 个公司标的及 25 个基金标的。每项有 ADGM 主招股文件，另有三份补充文件。本地曾导入 113 组行情、10,454 根成交日线及 112 份盘口。74 个已实测的 TradingView 现货图及 43 个已绑定的 DEX 池图去重后覆盖 113 个标的。113 个标的均有已查来源的链上流动性或报价，其中 110 个有双向 ±1% 深度或储备模型，含 23 个 PancakeSwap v2 模型。113 个标的均有链上显示单位，112 个有发行条款核实的有效凭证与原资产关系，ASMLB 的有效凭证单位暂缺。113 个原资产均有按需加载的 Binance 官方美元报价组件。托管原资产图默认开启均线和 RSI（14），ADJ 按钮可见时支持股息复权。 [bStocks 数据、计算与验收](../reviews/2026-11-20-bstocks-study.md) |
| C1 Pulse 和 C2 归档 | 11 月 9 日与 11 月 2 日周报分别有 3,770 和 4,009 条凭证，其中 3,745 和 3,997 笔为 Collector Crypt 指定钱包及池的直接 CARDS 回购。两周在此范围内完成逐笔分类。页面分别展示原有 34 和 21 条逐笔链接，各有 9 条回购示例，并提供按周下载的 JSON。ORIPA 两周均标为上线前，PANDORA 248 合作机台在 11 月 9 日周报列一条。 [周报凭证与统计口径](#pulse-卡牌周报) |

最新一轮通过 52 项股票定向测试。339 个三语详情服务端渲染核对了 339 个首次展开才加载的 Binance 原资产报价入口、14 个标的的 42 个 Infinity CL 双向 ±1% 面板，以及 AAPLB 与 SNXXB 的 6 个补充深度面板。补充面板分别以 USDT 和 ETH 计价，保留同页面既有 Metric 数据。[股票详情验收](../reviews/2026-11-20-bstocks-study.md#验收结果) · [两项补充深度](../reviews/2026-11-20-bstocks-study.md#aaplb-与-snxxb-补充深度)

完成扩展后串行执行 `pnpm build`、`pnpm test` 和 `pnpm content:check`。397 项全量测试和 7,497 篇内容检查通过，标准构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS。有 5 条既有的 Turbopack 文件匹配范围警告。读回全部 339 个股票详情的 HTML 和 Flight 数据。每语按标的核对 87 项双向 ±1% 深度和 23 项 v2 储备模型，其余三项的报价类型与页面一致。首页、Watch、Oscillator、Fear、Pulse 的默认及中英日入口均通过核验，两份 Pulse 逐笔 JSON 的 4,009 和 3,770 条记录与前版逐字节一致。[股票详情验收](../reviews/2026-11-20-bstocks-study.md#验收结果) · [两周逐笔凭证](#pulse-卡牌周报)

此前接入 Uniswap v4 及首批 Binance 原资产行情组件后，51 项股票定向测试通过。339 个三语详情服务端渲染核对 90 个 v4 边际价 ±1% 面板、3 个固定输入报价面板、42 个既有 Infinity CL 面板及当时 9 个 Binance 原资产组件入口。[股票详情验收](../reviews/2026-11-20-bstocks-study.md#验收结果)

该轮在 WDCB 报价方向修正后串行执行 `pnpm build`、`pnpm test` 和 `pnpm content:check`。396 项全量测试和 7,497 篇内容检查通过，标准构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS。有 5 条既有的 Turbopack 文件匹配范围警告。读回 339 个股票详情并核对 v4、Infinity CL、技术指标外链及原资产组件入口。三个市场页核对当时快照、新闻及 BTC 热度。四个 Pulse 入口读回通过，两份逐笔 JSON 与前版一致，对照周 4,009 条、本期 3,770 条。[v4 报价方向与验收](../reviews/2026-11-20-bstocks-study.md#uniswap-v4-报价与深度) · [两周逐笔凭证](#pulse-卡牌周报)

DELLB、BBB 的 Infinity CL 固定输入报价按 BNB Chain 补采区块 `134782313` 展示。50 项股票定向测试、类型检查及定向 ESLint 通过，339 个三语详情的服务端渲染核对 9 个边际价 ±1% 面板和 33 个固定输入报价面板。[补采区块及报价](../reviews/2026-11-20-bstocks-study.md#链上深度)

补采后串行完成 `pnpm build`、`pnpm test` 和 `pnpm content:check`。393 项全量测试和 7,497 篇内容检查通过，构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。339 个股票详情读回核对 42 个 Infinity CL 面板的对应区块及 18 个 TradingView 指标页链接。Pulse 四个入口和两份凭证 JSON 再次核对通过。

首轮 Infinity CL 在 BNB Chain 终局区块 `134779979` 为 12 个标的验证双向 USDT 试算。49 项股票定向测试及 339 个三语详情的服务端渲染通过，核对 9 个边际价 ±1% 面板和 27 个固定输入报价面板。V2、V3 与 Infinity CL 的回归检查覆盖同一快照内池地址或池 ID 重复时的冲突记录处理。[Infinity CL 试算与来源](../reviews/2026-11-20-bstocks-study.md#链上深度)

首轮 Infinity CL 接入后串行完成 `pnpm build`、`pnpm test` 和 `pnpm content:check`，392 项全量测试及 7,497 篇内容检查通过。构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。339 个股票详情读回核对 18 个 TradingView 指标链接、36 个 Infinity CL 面板、既有财报与企业行动。首页和市场入口及两份 Pulse 逐笔 JSON 再次核对通过。

CRCL、MUU、AAPL、SPY、SNDK 和 DRAM 的三语详情接入 TradingView 指标页外链。该轮 45 项股票定向测试、类型检查和定向 ESLint 通过，339 个服务端渲染详情核对了 18 个外链和各自交易所、标的、语言地址。[技术指标及核查边界](../reviews/2026-11-20-bstocks-study.md#图表与指标)

11 月 2 日对照周逐笔核对结束后，22 项 Pulse 定向测试、类型检查和定向 ESLint 均通过。随后串行执行 `pnpm build`、`pnpm test` 和 `pnpm content:check`，388 项全量测试及 7,497 篇内容检查通过。构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。

Pulse 四个入口的 HTML 和 Flight 均核对了两周金额、下载路径、原 34 和 21 条逐笔链接及每周 9 条回购示例。两份下载 JSON 的笔数、字节和 SHA-256 均与周报记录相符。页面按指定钱包与池的已核实付款展示项目下界，项目整体周环比仍缺完整口径。另读回了首页和各市场页的默认及中英日入口、339 个股票详情，其中六家财报的 18 个三语页及 6 个企业行动面板核对通过。[周报凭证与统计口径](#pulse-卡牌周报)

NUB、TSMB、NBISB、ASMLB、NVDAB 和 AMATB 的已核实披露来自四份 6-K 和两份 8-K，合计 12 个报告期间、55 个数值。NVIDIA 和 Applied Materials 的财季均截至 2026 年 10 月 25 日，各自按 2027 财年第三季度及年初至今、2026 财年第四季度及全年显示。正式 10-K 或 10-Q 只有与先前 8-K 的发行人、报告期间、指标和单位一致时，才接替该项目的初步值。[各标的财报期间和口径](../reviews/2026-11-20-bstocks-study.md#财报期间与计算)

补齐六家财报后串行执行 `pnpm build`、`pnpm test` 和 `pnpm content:check`。388 项全量测试、7,497 篇内容检查通过，构建导出 8,379 个静态产物并核验 7,497 个旧入口、717 个本地化页面和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。读回 339 个股票详情，核对其中六家公司的 18 个三语财报详情及 6 个企业行动面板。

SNDKB 和 MUB 新增三语企业行动时间线，分别引用 SanDisk 拆股、Micron 股息、Binance 公告及调整前后的相邻终局区块。44 项股票定向测试通过，核对 339 个三语详情的服务端渲染。[企业行动时间线](../reviews/2026-11-20-bstocks-study.md#企业行动时间线)

补充四份 6-K 时串行执行 `pnpm build`、`pnpm test` 和 `pnpm content:check`。标准构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。387 项全量测试和 7,497 篇内容检查通过。339 个静态详情读回核实三语共 6 个企业行动面板，ASMLB 的凭证单位及每语 113 项精确溢折价仍为缺值。

对照周首次补采后，Pulse 四个入口的静态 HTML 和 Flight 均核对了当时的两周金额、原 34 和 21 条逐笔链接、每周 9 条回购示例及各自下载链接。两份静态 JSON 的笔数、字节和 SHA-256 与该轮路由的验证结果一致。[两周逐笔凭证](#pulse-卡牌周报)

扩展凭证条款时，44 项股票定向测试、类型检查、定向 ESLint 和 339 个三语服务端渲染场景通过。该轮标准构建导出 8,379 个静态产物，构建后 387 项测试及 7,497 篇内容均通过。339 个静态股票详情每语核对 113 份主招股文件、3 份补充文件、112 项有效凭证条款、ASMLB 的凭证单位缺值和 113 项精确溢折价缺值。

上一轮招股文件和回购周报分别通过 44 项股票和 22 项 Pulse 定向测试，387 项全量测试及 7,497 篇内容通过。当时每语的 113 份主招股文件、3 份补充文件及 8 项有效凭证条款读回通过。四个 Pulse 入口的 HTML 和 Flight 均核对了两周金额和原有的 34、21 条逐笔链接，其中本期页面注明列出 3,745 笔回购中的 9 笔。两份逐笔 JSON 与归档数据逐项一致，该轮新增的 1,951 条凭证集中在本期 JSON。

接入独立 v3 深度时，标准 `pnpm build` 导出 8,379 个静态产物，核验 717 个本地化页面、7,497 个旧入口和三份 RSS。构建后串行执行 `pnpm test` 和 `pnpm content:check`，386 项测试及 7,497 篇内容均通过。读回了全部 339 个股票详情，按语言核对两项新增的 v3 深度及来源、23 个 v2 储备面板、43 个 GeckoTerminal 池图、45 项链上深度缺值和 113 项精确溢折价缺值。同轮两份 Pulse 逐笔凭证 JSON 的 SHA-256 保持一致。

此前 Fear 通过 14 项定向测试、类型检查、定向 ESLint 及三语服务端渲染核验。标准 `pnpm build` 导出 8,379 个静态产物，核验 717 个本地化页面、7,497 个旧入口和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。构建后串行执行 `pnpm test` 和 `pnpm content:check`，386 项测试及 7,497 篇内容均通过。四个 Fear 入口的 HTML 和 Flight 均核对了两条各 180 点的曲线、来源、首尾日期、均线方法和评分。同轮还读回四个 Pulse 入口的可见金额、行数和链接，两份凭证 JSON 与上一轮逐字节一致。Pulse HTML 与 Flight 的序列化哈希发生变化，具体原因尚未确认。

上轮 `pnpm build` 导出 8,379 个静态产物，新增两份周报凭证 JSON，核验 717 个本地化页面、7,497 个旧入口和三份 RSS。构建有 5 条既有的 Turbopack 文件匹配范围警告。构建后串行执行 `pnpm test` 和 `pnpm content:check`，384 项测试及 7,497 篇内容均通过。默认及中英日的 Pulse HTML、Flight 数据和两个实际 JSON 文件通过读回核验。

上轮股票通过 43 项定向测试，23 个 v2 池合计 46 个方向的整数试算均与独立计算一致。70 个原缺 DEX 图的标的在无本地行情时通过三语服务端渲染核验。标准构建导出 8,377 页，383 项测试及 7,497 篇内容通过。静态读回核对了 339 个股票详情及各自图表、链上数据与缺值状态。

上一轮定向测试通过 12 项 Fear、17 项 Pulse 周报、4 项 CARDS 回购采集及 6 项 Watch 检查。标准 `pnpm build` 导出 8,377 页，核验 717 个本地化页面、7,497 个旧入口和三份 RSS，有 5 条既有的 Turbopack 文件匹配范围警告。构建后串行跑 `pnpm test` 和 `pnpm content:check`，382 项测试、7,497 篇内容均通过。默认及中英日的四个 Fear 和四个 Pulse 入口均已核验。

此前 Fear 通过 11 项定向测试、类型检查、定向 ESLint 和独立的三语服务端渲染核验。标准 `pnpm build` 导出 8,377 页，并通过 717 个本地化页面、7,497 个旧入口、三份 RSS 检查。构建后串行跑 `pnpm test` 及 `pnpm content:check`，377 项测试、7,497 篇内容均通过。当时四个 Fear 入口核对了估值、UTC 日期、两个市场计价口径、来源与许可，Z-score 仍显示缺失。

前一阶段标准 `pnpm build` 通过 8,377 页静态导出、717 个本地化页面检查、7,497 个旧入口及三份 RSS。构建后串行执行 `pnpm test` 和 `pnpm content:check`，374 项测试及 7,497 篇内容均通过。42 项股票定向测试、339 个三语详情的独立服务端渲染与静态读回、17 项 Pulse 定向测试及四个 Pulse 静态入口均已核验。

更早一轮在构建同时跑全量测试时，`reference-context.test.mjs:27` 读取正在生成的 Library `blog-index.json` 失败，构建结束后串行重跑 369 项全部通过。当时还通过 33 项股票定向测试、240 个三语股票路由渲染场景和 13 项 Pulse 测试。静态读回覆盖四个股票列表入口、16 个市场页、35 份 Oscillator 历史 JSON，以及首页和 Library 的八个字体输出入口。

IBM Plex Sans 的多查询项 Google Fonts URL 曾导致 Turbopack 解析失败。共享页面文档改用随仓库按 SIL OFL 分发的 6 个原始 IBM Plex Sans WOFF2 子集，共 137,108 字节。CSS 保留 24 条 IBM Plex Sans 字体规则和 Arial 回退度量调整。八个已核对的静态入口各有一条本地 Sans 拉丁子集预加载，并有另外六条既有字体预加载。[IBM Plex Sans 授权文本](../../public/fonts/ibm-plex-sans/OFL.txt)

### 当前数据缺口与更新入口

- **bStocks** 的 Binance 现货与盘口快照读取被 Git 忽略的 `.generated/bstocks-study.json`。干净检出需先导入获准使用的候选行情才能得到同等覆盖。核实的发行清单、披露、ADGM 招股文件链接、托管图和链上池映射随源码可用。常规快照中原资产本地复权序列和可核实溢折价各为 0 条。链上显示单位具有单区块时间边界，112 项有效凭证的原资产关系独立取自发行条款。溢折价仍需要获准展示的同一时点报价，或原资产收盘前最后一分钟的完整代币与汇率区间，以及该时段实际成交报价单位对应的原资产份额。[链上显示单位和发行文件](../reviews/2026-11-20-bstocks-study.md#链上显示单位与有效凭证) · [导入格式与时间对齐](../reviews/2026-11-20-bstocks-study.md#更新与复核)
- **链上流动性与报价** 在已查来源覆盖 113 个标的。110 个有双向 ±1% 深度或储备模型，其中 23 个为 PancakeSwap v2 储备模型。DRAMB、MUB 有 Metric 分档深度，USDEB 有双向固定输入报价。金额按各池原计价币和区块展示。Binance Spot 有无需 API key 的盘口接口，本站公开展示盘口的授权仍待确认。113 个 Binance 官方原资产报价组件提供各标的源行情，主挂牌市场收盘价与同窗输入仍待核实。[区块与口径](../reviews/2026-11-20-bstocks-study.md#链上深度) · [行情条款与更新命令](../reviews/2026-11-20-bstocks-study.md#更新与复核)
- **Twelve Data** 从环境变量 `TWELVE_DATA_API_KEY` 读取鉴权值，采集指定日期的拆股及股息复权日线，并校验币种、代码和交易所 MIC。DRAM 供应商归属返回 XASE，核实挂牌为 Cboe BZX，复权序列保留缺值。AAPLB 的 `demo` 实测取得 5 根历史日线，并通过现行导入器的 `--dry-run`。本地市场、SEC 数据及采集样例哈希保持一致。实际公开展示依赖所用数据的授权范围，方案价格本身不构成展示授权。 [采集和校验说明](../reviews/2026-11-20-bstocks-study.md#可选的复权行情来源) [接口字段](https://twelvedata.com/docs#time-series) [商用方案](https://twelvedata.com/pricing-business)

  ```bash
  TWELVE_DATA_API_KEY=demo node scripts/capture-bstocks-twelve-data.mjs --ticker AAPLB --from 2020-08-27 --to 2020-09-02 --out /tmp/AAPLB.json
  pnpm sync:bstocks --underlying /tmp/AAPLB.json --dry-run
  ```

- **市场和周报**可用 `pnpm sync:oscillator --missing-history` 只补缺失日线，沿用现有市场观测时间。`pnpm sync:pulse-cards --week 2026-11-09 --captures FILE` 读取审核过的 DefiLlama 采集文件，默认重算本期和紧邻对照周的 Collector Crypt 开包毛流水、协议收入与持有人收入。`--current-only` 只重算所选已审核周，每个待更新周需有 7 个有效 UTC 日。默认输出候选数值，明确传入 `--write` 时写入。链上凭证和来源在各自报告内维护。[刷新脚本](../../scripts/sync-pulse-cards.mjs)

## M0 首次同步与验收

下表时间均为 UTC。同步产物在本地工作区，采集时间与各源观测时间分别记录。

| 页面 | 本次数据 | 覆盖与限制 |
|---|---|---|
| `/oscillator` | 11-20 08:55:57 快照，500 个标的、35 个研究关注项。Binance、CoinMarketCap、CoinGecko 源数据最早分别为 08:52:29、08:53:18、08:53:51 | 18 / 35 个关注项有历史锚点，上次为 22 / 35。TAO、DASH、AAVE、ICP 本轮缺可用历史，保留缺失状态 |
| `/watch` | 11-20 08:57:38 快照，513 个标的、132 个有上市时间、394 个有报价，19 个来源请求通过 | 本轮补跑恢复了两个 CoinGecko 限流请求。旧快照有 415 个有报价标的，覆盖从 84.2% 变为 76.8%。Bitget 库存缺可靠现货时间，Coinbase 仍只读取前 500 个产品 |
| `/fear` | 11-20 09:07:58 新增可重跑的静态快照。BTC 报价观测于 09:07:56，恐慌与贪婪指数观测于 00:00。各有 180 个历史点 | 暂不可取得的指标留空。200 周均线取截至 11-15 的 200 根已收盘周线。Hyperliquid 的 BTC 永续 OI 以标记价格换为美元名义金额 |
| 方程式新闻 | 11-20 09:03:08 拉取公开 REST。Oscillator 6 条价格及 OI 异动，Watch 10 条交易所公告，Fear 4 条 BTC 与传统市场消息 | 展示 EQN 发布时间、采集时间及来源链接。三语界面共用同一批消息。日语页明确标记所用英文或中文标题 |

BTC 热度的 Day1Global 快照也已同步到 11-20 08:55:21，包含 14 个指标。M0 的 Fear 快照排除了 2026-03-05 手工值，当时缺实现价格、MVRV、交易所流量及全市场清算。页面显示可计算信号数。`/api/fear-data` 实测返回 404，三语页面改为直接读取同一份静态快照。[方程式 API 文档](https://eqn.news/api-docs) [Binance 行情接口](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market) [Hyperliquid 永续接口](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals)

可用 `pnpm sync:oscillator`、`pnpm sync:watch`、`pnpm sync:fear`、`pnpm sync:market-news` 分别采集。运行环境已经配置 HTTP 代理时，用 Node 的 `NODE_USE_ENV_PROXY=1` 继承它。新闻同步只保存近七天的有限标题与链接，异常响应保留上一份文件。页面在静态构建时采用同步后的文件。

本次 `pnpm test` 309 项全部通过，`pnpm content:check` 扫描 7497 篇，`pnpm build` 生成 8303 页并通过 i18n 导出检查。只读核对了默认入口和中英日的 12 个市场页、新闻链接与日期、Fear 观测时间及两份原样导出的数据资产。模拟 EQN 429、无效链接及 Fear 503 时保留了原快照。定向 ESLint 有三条既有的未使用变量警告。

## 开发顺序与任务拆分

**建议先完成首页和 Watch，再补 Oscillator 历史与 Fear 信号。** 首页可以单独实施。股票清单校对和卡牌取数验证可以与市场页并行。沿用 Next.js 静态导出和现有三语路由，先本地生成候选快照并核对覆盖，再由现行发布流程采用。

| 优先级 / 任务 | 责任与依赖 | 交付及验收 |
|---|---|---|
| **P0 M0 数据刷新与 EQN 首接** | 市场数据 · 已完成 | 可重跑的四条同步命令。三页显示带来源和时间的最新可得快照，使用同一语言组的数据 |
| **P1 M1 字段台账和日常刷新** | 市场数据 · M0 | 每字段记录单位、场所、`asOf`、采集时间和缺失原因。有通用数据层时才共享读取逻辑。快照写入前校验覆盖和时间，模拟 429、缺列、空数据及回退旧快照。同步不要求全站每次重建 |
| **P1 W1 Watch 上市事件** | 市场数据 + 前端 · M1 | 公告候选与已生效事件分列。新增现货、永续、Alpha、区域及上市状态筛选。至少用 Binance 现货、Upbit/Bithumb 区域事件和延期/下架三类真实案例校验时间与市场身份 |
| **P1 H1 首页布局** | 前端 · 可独立做 | 调整首页模块顺序与宽度，先移出拉长右栏的内容。四个语言入口的移动、平板、桌面均核验，无横向溢出，广告和主要入口清楚可见 |
| **P2 O1 Oscillator 历史和广度** | 市场数据 + 前端 · M1 | 展示 7D / 30D 有效样本数与 ALT/BTC 历史覆盖。先维护关注项，再扩全量。核验跨源币种匹配、币对改名和历史断档。事件按资产与时间归档 |
| **P2 F1 Fear 可追溯信号** | 市场数据 + 前端 · M1 | 首屏显示当前值、来源、日期与信号贡献。先核实重点缺失数据并采集日序列，再做历史触发表。缺输入时展示可用覆盖与未知条件 |
| **P2 S0 bStocks 发行清单** | 股票数据 · 可独立做 | 按发行方公告、交易市场和链上合约重对全部标的。每项至少持有发行证据、路由 ID、底层资产身份和数据覆盖等级；筛出需补发行、撤牌、换标和合约迁移的行 |
| **P3 S1 三类股票试点 → S2 全量** | 股票数据 + 前端 · S0 → S1 → S2 | 先做 CRCLB、杠杆 ETF 和一个低覆盖样本。通过价格、财报、复权和缺失场景后按资产类型扩展到所有核实已发行标的。三语详情链接全覆盖 |
| **P2 C0 卡牌来源核对 → C1 Pulse 首期** | 内容 + 数据 · C0 可独立做 | Collector Crypt、ORIPA、Renaiss 每项目一份取数说明。首期产出同一周窗口、三语摘要和存档。跨项目指标先核对重叠后汇总 |
| **P3 C2 周报持续更新** | 内容 + 数据 · C1 | 接连完成两期可回算周报后再定时出候选。保留人工发布确认、补录和修订历史 |

### 数据契约和同步节奏

- **行情与指标**保留来源、标的 ID、币对、单位、周期、观测时间与采集时间。用量少的无状态同步先出候选。小时级行情、UTC 日切后的 Fear 指标、每周卡牌汇总各用自己的更新时间。采集、静态导出及发布各自记录结果。
- **EQN**目前可匿名使用 REST，还提供 RSS、MCP 和主频道 WebSocket。近期新闻可按频道、币种或关键词查找，关键词文档窗口为近 30 天。优先 REST，增加 ETag、`Retry-After` 退避和频道覆盖记录。当前同步已经区分有限新闻快照与行情数据，后续不从标题抽取连续行情，回填事件保留原公告或市场证据。 [方程式 API 文档](https://eqn.news/api-docs)
- **发布门槛**按字段和来源拆分。关键源失败时保留最近的完整快照并显示来源日期。合法空结果、过期、暂缺及确认的 0 分别处理。可用来源允许独立刷新，上次的值保留其原时间。慢速财报或宏观数据按照报告期和发布日解释。
- **复核入口**沿用 `scripts/sync-{oscillator,watch,fear}-snapshot.mjs`、`scripts/sync-market-news.mjs` 与对应 JSON / TS 快照。后续合并 M1 后，定向市场测试、构建和三语导出必须通过。回滚以单独恢复对应数据文件或页面版本为单位。

## 三个市场页的后续规格

### Watch

`pnpm sync:watch` 改用 Coinbase 公开现货清单的 `get_all_products=true`。匿名实测得到 917 个唯一产品，前后均无后续分页，恢复 14 个符合条件的交易对。2026-11-20 23:48:10.946 UTC 快照去重后有 516 个标的，其中 135 个有上市时间、394 个有报价，19 个来源取数成功，七条已核实事件继续显示。Coinbase 响应的数量、分页、身份或字段校验失败时保留上次快照。Bitget 旧库存仍缺可靠的现货上市时间。BTC 热度在 23:32:07.861 UTC 记录 26.8，共 14 项指标。[Watch 市场快照](../../public/data/watch-data.json) · [Coinbase 公开产品接口](https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/list-public-products)

此前用 OKX 等其余正常来源回放 Binance 现货清单 HTTP 503，旧同步仍可写入，AT 从现货与永续并有的 A 级误判为仅永续 B 级。另一个复现返回 HTTP 200 但缺预期清单，旧门槛同样未拒绝。现在写入需通过 13 个必需清单请求，包括 Binance 现货及 USDⓈ-M、OKX 现货及永续、Bybit 现货及线性永续、Bitget 现货及 USDT 永续、Coinbase 现货、Upbit 现货、Hyperliquid 永续目录及 CoinGecko 的两页 Binance Alpha 清单。必需来源的请求或结构校验失败时保留前次文件与时间戳。合法空清单依各接口约定处理。Binance 报价请求失败时，若其余写入条件通过且仍有 CoinGecko 有效报价，可更新市场快照。BTC 热度有独立的同步与时效校验。[Watch 同步入口](../../scripts/sync-watch-snapshot.mjs) · [清单来源及解析](../../src/lib/watch-data.ts) · [同步回归](../../scripts/sync-watch-snapshot.test.mjs)

定向验证 30 项通过，并通过类型检查和定向 ESLint。回归核对 HTTP 503、HTTP 200 缺清单、合法空清单和备用报价可用时的写入结果。落地 Watch 快照可核对全部 13 个必需请求及总计 19 项成功、0 项失败。已有快照与七条事件文件逐字节一致，AT 保持现货及永续并有的 A 级。[Watch 市场快照](../../public/data/watch-data.json) · [已核实事件](../../src/data/watch-listing-events.json)

后续复现了 Binance 可选报价返回 HTTP 200 但结构无效的情况。同步现在会跳过无效报价项，保留同一批的有效报价，并在必要时取 CoinGecko 备用数据。所有可用报价均缺失时保留现有快照。完成这轮修复后，全量 400 项测试通过，标准构建生成 8,379 个静态页面。三语 339 个股票详情及各市场页入口均存在，两期 Pulse 归档的 SHA-256 读回与此前一致。精确溢折价、本站复权历史和 Renaiss 回购仍待外部数据补齐。

优先解决公告缺口。用 EQN 的 `binance`、`korea`、`tier2`、`tier3`、`alpha` 发现事件，使用公告原文的交易对、明确生效时刻或交易所 instrument API 验证。保留 `publishedAt`、`effectiveAt`、`firstObservedAt` 和标的身份。若公告未给可核对时间，页面仅显示公告。币种同名、时区、延期、下架和重复转载进入复核。保留现有库存表，以确认的事件时间线补充。缺失报价优先查同一标的所在市场，每行标明价格源、计价币和延迟。

本轮复核 PREDICT 延期、GAS/TRY 的 BREAK 观测及 Bybit 下架公告。Bybit 的 `publishTime` 对应 11 月 20 日 08:00:03 UTC，独立于 11 月 27 日 08:00 UTC 的计划下架时间。三例均保留各自已经证实的时间范围，相关测试 6 项通过。[Watch 事件快照](../../src/data/watch-listing-events.json) · [Bybit 公告接口](https://bybit-exchange.github.io/docs/v5/announcement)

### Oscillator

2026-11-20 23:38:26.740 UTC 快照中，35 个关注标的均有 ALT/BTC 历史。个别来源暂缺时沿用身份已核实的历史。7 日美元涨幅广度为 83/500，30 日为 74/499，批次 BTC 美元参考价为 59,052.48。23:35:09.790 UTC 的方程式新闻快照通过 9 次请求，Oscillator、Watch 和 Fear 分别保留 6、10、4 条带源链接的新闻。[Oscillator 静态快照](../../src/data/oscillator-manual-snapshot.ts) · [方程式新闻快照](../../src/data/market-news.json) · [方程式 API](https://eqn.news/api-docs)

首屏优先给 BTC 基准和本周期 7D / 30D 广度，再进入研究关注和全市场表。把历史波段、同类标的表现和波动事件放到可筛选图表里。ALT/BTC 直接成交、同日双 USD 收盘推导与缺失来源分别标记。历史不足的标的只参与适用窗口。验收用含缺失收益、无 BTC 交易对和多来源重名的转折样本，展示分子、有效分母和起止日期。保留 BTC 热度为独立模块。[BTC 底部信号看板](https://btc.seanzhao.ai/)

### Fear

`pnpm sync:fear` 于 2026-11-21 00:01:59.678 UTC 生成最新快照。最近 180 个已收盘 UTC 日为 2026-05-25 至 11-20。11 月 20 日 Bitview 的 BTC/USD 日收盘价、实现价格和 200 周均线分别为 58,918.27、53,281.42、67,931.8178 USD/BTC。MVRV 为 1.1057938266794898，按日扩展市值总体标准差计算的 Z-score 为 0.18691124498559944。实时 BTC 观测在 00:01:58.008 UTC 为 58,946.71 美元，Binance 历史图该日收盘为 58,951.51 USDT。Bitview 200 周对照图观测于 00:01:58.655 UTC，估值与 Z-score 分别观测于 00:01:58.704 和 00:01:58.756 UTC。与前版相比，评分中只有 Hyperliquid 已结算资金费率由触发变为未触发，得分从 61 变为 51。资金费率覆盖 180 日，连续地址窗口覆盖 161 日，19 日缺观测。快照 SHA-256 为 `a88452e1f40d9ba71e890d3012645d74b734cc64342129deb1c9d5a73179c6d9`。[Fear 静态快照](../../src/data/fear-dashboard-snapshot.json) · [Bitview API](https://bitview.space/openapi.json) · [Bitview 条款](https://bitview.space/terms/)

此前的 `NODE_USE_ENV_PROXY=1 pnpm sync:fear` 于 2026-11-20 17:15:59.896 UTC 生成截至 11 月 19 日的快照。Bitview 的估值输入采集于 17:15:57.138 UTC，Z-score 的长序列输入采集于 17:15:57.677 UTC。实现价格条件逐日比较同一数据源的 BTC/USD 日收盘价和实现价格。11 月 19 日为 `61,858.58 ≥ 53,418.45 USD/BTC`，本日和该窗口的 180 个已核实观测均未触发。Binance 图表的当日 BTC/USDT 收盘价为 61,986.73 USDT，其价格单独用于市场走势。[Bitview API](https://bitview.space/openapi.json)

11 月 19 日 Bitview 市值为 1,244,243,457,007.97 美元，已实现市值为 1,074,476,023,901.21 美元，二者相除得到 MVRV 1.1580002059891183，页面按两位小数显示为 1.16。前一轮复核发现估值区曾显示 CoinGecko 实时市值，修复后确认这两项市值和普通 MVRV 比率使用同一 Bitview 日记录。页面展示收盘价与实现价格对照图及 MVRV 历史图，并标明来源、计算方法和 CC BY 4.0。[Bitview 条款](https://bitview.space/terms/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

Z-score 沿用 Bitview 的公开公式 `(当日市值 − 当日已实现市值) ÷ 截至当日的市值总体标准差`。输入覆盖 2009-01-01 至 2026-11-19 共 6,532 个连续日历日期，其中 585 个显式市值零值纳入计算，7 个空值跳过。逐日核对两组市值后，只把最近 180 个已收盘日的派生值写入快照。11 月 19 日为 0.27987278253857373，显示 0.28。这 180 日的数值范围为 0.17912138523465085 至 1.1031463385341773，既有 `< −1` 条件均未触发。当前评分由 63 变为 61，对应原未知条件变为已知未触发。普通 MVRV 比率用于估值展示。[Bitview 方法预设](https://github.com/bitcoinresearchkit/mono/blob/main/showcases/studio/presets.js#L651-L659) · [扩展总体标准差实现](https://github.com/bitcoinresearchkit/mono/blob/main/showcases/studio/index.html#L12438-L12476)

价格与 200 周均线对照图首次补采的 Bitview BTC/USD 日线采集于 2026-11-20 19:12:44.839 UTC，使用 `[2022-07-24, 2026-11-20)` 的 1,580 个连续已收盘 UTC 日。每个已收盘 UTC 周日取最近 200 个周日收盘价的算术平均，周内沿用最近一次已完成的周均值。当时快照保存最近 180 对数值，收盘价与同日期估值记录逐日核对一致，共有 26 段均线。11 月 14 日均线为 67,709.99325，11 月 15 日周线收盘后更新为 67,931.8178。11 月 19 日的收盘价为 61,858.58，均线为 67,931.8178，两条线均按 USD/BTC，并标明 Bitview、CC BY 4.0 与采集时间。单值 200 周均线卡显示 Binance BTC/USDT 的周线来源和时间。两条线用于趋势查阅，当时的评分为 61。该版快照 SHA-256 为 `803aed32f9da9063ed92e6691b4cf580e3fc80ae4277940e3695ca2b8afb2e79`。[Bitview API](https://bitview.space/openapi.json) · [Bitview 条款](https://bitview.space/terms/)

Bitview 429 回放时，当期已核实的收盘日沿用原采集时间和未触发判定，新取得观测记为 0 日。跨到下一 UTC 日且新增收盘观测缺失时，当前条件显示未知，较早历史保留。截至 11 月 19 日的旧快照曾有 162 日连续地址观测及 180 日资金费率。交易所流量及全市场清算仍待可用数据补充。定量回测需要另行核对样本窗口，宏观比较按交易日对齐。[BTC 底部信号看板](https://btc.seanzhao.ai/)

## Stocks 单标的详情

详情沿用 `/[locale]/stocks/bstocks/[ticker]` 与 `src/components/stocks/instrument-view.tsx`。发行范围以逐条复核后的名录为准，包括已上线的 ANTB。交易身份、财务与各市场数据的覆盖见[详情核验](../reviews/2026-11-20-bstocks-study.md)。[bStocks 发行与产品说明](https://www.binance.com/en-NG/support/faq/detail/f0c03cd6509a4085b4cce1636f16be38) [Binance 上市公告目录](https://www.binance.com/en/support/announcement/list/000000000000048/)

| 模块 | 通用字段及试点 |
|---|---|
| 行情与走势 | 底层价格、涨跌、成交量与 bStock 交易对、成交、价差、深度分别显示。相对底层的溢折价须统一币种、时点、兑换比率，闭市期间单独标状态 |
| 基本面 | 普通股使用财季收入、利润、现金流、TTM、合理可比估值以及财报链接。CRCLB 首试 USDC 净供应、储备收益、收入拆分和发布日。公告中的一次性项目保留口径。ETF 使用底层基金 NAV、基准、管理费、日复位和风险信息 |
| 技术面 | 各资产品种显示各自价格/日线成交量、MA20 / MA50 / MA200、RSI14、区间回撤。股票复权口径注明，窗口不足留缺失。行情源的展示用途和延迟在接入时核实 |
| 链上证券档案 | 包装发行方、链与合约、抵押/赎回条款、企业行动、交易场所与研究入口。缺公开底层锚的标的仍有交易记录及风险标签，跳过估值倍数和溢价字段 |

**试点顺序**选择 CRCLB、MUUB 和一项底层资料不足的样本。CRCLB 用 Circle IR 与 SEC filing 绑定财务观察期和提交日；MUUB 先确认底层 ETF 的真实代码，避免套用 Micron 普通股指标。试点验收后，发行方表与详情同步扩大，使用同一读取层支持每个项目的纳入、缺失及更新。可参考 CRCL 看板的财报、估值和技术面布局，使用本站设计与数据口径。[CRCL 参考看板](https://crcl.seanzhao.ai/) [CRCLB 官方上市公告](https://www.binance.com/en/support/announcement/detail/5646e3f9ea6b4c989cb76aa18bd99245) [Circle 投资者关系](https://investor.circle.com/overview/default.aspx) [SEC EDGAR API](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

## Pulse 卡牌周报

在现有 `/pulse` 增加独立栏目。该页读取 `content/pulse.json`，首页和 Oscillator 的 `WEEKLY_REPORTS` 是另一条链路。卡牌周报拥有独立 `weekStart`、`weekEnd` 和各项目来源。统计窗口从周一 00:00 UTC 开始，至下周一 00:00 UTC 之前结束，项目可标为上线前。

| 项目 | 首期能跟踪的内容与来源 |
|---|---|
| Collector Crypt | 开包、交易及卡片回购的定义和可核查交易，区分卡片回购、CARDS 回购或销毁及二级 GMV。取数检查合作前端、法币渠道覆盖，不能从 Solana 链上观察外推整个平台。[Collector Crypt 开包文档](https://docs.collectorcrypt.com/gacha/api) [DefiLlama 口径](https://defillama.com/protocol/collector-crypt) |
| ORIPA | 先列公开审计、正式上线计划与机制里程碑。开包、铸造、质押分配和金库覆盖仅在对应网络、合约、事件可验证后写入。缺数据以项目状态标明。[BlockSec 审计页](https://blocksec.com/audit-report/oripa-contract) |
| Renaiss | 市场成交、挂单和 FMV 分别展示。可核实的开包和合作机器标记来源，先追踪周内项目变化。与 Collector Crypt 共用的 PANDORA 248 做重叠检查，单笔合作交易只计入一次赛道汇总。[Renaiss 市场与开包页面](https://www.renaiss.xyz/) |

表中金额为各期独立核实的链上付款下界。本期为 `[2026-11-09, 2026-11-16)`，对照周为 `[2026-11-02, 2026-11-09)`，两周均按 UTC。样本保留原始支付币种，周总额和周环比仍缺完整覆盖。[周报快照与逐笔凭证](../../src/data/pulse-card-weekly.json)

| 项目及指标 | 本期已核实 | 对照周已核实 |
|---|---:|---:|
| Collector Crypt 二级成交 | 2 笔，≥546.31 USDC | 2 笔，≥70.40 USDC |
| Collector Crypt CARDS 回购 | 3,745 笔，≥26,663.743218 USDC | 3,997 笔，≥26,859.314711 USDC |
| Renaiss PANDORA 28 开包付款 | 5 笔，≥140 USDT | 1 笔，≥140 USDT |
| Renaiss 二级成交 | 18 笔，≥8,900.5472 USDT | 9 笔，≥3,618.38 USDT |

Collector Crypt 的早期市场合约抽查取得挂单和报价操作。随后按官方市场的 USDC 手续费账户分别定位两周交易，逐笔匹配卖家收款、平台手续费和 Metaplex Core 的 COLLECTOR NFT 交割。开包金额另用 DefiLlama，卡片回购采用 Brich House 的每周 1,000 包抽样估计及其 95% 置信区间。[市场费用规则](https://docs.collectorcrypt.com/marketplace/program#fee-flow-by-transaction-type) · [手续费账户](https://explorer.solana.com/address/8YgmKPVmnnf4emLHVTbbyJKDXBLHWnf6NoajF6ELQRZK) · [卡片回购估算方法](https://brich.house/platforms/weekly/method)

回购钱包的早期抽查取得四页签名，最早到 11 月 9 日 20:11:20 UTC。随后九页各 1,000 条的已终局签名索引覆盖两个完整周的起止边界。本期 3,790 条中 3,750 条执行成功，40 条失败。对照周 4,051 条中 4,001 条成功，50 条失败。补采前对照周逐笔核实了 9 笔，收到 328.170195 CARDS。[Solana 签名查询](https://solana.com/docs/rpc/http/getsignaturesforaddress) · [CARDS 回购钱包](https://docs.collectorcrypt.com/cards-token)

`pnpm exec node scripts/capture-collector-cards-buybacks.mjs --from UTC --to UTC --out CHECKPOINT [--max-calls N]` 采集项目公开钱包的候选记录。`--from` 含起点，`--to` 不含终点，同窗口和同路径可续跑。恢复时先查尚未尝试的签名，保留未完成请求至少 10.1 秒的冷却。`completeWithinScope` 限定已核实的 Raydium CLMM USDC→CARDS 直连交换，尚未核实的回执会保留未完成状态。脚本实测一页 1,000 条真实签名及两周共 12 笔回执，也核验了续跑、UTC 边界和失败状态。候选检查点供周报审核使用。[回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

11 月 9 日周的单路采集取得覆盖目标周两侧的 5,000 条唯一签名，复核了该周 3,790 条签名及其成功、失败分类。2026-11-20 18:19:40.331 UTC 的检查点已尝试 1,140 笔回执，核实 999 笔，141 笔未取得，另有 2,610 笔成功签名当时待查。[回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

早期已审核周报取 2026-11-20 18:47:20.610 UTC 的固定检查点，SHA-256 为 `5d9ace62893a89a8a33c193e47199c1368143d631a24da91a2b0158db15c2f1e`。3,750 条成功签名中，当时已核实 1,792 笔，248 笔尚未从 RPC 取得回执，1,710 笔待查。固定检查点与原凭证的 7 笔重叠记录逐项对齐，保留原 34 条凭证并补入 1,785 笔，当时合计 1,819 条。其 1,794 笔直接回购的 USDC 支出为 16,167.787278，CARDS 入账为 83,159.325256。

同一批候选采集在 19:11:50.650 UTC 已尝试 2,844 笔回执，其中 2,493 笔符合采集范围，5 笔排除，346 笔未取得，另有 906 笔成功签名待查。[回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

首轮于 19:39:11.108 UTC 结束，检查点 SHA-256 为 `e66858ece875ff5a200a6dc5e1d2c7f2a36aa0baf56da0b0a09999422e25467f`。3,750 条成功签名均尝试过回执查询。3,276 笔符合直接回购口径，共支出 23,580.801019 USDC，收到 116,699.290626 CARDS，另有 5 笔排除、469 笔当时未取得回执。并入此前独立核实的一笔回执后，当时的候选为 3,277 笔、23,617.064862 USDC 和 116,915.995405 CARDS。[回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

19:42:39 UTC 起从同一检查点重试 469 笔缺失回执。抽取其中一笔在官方 RPC 单独查询，`maxSupportedTransactionVersion` 分别设为 `0` 和 `1` 时均取到同一笔 legacy 交易。该结果用于核实该签名。[Solana 交易查询](https://solana.com/docs/rpc/http/gettransaction) · [回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

20:08:01.783 UTC 依据续跑检查点和 8 笔逐条查询核实的回执完成本期分类。该周 3,750 笔成功交易全部有结论，5 笔排除，3,745 笔符合回购口径，比早期审核补入 1,951 笔。汇总仅覆盖项目已公布钱包在指定 Raydium CLMM 池直接发起的 `swap_v2`，逐笔核对经典 SPL Token 程序的 USDC 支出和 CARDS 入账。本期该口径下支出 26,663.743218 USDC，收到 131,878.135136 CARDS。[CARDS 回购钱包](https://docs.collectorcrypt.com/cards-token) · [Raydium CLMM 池](https://explorer.solana.com/address/HnhpJPJgBG2KwniMTNW8cVBHvk1hFog3RC3kjnyc23tD) · [周报快照](../../src/data/pulse-card-weekly.json)

11 月 2 日对照周于 20:10:59 UTC 开始采集回执，20:15:45 UTC 的候选索引核对 4,051 条终局签名，其中 4,001 笔成功、50 笔链上失败。20:44:24 UTC 已尝试 1,056 笔成功交易的回执查询，当时核实 910 笔。[回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

对照周首次补采版采用 21:13:41.771 UTC 的固定检查点，已尝试 2,022 笔成功交易的回执查询，核实 1,762 笔，260 笔当时未取得，1,979 笔尚未查询。检查点与早期已核实的 9 笔直连回购有 6 笔重合，逐笔对齐后补入 1,756 笔。当时归档的 1,765 笔回购支出 10,825.020905 USDC，收到 47,138.758962 CARDS。[回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

后续采集于 22:14:41.903 UTC 首次遍历完 4,001 笔成功交易，核实 3,482 笔回购，4 笔因回购钱包未签名排除，515 笔当时未取得回执。22:30:47.022 UTC 的续跑检查点补取 456 笔，已核实回购增至 3,938 笔。22:32:42.556 至 22:35:17.196 UTC 逐笔取得最后 59 笔原始 legacy 交易并完成核对。[Solana 逐笔交易接口](https://solana.com/docs/rpc/http/gettransaction) · [回购采集脚本](../../scripts/capture-collector-cards-buybacks.mjs)

对照周 4,051 条终局签名中，50 笔链上失败，4,001 笔成功交易全部完成分类。3,997 笔符合官方钱包签名、指定 Raydium CLMM 池直接 `swap_v2` 和经典 SPL Token 程序结算的口径，共支出 26,859.314711 USDC，收到 112,363.576802 CARDS，比首次补采版增加 2,232 笔回购凭证。独立复核重新核对候选索引、补采清单和全部 59 笔逐条查询回执。两周均完成该钱包和池的核对，金额是项目公开可核实的下界。[官方回购钱包](https://docs.collectorcrypt.com/cards-token) · [Raydium CLMM 池](https://explorer.solana.com/address/HnhpJPJgBG2KwniMTNW8cVBHvk1hFog3RC3kjnyc23tD)

Renaiss 开包付款逐笔核对 Fair 结算回执与同一笔 USDT 转账。两周各有 5 个已付款的 PANDORA 28 订单，本期为 5 笔独立结算，对照周的 1 笔结算包含订单 166625 至 166629，288 字节的结算事件与 140 USDT 转账相符。独立复核重现了对照周单元格指向本期单笔示例的问题。修正后，三语均核对了两周单元格的 Fair 方法链接、订单 186104 的官方揭晓示例及各期对应的回执。其他订单的揭晓、NFT 所有权交割及 Renaiss 两类回购仍缺相应证据。[Fair 方法](https://fair.renaiss.xyz/whitepaper) · [本期官方开包证明](https://fair.renaiss.xyz/verify-a-rip?tx=0x682e1b36a7cb4cd9ae3f3a2480b69aae81ce756c0765f9f22bde1c86d83c03d7) · [对照周批量回执](https://bscscan.com/tx/0x91a42c9ef4d80ebb70cbb8068bfccc53da3e1b29a88763a7d6f4ff7731076317)

Renaiss 二级成交从截至 2026-11-15 23:59:59 UTC 的 Binplorer `OrderBook` 地址索引中取样。返回的 100 笔直接调用覆盖两个观察周及对照周之前的时间。纳入记录均匹配 BNB Smart Chain 成功回执、`TradeExecutedV2` 日志、USDT 支付及对应 NFT 交割。[OrderBook 事件](https://bscscan.com/address/0xAE3e7268EF5A062946216A44f58A8F685fFD11d0#events) · [本期回执示例](https://bscscan.com/tx/0x6bb9d0ffc88f63d97f5dd4260d11f576e90166fa2fed7b0a4f1dddbd7c66b319) · [对照周回执示例](https://bscscan.com/tx/0x2e999a4c63fa5bdcbc34d24ea4a15ae0add833ea6ab9f03453b67f28d5e3863d)

Renaiss 公开单卡详情的 397 和 680 USDT 历史价格，分别对应现有归档 11 月 15 日 00:24:39 UTC 和 11 月 8 日 21:18:28 UTC 的二级成交。公开价格历史缺事件类型、钱包、交易哈希和交割字段，周报继续按已有的链上回执去重。2026-08-26 修订的官方条款第 5.9 节提到日后可能推出实用或奖励代币。观察窗口前的正式发行日期、原生代币合约和两期回购均缺可核凭证。[Renaiss v2 文档](https://api.renaiss.xyz/v2/docs) · [Renaiss 使用条款](https://www.renaiss.xyz/terms)

Brich House 的 11 月 2 日和 11 月 9 日周度数据均未覆盖 Renaiss。Renaiss Index 的公开方法说明指数计算。[Brich House 对照周](https://brich.house/platforms/weekly/2026-11-02) · [Brich House 本期](https://brich.house/platforms/weekly/2026-11-09) · [Renaiss Index 方法](https://index.renaissos.com/methodology)

Renaiss 的历史抽查在 6 月 12 日旧合约 `0xAAb5…` 核实一笔金额为 81 USDT 的 V3 回购事件，日期早于两周统计窗口。11 月 SDK 的 BNB 主网参考地址以 `0xD4` 开头。官方 v2 的生产回购及 `draw-status` 查询需要 Builder 鉴权，所查公开最近 100 条接口只覆盖开包记录。两期卡片和代币回购仍缺可纳入周报的回执，实际金额须逐笔核实。[6 月 12 日回执](https://bscscan.com/tx/0x15fbe597f3e03a08d973c8952ab4c4ab8574de05d3a617ee1ad8eeae23342b5f) · [Renaiss v2 文档](https://api.renaiss.xyz/v2/docs) · [SDK 主网地址](https://github.com/Renaiss-Protocol/renaiss-sdk/blob/main/docs/demo-networks.md#mainnet-reference-chain-56)

11 月 9 日和 11 月 2 日周报页面分别列出原 34 和 21 条逐笔链接，其中各有 9 条 CARDS 回购。四个入口通过 `/data/pulse-card-receipts/2026-11-09.json` 和 `/data/pulse-card-receipts/2026-11-02.json` 提供对应周的 3,770 和 4,009 条已核实凭证。两个 JSON 均提供 `weekStart`、`weekEnd` 与去重 `receipts`。本轮对照周新增的 2,232 条链接集中在该周 JSON。周报源文件 SHA-256 为 `aa66401adc00086d311f20e980ee76444edece0cd293f562aa146132929343aa`。[静态凭证路由](../../src/app/(legacy)/data/pulse-card-receipts/[week]/route.ts)

| 凭证文件日期 | 字节 | SHA-256 |
|---|---:|---|
| 2026-11-09 | 1,830,445 | `c0927e192d69281505a8e8c6955bf9fdf1430dc6a3ea3551631ebf5ca65e27a2` |
| 2026-11-02 | 1,947,196 | `ad73b2ddba0683c3d4d2c7f41f64a695941e6f53b2b454cf31a7b378d5c72d8f` |

10 月 26 日起的对照周标为暂无核实数据。最新表格从紧邻且同源的归档取对照值。PANDORA 248 合作机台在最新周报列一条。此前离线 Chromium 实测点击归档链接及直接打开对应片段均展开旧报告。相同结算以链、交易签名及日志或指令索引去重，再按项目、指标和支付币种匹配唯一归属。回归核对了重复维护对照数据、归属不唯一、来源不匹配及历史项目状态。[归属与去重测试](../../src/lib/card-weekly.test.mjs)

2026-11-20 15:56:08 至 15:56:09 UTC 重取 DefiLlama 三组源数据，覆盖所需的 14 个完整日。`--current-only` 分别验证两期，默认双期模式验证 11 月 9 日起的报告及其归档对照。三组指标在本期及对照周分别重算为 29,024,656 和 27,213,438 美元、1,607,507 和 1,246,257 美元、26,565 和 26,796 美元，均与已审核存档一致。指定 11 月 2 日起的报告且要求双期时，采集文件缺 10 月 26 日起的 7 个 UTC 日，校验拒绝。上述命令均为 dry-run。[DefiLlama 数据口径](https://defillama.com/protocol/collector-crypt)

两期均包含三语摘要、项目指标、独立口径与来源。卡牌周报日期从自身快照读取，Pulse 摘要沿用各自刷新时间。周期发布和新增项目仍需要持续审核的取数证据。

## 首页布局

截图空白源自当前双列结构。`src/app/(legacy)/page.tsx` 的主栏在 Featured Research 后结束，右栏继续承载广告、每周简报、市场工具和交易所入口，订阅排在两列共同末尾。用整行区块拆开长右栏，先完成布局调整，再补真实数据卡片。

| 行 | 桌面 | 移动端 |
|---|---|---|
| 首屏 | 保留定位、搜索和现有核心入口 | 同顺序，避免首屏堆叠次要卡片 |
| 市场快照 | 一行连接 Oscillator、Watch、Fear，展示有效小指标和来源日期。完整数据留在各页 | 两列或单列短卡，宽度由内容决定 |
| 近期更新 | 主列放最近文章，侧列只放紧凑广告与一个简报入口。卡片高度随内容 | 最近文章 → 简报 → 广告 |
| 研究与专题 | Featured Research 横跨整行，后续并列放链上股票与卡牌周报入口 | 各栏目顺序纵排，紧邻其标题 |
| 底部 | 市场工具、交易所入口与返佣说明组合为紧凑整行，接订阅区 | 交易所入口和说明相邻，最后到订阅区 |

保留单一首页广告位及 **US$300/月、`chuhemiao@gmail.com`** 和邮件链接。三语均从顶部语言菜单切换。验收宽度为 390、768、1024、1440 px，检查无横向滚动、文本折行和键盘焦点顺序。1440 px 时，两列之间在主栏内容结束后仍有右栏内容的高度差控制在 160 px 以内，精选研究可直接接续。第一阶段沿用已有工具链接，等 M1 数据质量稳定后替换成有来源和时间的短数据卡片。
