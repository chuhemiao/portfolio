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
**部署**：Cloudflare Pages、Cloudflare Workers、Cloudflare CDN、GitHub Actions
**工具**：pnpm、Figma、Notion

---

## 当前项目

### 1. Portfolio（本项目）

- **Repo**：chuhemiao/portfolio
- **Stack**：Next.js 16 + TypeScript + Tailwind + MDX
- **部署**：GitHub Actions → Cloudflare Pages / Workers → kkdemian.com
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
  pnpm typecheck     # TypeScript 检查
  pnpm worker:dev    # 本地运行 Cloudflare Worker API
  pnpm preview       # 本地预览 Cloudflare Pages out/
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

- **2026-09-09**：排查 Cloudflare Pages 部署失败日志。结论：失败不是本地代码 build 问题，而是 Cloudflare 项目仍在构建 `origin/main` 的迁移前版本，并且 Pages 项目配置里存在错误的 deploy command `npx wrangler deploy`，触发 Wrangler 自动按 Next.js/OpenNext Worker 模式迁移和部署，最终报错 `Service binding 'WORKER_SELF_REFERENCE' references Worker 'porfolio' which was not found`。本地当前 `main` 已包含 Cloudflare 静态导出迁移并通过 `pnpm build`，输出路由只剩 `○`/`●` 静态/SSG，生成 `3026` 个页面；但本地 git 状态为 `main...origin/main [ahead 3, behind 1]`，需先合并/变基远端最新 Telegram 同步提交，再 push 迁移提交到 GitHub。Cloudflare Pages 正确配置应为 build command `pnpm build`、output directory `out`、deploy command 留空；如果采用仓库内 GitHub Actions 部署，则应关闭/停用 Cloudflare Pages 的 Git 自动构建，避免双重部署。
- **2026-09-07**：按用户要求将 Portfolio 从 Vercel 架构迁移到 Cloudflare 架构：`next.config.mjs` 启用 `output: 'export'` 并关闭 Next Image 优化以支持静态导出；删除 Next API/metadata route handlers（`/api/subscribe`、`/api/btc-score`、`/og`、`/rss.xml`、`/llms.txt`、`robots`、`sitemap`、manifest），改由 `scripts/generate-static-assets.mjs` 在 `predev/prebuild` 生成 `rss.xml`、`llms.txt`、`sitemap.xml`、`robots.txt`、`manifest.webmanifest`、`og.svg` 和 `_headers`；新增 Cloudflare Worker `workers/api/src/index.ts` 与 `workers/api/wrangler.toml`，承接 `POST /api/subscribe`、`GET /api/btc-score`、`GET /api/fear-data`、`GET /api/watch-data`，并通过 Worker Cache API + Cron 每 30 分钟刷新动态数据；`fear/watch/oscillator` 前端继续调用相同 `/api/*` 路径但由 Worker 响应；新增 `.github/workflows/deploy-cloudflare.yml`，main push 后执行 install/lint/typecheck/build/Worker deploy/Pages deploy；README、CLAUDE 与旧 thoughts 集成文档更新为 Cloudflare Pages/Workers/CDN + GitHub Actions。验证：`pnpm typecheck` 通过；`pnpm lint` 通过（30 个历史 warning，0 error）；`pnpm build` 通过并生成 `out/`，3026 个页面全静态/SSG；`pnpm exec wrangler deploy --config workers/api/wrangler.toml --dry-run --outdir /tmp/portfolio-worker-dry-run` 通过；源码扫描无 Next API route、`next/og`、`ImageResponse`、`force-dynamic`、`revalidate`、`@vercel`、`vercel.json`、Vercel Analytics/Speed Insights 残留；`git diff --check` 通过；未提交 commit。
- **2026-09-05**：按用户要求新增 research 报告“pons.family Launchpad：机制拆解、单位经济与 $PONS 估值”，创建 `content/blog/2026/research/pons-family-launchpad-mechanism-unit-economics-pons-valuation.mdx`，frontmatter 为 `publishedAt: 2026-09-05`、`category: research`、slug `pons-family-launchpad-mechanism-unit-economics-pons-valuation`。正文基于用户提供附件，核心结论为 pons 已是全球手续费规模第一的代币发行平台，但协议收入留存率仅约 20.4%、收入质量明显弱于 pump.fun；$PONS 的价格主要由 80% 协议收入回购销毁形成的反身性驱动，而不是可持续现金流折现，适合作为 Robinhood Chain 注意力周期的高 Beta 交易工具而非配置型现金流资产。保留 `pons_fees_rev`、`pons_kline` 与 `rh_fees` chart 占位。本轮未调用 Surf skill/API，也未额外联网查询；运行 `pnpm sync:research:registry` 后 registry 为 `2825` projects，并可通过完整 slug 命中；验证：`pnpm content:check` 通过（scanned 3002 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-05**：按用户要求新增 research 报告“Flap（flap.sh）：BNB Chain 可编程发射台深度研究”，创建 `content/blog/2026/research/flap-bnb-chain-programmable-launchpad-research.mdx`，frontmatter 为 `publishedAt: 2026-09-05`、`category: research`、slug `flap-bnb-chain-programmable-launchpad-research`。正文基于用户提供附件，核心结论为 Flap 是 BNB Chain 上最赚钱的代币发射台之一，也是“代币税 + 代币化美股”叙事的大规模实验；但增长高度依赖 bStocks 热潮和 BNB Chain 官方奖池活动，9 月费用暴涨部分来自统计口径扩容，真实协议日收入仍在 $30-47 万区间，且 Flap 无平台币承接现金流。保留 `flap_monthly`、`flap_fee_split` 与 `launchpad_fees` chart 占位。因 Flap 无平台币，本轮未新增 `src/data/research-projects.ts` 手写卡片；运行 `pnpm sync:research:registry` 后 registry 为 `2824` projects，并可通过完整 slug 命中；验证：`pnpm content:check` 通过（scanned 3001 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-05**：按用户要求新增 research 报告“Arcus: Reviewing the Research Brief Against Live Data”，创建 `content/blog/2026/research/arcus-research-brief-live-data-watchlist.mdx`，frontmatter 为 `publishedAt: 2026-09-05`、`category: research`、slug `arcus-research-brief-live-data-watchlist`。正文基于用户提供附件，核心结论为 Arcus 是 Robinhood Chain 上已 live 的 dYdX-team perps + tokenized-stock venue，TVL、30d spot volume、30d revenue 等基线数据仍成立，但 Lighter 在同链 30d perp volume、TVL 与增长上明显领先，Robinhood 分发是 shared channel 而非 exclusive moat；Arcus 应归类为 WATCHLIST 而非 high-conviction infrastructure。保留 `arcus_tvl` 与 `perp_vol_30d` chart 占位。因 Arcus token 未上线且无可投资 token，本轮未新增 `src/data/research-projects.ts` 手写卡片；运行 `pnpm sync:research:registry` 后 registry 为 `2823` projects，并可通过完整 slug 命中；验证：`pnpm content:check` 通过（scanned 3000 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-05**：按用户要求新增 thoughts 文章“六协议 Revenue Engine 拆解：钱从谁口袋出，最后流进谁账户”，创建 `content/blog/2026/thoughts/six-protocol-revenue-engine-money-flow.mdx`，frontmatter 为 `publishedAt: 2026-09-05`、`category: thoughts`、slug `six-protocol-revenue-engine-money-flow`。正文基于用户提供附件，核心结论为 Pons/up/Fables/Arcus、Lighter 与 Morpho 代表三种不同赚钱哲学：Robinhood Chain 原生费用机器、专业账户收费漏斗、以及主动零抽成换规模的基础设施；当前真正把钱装进协议口袋的是 Lighter 和 Arcus，Pons 用残值烧代币，up 把收入给 veUP 投票者，Fables/Morpho 暂不收协议费。保留 `rev_engine_30d` 与 `take_rate` chart 占位。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2999 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-04**：按用户要求新增 thoughts 文章“代币化股票平台：龙头、盈利与护城河深度对比”，创建 `content/blog/2026/thoughts/tokenized-stock-platform-leaders-profit-moats.mdx`，frontmatter 为 `publishedAt: 2026-09-04`、`category: thoughts`、slug `tokenized-stock-platform-leaders-profit-moats`。正文基于用户提供内容，核心结论为代币化股票赛道名义龙头仍是 Ondo，但份额从 58% 降至约 31%，真实交易和用户触达正在向 xStocks/Kraken 与 bStocks/BNB 系转移；当前没有平台靠代币化股票本身赚到有意义的钱，真正护城河排序是分发大于合规大于资产数量。保留 `share_trend` 与 `tokenized_stock_platforms` chart 占位。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2998 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-04**：按用户要求新增 thoughts 文章“Ethena 进军股票永续基差：是压缩收益空间，还是强化结构位置”，创建 `content/blog/2026/thoughts/ethena-equity-perp-basis-yield-compression-structural-position.mdx`，frontmatter 为 `publishedAt: 2026-09-04`、`category: thoughts`、slug `ethena-equity-perp-basis-yield-compression-structural-position`。正文基于用户提供内容，核心结论为 Ethena 扩张股票永续基差更像“容量续命 + 叙事换挡”，不是收益率升级或基础设施升维；单位收益空间已被压缩，HyENA 关停、USDH 失利和 Hyperliquid USDC 化说明 Ethena 没拿到链上永续货币层/交易层位置，真正强化的是规模化中性套息资产管理人身份。保留 `funding_cmp` 与 `ethena_tvl` chart 占位。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2997 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-01**：按用户要求继续优化并新增 thoughts 文章“边际买家耗尽：从牛熊周期到 NVIDIA 信用利差预警”，创建 `content/blog/2026/thoughts/marginal-buyer-exhaustion-nvidia-credit-spread-framework.mdx`，frontmatter 为 `publishedAt: 2026-09-01`、`category: thoughts`、slug `marginal-buyer-exhaustion-nvidia-credit-spread-framework`。正文基于用户提供内容重组为一篇完整市场框架文章：先把金融资产需求从静态 `Qd = f(P)` 推进到包含预期收益、风险偏好、财富效应、杠杆、资金流和仓位空间的动态函数，再用牛市怀疑阶段、主升浪、边际买家耗尽、熊市去杠杆、边际卖家耗尽解释周期拐点；后半将 NVIDIA 2036 债信用利差从约 +86bp 收窄至约 +55bp 作为案例，结论为边际买家仍强但相对价值变贵，NVIDIA 2036 从“较有吸引力”调整为“Watch / 偏贵”。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2996 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-08-28**：按用户要求新增研究报告“Dolomite ($DOLO) — Research Brief Review & Live Baseline”，创建 `content/blog/2026/research/dolomite-dolo-wlfi-concentration-live-baseline.mdx`，frontmatter 为 `publishedAt: 2026-08-28`、`category: research`、slug `dolomite-dolo-wlfi-concentration-live-baseline`。正文基于用户提供附件，核心结论为 Dolomite 当前便宜的收入倍数更像 WLFI 单一对手方集中与稀释折价，而不是干净错定价；报告强调 Ethereum 占 TVL 约 92.6%、WLFICX + USD1 占 Ethereum net liquidity 约 72.8%、borrows 约 $315.9M、annualized protocol revenue 约 $2.45M、DOLO 约 5.3x MC/revenue，但 DOLO value capture 仍未验证。因本地已有 `Dolomite / DOLO` Research Map 手写卡片，本轮未新增 `src/data/research-projects.ts` 入口，只运行 `pnpm sync:research:registry`，registry 更新为 `2822` projects，并可通过完整 slug 与 `Dolomite DOLO WLFI` 命中。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2995 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
