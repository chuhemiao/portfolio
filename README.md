# kkdemian

Personal portfolio site for [kkdemian](https://kkdemian.com) — Web3 Product Engineer, digital nomad, Bitcoin & ETH HODL.

Built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI. Deployed on Vercel.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/chuhemiao/portfolio
   cd portfolio
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Edit personal data in [`src/data/resume.tsx`](./src/data/resume.tsx)

## Pages

| Route        | Description                                              |
| ------------ | -------------------------------------------------------- |
| `/`          | Home — bio, work, projects, philosophy, hackathons       |
| `/blog`      | Blog posts organized by year/category                    |
| `/stack`     | Tools and tech stack                                     |
| `/fund`      | Fund tracker                                             |
| `/fear`      | Crypto Fear & Greed index                                |
| `/research`  | Deep-dive research map — 72 crypto project reports       |

## Content Management

Blog posts live under `content/blog/` and can be organized in nested folders (e.g. `content/blog/2026/research/`).

**Frontmatter:**

```md
---
title: 'Post title'
publishedAt: '2026-02-25'
summary: 'One line summary'
slug: 'my-post-slug'
category: 'research'
---
```

- Routes are always `/blog/[slug]` regardless of folder location.
- Draft posts: place in a `drafts/` or `_drafts/` folder, or set `draft: true` in frontmatter.

**Useful commands:**

```bash
# Create a new post (auto-generates category, slug, and path)
pnpm new:post -- "A deep research report about BTC and macro liquidity"

# Validate content before publishing
pnpm content:check

# One-time batch organize root-level files into year folders
pnpm content:organize

# Check which research blog posts are missing from the Research Map
pnpm sync:research

# Auto-append scaffold entries for missing research projects
pnpm sync:research --add
```

`new:post` supports optional flags: `--title`, `--category`, `--date`, `--slug`, `--dry-run`

## Research Reports

Deep-dive investment research published at `/research`. Listed by project:

### Exchanges (CEX)
- Binance: Institutional-Grade Exchange Research Report
- Coinbase Investment-Grade Research Report (2026)
- Bybit: Liquidity Deep Dive — $22.9B Daily Trading Volume
- Bitget Deep Research Report: Comprehensive Investment Analysis
- Gate.io In-Depth Research Report: Cyclical Value Analysis
- MEXC In-Depth Research Report: Zero-Fee Strategy Analysis
- HashKey Exchange: Compliance-First Architecture for Regulated Markets
- XT.COM Deep Research: Capital Aggregation Infrastructure
- MSX Exchange Deep Research: RWA Tokenization Pioneer
- OSL Digital Financial Infrastructure Investment Research

### Perpetual DEX
- Hyperliquid Investment-Grade Research Report (2025/2026)
- AsterDEX Investment-Grade Research Report
- Reya Network In-Depth Investment Research Report
- StandX Protocol Deep Dive: Yield-Bearing Perpetuals DEX
- Pacifica Finance: Solana's Hybrid Perpetual Exchange Analysis
- Perpl.xyz In-Depth Research: Monad Order Book Perp Protocol
- Flyingtulip In-Depth Research Report 2026

### DEX / Lending / DeFi
- Uniswap Ecosystem Panoramic Research: AMM to Multi-Chain Infrastructure
- Jupiter Protocol: The Execution Layer Paradox
- Aave Deep Research: Leading Position in the Lending Market
- Maple Finance & SYRUP Token: Investment-Grade Research Report
- Morpho Deep Research: Modular Lending Protocol Analysis
- Superform Omnichain Yield Infrastructure: Deep Research
- Symphony AI-Native DeFi Execution Layer: Investment Analysis
- Sky Token Impact: Emission Cut and Buyback Program Analysis
- Cascade Neo: Cross-Asset Margin Unification Architecture
- TradeGenius: Privacy-First On-Chain Trading OS — YZi Labs Backed
- MetaDAO: Futarchy Mechanism and Market-Driven Governance Analysis
- RaveDAO: Digital-Physical Bridge for Electronic Music Culture & NFTs
- Definitive (EDGE): Non-Custodial Multi-Chain TWAP Trading Terminal

### L1 / L2 / Infrastructure
- Bitcoin: Global Neutral Monetary Network and Digital Reserve Asset Analysis
- Ethereum (ETH): Institutional Research Report
- Sui Institutional Research Report
- MegaETH Investment-Grade Research Report: Real-Time EVM
- Fogo: High-Performance SVM Layer-1 for Real-Time DeFi
- Espresso Shared Sequencing & Rollup Base Layer Research
- Canton Network: Comprehensive Investment Research Report
- Midnight Network: Compliance-Preserving Privacy Blockchain
- Plasma Deep-Dive: Stablecoin-Native L1 Analysis
- Integra Protocol: Purpose-Built L1 for Real Estate RWA
- Sentio: Web3 Data Infrastructure New Paradigm — On-Chain Analytics

### ZK / FHE / Privacy
- Aztec Network: Privacy-First zk-Rollup Architecture
- Succinct Labs: Decentralized ZK Proof Infrastructure
- Brevis (BREV) In-Depth Investment Research Report
- Zama: FHE Stack and the Next Phase of Blockchain Privacy
- Octra FHE: Hypergraph-Based FHE Architecture Assessment
- Cysic Network: Hardware-Accelerated Verifiable Compute
- zkPass: zkTLS as Trust-Minimized Bridge for Web2 Data
- Railgun: Privacy Infrastructure for Composable DeFi
- Inference Labs: Verifiable AI via zkML and On-Chain Proofs

### Prediction Markets
- Prediction Market Sector: Polymarket & Kalshi Research (2025/2026)
- The Rise of Prediction Markets: PMF Analysis
- Opinion Labs: Investment Thesis for OPINION Macro Exchange
- Rain Protocol Deep Dive: AMM Prediction Market Infrastructure
- Kairos Deep Dive: Prediction Market Execution Infrastructure
- Predict.fun Deep Research: On-Chain Prediction Markets
- Probable: The Orderbook Oracle On-Chain Prediction Market

### Stablecoin / PayFi
- Circle Global Stablecoin, Cross-Chain Settlement Research
- Global Stablecoin Sector: Investment-Grade Research Report
- RedotPay: Institutional-Grade PayFi Infrastructure Analysis
- USDG (Global Dollar): Institutional-Grade Analysis
- USD.AI: Hybrid RWA-Backed Stablecoin for GPU Credit Markets
- Unitas Protocol: Solana-Native Yield-Bearing Stablecoin
- KGST Stablecoin: Investment-Grade Research Report
- River: Chain-Abstraction Stablecoin Deep Dive
- Tria Chain-Abstraction Neobank & BestPath AVS Analysis

### AI / DePIN
- Gensyn: Investment-Grade Research Report
- Sentient Protocol: Investment-Grade Analysis & Strategic Assessment
- DeAgentAI Deep Dive: Back on Binance Futures and Alpha
- Warden Protocol: Verifiable AI Infrastructure Layer
- Fabric Protocol In-Depth Research: AI Robotics Infrastructure

### RWA
- Centrifuge (CFG) RWA Tokenization Infrastructure Report
- BlockStreet: VC-Grade Infrastructure for Tokenized Capital Markets

### Wallet
- Rainbow Wallet: Investment-Grade Research Report

### Market Analysis
- 2026 Crypto Market Structural Outlook Report
- 2026 Crypto Market Outlook: From Liquidity Flood to Value Settlement
- Ethereum (ETH): Institutional Research Report
- Bitcoin: Global Neutral Monetary Network Analysis
- Bitcoin 2030: $300K Digital Gold Valuation Analysis
- Bitcoin Crypto Derivatives Intelligence System Report
- Crypto Derivatives Intelligence System Report 2026-03-14
- 2026 Web3 & Crypto Investment Opportunities from X
- Crypto Tokens Outperforming Bitcoin in Q1-Q2 2025
- The Rise of the Synthetic Crypto Index
- Mobile-First Web3 dApp Era Report (2025)

## License

MIT
