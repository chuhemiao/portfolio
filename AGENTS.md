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
  pnpm sync:oscillator # 刷新 Oscillator 市场与历史快照
  pnpm sync:watch     # 刷新 Watch 市场与上市快照
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
- **多语言 UI**：全站只保留顶部一个语言下拉菜单，文章页不重复提供语言切换控件。
- **新增内容**：每次新增 Blog、Research、Thoughts 等内容，默认同时完成 `zh-CN`、`en`、`ja` 的标题、摘要和完整正文，设置语言分组并检查三语切换；不能只翻译界面、摘要或创建空白占位。新增研究和思考还须执行下方的三语优化与一致性流程。
- **内容交付**：内容完成后无需启动或打开页面预览；保留必要的内容、语言分组和构建检查。
- **代码**：不要加不必要的注释、docstring、type annotation；不要过度封装
- **包管理**：使用 pnpm，不要用 npm 或 yarn
- **提交**：需要我确认才提交，不要自动 commit
- **Crypto 数据源**：默认不调用 Surf skill/API（用户已无免费 API 额度与速度）。优先使用用户提供材料和仓库本地数据；确需刷新外部数据时，根据任务选择 CoinGecko、CMC、交易所 API、DefiLlama、官方文档或网页搜索。只有用户明确要求时才调用 Surf。

---

## 新增研究与思考：三语优化与一致性流程

适用于新增 Research、Thoughts 及后续修订。默认一轮完成三语成稿、表达优化、复核和报告，无需每次再询问是否执行；用户明确要求“只检测”或“先给报告”时，按该范围交付。

1. **保留基线**：以用户原始材料及已确认的修订为事实和判断基准，保存原稿或优化前初稿。先本地查重、确定分类，再完成三语标题、摘要、完整正文和语言分组；Research 按仓库现有流程同步 Research Map / registry，Thoughts 不因此新增项目卡片。

2. **三语同步优化**：采用 `lieflat-less-ai-tone` 的最小改动、信息守恒、结构保留原则。中文执行脚本检测和逐条语义复核，保存改前、改后结果；英文和日文按各自语法和自然表达同步优化，不套用中文正则、每千汉字阈值或 AI 评分。原译已自然且含义一致的句子可保留，不强行逐字对应或为了降低计数改写。

3. **保留数据与原有判断**：保留金额、单位、币种、百分比、日期、观察窗口、公式、来源、事实主体、因果与比较方向。保留“可能”“假设”“未核实”“非预测”等判断强度和证据边界，不把收入、利润、现金流等不同口径混同。表格、清单、引文和必要否定不得为去 AI 味而删减，不新增未经材料支持的事实或结论。

4. **检查三语内容一致性**：逐段核对完整性、标题层级、表格与公式、功能清单、结论、来源归属及语言分组。核对金额单位换算、日期本地化、年化与实际期间、`>` / `≥` 等门槛与比较关系，不能只看数字数量或段落数量。发现既有误译时依据原文或已确认口径窄修，并在报告中单列说明；不擅自改变原有判断。

5. **复测与保真复核**：优化后复测，逐处核对原文、新文、修改理由及保留边界；条件允许时安排独立复核。确认没有遗漏正文、数据、专名、来源、限定条件或功能项，没有为节奏调整而拆散论证、目录或表格。保留误报、必要专业表达和正常清单的说明，不宣称所有原始命中都应清零。

6. **完成必要检查，不预览**：执行 `pnpm content:check` 和 `pnpm build`，检查三语语言分组、对应链接及内容产物；可只读核对生成的静态文件。不要为内容交付启动开发服务器、预览服务器，或打开浏览器/页面预览。遵守不自动提交、部署的现有偏好。

7. **交付对比报告**：在 `docs/reviews/` 留存原稿或初稿基线、修改记录和检查结果，提供三语一致性汇总及各语言优化前后的可追溯对比。交付时简要说明修改范围、数据与判断保全结果、必要的误译校正和检查结论，并链接报告。

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

- **2026-11-03**：完成Library M4工程验收与交付材料：4CPU/8GiB临时private VM、实际Ubuntu26/Node24.22.1/pnpm10.29.3/Next16.1.1；固定BASE+M3+精确patch，22本机/远端文件SHA一致。保前五失败（URL brand、动态站内模型import、死worker锁、hidden菜单oracle、out TS输入），窄修两集成seam/检查器及tsconfig仅exclude out；第六完整pnpm build155s真正exit0，8234Next页/7428legacy，400详情+4列表、仅300canonical、300完整三语正文；进程树峰3.63GB/cgroup含cache峰7.93GB，OOM0。真实撤稿99→100，两次完整build与hash/混版/期限/撤权拒绝、四详情HTTP404、article/Topic/list/data/sitemap一致；退役saved ID移除且另一有效saved/read保留，11VM baseline文件逐字节恢复，Mac catalog/MDX未改。最终恢复out Browser23/23、三语60次DOM p95 16.1ms、页面脚本错误/hydration0；146 console含142旧segment预取404、2未知详情404、2被拦GA collector。Library无GA与清单写请求，跨边界整页/referrer/noopener实测；直接GET q仍到本站host。BFCache not-verified、真人120样本标签0/20–30人研究未跑，人工+B1、自动抽取/B2/B3关闭；不称完整G2/G4实验或prod CDN purge。最新68证据182297B整体SHA下载核验，VM stop后get_session确认为stopped/routes空，无server/browser/锁/txn；只读交付审查无阻断。报告docs/library/m4-delivery.md、acceptance-matrix-v1.md与reviews/2026-11-02-m4，研究协议已备；受影响Node73/73/type/lint通过，未本机全build/预览、push或部署，阶段commit沿用户本任务授权。

- **2026-11-02**：完成Library M3本地实现：legacy+三语列表/100共享slug详情（源码404新页），B1搜索/筛选/排序/分页/URL恢复、本地保存/稍后/已读/隐藏/清空；实际key kkdemian:library:v1仅ID/状态，损坏整份拒绝、失败清空不冒报持久成功。10真实文章组20次Codex editor审批/10approved，5Topic各≤6；原100item/300正文与其余catalog文件SHA同M2。Library文档不挂GA、跨边界整页导航、no-referrer及离开referrer清根；列表整体noindex，实际sitemap仅300canonical详情。真实并发reader RED1成功3锁拒→有界等待全过，持续锁耗尽不破锁；rejected promise修复后可显式重读，事务/hash拒读保留。数据owner修7428全投影超限为精确目标+before/replacement并集。全局292/292（并发窄修前）、最后定向34/34、fresh typecheck/ESLint、7428内容、i18n59、library validate/build/assets通过；111文件590072raw/逐文件gzip231660，不代表UI bundle/浏览器性能。报告docs/library/m3-delivery.md与docs/reviews/2026-11-02-m3/；实际Next全export、浏览器网络/layout/history/focus/存储时序与完整G3验收留M4，本机未全站build/preview/开页/push/部署；M3阶段提交已获用户授权，通用提交确认偏好不变。自动抽取/B2/B3及人类实验仍关闭/not-run。

- **2026-11-02**：完成Library M2本地软件：review/revise/publish/takedown/restore CLI默认dry-run，实际actor/role声明、三重hash/revision冲突、幂等、目录锁与显式事务恢复；reader防半状态/快速提交混读，build与撤稿同锁。B1纯公开v1消费者和108组三语功能题324/324通过；120真实候选协议无真人标签，F1/precision/κ/NDCG/Recall保持null/not-run，自动抽取/B2/B3关闭。独立复核所见staging中断恢复用精确receipt闭合，长中日query尾部ID丢失以真实70/64误返RED→0修复，保留q≤200；已知ERC7702仍命中。M1全部catalog字节及300三语正文/理由不变，100资源/111公开文件587431raw字节、逐文件gzip230723；实际library:build约3.42s（与阶段检查并行），Node本地搜索p95约0.234ms不代表浏览器/真人效果。Library115/全局269、7428content通过；最后搜索窄修后consumer10、typecheck、ESLint与实际eval通过。报告docs/library/m2-delivery.md、m2-workflow.md与reviews/2026-11-02-m2/；M3/M4及人类实验未完成，未全站build/预览/push/部署。用户已授权本Library逐阶段commit和常规默认取舍；通用提交确认偏好不变。

- **2026-11-02**：完成Library M1数据与工具：真实300候选、100已审三语编辑精选（五类各20）、300完整locale、100editorial selections、0社区推荐；138 Topic建议79批59拒，覆盖5既有Topic。20规范绑定实际commit/文件hash与已读章节，ERC8004保留Draft；其他80仅metadata_only，原创阅读问题不冒充未读结论/作者背书。原metadata及9源投影hash保全，实际Codex字段/编辑身份和1275事件链；独立读完100×3后窄修2处JA（客户反馈主体、暗号プリミティブ），两item/六locale版本与批准重绑。真实快照111文件/587431原始字节/逐文件gzip合计231044，显式currentCatalog/context读回及同输入/asOf字节复建通过；首轮并行检查中2.19s、单独复建0.64s，与虚构300基准分列。fresh Library89/全局243/typecheck/7428content/定向ESLint通过；只跑library:build，未全站pnpm build/预览/push/部署。交付在docs/library/m1-editorial-delivery.md及reviews/2026-11-02-editorial/。用户本次明确授权M1–M4每阶段commit、常规取舍默认选择；仅本Library任务，不改通用提交确认偏好。后续采用PRD允许的编辑精选+B1，未验证自动抽取/B3关闭；≥120人类双盲样本与20–30人用户实验not-run，不冒称G2/G4通过，M4远端export仍须做。

- **2026-11-02**：按用户要求先提供Library首页效果图，已生成docs/library/design/library-home-desktop-v1.png（2880×3106）和library-home-mobile-v1.png（860×3610）；独立HTML/CSS源稿、README与render-checks.json同目录。沿用现站深色/琥珀/IBM Plex/细边框，桌面列表+主题/原创研究侧栏、手机单栏，顶部单一语言下拉；突出类型/原文语言/为什么读，示例内容和100条数量已明确为设计占位，不代表来源批准或真实入库。仅离线文件渲染，外网请求被阻断，字体加载/两尺寸零横向溢出/零脚本错误通过，目视修复手机标题孤字与筛选布局。未开始M1或M3业务实现，未启动网站/全量build/提交/部署，保留前轮四份审计计划。

- **2026-11-02**：按新版Library Phase0 Prompt与PRD v1.1完成源码审计和M1–M4实施规划，四文档在docs/library/；本轮仅文档、未业务开发。当前HEAD62ea8ba、7428MDX、3082文章组、2822项目/12主题；100精选含legacy及三语新增404页，候选300与公开100分开。已核真实article-view渲染、slug/translationKey关联、sitemap统一expected及静态query noindex限制，拆22任务/4阶段Gate。用户补充无需考虑Vercel/CloudflareWorker工作模式、记得Worker已移除；按纯静态、不新增或依赖Worker、不改部署配置收窄，M4只保留远程构建和静态产物验收。只读已见Vercel当前HEAD生产READY及Cloudflare前置响应，未延伸平台调查。来源逐字段deny、YouTube API补全默认禁用、三语原创编辑说明完整且不复制外部全文；真实来源/人工审批及双评/用户实验不能由agent假冒。typecheck、154测试、7428内容检查通过；未全量build、启动预览、采集、提交或部署。

- **2026-10-30**：按用户要求生成7702最终1.2倍版中文字幕SRT：docs/binance-7702-video.1.2x.zh-CN.srt，75条、UTF-8、无重叠、最多两行，首0.397s末241.094s。69段校正口播去标点/空格与原稿逐字保全、8源音频SHA一致；以最终AAC音轨用已有本地Whisper-small/CTranslate2强制对齐，原ASR经混音裁切/变速及1.2倍换算作窗口锚点，不按字数均分。保留56.43亿美元/0.000414/1,258,562 gas/46%等数值、nonce/Type-4/EIP术语及非净损失、主网、根因未确认限定；USD1 2700万美元分隔避免连读歧义。编号/时间/格式/全文回拼/关键数据复核通过，报告在docs/reviews/2026-10-30-binance-7702-subtitles/。用户已将.1.2x.mp4移至桌面，本轮用同SHA782b1486…b792的docs主文件对齐，未修改或重新输出视频、未烧录/上传字幕、未自动提交。保留其他对话新增文章改动。

- **2026-10-30**：为7702视频制作YouTube发布包：以原LibTV金库意象用内置imagegen生成黑金封面“一条签名 / 56亿外流？”，无AI提示，导出1280×720 JPG337051字节；提示词/原图和三语元数据TXT/JSON在docs/binance-7702-media/youtube/，完整文案在docs/binance-7702-youtube.md。中文主标题保留疑云与外流非净损失，三语56.43亿美元=5.643B=56.43億ドル、25亿美元单笔/46%/chain_id1/2026-10-30 00:30UTC限定一致；8章节按1.2x映射0:00/0:24/1:05/1:49/2:24/2:57/3:20/3:45。四条站内延伸阅读HEAD200，官方YouTube缩略图与章节规范只读核对。用户曾授权在已上传YouTube窗口代填并发布，已识别kk德米安频道、EYf4lQBcC1w、1.2x文件/4:02/私享；但扩展超时、原生焦点不可靠且坐标报noWindowsAvailable，未完成元数据/封面写入，未点击公开发布。用户后改为手动复制文案；按手动交付停止UI操作，状态如实留档，未将私享链接说成已公开。未提交或部署。

- **2026-10-30**：按用户试听反馈“整体声音没有问题”，完成7702最终1.2倍剪辑版：去8处右上AI概念图注，对图片图层裁左上角标（不遮正文），逐帧重绘顶部112px与原片同帧合成后整体A/V同步1.2倍、音高不变。新版1080p30fps/7250帧/241.666667秒，保留原290秒有声及无声版，主文件与.1.2x另存均更新。两次编码尾帧7249校验失败均未发布，复用8700补片，仅在fps后补尾帧再trim7250、显式帧数而非浮点-t终止，经完整时间线小样及正式验收通过。连续PTS/全音视频解码/10点抽帧、标题和接缝视检及独立复核通过；新输出SHA782b1486…b792、旧版7cd5e9cf…fe60。新增scripts/edit-binance-7702-video.mjs及docs/reviews/2026-10-30-binance-7702-video-edit/记录；素材与MP4继续gitignore，未提交或部署。

- **2026-10-30**：完成币安7702本地解说视频：Fish Audio kkmian/Drama3八段配音、氛围与14提示音，LibTV四类16:9概念图保留AI标识；确定性WAAPI时钟与1920×1080录制模式、字体离线子集零系统回退、原空格/左右/R/H交互通过。用户确认45%改约46%，画面/脚本/口播同步；S2等待与S1/S4浮现对齐脚本，修S7嵌套加粗字号。8700PNG逐帧抓取后H264慢预设CRF18编码，配音版MP4约29.1MB与无声母版均290.000秒/30fps/8700帧，最终连续PTS与音视频全解码通过，AAC48k立体声，-16.01LUFS/-1.49dBTP。S6零位ASR歧义后逐位补录识别0.000414；S1月份仍有ASR歧义，明确未人工听审，未冒称全数词听审通过。背景循环首尾0.2s淡化并实测接缝降至0.000029。制作说明文字中途更新触发源保护，已重建原稿SHA、复核HTML/图片/8700帧后复用帧编码，恢复原因如实留档。生产脚本与说明、docs/reviews/2026-10-30-binance-7702-video/证据已保存；MP4及docs/binance-7702-media原素材被gitignore，临时PNG在系统目录。未自动提交、推送或部署。
