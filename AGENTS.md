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

- **2026-10-30**：为7702视频制作YouTube发布包：以原LibTV金库意象用内置imagegen生成黑金封面“一条签名 / 56亿外流？”，无AI提示，导出1280×720 JPG337051字节；提示词/原图和三语元数据TXT/JSON在docs/binance-7702-media/youtube/，完整文案在docs/binance-7702-youtube.md。中文主标题保留疑云与外流非净损失，三语56.43亿美元=5.643B=56.43億ドル、25亿美元单笔/46%/chain_id1/2026-10-30 00:30UTC限定一致；8章节按1.2x映射0:00/0:24/1:05/1:49/2:24/2:57/3:20/3:45。四条站内延伸阅读HEAD200，官方YouTube缩略图与章节规范只读核对。用户曾授权在已上传YouTube窗口代填并发布，已识别kk德米安频道、EYf4lQBcC1w、1.2x文件/4:02/私享；但扩展超时、原生焦点不可靠且坐标报noWindowsAvailable，未完成元数据/封面写入，未点击公开发布。用户后改为手动复制文案；按手动交付停止UI操作，状态如实留档，未将私享链接说成已公开。未提交或部署。

- **2026-10-30**：按用户试听反馈“整体声音没有问题”，完成7702最终1.2倍剪辑版：去8处右上AI概念图注，对图片图层裁左上角标（不遮正文），逐帧重绘顶部112px与原片同帧合成后整体A/V同步1.2倍、音高不变。新版1080p30fps/7250帧/241.666667秒，保留原290秒有声及无声版，主文件与.1.2x另存均更新。两次编码尾帧7249校验失败均未发布，复用8700补片，仅在fps后补尾帧再trim7250、显式帧数而非浮点-t终止，经完整时间线小样及正式验收通过。连续PTS/全音视频解码/10点抽帧、标题和接缝视检及独立复核通过；新输出SHA782b1486…b792、旧版7cd5e9cf…fe60。新增scripts/edit-binance-7702-video.mjs及docs/reviews/2026-10-30-binance-7702-video-edit/记录；素材与MP4继续gitignore，未提交或部署。

- **2026-10-30**：完成币安7702本地解说视频：Fish Audio kkmian/Drama3八段配音、氛围与14提示音，LibTV四类16:9概念图保留AI标识；确定性WAAPI时钟与1920×1080录制模式、字体离线子集零系统回退、原空格/左右/R/H交互通过。用户确认45%改约46%，画面/脚本/口播同步；S2等待与S1/S4浮现对齐脚本，修S7嵌套加粗字号。8700PNG逐帧抓取后H264慢预设CRF18编码，配音版MP4约29.1MB与无声母版均290.000秒/30fps/8700帧，最终连续PTS与音视频全解码通过，AAC48k立体声，-16.01LUFS/-1.49dBTP。S6零位ASR歧义后逐位补录识别0.000414；S1月份仍有ASR歧义，明确未人工听审，未冒称全数词听审通过。背景循环首尾0.2s淡化并实测接缝降至0.000029。制作说明文字中途更新触发源保护，已重建原稿SHA、复核HTML/图片/8700帧后复用帧编码，恢复原因如实留档。生产脚本与说明、docs/reviews/2026-10-30-binance-7702-video/证据已保存；MP4及docs/binance-7702-media原素材被gitignore，临时PNG在系统目录。未自动提交、推送或部署。

- **2026-10-29**：按用户要求将 Anthropic 三语优化流程固化到 AGENTS.md，作为以后新增研究、思考及修订的默认标准：一轮完成三语全文、最小表达优化、数据与原判断/限定保全、逐段及单位/门槛一致性核对、复测与保真复核、内容/构建检查和对比报告。中文检测结果留档，英日依各语言自然表达，不移植中文统计或强行逐字同构；原译自然可保留，既有误译窄修须单列。用户明确只检测/先报告时遵守范围，常规新增无需再问是否优化。明确不启动开发/预览服务器、不打开页面预览，可只读校验静态产物；不自动提交/部署。仅修改说明文件，保留前轮文章与报告改动。

- **2026-10-29**：按用户授权同步优化 Anthropic IPO 英文16处、日文17处，中文本轮保持已修订基准不动。完整读三语并独立基线/最终审查；25个中文映射EN16改9自然保留、JA15改10保留，另JA271风险直译/659主谓窄修，JA194仅は→を。英文198旧above $1M严格>修正at least $1M为≥，与中文“达到100万美元以上”及日文“100万ドル以上”对齐；单列为既有门槛译法校正，超过500/年化/2026年2月公告不变。337/320/337数字片段各语种前后同序、41百分比跨语同序、226表格单元数值经月份规范化一致；57显式币值行规范化及6共享词尾/范围手核通过；679行/空行、51标题、13表/78语法行、32来源、2URL、元数据、清单/引文/公式均保留。FinOps与评估治理两组六功能、原判断/可能性/财务/义务/治理/安全/合成产品边界一致，独立审查无未关闭问题。不移植中文检测统计到英日。新报告目录 docs/reviews/2026-10-29-anthropic-trilingual-tone/，comparison.md汇总三语映射，comparison.en.md及comparison.ja.md为完整增删对比，可重建前后正文；JSON/指纹/保全与审查留档。content:check7317MDX、完整build7412页含TypeScript及7317跳转、三语静态产物全部33改段及对应语言链接只读校验通过。未联网/翻译服务/Surf，未启动或打开预览、提交或部署。

- **2026-10-29**：用户接受 lieflat-less-ai-tone 改前方案，完成 Anthropic IPO 中文研究28检测点/25位置局部改稿；保留337数字片段顺序、英文专名/标识符计数、679行与空行、51标题、13表、全部列表/引文/公式/2URL/32来源及语言分组。翻案正则6→0、句首路标3→0、当时构式1→0、密集并列37→35（余为已审专业清单）、长定语4→3（2误报1专业组合）、结论冒号3→0、因果不清1→0、正文分号18→9；语义复测318候选全部标注或同文本沿用，重命名仍1有信息改称、同构三连0，真实相邻链5不变。独立保真审查修正L34“不只体现”弱预设为“不能仅用…定义”，L526维持重点比较不添加估值否定，L596六功能完整。改前10258/改后10240汉字；已用skill report.py及同差异函数生成 comparison.md 指标/逐处规则/全文增删对比，原始及复测JSON、日志和独立审查均留档；增删对照可重建前后正文段落序列。content:check7317MDX、完整build7412页（含TypeScript）及7317跳转通过，静态CN正文/三语链接只读校验通过。仅改中文表达，未新增/改判金融事实、未改英日正文、未联网核实/预览/提交/部署。

- **2026-10-29**：按用户要求使用新装 lieflat-less-ai-tone 对最新 Anthropic IPO 中文研究只做改前检测，未改三语正文。正文10258汉字、219脚本文本块/51标题；保留完整源文件与正文原始JSON，默认候选截断后163条另存，全量323条（rename127/cohesion153/colon43/iso3零）全部逐条闭集判读。拟改28检测点合并25原文位置，含9处分号；6正则翻案句+2人工长距离补充、1条件/1长名词壳、3连接词、2功能罗列、3结论冒号及1因果衔接。32来源冒号、各类X特征、必要技术/财务清单保留；HTML/S1改称有载体与文档作用，未收窄原始文件指代。衔接最长原始9接口，排除结构6、严格实际相邻5，未为降低指标破坏结构；43冒号最终3结论提示，L212严格排除。完整报告与可追溯逐条档案在 docs/reviews/2026-10-29-anthropic-ai-tone/；校验323原字段完整、闭集标签、原文位置及SHA256不变。仅交付检测报告/局部建议，等用户后续决定是否改写；未联网核实金融事实、未预览/构建/提交/部署。

- **2026-10-29**：按用户指定 GitHub 仓库 `larashero3-dotcom/lieflat-less-ai-tone` 安装同名 skill，使用系统 skill-installer 的 GitHub 安装脚本，从 main 根目录安装至 `/Users/chuhemiao/.codex/skills/lieflat-less-ai-tone`。已检查 SKILL.md、检测协议、语义判据与检测/报告脚本存在，Python 脚本只做 AST 语法校验、未执行；本轮未对网站文章运行检测或改写。下一轮可使用，未提交项目改动。

- **2026-10-26**：按用户长稿新增 research「Anthropic: IPO 财务、算力承诺与估值研究」，canonical `anthropic-ipo-s1-ai-capital-structure-valuation-research`，补齐 `-en`、`-ja` 完整标题/摘要/正文，各51目录标题、13表（65表行）、2原始直链、32来源标注。915行粘贴稿的图标/来源+计数/图坐标/数字卡片/复制按钮整理为文字和表格，保留实质段落、7判断、5社区争议、5创业方向与8尽调指标，转义LaTeX改可渲染公式；季度Q1=4.69B、P/S46.0/61.4与22.3/29.8、2030现值.24/.95/2.34T及反向262/350B与40.6/51.0%复算通过。IPO/S1/拟ANT、新闻明细、199条HN快照均明确按原材料陈述，本轮未读取完整S1或外部核实；媒体图标不当证据链接，未补造缺失报道URL。保留FV损失非现金、.693B经营亏损非全部现金烧钱、多年算力承诺不同口径不可加/非年费、47%渠道非cloud自买、受控安全非生产事故、蒸馏属公司主张及简化估值非完整DCF等边界。新增独立Anthropic公司AI/AN卡片及三语说明，旧PreStocks合成项目保留独立；Map2822、registry2844仅源文1项，标题ASCII冒号避免旧解析器把IPO误作symbol，新symbol为空，未确认拟股票代码不入卡。27专项测试、局部ESLint、logo检查、独立三语全文/数字/URL/分组审查、content:check（7302MDX）、完整构建（7397页含类型检查）、66语言入口/全部正文/三语feeds及7302旧地址跳转只读校验、新文正文/51目录/13表/2链接/三语映射/唯一索引与diff检查通过。最新100深度诊断9pass/91needs-upgrade，新三语如实待增强（EN6425words但仅2直接证据链接）；旧sync:research插入点仍失败，已直接更新实际数据源。保留前轮Reality未提交改动，未调用Surf/外部翻译服务，未执行投资或自动跟踪，未预览、提交或部署。

- **2026-10-24**：按用户材料新增 research「Reality：Bitget 美股代币化、分发与托管风险研究」，canonical `reality-bitget-tokenized-equities-rtoken-distribution-custody-risks`，补齐 `-en`、`-ja` 标题/摘要/完整正文，各6标题、5表、14次引用（11独立URL）。Reality Finance与旧RealityMetaverse/RMV为不同项目；新增唯一RWA卡片及三语说明，Map2821、registry2843只计源文1项，未虚构平台币或logo。保留9/24发行方AUM与10/24 rSPCX窗口/赛道总量非同日、经济受益非直接持股、无投票/30%预扣、注册非证券注册、SIPC不自动覆盖rToken、SPV权利及rawbalance/multiplier与一股口径张力。原材料Bitget被盗/停提/恢复与地区访问记录明确归属且本轮未独立核实；链上流动性推断非官方交易拆分、未找到平台币非证明永无。独立审查指出>50M起点不能证明17天翻倍，三语已改>50M至约114M、128%仅50M参考，不能确认翻倍；7月至9月约42%/80天及同行合计份额核算一致，250M年底门槛非承诺。27专项测试、局部ESLint、logo检查、独立全文/数值/URL审查、content:check（7299MDX）、完整构建（7394页含类型检查）、66语言入口/全部正文/三语feeds及7299旧地址跳转只读校验、新文正文/6目录/5表/14引用/语言映射与唯一索引及diff检查通过。最新100深度诊断10pass/90needs-upgrade，新Reality三语如实待增强；旧sync:research插入点失败，已直接更新真实数据源。未调用Surf、外部翻译服务或独立联网核实，未执行文内建议，未打开预览、提交或部署。
