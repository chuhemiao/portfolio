# M1 交付与验收

2026-11-02。M1数据和工具已完成，本地catalog有300条真实候选、100项已审公开资格。Library UI、检索、收藏和全站静态export不属于本阶段；没有push或部署。

## 实际集合与编辑边界

| 集合 | 数量与状态 |
| --- | --- |
| 真实候选 | 300：spec 80、paper 80、article 60、book 40、video 40；与公开集分开 |
| 已审编辑精选 | 100：五类各20；均published/eligible/detail_enabled |
| 三语内容 | 300份reviewed locale；每份标题、摘要、完整原创正文、推荐理由齐全 |
| 推荐依据 | 100条editorial selection，0条外部推荐证据，communityRecommended为0 |
| Topic建议 | 138条：79批准、59拒绝；覆盖5个已存在Topic，不新增Topic或Research项目 |
| 审核事件 | 1275；实际Codex字段政策/编辑/修订身份，内容hash、revision和链绑定 |

20份规范依据实际核读的CC0固定版本章节写机制说明，ERC-8004保持Draft。其余80项保持`metadata_only`，仅据书目/官方索引写本站阅读定位与研究问题，没有编造方法、结论、章节或讲者。[三语对比报告](reviews/2026-11-02-editorial/comparison.md)及[逐项覆盖](reviews/2026-11-02-editorial/coverage.json)保存基线、修改、核读范围与限制。

100项原始metadata逐值不变，排除项仅为已列明的发布workflow字段。9个源投影文件hash不变；原题、作者、ISBN、日期精度、语言未知、canonical identity和pin均保全。独立文本agent读完100×3后发现两处日文主体/术语问题，已窄修并更新两item及六locale的版本/审批。中文、英文及外部metadata不因这两处修正变化。

## M1-01～06与G1自检

| 要求 | 实际证据与结论 |
| --- | --- |
| M1-01 合同/拒绝默认 | 实际JSON2020 Schema、字段权利和内容绑定审批；当前数据校验通过。独立复核的改文、跨item依据、来源撤权负向使资格清零，旧快照为`SNAPSHOT_STALE` |
| M1-02 稳定身份 | 原书目与`prepareSeed`重建逐值相等；arXiv v1、ISBN/DOI及20规范真实pin保留，未把日期/语言未知补成猜测值 |
| M1-03 安全导入 | 真实300来源key/规范化候选身份唯一；已记录dry-run→write→同job replay及磁盘重跑accepted 0，恢复/锁/坏行检查通过。身份唯一不等于300部独立作品 |
| M1-04 来源闸门 | 9条实际Codex逐字段政策审阅，YouTube API disabled；无未经许可raw/摘要/全文/字幕/图片。当前政策下公开投影没有禁用字段；不等于法律顾问意见 |
| M1-05 三语种子 | 100 eligible、300完整locale、100同item精选依据、0社区推荐；79/59 Topic闭环和三语独立文本复核完成，2处JA修正有记录 |
| M1-06 一致快照 | 111公开文件含manifest，100份detail；独立reader显式传`currentCatalog/context`，公开内容与catalog逐值相等；到期负向为`SNAPSHOT_EXPIRED`；同输入/asOf重建逐文件字节一致 |
| G1 数据/工程出口 | 真实300候选/100精选、来源字段追溯、幂等恢复、三语与本地快照无未决实现缺口；仅本阶段完成。未将人类双盲、用户研究、在线来源重新核验或远端export计为完成 |

独立publication review针对修前快照`sha256-4a4484c8d87262b4205787181ecd58a67740a64903fe5ecc4066132b4413d07c`完成资格、1247事件链及公开字段/内容检查；其独立复算字节数，没有独立测生成耗时。两处JA修正后由writer完成1275事件与受影响版本的fresh校验，并重新显式读回/复建最终快照。详见[复核留档](reviews/2026-11-02-editorial/independent-publication-review.json)。

## 真实输出与合成基准

最终asOf为`2026-11-02T12:31:12.947Z`，snapshot为`sha256-d7ffa7d170b87273d80fc49050d772d70934be00d8700870dadad3b29cf6a1d5`。

| 数据/口径 | 原始字节 | 各文件gzip合计 | 生成时间 |
| --- | ---: | ---: | ---: |
| 实际300候选输入、100公开项及100完整三语detail | 587431 | 231044 | 2190.18ms；独立一次复建638.80ms |
| 历史300项虚构published性能用例 | 759290 | 115401 | 1827.73ms |

均为本机Node24.16.0、darwin-arm64测量；当前首轮生成与常规检查并行，复建另行单独执行。字节含manifest与所有公开JSON，不含所有权标记、输入catalog、报告、HTTP头或CDN效果。合成300公开项不是300条真实公开内容；实际输入确有300候选，但只100项进入公开投影。两者都低于本阶段10秒/1MB目标，不据此宣称搜索p95、LCP或线上性能。[逐文件指标](reviews/2026-11-02-editorial/actual-snapshot-metrics.json)保留hash与raw/gzip计数。

## Fresh检查与后续

修正后`pnpm library:validate`、`pnpm library:build`通过；`pnpm test:library`89/89、`pnpm test`243/243、`pnpm typecheck`、`pnpm content:check`（7428 MDX）通过，Library定向ESLint和diff检查通过。8项新增真实数据回归覆盖metadata保全、日期/语言未知、Draft/机制限制、metadata-only、三语依据、真实agent身份、篡改拒绝与独立公开消费者；两处JA修正也有精确断言。没有失败重试、skip或flaky结果。

`pnpm library:build`只构建Library JSON快照；本轮**未运行全站`pnpm build`**，未启动或打开预览。全站静态export在M4受控远端验证。生成的`public/data/library/`整体gitignore，不提交公开生成快照。

按用户默认决策授权，下一阶段选择PRD允许的编辑精选+B1简单检索路径，未验证的自动抽取与B3关闭。≥120条人类双盲样本标注、20–30人用户实验均not-run，G2/G4完整实验门槛未通过；来源资格、三语和工程/远端export要求继续保留。当前没有生产发布结论。
