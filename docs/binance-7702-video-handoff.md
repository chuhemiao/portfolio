# 交接 prompt：把解说动画渲染成 mp4

下面整段复制给 Codex。它是自包含的 —— 不需要先读这个仓库的其他文件。

---

## 任务

把 `docs/binance-7702-video.html` 这个 16:9 解说动画页，逐帧渲染成一个 **1920×1080 / 30fps / 时长精确 290.000 秒 / 无音轨** 的 mp4，输出到 `docs/binance-7702-video.mp4`（并把它加进 `.gitignore`，不要提交二进制）。

配音是人工后期叠的，所以**时长精确比画质更重要** —— 不能用录屏，掉一帧就会和旁白错位。

## 这个页面现在是什么样

- 单文件 HTML，无构建步骤，无外部依赖，只从 Google Fonts 拉 `IBM Plex Mono` + `IBM Plex Sans SC`。
- 结构：一个 `.stage` 容器（`container-type: size`，`aspect-ratio: 16/9`），内含 8 个 `<section class="s" data-dur="N">`。页面所有字号用 `cqh`/`cqw`，随舞台尺寸缩放。
- 场景切换：底部 `<script>` 里一个 `requestAnimationFrame` 主时钟，变量 `t`，按 `data-dur` 的累计值决定哪个 section 带 `data-active`。
- 场景内的元素逐个浮现：靠 CSS `animation-delay`，类名 `.rv` / `.fv` / `.pv`，延迟写在行内 `style="--d:7s"`。
- 另有可见控件 `#chrome`（进度条、时钟、按键提示），按 `H` 可 `hidden`。

场景边界（渲染后必须逐个抽帧核对）：

| 场景 | 起 | 止 | 内容 |
|---|---:|---:|---|
| S1 | 0 | 28 | 三个数字砸出 |
| S2 | 28 | 78 | 18 小时时间轴 |
| S3 | 78 | 130 | 签名字段左右对照 |
| S4 | 130 | 172 | 两笔交易 + 3:24 计时器 |
| S5 | 172 | 212 | 50 条 nonce 标尺 |
| S6 | 212 | 240 | gas 算式 + $0.91 |
| S7 | 240 | 270 | 冻结/不可冻结横条 |
| S8 | 270 | 290 | 三个待勾选信号 |

## 要你做的三件事

### 1. 给页面加一个确定性时钟钩子

现在的时钟是实时 rAF 驱动的，没法「跳到第 173.4 秒」。加一个 `window.__renderAt(t)`，返回一个在该帧已绘制后 resolve 的 Promise：

```js
window.__renderAt = async function (t) {
  // a) 算出场景索引，直接设 data-active（不要用现有 seek() 里的 cloneNode 重挂逻辑，
  //    那是为交互用的「重播本场景」，会把动画重置到 0，seek 时是错的）
  // b) 设主时钟 t，顺带更新 S4 的 #gapTimer（它本来就是按主时钟算的）
  // c) 强制样式刷新：getComputedStyle(activeSection).opacity
  // d) 把动画全部接管：
  //    stage.getAnimations({ subtree: true }).forEach(a => {
  //      a.pause();
  //      a.currentTime = (t - sceneStart) * 1000;
  //    });
  // e) await document.fonts.ready; 然后等两次 rAF 再 resolve
};
```

几个必须注意的点，都踩过：

- **`getAnimations()` 只返回当前存在的动画。** CSS 选择器是 `.s[data-active] .rv`，所以必须先设 `data-active` 再强制样式刷新，才拿得到那一场的动画；顺序反了会拿到空数组、画面停在起始态。
- **`CSSAnimation.currentTime` 含 `animation-delay`。** 所以直接设成「场景内已过去的毫秒数」就是对的：某元素 `--d:14s`、场景内时间 2s 时 currentTime=2000，仍在延迟段内，`both` 的 fill 会让它保持起始态 —— 这正是期望行为，不要自己去减延迟。
- **不要用页面现有的 `.paused` 类**（它是 `animation-play-state: paused !important`），那会和 Web Animations API 的 `currentTime` 打架。用 `a.pause()`。
- **`.seg.u` 上有一个 `infinite` 的 blink 动画**，设 currentTime 一样有效，不用特殊处理。

### 2. 加一个录制模式，让舞台正好等于视口

现在舞台是 `width: min(100%, calc((100dvh - 7rem) * 16 / 9))`，在 1920×1080 视口里不会正好铺满。加 `?record=1`：`#chrome` 设 hidden、`body` 的 padding 归零、`.stage` 改成固定 `1920px × 1080px`（`cqh` 单位依赖 `container-type: size` 拿到确定高度，所以要给显式 px，不要用 `aspect-ratio` 推）。

这样 Playwright 视口设 1920×1080 后，`page.screenshot()` 拍到的就是像素级精确的一帧。

### 3. 抓帧 + 合成

- Playwright，chromium 本机缓存已有（`~/Library/Caches/ms-playwright/chromium-1234`），不要再下载。
- **`reducedMotion: 'no-preference'` 必须显式设**：页面里有 `@media (prefers-reduced-motion: reduce)` 会把所有动画压到 `.01s`，无头环境下这个 media query 的默认值不可靠，踩中了会渲染出一堆静止帧。
- `deviceScaleFactor: 1`，viewport 严格 `1920×1080`。
- 8700 帧，`frames/%05d.png`，逐帧 `await page.__renderAt(i / 30)` 再截图。中间产物放系统临时目录或 `.gitignore` 掉的目录，别留在仓库里。
- 字体：截第一帧前 `await document.fonts.ready`。如果无头环境拿不到 Google Fonts，中文会掉到系统字体、排版会变 —— 这种情况下把两个字体下载下来内联成 `@font-face` 的 data URI，别将就。
- 合成：

```bash
ffmpeg -framerate 30 -i frames/%05d.png \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -an \
  docs/binance-7702-video.mp4
```

**不要用 Playwright 的 `recordVideo`** —— 它出 webm、帧间隔不定，正是这个任务要避免的东西。

## 验收标准

1. `ffprobe` 报告：`1920x1080`、`30/1` fps、`duration` 在 `290.00 ± 0.05` 秒、无音频流。
2. 帧数正好 8700。
3. 抽这 9 个时间点的帧，确认落在对的场景、且该场景的元素已按延迟浮现到位：`t = 0, 27.9, 28.1, 77.9, 130.1, 171.9, 212.1, 269.9, 289.9`。特别核对 **S4 的 `#gapTimer` 在 t=130+9.4s 左右应显示 `3:24`**（它从 1.4s 起、8 秒内从 0:00 走到 3:24）。
4. 画面里没有鼠标指针、没有 `#chrome` 控件、没有滚动条、舞台四边没有留白。
5. 原页面的交互行为不许破坏：不带 `?record=1` 打开时，空格暂停 / ←→ 切场景 / `R` 重播 / `H` 隐控件都要照旧工作。

## 环境事实（已核实，不用重查）

- macOS，Homebrew 7.0.9 在 `/opt/homebrew/bin/brew`
- Node v24.16.0
- **ffmpeg 尚未安装** —— 需要 `brew install ffmpeg`
- Playwright chromium 缓存已存在：`chromium-1234`、`chromium_headless_shell-1234`
- 磁盘余量 151 GB（8700 张 1920×1080 PNG 大约占 2–4 GB，够）
- 仓库是 `chuhemiao/portfolio`，分支 `main`。**提交前要我确认**，且不要把 mp4 或 PNG 提交进去。

## 配套文件

- `docs/binance-7702-video-script.md` —— 逐场旁白脚本，每个场景的秒数就是上表那一列。里面最后一节「口径红线」是配音时不能改的数字，渲染时不涉及，但如果你发现画面上的数字和脚本不一致，**以脚本为准并告诉我**。
