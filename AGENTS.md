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

- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/buildon-b-bnb-chain-usd1-meme-liquidity-narrative-risk.mdx`，标题 `BUILDon B: BNB Chain USD1 Meme, Liquidity Flywheel, and Narrative Risk`。结论是“speculative meme / USD1 liquidity watchlist, not fundamentals-backed allocation”，重点分析 BUILDon 作为 BNB Chain 上围绕 USD1 / WLFI 叙事的 meme/liquidity asset，而不是常规协议现金流项目。纳入 2026-06-23 快照：CoinGecko 显示 B `rank #152`、`price ~$0.236`、`market cap/FDV ~$237M`、`24h volume ~$6.2M`、`1B / 1B` circulating / max supply，ATH 为 2026-05-14 约 `$0.764`，CoinGecko category 包含 `BNB Chain Ecosystem`、`Meme`、`World Liberty Financial Portfolio`、`Binance Alpha Spotlight`。Dexscreener 显示 PancakeSwap B/USD1 池约 `$2.38M` liquidity / `$2.74M` 24h volume，B/WBNB 池约 `$2.56M` liquidity / `$509K` 24h volume；GoPlus 显示 BNB Chain contract `0x6bdcce4a559076e37755a78ce0c06214e59e4444` open-source、non-proxy、non-mintable、owner 为 zero address、0 buy/sell tax、非 honeypot、约 `68K` holders。官网自述 “USD1 mascot”、B/USD1 合约、launchpad coming、WLFI/USD1 milestones 等均在文中标记为 project-reported narrative，而非 audited operating data。手动接入 `/research` 卡片 `name: 'BUILDon'`、`type: 'Meme/PayFi'`、`initial: 'B'`、`color: '#F5B800'`，本地 logo 为 `public/research-logos/buildon-b-bnb-chain-usd1-meme-liquidity-narrative-risk.jpg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（281 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/gemini-dollar-gusd-regulated-stablecoin-redemption-liquidity-risk.mdx`，标题 `Gemini Dollar GUSD: Regulated Stablecoin, Redemption Trust, and Liquidity Decay Risk`。结论是“regulated stablecoin watchlist / acceptable issuer-specific dollar, but not core reserve collateral”，重点分析 GUSD 作为 Gemini 发行的早期 NYDFS-regulated fiat-backed stablecoin，其 reserve / redemption / BPM LLP monthly attestation / Trail of Bits audit 可信度与当前公开市场流动性衰减之间的错配。纳入 2026-06-23 快照：CoinGecko 显示 Gemini Dollar `rank #537`、`price ~$0.999`、`market cap/FDV ~$39.3M`、`24h volume ~$343K`、`39.3M / 39.3M` circulating / total supply；DefiLlama 正确识别 `Gemini Dollar` 而非 symbol 碰撞的 `Gate USD`，约 `$39.3M` circulating supply，几乎全部在 Ethereum；Dexscreener 显示 Curve GUSD/3Crv 池约 `$1.07M` liquidity 但 24h volume 仅约 `$365`，Uniswap GUSD/USDC 池约 `$18.6K` liquidity / `$571` 24h volume。GoPlus 显示 Ethereum GUSD contract `0x056fd409e1d7a124bd7017459dfea2f387b6d5cd` open-source、non-proxy、0 buy/sell tax、非 honeypot、约 `19.4K` holders，owner address 仍作为 admin dependency 监控项。手动接入 `/research` 卡片 `name: 'Gemini Dollar'`、`type: 'Stablecoin'`、`initial: 'GUSD'`、`color: '#00DCFA'`，本地 logo 为 `public/research-logos/gemini-dollar-gusd-regulated-stablecoin-redemption-liquidity-risk.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（280 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/decentraland-mana-virtual-world-land-dao-value-capture-gap.mdx`，标题 `Decentraland MANA: Virtual World, LAND Economy, DAO Treasury, and the Value-Capture Gap`。结论是“selective metaverse / DAO watchlist, not high-conviction allocation yet”，重点分析 Decentraland 作为早期 virtual world / LAND / wearables / DAO governance 项目的历史品牌，与 MANA 在 active users、creator monetization、LAND turnover、marketplace spend 和 token sinks 上仍需证明的 value-capture gap。纳入 2026-06-23 快照：CoinGecko 显示 MANA `rank #210`、`price ~$0.074`、`market cap ~$142M`、`FDV ~$161M`、`24h volume ~$10.3M`、`1.94B / 2.19B` circulating / total supply，当前 CoinGecko 不显示 fixed max supply，ATH 为 2021-11-25 约 `$5.85`，30d 约 `-16%`；CoinGecko tickers 显示 Binance MANA/USDT 约 `$533K` converted 24h volume、OKX 约 `$158K`、Bybit 约 `$164K`、Coinbase MANA/USD 约 `$99K`，说明价格发现仍以 CEX 为主。Dexscreener 显示最大可见 Ethereum MANA/WETH 池约 `$59K` liquidity / `$3.4K` 24h volume，另一 Uniswap 池约 `$30K` liquidity / `$20.6K` 24h volume；GoPlus 显示 Ethereum MANA contract open-source、non-proxy、0 buy/sell tax、非 honeypot、约 `278K` holders，同时 `is_mintable=1` 和 owner address 需作为 supply / contract-control 监控项。开发侧不再使用旧 `kernel` / `explorer` 归档 repo 作为主要信号，改看当前 2.0 client 相关 repo：`decentraland/godot-explorer`、`decentraland/unity-explorer`、`decentraland/bevy-explorer` 均在 2026-06-22/23 有 push。手动接入 `/research` 卡片 `name: 'Decentraland'`、`type: 'Gaming/Metaverse'`、`initial: 'MANA'`、`color: '#FF2D55'`，本地 logo 为 `public/research-logos/decentraland-mana-virtual-world-land-dao-value-capture-gap.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（279 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/raydium-ray-solana-dex-clmm-launchpad-value-capture-gap.mdx`，标题 `Raydium RAY: Solana DEX Liquidity, CLMM, LaunchLab, and the Buyback Value-Capture Test`。结论是“selective exposure / high-quality Solana DEX watchlist, not a blanket buy”，重点分析 Raydium 作为 Solana AMM / CPMM / CLMM / LaunchLab / pool creation 基础设施的真实交易与流动性价值，以及 RAY 通过 trading fee buybacks 捕获协议价值的可验证程度。纳入 2026-06-23 快照：CoinGecko 显示 RAY `rank #190`、`price ~$0.62`、`market cap ~$167M`、`FDV ~$344M`、`24h token volume ~$13.8M`、`269M / 555M` circulating / max supply，ATH 为 2021-09-12 约 `$16.83`，30d 约 `-20%`；DefiLlama 显示 Raydium AMM TVL 约 `$849M`、staking TVL 约 `$23.5M`，DEX volume 约 `$193M` 24h / `$1.1B-$1.2B` 7d / `$4.3B-$4.4B` 30d，fees 约 `$160K` 24h / `$1.0M` 7d / `$4.49M` 30d，protocol revenue 约 `$24K` 24h / `$151K` 7d / `$672K` 30d。官方 docs 显示 CLMM / CPMM fees 中 `84%` 给 LP、`12%` 用于 RAY buybacks、`4%` 进 treasury，Standard AMM v4 为 `88%` LP / `12%` buybacks；Dexscreener 显示 Solana RAY/USDC Raydium 池约 `$3.67M` liquidity，RAY/SOL 池约 `$1.21M` liquidity / `$811K` 24h volume；GitHub `raydium-io/raydium-clmm` 最新 push 为 2026-06-16，`386` stars、`326` forks、`3` open issues。手动接入 `/research` 卡片 `name: 'Raydium'`、`type: 'DEX'`、`initial: 'RAY'`、`color: '#8C6CFF'`，本地 logo 为 `public/research-logos/raydium-ray-solana-dex-clmm-launchpad-value-capture-gap.jpg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（278 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/compound-comp-comet-lending-governance-value-capture-gap.mdx`，标题 `Compound COMP: Comet Lending, Blue-Chip DeFi Governance, and the Value-Capture Gap`。结论是“high-quality DeFi lending infrastructure watchlist, but not high-conviction COMP allocation yet”，重点分析 Compound V3 / Comet 作为老牌 DeFi lending 基础设施的真实质量，与 COMP governance token 在 reserve growth、protocol revenue、buyback / staking / fee policy 等方面仍未闭合的 value-capture gap。纳入 2026-06-23 快照：CoinGecko 显示 COMP `rank #188`、`price ~$17.54`、`market cap ~$170M`、`FDV ~$175M`、`24h volume ~$17.1M`、`9.67M / 10M` circulating / max supply，ATH 为 2021-05-12 约 `$854.45`，30d 约 `-12%`；DefiLlama 显示 Compound V3 TVL 约 `$1.09B`、borrowed 约 `$561M`，Compound V2 TVL 约 `$91M`，fees 约 `$55K` 24h / `$389K` 7d / `$1.67M` 30d，protocol revenue 约 `$3.1K` 24h / `$28.6K` 7d / `$113.8K` 30d。GoPlus 显示 Ethereum COMP contract open-source、non-proxy、non-mintable、0 buy/sell tax、非 honeypot、约 `220K` holders；Dexscreener 显示最大可见 Ethereum COMP/WETH Uniswap 池约 `$1.07M` liquidity 但 24h volume 仅约 `$1K`；GitHub `compound-finance/comet` 最新 push 为 2026-06-11，`309` stars、`196` forks、`76` open issues。手动接入 `/research` 卡片 `name: 'Compound'`、`type: 'Lending'`、`initial: 'COMP'`、`color: '#00D395'`，本地 logo 为 `public/research-logos/compound-comp-comet-lending-governance-value-capture-gap.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（277 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/the-sandbox-sand-metaverse-ugc-gaming-token-value-capture-gap.mdx`，标题 `The Sandbox SAND: Metaverse Land, UGC Gaming, and the Token Value-Capture Gap`。结论是“selective metaverse / gaming IP watchlist, not high-conviction allocation yet”，重点分析 The Sandbox 作为 UGC gaming / metaverse / LAND / creator economy 品牌资产，与 SAND token 在 marketplace spend、LAND demand、creator monetization、player retention 和 in-game sinks 上仍需证明的 value-capture gap。纳入 2026-06-23 快照：CoinGecko 显示 SAND `rank #208`、`price ~$0.055`、`market cap ~$146M`、`FDV ~$164M`、`24h volume ~$14.2M`、`2.67B / 3.0B` circulating / max supply，ATH 为 2021-11-25 约 `$8.40`，30d 约 `-24%`；CoinGecko tickers 显示 Binance SAND/USDT 约 `$1.1M` converted 24h volume、OKX 约 `$452K`、GroveX 约 `$455K`、Binance SAND/TRY 约 `$183K`，说明价格发现仍以 CEX 为主。DefiLlama 将 The Sandbox 归类为 Gaming，当前 TVL 为 `0`，覆盖 Polygon / Ethereum；Dexscreener 显示最大可见 Ethereum SAND/WETH Uniswap 池约 `$332K` liquidity / `$11K` 24h volume。GoPlus 显示 Ethereum SAND contract open-source、non-proxy、non-mintable、0 buy/sell tax、非 honeypot、约 `207K` holders；GitHub `thesandboxgame/sandbox-smart-contracts` 最新 push 为 2026-03-06，`185` stars、`92` forks、`19` open issues。手动接入 `/research` 卡片 `name: 'The Sandbox'`、`type: 'Gaming/Metaverse'`、`initial: 'SAND'`、`color: '#00ADEF'`，本地 logo 为 `public/research-logos/the-sandbox-sand-metaverse-ugc-gaming-token-value-capture-gap.jpg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（276 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：按 `research-map-builder` 流程确认并完成 PayPal USD / PYUSD 独立研究接入：`content/blog/2026/research/paypal-usd-pyusd-payfi-stablecoin.mdx`，标题 `PayPal USD: Regulated PayFi Stablecoin or Distribution-Led Dollar Wrapper`。结论是“high-quality watchlist / selective exposure to the PayFi stablecoin theme”，重点分析 PayPal + Venmo + merchant checkout 分发、Paxos issuer / reserve / attestation 结构、4% rewards 对真实有机需求的干扰、Solana / Arbitrum / Flow / Polygon / Sei / LayerZero 扩展、DEX 深度与 PayFi 竞品格局，以及 2025 年 Paxos accidental `$300T` mint 暴露的操作控制风险。纳入 2026-06-23 快照：PYUSD 约 `$2.77B` circulating value，CoinGecko 约 `#34`、CoinMarketCap 约 `#28`，DefiLlama 显示约 `17` 条链，Ethereum 约 `$1.79B`、Solana 约 `$678M`、Arbitrum 约 `$216M`、Flow 约 `$71M`、Polygon 约 `$10M`、Sei 约 `$5M`。Research Map 已有 `PayPal USD` 卡片，`type: 'Stablecoin'`、`initial: 'PY'`、`color: '#003087'`，本地 logo 为 `public/research-logos/paypal-usd-pyusd-payfi-stablecoin.png`。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/basic-attention-token-bat-brave-ads-attention-economy-value-capture-gap.mdx`，标题 `Basic Attention Token BAT: Brave Ads, Browser Distribution, and the Attention Value-Capture Gap`。结论是“selective consumer / adtech watchlist, not high-conviction allocation yet”，重点分析 Brave Browser / Brave Ads / Brave Rewards 的真实 consumer distribution，与 BAT 作为 attention / creator / rewards token 的价值捕获缺口。纳入 2026-06-23 快照：CoinGecko 显示 BAT `rank #222`、`price ~$0.089`、`market cap/FDV ~$133M`、`24h volume ~$26.2M`、`1.496B / 1.5B` circulating / max supply，ATH 为 2021-11-28 约 `$1.90`，7d / 30d 分别约 `-3.1% / -11.9%`；CoinGecko tickers 显示 Binance BAT/USDT 与 Pionex BAT/USDT sample volume 均约 `$424K-$426K`，Coinbase BAT/USD 约 `$165K`。Brave 官方 growth page 显示 Brave `100M+` MAU / `40M+` DAU；GitHub 显示 `brave/brave-browser` 最新 push 为 2026-06-23，`22.9K` stars、`3.1K` forks，`brave-core` 同日 push，`3.4K` stars、`1.3K` forks。GoPlus 显示 Ethereum BAT contract `0x0d8775f648430679a709e98d2b0cb6250d2887ef` open-source、non-proxy、0 buy/sell tax、非 honeypot、约 `420K` holders，同时 `is_mintable=1` 需作为合约权限监控项；Dexscreener 显示最大可见 BAT/WETH Uniswap 池约 `$182K` liquidity / `$1.6K` 24h volume，说明价格发现仍以 CEX 为主。文章明确 Brave 成功不等于 BAT 价值捕获，核心触发器是 advertiser spend、BAT rewards retention、creator payouts、product utility、buyback/burn 或更强 revenue linkage。手动接入 `/research` 卡片 `name: 'Basic Attention Token'`、`type: 'Consumer/Ads'`、`initial: 'BAT'`、`color: '#FF5000'`，本地 logo 为 `public/research-logos/basic-attention-token-bat-brave-ads-attention-economy-value-capture-gap.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（275 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/thorchain-rune-native-cross-chain-dex-liquidity-security-value-capture.mdx`，标题 `THORChain RUNE: Native Cross-Chain DEX Liquidity, Security Budget, and Value Capture`。结论是“high-quality cross-chain DEX infrastructure watchlist, not high-conviction allocation yet”，重点分析 THORChain 作为 native cross-chain swap 基础设施，RUNE 在 liquidity settlement、node bond、security budget 和 fee/value capture 中的核心但高反身性角色。纳入 2026-06-23 快照：CoinGecko 显示 RUNE `rank #210`、`price ~$0.42`、`market cap ~$142M`、`FDV ~$149M`、`24h volume ~$11.2M`、`338.4M / 354.2M` circulating / max supply，ATH 为 2021-05-19 约 `$20.87`，7d / 30d 分别约 `+8.5% / -5.0%`；CoinGecko tickers 显示 Binance RUNE/USDT 约 `$821K` converted 24h volume，THORChain native USDT/RUNE 约 `$873K`、BTC/RUNE 约 `$816K`、USDC/RUNE 约 `$622K`，说明协议本身仍进入价格发现路径。DefiLlama 显示 Thorchain DEX TVL 约 `$52.1M`，覆盖 Thorchain、Bitcoin、Ethereum、Base、Solana、Avalanche、Doge、BCH、Litecoin、XRP、Tron、Cosmos 等资产；Thorchain chain TVL 约 `$24.9M`。Midgard 显示 aggregate RUNE-side pool depth 约 `63.2M RUNE`，和 DefiLlama TVL 量级相符；DefiLlama DEX overview 当前对 THORChain volume 返回 0，因此文章明确使用 CoinGecko THORChain pairs + Midgard pools 作为更强证据。手动接入 `/research` 卡片 `name: 'THORChain'`、`type: 'Cross-chain DEX'`、`initial: 'RUNE'`、`color: '#00CCB8'`，本地 logo 为 `public/research-logos/thorchain-rune-native-cross-chain-dex-liquidity-security-value-capture.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（274 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/trust-wallet-token-twt-wallet-distribution-utility-value-capture-gap.mdx`，标题 `Trust Wallet Token TWT: Wallet Distribution, Binance Adjacency, and the Utility Value-Capture Gap`。结论是“selective wallet-infrastructure watchlist, not high-conviction allocation yet”，重点分析 Trust Wallet 作为 self-custody 钱包分发层、Binance adjacency、开源 wallet infra 与 TWT utility / loyalty / governance-style token 的价值捕获缺口。纳入 2026-06-23 快照：CoinGecko 显示 TWT `rank #199`、`price ~$0.378`、`market cap ~$157.5M`、`FDV ~$378.0M`、`24h volume ~$4.77M`、`416.6M / 1.0B` circulating / total supply，ATH 为 2022-12-11 约 `$2.72`，7d / 30d 分别约 `-9.8% / -17.4%`；CoinGecko tickers 显示 BitMart TWT/USDT 约 `$912K` converted 24h volume，Binance / Bybit sample volume 均低于 `$200K`。GoPlus 显示 BNB Chain TWT contract `0x4b0f1812e5df2a09796481ff14017e6005508003` open-source、non-proxy、non-mintable、0 buy/sell tax、非 honeypot、约 `292.7K` holders；Dexscreener 显示 PancakeSwap TWT/WBNB 池约 `$491K` liquidity / `$12K` 24h volume，TWT/USDT 池约 `$304K` liquidity / `$19K` 24h volume。GitHub 显示 `trustwallet/assets` 最新 push 为 2026-06-22，`5.3K` stars、`27K` forks；`trustwallet/wallet-core` 最新 push 为 2026-06-19，`3.5K` stars、`2.0K` forks。文章明确 TWT 不是 Trust Wallet equity，也不是 revenue-share token，投资触发器应是更强的 in-app fee discounts、loyalty utility、治理/访问权、buyback/burn 或 product-fee linkage。手动接入 `/research` 卡片 `name: 'Trust Wallet Token'`、`type: 'Wallet'`、`initial: 'TWT'`、`color: '#3375BB'`，本地 logo 为 `public/research-logos/trust-wallet-token-twt-wallet-distribution-utility-value-capture-gap.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（273 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
