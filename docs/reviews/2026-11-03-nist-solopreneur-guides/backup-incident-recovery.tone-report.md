# 去AI味 · 前后对比报告



/Users/chuhemiao/indie/portfolio/docs/reviews/2026-11-03-nist-solopreneur-guides/baseline/nist-solopreneur-cybersecurity-backup-incident-recovery.mdx → /Users/chuhemiao/indie/portfolio/content/blog/2026/thoughts/nist-solopreneur-cybersecurity-backup-incident-recovery.mdx



标记约定：<del>删除线</del> = 被改掉/删掉的原文；<ins>下划线</ins> = 改后的新文字；指标表 ↓/↑ = 相对人类参考的改善/恶化。



## 一、指标前后对比



| 指标 | 改前 | 改后 | 变化 | 人类参考 |
|---|---|---|---|---|
| 不是A而是B 对举 | 0.0 | 0.0 | → | ≈0.22 |
| 结论提示冒号 | 0.0 | 0.0 | → | ≈0.08 |
| 密集并列 | 4.958 | 4.453 | → | ≈1.78 |
| 前置定语长 | 0.0 | 0.0 | → | ≈0.1 |
| 句长起伏 | 1.106 | 1.103 | → | 人类≈0.54 / AI≈0.46 |
| 节长参差 | 0.447 | 0.449 | → | 人类≈0.83 / AI≈0.31 |
| 分节密度 | 2.975 | 2.969 | → | 人类≈0.32 / AI≈1.26 |
| 相邻句同构 | 9.09 | 9.09 | → | 人类≈5.52 / AI≈8.71 |
| 三连同构(粗筛) | 0.0 | 0.0 | → | 人类≈0.41 / AI≈0.84 |
| 换词多样性 | 975 | 981 | → | 人类≈143 / AI≈227 |
| 破折号（指纹） | 0.0 | 0.0 | → | Opus 狂用 +0.95 / GPT 少用 −0.54，方向相反分模型看 |
| 分号（指纹） | 3.966 | 0.99 | → | GPT 指纹 δ+0.80；Opus 无差 |
| 引号（指纹） | 0.0 | 0.0 | → | Opus 偏少 δ−0.67，报告用不改 |

↓/↑ = 向人类参考方向改善/恶化；指纹行不判方向。参考值=270 对同题配对实测人类中位（每千字或 CV 值），见 RESEARCH.md。

## 语义层判读（会话内模型按实验判据逐条判断）

四项在 270 对配对语料统计显著；同义重命名为单模型判据（弱一档）。判据见 references/semantic-criteria.md。

### 同义重命名（段级）（11 条：0组 9，无法判断 1，1组 1）


### 衔接方式（段间接口）（12 条：明确承接 9，有关但转换突然 2，无法判断 1）

最长连环 4 个接口；≥6 为 AI 特征，人类中位 2。

- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:18`　备份能否取回、出了事还能联系谁、恢复前要检查什么，都适合在平时验证 → 从第一篇资产清单选一项重要交付，填写下面的自编恢复卡：　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:29`　从第一篇资产清单选一项重要交付，填写下面的自编恢复卡： → 这些问题用于明确业务需要，不能据此自行承诺一个尚未测试的恢复时间　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:35`　NIST 没有在这里为所有一人业务规定统一的备份间隔、可丢失数据量或恢复时限 → 逐项核对备份包含的数据、可用版本、访问权限、删除权限和恢复流程　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:45`　不要把云一概排除，也不要把云同步自动写成受保护的备份 → 演练记录可填写「日期、样本、备份位置、恢复入口、预期结果、实际结果、问题、下一步」　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:75`　按预案联系服务商或专业人员时，同时整理时间线： → 这份自编记录区分观察、已确认事实和猜测　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:77`　主要邮箱本身可疑时，不把它当作可靠的备用沟通渠道 → 通知对象、内容和时限取决于实际法律、监管、合同或政策要求　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:87`　无法判断完整性、仍有异常会话或发现不明转发规则时，交给合适的专业人员确认，不把系统标为已恢复 → 依照实际要求与客户、合作方协调恢复　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:91`　结束后记录发生了什么、采取了哪些响应和恢复动作，以及哪些地方需要改进，再更新资产清单、设置和预案 → 平时准备完成，应留下可访问的离线联系表、一次有范围和结果的恢复测试，以及有下一步的失败项　理由：同一操作或总结继续展开，教程关系应保留
- **明确承接**（置信:高）`nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:93`　必要时需要专业判断 → 没有统一的「做完这些就绝对安全」　理由：同一操作或总结继续展开，教程关系应保留

### 冒号分类（9 条：标题时间比例元数据或版式用途 8，定义或解释 1）



## 二、分级问题清单（改前检测）



### B 级 · 建议改（模型逐条筛选后处理）

**顿号并列≥3** 10 处

- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:12`　备份能否取回、出了事还能联系谁、恢复前要检查什么
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:14`　主要参考第 12、15、17
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:35`　逐项核对备份包含的数据、可用版本、访问权限
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:35`　服务商的同步、版本保留、备份与恢复是否覆盖同一范围
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:45`　演练记录可填写「日期、样本、备份位置
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:45`　恢复入口、预期结果、实际结果
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:61`　基本遏制措施包括断开设备网络、隔离受影响的设备或系统、撤销会话
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:77`　通知对象、内容和时限取决于实际法律、监管
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:83`　并复查 MFA、用户账号、文件共享
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:91`　还要看资产完整性、账号设置、业务验证和适用的沟通义务是否

### X 级 · 已否决特征（实测不是 AI 味——不要改）

**空转句引列表(已否决)** 5 处

- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:18`　填写下面的自编恢复卡：
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:37`　下面是作者建议的低风险演练方法：
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:51`　自编联系表至少填写：
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:63`　同时整理时间线：
- `nist-solopreneur-cybersecurity-backup-incident-recovery.mdx:77`　不能替代必要的正式通知：


C 级（结构/节奏）见指标表；F 指纹见表内指纹行；比喻贴切度只能人审；本轮默认保留。用户主动要求时再列出相关原句供判断。



## 三、前后对照（改后稿全文，改动处标记）



---
title: "一人业务网络安全指南（三）：备份、事件预案与业务恢复"
publishedAt: "2026-11-03"
summary: "把 NIST 的备份、响应和恢复建议变成可填写的演练记录、离线联系人和事件时间线，避免在受损设备上恢复或带着异常重新上线。"
slug: "nist-solopreneur-cybersecurity-backup-incident-recovery"
category: "thoughts"
language: "zh-CN"
translationKey: "nist-solopreneur-cybersecurity-backup-incident-recovery"
sourceSlug: "nist-solopreneur-cybersecurity-backup-incident-recovery"
---

能登录云盘，不等于已经证明可以恢复业务。备份能否取回<del>、</del><ins>要在平时验证，还要确认</ins>出了事<del>还</del>能联系谁<del>、</del><ins>，以及</ins>恢复前<ins>需</ins>要检查什么<del>，都适合在平时验证</del>。

本文依据 2026 年 11 月 2 日的 [NIST CSWP 50 正式版](https://csrc.nist.gov/pubs/cswp/50/small-business-cybersecurity-non-employer-firms/final)，主要参考第 12、15、17、19–20 页。以下记录卡、演练方法和完成标准由作者整理，不是 NIST 原工作表，也不是一套适用于所有事故的处置命令。正在发生事件且无法判断影响范围时，联系预案中合适的专业人员，不要依赖本文完成取证或系统清理。

## 1. 先定义要恢复的交付

从第一篇资产清单选一项重要交付，填写下面的自编恢复卡：

| 项目 | 填写内容 |
| --- | --- |
| 要恢复的业务 | 哪项交付中断，涉及哪些数据、账号和设备 |
| 可接受的影响 | 业务最多能承受丢失多少更新、中断多久；由经营者决定 |
| 副本与保存方式 | 备份包含什么，在哪里，哪些人或账号可读取、修改或删除 |
| 备用恢复路径 | 日常设备或主要账号不可用时，如何按提供方流程恢复访问 |
| 验证办法 | 怎样确认恢复内容完整、版本正确且可以用于交付 |
| 帮助与沟通 | 服务商、专业人员和其他需要联系的对象 |

这些问题用于明确业务需要，不能据此自行承诺一个尚未测试的恢复时间。NIST 没有在这里为所有一人业务规定统一的备份间隔、可丢失数据量或恢复时限。

## 2. 检查副本是否受到保护，并做一次恢复测试

原文建议定期备份，考虑多个副本，其中至少一个在不连接日常设备的媒介上<del>；</del><ins>。</ins>文中举了外置硬盘和云的例子。它也<del>要求</del><ins>建议</ins>保护和测试备份，并核实云服务商的备份政策。勒索软件的影响可延伸到云账号和 SaaS，不能只凭「存在云端」就认定已经隔离或一定可恢复。[原文第 15、17 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=19)

逐项核对备份包含的数据、可用版本、访问权限、删除权限和恢复流程。服务商的同步、版本保留、备份与恢复是否覆盖同一范围，应按实际政策确认。不要把云一概排除，也不要把云同步自动写成受保护的备份。

下面是作者建议的低风险演练方法：

1. 选取不含敏感信息、内容已知的测试样本，记录预期版本。
2. 按已核实的备份流程保存样本，记录位置和访问条件。
3. 从备份恢复到不会覆盖工作数据的测试位置。
4. 打开恢复内容，与预期内容和版本比较，确认能否完成预定用途。
5. 记录实际结果和限制<del>；</del><ins>。</ins>失败或缺失的部分列出后续动作，再测试。

<del>演练</del><ins>测试</ins>记录可填写「日期、样本、备份位置、恢复入口、预期结果、实际结果、问题、下一步」。一次样本成功只证明这次测试的范围，不证明全部系统都能恢复，也不代表经过安全取证或确认没有恶意内容。

## 3. 把联系表和应急办法放在离线可取的位置

NIST 建议事前准备响应计划并定期练习，保留打印或离线的关键联系人。先确认失去主要邮箱或电脑时，是否还能取得这些资料。[原文第 2、12 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=16)

自编联系表至少填写：

- **服务提供方**：已经核实的支持或账号恢复入口，能协助什么。
- **专业支持**：适合本业务的事件响应、法律及其他联系人<del>；</del><ins>。</ins>如有保险，核对保单要求、范围和联系办法。
- **业务沟通**：需要联系的客户或合作方、可用的备用渠道，以及适用的通知要求在哪里。

联系表不存密码、令牌或恢复码。记录备用沟通方式和临时交付办法，核实是否实际可用。原文给出手工替代、临时服务方式和备用沟通渠道作为业务连续性的例子<del>；</del><ins>。</ins>不能把未验证的备用方式写成可用承诺。[原文第 19 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=23)

## 4. 怀疑被盗或中招时，先限制扩散并记录事实

原文的基本遏制措施包括断开设备网络、隔离受影响的设备或系统、撤销会话，并避免用疑似受损设备和账号做恢复操作。具体先后顺序需结合事件与预案，不应照抄一条通用清理命令。[原文第 19 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=23)

按预案联系服务商或专业人员时，同时整理时间线：

```text
首次发现的时间及使用的时区：____
观察到的现象：____
已确认的账号、设备或业务影响：____
仍待核实的范围：____
可取得的日志、相关截图及受控保存位置：____
已经采取的动作、执行者及时间：____
已联系的对象与下一步：____
```

这份自编记录区分观察、已确认事实和猜测。不要把一次异常登录通知直接写成全部客户数据已泄露。若需要恢复访问，使用未受影响的设备和已核实的服务商恢复流程<del>；</del><ins>。</ins>主要邮箱本身可疑时，不把它当作可靠的备用沟通渠道。

通知对象、内容和时限取决于实际法律、监管、合同或政策要求。本文不规定统一通知时限。按预案核对义务，需要时寻求法律帮助。下面的自编沟通草稿只用于组织已知信息，不能替代必要的正式通知：

> 我们在「时间及时区」发现「现象」。已确认「影响」，仍在核实「范围」。目前采取「措施」，后续通过「可信渠道」沟通。

## 5. 恢复前检查完整性和账号设置

NIST <del>要求</del><ins>建议</ins>在重新使用备份或其他资产前验证其完整性，并复查 MFA、用户账号、文件共享、活动会话和转发规则，降低恢复后再次受影响的风险。[原文第 20 页](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf#page=24)

把这两类检查分开记录：恢复的数据能否正确用于业务；账号和系统设置是否已核实。仅修改密码或看到文件能打开，不能代表两类检查都完成。无法判断完整性、仍有异常会话或发现不明转发规则时，交给合适的专业人员确认，不把系统标为已恢复。

依照实际要求与客户、合作方协调恢复。结束后记录发生了什么、采取了哪些响应和恢复动作，以及哪些地方需要改进，再更新资产清单、设置和预案。

## 完成标准与限制

平时准备完成，应留下可访问的离线联系表、一次有范围和结果的恢复测试，以及有下一步的失败项。事件恢复是否可以结束，还要看资产完整性、账号设置、业务验证和适用的沟通义务是否已经处理<del>；</del><ins>。</ins>必要时需要专业判断。

没有统一的「做完这些就绝对安全」。本篇没有验证任何具体云服务、备份产品或真实事故，也没有复刻另附电子表格中的 NIST 附录 I。随着业务和依赖变化继续更新计划。

回到[第一篇：资产与风险清单](/zh-CN/blog/nist-solopreneur-cybersecurity-asset-risk-inventory)检查遗漏，或使用[第二篇：账号与设备防护](/zh-CN/blog/nist-solopreneur-cybersecurity-accounts-devices)落实发现的设置问题。
