# Claude 与黎曼猜想三语复核

2026-11-21 UTC · 3 篇研究 · 9 份完整 MDX

| 篇目 | 核对范围 | 简中对比 | 英文对比 | 日文对比 |
| --- | --- | --- | --- | --- |
| 1. 证明声明与公开证据 | 2026 年 11 月 20 日声明、作者分工、五个时间线节点、四页说明、14 个源代码分卷与超过 25 万页的未公开展开稿 | [对比](01-claim/comparison.zh-CN.diff) | [对比](01-claim/comparison.en.diff) | [对比](01-claim/comparison.ja.diff) |
| 2. Stepanov 重数与迭代 θ 提升 | Euler 乘积、显式公式及其适用范围、Dirichlet GRH、有限域重数示例和原声明的 √X 链长 | [对比](02-method/comparison.zh-CN.diff) | [对比](02-method/comparison.en.diff) | [对比](02-method/comparison.ja.diff) |
| 3. Lean 复核与证据边界 | 五条形式命题、三项逻辑公理、多个内核复核、独立命题对照、可复现性与审议条件 | [对比](03-lean/comparison.zh-CN.diff) | [对比](03-lean/comparison.en.diff) | [对比](03-lean/comparison.ja.diff) |

## 来源与核对结果

读取 Alpöge 四页原始声明。《Remark》把 θ 提升链长度取 √X 的建议归于 Claude。作者将狄利克雷版 GRH 列为已取得的结果，对更广范围的 ERH 则表达延伸期待。方法篇的 `Nr ≤ D` 与 `Bᵐ` 都标明为说明性例子。展述稿页数和分卷数量均以原声明为准。 [Alpöge 原始说明](https://alpo.ge/remark.pdf) · [Bombieri 的问题说明](https://www.claymath.org/wp-content/uploads/2022/05/riemann.pdf)

三篇均更新了用户材料中的核验状态。Sutherland 公布的 11 月 20 日 22:05 UTC 记录显示 175,187 个模块零错误编译，五条目标定理只依赖三个 Lean 标准公理，多个独立实现接受了相应产物。报告中完整 Comparator 和部分导出重放仍在运行。报告说明原始构建没有使用沙箱，77 个模块的样本与常规 Lake 构建逐字节一致。此处记录公开复核的结论，编辑过程中没有运行 Lean 归档。 [Sutherland 的复核和日志](https://math.mit.edu/~drew/grh/) · [Lean 官方文档](https://lean-lang.org/doc/reference/latest/ValidatingProofs/)

Clay 的问题页仍列为未解决。三语保留了奖项审议的发表渠道、至少两年和数学界普遍接受三个条件。 [Clay 问题页](https://www.claymath.org/millennium/riemann-hypothesis/) · [Clay 审议规则](https://www.claymath.org/millennium-problems/rules/)

## 表达与三语一致性

各目录保留初稿、差异及中文检测。第一篇判读 24 条候选，第二篇改前和改后各判读 32 条，第三篇判读 19 条。主要修改包括去掉多余的话题提示、统一术语指称和精简局部衔接措辞。正常并列与技术条件保留。检测结果用于定位编辑问题，未作为单篇显著性或作者身份的判断。英文和日文沿用相同证据边界，各按本语言校对术语与表达。

三语逐篇核对了 7 个正文小节、两条同语系列链接、数学范围和来源。专题挂在现有 Anthropic 项目下，注册表读回确认仍保留该项目的单一主条目。

## 验收

- `pnpm content:check` 扫描 7,506 篇 MDX，通过。
- `pnpm build` 生成 8,388 个静态页面。9 个研究详情逐页核对 HTML 语言、正文语言、canonical、27 个语言对应链接、18 条同语系列链接及三份 RSS。构建报告有 5 条既有的文件路径匹配警告。
- 市场任务在加稿前独立通过 400 项测试及 8,379 页构建，两份 Pulse 归档的哈希读回一致。 [市场实施与验收记录](../../plans/2026-11-20-market-dashboard-rollout.md)
