# 英文同步优化与信息保全复核

范围：完整通读679行英文，与修订后中文全文及其25处修改映射逐项核对。本轮修改16个原文位置（15处表达优化、1处既有门槛译法对齐）；另外9处英文已自然、已分句或已保留条件，因此保持原样。没有新增文章、修改元数据、标题、目录、表格、引用或语言分组。

采用 lieflat-less-ai-tone 的最小改动、信息守恒与结构保留原则；中文汉字密度、统计参考、中文句式正则不能作为英文有效检测或显著性依据。本文件记录人工语言复核与确定性信息比对，不给英文“AI味分数”。用户已明确授权同步优化，未再次要求确认。

## 25处中文修订的英文映射

| 原文位置 | 英文处置 | 理由 |
|---|---|---|
| L22 | 保留 | English already separates the missing-HTML limitation and unverified-work attribution into sentences. |
| L34 | 修改 | Replace the awkward beyond construction with a direct statement of the evidence for growth. |
| L91 | 保留 | English already uses full stops and explicitly preserves half-year/nonforecast/no-fabricated-series boundaries. |
| L93 | 修改 | State the comparison directly, matching the revised Chinese emphasis. |
| L119 | 修改 | Replace the two-stage issue announcement with the actual analytical requirement. |
| L137 | 保留 | English already separates the total, approximate decomposition and noncash caveat with full stops. |
| L145 | 保留 | English already uses Suppose and two If conditions, with may for recognition; no need to force a Chinese syntactic change. |
| L178 | 修改 | Remove the prefatory announcement of a notable distinction. |
| L194 | 保留 | English already places therefore inside the sentence and states billable workloads as the driver. |
| L198 | 门槛对齐 | 将旧译above $1M（严格>）改为of at least $1M（≥），对齐中文达到100万美元以上及日文100万ドル以上。保留More than 500、年化支出与同次2026年2月公告归属。 |
| L210 | 修改 | Put the potential switching-cost contribution first and separate the comparison with revenue. |
| L250 | 保留 | English already separates the scope differences and full-notes requirement with full stops. |
| L296 | 修改 | Replace the translated one-way bullish view and vague this question with a direct procurement judgment. |
| L302 | 修改 | Remove an unsupported backward causal link to the preceding missing-diagram notice. |
| L400 | 修改 | State the investment-return judgment before its familiar-phenomenon classification. |
| L438 | 保留 | English already puts therefore after the subject; inevitably and observable-outcome conditions remain. |
| L503 | 保留 | English already separates the chart observation and valuation-assumption limitation with full stops. |
| L505 | 修改 | Give the scenario purpose directly and state its boundary separately. |
| L526 | 修改 | Lead with the joint long-term assumptions and retain the comparison with a one-year revenue record. |
| L596 | 修改 | Turn the bare noun fragment into a sentence and group the six functions without deleting them. |
| L608 | 修改 | State the substantive moat directly and retain the limit on API aggregation. |
| L612 | 修改 | Use verbs to organize the six capabilities rather than six consecutive nominal objects. |
| L671 | 保留 | English already splits the historical comparison and mechanism into sentences; no punctuation change needed. |
| L675 | 修改 | Remove the prefatory extend-beyond conclusion and express the wider research questions directly. |
| L679 | 修改 | Replace the three editorial-note semicolons with full stops without moving the paragraph. |

## 既有门槛译法对齐

独立三语基线审查指出，L198英文旧译“above $1M”为严格大于，中文“达到100万美元以上”和日文“100万ドル以上”均为大于等于。本轮窄修为“of at least $1M”，保持数字不变并恢复三语原判断一致性。这一处属于翻译比较符纠偏，不计为单纯文风修改。

## 全文保真检查

- 16条修改全部记录于 en.changes.json，含line、before、after、rule、reason、semantic_preservation；没有清单外改动。
- 679行及空行位置前后完全一致，未拆段、调序。
- 全文数字token的值与先后顺序一致，共320个；不改变金额、百分比、日期、期限和参数。
- YAML前10行逐字一致；51个标题、78条表格语法行（13表）、全部列表、块引文、公式代码行、32条来源标注逐字一致。
- 2条URL及查询参数逐字一致。
- 41个专名/标识符的大小写与出现次数逐项一致，名单包括Anthropic、Claude Code、ANT/ANTH、SEC、S-1、GAAP、DCF、Reuters等。普通功能词从名词改动词不作为专名计数。
- 会计净亏损不等于现金流出、6.93亿美元不是全部现金损失、H1不是全年、Q3媒体数据非等同审计报表、合同义务时点/口径不可加、47%分销不等于云自购、5%–7%为公司行为认定主张、受控安全非生产事故、链上合约非股票等边界均保留。
- L34不暗示已观察到用户量/热度增长；L210两处may保留潜在贡献强度；L526保留数年增长与FCF联合条件，并未加入否定当前估值可成立的新断言；L596与L612六项功能各自完整。
- 原先必要的反驳（L158只有0.693B实际亏损的误读）、定义/清单/引用提示、假设、表格、技术风险列表及历史类比保留。全文其他正文未发现必须随此次中文方案同步改动的语义或英语表达问题。

## 可复核统计与指纹

| 项目 | 改前 | 改后 | 解释 |
|---|---:|---:|---|
| 原文位置 | 679行 | 679行 | 结构不动 |
| 实际改动行 | — | 16 | 全部有原文和规则记录 |
| 数字token | 320 | 320 | 内容及顺序逐项一致 |
| 正文分号 | 3 | 0 | 本次仅L679三处编辑说明换句号，其他必要用法不为降数强改 |
| 受保护标题 | 51 | 51 | 逐字相同 |
| 来源标注 | 32 | 32 | 逐字相同 |

- 改前SHA-256：`dd1a1bfb1e91b34d741f083d69cec03d59aca91d50f4672e8a8b8514a473dd0d`
- 改后SHA-256：`73d11c2391c79ec6e05096fee4ccd1c2443460cdcfa99f603436092e5bea9e72`
- 未联网核实IPO/财务事实，未调用翻译API/Surf，未预览、构建、提交或部署；构建与跨三语独立审查由主任务统一完成。
