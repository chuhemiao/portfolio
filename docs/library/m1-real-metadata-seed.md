# M1 真实来源与元数据交接

> **历史切片说明（2026-11-02）**：本文记录元数据writer停止时的100 draft/0 locale状态，保留来源、权限和未知项原始边界。后续三语原创编辑与实际Codex审批已完成，最新计数、资格和快照见[M1交付与验收](m1-editorial-delivery.md)，不能以本文历史状态重置当前数据。

2026-11-02。此切片完成来源字段政策、实际候选导入和固定100条元数据预选。100条全部为draft，0 published、0公开资格、0空白locale占位。后续编辑不需要重新采集这300条书目信息；仍须按已读范围写完整的三语原创说明，完成理由、一致性和发布审阅。

## 当前磁盘事实

| 类型 | 实际候选 | 固定draft |
| --- | ---: | ---: |
| spec | 80 | 20 |
| paper | 80 | 20 |
| article | 60 | 20 |
| book | 40 | 20 |
| video | 40 | 20 |
| 合计 | 300 | 100 |

300个`(source_id,source_record_id)`唯一，按现有规范化身份也无重复；未pin的60条规范按明确EIP编号区分，继续needs_review。这里证明候选记录身份不同，不证明300部独立作品：SSRN与正式发表版、不同版本是否同一作品仍需实际关联证据，不自动合并。全部300候选保留needs_review，包括已建立对应draft的100条；内部preselection不冒充promote或出版批准。

当前10个source policy中9个仅批准限定字段，1个YouTube API来源disabled。9条来源批准event由实际执行此任务的`codex-library-m1-real-sources`署名，通过现有内容hash和event链生成；没有调用fixture批准助手，没有声称人类、法律顾问、双盲评审或真实用户实验。来源字段政策批准不等于item批准，全部item检查仍false/null、rights_status仍pending。

138条Topic建议覆盖9个现有slug：`l1-l2`、`yield`、`stablecoin`、`rwa`、`tokenized-equities`、`ai-crypto`、`market-structure`、`perp-dex`、`cex`。所有mapping均model_suggested/pending_review，没有修改现有Topic或建立项目卡片。

## 下一位编辑的入口

- [seed-selection.json](../../data/library/seed-selection.json)：100个实际item ID、固定source key、题名、元数据文件、核读入口、pin/hash、read_level、Topic建议及未完成项。
- [seed-plan.json](../../data/library/seed-plan.json)：五类各20的固定预选及内部选择理由。它不是公开推荐理由或正式editorial_selection审批。
- [items.jsonl](../../data/library/items.jsonl)与[candidates.jsonl](../../data/library/candidates.jsonl)：真实合同输入。后续正文另写item_locales，不复制外部摘要或全文。
- [metadata](../../data/library/metadata)：仅允许的书目事实、来源URL、抓取观测、响应hash及逐包传输校验。未保存原始HTML、Crossref abstract、论文/书籍全文、字幕、图片、封面或媒体。
- [spec-reading-facts.json](../../data/library/metadata/spec-reading-facts.json)：20条CC0规范实际已读章节的agent自述事实，绑定核验过的commit与文件hash；不声称完整通读或实施/安全审计。其他280条仍metadata_only。

固定100条已交给只读来源agent为后续编辑整理资源特定的已核事实和阅读问题。权利不明处继续只用书目/课程目录事实，不靠标题推断论文结论、书中章节或视频讲者。任何后续更换固定source key都应同步该编辑交接。

## 有限来源与权利范围

| 来源 | 实际输入与证据 | 本次范围 |
| --- | --- | --- |
| EIP/ERC | 官方all索引80条，20份在EIPs/ERCs实际commit下读取；各有文件SHA256、字节数、permalink、CC0声明 | 书目事实和已许可规范事实；不泛化其外链或第三方图片 |
| Crossref | 39本实际ISBN书目、40 DeFi+36 stablecoin+1基础论文；有限REST查询与精确DOI补读hash保留 | 题名、作者字段、DOI、实际ISBN、date-parts和源类型；不收abstract/full text/cover；journal-article不等于已证同行评议 |
| O’Reilly | 官方二版目录单条，直接请求403后官方web读取成功，响应byte hash未知显式null | 题名、五作者、2025-10、English、ISBN；目录说明、正文与封面不在许可范围 |
| EF Blog | 官方根索引allPostsData的frontmatter title/date/author/category与URL，60条 | 仅事实引用；未核正文/图片开放许可，privacy policy不是转载license |
| MIT OCW | 两个2018课程官方gallery，23+17条实际资源链接 | 仅目录题名和链接；CC BY-NC-SA课程许可不在这里转换成商用视频/字幕/图像授权；不取YouTube API |
| Bitcoin/Uniswap | 官方索引单条引用与PDF入口，保存索引hash | 未推定白皮书全文再分发权；Uniswap题名是官方索引link label，未伪造正式论文作者/日期 |
| arXiv | Flash Boys 2.0实际citation与v1版本历史 | 仅引用元数据；nonexclusive distribution是arXiv分发授权，不批准第三方复制全文 |
| 原创编辑 | 用户授权的未来原创三语内容，以及明确unknown的level/availability标记 | 与外部metadata分开provenance，不制造社区推荐证据 |

source的fetch和raw/excerpt权限全部默认关闭。代码没有网络请求，不随build运行。Crossref仍如实标记official_api来源，手工投影不是重新授权API数据；其他来源也在policy_scope明确实际获取方式和字段范围。已允许的有限事实可留公共Git，未知正文、可删除或有期限资产没有进入仓库。

## 已保留的关键边界

- Mastering Ethereum二版采用官方ISBN`9781098168414`、五位作者、2025-10月精度。效果图原先是示例，不作为另一组同版事实。未猜print/ebook，也未把另一ISBN自动设alias。
- Understanding Bitcoin实际ISBN`9781119019169`与DOI`10.1002/9781119019138`同时合法；DOI路径的13位数字不是ISBN声明。明确OpenLibrary ISBN路径及O’Reilly目录ISBN路径才做相应冲突核对。
- 20条规范都有实际pin。EIP-712来自EIPs，不来自返回404的ERCs路径。proposal created不写作首次发表日期，所有规范publication仍null/unknown。ERC8004的源Draft状态留在metadata与未完成项，不写成已定稿。
- MIT的2018是课程年，不是视频上传日；逐节主讲人未核，creators保持空数组，publication为null。session18实际缺失，不补造；`lec14-ightning-...`为实际源href，未按标题擅自补字。
- EF日期来自实际frontmatter，不从URL推断。KZG条目的frontmatter年与URL年不同，本身不证明错误；原样记录，其未入选100是固定预选的内容取舍。
- 两条Crossref候选作者字段含机构，保留源事实和质量说明，未猜成人名，也未进入100预选。原语言未知为und，未凭英文题名断言原文语言。
- 月/年精度按既有合同使用首日占位并保留date_precision；这不是声称实际发行日。未知日期继续null。观测的原始微秒/时区值留在metadata；应用timestamp规范为UTC毫秒。O’Reilly源观测仅精确到日，字段provenance用本地核验这条投影的时间，未当作精确源抓取时刻，fetched_at仍null。

## 可复建与验证

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/library/seed-sources.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/library/seed-sources.mjs --write
pnpm library:validate
```

第一条默认dry-run，不写catalog/job/lock、不请求网络。显式write复用真正的importCandidates：每个来源先dry-run，再write，再以同输入/同job重跑。首次8个实际来源accepted合计300；同job重跑accepted均0，duplicates合计300。随后对完整磁盘catalog再次重跑accepted仍0，结果在[实际重跑记录](reviews/2026-11-02-real-metadata-seed.json)，各source输入hash与各投影文件SHA可核对。临时输入仅为批准投影，job在系统临时目录，结束清理；没有把原始源响应保存到临时目录。

工具拒绝覆盖后续编辑、审阅或无关记录；完成三语编辑后如需重新建初始draft，应在隔离目录复制批准metadata、plan和空catalog执行，不用seed重置编辑结果。固定20规范的commit和文件hash不是每篇lastmod，也不声称等于当前网站构建版本。

最新验证：Library81/81、全局235/235、TypeScript、7,428 MDX内容检查通过；定向ESLint与diff检查通过。实际library:validate返回10/300/100/138，eligible与communityRecommended均空。未全站build、启动或打开预览、提交、push或部署。

独立复核的四项P2已先得到实际行为RED，再窄修与复测，见[m1-pipeline-repair.md](m1-pipeline-repair.md)。当前切片未完成的是100条三语原创编辑/一致性审阅与真实发布审批；M1阶段不能仅凭这批draft或合成性能测试宣布通过。
