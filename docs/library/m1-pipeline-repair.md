# M1 导入与公开快照复核修复

2026-11-02。依据独立只读复核提供的四个可复现问题实施窄修。未修改已接收的 Schema、业务路由或部署方式。

| 问题 | 改前行为测试 | 修复与保留边界 |
| --- | --- | --- |
| Open Library ISBN URL 与显式 ISBN 冲突 | 两个校验有效但不同的 ISBN 未抛异常 | 在唯一身份规则中分别转换 ISBN-10/13 后比较；同一 ISBN 的等价写法保持合法，未证 work/edition 关联仍需复核 |
| 快照内容地址未复算 | 修改题名并更新文件 hash/bytes 与 manifest checksum，旧 snapshot_id 仍可读 | 生成器和独立 reader 复用已有内容地址算法，绑定 payloads、schema/input/code/rank/as_of；不引入身份认证或签名承诺 |
| 私有导入跳过存储白名单 | 取消 title_hint 的 store 权限后，private write 仍 accepted=1 | 在实际 import consumer 检查每个非空字段的来源版本与 store 权限，包括已存候选的重放；private 仅豁免公开 Git 历史权限，合法私有草稿及空批准字段合同保持不变 |
| 无关 Schema 错误遮住撤权 | source.revoked 加 item 未知字段时，构建虽拒绝，旧 manifest 仍存在 | 构建失败时独立核对明确撤权、到期、后续失效事件及审核链信号，先撤本地公开指针并清旧快照；仅有普通坏 Schema 时保留上次合法输出 |

新增四个测试先实际失败：ISBN 缺少预期异常、私有导入实际 accepted=1、内容被改后未拒绝、撤权后 manifest 未删除。修复后首次目标 29/29 通过；同模式核对后将候选重放也纳入存储检查，最新 Library 75/75 与 TypeScript 检查通过。最终真实数据入库后再运行全量验证。

范围：本地生成目录的有效期、完整性和撤回行为。内容地址不是身份认证；不声称阻止具有写权限者重新构造全部源数据和地址，不声称旧部署或 CDN 即时下架。部署可达性仍由 M4 验收。
