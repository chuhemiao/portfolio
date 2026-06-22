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

- **2026-06-22**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增 `content/blog/2026/research/algorand-algo-finality-quantum-roadmap-app-demand-gap.mdx`，标题 `Algorand: Instant Finality, Quantum Roadmap, and the ALGO App Demand Gap`。结论是“selective infrastructure watchlist, not a high-conviction L1 position yet”，重点分析 Algorand 的 pure proof of stake、single-block finality、约 `0.001 ALGO` 低手续费、AlgoKit / Python 开发者工具、2025 staking rewards、2026-2027 quantum roadmap 与现实 app demand gap；纳入 CMC 约 `#64`、CG 约 `#79`、price 约 `$0.09`、market cap 约 `$790-800M`、circulating supply 约 `8.93B ALGO`、max supply `10B`，以及 DefiLlama 约 `$91M` TVL、`$46M` stablecoins、`$13/day` chain fees、`$0/day` revenue、`$291K` 24h DEX volume。手动接入 `/research` 卡片 `type: 'L1'`、`initial: 'ALGO'`、`color: '#111827'`，本地 logo 为 `public/research-logos/algorand-algo-finality-quantum-roadmap-app-demand-gap.svg`；验证：`pnpm sync:research` 显示无 missing entries、frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（190 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增 `content/blog/2026/research/htx-dao-htx-exchange-linked-token-burn-governance-risk.mdx`，标题 `HTX DAO: Exchange-Linked Utility Token, Burn Economics, and Governance Opacity Risk`。结论是“high-risk exchange-token watchlist, not a high-conviction governance asset”，重点分析 HTX 作为 HTX Exchange / Huobi legacy 体系下的 CEX-linked utility token，而不是成熟 DAO governance asset：HT to HTX 迁移、fee discount、Prime / Launchpool、P2P merchant rights、campaign rights、quarterly burn narrative、supply methodology discrepancy、exchange concentration、governance opacity 与 2026 UK sanctions 相关新闻风险；纳入 CG 约 `#48`、CMC 约 `#203`、price 约 `$0.0000017`、CG market cap 约 `$1.55B`、CMC market cap 约 `$238M`、24h volume 约 `$25M`，并明确 CG/CMC 市值差异是估值核心风险。由于 `sync:research --add` 会进入外部 logo 下载，本轮采用手动接入 Research Map 的稳定路径：新增 `/research` 卡片 `type: 'CEX'`、`initial: 'HTX'`、`color: '#00B8D9'`，本地 logo 为 `public/research-logos/htx-dao-htx-exchange-linked-token-burn-governance-risk.svg`；验证：`pnpm sync:research` 显示无 missing entries、frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（189 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 CoinGecko / CoinMarketCap top 1000 research 缺口，本轮新增 `content/blog/2026/research/pi-network-pi-mobile-mining-kyc-utility-reality-check.mdx`，标题 `Pi Network: Mobile Mining Distribution, KYC Gating, and the Utility Reality Check`。结论是“speculative watchlist / avoid high-conviction exposure until utility becomes observable”，重点分析 Pi Network 作为 mobile-mined consumer L1 / identity-gated distribution asset 的优势与折价：Open Network `2025-02-20` 上线、项目披露 `19M` KYC / `10.14M` migrated at launch、`60M+` Engaged Pioneers、Pi Browser / Pi App Studio / Ecosystem Directory Staking 分发路径，以及 CMC 约 `#45`、CG 约 `#54`、price 约 `$0.136`、market cap 约 `$1.46B`、circulating supply 约 `10.79B PI`、max supply `100B PI`、24h volume 约 `$5-7.5M`、较 2025 ATH 回撤约 `95%` 的 liquidity / utility reality gap。`pnpm sync:research --add` scaffold 已写入，手动修正 `/research` 卡片为 `type: 'L1'`、`initial: 'PI'`、description、`color: '#F4B544'`，新增本地 logo `public/research-logos/pi-network-pi-mobile-mining-kyc-utility-reality-check.svg`；由于一次 logo sync 被中断后暴露 50 个历史卡片 svg 缺失，已批量补齐 monogram fallback，满足“每个调研项目配置对应图像”的目标。验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（188 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 top 1000 research 缺口，本轮完成 `content/blog/2026/research/ondo-finance-ondo-rwa-platform-token-value-capture.mdx`，标题 `Ondo Finance: RWA Distribution Leader and the ONDO Token Value-Capture Gap`。结论是“high-quality RWA watchlist / selective exposure, not high-conviction until token value capture becomes more explicit”，重点把 ONDO token 与已有 USDY 产品研究拆开，分析 Ondo Yield Assets、OUSG、USDY、Ondo Global Markets、Ondo Chain 路线图和 ONDO governance/value-capture gap；纳入 CG 约 `#47`、CMC 约 `#40`、price 约 `$0.37`、market cap 约 `$1.82B`、FDV 约 `$3.73B`、initial supply `10B ONDO`、DefiLlama Ondo Yield Assets 约 `$2.63B` TVL、Ondo Global Markets 约 `$1.04B` TVL、USDY circulating value 约 `$2.14B`、USDY APY 约 `3.55%`、OUSG APY 约 `3.07%`。`pnpm sync:research --add` 已同步 `/research` 卡片并手动修正为 `type: 'RWA'`、description、`color: '#2563EB'`、`initial: 'ONDO'`，本地 logo 为 `public/research-logos/ondo-finance-ondo-rwa-platform-token-value-capture.svg`；验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（187 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 top 1000 research 缺口，本轮完成 `content/blog/2026/research/starknet-strk-zk-rollup-account-abstraction-value-capture.mdx`，标题 `Starknet: STARK-Tech L2, Native Account Abstraction, and the STRK Value-Capture Test`。结论是“selective exposure / high-quality ZK infrastructure watchlist, not high-conviction until app demand, fee capture, staking decentralization, and token unlock absorption improve”，重点分析 Starknet 作为 STARK-based Ethereum L2 的 Cairo / native account abstraction / data availability / STRK fee-governance-staking utility，以及 BTC staking 对 STRK security demand 的潜在改善；纳入 CG 约 `#159`、CMC 约 `#124`、price 约 `$0.034`、market cap 约 `$223M`、FDV 约 `$343M`、circulating supply 约 `6.52B STRK`、total/max `10B STRK`、DefiLlama/CoinGecko TVL 约 `$178-182M`、stablecoins 约 `$173M`、chain fees 约 `$3.3K/24h` 与 `$154K/30d`。`pnpm sync:research --add` 已同步 `/research` 卡片并手动修正为 `type: 'ZK'`、description、`color: '#EC796B'`、`initial: 'STRK'`，本地 logo 为 `public/research-logos/starknet-strk-zk-rollup-account-abstraction-value-capture.png`；验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（186 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 top 1000 research 缺口，本轮完成 `content/blog/2026/research/optimism-op-superchain-platform-economics-buyback-test.mdx`，标题 `Optimism: Superchain Platform Economics and the OP Token Buyback Test`。结论是“selective exposure / high-quality Superchain watchlist, not a high-conviction L2 token yet”，重点分析 Optimism 从 OP Mainnet 转向 OP Stack / Superchain 平台经济、Base / Unichain / Ink / World Chain / Soneium 等链的收入贡献潜力，以及 2026 年将 50% incoming Superchain revenue 用于月度 OP buyback 的价值捕获改进；纳入 CG 约 `#164`、CMC 约 `#127`、market cap 约 `$220M`、circulating supply 约 `2.16B OP`、total/max `4.294B OP`、DefiLlama OP Mainnet 约 `$291M` TVL、`$552M` stablecoins、`$1.26B` bridged TVL、`$9.2M` 24h DEX volume 和约 `$800/day` chain revenue。`pnpm sync:research --add` 已同步 `/research` 卡片并手动修正为 `type: 'L2'`、description、`color: '#FF0420'`、`initial: 'OP'`，本地 logo 为 `public/research-logos/optimism-op-superchain-platform-economics-buyback-test.png`；验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（185 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 top 1000 research 缺口，本轮新增 `content/blog/2026/research/arbitrum-arb-l2-governance-token-value-capture-gap.mdx`，标题 `Arbitrum: Ethereum L2 Scale, Orbit Optionality, and the ARB Value Capture Gap`。结论是“high-quality Ethereum L2 infrastructure watchlist, but ARB is only selective exposure because value capture remains weak”，重点分析 Arbitrum One / Nitro / Orbit chains / Stylus / BoLD / Timeboost 的真实基础设施价值，与 ARB 作为 governance token、非 gas token、弱直接现金流捕获之间的矛盾；纳入 CG 约 `#98`、CMC 约 `#75`、market cap 约 `$540M`、FDV 约 `$849M`、circulating supply `6.36B` / total `10B`、DefiLlama Arbitrum 约 `$1.30B` TVL、`$3.73B` stablecoins、`$14.85B` bridged TVL、`$98M` 24h DEX volume、`$735M` 24h perps volume，以及 Timeboost / Orbit 是否能把链上经济路由回 DAO / ARB 的观察项。`pnpm sync:research --add` 已同步 `/research` 卡片并手动修正为 `type: 'L2'`、description、`color: '#28A0F0'`、`initial: 'ARB'`，本地 logo 为 `public/research-logos/arbitrum-arb-l2-governance-token-value-capture-gap.png`；验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（184 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 top 1000 research 缺口，本轮新增 `content/blog/2026/research/render-network-render-gpu-rendering-ai-compute-depin.mdx`，标题 `Render Network: GPU Rendering Demand, AI Compute Optionality, and the DePIN Burn Test`。结论是“selective exposure / high-quality AI-DePIN watchlist, not a blanket AI compute winner yet”，重点分析 Render 从 OTOY / OctaneRender GPU rendering 工作流扩展到 AI compute / Compute Clients、Solana SPL `RENDER` 与 BME burn-credit-emissions 模型、CMC 约 `#58` / CG 约 `#73` / market cap 约 `$872M` / circulating supply `518.77M`、Render Foundation dashboard 约 `56.38M` frames / `5,600` nodes、RNP-018 Year 2 `5.9M RENDER` emissions，以及核心风险是 paid burn demand 和真实 AI compute 客户是否能超过 emissions / grants / narrative beta。`pnpm sync:research --add` 已同步 `/research` 卡片并手动修正为 `type: 'AI/DePIN'`、description、`color: '#FF3B1F'`、`initial: 'RENDER'`，本地 logo 为 `public/research-logos/render-network-render-gpu-rendering-ai-compute-depin.png`；验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（183 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：按 `research-map-builder` 流程确认 PayPal USD / PYUSD 独立研究已存在并完成当前快照修正：`content/blog/2026/research/paypal-usd-pyusd-payfi-stablecoin.mdx`，标题 `PayPal USD: Regulated PayFi Stablecoin or Distribution-Led Dollar Wrapper`。本次根据 CoinMarketCap / CoinGecko 实时页把排名从 CMC `#29` / CG `#35` 修正为 CMC `#30` / CG `#36`，核心结论保持“high-quality watchlist / selective exposure to the PayFi stablecoin theme”，重点分析 PayPal + Venmo + merchant checkout 分发、Paxos reserve / attestation、Solana / Arbitrum / LayerZero 扩展、4% rewards 的有机需求识别问题，以及 2025 年 Paxos accidental `$300T` mint 暴露的操作控制风险。Research Map 已有 `PayPal USD` 卡片，`type: 'Stablecoin'`，本地 logo 为 `public/research-logos/paypal-usd-pyusd-payfi-stablecoin.png`；验证：frontmatter / slug / logo 检查通过、`pnpm check:research:logos` 通过（182 projects）、`pnpm exec tsc --noEmit` 通过；`pnpm content:check` 仍只因 3 篇 2019 旧文章日期格式失败。
- **2026-06-22**：继续补 top 1000 research 缺口，本轮新增 `content/blog/2026/research/cosmos-hub-atom-interchain-security-value-accrual-gap.mdx`，标题 `Cosmos Hub: Interchain Security, ATOM Value Accrual, and the Sovereign Appchain Paradox`。结论是“selective exposure / high-quality infrastructure watchlist, but not high-conviction until ATOM value capture improves”，重点分析 Cosmos SDK / CometBFT / IBC 的真实基础设施价值与 ATOM value accrual gap、CMC 约 `#56` / `$930M` market cap / 515.16M supply、CG 约 `#71` / 520M tradable ATOM、DefiLlama Cosmos Hub 仅约 `$152K` TVL、`$59/day` chain fees、`$0/day` chain revenue、Map of Zones 117 zones、ICS / AEZ 作为核心 value-capture 路径但尚未形成显著收入。`pnpm sync:research --add` 已同步 `/research` 卡片并手动修正为 `type: 'L1'`、description 与 `initial: 'ATOM'`，本地 logo 为 `public/research-logos/cosmos-hub-atom-interchain-security-value-accrual-gap.png`。
