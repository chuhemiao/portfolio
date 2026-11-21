# 去AI味 · 前后对比报告



/tmp/codex-riemann-research-20261121/b/baseline/claude-riemann-theta-lift-stepanov-method.mdx → /tmp/codex-riemann-research-20261121/b/final/claude-riemann-theta-lift-stepanov-method.mdx



标记约定：<del>删除线</del> = 被改掉/删掉的原文；<ins>下划线</ins> = 改后的新文字；指标表 ↓/↑ = 相对人类参考的改善/恶化。



## 一、指标前后对比



| 指标 | 改前 | 改后 | 变化 | 人类参考 |
|---|---|---|---|---|
| 不是A而是B 对举 | 0.0 | 0.0 | → | ≈0.22 |
| 结论提示冒号 | 0.0 | 0.0 | → | ≈0.08 |
| 密集并列 | 0.558 | 0.574 | → | ≈1.78 |
| 前置定语长 | 0.0 | 0.0 | → | ≈0.1 |
| 句长起伏 | 1.228 | 1.267 | → | 人类≈0.54 / AI≈0.46 |
| 节长参差 | 0.365 | 0.369 | → | 人类≈0.83 / AI≈0.31 |
| 分节密度 | 3.908 | 4.016 | → | 人类≈0.32 / AI≈1.26 |
| 相邻句同构 | 13.33 | 13.33 | → | 人类≈5.52 / AI≈8.71 |
| 三连同构(粗筛) | 0.0 | 0.0 | → | 人类≈0.41 / AI≈0.84 |
| 换词多样性 | 1484 | 1241 | → | 人类≈143 / AI≈227 |
| 破折号（指纹） | 0.0 | 0.0 | → | Opus 狂用 +0.95 / GPT 少用 −0.54，方向相反分模型看 |
| 分号（指纹） | 1.117 | 0.0 | → | GPT 指纹 δ+0.80；Opus 无差 |
| 引号（指纹） | 0.0 | 0.0 | → | Opus 偏少 δ−0.67，报告用不改 |

↓/↑ = 向人类参考方向改善/恶化；指纹行不判方向。参考值=270 对同题配对实测人类中位（每千字或 CV 值），见 RESEARCH.md。

## 语义层判读（会话内模型按实验判据逐条判断）

四项在 270 对配对语料统计显著；同义重命名为单模型判据（弱一档）。判据见 references/semantic-criteria.md。

### 同义重命名（段级）（12 条：0组 11，1组 1）


### 衔接方式（段间接口）（11 条：有关但转换突然 6，明确承接 5）

最长连环 3 个接口；≥6 为 AI 特征，人类中位 2。

- **明确承接**（置信:中）`claude-riemann-theta-lift-stepanov-method.mdx:23`　在 σ  1 的区域，黎曼 ζ 函数有两个绝对收敛的表达式，一边是对正整数的和，另一边是对素数的 Euler 乘积 → 展开每个因子的几何级数，再把它们相乘　理由：对紧邻的 Euler 乘积逐项展开。
- **明确承接**（置信:中）`claude-riemann-theta-lift-stepanov-method.mdx:34`　对非整数 x  1，冯·曼戈尔特显式公式写作如下，零点按重数计，按虚部绝对值对称截断再取极限 → s = 1 的极点给出主项 x，非平凡零点给出带振荡的修正　理由：继续解释上段给出的显式公式。
- **明确承接**（置信:中）`claude-riemann-theta-lift-stepanov-method.mdx:50`　Alpöge 原始声明，第 1、3–4 页 · Gan、Qiu 与 Takeda 关于全局 θ 提升及 Rallis 公式的研究 → 要把这套方法用于整数，得把提升得到的整除性或消去效果与提升的范数、层次及归一化放进同一　理由：从提升链定性描述转入同一提升链的定量代价。
- **明确承接**（置信:中）`claude-riemann-theta-lift-stepanov-method.mdx:54`　Bᵐ 是用于说明累积代价的示意量 → 11 月 15 日的条目列出多次提升的范数与整除性下界、Rallis 公式与 seesaw（跷跷板）恒等式、每步代价的精确计算、跨 Hecke 特征的平均及余体积与同余计算　理由：从示意代价转入原声明列出的范数与整除性估计。
- **明确承接**（置信:中）`claude-riemann-theta-lift-stepanov-method.mdx:56`　Alpöge 原始声明，时间线第 8–18 项 · Rallis 内积公式相关论文 → 数论复核有三处值得追查　理由：整理上一段提及的定量验证待办。

### 冒号分类（9 条：标题时间比例元数据或版式用途 9）



## 二、分级问题清单（改前检测）



### B 级 · 建议改（模型逐条筛选后处理）

**顿号并列≥3** 1 处

- `claude-riemann-theta-lift-stepanov-method.mdx:54`　seesaw（跷跷板）恒等式、每步代价的精确计算、跨 Hecke 特征的平均及

### X 级 · 已否决特征（实测不是 AI 味——不要改）

**「这意味着」复述(已否决)** 1 处

- `claude-riemann-theta-lift-stepanov-method.mdx:34`　这说明


C 级（结构/节奏）见指标表；F 指纹见表内指纹行；比喻贴切度只能人审；本轮默认保留。用户主动要求时再列出相关原句供判断。



## 三、前后对照（改后稿全文，改动处标记）



---
title: 'Claude 与黎曼猜想（二）从 Stepanov 重数到迭代 θ 提升'
publishedAt: '2026-11-21'
summary: '从 Euler 乘积、冯·曼戈尔特加权和与显式公式出发，解释 Alpöge 声明中迭代 θ 提升的有限域类比、√X 链长与范数及整除性估计的难点。'
slug: 'claude-riemann-theta-lift-stepanov-method'
category: 'research'
researchProjectSlug: 'anthropic-ipo-s1-ai-capital-structure-valuation-research'
language: 'zh-CN'
translationKey: 'claude-riemann-theta-lift-stepanov-method'
sourceSlug: 'claude-riemann-theta-lift-stepanov-method'
---

Levent Alpöge 在 2026 年 11 月 20 日发布的《Remark》中提出一条技术路线。他和 Claude 试图<del>把</del><ins>用数域上的迭代 θ 提升模拟</ins>有限域上 Stepanov 方法<del>使用</del><ins>中</ins>的重数<del>，转译成数域上反复迭代 θ 提升的算术效应</del>。声明将冯·曼戈尔特和的尺度记为 X，并把大约 √X 的链长归于 Claude。本文解释这些概念之间的联系。截至 2026 年 11 月 21 日 01:20 UTC，MIT 的 Andrew Sutherland 已报告 175,187 个模块构建成功，多个独立检查实现已接受相应形式化产物。此处关注的是数学路线，逐条解释证明还需要回到完整形式化及其依赖。 [Alpöge 原始声明](https://alpo.ge/remark.pdf) · [陶哲轩的初步说明](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/) · [Sutherland 的形式验证记录](https://math.mit.edu/~drew/grh/)

## 素数如何进入 ζ 函数

写复变量 s = σ + it。在 σ > 1 的区域，黎曼 ζ 函数有两个绝对收敛的表达式，一边是对正整数的和，另一边是对素数的 Euler 乘积。

```text
ζ(s) = Σₙ≥₁ n⁻ˢ = ∏ₚ (1 − p⁻ˢ)⁻¹.
```

展开每个因子的几何级数，再把它们相乘。正整数有唯一素因子分解，所以每个正整数恰好出现一次。对 Euler 乘积取对数再求导，则得到另一个绝对收敛的级数 `−ζ′(s)/ζ(s) = Σₙ≥₁ Λ(n)n⁻ˢ`。冯·曼戈尔特函数 Λ 在素数幂 pᵏ（k ≥ 1）处取 log p，其余为零。例如 Λ(8) = log 2，Λ(12) = 0。这解释了为何显式公式自然研究 ψ(x) = Σₙ≤ₓ Λ(n)。素数计数 π(x) 则可以结合素数幂贡献和分部求和来分析。 [NIST DLMF §25.2](https://dlmf.nist.gov/25.2) · [NIST DLMF §27.2](https://dlmf.nist.gov/27.2)

## 零点控制的是波动幅度

ζ 经过亚纯延拓后，在 s = 1 有简单极点，非平凡零点位于临界带 `0 < σ < 1`。RH 断言这些零点都在 σ = 1/2。对非整数 x > 1，冯·曼戈尔特显式公式写作如下，零点按重数计，按虚部绝对值对称截断再取极限。

```text
ψ(x) = x − lim(T→∞) Σ[ρ: |Im ρ|≤T] x^ρ/ρ
       − log(2π) − ½ log(1 − x⁻²).
```

s = 1 的极点给出主项 x，非平凡零点给出带振荡的修正。若 ρ = β + iγ，则 x^ρ = x^β exp(iγ log x)，实部 β 决定单项的幂次，虚部 γ 决定它随 log x 变化的频率。这说明了为什么实部 1/2 很重要。经典的条件性推论为 `ψ(x) = x + O(√x log²x)`。这个误差界还用到了零点计数和截断控制，不能直接把各项的 √x 相加。素数定理本身给出 ψ(x) ∼ x，而 RH 对偏离主项的量级提出更强的约束。 [陶哲轩讲义，定理 8](https://terrytao.wordpress.com/2021/02/12/246b-notes-4-the-riemann-zeta-function-and-the-prime-number-theorem/) · [Clay 对 RH 的说明](https://www.claymath.org/millennium/riemann-hypothesis/)

## 广义猜想多了哪一层

Dirichlet 特征 χ 是模 q 的周期乘法函数。它可以给不同剩余类加上不同权重。Dirichlet L 函数在 σ > 1 时由 `L(s,χ) = Σₙ≥₁ χ(n)n⁻ˢ` 定义。把 Λ(n) 换成 Λ(n)χ(n)，再利用特征的正交性，就能分离与 q 互素的不同剩余类。通常这里的 Dirichlet GRH 指每个本原 Dirichlet L 函数的非平凡零点都在临界线上。经典 ζ 对应模 1 的平凡特征。对更广泛的 L 函数，还需要另行指定命题的范围。作者对 Extended Riemann Hypothesis 的措辞是未来的期待。 [NIST DLMF §25.15](https://dlmf.nist.gov/25.15) · [Alpöge 原始声明，第 1 页](https://alpo.ge/remark.pdf)

## 有限域里，重数为什么有用

在有限域的 Stepanov 方法中，先构造一个非零辅助多项式，让关注的点成为它的高重数零点。最简的一变量例子中，如果多项式次数最多为 D，有 N 个不同的零点，而且每个零点的<del>消去阶</del><ins>重数</ins>至少为 r，那么 Nr ≤ D。假如 D = 120、r = 5，N 就至多为 24。真正困难的是同时约束次数、确保多项式非零，又能让许多导数或适当的高阶系数消失。推广到曲线时，对应的计算还涉及除子的局部消去阶。这段例子只说明重数如何转化为计数界。 [Avi Wigderson，IAS Stepanov 方法讲座](https://www.ias.edu/video/csdm/stepanov)

有限域曲线的 Weil 定理提供了类比。对光滑射影几何连通曲线在有限域 F_q 上，点数主项是 q + 1，偏差由 Frobenius 特征值控制，每个相关特征值的复绝对值为 √q。整数上的 ζ 零点没有直接照搬这套几何论证的入口。Alpöge 把寻找替代重数的困难形容为试图给整数求导。 [Wolfgang M. Schmidt 的 ICM 论文摘录](https://www.mathunion.org/fileadmin/ICM/Proceedings/ICM1974.1/ICM1974.1.ocr.pdf) · [Alpöge 原始声明，第 1 页](https://alpo.ge/remark.pdf)

## 迭代 θ 提升怎样进入论证

θ 提升利用 θ 核，把一边群上的自守数据转到另一边。Alpöge 的时间线描述的是全定号酉群之间的提升链 `U(X₀) → U(X₁) → … → U(Xₘ)`。声明的启发是让每次提升模拟一个单位的重数，再选择 m 接近 √X。这里的 X 是加权冯·曼戈尔特和的尺度<del>；</del><ins>。</ins>声明在 10 月 20 日列出的对象使用了 `(X/n − 1)₊` 之类的权重，并扣除了主项。它与上<del>一节中</del><ins>文</ins>未经平滑的 ψ(x) 有联系，二者的估计不能直接互换。 [Alpöge 原始声明，第 1、3–4 页](https://alpo.ge/remark.pdf) · [Gan、Qiu 与 Takeda 关于全局 θ 提升及 Rallis 公式的研究](https://arxiv.org/abs/1207.4709)

<ins>要把</ins>这<del>个类比要进入</del><ins>套方法用于</ins>整数<del>问题</del>，<del>仍需</del><ins>得</ins>把提升得到的整除性或消去效果与提升的范数、层次及归一化放进同一个不等式。一个纯示意的例子是，若每步引入一个大于 1 的固定因子 B，连续 m 步的代价可达 Bᵐ。线性增加的重数本身不保证最终界变强。<del>这里的 </del>Bᵐ <del>只</del>是<del>解释</del><ins>用于说明</ins>累积代价<del>为何必须核算，原声明没有把证明写成这个模型</del><ins>的示意量</ins>。

## √X 选择还需要哪些定量证据

11 月 15 日的条目列出多次提升的范数与整除性下界、Rallis <ins>公式</ins>与 seesaw（跷跷板）恒等式、每步代价的精确计算、跨 Hecke 特征的平均及余体积与同余计算。声明还提到朴素代价计算会遇到一个先验的 2/3 门槛。短公告没有说明这个数在最终论证中对应哪个精确指数或统一不等式。Rallis 内积公式是已有的 θ 提升范数工具<del>；</del><ins>。</ins>作者在此处报告怎样组合这些工具，仍需要经完整的形式化声明与依赖核实。 [Alpöge 原始声明，时间线第 8–18 项](https://alpo.ge/remark.pdf) · [Rallis 内积公式相关论文](https://arxiv.org/abs/1207.4709)

<del>从</del>数论<del>角度，</del>复核<del>应追</del><ins>有</ins>三处<del>实质连接</del><ins>值得追查</ins>。逐次提升的非零性及整除性需要适用于真正选定的链。局部因子、无穷位归一化和随特征变化的导子或层次，得在 m 随 X 增长时保持统一控制。最后一个估计应明确适用于哪些加权和、参数与特征，并<del>给出推回所声称</del><ins>说明如何排除临界带内偏离临界线的</ins>零点<del>范围所需的转换</del>。这些是检验路线的提问，短公告并未给出足以复算的细节。

## 这条路线目前说明了什么

<del>已知数学给出了两端的清晰结构，一端是通过</del>显式公式<del>控制</del><ins>把</ins>素数分布<del>，另一端是</del><ins>与零点相连。</ins>有限域<del>中借</del><ins>上的</ins>高重数<del>得到</del><ins>则能给出</ins>计数界。公开声明提出一条有明确参数的桥接路线，并把 GRH 列在 11 月 16 日时间线末尾。该路线最值得核对的地方是，反复提升的整除性增益在支付完整定量代价后，是否仍能导出所需的解析界。√X 是作者报告的参数选择，它的作用取决于整套不等式及其统一性。 [Alpöge 原始声明](https://alpo.ge/remark.pdf)

同专题阅读：[声明与证据](/zh-CN/blog/claude-riemann-hypothesis-claim-evidence) · [怎样核验 Lean 形式化证明](/zh-CN/blog/claude-riemann-lean-proof-verification)
