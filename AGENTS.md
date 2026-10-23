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
- **内容交付**：内容完成后无需启动或打开页面预览；保留必要的内容、语言分组和构建检查。
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

- **2026-10-23**：按用户材料新增 thoughts「a16z『永续合约只是开始』：市场供给侧革命与风险基础设施」，canonical 为 `a16z-perpetuals-market-supply-revolution-risk-infrastructure`，补齐 `-en`、`-ja` 标题/摘要/完整正文，各18标题、5表（37表行）、7条来源链接。中文除H1入元数据与新增整理说明外逐字保留；三语保留四市场前提、HIP3 500000HYPE/183天及运营责任、HIP4原语上线不等于任意事件完全开放、预IPO永续非股票/配额/投票权、运行率与季度累计及平台名义口径不可混用、成交量非token价值等限定。明确2026-10-23为发布日期非刷新日，保留各观察窗口/10-22附近快照，本轮未独立联网核验；memory stocks待纠正译文未随材料附上，未建立后续自动监控或执行投资。独立审查发现JA施罚主被动两处歧义，已窄修为验证者主动施罚并复核关闭。20项语言分组/文章选择测试、独立三语全文/数字/链接审查、content:check（7290MDX）、完整构建（7385页含类型检查）、66语言入口/全部正文/三语feeds及7290旧地址跳转只读校验、新文三语正文/18目录/5表/7链接/语言映射与diff检查通过。仅新增思考，Map/registry未改；此前两篇股票代币化共6MDX与日志未提交改动保留。未调用Surf或外部翻译服务，未打开预览，未提交或部署。

- **2026-10-22**：按用户两份本地 Markdown 分别新增 thoughts「股票上链之后：谁将重建全球资本市场的交易、结算与资产管理？」与「全球链上股票与 RWA 市场深度研究报告 2026」，canonical 为 `stock-tokenization-2026-trading-settlement-asset-management`、`tokenized-equities-rwa-2026-market-structure-onchain-index-funds`，各补齐 `-en`、`-ja` 完整标题/摘要/正文，共6个MDX；第一篇各10标题、0表、14独立URL（29引用），第二篇各30标题、4表、15独立URL（39引用）及无URL的S16。中文除H1入元数据、正文编号补原URL直链及资料整理说明外逐字保留；三语完整保留AUM/转移/地址口径、56%=49pp+7pp、80%与70%非同口径、三种证券权利与准入限制、PAR/CAR和2030情景非预测、BFunds规划非上线、raw/UI会计与多资产Vault非ERC4626等边界，英日金额与公式核对通过。明确本轮未独立联网核验、CoinFound原稿未附，不执行文内开发建议或建立周/月监控。只新增思考，Research Map/registry未改（2842项目）；未调用Surf或外部翻译服务。独立6文全文审查、20项分组/文章选择测试、content:check（7287MDX）、完整构建（7382页含类型检查）、66语言入口/全部正文/三语feeds及7287旧地址跳转只读校验、6篇新正文/目录/表格/语言映射与diff检查通过。按用户偏好未启动或打开预览，未提交或部署。

- **2026-10-21**：按用户材料新增 research「APRO（$AT）：业务、代币与交易结构研究」，创建 `apro-at-oracle-business-token-trading-structure-research` 的中文、`-en`、`-ja` 完整版本，各 14 个标题、4 张表格、10 条来源链接与 2 条合约地址；Research Map 新增唯一 Oracle 卡片与三语说明，Map2820、registry2842，仅计源文1项。保留 2026-10-21 14:11 UTC 材料快照、聚合24h -45.1%与Binance +0.5%冲突、770M非当前流通不等于确定待解锁批次、各链持仓分母不同不可相加/不等于团队、转账不等于用户增长、融资口径与业务价值捕获未验证等限制；明确Bithumb预告22:00KST=13:00UTC已早于快照，但实际开盘未核实。价格图位改为原有 .701/.136 两观察值，未补造历史曲线。未调用Surf、外部翻译服务或独立联网核实，未执行文中后续监控建议。独立三语全文与数值/地址/URL审查、27项语言及卡片专项测试、局部ESLint、logo校验、content:check（7281MDX）、完整构建（7376页含类型检查）、66语言入口/全部正文/三语feeds及7281旧地址跳转只读校验通过；新文产物三语正文/14目录/4表/语言映射检查通过。最新100深度诊断11pass/89needs-upgrade，新APRO三语如实待增强，不补造来源或凑篇幅。旧sync:research插入点失败，已直接更新实际数据源；registry旧解析器将APRO作为symbol，正文和卡片明确AT，本轮不扩展旧脚本。按用户偏好未启动或打开页面预览；保留AXIS/Capybobo基线改动，未提交或部署。

- **2026-10-21**：按用户材料新增 research「Capybobo（$PYBOBO）：GameFi、潮玩 IP 与供应风险研究」，创建 `capybobo-pybobo-gamefi-ip-supply-concentration-research` 的中文、`-en`、`-ja` 完整版本，各 10 个标题、5 张表格、5 条来源链接及 3 条链合约地址。通过 researchProjectSlug 关联旧 Capybobo 项目，旧研究原文保留；Research Map 原卡片改为 GameFi 并指向新报告、补齐三语说明，不重复计入，Map2819、registry2841。保留 2026-10-21 14:00 UTC 材料快照、100B 市场供应与官网 10B PYBOBO + 1B CROCO 冲突、未确认迁移、缺失解锁日历不代表无解锁、地址集中非已识别团队持仓、注意力非产品使用等限制；图表占位改为高点、低点、当前区间 3 组已知观察值，未补造连续曲线。未调用 Surf、外部翻译服务或独立联网核实。独立三语全文/数字/链接/地址审查、27 项专项测试、局部 ESLint、logo 检查、content:check（7278 MDX）、完整构建（7373 页含类型检查）、66 个语言入口/全部正文/三语 feeds/7278 旧地址跳转只读检查通过。最新100深度诊断12pass/88needs-upgrade，新报告三语仍如实待增强；旧 sync:research 插入点失败，已直接更新真实数据源。用户新增偏好：内容完成后不需要预览，已记录并停止后续浏览器预览。保留此前 AXIS 未提交改动，未提交或部署。

- **2026-10-21**：按用户提供的英文 review 新增 research「AXIS Robotics：研究简报审阅与分阶段尽调框架」，原文 canonical 为 `axis-robotics-research-brief-review-evidence-diligence-framework`（en），完整中文 `-zh-CN` 与日文 `-ja` 共组，各 19 个标题、3 张表格。明确材料是对未随附原始任务书的审阅，原任务书/合约地址/代币分配表/论文/仓库/数据集/来源 URL 未提供；7.3M+ 轨迹、50K+ 演示和100%分配等仅为原 review 对任务书的声称，未独立核验；未执行文中建议的下载、实验、客户或链上调查。四阶段及技术/业务/代币/投资独立判断完整保留，结论 INVESTIGATE FURTHER 为研究状态而非可投资；本次不调用 Surf、外部翻译服务或联网核实，日期为发布日非核验日。新增唯一 AXIS Robotics AI/DePIN 卡片及三语待验证说明，Map2819、registry2841且仅1英文原文条目；旧sync:research插入点仍失败，已更新真实数据源。最新100深度诊断13pass/87needs-upgrade，AXIS三语均如实待增强，0外链不补造。修复新日文一处引号相邻粗体显示后独立全文审查通过；27项语言分组/选择/研究本地化专项测试、局部ESLint、logo校验、content:check（7275MDX）、完整构建（7370页含类型检查）、66语言入口/全部正文/三语feeds/7275旧地址跳转只读检查与diff检查通过。浏览器确认唯一语言下拉、真实三语全文、日文19目录目标与Map唯一对应卡片，无控制台错误。未自动提交或部署。

- **2026-10-19**：按用户材料新增 thoughts「Collector Crypt（$CARDS）：代币经济学、回购与供给压力」，创建 `collector-crypt-cards-tokenomics-buybacks-unlocks-value-capture` 的中文、`-en`、`-ja` 完整版本，各 8 个标题、8 张表格、4 条来源链接、3 段钱包/池标识符。保留 2026-10-01 官方供应快照与 2026-10-19 价格/回购观察、44.6M 月度锁仓释放修正旧59M口径、基金会/社区已解锁非流通供给、回购预算非实际买入、非强制回购、毛利非持币人法定或链上现金流权、解锁非必然卖出等限制。校正并在三语正文及资料说明标注 .3M/11.6M=2.6%（非不到1%）、902.6M*.275≈248.2M（非255M）、相应毛利倍数2.4x（非2.5x）；明确「两种流通量差额」指供应口径，原链上实测归属用户材料观察，本轮未实测或联网核实。两处图表占位由已有对照表承载，未造历史曲线。未调用 Surf 或外部翻译服务，未改旧CC研究、赛道思考或Research Map。内容检查（7272 MDX）、完整构建（7367 页含类型检查）、独立三语全文/数字/地址审查及diff检查通过；按当前redirect结构只读验证66个语言入口、全部正文/三语feeds及7272旧地址跳转通过。浏览器确认唯一语言下拉、真实三语全文、8表、日文全部目录和thoughts分类唯一对应卡片，无控制台错误。未提交或部署。

- **2026-10-19**：按用户材料新增 research「PopDEX（BTCUSDT 永续）：全链上订单簿、MegaPop 与风险研究」，创建 `popdex-btcusdt-perpetual-clob-megapop-risk-research` 的中文、`-en`、`-ja` 完整版本，各 17 个标题、5 张表格、19 次链接引用（13 个独立 URL）。保留 2026-10-19 UTC 快照、VIP 全档费率含负 Maker、MegaPop 奖池比例非中奖概率/非确定返佣、MMR 100%/160% 与盈利对手方 ADL、桥接审计非全协议审计、无可核验原生 Token/TGE、官方/第三方成交量与年化收入不同口径；原地区访问受限提示明确归属用户材料，本轮未实测交易页、未调用 Surf 或独立联网核实。TVL 图位替换为 4 个已知观察点并保留 $71.55M/$71.57M 各自口径。Research Map 新增唯一 Perp DEX 卡片及三语说明，2818 张卡片；registry 2840 项（+1 PopDEX、补索引既有 10 篇），并更新两处 Backpack 候选映射。旧 sync:research --add 插入点仍失败，已直接更新真实数据源；registry 旧解析器误将 BTCUSDT 作为 symbol，用户卡片不展示为平台币。最新 100 篇深度诊断 14 pass / 86 needs-upgrade，PopDEX 三语如实待增强，不补造内容凑门槛。内容检查（7269 MDX）、局部 ESLint、logo 检查、完整构建（7364 页含类型检查）、独立全文审查、66 个语言入口/全部正文/三语 feeds/7269 旧地址跳转只读校验及 diff 检查通过；全套 i18n 测试 51/53 通过，两项既有失败来自 Telegram 已增至 126 条而测试/译文仍按旧 123 条，本轮未修改该数据。浏览器验证唯一语言下拉、三语全文、日文 17 个目录目标、Research Map 唯一卡片与译文入口，无控制台错误。未提交或部署。

- **2026-10-19**：按用户材料新增 thoughts「Physical TCG：Collector Crypt 与 Courtyard 深度调研」，创建 `physical-tcg-collector-crypt-courtyard-revenue-token-value-capture` 的中文、`-en`、`-ja` 完整版本，三语各保留 7 个标题、5 张表格和 6 条来源链接。保留 2026-10-19 数据快照、收入未扣卡牌采购成本/净留存 GMV 不等于利润、代币回购远小于解锁价值、流通量不等于累计解锁、两平台统计口径差异、线性外推及时间重合不证明因果等边界；原「增幅约 2.7 倍」按 400.8/146.2 校正为「约为 Q1 的 2.7 倍」。两图占位由原有对照表承载并说明无完整历史序列，未补造曲线。已有 Collector Crypt 单项目 Research 原文及 Research Map 均未修改。未调用 Surf 或外部翻译服务，未独立联网核实；前轮 Papertrade 未提交改动已保留。内容检查（7266 MDX）、完整构建（7361 页，含类型检查）、独立全文与金额单位校验及 diff 检查通过；沿用适配当前 redirect stub 的只读检查，66 个语言入口、全部 7266 正文/三语 feeds 及 7266 旧地址目标/canonical/lang/query/hash 校验通过，未修改已知不兼容的旧 check:i18n 脚本。浏览器确认顶部唯一语言下拉、真实三语全文、5 表格、全部日文目录及 thoughts 分类唯一卡片，无控制台错误。未自动提交或部署。

- **2026-10-19**：按用户材料新增 thoughts「Papertrade（$PAPER）：机制、交易、链上数据与代币研究」，创建 `papertrade-paper-mechanism-trading-onchain-token-risks` 的中文、`-en`、`-ja` 完整版本，三语各保留 6 个标题、6 张表格、12 条来源链接及铸造公式和钱包标识。保留 2026-10-19 约 06:15 UTC 快照、House 与净多头敞口及 3.4% 条件性压力估算、亏损铸币、PnL/overflow 分配、收入衰减、预言机操纵事件、审计未见公开报告、代币不可转账与无市场价格、仿盘风险；Dashboard 奖励 $54.06M 与 DefiLlama 分配 $56.14M 保留各自口径。原 TVL 图表占位改为材料已有的 $102.09M / $64.5M 两个观察点，未补造每日曲线，文末说明本次未调用 Surf 或独立联网核实。仅新增思考，未修改 Research Map。内容检查（7263 MDX）、完整构建（7358 页，含类型检查）、独立全文审查及 diff 检查通过；原 check:i18n 因现有旧地址改为 redirect stub 而错误要求正文失败，另以只读校验验证 66 个语言入口、7263 正文/三语 feeds 以及全部 7263 redirect 的目标/canonical/lang/query/hash 保留通过，未修改旧检查脚本。浏览器确认顶部唯一语言下拉、真实三语全文、日文全部目录目标、thoughts 分类唯一对应卡片，无控制台错误。现仓库已移除 preview 命令，本地使用 pnpm dlx serve out -l 8788 预览。未提交或部署。

- **2026-10-16**：按用户材料新增 thoughts「SurfBoard NFT（Robinhood Chain）：机制、估值与风险」，创建 `surfboard-nft-robinhood-chain-mechanism-valuation-risk` 的中文、`-en`、`-ja` 完整版本，三语各保留 26 个标题、6 张表格、14 条来源链接、合约与 epoch 交易哈希。6 个 LaTeX 公式改为可直接渲染的文本公式，保留 2026-10-16 05:29 UTC 快照、APR 过去 7 天年化且非保证收益、普通开启与 Max Ticket 概率池差异、供应及领取资格版本差异、95% 赎回规则、股票代币债务证券不等于底层股票所有权、封存持仓不等于全系列 NFT 集中度等边界。原材料止于「95% 赎」，仅依据前文整理为赎回实际执行监控项，并在三语资料说明注明，未推补其他缺失尾文。未调用 Surf 或外部翻译服务，未独立联网核实，未修改 Research Map。当前 7230 MDX、3016 组、2104 组完整三语，历史 pending 仍 912。内容检查、完整构建（14547 页，含类型检查）、63 个三语入口与全部文章/旧地址/RSS 导出检查、独立全文审查及 diff 检查通过；浏览器确认单一语言下拉、三语全文、6 张表格及日文 thoughts 分类唯一卡片，无控制台错误。保留此前 NeoSoul 未提交改动，本次未自动提交或部署。
