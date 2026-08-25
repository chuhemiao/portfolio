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
**部署**：Vercel、Cloudflare
**工具**：pnpm、Figma、Notion

---

## 当前项目

### 1. Portfolio（本项目）

- **Repo**：chuhemiao/portfolio
- **Stack**：Next.js 16 + TypeScript + Tailwind + MDX
- **部署**：Vercel → kkdemian.com
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
  ```
- **当前 Research 进度（2026-07-07）**：registry `2811` projects；candidate total `3815`，pending new candidates `381`；depth upgrade queue `0`；本轮最新 1000 篇 depth audit 全部 full-depth pass。注意 raw pending 中仍可能有已被 registry 覆盖的旧候选，新增前以 `generate-cmc-cgo-research-batch --list-only` / registry 过滤结果为准。
- **当前 Skill / 工作流**：当前安装目录未发现旧 `research-map-builder` skill；本仓库以 `src/data/skill.md` 作为当前 repo-local Research Map workflow reference，核心原则是 Surf-first、先本地查重、再写 MDX、再同步 `/research` 与 registry。批量 CMC/CGO 新增使用 `scripts/generate-cmc-cgo-research-batch.mjs`，Surf 子命令已加 timeout 防止长时间挂起，并已补 registry 二次过滤、非拉丁 slug fallback、CoinGecko API 兜底开关、DefiLlama fallback seeding、Surf credit-error 短路、`sync:research --skip-logos` 与大型 `/research` typed array 同步兼容。
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
- **代码**：不要加不必要的注释、docstring、type annotation；不要过度封装
- **包管理**：使用 pnpm，不要用 npm 或 yarn
- **提交**：需要我确认才提交，不要自动 commit
- **Crypto 数据源**：涉及 watch、oscillator、market、listing、price、wallet、DeFi、on-chain、research 数据刷新时，优先直接使用 Surf skill/API，文档为 `https://agents.asksurf.ai/docs`；先按 Surf skill 查询 `surf list-operations` 与具体命令 `--help`，只有 Surf 无数据、报错或用户指定其他来源时才切换到 CoinGecko、CMC、交易所 API 或普通网页搜索。

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

- **2026-08-25**：按用户要求发布新的 thoughts 文章“Self-Harness：当智能体开始修改自己的操作系统”，创建 `content/blog/2026/thoughts/self-harness-agent-operating-system.mdx`，frontmatter 为 `publishedAt: 2026-08-25`、`category: thoughts`、slug `self-harness-agent-operating-system`。正文基于用户提供内容，清理开头 HTML 实体并保留核心论述：agent 表现由模型与 harness 共同决定；Self-Harness 将 Weakness Mining、Harness Proposal、Proposal Validation 变成目标模型内部的可审计自我改进循环；Terminal-Bench-2.0 held-out 提升说明修改更像机制泛化而非死记硬背，但仍受封闭基准、验证器质量和高风险验收门不足等边界限制。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2991 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-21**：按用户要求添加最新研究“Aligned（$ALIGN）- 技术、代币与投资价值深度研究”，创建 `content/blog/2026/research/aligned-align-zk-proof-verification-infrastructure-token-value-capture-risk.mdx`，frontmatter 为 `publishedAt: 2026-08-21`、`category: research`、slug `aligned-align-zk-proof-verification-infrastructure-token-value-capture-risk`。正文基于用户提供附件，核心结论为 Aligned 将昂贵、碎片化的 ZK proof verification 做成共享基础设施，试图成为 Ethereum / EigenLayer 上的证明验证层；项目逻辑强于当前代币逻辑，投资判断聚焦真实证明需求、EigenLayer AVS 安全假设、`$ALIGN` token value capture、低流通高波动与 2027 年 8 月前后的大额 cliff 解锁压力。同步在 `src/data/research-projects.ts` 新增 Research Map 索引 `Aligned / ALIGN`，类型 `ZK`，不新增 logoUrl，沿用现有 fallback logo 行为；运行 `pnpm sync:research:registry` 后 registry 为 `2819` projects。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2990 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、registry 查重可命中 Aligned；未提交 commit。
- **2026-08-21**：按用户要求新增最新 thoughts 文章“美国 SEC「加密资产条例」深度报告 — 规则拆解与市场定价”，创建 `content/blog/2026/thoughts/sec-regulation-crypto-assets-market-pricing.mdx`，frontmatter 为 `publishedAt: 2026-08-21`、`category: thoughts`、slug `sec-regulation-crypto-assets-market-pricing`。正文基于用户提供附件，保留 SEC 于 2026-08-18 提出 `Regulation Crypto Assets`、`$5M / 4 年` 初创豁免、`$20M` 与 `$75M / 12 个月` 两档融资豁免、“毕业”安全港、代币化股权仍不适用、BTC/XRP/ETF/爆仓市场定价、`sec_perf`、`etf_flow` chart 占位与 `sec_basket` tokentable 占位等内容。核心结论为这是一条针对网络代币发行经济学的中期结构性变量，但仍是提案而非落地规则，不能等同于代币化股权开闸。本轮未调用 Surf skill/API；曾做一次网页轻核验搜索但未采用额外来源改写正文；验证：`pnpm content:check` 通过（scanned 2989 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-15**：按用户要求添加最新研究“StonkBrokers ($STONKBROKER) - Diligence”，创建 `content/blog/2026/research/stonkbrokers-stonkbroker-robinhood-chain-nftfi-diligence.mdx`，frontmatter 为 `publishedAt: 2026-08-15`、`category: research`、slug `stonkbrokers-stonkbroker-robinhood-chain-nftfi-diligence`。正文基于用户提供附件，核心结论为 StonkBrokers 是 Robinhood Chain 上已 live 的早期 NFTFi app，ERC-6551 broker NFT、Anvil AMM、Clock In/Overtime stock-token drops、Cayman operator 等已确认，但 `$STONKBROKER` 更像购买 NFT 的高 beta 筹码而非现金流 token；NFT collection 约 `$100M` 估值与 lifetime stock-token distributions `$1.22M` 的覆盖差距使其应归类为 speculative。同步在 `src/data/research-projects.ts` 新增 Research Map 索引 `StonkBrokers / STONKBROKER`，类型使用现有 `RWA` 以保持 research filter 契约；运行 `pnpm sync:research:registry` 后 registry 为 `2818` projects。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2988 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；未提交 commit。
- **2026-08-11**：按用户要求新增 thoughts 文章“一年五十块，我用日版手机开了张爱沙尼亚号码保号”，创建 `content/blog/2026/thoughts/estonian-esim-gg-backup-number-iphone.mdx`，frontmatter 为 `publishedAt: 2026-08-11`、`category: thoughts`、slug `estonian-esim-gg-backup-number-iphone`。正文基于用户提供的一手体验，保留日版 iPhone 原生 eSIM、esim.gg/乌龟电信、爱沙尼亚 Elisa 号码、Google 登录、支付宝付款、首期开卡加首充约 `32.5` 元、长期留 `3-5` 欧元余额缓冲、年度手动连一次基站、备用号而非身份根等判断。同步将两张截图复制到 `public/article/esim-gg-estonian-number-recharge.png` 与 `public/article/esim-gg-estonian-number-line.png` 并在文章中引用。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2987 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-10**：按用户要求新增产品思考内容并翻译英文版：创建中文 `content/blog/2026/thoughts/mainstream-cex-listings-five-year-frequency-cycle-cross-listing.mdx`，标题“主流 CEX 上币 - 过去 5 年频率、周期与交叉上新”，并创建英文版 `content/blog/2026/thoughts/mainstream-cex-listings-five-year-frequency-cycle-cross-listing-en.mdx`，标题“Major CEX Listings - Five-Year Frequency, Cycles, and Cross-Listings”。两篇均为 `category: thoughts`、`publishedAt: 2026-08-10`，正文基于用户提供的 Surf Exchange Listing Events 统计，保留 2021-08-10 至 2026-08-10 五家 CEX（Coinbase/Binance/OKX/Bybit/Upbit）`5,591` 条 listing events、`2,372` 次 token-exchange first listings、`1,323` 个去重 symbols、`558` 个交叉上新 symbols、`192` 个 30 天内级联、Bybit/OKX/Binance 7-30 天联动、Coinbase/Upbit 二次确认、`cex_new_assets_quarterly` 和 `cex_pairwise_overlap` chart 占位等内容。核心结论为上币 alpha 应拆成早期发现、流动性确认、区域确认三层。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2986 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-10**：按用户要求新增产品思考内容并翻译英文版：创建中文 `content/blog/2026/thoughts/agent-to-earn-agent-economy-startup-investment-memo.mdx`，标题“Agent to Earn - Agent Economy 创业与投资备忘录”，并创建英文版 `content/blog/2026/thoughts/agent-to-earn-agent-economy-startup-investment-memo-en.mdx`，标题“Agent to Earn - Agent Economy Startup and Investment Memo”。两篇均为 `category: thoughts`、`publishedAt: 2026-08-10`，正文保留 Agent to Earn 第一性原理、现实证据、x402/AP2/ACP/Circle/Visa/Mastercard 支付基础设施、Agent Wallet + Policy OS、ERC-8004、市场规模情景、Top 10 startup ideas、Agent Treasury & Payment OS one big bet、`agent_economy_tokens` tokentable 占位等内容。核心结论为 Agent to Earn 不是“运行 Agent 挖 Token”，而是 Autonomous Economic Agents 的金融基础设施；最值得做的是 Agent Treasury & Payment OS。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2984 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-03**：按用户要求继续新增两篇 Trust Wallet / Coldcard 相关 thoughts：创建 `content/blog/2026/thoughts/cz-coldcard-trust-wallet-prng-reimbursement-risk.mdx`，标题“CZ冷卡发言 - Trust Wallet赔付背书与旧风险”，核心结论为 CZ 用 Trust Wallet 旧 PRNG 赔付作为责任背书，短期提升“责任信任”，但会放大专业用户对旧弱随机种子、$12M/2023 年 `$170k`/Ledger `$30M` 风险敞口/2025 年 `$8.5M` 扩展事件口径差的透明度审查；同时创建 `content/blog/2026/thoughts/trust-wallet-12m-reimbursement-public-reconciliation-framework.mdx`，标题“Trust Wallet $12M赔付 - 公开对账验证框架”，核心结论为公开资料能验证漏洞存在和部分损失口径，但不能仅靠公开资料验证 `$12M` 已逐笔赔付完成，Trust Wallet 至少需要“损失账、资格账、付款账”三账合一，并提供 Merkle/审计/付款状态等披露。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2982 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-03**：按用户要求继续新增 thoughts 文章“BitGo - Coldcard种子风险后的托管重估”，创建 `content/blog/2026/thoughts/bitgo-coldcard-seed-risk-custody-repricing.mdx`，frontmatter 为 `publishedAt: 2026-08-03`、`category: thoughts`、slug `bitgo-coldcard-seed-risk-custody-repricing`。内容基于用户提供附件正文，核心结论为 Coldcard 种子风险给 BitGo 带来机构托管需求窗口，但不是无成本利好；机构客户会同步抬高对 key generation、HSM/MPC、多签、SOC/审计、保险、资产隔离、应急迁移和 root-of-trust 的尽调要求。正文保留 BitGo 官网、机构托管指南、法律披露、Coinkite/Block 技术分析、River 流入与多托管商竞争格局等引用。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2980 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-03**：按用户要求新增 thoughts 文章“Bitcoin - Coldcard漏洞后的托管路径”，创建 `content/blog/2026/thoughts/bitcoin-coldcard-vulnerability-custody-path.mdx`，frontmatter 为 `publishedAt: 2026-08-03`、`category: thoughts`、slug `bitcoin-coldcard-vulnerability-custody-path`。内容基于用户提供正文，核心结论为 Coldcard 事件会让 Bitcoin 边际上更依赖机构托管，但不会直接走向“机构托管主导一切”；更可能形成两极化结构：非技术用户与被动资金转向 ETF/合规托管，高净值与主权型用户升级到多厂商多签、强 passphrase、独立熵源和协作托管。正文保留 `btc_exchange_netflow_coldcard` chart 占位与 CEX/ETF/旧币迁移监测指标。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2979 mdx files）、`git diff --check` 通过；未提交 commit。
