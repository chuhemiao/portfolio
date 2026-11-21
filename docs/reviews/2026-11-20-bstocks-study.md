# bStocks 详情页核验

## 目录与数据覆盖

ADGM 名录于 2026-11-20 10:08:56 UTC 完成对照。113 条记录对应 113 个唯一 ISIN，发行方为 BTech Holdings Limited，登记交易所为 Nest Exchange Limited。补入现有目录遗漏及新增的 13 个交易标的，15 个标的有已核实的 BNB Chain 合约地址。CMC 历史聚合仍覆盖原快照中的 100 个标的，价格和市值保留各自日期。[ADGM 官方名录](https://www.adgm.com/financial-services-regulatory-authority/listing-authority/official-list-of-securities)

13:12:30 UTC 以 Binance Web3 的证券信息复核合约，补齐 98 个 BNB Chain 地址，原有 15 个地址与来源一致。113 个已核实发行标的均有对应合约地址。[Binance Web3 代币化证券信息](https://web3.binance.com/en/dev-docs/products/wallet-skills/supported-skills#binance-tokenized-securities-info)

19:52:20 UTC 读取 ADGM 的已核准招股文件目录后，分三页取得 50、50、16 条 BTech Holdings Limited 的文件记录，并与发行清单的 113 个 ISIN 对齐。113 份主招股文件各对应一个标的，AGPUB、BNCB、INTWB 各有一份补充文件。三语详情的原资产基本面区展示相应文件链接和 ADGM 核准日，Watch 上市事件以各市场来源的实际生效时间为准。公开发行文件用于核实披露内容，行情展示另取获准使用的底层报价。[ADGM 已核准招股文件](https://www.adgm.com/financial-services-regulatory-authority/listing-authority/approved-prospectuses/) · [113 个标的的文件快照](../../src/data/instruments/bstocks-prospectuses.json)

| 模块 | 本地实际覆盖 |
|---|---|
| Binance 现货 | 113 组 USDT 计价报价和走势，10,454 根有成交的完整 UTC 日线，每个标的 1–162 根。盘口覆盖 112 个，SNDKB 的状态为 BREAK |
| 代币走势图 | 74 个实测 TradingView Binance Spot 图、43 个 GeckoTerminal 池图绑定，4 个标的重合，合计覆盖 113 个标的 |
| 链上流动性与报价 | 113 个标的有已核实场所的流动性或报价数据，其中 110 个有双向 ±1% 深度或储备模型，含 23 个 PancakeSwap v2 储备模型。14 个 Infinity CL 标的均有双向深度。DRAMB 和 MUB 保留 Metric 分档深度，USDEB 显示固定输入报价 |
| 技术指标 | 104 个标的有 MA20，86 个标的有 MA50。当前没有标的达到 MA200 所需的 200 根日线 |
| 底层基本面 | 113 个标的均有可溯源基本面，88 个采用公司披露，25 个采用基金或封闭式基金资料 |
| 发行文件 | 113 份 ADGM 核准的主招股文件，AGPUB、BNCB、INTWB 各有一份补充文件。三语详情均提供原始链接和核准日 |
| 原资产走势图 | 113 个标的均有对应的 TradingView 图表配置。实际挂牌为 NASDAQ 73、NYSE 26、NYSE Arca 11、Cboe BZX 3 |
| 原资产报价组件 | 113 个原资产均有实测匹配的 Binance 官方美元报价，三语详情提供按需加载入口。标的绑定核对原资产代码、交易所、ISIN 和链上合约 |
| 链上显示单位 | 113 个对应代币均有同一区块的显示单位，82 个系数为 1，31 个为其他值。112 个标的有发行条款核实的有效凭证与原资产关系，ASMLB 的凭证单位待核 |
| 复权与溢折价 | MUU 图已核验 2026-07-15 的 1 拆 20。提供方图表出现 ADJ 时可切换股息复权。本站可计算的原资产复权序列和可核实溢折价各为 0 条 |

现货采样时间为 10:39:32 UTC，报价窗口结束时间和盘口观测时间分别保留。买卖深度是各档价格乘数量后，在中间价上下 1% 内求和。返回的档位未到窗口边缘时，页面标注覆盖限制。交易暂停时，保留发行登记和历史走势。[Binance Spot 市场接口](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market) · [SNDKB 拆股及暂停公告](https://www.binance.com/en/support/announcement/detail/ec32e6657ae341b3b57f1b154c330c6d)

以 Nasdaq Trader 11:08:12 UTC 的名录补齐 33 个图表绑定，并将 SPY 修正为 NYSE Arca。11:11:13 UTC 完成核对，34 个更新后的代码均有对应的 TradingView 代码页。页面保留实际交易所名称，图表配置使用提供方对 NYSE Arca 的 `AMEX` 和 Cboe BZX 的 `CBOE` 前缀。SKHYB 对应的是美国挂牌的 SKHY 存托股。[Nasdaq 挂牌名录](https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt) · [其他交易所名录](https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt) · [SKHY 标的说明](https://www.binance.com/en/academy/articles/how-to-trade-sk-hynix-skhy-on-binance)

新增 12 份基金档案。六只 iShares 基金的 11 月 19 日净值与基金目录净费率分别标注来源。KORU、SOXL、SOXS、TMF 和 KSTR 的 11 月 19 日净值、市价与净费率均取自发行方。SPY 保留 11 月 18 日净值 $730.54、美东 16:00 中间价 $730.32 和 0.0945% 总费率。[iShares 基金目录](https://www.ishares.com/us/products/etf-investments) · [KORU](https://www.direxion.com/product/daily-msci-south-korea-bull-3x-etf) · [SOXL、SOXS](https://www.direxion.com/product/daily-semiconductor-bull-bear-3x-etfs) · [TMF](https://www.direxion.com/product/daily-20-year-treasury-bull-bear-3x-etfs) · [KSTR](https://kraneshares.com/etf/kstr/) · [SPY](https://www.ssga.com/us/en/institutional/etfs/state-street-spdr-sp-500-etf-trust-spy)

### 链上显示单位与有效凭证

在 BNB Chain 终局区块 `134722431`（2026-11-20 15:52:27 UTC，哈希 `0xe3decf148f8464b02b75e4f08417129aa83aa1086fe02940689e280e41359e11`）读取全部 113 个 bStocks 的显示系数。采集按合约、发行代码和 ISIN 绑定，核实代币精度为 18 位、没有待生效系数，并在写入前再次校对区块哈希。页面展示每枚链上原始代币对应的显示单位 `uiMultiplier / 10^18`，附区块时间和来源。SNDKB 为 `8`，MUUB 为 `1.003951968068627743`，CRCLB、DRAMB 和 ANTB 均为 `1`。Binance 的余额和现货交易按显示单位计量。[显示单位快照](../../src/data/instruments/bstocks-display-units.json) · [BNB Chain 区块](https://bscscan.com/block/134722431) · [BEP-677](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-677.md) · [Binance bStocks 单位说明](https://www.binance.com/uz-UZ/support/faq/detail/f0c03cd6509a4085b4cce1636f16be38)

原有五份 ADGM 发行文件分别核实一份有效凭证对应一股 CRCL、ANT 或 SNDK，或一份 MUU、DRAM 基金份额。[CRCLB](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus----11-june---circle-internet-group-bstocks_06_11_2026_16-36-41.pdf#page=61) · [ANTB](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech_holdings_prospectus_--18-november--_anthropic_bstocks.pdf#page=13) · [SNDKB](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus----11-june---sandisk-bstocks_06_11_2026_16-37-40.pdf#page=61) · [MUUB](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---21-july---direxion-mu-bull-2x-etf-bstocks_07_21_2026_14-06-32.pdf#page=14) · [DRAMB](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---6-july---roundhill-memory-etf-bstocks_07_07_2026_08-46-56.pdf#page=14)

上一轮补核三项。AAPLB 每份有效凭证对应一股 AAPL，BABAB 对应一份 BABA 美国存托凭证（ADR），SPYB 对应一份 SPY 基金份额。[AAPLB 第 14 页](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---28-july---apple-bstocks_07_28_2026_11-44-18.pdf#page=14) · [BABAB 第 85 页](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---14-july---alibaba-bstocks_07_15_2026_08-46-12.pdf#page=85) · [SPYB 第 14 页](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---6-july---spy-bstocks_07_07_2026_08-44-02.pdf#page=14)

本轮于 20:26:42 至 20:30:10 UTC 取得其余 105 份主招股文件，均返回 HTTP 200。结合此前八份，按发行 ISIN、原资产身份和 PDF 物理页核对全部 113 份。112 个标的可按条款展示每份有效凭证对应的原资产单位，其中 82 个对应一股，24 个对应一份基金份额，5 个对应一份美国存托凭证（ADR），1 个对应一份美国存托股份（ADS）。详情链接直达相应条款所在页，链上显示单位取同区块的独立系数。精确溢折价仍需核对实际报价单位、时间窗口以及获准展示的原资产、代币和汇率输入。[已核准招股文件目录](https://www.adgm.com/financial-services-regulatory-authority/listing-authority/approved-prospectuses/) · [文件及条款快照](../../src/data/instruments/bstocks-prospectuses.json)

BRKBB 的主文件第 14 页核对一股原资产的条款，第 78 页用 `BRKB`。SEC 文件以 CUSIP `084670702` 和 ISIN `US0846707026` 对应伯克希尔 B 类普通股，页面映射到 `BRK.B`。[BRKBB 条款](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---20-october---berkshire_hathaway-bstocks_10_20_2026_15-40-34.pdf#page=14) · [BRKBB 第 78 页](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus---20-october---berkshire_hathaway-bstocks_10_20_2026_15-40-34.pdf#page=78) · [SEC N-PORT](https://www.sec.gov/Archives/edgar/data/1317146/000139834425010770/xslFormNPORT-P_X01/primary_doc.xml) · [伯克希尔 8-K](https://www.sec.gov/Archives/edgar/data/1067983/000119312526344495/d159922d8k.htm)

MELIB 的主文件使用 `MEL`。用 ISIN `US58733R1023` 和 CUSIP `58733R102` 对齐 MercadoLibre 普通股，页面使用 Nasdaq 上市代码 `MELI`。[MELIB 条款](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech_holdings_-_prospectus_--17-november--_mercadolibre_bstocks.pdf#page=14) · [SEC N-PORT](https://www.sec.gov/Archives/edgar/data/1924868/000200032426005081/primary_doc.xml) · [MercadoLibre 10-Q](https://www.sec.gov/Archives/edgar/data/1099590/000109959026000029/meli-20260930.htm)

三份补充文件均纳入各自有效凭证核对。AGPUB 和 INTWB 的补充文件调整发行上限，BNCB 的补充文件涉及更名、发行上限及相关披露。核对范围为对应主文件和补充文件的条款。新出现的补充文件需先核对条款，详情仍会提供其正式链接。[AGPUB 补充文件](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-supplementary-prospectus---27-october---axe-compute-bstocks_10_27_2026_15-07-37.pdf) · [BNCB 补充文件](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-supplementary-prospectus---23-october---bnb-standard-corp-bstocks_10_23_2026_12-56-27.pdf) · [INTWB 补充文件](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-supplementary-prospectus---6-november---graniteshares-2x-long-intc-etf-bstocks_11_06_2026_12-35-58.pdf)

ASMLB 的主招股文件第 9、14 页使用 ADR，第 65 页使用股份，第 78 页将 ADR 与 `USN070592100` 并列。发行方 11 月 2 日分红通知沿用 ADR 称谓。ASML 官方股票信息把同一 ISIN 对应到 Nasdaq 纽约登记普通股，向 SEC 提交的年报也采用该挂牌口径。原资产类型的表述仍有出入，ASMLB 页面提供正式文件与链上显示单位，有效凭证与原资产关系暂缺。[ASMLB 主文件第 14 页](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/asml-bstocks---prospectus-20260804_08_04_2026_18-14-29.pdf#page=14) · [ASMLB 主文件第 78 页](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/asml-bstocks---prospectus-20260804_08_04_2026_18-14-29.pdf#page=78) · [11 月 2 日通知](https://www.adgm.com/globalassets/market-disclosure/content/disclosure/disclosure-on-corporate-action-affecting-asml-bstocks_11_01_2026_16-06-00.pdf#page=1) · [ASML 股票信息](https://investor.asml.com/share-information) · [ASML 年报](https://www.sec.gov/Archives/edgar/data/937966/000162828026011378/asml-20251231.htm)

### 企业行动时间线

SNDKB 对应 SanDisk 普通股 1 拆 8，SEC 文件记载法定生效时间为 2026-11-19 21:01 UTC。Binance 将资格快照列为 11 月 20 日 01:00 UTC，公告计划于 09:00 UTC 恢复交易。相邻 BNB Chain 区块分别读得每枚原始代币的 1 和 8 个显示单位。原股票生效、资格快照、链上更新和计划复牌各有对应证据。[SanDisk SEC 文件](https://www.sec.gov/Archives/edgar/data/2023554/000162828026075127/sndk-20261119.htm) · [Binance 拆股公告](https://www.binance.com/en/support/announcement/detail/ec32e6657ae341b3b57f1b154c330c6d) · [区块 134603490，00:59:59.600 UTC](https://bnbscan.com/blocks/134603490) · [区块 134603491，01:00:00.050 UTC](https://bnbscan.com/blocks/134603491)

MUB 对应 Micron 普通股。发行方于 2026-09-30 宣布每股 0.15 美元现金股息。Binance 将资格快照列为 10 月 14 日 00:00 UTC，并公告股息扣除适用税费和成本后再投资。链上持有者的再投资体现为显示乘数调整。公告称 MUB/USDT 现货交易照常。相邻区块读得每枚原始代币的显示单位从 `1.000107512568805603` 增至 `1.000217357013353696`。[Micron 股息公告](https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fourth-Quarter-and-Full-Year-2026-Results/) · [Binance 分红处理公告](https://www.binance.com/en/support/announcement/detail/d1cd2ab0a2064dedb14121df74538cf8) · [区块 127494945，10 月 13 日 23:59:59.900 UTC](https://bnbscan.com/blocks/127494945) · [区块 127494946，10 月 14 日 00:00:00.350 UTC](https://bnbscan.com/blocks/127494946)

两项时间线仅对应已核实标的和来源。历史溢折价计算仍需核对交易场所实际报价单位、同期有效凭证份额、原资产品种的正式收盘和可公开使用的汇率及代币价格。[BEP-677 显示单位规范](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-677.md)

## 图表与指标

TradingView 的 Binance Spot 嵌入图绑定逐个核实的 `BINANCE:<bStock>USDT`，本轮在原有 CRCLB、MUUB 基础上新增 72 个。实测 74 个标的均返回 1D 开盘、最高、最低、收盘及成交量。无效标的对照也加载了组件外壳，完整行情字段才计入核验。缺本站日线时可展开对应的托管图，已有日线时优先展示本站走势。74 个现货图与 43 个 GeckoTerminal 池图的交集为 ANTB、CRCLB、DRAMB、SNDKB，合计覆盖全部 113 个标的。原资产、代币报价、盘口和溢折价分别标明来源与时间。[CRCLBUSDT 图表](https://www.tradingview.com/symbols/CRCLBUSDT/?exchange=BINANCE) · [MUUBUSDT 图表](https://www.tradingview.com/symbols/MUUBUSDT/?exchange=BINANCE) · [TradingView 市场覆盖](https://www.tradingview.com/widget-docs/markets/worldwide/)

托管原资产图默认开启 TradingView 的 MA9 和 RSI（14）。CRCL 英语图及 MUU 简中图实测两项均有数值，CBRS 与 DRAM 实测两个指标图例，ANT 日语图的样本尚不足以显示指标数值。指标菜单可调整显示，供应商账户方案决定可同时启用的指标数。早期手动实测还核对了 CRCL 的 MACD 12/26/9。本站可计算的原资产 MA20、MA50 与 MA200 仍需导入获准使用的复权收盘序列。[TradingView 高级图表配置](https://www.tradingview.com/widget-docs/widgets/charts/legacy-advanced-chart/demos/technical-analysis/)

六个标的在原资产走势图旁提供 TradingView 技术指标页。`NYSE:CRCL` 和 `NASDAQ:MUU` 按英语、简中、日语使用 `www`、`cn`、`jp` 站点。`NASDAQ:AAPL`、NYSE Arca 的 SPY、`NASDAQ:SNDK` 和 Cboe BZX 的 DRAM 指向已核实的英文源，SPY 和 DRAM 采用提供方的 `AMEX` 和 `CBOE` 代码前缀。[CRCL](https://www.tradingview.com/symbols/NYSE-CRCL/technicals/) · [MUU](https://www.tradingview.com/symbols/NASDAQ-MUU/technicals/) · [AAPL](https://www.tradingview.com/symbols/NASDAQ-AAPL/technicals/) · [SPY](https://www.tradingview.com/symbols/AMEX-SPY/technicals/) · [SNDK](https://www.tradingview.com/symbols/NASDAQ-SNDK/technicals/) · [DRAM](https://www.tradingview.com/symbols/CBOE-DRAM/technicals/)

实测来源页可查看 RSI（14）、MACD（12、26）和 SMA20、SMA50、SMA200，DRAM 的 SMA200 单元格为空。ANT 指标页实测返回 404。本次核查的技术分析小组件只给买入、中性及卖出信号的计数。本站提供上述原指标页链接，本地指标计算仍依赖获准使用的复权收盘序列。

Binance 官方原资产报价组件从 CRCL、MUU、ANT 扩展至 113 个原资产。九组各 12 个和末组 5 个的实际响应均匹配原资产代码并返回 USD 报价。本站核对的挂牌身份为 Nasdaq 73、NYSE 26、NYSE Arca 11、Cboe BZX 3。三语详情各有一个入口，首次展开才在独立 `iframe` 加载组件，`sandbox` 仅允许脚本执行，组件禁用 referrer。首批点击样本发出 3 个外部请求、约 19.3 KB，父页面 DOM 隔离经核验。组件内容为英文，报价的交易场所和时点字段缺失。精确溢折价仍需核实主挂牌市场的正式收盘及同一时点的配对输入。[Binance 股票报价组件](https://www.binance.com/en/stocks-price-widget) · [Binance 股票行情 API](https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/rest-api/market-data) · [报价入口及标的映射](../../src/data/bstocks-study.ts)

原资产的 Legacy 嵌入图启用日期区间工具栏。图底部出现 `ADJ` 时可切换股息复权，该提示在三种语言中均按按钮可用性表述。AAPL 英语与简中图、SPY 英语图、MUU 英语图均实测可从关到开再关闭，图表随切换重绘。此操作作用于托管图，本站数值序列和相关计算仍需获准使用的行情输入。[Legacy 嵌入配置](https://www.tradingview.com/widget-docs/widgets/charts/legacy-advanced-chart/demos/technical-analysis/) · [TradingView 股息复权说明](https://www.tradingview.com/support/solutions/43000590597-how-to-adjust-data-for-dividends/)

早期未登录的 CEX 筛选器实测在使用过滤功能时要求登录。本轮现货图核验直接使用对应现货代码。[TradingView CEX 筛选器](https://www.tradingview.com/cex-screener/)

13:19:27 UTC 共核实 42 个 BNB Chain 上以 USDT 报价的池，覆盖 PancakeSwap v3 36 个、Metric 4 个、Uniswap V3 2 个。35 个池经 DEX Screener 与 GeckoTerminal 双源核对，另 7 个由 GeckoTerminal 的活跃池记录确认。池的基础代币合约与每个标的的官方地址对应。快照记录市场标识和核对来源，图表由 GeckoTerminal 提供，独立于 Binance 现货和盘口。42 个池的映射通过数据校验，其中 4 个样本实测图表可用。[GeckoTerminal 官方嵌入说明](https://about.geckoterminal.com/embed-charts) · [GeckoTerminal 接口规范](https://api.geckoterminal.com/docs/v2/swagger.json) · [DEX Screener 接口](https://docs.dexscreener.com/api/reference)

### 链上深度

早期试算在 BNB Chain 最终区块 `134708153`（14:05:19 UTC，哈希 `0xb9c0549dd892eb12e2ca8f8505386a3425deab4f5f2a049804963b14560b124a`）核对了 CRCLB 和 ANTB 的 PancakeSwap v3 池，覆盖 USDT 的两种代币排序。当次 RPC 批请求返回 `-32002`，随后逐项完成两池验证。[PancakeSwap v3 合约地址](https://developer.pancakeswap.finance/contracts/v3/addresses) · [BNB Chain RPC 文档](https://docs.bnbchain.org/bnb-smart-chain/developers/json_rpc/json-rpc-endpoint/)

本机临时核验文件的 SHA-256 为 `96977a42b4384f572160a02ba3dfc86a0ec0a1486c83366e3c8aab258526e242`。[样本与口径](/private/var/folders/1p/r4w4zv6d63d0gcvd2_0cq2mm0000gn/T/portfolio-bstocks-dex-depth.LPnzFa/depth.json) · [采集日志](/private/var/folders/1p/r4w4zv6d63d0gcvd2_0cq2mm0000gn/T/portfolio-bstocks-dex-depth.LPnzFa/capture.log)

v3 快照覆盖 36 个 PancakeSwap v3 池和 2 个 Uniswap V3 池，取最终区块 `134711116`（14:27:32 UTC）。用各场所 QuoterV2 模拟交易，核对边际价上移 1% 所需买入 USDT 和下移 1% 所得卖出 USDT，含池手续费。百分比以池内起始边际价为基准，页面金额来自模拟的 USDT 输入或输出。[v3 深度快照](../../src/data/instruments/bstocks-dex-depth.json) · [PancakeSwap v3 合约地址](https://developer.pancakeswap.finance/contracts/v3/addresses) · [Uniswap V3 BNB 部署](https://developers.uniswap.org/docs/protocols/v3/deployments/v3-bnb-deployments)

Metric 快照覆盖 AAPLB、DRAMB、MUB、SNXXB，取最终区块 `134712341`（14:36:44 UTC）。每个池的买卖两侧各返回 12 个档位，各独立试算其中两档。页面注明方向和价格区间，金额为截至该侧最远已试算档位累计的 USDT。[Metric 深度快照](../../src/data/instruments/bstocks-metric-depth.json) · [Metric 合约清单](https://github.com/Metricxyz/sdk#contracts) · [档位方法](https://github.com/Metricxyz/periphery-contracts/blob/main/contracts/libraries/LiquidityLadder.sol)

在同一原始终局区块复查 DRAMB 和 MUB 的两池四个买卖方向，区块哈希为 `0xb401b1a641661dad2b982fa2ee9d3a8d2bb5463814a1b08568a2db604a3623fb`。依据池侧价格及预言机价格分别设置 ±1% 限制，两组每个方向的原始返回均与开放询价逐字节一致。这批证据尚未确认达到目标边际价，两项沿用既有分档数据。归档核验摘要 SHA-256 为 `2d4d216235e71dd0a6d1124e0a4d60fedca4f70ad28272636eb8c11392652854`。[BNB Chain 区块](https://bscscan.com/block/134712341) · [Metric 池价格限制](https://github.com/Metricxyz/pool-contracts/blob/main/contracts/MetricOmmPool.sol#L498-L524) · [Metric Quoter](https://github.com/Metricxyz/periphery-contracts/blob/main/contracts/lens/MetricOmmSwapQuoter.sol#L29-L49)

对原先缺深度的 71 个标的复查其他计价币，取得 BNCB/WBNB 的 PancakeSwap v3 池 `0xfc58462502b7c47f166292df6e6b11e1ae41f314`，当时还有 70 个标的缺已核实深度。该次返回里的 USDC 和 USD1 池无精确匹配。最终区块 `134716303`（15:06:27 UTC）的模拟显示，买到边际价 +1% 需支付 `26.716254520592227765 WBNB`，卖到 −1% 可得 `26.162025505018196788 WBNB`。已按池地址核对 GeckoTerminal 图的 OHLC 与成交量。提供方对该代币使用其他简称，图轴价格单位以提供方图中标注为准。WBNB 是本站深度卡的计价单位。[WBNB 深度快照](../../src/data/instruments/bstocks-wbnb-depth.json) · [BNB Chain 区块](https://bscscan.com/block/134716303) · [GeckoTerminal 池图](https://www.geckoterminal.com/bsc/pools/0xfc58462502b7c47f166292df6e6b11e1ae41f314)

随后在终局区块 `134740365`（2026-11-20 18:06:59 UTC，哈希 `0x50285b7205386d38b6bb4a562a38d660848e58410ffe2938c5009e1f233022d7`）对上述 70 个标的向 PancakeSwap v2 官方工厂分别查找 USDT、WBNB 池。工厂和池状态两阶段分别取得 140 条和 157 条成功读取。114 个查询没有交易对，26 个匹配，其中 3 个在该区块缺有效双边储备，23 个有储备的池归属不同标的，与原 43 个池互不重合。22 个 WBNB 池的计价侧储备合计为 `0.029680828327146985 WBNB`，GPROB 池为 `0.011570838899114576 USDT`。当时还有 47 个标的缺已核实的链上流动性数据。[V2 储备快照](../../src/data/instruments/bstocks-v2-reserves.json) · [PancakeSwap v2 工厂](https://bscscan.com/address/0xca143ce32fe78f1f7019d7d551a6402fc5350c73) · [BNB Chain 区块](https://bscscan.com/block/134740365)

V2 面板展示原始代币、计价资产储备、储备最近更新时间及终局区块。试算使用恒定乘积模型、0.25% 池费和整数舍入，求交易后储备比值变动不超过 +1% 或 −1% 的最大输入。购买侧展示支付的计价币，出售侧展示收到的计价币。实际成交取决于代币转账规则和当时的池状态，历史成交量仍需独立来源。面板以区块和池合约为证据。[PancakeSwap v2 SDK 1.2.4](https://www.npmjs.com/package/@pancakeswap/v2-sdk/v/1.2.4) · [V2 试算及校验](../../src/lib/bstocks-study.ts)

在 BNB Chain 终局区块 `134751421`（2026-11-20 19:29:55 UTC，19:30:00.388 UTC 读取）复查这 47 个标的的 PancakeSwap v3 池。USDT 和 WBNB 各查四档费率，共 376 个组合。340 个组合无登记池，33 个有登记池但该区块无活跃流动性，3 个有活跃流动性。AGPUB 和 IBMB 的 USDT 池通过 QuoterV2 双向试算，第三个池未通过双向核对。两池均为 1% 池费档位。面板沿用 v3 的模拟口径，按该区块的边际价计算买入至 +1% 的 USDT 支出、卖出至 −1% 的 USDT 收入，并附池和区块来源。两项新增均使用原有代币走势图。[V3 独立深度快照](../../src/data/instruments/bstocks-v3-depth-only.json) · [PancakeSwap v3 合约地址](https://developer.pancakeswap.finance/contracts/v3/addresses) · [BNB Chain 区块](https://bscscan.com/block/134751421)

| 标的 | 买到 +1% 的 USDT 输入 | 卖到 −1% 的 USDT 输出 |
|---|---:|---:|
| AGPUB | `0.000001024576775611` | `0.000001019415469382` |
| IBMB | `2.495328932646042918` | `2.482758711395184419` |

同批标的另查 Uniswap V3 的 USDT 和 WBNB 各四档费率，结果取自 BNB Chain 区块 `134750835` 和 `134751126`。376 个组合中 342 个无登记池，34 个登记池缺活跃流动性。当时覆盖 68 个标的，余下 45 个在该阶段已核查的场所、计价币和费率范围内缺可展示数据。[Uniswap V3 BNB 部署](https://developers.uniswap.org/docs/protocols/v3/deployments/v3-bnb-deployments) · [区块 134750835](https://bscscan.com/block/134750835) · [区块 134751126](https://bscscan.com/block/134751126)

在 BNB Chain 终局区块 `134778820`（哈希 `0x6e0077eeac71aec676590e2300f88280e7e9647e73154f362734021decaf10d5`）对上述 45 个标的补查 PancakeSwap v3 的 USD1、FDUSD 直接交易池，各计价币核对四档费率。360 个组合均返回空池地址。这个结论针对该工厂、区块、计价币和费率范围。[PancakeSwap v3 工厂](https://developer.pancakeswap.finance/contracts/v3/addresses) · [BNB Chain 区块](https://bscscan.com/block/134778820)

以当时仍缺链上数据的 45 个标的合约分三批查 PancakeSwap Explorer，取得 61 条匹配。随后在 BNB Chain 终局区块 `134779979`（2026-11-20 23:04:07 UTC，观测时间 23:04:10.635 UTC，哈希 `0x028e8b48c158b8aae2d98d8b1e86952e07a467452076b5c1fbb16c62ec20bfcf`）复核 20 个标的合约的 35 个稳定币直接计价 CL 池候选。13 个池有活跃流动性，其中一个使用钩子，12 个无钩子的 USDT 池双向试算均返回正值。报价核对完整输入，采用合约原始代币单位。[PancakeSwap Explorer 资料](https://github.com/pancakeswap/pancakeswap-ai/blob/main/packages/plugins/pancakeswap-driver/skills/liquidity-planner/references/data-providers.md) · [BNB Chain 区块](https://bscscan.com/block/134779979) · [Infinity 官方地址](https://developer.pancakeswap.finance/contracts/infinity/addresses) · [BNB 部署清单](https://github.com/pancakeswap/infinity-periphery/blob/main/script/config/bsc-mainnet.json)

NBISB、PLTRB、AVGOB 两侧都核验了达到池内边际价格 1% 变动的最小输入量。其他九个池展示支付 1 USDT 可收到的原始代币数量，以及卖出 0.01 个原始代币单位可收到的 USDT。各面板提供区块、池 ID 和合约来源，模拟结果取该区块状态。[CLQuoter](https://github.com/pancakeswap/infinity-periphery/blob/main/src/pool-cl/lens/CLQuoter.sol#L175-L192) · [边际价试算](https://github.com/pancakeswap/infinity-core/blob/main/src/pool-cl/libraries/SwapMath.sol#L50-L101)

| 标的 | 买到 +1% 支付的 USDT | 卖到 −1% 收到的 USDT |
|---|---:|---:|
| NBISB | `0.381106507907911005` | `0.07664167211079785` |
| PLTRB | `5.005916163781117334` | `0.452790805235458716` |
| AVGOB | `57.091574269727876085` | `7.459107883991700338` |

12 个池的 LP 费率为 76.9076%–94.9809%，协议费率两向均为 0.4%。以百万分率整数计算，交易总费率为 `LP + 协议费 − floor(LP × 协议费 / 1,000,000)`，折合 77%–95.001%。页面对这批池提示高额总费率。首轮接入对应的 12 个标的后，当时有 80 个标的取得可核实的链上流动性或报价数据。[协议费率规则](https://github.com/pancakeswap/infinity-core/blob/main/src/libraries/ProtocolFeeLibrary.sol) · [Infinity 报价快照](../../src/data/instruments/bstocks-infinity-quotes.json)

随后按相同合约重查首批 PancakeSwap Explorer 结果，取得 33 条匹配。三批中原未归类的 26 条记录共识别 9 个在已查直接计价范围内的候选池，分布在 5 个原缺数据的标的。区块 `134782313` 于 2026-11-20 23:21:37 UTC 出块，观测时间为 23:21:41.612 UTC，哈希为 `0x05a8c673f011835558081fb6051cbe666dd4b1f55bfba7347f304579b45d5b09`。DELLB 和 BBB 取得两侧完整输入的有效固定报价。ARMB 和 ADBEB 只有买侧有效，BEB 的 Bin 池两侧报价均失败。这次复查以固定输入读取，买入输入为 1 USDT，卖出输入为 0.01 个原始代币单位。[BNB Chain 区块](https://bscscan.com/block/134782313) · [Infinity BNB 部署](https://github.com/pancakeswap/infinity-periphery/blob/main/script/config/bsc-mainnet.json) · [CLQuoter](https://github.com/pancakeswap/infinity-periphery/blob/main/src/pool-cl/lens/CLQuoter.sol#L175-L192)

| 标的 | 支付 1 USDT 收到的原始代币 | 卖出 0.01 原始单位收到的 USDT | LP 费率 | 含协议费的总费率 |
|---|---:|---:|---:|---:|
| DELLB | `0.000017808568631013` | `0.049414958313246922` | 98.9964% | 99.0005% |
| BBB | `0.008661026793864560` | `0.009846961148101529` | 87.9618% | 88.0100% |

两项显示补采区块，首轮 12 项显示原区块。完成该次补采时，14 个 Infinity CL 标的中有 3 个 ±1% 边际价试算及 11 个固定输入报价。该阶段链上流动性或报价数据共覆盖 82 个标的，另有 31 个在当时核查范围内缺数据。[补采快照](../../src/data/instruments/bstocks-infinity-quotes-followup.json) · [协议费规则](https://github.com/pancakeswap/infinity-core/blob/main/src/libraries/ProtocolFeeLibrary.sol)

随后按原采样终局区块补核其余 11 个标的的双向边际价 ±1%。区块 `134779979` 核对 9 个，复核时间为 2026-11-21 00:24:20.266 UTC。区块 `134782313` 核对 2 个，复核时间为 00:24:40.345 UTC。每个方向均核对达到目标的最小完整输入，并确认少一个原始单位便达不到目标。14 个标的均有双向 ±1% 深度。原有固定输入金额和区块保留，边界证明缺失时可继续展示固定输入报价。两份快照 SHA-256 为 `5e1b97fc1178c2e4018d2e37f8b57d547c4ef22c9777643fd9dd00e9b5faeee0` 和 `e15c764e9ea0b7c2d5f38d13efe03dc798afa6e5f28308eaf68d366097c45e64`。[首批快照](../../src/data/instruments/bstocks-infinity-quotes.json) · [补采快照](../../src/data/instruments/bstocks-infinity-quotes-followup.json) · [CLQuoter 完整输入验证](https://github.com/pancakeswap/infinity-periphery/blob/main/src/pool-cl/lens/CLQuoter.sol#L175-L192)

### Uniswap v4 报价与深度

通过 OpenOcean 辅助定位剩余 31 个标的的候选池，报价由官方 Quoter 按 BNB Chain 终局区块读取。每池核对原始合约及 USDT 交易方向，买入输入为 1 USDT，卖出输入为 0.01 个原始代币单位。8 个来自区块 `134784374`，出块于 2026-11-20 23:37:05 UTC，观测时间为 23:37:08.190 UTC，哈希 `0x9fa15cf95a12df8a525348c6582f77786a2096f82ecc32946891e48d5fb2db26`。23 个来自区块 `134784767`，出块于 23:40:02 UTC，观测时间为 23:40:06.477 UTC，哈希 `0xd4126a44f2585bd1a23d6584d26b02116eed34b34e5d425cc200960a4231876b`。[Uniswap v4 BNB Chain 部署](https://developers.uniswap.org/docs/protocols/v4/deployments#bnb-smart-chain-56) · [Quoter 完整输入验证](https://github.com/Uniswap/v4-periphery/blob/main/src/base/BaseV4Quoter.sol#L33-L50) · [区块 134784374](https://bscscan.com/block/134784374) · [区块 134784767](https://bscscan.com/block/134784767)

同一区块的归档 RPC 已核实 30 个标的的双向边际价 ±1% 输入。29 个的两个方向均在首次位图查询的价段内，ARMB 的卖侧越过一个未初始化的位图边界后继续试算。每个方向核对达到目标的最小完整输入，并确认少一个原始单位便达不到目标。USDEB 至少一个方向先进入零活跃流动性，页面显示其双向固定输入报价。两向协议费均为 0.1%，按输入扣除后再计 LP 费。合计费率为 1.9782%–88.0120%，31 个池中 19 个达到或超过 50%。[边际价格计算](https://github.com/Uniswap/v4-core/blob/main/src/libraries/SwapMath.sol#L49-L90) · [位图查询](https://github.com/Uniswap/v4-core/blob/main/src/libraries/TickBitmap.sol) · [跨边界状态更新](https://github.com/Uniswap/v4-core/blob/main/src/libraries/Pool.sol#L409-L435) · [协议费规则](https://github.com/Uniswap/v4-core/blob/main/src/libraries/ProtocolFeeLibrary.sol#L29-L39)

独立对照源结果的归一化校验发现，WDCB 的固定输入报价在转录时买卖方向互换。按原始方向修正为支付 1 USDT 收到 `0.000382794558942960 WDCB`，卖出 0.01 WDCB 收到 `1.037264631477089513 USDT`。复核确认两批 31 个固定报价和 30 个 ±1% 边界均与源记录一致。快照 SHA-256 为 `6562c05b5adcd50e6ee56c39afbfb14a90e5a5b83e1df7d2dc55f90f8a6db02b`。本轮更新后 113 个标的均有至少一种已核实的链上流动性或区块报价，随面板保留场所、区块及试算口径。[Uniswap v4 报价快照](../../src/data/instruments/bstocks-uniswap-v4-quotes.json) · [报价方向及缺值测试](../../src/lib/bstocks-study.test.mjs)

同一快照中，不同标的合约复用池地址或池 ID 时，V2、V3、Infinity CL 和 Uniswap v4 的冲突条目按缺失处理。Infinity CL 和 Uniswap v4 还各自核对同场所快照之间的池 ID 归属。Uniswap v4 的边界证明须匹配采样区块及指定归档来源，边界缺值时可沿用校验通过的固定输入报价。回归用例核对冲突条目缺值及无关条目独立可读。[快照校验](../../src/lib/bstocks-study.ts) · [重复池回归用例](../../src/lib/bstocks-study.test.mjs)

### AAPLB 与 SNXXB 补充深度

两项均保留原有 Metric 数据，并按各自场所、计价币及终局区块新增双向 ±1% 深度。每个方向核对最小完整输入，验证少一个原始单位时仍在原阈值内。

| 标的与池 | 买入至 +1% 支付 | 卖出至 −1% 收到 | 费率 | BNB Chain 终局区块与观测时间 |
|---|---:|---:|---|---|
| AAPLB · PancakeSwap v3 | `304.407748155524647306 USDT` | `257.763487718438641462 USDT` | LP 0.01% | [134791428](https://bscscan.com/block/134791428)，2026-11-21 00:30:00 UTC 出块，00:30:03.583 UTC 观测 |
| SNXXB · Uniswap v4 | `0.000069089389859405 ETH` | `0.000067285285189624 ETH` | LP 3%，合计 3.097% | [134792232](https://bscscan.com/block/134792232)，2026-11-21 00:36:02 UTC 出块，00:37:24.858 UTC 观测 |

AAPLB 池合约为 `0x0905edec2928b701fb6c6354e4eee4960895a82f`。区块哈希为 `0x04286703fc080a4a7b8f8af9b77e08614766bf13ab491ca81a64ed135ef50353`，快照 SHA-256 为 `abfa268fc53374a76760b954fab861360273acd91e04ec7f5a72974893a982d2`。[PancakeSwap v3 部署](https://developer.pancakeswap.finance/contracts/v3/addresses) · [AAPLB 池合约](https://bscscan.com/address/0x0905edec2928b701fb6c6354e4eee4960895a82f) · [AAPLB 深度快照](../../src/data/instruments/bstocks-v3-depth-only.json)

SNXXB 池 ID 为 `0x372005ec1edb74181486915b392f91baa03d6d680ac74417564e508acc04a354`，金额按池内 ETH 报价代币计，对应 BNB Chain 上的 ERC-20 合约 `0x2170ed0880ac9a755fd29b2688956bd959f933f8`。区块哈希为 `0x402b0743bef6058e3f22465ca4b1869f5797f09966b87f0f48fd05fdc534c5c7`，快照 SHA-256 为 `91a77aa3091fe1ad755f5054e4a625d8d33ecd0b6c1290b72a029794d6fe905b`。[Uniswap v4 BNB Chain 部署](https://developers.uniswap.org/docs/protocols/v4/deployments#bnb-smart-chain-56) · [ETH 计价币合约](https://bscscan.com/token/0x2170ed0880ac9a755fd29b2688956bd959f933f8) · [SNXXB 深度快照](../../src/data/instruments/bstocks-uniswap-v4-eth-depth.json)

两项应用后，113 个标的均有至少一种已核实的链上流动性或报价。按标的去重，87 个有已核实的双向 ±1% 深度，23 个有 PancakeSwap v2 储备模型，共 110 个。DRAMB 和 MUB 目前有 Metric 分档深度，USDEB 有双向固定输入报价。页面保留各池计价币、费率和区块。

## 三项试点

- **CRCLB / CRCL** 有 162 根代币日线。底层 2026 年三季度营收 $864,888,000、营业利润 $208,334,000、净利润 $226,024,000，储备收入与其他营收独立显示。前九个月累计营收 $2,260,336,000、营业利润 $287,695,000、净利润 $329,498,000、摊薄每股收益 $1.23、经营现金流 $522,978,000。第二季度原披露的 $701,315,000 营收与后续季度补充的净利润分别保留出处。[Circle 第三季度 10-Q](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000311/crcl-20260930.htm) · [Circle 第二季度 10-Q](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000248/0001876042-26-000248-index.htm)
- **MUUB / MUU** 有 121 根代币日线。2026-11-19 基金净值 $13.39，发行方美东 16:00 市场中间价 $13.37，费前日目标为两倍。底层基金于 7 月 15 日开盘前实施 1 拆 20，代币于 7 月 22 日上线。按本站相同配置打开 TradingView 的 `NASDAQ:MUU` 日线图，供应商返回 Cboe One 延迟行情。已用图表公开的 7 月 14 日与 15 日收盘数据核实该次拆股已反映在走势中。三语图表显示这次核验及发行方公告，本地数值序列仍待导入。[Direxion 基金页](https://www.direxion.com/product/daily-mu-bull-and-bear-leveraged-single-stock-etfs) · [拆股公告](https://www.direxion.com/press-release/direxion-to-split-nine-etfs) · [MUU 图表](https://www.tradingview.com/symbols/NASDAQ-MUU/) · [MUUB 上线公告](https://www.binance.com/en/support/announcement/detail/ea42cf41150f4e9ab7f1631fa21bba1e)
- **ANTB / ANT** 当前有一根已收盘代币日线。底层财务数据来自 424B4 的未经审计前九个月中期报表，保留前一年同期和公允价值变动。均线、RSI 和回撤按样本可用性显示。[Anthropic 招股书](https://www.sec.gov/Archives/edgar/data/2130357/000162828026074944/anthropicpbc-424b4.htm) · [ANTB 上线公告](https://www.binance.com/en/support/announcement/detail/830c320848af4257812d5b6e99e031f9)

## 财报期间与计算

财务指标按同一 CIK、起止日期、指标和币种保留，数据链接跟随所用披露。报告覆盖同一会计期间时按指标补齐，已核实的发行方原文披露优先。TTM 使用同一发行主体、XBRL 标签和币种的四个连续财季，或按上一完整财年加本财年累计、减上财年同期累计。页面展示每项输入的日期、数值和对应报表。Tesla 截至 2026-09-30 的 TTM 营收以 `us-gaap:Revenues` 计算，$94.827B + $78.669B − $69.926B = **$103.570B**，覆盖 2025-10-01 至 2026-09-30。[Tesla 2025 10-K](https://www.sec.gov/Archives/edgar/data/1318605/000162828026003952/0001628280-26-003952-index.htm) · [Tesla 2026 第三季度 10-Q](https://www.sec.gov/Archives/edgar/data/1318605/000162828026066775/0001628280-26-066775-index.htm)

人工核实的未经审计 8-K 初步数据，在同一 CIK 后续申报正式 10-K 或 10-Q 后按指标复核。接替值须来自同一 CIK 的规范 SEC 申报链接及对应的 US GAAP XBRL 标签，且期间类别、起止日、指标和单位完全一致。全年指标以正式 10-K 系列为准。合并时保留其他指标的原始来源以及最新财务期间的顺序。回归样例中，旧规则在正式报表抵达后仍保留初步值。修复后使用模拟年报和季报核对了接替条件、期间顺序及来源。用相同输入重算当前 90 个 SEC 标的，其中 9 个同时有人工核实财报，修复前后的合并结果一致。两家新增 8-K 所涉期间尚未导入后续正式报表。[财务合并规则](../../src/lib/bstocks-study.ts) · [合并回归用例](../../src/lib/bstocks-study.test.mjs)

CBRSB 对应 Nasdaq 上市的 Cerebras Class A 普通股，已补齐 13 条标准化财报记录，身份和当期披露以 2026 年第三季度 10-Q 核实。SKHYB 以正式 6-K 提供 2026 年第三季度及前九个月两组韩元财务值，利润按合并净利润标明，每股收益采用摊薄普通股口径，经营现金流仅列前九个月累计值。[Cerebras 10-Q](https://www.sec.gov/Archives/edgar/data/2021728/000162828026073494/cbrs-20260930.htm) · [SK hynix 6-K](https://www.sec.gov/Archives/edgar/data/2120882/000119312526461909/d166755d6k.htm)

剩余 19 个标的新增了基础披露。6 家公司由 SEC 数据补充 69 条标准化记录，BSPB 从 6-K 提取 2026 年第三季度及前九个月两组未经审计的美元数据。另增 11 份基金资料和 BOTB 的封闭式基金资料。BOTB 披露的 2026-10-31 净值为每股 11.80 美元。各基金净值分别注明各自的观察日。UVXYB 的原资产日目标为短期 VIX 期货指数的 +1.5 倍。SNXXB 采用报告期实际年化费率 1.54%，1.49% 对应前瞻费率口径。[BSP 6-K](https://www.sec.gov/Archives/edgar/data/2004711/000200471126000027/bsp_ex99-2.htm) · [BOTB 基金披露](https://www.sec.gov/Archives/edgar/data/2081119/000121390026120960/ea0312533-02_424b3.htm) · [UVXY 发行方资料](https://www.proshares.com/our-etfs/strategic/uvxy) · [SNXX 定期报告](https://www.sec.gov/Archives/edgar/data/1587982/000139834426018035/fp0100996-1_ncsrixbrl.htm)

原分组摘要已按挂牌情况更新。QNT、AGPU、SHAZ、BOT 在 Nasdaq 挂牌，SECZ 在 NYSE 挂牌。bStock 与原资产的价格比较需对齐观测时点、币种和当时有效的换算比例。历史研究通过原分组访问。[Nasdaq 挂牌名录](https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt) · [其他交易所名录](https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt)

本轮由四份 SEC 6-K 和两份 8-K 附件补齐六个标的的财务披露，逐项核对 12 个报告期间、55 个数值。NUB、TSMB、NBISB、ASMLB 取 2026 年第三季度及年初至今数据，NVDAB 和 AMATB 各用其财年期间。六个标的同时提供既有财报记录，收入和净利润的 TTM 仍缺满足同口径计算条件的输入。

- **NUB / NU** 采用 11 月 12 日提交的未经审计合并报表，单位为 USD，保留合并净利润和摊薄每股收益。[Nu Holdings 6-K](https://www.sec.gov/Archives/edgar/data/1691493/000129281426005272/nufs3q26_6k.htm)
- **TSMB / TSM** 采用 11 月 13 日提交的未经审计合并报表，单位为 TWD，每股收益按摊薄普通股计。[台积电 6-K](https://www.sec.gov/Archives/edgar/data/1046179/000104617926000801/a2026q3consolidatedreport-.htm)
- **NBISB / NBIS** 采用 11 月 12 日同日较晚提交的 6-K 附件，保留集团未经审计合并报表的 USD 口径，经营现金流仅列年初至今。[Nebius 6-K 附件](https://www.sec.gov/Archives/edgar/data/1513845/000110465926126238/nbis-ex99d2.htm)
- **ASMLB / ASML** 采用 10 月 14 日提交的未经审计合并报表，按美国 GAAP，以 EUR 披露，每股收益按摊薄普通股计。该财季为 6 月 29 日至 9 月 27 日，其余三个标的的本季为 7 月 1 日至 9 月 30 日。[ASML 6-K 财务报表](https://www.sec.gov/Archives/edgar/data/937966/000162828026065813/financial_statementsxusx.htm)
- **NVDAB / NVDA** 采用 11 月 17 日提交的 8-K 附件，取 2027 财年第三季度和财年初至今的未经审计 GAAP 数据，以 USD 披露。两个期间分别起于 2026 年 7 月 27 日和 1 月 26 日，均截至 10 月 25 日。[NVIDIA 8-K 财报附件](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000088/q3fy27pr.htm)
- **AMATB / AMAT** 采用 11 月 12 日提交的 8-K 附件，取 2026 财年第四季度和全年的未经审计 GAAP 数据，以 USD 披露。两个期间分别起于 2026 年 7 月 27 日和 2025 年 10 月 27 日，均截至 2026 年 10 月 25 日。[Applied Materials 8-K 财报附件](https://www.sec.gov/Archives/edgar/data/6951/000162828026073360/exhibit991q42026earningsre.htm)

## 更新与复核

链上深度采集以 `curl` 通过 BNB Chain 公共 RPC 发出只读请求，每组 Multicall3 调用由单个 `eth_call` 承载。脚本核验 Multicall3 的运行时代码哈希及池的工厂登记，同一快照的读取固定在一个最终区块，写入前复核区块身份。取得有效记录后原子替换指定文件。全轮失败或区块校验失败时保留目标文件，局部缺失会列出标的。v3 采集在原 Node RPC 路径失败后改用 `curl`。Metric 曾有一次临时响应异常，经诊断核对后重取通过。三条采集命令均已实跑成功，标准构建使用采集后的静态快照。[采集脚本](../../scripts/capture-bstocks-dex-depth.mjs) · [Multicall3 合约](https://bscscan.com/address/0xcA11bde05977b3631167028862bE2a173976CA11#code)

```bash
pnpm exec node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/capture-bstocks-dex-depth.mjs --out /tmp/bstocks-dex-depth.json
pnpm exec node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/capture-bstocks-dex-depth.mjs --method metric --out /tmp/bstocks-metric-depth.json
pnpm exec node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/capture-bstocks-dex-depth.mjs --quote WBNB --out /tmp/bstocks-wbnb-depth.json
```

USDT v3、Metric 与 WBNB 快照的 SHA-256 依次为 `4e81ec2b46d36bdb800cb5b5ef366db57fbab62b3e0898c68f188d0772233e86`、`38bb9265ee8e97d14b9720dd4ffb794c6b6bb874a7b71d6aebeb114bbaaaadd2`、`093a06397421539db3fc8225a37e4a6baf3ddadae3f3f7279adbf188ced7842e`。更新时按各快照核对计价币、区块、场所和覆盖。

显示单位采集复用终局区块和 Multicall3 核验。所有目录匹配和系数校验通过后写入 `--out` 指定的快照。此次命令实跑验证 113 个标的。[显示单位采集](../../scripts/capture-bstocks-display-units.mjs)

```bash
pnpm exec node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/capture-bstocks-display-units.mjs --out /tmp/bstocks-display-units.json
```

`scripts/capture-bstocks-market.mjs` 和 `scripts/capture-bstocks-sec.mjs` 把来源读取到指定的候选 JSON 文件。市场采集支持 `--pilots` 仅取三项试点。`pnpm sync:bstocks --market <文件> --sec <文件>` 验证候选文件，再更新本地市场数据和可公开溯源的 SEC 事实。市场数据存入已由 Git 忽略的 `.generated/bstocks-study.json`。后续公开使用 Binance Vision 历史数据需以其授权条款为准。[数据条款](https://github.com/binance/binance-public-data/blob/master/TERMS_AND_CONDITIONS.md) · [EDGAR 数据接口](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

Binance Spot 的行情专用域名公开列出无需 API key 的 `GET /api/v3/depth`。Spot 开发文档将产品使用指向平台通用条款。截至 2026-11-20，已查官方页面中尚未找到可用于本站含广告页面的盘口展示授权或官方托管盘口组件。本地盘口的覆盖范围见上表。[公开行情接口清单](https://developers.binance.com/en/docs/products/spot/faqs/market_data_only) · [Spot 产品条款](https://developers.binance.com/en/docs/products/spot/PROD-TERMS-OF-USE)

11:20:46 UTC 的 SEC 采样写入 90 个有效代码映射，78 个有结构化财务值。该次采样新增 BNCB、FWDIB 的财务值。SKHYB 后续采用 6-K，BOTB 采用封闭式基金披露，Anthropic 采用 424B4 的前九个月数据。

`pnpm sync:bstocks --underlying <文件>` 接受形如 `{ "rows": { "CRCLB": { "history": { ... }, "premium": { ... } } } }` 的输入。`history` 接受精确代码、交易所、观测时间、币种、HTTPS 来源、明确的 `split` 或 `split-and-dividend` 口径，以及按日递增的 `day`、`adjustedClose` 和可选 `volume`。附加 `--dry-run` 可以先运行完整校验。输入身份、时间或口径不合格时保留现有文件。[TradingView 嵌入](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/)

`premium` 分别提供 `token`、`equity`、`fx` 和 `ratio`，并为每项注明 HTTPS 来源。分母采用常规交易时段未复权的 USD 收盘价乘以 `ratio.sharesPerToken`。该字段记录每个 `token.price` 报价单位实际对应的原资产份额。撮合口径可提供三个同一时点的报价，或以 `basis: "period-end"` 为代币和 USDT/USD 各提供一个 `bucket`，包含 `start`、`end`、`closed: true`。两个区间均须是原资产正式收盘前最后一分钟，含起点、不含终点。比例须覆盖计算窗口。页面显示区间边界，保留每项输入的来源。[Binance 现货分钟行情](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market)

发行方将有效证书余额定义为基础代币数量乘以调整乘数。报价单位经交易场所文件核实为有效证书，且发行条款给出观察时段每份证书对应的原资产份额时，`sharesPerToken` 可直接采用该份额。报价单位经证实为基础代币时，再按生效乘数换算。Binance 的 SNDKB 复牌公告提供了该交易对采用拆股调整后报价单位的证据。IBM 的 ADGM 企业行动披露则可用于核实基础代币余额的乘数变化，交易场所报价单位仍须对应证据。[发行方 FAQ](https://www.bstocks.finance/faq) · [Binance bStocks FAQ](https://www.binance.com/en-AE/support/faq/detail/f0c03cd6509a4085b4cce1636f16be38) · [SNDKB 复牌公告](https://www.binance.com/en/support/announcement/detail/ec32e6657ae341b3b57f1b154c330c6d) · [IBM 企业行动披露](https://www.adgm.com/globalassets/market-disclosure/content/disclosure/disclosure-on-corporate-action-affecting-ibm-bstocks_11_10_2026_07-14-27.pdf)

ANTB 首日以 Nasdaq 独立可查的常规交易收盘为基准。2026-11-19 的最后一分钟为 20:59 至 21:00 UTC，含起点、不含终点。Binance Vision 有该分钟的 ANTB/USDT 归档，Kraken 的 `/0/public/Trades` 回传跨过窗口终点的 USDT/USD 成交记录，其中 11 笔落在窗口内。公开计算仍需该时段可回溯的实际报价单位与有效凭证对应关系，以及行情公开展示和衍生结果所需的授权。[Kraken 成交接口](https://docs.kraken.com/api-reference/market-data/get-recent-trades) · [Kraken 使用说明](https://docs-legacy.kraken.com/api/docs/guides/global-intro/#notices) · [Binance Vision 条款](https://github.com/binance/binance-public-data/blob/master/TERMS_AND_CONDITIONS.md) · [Nasdaq 法律条款](https://www.nasdaq.com/legal)

CRCLB 在区块 `134714325`（14:51:36 UTC）的 `uiMultiplier` 为 `10^18`。发行条款规定一份有效证书对应一股原资产，这个区块的换算比例核实为 1:1。该证据只涵盖该区块。此次 Pyth BNB Core 核查所得最后发布日为 CRCL 7 月 28 日、AAPL 6 月 18 日，当前仍缺可授权公开展示且与代币同一时点的底层价格。链上数据的使用和公开展示范围须核对 Douro 条款 §1.4(q) 和 §2.1。精确溢折价仍缺可公开展示的同口径输入。[CRCLB 发行文件](https://www.adgm.com/globalassets/market-disclosure/content/prospectus/btech-holdings-prospectus----11-june---circle-internet-group-bstocks_06_11_2026_16-36-41.pdf) · [BNB Chain 区块](https://bscscan.com/block/134714325) · [Douro 条款](https://www.dourolabs.xyz/Subscription-Terms.pdf)

已有有效复权序列时，新序列须保有至少同样多的有效收盘日，且最新收盘日不能早于原记录。首个有效短序列可以导入，后续符合覆盖要求的滚动数据整组替换。CLI 回归验证旧 5 日样例、尾日更早的 250 日样例和尾日更新的 249 日样例均无法覆盖现有 250 日序列，并验证新复权口径下的 250 日序列可完整换版。

## 可选的复权行情来源

Twelve Data 的采集入口按显式指定的 bStock 代码和日期读取 `time_series` 的 `1day` 和 `adjust=all`。响应需匹配原资产代码、USD 和已核实交易所的 MIC。官方归属为 Cboe BZX 的 DRAM 在供应商目录中返回 XASE，这一绑定会被拒绝。鉴权只从环境变量 `TWELVE_DATA_API_KEY` 读取，通过 HTTP 请求头传递。采集结果写入指定候选文件，静态构建使用已通过导入的本地数据。[Twelve Data 行情接口](https://twelvedata.com/docs#time-series) · [Twelve Data 鉴权说明](https://twelvedata.com/docs/introduction/libraries)

```bash
TWELVE_DATA_API_KEY=demo node scripts/capture-bstocks-twelve-data.mjs --ticker AAPLB --from 2025-11-20 --to 2026-11-19 --out /tmp/AAPLB.json
pnpm sync:bstocks --underlying /tmp/AAPLB.json --dry-run
```

早期 demo 取得 5 根跨 2020 年 8 月拆股的 AAPL 日线。最新共享 demo 获取 AAPLB 对应的 Nasdaq AAPL 复权日线 251 根，窗口为 2025-11-20 至 2026-11-19，口径为拆股及股息复权。导入器 dry-run 通过 1 个标的，现有读取口径保留 2025-11-21 起最近 250 根。用同一临时样本调用 `getBstockStudy` 与 `BstocksStudyView`，中英日均在内存中渲染了来源、窗口、走势图和指标。MA20、MA50、MA200、RSI14 与区间回撤均与独立计算一致。常规快照的 SHA-256 在评估前后相同。

CRCL 用同一共享 demo 请求时返回 HTTP 401，供应商说明这项凭证用于初步熟悉接口。接口评估、个人或内部使用、面向公众展示适用各自的许可范围。公开使用需确认订阅覆盖拟使用的数据、展示方式和衍生结果。当前本地导入的原资产复权序列与可展示的溢折价各为 0 条。[Twelve Data 鉴权说明](https://twelvedata.com/docs/introduction/libraries) · [个人与商用说明](https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage) · [Twelve Data 条款第 3.1(e) 节](https://twelvedata.com/terms)

Marilux 目录列有 NYSE:CRCL 的 368 日历史、NASDAQ:MUU 的 529 日历史和 NASDAQ:ANT 的 1 日历史。CRCL 与 ANT 均截至 2026-11-19，MUU 截至 2026-11-18。本次核对到目录覆盖和匿名 API 请求的 Cloudflare 1010（HTTP 403）。正式接入按文档使用账户与 API 鉴权，实盘日线尚未采集。API 的 `adjusted=true` 只处理拆股。需要拆股和股息复权时，可用标有 `Split & dividend` 且仅含常规交易时段的 CSV，或按官方 `qfq` 复权因子处理。条款允许约定范围内的内部研究与无法还原原始数据的聚合用途，公开展示原始日线须另获授权。[CRCL 目录](https://marilux.dev/en/data/CRCL) · [MUU 目录](https://marilux.dev/en/data/MUU) · [ANT 目录](https://marilux.dev/en/data/ANT) · [股票接口文档](https://marilux.dev/en/docs/stocks) · [Marilux 条款](https://marilux.dev/en/terms)

另核对了几个底层价格来源。Chainlink Data Streams 列有 CRCL 和 AAPL，CRCL REST 未鉴权实测返回未授权，接口文档要求 HMAC。美股流式报告的 `mid` 是买卖报价中间价，官方收盘成交需另核。Roundhill 的 DRAM 页面分列基金净值和 Market Price。11 月 19 日的 Market Price 对应 21:00 UTC 的正式收盘字段，站点条款对商业使用与再分发要求书面许可。[Chainlink 美股报告](https://docs.chain.link/data-streams/rwa-streams/us-equities) · [REST 鉴权文档](https://docs.chain.link/data-streams/reference/data-streams-api/interface-api) · [Roundhill DRAM](https://www.roundhillinvestments.com/etf/dram/) · [Roundhill 条款](https://www.roundhillinvestments.com/legal)

Cboe 提供 ETP 日终收盘字段规范，2026-09-01 版行情政策第 6、7、15 节涵盖日终及衍生数据的使用与分发条件。本轮核验记录的是字段及权限状态。DRAM 精确溢折价仍缺适用于公开展示的底层输入及同窗口的代币、汇率配对。[Cboe ETP 日终规范](https://www.cboe.com/document/tech-spec/document/technical-specifications/cboe-end-of-day-etp-key-values-specification/) · [Cboe 行情政策](https://cdn.cboe.com/resources/membership/Market_Data_Policies.pdf)

IEX HIST 条款说明其数据归属、注明来源及分发条件，历史数据覆盖 IEX 场内行情与成交。实测历史文件列表返回 HTTP 403，公布的云存储目录匿名请求返回 HTTP 401。IEX TOPS 的 `X` 类官方收盘消息只适用于该交易所的挂牌证券，IEX 场内成交缺少本站候选所需的主挂牌交易所官方收盘证据，例如 CRCL 的 NYSE 收盘及 ANT、MUU 的 Nasdaq 收盘。[IEX HIST 条款](https://www.iex.io/legal/hist-data-terms) · [IEX 历史数据入口](https://iextrading.com/trading/market-data/#hist-download) · [IEX TOPS 消息规范](https://storage.googleapis.com/assets-bucket/exchange/assets/IEX%20TOPS%20Specification%20v1.66.pdf)

Databento 的 `EQUS.SUMMARY` 请求 CRCL、MUU、ANT 在 2026-11-19 的 `statistics` 数据，匿名访问返回 HTTP 401。Nasdaq NLS+ 规范把 `consClose` 定义为最后一笔符合条件的综合市场成交，日统计单列盘后成交量，发布时间为美东 16:15 和 17:00。正式收盘撮合按主挂牌市场的原始事件时间取值。Databento 的 `XNYS.PILLAR` 提供 NYSE 收盘竞价的字段映射，取得合格样本及公开使用仍需核对数据权限。[EQUS.SUMMARY](https://databento.com/docs/datasets/equs-summary) · [Nasdaq NLS+ 规范 §7.4–7.5](https://assets.ctfassets.net/mx0rke14e5yt/3F4zpiSeLrsQwFMYdyALEM/21a5445c96c44e1641079602aecc4313/NLS4.0_02132026.pdf) · [XNYS.PILLAR](https://databento.com/docs/datasets/xnys-pillar) · [Databento 条款](https://databento.com/legal/terms-of-use)

Finazon 的 US Stocks Essential 接口用 `1d` 及 `adjust=all` 请求 CRCL 时返回 HTTP 401，提示订阅。接口把 `close` 定义为所选区间的末笔价格，主挂牌市场的正式收盘事件还需独立对齐。产品目录列出商用展示及再分发选项，具体数据集和展示范围以书面约定及适用条款为准。[数据集目录](https://finazon.io/dataset/us_stocks_essential) · [接口说明](https://finazon.io/dataset/us_stocks_essential/docs/api/latest) · [Finazon 条款](https://finazon.io/terms)

Direxion 的 MUU 页面分别列出基金净值和市价。市价收益按美东 16:00 的买卖报价中间值计算，正式收盘成交价需要对应的市场记录。此次未核实一份可公开使用、能回溯该正式收盘事件的历史导出。[Direxion MUU](https://www.direxion.com/product/daily-mu-bull-and-bear-leveraged-single-stock-etfs) · [Direxion 条款](https://www.direxion.com/legal)

Nasdaq 免费 FTP 的再分发许可适用于相应名录文件及挂牌字段。Nasdaq Official Closing Price（NOCP）的月度历史文件通过需登录的渠道提供，仍需取得该数据产品的访问和展示许可。[Nasdaq 规则公告](https://www.govinfo.gov/content/pkg/FR-2026-08-07/pdf/2026-16097.pdf) · [Nasdaq FTP 目录说明](https://www.nasdaqtrader.com/Trader.aspx?id=FD)

Circle 投资者页面使用 Q4 股票行情。匿名调用历史行情接口取 CRCL 时返回 HTTP 400，接入需按 Q4 的要求取得接口密钥及相应展示许可。QUODD 提供历史日终行情，接口和公开展示适用订阅与使用条款。当前尚未核实 QUODD 日终字段对应主挂牌市场的正式收盘成交。[Circle 股票信息](https://investor.circle.com/stock-info/) · [Q4 历史行情接口](https://studioapi.q4inc.com/adhc/getstockquotehistoricallist) · [Q4 使用条款](https://www.q4inc.com/maindisclaimer) · [QUODD 历史行情](https://www.quodd.com/historical-stock-prices-api-global-market-data) · [QUODD API](https://developer.quodd.com/docs/rest-api/) · [QUODD 使用条款 §3–5](https://www.quodd.com/terms-of-use)

Intrinio 的 CRCL 日终行情和 Alpaca 的 MUU 历史行情匿名请求均返回 HTTP 401。Intrinio 日线须按数据集核实常规交易时段及主挂牌市场的正式收盘。Alpaca 的行情源区分 IEX 和 SIP，需另核实际采用的主挂牌市场收盘记录。两家的公开展示和再分发仍须核对相应产品权限和书面许可。现阶段两项均未提供可用于本站精确溢折价的完整输入。[Intrinio 股票历史接口](https://docs.intrinio.com/documentation/web_api/GetSecurityStockPrices_v2) · [Intrinio 日终行情说明](https://help.intrinio.com/eod-market-data-faqs) · [Intrinio 使用许可](https://help.intrinio.com/licensing-data-usage-requirements) · [Alpaca 行情说明](https://docs.alpaca.markets/us/docs/market-data-faq) · [Alpaca 再分发说明](https://alpaca.markets/support/redistribute-alpaca-api)

CRCL 参考看板列明 Yahoo Finance 历史日线，并给报价标注 Nasdaq。CRCL 的挂牌身份已按 NYSE 独立核对。参考看板的公开部分缺少可核的价格导出、复权方法、报价场所和时点及再展示许可。Yahoo 使用条款限制相关商业使用及再分发。本站的正式收盘输入、可计算复权序列及精确溢折价仍待补充。[CRCL 参考看板](https://crcl.seanzhao.ai/) · [Yahoo 使用条款](https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html)

## 验收结果

基础版用 10 个标的、三种语言及 390、1440 px 两种宽度完成 60 组布局、披露和展开交互验证。复权数值导入及溢折价测试使用临时样例。第三方托管图响应以单独的实际样本核验为准。

前一轮通过 33 项定向测试和 240 个三语真实路由服务端渲染场景。每语核对 113 个合约、88 个公司披露、25 个基金资料、43 个 GeckoTerminal 池图及对应深度，以及另外 70 个标的的缺失状态。USDT 与 WBNB 快照金额、区块和来源链接与导出一致，Binance 盘口单独展示。四个股票列表入口、1,017 条语言对应链接以及 15 个详情和三个发行方页面的分组摘要均通过核验。

此前通过 42 项定向测试。独立服务端渲染和静态读回各核对 339 个股票详情，每个语言版本有 113 个显示系数，其中 82 个为 1，31 个为其他值。每语核对了五份发行文件及当时的 43 个链上池引用。本地复权序列与溢折价的缺值提示、原资产托管图配置和条件式 ADJ 提示通过检查。采集失败测试覆盖目录身份、ABI 数据和区块核验。

v2 储备面板接入时通过 43 项股票定向测试，70 个原缺 DEX 图的标的在无本地行情时通过三语服务端渲染核验。23 个新池的 46 个试算方向均与独立整数计算一致。

接入独立 v3 深度时，使用本地采样缓存读回 339 个新导出的股票详情。每语核对 113 个本地日线图和原资产图绑定、43 个 GeckoTerminal 池图、23 个独立 v2 储备面板、两项新增 v3 深度面板的池和区块链接及全部原始 USDT 金额、45 项链上流动性缺值，以及 113 项精确溢折价缺值。

接入招股文件时，44 项股票定向测试通过。339 个静态股票详情每语核对了 113 份主招股文件及核准日、3 份补充文件、当时已核实的 8 项凭证条款和 113 项精确溢折价缺值。

本轮扩展至 112 项后，44 项股票定向测试、类型检查及定向 ESLint 通过。339 个三语服务端渲染场景和 339 个静态详情均核对了原始文件、112 项凭证条款、BRKBB 与 MELIB 的页码与标的、ASMLB 的凭证单位缺值及各标的的精确溢折价缺值。回归用例确认新补充文件未纳入核验时，文件链接仍可访问，凭证条款暂缺。股票行情和走势图的读取口径沿用已有实现。整站检查见[市场页实施记录](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)。

SNDKB 和 MUB 的时间线通过 44 项股票定向测试和 339 个三语详情的服务端渲染核验。339 个新导出的股票详情每语核对了这两个面板的原始来源、时间、区块和完整显示乘数。MUB 的表述明确链上持有者的再投资方式。每语 113 项精确溢折价仍为缺值。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

早先补齐四份 6-K 时读回 12 个三语静态详情。每语核对当时新增的 8 个报告窗口、35 个数值、币种和每股收益口径，以及 SEC 原文链接、既有年度记录和 TTM 缺值。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

本轮读回六个标的的 18 个三语静态详情，每语核对 12 个报告期间、55 个数值、币种、SEC 来源及既有财报。AMATB 的全年标明未经审计，六个标的的收入和净利润 TTM 保持缺值。全量 388 项测试通过。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

技术指标外链通过 45 项股票定向测试、类型检查和定向 ESLint。339 个三语详情的服务端渲染核对了 18 个指标页链接及其交易所、标的和语言地址。

首轮接入 Infinity CL 后通过 49 项股票定向测试。339 个三语详情的服务端渲染及静态导出均核对 36 个 Infinity CL 面板，其中 9 个为边际价 ±1% 试算，27 个为固定输入报价。静态详情同时核对 18 个 TradingView 指标页链接和每语 113 项精确溢折价缺值。独立复核覆盖 12 组固定报价、池 ID、费率、三个池的六个方向边界，以及重复校验相关的 76 条现有快照记录和 9 个用例。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

加入 DELLB 和 BBB 后，通过 50 项股票定向测试、类型检查及定向 ESLint。339 个三语详情的服务端渲染及静态导出均核对 42 个 Infinity CL 面板，其中 9 个为边际价 ±1% 试算，33 个为固定输入报价。首轮 36 个面板及补采 6 个面板各自匹配原始区块。两份快照间的冲突标识按缺值处理，无关条目可独立读取。独立复核按池参数重算了全部 14 个 Infinity CL 池 ID。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

接入 Uniswap v4 和首批 Binance 原资产行情组件后，51 项股票定向测试通过。339 个三语详情的服务端渲染和静态导出核对了 90 个 v4 ±1% 面板、3 个固定输入面板、42 个 Infinity CL 面板和 18 个 TradingView 技术指标链接。每语 8 个早批面板和 23 个晚批面板分别匹配采集区块。该轮初始导出共 9 个原资产组件入口，339 个页面均未预载组件脚本或 `iframe`。每语 113 项精确溢折价仍为缺值。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

扩大原资产行情及深度覆盖后，52 项股票定向测试通过。339 个三语详情的服务端渲染核对 339 个按需加载的 Binance 报价入口、42 个 Infinity CL 双向 ±1% 面板和 6 个 AAPLB、SNXXB 补充面板。两项补充面板与原有 Metric 同页显示，各自保留来源和计价币。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)

最终构建的 339 个股票详情 HTML 和 Flight 均通过读回核验。339 个报价入口的代码逐项匹配，BRKBB 对应 `BRK.B`，初始导出无报价组件框架或供应商启动脚本。42 个 Infinity CL 面板均为双向 ±1%，6 个补充面板保留各自费率、金额与区块，原有 Metric 数据保持一致。另核对了 90 个 USDT v4 双向 ±1% 面板、3 个 USDEB 固定输入报价面板及每语 113 项精确溢折价缺值。独立复核通过 AAPLB 和 SNXXB 的两份原始边界证据及 6 项检查。[整站验收](../plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)
