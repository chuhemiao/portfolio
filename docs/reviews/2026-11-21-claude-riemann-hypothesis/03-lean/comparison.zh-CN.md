# 去AI味 · 前后对比报告



/tmp/codex-riemann-research-20261121/c/before/claude-riemann-lean-proof-verification.mdx → /tmp/codex-riemann-research-20261121/c/claude-riemann-lean-proof-verification.mdx



标记约定：<del>删除线</del> = 被改掉/删掉的原文；<ins>下划线</ins> = 改后的新文字；指标表 ↓/↑ = 相对人类参考的改善/恶化。



## 一、指标前后对比



| 指标 | 改前 | 改后 | 变化 | 人类参考 |
|---|---|---|---|---|
| 不是A而是B 对举 | 0.0 | 0.0 | → | ≈0.22 |
| 结论提示冒号 | 0.0 | 0.0 | → | ≈0.08 |
| 密集并列 | 1.913 | 1.982 | → | ≈1.78 |
| 前置定语长 | 0.0 | 0.0 | → | ≈0.1 |
| 句长起伏 | 1.017 | 1.327 | → | 人类≈0.54 / AI≈0.46 |
| 节长参差 | 0.382 | 0.358 | → | 人类≈0.83 / AI≈0.31 |
| 分节密度 | 4.464 | 4.624 | → | 人类≈0.32 / AI≈1.26 |
| 相邻句同构 | 9.09 | 9.09 | → | 人类≈5.52 / AI≈8.71 |
| 三连同构(粗筛) | 0.0 | 0.0 | → | 人类≈0.41 / AI≈0.84 |
| 换词多样性 | 1222 | 990 | → | 人类≈143 / AI≈227 |
| 破折号（指纹） | 0.0 | 0.0 | → | Opus 狂用 +0.95 / GPT 少用 −0.54，方向相反分模型看 |
| 分号（指纹） | 0.0 | 0.0 | → | GPT 指纹 δ+0.80；Opus 无差 |
| 引号（指纹） | 0.0 | 0.0 | → | Opus 偏少 δ−0.67，报告用不改 |

↓/↑ = 向人类参考方向改善/恶化；指纹行不判方向。参考值=270 对同题配对实测人类中位（每千字或 CV 值），见 RESEARCH.md。

## 语义层判读（会话内模型按实验判据逐条判断）

四项在 270 对配对语料统计显著；同义重命名为单模型判据（弱一档）。判据见 references/semantic-criteria.md。

### 同义重命名（段级）（6 条：0组 6）


### 衔接方式（段间接口）（5 条：无法判断 5）

最长连环 0 个接口；≥6 为 AI 特征，人类中位 2。


### 冒号分类（8 条：标题时间比例元数据或版式用途 8）



## 二、分级问题清单（改前检测）



### B 级 · 建议改（模型逐条筛选后处理）

**顿号并列≥3** 3 处

- `claude-riemann-lean-proof-verification.mdx:4`　本文拆解五条定理的命题对照、标准公理、独立内核
- `claude-riemann-lean-proof-verification.mdx:20`　自变量 `s` 的范围、模数、Dirichlet 特征
- `claude-riemann-lean-proof-verification.mdx:49`　公开产物应保留目标清单、版本、退出状态和未完成项


C 级（结构/节奏）见指标表；F 指纹见表内指纹行；比喻贴切度只能人审；本轮默认保留。用户主动要求时再列出相关原句供判断。



## 三、前后对照（改后稿全文，改动处标记）



---
title: "Claude 与黎曼猜想 3/3｜Lean 复核已经通过了哪些检查？"
publishedAt: "2026-11-21"
summary: "Sutherland 公布了 175,187 个模块的构建与复核结果。本文拆解五条定理的命题对照、标准公理、独立内核，以及仍待完成的隔离复现和数学审阅。"
slug: "claude-riemann-lean-proof-verification"
category: "research"
language: "zh-CN"
translationKey: "claude-riemann-lean-proof-verification"
sourceSlug: "claude-riemann-lean-proof-verification"
<ins>researchProjectSlug: "anthropic-ipo-s1-ai-capital-structure-valuation-research"
</ins>---

## 已有独立复核结果

11 月 20 日，Levent Alpöge 发布说明，称他与 Claude 找到黎曼猜想及其 Dirichlet 广义形式的证明。原始 Lean 源码分成 14 卷。<del>随后，</del>MIT 数学家 Andrew Sutherland <ins>随后</ins>公布了<del>他用</del><ins>在</ins> Claude Code 协助<ins>下</ins>完成的独立复核。<del>其页面</del><ins>报告的</ins>最<del>后标注的</del><ins>近</ins>更新时间为 **2026 年 11 月 20 日 22:05 UTC**。页面记录了 175,187 个模块零错误编译、五条定理的公理检查，以及独立内核的成功结果。<del>下</del><ins>本</ins>文<del>按该版本</del><ins>以这一时间点</ins>的报告<del>说明证据状态</del><ins>为准</ins>。 [Alpöge 原始声明](https://alpo.ge/remark.pdf) · [Sutherland 复核记录](https://math.mit.edu/~drew/grh/)

## 先认出机器检查的是哪一道题

Sutherland 指向 `Main.lean` 中的 `riemannHypothesis : RiemannHypothesis`。右侧的命题来自 Mathlib，要求任取一个复数，若它是 ζ 函数的零点、不是负偶数平凡零点，且不等于 1，就必须有实部 1/2。形式化还要显式处理在数学上是极点的 1，因为 Mathlib 中的 ζ 函数以从复数到复数的全函数表示。<del>逐项</del>核对函数<ins>定义</ins>、零点范围和量词，<del>才能把 Lean 文件里的结论</del><ins>可以确认形式命题</ins>与经典命题<del>接上</del><ins>是否一致</ins>。 [Mathlib 的 ζ 函数与 RH 定义](https://leanprover-community.github.io/mathlib4_docs/Mathlib/NumberTheory/LSeries/RiemannZeta.html#RiemannHypothesis) · [Sutherland 复核记录](https://math.mit.edu/~drew/grh/)

另外四条包含展开写出的 RH、Dirichlet L 函数在指定右半平面的非消失命题，以及两条零点在线命题，一般形式和本原特征形式各一条。验证范围的 GRH 专指 **Dirichlet L 函数**。作者对更广义<ins>的</ins>情形另有期待，核对报告的<ins>范围限于这</ins>五条<del>结论有明确范围</del><ins>命题</ins>。自变量 `s` 的范围、模数、Dirichlet 特征，以及平凡特征在 `s = 1` 的例外，都是阅读命题时要注意的细节。 [独立命题文件](https://github.com/Deicyde/riemann-hypothesis/blob/main/src/Challenge.lean) · [Alpöge 原始声明](https://alpo.ge/remark.pdf)

## 五条定理经由哪些独立检查？

| 已公开的检查 | 截至报告时间的结果 |
| --- | --- |
| 源码构建及 Lean 内核重放 | Lean 与 Mathlib v4.33.1 下，175,187 个模块全部编译。复核记录称 `leanchecker` 逐模块重放也全部通过。 |
| 定理的公理依赖 | 五条定理只依赖 `propext`、`Classical.choice`、`Quot.sound`。 |
| 导出文件的独立内核检查 | nanoda 与相应版本的 con-leche 均接受完整导出。 |
| 与独立命题对照 | con-leche 的 `--compare` 模式接受五条目标命题，命题文件仅导入 Mathlib。 |
| 编译文件的另一个实现 | lean4lean 最终接受全部 175,187 个模块，其中 5 个模块提高了计算步数上限后通过。 |

同一报告中的 `lake comparator` 端到端运行，以及 Lean 默认和 paranoid 内核对导出文件的检查，在该时间点仍在运行。报告还列出因不支持所需类型而退出的旧检查器版本，退出原因和内核判定需要一起读。 [Sutherland 的检查表和日志](https://math.mit.edu/~drew/grh/)

## 公理报告要追到真正的目标定理

`#print` 显示既定环境中的声明，`#print axioms` 列出证明用到的公理，包括间接依赖。<ins>报告列出的</ins>三个<del>报告中的</del>公理是 Lean <del>常见</del>的标准逻辑公理。若目标依赖出现 `sorryAx`，则有未填补的证明义务。若出现自定义或原生计算引入的公理，还须检查其可信前提。审阅者<del>要读取的是</del><ins>应核对</ins>目标定理的依赖<del>，而不是整个源码里某个词出现了多少次</del><ins>链</ins>。以下仅列报告可定位的声明和查询形式。 [Lean 官方核验文档](https://lean-lang.org/doc/reference/latest/ValidatingProofs/) · [Sutherland 的公理审计](https://math.mit.edu/~drew/grh/audit.log)

```lean
#print riemannHypothesis
#print axioms riemannHypothesis
```

<del>即使依赖看起来干净，仍有另一个问题。程序里叫</del><ins>还要核对</ins> `RiemannHypothesis` 的<del>声明也要核对</del>定义，<ins>确认</ins>量词和例外<del>须与</del><ins>符合</ins>预期<del>相符</del>。把目标命题写在只导入受信任 Mathlib 的独立环境里，再与提交的证明对照，可以检验这一层。挑战文件里的占位证明只是核验规格。验证器还要确认提交真正给出了目标定理的证明。 [Lean 官方核验文档](https://lean-lang.org/doc/reference/latest/ValidatingProofs/) · [独立命题文件](https://github.com/Deicyde/riemann-hypothesis/blob/main/src/Challenge.lean)

## 怎样把一次成功核对变成可复现的证据

源码、已经编译的 `.olean` 和可交给其他内核的导出物，需要各自的版本和摘要。Sutherland 给出了源码档案、挑战和解答导出物的 SHA-256。摘要匹配说明核对者使用的字节一致。<del>它本身没有验证一个</del>定理<ins>能否成立，需要另外通过内核检查</ins>。此次报告的源文件在没有沙箱的云机器上用 `lean` 分别编译，77 个模块的样本与常规 Lake 构建逐字节相同，完整集合尚无这一对照，解答导出也继承同一来源限制。 [Sutherland 的来源与限制](https://math.mit.edu/~drew/grh/)

更强的复现应事先固定工具链和依赖，分别记录原档及导出摘要，在隔离环境中从源码重建解答，将独立命题保存在提交无法改写的环境，再交给不同内核验证。公开产物应保留目标清单、版本、退出状态和未完成项。这样后来者才能区分原始源码的重建、已有编译文件的重放和同一个导出物的跨内核检查。本文核对的是公开报告与命题，未自行运行归档。 [Lean 官方核验文档](https://lean-lang.org/doc/reference/latest/ValidatingProofs/) · [独立 Comparator 验证方案](https://github.com/Deicyde/riemann-hypothesis)

## 下一步的数学工作在哪里？

<del>现有记录已经支持一个有分量的判断。</del>独立<del>检查者</del><ins>复核</ins>报告<ins>显示</ins>，指定的五条形式命题与挑战规格对应，并在所列内核中通过了检查。数论同行还可以沿着实际依赖图找出证明的关键引理、理解迭代 θ 提升如何传递估计，进而检验它可以简化到什么程度。Tao 在 11 月 20 日的文章中把验证和提炼证明策略都列为正在推进的工作。 [Tao 的 11 月 20 日记录](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/)

Clay 数学研究所对千禧年奖另有规则。候选解答须在合格渠道发表，发表后须经过至少两年，还要得到国际数学界普遍认可。奖项资格、数学界形成共识和机器接受一份具体形式证明，各自有可核对的证据。读到新消息时，可以先问它补齐了哪项。 [Clay 的黎曼猜想页面](https://www.claymath.org/millennium/riemann-hypothesis/) · [千禧年奖规则](https://www.claymath.org/millennium-problems/rules/)

## 系列文章

- [第一篇｜主张与证据](/zh-CN/blog/claude-riemann-hypothesis-claim-evidence)
- [第二篇｜从 Stepanov 到 θ 提升](/zh-CN/blog/claude-riemann-theta-lift-stepanov-method)
