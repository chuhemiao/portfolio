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

- **2026-06-23**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/megausd-usdm-megaeth-native-stablecoin-sequencer-yield-risk.mdx`，标题 `MegaUSD USDM: MegaETH Native Stablecoin, Sequencer Yield Subsidy, and Redemption Risk`。结论是“useful MegaETH ecosystem stablecoin watchlist, but not a core reserve asset yet”，重点分析 USDm 作为 MegaETH native stablecoin + Ethena whitelabel stablecoin stack 的链经济设计：用储备收益补贴 sequencer OPEX、降低 L2 fee margin，而不是向持有人分配收益。纳入 2026-06-23 快照：CoinGecko 显示 MegaUSD / USDM `rank #158`、`price ~$0.999`、`market cap / FDV ~$222M`、`24h volume ~$783K`、`~222M / ~222M` circulating / total supply；CoinMarketCap preview page 显示 self-reported circulating / total supply 约 `287.9M USDM`，与 CoinGecko / DefiLlama 口径存在明显差异，需监控供应 reconciliation。DefiLlama Stablecoins 显示 MegaUSD 约 `$222.0M` circulating value，几乎全部在 MegaETH（约 `$221.99M`），Ethereum 仅约 `$8K`，并归类为 crypto-backed stablecoin。官方 MegaETH / Ethena Whitelabel 信息显示 USDm v1 使用 Ethena USDtb rails，储备主要通过 Securitize 投向 BlackRock BUIDL tokenized treasury fund，并配合 liquid stablecoins 支持 redemption，未来 reserve mix 可能包括 USDe 等 Ethena 产品；文章重点标出 MegaETH execution / bridge、Ethena whitelabel、USDtb、BUIDL / Securitize / BlackRock、reserve-composition drift、secondary liquidity 和 direct redemption access 等多层风险。GoPlus 对 Ethereum representation `0xec2af1c8b110a61fd9c3fa6a554a031ca9943926` 显示 open-source、0 buy/sell tax、约 `52` holders、`is_proxy=1`，Ethereum-side supply 很薄。手动接入 `/research` 卡片 `name: 'MegaUSD'`、`type: 'Stablecoin'`、`initial: 'USDM'`、`color: '#FF4D00'`，本地 logo 为 `public/research-logos/megausd-usdm-megaeth-native-stablecoin-sequencer-yield-risk.svg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（287 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/humanity-h-proof-of-humanity-token-swap-value-capture-risk.mdx`，标题 `Humanity H: Proof-of-Humanity Identity Network, Token Swap, and Value-Capture Risk`。结论是“speculative identity / proof-of-humanity watchlist, not high-conviction allocation yet”，重点分析 Humanity 作为 privacy-first proof-of-humanity / Proof-of-Trust identity network 的 palm recognition、zero-knowledge proofs、verifiable credentials、Human ID、verifier nodes、SDK/API 与 H token value-capture risk，同时把 2026-06 private-key / bridge-admin exploit、old H sunset、新 Ethereum ERC-20 1:1 recovery airdrop、供应口径冲突和后续 unlock 压力作为核心风险。纳入 2026-06-23 快照：CoinGecko 显示 H `rank #159`、`price ~$0.122`、`market cap ~$222M`、`FDV ~$1.22B`、`24h volume ~$31M`、`1.825B / 10B` circulating / max supply；CoinMarketCap / 部分市场数据因 circulating supply 口径更高约 `2.8B H`，market cap 约 `$350M`；Tokenomist 显示约 `1.825B H` unlocked、`18.25%` supply，且 2026-06-25 附近有 Early Contributors unlock。官方 tokenomics 为 Ecosystem Fund `24%`、Early Contributors `19%`、Identity Verification Rewards `18%`、Community Incentives `12%`、Foundation Operations Treasury `12%`、Investors `10%`、Human Institute Strategic Reserve `5%`；Crypto.news / CoinDesk 报道旧 H 在 Ethereum / BSC / Humanity Mainnet sunset，新 token contract 为 `0xE76c5b78f93909d34404E9eb4C1f19e7582a5dE1`，按 2026-06-08 snapshot 1:1 airdrop 并排除 attacker-linked addresses。Dexscreener 显示 Ethereum Uniswap v4 H/USDT 池约 `$700K` liquidity / `$3.4M` 24h volume；GoPlus 显示新 ETH H contract open-source、0 buy/sell tax，但 `is_proxy=1`，upgrade/admin controls 需继续监控。手动接入 `/research` 卡片 `name: 'Humanity'`、`type: 'Identity/PoH'`、`initial: 'H'`、`color: '#EC4899'`，本地 logo 为 `public/research-logos/humanity-h-proof-of-humanity-token-swap-value-capture-risk.svg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（286 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续按 `research-map-builder` + `pua-loop` 推进 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入两篇：`content/blog/2026/research/bitway-btw-bitcoin-native-yield-lending-token-value-capture-risk.mdx` 与 `content/blog/2026/research/layerzero-zro-omnichain-messaging-fee-switch-value-capture-gap.mdx`。Bitway / BTW 结论是“speculative BTCFi / DeTraFi watchlist, not high-conviction allocation yet”，重点分析 Bitway Earn、BNB Chain vaults、BTCT / native BTC lending roadmap、Binance market-neutral strategy dependency、7 天 normal unstake、flash-unstake penalty、BTW staking/access/rewards/governance 与 token value-capture gap。纳入 2026-06-23 快照：CoinGecko 显示 BTW `rank #182`、`price ~$0.085`、`market cap ~$187M`、`FDV ~$851M`、`24h volume ~$49M`、`TVL ~$60.97M`、`2.2B / 10B` circulating / max supply；CoinMarketCap 显示 `rank #222`、类似 mcap / supply；DefiLlama Bitway Earn 显示约 `$60.97M` TVL、`$480.6K` 30d fees、`$93.6K` 30d protocol revenue；GoPlus 显示 BSC BTW contract open-source、non-proxy、non-mintable、0 tax、非 honeypot、约 `43.9K` holders。LayerZero / ZRO 结论是“high-quality interoperability infrastructure watchlist, not high-conviction ZRO allocation yet”，重点分析 Endpoints、OApps、OFTs、DVNs、Executors、0% messaging fee take-rate、six-month fee-switch referendum、Stargate-funded ZRO buybacks、multi-DVN production configuration 与 app-level security risk。纳入快照：CoinGecko 显示 ZRO `rank #146`、`price ~$0.957`、`market cap ~$242M`、`FDV ~$957M`、`24h volume ~$36M`、`252.3M / 1B` circulating / max supply；CoinMarketCap 显示 rank 约 `#98` 且因 circulating supply 口径更高而 mcap 约 `$338M`；DefiLlama LayerZero V2 显示 adapter TVL 约 `$7.50B`、30d messaging fees 约 `$113.8K`、30d revenue / buybacks 约 `$141.2K`，methodology 明确 LayerZero V2 messaging fee take-rate 为 `0%`，fees 主要流向 DVNs / Executors。手动接入 `/research` 卡片：`Bitway` type `BTCFi/Yield`、initial `BTW`、color `#F59E0B`，本地 logo `public/research-logos/bitway-btw-bitcoin-native-yield-lending-token-value-capture-risk.svg`；`LayerZero` type `Interoperability`、initial `ZRO`、color `#0B0F19`，本地 logo `public/research-logos/layerzero-zro-omnichain-messaging-fee-switch-value-capture-gap.svg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（285 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/falcon-finance-ff-universal-collateral-token-value-capture-risk.mdx`，标题 `Falcon Finance FF: Universal Collateral Infrastructure and Token Value-Capture Risk`。结论是“selective DeFi / synthetic-dollar infrastructure watchlist, not high-conviction allocation yet”，重点分析 FF 作为 Falcon Finance / USDf / sUSDf 体系的 governance + staking + incentives token，是否能从 universal collateral、USDf supply、sFF staking、fee discounts、APY boosts、governance 和 product access 中捕获价值。纳入 2026-06-23 快照：CoinGecko 显示 FF `rank #177`、`price ~$0.068`、`market cap ~$196M`、`FDV ~$682M`、`24h volume ~$9.4M`、`2.875B / 10B` circulating / max supply，CoinGecko/DefiLlama 均显示 Falcon Finance TVL 约 `$1.30B`；DefiLlama fees 端点显示约 `$15.2K` 24h fees、`$80.7K` 7d fees、`$323.8K` 30d fees，并注明 smart contracts 内无 protocol revenue retained、yield 分配给 stakers。官方 docs 显示 FF tokenomics 为 `35%` ecosystem、`24%` foundation、`20%` core team + early contributors、`8.3%` community airdrops + launchpad、`8.2%` marketing、`4.5%` investors，TGE circulation `2.34B`；sFF 为 1:1 staking token，3 天 cooldown，governance still coming soon。Dexscreener 显示 BSC PancakeSwap FF/USDT 池约 `$3.8M` liquidity / `$3.7M` 24h volume，Ethereum Uniswap FF/USDT 池流动性较薄；GoPlus 显示 ETH FF contract open-source、non-proxy、non-mintable、0 tax、非 honeypot、约 `11.3K` holders，BSC FF contract open-source、non-proxy、0 tax、非 honeypot、约 `27.5K` holders，但 `is_mintable=1` 和 owner address 需监控。手动接入 `/research` 卡片 `name: 'Falcon Finance FF'`、`type: 'DeFi/Stablecoin'`、`initial: 'FF'`、`color: '#111827'`，本地 logo 为 `public/research-logos/falcon-finance-ff-universal-collateral-token-value-capture-risk.png`。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/velvet-velvet-ai-onchain-trading-terminal-token-value-capture-risk.mdx`，标题 `Velvet VELVET: AI Onchain Trading Terminal, Multi-Chain Execution, and Token Value-Capture Risk`。结论是“selective AI / DeFi trading-infra watchlist, not high-conviction allocation yet”，重点分析 Velvet Capital 从 DeFi portfolio/vault tooling 转向 AI-powered onchain trading terminal 后，VELVET token 是否能通过 trading fees、staking、cashback、vault AUM 和 trader retention 捕获价值。官网/Docs 显示产品覆盖 Base、Ethereum、BNB Chain、Solana、Hyperliquid、Monad、Sonic 7 条链，整合 Jupiter、1inch、0x、KyberSwap、OKX DEX、Hyperliquid、Enso 等路由/流动性源，强调 non-custodial、AI copilot、100K+ users、$200M+ spot volume、7 independent audits 和 YZi Labs / DWF Labs 等 backers。纳入 2026-06-23 快照：CoinGecko top-list 显示 VELVET `rank #174`、`price ~$0.48`、`market cap ~$202M`、`24h volume ~$11.2M`；Dexscreener 显示 Base Aerodrome VELVET/USDC 池约 `$3.36M` liquidity / `$2.29M` 24h volume，BSC PancakeSwap VELVET/WBNB 池约 `$2.17M` liquidity / `$153K` 24h volume，BSC Uniswap VELVET/USDT 池约 `$90.7K` liquidity / `$529K` 24h volume。GoPlus 显示 BSC contract `0x8b194370825e37b33373e74a41009161808c1488` open-source、non-proxy、owner zero、0 buy/sell tax、非 honeypot、约 `11.3K` holders，但 `is_mintable=1` 需监控；Base contract `0xbf927b841994731c573bdf09ceb0c6b0aa887cdd` open-source、proxy flag=1、约 `5.7K` holders。手动接入 `/research` 卡片 `name: 'Velvet'`、`type: 'AI/Trading'`、`initial: 'VELVET'`、`color: '#7C3AED'`，本地 logo 为 `public/research-logos/velvet-velvet-ai-onchain-trading-terminal-token-value-capture-risk.jpg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（282 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/buildon-b-bnb-chain-usd1-meme-liquidity-narrative-risk.mdx`，标题 `BUILDon B: BNB Chain USD1 Meme, Liquidity Flywheel, and Narrative Risk`。结论是“speculative meme / USD1 liquidity watchlist, not fundamentals-backed allocation”，重点分析 BUILDon 作为 BNB Chain 上围绕 USD1 / WLFI 叙事的 meme/liquidity asset，而不是常规协议现金流项目。纳入 2026-06-23 快照：CoinGecko 显示 B `rank #152`、`price ~$0.236`、`market cap/FDV ~$237M`、`24h volume ~$6.2M`、`1B / 1B` circulating / max supply，ATH 为 2026-05-14 约 `$0.764`，CoinGecko category 包含 `BNB Chain Ecosystem`、`Meme`、`World Liberty Financial Portfolio`、`Binance Alpha Spotlight`。Dexscreener 显示 PancakeSwap B/USD1 池约 `$2.38M` liquidity / `$2.74M` 24h volume，B/WBNB 池约 `$2.56M` liquidity / `$509K` 24h volume；GoPlus 显示 BNB Chain contract `0x6bdcce4a559076e37755a78ce0c06214e59e4444` open-source、non-proxy、non-mintable、owner 为 zero address、0 buy/sell tax、非 honeypot、约 `68K` holders。官网自述 “USD1 mascot”、B/USD1 合约、launchpad coming、WLFI/USD1 milestones 等均在文中标记为 project-reported narrative，而非 audited operating data。手动接入 `/research` 卡片 `name: 'BUILDon'`、`type: 'Meme/PayFi'`、`initial: 'B'`、`color: '#F5B800'`，本地 logo 为 `public/research-logos/buildon-b-bnb-chain-usd1-meme-liquidity-narrative-risk.jpg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（281 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/gemini-dollar-gusd-regulated-stablecoin-redemption-liquidity-risk.mdx`，标题 `Gemini Dollar GUSD: Regulated Stablecoin, Redemption Trust, and Liquidity Decay Risk`。结论是“regulated stablecoin watchlist / acceptable issuer-specific dollar, but not core reserve collateral”，重点分析 GUSD 作为 Gemini 发行的早期 NYDFS-regulated fiat-backed stablecoin，其 reserve / redemption / BPM LLP monthly attestation / Trail of Bits audit 可信度与当前公开市场流动性衰减之间的错配。纳入 2026-06-23 快照：CoinGecko 显示 Gemini Dollar `rank #537`、`price ~$0.999`、`market cap/FDV ~$39.3M`、`24h volume ~$343K`、`39.3M / 39.3M` circulating / total supply；DefiLlama 正确识别 `Gemini Dollar` 而非 symbol 碰撞的 `Gate USD`，约 `$39.3M` circulating supply，几乎全部在 Ethereum；Dexscreener 显示 Curve GUSD/3Crv 池约 `$1.07M` liquidity 但 24h volume 仅约 `$365`，Uniswap GUSD/USDC 池约 `$18.6K` liquidity / `$571` 24h volume。GoPlus 显示 Ethereum GUSD contract `0x056fd409e1d7a124bd7017459dfea2f387b6d5cd` open-source、non-proxy、0 buy/sell tax、非 honeypot、约 `19.4K` holders，owner address 仍作为 admin dependency 监控项。手动接入 `/research` 卡片 `name: 'Gemini Dollar'`、`type: 'Stablecoin'`、`initial: 'GUSD'`、`color: '#00DCFA'`，本地 logo 为 `public/research-logos/gemini-dollar-gusd-regulated-stablecoin-redemption-liquidity-risk.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（280 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/decentraland-mana-virtual-world-land-dao-value-capture-gap.mdx`，标题 `Decentraland MANA: Virtual World, LAND Economy, DAO Treasury, and the Value-Capture Gap`。结论是“selective metaverse / DAO watchlist, not high-conviction allocation yet”，重点分析 Decentraland 作为早期 virtual world / LAND / wearables / DAO governance 项目的历史品牌，与 MANA 在 active users、creator monetization、LAND turnover、marketplace spend 和 token sinks 上仍需证明的 value-capture gap。纳入 2026-06-23 快照：CoinGecko 显示 MANA `rank #210`、`price ~$0.074`、`market cap ~$142M`、`FDV ~$161M`、`24h volume ~$10.3M`、`1.94B / 2.19B` circulating / total supply，当前 CoinGecko 不显示 fixed max supply，ATH 为 2021-11-25 约 `$5.85`，30d 约 `-16%`；CoinGecko tickers 显示 Binance MANA/USDT 约 `$533K` converted 24h volume、OKX 约 `$158K`、Bybit 约 `$164K`、Coinbase MANA/USD 约 `$99K`，说明价格发现仍以 CEX 为主。Dexscreener 显示最大可见 Ethereum MANA/WETH 池约 `$59K` liquidity / `$3.4K` 24h volume，另一 Uniswap 池约 `$30K` liquidity / `$20.6K` 24h volume；GoPlus 显示 Ethereum MANA contract open-source、non-proxy、0 buy/sell tax、非 honeypot、约 `278K` holders，同时 `is_mintable=1` 和 owner address 需作为 supply / contract-control 监控项。开发侧不再使用旧 `kernel` / `explorer` 归档 repo 作为主要信号，改看当前 2.0 client 相关 repo：`decentraland/godot-explorer`、`decentraland/unity-explorer`、`decentraland/bevy-explorer` 均在 2026-06-22/23 有 push。手动接入 `/research` 卡片 `name: 'Decentraland'`、`type: 'Gaming/Metaverse'`、`initial: 'MANA'`、`color: '#FF2D55'`，本地 logo 为 `public/research-logos/decentraland-mana-virtual-world-land-dao-value-capture-gap.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（279 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/raydium-ray-solana-dex-clmm-launchpad-value-capture-gap.mdx`，标题 `Raydium RAY: Solana DEX Liquidity, CLMM, LaunchLab, and the Buyback Value-Capture Test`。结论是“selective exposure / high-quality Solana DEX watchlist, not a blanket buy”，重点分析 Raydium 作为 Solana AMM / CPMM / CLMM / LaunchLab / pool creation 基础设施的真实交易与流动性价值，以及 RAY 通过 trading fee buybacks 捕获协议价值的可验证程度。纳入 2026-06-23 快照：CoinGecko 显示 RAY `rank #190`、`price ~$0.62`、`market cap ~$167M`、`FDV ~$344M`、`24h token volume ~$13.8M`、`269M / 555M` circulating / max supply，ATH 为 2021-09-12 约 `$16.83`，30d 约 `-20%`；DefiLlama 显示 Raydium AMM TVL 约 `$849M`、staking TVL 约 `$23.5M`，DEX volume 约 `$193M` 24h / `$1.1B-$1.2B` 7d / `$4.3B-$4.4B` 30d，fees 约 `$160K` 24h / `$1.0M` 7d / `$4.49M` 30d，protocol revenue 约 `$24K` 24h / `$151K` 7d / `$672K` 30d。官方 docs 显示 CLMM / CPMM fees 中 `84%` 给 LP、`12%` 用于 RAY buybacks、`4%` 进 treasury，Standard AMM v4 为 `88%` LP / `12%` buybacks；Dexscreener 显示 Solana RAY/USDC Raydium 池约 `$3.67M` liquidity，RAY/SOL 池约 `$1.21M` liquidity / `$811K` 24h volume；GitHub `raydium-io/raydium-clmm` 最新 push 为 2026-06-16，`386` stars、`326` forks、`3` open issues。手动接入 `/research` 卡片 `name: 'Raydium'`、`type: 'DEX'`、`initial: 'RAY'`、`color: '#8C6CFF'`，本地 logo 为 `public/research-logos/raydium-ray-solana-dex-clmm-launchpad-value-capture-gap.jpg`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（278 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
- **2026-06-23**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增并接入 `content/blog/2026/research/compound-comp-comet-lending-governance-value-capture-gap.mdx`，标题 `Compound COMP: Comet Lending, Blue-Chip DeFi Governance, and the Value-Capture Gap`。结论是“high-quality DeFi lending infrastructure watchlist, but not high-conviction COMP allocation yet”，重点分析 Compound V3 / Comet 作为老牌 DeFi lending 基础设施的真实质量，与 COMP governance token 在 reserve growth、protocol revenue、buyback / staking / fee policy 等方面仍未闭合的 value-capture gap。纳入 2026-06-23 快照：CoinGecko 显示 COMP `rank #188`、`price ~$17.54`、`market cap ~$170M`、`FDV ~$175M`、`24h volume ~$17.1M`、`9.67M / 10M` circulating / max supply，ATH 为 2021-05-12 约 `$854.45`，30d 约 `-12%`；DefiLlama 显示 Compound V3 TVL 约 `$1.09B`、borrowed 约 `$561M`，Compound V2 TVL 约 `$91M`，fees 约 `$55K` 24h / `$389K` 7d / `$1.67M` 30d，protocol revenue 约 `$3.1K` 24h / `$28.6K` 7d / `$113.8K` 30d。GoPlus 显示 Ethereum COMP contract open-source、non-proxy、non-mintable、0 buy/sell tax、非 honeypot、约 `220K` holders；Dexscreener 显示最大可见 Ethereum COMP/WETH Uniswap 池约 `$1.07M` liquidity 但 24h volume 仅约 `$1K`；GitHub `compound-finance/comet` 最新 push 为 2026-06-11，`309` stars、`196` forks、`76` open issues。手动接入 `/research` 卡片 `name: 'Compound'`、`type: 'Lending'`、`initial: 'COMP'`、`color: '#00D395'`，本地 logo 为 `public/research-logos/compound-comp-comet-lending-governance-value-capture-gap.png`。验证通过：`pnpm sync:research`、frontmatter/logo 检查、`pnpm check:research:logos`（277 projects）、`pnpm exec tsc --noEmit`、`git diff --check`；`pnpm content:check` 仍只因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。
