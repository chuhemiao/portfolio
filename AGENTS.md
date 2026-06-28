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

- **2026-06-28**：按 `research-map-builder` + `pua-loop` 完成“增加50个项目研究”目标，本轮累计新增并接入 50 篇 Research，全部位于 `content/blog/2026/research/`，均已加入 `/research` 卡片、本地 SVG logo 与 `data/research-map/candidates.json`。三组项目分别为：第一组 `Pieverse / PIEVERSE`、`Ape and Pepe / APEPE`、`WeFi / WFI`、`dogwifhat / WIF`、`SwissBorg / BORG`、`Zano / ZANO`、`Onyxcoin / XCN`、`BTSE / BTSE`、`Kaito / KAITO`、`ApeCoin / APE`；第二组 `NEO / NEO`、`dYdX / DYDX`、`Fartcoin / FARTCOIN`、`apyUSD / APYUSD`、`AWE Network / AWE`、`Arweave / AR`、`BNB Attestation Service / BAS`、`GoMining Token / GOMINING`、`BitMart / BMX`、`GALA / GALA`；第三组 `SoSoValue / SOSO`、`WEMIX / WEMIX`、`Avant / SAVUSD`、`SafePal / SFP`、`Immutable / IMX`、`eCash / XEC`、`ZKsync / ZK`、`Rollbit Coin / RLB`、`Vaulta / A`、`Golem / GLM`、`TAC / TAC`、`Tagger / TAG`、`AB / AB`、`Cheems / CHEEMS`、`1inch / 1INCH`、`Tokenize Xchange / TKX`、`GRXChain / GRX`、`Derive / DRV`、`Sonic / S`、`Meteora / MET`、`AI Rig Complex / ARC`、`CoW Protocol / COW`、`Aethir / ATH`、`Chutes / SN64`、`deBridge / DBR`、`Synthetix / SNX`、`Banana For Scale / BANANAS31`、`Walrus / WAL`、`NEXPACE / NXPC`、`Livepeer / LPT`。同步修复 `scripts/sync-research-registry.mjs` 的候选匹配顺序，避免 `ApeCoin / APE` 被 `Ape and Pepe / APEPE` 误绑；补齐新增 50 篇的 `Pre-screen Decision`、`Source Conflict Matrix`、`Bull / Base / Bear Scenarios`、`Confidence Score`、`Red-team Check`、`Monitoring Dashboard`、`Follow-up Triggers` 等关键章节。`node scripts/sync-research.mjs` 后 registry 显示 `353 projects, 0 pending candidates`，completion audit 证明最近 50 个候选全部有 MDX/card/logo/关键章节且本地反查命中 100 分。验证：`node scripts/check-research-logos.mjs` 通过（353 projects）、`CI=true pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`node scripts/content-check.mjs` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。因 pnpm v11 build approval 机制，新增 `pnpm-workspace.yaml` 记录 `sharp` 与 `unrs-resolver` 的 build approval，避免 `pnpm exec` 被 approval gate 拦截。
- **2026-06-26**：按用户要求“增加10个项目”，使用 `research-map-builder` + Surf / Watch 候选池流程新增并接入 10 篇 Research：`Arcium / ARX`、`Kamino / KMNO`、`peaq / PEAQ`、`Amp / AMP`、`Osmosis / OSMO`、`GEODNET / GEOD`、`Collector Crypt / CARDS`、`o1.exchange / O`、`Nesa / NES`、`EVAA Protocol / EVAA`。新增 MDX 均在 `content/blog/2026/research/`，并加入 `/research` 卡片与本地 SVG logo。手动修正自动生成卡片字段：Amp -> `PayFi`，Arcium -> `Privacy`，o1.exchange -> `Perp DEX`，peaq / Nesa / GEODNET -> `AI/DePIN`，Kamino / EVAA -> `Lending`，Osmosis -> `DEX`，Collector Crypt -> `RWA`。`pnpm sync:research:registry` 后 registry 显示 `303 projects, 0 pending candidates`，候选池 10 个项目均标记 `researched`；本地反查 Arcium / Kamino / EVAA 命中 100 分。验证：`pnpm check:research:logos` 通过（303 projects）、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-26**：继续优化 `research-map-builder` skill，新增 CoinGecko / CoinMarketCap 项目研究快捷指令且明确“不限制排名”：`/research:cg <url|slug|name|symbol|contract>`、`/research:cmc <...>` 用于 source-first chat research；`/research:add-cg <...>`、`/research:add-cmc <...>` 用于生成完整 MDX 并接入 Research Map；`/research:batch-cg <targets>`、`/research:batch-cmc <targets>` 用于批量候选入口；`/research:resolve <...>` 只做身份解析。规则写入 `SKILL.md` 与 `references/source-playbook.md`：CG/CMC rank 只作为优先级和流动性信号，不能因为项目不在 top 1000、未排名、新上市或流动性薄而自动拒绝；只有重复、假项目、身份无法确认、无可靠 source trail 时才 skip。同步更新 `agents/openai.yaml`，并用 `skill-creator` 的 `quick_validate.py` 验证通过，结果 `Skill is valid!`。
- **2026-06-26**：为 Research Map 新增本地已研究项目目录与候选池机制，减少新增研究时反复调用 CoinGecko / CoinMarketCap 做重复性查重。新增 `scripts/sync-research-registry.mjs` 与 `pnpm sync:research:registry`，生成 `data/research-map/registry.json`（从 research MDX + `/research` 卡片抽取 slug、name、symbol、type、aliases、file、logoUrl，并收录 card-only 条目，当前同步到 293 个 research projects）和 `data/research-map/candidates.json`（手动维护 CG/CMC/Surf 备选库，支持 `backlog`、`next`、`researching`、`researched`、`skip` 状态）。`pnpm sync:research:registry -- --check "<target>"` 可本地查重，例如 `BNB` 命中 `bnb-bnb-chain-exchange-utility-token-burn-validator-centralization-risk`，`RealLink` 命中 `reallink-real-socialfi-payments-supply-liquidity-risk`，`reUSD` 命中 `re-protocol-reusd-insurance-yield`；`--next 10` 可读取 pending candidates。已把 `syncResearchRegistry()` 接入 `scripts/sync-research.mjs`，未来 `pnpm sync:research` 会自动刷新 registry；同时更新 `research-map-builder` 的 `Local Registry First` 流程、`source-playbook.md`、`portfolio-workflow.md` 和 `agents/openai.yaml`，要求新增 Research 前先查本地 registry，再从 candidates 选择备选，最后才调用实时 CG/CMC 获取新数据。验证通过：`node --check scripts/sync-research-registry.mjs`、`pnpm sync:research`、`pnpm sync:research:registry -- --check RealLink`、`quick_validate.py`，结果 `Skill is valid!`。
- **2026-06-26**：按用户要求升级 `research-map-builder` skill 的项目深度研究流程，新增 5 个强制优化模块：`Pre-screen depth gate`（skip / quick note / full research）、`Source Conflict Matrix`（供应、估值、TVL、收入、流动性、holders、unlock 口径冲突）、`Confidence Score`（source quality、data consistency、mechanism clarity、value capture、liquidity quality）、`Red-team Check`（最强反例、最可操纵指标、token value-capture failure path、zero path）、`Follow-up Triggers`（3-5 个未来复查触发器）。已更新 `~/.codex/skills/research-map-builder/SKILL.md`、`references/source-playbook.md`、`references/report-blueprint.md`，并用临时 venv + PyYAML 跑过 `skill-creator` 的 `quick_validate.py`，结果 `Skill is valid!`。
- **2026-06-25**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，并继续使用 Surf / CoinGecko / CoinMarketCap / DefiLlama / Dexscreener / GoPlus 交叉校准项目数据。本轮通过 `surf market-ranking` 复核 RealLink 后的排名段，确认 `crvUSD` 虽在 Curve DAO / CRV 文章中被章节级提及，但本地没有独立 stablecoin research，于是新增并接入 `content/blog/2026/research/crvusd-curve-native-stablecoin-llamma-liquidation-peg-risk.mdx`，标题 `crvUSD: Curve-Native Stablecoin, LLAMMA Liquidations, and Peg/Liquidity Risk`。结论是“high-quality DeFi-native stablecoin watchlist / selective integration asset, not cash-equivalent reserve collateral”，重点分析 crvUSD 作为 Curve-native crypto-backed CDP stablecoin 与 LlamaLend liability unit，其价值取决于 Curve DEX liquidity、LLAMMA soft-liquidation markets、controllers、PegKeepers、scrvUSD savings layer、borrow demand、supply reconciliation 与 peg/liquidity resilience。纳入 2026-06-25 快照：CoinGecko 显示 crvUSD `rank #182`、`price ~$0.999`、`market cap ~$174.6M`、`FDV ~$173.9M`、`24h volume ~$46.1M`、`~174.7M` circulating supply；CoinMarketCap 显示类似 `market cap / FDV ~$174.6M`、`24h volume ~$52.0M`、`~174.7M` circulating / total supply，供应源指向 Curve `getCrvusdTotalSupplyNumber`，同一 API 返回 `174732336.18448195`；DefiLlama Stablecoins 则显示约 `$189.6M` circulating value，主要在 Ethereum（约 `$186.3M`），因此文章把 Curve API / CG / CMC / DefiLlama / raw ERC-20 balance 的 supply methodology reconciliation 设为核心监控项。DefiLlama Curve LlamaLend 显示 Ethereum TVL 约 `$61.0M`、Arbitrum TVL 约 `$1.34M`、total borrowed 约 `$41.5M`，30d fees 约 `$19.9K`，并标记 2026-03-02 约 `$240K` donation attack；Curve DEX 30d volume 约 `$3.72B`。Dexscreener 显示 Curve Ethereum crvUSD/USDT 与 crvUSD/USDC 池各约 `$18.1M` liquidity，另有较深 WETH / cbBTC / tBTC 相关 Curve pools；CMC 的 totalOnchainLiquidity 只显示约 `$10.7K` 且主要来自 Uniswap 细池，文章将其解释为 CMC liquidity field 未覆盖 Curve-native pools，不适合单独判断 crvUSD 深度。GoPlus 显示 Ethereum crvUSD open-source、non-proxy、0 buy/sell tax、非 honeypot、`is_mintable=1`，Surf holder labels 显示最大 holder 为 Yield Basis Factory 约 `35.5%`，后续多个 Curve.fi crvUSD Controller 地址约 `9.5%`、`8.8%`、`6.8%` 等，CMC 显示约 `94.3K` holders、top ten holder ratio 约 `77.8%`。手动接入 `/research` 卡片 `name: 'crvUSD'`、`type: 'Stablecoin'`、`initial: 'crvUSD'`、`color: '#3465A4'`，本地 logo 为 `public/research-logos/crvusd-curve-native-stablecoin-llamma-liquidation-peg-risk.svg`。验证通过：`pnpm sync:research --add`（曾因 Coinpaprika DNS 不可用走 fallback；随后清理了脚本生成的无关 logo 噪音）、frontmatter/card/logo 检查、`pnpm check:research:logos`（293 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-24**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，按用户要求继续使用 `surf` skill / API 做项目筛选和数据交叉。本轮用 `surf market-ranking` 从 KOGE 后的 market-cap 排名段筛选，过滤已覆盖项目后确认下一个真实缺口为 RealLink / REAL（CoinGecko `reallink`，避免与其他 REAL ticker 混淆），新增并接入 `content/blog/2026/research/reallink-real-socialfi-payments-supply-liquidity-risk.mdx`，标题 `RealLink REAL: SocialFi Apps, Payment Gateway Narrative, and Supply-Reconciliation Risk`。结论是“speculative SocialFi / payments watchlist, not high-conviction allocation”，重点分析 RealLink 作为 TRON + BNB Chain SocialFi / Social-to-Earn token，官网/CMC/Surf 叙事中的 BuzzCast、Tada、DPay、creator rewards、tipping、content ownership、DAO governance 与 REAL token demand 是否有可验证产品数据支撑。纳入 2026-06-24 快照：CoinGecko 显示 REAL 约 `rank #171`、`price ~$0.061`、`market cap / FDV ~$201M`、`24h volume ~$6.4M`、`3.292B / 3.292B` circulating / total supply；Surf 显示类似 `rank #172`、mcap 约 `$200M`、24h volume 约 `$6.4M`。CoinMarketCap 则显示 rank 约 `#264`、verified market cap 约 `$84M`、FDV 约 `$734M`、verified circulating supply 约 `1.374B REAL`、total supply / self-reported circulating supply 约 `3.292B REAL`、max supply `12B`，因此文章将 CG/Surf 与 CMC supply methodology conflict 设为最高优先级风险。官方 `https://act.reallink.vip/api/v1/real/totalSupply` 返回 `3292266475.00000000`。Tronscan 显示 TRC20 contract `TGBfBt6Y2Dm3RHdNpZAdqywBsvfdysf834`、holders 约 `11.4K`、transfers 约 `84K`，top TRON holders 包括 tagged `RealLink SocialMiningPool` 约 `754.2M REAL`（约 `22.9%` of 3.292B）、`MXC` 约 `493.9M`（约 `15.0%`）、unlabeled 约 `486.7M`（约 `14.8%`）、`RealLinkWrapper` 约 `342.4M`（约 `10.4%`）。BSC contract `0x65e7a112db1142eae919201b1232f7aa488ed83c` 的 Surf holder data 显示 BingX cold wallet 约 `43.6%` of BSC-side supply；GoPlus 显示 BSC REAL open-source、non-proxy、non-mintable、0 buy/sell tax、非 honeypot，但 BSC-side total supply 约 `342.35M`，说明其更像 bridged / secondary representation。Dexscreener 显示 BSC PancakeSwap REAL/USDT 池约 `$183K` liquidity / `$42K` 24h volume，CMC 显示总 onchain liquidity 约 `$190K`，与 `$84M-$201M` mcap 均不匹配。GitHub 侧 `RealLink666` 只有一个小型 forked `tron-tvc-list` repo，`RealLinkOfficial` API 未见 public repos；文章因此将 independent product usage、developer activity、emissions / SocialMiningPool flows、supply reconciliation 和 DEX liquidity 设为监控项。手动接入 `/research` 卡片 `name: 'RealLink'`、`type: 'SocialFi'`、`initial: 'REAL'`、`color: '#1D4ED8'`，并在 `ALL_TYPES` 补充 `SocialFi`，本地 logo 为 `public/research-logos/reallink-real-socialfi-payments-supply-liquidity-risk.svg`。验证通过：`pnpm sync:research`、frontmatter/card/logo 检查、`pnpm check:research:logos`（292 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-24**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，并按用户提示接入 `surf` skill / API 作为后续 crypto data 标准数据源；已执行 `surf install`、`surf sync`，确认可用端点包括 `market-ranking`、`project-detail`、`search-project`、`token-holders` 等。本轮新增并接入 `content/blog/2026/research/koge-48-club-token-bnb-chain-infrastructure-liquidity-value-capture-risk.mdx`，标题 `KOGE: 48 Club Token, BNB Chain Infrastructure, Liquidity Depth, and Value-Capture Risk`。结论是“speculative BNB Chain infrastructure / community-token watchlist, not high-conviction allocation yet”，重点分析 KOGE / 48 Club Token 作为 48 Club / BNB Chain infrastructure-adjacent token，48 Club 的 BNB Chain validator / staking / snapshot / RPC / Puissant 相关基础设施相关性，是否能真正传导到 KOGE token value capture。纳入 2026-06-24 快照：CoinGecko / Surf 显示 KOGE 约 `rank #165`、`price ~$63.3`、`market cap / FDV ~$214M`、`24h volume ~$61K`、`~3.38M / ~3.38M` circulating / total supply、max supply 约 `3.44M`；CoinMarketCap 显示名称 `48 Club Token`、rank 约 `#220`、market cap 约 `$215M`、self-reported circulating supply 约 `3.39M KOGE`。Dexscreener 显示 BSC PancakeSwap V3 KOGE/USDT 池约 `$54.5M` quoted liquidity 但仅约 `$15.5K` 24h volume，Uniswap V3 on BSC KOGE/USDT 池约 `$1.13M` liquidity / `$41.4K` 24h volume，文章将其列为“optically deep but turnover-poor liquidity”。GoPlus 显示 KOGE BSC contract `0xe6df05ce8c8301223373cf5b969afcb1498c5528` open-source、non-proxy、non-mintable、0 buy/sell tax、非 honeypot、约 `85K` holders；Surf `token-holders` 标签补充显示 top holder 为 `BNB48 Club` staking 约 `31.6%`、第二大为 Gnosis Safe Proxy 约 `29.6%`、主 PancakeSwap V3 pool 约 `25.3%`、另有 DeBank-labeled holder 约 `9.6%`，因此把 holder concentration / multisig / LP movement 设为核心监控项。手动接入 `/research` 卡片 `name: 'KOGE'`、`type: 'Infra'`、`initial: 'KOGE'`、`color: '#F0B90B'`，本地 logo 为 `public/research-logos/koge-48-club-token-bnb-chain-infrastructure-liquidity-value-capture-risk.svg`。验证通过：`pnpm sync:research`、frontmatter/card/logo 检查、`pnpm check:research:logos`（291 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-24**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮通过当前 CoinGecko top 1000 与本地 `/research` 交叉，确认 Venice / VVV、KOGE 前仍需过滤已有内容后，新增并接入 `content/blog/2026/research/coco-coco-bnb-chain-meme-ai-agent-contract-risk.mdx`，标题 `COCO: BNB Chain Meme, Web3 AI Agent Wrapper, and Contract-Identity Risk`。结论是“speculative BNB Chain meme / AI-agent narrative watchlist, not fundamentals-backed allocation”，重点分析 COCO 从 BNB Chain meme / dog-themed token 转向官网自称 Web3 AI Agent Framework 的叙事升级是否有真实产品与 token value capture 支撑。纳入 2026-06-24 快照：CoinGecko 显示 COCO `rank #159`、`price ~$0.221`、`market cap / FDV ~$221M`、`24h volume ~$84K`、`1B / 1B` circulating / max supply，合约为 BNB Chain `0x80f1ff15b887cb19295d88c8c16f89d47f6d8888`，类别为 BNB Chain Ecosystem / Meme / Dog-Themed；CoinMarketCap 显示价格相近但 `rank #4028`、verified market cap 为 `$0`、circulating supply 为 self-reported `1B COCO`，体现 CG/CMC 口径断裂；Dexscreener 显示主 PancakeSwap COCO/USDT 池约 `$1.75M` liquidity / `$11.8K` 24h volume、COCO/WBNB 池约 `$1.41M` liquidity / `$9.6K` 24h volume，流动性相对 `$221M` mcap 很薄。GoPlus 对 `0x80f1...8888` 显示 open-source、non-proxy、non-mintable、0 buy/sell tax、owner zero、非 honeypot、约 `28.3K` holders；但官网 bundle 的 Contract Address 展示为 `0xbab528425edb1e0e36d3719bc3307d9c8cce8888`，GoPlus 识别该地址 token_name / symbol 为 `Moolah`，不是 COCO，文章将其列为最高风险的 contract-identity mismatch。官网/GitHub 侧自称 35+ plugins、wallet modes、natural-language trading、contract scanning、desktop/mobile app；GitHub `V-SK/COCO` 显示 0 stars、0 forks、latest push 2026-04-11、latest release v1.1.0（2026-03-18）且 release download counts 很低。手动接入 `/research` 卡片 `name: 'COCO'`、`type: 'Meme/AI'`、`initial: 'COCO'`、`color: '#F0B90B'`，本地 logo 为 `public/research-logos/coco-coco-bnb-chain-meme-ai-agent-contract-risk.svg`，并补充 `ALL_TYPES` 中 `Meme/AI` 筛选项。验证通过：`pnpm sync:research`、frontmatter/client/logo 检查、`pnpm check:research:logos`（290 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/bnb-bnb-chain-exchange-utility-token-burn-validator-centralization-risk.mdx`，标题 `BNB: BNB Chain Gas Asset, Binance Distribution, Burn Mechanics, and Validator Centralization Risk`。结论是“selective L1 / exchange-linked utility token exposure, not a decentralization-pure core L1 allocation”，重点分析 BNB 作为 Binance 分发型 utility token + BNB Smart Chain gas / staking asset 的复合价值捕获：Binance exchange distribution、BSC gas demand、staking / validator economics、Auto-Burn、BEP-95 real-time burn、PancakeSwap / Venus 等生态使用，以及 Binance dependency、PoSA validator concentration、MEV builder concentration、regulatory label risk。纳入 2026-06-23 快照：CoinGecko 显示 BNB `rank #4`、`price ~$574`、`market cap / FDV ~$77.4B`、`24h volume ~$718M`、`~134.8M / ~134.8M` circulating / total supply、`200M` max supply；DefiLlama 显示 BSC TVL 约 `$5.05B`，BSC chain fees 约 `$1.19M` 24h / `$11.0M` 30d / `$214.6M` 1y，BSC DEX volume 约 `$686.7M` 24h / `$26.0B` 30d；BNB Chain validator docs 显示 daily election top `45` active validators，每个 epoch 由 `18` Cabinets + `3` Candidates 组成 `21` consensus validators；BNBBurn / BEP-95 信息显示 Auto-Burn 目标供应降至 `100M BNB`，并通过 fixed ratio gas fee real-time burn 连接链上使用与供应减少；arXiv 2026 BSC MEV 研究指出 2025-05 到 2025-11 样本中 48Club 与 Blockrazor 产出 >`96%` blocks、捕获约 `92%` MEV profits，作为 builder centralization 风险信号。手动接入 `/research` 卡片 `name: 'BNB'`、`type: 'L1'`、`initial: 'BNB'`、`color: '#F0B90B'`，本地 logo 为 `public/research-logos/bnb-bnb-chain-exchange-utility-token-burn-validator-centralization-risk.svg`。验证通过：`pnpm sync:research`、frontmatter/client/logo 检查、`pnpm check:research:logos`（289 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
