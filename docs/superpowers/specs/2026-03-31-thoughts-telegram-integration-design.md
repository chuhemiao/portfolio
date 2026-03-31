# Thoughts 页面 + Telegram 集成设计文档

**日期：** 2026-03-31
**作者：** Claude + kkdemian
**状态：** 设计阶段

---

## 1. 项目概述

### 1.1 目标
在 kkdemian.com 网站底部增加一个独立的 `/thoughts` 页面，用于展示来自 Telegram 频道的碎碎念内容，实现从 Telegram 到网站的自动同步。

### 1.2 核心需求
- 创建 Twitter/X 风格的时间线页面
- 通过 Telegram Bot API 自动同步频道消息
- 使用 GitHub Actions 每天定期同步
- 数据存储在单个 JSON 文件中
- 只支持纯文本内容
- 最新消息显示在最前面

### 1.3 用户场景
- 用户在 Telegram 频道 @kkdemian2050 发布想法
- 每天自动同步到 GitHub 仓库
- Vercel 自动部署更新
- 访客在网站上看到最新的 thoughts

---

## 2. 技术方案选择

### 2.1 选定方案：最简实现
- **展示形式：** Twitter/X 风格时间线
- **集成方式：** GitHub Actions 每天同步一次
- **数据存储：** 单个 JSON 文件（`content/thoughts.json`）
- **内容类型：** 纯文本

### 2.2 方案优势
- 实现简单，代码量最少
- 无需额外服务或数据库
- 可靠稳定，易于维护
- 每天同步一次满足使用需求
- 零额外成本

---

## 3. 架构设计

### 3.1 系统架构图

```
┌─────────────────┐
│ Telegram Channel│
│  (kkdemian2050) │
└────────┬────────┘
         │
         │ Telegram Bot API
         ▼
┌─────────────────────┐
│  GitHub Actions     │
│  (每天运行一次)      │
└────────┬────────────┘
         │
         │ 提交 JSON
         ▼
┌─────────────────────┐
│  GitHub Repo        │
│  content/           │
│  thoughts.json      │
└────────┬────────────┘
         │
         │ Vercel 部署
         ▼
┌─────────────────────┐
│  Next.js App        │
│  /thoughts 页面     │
└─────────────────────┘
```

### 3.2 文件结构

```
portfolio/
├── content/
│   └── thoughts.json          # 所有 thoughts 数据
├── src/
│   ├── app/
│   │   └── thoughts/
│   │       └── page.tsx       # thoughts 页面
│   └── data/
│       └── resume.tsx         # 添加导航项
├── .github/
│   └── workflows/
│       └── sync-telegram.yml  # 同步工作流
└── scripts/
    └── sync-telegram.js       # 同步脚本
```

---

## 4. 数据结构设计

### 4.1 thoughts.json 格式

```json
{
  "thoughts": [
    {
      "id": "1234567890",
      "text": "今天研究了 Solana 的新提案...",
      "date": "2026-03-31T02:30:00Z",
      "timestamp": 1711851000
    }
  ],
  "lastSync": "2026-03-31T02:42:00Z",
  "totalCount": 1
}
```

### 4.2 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | Telegram 消息 ID（唯一标识） |
| `text` | string | 消息文本内容 |
| `date` | string | ISO 8601 格式时间戳 |
| `timestamp` | number | Unix 时间戳（用于排序） |
| `lastSync` | string | 最后同步时间 |
| `totalCount` | number | 总数量 |

### 4.3 排序规则
- 按 `timestamp` 降序排列
- 最新的消息显示在最前面

---

## 5. GitHub Actions 同步设计

### 5.1 工作流程
1. 每天定时触发（cron: `0 0 * * *`，UTC 时间每天 00:00）
2. 调用 Telegram Bot API 获取频道消息
3. 解析消息，转换为 JSON 格式
4. 写入 `content/thoughts.json`
5. 提交并推送到 GitHub
6. Vercel 自动检测并部署

### 5.2 需要的 GitHub Secrets
- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_CHANNEL_ID`: 频道用户名（@kkdemian2050）

### 5.3 Telegram Bot API
- 使用 `getUpdates` 方法获取频道消息
- 过滤 `channel_post` 类型的消息
- 只提取纯文本内容

---

## 6. 前端页面设计

### 6.1 页面路径
- URL: `/thoughts`
- 文件: `src/app/thoughts/page.tsx`

### 6.2 UI 组件
- Twitter/X 风格时间线布局
- 每条 thought 卡片包含：
  - 文本内容
  - 相对时间（如"2小时前"、"3天前"）
  - 简洁的分隔线

### 6.3 样式特点
- 使用 BlurFade 动画效果
- 复用项目现有 Tailwind 样式
- 响应式设计（移动端友好）
- 深色模式支持

### 6.4 导航集成
- 在 `src/data/resume.tsx` 的 `navbar` 数组添加入口
- 图标: `MessageSquareIcon`
- 标签: "Thoughts"

---

## 7. 实现步骤

### Phase 1: 创建 Telegram Bot
1. 通过 @BotFather 创建新 Bot
2. 获取 Bot Token
3. 将 Bot 添加为频道 @kkdemian2050 的管理员
4. 测试 Bot 能否读取频道消息

### Phase 2: 前端页面开发
1. 创建 `src/app/thoughts/page.tsx`
2. 实现时间线 UI 组件
3. 添加导航入口到 `resume.tsx`
4. 本地测试页面显示

### Phase 3: 同步脚本开发
1. 创建 `scripts/sync-telegram.js`
2. 实现 Telegram API 调用逻辑
3. 实现 JSON 文件读写逻辑
4. 本地测试同步功能

### Phase 4: GitHub Actions 配置
1. 创建 `.github/workflows/sync-telegram.yml`
2. 添加 GitHub Secrets
3. 测试工作流运行
4. 验证自动部署

---

## 8. 错误处理

### 8.1 同步脚本错误处理
- **API 调用失败**: 重试3次，失败则跳过本次同步
- **频道无新消息**: 正常退出，不提交
- **JSON 解析错误**: 记录日志，保留旧数据
- **网络超时**: 设置30秒超时，超时则重试

### 8.2 前端错误处理
- **JSON 文件不存在**: 显示空状态提示
- **数据格式错误**: 显示错误提示
- **加载失败**: 显示重试按钮

### 8.3 边界情况
- **首次同步**: 创建新的 thoughts.json 文件
- **频道被删除**: 保留现有数据，停止同步
- **消息被删除**: 不影响已同步的数据

---

## 9. 部署和维护

### 9.1 部署流程
1. 代码推送到 GitHub main 分支
2. Vercel 自动检测变更
3. 构建并部署到生产环境
4. 新页面立即可访问（kkdemian.com/thoughts）

### 9.2 维护要点
- **Bot Token 安全**: 定期轮换 Token（可选）
- **监控**: 定期检查 GitHub Actions 运行状态
- **日志**: 查看同步日志排查问题
- **备份**: Git 自动备份所有数据

### 9.3 成本分析
- **Telegram Bot API**: 免费
- **GitHub Actions**: 免费额度足够（每月 2000 分钟）
- **Vercel**: 免费计划足够
- **总成本**: $0/月

---

## 10. 总结

本设计采用最简实现方案，通过 Telegram Bot + GitHub Actions + Next.js 实现从 Telegram 频道到网站的自动同步。方案简单可靠，零成本，易于维护，完全满足"碎碎念"的使用场景。

**下一步**: 进入实施阶段，按照 Phase 1-4 的步骤逐步实现。

