# Library M1–M4 验收映射

2026-11-03。原需求依据为 [实施计划](implementation-plan-v1.md)、[数据契约](data-contract-v1.md)及已认可设计。本文是实现自检；独立审查与生产批准分开。

| 原任务 | 实现/交付 | 实际证据与状态 |
| --- | --- | --- |
| M1-01 资格合同/拒绝默认 | Schema、严格 parser、validate、公开类型 | [M1](m1-editorial-delivery.md)；M4 坏 hash/版本/期限/权利拒绝，passed |
| M1-02 稳定身份/恢复 | 单一 normalize、identity history、共享 ID/slug | M1 tests；最终四 namespace 各100同 slug，无误造300候选页，passed |
| M1-03 离线导入 | 默认 dry-run、幂等/恢复/不联网 | M1 交付；本轮未新增采集或外部 enrichment，passed（工程） |
| M1-04 来源策略 | 逐字段来源闸门、禁止未授权正文/封面 | M1 已批准本地来源；M4 revoked output 停用，passed；不冒称新法律审阅 |
| M1-05 真实种子/三语 | 300 candidate、100 eligible、五类各20、300 locale、5 Topic | M1 编辑记录；M4 300完整正文/实际100计数，passed；80项仍metadata_only |
| M1-06 一致快照 | 受锁 builder、manifest/currentCatalog/context、hash | M1/M2；M4 111文件/坏artifact/旧批准拒绝/撤稿恢复，passed |
| M2-01 真人金标 | 120实际候选、每类24的冻结协议 | 真人标注0；not-run，不能称κ/precision/F1通过 |
| M2-02 审核生命周期 | inspect/apply/status/recover、角色/hash/revision/事务 | M2；M4实际takedown/合法重审/恢复，passed |
| M2-03 证据抽取 | 人工精选、来源/范围和依据绑定 | 自动抽取disabled；不以metadata_only冒充通读，人工降级分支 |
| M2-04 B1/B2/B3 | B1公开v1同源消费者与解释 | M4功能324/324＋浏览器三语行为；B2/B3/质量优越性not-run |
| M2-05 三语理由复核 | 300理由/完整原创编辑说明、依据与限定 | M1独立编辑复核/M2保持；M4完整静态正文核验passed，非真人双盲金标 |
| M3-01 只读关联 | 稳定Topic/article/project引用、locale真实fallback | M3 source/tests/独立复核；最终article/Topic入口实际browser passed |
| M3-02 发现/搜索 | 四列表、B1三语/过滤/排序/分页/URL | 最终out 23项Browser＋60次warm DOM p95 16.1ms；passed，非RUM |
| M3-03 精选详情 | 100共享slug×4、证据范围、原题/语言/日期精度 | 精确400详情/300canonical，JS关闭可读，未知/撤稿HTTP404，passed |
| M3-04 本地阅读状态 | 保存/移除/稍后/已读/隐藏/清空/降级 | 最终browser与双saved撤稿case passed；BFCache persisted未可靠观察，not-verified |
| M3-05 Topic/Further Reading | 5批准Topic各≤6、10真实文章组 | M3批准事件与真实fallback；M4撤稿两group/相关Topic一致移除，passed |
| M3-06 SEO/三语/访问性/隐私 | 单语言菜单、noindex列表、300详情sitemap、GA隔离/整页边界 | 静态/实际网络/键盘/焦点passed；旧全局404及预取404限制见M4 |
| M4-01 远端完整export | 实际pnpm build、Linux资源、全部旧文及新增页 | 第6完整exit0＋恢复完整exit0；真实artifact digest/原日志，passed |
| M4-02 撤稿/坏快照 | VM真实撤稿、99→100、4详情/关联/data/sitemap | withdrawal报告passed，11baseline字节相同；生产CDN/旧部署purge未执行 |
| M4-03 质量/隐私指标 | 离线功能/性能、真实collector拦截与正控 | 功能324/324；无Library collector/本地清单写请求；QDS/retention/RUM not-run |
| M4-04 真人实验 | 五题协议、随机/评审/数据记录材料 | [协议](user-study-protocol-v1.md)准备；参与者0、not-run，无55%或效率结论 |
| M4-05 交付/回滚 | 来源绑定、失败保存、操作说明、限制、资源清理 | [M4总结](m4-delivery.md)及校验/stop记录；人工+B1既定形态，生产发布未授权/未执行 |

G1 工程/编辑交付已有阶段证据；G2 选择人工+B1降级，不称完整真人/算法实验通过。G3真实静态/交互/隐私已执行，BFCache单列未验证。G4提供有条件的人工+B1交付材料；真人实验和生产发布仍not-run。不能把阶段名字或commit数当成这些未执行事项已完成。

## 变更反向核对

| 本轮变化 | 对应原要求与必要原因 |
| --- | --- |
| contract/snapshot两份静态Schema import、schema-loader test | M1-01/M1-06/M4-01：同一严格合同支持真实Node CLI与Turbopack消费；不更改Schema字节 |
| validate/public-reader/catalog与context/reader tests | M3-01/M4-01：server提供真实静态站内模型，保默认CLI root语义、未知引用/事务/hash拒绝 |
| tsconfig仅exclude out、实际compiler正负控 | M4-01：生成物不回流源输入，真实src错误仍拒绝，不忽略build errors |
| header语言oracle/helper/双菜单负控 | M3-06/M4-01：保单可见菜单要求，识别框架hidden streamed结构 |
| check-export与VM Browser/撤稿QA入口 | M4-01/02/03：真实产物/网络/状态/失败证据；只作受控验收，无服务后台或产品框架 |
| M4报告/矩阵/研究协议/session | M4-04/05：可追溯交付、诚实not-run、撤稿/回滚与资源归属 |

没有修改历史 MDX/作者/URL、Research registry、source catalog、版权正文/封面、Worker/API/DB、hosting/deployment配置或产品算法；没有为了验收新增在线LLM、翻译、自动事件、隐藏中转或实验参与者。out、生成JSON、截图、压缩patch和测试VM数据不入Git。
