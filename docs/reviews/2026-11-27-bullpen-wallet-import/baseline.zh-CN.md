# Bullpen 私钥导入事件 — 非托管叙事与竞争壁垒的压力测试

## TL;DR

Bullpen 大概率不会彻底禁用私钥导入。更可能的是**逐步限制**：永久关闭 2024 年 beta 遗留通道，将导入钱包纳入 Turnkey 的策略与签名控制，叠加 passkey、2FA、提现白名单和大额延时；导入入口保留，但被降级、限额并分层管理。真正被削弱的是“非托管=安全”的营销等式——当登录账户就能触发签名，非托管只剩法律层面的标签。竞争壁垒会受损，但问题出在信任与积分/空投飞轮，不在 custody 技术路线。

---

## 事件校准

先校准金额与账户数量：你提到的“约两百万”是初值，链上追踪与后续报道的数字是**约 257 万美元**；受影响的是 **18–19 个 2024 年 4–6 月早期 beta 账户**，包括联合创始人 Ansem，占注册用户**不到 0.005%**。按 Bullpen 自己的披露反推，注册用户至少**36–38 万**。Bullpen 称 **99.8%** 的损失来自单一账户，结合披露基本就是 Ansem，因此这不是平台级普遍损失，而是针对早期测试用户群的定向接管。[Bullpen 声明](https://x.com/BullpenFi/status/2125267130870272331) [99.8% 更新](https://x.com/BullpenFi/status/2125314571158073654)

真正值得注意的是时间跨度：2024 年 6 月导入的 Solana 私钥，到 2026 年 11 月仍有签名能力，约 **29 个月**。Bullpen 只说攻击者通过“与账户绑定的遗留系统”进入，没有说明密钥是留在旧测试环境还是被迁移到生产；但结果一样——早期导入的密钥在近两年半后仍能触发转账。[Bullpen 最终说明](https://x.com/BullpenFi/status/2125585437687181318) 另有报道称旧账户的 2FA 被绕过；这与“Turnkey 密码学被攻破”是两回事，问题更像账户认证与签名授权，而非 MPC/TEE 本身。[Odaily 转述](https://www.kucoin.com/news/flash/bullpen-2fa-vulnerability-leads-to-19-account-breaches-49-ansem-supply-remains-secure)

资金路径也降低了追回概率：约 **8750 万枚 ANSEM**（约 8.8% 供应）在数小时内卖出，ANSEM 24 小时跌约 **41%**；资金经 Relay 桥到 Arbitrum，再换成 BTC，据 AMLBot 引述约 **42.24 BTC（约 250 万美元）**已在链上静置（dormant）。Bullpen 称正配合 FBI，但截至 2026-11-27，公开信息中仍未给出赔偿方案。[Bankless](https://www.bankless.com/read/news/ansem-blames-bullpen-breach-for-2-57m-wallet-drain) [Airdrops.io](https://airdrops.io/bullpen/) 链上观察者仍在争论“黑客攻击还是自导自演”，但 19 个账户被未授权访问已是公司确认的事实；签名者身份仍未定论。[Unchained](https://unchainedcrypto.com/ansem-says-his-solana-wallet-was-hacked-through-his-bullpen-profile-some-analysts-doubt-it/)

## 架构真相

Bullpen 的公开说法是“**fully non-custodial**，由 Turnkey 的企业级基础设施管理私钥，air-gapped、military-grade”；同一张首页又写着“**Bring your wallets. Import your SVM + EVM wallets**”。[Bullpen 首页](https://bullpen.fi/) 文档进一步说明：注册时自动创建 Turnkey 嵌入式钱包，用户可导出私钥；也支持粘贴私钥或 12/24 词助记词导入。[创建账户](https://docs.bullpen.fi/getting-started/creating-an-account) [钱包管理](https://docs.bullpen.fi/getting-started/wallet-management)

这三件事并不矛盾，但拼在一起就暴露了真正的边界。Bullpen 文档的表述是“只有你能授权交易”；可一旦用户把**完整私钥**导入，签名能力就落在“账户 + 应用”这一层。账户被接管，非托管在“谁持有密钥”的技术定义上仍成立，在损失承担上却和托管无异——Bullpen 的条款明确写“你对自己账户下发生的一切活动负责”，且“Bullpen 不是托管人、不对交易损失负责”。[Bullpen 条款](https://bullpen.fi/terms) 所以“非托管”描述的是**谁持有密钥**，不是**谁能发起签名**；后者才是这次事故的失败边界。

因此，“更严格的托管架构”要拆成两层：更严格的**签名授权**（passkey、设备绑定、白名单、延时、硬件确认）是大概率，而且不需要放弃非托管；真正的**托管化**（Bullpen 持有密钥、可冻结或找回）是小概率，那会改变牌照、资本和品牌基因。把两者混为一谈，就会高估 Bullpen 转向托管的可能性。

产品层面其实已经在“逐步收紧”：CLI 文档写明，导入的 EVM 钱包“可见，但不可用于 Bullpen 管理的转账、Polymarket 恢复、托管交易和主 EVM 选择”；Solana 导入则仍被描述为完整功能。[Bullpen CLI](https://cli.bullpen.fi/reference/commands/wallet/import/) 这说明 Bullpen 并非没考虑过限制导入，而是**按链、按功能分层限制**——EVM 已降级，Solana 仍保留完整导入。它更像“禁用无约束的导入”，而不是“禁用导入”。

## 弃用路径

截至 2026-11-27，没有看到 Bullpen 任何“弃用私钥导入”的官方声明；最新说法只是“永久关闭受影响的遗留系统”，并强调其他账户未受影响。[Bullpen 更新](https://x.com/BullpenFi/status/2125585437687181318) 从激励上看，全面弃用也不符合它的融资说法：投资方页面把“**Non-custodial is non-negotiable**”列为四条投资逻辑之一；转向真正托管等于换一门生意，需要牌照、资本和合规体系。[投资方页面](https://docs.bullpen.fi/about-bullpen/investors)

全面弃用还有三个现实阻力。第一，导入是获客入口——专业交易员和空投参与者普遍不愿为了一个终端重新建钱包、搬资产，“Bring your wallets”是首页卖点。第二，行业方向相反：Pump.fun 计划在 11 月 30 日后退役网页端外部钱包登录，迁移用户需改用邮箱/社交登录，导入私钥由 Privy 持有；Karpelès 批评其“端到端加密”说法误导，因为 Privy 的 TEE 会解密并持有私钥。[The Block](https://www.theblock.co/news/ecosystems/2026-11-23-pump-fun-draws-criticism-over-private-key-imports-as-it-retires-external-wallet-sign-in-on-web-444926) 第三，删掉导入按钮不解决根因：嵌入式钱包同样可能被账户接管，真正的修复是认证与签名策略，而不是导入入口。

| 情景 | 具体动作 | 判断 | 对非托管定位与壁垒 |
|---|---|---|---|
| **逐步限制 / 分层硬化（基准）** | 关闭 2024 beta 遗留通道；导入强制迁移到 Turnkey 策略；passkey/2FA、提现白名单、大额延时或硬件确认；导入钱包限额或降级 | 最可能 | 标签保留，但“fully non-custodial”改为限定表述；短期信任折价，长期看执行 |
| **全面禁用导入** | 只留 Turnkey 嵌入式钱包；外部钱包只读；禁止粘贴私钥/助记词 | 中低 | 安全叙事更纯粹，但“bring your wallets”卖点消失；专业用户流向 Axiom、Photon、Trojan、GMGN |
| **转向托管 / 可恢复账户** | Bullpen 持有或可冻结密钥，提供找回、保险 | 低 | 彻底改写品牌与融资逻辑；需要牌照与资本，不再是 crypto-native 非托管终端 |

## 壁垒重估

从财务看，Bullpen 从来不是靠手续费轻松盈利的成熟生意：过去 30 天费用 **15,279 美元**，年化约 **49 万美元**；2026 年 10 月费用 **23,982 美元**，对比 2025 年 10 月 **161,631 美元**，约 **-85%**；Q4 2026 至今 **36,550 美元**，而 Q4 2025 全季 **314,620 美元**。Perp 30 天名义成交 **3,366 万美元**，累计 **24.87 亿美元**（数据截至 2026-11-27）。[DeFiLlama](https://defillama.com/protocol/bullpen) 也就是说，事件之前手续费业务就已经在降温；这次事故更像是加速器，而非起点。

终端类产品的壁垒通常是执行质量、资产发现、社交/分发、切换成本和积分/代币预期；custody 只是底层信任条件，不是差异化来源。Bullpen 真正的壁垒是 **Ansem 的流量与信任、100M 积分（约 70M 未分配、Season 3、尚无 TGE）、$BULL ticker、Hyperliquid + Polymarket + Solana 一站式体验**，以及 6th Man Ventures 领投、Delphi/Manifold/Karatage/Temporal/Sparta 参投的背书（金额与估值未披露）。[MEXC](https://blog.mexc.com/token-reviews/bullpen-airdrop-2026-how-to-farm-bull-points-on-the-multi-chain-terminal-co-founded-by-ansem/) [投资方页面](https://docs.bullpen.fi/about-bullpen/investors)

这次事件打中的正是这条飞轮：用户要在终端里留资金才能快速交易；联合创始人公开说“不能确信资金安全、建议先提走”，会先压低存款与交易量，再传导到积分参与。积分/空投 EV 被加了一层安全折价，这比 257 万美元本身更贵。[Airdrops.io](https://airdrops.io/bullpen/) 外溢效应是品类折价——所有要求导入私钥的终端都被重新审视，竞品可能借“no key import”抢短期信任红利；但 Bullpen 若真的全面弃用，反而会把专业用户推向竞品。**非托管不是护城河，是入场券；真正的壁垒是让用户愿意把资金留在这个界面里。**

## 结论

把这次事件读成“非托管 vs 托管”的二选一，会误判 Bullpen 的最优反应。它真正要修的是**从登录到签名的授权链**，而不是把钥匙从用户手里拿走。全面禁用导入既不能消除账户接管风险，又会牺牲获客；托管化则与它的融资说法和品牌基因冲突。基准情景是逐步限制：旧 beta 通道停用，导入被降级并纳入 Turnkey 策略，passkey/2FA/白名单成为默认。非托管标签会保留，但“fully non-custodial”从风险承诺降级为法律描述。

未来 2–4 周，三个硬信号足够判断方向：是否公布根因与赔偿；导入钱包是否被限制提现或交易；存款与交易量是否在两周内恢复。**底线判断：** 短期看，“是否弃用导入”不是最关键的问题——真正的信号是 Bullpen 敢不敢公布根因、赔偿方案和导入钱包的签名策略。三件事都含糊，“fully non-custodial”就只是营销；三件事都做实，非托管定位反而能从“标签”升级为“可验证的承诺”。