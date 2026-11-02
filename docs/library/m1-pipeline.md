# M1 工具实现与使用

> **当前交付入口（2026-11-02）**：[M1交付与验收](m1-editorial-delivery.md)。下文保留元数据切片交付时100 draft/0 eligible及81/235项检查的历史记录。当前已完成100项三语编辑说明和实际代理编辑审批，公开资格100；后续消费者仍须显式传`currentCatalog/context`。不要用种子重建工具覆盖已完成编辑的catalog。

2026-11-02。M1身份/导入/快照工程已接入真实300候选、五类各20共100条draft元数据；三语原创编辑与发布审核尚未完成，公开资格仍为0。未修改历史文章、站内实体、业务路由或部署配置，未commit、push、全站build或启动服务。

## 命令

```bash
pnpm library:validate
pnpm library:import --input /absolute/path/candidates.jsonl --source <existing-source-id> --batch <stable-batch-key>
pnpm library:import --input /absolute/path/candidates.csv --format csv --source <existing-source-id> --batch <stable-batch-key> --write --job-dir /outside/repository/jobs
pnpm library:build
pnpm library:build --dir data/library --out public/data/library/v1 --as-of 2026-11-02T12:00:00Z
pnpm library:benchmark 300
pnpm test:library
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/library/seed-sources.mjs
```

`library:import`默认dry-run；加`--write`才写candidate文件和仓库外job。导入器不获取外网、不创建批准、不promote或publish。JSONL为完整candidate记录；CSV列必须恰为`source_record_id,source_url,observed_at,kind,identifier,url,title_hint`，空identifier/title_hint变null，其他字段不能空。source必须已存在且对目标存储方式有许可。私有草稿可在仓库外catalog使用`--private`；不能借此把无权数据写进公开仓库。

`seed-sources.mjs`是这一次固定、已审字段投影的离线重建工具，默认只读dry-run；不随build执行、不获取网络、不替换后续编辑或审阅。有限来源、100条固定入口及未知项见[m1-real-metadata-seed.md](m1-real-metadata-seed.md)。

规范未pin时保留needs_review，不自动制造版本。书籍work/edition关联不明确也保留待审；显式ID冲突、字段无权、坏记录进入行级失败列表。相同batch/job-version必须保持输入字节hash，改输入需新batch；既有来源记录的实际内容变动需显式修订，不能静默覆盖。

## 所有权与消费者

| 入口 | 所有权与消费方式 |
| --- | --- |
| src/lib/library/normalize.ts | 唯一纯身份规则，浏览器安全；normalizeResource、normalizeUrl、isbn13、resolveLibraryIdentity |
| scripts/library/contract.mjs | 输入Schema、哈希、审核与当前资格；后续工具继续复用，不直接序列化catalog到public |
| scripts/library/import.mjs | importCandidates({...})返回accepted/duplicates/matched/identity_needs_review/failures；只写候选，jobs在仓库外 |
| scripts/library/snapshot.mjs | buildSnapshot({catalog,directory,asOf,context,publicGit,codeVersion})；readSnapshot(directory,{asOf,currentCatalog,context,publicGit})独立消费并校验 |
| data/library/schemas/public-snapshot.schema.json | 公开DTO、manifest及文件wrapper的实际JSON2020 Schema |
| src/lib/library/types.ts | 公共DTO和常量，既有输入类型；不能替代runtime校验，也不导入Node |
| scripts/library/build-index.mjs | 本地清单→生成快照CLI，不修改全站prebuild；M3再接既有静态asset管线 |

buildSnapshot需要显式UTC asOf；CLI缺省用运行时UTC。固定输入和时刻重建同字节结果；代码版本自动含生成相关源码/Schema/锁文件与Node版本。返回manifest、item_count、detail_count、bytes（含manifest）、generation_ms。

readSnapshot返回manifest/items/rankings/facets/relations/aliases/details，验证实际Schema/字节hash/同快照内容地址/理由及引用/有效期；内容地址复算绑定payload、input/code/rank版本和as_of，不构成身份签名。构建端必须带当前catalog/context防止历史快照恢复撤权条目；它是Node入口，不应从客户端import。manifest为当前唯一指针，旧版本不混读；客户端加载语义和UI仍由M3实现，不能把该Node reader说成已完成浏览器验收。

## 文件效果与恢复

来源/审核清单是源数据；`public/data/library/`整体gitignore，可由源清单重建。输出只允许覆盖有`.library-output.json`所有权标识的生成目录。快照先完整生成再原子切manifest，成功后清旧版本；不覆盖无标识的用户文件夹。

普通坏Schema不覆盖上次合法输出；当前权利/期限/审核失败会撤本地manifest并清旧快照，明确撤权/到期/审核链失效信号不能被无关Schema错误遮住。不能以旧published行或旧publish事件复活下架内容。生产/CDN/旧部署可达性仍待M4验证，不承诺即时线上撤稿。

import每批checkpoint先提交合法candidate文件，再写job；恢复会对照真实文件重做幂等核对。失败行不推进连续cursor，DLQ仅有行ID/错误码/次数，最多重试3次，可明确改批次手动重放。优雅取消落checkpoint；强杀残留锁不按TTL盲删，先核实原进程已终止并核对真实文件/日志，才人工清理该目录的`.library.lock`。不引入daemon或后台状态服务。

## 验证结果与范围

- 最新`pnpm test:library`：81项；含独立复核新增4项导入/快照回归，以及6项真实来源专项测试。
- 最新`pnpm test`：235/235；`pnpm content:check`：7,428 MDX；TypeScript检查通过；定向ESLint零error/零warning；`git diff --check`通过。
- 真实CLI `library:validate`通过：10 policies、300 candidates、100 draft items、138 pending Topic建议，0 eligible。上一轮空catalog的`library:build`通过记录是工程基线；当前100条draft尚未达到公开条件，不把空快照当成已完成公开内容。
- 300条完整published**虚构**性能用例：见[m1-benchmark.json](m1-benchmark.json)。本机Node24.16.0/darwin-arm64，单次生成约1.83秒，公开原始759,290字节（含manifest）、各文件gzip合计115,401字节；独立reader校验300项。该结果不是实际种子、人类审批、搜索p95或线上LCP证明。
- [m1-contract-repair.md](m1-contract-repair.md)保留独立复核的RED与修复证据。
- [m1-pipeline-repair.md](m1-pipeline-repair.md)记录ISBN URL冲突、内容地址复算、private存储权利与混合坏输入撤权的RED→修复证据。

未完成：100条三语原创说明/推荐理由与真实发布审核，M2完整审核CLI、证据分类/金标/排序实验，M3页面与交互，M4远程export/实际用户实验。没有以合成数据或agent执行记录冒充这些结果。
