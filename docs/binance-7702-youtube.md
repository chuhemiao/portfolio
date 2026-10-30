# YouTube 发布资料：币安热钱包与EIP-7702

视频：`docs/binance-7702-video.1.2x.mp4`，中文音轨、4分01.67秒。

封面：`docs/binance-7702-media/youtube/thumbnail.jpg`，1280×720、JPG、337,051字节。使用内置imagegen生成，参考已有LibTV金库素材；原图和完整提示词分别保存在同目录`thumbnail-master.png`、`thumbnail.prompt.txt`。封面没有AI提示，主文案为“一条签名 / 56亿外流？”，精确金额与口径放在标题、简介。

## 中文主标题

币安热钱包疑云：一条签名，56.43亿美元外流？｜EIP-7702复盘

备选标题：

- 一条签名，为什么可能清空整个钱包？EIP-7702机制复盘
- 50条授权、3分24秒：币安热钱包外流的链上复盘

## 可直接粘贴的中文简介

```text
一条授权签名，为什么可能改变整个钱包的执行权限？

本期围绕币安热钱包外流的链上分析，拆解 EIP-7702：近18小时的准备、50条降序 nonce 授权、授权与清空之间的3分24秒，以及以太坊单笔清空交易约0.91美元的手续费。最后讨论发行方冻结与原生资产的区别，以及后续应核对的三个信号。

章节
00:00 一条签名与56.43亿美元外流口径
00:24 近18小时的准备与演练
01:05 EIP-7702到底授权了什么
01:49 被错过的3分24秒
02:24 50条授权与nonce降序排列
02:57 约0.91美元的清空手续费
03:20 能冻结的资产与约46%的比例
03:45 后续核对的三个信号

口径说明
本视频按截至2026年10月30日00:30 UTC的材料复盘，非实时进展。56.43亿美元是独立链上核算的外流口径，不等于已确认的净损失；约25亿美元指以太坊上单笔清空的规模，二者不能混用。所讨论的50条授权chain_id均为1，仅适用于以太坊主网，不能据此解释其他链的资产外流。根因在该材料截点未经官方确认，后续披露可能改变判断。

延伸阅读
事件与托管风险：https://kkdemian.com/zh-CN/blog/binance-suspected-hack-outflows-custody-risk
攻击链复盘：https://kkdemian.com/zh-CN/blog/eip-7702-delegation-one-signature-drains-everything
签名流程：https://kkdemian.com/zh-CN/blog/eip-7702-signing-flow-from-hash-to-code
披露口径：https://kkdemian.com/zh-CN/blog/binance-has-not-disclosed-signing-logs

作者网站：https://kkdemian.com
#币安 #EIP7702 #链上安全
```

## 标签

```text
币安,Binance,EIP-7702,EIP7702,热钱包,钱包安全,链上分析,授权签名,nonce,以太坊,Ethereum,Web3安全,加密货币科普,链上安全
```

## 置顶评论备稿

本期复盘的材料截点为2026年10月30日00:30 UTC。外流额不等于已确认的净损失，根因在该截点未经官方确认。你更关注签名可读性、委托告警，还是托管流程？欢迎附上可核验的后续披露来源。

## 英文与日文元数据

供YouTube本地化标题/说明使用，中文仍是视频实际音频语言；没有伪称存在英文或日文配音。

### English title

Binance Hot Wallet Questions: One Signature, $5.643B in Outflows? | EIP-7702

### English description

```text
Mandarin narration.

How can one authorization signature change what an entire wallet can execute?

This video examines on-chain analysis concerning Binance hot-wallet outflows: nearly 18 hours of preparation, 50 authorizations ordered by descending nonce, the 3-minute-24-second gap between authorization and the sweep, and an approximately $0.91 fee for the single Ethereum sweep transaction. It also covers issuer freezes, native assets, and three follow-up signals.

Chapters
00:00 One signature and the $5.643B outflow figure
00:24 Nearly 18 hours of preparation
01:05 What EIP-7702 actually authorizes
01:49 The missed 3 minutes and 24 seconds
02:24 50 authorizations and descending nonces
02:57 The approximately $0.91 sweep fee
03:20 Freezable assets and the approximately 46% share
03:45 Three follow-up signals

Scope
This is a review of material as of October 30, 2026, 00:30 UTC, not a live update. The $5.643 billion figure is an independent on-chain outflow estimate, not confirmed net loss. Approximately $2.5 billion refers to the single Ethereum sweep; the two scopes must not be conflated. All 50 authorizations discussed have chain_id=1 and apply only to Ethereum mainnet; they do not explain outflows on other chains. The root cause had not been officially confirmed at that cutoff. Later disclosures may change the assessment.

Further reading
https://kkdemian.com/zh-CN/blog/binance-suspected-hack-outflows-custody-risk
https://kkdemian.com/zh-CN/blog/eip-7702-delegation-one-signature-drains-everything
https://kkdemian.com/zh-CN/blog/eip-7702-signing-flow-from-hash-to-code
https://kkdemian.com/zh-CN/blog/binance-has-not-disclosed-signing-logs

Author: https://kkdemian.com
#Binance #EIP7702 #WalletSecurity
```

### 日本語タイトル

Binanceホットウォレットの疑問：1つの署名で56.43億ドル流出？｜EIP-7702解説

### 日本語の説明

```text
音声は中国語です。

1つの認可署名が、ウォレット全体の実行権限をどう変えるのでしょうか。

Binanceのホットウォレットからの資産流出に関するオンチェーン分析をもとに、約18時間の準備、nonceの降順で並べられた50件の認可、認可から資産移動までの3分24秒、イーサリアム上の単一取引で約0.91ドルだった手数料を解説します。発行体による凍結とネイティブ資産の違い、今後確認すべき3つのシグナルも扱います。

チャプター
00:00 1つの署名と56.43億ドルの流出という集計
00:24 約18時間の準備とリハーサル
01:05 EIP-7702は何を認可するのか
01:49 見逃された3分24秒
02:24 50件の認可とnonceの降順
02:57 約0.91ドルの資産移動手数料
03:20 凍結可能な資産と約46％の割合
03:45 今後確認すべき3つのシグナル

集計範囲と確認状況
本動画は2026年10月30日00:30 UTC時点の資料の振り返りであり、リアルタイムの進展を伝えるものではありません。56.43億ドルは独立したオンチェーン集計による流出額で、確認済みの純損失額ではありません。約25億ドルはイーサリアム上の単一の資産移動取引の規模を指し、両者を混同することはできません。取り上げる50件の認可のchain_idはすべて1で、イーサリアム・メインネットだけに適用されます。他のチェーンからの流出をこの認可で説明することはできません。資料の対象時点では根本原因は公式に確認されておらず、後の開示によって評価が変わる可能性があります。

関連記事
https://kkdemian.com/zh-CN/blog/binance-suspected-hack-outflows-custody-risk
https://kkdemian.com/zh-CN/blog/eip-7702-delegation-one-signature-drains-everything
https://kkdemian.com/zh-CN/blog/eip-7702-signing-flow-from-hash-to-code
https://kkdemian.com/zh-CN/blog/binance-has-not-disclosed-signing-logs

著者サイト：https://kkdemian.com
#Binance #EIP7702 #ウォレットセキュリティ
```

## 核对与上传说明

- 标题保留疑问与链上复盘语境，三语金额均为美元。英文为$5.643B、日文为56.43億ドル；以太坊单笔约25亿美元对应$2.5B/25億ドル。
- 三语均保留2026-10-30 00:30 UTC截点、非净损失、仅chain_id=1/以太坊主网及根因未获官方确认的限定。冻结比例沿用用户确认的约46%。
- 章节按1.2倍成片取整到场景开始后首个整秒：0:00、0:24、1:05、1:49、2:24、2:57、3:20、3:45；不是原290秒版的章节。
- 四条站内延伸阅读URL已只读检查，均返回HTTP200；本轮未刷新或独立核验事件事实。
- JPG为16:9且小于2MB，符合电脑和手机的相应上传大小范围。YouTube当前帮助页建议尽可能大图，电脑上限50MB、手机视频缩略图2MB：https://support.google.com/youtube/answer/72431?hl=en
- 章节从00:00开始，8个递增时刻，所有章节大于10秒；规则来源：https://support.google.com/youtube/answer/9884579?hl=en
- 每种语言的标题、说明、标签另存同素材目录的`upload.zh-CN.txt`、`upload.en.txt`、`upload.ja.txt`及JSON。置顶评论仅为备稿，是否发布以本次实际操作记录为准。

## 当前上传对象

- 频道：kk德米安（UCPcJwyUsglXbZggwdxLk4Qw）
- 视频ID：EYf4lQBcC1w
- 链接：https://youtu.be/EYf4lQBcC1w
- 浏览器读取状态：已上传`binance-7702-video.1.2x.mp4`，4:02，版权与社区检查未发现问题，保存为私享视频。
- 用户已明确授权填写标题、说明、图片并发布；发布状态以随后实际UI核对为准，准备文案不等于已经发布。

最终操作范围：用户改为手动复制文案并发布；本轮没有完成标题/简介/封面写入，也没有点击公开发布。Chrome原生输入焦点不可靠且坐标控制报noWindowsAvailable、扩展连接超时，草稿应由用户复制覆盖标题与说明后核对。
