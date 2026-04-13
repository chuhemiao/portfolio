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

- **2026-04-13**：继续升级 `/research` 页面视觉层，不改数据与路由。优化了 logo tile 的白底与 ring 质感、卡片 hover 阴影与顶部色带、标题与描述层级、type tag 样式、筛选 pills 的选中/悬停状态，并将页面改成 full-bleed 结构：research 内容区放宽到 `1150px`，背景改为整页铺开的 ambient layer，不再受全局窄列布局影响。
- **2026-04-13**：修正全站 layout 结构。移除了根布局 `body` 上的 `max-w-2xl` 与全局上下 padding，改成 full-width app shell；首页、thoughts、blog、stack、fear、fund、research、博客详情页分别改为按页面类型自选容器宽度。`/research` 同步去掉顶部黑边/空白，小屏改为单列，平板与桌面按 2-4 列自适应。
- **2026-04-13**：将 research logo 流程接入 `pnpm sync:research --add`。现在新增 research 条目写入 `PROJECTS` 后会自动运行本地 logo 同步；logo 来源新增 `logo.wine`，并在 `sync-research-logos.mjs` 中按多来源顺序兜底下载到 `public/research-logos/`。
- **2026-04-12**：`/research` 页面 logo 改为本地静态资源方案。新增 `pnpm sync:research:logos` 自动为 `PROJECTS` 下载/生成 `public/research-logos/` 下的本地图片，并回写 `logoUrl` 为本地路径；新增 `pnpm check:research:logos` 校验所有研究项目都存在本地 logo 文件，避免远程超时和 404。
- **2026-03-31**：实现 `/thoughts` 页面 + Telegram 自动同步功能。使用 GitHub Actions 每天同步频道 @kkdemian2050 的消息到 `content/thoughts.json`，前端展示为 Twitter/X 风格时间线。Bot: fulipy_bot。
- **2026-03-11**：研究 AI 长久记忆方案（mem.mdx），讨论了五层记忆架构（Vector/Hierarchical/KG/Compression/Reflection），推荐工程起点为 `AGENTS.md + SESSION_LOG + Mem0`。
