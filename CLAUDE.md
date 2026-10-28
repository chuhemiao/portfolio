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
  pnpm start         # 本地预览 out/ 静态产物
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

- **2026-10-28**：新增两篇 AI Agent 安全方向的研究，各三语共 6 个 MDX（`llm-not-final-risk-gate-trading-agents`、`crypto-agent-bench-financial-agent-safety-benchmark`），自动归入 `ai-crypto`（后者另入 `cex`）。**约定确认**：三语文件名是 zh-CN 用裸 slug、en/ja 加后缀，三份共享 `translationKey`/`sourceSlug`；`translationSourceHash` 可选，不写就不会触发 stale 校验。**踩到的坑**：markdown 管线只有 remark-gfm + rehype-pretty-code，**没有 remark-math/katex**，原稿的 `\[ ... \]` 会原样渲染成乱码，已全部改成 ```text 代码块（等宽呈现，反而更贴合站点风格）。topic 归类只匹配 title + summary + category 三个字段（`buildTopicIndex` 的 `matchText`），正文关键词不参与。**顺带修掉 3 个从改版起就失效的回归测试断言**：`overflow-x-auto` 早已从文章组件搬进 `globals.css` 的 `.article-prose pre/table`（断言改为直接检查该 CSS 规则）；oscillator 的「每周更新」文案已改成「显式快照刷新」，测试名和断言一并更正；`doesNotMatch /top 300/i` 过宽 —— `top 300` 合法地出现在 dual-ranked 的 FAQ 里，改为只检查 breadth 那句文案。现在 27/27 通过。**未做**：未核实两篇原稿引用的 arXiv 条目（多条标注 2026 年，无法确认存在），引用按原样保留。同日另加一篇 thoughts 三语文 `when-ai-makes-execution-cheap-what-people-matter`（AI 让执行变廉价后，创造力/独立思考/自我驱动/责任心的重新排序）。**另一个 topic 归类的坑**：`matchKeywords` 用的是子串匹配，`ai-crypto` 的关键词里有 `'ai'`，所以任何标题含 "AI" 的文章都会被吸进这个主题，哪怕和 crypto 完全无关 —— 这篇就是如此。**已修**：`buildTopicIndex` 改为词首边界匹配（`\b` + 关键词），`ai`/`dai` 这类过短的再加词尾边界只match整词；`\b` 在 JS 正则里只认 ASCII，所以仅当关键词以 ASCII 字母数字开头/结尾时才加边界 —— 否则 `链上美股` 这类中文关键词会永远匹配不上。同时从 `yield` 移除 `liquidity`（它一个词就命中全站 91%，而且不是收益概念）。实测条数变化：ai-crypto `1044→257`、l1-l2 `676→543`（`chain` 不再吃掉所有 "blockchain"）、stablecoin `425→339`（`dai` 不再吃掉 "daily"）、yield `6689→998`；掉出的都验证过是真误匹配（MoonDog AI 不是股票、PAX Gold 是代币化黄金）。**顺带修了 `postCount`**：原本硬编码在 `src/data/topics.ts` 里且早已过期（rwa 写 15、yield 写 20、l1-l2 写 40，基本差一个数量级），却真的渲染在主题卡片上。已从 Topic 接口和 11 个对象里删除该字段，改为 `getTopicPostCount(topicSlug, locale)` 从 topic-index 现算。**注意取的是哪个数**：topic-index 存的是全部语言版本，直接取 `.length` 会把每篇算三遍；`getLocalizedPosts` 按 `translationKey` 分组后每组取一条，所以显示的是读者在该语言下真正能打开的篇数（三语相同）。实际值：stablecoin 204、perp-dex 60、cex 130、l1-l2 399、ai-crypto 152、rwa 246、yield 462、robotics 10、quantum 11、market-structure 19、tokenized-equities 29（原本是 0，徽章根本不显示）。详情页原本写的是 `{postCount}+`，数字变真实后去掉了那个 `+`。**`projectCount` 也一并修了，但根因不同**：它过期的方向不一致（stablecoin 写 14 实际 123，而 ai-crypto 写 10 实际只有 6），因为真正坏掉的是 `relatedTypes` 这个映射本身 —— registry 的 type 是复合值 `AI/DePIN`，不是分开的 `AI` 和 `DePIN`，所以 ai-crypto 只命中 6 个、漏掉 75 个。新增 `countProjectsByType()` 按 `/` 拆分后逐段匹配。**更关键的发现：registry 的 `type` 分类和 topic 分类是正交的。** robotics 的 2 个项目都归在 `AI/DePIN`，quantum 的 7 个散在 `L1/L2/Infra/Lending`，tokenized-equities 的约 28 个混在 `RWA`(105) 和 `Infra` 里 —— `type` 字段不携带这些信息，不是映射配错。这三个（加上本就为空的 market-structure）的 `relatedTypes` 已置空，页面显示兜底文案而不是一个靠不住的数字；试过用 `matchKeywords` 匹配项目描述，robotics/quantum 确实对了（4/6），但 l1-l2 会涨到 256（'chain'、'base' 在项目描述里太常见），所以没采用。当前值：stablecoin 123、perp-dex 18、cex 34、l1-l2 47、ai-crypto 93、rwa 105、yield 272，其余 4 个为 0。另外 `relatedTypes` 在此之前全仓库没有任何消费者（注释说给 research-client 用，但并没有），现在它真正驱动这个计数。

- **2026-10-17**：压缩静态产物以修复部署耗时。两步：(1) `scripts/prune-segment-cache.mjs` 在 export 后删掉 Next 16 的 Segment Cache `__next.*.txt`（16.1 无开关可关），路由级 `<route>.txt` 保留，客户端跳转靠它回退 —— 部署 6m02s → 3m24s；(2) 删掉重复的 `/blog/[slug]` 路由。每篇文章此前同时导出到 `/blog/<slug>` 和 `/<locale>/blog/<slug>`，两份逐字节同源，而 sitemap、RSS `<link>` 和站内所有 href 在三语化后早已只指向后者 —— 7,260 页 × ~219 KB，占 3.83 GB 产物中的 1.86 GB。**关键坑**：`output: 'export'` 下 `generateStaticParams()` 返回 `[]` 会被 Next 判为「missing generateStaticParams」直接报错，所以必须真正删掉路由，不能让它渲染 0 页。渲染器移到 `src/components/blog/article-view.tsx`（`/[locale]/blog/[slug]` 本来就从那个模块 import），老 URL 由 `scripts/emit-legacy-blog-redirects.mjs` 在 export 后写 756 B 跳转页承接（canonical + 零延迟 meta refresh + 保留 query/hash 的 `location.replace`）。产物 3.83 GB → 2.02 GB（−47%），预渲染路由 14,615 → 7,355，本机 build ~75s。已验证：7,260 个 stub 全部指向存在的本地化页面且语言分布与索引一致（en 2958 / ja 2114 / zh-CN 2188），老 URL 带 query+hash 跳转正确，两跳站内导航仍是客户端跳转，33 个 console 404 全是既有的 segment-cache 预取、无新增。RSS `<guid>` 故意保留 `/blog/<slug>` 旧形态，避免订阅端把全部文章当新内容重推。**遗留**：`/blog` 列表页单页 9.4 MB。

- **2026-10-17**：整站改版为「研究终端」并合并进 main（5 个 commit，已推送）。**设计**：`globals.css` 重建 token 体系（深色默认 + `.light`，三档 surface 明度取代半透明卡片，1 个品牌色 + 2 个语义色），`tailwind.config.ts` 把 8 种自定义圆角收敛为 2/4/9999 三档并加 mono/serif，字体 Inter → IBM Plex Sans/Mono/Serif，底部 magicui Dock 换成带文字的 sticky 顶栏（`site-header.tsx`）+ 新页脚（`site-footer.tsx`），首页重写为搜索优先 + 密集索引表，文章页正文切衬线、表格等宽。全站清掉 box-shadow / backdrop-blur / 装饰渐变 / 悬停位移。**教训**：那次 codemod 的 `shadow-[...]` 规则排在 `hover:shadow-[...]` 之前，把前缀后半吃掉留下悬空 `hover:`；`backdrop-blur` 的 `\b` 让 `p-4 backdrop-blur-[2px]` 变成无效的 `p-4-[2px]`，导致卡片 padding 失效 —— 已在 `4c73ffe` 修复。**新板块**：`/stocks` 链上美股追踪（`src/data/tokenized-equities.ts` 两层模型：发行方层管法律包装/托管/赎回/PoR，工具层管深度/价差/溢价；所有正文用 `[en, zh, ja]` 三元组 + `pick()`），配 `tokenized-equities` topic 与导航入口。**架构**：确认 Cloudflare Worker 已废弃 → 去掉 `output: 'export'`、从 `1b1c02a^` 恢复 `src/app/api/subscribe/route.ts`（改为缺 RESEND 环境变量时返回 503 而非谎报成功）、删 `workers/` 与 wrangler 依赖及相关脚本、把失效的 Cloudflare `_headers` 迁进 `next.config` 的 `headers()`（Vercel 从不读 `_headers`，那些 RSS Content-Type 和缓存头此前一直没生效）。build 仍预渲染 14,580 页，唯一动态路由是 `/api/subscribe`。**内容**：按发行方的链上美股深度研究已写 4 家 × 三语 —— xStocks、Ondo 已提交，bStocks、Dinari 由站主自行提交。**未决**：Hyperliquid 邀请链接仍无推荐码；文章内嵌 SVG 图表是浅色底，深色模式下显示为白块（3,000+ 篇）；`navbar.tsx` / `magicui/dock.tsx` 零引用但保留作回滚路径。

- **2026-09-15**：确认生产部署实际在 **Vercel**（`x-vercel-id`，Cloudflare 只做 DNS 代理），`Deploy Cloudflare` workflow 从 2026-09-12 起每次都在 `Setup pnpm` 失败（`pnpm/action-setup@v4` 不允许 `version:` 与 package.json `packageManager` 并存），所以 Cloudflare Pages / Worker 从未真正部署过。据此把增量缓存改挂到 Vercel 的构建缓存：`scripts/lib/content/paths.mjs` 新增 `resolveGeneratedDir()`，优先 `CONTENT_CACHE_DIR`，检测到 `VERCEL` 时用 `${NEXT_DIST_DIR||.next}/cache/content`，其余仍是 `.generated/`；`src/data/blog.ts` 镜像同一套解析（两处注释互指，必须同步），`generate-static-assets.mjs` 改为从 `paths.mjs` 导入常量不再自己拼路径。已验证 `next build` 不会清掉 `.next/cache`，模拟两次 Vercel 构建：第一次 `Compiled: 3002 / 17.45s`，第二次只恢复 `.next/cache` 即 `Cache hits: 3002 / Compiled: 0 / 0.70s`，页面数均 3025。`deploy-cloudflare.yml` 删除，替换为 `ci.yml`（lint + typecheck + content:prepare + content 测试，带 `.generated` 缓存，不重复跑 `next build`）；wrangler 脚本保留在 package.json，Cloudflare 迁移选项未丢。**未决遗留**：`/api/*` 线上 404（该 Worker 从未部署，导致 fear/watch/oscillator 动态数据失效）；`out/` 有 28,637 个文件（其中 24,181 个是 Next 16 无法关闭的 Segment Cache `.txt`），超过 Cloudflare Pages 20,000 上限，未来若真要迁 Cloudflare 需先解决。

- **2026-09-14**：重构内容构建管线，把 `O(N²)` 的 per-page MDX 全量扫描改成一次性增量编译。新增 `scripts/build-content.mjs` + `scripts/lib/content/`（discovery / markdown / indexes / 有界 worker pool），产物写入 gitignore 的 `.generated/`：`blog-index.json`、`category-index.json`、`topic-index.json`、`relations.json`、`cache-manifest.json` 和每篇一份 `posts/<sha256(slug)>.html|.json`。`src/data/blog.ts` 不再读 MDX、不再引入 shiki/unified，只读索引与 artifact；related posts / related topics / topic 列表全部预计算。`generate-static-assets.mjs` 改为消费 blog-index，并把 sitemap 拆成 `/sitemap.xml` 索引 + `/sitemaps/*.xml` 分片（每片 5000 URL）。GitHub Actions 用 `actions/cache` 持久化 `.generated`（key 含 commit sha，restore-keys 回退到上一次），并新增分阶段计时。实测（本机 18 核）：改造前 `pnpm build` 198s；改造后 cold 47.3s、warm 31.4s、改一篇文章 32.5s，内容编译从 3002 篇全量 15.6s 降到命中缓存 0.36s / 改一篇 0.5s。3025 个页面中 3013 个渲染文档与改造前逐字节一致；差异只有 10 个 topic 页（列表改为确定性 newest-first）与 fear/watch（构建时间戳）。顺带修复中文 slug 在静态导出时因 params 被 percent-encode 而 404 的历史问题。

- **2026-09-07**：Portfolio 部署架构从 Vercel 迁移到 Cloudflare：Next.js 启用 `output: 'export'`，生产输出为 `out/`；删除 Next API/metadata route handlers 与动态 OG route；`scripts/generate-static-assets.mjs` 在 `predev/prebuild` 生成 RSS、llms、sitemap、robots、manifest、OG SVG 和 Cloudflare `_headers`；新增 Cloudflare Worker `workers/api/src/index.ts` 承接 `/api/subscribe`、`/api/btc-score`、`/api/fear-data`、`/api/watch-data`，并用 Worker Cache API + Cron 刷新动态数据；新增 `.github/workflows/deploy-cloudflare.yml`，main push 后 install/lint/typecheck/build/deploy Worker/deploy Pages。验证：`pnpm typecheck`、`pnpm lint`、`pnpm build`、Worker dry-run、源码动态/Vercel 关键词扫描与 `git diff --check` 均通过；未提交 commit。
- **2026-07-07**：修复 3 篇 2019 旧文 `publishedAt` 格式，并继续新增 CMC/CGO-oriented full-depth Research 至目标 `1000` 篇。Surf-first 探测显示 `PAID_BALANCE_ZERO`，CoinGecko markets/list 返回 `429 Too Many Requests`，因此用 DefiLlama protocol list fallback 扩容候选池并分 5 批 `200*5` 生成/同步；最终 registry `2811`、candidate total `3815`、pending new candidates `381`、upgrade queue `0`；最近 1000 篇 depth audit `1000/1000 full-depth pass`。同步增强：CoinGecko list / DefiLlama seeding、候选噪声过滤、同族去重、Surf credit-error 短路、`sync-research --skip-logos`，并修正 OSL logo 引用。残余风险：1000 篇 live enrichment 均受 Surf 余额和 CG 429 影响，后续应批量补 live market / primary sources。
- **2026-07-07**：继续新增 CMC/CGO-oriented full-depth Research 至目标 800 篇。使用 Surf `market-ranking` 扩容候选池，分四轮生成并同步：`200 + 198 + 200 + 202`，最终 registry `1811`、candidate total `2215`、pending new candidates `355`、upgrade queue `0`；最近 800 篇 depth audit `800/800 full-depth pass`。同步修复批量和同步脚本：安全字符串转义、超大 `PROJECTS` typed assertion、非拉丁 slug fallback、registry/short-name 去重、CoinGecko API fallback 开关。残余风险：batch3/4 共 `402` 篇生成时 Surf 返回 `PAID_BALANCE_ZERO`，CoinGecko API fallback 返回 `429 Too Many Requests`，后续应批量刷新 live market / primary sources。
- **2026-07-06**：同步最新进度、当前 skill/workflow 与快捷添加内容脚本。新增 `scripts/quick-add-content.mjs` 与 `pnpm quick:add`，默认 dry-run、显式 `--write` 才写入 MDX；更新 `src/data/skill.md` 为 repo-local Portfolio Research Map workflow reference。当前安装目录未发现旧 `research-map-builder` skill。
- **2026-03-31**：实现 `/thoughts` 页面 + Telegram 自动同步功能。使用 GitHub Actions 每天同步频道 @kkdemian2050 的消息到 `content/thoughts.json`，前端展示为 Twitter/X 风格时间线。Bot: fulipy_bot。
