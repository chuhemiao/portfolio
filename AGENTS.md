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

- **2026-08-01**：按用户要求继续新增研究报告“AEON.XYZ ($AEON) - 深度项目研究”，创建 `content/blog/2026/research/aeon-xyz-aeon-ai-agent-payment-stablecoin-settlement-risk.mdx`，frontmatter 为 `publishedAt: 2026-08-01`、`category: research`、slug `aeon-xyz-aeon-ai-agent-payment-stablecoin-settlement-risk`。内容基于用户提供的附件正文，核心结论为 AEON.XYZ 是 AI Agent 支付、x402、BNB Chain、跨链加密结算和线下商户 QR 支付的 AI 经济结算层项目，叙事与融资背书较强，但 $AEON 上线后价格弱、低流通高 FDV、Top holders 集中、token value capture 与 allocation/vesting 披露不足，当前更适合按 TGE 后观察标的跟踪。同步在 `src/data/research-projects.ts` 新增 Research Map 索引 `AEON.XYZ / AEON`，类型 `AI/PayFi`，不新增 logoUrl 以避免缺失资产。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2978 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；未提交 commit。
- **2026-08-01**：按用户要求添加新的研究报告“Mubarak ($MUBARAK) - 详细研究报告”。查重发现已存在批量生成版 `content/blog/2026/research/mubarak-mubarak-defi-infrastructure-token-value-capture-risk.mdx`，因此未新增重复项目，而是直接升级该报告为用户提供的 BNB Chain Meme 详细研究：核心结论为 MUBARAK 是 CZ/中东文化/BNB Chain Meme 轮动驱动的社区型 Meme 币，更适合按高波动交易型标的处理；机会在小市值、高换手、Binance/Bitget 可见度和 Meme 叙事再启动，风险在前 20 地址约 `92.75%` 高集中、链上流动性偏薄、叙事依赖和解锁数据缺口。同步更新 `src/data/research-projects.ts` 中 `Mubarak / MUBARAK` 的 Research Map 描述，类型从 `Infra` 改为 `Meme`，保留原 slug/logo 路径避免断链。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2977 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；未提交 commit。
- **2026-08-01**：按用户要求继续新增 thoughts 文章“MoonPay PayBox - AI代理支付与稳定币结算优势”，创建 `content/blog/2026/thoughts/moonpay-paybox-ai-agent-payments-stablecoin-settlement.mdx`，frontmatter 为 `publishedAt: 2026-08-01`、`category: thoughts`、slug `moonpay-paybox-ai-agent-payments-stablecoin-settlement`。内容基于用户提供的附件正文，核心结论为 PayBox 的价值不是推文热度，而是把 Claude/ChatGPT 自然语言意图接到钱包、x402、稳定币、跨链和商户支付流程；MoonPay 更确定的优势在稳定币结算层，商户护城河仍需 PayBox 活跃 vault、TPV、复购率、稳定币结算占比和命名商户验证。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2977 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-01**：按用户要求继续新增 research 文章“Alkimiya/42 - 差异化与流量防线”，创建 `content/blog/2026/research/alkimiya-42-differentiation-traffic-moat.mdx`，frontmatter 为 `publishedAt: 2026-08-01`、`category: research`、slug `alkimiya-42-differentiation-traffic-moat`。内容基于用户提供的数据和链接，核心结论为 42/Blitz 应作为 30 秒娱乐交易流量入口，而 Alkimiya/42 Protocol 要守住“结果资产发行与结算协议”定位，通过 dynamic payouts、Power Curve、Outcome Tokens、可验证结算、链上经济变量市场和 API/创作者分发建立流量防线。手动在 `src/data/research-projects.ts` 新增 Research Map 索引 `Alkimiya / 42 Protocol`，类型 `Prediction`。本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2976 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过；未提交 commit。
- **2026-08-01**：按用户要求继续新增 thoughts 文章“CZ/Giggle Academy捐赠规则 - BNB生态与拉盘争议”，创建 `content/blog/2026/thoughts/cz-giggle-academy-donation-rules-bnb-ecosystem-pump-debate.mdx`，frontmatter 为 `publishedAt: 2026-08-01`、`category: thoughts`、slug `cz-giggle-academy-donation-rules-bnb-ecosystem-pump-debate`。内容基于用户提供且标注来自 Surf 的数据，核心结论为 Giggle Academy 月底将捐赠迷因币换成 BNB 会中长期强化 BNB Chain 公益/链上透明资金流叙事，但短期舆论主线更可能是 CZ 影响力触发的“被动拉盘/被动喊单”争议；重点观察月末换币规模、捐赠币价格反应、BNB 资金费率和披露质量。按延续要求，本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2975 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-01**：按用户要求继续新增 thoughts 文章“Polymarket - AI 简历风险预警叙事”，创建 `content/blog/2026/thoughts/polymarket-ai-resume-risk-warning-narrative.mdx`，frontmatter 为 `publishedAt: 2026-08-01`、`category: thoughts`、slug `polymarket-ai-resume-risk-warning-narrative`。内容基于用户提供且确认来自 Surf 的数据：Polymarket X 帖约 `140.1万` views、`1.43万` likes、`648` reposts、`279` replies，平台 30 日成交约 `$28.40B`、STEM 类别约 `$39.93M`，结论为强化“风险雷达/舆情入口”叙事，但尚未证明 AI 简历 prompt injection 已进入可交易风险定价层。按用户明确要求，本轮未调用 Surf skill/API，也未额外联网查询；验证：`pnpm content:check` 通过（scanned 2974 mdx files）、`git diff --check` 通过；未提交 commit。
- **2026-08-01**：按用户要求将“Bitcoin 自托管 - 钱包标准压力测试”新增为研究报告：创建 `content/blog/2026/research/bitcoin-self-custody-wallet-standards-stress-test.mdx`，frontmatter 为 `publishedAt: 2026-08-01`、`category: research`，正文保留 TL;DR、事件读法、协议层/应用层判断、钱包标准变化、自托管信任、监测信号和结论。按 Surf-first 规则执行 `surf install`、`surf sync`、`surf search-news/search-web --help`，查询事件时 Surf 返回 `PAID_BALANCE_ZERO`，因此 fallback 到 Coinkite 技术说明/安全公告、Block Engineering 分析、BIP-39/BIP-380 与 X 链上分析链接。手动在 `src/data/research-projects.ts` 新增 Research Map 索引 `Bitcoin Self-Custody Wallet Standards`，类型 `Wallet`，并删除过期 `@ts-expect-error`（TS 已不再触发对应 TS2590）。验证：`pnpm content:check` 通过（scanned 2973 mdx files）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过。注意：`pnpm sync:research --add --skip-logos` 当前与新的 `src/data/research-projects.ts` 架构不兼容，会把大量历史 research 误判 missing 且找不到 `research-client.tsx` 插入点，已停止并改为最小手动接入；未提交 commit。
- **2026-07-17**：按用户要求把图片里的 Crypto Card tier list 新增到 `/fund` 页面，单独增加 `crypto-card` / `Crypto Cards` 分类，用于记录“使用 Web3 稳定币进行交易/消费的 Visa 或银行卡”赛道。接入 `18` 个项目并保留 S/A/B/C/D 分层与 X handle：S tier `Revolut`、`Coinbase Card`、`RedotPay`、`KAST`；A tier `ether.fi Cash`、`Holyheld`、`Wirex`；B tier `Gnosis Pay`、`Kolo`、`Krak`、`Oobit`；C tier `Avalanche Card`、`Avici`、`Solflare Card`、`COCA`；D tier `Hawala`、`Hyperbeat`。同步扩展 `Asset` 类型支持 `handle` 与 `tier`，fund 卡片右上角显示 tier badge，SEO 描述加入 stablecoin crypto cards，`philosophy.lastUpdated` 更新为 `2026/07/17`。验证：`pnpm exec tsc --noEmit` 通过，`git diff --check -- src/data/fund.ts src/app/fund/fund-client.tsx src/app/fund/page.tsx` 通过；未提交 commit。
- **2026-07-07**：按用户要求“修复2019旧文 publishedAt 格式，并继续增加 CMC/CGO 深度研究文章，目标新增1000篇”完成本轮净新增/接入 `1000` 篇 full-depth Research，同时修复 3 篇 2019 旧文 `publishedAt`：`2019-1-13`→`2019-01-13`、`2019-4-10`→`2019-04-10`、`2019-2-13`→`2019-02-13`。当前 registry 从 `1811` 增至 `2811` projects，candidate total `3815`，pending new candidates `381`，depth upgrade queue `0`。数据源路径：按 Surf-first 规则执行 `surf sync/list-operations/market-ranking --help`，live ranking 返回 `PAID_BALANCE_ZERO`；CoinGecko markets/list 先后返回 `429 Too Many Requests`；随后使用 DefiLlama protocol list fallback 扩容 `1600` 候选，并分 5 批 `200*5` 生成、`sync-research --add --skip-logos` 接入。脚本增强：`seed-research-candidates.mjs` 支持 `coingecko-list` 与 `defillama` fallback，并过滤 CEX/无 token/噪声候选；`generate-cmc-cgo-research-batch.mjs` 增强同族去重和 Surf credit-error 短路；`sync-research.mjs` 增加 `--skip-logos`；同时修正 OSL logo 引用为已存在的 `osl_group.png`。验证：`pnpm content:check` 通过（scanned 2966 mdx files）、`pnpm audit:research:depth -- --limit 1000 --write` 通过（1000/1000 full-depth pass）、`pnpm check:research:logos` 通过、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、相关脚本 `node --check` 通过。残余风险：本轮 1000 篇 live enrichment 均因 Surf 余额为 0 失败，且 CG API 429；文章结构与 source discovery 足够通过 Research Map 覆盖，但高置信投资用途前应批量 live-data refresh / primary-source 加强。
- **2026-07-07**：按用户要求继续增加 CMC/CGO-oriented 深度研究并完成目标 `800` 篇净新增/接入。先用 Surf `market-ranking` 扩容候选池（`pnpm seed:research:candidates -- --provider surf --pages 30 --limit 1000 --write`），candidate total 从 `1215` 增至 `2215`；分四轮生成并同步：batch1 `200`、batch2 `198`（2 个候选已存在）、batch3 `200`、batch4 `202`，最终 registry 从 `1011` 增至 `1811` projects，pending new candidates `355`，depth upgrade queue `0`。同步修复/增强：`scripts/sync-research.mjs` 使用安全字符串转义并兼容 `] as ResearchProject[]` 插入点；`src/app/research/research-client.tsx` 为超大 PROJECTS literal 加 typed assertion；`scripts/generate-cmc-cgo-research-batch.mjs` 增加非拉丁 slug fallback、registry/short-name 去重和 `--use-coingecko-api` 搜索兜底；`scripts/sync-research-registry.mjs` 增强 alias/startsWith 去重。最终验证：`pnpm audit:research:depth -- --limit 800 --write` 通过（800/800 full-depth pass，needs upgrade 0）、`pnpm check:research:logos` 通过（1209 projects）、`pnpm exec tsc --noEmit` 通过、`git diff --check` 通过、相关脚本 `node --check` 通过；`pnpm content:check` 仍仅因 3 篇 2019 旧文 `publishedAt` 非 `YYYY-MM-DD` 失败。残余风险：batch3/4 共 `402` 篇生成时 Surf 返回 `PAID_BALANCE_ZERO`，CoinGecko API fallback 同时返回 `429 Too Many Requests`，文章结构和 depth audit 已通过，但后续应批量刷新 live market / primary sources 以提升数据强度。
