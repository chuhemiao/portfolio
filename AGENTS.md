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
- **当前 Research 进度（2026-07-06）**：registry `511` projects；candidate total `357`，pending new candidates `59`；depth upgrade queue `0`；下一批新增候选从 `Genius / GENIUS`、`Data Network / DATA`、`Midas mF-ONE / MF-ONE` 开始；当前最近 140 篇 depth audit 全部 full-depth pass。
- **当前 Skill / 工作流**：当前安装目录未发现旧 `research-map-builder` skill；本仓库以 `src/data/skill.md` 作为当前 repo-local Research Map workflow reference，核心原则是 Surf-first、先本地查重、再写 MDX、再同步 `/research` 与 registry。
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

- **2026-07-06**：按用户要求“继续增加 cmc 和 cgo 的深度研究文章，目标 100 篇”，在上一轮 30 篇基础上继续从 pending candidates 选择 100 个新增项目，优先 DefiLlama/CoinGecko ID 候选，再补 Surf backlog，并用 registry 覆盖过滤避免重复写入已存在项目。扩展 `scripts/generate-cmc-cgo-research-batch.mjs`：新增 `--from-pending`、`--target-count`、`--list-only`，支持无 CoinGecko ID 的 CMC/CG 搜索兜底链接，并用 `registry.json` 二次去重。新增并接入 100 篇 full-depth Research，`sync:research --add` 追加 100 个 `/research` scaffold，registry 更新为 `511` projects、pending new candidates `59`、upgrade queue `0`。验证：`surf install/sync/list-operations` 和目标命令 help 已执行；`node --check scripts/generate-cmc-cgo-research-batch.mjs` 通过；候选 list-only 为 100 个（61 DefiLlama/CG、39 Surf，无上轮 30 篇重复命中）；生成日志 `wrote` 100；`pnpm audit:research:depth -- --limit 140 --write` 通过（140/140 full-depth pass，新增 100 篇 `failedTargets: 0`、最低 6308 words、29 links、214 table lines）；`pnpm check:research:logos` 通过（511 projects）；`pnpm exec tsc --noEmit` 通过；`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余数据风险：long-tail/RWA/meme/Surf-only 项目中 67 个条目有至少一个 Surf endpoint 缺口，主要是 project-detail 或 DeFi metrics，需要后续人工 primary-source 加强。
- **2026-07-06**：按用户要求“继续增加 cmc 和 cgo 的深度研究文章，目标 30 篇”，从本地 CoinGecko/CMC-oriented pending candidates 中新增并接入 30 篇 full-depth Research：`SSV Network`、`Babylon Protocol`、`Rocket Pool`、`Obol`、`Tornado Cash`、`mETH Protocol`、`Merlin Chain`、`QuickSwap`、`Stader`、`Dolomite`、`KPK`、`PinkSale`、`Tectonic`、`Yield Basis`、`Beefy Finance`、`Stake DAO`、`Renzo`、`BENQI`、`f(x) Protocol`、`BlazeStake`、`Enzyme Finance`、`Frankencoin`、`Savings xDAI`、`AILayer`、`Staked USDT`、`Concentrator`、`ZEROBASE`、`Treehouse Protocol`、`ORIGYN Foundation`、`Brickken`。新增 `scripts/generate-cmc-cgo-research-batch.mjs`，使用 Surf-first refresh（先 `surf install/sync/list-operations` 和命令 `--help`），并补了 display override 与 `--overwrite`，避免 `merlin-chain` 等候选被 fuzzy match 带偏；`sync:research --add` 已追加 30 个 `/research` scaffold，registry 更新为 `411` projects、pending new candidates `158`、upgrade queue `14`。验证：`node --check scripts/generate-cmc-cgo-research-batch.mjs` 通过；`pnpm audit:research:depth -- --limit 100 --write` 通过（Full-depth pass `86`、needs upgrade `14`，新增 30 篇均未进入 needs-upgrade）；`pnpm sync:research:registry` 通过；`pnpm check:research:logos` 通过（411 projects）；`pnpm exec tsc --noEmit` 通过；`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余数据风险：Surf project/DeFi 对 `stUSDT`、`Concentrator`、`ORIGYN` 有部分 NOT_FOUND，需要后续人工 primary-source 加强。
- **2026-07-06**：按用户要求同步最新进度、当前 skill/workflow 与快捷添加内容脚本。新增 `scripts/quick-add-content.mjs` 与 `pnpm quick:add`，默认 dry-run、显式 `--write` 才写入 MDX，复用 `scripts/new-post.mjs` 避免重复生成逻辑；更新 `src/data/skill.md` 为 repo-local Portfolio Research Map workflow reference，记录 Surf-first、本地查重、MDX 写作、`/research` 同步、depth audit、候选池/升级队列语义。同步文档中当前进度：`pnpm status:research:run` 显示 registry `381`、candidate total `357`、pending new candidates `187`、upgrade queue `40`；当前安装目录未发现旧 `research-map-builder` skill。验证：`node --check scripts/quick-add-content.mjs`、`pnpm quick:add -- "..." --category research` dry-run、`pnpm status:research:run`、`git diff --check` 通过；`pnpm content:check` 仍预期受 3 篇 2019 旧文 `publishedAt` 格式影响。
- **2026-07-02**：按用户要求“继续增加这个项目为新的深度研究”处理 Arcium / ARX 附件草稿；本地 registry 查重发现 Arcium 已有 Research Map 条目，因此未新增重复 MDX，而是升级 `content/blog/2026/research/arcium-arx-confidential-computing-mpc-fhe-token-liquidity-risk.mdx` 为 full-depth Research。使用 Surf skill/API 刷新 project-detail、90d market-price、listing、token-tokenomics、social-mindshare、search-news、search-token、DeFi metrics，并抓取 Arcium 官方 home/build/ecosystem/tokenomics/docs/staking/pricing/MXEs/clusters、The Block、CG/CMC、GitHub 等来源。新结论：Arcium 是 Solana confidential compute / shared private state 的高 upside watchlist，核心 upside 是把 sealed-bid auctions、private order flow、Umbra/ZINC、confidential payments、AI/data collaboration 等变成 Solana 可组合隐私原语；核心风险是 ARX 不是直接 fee token，计算费用以 SOL 等原生资产支付，token value capture 依赖 staking/capacity/governance，且上市后价格发现、流动性衰减和 79.12% 初始锁定供应仍需验证。验证：`audit-report-depth --mode full` PASS（8264 words、26 evidence links、101 table lines、无缺失章节）、`pnpm sync:research:registry` 通过、`pnpm audit:research:depth -- --limit 100 --write` 通过（最近100篇 full-depth pass 60、needs upgrade 40）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-07-02**：按用户要求“根据之前的格式和要求，增加新项目的研究 tac”执行本地去重后发现 TAC 已有 Research Map 条目，因此未新增重复 MDX，而是升级 `content/blog/2026/research/tac-tac-ton-evm-bridge-telegram-distribution-risk.mdx` 为 full-depth Research。使用 Surf skill/API 刷新项目详情、90d 价格、listing、BSC transfer/holders、social、unlock、DeFi metrics、news，并抓取 TAC 官方 site/docs/tokenomics/mainnet/funding/post-mortem/Summoning 等 primary sources。新结论：TAC 是 TON / Telegram DeFi 分发层的高 beta watchlist / tactical 标的，核心 upside 是 EVM dApps 进入 Telegram/TON 用户层，核心风险是 2026-05 bridge exploit 后的信任恢复、真实 TVL/fee 数据缺口、BSC 口径筹码集中、unlock/treasury 透明度和 token value capture 未充分验证。验证：`audit-report-depth --mode full` PASS（7567 words、21 evidence links、131 table lines、无缺失章节）、`pnpm sync:research:registry` 通过、`pnpm audit:research:depth -- --limit 100 --write` 通过（TAC 在 audited 中 full-depth-pass）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-07-02**：用户明确要求“下次记住，直接使用 Surf 的 skill API（`https://agents.asksurf.ai/docs`）”。已写入工作偏好：后续涉及 watch、oscillator、market、listing、price、wallet、DeFi、on-chain、research 数据刷新时，优先使用 Surf skill/API，并先查 `surf list-operations` 与目标命令 `--help`；仅在 Surf 无数据、报错或用户指定其他来源时再使用 CoinGecko、CMC、交易所 API 或普通网页搜索。
- **2026-07-02**：按用户要求“根据之前的策略更新 watch 和 oscillator 的最新数据”。执行 `pnpm sync:oscillator`，将 `src/data/oscillator-manual-snapshot.ts` 更新到 `2026-07-02T02:24:35.850Z`，脚本输出 `481` 个 altcoins、`35` 个 focus rows；快照摘要为 trackedAltcoins `481`、researchFocusCount `29`、dualRankedCount `324`、binanceBtcPairs `49`、positive7dBreadth `5.41%`、positive30dBreadth `1.87%`、btcPrice `60208`。`/watch` 页面确认仍是 `dynamic = 'force-dynamic'`，无静态快照文件，运行时真实探测 `getWatchData()` 返回 `2026-07-02T02:25:30.454Z`、30 天窗口、`198` listings、Fear & Greed `19` Extreme Fear、Binance Alpha `5`、buySignals `0`。验证：`node --experimental-strip-types --test src/lib/oscillator-helpers.test.mjs src/lib/oscillator-snapshot.test.mjs` 通过（14/14）、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；同步脚本和探测命令仅有 Node typeless package warning。
- **2026-06-29**：按用户最新要求“先不升级旧文，继续新增项目20个”，暂停旧文扩写主线并净新增/接入 20 篇 full-depth Research：`OriginTrail / TRAC`、`Arkham / ARKM`、`Convex Finance / CVX`、`Cortex / CX`、`Neutrl USD / NUSD`、`Ozone Chain / OZO`、`Shuffle / SHFL`、`MultiversX / EGLD`、`Cygnus Finance Global USD / CGUSD`、`Felix feUSD / FEUSD`、`Magma Finance / MAGMA`、`WrappedM by M0 / WM`、`Four / FORM`、`Lista USD / LISUSD`、`UnifAI Network / UAI`、`Reserve Rights / RSR`、`Nexus Mutual / NXM`、`Allora / ALLO`、`Orca / ORCA`、`0x Protocol / ZRX`。全部 MDX 位于 `content/blog/2026/research/`，均接入 `src/app/research/research-client.tsx` 与本地 SVG logo，候选池状态已同步为 `researched`；`pnpm status:research:run` 显示 registry `381` projects、candidate total `357`、pending candidates `187`。验证：20 篇逐篇 `audit-report-depth --mode full` 全部 PASS（最低 `6504` words、至少 `26` evidence links）、`pnpm sync:research` 通过、`pnpm check:research:logos` 通过、`pnpm sync:research:registry` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。注意：旧文升级残留仍包括 `GALA`、`GoMining`、`GRXChain`、`Immutable` 等 modified 文件，未在本轮继续处理。
- **2026-06-28**：继续执行“升级最近100篇研报为万字级深度研报，同时增加100篇新项目研究”的多 agent 长任务，并修正候选池运行机制。当前进度：`pnpm status:research:run` 显示 `8/100` 篇旧研报已升级为 full-depth（`1inch`、`AB`、`Aethir`、`AI Rig Complex`、`Ape and Pepe`、`ApeCoin`、`apyUSD`、`Arweave`），`3/100` 篇净新增 full-depth 新研究已发布（`Aleo`、`Chainlink`、`USDGO`），另有 3 个同资产重复替换并归档旧短文（`LEO Token` 替换旧 LEO、`Venice AI / VVV` 替换旧 Venice AI、`Filecoin / FIL` 替换 typo 旧文 `FILCOIN`）。新增/替换 MDX 已接入 `/research` 卡片和本地 SVG logo；旧重复文改为 `category: 'research-archive'` 并加 `supersededBy`。候选池机制修正为三阶段：`pnpm sync:research:registry` 只做本地 registry/candidates 同步与高置信去重，不调用 CG/CMC；`pnpm seed:research:candidates` 才从 CG/Surf/CMC-like 排名源扩容候选池；单篇写作阶段才刷新 CoinGecko / CoinMarketCap / Surf / 官方源 / explorer / DefiLlama 等实时数据。同步更新 `research-map-builder` skill 与 `portfolio-workflow.md`，明确 fuzzy/platform slug 不能自动吞掉资产候选，需人工 `--check` 确认。验证：`pnpm sync:research` 通过（356 projects, 213 pending candidates）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-28**：子 agent 按 `research-map-builder` + `pua` 约束新增 Chainlink / LINK full research，文件为 `content/blog/2026/research/chainlink-link-oracle-ccip-capital-markets-token-value-capture-risk.mdx`，未修改 `src/app/research/research-client.tsx`。写作结论：Chainlink 是高质量 oracle / CCIP / capital-markets infrastructure asset，LINK 具备 Payment Abstraction、Reserve、staking、SVR、CCIP fees 等价值捕获路径，但仍是 watchlist / selective accumulation，而不是清晰现金流资产；核心风险是收入/费用口径 lumpy、流通供应口径冲突、non-circulating wallets、CCIP 竞争、机构 pilot 商业化不确定与 tokenholder capture 仍偏间接。验证：`pnpm sync:research:registry -- --check "Chainlink"` 仅命中旧 `chainlink-vs.mdx`，`--check "LINK"` 多为低置信字符串误报；新文 registry 反查 `Chainlink LINK` 100 分命中。`audit-report-depth --mode full` 通过（9390 words、42 evidence links、124 table lines、无缺失章节），`git diff --check` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
