# M2：本地审核与B1检索

2026-11-02。沿已确认的编辑精选+B1路径实现，不引入Worker、数据库、在线抽取或翻译服务。本阶段保留M1的100项三语文本、来源事实、未知值和既有判断。人类双盲与用户实验仍未执行。

## 本地审核

```bash
pnpm library:review --help
pnpm library:review inspect --type item --id lib_689553a2708d6f3c72bafaa5c1a6b332
pnpm library:review apply --input /absolute/path/command.json
pnpm library:review apply --input /absolute/path/command.json --write
```

默认dry-run共用完整合同、权限与状态验证，不写catalog、锁、事务或输出。`--write`只修改本地catalog及Library JSON投影；这里的publish不代表生产网站部署。非默认catalog的写操作须同时显式传`--out`，不能误用真实网站输出目录。

自动读取JSON时使用`pnpm --silent library:review ...`、`pnpm --silent library:evaluate ...`或直接运行对应Node入口，避免把pnpm自身的命令标题混入JSON。

命令JSON采用`library-review-command/v1`，字段定义在现有catalog Schema的`operator_command`。每次从inspect结果填写`expected_revision`、`expected_content_hash`、`expected_catalog_hash`，另填唯一`id`、真实`actor`、`role`、`entity_type/entity_id`、`action`、理由和UTC `as_of`。修改正文需完整replacement，不能直接携带批准字段绕过复核。同operation ID/同命令重跑不增加事件；变更命令或数据冲突拒绝覆盖。命令时刻用于审计，执行时另外按当前时间核资格；历史命令重放不让旧资格复活。

| 声明角色 | 可操作范围 |
| --- | --- |
| editor | 修订/逐条审核/拒绝item、locale、reason、evidence、editorial selection及既有关系；不能自动取得权利或发布 |
| rights_reviewer | 明确复核item或现有source的有效字段政策；不能用普通编辑操作改变来源许可 |
| publisher | 本地publish、takedown、archive、quarantine及restore；发布必须通过现有全部合同闸门 |

actor/role是本地受信任操作人的明确声明和审计记录，不是身份认证或“人类审批”证明。source策略范围或版本变更仍需专门的真实政策审阅，不能用本工具推定授权。

修订item/locale会让item及三语依赖退审、提升相应revision/source_revision，并清除旧批准。reason、locale、item检查、权利与发布需要显式重新审核；不会自动批准翻译。公开slug、canonical identity、kind和创建身份不允许借文字修订静默换资源。拒绝一份locale也会让所属item和三语退审。

证据输入可为合法手工或带完整模型来源的代理草稿，必须显式选择`metadata_only`或`source_text`核验范围。保留model/prompt/run/input hash不等于启用自动抽取；本工具没有自动抽取入口。metadata-only不能被审核成外部推荐，本站owned说明也不能制造独立背书。来源、字段、excerpt、same-item basis与revision仍由原合同执行；无依据的输入留needs_review或拒绝。M1真实证据仍为0，推荐理由仍只绑定编辑精选。

## 中断与撤稿

```bash
pnpm library:review status
pnpm library:review recover --transaction-hash <status中的hash> --mode after
pnpm library:review recover --transaction-hash <status中的hash> --mode after --write
```

恢复的`before`回滚、`after`完成原操作，均默认dry-run。catalog目录与输出目标绑定原事务；全部文件只能处于记录的旧/新hash之一，外部修改则拒绝恢复。恢复按当前权利和期限重新验证，不能用历史时间恢复过期公开内容。

强杀也可能留下producer在rename之前的`.staging-*`。此时status列出该目录的当前文件指纹，recover先报STAGING_RECONCILIATION_REQUIRED。核对后显式追加`--staging <精确目录名> --staging-hash <当前指纹>`，先dry-run再write。只处理这一处已拥有输出内、名称和字节匹配的暂存目录；不按前缀批量删除。正常JSON须符合公共wrapper，同一目录不得混snapshot；未知文件、嵌套目录或符号链接继续拒绝。writeAtomic遗留的UUID临时文件可在同一精确指纹范围内处理，不能借此接纳或发布其中内容。

实现复用目录锁与writeAtomic。写catalog前先停用旧公开manifest/分片，再落有大小界限的事务记录；普通失败恢复原字节，公开输出保持停用，下一次合法build可重建。回滚也中断时保留事务hash，普通reader/import/build拒读，须显式恢复。单文件rename原子性加上读者拒绝半状态构成可恢复的逻辑事务，不宣称断电耐久或所有文件系统上的数据库事务。

reader同时检查前后marker以及每个文件的dev/ino/size/mtimeNs，因此快速完成并清marker的写入也不能混读。真实build入口在输入目录锁内读catalog并持锁到快照完成，operator使用同一锁；竞争明确拒绝。直接`buildSnapshot({catalog})`仍是可信内存输入API，实际生产构建须走受锁入口。有限M1 seed工具有自身幂等协议且拒绝覆盖已编辑catalog，不宣称它变成了本工具的多文件事务。

SIGINT/SIGTERM在catalog提交循环之前或之中触发回滚；最后一次catalog写之后则完成一致快照并报告完成。强杀可能留下锁，先核实原进程已终止，再人工移除该目录的旧锁并按status恢复；不按TTL自动抢锁。退出码0表示成功/合法dry-run/相同命令重放，1表示输入、冲突、合同或IO失败，130表示已处理的取消。stdout只输出版本化JSON，诊断在stderr；IO诊断区分rolled_back与recovery_required。status在没有待恢复事务时返回ENOENT。

## B1消费者与查询

`src/lib/library/search.ts`是浏览器安全纯模块，直接消费同一已验证public v1 items/rankings/manifest；不导入catalog、MDX、PROJECTS或完整详情。实际Node消费者是`library:evaluate`及consumer回归：先用当前catalog/context读回合法快照，再创建检索索引。

```js
const index = createLibrarySearch(snapshot);
const result = index.search(new URLSearchParams('q=ERC-7702&type=spec'), {
  locale: 'zh-CN',
  asOf,
});
```

NFKC、拉丁小写、EIP/ERC写法规范化及中日字符二元词形用于简单关键词匹配。检索原题、三语编辑题/摘要/理由、已批准Topic、作者和公开canonical ID/URL；不是BM25或语义模型。带数字的代码词须匹配，避免忽略未知编号后返回泛泛结果。只索引已公开的身份字段；非canonical的ISBN若仅在详情中出现，不把整份详情塞进首页索引。

关键词best使用字段权重，其他排序沿合法public rankings；同分按固定编辑顺序及item ID。返回命中字段/词/权重解释，分数不是质量概率。原文语言筛选独立于UI语言，未知仍为und，未知日期不填发行日。推荐日期和recently-recommended只认已核社区推荐，不借editorial selection时间补数。

查询白名单为q/topic/type/language/level/year/recommendedFrom/recommendedTo/sort/page，每页20；q最多200字符，保留该预算内全部去重词，不按词数静默截掉尾部编号。重复参数、非法枚举、无效日期和不合法页码明确拒绝。未知Topic值在合法slug语法下产生明确空结果。UTC推荐日期包含端点；year支持明确的unknown。过期快照以SNAPSHOT_EXPIRED拒绝检索。

常规Topic的best/evergreen前10项尽量保持同已知作者最多4项；候选不足明确relaxed。未知作者不合并成一个虚构作者，未入前10的合格资源仍按原顺序进入后续位置/分页，不删除资源、不改变总数。具体ID和窄池查询不以多样性虚构更多结果。独立推荐cluster/B2与未验证B3均关闭，没有虚构reference_cap或质量特征。

## 评测口径

```bash
pnpm library:validate
pnpm library:build
pnpm library:evaluate
pnpm library:evaluate --gold /absolute/path/human-evaluation.json
```

`functional-queries.v1.json`在首次运行前冻结108组/324条三语功能题：100实际资源的代码、自然问题、书目线索和8组空结果。expected IDs是agent编写的功能断言，不是人类相关性金标，不能把通过率叫推荐准确率或NDCG。文件字节SHA256固定为`6fd8511611922854fca0df1e2f741359cfa960d7126e9059199f0870631e6658`。

`human-protocol.v1.json`按固定seed从真实300候选每类抽24条，共120条，含未公开候选；raters/annotations/search_judgments均空，status=not-run。未来真实配对标注须有两个不同人类评审及分歧裁决，样本/来源/item对应关系必须有效。软件只能校验声明和数据结构，不能认证其确为独立人类。没有真人标签时F1、verified precision、κ、NDCG和Recall均为null/not-run；算术单测不计作真实实验。

评测输出记录实际Node/平台、输入hash、snapshot、index耗时及本地CPU搜索p50/p95，不能代替浏览器、LCP、远端export或用户任务效率。自动抽取和B2/B3保持关闭；人类双盲与20–30人用户研究未完成，原G2/G4完整实验门槛没有被功能题通过替代。

public v1的字段与manifest不变。catalog增加独立operator_command定义及可选reviewer_role，旧M1记录继续有效；新的CLI事件与当前工具一起升级，不承诺旧的严格raw-catalog工具接受新事件字段。不会把role、事务或内部审核字段导出到public DTO。M3须继续使用受锁build入口、currentCatalog/context reader及已验证的公开数据。
