# M2交付：本地审核与B1检索

2026-11-02。按已确认的编辑精选＋B1路径完成本地软件实现；M3页面尚未接线。本阶段没有修改M1的来源、候选、100项资源、300份三语文本、理由或1275条审核记录。实际数据、public Schema与M1提交`8af6a9fee3d997c62c37e062e6353c50bc6ca833`逐文件字节相同，见[兼容性与快照核验](reviews/2026-11-02-m2/compatibility-and-snapshot.json)。

## 任务对应结果

| 任务 | 已实现和验证 | 保留边界 |
| --- | --- | --- |
| M2-01 | 严格评测Schema、真实120候选协议样本、108组三语功能题、离线评测命令 | 功能题由Codex编写，不是人类金标；120样本尚无评审人、配对标签或相关性判断 |
| M2-02 | inspect、dry-run、review/revise/publish/takedown/restore、三重版本/hash校验、角色声明、幂等和显式中断恢复 | 本地publish只改审定状态和JSON，不部署网站；声明actor/role不等于认证人类身份 |
| M2-03 | 合法手工或可溯源代理草稿的逐条核验、明确核验范围、same-item/revision理由依据 | 自动抽取关闭；metadata_only和本站说明不能变成外部推荐证据；未知版权正文不读取、不存储 |
| M2-04 | 浏览器安全B1消费者、三语查询、过滤/排序/分页、稳定tie-break、命中解释、Topic前10作者上限 | B2/B3关闭；候选不足显式relaxed，不删后续资源或伪造作者；未验证语义模型或推荐质量优势 |
| M2-05 | 原三语文本和依据完整保留；修订、退审、发布继续执行原资格闸门；全部公开题/摘要/正文/理由与当前catalog逐值相同 | 无文字修改，因此不重写或重新做语气检测；没有新增自动批准、外部背书或社区推荐 |

**G2状态：编辑精选＋B1的软件交付已验证；原完整实验门槛未通过。** 人类双盲、F1、verified precision、κ、NDCG、Recall均为not-run/null；20–30人用户实验也未执行。不能用324条功能题通过或合成算术单测代替这些证据。实际命令与恢复步骤见[M2操作说明](m2-workflow.md)。

## 合同、写入和消费者

JSON使用现有Draft 2020-12 Schema与AJV严格校验，UTF-8、重复键、深度、节点、文件和记录大小约束沿用原parser；未知字段和冲突拒绝。catalog只新增独立operator_command定义与可选reviewer_role，旧M1记录继续可读。新事件需配套当前工具，不承诺旧严格raw-catalog工具接受新增字段。公共DTO、manifest与public Schema保持v1不变，未导出role、事务、私有审阅字段。

审核CLI复用目录锁、writeAtomic及原hash/审核合同。多JSONL提交先停用旧公开输出，再保存有界事务；普通失败回滚原字节，回滚中断则显式恢复。reader检查前后marker和全部文件身份/stat，拒绝快速完成提交造成的混读。实际build入口与operator持同一输入锁到快照完成，已验证build/takedown竞争和撤稿后重建不复活资源。直接内存build API仍要求可信当前输入，不能代替受锁生产入口。

真实消费者链为`library:evaluate → readCatalog/loadReferenceContext → readSnapshot(currentCatalog/context) → createLibrarySearch`。M3必须继续使用已验证公开数据和受锁build入口；尚未声称浏览器页面、旧部署或未知消费者已验证。

## 复核发现与窄修

独立代码复核先检查生命周期、锁、现有writer/reader和版本失效，再审B1/评测新增范围。已修两项实际问题：

1. **自产staging阻断恢复。** 等价真实临时目录中保留producer暂存文件与待恢复事务，旧恢复被OUTPUT_NOT_OWNED拒绝。现由status给精确目录/字节指纹，recover显式绑定同一receipt；未知文件、符号链接、错误hash、外部catalog修改和过期恢复继续拒绝。测试模拟强杀留下的磁盘状态，没有声称实际SIGKILL或断电耐久验证。
2. **长中日查询丢尾部编号。** 60词截断使合法长查询末尾未知ERC编号被忽略，真实100项快照分别误返70、64条。去掉静默词截断，保留q≤200的原输入上限和全部编号约束；两语未知编号现为0，尾部已知ERC7702仍命中。见[行为RED](reviews/2026-11-02-m2/long-query-red.log)和[修后搜索回归](reviews/2026-11-02-m2/search-tests.log)。

实现自检还闭合了公开身份不可借正文修订换资源、单份locale被拒后全项三语退审，以及合法可溯源代理草稿仍可显式核验的边界。初次测试中的macOS路径realpath、fixture当前context/政策设置和报告子进程默认buffer问题属于验证设置错误，已修正；没有把这些错误当作产品行为RED。

同一独立只读reviewer最终确认上述两项P2关闭、当前增量无未决阻断；其逐项阅读108组三语题及真实标题映射，独立运行实际evaluate CLI与currentCatalog/context消费者，324/324、真人指标全null，并复验长中文未知ID为0、已知ERC7702为1。该复核没有写入数据，也不包含浏览器、人类实验或远端export验收。

## 实际数据和性能

当前快照为`sha256-075db1b023ec0daa6f980d3c4ca4ad0d95acac2a2f68000d95d936233dbe7a24`，as_of=`2026-11-02T13:54:40.745Z`；100项/100详情/300locale、0社区推荐，111个公开文件，raw **587431字节**，逐文件gzip合计 **230723字节**。实际`pnpm library:build`在并行阶段检查中用时 **3420.81ms**。这与M1的synthetic300基准分开记录，也不是全站export耗时。

最终实际评测：108组/324条功能query全部通过；原冻结题集字节SHA256仍为`6fd8511611922854fca0df1e2f741359cfa960d7126e9059199f0870631e6658`，没有修改expected IDs迎合结果。Node v24.16.0、darwin-arm64，本地100项建立索引约 **1.26ms**，972次搜索p95约 **0.234ms**。这是本机CPU测量，不包含网络、浏览器、LCP或真人任务效率。完整输入hash和指标见[评测JSON](reviews/2026-11-02-m2/evaluation.json)。

## 检查与未执行项

阶段检查日志位于[本轮证据目录](reviews/2026-11-02-m2/)：

- `pnpm test:library`：115/115；`pnpm test`：269/269，均在staging修复后执行。
- 最后长query窄修后，实际搜索consumer回归10/10，含原324功能题及新增中/日边界；`pnpm typecheck`、定向ESLint和真实`library:evaluate`再次通过。
- `pnpm library:validate`、`pnpm library:build`及显式currentCatalog/context独立reader通过；所有100×3公开题、摘要、完整正文、理由和basis与当前catalog相同。
- `pnpm content:check`：7428份MDX通过。没有改变MDX、Research registry或M1正文。

未运行全站`pnpm build`、远端静态export、浏览器/预览、部署或push；M3页面和M4验收仍待后续阶段完成。人类实验不计作完成。
