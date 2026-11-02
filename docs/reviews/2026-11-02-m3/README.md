# M3 检查记录

- [交付说明](../../library/m3-delivery.md)：页面行为、所有权、存储/隐私边界与 M4 未验项。
- [validation.json](validation.json)：实际计数、M2 文件 SHA 保全、命令结果、失败历史、重试和证明限制。
- [relations-review.json](relations-review.json)：10 个真实文章组、20 次 editor 命令及原始 catalog 保全结果。[apply-relations.mjs](apply-relations.mjs) 为本次历史执行脚本，不是新的常规维护入口。
- [global-tests.log](global-tests.log)：292/292；最后 public-reader/catalog 并发修复之前。
- [final-targeted-tests.log](final-targeted-tests.log)：最后修复后 34/34，含真实临时目录四并发、10 秒持续锁、事务/hash 拒读、同进程失败缓存恢复及三语 SSR。
- [typecheck.log](typecheck.log)、[eslint.log](eslint.log)、[reader-eslint.log](reader-eslint.log)：最后类型检查、完整变更范围及随后 reader/catalog 的定向 lint。
- [library-validate.log](library-validate.log)、[library-build.log](library-build.log)、[assets-build.log](assets-build.log)：真实本地审核集合、公开快照与静态资产生成。
- [sitemap-check.json](sitemap-check.json)：对生成 XML 的只读核验，300 个 canonical 详情 URL，0 列表/legacy/query。

`frontend.test.mjs` 使用真实 React/Next Link 的 Node SSR，配有 TSX/alias loader 和 server-only marker 适配；没有 DOM、Next RSC export、浏览器网络或布局引擎。临时目录与固定时钟仅用于清楚标注的合成合同 fixture，不进入真实 catalog。以上记录不代替 M4 实际浏览器和全站导出验收。
