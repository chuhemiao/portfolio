# Knowledge Library：M1–M4 实施任务计划 v1

日期：2026-11-02。状态：**待实施的计划**。本轮仅Phase 0审计与规划，没有开始M1。依据新版Prompt、PRD v1.1及[当前源码审计](architecture-audit.md)。

> **执行记录，2026-11-02**：上句及下方原Gate保留Phase 0历史。M1现已完成数据/工具、真实300候选、100项三语编辑精选与本地公开快照，见[M1交付与验收](m1-editorial-delivery.md)。用户已授权常规决策由实施者默认选择，并按M1–M4逐阶段commit；这不授权push或生产部署。
>
> 后续采用PRD v1.1 L665/L687/L746/L802明确允许的**编辑精选＋B1简单检索**降级路径。常规编辑由用户委托Codex执行，审核身份如实记录；未验证的自动证据抽取和B3关闭，不用合成结果证明推荐质量。≥120条人类双盲样本标注与20–30人用户实验均为 **not-run**。来源资格、三语保真、工程回归和M4远端静态export仍为必需。原G2/G4完整实验门槛不能标为通过，报告须区分降级实现与尚未完成的实验。
>
> **M2执行记录，2026-11-02**：本地审核/撤稿/恢复CLI、严格评测输入与120个未标注真实候选样本、108组三语功能题和B1公开快照消费者已实现，见[M2交付](m2-delivery.md)和[操作说明](m2-workflow.md)。三语功能题324/324通过，M1实际数据和public v1保持；自动抽取/B2/B3继续关闭，人类金标与G2完整实验仍not-run。独立增量复核的两项P2已窄修闭环、无未决阻断，按用户授权完成阶段提交后再进入M3。

## 1. 方案评估与范围

采用现站内纯静态模块：本地导入→权利/身份/证据审核→确定性JSON快照→三语Library→Topics/文章只读关联。先保证人工精选和关键词检索可用，再用实验决定是否启用复杂排序。

用户补充无需研究Vercel/Worker工作模式，并记得Worker已移除。因此**不设置Worker归属、部署架构迁移或托管方式确认为开发前置任务**。沿用现有静态部署链，不新增Worker/API或改部署配置。M4只验证远程完整构建及静态产物/缓存一致性；不在Mac运行全量build。

首批300真实候选，至少100已审公开种子，五种资源类型；仅100精选开详情。完整legacy英语+三语会新增404页；候选不自动公开。UI、编辑题/摘要/理由/详情说明三语同步，外部原作保留原语言，不复制未授权正文。原始数据与判断、证据边界不得因翻译/表达优化变化。

当前三项待决策不阻塞M1-01：公开Git允许存放哪些已审元信息及谁审批；真实来源/编辑/双评人员；列表整体noindex或托管层query noindex的SEO取舍。YouTube API补全默认disabled，不将刷新架构变成整个项目的依赖。

## 2. 任务责任和执行方式

- **集成负责人**：主实施agent，独占package.json/锁文件、Schema最终合同、i18n白名单、共享metadata/sitemap/构建入口的合入，负责冲突处理和跨任务回归。
- **数据工程**：负责明确分配的scripts/library和src/lib/library模块、独立测试样例；不批准真实权利。
- **前端工程**：负责Library组件/route及分配的共享UI接线；不改历史MDX或原实体模型。
- **编辑/来源审核人**：站点所有者或明确指定人员；批准真实来源、推荐、三语内容与关系。agent可整理/翻译，不伪造人类批准。
- **独立复核人**：只读检查公开投影、证据/三语含义和回滚边界，不能用自身生成记录代替真实人工金标。

共享工作区默认串行写。只有隔离worktree且不共写合同、fixture、生成目录和共享文件时可并行；集成负责人统一合入/回归，所有执行者必须保留他人改动。以下表中命令除pnpm typecheck/test/test:i18n/content:check/build外均为**planned，脚本尚不存在**；不代表本轮执行通过。

## 3. M1：数据契约与种子（6 tasks）

| ID / 能力 | 负责人、范围与交付 | 前置 | 验收 / 失败与回滚 |
| --- | --- | --- | --- |
| M1-01 发布资格合同与拒绝默认 | 集成+数据；data/library/schemas、types、validate及虚构fixtures；冻结data-contract-v1 | Gate0工程方向 | planned: pnpm library:validate、node --test scripts/library/contract.test.mjs。未知来源/权利/字段/状态/版本均拒绝公开；未审允许null审核但不能发布，每条理由绑定同item的合法依据与revision；fixture非真种子；可整体移除新增模块 |
| M1-02 稳定身份与误合并恢复 | 数据；normalize、identity-history，URL/YouTube/DOI/arXiv/ISBN/work-edition/EIP版本 | M1-01 | planned: identity.test.mjs。同资源去重、不同版本不误并，alias/merge/split有审计；歧义转人工；回退映射，不删历史 |
| M1-03 安全离线导入与恢复 | 数据；JSONL/CSV/manual import，仓库外jobs/checkpoint/DLQ | M1-02 | planned: node scripts/library/import.mjs --dry-run --input <file>、import.test.mjs。默认不写、不联网；hash幂等，中断恢复，失败不推进cursor；撤销未发布批次，不碰public |
| M1-04 来源策略审核与接入闸门 | 编辑批准，集成合入sources；只为已批方法启用connector，其他mock | M1-01 | planned: library:validate rights用例。fetch/store/display/derive/public_git/expiry逐字段批准；YouTube enrichment保持disabled。撤权即取消依赖资格，不把政策研究当批准 |
| M1-05 300候选与100三语种子 | 编辑负责人，agent整理/翻译；五类型、至少五个Topic；保存审核基线和三语差异记录 | M1-03,M1-04 | 300真实候选、≥100初始可公开种子；候选/公开计数分开；编辑题/摘要/理由/精选说明三语审完，溯源完整；不足如实阻塞，不用占位凑数；未审内容不进公开集合 |
| M1-06 一致快照和可重建输出 | 数据+集成；build-index、catalog公共投影、manifest/hash/原子切换 | M1-05 | planned: pnpm library:build、snapshot.test.mjs。仅eligible输出，同输入+as_of同payload，坏输入不覆盖；回滚须符合当前权利，不能复活撤权数据 |

**G1出口**：来源追溯100%、未授权公开0、导入幂等/恢复测试通过、300/100材料与真实审批有记录。实测300条索引<10秒、公开数据<1MB（不含图片），明确设备、输入、raw/gzip口径。M1只有数据和工具，不接UI、不改MDX。

## 4. M2：证据与推荐基线（5 tasks）

| ID / 能力 | 负责人、范围与交付 | 前置 | 验收 / 失败与回滚 |
| --- | --- | --- | --- |
| M2-01 人工金标和检索题集 | 编辑+两名独立评审，另有人/流程裁决；冻结≥120双盲样本与100 queries/相关性判断 | G1 | planned: evaluate.mjs --gold <file>。覆盖语言/类型/主题/长尾；κ或α≥0.65，否则修规范再标；不得以两个agent冒充两个人；金标版本不可覆盖 |
| M2-02 review→publish→takedown生命周期 | 数据+编辑；review CLI、append-only log、revision冲突及审核hash绑定 | G1 | planned: review-lifecycle.test.mjs。未审不可发布、内容改变批准失效、下架跨投影传播；冲突拒绝；恢复只重放合法日志 |
| M2-03 结构化证据与核验 | 数据；无工具权限的离线分类/导入；编辑核验；模型/提示/input hash可溯 | M2-01,M2-02 | planned: evidence.test.mjs、evaluate.mjs --suite evidence。Macro F1≥.85、verified precision≥.98；不足禁用自动抽取，走人工；不编ID/URL，不把confidence当真实性 |
| M2-04 B1/B2/B3排序实验 | 数据；rank、缺失/cluster cap/tie-break、解释与输入快照 | M2-03 | planned: rank.test.mjs、evaluate.mjs --suite ranking。先资格后评分；B1关键词+人工精选，B2独立推荐频次，B3实验；NDCG@10相对B1≥10%且无可信度退化才考虑替换；否则回B1，保留失败结果 |
| M2-05 推荐理由和三语独立复核 | reviewer+编辑；全部公开理由、证据归属/限定、公开边界及排序结论 | M2-04 | planned: library:validate+对照报告。逐条理由的证据/精选ID、item与revision有效；三语reason ID/依据相同，主体/数字/判断一致；mention/批评非推荐；未合格退needs_review |

**G2出口**：真实金标和复测可重现，溯源100%、未授权0，明确选择人工/B1或获验证的算法。重复率≤2%、常规主题Top10同作者≤40%（候选不足注明）；报告Recall@20、来源多样性和推荐证据准确性。算法不足可交付人工精选，但必须记录降级，不宣称自动分类/排序达到阈值；人类审核和来源门槛不得降级。

## 5. M3：三语UI与站内集成（6 tasks）

| ID / 能力 | 负责人、范围与交付 | 前置 | 验收 / 失败与回滚 |
| --- | --- | --- | --- |
| M3-01 站内只读关联 | 数据；relations adapter，Topic.slug、article translationKey/slug、project slug校验与必要投影 | G2 | planned: relations.test.mjs。复用blog接口解析locale，不打包8.9MB索引/PROJECTS；歧义拒绝；可移除adapter，不改旧模型 |
| M3-02 发现入口与检索 | 前端；四套列表route、client/card、导航；集成合入i18n白名单 | M3-01 | planned: search.test.mjs、pnpm test:i18n。中英日查询、全部过滤/排序/分页/URL恢复/空状态，100queries≥95有解释结果或明确空状态；首屏静态可读，p95≤100ms实测；先撤入口再撤route |
| M3-03 精选详情与证据 | 前端+集成；四套详情route、item-view、metadata、真实外链、失效/争议/历史状态 | M3-02 | planned: routes/metadata测试。只有100已审精选，三语共享ID/slug，原题/编辑题/原语言分清，理由≤3；安全链接、未知slug/下架失败状态；不宣称自托管视频 |
| M3-04 本地保存/已读 | 前端；local-state独立模块、版本迁移、收藏接线 | M3-01 | planned: local-state.test.mjs+浏览器交互。保存/移除/已读/稍后/隐藏/清空与刷新恢复；禁存储/损坏/满额降级；不上传清单；回滚只处理本模块命名空间 |
| M3-05 Topics与Further Reading | 前端+编辑；共享Topic renderer、article-view及关系快照 | M3-03 | planned: 关联/渲染回归。≥5 Topics各最多6条、≥10已有文章具真实关联；无关系不显示；不改MDX/旧URL/正文/作者；回滚区块和import即可 |
| M3-06 SEO、三语、可访问性和集成回归 | 集成+reviewer；sitemap统一注册、locale检查、隐私事件方案、移动/键盘/安全状态 | M3-04,M3-05及SEO产品决定 | pnpm typecheck/test/content:check/test:i18n。三语完整、顶部单下拉、canonical/hreflang、无薄页/旧文回归；不采集原始q/清单，隐私规则未核验不启用新事件；一致撤入口/产物/sitemap |

**G3出口**：三语检索/详情/收藏/关联及轻量回归完整；列表robots已有明确决定。当前建议列表统一noindex,follow、精选详情index；这是提案，不能静默改PRD。若采用，sitemap仅300详情URL；若裸列表也可索引且query规则已验证，则303URL。legacy均不重复入sitemap。源码推导404新页面，实际数由M4远程验证。

2026-11-02 实现记录：已确认采用列表整体 `noindex,follow`、详情三语 canonical 的 300 URL 方案。M3 代码和轻量验证已交付，真实全站 export、浏览器网络/布局及交互验收按本机限制移至 M4，不宣称这些检查已通过。详见 [M3 交付](m3-delivery.md)。

内容编辑按AGENTS的三语最小优化/信息保全流程保存基线、复测与对比报告。这里优化原创编辑说明，不翻译受限第三方全文。新增UI的必要浏览器交互测试属于功能验收，不作为内容交付的预览；不为文章启动服务或Mac全量构建。

## 6. M4：受控验证与发布决策（5 tasks）

| ID / 能力 | 负责人、范围与交付 | 前置 | 验收 / 失败与回滚 |
| --- | --- | --- | --- |
| M4-01 远程静态export验证 | 集成；沿用现有远程构建渠道，不研究/迁移托管架构 | G3 | 远程受控pnpm build（Linux可用/usr/bin/time -v），planned check-export.mjs；页数/内存/耗时/JS/404/locale/SEO报告；Mac不跑，失败不提升发布 |
| M4-02 静态撤稿与坏快照演练 | 数据+集成；授权测试环境内撤权/到期/404/坏hash/混版本 | M4-01 | planned check-export.mjs --scenario takedown；HTML/JSON/manifest/sitemap一致，缓存及可达旧产物不继续泄露撤权字段；回滚只用当前合法集合；不引入Worker，不承诺即时撤稿 |
| M4-03 质量报告与隐私指标 | 数据+分析；离线report、既有analytics可用性/事件版本与保留策略核验 | M4-01 | planned report.mjs；counts/rights拒绝/重复/缺失/检索误差可追溯；有权限才验证QDS事件/30min会话等口径，不能确认则标未验证；可关闭新增事件，不建dashboard后台服务 |
| M4-04 真实用户实验 | 所有者/研究负责人招募，agent协助材料分析 | M4-02,M4-03及实际参与者安排 | 20–30人、5冻结问题、交叉随机/难度平衡；可引用率、时长、信心/后验正确率、回访/盲偏好；55%偏好目标、样本不足只探索性；不收持仓、不擅自发招募消息 |
| M4-05 发布决策与交付 | 所有者决策，集成汇总release note/limitations/降级/P1记录 | M4-04 | 零未授权、零严重回归、100%溯源、稳定检索/本地状态、可用静态回滚；可人工精选发布或暂不扩张；commit/push/公开发布仍需用户授权 |

**G4出口**：满足证据和授权后发布既定形态，或明确人工精选+B1降级，或保留阻塞暂不公开扩张。不以代码完成/远程build通过替代产品实验，也不为日期强推B3。生产部署操作不包含在当前Phase0授权内。

## 7. DAG、关键路径和并行

```text
M1-01 → M1-02 → M1-03 ─┐
   └──→ M1-04 ─────────┴→ M1-05 → M1-06 → G1
G1 → M2-01 ─┐
 └─→ M2-02 ─┴→ M2-03 → M2-04 → M2-05 → G2
G2 → M3-01 → M3-02 → M3-03 → M3-05 ─┐
        └──→ M3-04 ─────────────────┴→ M3-06 → G3
G3 → M4-01 → M4-02 ─┐
          └→ M4-03 ─┴→ M4-04 → M4-05 → G4
```

阶段严格M1→M2→M3→M4，不跨Gate合入。来源审核可与身份/导入实现并行；金标与review CLI可并行；local-state独立模块可与检索/详情并行；M4产物演练与指标核验可并行但不共改数据/配置。所有共享文件由集成负责人串行处理；无隔离工作区则全部串行。

关键路径是来源批准→真实三语种子→双评/证据→排序选择→UI集成→远程撤稿演练→真实用户实验。不是只按编码工时决定上线日。

## 8. 逐文件实施与回滚清单

| 文件/目录 | 阶段、变更原因 | 回滚 |
| --- | --- | --- |
| data/library/schemas/*.schema.json、sources及第[data contract](data-contract-v1.md)1节JSONL | M1合同/审核输入，M2补score/evaluation/review历史 | 撤新增文件；已使用ID/history不得悄删，应经数据版本恢复 |
| scripts/library/{validate,normalize,import,build-index}.mjs及*.test.mjs/fixtures | M1校验、身份、离线任务、快照；单一normalize实现供CLI/前端薄wrapper复用，不复制规则 | 撤新增工具和命令，现站不受影响 |
| scripts/library/{review,extract,evaluate,report,check-export}.mjs及tests | M2审核/评测，M4质量/产物验收；无在线服务 | 关实验/采集，保留合法人工输出 |
| src/lib/library/{types,normalize,rank,catalog,relations,search,local-state}.ts | M1类型/快照读取，M2 rank，M3搜索/关系/保存；纯模块与server/build读取隔离 | 先移消费者再撤模块，避免客户端引fs/全索引 |
| src/components/library/{library-client,library-card,library-item-view,library-resources}.tsx | M3列表、详情和站内区块 | 撤入口/import再撤组件 |
| src/app/(legacy)/library/page.tsx、library/items/[slug]/page.tsx | M3默认英语列表/精选详情 | 移引用、metadata/sitemap后撤route |
| src/app/(localized)/[locale]/library/page.tsx、library/items/[slug]/page.tsx | M3三语wrapper、限定静态参数，不产生所有候选详情 | 同上，一致撤三语与legacy |
| public/data/library/v1/manifest.json及snapshots/{id}/*.json | M1构建产物，审核后公开投影；建议生成文件gitignore，源清单可重建 | 恢复当前政策允许的完整快照，禁复活撤权内容 |
| src/lib/i18n.ts、scripts/i18n.test.mjs | M3窄加Library白名单/query/hash兼容 | 先撤入口/URL消费者再撤白名单 |
| src/lib/localized-metadata.ts | M3加/library文案，详情复用dynamic helper | 撤Library项，不改现有SEO |
| src/components/site-header.tsx | M3 NAV一项覆盖桌面/移动 | 删该项，其他入口不动 |
| src/app/(legacy)/topics/[slug]/page.tsx | M3共享render增最多6资源 | 撤Library区块/import |
| src/components/blog/article-view.tsx | M3 Further Reading，只读关系 | 撤Library区块/import，不改正文 |
| scripts/generate-static-assets.mjs | M3把Library分片加入统一expected，避免自动被删除 | 撤分片注册并重新生成一致sitemap |
| scripts/check-i18n.mjs | M3加列表/详情/旧入口产物核验 | 撤Library断言，不降低既有article/alias检查 |
| package.json、必要时pnpm-lock.yaml、.gitignore | M1加library:validate/build等；M3接构建顺序；仅必要验证依赖 | 撤新增script/依赖/生成规则，不改原命令语义 |

构建顺序在M3接线为 `content:build → library:validate/build → assets:build → next build → 既有postbuild检查+Library产物检查`，全部读取本地已审输入。保持content:build独立，不反向加载Library；远程prebuild纳入快照，避免sitemap早于Library生成。现CI用content:prepare时同样应验证快照，具体package接线由集成人员实现测试，不在本轮改配置。

暂不修改：next.config.mjs、vercel.json、CI部署配置、Worker、TOPICS定义、PROJECTS/registry、历史MDX、blog.ts主体、Dock/resume、全站搜索/交易工具。确有新证据需要扩大范围时只重开受影响任务。

## 9. 工期与验证计划

PRD约30天是目标窗口。初估20–30个工程工作日；编辑吞吐量、120条双评、来源审批、20–30人招募/观察另有等待，不能承诺30天必然上线。M1约5–7、M2约5–7、M3约7–10、M4工程约3–6工作日；并行能力和验收失败会改变总量，不用简单相加当日历排期。

现有基线已实测typecheck通过、test154/154、content:check7428通过；这是现站基线，不是Library验收。每个阶段运行适用library tests和typecheck/test/content:check；M3加test:i18n。完整build、静态产物和移动浏览器回归在受控远程环境进行，不启动本机预览或全量构建。LCP p75真实用户目标与实验室结果分列，样本不足不能宣称达标。

Phase0只交付四份文档，另按AGENTS维护会话日志。**首个实施任务为M1-01**：空registry+Schema+deny-by-default+fixtures，不依赖部署、来源采集或SEO折衷。后续按本计划逐阶段实现；本轮不创建UI、抓取器、大产物、提交或部署。
