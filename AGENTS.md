# AGENTS.md — kkdemian portfolio

> 每次对话开始时请读取此文件，了解项目背景和用户偏好。
> 每次对话结束时，如有新的重要信息，请更新 SESSION_LOG 部分。

---

## 关于我

- **身份**：Web3 Product Engineer，6 年经验，数字游民
- **GitHub**：chuhemiao
- **网站**：kkdemian.com
- **持仓偏好**：Bitcoin、ETH、CRCL HODL
- **当前角色**：iBuidl Founder + Yamaswap TPM

---

## 技术栈

**前端**：Next.js、React、TypeScript、Tailwind CSS、Shadcn UI
**后端**：Go、Rust、Node.js、Python
**区块链**：Solana、Solidity、Motoko (ICP)、TON
**数据库**：Supabase、Firebase、Weaviate
**部署**：Cloudflare Pages、Cloudflare Workers、Cloudflare CDN、GitHub Actions
**工具**：pnpm、Figma、Notion

---

## 当前项目

### 1. Portfolio（本项目）

- **Repo**：chuhemiao/portfolio
- **Stack**：Next.js 16 + TypeScript + Tailwind + MDX
- **部署**：推送 `main` 后由 Vercel Git 集成发布至 kkdemian.com，GitHub Actions 独立运行校验。
- **内容管理**：`content/blog/` 目录，MDX 格式
- **新功能**：`/thoughts` 页面，通过 Telegram Bot 自动同步频道消息
- **常用命令**：

  ```bash
  pnpm dev          # 启动开发服务器
  pnpm quick:add    # 快捷新增内容，默认 dry-run
  pnpm new:post     # 底层创建新博客文章
  pnpm content:check # 检查内容格式
  pnpm sync:research # 同步 Research Map / registry
  pnpm status:research:run # 查看研究长任务进度
  pnpm sync:telegram # 手动同步 Telegram 消息
  pnpm sync:oscillator # 刷新 Oscillator 市场与历史快照
  pnpm sync:oscillator --missing-history # 仅补缺失的 ALT/BTC 日线
  pnpm sync:watch     # 刷新 Watch 市场、上市及 BTC 热度快照
  pnpm sync:fear      # 刷新 Fear 市场、情绪与 BTC 观测快照
  pnpm sync:market-news # 刷新三个市场页的方程式新闻快照
  pnpm sync:pulse-cards --help # 查看已审核周报数据的重算用法
  pnpm typecheck     # TypeScript 检查
  pnpm build         # 构建并校验静态导出 out/
  ```
- bStocks 的候选行情导入和 Twelve Data 复权采集命令见[市场页实施记录](docs/plans/2026-11-20-market-dashboard-rollout.md#当前数据缺口与更新入口)。Twelve Data 采集使用环境变量 `TWELVE_DATA_API_KEY`，候选文件可先用 `pnpm sync:bstocks --underlying ./capture.json --dry-run` 校验。
- **当前 Research 进度（2026-07-07）**：registry `2811` projects；candidate total `3815`，pending new candidates `381`；depth upgrade queue `0`；本轮最新 1000 篇 depth audit 全部 full-depth pass。注意 raw pending 中仍可能有已被 registry 覆盖的旧候选，新增前以 `generate-cmc-cgo-research-batch --list-only` / registry 过滤结果为准。
- **当前 Skill / 工作流**：当前安装目录未发现旧 `research-map-builder` skill；本仓库以 `src/data/skill.md` 作为 repo-local Research Map workflow reference，核心原则是先本地查重、再写 MDX、再同步 `/research` 与 registry。默认不再调用 Surf skill/API；批量 CMC/CGO 新增可继续使用 `scripts/generate-cmc-cgo-research-batch.mjs` 的本地与其他数据源兜底能力，必要时按用户指定来源补充数据。
- **快捷内容脚本**：`pnpm quick:add -- "内容描述" --category research` 默认 dry-run；加 `--write` 才创建 MDX；research 类内容写入后执行 `pnpm sync:research --add`、`pnpm audit:research:depth -- --limit 100 --write`、`pnpm check:research:logos`。

### 2. Yamaswap

- **定位**：基于 Intent Framework + AI Agent 的无许可 ETF dApp
- **链**：Solana + BASE
- **网站**：yamaswap.com
- **角色**：TPM

### 3. fCurrency

- **定位**：法币与加密资产的可组合兑换引擎
- **平台**：Farcaster Mini App
- **Stack**：Next.js + CMC/CG/Coinapi API

### 4. AnkiRin

- **定位**：AI 驱动的日语词汇卡片学习工具
- **Stack**：Next.js + Firebase + Gemini AI
- **网站**：rin.kkdemian.com

### 5. iBuidl

- **定位**：Web3 数字游民社区 + Web2 to Web3 转型平台
- **网站**：ibuidl.org

---

## 工作偏好

- **语言**：默认中文回答，代码注释可以英文
- **风格**：简洁直接，不废话，给具体方案而不是泛泛而谈
- **多语言 UI**：全站只保留顶部一个语言下拉菜单，文章页不重复提供语言切换控件。
- **新增内容**：每次新增 Blog、Research、Thoughts 等内容，默认同时完成 `zh-CN`、`en`、`ja` 的标题、摘要和完整正文，设置语言分组并检查三语切换；不能只翻译界面、摘要或创建空白占位。新增研究和思考还须执行下方的三语优化与一致性流程。
- **内容交付**：内容完成后无需启动或打开页面预览；保留必要的内容、语言分组和构建检查。
- **代码**：不要加不必要的注释、docstring、type annotation；不要过度封装
- **包管理**：使用 pnpm，不要用 npm 或 yarn
- **提交**：需要我确认才提交，不要自动 commit
- **Crypto 数据源**：默认不调用 Surf skill/API（用户已无免费 API 额度与速度）。优先使用用户提供材料和仓库本地数据；确需刷新外部数据时，根据任务选择 CoinGecko、CMC、交易所 API、DefiLlama、官方文档或网页搜索。只有用户明确要求时才调用 Surf。

---

## 新增研究与思考：三语优化与一致性流程

适用于新增 Research、Thoughts 及后续修订。默认一轮完成三语成稿、表达优化、复核和报告，无需每次再询问是否执行；用户明确要求“只检测”或“先给报告”时，按该范围交付。

1. **保留基线**：以用户原始材料及已确认的修订为事实和判断基准，保存原稿或优化前初稿。先本地查重、确定分类，再完成三语标题、摘要、完整正文和语言分组；Research 按仓库现有流程同步 Research Map / registry，Thoughts 不因此新增项目卡片。

2. **三语同步优化**：采用 `lieflat-less-ai-tone` 的最小改动、信息守恒、结构保留原则。中文执行脚本检测和逐条语义复核，保存改前、改后结果；英文和日文按各自语法和自然表达同步优化，不套用中文正则、每千汉字阈值或 AI 评分。原译已自然且含义一致的句子可保留，不强行逐字对应或为了降低计数改写。

3. **保留数据与原有判断**：保留金额、单位、币种、百分比、日期、观察窗口、公式、来源、事实主体、因果与比较方向。保留“可能”“假设”“未核实”“非预测”等判断强度和证据边界，不把收入、利润、现金流等不同口径混同。表格、清单、引文和必要否定不得为去 AI 味而删减，不新增未经材料支持的事实或结论。

4. **检查三语内容一致性**：逐段核对完整性、标题层级、表格与公式、功能清单、结论、来源归属及语言分组。核对金额单位换算、日期本地化、年化与实际期间、`>` / `≥` 等门槛与比较关系，不能只看数字数量或段落数量。发现既有误译时依据原文或已确认口径窄修，并在报告中单列说明；不擅自改变原有判断。

5. **复测与保真复核**：优化后复测，逐处核对原文、新文、修改理由及保留边界；条件允许时安排独立复核。确认没有遗漏正文、数据、专名、来源、限定条件或功能项，没有为节奏调整而拆散论证、目录或表格。保留误报、必要专业表达和正常清单的说明，不宣称所有原始命中都应清零。

6. **完成必要检查，不预览**：执行 `pnpm content:check` 和 `pnpm build`，检查三语语言分组、对应链接及内容产物；可只读核对生成的静态文件。不要为内容交付启动开发服务器、预览服务器，或打开浏览器/页面预览。遵守不自动提交、部署的现有偏好。

7. **交付对比报告**：在 `docs/reviews/` 留存原稿或初稿基线、修改记录和检查结果，提供三语一致性汇总及各语言优化前后的可追溯对比。交付时简要说明修改范围、数据与判断保全结果、必要的误译校正和检查结论，并链接报告。

---

## 博客内容方向

- Web3 / DeFi 技术研究
- 投资分析、宏观趋势与美股研究
- AI Agent + 长期记忆架构（正在研究）
- 加密市场分析（BTC、宏观流动性）
- 数字游民 / indie hacker 生活方式

---

## SESSION_LOG

> 记录每次重要对话的结论，保持最近 10 条，旧的删除。

- **2026-11-27**：新增 Bullpen 私钥导入、加密相对强弱与资金轮动、Trust Wallet 签名与恢复战略三篇三语思考。核实 Bullpen 终报 19 个账户并复算约 18.6 万美元年化费用。轮动稿对齐 Farside 的两日截止及资金费率年化，保留 30 行 CRSS 和情景阈值。Trust Wallet 补充 EIP-7951 验证成本及 FIDO 登录分母，保留签名基线、恢复投入与五项指标。三篇各自留存基线、检测和差异，独立复核后通过 7,527 篇内容检查、8,409 页构建及九个三语正文、分类、语言对应、RSS 静态检查。[Bullpen](docs/reviews/2026-11-27-bullpen-wallet-import/README.md) · [资金轮动](docs/reviews/2026-11-27-crypto-capital-rotation/README.md) · [Trust Wallet](docs/reviews/2026-11-27-trust-wallet-security-strategy/README.md)

- **2026-11-24**：新增比特币挖矿成本与矿工抛售三语思考。区分约 6 万美元电费情景、MARA 不含折旧估算与 8.6 万美元生产成本估计，复算难度敏感性和 ETF 流量，将情景持仓降幅更正为 44.9% 至 48.8%。新增四组电费图及计算存档。7,518 篇内容检查、8,400 页构建和三语语言对应、图表、RSS 通过。 [三语复核](docs/reviews/2026-11-24-bitcoin-mining-cost-floor/README.md)

- **2026-11-24**：新增 pump.fun 停用 Phantom 网页登录三语思考。核实 11 月 30 日 15:00 UTC 截止及三条迁移路径，纠正部分平仓与 Monad 停止支持日期，区分账号认证、私钥导入和签名授权。保留原稿快照，用 DefiLlama 59 个日值复算 53 点费用均值并加入三语图表。7,515 篇内容检查、8,397 页构建、三语语言对应和 RSS 通过。 [三语复核](docs/reviews/2026-11-24-pump-fun-wallet-login/README.md)

- **2026-11-24**：新增 Trust Wallet 与 DarkSword 三语思考，保留 50%／30%／20% 增量预算建议及 90 秒换机恢复目标。厘清 Bitquery 的 TRON 样本与跨链合计，纳入 11 月 23 日的更新，按来源限定漏洞状态和账户防护条件。7,512 篇内容检查、8,394 页静态构建、三语正文及语言对应链接和 RSS 核验通过。 [三语复核](docs/reviews/2026-11-24-trust-wallet-darksword/README.md)

- **2026-11-21**：确认本次 GitHub 交付范围包括市场看板、ORIPA 上线前研究及 CARDS 估值对照、Claude 与黎曼猜想三语系列。以 `main` 的现有 GitHub Actions 与 Vercel Git 集成作为发布入口。工程验收和外部数据缺口见 [市场实施记录](docs/plans/2026-11-20-market-dashboard-rollout.md)，三语来源和对应检查见 [专题复核](docs/reviews/2026-11-21-claude-riemann-hypothesis/README.md)。

- **2026-11-21**：新增 Claude 与黎曼猜想三语研究系列，覆盖公开声明与证据、Stepanov 重数与迭代 θ 提升、Lean 独立复核，共 3 个语言组和 9 份完整 MDX。读取 Alpöge 四页声明，依据 Sutherland 11 月 20 日 22:05 UTC 记录区分 175,187 模块编译、五项目标公理与内核核验，以及当时未完成的 Comparator 和导出重放。三语表达与证据对照见 [专题三语复核](docs/reviews/2026-11-21-claude-riemann-hypothesis/README.md)。7,506 篇内容检查、8,388 页构建、9 页同语及语言对应链接和三份 RSS 核验通过，挂现有 Anthropic 项目。此前市场目标按外部数据依赖标记受阻，保留已完成改动。

- **2026-11-21** 市场页续验。首页 16 组布局通过，Watch 的 Coinbase 匿名完整现货清单实测返回 917 个唯一产品，恢复 14 个符合条件的交易对。11 月 20 日 23:48:10.946 UTC 快照有 516 个标的，其中 135 个有上市时间、394 个有报价，保留 7 条已核实事件。Watch 的 13 个必需市场清单请求均通过校验才写入。旧门槛在 Binance 现货 HTTP 503 回放中将 AT 从现货与永续并有的 A 级误写为仅永续 B 级，HTTP 200 缺清单也会错误写入。修复后两种情况均保留上次快照。合法空清单按接口校验，报价失败后仍可使用有效替代报价。30 项 Watch 定向测试通过，原快照及事件文件逐字节一致。BTC 热度为 26.8，包含 14 项指标。Oscillator 的 35 个关注标的均有 ALT/BTC 历史，23:38:26.740 UTC 快照的美元涨幅广度为 7 日 83/500、30 日 74/499。方程式新闻在 23:35:09.790 UTC 更新，9 次请求均通过，Oscillator、Watch、Fear 分别保留 6、10、4 条。Fear 在 2026-11-21 00:01:59.678 UTC 更新至 11 月 20 日的 180 个已收盘 UTC 日，使用 Bitview 同源实现价格、MVRV 比率、按日扩展总体标准差计算的 Z-score 和 200 周均线。11 月 20 日 Bitview 收盘为 58,918.27、实现价格为 53,281.42、均线为 67,931.8178，三项均为 USD/BTC。MVRV 为 1.1057938266794898，Z-score 为 0.18691124498559944。实时 BTC 快照为 58,946.71 美元。新一期仅 Hyperliquid 资金费率由触发变为未触发，评分从 61 变为 51。资金费率和连续地址窗口分别覆盖 180、161 日。Pulse 的 11 月 9 日及 11 月 2 日 UTC 周报分别有 3,770 和 4,009 条已核实凭证。四个入口提供两期逐笔 JSON，页面分别列出原 34 和 21 条链接，每期含 9 笔 CARDS 回购示例。11 月 9 日周在 20:08:01.783 UTC 核对完官方回购钱包的 3,790 条终局签名，40 笔链上失败，3,750 笔成功中排除 5 笔。3,745 笔符合指定 Raydium CLMM 池直连口径，支出 26,663.743218 USDC，收到 131,878.135136 CARDS，作为公开可核实的下界。11 月 2 日归档已核对指定钱包及交易池范围内的 4,051 条终局签名。50 笔链上失败，4,001 笔成功交易中 4 笔钱包未签名，其余 3,997 笔为直接回购，支出 26,859.314711 USDC，收到 112,363.576802 CARDS。最后 59 笔回执于 22:35:17.196 UTC 前逐笔核实。两周金额是项目公开可核实的下界。Collector Crypt 两周各核实 2 笔二级成交，已用真实 7 日及 14 日数据验证指标重算。10 月 26 日起的对照无审核数据。Renaiss 在原有 18 和 9 笔二级成交外新增 5 和 1 笔 PANDORA 28 付款，每周各覆盖 5 个已付款订单。两个统计期均按 UTC，链上付款按原计价币列为样本下界。PANDORA 248 合作机台另列一条，ORIPA 两周均处于上线前，Renaiss 的卡片与代币回购在两期仍缺凭证。6 月 12 日旧合约的一笔回购记录为 81 USDT，官方 v2 生产回购查询需 Builder 鉴权。两条单卡公开历史价格与周报已收的 397 和 680 USDT 二级成交金额及时间一致，历史价格缺可核交割数据。官方条款提到未来可能推出代币，两期回购仍缺逐笔凭证。bStocks 核实 113 个 ISIN 及对应 BNB Chain 合约，全部 339 个三语详情有基本面，88 个标的采用公司披露、25 个采用基金或封闭式基金资料。NUB、TSMB、NBISB、ASMLB、NVDAB、AMATB 按四份 SEC 6-K 和两份 8-K 补充披露，核对 12 个报告期间、55 个数值与 18 个三语详情。NVDAB 按 2027 财年第三季度及年初至今，AMATB 按 2026 财年第四季度及未经审计的全年，两家财季均截至 10 月 25 日。后续正式 10-K 或 10-Q 按同一发行人、期间、指标及单位接替初步 8-K 值。当前 90 个 SEC 标的的合并结果与修复前一致，六个标的的收入及净利润 TTM 仍缺输入。实测 74 个 TradingView Binance Spot 日图，结合原 43 个 GeckoTerminal 池图，四项重合，去重覆盖 113 个标的。BNB Chain 终局区块 134740365 新增 23 个 PancakeSwap v2 储备快照及 ±1% 试算。区块 134751421 又核实 AGPUB、IBMB 的 PancakeSwap v3 双向 USDT 深度，沿用已有走势图。此前 68 个标的有链上数据。对当时缺数据的 45 个，在区块 134778820 查询 PancakeSwap v3 的 USD1 和 FDUSD 各四档费率，360 个直接池均为空。随后于区块 134779979 补入 12 个 Infinity CL 双向 USDT 试算，其中 3 个为边际价 ±1%，9 个为固定输入报价，计入 LP 和协议费。DELLB 和 BBB 在补采区块 134782313 取得两向固定输入报价。Infinity CL 在原终局区块 134779979 和 134782313 为余下 9 个和 2 个标的核对双向边际价 ±1%。每侧核对最小完整输入和少一个原始单位的前档。14 个标的均有双向 ±1% 试算，保留原固定输入金额。Uniswap v4 对此前缺数据的 31 个标的取得双向报价，分别固定在 BNB Chain 终局区块 134784374 和 134784767。30 个标的的双向边际价 ±1% 经过同区块复核，USDEB 显示固定输入报价。独立复核发现并修正 WDCB 固定输入的买卖方向，两个采样区块的 31 项固定报价和 30 项边界均匹配源记录。113 个标的均有至少一种已查的链上流动性或报价数据。AAPLB 与 SNXXB 在区块 134791428 和 134792232 分别核实 PancakeSwap v3 USDT 与 Uniswap v4 ETH 双向 ±1% 深度，两者保留既有 Metric 数据。按标的去重，87 个有已核实的双向 ±1% 深度，另 23 个有 PancakeSwap v2 储备模型，合计 110 个。DRAMB 和 MUB 有 Metric 分档深度。在原区块 134712341，两池四方向的池侧及预言机价格 ±1% 限制询价与开放询价返回一致，缺达到目标边际价的证据。USDEB 有固定输入报价。托管原资产图默认开启均线和 RSI（14），AAPL、SPY 与 MUU 样本此前均实测可从 ADJ 切换股息复权。六个标的新增三语 TradingView 指标页链接，DRAM 的 SMA200 暂缺，ANT 指标页实测返回 404。五个已核实的美国挂牌标的更新分组摘要，沿用历史研究链接。区块 134722431 核实全部 113 个标的的链上显示系数，82 个为 1、31 个为其他值。ADGM 核准的 113 份主招股文件及 3 份补充文件在三语详情提供原始链接及核准日。经核对全部 113 份主招股文件及三份补充文件，112 个标的的每份有效凭证对应一单位原资产，包括 82 个股份类、24 个基金份额类、5 个美国存托凭证（ADR）及 1 个美国存托股份（ADS）。ASMLB 的发行文件与原资产公开资料对证券类型的表述有出入，凭证单位暂缺。SNDKB 和 MUB 的三语时间线分别核实拆股和股息再投资的公告与链上变化，显示乘数分别为 1 到 8、1.000107512568805603 到 1.000217357013353696。Chainlink CRCL REST 需 HMAC，Roundhill 有 DRAM 正式收盘字段，公开使用仍需书面许可。Circle 的 Q4 历史行情匿名请求返回 400，QUODD 日终行情仍待核实正式收盘成交口径与展示授权。同一时点的获准底层报价、本站计算用的授权复权序列和精确溢折价仍待接入。Binance 官方原资产组件扩展至 113 个，九组各 12 个和末组 5 个的实际响应均返回匹配代码的美元报价。三个语言版本共 339 个入口，展开才加载隔离框架。组件报价缺交易场所和时点字段。Intrinio 的 CRCL 日终和 Alpaca 的 MUU 历史接口匿名请求均返回 HTTP 401。CRCL 参考看板列 Yahoo Finance 历史日线及 Nasdaq 报价标签，实际报价场所、价格导出、复权方法与使用权限仍待核实。公开盘口展示授权仍待确认。IBM Plex Sans 使用随仓库分发的 6 个原始字体子集。企业行动时间线通过 44 项股票定向测试及 339 个三语详情服务端渲染核验。对照周回购核对通过 22 项 Pulse 定向测试。技术指标页外链通过 45 项股票定向测试和 339 个三语详情服务端渲染核对，18 个链接匹配。首轮 Infinity CL 通过 49 项股票定向测试，随后补采两项后通过 50 项。339 个三语详情的服务端渲染与静态导出共核对 42 个 Infinity CL 面板，并验证跨快照冲突池标识的缺值处理。新一轮股票定向测试 52 项通过，339 个三语服务端渲染核对全部报价入口、42 个 Infinity CL 双向 ±1% 面板和 6 个补充面板。先前 Uniswap v4 与首批原资产组件通过 51 项股票定向测试，该轮 396 项全量测试及 7,497 篇内容检查通过，标准 `pnpm build` 生成 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面及三份 RSS。该轮读回 339 个股票详情，含 90 个 USDT v4 ±1% 面板、3 个固定输入面板、18 个技术指标链接和当时 9 个原资产组件入口。最新全量 397 项测试及 7,497 篇内容检查通过，标准构建导出 8,379 个静态产物，核验 7,497 个旧入口、717 个本地化页面和三份 RSS。339 个股票详情 HTML 与 Flight 核对全部报价入口、42 个 Infinity CL 双向面板及 6 个补充深度面板。首页、市场页、Pulse 四个入口及两份逐笔 JSON 均通过核验，有 5 条既有的 Turbopack 文件匹配范围警告。见[市场页实施记录](docs/plans/2026-11-20-market-dashboard-rollout.md#本地实施与验收)及[bStocks 核验](docs/reviews/2026-11-20-bstocks-study.md)。 后续修复可选 Binance 报价畸形 HTTP 200 时的处理，保留有效同批价格和备用报价；坏数据不能写出错误市场状态。市场收尾独立验收 400 项测试、8,379 静态页面、三语 339 股票详情与两期 Pulse 原哈希通过。

- **2026-11-20**：刷新 Oscillator（500 标的、18/35 关注项有历史）、Watch（513 标的、132 有上市时间、394 有报价）及 BTC 热度；Fear 新增可重跑静态快照、各自标记 BTC 与情绪时间、补 200 周已收盘均线并去除旧 Worker 404 路径。方程式公开 REST 新闻快照接入三页（6/10/4 条），中英日界面共用事件，日语新闻标题标英语或中文来源。首页、市场数据、bStocks 与 Pulse 卡牌周报的依赖与验收见 docs/plans/2026-11-20-market-dashboard-rollout.md。309 项测试、7497 篇内容校验、8303 页构建及 12 个市场入口静态核验通过。采用本地静态产物交付。

- **2026-11-20**：新增ORIPA上线前研究及ORIPA/CARDS估值对照思考，共6篇三语全文并同语互链。研究同步RWA卡、三语描述和单一registry条目，原有registry及候选保留。核实BlockSec已有审计报告；修正550M分母、全质押0.77、49天/7周、9个月与7.5个月、Vault快照及年化条件。对照明确3.24%净收入与27.75%毛流水不可直接推出8.6倍，回购销毁非现金分红；保留敏感性表并展示流通市值/FDV双基准。独立三语复核、前后检测、计算和逐行差异见docs/reviews/2026-11-20-oripa/及2026-11-20-oripa-cards-comparison/。7497篇内容检查、8303页完整构建、i18n59/59、logo及六篇静态产物通过。最新100篇深度审计已写入，研究按原稿篇幅及证据量仍needs-upgrade；官方文档403、主网部署未独立确认。未预览、提交或部署。

- **2026-11-20**：首页侧栏顶部新增三语广告招租位，明示US$300/月及chuhemiao@gmail.com。按钮通过mailto打开本地化主题的咨询邮件草稿，沿用现有主题和移动端侧栏排版。typecheck、定向ESLint（仅原有img警告）、8297页完整构建及默认/中英日四个首页静态广告内容和邮件链接核验通过，文章页未增加广告位。未启动预览或提交。
