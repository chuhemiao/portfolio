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
- **当前 Research 进度（2026-07-06）**：registry `511` projects；candidate total `357`，pending new candidates `59`；depth upgrade queue `0`。
- **当前 Skill / 工作流**：当前安装目录未发现旧 `research-map-builder` skill；本仓库以 `src/data/skill.md` 作为 repo-local Research Map workflow reference，核心原则是 Surf-first、先本地查重、再写 MDX、再同步 `/research` 与 registry。
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

- **2026-07-06**：继续新增 CMC/CGO-oriented full-depth Research 100 篇，并接入 `/research`、registry 与本地 logo；扩展 `scripts/generate-cmc-cgo-research-batch.mjs`，支持 `--from-pending`、`--target-count`、`--list-only` 和 registry 二次去重。当前 `pnpm status:research:run`：registry `511`、candidate total `357`、pending new candidates `59`、upgrade queue `0`；新增 100 篇均 full-depth pass。
- **2026-07-06**：继续新增 CMC/CGO-oriented full-depth Research 30 篇，并接入 `/research`、registry 与本地 logo；新增 `scripts/generate-cmc-cgo-research-batch.mjs`，支持 Surf-first refresh、display override、`--overwrite`。新增 30 篇均未进入 depth needs-upgrade。
- **2026-07-06**：同步最新进度、当前 skill/workflow 与快捷添加内容脚本。新增 `scripts/quick-add-content.mjs` 与 `pnpm quick:add`，默认 dry-run、显式 `--write` 才写入 MDX；更新 `src/data/skill.md` 为 repo-local Portfolio Research Map workflow reference。当前安装目录未发现旧 `research-map-builder` skill。
- **2026-03-31**：实现 `/thoughts` 页面 + Telegram 自动同步功能。使用 GitHub Actions 每天同步频道 @kkdemian2050 的消息到 `content/thoughts.json`，前端展示为 Twitter/X 风格时间线。Bot: fulipy_bot。
- **2026-03-11**：研究 AI 长久记忆方案（mem.mdx），讨论了五层记忆架构（Vector/Hierarchical/KG/Compression/Reflection），推荐工程起点为 `CLAUDE.md + SESSION_LOG + Mem0`。
