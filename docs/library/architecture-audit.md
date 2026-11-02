# Knowledge Library：Phase 0 源码与架构审计

日期：2026-11-02。状态：审计与实施提案，尚未实现 Library。

## 1. 结论与 Gate 0

**建议采用仓库内的纯静态 Library。Gate 0 对 M1 的契约、校验器和测试切片为 Conditional Go；来源启用、公开种子和最终发布仍有各自验收条件。** 本轮只交付评估和任务计划，不进入 M1 开发。用户随后明确无需考虑 Vercel/Worker 工作模式，并回忆 Worker 已移除；本计划不把托管或 Worker 核验作为开发前置，也不引入它们。

方案可复用 Next.js Static Export、多语言路由、Topics、文章读取接口及 sitemap 管线，不需要数据库迁移、运行时 API、账号或新域名。主要成本在来源权利、人工审核和检索评测，页面开发不是唯一关键路径。

| 选择 | 适用性 | 结论 |
| --- | --- | --- |
| 离线导入、审核、JSON 快照、静态页面 | 与现有输出和管线相容，首批体量有限 | 采用 |
| 每条外部资源写成三语 MDX | 混淆原创与外部内容，放大编译和薄内容页面 | 不采用 |
| DB、Go、Redis、向量库或 Next API | P0 没有相应实时需求 | 留在范围外 |
| 先用模型完整排序，再补标准 | 无金标，无法证明质量和来源 | 先人工精选与 B1，B3 仅实验 |

配套：[实施计划](implementation-plan-v1.md)、[数据契约](data-contract-v1.md)、[来源矩阵](source-rights-matrix-v1.md)。

## 2. 基线与验证范围

- 分支 main；HEAD `62ea8ba3fc586b94b9dda6158b5898fdcbb41e03`；开始时工作树干净。
- 已读取 AGENTS.md、CLAUDE.md、README.md 及两份用户文件。CLAUDE.md 的旧 Surf-first 与当前用户/AGENTS 冲突，以后者为准；未调用 Surf。
- Prompt：`/Users/chuhemiao/Downloads/KKDEMIAN_Library_Codex_Phase0_Portfolio_Prompt.md`，SHA256 `99bb42643c4e590c1811c51e60f8737d5397e7e88014e4af227494b344d378ae`。
- PRD：`/Users/chuhemiao/Downloads/KKDEMIAN_Knowledge_Library_PRD_v1.1_portfolio.md`，SHA256 `c19c0d3842c68cdd1be18606b88c63b2b9fa15f1dc0fc9361d8a22a153f23faa`。
- 包含源码、只读生成索引、Vercel 连接器项目/域名/部署记录、公开 HTTP HEAD/DNS、官方来源政策核验。
- 没有运行 content:prepare、next build、pnpm build、开发/预览服务、抓取或部署；未读取密钥或修改平台配置；未访问 Cloudflare 管理后台。

## 3. 真实契约与适配

行号对应本次 HEAD，实施前复查变动。

| 能力 | 源码证据 | Library 适配 |
| --- | --- | --- |
| 环境 | package.json；实装 Node24.16.0、pnpm10.29.3、Next16.1.1、React19.2.3、TS5.9.3 | 用 pnpm，不加在线服务 |
| 静态输出 | next.config.mjs:8 export，17–18行并发4、每worker至少50页 | 不引入runtime route handler，不改并发掩盖内存问题 |
| 路由 | src/app/(legacy) 与 (localized)/[locale] | /library 英语兼容入口，加/en、/zh-CN、/ja |
| URL | src/lib/i18n.ts:45 localizeHref(href,locale)，55行白名单，保留query/hash | 窄加 library(?:/items/[^/]+)?，不提前开collections |
| SEO | src/lib/localized-metadata.ts:58 localizedPageMetadata(route,locale,base)，67行localizedDynamicMetadata(route,locale,copy,base) | 列表登记PAGE_COPY，否则退成Topics文案；详情用dynamic helper |
| 导航 | src/components/site-header.tsx:13 NAV，桌面和移动共享 | 只增NAV一项，继续只有顶部语言下拉 |
| Dock | navbar.tsx、resume.tsx存在，但site-document.tsx:145当前挂载SiteHeader/SiteFooter | 不改未挂载Dock |
| Topics | src/data/topics.ts:3 Topic、75 TOPICS、249 getTopicBySlug、328 localizedTopic | 稳定键slug，不虚构topic_id，不改归类算法 |
| Topic页 | src/app/(legacy)/topics/[slug]/page.tsx:37共享renderPage(locale,slug)，localized复用 | 共享渲染增加最多6条资源 |
| 文章接口 | src/data/blog.ts:196 getBlogPosts、200 getPostMeta、306 getPostTranslations、311 getLocalizedPosts、322 getPostHref | 只读adapter校验关系与语言链接 |
| 文章身份 | blog.ts:34–47含translationKey/sourceSlug/translations | 语义关联存translationKey和锚定slug，不把项目slug当文章slug |
| 正文渲染 | **src/components/blog/article-view.tsx**；267行Topics、312行Related Posts | Further Reading加这里，不改MDX |
| 旧文章URL | legacy/blog/[slug]已删除，scripts/emit-legacy-blog-redirects.mjs生成跳转stub | 不恢复重复正文route，保留旧URL |
| Research | src/data/research-projects.ts:1 ResearchProject、25 PROJECTS | 稳定键slug；仅构建端读取必要投影 |
| 索引 | scripts/lib/content/indexes.mjs的buildTopicIndex/buildRelations | Library独立审核关联，不让旧compiler反向依赖Library |
| 缓存路径 | scripts/lib/content/paths.mjs:14和src/data/blog.ts:11依次解析CONTENT_CACHE_DIR、VERCEL+.next/cache/content、.generated | 复用入口，不硬编码.generated |
| sitemap | scripts/generate-static-assets.mjs:216 buildSitemapShards、286 writeSitemaps、299–302删除未登记分片 | Library并入同一expected集合；RSS本轮不变 |
| 产物检查 | scripts/check-i18n.mjs:20页面表、64–81文章/旧跳转；package build已调用 | M3加Library，远程export后检查 |
| analytics | src/components/analytics.tsx:26–40加载GA4 | 无QDS事件、会话/保留策略证据，另案核验 |

当前12个Topic：stablecoin、perp-dex、cex、l1-l2、ai、ai-crypto、rwa、yield、robotics、quantum、market-structure、tokenized-equities。

## 4. 部署冲突核验

| 证据 | 观察与边界 |
| --- | --- |
| README | 声称Cloudflare Pages+Worker，引用不存在的deploy-cloudflare.yml、worker:dev；package也无preview。文档陈旧，不能据此改部署 |
| .github/workflows/ci.yml | 声明Vercel Git部署；实际lint/typecheck/content:prepare/test，不做next build |
| vercel.json | 只有响应头；单靠此文件不足以证明生产归属 |
| Vercel只读项目记录 | indiebuidl/portfolio，ID prj_z4qpFFuQOQzt9FFesfSP6klkosRi，绑定chuhemiao/portfolio |
| Vercel最新生产记录 | dpl_98P5A3Wt2oaL3MZUoafLjbYLe42G，READY，2026-11-02 07:28:56 UTC创建，Git SHA与本地HEAD相同；未读取完整构建日志/峰值内存 |
| 域名记录 | kkdemian.com与www verified；apex配置308到www |
| 2026-11-02 07:37 UTC HEAD/DNS | apex308到www、www200；server cloudflare、x-vercel-cache HIT、x-vercel-id；DNS为Cloudflare地址。支持Cloudflare前置/Vercel内容服务判断，不证明全部路由 |
| 本地扫描 | 无wrangler、Worker业务或deploy-cloudflare配置；不能据此断言外部Worker不存在 |

以上只保留为已取得的审计证据。按用户最新范围，**停止延伸部署架构/Worker调查**；即使外部配置未验证，也不阻塞纯静态Library开发。Worker按本次需求视为不使用，不新建或恢复；不改README、next.config、vercel.json、DNS或CI。M4仅保留远程构建、静态产物与缓存一致性验证；本轮不改已有apex canonical基址。

## 5. 规模与性能

只读统计：7,428 MDX；编译索引7,428条、3,082 translationKey组；PROJECTS 2,822；TOPICS12。blog-index.json为8,902,411 bytes，生成于2026-11-02T07:16:38.657Z。

源码推导主要route小计：`7428 + 4×12基础 + 4×12主题 + 3×1发行方 + 3×100品种 = 7827`。这不是实测构建数，不含系统页和7,428个旧文章跳转。旧.next manifest为10月31日、7,455 routes，不能作为当前基线。

300候选不等于300公开项。若只有100条完成审核，公开列表最多100条。100精选详情覆盖legacy+三语，新增`4×(1+100)=404`页，约主要route推导值的5.2%；不能据此推导时间或内存增幅。

客户端只含Library公开投影，禁止捆绑8.9MB博客索引或全量PROJECTS。PRD目标：300条增量生成<10秒、公开索引<1MB（不含图片）、搜索p95≤100ms；均待固定设备/输入/压缩口径实测。新增模块JS建议gzip≤60KiB（不含现有共享框架），是待基准校准提案。移动真实用户LCP p75≤2.5s须M4有样本后判断。

## 6. 方案差异与待决策项

1. **query noindex**：静态`?q=`共用HTML，不能按query产生服务端robots。建议列表整体noindex,follow，只索引精选详情，此时sitemap为300个详情URL。若裸列表需索引，则须实测现有静态托管层query-specific X-Robots-Tag，最多303个canonical URL。该取舍**待产品决定**，只阻塞M3 SEO，不阻塞M1；不为此引入Worker，客户端robots不是可靠替代。
2. **YouTube enrichment**：API字段不进评分，刷新/删除/公开Git历史/旧部署撤回未闭环前disabled。独立人工链接和原创说明仍需审，不能洗掉API provenance。
3. **三语**：UI、编辑题/摘要/推荐理由/精选编辑说明完整覆盖zh-CN/en/ja；外部原作保留原语言，不复制未经授权全文。原题与译题分字段，不补造原材料没有的判断。
4. **审核**：M1可用人工editorial selection，M2验证分类与B3；120条独立双评和20–30人研究不可由模型多次回答冒充。
5. **灰度**：隐藏导航不构成权限控制；未审候选不得打进public/bundle/sitemap/HTML。私密试用需要已验证部署保护，否则只用允许公开数据。

## 7. 风险与Gate

| 优先级 | 风险 | 处置 / 决策责任 |
| --- | --- | --- |
| 高 | 永久公开Git与短期/撤回数据冲突 | M1字段权利闸门；敏感/短期材料仓库外；来源审核人批准 |
| 高 | 静态撤稿需部署/CDN/旧部署可达性核验 | M4演练；发布负责人，不承诺分钟级SLA |
| 高 | 300/100数量和人工评审资源未就绪 | 编辑负责人提供真实材料/批准，不用fixture或空译文充数 |
| 中 | query SEO折衷未冻结 | 产品负责人在M3前选择 |
| 中 | 大站404新增页成本未测 | 远程测耗时/内存；Mac不全量build |
| 中 | GA权限、留存/同意策略未知 | 不发原始q/收藏清单/指纹；不足则先人工研究 |
| 中 | 三语漂移/实体错关联 | 显式审核、adapter外键检查、对比报告 |

## 8. 验证、回滚与证明边界

本轮实测：pnpm typecheck通过；pnpm test **154/154**；pnpm content:check **7,428 MDX**。临时日志为`/tmp/library-phase0-typecheck.log`、`/tmp/library-phase0-test.log`、`/tmp/library-phase0-content-check.log`；关键结果已留本报告。它们证明既有源码轻量基线，不证明尚未实现的Library、外部许可、性能或撤稿。

后续回滚先移导航/Topic/文章入口，再一致恢复路由、manifest、公开快照和sitemap，经远程构建与授权发布落实。仅隐藏UI不能撤回旧JSON/HTML；历史数据回滚仍须通过**当前**来源/期限/撤权闸门。逐文件范围见实施计划。

**下一可安全实施：M1-01。** 只做Schema、deny-by-default校验与虚构fixtures，不联网、不导入真数据、不加UI、不改部署。真实内容前需来源审核、公开Git存储决策和编辑人选；发布仍遵守用户授权。本轮不自动开始实施或发布。

## 9. 规划独立复核

review-agent已读取四份规划及必要源码/PRD，确认404页推导、300/303 sitemap区别、article-view接线和sitemap清理判断。最初发现两项P2：未审状态不能合法表示空审核记录、推荐理由没有逐条依据绑定；均已修订，并补充未评分为null，避免伪造审核或分数。M1-01/M2-05验收同步更新。

二次窄复核确认上述问题闭环，无新增规划阻塞；同时确认Worker/托管调查已移出开发前置。复核未独立重读外部政策或验证平台配置，不构成实现或发布验收。文档本地链接、代码围栏、JSON样例、22唯一任务与4个Gate的无环依赖已检查；没有生成任务代码或业务数据。
