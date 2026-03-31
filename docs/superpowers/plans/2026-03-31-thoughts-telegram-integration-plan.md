# Thoughts 页面 + Telegram 集成实施计划

**日期：** 2026-03-31
**基于设计文档：** docs/superpowers/specs/2026-03-31-thoughts-telegram-integration-design.md
**状态：** 待执行

---

## 概述

本计划将分4个阶段实现 thoughts 页面和 Telegram 自动同步功能：
1. Phase 1: 创建 Telegram Bot（手动操作）
2. Phase 2: 前端页面开发
3. Phase 3: 同步脚本开发
4. Phase 4: GitHub Actions 配置

每个步骤都是独立的小任务，完成后立即提交。

---

## Phase 1: 创建 Telegram Bot

### 步骤 1.1: 创建 Bot
**操作：** 手动操作
1. 在 Telegram 中搜索 @BotFather
2. 发送 `/newbot` 命令
3. 按提示设置 Bot 名称和用户名
4. 保存返回的 Bot Token

### 步骤 1.2: 配置 Bot 权限
**操作：** 手动操作
1. 将 Bot 添加为频道 @kkdemian2050 的管理员
2. 授予"发布消息"权限（可选，只需读取权限）
3. 测试 Bot 是否能访问频道

### 步骤 1.3: 测试 API 访问
**操作：** 手动测试
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```
确认能获取到频道消息。

**提交：** 无需提交（手动操作）

---

## Phase 2: 前端页面开发

### 步骤 2.1: 创建初始 JSON 数据文件
**操作：** 创建空的 thoughts.json
```bash
mkdir -p content
cat > content/thoughts.json << 'EOF'
{
  "thoughts": [],
  "lastSync": null,
  "totalCount": 0
}
EOF
```

**提交：**
```bash
git add content/thoughts.json
git commit -m "feat: add initial thoughts.json data file"
```

### 步骤 2.2: 创建 thoughts 页面
**操作：** 创建 `src/app/thoughts/page.tsx`

**代码：** 见下方完整代码

**提交：**
```bash
git add src/app/thoughts/page.tsx
git commit -m "feat: create thoughts page with timeline UI"
```

### 步骤 2.3: 添加导航入口
**操作：** 修改 `src/data/resume.tsx`

在 `navbar` 数组中添加：
```typescript
{ href: '/thoughts', icon: MessageSquareIcon, label: 'Thoughts' }
```

同时在文件顶部导入：
```typescript
import { MessageSquareIcon } from 'lucide-react';
```

**提交：**
```bash
git add src/data/resume.tsx
git commit -m "feat: add thoughts navigation entry"
```

### 步骤 2.4: 本地测试
**操作：** 启动开发服务器测试
```bash
pnpm dev
```
访问 http://localhost:3000/thoughts 验证页面显示。

**提交：** 无需提交（测试步骤）

---

## Phase 3: 同步脚本开发

### 步骤 3.1: 创建同步脚本
**操作：** 创建 `scripts/sync-telegram.js`

**代码：** 见下方完整代码

**提交：**
```bash
git add scripts/sync-telegram.js
git commit -m "feat: add telegram sync script"
```

### 步骤 3.2: 添加 package.json 脚本
**操作：** 在 `package.json` 中添加同步命令

```json
"scripts": {
  "sync:telegram": "node scripts/sync-telegram.js"
}
```

**提交：**
```bash
git add package.json
git commit -m "chore: add telegram sync npm script"
```

### 步骤 3.3: 本地测试同步
**操作：** 使用真实 Token 测试
```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHANNEL_ID="@kkdemian2050"
pnpm sync:telegram
```

验证 `content/thoughts.json` 是否更新。

**提交：** 无需提交（测试步骤）

---

## Phase 4: GitHub Actions 配置

### 步骤 4.1: 创建 GitHub Actions 工作流
**操作：** 创建 `.github/workflows/sync-telegram.yml`

**代码：** 见下方完整代码

**提交：**
```bash
git add .github/workflows/sync-telegram.yml
git commit -m "ci: add telegram sync workflow"
```

### 步骤 4.2: 添加 GitHub Secrets
**操作：** 在 GitHub 仓库设置中添加 Secrets
1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加 `TELEGRAM_BOT_TOKEN`（Bot Token）
3. 添加 `TELEGRAM_CHANNEL_ID`（@kkdemian2050）

**提交：** 无需提交（GitHub 操作）

### 步骤 4.3: 手动触发测试
**操作：** 在 GitHub Actions 页面手动触发工作流

**提交：** 无需提交（测试步骤）

---

## 附录：完整代码

### A. src/app/thoughts/page.tsx

```typescript
import BlurFade from '@/components/magicui/blur-fade';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Thoughts',
  description: '我的碎碎念'
};

interface Thought {
  id: string;
  text: string;
  date: string;
  timestamp: number;
}

async function getThoughts() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'thoughts.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { thoughts: [], lastSync: null, totalCount: 0 };
  }
}

export default async function ThoughtsPage() {
  const { thoughts } = await getThoughts();

  return (
    <main className='flex flex-col min-h-[100dvh] space-y-10'>
      <section id='thoughts'>
        <div className='mx-auto w-full max-w-2xl space-y-8'>
          <BlurFade delay={0.04}>
            <h1 className='text-3xl font-bold'>Thoughts</h1>
            <p className='text-muted-foreground'>来自 Telegram 的碎碎念</p>
          </BlurFade>

          {thoughts.length === 0 ? (
            <p className='text-muted-foreground text-center py-12'>暂无内容</p>
          ) : (
            <div className='space-y-4'>
              {thoughts.map((t: Thought, i: number) => (
                <BlurFade key={t.id} delay={0.08 + i * 0.05}>
                  <div className='rounded-lg border p-4 space-y-2'>
                    <p className='text-sm leading-7'>{t.text}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatDistanceToNow(new Date(t.date), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </p>
                  </div>
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
```

### B. scripts/sync-telegram.js

```javascript
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

async function fetchChannelMessages() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) throw new Error('Failed to fetch messages');

  return data.result
    .filter(u => u.channel_post && u.channel_post.text)
    .map(u => ({
      id: String(u.channel_post.message_id),
      text: u.channel_post.text,
      date: new Date(u.channel_post.date * 1000).toISOString(),
      timestamp: u.channel_post.date
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

async function main() {
  const thoughts = await fetchChannelMessages();
  const data = {
    thoughts,
    lastSync: new Date().toISOString(),
    totalCount: thoughts.length
  };

  const filePath = path.join(__dirname, '..', 'content', 'thoughts.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Synced ${thoughts.length} thoughts`);
}

main().catch(console.error);
```


### C. .github/workflows/sync-telegram.yml

```yaml
name: Sync Telegram Thoughts

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Sync Telegram messages
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHANNEL_ID: ${{ secrets.TELEGRAM_CHANNEL_ID }}
        run: node scripts/sync-telegram.js
      
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content/thoughts.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: sync telegram thoughts"
          git push
```

---

## 总结

实施计划已完成，包含4个阶段共12个步骤。按照计划执行即可完成 thoughts 页面和 Telegram 自动同步功能的开发。

