# NIST 一人业务网络安全指南：三语交付与对比

2026-11-03。3个不同任务，9篇完整MDX，category=thoughts；未新增Research项目卡、产品代码或外部素材。依据NIST CSWP50正式版（2026-11-02），并使用Analysis已实际核验的NIST新闻/正式发行页/PDF。未读附件同目录其他文件；未提交PDF全文、全文提取或截图。

## 交付入口

| 主题 | 中文 | English | 日本語 |
| --- | --- | --- | --- |
| 资产与风险清单 | [正文](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-asset-risk-inventory.mdx) | [Full article](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-asset-risk-inventory-en.mdx) | [全文](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-asset-risk-inventory-ja.mdx) |
| 账号与设备保护 | [正文](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-accounts-devices.mdx) | [Full article](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-accounts-devices-en.mdx) | [全文](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-accounts-devices-ja.mdx) |
| 备份、预案与恢复 | [正文](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-backup-incident-recovery.mdx) | [Full article](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-backup-incident-recovery-en.mdx) | [全文](../../../content/blog/2026/thoughts/nist-solopreneur-cybersecurity-backup-incident-recovery-ja.mdx) |

## 溯源与边界

- [来源证据](source-evidence.json)含附件SHA/33物理页、正式版日期、官方来源与印刷页→物理页映射；[主题映射](source-map.md)区分NIST建议和作者模板。远端官方PDF与本地副本未作全文件hash相等断言。
- 正式版明确表格不是合规checklist/认证标准。无雇员企业允许多位业主，本系列聚焦一人经营的实践场景。付费服务不自动代表不留存/不训练；原文SI术语有说明。
- 至少15字符、至少每月检查更新/每年培训来自原文；补丁可行时尽快安装。备份频率、恢复时间、通知时限不编统一值，云不自动等于隔离，受损设备/账号不作恢复入口。
- 原文D–J工作表另xlsx，本任务未读取；本系列表格、前三风险排序、非敏感测试样本和完成标准明确为原创实践整理。

## 表达检查与可追溯对比

用户AGENTS明确授权一轮完成三语优化，覆盖通用tone skill的二次确认停点。九份[baseline](baseline/)保留优化前全文；九份`.diff`以unified diff记录每种语言全部增删，零修改稿明确记同一hash。三份`.tone-report.md`含中文完整改前/改后对照，原始before/after与全部95语义候选独立保存，候选没有删项。第二篇复核窄修后仅刷新受影响after/30候选及被提取器省略的链接段落手工判断，未重做无关全文。

| 中文主题 | 原始密集并列 before→after | 实际拟改 | 分号 before→after | 语义候选 |
| --- | --- | --- | --- | --- |
| 资产与风险清单 | 10→10 | 0 | 10→3 | 33 |
| 账号与设备保护 | 5→4 | 1 | 8→0 | 30 |
| 备份、预案与恢复 | 10→9 | 1 | 8→2 | 32 |

密度指标只用于发现候选，不是文章显著性或模型来源证明。2处普通罗列/2处实义换称及21处分号做最小改动；列举六函数、风险因素、认证/告警/恢复检查及模板字段均有保留理由。C级结构不追目标值，H/X不改。逐项见`*.hit-review.json`、`*.semantic.json`和[完整变更](changes.json)。自动报告研究参照是背景，不能推断作者或指南的安全效果。

[三语语义核对](language-review.md)记录主体、受薪员工/多业主例外、建议强度、日期、步骤、表格、否定与恢复边界。英语/日语按语法和自然表达复核，不套中文正则；自然且同义的段落保留。纠正了初稿的受众简写、日文cleanup译法，以及独立复核发现的普通待核/事件分支混淆。

## 实际检查与权限

- `pnpm content:check`：修后exit0，扫描7437 MDX。
- `pnpm typecheck`：exit0；没有产品TS修改。
- [实际内容编译与分组检查](light-validation.json)：9/9使用现有Markdown compiler；3组完整zh-CN/en/ja；21处同语系列链接均对应真实9源；正式页/PDF链接域名和页码检查；表格、步骤、段落层级及数字保真，与人工语义核对分列。初版harness把重复链接当第三个目标，已按2个唯一同语目的地修正并fresh通过，非内容缺陷。
- [独立只读复核](independent-review.json)：唯一P2已按三语实际段落关闭，无未决内容阻断。
- [远端完整`pnpm build`](build/build.json)：固定main基座`ea9ef4509f365c608c6fd77e30b1b03f04a9be45`加9篇冻结MDX，Ubuntu26.04.1 / Node24.22.1 / pnpm10.29.3，单次构建exit0、262.161s，8243个Next静态页面及7437个旧文章跳转。采样cgroup峰值8025923584B（含cache），OOM0；不当作进程RSS。
- [静态产物核对](build/export-check.json)：9篇完整正文、3语言组、21处同语系列链接及官方引文、canonical、alternates、legacy均通过。9源local→remote→afterbuild SHA相等，最终out树SHA为`accdffec44aba4db1a7e7d19ff5abe103f23ba31db091fb74d74e758a23923a5`。
- [下载校验](build/download.json)：30844B证据包整体SHA通过；[清理回执](build/cleanup.json)确认自有临时VM已stopped、routes为空。未在Mac运行完整build，没有dev/preview或浏览器页面预览。首个Python setup不可用改用Node，以及长等待MCP超时后核原命令exit0，均保留于[环境](build/base.json)和[命令终态](build/command-status.json)，没有重跑构建。
- 本次内容未获commit/push授权，未提交、推送或部署；旧Library权限不延用。

## 最终源绑定

[content-manifest.json](content-manifest.json)记录9篇最终SHA；[远端输入](build/input-manifest.json)和[本地构建后对照](build/local-after.json)绑定同一冻结稿。完整初稿、各语diff、来源与三语核对及构建证据均已归档；未提交、推送或部署。
