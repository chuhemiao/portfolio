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

- **2026-09-04**：按用户要求新增 thoughts 文章“代币化股票平台：龙头、盈利与护城河深度对比”，创建 `content/blog/2026/thoughts/tokenized-stock-platform-leaders-profit-moats.mdx`，frontmatter 为 `publishedAt: 2026-09-04`、`category: thoughts`、slug `tokenized-stock-platform-leaders-profit-moats`。正文基于用户提供内容，核心结论为代币化股票赛道名义龙头仍是 Ondo，但份额从 58% 降至约 31%，真实交易和用户触达正在向 xStocks/Kraken 与 bStocks/BNB 系转移；当前没有平台靠代币化股票本身赚到有意义的钱，真正护城河排序是分发大于合规大于资产数量。保留 `share_trend` 与 `tokenized_stock_platforms` chart 占位。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2998 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-04**：按用户要求新增 thoughts 文章“Ethena 进军股票永续基差：是压缩收益空间，还是强化结构位置”，创建 `content/blog/2026/thoughts/ethena-equity-perp-basis-yield-compression-structural-position.mdx`，frontmatter 为 `publishedAt: 2026-09-04`、`category: thoughts`、slug `ethena-equity-perp-basis-yield-compression-structural-position`。正文基于用户提供内容，核心结论为 Ethena 扩张股票永续基差更像“容量续命 + 叙事换挡”，不是收益率升级或基础设施升维；单位收益空间已被压缩，HyENA 关停、USDH 失利和 Hyperliquid USDC 化说明 Ethena 没拿到链上永续货币层/交易层位置，真正强化的是规模化中性套息资产管理人身份。保留 `funding_cmp` 与 `ethena_tvl` chart 占位。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2997 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-01**：按用户要求继续优化并新增 thoughts 文章“边际买家耗尽：从牛熊周期到 NVIDIA 信用利差预警”，创建 `content/blog/2026/thoughts/marginal-buyer-exhaustion-nvidia-credit-spread-framework.mdx`，frontmatter 为 `publishedAt: 2026-09-01`、`category: thoughts`、slug `marginal-buyer-exhaustion-nvidia-credit-spread-framework`。正文基于用户提供内容重组为一篇完整市场框架文章：先把金融资产需求从静态 `Qd = f(P)` 推进到包含预期收益、风险偏好、财富效应、杠杆、资金流和仓位空间的动态函数，再用牛市怀疑阶段、主升浪、边际买家耗尽、熊市去杠杆、边际卖家耗尽解释周期拐点；后半将 NVIDIA 2036 债信用利差从约 +86bp 收窄至约 +55bp 作为案例，结论为边际买家仍强但相对价值变贵，NVIDIA 2036 从“较有吸引力”调整为“Watch / 偏贵”。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2996 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-08-28**：按用户要求新增研究报告“Dolomite ($DOLO) — Research Brief Review & Live Baseline”，创建 `content/blog/2026/research/dolomite-dolo-wlfi-concentration-live-baseline.mdx`，frontmatter 为 `publishedAt: 2026-08-28`、`category: research`、slug `dolomite-dolo-wlfi-concentration-live-baseline`。正文基于用户提供附件，核心结论为 Dolomite 当前便宜的收入倍数更像 WLFI 单一对手方集中与稀释折价，而不是干净错定价；报告强调 Ethereum 占 TVL 约 92.6%、WLFICX + USD1 占 Ethereum net liquidity 约 72.8%、borrows 约 $315.9M、annualized protocol revenue 约 $2.45M、DOLO 约 5.3x MC/revenue，但 DOLO value capture 仍未验证。因本地已有 `Dolomite / DOLO` Research Map 手写卡片，本轮未新增 `src/data/research-projects.ts` 入口，只运行 `pnpm sync:research:registry`，registry 更新为 `2822` projects，并可通过完整 slug 与 `Dolomite DOLO WLFI` 命中。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2995 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-08-27**：按用户要求新增 thoughts 文章“Stripe 这笔100亿美元级别的下注，赌的不是 AI 谁赢，是流量本身”，创建 `content/blog/2026/thoughts/stripe-10b-ai-traffic-payment-infrastructure-bet.mdx`，frontmatter 为 `publishedAt: 2026-08-27`、`category: thoughts`、slug `stripe-10b-ai-traffic-payment-infrastructure-bet`。正文基于用户提供内容，核心结论为 Stripe 的 100 亿美元级赌注不是押 AI 模型层或应用层赢家，而是押支付、分发与结算这条流量管道；文章强调客户收入速度不等于收入质量、上探企业客户可能带来费率稀释、真实护城河在 92% 卡识别数据网络效应、Atlas 分发卡位和 Tempo 结算层卡位，同时将 Tempo 视为用高费率旧现金牛换取低费率新交易池的时间赛跑。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2994 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-25**：按用户要求新增研究文章“ANTH 是货架重启，护城河在 HIP-3 的可替换性，不在私募股权本身。”，创建 `content/blog/2026/research/anth-hip3-relaunch-replaceable-builder-moat.mdx`，frontmatter 为 `publishedAt: 2026-08-25`、`category: research`、slug `anth-hip3-relaunch-replaceable-builder-moat`。正文基于用户提供附件，核心结论为 Entropy 借 HIP-3 重启 Anthropic 永续，证明的是部署者可替换，而不是私募股权本身成为 Hyperliquid 新成交引擎；ANTH 24h 成交与持仓相对 Hyperliquid 全站很小，真正护城河在 HIP-3 的建设者市场、复用 HyperCore 订单簿、质押约束和 TradeXYZ 已跑通的公开股票/股指/商品盘口。保留 `hip3_vs_anth` chart 占位。未新增 `src/data/research-projects.ts` 手写卡片；运行 `pnpm sync:research:registry` 后 registry 为 `2821` projects。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2993 mdx files）、`git diff --check` 通过、registry 可通过 `ANTH HIP-3` 与完整 slug 命中；未提交 commit。
- **2026-08-25**：按用户要求新增深度研究报告“Astera Labs (ALAB) - 增长质量与估值”，创建 `content/blog/2026/research/astera-labs-alab-growth-quality-valuation.mdx`，frontmatter 为 `publishedAt: 2026-08-25`、`category: research`、slug `astera-labs-alab-growth-quality-valuation`。正文基于用户提供附件，核心结论为 Astera Labs 是纳斯达克上市的无晶圆 AI 机柜级连接芯片公司，基本面增长极强，但 `$276` 现价对应约 `40x TTM revenue / 129x TTM GAAP earnings`，客户集中、Scorpio 上量导致毛利率下台阶、应收与库存扩张、Q2 仍为预告数等风险决定它是优质增长而非便宜货；保留 `alab_revenue_q`、`alab_margins_q`、`alab_price_1y` chart 占位。未新增 `src/data/research-projects.ts` Research Map 卡片，因为 ALAB 是美股而非 crypto token；运行 `pnpm sync:research:registry` 后 registry 为 `2820` projects。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2992 mdx files）、`git diff --check` 通过、registry 可通过 `ALAB` 与完整 slug 命中；未提交 commit。
- **2026-08-25**：按用户要求发布新的 thoughts 文章“Self-Harness：当智能体开始修改自己的操作系统”，创建 `content/blog/2026/thoughts/self-harness-agent-operating-system.mdx`，frontmatter 为 `publishedAt: 2026-08-25`、`category: thoughts`、slug `self-harness-agent-operating-system`。正文基于用户提供内容，清理开头 HTML 实体并保留核心论述：agent 表现由模型与 harness 共同决定；Self-Harness 将 Weakness Mining、Harness Proposal、Proposal Validation 变成目标模型内部的可审计自我改进循环；Terminal-Bench-2.0 held-out 提升说明修改更像机制泛化而非死记硬背，但仍受封闭基准、验证器质量和高风险验收门不足等边界限制。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2991 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-21**：按用户要求添加最新研究“Aligned（$ALIGN）- 技术、代币与投资价值深度研究”，创建 `content/blog/2026/research/aligned-align-zk-proof-verification-infrastructure-token-value-capture-risk.mdx`，frontmatter 为 `publishedAt: 2026-08-21`、`category: research`、slug `aligned-align-zk-proof-verification-infrastructure-token-value-capture-risk`。正文基于用户提供附件，核心结论为 Aligned 将昂贵、碎片化的 ZK proof verification 做成共享基础设施，试图成为 Ethereum / EigenLayer 上的证明验证层；项目逻辑强于当前代币逻辑，投资判断聚焦真实证明需求、EigenLayer AVS 安全假设、`$ALIGN` token value capture、低流通高波动与 2027 年 8 月前后的大额 cliff 解锁压力。同步在 `src/data/research-projects.ts` 新增 Research Map 索引 `Aligned / ALIGN`，类型 `ZK`，不新增 logoUrl，沿用现有 fallback logo 行为；运行 `pnpm sync:research:registry` 后 registry 为 `2819` projects。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2990 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、registry 查重可命中 Aligned；未提交 commit。
- **2026-08-21**：按用户要求新增最新 thoughts 文章“美国 SEC「加密资产条例」深度报告 — 规则拆解与市场定价”，创建 `content/blog/2026/thoughts/sec-regulation-crypto-assets-market-pricing.mdx`，frontmatter 为 `publishedAt: 2026-08-21`、`category: thoughts`、slug `sec-regulation-crypto-assets-market-pricing`。正文基于用户提供附件，保留 SEC 于 2026-08-18 提出 `Regulation Crypto Assets`、`$5M / 4 年` 初创豁免、`$20M` 与 `$75M / 12 个月` 两档融资豁免、“毕业”安全港、代币化股权仍不适用、BTC/XRP/ETF/爆仓市场定价、`sec_perf`、`etf_flow` chart 占位与 `sec_basket` tokentable 占位等内容。核心结论为这是一条针对网络代币发行经济学的中期结构性变量，但仍是提案而非落地规则，不能等同于代币化股权开闸。本轮未调用 Surf skill/API；曾做一次网页轻核验搜索但未采用额外来源改写正文；验证：`pnpm content:check` 通过（scanned 2989 mdx files）、`git diff --check` 通过；未提交 commit。
