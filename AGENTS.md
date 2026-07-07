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

- **2026-07-07**：按用户要求“修复2019旧文 publishedAt 格式，并继续增加 CMC/CGO 深度研究文章，目标新增1000篇”完成本轮净新增/接入 `1000` 篇 full-depth Research，同时修复 3 篇 2019 旧文 `publishedAt`：`2019-1-13`→`2019-01-13`、`2019-4-10`→`2019-04-10`、`2019-2-13`→`2019-02-13`。当前 registry 从 `1811` 增至 `2811` projects，candidate total `3815`，pending new candidates `381`，depth upgrade queue `0`。数据源路径：按 Surf-first 规则执行 `surf sync/list-operations/market-ranking --help`，live ranking 返回 `PAID_BALANCE_ZERO`；CoinGecko markets/list 先后返回 `429 Too Many Requests`；随后使用 DefiLlama protocol list fallback 扩容 `1600` 候选，并分 5 批 `200*5` 生成、`sync-research --add --skip-logos` 接入。脚本增强：`seed-research-candidates.mjs` 支持 `coingecko-list` 与 `defillama` fallback，并过滤 CEX/无 token/噪声候选；`generate-cmc-cgo-research-batch.mjs` 增强同族去重和 Surf credit-error 短路；`sync-research.mjs` 增加 `--skip-logos`；同时修正 OSL logo 引用为已存在的 `osl_group.png`。验证：`pnpm content:check` 通过（scanned 2966 mdx files）、`pnpm audit:research:depth -- --limit 1000 --write` 通过（1000/1000 full-depth pass）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、相关脚本 `node --check` 通过。残余风险：本轮 1000 篇 live enrichment 均因 Surf 余额为 0 失败，且 CG API 429；文章结构与 source discovery 足够通过 Research Map 覆盖，但高置信投资用途前应批量 live-data refresh / primary-source 加强。
- **2026-07-07**：按用户要求继续增加 CMC/CGO-oriented 深度研究并完成目标 `800` 篇净新增/接入。先用 Surf `market-ranking` 扩容候选池（`pnpm seed:research:candidates -- --provider surf --pages 30 --limit 1000 --write`），candidate total 从 `1215` 增至 `2215`；分四轮生成并同步：batch1 `200`、batch2 `198`（2 个候选已存在）、batch3 `200`、batch4 `202`，最终 registry 从 `1011` 增至 `1811` projects，pending new candidates `355`，depth upgrade queue `0`。同步修复/增强：`scripts/sync-research.mjs` 使用安全字符串转义并兼容 `] as ResearchProject[]` 插入点；`src/app/research/research-client.tsx` 为超大 PROJECTS literal 加 typed assertion；`scripts/generate-cmc-cgo-research-batch.mjs` 增加非拉丁 slug fallback、registry/short-name 去重和 `--use-coingecko-api` 搜索兜底；`scripts/sync-research-registry.mjs` 增强 alias/startsWith 去重。最终验证：`pnpm audit:research:depth -- --limit 800 --write` 通过（800/800 full-depth pass，needs upgrade 0）、`pnpm check:research:logos` 通过（1209 projects）、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、相关脚本 `node --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余风险：batch3/4 共 `402` 篇生成时 Surf 返回 `PAID_BALANCE_ZERO`，CoinGecko API fallback 同时返回 `429 Too Many Requests`，文章结构和 depth audit 已通过，但后续应批量刷新 live market / primary sources 以提升数据强度。
- **2026-07-06**：按用户要求“继续增加 cmc 和 cgo 的深度研究文章，目标 500 篇”完成本轮净新增/接入 500 篇 full-depth Research。先用 Surf `market-ranking` 扩容候选池（`pnpm seed:research:candidates -- --provider surf --pages 15 --limit 500 --write`），candidate total 从 `715` 扩到 `1215`；随后分三批生成并同步：batch200 `200` 篇、batch2 `200` 篇、batch3 `1 + 99` 篇（首篇重跑时已存在），最终 `pnpm sync:research --add` 后 registry 从 `511` 增至 `1011` projects，pending new candidates `341`，depth upgrade queue `0`。同步更新批量脚本：`scripts/seed-research-candidates.mjs` 为 Surf ranking 增加 3 次 retry/backoff；`scripts/generate-cmc-cgo-research-batch.mjs` 为 Surf 子命令增加 `45s` timeout，避免 `project-detail` / `market-price` 长时间挂起。最终验证：`pnpm audit:research:depth -- --limit 500 --write` 通过（500/500 full-depth pass，needs upgrade 0）、`pnpm check:research:logos` 通过（1011 projects）、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、`node --check scripts/generate-cmc-cgo-research-batch.mjs scripts/seed-research-candidates.mjs` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余风险：500 篇中共有 333 篇至少一个 Surf enrichment 缺口，主要集中在 long-tail/RWA/meme/Surf-only 项目的 project-detail 或 DeFi metrics，文章已按缺口保守披露，后续可逐篇补 primary source。
- **2026-07-06**：按用户要求“继续增加 cmc 和 cgo 的深度研究文章，目标 100 篇”，在上一轮 30 篇基础上继续从 pending candidates 选择 100 个新增项目，优先 DefiLlama/CoinGecko ID 候选，再补 Surf backlog，并用 registry 覆盖过滤避免重复写入已存在项目。扩展 `scripts/generate-cmc-cgo-research-batch.mjs`：新增 `--from-pending`、`--target-count`、`--list-only`，支持无 CoinGecko ID 的 CMC/CG 搜索兜底链接，并用 `registry.json` 二次去重。新增并接入 100 篇 full-depth Research，`sync:research --add` 追加 100 个 `/research` scaffold，registry 更新为 `511` projects、pending new candidates `59`、upgrade queue `0`。验证：`surf install/sync/list-operations` 和目标命令 help 已执行；`node --check scripts/generate-cmc-cgo-research-batch.mjs` 通过；候选 list-only 为 100 个（61 DefiLlama/CG、39 Surf，无上轮 30 篇重复命中）；生成日志 `wrote` 100；`pnpm audit:research:depth -- --limit 140 --write` 通过（140/140 full-depth pass，新增 100 篇 `failedTargets: 0`、最低 6308 words、29 links、214 table lines）；`pnpm check:research:logos` 通过（511 projects）；`pnpm exec tsc --noEmit` 通过；`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余数据风险：long-tail/RWA/meme/Surf-only 项目中 67 个条目有至少一个 Surf endpoint 缺口，主要是 project-detail 或 DeFi metrics，需要后续人工 primary-source 加强。
- **2026-07-06**：按用户要求“继续增加 cmc 和 cgo 的深度研究文章，目标 30 篇”，从本地 CoinGecko/CMC-oriented pending candidates 中新增并接入 30 篇 full-depth Research：`SSV Network`、`Babylon Protocol`、`Rocket Pool`、`Obol`、`Tornado Cash`、`mETH Protocol`、`Merlin Chain`、`QuickSwap`、`Stader`、`Dolomite`、`KPK`、`PinkSale`、`Tectonic`、`Yield Basis`、`Beefy Finance`、`Stake DAO`、`Renzo`、`BENQI`、`f(x) Protocol`、`BlazeStake`、`Enzyme Finance`、`Frankencoin`、`Savings xDAI`、`AILayer`、`Staked USDT`、`Concentrator`、`ZEROBASE`、`Treehouse Protocol`、`ORIGYN Foundation`、`Brickken`。新增 `scripts/generate-cmc-cgo-research-batch.mjs`，使用 Surf-first refresh（先 `surf install/sync/list-operations` 和命令 `--help`），并补了 display override 与 `--overwrite`，避免 `merlin-chain` 等候选被 fuzzy match 带偏；`sync:research --add` 已追加 30 个 `/research` scaffold，registry 更新为 `411` projects、pending new candidates `158`、upgrade queue `14`。验证：`node --check scripts/generate-cmc-cgo-research-batch.mjs` 通过；`pnpm audit:research:depth -- --limit 100 --write` 通过（Full-depth pass `86`、needs upgrade `14`，新增 30 篇均未进入 needs-upgrade）；`pnpm sync:research:registry` 通过；`pnpm check:research:logos` 通过（411 projects）；`pnpm exec tsc --noEmit` 通过；`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余数据风险：Surf project/DeFi 对 `stUSDT`、`Concentrator`、`ORIGYN` 有部分 NOT_FOUND，需要后续人工 primary-source 加强。
- **2026-07-06**：按用户要求同步最新进度、当前 skill/workflow 与快捷添加内容脚本。新增 `scripts/quick-add-content.mjs` 与 `pnpm quick:add`，默认 dry-run、显式 `--write` 才写入 MDX，复用 `scripts/new-post.mjs` 避免重复生成逻辑；更新 `src/data/skill.md` 为 repo-local Portfolio Research Map workflow reference，记录 Surf-first、本地查重、MDX 写作、`/research` 同步、depth audit、候选池/升级队列语义。同步文档中当前进度：`pnpm status:research:run` 显示 registry `381`、candidate total `357`、pending new candidates `187`、upgrade queue `40`；当前安装目录未发现旧 `research-map-builder` skill。验证：`node --check scripts/quick-add-content.mjs`、`pnpm quick:add -- "..." --category research` dry-run、`pnpm status:research:run`、`git diff --check` 通过；`pnpm content:check` 仍预期受 3 篇 2019 旧文 `publishedAt` 格式影响。
- **2026-07-02**：按用户要求“继续增加这个项目为新的深度研究”处理 Arcium / ARX 附件草稿；本地 registry 查重发现 Arcium 已有 Research Map 条目，因此未新增重复 MDX，而是升级 `content/blog/2026/research/arcium-arx-confidential-computing-mpc-fhe-token-liquidity-risk.mdx` 为 full-depth Research。使用 Surf skill/API 刷新 project-detail、90d market-price、listing、token-tokenomics、social-mindshare、search-news、search-token、DeFi metrics，并抓取 Arcium 官方 home/build/ecosystem/tokenomics/docs/staking/pricing/MXEs/clusters、The Block、CG/CMC、GitHub 等来源。新结论：Arcium 是 Solana confidential compute / shared private state 的高 upside watchlist，核心 upside 是把 sealed-bid auctions、private order flow、Umbra/ZINC、confidential payments、AI/data collaboration 等变成 Solana 可组合隐私原语；核心风险是 ARX 不是直接 fee token，计算费用以 SOL 等原生资产支付，token value capture 依赖 staking/capacity/governance，且上市后价格发现、流动性衰减和 79.12% 初始锁定供应仍需验证。验证：`audit-report-depth --mode full` PASS（8264 words、26 evidence links、101 table lines、无缺失章节）、`pnpm sync:research:registry` 通过、`pnpm audit:research:depth -- --limit 100 --write` 通过（最近100篇 full-depth pass 60、needs upgrade 40）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-07-02**：按用户要求“根据之前的格式和要求，增加新项目的研究 tac”执行本地去重后发现 TAC 已有 Research Map 条目，因此未新增重复 MDX，而是升级 `content/blog/2026/research/tac-tac-ton-evm-bridge-telegram-distribution-risk.mdx` 为 full-depth Research。使用 Surf skill/API 刷新项目详情、90d 价格、listing、BSC transfer/holders、social、unlock、DeFi metrics、news，并抓取 TAC 官方 site/docs/tokenomics/mainnet/funding/post-mortem/Summoning 等 primary sources。新结论：TAC 是 TON / Telegram DeFi 分发层的高 beta watchlist / tactical 标的，核心 upside 是 EVM dApps 进入 Telegram/TON 用户层，核心风险是 2026-05 bridge exploit 后的信任恢复、真实 TVL/fee 数据缺口、BSC 口径筹码集中、unlock/treasury 透明度和 token value capture 未充分验证。验证：`audit-report-depth --mode full` PASS（7567 words、21 evidence links、131 table lines、无缺失章节）、`pnpm sync:research:registry` 通过、`pnpm audit:research:depth -- --limit 100 --write` 通过（TAC 在 audited 中 full-depth-pass）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-07-02**：用户明确要求“下次记住，直接使用 Surf 的 skill API（`https://agents.asksurf.ai/docs`）”。已写入工作偏好：后续涉及 watch、oscillator、market、listing、price、wallet、DeFi、on-chain、research 数据刷新时，优先使用 Surf skill/API，并先查 `surf list-operations` 与目标命令 `--help`；仅在 Surf 无数据、报错或用户指定其他来源时再使用 CoinGecko、CMC、交易所 API 或普通网页搜索。
- **2026-07-02**：按用户要求“根据之前的策略更新 watch 和 oscillator 的最新数据”。执行 `pnpm sync:oscillator`，将 `src/data/oscillator-manual-snapshot.ts` 更新到 `2026-07-02T02:24:35.850Z`，脚本输出 `481` 个 altcoins、`35` 个 focus rows；快照摘要为 trackedAltcoins `481`、researchFocusCount `29`、dualRankedCount `324`、binanceBtcPairs `49`、positive7dBreadth `5.41%`、positive30dBreadth `1.87%`、btcPrice `60208`。`/watch` 页面确认仍是 `dynamic = 'force-dynamic'`，无静态快照文件，运行时真实探测 `getWatchData()` 返回 `2026-07-02T02:25:30.454Z`、30 天窗口、`198` listings、Fear & Greed `19` Extreme Fear、Binance Alpha `5`、buySignals `0`。验证：`node --experimental-strip-types --test src/lib/oscillator-helpers.test.mjs src/lib/oscillator-snapshot.test.mjs` 通过（14/14）、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；同步脚本和探测命令仅有 Node typeless package warning。
