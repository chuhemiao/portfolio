# Trust Wallet 安全战略：签名之后，备份与 Passkey 的再平衡

## TL;DR

- **结论：不应做“从签名转向备份”的二选一；应把增量安全预算转向备份/恢复，签名防护保持基线并平台化。** 签名仍是最高频攻击面，但已进入标准化、商品化阶段；助记词泄露则是低频、高致命性的尾部风险。
- **这轮 iOS 套件打的正是备份层。** Coruna/DarkSword 扫描照片、笔记和本地文件中的助记词；SEAL 在 2026-10-28 至 11-03 一周内记录到 **362 万美元 + 0.91 BTC** 的 seed compromise；Bitquery 追踪到 **400 万美元 USDT** 的 iPhone 钱包盗刷网络。
- **Trust Wallet 不是没有答案，而是答案还不是默认。** SWIFT 已是 passkey + 账户抽象的智能合约钱包，但只覆盖 6 条链，恢复依赖 iCloud/Google；主钱包仍是助记词模式。把 passkey/MPC 做成默认，既是安全投入，也是激活增长。
- **Passkey 会成为账户层默认，YubiKey 是高价值账户的硬件根。** 全球已有 **70 亿**个 passkey、**36%** 的登录使用 passkey；Yubico 2026 年 Q3 净销售 **+29.3%**、订单 **+88.2%**。每个人需要一个抗钓鱼凭证，但高价值用户需要两个独立根 + 可演练的恢复路径。

---

## 事件：被攻破的是备份层

这轮 iOS 攻击的经济损失集中在助记词/私钥泄露，而不是交易签名环节。Coruna 套件包含 **5 条完整 iOS 利用链和 23 个漏洞**，覆盖 iOS 13.0 至 17.2.1，通过假的中文金融网站投递，专门扫描短信、照片和笔记中的助记词关键词；DarkSword 覆盖 iOS 18.4 至 18.7，具备钱包数据采集能力；worse_query 则是一个 iOS 沙箱逃逸漏洞，恶意 App 可以读取其他 App 的本地文件，Binance 因此警告 iOS 26.7.1、27.0.1、27.2 用户把助记词、私钥和登录凭证视为“全生态风险”。这些攻击的共同点是：它们不要求用户签任何交易，也不需要绕过钱包的交易确认页。[Cointelegraph](https://cointelegraph.com/news/google-warns-crypto-scams-using-new-and-powerful-iphone-exploit-kit)、[Cointelegraph](https://cointelegraph.com/news/binance-warns-ios-flaw-could-expose-crypto-wallet-keys)

| 时间 | 事件 | 攻击面 | 损失/影响 |
|---|---|---|---|
| 2026-03 | Coruna 套件曝光 | iOS 13.0–17.2.1；钓鱼网站投递；扫描短信/照片/笔记中的助记词 | 5 条完整利用链、23 个漏洞 |
| 2026-03 | DarkSword | iOS 18.4–18.7；恶意广告/过期分析标签投递；钱包数据采集 | 多团伙使用，Apple 后续修复 |
| 2026-09 | FomoPeek | App Store 恶意 App；沙箱逃逸读取 Keychain 与其他 App 文件 | 约 58 万美元 USDT |
| 2026-10-05–11-04 | Bitquery 追踪 | iPhone 钱包盗刷网络；TRON | 400 万美元 USDT；365 个地址、43 个归集钱包 |
| 2026-10-28–11-03 | SEAL 周报 | seed compromise | 362 万美元 + 0.91 BTC |
| 2026-11 | worse_query | iOS 26.7.1/27.0.1/27.2；恶意 App 读取其他 App 本地文件 | Binance 警告；补丁是否修复未确认 |
| 2025-12 | Trust Wallet Chrome 扩展 v2.68 | 供应链注入；客户端在解锁后可访问助记词 | 2,520 个地址、约 850 万美元 |

来源：[Cointelegraph：Coruna](https://cointelegraph.com/news/google-warns-crypto-scams-using-new-and-powerful-iphone-exploit-kit)；[Trust Wallet iOS 安全公告](https://trustwallet.com/blog/security/ios-update-crypto-wallet-security)；[CryptoSlate：FomoPeek](https://cryptoslate.com/rogue-iphone-app-escapes-ios-sandbox-to-hijack-580000-in-usdt/)；[CryptoSlate：Bitquery 追踪](https://cryptoslate.com/zero-click-ios-exploits-drain-4m-usdt-from-active-tron-wallets/)；[SEAL 周报](https://radar.securityalliance.org/seal-weekly-stats-28-oct-3-nov-2026/)；[SlowMist/BlockBeats：Chrome 扩展分析](https://en.theblockbeats.news/news/60689)。

Trust Wallet 的公开回应是两句话：一，iOS 用户不受 worse_query 影响；二，它不以明文存储助记词或私钥，每个钱包在设备本地加密，并由内置安全机制保护。这个说法在技术上成立，但它回答的是“服务器/备份是否泄露”，而不是“设备被攻破后，助记词是否还能被重建”。[Phemex](https://phemex.com/news/article/trust-wallet-confirms-ios-users-safe-from-worsequery-vulnerability-103144)

更值得警惕的是 2025 年 12 月的 Chrome 扩展 v2.68 事件：恶意扩展可在用户解锁后访问并外传助记词。最终 **2,520 个地址、约 850 万美元**资产受影响，Trust Wallet 进行了主动补偿。这个案例说明，passkey 解锁并不等于 seed 不可导出——只要钱包客户端能在本地重建助记词，被攻破的客户端也能。[Trust Wallet 事件通报](https://trustwallet.com/blog/company/trust-wallet-browser-extension-v268-incident-community-update)

需要说明的是，Bitquery 的 365 个地址不等于 365 个 iPhone 受害者；其报告中只有一个地址能与公开的 iPhone 用户账户对应，43 个归集钱包的共同控制也未被证明。损失数字应作为方向性证据，而不是精确的受害人数。但“攻击者绕过签名、直接拿助记词”这个模式，已经在多个独立事件中重复出现。

## 签名侧：仍是底线，但不再是壁垒

签名防护已经从差异化能力变成行业基础设施；继续投入是必要的，但边际收益正在下降。Trust Wallet 过去一年在签名侧的动作并不少：2025 年 11 月上线统一代币授权管理，2026 年 3 月上线覆盖 32 条 EVM 链的自动地址投毒防护，此外还有 gas 赞助、交易模拟和 AI 交易代理。这些功能解决的是“用户签错”的问题，但它们正在被行业标准快速拉平。

数据也支持这个判断。Scam Sniffer 观测到的 EVM 钱包 drainer 损失从 2024 年的 **4.94 亿美元**降到 2025 年的 **8,385 万美元**，降幅 **83%**；受影响钱包从 33.2 万个降到 10.6 万个，降幅 68%；最大单笔损失从 5,540 万美元降到 650 万美元。这说明交易模拟、黑名单、授权管理等签名侧防护确实在起作用。[DeepStrike/Scam Sniffer](https://deepstrike.io/blog/crypto-wallet-drainer-statistics)

但签名侧不能减配，因为它仍是最高频的攻击面。2026 年 1 月，签名钓鱼损失环比上升 **207%**，4,741 个钱包被盗，损失约 **627 万美元**；2026 年 11 月 27 日，也就是今天，仍有以太坊用户因地址投毒损失 **51,536 USDT**。对绝大多数普通用户来说，一次恶意签名仍然比一次 iOS 零日更可能遇到。[Yahoo Finance](https://finance.yahoo.com/news/signature-phishing-200-january-losses-143036953.html)、[ScamSniffer](https://x.com/realScamSniffer/status/2126177954816479665)

更重要的是，签名侧正在标准化。以太坊的 ERC-7730 在推进 clear signing，Ledger 把 Clear Signing 扩展到 Solana 的 Jupiter 和 Kamino，Solana 官方也在 2026 年 11 月 26 日宣布 Clear signing 上线。这意味着“我能让用户看清自己在签什么”很快就会成为所有钱包的默认能力，而不是某一家钱包的卖点。[Crypto.news](https://crypto.news/ethereums-clear-signing-standard-tackles-blind-transactions-with-erc-7730/)、[Decrypt](https://decrypt.co/383302/ledger-brings-clear-signing-to-solana-ending-blind-signing-for-jupiter-swaps)、[TechFlow](https://www.techflowpost.com/en-US/newsletter/147100/solana-clear-signing-launch)

Blockaid 的研究则从另一个方向提醒：2025 年到 2026 年初，DeFi 损失的大部分来自被攻破的密钥和基础设施，而不是合约漏洞；密钥一旦泄露，攻击者持有的是“合法凭证”，合约监控和签名监控都很难分辨。这个结论主要针对协议和机构密钥，不能直接等同于消费者钱包，但它说明“只盯签名”已经不够。[Blockaid](https://blockaid.io/blog/compromised-private-keys-remain-the-biggest-source-of-defi-losses)

所以正确的姿势是：签名侧保持 parity，接入行业标准和第三方风控；把自研预算集中到备份/恢复和供应链完整性。签名是底线，不是护城河。

## 备份侧：Trust Wallet 的缺口与增长杠杆

Trust Wallet 的问题不是没有 passkey 产品，而是 passkey 产品还不是默认、覆盖不全、恢复仍依赖云账号。主钱包仍然是“助记词 + 加密云备份”的模式：用户可以手动备份到 iCloud 或 Google Drive，但需要一个只有用户知道的加密密码；忘记密码或助记词，钱包无法找回。

SWIFT 是 Trust Wallet 的 passkey 答案：一个账户抽象驱动的智能合约钱包，用 passkey 代替助记词，支持指纹/面容创建、使用和恢复。但它只支持 **Arbitrum、BSC、opBNB、Base、Optimism、Avalanche** 六条链，恢复方式是“用与 iCloud/Google 账户关联的 passkey”；如果云账号丢失，用户要走 Apple 或 Google 的账号恢复流程。对多链用户来说，SWIFT 更像一个“安全侧舱”，而不是主钱包。[Trust Wallet SWIFT](https://trustwallet.com/swift)、[Trust Wallet 恢复说明](https://trustwallet.com/blog/company/trust-wallet-swift-understanding-passkeys-and-recoverability)

竞争对手正在把“无种子短语”变成默认入口。Coinbase Smart Wallet 是 passkey-first 的智能钱包，创建时不需要助记词；MetaMask 在 2026 年推出 Embedded Wallets，用邮箱、社交和短信登录，明确不再要求用户管理助记词；Breez SDK 也把 passkey 登录作为消除助记词门槛的方案。Passkey/无种子 onboarding 正在从“差异化”变成“移动端钱包的入场券”。[Coinbase Help](https://help.coinbase.com/wallet/getting-started/smart-wallet)、[MetaMask](https://metamask.com/news/embedded-wallets-developer-platform)、[Bitcoin.com](https://news.bitcoin.com/breez-sdk-integrates-passkey-login-to-eliminate-traditional-seed-phrase-barriers/)

Trust Wallet 有一个别人没有的优势：**2.2 亿次下载**和 Binance 的分发。但 CEO Felix 在 2026 年 3 月的采访里说得很直接：真正的瓶颈不是获客，而是激活和加深使用深度；安全是用户最在意的第一要素，也是品牌身份的核心。这意味着备份/恢复投入不只是安全成本，也是激活杠杆——少一次助记词抄写，就多一个完成首笔交易的用户。[Odaily](https://www.odaily.news/en/post/5135852)

市场层面，这次事件没有形成针对 TWT 的独立折价。2026-11-04 至 11-11 的急性披露窗口，TWT 跌 **1.35%**，同期 BTC 跌 4.73%、ETH 跌 9.82%；10-28 至 11-27 的同一窗口，TWT 跌 **30.4%**，SFP 跌 30.1%，BTC 跌 25.1%，ETH 跌 28.2%；恐惧与贪婪指数在 11 月 27 日仍是 **10（极度恐惧）**。这更像是小市值 beta 和整体市场回撤，而不是针对 Trust Wallet 的品牌危机。但用户信任的损伤是滞后的，不能用一个月的价格来证明安全投入的回报。数据来源：Surf 市场快照，2026-11-27 00:00 UTC；[Coinness](https://coinness.com/en/news/1177058)

真正的缺口在四个地方：助记词仍是新用户的最大摩擦；云备份密码是单点故障；SWIFT 的六链覆盖不足，多链用户仍留在助记词钱包；恢复依赖 Apple/Google，等于把单点故障从 12 个单词转移到了云账号。Trust Wallet 不需要从零造 passkey，它需要把 SWIFT 从“侧舱”变成“主入口”，并补齐恢复与链覆盖。

## Passkey：采用拐点已到，但 passkey-only 不是答案

Passkey 正在成为账户层的默认认证方式，但把它直接当作资产托管根，会制造新的单点故障。FIDO Alliance 在 2026 年 10 月估计全球有 **70 亿**个 passkey 在使用，而 2026 年 5 月这个数字还是 50 亿；在其 Passkey Index 中，**90%** 的活跃账户可以用 passkey，**42%** 的合格账户已注册，**36%** 的成功登录使用 passkey（一年前是 26%）；passkey 登录成功率 **93%**，传统密码/MFA 是 78%，速度快 2.8 倍，每次登录节省约 27 秒；8 家测量钓鱼的参与方全部报告钓鱼攻击减少；13 家中有 9 家计划在未来 12 个月推出无密码账户。[FIDO Alliance](https://fidoalliance.org/7-billion-passkeys-and-counting-the-next-chapter-of-passwordless-authentication/)、[Passkey Index 2026](https://guptadeepak.com/ciam-compass/changelog/fido-passkey-index-2026/)

这些数字说明 passkey 的“可用性”已经不是瓶颈，真正的瓶颈是路由和习惯：90% 的账户可用，但只有 42% 注册、36% 的登录实际使用。对钱包来说，这意味着“再做一个 passkey 工具”很难赢；赢家会是那些把 passkey 做成默认路径、并且把恢复做顺的产品。

Passkey-only 钱包有七个结构性失败模式，做战略规划时不能忽略：跨平台锁定（iCloud 的 passkey 不同步到 Android，Google 的 passkey 不同步到 iOS；FIDO 的 CXP/CXF 到 2026 年 2 月仍是草案）；曲线不匹配（passkey 用 P-256，以太坊/比特币用 secp256k1，Solana 用 Ed25519；以太坊 L1 没有 RIP-7212 时，P-256 验证要 33 万至 40 万 gas，约 25 美元一笔）；域名绑定（`keys.coinbase.com` 创建的 passkey 只能在同域名使用）；恢复委托给 Apple/Google（云账号被攻破，passkey 就被攻破）；无法做 AI agent 或服务端定时签名；以及“恢复悖论”——号称无种子短语的钱包，最终仍需要一个非 passkey 的恢复后备，比如 Coinbase Smart Wallet 的 recovery phrase。[Para](https://blog.getpara.com/passkey-wallets/)、[Coinbase Help](https://help.coinbase.com/wallet/getting-started/smart-wallet-recovery)

Trust Wallet SWIFT 正好落在“passkey 作为签名根 + 云账号恢复”这一档。它的体验很好，但恢复路径把最终控制权交给了 iCloud/Google；如果用户的云账号被钓鱼或丢失，钱包的恢复就要依赖 Apple/Google 的客服流程。这不是说 SWIFT 不安全，而是说“备份防护”的真正难点是恢复，不是登录。

正确的架构是“passkey 作为认证层 + MPC/TEE/AA 智能账户作为签名层 + guardians/社交恢复作为恢复层”。Passkey 证明“你是你”，但不应该独自承担“资产归谁”。对 Trust Wallet 来说，这意味着 SWIFT 应该成为默认入口，但必须用多路径恢复（备用设备、恢复码、guardian、硬件密钥）替代单一的云账号依赖。

## YubiKey 与“每个人的 Passkey 工具”

YubiKey 不是钱包的替代品，而是高价值账户的硬件根；passkey 会普及，但“每个人都需要一个 passkey 工具”只在“抗钓鱼凭证”这个层面成立。Yubico 2026 年 Q3 净销售 **SEK 708.0M（+29.3%）**，有机增长 28.3%，订阅收入 **SEK 112.6M（+29.9%）**，ARR **SEK 436.9M（+13.1%）**，EBIT **SEK 179.3M（利润率 25.3%）**，订单 **SEK 949.0M（+88.2%）**；公司还把 2027–2031 年的长期目标定为年均 15–20% 增长、EBIT 利润率向 20% 靠拢。订单增速远高于收入增速，说明硬件密钥和 passkey 的需求在加速，而不是见顶。[Yubico Q3 2026](https://investors.yubico.com/en/interim-report-july-september-2026/)

Yubico 的调研里，**31%** 的受访者认为硬件 passkey 是“黄金标准”，27% 选同步 passkey，23% 选手机上的设备绑定 passkey。这个分布说明市场并不认为“一个 passkey 解决所有问题”：高 assurance 场景仍然需要硬件根。[Yubico](https://www.yubico.com/resource/global-state-of-authentication-2026/)

YubiKey 的价值在于：私钥不出硬件、不需要云同步、抗钓鱼；适合保护交易所账户、邮箱、云备份、托管管理员权限。Yubico 自己也把加密货币交易所列为重点场景，提供 YubiKey 做账户 MFA、YubiHSM 做机构密钥托管。但它没有屏幕、没有链解析能力，不能安全地签任意链上交易——所以它替代不了硬件钱包，也替代不了钱包里的交易策略引擎。[Yubico 加密货币场景](https://www.yubico.com/industries/cryptocurrency/)

“每个人都需要一个 passkey 工具”这句话，更准确的说法是：每个人都需要至少一个抗钓鱼凭证，但“工具”会分层。

| 方案 | 抗钓鱼 | 抗设备失陷 | 恢复能力 | 跨平台 | 适用场景 |
|---|---|---|---|---|---|
| 平台 passkey（iCloud/Google，同步） | 强 | 中：云账号是单点 | 依赖云账号 | 弱，生态锁定 | 大众账户、交易所登录 |
| 设备绑定 passkey | 强 | 强 | 弱，设备丢失即失联 | 弱 | 高价值账户的第二因素 |
| YubiKey | 强 | 强，密钥不出硬件 | 中，需要备用钥匙 | 强，USB/NFC | 交易所、邮箱、云备份、托管管理员 |
| 硬件钱包 | 强，离线 | 强 | 中，助记词/多签 | 强 | 长期冷存储 |
| 钱包 MPC/AA | 强，策略可编程 | 强，分片/智能账户 | 强，guardians | 强 | 移动端自托管 |

这张表是定性比较，不是精确评分；核心结论是：没有一种方案同时赢下“抗钓鱼、抗设备失陷、可恢复、跨平台”。所以“每个人一个 passkey”不是终点，而是起点。

真正的市场空白不是再做一个 passkey 管理器，而是**跨生态的恢复与迁移层**。FIDO 的 CXP/CXF 到 2026 年 2 月仍是工作草案，Apple/Google 的 passkey 不能互相迁移；谁先把“换手机、换生态、丢云账号”的恢复体验做好，谁就有产品机会。对加密钱包来说，这个“工具”应该是钱包原生的安全中心：passkey 注册、硬件密钥绑定、恢复演练、助记词泄露扫描、会话与策略管理——而不是一个独立的安全 App。

对用户来说，需求可以分三层：大众用户需要一个平台 passkey + 一个可靠的恢复方式（备用设备或恢复码）；高价值用户需要两个独立根（设备绑定 passkey/YubiKey + 硬件钱包/MPC）+ 多签/guardians + 定期演练；钱包厂商需要把 passkey 当认证层、把恢复当产品，而不是把 passkey 当唯一签名根。

## 结论：再平衡，而非转向

Trust Wallet 应该把安全预算分成三层，而不是在“签名”和“备份”之间做二选一：

1. **基线签名防护**：保持 parity，接入 clear signing、交易模拟、地址投毒、授权管理等行业标准与第三方风控。这是底线，不能减配，但也不必继续重投入自研。
2. **备份/恢复架构**：增量预算的重点。把 passkey/MPC/AA 做成默认入口，扩大 SWIFT 的链覆盖或引入链无关的 MPC；为老用户硬化助记词钱包（禁止明文、截屏/相册/笔记泄露检测、一键迁移/轮换、恢复演练）；为高价值用户提供硬件密钥绑定。
3. **供应链与运行时完整性**：PostHog 事件之后必须补的课。扩展/App 构建签名、依赖锁定、运行时 attestation、第三方 SDK 审计，这些和“签名/备份”同样重要。

对 Trust Wallet 的具体建议是：新用户默认 passkey/AA，不要把 SWIFT 做成六条链的侧舱；老用户 seed 钱包做“可迁移、可轮换、可检测泄露”；高价值账户支持 YubiKey/硬件密钥；签名侧接入标准与伙伴，保持 parity；把 seed exposure rate、recovery success rate、time-to-recover、passkey enrollment/activation、事件后 30 天留存作为安全 KPI，而不是只看“拦截了多少恶意交易”。

**底线判断：移动端钱包的护城河，不是“我能拦截多少签名”，而是“用户的手机被攻破后，他的资产是否还能恢复”。Trust Wallet 应该把增量安全预算投向备份与恢复，用 passkey 做默认入口、用硬件根守住高价值账户；但签名防护不能减配，它是底线，不是卖点。**
