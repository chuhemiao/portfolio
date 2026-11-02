# M1-01 独立复核修复记录

2026-11-02。此记录覆盖四项实际复现的合同缺口，不是来源授权或人类评测证明。

| 缺口 | 修复前行为与RED证据 | 修复及回归 |
| --- | --- | --- |
| 草稿passed检查可无审核 | private draft设置metadata_valid.passed=true、review_event_id=null，仍valid；新增用例先失败 | 所有状态的passed检查均要求当前revision/hash绑定审核；未通过的草稿仍允许null |
| 旧publish复活撤稿 | published fixture后追加同revision或更高revision的takedown，旧行仍eligible；新增用例先失败 | 最新生命周期事件必须与publish一致；后续修订/拒绝/隔离/撤稿等使被引用旧批准失效，不把独立checks当互相覆盖 |
| candidate外层字段漏权利检查 | source_record_id/source_url/observed_at仅因在resource外未被检查；撤掉store/public_git权限仍valid；新增用例先失败 | 外层三字段与resource字段共同执行provenance、存储和公开Git权利校验 |
| refresh期限未执行 | 声明每日刷新后到期仍eligible；未来fetched_at也可延长窗口；新增两用例先失败 | 用fetched_at或明确的observed_at锚点，截止时刻起拒绝；未来/未知时刻拒绝，retention与refresh分别检查 |

修复后`pnpm test:library`通过44/44（原39加5条回归，含同/跨revision撤稿和刷新边界）。全局回归将在M1工具集成后的最终代码上再次运行，不能用修复前193项绿色结果代替。
