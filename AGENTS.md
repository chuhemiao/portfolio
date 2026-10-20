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
- **部署**：GitHub Actions → Cloudflare Pages / Workers → kkdemian.com
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
  pnpm sync:watch     # 刷新 Watch 市场与上市快照
  pnpm typecheck     # TypeScript 检查
  pnpm worker:dev    # 本地运行 Cloudflare Worker API
  pnpm preview       # 本地预览 Cloudflare Pages out/
  ```
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
- **新增内容**：每次新增 Blog、Research、Thoughts 等内容，默认同时完成 `zh-CN`、`en`、`ja` 的标题、摘要和完整正文，设置语言分组并检查三语切换；不能只翻译界面、摘要或创建空白占位。
- **代码**：不要加不必要的注释、docstring、type annotation；不要过度封装
- **包管理**：使用 pnpm，不要用 npm 或 yarn
- **提交**：需要我确认才提交，不要自动 commit
- **Crypto 数据源**：默认不调用 Surf skill/API（用户已无免费 API 额度与速度）。优先使用用户提供材料和仓库本地数据；确需刷新外部数据时，根据任务选择 CoinGecko、CMC、交易所 API、DefiLlama、官方文档或网页搜索。只有用户明确要求时才调用 Surf。

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

- **2026-10-19**：按用户材料新增 thoughts「Collector Crypt（$CARDS）：代币经济学、回购与供给压力」，创建 `collector-crypt-cards-tokenomics-buybacks-unlocks-value-capture` 的中文、`-en`、`-ja` 完整版本，各 8 个标题、8 张表格、4 条来源链接、3 段钱包/池标识符。保留 2026-10-01 官方供应快照与 2026-10-19 价格/回购观察、44.6M 月度锁仓释放修正旧59M口径、基金会/社区已解锁非流通供给、回购预算非实际买入、非强制回购、毛利非持币人法定或链上现金流权、解锁非必然卖出等限制。校正并在三语正文及资料说明标注 .3M/11.6M=2.6%（非不到1%）、902.6M*.275≈248.2M（非255M）、相应毛利倍数2.4x（非2.5x）；明确「两种流通量差额」指供应口径，原链上实测归属用户材料观察，本轮未实测或联网核实。两处图表占位由已有对照表承载，未造历史曲线。未调用 Surf 或外部翻译服务，未改旧CC研究、赛道思考或Research Map。内容检查（7272 MDX）、完整构建（7367 页含类型检查）、独立三语全文/数字/地址审查及diff检查通过；按当前redirect结构只读验证66个语言入口、全部正文/三语feeds及7272旧地址跳转通过。浏览器确认唯一语言下拉、真实三语全文、8表、日文全部目录和thoughts分类唯一对应卡片，无控制台错误。未提交或部署。

- **2026-10-19**：按用户材料新增 research「PopDEX（BTCUSDT 永续）：全链上订单簿、MegaPop 与风险研究」，创建 `popdex-btcusdt-perpetual-clob-megapop-risk-research` 的中文、`-en`、`-ja` 完整版本，各 17 个标题、5 张表格、19 次链接引用（13 个独立 URL）。保留 2026-10-19 UTC 快照、VIP 全档费率含负 Maker、MegaPop 奖池比例非中奖概率/非确定返佣、MMR 100%/160% 与盈利对手方 ADL、桥接审计非全协议审计、无可核验原生 Token/TGE、官方/第三方成交量与年化收入不同口径；原地区访问受限提示明确归属用户材料，本轮未实测交易页、未调用 Surf 或独立联网核实。TVL 图位替换为 4 个已知观察点并保留 $71.55M/$71.57M 各自口径。Research Map 新增唯一 Perp DEX 卡片及三语说明，2818 张卡片；registry 2840 项（+1 PopDEX、补索引既有 10 篇），并更新两处 Backpack 候选映射。旧 sync:research --add 插入点仍失败，已直接更新真实数据源；registry 旧解析器误将 BTCUSDT 作为 symbol，用户卡片不展示为平台币。最新 100 篇深度诊断 14 pass / 86 needs-upgrade，PopDEX 三语如实待增强，不补造内容凑门槛。内容检查（7269 MDX）、局部 ESLint、logo 检查、完整构建（7364 页含类型检查）、独立全文审查、66 个语言入口/全部正文/三语 feeds/7269 旧地址跳转只读校验及 diff 检查通过；全套 i18n 测试 51/53 通过，两项既有失败来自 Telegram 已增至 126 条而测试/译文仍按旧 123 条，本轮未修改该数据。浏览器验证唯一语言下拉、三语全文、日文 17 个目录目标、Research Map 唯一卡片与译文入口，无控制台错误。未提交或部署。

- **2026-10-19**：按用户材料新增 thoughts「Physical TCG：Collector Crypt 与 Courtyard 深度调研」，创建 `physical-tcg-collector-crypt-courtyard-revenue-token-value-capture` 的中文、`-en`、`-ja` 完整版本，三语各保留 7 个标题、5 张表格和 6 条来源链接。保留 2026-10-19 数据快照、收入未扣卡牌采购成本/净留存 GMV 不等于利润、代币回购远小于解锁价值、流通量不等于累计解锁、两平台统计口径差异、线性外推及时间重合不证明因果等边界；原「增幅约 2.7 倍」按 400.8/146.2 校正为「约为 Q1 的 2.7 倍」。两图占位由原有对照表承载并说明无完整历史序列，未补造曲线。已有 Collector Crypt 单项目 Research 原文及 Research Map 均未修改。未调用 Surf 或外部翻译服务，未独立联网核实；前轮 Papertrade 未提交改动已保留。内容检查（7266 MDX）、完整构建（7361 页，含类型检查）、独立全文与金额单位校验及 diff 检查通过；沿用适配当前 redirect stub 的只读检查，66 个语言入口、全部 7266 正文/三语 feeds 及 7266 旧地址目标/canonical/lang/query/hash 校验通过，未修改已知不兼容的旧 check:i18n 脚本。浏览器确认顶部唯一语言下拉、真实三语全文、5 表格、全部日文目录及 thoughts 分类唯一卡片，无控制台错误。未自动提交或部署。

- **2026-10-19**：按用户材料新增 thoughts「Papertrade（$PAPER）：机制、交易、链上数据与代币研究」，创建 `papertrade-paper-mechanism-trading-onchain-token-risks` 的中文、`-en`、`-ja` 完整版本，三语各保留 6 个标题、6 张表格、12 条来源链接及铸造公式和钱包标识。保留 2026-10-19 约 06:15 UTC 快照、House 与净多头敞口及 3.4% 条件性压力估算、亏损铸币、PnL/overflow 分配、收入衰减、预言机操纵事件、审计未见公开报告、代币不可转账与无市场价格、仿盘风险；Dashboard 奖励 $54.06M 与 DefiLlama 分配 $56.14M 保留各自口径。原 TVL 图表占位改为材料已有的 $102.09M / $64.5M 两个观察点，未补造每日曲线，文末说明本次未调用 Surf 或独立联网核实。仅新增思考，未修改 Research Map。内容检查（7263 MDX）、完整构建（7358 页，含类型检查）、独立全文审查及 diff 检查通过；原 check:i18n 因现有旧地址改为 redirect stub 而错误要求正文失败，另以只读校验验证 66 个语言入口、7263 正文/三语 feeds 以及全部 7263 redirect 的目标/canonical/lang/query/hash 保留通过，未修改旧检查脚本。浏览器确认顶部唯一语言下拉、真实三语全文、日文全部目录目标、thoughts 分类唯一对应卡片，无控制台错误。现仓库已移除 preview 命令，本地使用 pnpm dlx serve out -l 8788 预览。未提交或部署。

- **2026-10-16**：按用户材料新增 thoughts「SurfBoard NFT（Robinhood Chain）：机制、估值与风险」，创建 `surfboard-nft-robinhood-chain-mechanism-valuation-risk` 的中文、`-en`、`-ja` 完整版本，三语各保留 26 个标题、6 张表格、14 条来源链接、合约与 epoch 交易哈希。6 个 LaTeX 公式改为可直接渲染的文本公式，保留 2026-10-16 05:29 UTC 快照、APR 过去 7 天年化且非保证收益、普通开启与 Max Ticket 概率池差异、供应及领取资格版本差异、95% 赎回规则、股票代币债务证券不等于底层股票所有权、封存持仓不等于全系列 NFT 集中度等边界。原材料止于「95% 赎」，仅依据前文整理为赎回实际执行监控项，并在三语资料说明注明，未推补其他缺失尾文。未调用 Surf 或外部翻译服务，未独立联网核实，未修改 Research Map。当前 7230 MDX、3016 组、2104 组完整三语，历史 pending 仍 912。内容检查、完整构建（14547 页，含类型检查）、63 个三语入口与全部文章/旧地址/RSS 导出检查、独立全文审查及 diff 检查通过；浏览器确认单一语言下拉、三语全文、6 张表格及日文 thoughts 分类唯一卡片，无控制台错误。保留此前 NeoSoul 未提交改动，本次未自动提交或部署。

- **2026-10-16**：按用户粘贴材料新增 NeoSoul（$DNA）项目研究，创建 `neosoul-dna-launch-products-tokenomics-research` 的 zh-CN 原文、`-en` 和 `-ja` 完整版本，三语各保留 24 个正文标题、12 条来源链接、3 张表格及合约/交易哈希。保留 OKX 上线未完全确认、首期解锁时区缺失、收入自报、87% 锁仓与可交易供给差异、订单深度重叠和价值捕获尚待验证等边界；对材料中 Binance Alpha「首个承载平台」的歧义不推断历史首发排序。文末明确依据用户材料、本次未独立核实外部网页，未调用 Surf 或外部翻译服务。直接更新真实 `research-projects.ts` 与三语卡片说明，Research Map 为 2817 张卡片、registry 为 2829 个项目，NeoSoul 仅计 1 次；`sync:research --add` 仍因旧 client 插入点缺失失败。按工作流刷新最新 100 篇深度诊断（25 pass / 75 needs-upgrade），NeoSoul 三语仍低于模板篇幅/来源门槛，未补写无依据内容。当前共 7227 MDX、3015 组、2103 组完整三语，历史 pending 仍 912。验证：53 项 i18n 测试、content:check、typecheck、局部 ESLint、logo 校验、完整构建（14541 页）、63 个三语入口及全部文章/旧地址/RSS 导出检查通过；独立审查与浏览器确认三语全文、唯一语言下拉、日文全部目录目标及唯一 Research 卡片，无控制台错误。未自动提交或部署。

- **2026-10-14**：按用户提供材料新增 thoughts「Hyperliquid（$HYPE）：基础设施叙事的兑现考验」，创建 `hyperliquid-hype-infrastructure-narrative-execution-test` 的中文原文、`-en` 和 `-ja` 完整版本，发布日期为 10 月 14 日，数据仍保留 `2026-10-13 13:22 UTC` 及原观察窗口。三语保留用户与变现分化、费用与持有人现金流的区别、非严格同比、供给与累计解锁差异、单次储备收益不可外推等边界；文末明确数据来自用户提供材料、本次未独立联网核实。把原图表占位替换为三份可访问的 SVG，基期为 100，指数为 139.3 / 105.1 / 94.9 / 57.3。已将「今后新增 Blog / Research / Thoughts 等内容默认在同次任务补齐 zh-CN / en / ja 标题、摘要、完整正文」写入长期偏好及内容工作流。修复日文假名目录 ID 丢失、带行内代码/链接/实体的标题与目录不一致问题，统一解析后的标题文本并避免重复/空 ID，编译器版本升至 8；新文及三篇日文旧译文的粗体显示已修正。未调用 Surf 或外部翻译服务，未自动提交或部署。

- **2026-10-14**：本轮历史内容三语补齐已完成 2002 篇 Research 原文的完整中文/日文，共 4004 个译文 MDX；新增离线严格匹配翻译 CLI、术语/来源标签/197 个独立段落译文、来源 SHA-256 校验与明确 pending 清单，未知正文不生成半成品，Escoin/GorplesCoin 身份错配暂缓。另补齐 81 组旧文及多篇近期独立文章；Research 2816 张卡片的说明与分类、123 条随想、2 份 Weekly 及首页周报已接入三语，原文变更时拒用旧资源并明确回退。Blog / 首页 / 主题按真实译文组去重，优先当前语言；显式 all 过滤保留全部版本。包含新增 HYPE 后共 7224 个 MDX、3014 组，其中 2102 组完整三语，仍有 912 组待补齐；模板范围为 2510 源，508 源 pending，不能把模板报告当全站已完成。多语批次已在既有提交 `bc630f67`，本次未新增 commit。53 项 i18n 行为测试、内容检查、局部 ESLint、v8 冷构建（14535 页）、63 个三语入口与全部文章/旧地址导出校验通过；184247 个目录项及 10 个脚注说明引用目标全量匹配。只读核对 Research 原文保持 2828，译文重复索引为 0。浏览器确认新 HYPE 三语全文、唯一语言下拉、日文目录跳转、Blog 去重与 Research 日文卡片，未见运行错误。

- **2026-10-13**：按用户要求同步 Oscillator 与 Watch 最新数据，使用本机既有代理读取原生 CoinGecko、CMC、Binance 和交易所接口，未调用 Surf。Oscillator 快照为北京时间 19:07:36，500 个资产全部有当前 ALT/BTC，35 个重点资产中 22 个有闭合日线历史；缺失历史保留空值，并显示真实来源及可用窗口。修复稳定币过滤、双榜 Top 300、非法 BTC 报价、当日未闭合历史点，以及旧缓存/旧排名伪刷新。Watch 快照为 19:18，493 个资产、93 个真实近期事件、415 个报价，19 个原生来源请求成功；Alpha 未知日期不再伪造，停牌库存排除，Bitget 仅确认市场存在且披露日期缺失，Coinbase 披露前 500 个产品覆盖限制。新增原子静态 Watch / BTC 热度快照、浏览器回退和失败保留旧数据；BTC 热度时间 19:11，14 个指标。新增 pnpm sync:watch / test:markets，默认构建复用真实快照时间；修正原生报价整批失败与 Node / Worker 库存差异。验证：47 项市场回归测试、typecheck、局部 ESLint、Worker dry-run 打包、最终 Next 静态构建（6131 页）、三语导出校验、独立增量审查与 diff 检查通过；浏览器验证最新时间、筛选、中文/英文/日文覆盖提示及 BTC 热度回退，未见运行错误。未提交或部署。

- **2026-10-13**：按用户截图反馈，将全站语言切换统一为顶部唯一的原生下拉菜单，移除文章标题下方的重复切换控件。菜单保留 zh-CN / en / ja、当前语言、键盘操作和焦点提示；选择时读取最新 URL query/hash，有译文时打开对应译文，没有译文时标注“浏览文章”并打开目标语言列表。更新文章提示与 `docs/multilingual-content.md`，并忽略本地 `.wrangler` 预览生成目录。验证：局部 ESLint、typecheck、独立窄范围审查、完整构建（6131 页）、`pnpm check:i18n` 与 diff 检查通过；浏览器确认文章只有 1 个语言下拉、重复文章控件为 0，中英文译文切换保留 `?q=QTC#tldr`，日文回退正确，浏览器无运行错误；预览已刷新到英文 Quantus 挖矿指南。未提交或部署。
