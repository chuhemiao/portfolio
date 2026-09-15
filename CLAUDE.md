# CLAUDE.md — kkdemian portfolio

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
  pnpm dev          # 启动开发服务器（predev 自动跑 content:prepare）
  pnpm content:build # 增量编译 content/ → .generated/（hash 缓存）
  pnpm assets:build  # 由 .generated/blog-index.json 生成 RSS/sitemap/llms 等
  pnpm content:prepare # content:build + assets:build，prebuild/predev 调用
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
- **当前 Research 进度（2026-07-07）**：registry `2811` projects；candidate total `3815`，pending new candidates `381`；depth upgrade queue `0`；本轮最新 1000 篇 depth audit 全部 full-depth pass。
- **当前 Skill / 工作流**：当前安装目录未发现旧 `research-map-builder` skill；本仓库以 `src/data/skill.md` 作为 repo-local Research Map workflow reference，核心原则是 Surf-first、先本地查重、再写 MDX、再同步 `/research` 与 registry。批量 CMC/CGO 新增使用 `scripts/generate-cmc-cgo-research-batch.mjs`，Surf 子命令已加 timeout 防止长时间挂起，并已补 registry 二次过滤、非拉丁 slug fallback、CoinGecko API 兜底开关、DefiLlama fallback seeding、Surf credit-error 短路、`sync:research --skip-logos` 与大型 `/research` typed array 同步兼容。
- **快捷内容脚本**：`pnpm quick:add -- "内容描述" --category research` 默认 dry-run；加 `--write` 才创建 MDX。

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
- **Crypto 数据源**：涉及 watch、oscillator、market、listing、price、wallet、DeFi、on-chain、research 数据刷新时，优先直接使用 Surf skill/API，文档为 `https://agents.asksurf.ai/docs`；先按 Surf skill 查询 `surf list-operations` 与具体命令 `--help`；仅在 Surf 无数据、报错或用户指定其他来源时再使用 CoinGecko、CMC、交易所 API 或普通网页搜索。

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

- **2026-09-14**：重构内容构建管线，把 `O(N²)` 的 per-page MDX 全量扫描改成一次性增量编译。新增 `scripts/build-content.mjs` + `scripts/lib/content/`（discovery / markdown / indexes / 有界 worker pool），产物写入 gitignore 的 `.generated/`：`blog-index.json`、`category-index.json`、`topic-index.json`、`relations.json`、`cache-manifest.json` 和每篇一份 `posts/<sha256(slug)>.html|.json`。`src/data/blog.ts` 不再读 MDX、不再引入 shiki/unified，只读索引与 artifact；related posts / related topics / topic 列表全部预计算。`generate-static-assets.mjs` 改为消费 blog-index，并把 sitemap 拆成 `/sitemap.xml` 索引 + `/sitemaps/*.xml` 分片（每片 5000 URL）。GitHub Actions 用 `actions/cache` 持久化 `.generated`（key 含 commit sha，restore-keys 回退到上一次），并新增分阶段计时。实测（本机 18 核）：改造前 `pnpm build` 198s；改造后 cold 47.3s、warm 31.4s、改一篇文章 32.5s，内容编译从 3002 篇全量 15.6s 降到命中缓存 0.36s / 改一篇 0.5s。3025 个页面中 3013 个渲染文档与改造前逐字节一致；差异只有 10 个 topic 页（列表改为确定性 newest-first）与 fear/watch（构建时间戳）。顺带修复中文 slug 在静态导出时因 params 被 percent-encode 而 404 的历史问题。

- **2026-09-07**：Portfolio 部署架构从 Vercel 迁移到 Cloudflare：Next.js 启用 `output: 'export'`，生产输出为 `out/`；删除 Next API/metadata route handlers 与动态 OG route；`scripts/generate-static-assets.mjs` 在 `predev/prebuild` 生成 RSS、llms、sitemap、robots、manifest、OG SVG 和 Cloudflare `_headers`；新增 Cloudflare Worker `workers/api/src/index.ts` 承接 `/api/subscribe`、`/api/btc-score`、`/api/fear-data`、`/api/watch-data`，并用 Worker Cache API + Cron 刷新动态数据；新增 `.github/workflows/deploy-cloudflare.yml`，main push 后 install/lint/typecheck/build/deploy Worker/deploy Pages。验证：`pnpm typecheck`、`pnpm lint`、`pnpm build`、Worker dry-run、源码动态/Vercel 关键词扫描与 `git diff --check` 均通过；未提交 commit。
- **2026-07-07**：修复 3 篇 2019 旧文 `publishedAt` 格式，并继续新增 CMC/CGO-oriented full-depth Research 至目标 `1000` 篇。Surf-first 探测显示 `PAID_BALANCE_ZERO`，CoinGecko markets/list 返回 `429 Too Many Requests`，因此用 DefiLlama protocol list fallback 扩容候选池并分 5 批 `200*5` 生成/同步；最终 registry `2811`、candidate total `3815`、pending new candidates `381`、upgrade queue `0`；最近 1000 篇 depth audit `1000/1000 full-depth pass`。同步增强：CoinGecko list / DefiLlama seeding、候选噪声过滤、同族去重、Surf credit-error 短路、`sync-research --skip-logos`，并修正 OSL logo 引用。残余风险：1000 篇 live enrichment 均受 Surf 余额和 CG 429 影响，后续应批量补 live market / primary sources。
- **2026-07-07**：继续新增 CMC/CGO-oriented full-depth Research 至目标 800 篇。使用 Surf `market-ranking` 扩容候选池，分四轮生成并同步：`200 + 198 + 200 + 202`，最终 registry `1811`、candidate total `2215`、pending new candidates `355`、upgrade queue `0`；最近 800 篇 depth audit `800/800 full-depth pass`。同步修复批量和同步脚本：安全字符串转义、超大 `PROJECTS` typed assertion、非拉丁 slug fallback、registry/short-name 去重、CoinGecko API fallback 开关。残余风险：batch3/4 共 `402` 篇生成时 Surf 返回 `PAID_BALANCE_ZERO`，CoinGecko API fallback 返回 `429 Too Many Requests`，后续应批量刷新 live market / primary sources。
- **2026-07-06**：继续新增 CMC/CGO-oriented full-depth Research 至目标 500 篇。使用 Surf `market-ranking` 扩容候选池，分三批生成并同步：`200 + 200 + 1 + 99`，最终 registry `1011`、candidate total `1215`、pending new candidates `341`、upgrade queue `0`；最近 500 篇 depth audit `500/500 full-depth pass`。同步修复批量脚本：`seed-research-candidates` 增加 Surf retry/backoff，`generate-cmc-cgo-research-batch` 增加 Surf 子命令 `45s` timeout。残余风险：333 篇存在至少一个 Surf enrichment 缺口，主要为 long-tail/RWA/meme/Surf-only 项目的 project-detail 或 DeFi metrics。
- **2026-07-06**：继续新增 CMC/CGO-oriented full-depth Research 100 篇，并接入 `/research`、registry 与本地 logo；扩展 `scripts/generate-cmc-cgo-research-batch.mjs`，支持 `--from-pending`、`--target-count`、`--list-only` 和 registry 二次去重。当前 `pnpm status:research:run`：registry `511`、candidate total `357`、pending new candidates `59`、upgrade queue `0`；新增 100 篇均 full-depth pass。
- **2026-07-06**：继续新增 CMC/CGO-oriented full-depth Research 30 篇，并接入 `/research`、registry 与本地 logo；新增 `scripts/generate-cmc-cgo-research-batch.mjs`，支持 Surf-first refresh、display override、`--overwrite`。新增 30 篇均未进入 depth needs-upgrade。
- **2026-07-06**：同步最新进度、当前 skill/workflow 与快捷添加内容脚本。新增 `scripts/quick-add-content.mjs` 与 `pnpm quick:add`，默认 dry-run、显式 `--write` 才写入 MDX；更新 `src/data/skill.md` 为 repo-local Portfolio Research Map workflow reference。当前安装目录未发现旧 `research-map-builder` skill。
- **2026-03-31**：实现 `/thoughts` 页面 + Telegram 自动同步功能。使用 GitHub Actions 每天同步频道 @kkdemian2050 的消息到 `content/thoughts.json`，前端展示为 Twitter/X 风格时间线。Bot: fulipy_bot。
