# Library 来源权利与安全矩阵 v1

核验日期：2026-11-02。工程接入提案，不是法律许可或来源审批。本轮未下载数据集、未带密钥调用内容API、未批准真实source。pending/disabled均按deny处理。

## 1. 逐源矩阵

| 来源 | 核验依据 | 获取/存储/展示/派生边界 | 初始状态与启用条件 |
| --- | --- | --- | --- |
| HN官方API | 提供ID、URL、时间、deleted/dead、HTML text等；API仓库MIT不等于评论版权许可。[HN API](https://github.com/HackerNews/API) | 优先有限ID/讨论URL/时间/删除标记/核验关系；正文、画像、excerpt默认不保存/公开；自设并发与退避 | pending；逐字段确认使用、归属及派生依据 |
| OpenIndex HN dump | 标odc-by；数据库权利不同于单条内容权利。[数据集](https://huggingface.co/datasets/open-index/hacker-news)、[ODC-By §2.4](https://opendatacommons.org/licenses/by/1-0/) | 不下载全库；获批后raw仍留仓库外，有限派生记录另审，保留revision/归属 | disabled；数据库许可不解决评论版权、隐私和删除义务 |
| YouTube Data API | 多数Non-Authorized数据30天后刷新或删除；衍生指标受限；III.L额外例外须适用的获批资格。[政策III.E.4/III.L](https://developers.google.com/youtube/terms/developer-policies) | 不永久commit API标题/作者/统计/封面响应；可删除缓存带fetched_at/expires_at；任何API字段不进入rank-v1；未验证例外资格 | **disabled**；刷新、删除、旧部署/CDN撤回、凭据/用途许可闭环后另案启用 |
| YouTube链接与素材 | 正确展示官方元数据/缩略图/播放体验。[指南](https://developers.google.com/youtube/terms/developer-policies-guide) | 独立人工链接不洗白API来源；原题与三语编辑题分别归属；无素材依据用文字卡；不截帧替代缩略图、不下载音视频/默认抓字幕 | pending；审核独立链接和原创说明，P0优先外链 |
| EIP文本 | EIP-1要求CC0，仓库有CC0。[EIP-1](https://eips.ethereum.org/EIPS/eip-1)、[LICENSE](https://github.com/ethereum/EIPs/blob/master/LICENSE.md) | 优先审具体EIP及commit，保留署名/版本/来源；不扩大到第三方外链、图片、论坛 | pending、优先审核；权利可用不等于current/已审 |
| Ethereum Research/项目规范/论文/文章 | 本轮未逐文验证；官方/开源/DOI不是完整再分发许可 | 元数据、摘要、全文、图片、派生分析分别审；根代码许可不覆盖第三方材料 | pending；逐源核验，不默认爬站 |
| Open Library | 发现/低频查询；默认1req/s、标识应用后3req/s；批量用dump，不作高流量后端。[API说明](https://openlibrary.org/developers/api) | UA/联系地址、缓存退避；目录与封面/全文权利分开；licensing页面本轮读取未成功，不宣称全部许可已核验 | pending；未确认素材权利不用封面，不批量HTML抓取 |
| Reddit | 商业用途需先获准。[官方说明](https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data) | 不借公开可见/登录推定允许采集、embedding或发布评论 | disabled；另案取得用途/访问许可 |
| X/Discord/Telegram | 未核验具体平台、社群或作者授权 | 不复用旧Telegram同步权限扩大Library用途，不采集私群/画像 | disabled；独立审批 |
| 自有文章/编辑说明 | 用户要求站内只读关联 | 使用translationKey/slug，不复制重发；第三方引用和图片另受约束；标editorial_selection，不伪装社区推荐 | 接口结构可实现，每条选择/关系仍须审核 |

政策核验不等于项目获批；实施时复查政策版本与实际使用条件，不能把本表的条件可用直接写成approved。

## 2. 字段级Policy

至少包含policy_version/status/acquisition_method/license_identifier/license_url/approval_basis_url/approved_by/approved_at/last_legal_review_at/review_due_at。文档核验时间与真正授权时间分别记录。

allowed_fields按fetch/store/display/derive/public_git/public_snapshot分别列白名单，空数组即禁。fetch_allowed/store_raw_allowed/show_excerpt_allowed/derivative_analysis_allowed默认false，且必须与字段白名单同时满足。attribution_required和attribution_text必须可执行。

retention_mode、retention_days、requires_refresh、refresh_interval_days、deletion_required、public_history_allowed共同约束；null不代表永久。每个派生字段保留origin source、record ID、policy version、fetched_at/expires_at。人工粘贴、翻译或聚合不能去掉API原始义务。

资源、证据、译文、素材和站内关系分别审核。item通过不代表excerpt/封面也可公开。候选也在公开仓库存储边界内：无权/私有原文、投诉、身份映射、短期API缓存及凭据留仓库外。gitignore不能替代“不复制进仓库”。详见[data-contract-v1.md](data-contract-v1.md)。

## 3. 安全控制与失败路径

| 边界 | 控制 | 验证 |
| --- | --- | --- |
| 本地导入 | JSON/CSV默认dry-run；大小/深度/条数/字段白名单；解析不自动请求资源URL | 畸形/超大输入、敏感字段、CSV公式不执行 |
| 获批connector | 固定HTTPS主机/路径，DNS/IP/逐跳重定向检查；拒绝private/loopback/link-local/metadata/凭据URL | IPv4/IPv6特殊地址、跳转私网、DNS重绑定、限流/超时；出站约束做不到则不启用 |
| canonical | 保留身份query，只删已知tracking；跨域merge/split须审核 | ISBN不同版、DOI/arXiv版本、短链、相似题名误合并 |
| 输出/外链 | 文本渲染，不执行来源HTML/Markdown；协议检查；noopener noreferrer | XSS、javascript/data/file、危险图片、不把详情当open redirect |
| 模型 | data-only、无工具权限；严格Schema/长度/枚举/源记录校验 | injection、编造ID/URL、模型批准rights、日志泄密；失败转人工 |
| 隐私 | actor只作内部去相关，必要时仓库外密钥HMAC；不公开画像/映射/投诉 | hash不等于匿名化；必要作者归属不得误删 |
| 发布/读取 | 先资格后评分，显式公开allowlist，快照版本/hash一致 | draft/blocked/expired泄漏到HTML/JSON/bundle/sitemap/facets/关联 |
| 收藏/事件 | 只在本机存状态；失败降级；不发送完整清单、原始q、身份指纹 | 禁存储/损坏/配额，GA失败不影响检索 |

## 4. 撤稿、到期与恢复

takedown/revoked须从items/evidence/rankings/facets/Topic/文章区块/详情/SEO及所有可达旧快照撤除。仅隐藏列表不算撤稿。举报使用站主确认的既有联系方式；投诉正文不公开提交，不建runtime reports API。

静态撤稿依赖授权发布、CDN与旧deployment可达性验证；不承诺分钟级SLA，不新增Worker denylist。M4核验真实联系人和执行权限。

构建失败只保留**仍合法且未过期**的旧快照。若旧内容撤权/到期，阻断并人工处置；不能以安全降级名义继续发布。回滚也重新执行当前撤权与有效期闸门。

公开Git历史和第三方缓存无法靠普通回滚删除。需要限期删除/撤回历史的数据不得进永久公开Git或不可撤历史产物，这是当前禁用YouTube enrichment的原因之一。

## 5. 启用Gate和责任

工程人员实现闸门；所有者/指定来源审核人批准权利；编辑审核内容与证据，三者职责不能混同。启用需适用政策依据、字段白名单、审批人、保留/归属规则、删除测试和真实样本审核记录。条件未满足只做mock测试。

M1优先许可明确规范和原创编辑说明；五类、300候选/100公开仍需真实材料审核，不保证数量即达标。M2的120条独立双评、M4的20–30名参与者必须真实完成；agent复核只补充工程审查。
