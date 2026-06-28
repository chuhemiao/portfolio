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
  pnpm new:post     # 创建新博客文章
  pnpm content:check # 检查内容格式
  pnpm sync:telegram # 手动同步 Telegram 消息
  ```

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

- **2026-06-28**：继续执行“升级最近100篇研报为万字级深度研报，同时增加100篇新项目研究”的多 agent 长任务，并修正候选池运行机制。当前进度：`pnpm status:research:run` 显示 `8/100` 篇旧研报已升级为 full-depth（`1inch`、`AB`、`Aethir`、`AI Rig Complex`、`Ape and Pepe`、`ApeCoin`、`apyUSD`、`Arweave`），`3/100` 篇净新增 full-depth 新研究已发布（`Aleo`、`Chainlink`、`USDGO`），另有 3 个同资产重复替换并归档旧短文（`LEO Token` 替换旧 LEO、`Venice AI / VVV` 替换旧 Venice AI、`Filecoin / FIL` 替换 typo 旧文 `FILCOIN`）。新增/替换 MDX 已接入 `/research` 卡片和本地 SVG logo；旧重复文改为 `category: 'research-archive'` 并加 `supersededBy`。候选池机制修正为三阶段：`pnpm sync:research:registry` 只做本地 registry/candidates 同步与高置信去重，不调用 CG/CMC；`pnpm seed:research:candidates` 才从 CG/Surf/CMC-like 排名源扩容候选池；单篇写作阶段才刷新 CoinGecko / CoinMarketCap / Surf / 官方源 / explorer / DefiLlama 等实时数据。同步更新 `research-map-builder` skill 与 `portfolio-workflow.md`，明确 fuzzy/platform slug 不能自动吞掉资产候选，需人工 `--check` 确认。验证：`pnpm sync:research` 通过（356 projects, 213 pending candidates）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-28**：子 agent 按 `research-map-builder` + `pua` 约束新增 Chainlink / LINK full research，文件为 `content/blog/2026/research/chainlink-link-oracle-ccip-capital-markets-token-value-capture-risk.mdx`，未修改 `src/app/research/research-client.tsx`。写作结论：Chainlink 是高质量 oracle / CCIP / capital-markets infrastructure asset，LINK 具备 Payment Abstraction、Reserve、staking、SVR、CCIP fees 等价值捕获路径，但仍是 watchlist / selective accumulation，而不是清晰现金流资产；核心风险是收入/费用口径 lumpy、流通供应口径冲突、non-circulating wallets、CCIP 竞争、机构 pilot 商业化不确定与 tokenholder capture 仍偏间接。验证：`pnpm sync:research:registry -- --check "Chainlink"` 仅命中旧 `chainlink-vs.mdx`，`--check "LINK"` 多为低置信字符串误报；新文 registry 反查 `Chainlink LINK` 100 分命中。`audit-report-depth --mode full` 通过（9390 words、42 evidence links、124 table lines、无缺失章节），`git diff --check` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-28**：子 agent 按 `research-map-builder` + `pua` 约束新增 LEO Token / LEO full research，文件为 `content/blog/2026/research/leo-token-leo-bitfinex-exchange-token-buyback-liquidity-risk.mdx`，未修改 `src/app/research/research-client.tsx`。写作结论：LEO 是 Bitfinex / iFinex 生态的 deflationary exchange token，核心价值来自官方 buyback/burn、fee discount、exchange franchise durability 与 recovered-funds upside，但更适合 cash-flow-linked watchlist，而不是透明收入资产；主要风险是收入披露不足、流动性集中、监管历史、Bitfinex 2026 零费策略对 fee-discount moat 的稀释，以及 ERC-20 / Vaulta / dashboard / data aggregators 的供应口径冲突。验证：`pnpm sync:research:registry -- --check "LEO Token"` 与 `--check "LEO"` 未命中高置信 registry 覆盖；另发现旧文 `institutional-deep-dive-unus-sed-leo-leo-ifinex-ecosystem-s.mdx` 是同资产但仅 1309 words、depth audit 失败，后续主线程应合并/去重。新文 `audit-report-depth --mode full` 通过（8291 words、28 evidence links、76 table lines、无缺失章节），`git diff --check` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-28**：子 agent 按 `research-map-builder` + `pua` 约束新增 Aleo / ALEO full research，文件为 `content/blog/2026/research/aleo-aleo-private-zk-l1-prover-economics-value-capture-risk.mdx`，未修改 `src/app/research/research-client.tsx`。写作结论：Aleo 是技术真实、主网运行且具备 snarkVM / snarkOS / Leo / AleoBFT / private records / prover staking / 5B cap 的 privacy L1，但当前更适合 high-risk watchlist，核心风险是私密应用 PMF、代币价值捕获、流动性、供应口径与验证者/证明者集中度。验证：`node ~/.codex/skills/research-map-builder/scripts/audit-report-depth.mjs content/blog/2026/research/aleo-aleo-private-zk-l1-prover-economics-value-capture-risk.mdx --mode full` 通过（7935 words、42 evidence links、77 table lines、无缺失章节），`git diff --check -- <file>` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-28**：按用户要求启动“最近100篇 Research 升级为万字级深度研报”的系统化返工流程，并说明候选项目机制。新增 `scripts/audit-research-depth.mjs` 与 `pnpm audit:research:depth`，可批量审计 Research MDX 的 words、CJK chars、独立 evidence links、table lines、缺失关键章节，并生成 `data/research-map/depth-upgrade-queue.json`。本次运行 `pnpm audit:research:depth -- --limit 100 --write`，结果最近 100 篇 `fullDepthPass: 0`、`needsUpgrade: 100`，优先级队列从 `1inch`、`AB`、`Aethir`、`AI Rig Complex`、`Ape and Pepe`、`ApeCoin`、`apyUSD`、`Arweave`、`Avant`、`AWE Network` 等开始。同步更新 `~/.codex/skills/research-map-builder/SKILL.md` 与 `references/portfolio-workflow.md`，新增 `/research:audit-depth`、`/research:upgrade <slug|queue>` 语义，明确 `candidates.json` 是未研究项目候选池，`depth-upgrade-queue.json` 是已发布文章的深度返工队列。验证：`node --check scripts/audit-research-depth.mjs` 通过、`pnpm audit:research:depth -- --limit 100 --write` 通过、`git diff --check` 通过、`quick_validate.py` 通过。注意：100 篇内容本身尚未逐篇重写完成，必须按队列逐篇刷新实时数据与来源后扩写，不能批量填充。
- **2026-06-28**：根据用户反馈“当前项目研究深度不够，单篇研报应至少 10000 字左右”，升级 `~/.codex/skills/research-map-builder` 为 long-form Research skill。新增硬性 `Depth Contract`：`full research` 目标约 10,000 中文字符等价深度，英文 MDX 以 6,000+ words 为目标，低于 5,000 words 不得伪装成 full research，必须扩写或降级为 `quick note`；批量新增项目时优先候选队列和逐篇深研，不能用批量短文牺牲深度。同步更新 `references/report-blueprint.md` 的章节深度下限与五个深度扩写面，更新 `references/source-playbook.md` 的 20+ 独立证据链接、5+ primary sources、五条 evidence lanes 要求，更新 `references/portfolio-workflow.md` 的发布前深度审计步骤，并新增 `scripts/audit-report-depth.mjs` 检查 MDX 长度、独立链接数、表格和关键章节。验证：`node --check` 通过、对 Re 旧文软审计能正确识别为未达 full-depth、`quick_validate.py` 通过（临时 venv + PyYAML）。
- **2026-06-28**：修复 Vercel 部署在依赖安装阶段失败的问题：`pnpm-workspace.yaml` 之前只有 `allowBuilds`，缺少 pnpm workspace 必需的 `packages` 字段，导致 Vercel 的 pnpm 9 报 `packages field missing or empty`。已补 `packages: ['.']` 并保留 `sharp`、`unrs-resolver` build approval。验证：`pnpm install --frozen-lockfile` 通过、`CI=true pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；另确认 `COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm@9.15.9 install --frozen-lockfile` 不再触发原 workspace 解析错误，仅因本地已有不同 pnpm 版本生成的 `node_modules` 进入重装确认提示。Vercel 里的 Node.js 20 警告不是当前 fatal error，但应在 Project Settings 中升级到 Node.js 24.x，避免 2026-10-01 后部署失败。
- **2026-06-28**：按 `research-map-builder` + `pua-loop` 完成“增加50个项目研究”目标，本轮累计新增并接入 50 篇 Research，全部位于 `content/blog/2026/research/`，均已加入 `/research` 卡片、本地 SVG logo 与 `data/research-map/candidates.json`。三组项目分别为：第一组 `Pieverse / PIEVERSE`、`Ape and Pepe / APEPE`、`WeFi / WFI`、`dogwifhat / WIF`、`SwissBorg / BORG`、`Zano / ZANO`、`Onyxcoin / XCN`、`BTSE / BTSE`、`Kaito / KAITO`、`ApeCoin / APE`；第二组 `NEO / NEO`、`dYdX / DYDX`、`Fartcoin / FARTCOIN`、`apyUSD / APYUSD`、`AWE Network / AWE`、`Arweave / AR`、`BNB Attestation Service / BAS`、`GoMining Token / GOMINING`、`BitMart / BMX`、`GALA / GALA`；第三组 `SoSoValue / SOSO`、`WEMIX / WEMIX`、`Avant / SAVUSD`、`SafePal / SFP`、`Immutable / IMX`、`eCash / XEC`、`ZKsync / ZK`、`Rollbit Coin / RLB`、`Vaulta / A`、`Golem / GLM`、`TAC / TAC`、`Tagger / TAG`、`AB / AB`、`Cheems / CHEEMS`、`1inch / 1INCH`、`Tokenize Xchange / TKX`、`GRXChain / GRX`、`Derive / DRV`、`Sonic / S`、`Meteora / MET`、`AI Rig Complex / ARC`、`CoW Protocol / COW`、`Aethir / ATH`、`Chutes / SN64`、`deBridge / DBR`、`Synthetix / SNX`、`Banana For Scale / BANANAS31`、`Walrus / WAL`、`NEXPACE / NXPC`、`Livepeer / LPT`。同步修复 `scripts/sync-research-registry.mjs` 的候选匹配顺序，避免 `ApeCoin / APE` 被 `Ape and Pepe / APEPE` 误绑；补齐新增 50 篇的 `Pre-screen Decision`、`Source Conflict Matrix`、`Bull / Base / Bear Scenarios`、`Confidence Score`、`Red-team Check`、`Monitoring Dashboard`、`Follow-up Triggers` 等关键章节。`node scripts/sync-research.mjs` 后 registry 显示 `353 projects, 0 pending candidates`，completion audit 证明最近 50 个候选全部有 MDX/card/logo/关键章节且本地反查命中 100 分。验证：`node scripts/check-research-logos.mjs` 通过（353 projects）、`CI=true pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`node scripts/content-check.mjs` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。因 pnpm v11 build approval 机制，新增 `pnpm-workspace.yaml` 记录 `sharp` 与 `unrs-resolver` 的 build approval，避免 `pnpm exec` 被 approval gate 拦截。
- **2026-06-26**：继续优化 `research-map-builder` skill，新增 CoinGecko / CoinMarketCap 项目研究快捷指令且明确“不限制排名”：`/research:cg <url|slug|name|symbol|contract>`、`/research:cmc <...>` 用于 source-first chat research；`/research:add-cg <...>`、`/research:add-cmc <...>` 用于生成完整 MDX 并接入 Research Map；`/research:batch-cg <targets>`、`/research:batch-cmc <targets>` 用于批量候选入口；`/research:resolve <...>` 只做身份解析。规则写入 `SKILL.md` 与 `references/source-playbook.md`：CG/CMC rank 只作为优先级和流动性信号，不能因为项目不在 top 1000、未排名、新上市或流动性薄而自动拒绝；只有重复、假项目、身份无法确认、无可靠 source trail 时才 skip。同步更新 `agents/openai.yaml`，并用 `skill-creator` 的 `quick_validate.py` 验证通过，结果 `Skill is valid!`。
- **2026-06-26**：为 Research Map 新增本地已研究项目目录与候选池机制，减少新增研究时反复调用 CoinGecko / CoinMarketCap 做重复性查重。新增 `scripts/sync-research-registry.mjs` 与 `pnpm sync:research:registry`，生成 `data/research-map/registry.json`（从 research MDX + `/research` 卡片抽取 slug、name、symbol、type、aliases、file、logoUrl，并收录 card-only 条目，当前同步到 293 个 research projects）和 `data/research-map/candidates.json`（手动维护 CG/CMC/Surf 备选库，支持 `backlog`、`next`、`researching`、`researched`、`skip` 状态）。`pnpm sync:research:registry -- --check "<target>"` 可本地查重，例如 `BNB` 命中 `bnb-bnb-chain-exchange-utility-token-burn-validator-centralization-risk`，`RealLink` 命中 `reallink-real-socialfi-payments-supply-liquidity-risk`，`reUSD` 命中 `re-protocol-reusd-insurance-yield`；`--next 10` 可读取 pending candidates。已把 `syncResearchRegistry()` 接入 `scripts/sync-research.mjs`，未来 `pnpm sync:research` 会自动刷新 registry；同时更新 `research-map-builder` 的 `Local Registry First` 流程、`source-playbook.md`、`portfolio-workflow.md` 和 `agents/openai.yaml`，要求新增 Research 前先查本地 registry，再从 candidates 选择备选，最后才调用实时 CG/CMC 获取新数据。验证通过：`node --check scripts/sync-research-registry.mjs`、`pnpm sync:research`、`pnpm sync:research:registry -- --check RealLink`、`quick_validate.py`，结果 `Skill is valid!`。
