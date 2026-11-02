# M3 交付：三语 Library 页面与阅读状态

2026-11-02。本阶段完成 M3-01～06 的代码与轻量验证，采用已确认的人工编辑精选＋B1。实际 Next 全站静态导出、浏览器布局与网络验收受本机限制移至 M4，不能据此宣称完整 G3 或上线验收通过。没有启动开发或预览服务器，没有打开页面、推送或部署。M3 阶段提交已获用户授权，具体提交以 Git 历史为准。

## 实际交付

| 任务 | 已实现的行为 | 证据与限制 |
| --- | --- | --- |
| M3-01 站内只读关联 | 10 个真实文章 translation group 各关联一项 `further_reading`；复用原文章元数据与语言解析，未知目标或错误 translationKey 拒绝 | 20 次实际 Codex editor 操作，10 条 approved；未改 MDX、作者、旧 URL、Research registry 或项目卡片 |
| M3-02 发现与检索 | legacy English＋`zh-CN/en/ja` 列表；静态首屏真实 20 条、总量 100；B1 三语搜索、五类型、主题、原文语言、难度、出版年份、外部推荐日期、排序、分页及 URL 恢复 | Node SSR 三语首屏与纯查询逻辑通过；真实 history、布局、浏览器 p95 留 M4 |
| M3-03 精选详情 | 100 个共享 slug，每个 legacy＋三语共 400 个详情参数；区分编辑题名、原题、原文语言；完整编辑正文、最多三条理由、原始来源、归属及资料状态 | 实际 300 份三语编辑正文和理由逐段 SSR 核对通过；404 路由参数＋4 列表是源码预期，实际导出数量尚未验收 |
| M3-04 本地阅读状态 | 保存/移除、稍后/已读、隐藏/恢复、清空、刷新与跨 tab 恢复；损坏、禁存储、配额不足和失效 ID 的降级提示 | 纯状态与失败路径通过；真实存储事件、BFCache、焦点时序留 M4 |
| M3-05 Topics 与延伸阅读 | 5 个现存 Topic，每个最多 6 项；10 个不同文章组使用真实关系；无关系不显示区块 | 现有源文共 25 个可用语言版本，缺译不扩大翻译；30 个 locale 解析分支均使用实际 fallback，不拼不存在的译文 |
| M3-06 SEO、导航与隐私 | 列表四套 `noindex,follow`；详情三语 canonical/hreflang；legacy English canonical 指向 `/en`；共享 Header desktop/mobile 增 Library；顶部保持一个语言下拉 | 实际生成 sitemap 为 300 个 canonical 详情，0 列表、0 legacy、0 query；真实 HTML/网络留 M4 |

实现沿用已认可的 [首页设计](design/library-home-v1.html)：现站字体和语义颜色、深色/琥珀、细边框、小圆角、资源列表与主题/原创文章侧栏，窄屏单列。没有使用版权封面、模拟数量或外部正文。最终视觉相似度与响应式表现尚未经过浏览器核验。

## 数据与阅读边界

当前为 300 个候选、100 个发布资格资源、300 份已审 locale、10 条文章关系、5 个批准 Topic、1295 个审核事件。社区推荐仍为 0；未读的 80 份资料继续保持 `metadata_only` 边界，20 份规范保留原有固定版本与已核章节范围。原始出版日期/原语言未知时仍显示未知，不用课程年、规范创建日期或编辑复核时间代替。

实际关系审批 actor 为 `codex-library-m3-ui`，role 为 `editor`。理由仅说明延伸阅读用途，不宣称资料作者背书、资料支持文章投资判断，或已通读未读材料。完整命令、revision/content/catalog hash 与源段落定位见 [关系审批记录](../reviews/2026-11-02-m3/relations-review.json)。[历史执行脚本](../reviews/2026-11-02-m3/apply-relations.mjs)只记录本次一次性操作；后续维护继续使用 `library:review` 的 inspect/apply 流程。

除 `item-relations.jsonl` 和 `review-log.jsonl` 外，各 catalog 文件与 M2 HEAD 的 SHA-256 完全相同，含 100 个 item、300 份正文/理由、来源、候选、Topic 映射和评分。没有抓取新来源、调用 Surf、在线 LLM 或外部翻译，也没有补猜资料日期、ISBN、视频讲者或版权权利。

## 所有权与恢复行为

- 磁盘读取由 `scripts/library/public-reader.mjs` 统一进入：取得源目录锁，读取当前 catalog/context，再验证当前公开快照。浏览器不导入 Node fs/crypto、完整博客索引、PROJECTS 或编辑正文详情集合。
- 同一次静态构建进程共享成功快照。首读竞争 `WRITE_LOCKED` 最多等待 10 秒，每次间隔最多 25ms；不破锁、不跳过事务/权利/hash 校验，其他错误立即失败。失败 promise 不永久缓存，文件或锁问题修复后的显式再次读取会重新核验。
- 数据引用 context 只投影真实被引用的目标。审核默认 context 包含旧关系与 replacement 的目标并集，新增/修订不能通过缺失旧目标逃过校验，未知 slug、错误 translationKey 或同 ID 重指仍拒绝。
- 文章语言复用 `getPostMeta` 的 translationKey/sourceSlug/translations 和真实目标语言；Library 只把必要的标题、链接和语言投影到侧栏。没有为单语文章生成假日译或英译链接。
- 本地视图先筛选 ID，再复用 B1 统计和分页，避免保存列表只过滤当前页。行移出当前 Saved/Read/Later/Hidden 视图时回到结果标题；焦点的实际浏览器行为待 M4。
- 无效 URL 参数显示可重置错误；合法但当前已不存在的 facet 值显式标为不可用。交互中的非法日期范围不覆盖上次有效查询，单独提示未应用。搜索和分页回结果标题，筛选控件保留原生语义。

本地状态实际 key 为 `kkdemian:library:v1`，内容为 `{version:1,items:{[id]:{saved,reading,hidden}}}`。`reading` 为 `null | "later" | "read"`；保存和阅读相互独立。只持久化 ID 和状态，最多 1000 个 ID、128000 字符，不存题名、正文、URL、query、用户身份或时间戳。数据保留至用户清空或浏览器存储策略清理，按同一浏览器 origin 共用，没有账号或上传。

损坏/未知版本的数据整份忽略，避免顺序相关的部分恢复。禁存储、写满或清空删除失败时只更新当前页内存，并明确旧持久数据可能在刷新后恢复；只有写入/删除成功才发持久成功消息，失败可重试清空。清空只处理本模块 key，保留主题等其他站点状态。当前公开 ID 集合过滤失效/撤稿 ID，单目标 alias 可合并状态，split 不扩散收藏。Phase0 的点分 key 和时间戳结构是未部署提案，已在 [数据合同](data-contract-v1.md#6-搜索关联与本地状态合同) 中替换为此实现。

## 导航、隐私与 SEO

Library 文档在路径尚未知、解码失败或确认是 Library 时不挂 GA Script。进入或离开 Library 的共享导航、Footer、NotFound 和新文章/Topic 入口使用整页导航，避免上一个文档的 GA 留在 Library。顶部语言菜单继续整页跳转并保留 query/hash。Library 设置 `no-referrer`，外部资料链接使用 `noopener noreferrer`；非 Library 文档初始化 GA 时，如果 referrer 来自 Library，则只保留该 origin 根地址。

搜索、筛选和页码继续写入 URL。直接打开或分享 URL 会把这些参数发送给本站，host 日志保留未知，因此这里不宣称搜索绝对不离设备或全站隐私合规。保存/阅读清单不进入 URL、事件或上传。真正的 collector 请求拦截、整页导航、外链 Referer/opener 和 404/encoded/BFCache 行为必须在 M4 实测。

`content:prepare` 现在按 `content:build → library:build → assets:build` 执行。sitemap 在原 `generate-static-assets.mjs` 的 shard/expected 集合内注册，不建立旁路生成器；RSS 不增加 Library 资源。`check-i18n.mjs` 已加入四套列表/详情的 canonical、语言链接、robots、referrer、单语言菜单与 sitemap 断言，但该检查依赖完整 `out/`，本机未执行。

## 验证结果与修复记录

| 检查 | 结果 | 证明范围 |
| --- | --- | --- |
| `pnpm test` | 292/292，exit 0 | 并发 reader 窄修前的全局回归；其他业务源之后未变 |
| 最终定向测试 | 34/34，exit 0，约 10.65s | 并发修复后，实际临时目录锁、缓存恢复、SSR/正文、关系、原 M1、查询、本地状态及导航 |
| `pnpm typecheck` | exit 0 | 最后 reader/catalog 修复后 |
| 定向 ESLint | exit 0 | 全部变更业务源，随后 reader/catalog 再做 fresh 检查 |
| `pnpm content:check` | 7428 MDX 通过 | 未改源文、三语分组及内容格式 |
| `pnpm test:i18n` | 59/59，exit 0 | 新 Library 路由白名单与既有语言行为 |
| `pnpm library:validate` | exit 0，100 eligible | 当前完整审核集合 |
| `pnpm library:build` | exit 0，约 711ms | 真实 100 项公开快照，不是全站构建耗时 |
| `pnpm assets:build`＋XML 只读核验 | exit 0；300 canonical URL | 实际 sitemap 产物，不是实际详情 HTML |

真实快照 `sha256-ec221e64fcc4214042ecab360e16383079fc0dfc3421efc2b1b7f8714f8c6e8a`：111 文件、590072 原始字节、逐文件 gzip 合计 231660。该数字不是 UI HTML、RSC、JS bundle 或浏览器性能指标。

本次保留的失败与修复包括：

1. 首次关联写入在变更前因全部 7428 条文章投影超过 context 单记录上限而拒绝；真实错误与行为 RED 保留，数据 owner 窄修引用投影和 before/replacement 并集，未提高上限。
2. 损坏本地数据在坏记录前出现的合法记录被误保留；行为 RED 后改为整份拒绝。清空失败原先提前发成功消息，现按真实持久结果通知。
3. 真实临时目录四并发 reader 首轮为 1 成功、3 个 `WRITE_LOCKED`；增加有界等待后四个均消费同一已验证快照，持续锁 10 秒耗尽仍拒绝且不破锁。
4. manifest 首次 ENOENT 后即使恢复文件仍缓存拒绝；真实子进程 RED 后清除失败 promise，第二次读取重新核验成功。坏 hash 和挂起事务继续拒绝。
5. 首轮 SSR 测试误假设 href 必为 anchor 的首个属性；修正测试 oracle，未称产品缺陷。M1 actor 测试把所有后续阶段固定为两个 actor，导致 137/138 通过；已只收窄该 oracle，完整日志 hash 链仍逐项核对。

独立只读 source review 已关闭并发 reader 问题，并核对真实快照、30 个文章 locale 分支、300 canonical sitemap 与其余页面边界；它没有运行实际 Next export 或浏览器。隐私复核与本地生命周期复核按 Main 的独立交接记录留档，不把纯函数/SSR 升格为浏览器通过。

完整命令、SHA 保全、失败历史和证明边界见 [验证记录](../reviews/2026-11-02-m3/validation.json)、[sitemap 检查](../reviews/2026-11-02-m3/sitemap-check.json) 与 [日志索引](../reviews/2026-11-02-m3/README.md)。同模式扫描确认本功能的浏览器存储读写都在 local-state/provider；没有全站 `localStorage.clear()` 或其他清单上传 writer。

M4 仍须完成真实受控远端全站 export、404 个新页面/旧内容检查、实际客户端 bundle/网络、手机与桌面布局、键盘/辅助技术、URL history、禁存储/配额/failed-clear、跨 tab/BFCache 以及撤稿/坏快照/旧产物可达性验收。自动抽取/B2/B3 仍关闭，人类标签与用户实验仍 `not-run`，不补造 F1、precision、NDCG 或 κ。
