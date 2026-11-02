# Library 数据契约提案 v1

> **当前交付入口（2026-11-02）**：[M1交付与验收](m1-editorial-delivery.md)。本文保留M1-01及后续子阶段形成时的说明，开头“来源为空”和末尾“下一步编辑”是历史切片状态。现有真实300候选、100项已审三语编辑精选；运行时资格以当前catalog和`library:validate`为准，不把历史文字当作最新计数。

日期：2026-11-02。M1-01 已将本契约实现为 Schema、运行时校验器、类型与虚构测试样例；真实来源清单仍为空，未创建公开快照，M1 全阶段尚未完成。JSON/JSONL 为唯一 P0 数据层，不使用数据库 DDL、Worker 或运行时 API。

## 1. 通用类型与文件

统一 `schema_version: "1.1.0"`，解决 PRD 示例中1.0.0/1.1混用。主版本不兼容拒绝读取；未知小版本默认拒绝，须有兼容测试才允许；破坏语义升级 `/v2/`。采用 JSON Schema Draft 2020-12，权威文件为 `data/library/schemas/catalog.schema.json`；运行时使用 AJV 8.20.0 的2020实现与 ajv-formats 3.0.1，禁用类型转换、默认填充和额外字段删除。

对象 `additionalProperties:false`；下列字段除标可空/可选外均必填。UTC时间为RFC3339 Z；日期为YYYY-MM-DD；数值有限，拒绝NaN/Infinity。实体均有schema_version，更新实体有revision≥1。JSONL每行一个实体，按ID稳定排序。

item ID为首次导入分配的不可变`lib_`+32位小写hex，不随标题、语言或canonical修订重算。slug为ASCII可读段+ID前8位，碰撞扩长并记录；发布后冻结。同资源三语共用ID/slug。具体Schema文件位于`data/library/schemas/`，测试样例单独放`scripts/library/fixtures/`并标虚构。

| 拟新增文件 | 含义与公开边界 |
| --- | --- |
| data/library/sources.json | 来源策略数组，只含可公开政策和审批标识 |
| data/library/candidates.jsonl | 有权公开Git的有限候选元数据；其余候选留仓库外 |
| data/library/items.jsonl | 规范资源、生命周期和审核，不直接作为客户端输入 |
| data/library/item-locales.jsonl | 三语原创编辑题、摘要、解释与详情说明 |
| data/library/evidence.jsonl | 允许留存的证据与溯源；不存未经许可raw或个人映射 |
| data/library/item-topics.jsonl | 到既有Topic.slug的审核映射 |
| data/library/item-relations.jsonl | 到文章/项目的审核关系 |
| data/library/editorial-selections.jsonl | 人工精选依据，区别于社区推荐 |
| data/library/identity-history.jsonl | alias/merge/split历史 |
| data/library/review-log.jsonl | 只追加的脱敏审核事件；敏感diff/投诉在仓库外 |
| data/library/scores.jsonl | M2特征、缺失、实验版本和可重建评分 |
| data/library/evaluations/ | 允许公开的金标、queries和实验配置；无参与者隐私 |
| 仓库外受控工作目录 | ingest jobs/checkpoint/DLQ、私有raw/actor映射、短期API缓存/凭据 |

公开仓库中保存pending候选仍然是公开披露，不能用“尚未发布到网站”绕过存储许可。M1-01只有空registry、Schema和fixtures，不创建真实来源审批或种子。

## 2. 输入Schema

### Source policy

| 字段 | 类型与约束 |
| --- | --- |
| id / hostname / source_kind / acquisition_method | 稳定source ID、精确主机、api/dump/manual/owned/spec、manual_json/manual_csv/official_api/approved_dump |
| policy_version / status | 不可变版本；pending/approved/blocked/revoked/disabled |
| license_identifier / license_url / approval_basis_url | string或null；approved必须有适用依据说明与URL，不要求一切依据都有SPDX号 |
| attribution_required / attribution_text | boolean及string或null；需归属则text不能为空 |
| fetch_allowed / store_raw_allowed / show_excerpt_allowed / derivative_analysis_allowed | boolean，默认false，不能越过字段白名单 |
| allowed_fields | fetch/store/display/derive/public_git/public_snapshot各为精确字段名数组，空数组即禁；只允许Schema已知字段 |
| retention_mode / retention_days | none/time_limited/permanent；time_limited时整数>0，其他null；permanent需批准 |
| requires_refresh / refresh_interval_days / deletion_required / public_history_allowed | boolean、正整数或null、boolean、boolean；限期删除数据不得允许不可撤公开历史 |
| approved_by / approved_at / last_legal_review_at / review_due_at | 脱敏审批人及UTC或null；approved必须有审批与复审期限；网页核验时间不是授权时间 |
| policy_scope / review_notes | 有限可公开说明，不含密钥/原始投诉/画像 |

### Candidate与item

Candidate必填candidate_id、ingestion_id、source_id、source_record_id、source_url、observed_at、resource(kind/identifier/url/title_hint)、policy_version、field_provenance、state。state为new/matched/needs_review/rejected/promoted；promoted之前不能进公开索引。第三方ID必须真实，人工ID须明确标记manual，不由模型伪造。

| Item字段 | 类型与约束 |
| --- | --- |
| id / slug / revision | 不可变ID、冻结slug、乐观锁版本 |
| kind | video/book/paper/spec/article |
| canonical_key / canonical_url / identifiers | 规范见第3节；HTTPS外链；DOI/ISBN/YouTube/arXiv/work/version等显式键，未知为null |
| original_title / creators / original_language | 原题、署名数组、BCP47或und；不补造作者 |
| original_published_at / date_precision | 日期或null；day/month/year/unknown；month/year须明确该日只是规范占位，不能展示为精确日期；未知不以采集日替代 |
| source_id / rights_policy_version / field_provenance | 资源元数据来源；不可与推荐证据来源混淆 |
| status | draft/pending_review/published/archived/quarantined/takedown/rejected |
| rights_status / validity_status | approved/pending/blocked/revoked；current/historical/superseded/disputed/unknown |
| availability / last_checked_at | available/unavailable/unknown；UTC或null；失效不授权镜像 |
| level / detail_enabled | beginner/intermediate/advanced/unknown；boolean；详情须三语说明审完 |
| checks | metadata_valid/rights_checked/evidence_checked各含passed和review_event_id（未通过可null，通过时必须真实有效）；content_status=approved/needs_review/rejected |
| created_at / updated_at / published_at / expires_at | UTC，后两者可空；期限策略时expires不可空 |

field_provenance为字段路径到`{origin_source_id,source_record_id,source_url,rights_policy_version,observed_at,fetched_at,expires_at}`的映射。原创字段也记editorial来源；人工粘贴/翻译/聚合不能去掉API来源义务。素材另记asset_url、origin、许可、归属、fetch/expiry；未批准则省略素材，使用文字卡。

### Locales、证据与关联

| 实体 | 字段及不变量 |
| --- | --- |
| item_locales | item_id、locale(zh-CN/en/ja)、title、description、editorial_body、recommendation_reasons(对象数组，见下文)、summary_language、abstract_status(draft/machine_draft/reviewed)、model_version(可空)、reviewed_at/review_event_id（未审可null）、source_revision。published要求三语reviewed且审核时间/事件有效；detail_enabled要求三语body非空。原题另保留，外部全文不复制 |
| evidence | id、item_id、source_id、source_record_id、source_url、origin_locator(可空)、actor_cluster_ref(内部可空)、evidence_kind、observed_at、confidence(0–1或null)、review_status、evidence_excerpt(可空)、extractor_version、rights_policy_version、expires_at（可空）、review_event_id（未审可null）；模型时另必填model_id/prompt_version/run_id/input_hash。kind=recommendation/mention/citation/criticism/correction；review=extracted/verified/rejected/needs_review；verified必须有有效审核事件；分类器unclear转needs_review，不强造推荐 |
| editorial_selection | id、item_id、reviewer_id、rationale_locales(三语)、selected_at、review_event_id；不算社区票 |
| item_topics | item_id、existing_topic_slug、mapping_method(manual/model_suggested)、review_status(pending_review/approved/rejected)、reviewed_at/review_event_id（未审可null）；slug必须真实，approved必须有真实审核，模型建议须审 |
| item_relations | item_id、existing_entity_type(article/project)、existing_entity_slug、article_translation_key(article必填)、relation_type(background/supports/challenges/further_reading)、review_status(pending_review/approved/rejected)、reviewed_by/reviewed_at/review_event_id（未审可null）；approved须真实审核，未证明支持/反驳一律further_reading |
| review_log | event_id、entity_type/id、action、from_state/to_state、expected_revision/next_revision、redacted_diff、reason、reviewer_id、created_at、previous_event_hash/event_hash；hash链防意外篡改，不证明审核人真实身份；人类PR审批对应同一输入hash |
| identity_history | event_id、action(alias/merge/split)、from_ids/to_ids、canonical_keys、rationale、review_event_id、at；split重新分配证据，不复制票数 |

每条recommendation_reason为`{id,text,basis_type,evidence_ids,editorial_selection_id,source_revision,review_event_id}`。basis_type为evidence或editorial_selection，二者依据互斥；未审理由review_event_id可null，发布时必须有效。草稿理由可0–3条，公开项须1–3条；三语同reason ID和同依据，仅text本地化。evidence_ids全部属于同item、verified、当前合法且revision匹配；editorial依据须同item已批准。理由含义必须有对应依据，mention/citation/criticism不得被解释成外部推荐；该类材料可用于明确标记的背景或争议说明。内容或依据revision/hash改变使理由审核失效。公开详情须能由reason ID访问其允许公开的依据链接，而非只有item级“有一条证据”。

evidence唯一键为(source_id,source_record_id,item_id,evidence_kind)，重抽取只更新revision，不增加独立票数。发布时间、observed_at与fetched_at分别保存。公开端保留必要署名，不公开actor内部映射；actor_hash不能视为匿名化。

### Scores和离线jobs

scores必填item_id、rank_version、model_version(可空)、feature_schema_version、input_hash、code_version、as_of、features、missingness、score_total（未评分可null）、rank_position（未进入该排序可null）、scoring_status(scored/unscored/ineligible)、unscored_reason（未评分必填，其余可null）、review_event_id（未审可null）、override_reason(可空)。I/E/Q/G/V/T/C各在[0,1]或null；缺失显式列出，必需特征缺失则B3不可评分，退B1/人工精选，不臆补0/1或伪排名。已发布评分须有效审核。模型版本与rank版本分开。

保留PRD实验公式：`base=.20I+.20E+.25Q+.15G+.10V+.10T; adjusted=base*(1-.50C)`。reference_cap来自审核样本，权重、cluster cap、diversity、缺失策略与as_of版本化；最终以item_id破同分。API字段不得进入特征/金标构造。分数不代表真实性概率；C不用于公开指控个人。

仓库外jobs含id/source_id/batch_key/job_version/input_hash/state/cursor/attempts/completed_record_ids/failures/started_at/finished_at；状态pending/running/checkpointed/completed/failed/cancelled。幂等键(source_id,batch_key,job_version)+input_hash；同键变输入报冲突。单条失败进脱敏DLQ，重跑跳过已完成记录；写入和checkpoint临时文件+rename，失败不推进cursor；同一catalog写锁冲突即拒绝。dry-run不写数据。

## 3. Canonical规则与站内身份

| 类型 | 规则 | 禁止行为 |
| --- | --- | --- |
| YouTube | youtube:{11位videoId}；watch/youtu.be/shorts同ID；身份key剥离播放起点/跟踪 | playlist不当video；解析不等于联网获批 |
| Book | openlibrary:work:{OL…W}，否则isbn13:edition:{校验通过ISBN}；版次另记 | work与edition不无证合一，不按题名合并不同版 |
| Paper | DOI规范小写；arXiv base ID与具体版本另存 | 不按题名判断同文，不覆盖历史版本 |
| EIP | eip:ethereum:{number}:{真实commit-or-version} | 不将旧版静默标current |
| Web | 主机/默认端口规范化，路径大小写/身份query保留，只删已知utm等 | 不全删query，不无证跨域合并，redirect不自动证明同一内容 |

(kind,canonical_key)唯一；不确定则待审。merge保留alias/历史，split审查证据归属和本地状态迁移，不能复制推荐。只认TOPICS[].slug、真实文章translationKey/slug和PROJECTS.slug。文章按getPostHref解析语言，project不冒充文章；缺失/歧义关联阻断发布，不建占位实体。

## 4. 发布闸门与状态机

公开资格同时满足：published、rights approved、所有输出字段政策有效且准许public_snapshot、来源复审未过期、checks通过、三语reviewed、引用存在、至少1条verified合法证据或approved editorial selection。community-recommended还须≥1条独立verified recommendation，排除自荐/重复cluster；mention/citation/criticism不是推荐。批判/更正不能因不利评分被删除。

draft→pending_review→published；pending_review可rejected/quarantined；published可archived/takedown/quarantined；修订后重新审核才能恢复。rights revoked优先于item状态。archived等不进P0公开集合；如需墓碑页另审可公开字段并noindex。

导入器/模型只能到pending_review/extracted，不能批准人工审核。CLI需expected_revision、实体hash及真实review事件；内容改变使旧批准失效，PR批准匹配同一数据hash；冲突报REVIEW_CONFLICT，不覆盖他人数据。

## 5. 公开快照Schema

唯一当前指针为`public/data/library/v1/manifest.json`；内容位于`public/data/library/v1/snapshots/{snapshot_id}/`。这是对PRD平铺文件的设计细化：保留items_file/ranking_file等字段，内容地址化防多文件混读，不另留可漂移平铺副本；M1冻结后实现。

```json
{
  "schema_version": "1.1.0",
  "snapshot_id": "sha256-<payload-hash>",
  "generated_at": "2026-11-02T00:00:00Z",
  "as_of": "2026-11-02T00:00:00Z",
  "rank_version": "editorial-v1",
  "items_file": "/data/library/v1/snapshots/sha256-<payload-hash>/items.json",
  "ranking_file": "/data/library/v1/snapshots/sha256-<payload-hash>/rankings.json",
  "files": {
    "items.json": {"sha256": "<hex>", "bytes": 0, "count": 0},
    "rankings.json": {"sha256": "<hex>", "bytes": 0, "count": 0},
    "facets.json": {"sha256": "<hex>", "bytes": 0, "count": 0},
    "relations.json": {"sha256": "<hex>", "bytes": 0, "count": 0}
  },
  "checksum": "sha256-<hash-of-files-map>",
  "input_hash": "<hex>",
  "code_version": "<git-sha-and-generator-version>"
}
```

该JSON是结构占位，不是生成结果。snapshot_id由规范payload、输入/代码/rank版本和显式as_of计算，排除自引用wrapper、snapshot_id和generated_at；各文件wrapper含schema_version/snapshot_id，hash按最终UTF-8字节算。对象key/数组顺序/换行固定，generated_at不改变相同输入身份。

| 文件 | 公开投影 |
| --- | --- |
| items.json | id/slug/kind/url、原题/作者/原语言/日期精度、难度/有效性/可用性、三语编辑题/摘要/理由（只投影id/text/basis_type和允许公开的证据/精选引用）、detail_enabled、topics、更新时间、获批归属/素材；无raw/内部review/actor/候选 |
| rankings.json | rank版本/as_of、四种排序稳定ID数组、可公开理由/缺失状态；只引用items中的ID |
| facets.json与topic-{slug}.json | 只对公开items计数/列ID，不泄漏待审候选 |
| relations.json | 审核article translationKey/slug、project slug、item IDs、relation_type的必要投影 |
| detail-{id}.json（按需） | 精选三语编辑正文、可公开证据URL/类型/日期/归属/核验及失效说明；不把所有详情塞首页JS |

全套临时目录先校验，再原子切manifest；生成失败不改当前指针。构建只读审核本地输入，不在线调用LLM/API。客户端固定snapshot分页，更新快照重置页码并提示；未知schema/hash/引用错误保留**仍合法**的已验证集合，否则明确加载失败，不假装空结果。

撤权/期限优先于“保留旧快照”。P0公开产物只保留允许服务集合；回滚输入在受控位置保存，重新过当前政策投影。历史公开快照/旧deployment可达性必须纳入撤稿验证，不直接恢复已撤权数据；不能保证限期删除则不纳入该类来源。无需为此引入Worker或重做托管。

## 6. 搜索、关联与本地状态合同

- query白名单：q/topic/type/language/level/year/recommendedFrom/recommendedTo/sort/page；type映射kind；q≤200字符；page为正整数、每页20。未知值明确可清除或报错，不执行表达式。
- 四种排序：best/evergreen/recently-recommended/recently-published。未知日期置后；最近推荐按verified recommendation时间，editorial selection不能伪装社区推荐。原作语言筛选不随UI locale变化。
- 先B1关键词/字段权重；中英日规范化、分词和100 queries在M2冻结，不能宣称includes等价BM25；B3待评测。
- 首屏静态HTML含可用精选，不让useSearchParams把全页退为客户端空壳。客户端只取Library必要公开字段，不能导入8.9MB blog-index或全PROJECTS。
- 独立关系adapter构建端校验Topic/文章/项目，不改MDX/compiler；无关系不显示区块。
- localStorage key为kkdemian.library.v1：`{schema_version:"1.1.0",items:{[id]:{saved_at,read_at,hidden_at}}}`，时间可空。稍后读=已保存且未读；仅本地ID与状态；禁存储/损坏/超限降级内存并提示，不上传。alias可迁移，split不擅自扩散收藏；过期/下架不展示缓存正文。

## 7. 必测拒绝路径

缺/未知字段、不支持版本；pending/expired政策；禁用字段；canonical碰撞/不同版；重复导入/中断重跑；合法未审记录允许null审核引用但不能公开、伪造/过期审核拒绝；review冲突/内容hash改变；逐条理由缺依据/跨item/过期revision/mention冒充推荐；三语缺项或理由依据不一致；未评分保持null而非0；非法Topic/article/project；hash/混版本；候选/敏感字段泄漏；旧快照复活撤权；SSRF/XSS/injection；相同输入+as_of同结果。fixtures标虚构且不进入真实集合。

P1 API、SQL迁移、自动刷新cron、在线LLM、跨设备同步均不实施。测试命令和责任见[实施计划](implementation-plan-v1.md)。

## 8. M1-01 已冻结的实现细节

- 单一 `catalog.schema.json` 的 `$defs` 覆盖全部输入实体、离线job和站内引用上下文；`validateRecord` 与 `validateCatalog` 都实际调用此Schema。`src/lib/library/types.ts` 只提供类型和浏览器安全常量，不能替代输入校验。
- 为执行审批绑定，source增加 `revision` 和可空 `review_event_id`；review_event增加 `subject_hash`。所有实体的revision为正安全整数，review_event本身由哈希链排序，不另设revision。
- item_locale与editorial_selection增加source_id、rights_policy_version、field_provenance，以区分原创说明与外部元数据的来源义务。理由增加 `basis_revisions`，精确绑定每个依据ID的版本；`source_revision`指item版本。
- 审核对象标识：item_locale为`item_id:locale`；reason为`item_id:locale:reason_id`；Topic映射为`item_id:topic_slug`；文章/项目关系为`item_id:entity_type:entity_slug:relation_type`；score为`item_id:rank_version`。`entityKey`统一实现，不由各个消费者重写。
- `reviewContentHash` 排除审核引用与审核状态；item也排除checks、发布状态/时间和rights状态，避免循环哈希。实际内容、来源/版本、理由依据与实体revision全部覆盖；状态批准另由对应action/to_state校验。published item另需同revision、内容hash和published_at匹配的publish事件。哈希链只能证明数据一致性，不能证明审核人身份或许可合法性。
- `redacted_diff` 是`{field,before_hash,after_hash}`数组，原值不写入此公开审核字段。actor_cluster_ref只允许在仓库外输入；publicGit校验拒绝非空内部cluster引用。
- `parseJsonStrict`与`parseJsonLines`使用严格UTF-8、JSON语法、解码后的重复key拒绝；不执行来源文本。单文件16MiB、单记录128KiB、嵌套深度32、每集合10,000条上限；canonical JSON按键排序、保留数组顺序。超过上限明确拒绝，不截断或丢字段。
- `validateCatalog(catalog,{asOf,context,publicGit})` 默认按公开Git存储校验。仓库外草稿可用publicGit=false校验未审/null记录；这不是发布豁免，published集合始终执行当前权利与三语审核闸门。引用context使用topic_slugs、articles[{slug,translation_key}]、project_slugs；CLI仅在存在关联时读取站内真实数据，不把完整索引塞入新客户端。
- `pnpm library:validate [--dir <directory>] [--as-of <UTC>]` 默认只读取data/library，不读取fixtures；`pnpm test:library`单独运行合同测试。真实零条清单通过不代表100条种子或来源审批已完成。

这些是新契约首次落地前的字段细化，没有已部署旧版Library消费者需要迁移。后续导入器、快照生成器和UI需要复用当前Schema/哈希/资格接口；M2的分类、排序与真实人工评测尚未实现。

## 9. M1 身份、导入与公开快照实现

- 纯TS身份规则位于`src/lib/library/normalize.ts`，CLI通过`scripts/library/normalize.mjs`复用；模块不导入Node、fs、完整博客或Research索引。YouTube变体、DOI、arXiv显式版本、ISBN校验与Open Library work、EIP/ERC显式版本分别处理。URL只移除已知跟踪参数，保留路径大小写、必要query和fragment；不自动跨域确认内容相同。明确ID冲突拒绝，work与edition的未证实关联转人工队列。
- 未pin规范**候选**允许保持needs_review，导入报告identity_needs_review；不伪造版本或把它当作正式item identity。正式公开EIP/ERC item必须提供已核版本；别把网页HTML hash或未经核验的仓库HEAD当成每篇版本。published item进入生成器时再次校验canonical_key/canonical_url一致。
- identity_history的已审记录必须绑定实际review事件，来源和目标item保留可解析记录；alias为1→1、merge为多→1、split为1→多，来源先退出published，循环/自环/未知ID拒绝。split返回显式多目标，不能自动扩散收藏或复制证据；完整审核CLI留在M2。
- `library:import`仅接本地候选JSONL/CSV，默认dry-run且不联网、不批准、不发布。CSV头为source_record_id,source_url,observed_at,kind,identifier,url,title_hint；JSONL使用完整candidate Schema。失败行只记行标识/错误码/次数，不存原文；成功记录可以独立checkpoint，cursor只到连续完成前缀。重复来源记录不增长，内容变化需显式修订；同canonical但新来源记录标matched，保留独立溯源，不把它当新增item。
- 导入的jobs/checkpoint/DLQ在显式仓库外目录，文件0600；private模式也只允许仓库外catalog。默认最多重试单行3次，批次输入hash改变报冲突；中断后重跑会对照实际candidate文件核对checkpoint，不盲信旧completed。SIGINT/SIGTERM通过AbortSignal落checkpoint。强制终止留下的目录锁不按时间自动删，需确认原进程已结束并核对文件/日志后人工清理。
- 文件写使用目标目录内独占临时文件、fsync和rename；同目录锁拒绝竞争writer。它证明本机测试下的原子可见性，不承诺断电耐久或所有文件系统语义。清理失败保留主失败并报告，不覆盖错误原因。
- 公开Schema为`data/library/schemas/public-snapshot.schema.json`，生成器与独立Node reader都实际校验。公开items包含必要三语题/摘要/理由及对应已核证据/编辑精选链接资料；正文只进精选detail文件，内部review/actor/provenance/模型运行记录不导出。来源义务要求的署名/许可保留。
- manifest增加valid_until，取当前来源复审、字段有效期与刷新截止的最早值；generated_at固定为显式as_of，保证重建。snapshot_id绑定规范输入、引用context、源码/Schema/锁文件与Node版本、排序版本和payload；每文件另有最终字节SHA256。M1只用editorial-v1，evergreen暂沿编辑顺序，不声称测出长期质量；recently-recommended不以编辑选择冒充社区推荐。
- `readSnapshot(directory,{asOf,currentCatalog,context,publicGit})`独立验证manifest、真实Schema、路径/字节hash、同版本、理由/关系/计数及精选资格。构建端消费者应传currentCatalog和context，拒绝以历史输出绕过当前审核/撤权；该Node入口不能引入客户端bundle。浏览器安全DTO在types.ts，UI消费者在M3接入。
- 普通Schema坏输入不覆盖仍可用旧输出；来源权利、期限或审核类错误会停用整个本地生成集，撤manifest并清除可达旧snapshot文件。合法新快照发布后也只保留当前版本。目录需Library生成标识，不能清理无标识用户目录。静态生产/CDN和旧部署的撤稿仍需M4发布验证，本地删文件不等于线上即时撤稿。
- 原combined JSON 150,000节点预算在300个完整虚构published条目与审核图上实测153,213节点而触发拒绝，已改为显式MAX_JSON_NODES=1,000,000；文件16MiB、记录128KiB、深度32及各集合上限不变。该调整基于本轮真实消费规模，不是无限放开解析。

命令、数据边界和本轮验收见[M1工具说明](m1-pipeline.md)，四项独立复核修复见[m1-contract-repair.md](m1-contract-repair.md)。真实300候选/100三语种子由下一步编辑入库，不以虚构benchmark充数。
