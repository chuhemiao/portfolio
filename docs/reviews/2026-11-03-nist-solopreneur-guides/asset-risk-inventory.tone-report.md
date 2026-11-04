# 去AI味 · 前后对比报告



/Users/chuhemiao/indie/portfolio/docs/reviews/2026-11-03-nist-solopreneur-guides/baseline/nist-solopreneur-cybersecurity-asset-risk-inventory.mdx → /Users/chuhemiao/indie/portfolio/content/blog/2026/thoughts/nist-solopreneur-cybersecurity-asset-risk-inventory.mdx



标记约定：<del>删除线</del> = 被改掉/删掉的原文；<ins>下划线</ins> = 改后的新文字；指标表 ↓/↑ = 相对人类参考的改善/恶化。



## 一、指标前后对比



| 指标 | 改前 | 改后 | 变化 | 人类参考 |
|---|---|---|---|---|
| 不是A而是B 对举 | 0.0 | 0.0 | → | ≈0.22 |
| 结论提示冒号 | 0.0 | 0.0 | → | ≈0.08 |
| 密集并列 | 5.666 | 5.631 | → | ≈1.78 |
| 前置定语长 | 0.0 | 0.0 | → | ≈0.1 |
| 句长起伏 | 1.193 | 1.18 | → | 人类≈0.54 / AI≈0.46 |
| 节长参差 | 0.59 | 0.51 | → | 人类≈0.83 / AI≈0.31 |
| 分节密度 | 3.399 | 3.378 | → | 人类≈0.32 / AI≈1.26 |
| 相邻句同构 | 22.73 | 22.73 | → | 人类≈5.52 / AI≈8.71 |
| 三连同构(粗筛) | 0.0 | 0.0 | → | 人类≈0.41 / AI≈0.84 |
| 换词多样性 | 1242 | 1225 | → | 人类≈143 / AI≈227 |
| 破折号（指纹） | 0.0 | 0.0 | → | Opus 狂用 +0.95 / GPT 少用 −0.54，方向相反分模型看 |
| 分号（指纹） | 5.666 | 1.689 | → | GPT 指纹 δ+0.80；Opus 无差 |
| 引号（指纹） | 0.0 | 0.0 | → | Opus 偏少 δ−0.67，报告用不改 |

↓/↑ = 向人类参考方向改善/恶化；指纹行不判方向。参考值=270 对同题配对实测人类中位（每千字或 CV 值），见 RESEARCH.md。

## 语义层判读（会话内模型按实验判据逐条判断）

四项在 270 对配对语料统计显著；同义重命名为单模型判据（弱一档）。判据见 references/semantic-criteria.md。

### 同义重命名（段级）（12 条：0组 10，无法判断 1，1组 1）


### 衔接方式（段间接口）（11 条：有关但转换突然 6，明确承接 4，无法判断 1）

最长连环 2 个接口；≥6 为 AI 特征，人类中位 2。

- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:43`　若需要向顾问分享清单，先检查是否包含客户资料或敏感账号信息 → 完成一张卡时，应能找到对应资产并核实访问者　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:76`　「三项」只用于控制起步工作量，不是 NIST 要求的数量 → 先处理影响大且存在明确薄弱点的事项　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:92`　不要因为供应商写着「安全」就把责任栏留空，也不要把某个美国法规名称套给所有国家、所有业务 → 这次盘点完成时，应留下资产清单、一条已核实的数据流、当前前三项风险，以及有负责人的义务和供应商问题　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:94`　每个未知项都应有下一步，而不是用勾选掩盖 → 新增服务、改变客户数据用途或开始聘人后，回头更新这些记录　理由：同一操作或总结继续展开，教程关系应保留

### 冒号分类（10 条：标题时间比例元数据或版式用途 8，空转提示 2）



## 二、分级问题清单（改前检测）



### B 级 · 建议改（模型逐条筛选后处理）

**顿号并列≥3** 10 处

- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:4`　盘点独立业务的设备、账号、数据和第三方依赖
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:22`　T CSF 2.0 包含治理、识别、保护
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:22`　检测、响应、恢复六个函数
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:26`　先从邮箱、收款、敏感文件
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:32`　产与用途 | 设备或服务名称、可定位的标识、支撑哪项交付 |
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:39`　| 下一步 | 待处理动作、负责人、计划复查日期 |
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:57`　核对数据留存、训练、访问权限和保密条款
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:63`　NIST 将风险与威胁、脆弱性、事件发生的可能性及影响联系起
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:72`　| 业务影响 | 对交付、客户资料、资金或信誉有什么影响 |
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:92`　应留下资产清单、一条已核实的数据流、当前前三项风险

### X 级 · 已否决特征（实测不是 AI 味——不要改）

**空转句引列表(已否决)** 3 处

- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:28`　为每项资产复制下面的自编记录卡：
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:47`　依次填写：
- `nist-solopreneur-cybersecurity-asset-risk-inventory.mdx:82`　把下面的三类问题写进一张责任表：


C 级（结构/节奏）见指标表；F 指纹见表内指纹行；比喻贴切度只能人审；本轮默认保留。用户主动要求时再列出相关原句供判断。



## 三、前后对照（改后稿全文，改动处标记）



---
title: "一人业务网络安全指南（一）：先做资产清单，再排风险"
publishedAt: "2026-11-03"
summary: "以 NIST CSWP 50 正式版为依据，盘点独立业务的设备、账号、数据和第三方依赖，写出可执行的风险优先级与责任清单。"
slug: "nist-solopreneur-cybersecurity-asset-risk-inventory"
category: "thoughts"
language: "zh-CN"
translationKey: "nist-solopreneur-cybersecurity-asset-risk-inventory"
sourceSlug: "nist-solopreneur-cybersecurity-asset-risk-inventory"
---

邮箱、收款账号或存放客户资料的云盘一旦出问题，哪些工作会停下来？先把这些依赖写清楚，后面的安全设置才有对象。

本系列依据 2026 年 11 月 2 日发布的 [NIST CSWP 50 正式版](https://csrc.nist.gov/pubs/cswp/50/small-business-cybersecurity-non-employer-firms/final)编写。<del>它面向</del><ins>原文的无雇员企业，指</ins>除<del>经营者本人</del><ins>业主</ins>外没有<ins>受薪</ins>雇员<del>、IT 环境较简单</del>的企业，<del>也适合</del><ins>并不要求只有一位业主。本系列聚焦</ins>自由职业者和独立开发者<ins>一个人经营、IT 环境较简单的</ins>起步<del>参考</del><ins>情境</ins>。<del>[NIST 的发布说明](https://www.nist.gov/news-events/news/2026/11/self-employed-solopreneur-nist-has-cybersecurity-guide-just-you)介绍了这一受众。</del>

**下面的表格、前三项排序和完成标准是作者的实践化整理，不是 NIST 原表，也不代表通过合规检查。** 原文第 10 页明确说，这些表格不作为检查清单或合规判定标准<del>；</del><ins>。</ins>附录 D–J 的工作表在另一个电子表格文件里，本文没有复刻那些工作表。

## 1. 先写清要维持的业务

用一句话填完：本业务需要持续提供「____」，依赖「____」，中断会影响「____」。先写当前实际交付，不必把未来设想的系统全列进来。

NIST CSF 2.0 包含治理、识别、保护、检测、响应、恢复六个函数。本篇主要落实治理与识别<del>；</del><ins>。</ins>第二篇处理日常保护和检测，第三篇准备响应与恢复。六者共同管理风险，不能把完成六个标题当作获得认证。[原文第 9–10 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=13)

## 2. 建一份能维护的资产清单

先从邮箱、收款、敏感文件、密码管理器和关键云服务入手，再补充工作设备及网络中的其他设备。这些优先关注的账号在原文第 2 页有列举<del>；</del><ins>。</ins>资产也包括软件、数据和第三方服务。[原文第 2–3 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=6)

为每项资产复制下面的自编记录卡：

| 字段 | 填写内容 |
| --- | --- |
| 资产与用途 | 设备或服务名称、可定位的标识、支撑哪项交付 |
| 所有者与访问者 | 谁负责，哪些人或第三方能访问，权限到何时 |
| 数据与敏感度 | 接收、保存或传送什么，是否涉及客户资料 |
| 位置与依赖 | 在哪里，依赖哪个设备、账号或服务 |
| 出问题的影响 | 会泄露、被改动还是无法使用，哪些工作会停 |
| 现有保护状态 | 独立密码、MFA 和更新是否已核对；未知就写待核 |
| 恢复入口 | 已核实的服务商恢复入口、恢复联系信息的存放位置 |
| 下一步 | 待处理动作、负责人、计划复查日期 |

不要把实际密码、令牌或恢复码写在这份普通清单里。这是本文的记录边界<del>；</del><ins>。</ins>清单只保存状态及受控存放位置。若需要向顾问分享清单，先检查是否包含客户资料或敏感账号信息。

完成一张卡时，应能找到对应资产并核实访问者。只写「云服务，安全」不算完成。个人与业务资产混用时，把混用关系记下来<del>；</del><ins>。</ins>原文建议尽可能减少这种混用，并在共用设备上区分账号。

## 3. 画出一条真实的数据流

挑一项正在做的客户交付，依次填写：

```text
数据来自哪里：____
经由哪些设备或服务处理：____
保存或共享到哪里：____
谁能访问：____
何时不再需要，怎样处理：____
```

检查是否漏掉外包人员、自动化连接和内容生成工具。原文第 7 页的工具章节使用 SI 一词，<del>要求</del><ins>建议</ins>盘点相关服务，核对数据留存、训练、访问权限和保密条款，并在使用生成内容前复核。不要仅凭「付费版」就推定资料不会被保存或用于训练。[原文第 6–7 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=10)

再问一句：客户是否预期这些<del>资料</del><ins>数据</ins>会被这样收集、分享和保留？网络安全措施有助于降低隐私风险，但不能覆盖全部隐私问题。保留超过业务所需的数据，即使没有发生入侵，也可能带来隐私风险。

## 4. 把风险写成可以处理的事情

NIST 将风险与威胁、脆弱性、事件发生的可能性及影响联系起来。不要把「黑客」单独写成一条可执行风险。[原文第 4、12–13 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=8)

使用下面的自编格式记录，再选出当前最需要处理的三项。「三项」只用于控制起步工作量，不是 NIST 要求的数量。

| 风险记录 | 填写提示 |
| --- | --- |
| 资产与事件 | 哪项资产可能出现什么问题 |
| 已知薄弱点 | 哪个具体条件使事件更容易发生；未核实的单列 |
| 可能性依据 | 已发现什么现象或暴露条件，不编百分比 |
| 业务影响 | 对交付、客户资料、资金或信誉有什么影响 |
| 现有措施与缺口 | 已做什么，什么还没有证据 |
| 下一步与复查 | 谁采取什么动作，怎样判断有效，何时复查 |

先处理影响大且存在明确薄弱点的事项<del>；</del><ins>。</ins>判断资料不足时，把「核实」列为下一步。不要用自编分数制造精确感。原文的风险因素没有给所有业务一套统一概率或评分阈值。

## 5. 补上合同和供应商责任

原文治理部分<del>要求</del><ins>建议</ins>跟踪适用的法律、监管和合同要求，并评估供应商风险。外包安全工作不会转移经营者保护系统和数据的责任。[原文第 5–6、11 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=15)

把下面的三类问题写进一张责任表：

- **义务**：适用的条款是什么，要求保留哪些记录，事件要通知谁；不清楚的交给合适的专业人员核实。
- **供应商**：谁管理账号与权限，谁备份数据，出问题找哪个已核实的入口。
- **退出方式**：停止合作或不再使用服务时，怎样撤掉权限，怎样处理不再需要的数据。

不要因为供应商写着「安全」就把责任栏留空，也不要把某个美国法规名称套给所有国家、所有业务。

## 完成后应留下什么

这次盘点完成时，应留下资产清单、一条已核实的数据流、当前前三项风险，以及有负责人的义务和供应商问题。每个未知项都应有下一步，而不是用勾选掩盖。

新增服务、改变客户数据用途或开始聘人后，回头更新这些记录。业务复杂度上升时，可以请专业人员协助<del>；</del><ins>。</ins>本篇不替代行业评估、合同审阅或适用法律判断。

接着执行[第二篇：保护账号与工作设备](/zh-CN/blog/nist-solopreneur-cybersecurity-accounts-devices)，或准备[第三篇：备份与事件恢复](/zh-CN/blog/nist-solopreneur-cybersecurity-backup-incident-recovery)。
