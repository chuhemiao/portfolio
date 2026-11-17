# Agent 工程面试专题三语复核

2026-11-17 · 5 篇思考 · 15 篇 MDX

前四篇来自对话正文，第五篇来自同次上传的附件。前四篇中文和全部英日文以编辑初稿为对比基线，第五篇中文留存未经改动的附件原文。各目录保存基线、逐行差异、中文检测数据和语义候选判定。标题的系列编号和末尾导航单独加入 MDX，未计入正文检测。

| 篇目 | 正文章节数／每语 | 中文差异 | 英文差异 | 日文差异 |
|---|---:|---|---|---|
| 01 LLM 应用与 Agent Harness | 7 | [对比](01-harness/comparison.zh-CN.diff) | [对比](01-harness/comparison.en.diff) | [对比](01-harness/comparison.ja.diff) |
| 02 Agent Runtime | 10 | [对比](02-runtime/comparison.zh-CN.diff) | [对比](02-runtime/comparison.en.diff) | [对比](02-runtime/comparison.ja.diff) |
| 03 Agent 工具工程 | 11 | [对比](03-tools/comparison.zh-CN.diff) | [对比](03-tools/comparison.en.diff) | [对比](03-tools/comparison.ja.diff) |
| 04 Context Engineering | 12 | [对比](04-context/comparison.zh-CN.diff) | [对比](04-context/comparison.en.diff) | [对比](04-context/comparison.ja.diff) |
| 05 生产级 Agent | 15 | [对比](05-production/comparison.zh-CN.diff) | [对比](05-production/comparison.en.diff) | [对比](05-production/comparison.ja.diff) |

## 表达优化

中文用 `lieflat-less-ai-tone` 做改前检测与改后复测。前四篇初稿已消化原文的过渡句和重复设问，基线到成稿主要是局部用词和技术语气调整。第五篇把原附件中的单行标签及相邻小段合并为清单或连续论述，保留技术条目和问答覆盖面。

| 篇目 | 顿号并列 ≥3／千汉字 | 提示语冒号／千汉字 | 句首连接词／千汉字 | 语义候选条数 |
|---|---:|---:|---:|---:|
| 01 | 17.129 → 16.895 | 0 → 0 | 0 → 0 | 17 → 17 |
| 02 | 18.355 → 18.262 | 0 → 0 | 0 → 0 | 20 → 20 |
| 03 | 19.621 → 19.280 | 0 → 0 | 0 → 0 | 24 → 24 |
| 04 | 16.722 → 16.713 | 0 → 0 | 0 → 0 | 26 → 26 |
| 05 | 7.451 → 20.864 | 0.324 → 0 | 0.972 → 0 | 76 → 31 |

第五篇中文的并列密度上升主要来自合并单行条目后的版式变化。保留 Trace 字段、数据存储职责和延迟排查维度等技术枚举。脚本未改编号章节，不用符号密度判断作者身份。第五篇原稿的 11 个冒号语义候选是层级、技术分类或交付阶段的版式标签，没有判为结论提示。各篇候选中未见需统一的实义重复换称或高度同构三连。第五篇原稿的最长明确承接连环为 6，成稿为 4。连环的候选序列可能跨过标题或列表，对这类接口保留逐项判断，不用它评价论证的连贯性。

英文统一使用相同的业务对象与状态术语，明确 Replay 能协助定位变化来源，调整 RRF 求和范围的句法。日文调整「少なくとも1回のスケジューリング」、执行记录和审批等工程用语，显式说明 RRF 对召回该文档的检索项求和。英日稿未套用中文计数规则。

## 三语一致性与复核修订

- **01 架构**。五种系统形态、七层架构、六项选型检查及 DevPilot 的技术栈与核验产物一致。DevPilot 按原稿保留为预发布受控版本，区分已实现、受控验证和设计。LangGraph 的编排能力与业务系统的权限、副作用和审计责任分别表述。[LangGraph 持久化](https://docs.langchain.com/oss/python/langgraph/persistence)
- **02 运行时**。八步循环、五类停滞约束、三种状态、持久化审批、三层幂等、`outcome_unknown`、取消与 Replay 保留。补入 LangGraph 从中断所在节点开头恢复的具体行为，说明为何要保护中断前的副作用。[ReAct 论文](https://arxiv.org/abs/2210.03629) · [LangGraph 中断](https://docs.langchain.com/oss/python/langgraph/interrupts)
- **03 工具工程**。工具注册字段、五层校验、五类异常、权限与执行隔离、三档风险、四类角色、版本快照、三方合并与 fencing token 一致。复核后明确各档权限和审批、执行前重验授权、多 Agent 角色可以分配不同工具，以及受控环境中的安全回归测试。[Function Calling](https://developers.openai.com/api/docs/guides/function-calling) · [MCP 规范](https://modelcontextprotocol.io/specification/2026-07-28) · [Agent Skills 规范](https://agentskills.io/specification)
- **04 上下文工程**。六层上下文、三类记忆、十步 RAG、八步故障排查与 12 道面试题一致。RRF 公式按召回该文档的链路求和，排名从 1 起算。Veloxis 和 Neo4j 的设计以原稿示例为准，图谱抽取关系须回溯文本证据。[Elasticsearch RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion) · [Microsoft GraphRAG](https://microsoft.github.io/graphrag/)
- **05 生产实践**。四层评测、Golden Set 的必过测试与预期引用、Trace、成本、队列事务、SSE、Python 异步和十道面试题一致。复核补回长 HTTP 请求的超时与资源占用、结果的生成过程、真实用户量、撤权后的在途任务、成功任务的成本优化。保持 5 → 20 分钟为排查情境、20–50 个用例为需求验收建议，约 0.6 秒 → 约 3 毫秒仅指原稿报告的 DevPilot 单查询合成负载结果。[OpenTelemetry Trace](https://opentelemetry.io/docs/concepts/signals/traces/) · [AWS Transactional Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) · [WHATWG SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html) · [Python asyncio](https://docs.python.org/3/library/asyncio-task.html)

独立复核覆盖五篇三语草稿、原文主张、专名、数字、条件、错因分类与来源链接。修订完成后再次核对。技术来源用于解释框架与协议行为。DevPilot、Veloxis 的实现状态及基准来自作者材料，本轮未独立复现。

## 构建与静态产物

- `pnpm content:check` 通过，校验 7,488 篇 MDX。
- `pnpm build` 通过，生成 8,294 个静态页面及 7,488 条旧文章路径跳转。内置 i18n 检查覆盖 678 个本地化页面、全部文章和三份 RSS。
- 定向读取静态文件，确认五个 translationKey 各关联三语，15 页完整渲染正文，每页只有顶部一个语言下拉，45 个语言对应声明准确，60 个同语系列链接目标存在，15 篇均进入对应语言 RSS。语言下拉使用导出的 alternate 链接作为译文路径来源。交付未运行浏览器交互预览。
