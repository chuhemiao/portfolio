# 去AI味 · 前后对比报告



/tmp/codex-riemann-research-20261121/a/before/claude-riemann-hypothesis-claim-evidence.mdx → /tmp/codex-riemann-research-20261121/a/final/claude-riemann-hypothesis-claim-evidence.mdx



标记约定：<del>删除线</del> = 被改掉/删掉的原文；<ins>下划线</ins> = 改后的新文字；指标表 ↓/↑ = 相对人类参考的改善/恶化。



## 一、指标前后对比



| 指标 | 改前 | 改后 | 变化 | 人类参考 |
|---|---|---|---|---|
| 不是A而是B 对举 | 0.0 | 0.0 | → | ≈0.22 |
| 结论提示冒号 | 0.0 | 0.0 | → | ≈0.08 |
| 密集并列 | 0.975 | 1.006 | → | ≈1.78 |
| 前置定语长 | 0.0 | 0.0 | → | ≈0.1 |
| 句长起伏 | 1.155 | 1.184 | → | 人类≈0.54 / AI≈0.46 |
| 节长参差 | 0.35 | 0.366 | → | 人类≈0.83 / AI≈0.31 |
| 分节密度 | 3.413 | 3.519 | → | 人类≈0.32 / AI≈1.26 |
| 相邻句同构 | 7.14 | 14.29 | → | 人类≈5.52 / AI≈8.71 |
| 三连同构(粗筛) | 0.0 | 0.0 | → | 人类≈0.41 / AI≈0.84 |
| 换词多样性 | 1644 | 1209 | → | 人类≈143 / AI≈227 |
| 破折号（指纹） | 0.0 | 0.0 | → | Opus 狂用 +0.95 / GPT 少用 −0.54，方向相反分模型看 |
| 分号（指纹） | 0.0 | 0.0 | → | GPT 指纹 δ+0.80；Opus 无差 |
| 引号（指纹） | 0.0 | 0.0 | → | Opus 偏少 δ−0.67，报告用不改 |

↓/↑ = 向人类参考方向改善/恶化；指纹行不判方向。参考值=270 对同题配对实测人类中位（每千字或 CV 值），见 RESEARCH.md。

## 语义层判读（会话内模型按实验判据逐条判断）

四项在 270 对配对语料统计显著；同义重命名为单模型判据（弱一档）。判据见 references/semantic-criteria.md。

### 同义重命名（段级）（8 条：0组 6，无法判断 1，1组 1）


### 衔接方式（段间接口）（7 条：明确承接 3，无法判断 2，有关但转换突然 2）

最长连环 2 个接口；≥6 为 AI 特征，人类中位 2。

- **明确承接**（置信:高）`claude-riemann-hypothesis-claim-evidence.mdx:25`　作者履历 · 作者主页 → Alpöge 说，他先在玩具模型里把两种思路组合起来，再寻找对应的真实数学情形　理由：同一作者由履历进入当事人口述。
- **明确承接**（置信:高）`claude-riemann-hypothesis-claim-evidence.mdx:41`　Sutherland 的核验记录与日志 → 同一报告保留几个范围限定　理由：前后均在限定 Sutherland 同一核验报告。
- **明确承接**（置信:高）`claude-riemann-hypothesis-claim-evidence.mdx:45`　Sutherland 的核验记录 · 陶哲轩的公开说明 → Sutherland 报告将 GRH 范围限定为狄利克雷 L 函数　理由：明确延续核验报告的命题范围。

### 冒号分类（9 条：标题时间比例元数据或版式用途 9）



## 二、分级问题清单（改前检测）



### A 级 · 机械改（模型复核误报后处理）

**前置话题壳** 1 处

- `claude-riemann-hypothesis-claim-evidence.mdx:51`　对研究者而言

### B 级 · 建议改（模型逐条筛选后处理）

**顿号并列≥3** 2 处

- `claude-riemann-hypothesis-claim-evidence.mdx:25`　[Alpöge 的说明第 1、3、4 页](https://a
- `claude-riemann-hypothesis-claim-evidence.mdx:31`　讨论范数、整除性、Rallis 跷跷板与每步代


C 级（结构/节奏）见指标表；F 指纹见表内指纹行；比喻贴切度只能人审；本轮默认保留。用户主动要求时再列出相关原句供判断。



## 三、前后对照（改后稿全文，改动处标记）



---
title: 'Alpöge 与 Claude 的黎曼猜想证明声明，公开证据走到哪一步'
publishedAt: '2026-11-21'
summary: '从 Alpöge 的四页声明和 14 个原始分卷出发，区分黎曼猜想与狄利克雷广义黎曼猜想，核对 MIT 独立机器检查的成果、尚在运行的复核与千禧年难题的认定程序。'
slug: 'claude-riemann-hypothesis-claim-evidence'
category: 'research'
researchProjectSlug: 'anthropic-ipo-s1-ai-capital-structure-valuation-research'
language: 'zh-CN'
translationKey: 'claude-riemann-hypothesis-claim-evidence'
sourceSlug: 'claude-riemann-hypothesis-claim-evidence'
---

2026 年 11 月 20 日，数论学家 Levent Alpöge 公开表示，他相信自己与 Claude 找到了黎曼猜想的证明，并称同一方法也解决了狄利克雷 L 函数的广义黎曼猜想。他同日公开四页说明与 14 个 Lean 源码压缩分卷。MIT 数学家 Andrew Sutherland 截至当天 **22:05 UTC** 的报告已经给出编译、公理审计和独立内核检查结果。完整的 Comparator 流程仍在运行，Clay 数学研究所页面仍把黎曼猜想列为未解决。本文在 **2026 年 11 月 21 日 01:20 UTC** 左右核查公开记录，所引用的机器结果以原报告时间为准。[Alpöge 的说明](https://alpo.ge/remark.pdf) · [Sutherland 的核验记录](https://math.mit.edu/~drew/grh/) · [Clay 问题页](https://www.claymath.org/millennium/riemann-hypothesis/)

## 猜想究竟说了什么

对于实部大于 1 的复数 `s`，黎曼 ζ 函数由级数 `Σ(n ≥ 1) n^(−s)` 定义，还可以写成遍历素数的欧拉乘积。把 ζ 函数解析延拓到复平面后，负偶数 `−2, −4, …` 给出平凡零点，`s = 1` 是极点。1859 年提出的黎曼猜想要求所有非平凡零点的实部都等于 `1/2`。<del>这颗极点与那些负偶整数在识别</del><ins>读</ins>形式化命题时<del>都要留意</del>，<del>不能从文件里出现</del><ins>先检查极点与负偶数的处理，再核对它是否覆盖</ins>了<del> ζ 函数与 `1/2` 就判断它证明了原猜想</del><ins>所有非平凡零点</ins>。[Bombieri 的官方问题说明](https://www.claymath.org/wp-content/uploads/2022/05/riemann.pdf)

素数定理给出素数计数的平均趋势。黎曼的显式公式把围绕趋势的波动与 ζ 函数的零点联系起来。若黎曼猜想成立，零点实部造成的幂次至多为 `x^(1/2)`，适当汇总后会得到带对数因子的误差界。它约束的是计数偏差，而逐个素数的位置仍需要另外计算。狄利克雷版 GRH 把类似断言扩展到狄利克雷特征的 L 函数，对应的应用包括算术级数中的素数分布。[Bombieri 的官方问题说明](https://www.claymath.org/wp-content/uploads/2022/05/riemann.pdf)

## 从玩具模型到公开声明

Alpöge 的履历列出哈佛数学本科、剑桥 MASt 和 2020 年普林斯顿数学博士，博士论文为《Points on Curves》，导师是 Manjul Bhargava。他获得过 Morgan 奖，并在 2021 至 2025 年任哈佛 Society of Fellows 初级研究员。其既有研究包括椭圆曲线的整点数、数域的非单基生成，以及 Maass 形式 L 函数的低位零点。他的个人主页说明他后来转向计算机方向并加入 Anthropic。这些经历可以解释他如何选题，证明本身仍需要检查。[作者履历](https://people.math.harvard.edu/~alpoge/cv.pdf) · [作者主页](https://alpo.ge/)

Alpöge 说，他先在玩具模型里把两种思路组合起来，再寻找对应的真实数学情形。按他的回忆，靠近论证末尾时，Claude 走得比他更快。声明举出的具体例子是把一串 theta 提升用来模仿 Stepanov 方法的重数，并由 Claude 建议，对长度为 `X` 的 von Mangoldt 和，把提升链的长度取在 `√X` 的量级。Alpöge 同时说明，涉及高秩群自守形式的部分自己尚未吃透，时间线由 Claude 整理，他对某些细节的复述可能有误。<del>把</del>这段<del>叙述理解为作者</del>回顾<del>，可以知道</del><ins>记录了</ins>候选论证<del>从何而</del><ins>的</ins>来<del>，仍需</del><ins>历。各环节的检验</ins>要<del>沿</del><ins>看</ins> Lean 的依赖和可读推导<del>去验证各环节</del>。[Alpöge 的说明第 1、3、4 页](https://alpo.ge/remark.pdf)

| 日期 | 声明中对应的工作 |
|---|---|
| 10 月 6 日 | Stepanov 行列式、Iwasawa 塔的类比与 Bost 斜率不等式 |
| 10 月 20 日 | 转向以 von Mangoldt 函数为主的加权和 |
| 11 月 15 日 | 确定酉群间迭代 theta 提升的候选路线，讨论范数、整除性、Rallis 跷跷板与每步代价 |
| 11 月 16 日 | 作者刊出的粗略时间线标为 GRH |
| 11 月 20 日 | 四页声明和形式化源文件公开 |

表格按日期重排了声明的部分节点。原表共 20 项，日期并非严格顺排。Alpöge <del>一处估算</del><ins>在脚注里说</ins>，<del>自己</del>为<ins>展开</ins>论证生成<del>过</del><ins>的详细文稿</ins>超过 25 万页<del>的详细文本</del>。这个数字<del>指他</del><ins>只</ins>描述<ins>他所说</ins>的展开稿，<del>不是</del>公开<ins>发布物是四页</ins>说明<del>的篇幅，也不是</del><ins>和分卷</ins> Lean <del>代</del><ins>源</ins>码<del>页数</del>。可供检查的发布物以 [作者原始分卷](https://alpo.ge/lean.tar.gz.part01) 为准，末卷是 [第 14 卷](https://alpo.ge/lean.tar.gz.part14)。[用户提供的 GitHub 链接](https://github.com/CocoSgt/riemann-hypothesis-lean) 是镜像，不承担数学核验或版权授权。[Alpöge 的说明](https://alpo.ge/remark.pdf)

## 独立检查已经确认什么

Sutherland 的 22:05 UTC 报告把构建、机器检查和命题比较分开列出。175,187 个模块在 Lean 与 Mathlib v4.33.1 下完成编译，`Main.lean` 的五个定理经 `#print axioms` 检查只依赖 `propext`、`Classical.choice` 和 `Quot.sound`。Lean 的 `leanchecker` 重放了全部模块。独立实现的 nanoda 与 con-leche 接受完整导出，con-leche 的 `--compare` 也接受了以独立命题为挑战目标的五个定理。lean4lean 通过全部模块，其中五个模块提高步数上限后重跑成功。[Sutherland 的核验记录与日志](https://math.mit.edu/~drew/grh/)

同一报告保留几个范围限定。构建在未隔离的环境中逐文件直接调用 Lean，报告还没有把完整导出和一个隔离构建的导出逐一比对。报告里的端到端 `lake comparator` 及导出上的 Lean 默认、严格内核检查仍未结束。<del>这里已经存在公开的</del>独立机器<del>证据，</del><ins>检查已有公开结果。</ins>后续<del>检查</del><ins>工作还需</ins>要<del>做的是</del>缩小<ins>核验依赖的</ins>信任<del>边界</del><ins>范围</ins>，核对形式命题与通常使用的数学定义，并把数学机制整理成可供同行使用的论证。陶哲轩将读者引到 Lean 社区的复核讨论，也明确把消化证明策略视为后续工作。[Sutherland 的核验记录](https://math.mit.edu/~drew/grh/) · [陶哲轩的公开说明](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/)

## 已检验的 GRH 范围

Sutherland 报告将 GRH 范围限定为狄利克雷 L 函数。普通 RH 的入口采用 Mathlib 自身的 `RiemannHypothesis`，其余入口涵盖直接写出的 ζ 零点断言、临界线右侧的狄利克雷非零断言，以及狄利克雷 L 函数临界带零点的两个版本。Alpöge 在声明里将更广范围的 Extended Riemann Hypothesis 写成他预计能够继续推进的方向。这个预期没有进入已经列明的独立检验范围。[Sutherland 核验范围](https://math.mit.edu/~drew/grh/) · [Alpöge 的说明](https://alpo.ge/remark.pdf)

8 月 Anthropic 公布过另一项工作，报告称 Claude 将临界线上 ζ 零点比例的下界从 41.6% 提高到 67.2%。比例下界和全称命题的区别关系到如何解读 11 月进展。即使下界趋近 100%，依靠比例一项仍无法排除临界线外稀疏存在的零点。11 月声明的靶标是每一个非平凡零点的实部。[Anthropic 的 8 月原始报告](https://www.anthropic.com/research/riemann-zeta) · [Clay 的命题定义](https://www.claymath.org/millennium/riemann-hypothesis/)

## Clay 如何认定一个解答

Clay 数学研究所当前把黎曼猜想列为未解决。千禧年难题规则列明，候选解答须先在符合条件的发表渠道公开，从该次发表起至少经过两年，而且取得全球数学界普遍认可，才会进入审议。个人主页的公布日期或镜像发布日期本身不能确定两年时钟何时开始。<del>对研究者而言，</del>定理可以先得到形式化证据和专业论证，大奖审议<del>另有</del><ins>按</ins>机构门槛<del>。两条时间线不能从一个公</del><ins>另行</ins>开<del>压缩包直接相互推出</del><ins>始</ins>。[Clay 问题页](https://www.claymath.org/millennium/riemann-hypothesis/) · [Clay 千禧年难题规则](https://www.claymath.org/millennium-problems/rules/)

## 如果后续复核继续通过

对数论最直接的价值，是一批原本以 RH 或狄利克雷 GRH 为前提的结论有机会去掉对应前提，其余前提仍需要逐项检查。进一步的价值在于能否把 theta 提升链、整除性与误差控制整理成可复用的论证，明确哪些部分需要那么高的技术复杂度。作者预计可以大幅简化，这仍需后来工作支持。[Bombieri 的官方问题说明](https://www.claymath.org/wp-content/uploads/2022/05/riemann.pdf) · [Alpöge 的说明](https://alpo.ge/remark.pdf)

<del>对</del><ins>公开记录也给</ins> AI 研究<del>，公开记录已经足以提出</del><ins>留下了</ins>一个<del>具体</del><ins>可检验的</ins>问题。<del>模型给出的候选步骤能否被</del>人和另一套工具<ins>能否</ins>独立复用、修改或驳回<ins>模型提出的步骤</ins>？<del>这次公开材料令问题更容易检验。</del>一次在专门合作与形式化环境中的进展，仍不能替其他数学问题或其他学科作答。[Alpöge 的说明](https://alpo.ge/remark.pdf) · [Sutherland 的核验记录](https://math.mit.edu/~drew/grh/)

## 系列阅读

- [二、从 Stepanov 到 theta 提升链](/zh-CN/blog/claude-riemann-theta-lift-stepanov-method)
- [三、Lean 如何核对一份黎曼猜想证明](/zh-CN/blog/claude-riemann-lean-proof-verification)
