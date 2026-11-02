# M4：远端构建、浏览器与撤稿验收

2026-11-03（Asia/Shanghai）。交付形态继续为**人工编辑精选＋B1**。真实远端完整构建、最终静态产物、23 项浏览器验收及撤稿/恢复链通过；BFCache、真实用户研究和生产缓存清理的限制单列，不将工程检查称为完整 G2/G4 实验通过。没有 push、部署、生产配置变更或付费升级。

## 输入与实际环境

- 源基线：M3 `98bce7d81b7978b32e5d3e62778f97dd23f52403`。VM 从固定公共 BASE `62ea8ba3fc586b94b9dda6158b5898fdcbb41e03` 获取源，再应用经 SHA 验证的增量；未使用最新 main 替代被测源。
- [初始传输清单](../reviews/2026-11-02-m4/source-initial.json)绑定 90 个 M3 runtime blobs；[本轮 22 文件清单](../reviews/2026-11-02-m4/m4-source-files.json)逐项核对 VM 与 Mac 的 runtime/config/QA/helper/toolchain/Schema SHA，相同。未上传环境文件、凭据、本机 node_modules、Git 私钥或媒体。
- 临时 VM：4 vCPU、8192 MiB、Ubuntu 26.04.1 amd64；实际 Node **24.22.1**、项目 pnpm **10.29.3**、Next **16.1.1/Turbopack**。API 的 node22 别名不当作实际 Node 版本。无公开端口，nonpersistent。
- Chromium **141.0.7390.37** / Playwright **1.56.1**。Ubuntu 26 的首次浏览器依赖安装失败后，依据已安装工具源码使用 `ubuntu24.04-x64` 兼容依赖路径，实际 launch/字体/交互通过；不声称 Ubuntu 26 获得官方支持。

四份增量 SHA 依次为：schema `915a21c9c88e0bd171b490776a50754e21d88410e59eb80fc0803814f18f7cca`；site context `9fb9c6d7503d6a78b17fb8b147a892a9925a706925ace8fb4bfdd9389ab6e46d`；语言 oracle `df13d2b1d412f6b5204fc894cffa9902096c1c2d7386f542ebed16e4bd729ab4`；build inputs `e397001d1277456c734e54192588c7ccf45a11e47fc0cb2cc2341a3347777846`。Schema 两文件原字节 SHA 未变，API/public v1、资格门槛及不可信 JSON 严格解析未放宽。

## 完整构建与产物

[第六次完整命令原记录](../reviews/2026-11-02-m4/build-result.json)：`pnpm build` exit **0**，154.949 秒，Next 实际生成 **8234** 静态页面（最终文件系统共有 15,661 个 HTML，包含后补跳转等不同口径）；随后完成 74,604 segment 文件清理、7428 个 legacy 文章跳转和 i18n 全检查。不是仅 compile、Library build 或跳旧路由的结果。

构建进程树 RSS 以 0.25 秒采样，峰值 **3,632,230,400 B**。同阶段 cgroup `memory.current` 采样峰值 **7,925,600,256 B**，包含 VM 工具与文件缓存，不能当成构建进程 RSS；cgroup 上限 8 GiB，oom/oom_kill/max 均 0。首次安装重叠和 cgroup lifetime peak 与进程口径分列于原记录。

[最终恢复产物](../reviews/2026-11-02-m4/restore-export.json)逐文件验证：

| 实际范围 | 结果 |
| --- | --- |
| legacy、zh-CN、en、ja Library | 各 1 列表＋100 详情；共享 100 slug，详情集合与 eligible/detail_enabled 精确相等，无候选薄页或额外详情 |
| canonical sitemap | 仅 300 个三语详情；无列表、query、legacy 重复 |
| 内容/元数据 | 300 份完整编辑正文；locale/canonical/hreflang/robots/no-referrer 与有效链接核对通过 |
| 既有文章 | 7428 canonical HTML＋7428 legacy 跳转均存在且行为正确 |
| 公开数据 | 111 个合同文件，590,072 raw B，逐文件 gzip 合计 225,632 B；文件 hash 与当前已验证快照相同 |
| JS | Library 首屏 12 个 script 共 716,376 raw B，含共享框架；与同构建英文首页相比多 1 个 36,448 raw / 13,099 gzip B chunk，不把共享体积算成 Library 增量 |

最终 artifact file-map SHA256：`f9f3dc8466a9c3e41a90610ec7ead77daec8a188e367d99cabe18d3c11624f82`。最终 snapshot：`sha256-13f79ecf953e2b827a53e896f1a1307eb73fd1bf1977f07c0654b0de01523e75`。[体积口径](../reviews/2026-11-02-m4/artifact-metrics.json)不含 HTTP/CDN 效果；不同构建时刻的 manifest/Next build ID 不承诺全站逐字节相同。

静态扫描允许 B1 的 `"field_provenance" in item` 拒绝条件，拒绝真正序列化的私有对象；正负控制保留，未删除产品 guard 来让扫描通过。公开 JSON/HTML/JS 没有核见 raw catalog、审核事件值或私有字段对象。该检查与 server/client 依赖边界共同构成证据，字符串扫描不是通用隐私证明。

## 浏览器与隐私

[最终恢复 out 的原报告](../reviews/2026-11-02-m4/browser-report.json)：**23/23**，pageerror **0**、hydration 错误 **0**。三语各 1440/390 宽，列表与详情无横向溢出；JS 关闭仍有真实首屏和完整正文；顶部只有一个可见语言菜单。实际截图与已认可设计源对照，保留深色、单琥珀、细边框、桌面列表/侧栏与手机单列。真实文案、筛选和本地操作多于设计示例，不声称像素一致；截图只存系统临时目录，不入 Git。

真实测试覆盖三语/全角编号/长 CJK 与未知编号、无结果、类型与字段过滤、分页、刷新/back、语言 query/hash、键盘名称/焦点、invalid/stale facet；保存/移除/稍后/已读/隐藏/清空、刷新/跨 tab、损坏/禁用/quota、失败清空诚实提示与重试。60 次 warm index 的实际 submit→结果 DOM/下一动画帧，p95 **16.1 ms**、最大 17.6 ms；不是输入耗时、网络耗时、RUM、LCP 或真人效率。

[网络汇总](../reviews/2026-11-02-m4/browser-network-analysis.json)：Library 文档和内部 query/history 无 GA script/collector；普通页面正控发现 collector 尝试并**拦截**，未发测试事件到真实 GA。品牌/Header 桌面与移动导航/搜索、Footer、Topic、文章关联跨边界实际换文档；来源外链无 opener/含 q 的 Referer。实际全局 404 离开后的 GA config referrer 清为 origin 根地址；该出口使用明确标记的测试原生 anchor，不冒称产品有回首页链接。本地阅读操作未核见写请求或清单上传。

最终 console 146 条：142 条来自现有 pruner 删除的 `__next.*` segment 预取 404，其余包括有意访问未知详情 404 和被拦 collector。实际页面导航成功；不称 console 0，也未借本任务更改 pruner/部署。原全局框架 404 未本地化、没有站内返回链接，浏览器 back 可用且无 GA。

普通 browser back 恢复 query/保存状态通过。BFCache 专测保留默认禁用 flag 排除及实际进程参数：headless shell 报 `BackForwardCacheDisabledForDelegate`；完整 Chromium 最后一次探针在 back 已变 URL 后等待 load 超时，未采集到可靠 `pageshow.persisted=true`。**BFCache 恢复仍 not-verified**，不写成产品缺陷或已通过，不为探针修改生产缓存。

`?q` 直接 GET 仍将 query 送本站 host；host 日志、实际 GA 后台保留策略未知。以上不等于“所有数据绝不离设备”或全站合规结论。未新增事件/QDS，30 分钟会话、回访、生产 retention 和 RUM 均 not-run。

## 撤稿、恢复与回滚

[实际演练原报告](../reviews/2026-11-02-m4/withdrawal-report.json)仅在 VM 副本执行：到期边界、坏 hash、混版本、撤权停用输出及旧批准快照拒绝均通过。真实 ERC-7702 takedown 后完整 `pnpm build` exit0（155.992 秒），99 项、400 Library HTML、297 canonical；四详情文件消失并实际 HTTP404，两个 article group、相关 Topic/list、旧 public snapshot 目录同步消失。

[退役状态浏览器证据](../reviews/2026-11-02-m4/stale-state-report.json)使用两个真实 saved ID：被撤项删除，另一个有效项的 saved/read 保留，其他 localStorage 键不变。随后实际 restore＋rights/metadata/evidence/content/publish 审核命令回到 100 项。仅为结束受控 case，在同锁内精确恢复 11 个已知 baseline 文件，SHA 逐项相同；这不是生产审核日志回滚。再完整 build exit0（181.722 秒）、精确 export exit0，并在**此恢复 out**再跑 23 项浏览器通过。Mac catalog/MDX 始终未改。

操作员路径沿用 [M2 工作流](m2-workflow.md)：先 `library:review inspect --type item --id <ID>` 获取当前 revision/content/catalog hash，构造真实 actor/role 的命令，`apply --input <command.json>` 先核结果，再按授权 `--write`；生产静态撤稿还须重建全部 export、检查详情/关联/公开文件/sitemap 并以正式发布渠道替换产物。事务中断用 `status/recover` 的精确 receipt，不批删锁或事务。

旧 HTML 副本在演练中仍可读取，这是实际记录的静态限制。未操作任何生产 CDN/cache/旧部署，不能把受控重建叫生产 purge；纯静态不能保证已加载页面或旧部署即时撤稿。回滚须以**当前仍允许**的 source/catalog 重新过受锁 build/currentCatalog/context、hash、期限和资格闸门，不直接恢复历史 public 目录或已撤权批准。未来部署的批准与缓存处置属于站点所有者；本次没有上线。

## 失败保留与验证范围

| 次序 | 实际首因与处理 |
| --- | --- |
| 1，exit1 | Turbopack 资源 URL 对象与原生 Node URL brand 不兼容；两份受信 Schema 改静态 JSON import，严格输入 parser 不变 |
| 2，exit1 | 动态 root TS 模型 import 被打包成表达式拒绝；server consumer 提供真实静态 TOPICS/PROJECTS，默认 CLI 仍读传入 root |
| 3，exit1 | 前次死 worker 留锁；核精确字节/inode、PID 不存在、无事务后仅移除这一锁；无破活锁或改产品锁语义 |
| 4，exit1 | Next 全 export 已完成，语言 checker 把 hidden streamed 菜单计为可见重复；只数初始 header，双真实菜单负控仍拒绝 |
| 5，exit1 | 既有 out 资源 TS 被下次 tsconfig include；仅 exclude out，真实 src 与 .next types 保留；源错误负控仍报 TS2322 |
| 6，exit0 | 真完整构建及全部 postbuild 检查通过；撤稿/恢复各再完整构建 exit0 |

前五次均未记录 OOM；原日志/result 及 Browser runner 的 locator/opaque-origin/导航等待失败独立保留。初版 private-keyword oracle 将保护条件误判，也与真正产品集成失败分列，没有只保存重试到绿的结果。

本轮受影响 Node 检查 **73/73**、fresh typecheck/定向 ESLint/diffcheck 通过。M3 全局292发生于 reader 最后窄修前、后续 targeted34 等证据仍按原阶段口径保留，不冒称本轮重跑全局292。远端完整 build 自身包含当前 TypeScript 和全 i18n/旧文检查。

[离线评测](../reviews/2026-11-02-m4/evaluation-result.json)：324/324 功能探针，Node CPU 搜索 p95 约 0.617 ms；120 真实协议样本、真人 paired annotation **0**，F1/precision/κ/NDCG/Recall 保持 null/not-run。20–30 人实验未执行；[研究材料](user-study-protocol-v1.md)已准备，未伪造招募、参与者、55% 偏好或算法优势。

四阶段完整映射与反向变更自检见 [验收矩阵](acceptance-matrix-v1.md)。最终交付/提交须以 source、artifact、下载校验和 VM stop 记录共同核验；工程通过支持既定人工+B1交付，不代替站点所有者的生产发布决定。

资源与传输已闭合：[下载校验](../reviews/2026-11-02-m4/download-verification.json)确认 182,297 B / SHA256 `fe8921e713ce04808a7d285c2f8718e503f387999ec98c17ceafaa112ae45615`；[清理原回执](../reviews/2026-11-02-m4/cleanup.json)的 stop 和后续 get_session 均为 `stopped`、routes 为空。停前四个 QA 端口可 bind，无剩余浏览器进程、锁或事务。非持久 VM 已释放；大 out、浏览器和截图未入 Git。独立只读验收无未决阻断，仍保留本报告全部限制。

仓库文本日志仅规范化终端 CR/行尾空白，诊断内容未删改；[逐文件原/新 SHA](../reviews/2026-11-02-m4/log-normalization.json)与原下载 archive 校验保留，JSON 原记录及 runtime 源字节不变。
