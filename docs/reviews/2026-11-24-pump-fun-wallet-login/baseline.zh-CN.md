# pump.fun 弃用 Phantom 登录 — 账号收编与私钥迁移的真实动机

## TL;DR

pump.fun 并没有升级登录安全，它实际上是把 web 端并入了 Pump App 已经跑通的 Privy 嵌入钱包体系：账号从“一个钱包地址”变成“一个邮箱或社交身份”，签名权从 Phantom 转到平台侧。要保留原地址、又要让 Privy 能代签，交出私钥就成了唯一路径。签名只能证明你是地址主人，无法把长期签名权委托给平台。真正的驱动力是 perps、多链和法币入金所需的可编程签名，是下滑的费用收入，也是把身份与合规开关握在自己手里；代价则是托管集中、与自家条款冲突，以及 Ledger、多签用户被排除在外。

---

## 官方口径

pump.fun 在 11 月 22 日的公告中称，11 月 30 日 15:00 UTC 起，web 端将停用 Phantom、Solflare、Ledger 等外部钱包登录，改用邮箱、Google、Apple 或 GitHub；理由是“Pump App 已经是这套登录，现在一次登录覆盖两端”，并强调地址、持仓、关注者和用户名不变，“只关乎登录方式”。[pump.fun](https://pump.fun/docs/wallet-login-changes)

这套说法解释了“为什么统一”，却没有解释“为什么必须交私钥”。而这正是争议的核心：公告给出的三条路径里，保留原账号的推荐路径要求用户把私钥粘贴进网页。[The Block](https://www.theblock.co/news/ecosystems/2026-11-23-pump-fun-draws-criticism-over-private-key-imports-as-it-retires-external-wallet-sign-in-on-web-444926)

这不是 Phantom 一侧的技术故障。Phantom 的帮助中心甚至在教用户如何把 Privy（Fomo、pump.fun）钱包导出到 Phantom。[Phantom](https://help.phantom.com/articles/import-your-privy-fomo-pump-fun-wallet-into-phantom-41408635409683) 发生变化的是 pump.fun 的账号模型，钱包的可用性并没有改变。

## 技术真相

严格说，旧版没有“Phantom 账号”。地址就是账号，私钥就是登录凭证；pump.fun 只有钱包连接，没有独立的用户数据库。新版反过来：账号是邮箱或社交身份，钱包是挂在账号下的 Privy 嵌入钱包。旧版是“连接钱包”，新版是“平台给你开钱包”。这是一次账号本体的迁移，并非只是登录方式的优化。

问题在于地址由私钥定义。要让 Privy 代替 Phantom 为同一个地址签名，Privy 必须拿到该地址的私钥。在 Phantom 这类钱包的现有权限模型里，用 Sign in with Solana 签一条消息只能证明“我控制这个地址”，不能把长期签名权委托给 dapp；下一次交易仍然要打开 Phantom 弹窗。钱包标准里也没有“把私钥交给 dapp”的接口，所以只能让用户手动复制粘贴。于是只剩两条路：交出私钥，保留地址与历史；或者开新钱包、转资产，放弃旧地址的历史。

Privy 的导入流程本身设计得不差：浏览器用 Privy 下发的临时公钥做 HPKE 加密，密文送到 TEE 内解密，私钥用于初始化钱包，临时密钥对随即销毁。[Privy](https://docs.privy.io/wallets/wallets/import-a-wallet/architecture) 但“端到端加密”的另一端是 Privy 的 TEE，并非用户，这就是 Karpelès 说“misleading at best”的原因。[Karpelès](https://x.com/MagicalTux/status/2124714439429783902)

“托管”这个词也需要补充说明：法律上 Privy 负责、pump.fun 声称不控制；技术上私钥在 Privy 的 TEE，签名由登录会话授权；用户侧可以导出私钥。[pump.fun 条款](https://pump.fun/docs/terms-and-conditions) 更准确的说法是“供应商托管、用户可导出”：它既不是交易所式托管，也不是纯自托管。

| 迁移路径 | 地址与历史 | 谁掌握签名 | 适合谁 | 主要代价 |
|---|---|---|---|---|
| 网页 `Link email & socials` 导入私钥（官方推荐） | 保留 | Privy TEE；访问由 pump.fun 登录门禁控制 | 软件热钱包、可导出私钥 | 私钥进入第三方；需信任 TEE 与登录安全 |
| 在 Pump App 内导入后再绑定 | 保留 | 同上 | 手机用户 | 同上，操作在 App 内完成 |
| 新邮箱或社交账号 + 新钱包，手动转账 | 不保留，历史留在旧地址 | 新 Privy 钱包 | Ledger、多签、不可导出钱包 | 失去地址、关注者、交易历史；需手动搬资产 |

## 商业动机

pump.fun 已经不是单纯的发币台。10 月它被曝在准备 Hyperliquid 永续，11 月 10 日上线跨保证金，11 月 19 日补上部分强平，并增加了限价单和 TWAP。[Bloomingbit](https://en.bloomingbit.io/feed/news/121933) [Phemex](https://phemex.com/news/article/pumpfun-adds-cross-margin-to-hyperliquidpowered-perpetual-futures-103064) 这些功能要求平台在用户不点钱包的情况下挂单、撤单、滚仓；每笔订单弹一次 Phantom，perps 和 Pro mode 根本跑不起来。限价单和 TWAP 尤其如此：用户离线时也要能触发。

多链是同一逻辑。Pump App 已扩到 Monad、Sui 等新链，[PANews](https://www.panewslab.com/en/articles/01a170b0-dad1-74df-a9b3-7dbf2c1f3ce1) [CoinNess](https://coinness.com/en/news/1176655) 而 Phantom 在 8 月 12 日终止了 Monad 支持。[ChainCatcher](https://www.chaincatcher.com/en/article/2278081) 钱包厂商的链支持是外生变量，嵌入钱包的单一密钥可以自己派生各链地址。再加上 Apple Pay 入金——用户不能先被要求装 Phantom——平台必须在注册瞬间造出一个钱包。[CoinNess](https://coinness.com/en/news/1145199)

这也是为什么“只加一个邮箱登录”不够：邮箱解决身份，嵌入钱包解决签名、gas 和多链。

<chart item_id="pump_fees_7d"></chart>

商业压力让这件事更急。PUMP 现价 **$0.00253**、市值 **$8.93 亿**、30 天 **-41.3%**（2026-11-24 00:40 UTC 快照）；协议费用 7 日均值从 10 月 7 日的 **$244 万/天** 降到 11 月 22 日的 **$129 万/天**，跌幅 **47%**，单日费用已从 10 月 1 日的 **$240 万** 降到 11 月 22 日的 **$94 万**。4 月起 PUMP 用 50% 收入做回购销毁，[The Block](https://www.theblock.co/post/399288/pump-fun-burns-370-million-pump) 费用下滑会压缩回购资金来源。此时平台的自然动作，是从“拉新钱包”转向“留住能反复交易的账号”：邮箱账号可触达、可召回、可分层运营，钱包地址给不了这些。

## 控制权动机

pump.fun 的产品组合已经进入需要按辖区开关的领域。条款把 Perpetuals 列为 Restricted Feature，禁止美国、安大略、受制裁地区及 Hyperliquid 定义的 Restricted Person；Prediction Markets 不对美国用户开放；跨链桥对代币化证券设了美国、英国、欧盟、瑞士、加拿大的限制；条款还写明会用筛查工具标记钱包。[pump.fun 条款](https://pump.fun/docs/terms-and-conditions) 9 月 App 曾在美国和印度 App Store 下架。[CoinNess](https://coinness.com/en/news/1168382)

钱包地址是免费的，封一个换一个；邮箱、Apple、Google 身份则是可追踪、可封禁、可恢复的。更重要的是，只有在账号层才能做地理围栏、制裁筛查、资格判断和条款执行。pump.fun 没有把合规列为理由，但从产品结构和条款文本看，这是这套架构的必然副产品，也很可能是长期主因。

另一层是渠道控制。Phantom 自己在做 perps，也有自己的 in-app 浏览器，[Phemex](https://phemex.com/news/article/phantom-wallet-introduces-20x-leverage-etf-perpetual-contracts-for-south-korea-and-japan-64368) 钱包正在变成竞争性的超级应用；登录入口留在 Phantom 手里，pump.fun 就把分发和订单流租给了潜在对手。把钱包变成账号的一个字段，平台才掌握默认资产轨道、费用路由和奖励发放。Privy 于 2025 年 6 月被 Stripe 收购，客户包括 Hyperliquid、OpenSea、Farcaster，[Yahoo Finance](https://finance.yahoo.com/news/stripe-acquire-startup-privy-1-151600147.html) 这说明它已经是消费级金融基础设施的一部分，而不再只是一个中立的钱包插件。

## 代价

Karpelès 的技术批评值得认真对待：解密发生在 Privy 的 TEE，密钥由平台侧持有并代签；加密公钥由 pump.fun 后端转发，浏览器无法验证它真是 Privy 的；私钥输入框是普通 textarea，页面上的任何脚本理论上都能读；访问权从“谁持有私钥”变成“谁能登录 Privy + 谁能登录邮箱或 Google”，封号、司法命令、TEE 被攻破都成为单点风险；删号也不会把密钥从 Privy 拿走。[Karpelès](https://x.com/MagicalTux/status/2124714439429783902) 他还指出，SIWS 签名迁移可以保留自托管，只是平台拿不到代签权——这并非“没有替代方案”，关键在于“替代方案不满足平台目标”。

更尴尬的是，pump.fun 自己的条款第 12.2 条第 c 款说“任何情况下我们都不会要求你分享钱包私钥、助记词或社交/邮箱凭证”，第 30.1 条又说“Pump 实体对你的钱包及私钥没有控制权”——而迁移流程恰恰要求粘贴私钥。[pump.fun 条款](https://pump.fun/docs/terms-and-conditions) 条款把钱包责任推给 Privy 和用户，但用户的实际访问权又卡在 pump.fun 的登录上。这种“责任外包、控制权内收”的结构，是这套方案最需要被审计的地方。

对用户而言，最实际的风险在托管形态变了：从“钥匙只在我手里”变成“供应商托管、用户可导出”，而“Privy 一定会作恶”并不是最需要担心的事。可导出不等于已经导出；多数人不会去点那个按钮。而 Ledger、多签用户连选择的资格都没有，只能开新号。公告到截止只有 8 天，这更像强制迁移，而不是可选升级，用户没有足够时间评估托管风险。

## 结论

pump.fun 做的是账号本体的迁移，并非登录方式的优化。官方的“一次登录覆盖两端”只解释了表象；真正的逻辑是：pump.fun 要把一个匿名、可抛弃的钱包地址，升级成可运营、可合规、可代签的账号体系，为 perps、多链和法币入金铺路。私钥迁移是这个目标的必要代价，也是它最脆弱的一环。

**底线判断：** 对平台，这是从 dapp 转向消费级交易应用的必经之路，但成败取决于它能否把“托管”做成可验证的安全承诺，而不是一句 E2EE；对用户，若必须迁移，迁完立刻导出私钥并只留交易资金，大额资产继续放 Phantom 或硬件钱包；Ledger 和多签用户则应直接走新账号路线。