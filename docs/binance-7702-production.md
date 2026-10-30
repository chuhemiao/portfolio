# 币安 7702 解说视频制作记录

当前交付：`binance-7702-video.1.2x.mp4`（同步更新 `binance-7702-video.mp4`），1920×1080、30 fps、241.666667秒、7250帧。按用户反馈去除两处AI画面提示并将已认可的画面、配音和音效整体加速1.2倍。原290秒有声版保存为 `binance-7702-video.original-290s.mp4`，原无声母版仍为 `binance-7702-video.silent.mp4`；下面保留初版制作记录及新版重建方法。

## 制作来源

- 叙事与数字：本仓库 `binance-7702-video-script.md` 与配套 HTML，沿用其观察窗口，本轮没有刷新或独立核实事件事实。
- 用户确认修正：26.2 ÷ 56.43 ≈ 46.4%，原稿的45%统一改为“约46%”。
- Fish Audio：已有声音 `kkmian`，Drama 3；逐场生成8段旁白。声音生成稿保存在本地素材目录的 `narration.used.json`，原脚本摘录在 `narration.source.json`。为固定时长压缩表达，保留关键数字、主网边界、外流不等于净损失、根因未获官方确认等限定。
- Fish Audio 音效：生成10秒低调科技氛围音及10秒数字确认/转场素材。后者按14个提示点取片段并淡入淡出，默认低于旁白15dB；氛围音低于旁白23dB，并随讲话压低。
- LibTV：Lib Image 2.5 Pro 生成四种16:9概念素材（金库、签名芯片、区块网络、冻结机制）。保留平台AI生成标识，画面注明“AI概念示意 · 非事件影像”；概念图不作为事件证据。
- IBM Plex Sans SC 与 Mono：官方字体子集内联，保留OFL许可，离线渲染不依赖Google Fonts。

LibTV 项目：https://liblib.tv/canvas?spaceId=13597296&projectId=644e66c382c6404cb1f19c8a29d05bf8

## 本地素材与重建

`binance-7702-media/` 保存实际图片、Fish原始音频、生成稿及SHA256清单。该目录和MP4均已加入gitignore，不提交媒体二进制。PNG帧序列放在系统临时目录。

```bash
# 检查确定性时钟、场景与普通键盘交互
node scripts/render-binance-7702-video.mjs --check-only

# 8700张PNG逐帧截图，再以libx264编码无声母版
node scripts/render-binance-7702-video.mjs --workers 4

# 从持久本地素材重建音频，并给母版加AAC音轨
python3 scripts/mix-binance-7702-audio.py \
  --work-dir docs/binance-7702-media \
  --background docs/binance-7702-media/fish/ambience.wav \
  --background-license 'Fish Audio sound-effects generation for this user-authorized film' \
  --video docs/binance-7702-video.silent.mp4 \
  --output docs/binance-7702-video.mp4
```

覆盖已有产物时显式加 `--overwrite`。脚本在输出验证通过后才发布成片；失败时保留日志。不要用录屏或Playwright recordVideo替换逐帧流程。

## 时间线与验收

|场景|起始帧|帧数|秒数|
|---|---:|---:|---:|
|S1|0|840|28|
|S2|840|1500|50|
|S3|2340|1560|52|
|S4|3900|1260|42|
|S5|5160|1200|40|
|S6|6360|840|28|
|S7|7200|900|30|
|S8|8100|600|20|

每帧直接取 `i / 30`，不累积浮点时间。先激活场景并刷新样式，再暂停Web Animations并按场景内毫秒设置currentTime，保留animation-delay语义；字体和图片解码完成后等两次rAF。

抽帧点：0、27.9、28.1、77.9、130.1、171.9、212.1、269.9、289.9秒；另检查全部场景边界及139.4秒的3:24计时器。检查正反向seek的重复帧哈希、原页面空格/左右键/R/H，录制模式无控件、滚动条、鼠标及舞台留白。

最终probe、连续PTS、完整视频解码、音频时长与响度等证据留存在 `docs/reviews/2026-10-30-binance-7702-video/`。ASR仅辅助核对数字及遗漏，存在术语和日期识别误差，不能替代人工听审；不把机器转写错误自动判成实际配音错误。

## 用户反馈后的最终剪辑版（2026-10-30）

用户确认整体声音没有问题，要求去掉画面左上“AI生成”及右上“AI概念示意·非事件影像”，并将整片加速到1.2倍。本轮复用已认可的配音、音效和内容，不重新配音。

HTML删除8处图注，在图片图层屏蔽左上角标区域；正文、标题和图表不参与此遮罩。后期按原时间线逐帧重绘1920×112顶部补片，与原视频同帧合成，再将视频和所有音轨统一提速1.2倍。声音用atempo保留音高。此处“剪辑版”指本地完成合成的MP4，素材来源仍记录于本制作文件。

```bash
node scripts/edit-binance-7702-video.mjs --workers 4
```

原290秒有声版保存在 `binance-7702-video.original-290s.mp4`；新片为 `binance-7702-video.1.2x.mp4`，验证通过后同步更新 `binance-7702-video.mp4`。1.2倍版为7250帧、30fps、241.666667秒，约4分01.67秒；原无声母版仍保留290秒。重复覆盖新版本需显式加 `--overwrite`，脚本始终从原版重建，避免再次叠加提速。
