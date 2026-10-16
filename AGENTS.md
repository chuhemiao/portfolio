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

- **2026-10-16**：按用户材料新增 thoughts「SurfBoard NFT（Robinhood Chain）：机制、估值与风险」，创建 `surfboard-nft-robinhood-chain-mechanism-valuation-risk` 的中文、`-en`、`-ja` 完整版本，三语各保留 26 个标题、6 张表格、14 条来源链接、合约与 epoch 交易哈希。6 个 LaTeX 公式改为可直接渲染的文本公式，保留 2026-10-16 05:29 UTC 快照、APR 过去 7 天年化且非保证收益、普通开启与 Max Ticket 概率池差异、供应及领取资格版本差异、95% 赎回规则、股票代币债务证券不等于底层股票所有权、封存持仓不等于全系列 NFT 集中度等边界。原材料止于「95% 赎」，仅依据前文整理为赎回实际执行监控项，并在三语资料说明注明，未推补其他缺失尾文。未调用 Surf 或外部翻译服务，未独立联网核实，未修改 Research Map。当前 7230 MDX、3016 组、2104 组完整三语，历史 pending 仍 912。内容检查、完整构建（14547 页，含类型检查）、63 个三语入口与全部文章/旧地址/RSS 导出检查、独立全文审查及 diff 检查通过；浏览器确认单一语言下拉、三语全文、6 张表格及日文 thoughts 分类唯一卡片，无控制台错误。保留此前 NeoSoul 未提交改动，本次未自动提交或部署。

- **2026-10-16**：按用户粘贴材料新增 NeoSoul（$DNA）项目研究，创建 `neosoul-dna-launch-products-tokenomics-research` 的 zh-CN 原文、`-en` 和 `-ja` 完整版本，三语各保留 24 个正文标题、12 条来源链接、3 张表格及合约/交易哈希。保留 OKX 上线未完全确认、首期解锁时区缺失、收入自报、87% 锁仓与可交易供给差异、订单深度重叠和价值捕获尚待验证等边界；对材料中 Binance Alpha「首个承载平台」的歧义不推断历史首发排序。文末明确依据用户材料、本次未独立核实外部网页，未调用 Surf 或外部翻译服务。直接更新真实 `research-projects.ts` 与三语卡片说明，Research Map 为 2817 张卡片、registry 为 2829 个项目，NeoSoul 仅计 1 次；`sync:research --add` 仍因旧 client 插入点缺失失败。按工作流刷新最新 100 篇深度诊断（25 pass / 75 needs-upgrade），NeoSoul 三语仍低于模板篇幅/来源门槛，未补写无依据内容。当前共 7227 MDX、3015 组、2103 组完整三语，历史 pending 仍 912。验证：53 项 i18n 测试、content:check、typecheck、局部 ESLint、logo 校验、完整构建（14541 页）、63 个三语入口及全部文章/旧地址/RSS 导出检查通过；独立审查与浏览器确认三语全文、唯一语言下拉、日文全部目录目标及唯一 Research 卡片，无控制台错误。未自动提交或部署。

- **2026-10-14**：按用户提供材料新增 thoughts「Hyperliquid（$HYPE）：基础设施叙事的兑现考验」，创建 `hyperliquid-hype-infrastructure-narrative-execution-test` 的中文原文、`-en` 和 `-ja` 完整版本，发布日期为 10 月 14 日，数据仍保留 `2026-10-13 13:22 UTC` 及原观察窗口。三语保留用户与变现分化、费用与持有人现金流的区别、非严格同比、供给与累计解锁差异、单次储备收益不可外推等边界；文末明确数据来自用户提供材料、本次未独立联网核实。把原图表占位替换为三份可访问的 SVG，基期为 100，指数为 139.3 / 105.1 / 94.9 / 57.3。已将「今后新增 Blog / Research / Thoughts 等内容默认在同次任务补齐 zh-CN / en / ja 标题、摘要、完整正文」写入长期偏好及内容工作流。修复日文假名目录 ID 丢失、带行内代码/链接/实体的标题与目录不一致问题，统一解析后的标题文本并避免重复/空 ID，编译器版本升至 8；新文及三篇日文旧译文的粗体显示已修正。未调用 Surf 或外部翻译服务，未自动提交或部署。

- **2026-10-14**：本轮历史内容三语补齐已完成 2002 篇 Research 原文的完整中文/日文，共 4004 个译文 MDX；新增离线严格匹配翻译 CLI、术语/来源标签/197 个独立段落译文、来源 SHA-256 校验与明确 pending 清单，未知正文不生成半成品，Escoin/GorplesCoin 身份错配暂缓。另补齐 81 组旧文及多篇近期独立文章；Research 2816 张卡片的说明与分类、123 条随想、2 份 Weekly 及首页周报已接入三语，原文变更时拒用旧资源并明确回退。Blog / 首页 / 主题按真实译文组去重，优先当前语言；显式 all 过滤保留全部版本。包含新增 HYPE 后共 7224 个 MDX、3014 组，其中 2102 组完整三语，仍有 912 组待补齐；模板范围为 2510 源，508 源 pending，不能把模板报告当全站已完成。多语批次已在既有提交 `bc630f67`，本次未新增 commit。53 项 i18n 行为测试、内容检查、局部 ESLint、v8 冷构建（14535 页）、63 个三语入口与全部文章/旧地址导出校验通过；184247 个目录项及 10 个脚注说明引用目标全量匹配。只读核对 Research 原文保持 2828，译文重复索引为 0。浏览器确认新 HYPE 三语全文、唯一语言下拉、日文目录跳转、Blog 去重与 Research 日文卡片，未见运行错误。

- **2026-10-13**：按用户要求同步 Oscillator 与 Watch 最新数据，使用本机既有代理读取原生 CoinGecko、CMC、Binance 和交易所接口，未调用 Surf。Oscillator 快照为北京时间 19:07:36，500 个资产全部有当前 ALT/BTC，35 个重点资产中 22 个有闭合日线历史；缺失历史保留空值，并显示真实来源及可用窗口。修复稳定币过滤、双榜 Top 300、非法 BTC 报价、当日未闭合历史点，以及旧缓存/旧排名伪刷新。Watch 快照为 19:18，493 个资产、93 个真实近期事件、415 个报价，19 个原生来源请求成功；Alpha 未知日期不再伪造，停牌库存排除，Bitget 仅确认市场存在且披露日期缺失，Coinbase 披露前 500 个产品覆盖限制。新增原子静态 Watch / BTC 热度快照、浏览器回退和失败保留旧数据；BTC 热度时间 19:11，14 个指标。新增 pnpm sync:watch / test:markets，默认构建复用真实快照时间；修正原生报价整批失败与 Node / Worker 库存差异。验证：47 项市场回归测试、typecheck、局部 ESLint、Worker dry-run 打包、最终 Next 静态构建（6131 页）、三语导出校验、独立增量审查与 diff 检查通过；浏览器验证最新时间、筛选、中文/英文/日文覆盖提示及 BTC 热度回退，未见运行错误。未提交或部署。

- **2026-10-13**：按用户截图反馈，将全站语言切换统一为顶部唯一的原生下拉菜单，移除文章标题下方的重复切换控件。菜单保留 zh-CN / en / ja、当前语言、键盘操作和焦点提示；选择时读取最新 URL query/hash，有译文时打开对应译文，没有译文时标注“浏览文章”并打开目标语言列表。更新文章提示与 `docs/multilingual-content.md`，并忽略本地 `.wrangler` 预览生成目录。验证：局部 ESLint、typecheck、独立窄范围审查、完整构建（6131 页）、`pnpm check:i18n` 与 diff 检查通过；浏览器确认文章只有 1 个语言下拉、重复文章控件为 0，中英文译文切换保留 `?q=QTC#tldr`，日文回退正确，浏览器无运行错误；预览已刷新到英文 Quantus 挖矿指南。未提交或部署。

- **2026-10-13**：完成全站 `zh-CN / en / ja` 界面与内容机制适配，新增 `/zh-CN`、`/en`、`/ja` 静态入口，保留旧地址；通过 `(legacy)`、`(legacy-articles)` 与 `(localized)/[locale]` 根布局生成正确的 SSR `html lang`，覆盖首页、博客、文章、研究地图、10 个主题、随想及 6 个看板。导航、FAQ、筛选、空状态、动态说明、日期及 SEO / JSON-LD 已支持三语；博客搜索、主题、语言和分页进入 URL，语言切换保留查询与片段。内容编译器升级为三语 `translationKey / sourceSlug / translations` 分组，兼容旧 `zh` 与双语配对，按真实译文生成文章入口和 hreflang，Research registry 按原文去重；新增分语言 RSS，混合 RSS 保留历史 GUID。修复 GIB 表情符号误判日文、主题筛选漏掉中文译文、旧推荐卡片失效链接与 SPOT 证券代码误翻译。新增 `pnpm test:i18n`、`pnpm check:i18n` 和 `docs/multilingual-content.md`，维护脚本路径随路由迁移更新；logo 校验读取真实 PROJECTS 并支持已有 initials fallback。按用户最新范围，本轮未翻译或修改历史正文，当前 3022 篇（中文 180、英文 2842、日文 0），共 3013 组；registry 保持 2828 projects。验证：31 项测试、content:check、typecheck、lint（0 error、28 个历史 warning）、最终 Next build（6131 页，2 个既有 broad-pattern warning）、63 个三语入口与全部文章/旧地址的导出校验、浏览器手机及桌面视图、语言切换/搜索/主题筛选/文章切换/日文空状态均通过，浏览器未见运行错误。未调用 Surf 或外部翻译服务；未提交或部署。

- **2026-10-13**：按用户提供材料新增 Quantus（QTC）矿池现状与挖矿接入指南的中英文研究，创建 `content/blog/2026/research/quantus-qtc-mining-pools-setup-guide.mdx` 与 `content/blog/2026/research/quantus-qtc-mining-pools-setup-guide-en.mdx`。两版完整覆盖 Kryptex、LuckyPool、Quanpool、K1Pool、JetskiPool、Qelvpool 等矿池，矿池集中度与费率口径差异，SRBMiner、HiveOS、K1Pool 及官方 `quantus-node + quantus-miner` 接入，Wormhole 奖励地址、版本兼容、监控、故障排查、防火墙和收益公式。新增通用 `researchProjectSlug` frontmatter 与 registry 过滤逻辑，使同一项目的专题研究可独立发布而不重复计入 Research Map；两篇新文均归属既有 Quantus 主报告，registry 保持 `2828` projects 且仅有一个 Quantus 项目。同步更新 `src/data/skill.md` 说明该工作流。本次未调用 Surf 或额外联网刷新。验证：`pnpm sync:research:registry -- --check "Quantus QTC"`、`pnpm content:check`（scanned 3022 MDX files）、`pnpm check:research:logos`、`pnpm typecheck`、`pnpm build`（3046 个静态页面）与 `git diff --check` 均通过；中英文各有 25 个正文标题，静态 HTML 已生成互指语言链接和 `hreflang`；构建仅保留 `src/data/blog.ts` 现有的 2 个 Turbopack broad-pattern warning；未提交 commit。

- **2026-10-12**：按用户提供材料新增 Quantus（QTC）中英文深度研究，创建 `content/blog/2026/research/quantus-qtc-post-quantum-payment-l1-research.mdx` 与 `content/blog/2026/research/quantus-qtc-post-quantum-payment-l1-research-en.mdx`。两版完整覆盖后量子支付定位、ML-DSA / ML-KEM、ZK Wormhole、QPoW、主网与 NEAR 流动性入口、创世分配和 2027 年解锁、估值口径、审计边界、风险矩阵及三种情景，并通过 `language` 与 `translationSlug` 互相配对。报告明确区分项目仪表盘、协议设计指标和长期生产验证，核心判断为技术路线值得跟踪，但 1.33% 低流通、早期算力安全、跨链流动性和未来解锁使其仍属于高风险观察资产。`pnpm sync:research:registry -- --check "Quantus QTC"` 已同步 registry 与 candidates，Research Map 更新为 `2828` projects 且英文译文不会重复索引；`pnpm sync:research --add` 仍因现有 `research-client.tsx` 缺少插入点退出，未产生脚手架文件。本次未调用 Surf 或额外联网刷新。验证：`pnpm content:check`（scanned 3020 MDX files）、`pnpm check:research:logos`、`pnpm typecheck`、`pnpm build`（3044 个静态页面）与 `git diff --check` 均通过；两版均有 18 个正文标题和 18 个证据链接，静态 HTML 输出互指语言链接及 `inLanguage: zh-CN / en-US`；构建仅保留 `src/data/blog.ts` 现有的 2 个 Turbopack broad-pattern warning；未提交 commit。

- **2026-10-06**：按用户提供的最新材料升级既有 Dolphin 研究报告，更新 `content/blog/2026/research/dolphin-pod-defi-infrastructure-token-value-capture-risk.mdx`，保留原 slug 和 URL，避免 Research Map 生成重复项目。新版明确 Dolphin AI / Dolphin Network 的 Base 合约与 DPHN → POD 迁移，补充 Peer-to-Pool 推理网络、市场与交易所催化、代币分配和地址集中度、收入回购敏感性、风险及三种情景，并将发布日期更新为 `2026-10-06`。`pnpm sync:research:registry -- --check "Dolphin POD"` 已同步 registry 与 candidates，Research Map 仍为 `2827` projects 且仅保留一个 Dolphin 条目；本次未调用 Surf 或额外联网刷新。验证：`pnpm content:check`（scanned 3018 MDX files）、`pnpm check:research:logos`、`pnpm typecheck`、`pnpm build`（3042 个静态页面）与 `git diff --check` 均通过；构建仅保留 `src/data/blog.ts` 现有的 2 个 Turbopack broad-pattern warning；未提交 commit。
