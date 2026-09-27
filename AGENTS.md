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
- **当前 Skill / 工作流**：当前安装目录未发现旧 `research-map-builder` skill；本仓库以 `src/data/skill.md` 作为 repo-local Research Map workflow reference，核心原则是先本地查重、再写 MDX、再同步 `/research` 与 registry。默认不再调用 Surf skill/API；批量 CMC/CGO 新增可继续使用 `scripts/generate-cmc-cgo-research-batch.mjs` 的本地与其他数据源兜底能力，必要时按用户指定来源补充数据。
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
- **Crypto 数据源**：默认不调用 Surf skill/API（用户已无免费 API 额度与速度）。优先使用用户提供材料和仓库本地数据；确需刷新外部数据时，根据任务选择 CoinGecko、CMC、交易所 API、DefiLlama、官方文档或网页搜索。只有用户明确要求时才调用 Surf。

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

- **2026-09-27**：按用户要求将“Sui DEX 与 Perp DEX：生态项目研究报告”新增为中英文两篇 research，创建 `content/blog/2026/research/sui-dex-perp-dex-ecosystem-project-research.mdx` 与 `content/blog/2026/research/sui-dex-perp-dex-ecosystem-project-research-en.mdx`，完整保留现货 DEX、Perp DEX、代币、机会窗口、风险与结论结构。同时完成博客双语模式：内容编译器支持 `language` / `translationSlug` 并自动配对 `slug` 与 `slug-en`，文章页新增中英文切换、`hreflang` 与 `inLanguage`，列表页新增可分享的语言筛选；近约 3 个月的 50 篇中文文档已能自动识别为中文，现有 4 组双语文章与新增 Sui 报告均可自动切换，余下 46 篇中文文档可按需逐步添加 `-en.mdx` 英文版。Research Map 同步逻辑会跳过英文译文重复索引，registry 更新为 `2827` projects。未调用 Surf 或额外联网查询。验证：`pnpm content:check`、`pnpm typecheck`、`pnpm lint`（0 error，29 个历史 warning）、`pnpm build`（3038 个静态页面）与 `git diff --check` 均通过；未提交 commit。
- **2026-09-27**：按用户要求将“主流公链上的新 DEX / Perp DEX：长期选链研究”分别新增为 research 完整报告与 thoughts 产品决策版，创建 `content/blog/2026/research/mainstream-chain-dex-perp-dex-long-term-chain-selection-research.mdx` 和 `content/blog/2026/thoughts/dex-perp-dex-chain-selection-distribution-before-performance.mdx`，发布日期均为 `2026-09-27`。研究版完整保留 Solana、Ethereum、BSC、Base、Arbitrum、Avalanche、Monad、Sui、Aptos 与 Hyperliquid 的链级数据、产品评级、三套落地架构、Go / No-Go 门槛和数据质量限制；思考版提炼为“先选分发，再选性能”，聚焦 Solana 高频与新资产、Base EVM / USDC 产品创新、Hyperliquid HIP-3 垂直市场三条路径。未调用 Surf 或额外联网查询，Monad 用户数据改为明确标注“用户提供的链级数据快照”。`pnpm sync:research:registry` 已将 registry 更新为 `2826` projects；`pnpm sync:research --add` 因仓库现有 `research-client.tsx` 插入点不存在而退出，未产生额外脚手架文件。验证：`pnpm content:check` 通过（scanned 3012 mdx files）、`pnpm check:research:logos` 通过、`git diff --check` 通过；未提交 commit。
- **2026-09-25**：按用户要求将“过去 24 小时加密市场：宏观、链上与微观结构监测”新增为中英文两篇 thoughts，创建 `content/blog/2026/thoughts/crypto-market-past-24-hours-macro-onchain-microstructure-monitor.mdx` 与 `content/blog/2026/thoughts/crypto-market-past-24-hours-macro-onchain-microstructure-monitor-en.mdx`，发布日期均为 `2026-09-25`。两版完整保留宏观流动性、交易所净流量、稳定币与跨链流动、Gas 与活跃地址、永续和期权、ETF、CEX 深度、TVL 事件及自校验章节；核心判断为短线结构温和偏多且更像现货驱动，但 10 年期收益率与 DXY 走强，宏观确认不足。英文版与中文版 17 个章节一一对应，并保留链上数据 1-3 日滞后、供应商数据冲突、HLL 约 2% 误差以及不支持因果推断等限制。使用 `tech-doc-style-chinese` skill 整理中文版；未调用 Surf 或额外联网查询。验证：`pnpm content:check` 通过（scanned 3010 mdx files）、`git diff --check` 通过、双语章节结构核对一致、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-25**：按用户要求将“全球 Web3 与 Crypto 机构研究：2026 年 9 月更新”新增为中英文两篇 thoughts，创建 `content/blog/2026/thoughts/global-web3-crypto-institutional-research-september-2026-update.mdx` 与 `content/blog/2026/thoughts/global-web3-crypto-institutional-research-september-2026-update-en.mdx`，发布日期均为 `2026-09-25`。两版完整保留市场周期、资本与机构动态、赛道评分、错配、90 天观察变量和角色建议，英文版与中文版章节和数据一一对应；核心判断为市场已进入 ETF 驱动的早期风险偏好回升，但稳定币供应仅增长 1.1%，预测市场估值跑在使用量前面，隐私与后量子进入共识。使用 `tech-doc-style-chinese` skill 整理中文版；未调用 Surf 或额外联网查询；保留 Galaxy Q2 VC 数字属于未独立核实的二手来源、Aethir 数据为公司自报等限制。验证：`pnpm content:check` 通过（scanned 3008 mdx files）、`git diff --check` 通过、两版章节结构核对一致、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-23**：按用户要求新增并完善 thoughts 教程“年付约 7 美元，获得一个美国手机号：Saily eSIM 开通教程”，文件为 `content/blog/2026/thoughts/saily-esim-us-phone-number-annual-7-dollar-guide.mdx`，frontmatter 为 `publishedAt: 2026-09-23`、`category: thoughts`、slug `saily-esim-us-phone-number-annual-7-dollar-guide`。正文保留推荐码 `demian9475`、推荐链接、约 6.99 美元年付活动、KYC 与安装步骤，并明确区分电话号码、数据、SMS 和 Voice 权益；补充 iPhone 多线路限制、`No Number` 判断方式，以及银行、交易所和高等级 OTP 不保证支持的风险提示。随后新增三张实测截图：`public/article/saily-global-data-plans.jpg`、`public/article/saily-telegram-verification.png`、`public/article/saily-active-number-home.png`，分别展示全球流量套餐、Telegram 验证短信和号码激活后的 Saily 首页；Telegram 图注明一次性验证码安全提示。使用 `tech-doc-style-chinese` skill 统一教程结构与图注；未调用 Surf 或额外联网查询。验证：`pnpm content:check` 通过（scanned 3006 mdx files）、`git diff --check` 通过，图片路径与文件非空检查通过；未提交 commit。
- **2026-09-19**：按用户要求新增 thoughts 文章“Polymarket 中期选举信息流：能否进入机构工作流”，创建 `content/blog/2026/thoughts/polymarket-midterm-election-information-flow-institutional-workflow.mdx`，frontmatter 为 `publishedAt: 2026-09-19`、`category: thoughts`、slug `polymarket-midterm-election-information-flow-institutional-workflow`。正文基于用户提供内容，核心结论为 Polymarket 已通过 ICE 打开机构数据分发入口，但中期选举盘口低周转、成交高度集中且报价存在内部偏差，更适合作为情绪和资金定位信号，而非校准后的机构级概率；文章补充机构级数据质量层，要求同时暴露价差、深度、冲击成本、成交集中度、跨平台偏差与结算规则。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 3005 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-19**：按用户要求新增并继续完善 thoughts 文章“Hyperliquid 借贷与 Circle：流动性护城河还是场景依赖”，文件为 `content/blog/2026/thoughts/hyperliquid-lending-circle-liquidity-moat-scenario-dependence.mdx`，frontmatter 为 `publishedAt: 2026-09-19`、`category: thoughts`、slug `hyperliquid-lending-circle-liquidity-moat-scenario-dependence`。补充 dYdX、Jupiter Perps、Drift、GMX 与中心化永续交易所的横向比较，将结论扩展为：Hyperliquid 强化了 USDC 的局部流动性优势，但 USDC 在全行业仍是“强势但碎片化”，真正护城河取决于它能否成为跨平台复用的现金、保证金与借贷资产。用户同时明确今后默认不再调用 Surf skill/API，已更新当前工作流与 Crypto 数据源偏好；验证：`pnpm content:check` 通过（scanned 3004 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-09-19**：按用户要求新增 thoughts 文章“Circle / Arc：USDC 能否形成长期结算护城河”，创建 `content/blog/2026/thoughts/circle-arc-usdc-long-term-settlement-moat.mdx`，frontmatter 为 `publishedAt: 2026-09-19`、`category: thoughts`、slug `circle-arc-usdc-long-term-settlement-moat`。正文基于用户提供附件，核心结论为 Arc 可以强化 USDC 的网络型结算护城河，但 Arc 本身不是护城河；真正壁垒来自合规信任、跨链流动性、机构分发和支付网络的共同绑定，后续应重点观察 Arc 机构结算量、USDC 非交易用途、Circle 服务收入占比和机构留存。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 3003 mdx files）、`git diff --check` 通过、敏感凭据关键词扫描无命中；未提交 commit。
- **2026-09-09**：排查 Cloudflare Pages 部署失败日志。结论：失败不是本地代码 build 问题，而是 Cloudflare 项目仍在构建 `origin/main` 的迁移前版本，并且 Pages 项目配置里存在错误的 deploy command `npx wrangler deploy`，触发 Wrangler 自动按 Next.js/OpenNext Worker 模式迁移和部署，最终报错 `Service binding 'WORKER_SELF_REFERENCE' references Worker 'porfolio' which was not found`。本地当前 `main` 已包含 Cloudflare 静态导出迁移并通过 `pnpm build`，输出路由只剩 `○`/`●` 静态/SSG，生成 `3026` 个页面；但本地 git 状态为 `main...origin/main [ahead 3, behind 1]`，需先合并/变基远端最新 Telegram 同步提交，再 push 迁移提交到 GitHub。Cloudflare Pages 正确配置应为 build command `pnpm build`、output directory `out`、deploy command 留空；如果采用仓库内 GitHub Actions 部署，则应关闭/停用 Cloudflare Pages 的 Git 自动构建，避免双重部署。
- **2026-09-07**：按用户要求将 Portfolio 从 Vercel 架构迁移到 Cloudflare 架构：`next.config.mjs` 启用 `output: 'export'` 并关闭 Next Image 优化以支持静态导出；删除 Next API/metadata route handlers（`/api/subscribe`、`/api/btc-score`、`/og`、`/rss.xml`、`/llms.txt`、`robots`、`sitemap`、manifest），改由 `scripts/generate-static-assets.mjs` 在 `predev/prebuild` 生成 `rss.xml`、`llms.txt`、`sitemap.xml`、`robots.txt`、`manifest.webmanifest`、`og.svg` 和 `_headers`；新增 Cloudflare Worker `workers/api/src/index.ts` 与 `workers/api/wrangler.toml`，承接 `POST /api/subscribe`、`GET /api/btc-score`、`GET /api/fear-data`、`GET /api/watch-data`，并通过 Worker Cache API + Cron 每 30 分钟刷新动态数据；`fear/watch/oscillator` 前端继续调用相同 `/api/*` 路径但由 Worker 响应；新增 `.github/workflows/deploy-cloudflare.yml`，main push 后执行 install/lint/typecheck/build/Worker deploy/Pages deploy；README、CLAUDE 与旧 thoughts 集成文档更新为 Cloudflare Pages/Workers/CDN + GitHub Actions。验证：`pnpm typecheck` 通过；`pnpm lint` 通过（30 个历史 warning，0 error）；`pnpm build` 通过并生成 `out/`，3026 个页面全静态/SSG；`pnpm exec wrangler deploy --config workers/api/wrangler.toml --dry-run --outdir /tmp/portfolio-worker-dry-run` 通过；源码扫描无 Next API route、`next/og`、`ImageResponse`、`force-dynamic`、`revalidate`、`@vercel`、`vercel.json`、Vercel Analytics/Speed Insights 残留；`git diff --check` 通过；未提交 commit。
