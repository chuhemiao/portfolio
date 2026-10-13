'use client';

import { useI18n } from '@/components/locale-provider';
import type { Locale } from '@/lib/i18n';

const copy: Record<string, [string, string, string]> = Object.create(null);
const rows = `
Spot presence; listing date unavailable	现货状态；上市日期不可用	現物の有無・上場日不明
(presence only) · Coinbase	（仅上市状态）· Coinbase	（上場の有無のみ）・Coinbase
Coverage notes: figures may be incomplete.	数据覆盖说明：部分数据可能不完整。	対象範囲の注意事項：数値に不足がある場合があります。
Bitget does not provide verified listing dates in this inventory; presence is tracked without assigning new listing dates.	Bitget 当前清单未提供可验证的上市日期，仅记录上市状态，不推定新上市时间。	Bitget のこの一覧には検証済みの上場日がないため、上場の有無のみを記録し、新規上場日は推定しません。
Coinbase coverage is limited to the first 500 public products.	Coinbase 数据仅覆盖公开接口返回的前 500 个产品。	Coinbase の対象範囲は公開 API の先頭500商品に限られます。
This single-cycle asset is {percent} above its available-history low, which still looks like a healthy rebound zone. Strength here depends more on narrative durability and liquidity staying alive this cycle.	该单周期资产高于可用历史低点 {percent}，仍处于反弹区间；强弱取决于本轮叙事持续性与流动性。	この単一サイクル資産は取得済み履歴の底値を {percent} 上回り、反発の範囲にあります。強さは今サイクルのテーマの持続性と流動性に左右されます。
This single-cycle asset is only {percent} above its available-history low and still sits too close to structural weakness. There is no right-side confirmation yet.	该单周期资产仅高于可用历史低点 {percent}，仍接近结构弱势，尚未确认趋势修复。	この単一サイクル資産は取得済み履歴の底値を {percent} 上回るにとどまり、構造的な弱さに近い状態です。トレンドの回復はまだ確認されていません。
This research name is {percent} above its available-history low. Without a prior-cycle peak anchor, treat it as relatively strong, but still provisional.	该研究资产高于可用历史低点 {percent}；缺少上轮高点基准，相对强势判断仍需验证。	この調査対象は取得済み履歴の底値を {percent} 上回ります。前サイクルのピーク基準がないため、相対的な強さの判断は暫定的です。
It is {percent} above its available-history low, but the historical anchor is still weak. More cycle evidence is needed.	高于可用历史低点 {percent}，但历史基准仍不充分，需要更多周期证据。	取得済み履歴の底値を {percent} 上回りますが、履歴の基準はまだ弱く、より多くのサイクルの証拠が必要です。
It is too close to the available-history low ({percent}) and still lacks a reliable prior-cycle reference point. The risk/reward setup looks poor.	距可用历史低点仅 {percent}，缺少可靠上轮周期参考，当前风险收益结构较弱。	取得済み履歴の底値との差は {percent} にとどまり、信頼できる前サイクルの参考点も不足しています。現在のリスクとリターンの条件は弱い状態です。
The drawdown of {percent} versus the prior cycle top is still manageable, and the ratio remains {percent} above the available-history low. That is the profile of a healthy relative-strength name.	相对上轮高点回撤 {percent}，比率仍高于可用历史低点 {percent}，相对强弱结构较为稳健。	前サイクルのピーク比で {percent} の下落ですが、比率は取得済み履歴の底値を {percent} 上回り、相対的な強さの構造は比較的安定しています。
The ratio is down {percent} from the prior cycle top. Structure is not broken yet, but it is still too close to the available-history low for clean confirmation.	相对上轮高点变动 {percent}。结构尚未破坏，但仍接近可用历史低点，确认不足。	前サイクルのピーク比の変動は {percent} です。構造はまだ破綻していませんが、取得済み履歴の底値に近く、明確な確認はできません。
The ALT/BTC ratio is {percent} above the previous cycle peak. This asset has already proven it can outperform BTC across cycles.	ALT/BTC 高于上轮周期高点 {percent}，已表现出跨周期相对 BTC 的强势。	ALT/BTC は前サイクルのピークを {percent} 上回り、サイクルをまたいで BTC に対する強さを示しています。
Data unavailable	数据暂不可用	データを取得できません
Live API unavailable — showing the synchronized snapshot.	实时接口暂不可用，当前展示已同步快照。	ライブ API を利用できないため、同期済みスナップショットを表示しています。
BTC Heat requests the Worker API when the tab opens and uses the synchronized Day1Global snapshot if unavailable. Check the source timestamp before using the figures.	BTC 市场热度在打开页签时请求 Worker API；接口不可用时展示已同步的 Day1Global 快照。请先确认来源时间再使用数据。	BTC 過熱度はタブを開いた際に Worker API を参照し、利用できない場合は同期済みの Day1Global スナップショットを表示します。数値を使う前にソース時刻を確認してください。
Market Snapshot	市场快照	市場スナップショット
Updated by an explicit snapshot refresh. Market moves after the source timestamps are not reflected yet.	通过快照同步更新，尚未反映来源时间之后的行情变化。	スナップショットの同期で更新します。ソース時刻以降の市場変動はまだ反映されていません。
Available history:	历史覆盖：	履歴の取得状況：
focus assets. Missing history remains unavailable.	个重点资产。缺失历史数据保留为空。	重点資産。未取得の履歴は欠損のまま表示します。
2Y Close Peak	2 年收盘高点	2年間の終値ピーク
Above Available Low	距可用历史低点	取得済み履歴の底値からの上昇
Current ratio source:	当前比率来源：	現在比率のソース：
USD-derived ALT/BTC	由美元价格推导 ALT/BTC	USD 価格から算出した ALT/BTC
Daily-close history:	日收盘历史：	日足終値の履歴：
binance	Binance	Binance
coingecko	CoinGecko	CoinGecko
none	未获取	未取得
Unknown	未知	不明
Also includes the current Binance Alpha inventory. Unknown listing dates are shown as unknown, not as new listings.	同时展示当前 Binance Alpha 项目；无法确认的上市日期显示为未知，不计作新上市。	現在の Binance Alpha 銘柄も表示します。確認できない上場日は不明とし、新規上場として扱いません。
The focus set updates when a new snapshot is synchronized. Short-term price moves between refreshes will not be reflected immediately.	重点集在新快照同步后更新，刷新间的短期价格变动不会立即反映。	重点観察対象は新しいスナップショットの同期で更新します。更新間の短期的な価格変動は即座には反映されません。
Dual means the token is ranked in the top 300 on both CoinGecko and CoinMarketCap simultaneously.	双榜标签表示同时进入 CoinGecko 与 CoinMarketCap 前 300 名。	両ランキングのラベルは、CoinGecko と CoinMarketCap の両方で上位300に入ることを示します。
Local market snapshot. Prices and ranks reflect the source timestamps; missing history remains unavailable.	本地市场快照。价格和排名以来源时间为准；缺失历史数据保留为空。	ローカル市場スナップショットです。価格と順位はソース時刻を基準とし、未取得の履歴は欠損のまま表示します。
Data Sources: synchronized local snapshot from CoinGecko and CoinMarketCap rankings, Binance spot BTC pairs and BTC pricing. USD-derived ALT/BTC divides the current asset USD price by BTC USD price. BTC Market Heat uses the Day1Global API when available.	数据来源：CoinGecko、CoinMarketCap 排名，以及 Binance 现货 BTC 交易对与 BTC 价格的同步本地快照。美元推导的 ALT/BTC 为资产美元价格除以 BTC 美元价格。BTC 市场热度在可用时读取 Day1Global API。	データソース：CoinGecko と CoinMarketCap の順位、Binance の現物 BTC ペアと BTC 価格を同期したローカルスナップショット。USD 算出の ALT/BTC は資産の USD 価格を BTC の USD 価格で割った値です。BTC 過熱度は利用可能な場合に Day1Global API を参照します。
Historical anchors use available closed daily candles in a window of up to five years, not intraday lows. Recently listed assets may have shorter histories. The 2Y close peak requires a complete two-year window; missing history is left unavailable. Prior-cycle reference peaks come from the configured research anchors.	历史基准取最长 5 年窗口内可获取的日收盘价，不代表日内最低价；新上市资产的历史可能更短。2 年收盘高点要求完整两年窗口，缺失历史数据保留为空。上轮参考高点来自既有研究配置。	履歴の基準は最大5年間の範囲で取得できた確定済み日足終値であり、日中の安値ではありません。新規上場の資産は履歴が短い場合があります。2年間の終値ピークには完全な2年間の範囲が必要です。未取得の履歴は欠損のままとし、前サイクルの参考ピークは既存の調査設定を使用します。
Source timestamps (UTC):	来源时间（UTC）：	ソース時刻（UTC）：
Green	绿色	緑
Yellow	黄色	黄
Red	红色	赤
No chart data	暂无图表数据	チャートデータがありません
What to watch	观察指标	注目する指標
How to read it	解读方法	読み方
fear	市场情绪	市場心理
DYOR, this dashboard is meant to be a comprehensive data reference for Bitcoin market conditions, not a trading signal generator. Always cross-check with your own research and risk management.	请独立研究。本看板提供比特币市场状况的综合数据参考，请结合自己的研究与风险管理进行核对。	独自に調査してください。このダッシュボードはビットコイン市場の総合的なデータ参考資料です。独自の調査とリスク管理と照合してください。
Use the playbook below to observe regime shifts, leverage resets, liquidity migration, market rotation, and macro spillovers across crypto.	使用下方观察框架，跟踪加密市场状态变化、杠杆重置、流动性迁移、板块轮动和宏观影响。	以下の観察フレームワークで、市場局面の変化、レバレッジの解消、流動性の移動、セクター循環、マクロ環境の影響を追跡します。
Last refresh:	最近刷新：	最終更新：
Composite Bottom Model	综合底部模型	総合底値モデル
Combine all indicators into a single bottom probability score.	将各项指标合成为底部概率评分。	各指標を統合し、底値の可能性をスコア化します。
Bottom Score	底部评分	底値スコア
Current band:	当前区间：	現在の区分：
Score range	评分区间	スコア区分
Bottom Alert Engine	底部预警引擎	底値アラート
Trigger alert when at least five conditions are met.	至少满足五项条件时触发预警。	5つ以上の条件が成立するとアラートを出します。
Active conditions:	已满足条件：	成立した条件：
Traffic light system: Green = strong accumulation zone, Yellow = neutral, Red = risk zone.	信号灯：绿色为强积累区，黄色为中性，红色为风险区。	信号色：緑は強い蓄積局面、黄は中立、赤はリスク局面です。
Layer 1: Market Price and Core Valuation	第一层：市场价格与核心估值	第1層：市場価格と基本評価
Display key valuation metrics for Bitcoin.	展示比特币核心估值指标。	ビットコインの主要な評価指標を表示します。
Bitcoin Price (real-time)	比特币价格（实时）	ビットコイン価格（リアルタイム）
Market Cap	市值	時価総額
Realized Cap	已实现市值	実現時価総額
Realized Price	已实现价格	実現価格
MVRV Ratio	MVRV 比率	MVRV 比率
MVRV Z-Score	MVRV Z 分数	MVRV Z スコア
Optional Glassnode fallback	可选 Glassnode 备用来源	任意の Glassnode 代替ソース
200 Week MA	200 周均线	200週移動平均
Bottom Zone Rules	底部区间规则	底値ゾーンのルール
Historical bottom highlighting enabled	已启用历史底部高亮	過去の底値の強調表示を有効化
Price vs Realized Price	价格与已实现价格	価格と実現価格
Price vs 200W MA	价格与 200 周均线	価格と200週移動平均
MVRV Ratio historical	MVRV 比率历史	MVRV 比率の履歴
Waiting for CryptoQuant series	等待 CryptoQuant 时间序列	CryptoQuant の時系列を待機中
MVRV Z-score cycle	MVRV Z 分数周期	MVRV Z スコアのサイクル
Waiting for Glassnode series	等待 Glassnode 时间序列	Glassnode の時系列を待機中
Layer 2: On-chain Activity and OG Holder Behavior	第二层：链上活动与长期持有者行为	第2層：オンチェーン活動と長期保有者の行動
Measure network usage and long-term holder conviction.	衡量网络使用情况与长期持有者信心。	ネットワークの利用状況と長期保有者の確信度を測定します。
Active Addresses	活跃地址	アクティブアドレス
Transaction Count	交易数量	取引件数
Mempool Stats	内存池统计	メモリプール統計
Primary API pending, fallback to research snapshot when needed	主要 API 待接入，必要时使用研究快照	主要 API は未接続。必要に応じて調査スナップショットを使用
Exchange Reserve	交易所储备	取引所準備金
Exchange Inflow	交易所流入	取引所への流入
Exchange Outflow	交易所流出	取引所からの流出
Long-term holder metrics	长期持有者指标	長期保有者の指標
Old OG holder activity	早期持有者活动	初期保有者の活動
Signal logic	信号逻辑	シグナルの判定方法
Layer 3: Market Sentiment Indicators	第三层：市场情绪指标	第3層：市場心理の指標
Add sentiment and behavioral metrics.	补充市场情绪与行为指标。	市場心理と行動の指標を追加します。
Crypto Fear and Greed Index	加密恐惧与贪婪指数	暗号資産の恐怖・強欲指数
Funding Rate (perpetual futures)	资金费率（永续合约）	資金調達率（無期限先物）
Open Interest	未平仓量	建玉残高
Long/Short Ratio	多空比	ロング・ショート比率
Fear and Greed timeline	恐惧与贪婪时间线	恐怖・強欲の推移
Funding rate heatmap	资金费率热力图	資金調達率のヒートマップ
Coinalyze series extension pending	Coinalyze 序列扩展待接入	Coinalyze 時系列拡張は未接続
Open interest vs price	未平仓量与价格	建玉残高と価格
Layer 4: Macro Asset Environment	第四层：宏观资产环境	第4層：マクロ資産の環境
Track macro assets that historically correlate with Bitcoin cycles.	跟踪与比特币周期存在历史相关性的宏观资产。	ビットコインのサイクルと歴史的に関連するマクロ資産を追跡します。
Gold	黄金	金
Crude Oil	原油	原油
Correlation BTC vs S&P 500 (90d)	BTC 与标普 500 相关性（90 天）	BTC と S&P 500 の相関（90日）
Correlation BTC vs Gold (90d)	BTC 与黄金相关性（90 天）	BTC と金の相関（90日）
Correlation BTC vs DXY (90d)	BTC 与 DXY 相关性（90 天）	BTC と DXY の相関（90日）
Layer 5: Volatility and Risk Indicators	第五层：波动率与风险指标	第5層：ボラティリティとリスク指標
Track systemic market stress.	跟踪系统性市场压力。	市場全体のストレスを追跡します。
VIX Index	VIX 指数	VIX 指数
MOVE Index (bond vol)	MOVE 指数（债券波动率）	MOVE 指数（債券変動率）
Yield Curve (10Y-2Y)	收益率曲线（10 年 - 2 年）	イールドカーブ（10年－2年）
S&P 500 Drawdown	标普 500 回撤	S&P 500 のドローダウン
Put/Call Ratio	看跌 / 看涨比率	プット・コール比率
Bear market detection rules	熊市识别规则	弱気相場の検出ルール
Observation Playbook	市场观察框架	市場観察ガイド
Extract the current fear-page strategy first, then extend it into a broader crypto market observation workflow.	先理解当前情绪看板策略，再扩展为更完整的加密市场观察流程。	まず現在の市場心理ダッシュボードの戦略を把握し、暗号資産市場全体の観察へ広げます。
Current page strategy	当前页面策略	現在のページの戦略
The existing implementation is a bottom-observation framework built around layered evidence and a risk-first operating rule.	当前实现以分层证据与风险优先原则构建底部观察框架。	現在の実装は、多層的な根拠とリスク優先の原則による底値観察フレームワークです。
Expanded crypto market observation strategies	扩展市场观察策略	拡張された市場観察戦略
These strategies make the dashboard more useful for daily and weekly market review beyond pure bottom-fishing.	这些策略支持日常与每周市场复盘，扩大看板的使用场景。	これらの戦略は、底値の探索に加えて、日次・週次の市場レビューにも役立ちます。
Operator rules	使用原则	運用ルール
Historical Backtesting Module	历史回测模块	過去データの検証
Overlay all indicators during 2015, 2018, 2020, 2022 to visually compare cycle bottoms.	叠加 2015、2018、2020、2022 年指标，直观比较周期底部。	2015・2018・2020・2022年の指標を重ね、各サイクルの底値を比較します。
Post-2013 capitulation recovery	2013 年后恐慌抛售修复	2013年後の投げ売りからの回復
Focus: valuation compression + low activity base.	重点：估值压缩与低活跃基数。	重点：評価の圧縮と低い活動水準。
ICO bust and long consolidation	ICO 泡沫破裂与长期盘整	ICO バブル崩壊と長期調整
Focus: leverage reset + deep fear regime.	重点：杠杆重置与深度恐惧状态。	重点：レバレッジの解消と強い恐怖心理。
COVID liquidity shock	疫情流动性冲击	新型コロナによる流動性ショック
Focus: macro stress spike + rapid mean reversion.	重点：宏观压力激增与快速均值回归。	重点：マクロストレスの急増と急速な平均回帰。
Leverage unwind cycle	杠杆出清周期	レバレッジ解消のサイクル
Focus: systemic deleveraging + prolonged bear.	重点：系统性去杠杆与长期熊市。	重点：市場全体のレバレッジ解消と長期弱気相場。
API Sources	API 数据来源	API データソース
Overvalued	高估	割高
Undervalued	低估	割安
High probability bottom zone	高概率底部区间	底値の可能性が高いゾーン
strong accumulation zone	强积累区	強い蓄積局面
neutral	中性	中立
risk zone	风险区	リスク局面
0 - 30 Overvalued	0 - 30 高估	0 - 30 割高
30 - 60 Neutral	30 - 60 中性	30 - 60 中立
60 - 80 Undervalued	60 - 80 低估	60 - 80 割安
80 - 100 High probability bottom zone	80 - 100 高概率底部区间	80 - 100 底値の可能性が高いゾーン
ON	已满足	成立
OFF	未满足	未成立
UNKNOWN	未知	不明
All	全部	すべて
Capital map	资本配置图	資本配分マップ
Fund	投资组合	投資ポートフォリオ
DYOR! DYOR! DYOR! Last updated:	请独立研究！最近更新：	独自に調査してください！最終更新：
Tier	等级	ランク
private	未上市	未上場
no token ↗	无代币 ↗	トークンなし ↗
no token	无代币	トークンなし
Site	官网	公式サイト
Research	研究	リサーチ
Outperformed	表现领先	優位なパフォーマンス
Strong Oscillator	强势震荡资产	強いオシレーター
Wait / Track	等待 / 跟踪	待機・追跡
Failed / Avoid	失效 / 回避	不成立・回避
Weekly Snapshot	每周快照	週次スナップショット
Weekly snapshot	每周快照	週次スナップショット
Updates every week. Short-term market moves after the snapshot may not be reflected yet.	每周更新。快照之后的短期行情变化可能尚未反映。	毎週更新します。スナップショット後の短期的な市場変動は、まだ反映されていない場合があります。
Snapshot as of	快照时间	スナップショット日時
Tracked Alts	跟踪山寨币	追跡中のアルトコイン
The top-500 altcoin universe after removing BTC and stablecoins from the CoinGecko + CoinMarketCap ranking set.	从 CoinGecko 与 CoinMarketCap 排名中剔除 BTC 和稳定币后，跟踪前 500 名山寨币。	CoinGecko と CoinMarketCap のランキングから BTC とステーブルコインを除いた上位500のアルトコインを追跡します。
Research Focus	研究重点	リサーチ対象
Tokens tied directly to your current research pipeline and promoted into the focus set.	与当前研究流程直接关联并纳入重点观察的代币。	現在のリサーチに直接関連し、重点観察対象に加えたトークンです。
Binance BTC Pairs	Binance BTC 交易对	Binance BTC ペア
Assets with a live Binance spot BTC pair, giving us a cleaner ALT/BTC market price.	具有 Binance 现货 BTC 交易对的资产，提供更直接的 ALT/BTC 市场价格。	Binance の現物 BTC ペアがあり、ALT/BTC の市場価格を直接確認できる資産です。
Dual Ranked	双榜入选	両ランキングに掲載
Names that appear in both the CoinGecko and CoinMarketCap top-300 ranking sets.	同时进入 CoinGecko 与 CoinMarketCap 前 300 名的资产。	CoinGecko と CoinMarketCap の両方で上位300に入る資産です。
7D Breadth	7 天市场广度	7日間の市場の広がり
30D Breadth	30 天市场广度	30日間の市場の広がり
Current ALT/BTC	当前 ALT/BTC	現在の ALT/BTC
24H	24 小时	24時間
7D	7 天	7日
30D	30 天	30日
Best Rank	最佳排名	最高順位
Vol / MCap	成交量 / 市值	出来高／時価総額
Cycle Peak	周期高点	サイクルのピーク
VS Last Top	对比上轮高点	前回のピークとの比較
Above 5Y Low	距 5 年低点	5年間の底値からの上昇
24H Volume	24 小时成交量	24時間出来高
Rank	排名	順位
Asset	资产	資産
Dual	双榜	両ランキング
N/A	暂无数据	データなし
Extreme Fear	极度恐惧	極度の恐怖
Fear	恐惧	恐怖
Moderate Fear	适度恐惧	やや恐怖
Neutral	中性	中立
Moderate Greed	适度贪婪	やや強欲
Greed	贪婪	強欲
Extreme Greed	极度贪婪	極度の強欲
0 Extreme Fear	0 极度恐惧	0 極度の恐怖
50 Neutral	50 中性	50 中立
100 Extreme Greed	100 极度贪婪	100 極度の強欲
Loading BTC Market Heat...	正在加载 BTC 市场热度…	BTC 市場過熱度を読み込み中…
Unable to load BTC heat data —	无法加载 BTC 热度数据 —	BTC 過熱度データを読み込めません —
. Try refreshing.	。请尝试刷新。	。再読み込みをお試しください。
Live API unavailable — showing last cached data	实时 API 不可用，展示最近缓存数据	リアルタイム API が利用できないため、直近のキャッシュを表示しています
Market Heat Score	市场热度评分	市場過熱度スコア
Daily / 32	日度 / 32	日次／32
Weekly / 68	周度 / 68	週次／68
BTC Price	BTC 价格	BTC 価格
Daily Pulse	日度脉搏	日次の動向
4 indicators · 32 pts	4 项指标 · 32 分	4指標・32点
Weekly Structure	周度结构	週次の構造
9 indicators · 68 pts	9 项指标 · 68 分	9指標・68点
FAQ	常见问题	よくある質問
Weekly Research	每周研究	週次リサーチ
Market monitor	市场监测	市場モニター
oscillator	山寨币强弱监测	アルトコイン強弱モニター
An altcoin strength monitor built in two layers: a focused oscillator watchlist for your highest-conviction names, and a broader market table covering the CoinGecko / CoinMarketCap top 500 with Binance BTC-pair context.	分两层观察山寨币强弱：重点资产震荡指标观察列表，以及覆盖 CoinGecko / CoinMarketCap 前 500 名并结合 Binance BTC 交易对的全市场表格。	アルトコインの強弱を2層で観察します。重点資産のオシレーター監視リストと、CoinGecko／CoinMarketCap 上位500および Binance BTC ペアを扱う市場全体の表です。
BTC Price:	BTC 价格：	BTC 価格：
Data mode:	数据模式：	データモード：
Snapshot as of:	快照时间：	スナップショット日時：
Altcoin Breadth	山寨币市场广度	アルトコイン市場の広がり
BTC Market Heat	BTC 市场热度	BTC 市場過熱度
The focus set keeps the oscillator logic front and center, so you can quickly separate structurally strong names from decaying or still-unproven ones.	重点观察集突出震荡指标逻辑，帮助区分结构强势、持续走弱与尚未验证的资产。	重点観察対象ではオシレーターの判定を中心に、構造的に強い資産、弱体化する資産、未検証の資産を見分けます。
No focus names match the current filter.	当前筛选下没有重点资产。	現在の条件に一致する重点資産はありません。
The full-market observation layer. By default it tracks the top 500 alts after removing BTC and stablecoins, and you can switch into research, Binance BTC-pair, or dual-ranked views.	全市场观察层默认跟踪剔除 BTC 和稳定币后的前 500 名山寨币，可切换研究、Binance BTC 交易对或双榜视图。	市場全体の観察層は、BTC とステーブルコインを除く上位500のアルトコインを追跡します。リサーチ、Binance BTC ペア、両ランキングの表示に切り替えられます。
Search token / symbol	搜索代币 / 符号	トークン・シンボルを検索
Page	第	ページ
of	/	／
rows per page	条 / 页	件／ページ
Previous	上一页	前へ
Next	下一页	次へ
Data Sources: weekly local snapshot generated from Surf market ranking, Surf BTC pricing, Surf BTC history for focus names, CoinGecko BTC ratios, CoinMarketCap ranking cross-check, and Binance spot BTC pairs when available. BTC Market Heat data from Day1Global API.	数据来源：每周本地快照，源于 Surf 市场排名、BTC 价格及重点资产 BTC 历史、CoinGecko BTC 比率、CoinMarketCap 排名交叉核对，以及可用的 Binance 现货 BTC 交易对。BTC 市场热度来自 Day1Global API。	データソース：Surf の市場順位・BTC 価格・重点資産の BTC 履歴、CoinGecko の BTC 比率、CoinMarketCap の順位照合、利用可能な Binance 現物 BTC ペアを基にした週次ローカルスナップショット。BTC 過熱度は Day1Global API を使用します。
DYOR — This page is built for market observation and research workflow support, not investment advice.	请独立研究。本页用于市场观察与研究支持，不构成投资建议。	独自に調査してください。このページは市場観察とリサーチの支援用であり、投資助言ではありません。
Veteran	跨周期资产	複数サイクルの資産
Single-Cycle	单周期资产	単一サイクルの資産
Focus	重点关注	重点観察
Watch	观察	観察
Avoid	回避	回避
All Grades	全部评级	すべての評価
All Types	全部类型	すべての種類
Live	实时	リアルタイム
Updated today	今日更新	本日更新
1 day ago	1 天前	1日前
Crypto Cards	加密卡	暗号資産カード
Books	书籍	書籍
Data Sources	数据来源	データソース
AI Tools	AI 工具	AI ツール
stack	工具与资源	ツールとリソース
Apply	申请	申し込む
Rewards:	返现奖励：	還元：
Annual Fee:	年费：	年会費：
Pros:	优点：	メリット：
Cons:	缺点：	デメリット：
Douban	豆瓣	Douban
Market	行情	市場
On-chain	链上	オンチェーン
News	新闻	ニュース
Language	语言	言語
Visa	签证	ビザ
Paid	付费	有料
Coding	编程	プログラミング
Content	内容	コンテンツ
Productivity	效率工具	生産性
Design	设计	デザイン
free	免费	無料
freemium	免费增值	基本無料
paid	付费	有料
Spot only	仅现货	現物のみ
Perp only ⚠	仅永续 ⚠	無期限先物のみ ⚠
Spot→Perp	现货→永续	現物→無期限先物
Perp→Spot	永续→现货	無期限先物→現物
Spot+Perp	现货 + 永续	現物＋無期限先物
Binance+Coinbase+Upbit or 4+ spot exchanges	Binance + Coinbase + Upbit，或至少 4 家现货交易所	Binance＋Coinbase＋Upbit、または4つ以上の現物取引所
Binance spot / Coinbase / Upbit confirmed	已确认 Binance 现货 / Coinbase / Upbit 上市	Binance 現物／Coinbase／Upbit で上場を確認
2-3 spot exchanges or Binance futures	2–3 家现货交易所，或 Binance 合约	2〜3つの現物取引所、または Binance 先物
1 spot or any derivatives	1 家现货交易所，或任一衍生品	1つの現物取引所、またはいずれかのデリバティブ
Not on any tracked exchange	未在跟踪交易所上市	追跡対象の取引所に未上場
Risk / Delisting event	风险 / 下架事件	リスク／上場廃止
Spot presence + Futures onboardDate	现货状态 + 合约上市时间	現物の有無＋先物の上場時刻
Spot & Swap listTime	现货与永续上市时间	現物・スワップの上場時刻
Linear Perp launchTime	线性永续上线时间	リニア無期限先物の開始時刻
Spot openTime	现货开盘时间	現物の開始時刻
Spot new_at	现货新增时间	現物の追加時刻
Spot presence	现货状态	現物の有無
Perp presence	永续状态	無期限先物の有無
SPOT	现货	現物
PERP	永续	無期限先物
Has Spot	已上现货	現物あり
Perp Only ⚠	仅永续 ⚠	無期限先物のみ ⚠
Signals	信号	シグナル
Listing Intelligence	上市情报	上場情報
Exchange Listing Watch	交易所上市观察	取引所の上場ウォッチ
Coins listed on Binance, OKX, Bybit, Bitget, Coinbase, Upbit or Hyperliquid in the past	观察 Binance、OKX、Bybit、Bitget、Coinbase、Upbit 和 Hyperliquid 最近	Binance、OKX、Bybit、Bitget、Coinbase、Upbit、Hyperliquid の直近
 days	天	日間
. Data from exchange native APIs.	的上市资产。数据来自交易所原生 API。	の上場資産。データは取引所の公式 API を使用します。
Updated:	最近更新：	更新日時：
Data temporarily unavailable —	数据暂不可用 —	データを一時的に利用できません —
source	个来源	ソース
failed to respond this update. Figures below may be incomplete.	本次未响应，下方数据可能不完整。	から今回の応答がありません。以下のデータは不完全な可能性があります。
Fear & Greed	恐惧与贪婪	恐怖・強欲
Index	指数	指数
Total MCap	总市值	総時価総額
BTC Dom	BTC 占比	BTC ドミナンス
New Listings	新增上市	新規上場
 d window	天窗口	日間の期間
no spot anywhere	各平台均无现货	現物上場なし
Signal	信号	シグナル
Newest	最近上市	新しい順
sources	个来源	ソース
unknown error	未知错误	不明なエラー
Signal Rating Guide	信号评级说明	シグナル評価ガイド
Symbol…	代币符号…	シンボル…
MCap	市值	時価総額
FDV	完全稀释估值	完全希薄化後の評価額
Circulating / FDV ratio	流通市值 / FDV 比率	流通時価総額／FDV 比率
Type	类型	種類
Sig	评级	評価
First seen	首次发现	初回確認
No listings in this filter.	当前筛选下暂无上市资产。	現在の条件に一致する上場資産はありません。
coins · Click any row to see full exchange matrix	个资产 · 点击任意行查看完整交易所状态	資産・行をクリックすると取引所の全状況を表示
Data sources:	数据来源：	データソース：
BUY	买入信号	買いシグナル
Exchange Status Matrix	交易所状态矩阵	取引所の状況一覧
Listing Summary	上市摘要	上場の概要
Spot on	现货平台	現物の取引所
Perp on	永续平台	無期限先物の取引所
Sequence	上市顺序	上場順序
Perp without spot	永续但无现货	現物なしの無期限先物
Multi-ex spot	多平台现货	複数取引所の現物
Perp-led discovery	永续先行	無期限先物が先行
Binance spot	Binance 现货	Binance 現物
Upbit KRW	Upbit 韩元现货	Upbit KRW 現物
Signal Notes	信号说明	シグナルの注記
Pattern Detectors	模式识别	パターン検出
Perp-led Discovery	永续先行发现	無期限先物が先行
Derivatives present, not on Binance/CB spot	有衍生品，尚未上 Binance / Coinbase 现货	デリバティブあり、Binance／Coinbase 現物なし
Derivatives Only ⚠	仅衍生品 ⚠	デリバティブのみ ⚠
Perp traded, zero spot on any exchange	有永续交易，所有跟踪平台均无现货	無期限先物取引あり、追跡対象の現物上場なし
Multi-Exchange Spot	多平台现货上市	複数取引所の現物上場
3+ exchanges with spot listing	至少 3 家交易所现货上市	3つ以上の取引所で現物上場
Cross-Exchange Signals	跨交易所信号	取引所間のシグナル
Notable listing path patterns	值得关注的上市路径	注目すべき上場経路
None detected	暂无发现	検出なし
more	更多	さらに
None	无	なし
No	否	いいえ
Yes	是	はい
YES ⚠ — high risk	是 ⚠ — 高风险	はい ⚠ — 高リスク
Yes — not on BNB/CB spot	是 — 尚未上 Binance / Coinbase 现货	はい — Binance／Coinbase 現物なし
Listed	已上市	上場済み
Not listed	未上市	未上場
Perp listed	永续已上市	無期限先物上場済み
Spot+Perp confirmed	现货 + 永续已确认	現物＋無期限先物を確認
optimistic	乐观	楽観的
pessimistic	悲观	悲観的
high	高	高
medium	中	中
low	低	低
security	安全	セキュリティ
regulation	监管	規制
competitor	竞品	競合
Source content is shown in its original language; translations will be added in the content phase.	来源内容保留原文，后续在内容阶段补齐翻译。	ソース内容は原文で表示しています。翻訳はコンテンツ対応の段階で追加します。
X source	X 来源	X のソース
Predict markets	预测市场	予測市場
Top intel	核心情报	主要情報
Crypto KOL × project	加密 KOL × 项目	暗号資産 KOL × プロジェクト
fans	粉丝	フォロワー
posts/7d	帖 / 7 天	投稿／7日
Crypto Twitter vibe	加密社区情绪	暗号資産コミュニティの雰囲気
Heads up	风险提示	注意事項
Operator's notes	运营备注	運用メモ
Weekly Pulse	每周市场脉搏	週次市場動向
Pulse ·	市场脉搏 ·	市場動向・
What moved the room	本周关注焦点	今週の注目動向
CEX desk	中心化交易所	中央集権型取引所
Chain layer	公链层	チェーン動向
Signal voices	观点来源	情報発信者
Agent narrative	Agent 叙事	エージェントのテーマ
`;
for (const row of rows.trim().split('\n')) {
  const [en, zh, ja] = row.split('\t');
  copy[en.trim()] = [en.trim(), zh, ja];
}

const fundRows = `
Investing in the next future — maybe 2050 will enter a new era. This is not a value portfolio. It is a maximum market-cap-growth portfolio for the next 5-10 years.	投资未来，也许 2050 年会进入新纪元。这是面向未来 5–10 年市值增长潜力的组合。	未来に投資する。2050年には新しい時代が始まるかもしれない。今後5〜10年の時価総額成長を重視したポートフォリオです。
Three themes: AI Infrastructure (sell the picks) → AI Platform (build the OS) → AI Applications & Traffic (own users + monetize).	三条主线：AI 基础设施（提供工具）→ AI 平台（构建操作系统）→ AI 应用与流量（用户与变现）。	3つのテーマ：AI インフラ（道具を提供）→ AI プラットフォーム（OS を構築）→ AI アプリと集客（ユーザーと収益化）。
High growth over low valuation. AI exposure first. Platform companies first. The Coatue "Fantastic 40" framework — 30 publics + 10 privates & crypto.	优先高增长、AI 敞口与平台公司。参考 Coatue「Fantastic 40」框架：30 家上市公司 + 10 家未上市公司与加密资产。	低評価より高成長を重視。AI とプラットフォーム企業を優先。Coatue「Fantastic 40」の枠組み：上場30社＋未上場・暗号資産10件。
Confirmed holdings: BTC, ETH — conviction positions, not speculation.	已确认持仓：BTC、ETH，基于长期信念持有。	確認済みの保有資産：BTC、ETH。長期的な確信に基づく保有です。
AI compute monopoly. GPU + CUDA ecosystem builds the moat.	AI 算力优势，GPU 与 CUDA 生态形成护城河。	AI 計算基盤の優位性。GPU と CUDA のエコシステムが参入障壁を構築。
Sole supplier of advanced AI chip manufacturing. Irreplaceable.	先进 AI 芯片制造的核心供应商，难以替代。	先端 AI チップ製造の中核供給者。代替が困難。
Only EUV lithography machine maker. Crown jewel of semiconductors.	唯一的 EUV 光刻机制造商，半导体关键基础设施。	唯一の EUV 露光装置メーカー。半導体の重要基盤。
Chasing NVDA in GPUs. Growing data center AI share with MI series.	在 GPU 领域追赶 NVIDIA，通过 MI 系列提升数据中心 AI 份额。	GPU で NVIDIA を追う。MI シリーズでデータセンター AI のシェアを拡大。
Core HBM memory beneficiary. AI storage demand explosion.	HBM 内存核心受益者，受益于 AI 存储需求增长。	HBM メモリの主要受益者。AI 向け記憶装置の需要拡大。
AI ASIC custom chips + semiconductor M&A consolidator.	AI ASIC 定制芯片与半导体并购整合。	AI 向け ASIC カスタムチップと半導体の M&A 統合。
CPU architecture IP dominates mobile, now penetrating AI chips.	CPU 架构 IP 主导移动市场，正进入 AI 芯片领域。	CPU アーキテクチャ IP がモバイル市場を支配し、AI チップへ拡大。
Edge network + AI inference layer. Web security infrastructure.	边缘网络与 AI 推理层，互联网安全基础设施。	エッジネットワークと AI 推論層。ウェブセキュリティ基盤。
Enterprise software + cloud + AI platform trinity. Cash flow machine.	企业软件、云与 AI 平台三位一体，现金流能力强。	企業ソフトウェア、クラウド、AI プラットフォームの統合。強いキャッシュフロー。
AI + search ads dual engine. Monetization pace is the key variable.	AI 与搜索广告双引擎，变现速度是关键变量。	AI と検索広告の2つのエンジン。収益化の速度が主要変数。
AWS + e-commerce dual flywheel. AI pushing cloud business value higher.	AWS 与电商双飞轮，AI 提升云业务价值。	AWS と EC の相乗効果。AI がクラウド事業の価値を高める。
Cloud transition + AI database demand recovery.	云转型与 AI 数据库需求复苏。	クラウドへの移行と AI データベース需要の回復。
Ad cash flow + open-source AI (Llama) + XR long bet.	广告现金流、开源 AI（Llama）与 XR 长期布局。	広告のキャッシュフロー、オープンソース AI（Llama）、XR への長期投資。
EV + autonomous driving + robotics. Valuation anchored in AI, not cars.	电动车、自动驾驶与机器人，估值核心在 AI。	EV、自動運転、ロボティクス。AI を中心とした評価。
Streaming leader + ad-supported tier opens new revenue space.	流媒体龙头，广告套餐拓展收入来源。	動画配信の大手。広告付きプランが新たな収益源を開拓。
Music platform + AI recommendations + podcast monetization.	音乐平台、AI 推荐与播客变现。	音楽プラットフォーム、AI レコメンド、ポッドキャストの収益化。
Independent commerce infrastructure. Benefits from de-platformization.	独立电商基础设施，受益于商家减少平台依赖。	独立型 EC 基盤。販売者のプラットフォーム依存低下が追い風。
Platform network effects + profitability inflection confirmed.	平台网络效应，盈利拐点已确认。	プラットフォームのネットワーク効果と確認された収益性の転換。
Advertising + AI algorithm driving profit explosion.	广告与 AI 算法推动利润增长。	広告と AI アルゴリズムが利益成長を牽引。
Japan's leading mobile payment super app. SoftBank ecosystem.	日本领先移动支付超级应用，属于 SoftBank 生态。	日本の主要モバイル決済スーパーアプリ。SoftBank のエコシステム。
China local services platform. Food delivery + instant commerce dominance.	中国本地生活平台，外卖与即时零售优势突出。	中国の地域サービスプラットフォーム。フードデリバリーと即時配送 EC に強み。
AI + data platform. Government and enterprise dual-wheel drive.	AI 与数据平台，政府和企业业务双轮驱动。	AI とデータのプラットフォーム。政府・企業の2領域が牽引。
ERP leader. Cloud transition unlocking margin expansion.	ERP 龙头，云转型推动利润率提升。	ERP の大手。クラウド移行による利益率の拡大。
Enterprise automation platform. AI increases ARPU.	企业自动化平台，AI 提升单用户收入。	企業向け自動化プラットフォーム。AI が ARPU を向上。
Data cloud platform. AI data layer beneficiary.	数据云平台，受益于 AI 数据层建设。	データクラウドプラットフォーム。AI データ層の拡大が追い風。
Tax & financial software + AI automation drives efficiency.	税务与金融软件，通过 AI 自动化提高效率。	税務・財務ソフトウェアと AI 自動化による効率向上。
E-commerce + cloud. Confirmed holding at low valuation.	电商与云，低估值下的已确认持仓。	EC とクラウド。低い評価水準での確認済み保有。
Gaming + social cash cow. AI improves efficiency across the board.	游戏与社交现金流，AI 提升整体效率。	ゲームとソーシャルの安定した収益。AI が全体の効率を改善。
China social commerce + Temu global expansion. Aggressive growth engine.	中国社交电商与 Temu 全球扩张，高增长驱动。	中国のソーシャル EC と Temu の世界展開。積極的な成長エンジン。
Phone + IoT + EV new story. Ecosystem play.	手机、IoT 与电动车新业务，生态协同。	スマートフォン、IoT、EV の新事業。エコシステムの相乗効果。
Power equipment + energy transition beneficiary.	电力设备，受益于能源转型。	電力設備。エネルギー転換の受益者。
Surgical robotics monopoly.	手术机器人领先优势。	手術ロボットの圧倒的な優位性。
Cloud security leader. AI security demand explosion.	云安全龙头，受益于 AI 安全需求增长。	クラウドセキュリティの大手。AI セキュリティ需要の拡大。
Nuclear power + AI compute electricity demand beneficiary.	核电与 AI 算力用电需求受益者。	原子力発電と AI 計算基盤の電力需要の受益者。
Digital gold. Core institutional asset allocation. Confirmed holding.	数字黄金，机构核心配置资产，已确认持仓。	デジタルゴールド。機関投資家の中核配分資産。確認済み保有。
Smart contract base layer. Web3 core infrastructure. Confirmed holding.	智能合约基础层，Web3 核心基础设施，已确认持仓。	スマートコントラクトの基盤層。Web3 の中核インフラ。確認済み保有。
High-performance perpetuals DEX with on-chain order book.	采用链上订单簿的高性能永续 DEX。	オンチェーン注文板を持つ高性能な無期限先物 DEX。
Binance ecosystem token. High throughput chain + exchange flywheel.	Binance 生态代币，高吞吐公链与交易所飞轮。	Binance のエコシステムトークン。高処理能力チェーンと取引所の相乗効果。
Privacy-enabled blockchain for institutional use cases.	面向机构场景的隐私区块链。	機関向け用途のプライバシー対応ブロックチェーン。
The largest decentralized exchange protocol.	最大的去中心化交易协议。	最大の分散型取引プロトコル。
RWA tokenization protocol. Institutional-grade on-chain assets (OUSG, USDY).	RWA 代币化协议，提供机构级链上资产（OUSG、USDY）。	RWA トークン化プロトコル。機関向けオンチェーン資産（OUSG、USDY）。
Largest US crypto exchange. Institutional gateway to digital assets.	美国最大加密交易所，机构进入数字资产的入口。	米国最大の暗号資産取引所。機関向けデジタル資産の入口。
USDC stablecoin issuer. Global financial infrastructure.	USDC 稳定币发行商，全球金融基础设施。	USDC ステーブルコインの発行者。世界的な金融インフラ。
Largest decentralized prediction market on Polygon. No token issued yet.	Polygon 上最大的去中心化预测市场，尚未发行代币。	Polygon 上の最大の分散型予測市場。トークンは未発行。
US-regulated centralized prediction market, CFTC licensed. No token.	美国监管下的中心化预测市场，持有 CFTC 许可，无代币。	米国規制下の中央集権型予測市場。CFTC 認可、トークンなし。
Macro-focused prediction market on BNB Smart Chain.	BNB Smart Chain 上聚焦宏观的预测市场。	BNB Smart Chain 上のマクロ中心の予測市場。
Binary & categorical prediction market on Base. No token yet.	Base 上的二元与多分类预测市场，尚无代币。	Base 上の二択・カテゴリ型予測市場。トークン未発行。
Sports-focused scalar prediction market on Base. AMM model.	Base 上聚焦体育的标量预测市场，采用 AMM 模型。	Base 上のスポーツ中心の数値予測市場。AMM モデル。
Crypto card mode for Revolut balances, auto-converting crypto at spend time.	使用 Revolut 余额的加密卡模式，消费时自动兑换加密资产。	Revolut 残高の暗号資産カード機能。支払い時に暗号資産を自動換金。
Visa debit card for spending cash or crypto from Coinbase with crypto rewards.	使用 Coinbase 现金或加密资产支付并获得加密奖励的 Visa 借记卡。	Coinbase の現金・暗号資産を使い、暗号資産の還元を受ける Visa デビットカード。
Stablecoin card and payment app for everyday USDT/USDC-style spending.	面向日常 USDT / USDC 支付的稳定币卡与支付应用。	日常の USDT／USDC 決済向けステーブルコインカードと決済アプリ。
Stablecoin money app with instant cards for global Web3 spending.	支持即时开卡的稳定币资金应用，用于全球 Web3 支付。	即時カード発行に対応するステーブルコインアプリ。世界の Web3 決済向け。
DeFi-native credit card connected to on-chain balances and yield-bearing stables.	连接链上余额与生息稳定币的 DeFi 原生信用卡。	オンチェーン残高と利回り付きステーブルコインに連動する DeFi ネイティブのクレジットカード。
Non-custodial account and card for turning wallet assets into everyday spend.	非托管账户与卡片，将钱包资产用于日常消费。	ウォレット資産を日常の支払いに使う非カストディ型口座とカード。
Stablecoin payment infrastructure and card rails for consumer and B2B spend.	面向个人与 B2B 支付的稳定币基础设施和卡支付网络。	個人・B2B 支払い向けのステーブルコイン決済基盤とカード網。
Self-custodial Visa debit card linked to Safe smart accounts.	连接 Safe 智能账户的自托管 Visa 借记卡。	Safe スマートアカウントに連動する自己管理型 Visa デビットカード。
Crypto Visa card and USDT wallet with stablecoin top-ups and BTC cashback.	支持稳定币充值和 BTC 返现的加密 Visa 卡与 USDT 钱包。	ステーブルコイン入金と BTC 還元に対応する暗号資産 Visa カード・USDT ウォレット。
Kraken money app and card for spending cash or crypto with rewards.	Kraken 资金应用与卡片，支持现金或加密资产支付并获得奖励。	現金・暗号資産の支払いと還元に対応する Kraken の資金アプリとカード。
Tap-to-pay crypto app that converts wallet assets at the point of sale.	消费时兑换钱包资产的加密触碰支付应用。	支払い時にウォレット資産を換金する暗号資産のタッチ決済アプリ。
Crypto-backed Visa card for spending AVAX, USDC, USDT, and WAVAX.	使用 AVAX、USDC、USDT 与 WAVAX 支付的加密资产 Visa 卡。	AVAX、USDC、USDT、WAVAX を使える暗号資産担保型 Visa カード。
Self-custodial crypto neobank with card spend and Apple Pay support.	支持卡片消费与 Apple Pay 的自托管加密数字银行。	カード決済と Apple Pay に対応する自己管理型暗号資産ネオバンク。
Solana self-custody debit card for spending USDC directly from the wallet.	Solana 自托管借记卡，直接使用钱包中的 USDC 支付。	ウォレットの USDC を直接使う Solana 自己管理型デビットカード。
Non-custodial wallet with virtual and physical cards for stablecoin and fiat spend.	非托管钱包，提供虚拟与实体卡，支持稳定币和法币消费。	ステーブルコイン・法定通貨決済用の仮想・物理カードを備える非カストディ型ウォレット。
Stablecoin-rails USD/EUR account and global card for cross-border workers.	基于稳定币网络的美元 / 欧元账户和全球卡片，面向跨境工作者。	国際的に働く人向けのステーブルコイン基盤の USD／EUR 口座とグローバルカード。
Hyperliquid liquid-banking account with Hyperbeat Pay card and credit mode.	Hyperliquid 流动性银行账户，配备 Hyperbeat Pay 卡与信用模式。	Hyperbeat Pay カードと信用機能を持つ Hyperliquid の流動性銀行口座。
AI model and ecosystem center. Compute + data + application closed loop.	AI 模型与生态中心，形成算力、数据、应用闭环。	AI モデルとエコシステムの中心。計算資源・データ・アプリの循環。
Commercial aerospace + Starlink. Cash flow already validated.	商业航天与 Starlink，现金流已得到验证。	商業宇宙事業と Starlink。キャッシュフローを確認済み。
Claude model maker. Safety-first AI route.	Claude 模型开发者，采用安全优先的 AI 路线。	Claude の開発元。安全を優先する AI の方針。
TikTok global traffic dominator.	TikTok 全球流量领先者。	TikTok による世界規模の集客。
Global payment infrastructure.	全球支付基础设施。	グローバル決済インフラ。
Data + AI platform (Lakehouse). Enterprise AI data layer.	数据与 AI 平台（Lakehouse），提供企业 AI 数据层。	データ・AI プラットフォーム（Lakehouse）。企業の AI データ層。
European digital bank super app.	欧洲数字银行超级应用。	欧州のデジタル銀行スーパーアプリ。
Musk's AI company. Compute + data integration play.	马斯克的 AI 公司，整合算力与数据。	Musk の AI 企業。計算資源とデータの統合。
Frontend cloud + Next.js platform. AI-native deployment infrastructure.	前端云与 Next.js 平台，AI 原生部署基础设施。	フロントエンドクラウドと Next.js プラットフォーム。AI ネイティブのデプロイ基盤。
AI Infrastructure	AI 基础设施	AI インフラ
AI Platform	AI 平台	AI プラットフォーム
AI Applications	AI 应用	AI アプリ
AI Apps & Traffic	AI 应用与流量	AI アプリと集客
SaaS & Platforms	SaaS 与平台	SaaS とプラットフォーム
China & EM	中国与新兴市场	中国・新興市場
Industrial & Energy	工业与能源	産業・エネルギー
Crypto	加密资产	暗号資産
Web3 Stocks	Web3 股票	Web3 関連株
Prediction Markets	预测市场	予測市場
Private	未上市	未上場
`;
for (const row of fundRows.trim().split('\n')) {
  const [en, zh, ja] = row.split('\t');
  copy[en.trim()] = [en.trim(), zh, ja];
}

const playbookRows = `
Bottom probability model	底部概率模型	底値の確率モデル
The current page is a Bitcoin bottom-observation stack built to collect evidence, not to force a trade.	本页汇集比特币底部观察证据，供研究判断参考。	このページはビットコインの底値を観察し、判断の根拠を集めるためのものです。
Composite score aggregates valuation, on-chain activity, sentiment, macro assets, and volatility risk.	综合评分汇总估值、链上活动、情绪、宏观资产与波动风险。	総合スコアは、評価、オンチェーン活動、市場心理、マクロ資産、変動リスクを統合します。
Bottom Alert Engine turns green only when at least five of eight bottom conditions are active.	八项底部条件至少满足五项时，底部预警引擎才会亮绿灯。	8つの底値条件のうち5つ以上が成立した場合にのみ、アラートが緑になります。
Historical cycle framing references 2015, 2018, 2020, and 2022 for context instead of one-cycle anchoring.	结合 2015、2018、2020、2022 年周期，避免单一周期锚定。	2015・2018・2020・2022年のサイクルを参照し、単一サイクルへの偏りを避けます。
A high score means multiple stress and capitulation signals are aligning, not that a reversal is guaranteed.	高分代表多项压力与恐慌出清信号一致，并不保证反转。	高スコアは複数のストレスと投げ売りの兆候が重なることを示し、反転を保証しません。
A low score means the market is still expensive or crowded, so patience matters more than prediction.	低分代表市场仍然昂贵或拥挤，需要耐心观察。	低スコアは割高または混雑した市場を示し、予測より忍耐が重要です。
Layered evidence workflow	分层证据流程	多層的な根拠の確認
The page treats market observation as a sequence of layers instead of a single magic metric.	本页通过多层指标组织市场观察。	このページは複数の層を通じて市場を観察します。
Layer 1 asks whether price is historically compressed versus realized value and long-term trend.	第一层检查价格相对已实现价值与长期趋势是否处于历史低位。	第1層では、実現価値と長期トレンドに対して価格が歴史的に低いかを確認します。
Layer 2 checks whether network activity and holder behavior support real demand or distribution.	第二层检查网络活动与持有者行为是否支持真实需求或分配。	第2層では、ネットワーク活動と保有者行動が実需または分配を示すかを確認します。
Layer 3 reads crowding, fear, and derivatives positioning.	第三层观察交易拥挤、恐惧与衍生品仓位。	第3層では、ポジションの混雑、恐怖、デリバティブの動向を確認します。
Layer 4 and Layer 5 filter for macro spillover and cross-asset stress.	第四层与第五层检查宏观影响与跨资产压力。	第4・5層では、マクロ環境の影響と資産間のストレスを確認します。
When several layers agree, conviction can rise.	多层信号一致时，判断信心可以提高。	複数の層が一致すれば、判断への確信を高められます。
When valuation looks cheap but leverage and macro still deteriorate, the model stays defensive.	估值便宜但杠杆与宏观继续恶化时，模型保持防御。	割安でもレバレッジとマクロ環境が悪化していれば、モデルは防御的な判断を維持します。
Risk-first operating rule	风险优先原则	リスク優先の運用原則
The dashboard is explicitly framed as a decision-support system for research, not a trading signal generator.	看板定位为研究决策支持系统。	このダッシュボードはリサーチの意思決定を支援するシステムです。
Use the dashboard to reduce narrative noise and structure weekly or daily reviews.	利用看板减少叙事噪声，组织每周或日常复盘。	ダッシュボードでテーマの雑音を減らし、週次・日次のレビューを整理します。
Treat unknown or missing metrics as uncertainty, not as bullish confirmation.	将未知或缺失指标视为不确定性，不能当作利好确认。	不明・欠損指標は不確実性として扱い、強気の確認材料と見なしません。
Cross-check all outputs with your own risk management, sizing rules, and time horizon.	结合风险管理、仓位规则和持有周期，交叉核对所有输出。	リスク管理、ポジション規模、時間軸とすべての出力を照合します。
The best use case is regime detection and watchlist prioritization.	适用于市场状态识别与观察列表优先级排序。	市場局面の検出と監視リストの優先順位付けに適しています。
The worst use case is turning one dashboard refresh into forced execution.	避免仅凭一次刷新就立即交易。	一度の更新だけを根拠に取引を実行することは避けます。
Regime classification	市场状态分类	市場局面の分類
Label the market as capitulation, repair, trend continuation, or overheating before making any directional conclusion.	先区分恐慌出清、修复、趋势延续或过热，再作方向判断。	方向を判断する前に、投げ売り、回復、トレンド継続、過熱に分類します。
Composite score band, fear and greed, price versus realized price, MVRV, VIX, and funding rate.	综合评分区间、恐惧贪婪、价格与已实现价格、MVRV、VIX、资金费率。	総合スコア区分、恐怖・強欲、価格と実現価格、MVRV、VIX、資金調達率。
If fear is extreme and leverage is washed out, focus on repair probability rather than instant upside.	极度恐惧且杠杆出清时，重点观察修复概率。	極度の恐怖とレバレッジ解消が重なる場合、回復の可能性を重視します。
If greed rises while valuation and leverage are both stretched, shift to protection mode.	贪婪上升且估值与杠杆偏高时，转向保护仓位。	強欲が高まり、評価とレバレッジも過剰なら、保護を優先します。
This strategy keeps the dashboard useful outside of absolute bottoms.	该策略也适用于非绝对底部阶段。	この戦略は明確な底値以外の局面にも有用です。
It converts a bottom model into a full market-state model.	将底部模型扩展为完整市场状态模型。	底値モデルを市場局面全体のモデルへ広げます。
Leverage reset and crowded positioning	杠杆重置与拥挤仓位	レバレッジの解消と混雑したポジション
Watch whether derivatives are cleansing risk or rebuilding fragility.	观察衍生品是否正在清除风险或重建脆弱性。	デリバティブがリスクを解消しているか、脆弱性を積み上げているかを観察します。
Funding rate trend, open interest direction, long/short ratio, liquidations, and exchange inflow pressure.	资金费率趋势、未平仓量方向、多空比、清算与交易所流入压力。	資金調達率の推移、建玉の方向、ロング・ショート比率、清算、取引所への流入圧力。
Negative funding with falling open interest often signals a reset phase.	负资金费率与未平仓量下降，通常提示重置阶段。	負の資金調達率と建玉の減少は、解消局面を示すことが多いです。
Positive funding with rising open interest and euphoric sentiment often signals crowding.	正资金费率、未平仓量上升与狂热情绪，通常提示仓位拥挤。	正の資金調達率、建玉増加、熱狂的な心理は、混雑を示すことが多いです。
A clean reset can create better risk-reward than a euphoric breakout.	充分重置后的风险收益比，可能优于狂热突破。	十分な解消後には、熱狂的な突破局面より良いリスク・リターンが得られる場合があります。
Crowded longs are often more dangerous than a weak headline.	拥挤的多头仓位往往比单条利空新闻更危险。	混雑したロングは、単発の悪材料より危険な場合があります。
Liquidity migration	流动性迁移	流動性の移動
Track where capital is moving across Bitcoin, stablecoins, exchanges, and risk assets.	跟踪资金在比特币、稳定币、交易所和风险资产之间的迁移。	ビットコイン、ステーブルコイン、取引所、リスク資産間の資金移動を追跡します。
Exchange reserve, exchange inflow or outflow, stablecoin supply trend, ETF or treasury accumulation when available.	交易所储备与流入流出、稳定币供应趋势，以及可用的 ETF 或储备增持数据。	取引所準備金・入出金、ステーブルコイン供給の推移、取得可能な ETF・財務保有の蓄積データ。
Falling exchange reserves with stable or improving demand can support constructive structure.	交易所储备下降且需求稳定或改善，可能支持健康市场结构。	取引所準備金の減少と需要の安定・改善は、建設的な市場構造を支える可能性があります。
Rising exchange inflows during macro stress can imply sell-side pressure.	宏观压力下交易所流入上升，可能反映卖压。	マクロストレス下で取引所への流入が増える場合、売り圧力を示唆します。
This helps separate true accumulation from temporary price reflex.	帮助区分真实积累与短期价格反弹。	実際の蓄積と一時的な価格反発を見分ける助けになります。
Liquidity direction matters as much as spot price.	流动性方向与现货价格同样重要。	流動性の方向は現物価格と同じくらい重要です。
BTC to ETH to alt rotation watch	BTC → ETH → 山寨币轮动观察	BTC → ETH → アルトコインの循環観察
Read breadth and rotation instead of assuming the whole market moves as one asset class.	观察广度与轮动，避免将整个市场视为同步变动的单一资产。	市場全体が一斉に動くと仮定せず、広がりと循環を観察します。
BTC dominance, ETH/BTC, TOTAL3 breadth, sector leadership, and whether alts outperform on up days or only underperform on down days.	BTC 占比、ETH/BTC、TOTAL3 广度、板块领涨情况，以及山寨币在上涨与下跌日的相对表现。	BTC ドミナンス、ETH/BTC、TOTAL3 の広がり、主導セクター、上昇日・下落日のアルトコインの相対成績。
If Bitcoin leads while breadth stays narrow, the market is usually still defensive.	比特币领涨但广度偏窄，市场通常仍偏防御。	ビットコインが主導し広がりが乏しい場合、市場は一般に防御的です。
If ETH and quality beta start outperforming with healthier breadth, risk appetite is broadening.	ETH 与优质高贝塔资产走强且广度改善，反映风险偏好扩散。	ETH と質の高い高ベータ資産が優位となり広がりも改善すれば、リスク選好が拡大しています。
This prevents a Bitcoin-only dashboard from missing broader crypto regime shifts.	避免只看比特币而遗漏更广泛的加密市场状态变化。	ビットコインだけの観察で、暗号資産全体の局面変化を見落とすことを防ぎます。
Rotation is often the bridge between BTC macro trades and full crypto risk-on.	轮动通常连接 BTC 宏观交易与整个加密市场的风险偏好回升。	循環は BTC のマクロ取引と暗号資産全体のリスク選好の回復をつなぐことが多いです。
Holder conviction and old coin behavior	持有者信心与老币行为	保有者の確信と古いコインの動向
Use on-chain behavior to tell apart early accumulation, mature trend, and late distribution.	通过链上行为区分早期积累、成熟趋势和后期分配。	オンチェーン行動で、初期蓄積、成熟したトレンド、後期分配を見分けます。
Dormancy flow, coin days destroyed, LTH-SOPR, old coins moved, and HODL wave changes.	休眠流、币天销毁、LTH-SOPR、老币转移与 HODL 波动分布。	休眠フロー、コイン日数破壊、LTH-SOPR、古いコインの移動、HODL 波の変化。
Low dormancy with improving activity often supports accumulation.	休眠指标低且活动改善，通常支持积累判断。	低い休眠指標と活動の改善は、蓄積を示すことが多いです。
Aggressive old-coin movement into strength often signals mature-cycle distribution.	强势行情中老币大量转移，通常提示成熟周期分配。	強い相場で古いコインが大量に移動すると、成熟サイクルでの分配を示すことが多いです。
Holder behavior adds context that derivatives data cannot provide.	持有者行为补充衍生品数据无法提供的背景。	保有者行動はデリバティブデータにない文脈を補います。
Old supply moving is usually more informative than loud social sentiment.	老币供应移动通常比热闹的社交情绪更有信息价值。	古い供給の移動は、騒がしいソーシャル心理より多くの情報を持つことが多いです。
Macro spillover monitor	宏观影响监测	マクロ波及のモニター
Treat crypto as connected to global liquidity and cross-asset volatility, especially during stress.	将加密市场与全球流动性及跨资产波动联系起来，尤其是在压力阶段。	特にストレス時には、暗号資産と世界の流動性・資産間変動の関係を考慮します。
DXY, Nasdaq, S&P 500, gold, crude oil, VIX, MOVE, and yield-curve signals.	DXY、纳斯达克、标普 500、黄金、原油、VIX、MOVE 与收益率曲线。	DXY、Nasdaq、S&P 500、金、原油、VIX、MOVE、イールドカーブ。
Rising dollar, rising rates volatility, and equity stress usually tighten crypto conditions.	美元走强、利率波动上升和股票压力，通常收紧加密市场条件。	ドル高、金利変動の増加、株式市場のストレスは、暗号資産の環境を厳しくすることが多いです。
Falling macro stress with stable on-chain demand can create cleaner trend continuation.	宏观压力下降且链上需求稳定，可能支持更健康的趋势延续。	マクロストレスの低下とオンチェーン需要の安定は、より健全なトレンド継続を支え得ます。
This strategy prevents false optimism during macro-led drawdowns.	避免在宏观驱动的回撤中产生虚假乐观。	マクロ主導の下落局面での誤った楽観を防ぎます。
It also explains why crypto can fail to rally even when internal metrics improve.	也解释了内部指标改善时，加密资产为何仍可能不涨。	内部指標が改善しても暗号資産が上昇しない理由も説明します。
Narrative breadth and event risk	叙事广度与事件风险	テーマの広がりとイベントリスク
Pair dashboard metrics with the event calendar so regime changes are not misread as isolated data noise.	结合事件日历观察指标，避免将状态变化误读为孤立数据噪声。	指標とイベント日程を組み合わせ、局面の変化を単発のノイズと誤解しないようにします。
CPI, FOMC, ETF flow releases, exchange incidents, unlocks, token launches, and major regulatory headlines.	CPI、FOMC、ETF 资金流发布、交易所事件、解锁、代币发行与重大监管新闻。	CPI、FOMC、ETF 資金フロー、取引所事件、ロック解除、トークン発行、主要な規制ニュース。
Separate event shock from structural change by checking whether leverage, liquidity, and breadth confirm the move.	检查杠杆、流动性与广度是否同步确认，区分事件冲击与结构变化。	レバレッジ、流動性、広がりの裏付けを確認し、イベントの衝撃と構造変化を区別します。
Track whether the same narrative is spreading across majors, sectors, and on-chain activity.	观察同一叙事是否扩散至主流资产、板块与链上活动。	同じテーマが主要資産、セクター、オンチェーン活動に広がるかを追跡します。
A strong market absorbs bad news with limited leverage damage.	强势市场通常能消化坏消息，杠杆损伤有限。	強い市場は悪材料を吸収し、レバレッジへの影響も限定的です。
A weak market uses good news to exit, which is usually a warning.	弱势市场往往借利好退出，通常是警示信号。	弱い市場では好材料が退出の機会となり、警告を示すことが多いです。
Start with regime first, then check leverage, then confirm liquidity and breadth.	先判断市场状态，再检查杠杆，最后确认流动性与广度。	まず局面を判断し、次にレバレッジ、最後に流動性と広がりを確認します。
Do not let one bullish metric override worsening macro or crowded positioning.	不要让单项利好指标掩盖恶化的宏观环境或拥挤仓位。	単独の強気指標で、マクロ環境の悪化や混雑したポジションを無視しないでください。
Treat missing fields as unknown and say so explicitly in research output.	缺失字段视为未知，并在研究输出中明确标注。	欠損項目は不明とし、リサーチ結果に明記します。
Use the dashboard to write a market brief, not to generate a blind buy or sell command.	利用看板编写市场简报，避免盲目买卖。	ダッシュボードを市場レポートの作成に使い、根拠のない売買を避けます。
Long Term Holder Supply Ratio (pending source)	长期持有者供应比率（待接入来源）	長期保有者の供給比率（ソース未接続）
Dormancy Flow (pending source)	休眠流（待接入来源）	休眠フロー（ソース未接続）
Coin Days Destroyed (pending source)	币天销毁（待接入来源）	コイン日数破壊（ソース未接続）
LTH-SOPR (pending source)	LTH-SOPR（待接入来源）	LTH-SOPR（ソース未接続）
Coins > 5 years moved (pending source)	超过 5 年币龄的代币移动（待接入来源）	5年以上保有されたコインの移動（ソース未接続）
Coins > 10 years moved (pending source)	超过 10 年币龄的代币移动（待接入来源）	10年以上保有されたコインの移動（ソース未接続）
HODL waves distribution (pending source)	HODL 波分布（待接入来源）	HODL 波の分布（ソース未接続）
Low dormancy + rising active addresses => early accumulation phase	低休眠 + 活跃地址增长 → 早期积累阶段	低い休眠＋アクティブアドレス増加 → 初期蓄積局面
Old coins moving aggressively => late-cycle distribution signal	老币大量移动 → 周期后期分配信号	古いコインの大量移動 → サイクル後期の分配シグナル
S&P 500 below 200 day moving average	标普 500 低于 200 日均线	S&P 500 が200日移動平均を下回る
Yield curve inversion	收益率曲线倒挂	イールドカーブの逆転
VIX > 30	VIX > 30	VIX > 30
BTC price below Realized Price	BTC 价格低于已实现价格	BTC 価格が実現価格を下回る
MVRV Z-score below -1	MVRV Z 分数低于 -1	MVRV Z スコアが -1 未満
Fear and Greed index below 20	恐惧与贪婪指数低于 20	恐怖・強欲指数が20未満
Dormancy flow extremely low	休眠流极低	休眠フローが極めて低い
Active addresses rising	活跃地址增长	アクティブアドレスが増加
VIX above 30	VIX 高于 30	VIX が30超
S&P 500 drawdown above 20%	标普 500 回撤超过 20%	S&P 500 の下落率が20%超
Funding rate negative for extended period	资金费率持续为负	資金調達率が長期間マイナス
Missing BTC price or realized price	缺少 BTC 价格或已实现价格	BTC 価格または実現価格がありません
Missing MVRV Z-score	缺少 MVRV Z 分数	MVRV Z スコアがありません
Missing fear and greed index	缺少恐惧与贪婪指数	恐怖・強欲指数がありません
Missing dormancy flow	缺少休眠流	休眠フローがありません
Need 14-day active address history	需要 14 天活跃地址历史	14日分のアクティブアドレス履歴が必要です
7d average is rising	7 天均值上升	7日平均が上昇
7d average is not rising	7 天均值未上升	7日平均は上昇していません
Missing VIX	缺少 VIX	VIX がありません
Missing S&P 500 drawdown	缺少标普 500 回撤数据	S&P 500 の下落率がありません
Need at least 8 hourly funding points	至少需要 8 个小时资金费率数据点	最低8時間分の資金調達率データが必要です
SaaS / Data	SaaS / 数据	SaaS／データ
China / EM	中国 / 新兴市场	中国／新興市場
Industrial	工业	産業
Prediction	预测市场	予測市場
HL/DEX perp-led — not on Binance/CB spot yet	Hyperliquid / DEX 永续先行，尚未上 Binance / Coinbase 现货	Hyperliquid／DEX の無期限先物が先行。Binance／Coinbase 現物は未上場
Not on Binance spot yet	尚未上 Binance 现货	Binance 現物は未上場
Upbit KRW — Korean premium risk	Upbit 韩元现货 — 韩国溢价风险	Upbit KRW 現物 — 韓国プレミアムのリスク
Failed to load	加载失败	読み込みに失敗しました
Weekly snapshot fallback. Refresh with \`pnpm sync:oscillator\` when you want a new market read.	当前使用每周快照。需要最新行情时运行 \`pnpm sync:oscillator\` 刷新。	週次スナップショットを使用しています。新しい市場データは \`pnpm sync:oscillator\` で更新します。
`;
for (const row of playbookRows.trim().split('\n')) {
  const [en, zh, ja] = row.split('\t');
  copy[en] = [en, zh, ja];
}

const stackEn = `
Crypto card with rewards and trading benefits	提供奖励与交易权益的加密卡	還元と取引特典付きの暗号資産カード
Up to 5% cashback	最高 5% 返现	最大5%の還元
No annual fee	无年费	年会費無料
High cashback rate	高返现比例	高い還元率
Integrated with Bybit exchange	与 Bybit 交易所整合	Bybit 取引所との連携
Requires Bybit account	需要 Bybit 账户	Bybit アカウントが必要
Availability by region	可用性因地区而异	提供地域に制限あり
Visa debit card that earns crypto rewards on every purchase	每笔消费获得加密奖励的 Visa 借记卡	購入ごとに暗号資産の還元を受ける Visa デビットカード
Up to 4% back in crypto	最高 4% 加密资产返现	最大4%の暗号資産還元
High rewards rate	高奖励比例	高い還元率
Multiple crypto options	多种加密资产选择	複数の暗号資産に対応
Requires Coinbase account	需要 Coinbase 账户	Coinbase アカウントが必要
Limited availability	可用地区有限	利用地域に制限あり
Metal card with crypto cashback and premium benefits	提供加密返现与高级权益的金属卡	暗号資産還元とプレミアム特典付きのメタルカード
Varies by tier	依等级而异	ランクにより異なる
Netflix/Spotify rebates	Netflix / Spotify 返还	Netflix／Spotify の還元
Airport lounge access	机场贵宾厅权益	空港ラウンジ利用
High cashback	高返现	高い還元
CRO staking required	需要质押 CRO	CRO ステーキングが必要
Withdrawal limits	提现限额	出金上限
Virtual or physical card linked to Binance account	连接 Binance 账户的虚拟或实体卡	Binance アカウントに連動する仮想・物理カード
Up to 8% cashback	最高 8% 返现	最大8%の還元
Highest cashback potential	更高返现潜力	高い還元の可能性
No fees	无费用	手数料なし
Global acceptance	全球受理	世界で利用可能
BNB holding required for max rewards	最高奖励需要持有 BNB	最大還元には BNB 保有が必要
Regional restrictions	地区限制	地域制限
Ethereum ecosystem metrics and L2 analytics dashboard	Ethereum 生态指标与 L2 分析看板	Ethereum エコシステム指標と L2 分析ダッシュボード
Market data and economic indicators for crypto	加密行情数据与经济指标	暗号資産の市場データと経済指標
Advanced crypto charts and market analysis tools	高级加密图表与市场分析工具	高度な暗号資産チャートと市場分析ツール
Uniswap volume analytics by chain, version, and fee tier	按链、版本与费率分析 Uniswap 成交量	チェーン・バージョン・手数料別の Uniswap 出来高分析
Automated trading and analytics platform	自动化交易与分析平台	自動取引・分析プラットフォーム
Crypto data analysis and insights newsletter	加密数据分析与洞察通讯	暗号資産データ分析と考察のニュースレター
Track corporate and institutional crypto treasury holdings	跟踪企业与机构加密储备持仓	企業・機関の暗号資産財務保有を追跡
Top companies holding Bitcoin in their treasury	比特币储备持仓领先企业	ビットコインを財務資産として保有する主要企業
Ethereum strategic reserve tracking and analytics	Ethereum 战略储备跟踪与分析	Ethereum 戦略準備金の追跡・分析
DeFi protocols analysis and market reports	DeFi 协议分析与市场报告	DeFi プロトコル分析と市場レポート
Leading crypto media and education platform for the bankless revolution	面向无银行化金融的加密媒体与教育平台	銀行に依存しない金融を扱う暗号資産メディア・教育プラットフォーム
Comprehensive cross-chain analytics platform for tracking protocol metrics and market data	跟踪协议指标与行情数据的跨链分析平台	プロトコル指標と市場データを追跡するクロスチェーン分析プラットフォーム
Perpetual DEX trading volume analytics across Hyperliquid, Lighter, Aster and other major platforms	分析 Hyperliquid、Lighter、Aster 等主要永续 DEX 成交量	Hyperliquid、Lighter、Aster など主要な無期限先物 DEX の出来高分析
On-chain analytics platform with smart money tracking and wallet insights	支持聪明钱跟踪与钱包洞察的链上分析平台	スマートマネーの追跡とウォレット分析に対応するオンチェーン分析プラットフォーム
Crypto protocol financial metrics and revenue analytics dashboard	加密协议财务指标与收入分析看板	暗号資産プロトコルの財務指標と収益分析ダッシュボード
Track companies and institutions holding crypto in their treasuries	跟踪持有加密储备的企业与机构	暗号資産を財務保有する企業・機関を追跡
Monitor CCTP USDC cross-chain transfers and flow analytics across different blockchains	监测各链 CCTP USDC 跨链转账与资金流	各チェーンの CCTP USDC クロスチェーン送金と資金フローを観察
Daily Bitcoin, Ethereum, and SOL ETF fund flow tracking and analytics	每日 BTC、ETH 与 SOL ETF 资金流跟踪与分析	BTC・ETH・SOL ETF の日次資金フロー追跡・分析
Hyperliquid protocol metrics tracking including staking, buybacks, auctions, and burns	跟踪 Hyperliquid 质押、回购、拍卖与销毁等协议指标	Hyperliquid のステーキング、買い戻し、オークション、バーンなどの指標を追跡
Hyperliquid ecosystem dashboard tracking HLP staking yields, trading fees, auction fees, and TSWAP auctions	跟踪 HLP 质押收益、交易费、拍卖费与 TSWAP 拍卖的 Hyperliquid 生态看板	HLP 利回り、取引手数料、オークション手数料、TSWAP を追跡する Hyperliquid ダッシュボード
Crypto developer activity ranking and analytics tracking project development metrics	加密开发者活跃度排名与项目开发指标分析	暗号資産開発者の活動ランキングと開発指標の分析
On-chain analytics for Robinhood stock tokens tracking volume and activity	跟踪 Robinhood 股票代币成交量与活动的链上分析	Robinhood 株式トークンの出来高・活動を追跡するオンチェーン分析
Comprehensive stablecoin ecosystem analytics tracking issuance, yields, RWA returns, and market dynamics	跟踪发行、收益率、RWA 回报与行情的稳定币生态分析	発行、利回り、RWA リターン、市場動向を追跡するステーブルコイン分析
Comprehensive map of prediction markets tracking platforms and trading activity	跟踪预测市场平台与交易活动的全景图	予測市場のプラットフォームと取引活動を追跡する全体マップ
Comprehensive Japanese grammar reference and learning resource	完整日语语法参考与学习资源	日本語文法の詳しい参考資料と学習リソース
Complete guide for learning Japanese language from basics to advanced	从入门到进阶的完整日语学习指南	基礎から上級までの日本語学習ガイド
Comprehensive Japanese native dictionary with extensive definitions and examples	收录丰富释义与例句的日语原生词典	豊富な定義と用例を持つ日本語辞典
Curated crypto reading list and resources by Dan Romero	Dan Romero 精选加密阅读列表与资源	Dan Romero による暗号資産の厳選記事と資料
Andreessen Horowitz crypto research, insights, and industry analysis	Andreessen Horowitz 加密研究、洞察与行业分析	Andreessen Horowitz の暗号資産リサーチ・考察・業界分析
Crypto newsletter and analysis covering market trends and insights	涵盖市场趋势与洞察的加密通讯与分析	市場トレンドと考察を扱う暗号資産ニュースレター・分析
Comprehensive guide for relocating and immigrating to Japan	日本移居与移民完整指南	日本への移住に関する総合ガイド
Community for Web3 and AI-focused digital nomads	面向 Web3 与 AI 数字游民的社区	Web3・AI を中心とするデジタルノマドのコミュニティ
World's largest digital nomad community and resource hub	全球大型数字游民社区与资源中心	世界規模のデジタルノマドコミュニティと情報拠点
Niche digital nomad platform for building new societies and communities	面向新型社会与社区建设的数字游民平台	新たな社会とコミュニティを構築するデジタルノマド向けプラットフォーム
Magazine covering governance, technology, and society for digital nomads	面向数字游民、涵盖治理、技术与社会的杂志	デジタルノマド向けのガバナンス・技術・社会を扱う雑誌
AI-powered travel planning agent for creating personalized trip itineraries	生成个性化行程的 AI 旅行规划 Agent	個人に合わせた旅程を作る AI 旅行計画エージェント
Advanced AI assistant by Anthropic for coding and analysis	Anthropic 推出的高级编程与分析 AI 助手	Anthropic のプログラミング・分析向け AI アシスタント
Code generation	代码生成	コード生成
Code review	代码审查	コードレビュー
Long context	长上下文	長いコンテキスト
Analysis	分析	分析
AI-powered full-stack web development in the browser	浏览器内的 AI 全栈 Web 开发	ブラウザ内での AI フルスタック Web 開発
Full-stack development	全栈开发	フルスタック開発
Instant deployment	即时部署	即時デプロイ
AI coding	AI 编程	AI プログラミング
Browser IDE	浏览器 IDE	ブラウザ IDE
AI-powered UI generator by Vercel	Vercel 推出的 AI 界面生成器	Vercel の AI UI ジェネレーター
Component generation	组件生成	コンポーネント生成
Google's multimodal AI assistant for research and productivity	Google 多模态研究与效率 AI 助手	調査と生産性を支援する Google のマルチモーダル AI
Multimodal AI	多模态 AI	マルチモーダル AI
Real-time info	实时信息	リアルタイム情報
Integration	集成	連携
AI-powered crypto research and analysis assistant	AI 加密研究与分析助手	AI による暗号資産リサーチ・分析アシスタント
Crypto research	加密研究	暗号資産リサーチ
Market analysis	市场分析	市場分析
On-chain data	链上数据	オンチェーンデータ
Insights	洞察	考察
AI writing assistant integrated in Notion	集成在 Notion 中的 AI 写作助手	Notion に統合された AI 執筆アシスタント
Writing assistance	写作辅助	執筆支援
Summarization	摘要	要約
Translation	翻译	翻訳
AI-powered writing and thinking tool for content creation	用于内容创作的 AI 写作与思考工具	コンテンツ制作向け AI 執筆・思考ツール
Brainstorming	头脑风暴	ブレインストーミング
Content generation	内容生成	コンテンツ生成
Mindmapping	思维导图	マインドマップ
Versatile AI assistant by OpenAI	OpenAI 多用途 AI 助手	OpenAI の汎用 AI アシスタント
Conversation	对话	会話
Plugins	插件	プラグイン
metrics	指标	指標
ecosystem	生态	エコシステム
market data	行情数据	市場データ
indicators	指标	指標
price	价格	価格
volume	成交量	出来高
charts	图表	チャート
analysis	分析	分析
technical	技术分析	テクニカル分析
trading	交易	取引
analytics	数据分析	データ分析
automation	自动化	自動化
bot	机器人	ボット
newsletter	通讯	ニュースレター
research	研究	リサーチ
insights	洞察	考察
treasury	储备	財務保有
institutional	机构	機関
holdings	持仓	保有
corporate	企业	企業
companies	公司	企業
reserve	储备	準備金
tracking	跟踪	追跡
data	数据	データ
chinese	中文	中国語
reports	报告	レポート
protocols	协议	プロトコル
news	新闻	ニュース
education	教育	教育
podcast	播客	ポッドキャスト
cross-chain	跨链	クロスチェーン
perp	永续	無期限先物
derivatives	衍生品	デリバティブ
on-chain	链上	オンチェーン
smart-money	聪明钱	スマートマネー
wallet-tracking	钱包跟踪	ウォレット追跡
revenue	收入	収益
fundamentals	基本面	ファンダメンタルズ
stablecoin	稳定币	ステーブルコイン
transfers	转账	送金
fund-flow	资金流	資金フロー
buybacks	回购	買い戻し
staking	质押	ステーキング
auctions	拍卖	オークション
burns	销毁	バーン
protocol	协议	プロトコル
yields	收益率	利回り
fees	费用	手数料
developer	开发者	開発者
activity	活动	活動
ranking	排名	ランキング
stocks	股票	株式
tokenized-assets	代币化资产	トークン化資産
issuance	发行	発行
prediction-markets	预测市场	予測市場
betting	投注	ベッティング
map	地图	マップ
japanese	日语	日本語
grammar	语法	文法
learning	学习	学習
reference	参考	参考資料
guide	指南	ガイド
tutorial	教程	チュートリアル
dictionary	词典	辞典
native	原生	ネイティブ
definitions	释义	定義
reading	阅读	読書
resources	资源	リソース
curated	精选	厳選
trends	趋势	トレンド
japan	日本	日本
immigration	移民	移住
visa	签证	ビザ
relocation	移居	転居
digital-nomad	数字游民	デジタルノマド
community	社区	コミュニティ
network	网络	ネットワーク
travel	旅行	旅行
remote-work	远程工作	リモートワーク
network-state	网络国家	ネットワーク国家
startup-cities	新型城市	新たな都市
magazine	杂志	雑誌
governance	治理	ガバナンス
technology	技术	技術
society	社会	社会
planning	规划	計画
itinerary	行程	旅程
agent	Agent	エージェント
`;
for (const row of stackEn.trim().split('\n')) {
  const [en, zh, ja] = row.split('\t');
  copy[en] = [en, zh, ja];
}

const stackZh = `
社会心理学（插图第七版）	Social Psychology (Illustrated 7th Edition)	社会心理学（図解第7版）
深入浅出地讲解社会心理学原理，适合产品经理和商业从业者理解用户行为	An accessible introduction to social psychology for product managers and business practitioners seeking to understand user behavior.	社会心理学の原理をわかりやすく解説。製品担当者やビジネス実務者によるユーザー行動の理解に役立ちます。
社会心理学	Social psychology	社会心理学
产品经理第一本书	Product management primer	製品マネジメント入門
第一本经济学	An Introduction to Economics	はじめての経済学
通俗讲解经济学基础知识，帮助读者建立经济思维框架	An accessible economics primer that helps readers build an economic thinking framework.	経済学の基礎をわかりやすく解説し、経済的な思考の枠組みを築きます。
经济学入门	Economics primer	経済学入門
学会提问	Asking the Right Questions	正しい問いを立てる
教你如何分析信息的真伪，提高独立思考能力	Learn to evaluate information and improve independent thinking.	情報の真偽を評価し、独立して考える力を高めます。
批判性思维	Critical thinking	批判的思考
信息辨别	Information literacy	情報リテラシー
认知心理学及其启示（第8版）	Cognitive Psychology and Its Implications (8th Edition)	認知心理学とその示唆（第8版）
讲解人类如何处理信息、学习、记忆和做决策	Explains how people process information, learn, remember, and make decisions.	人が情報を処理し、学習・記憶・意思決定を行う仕組みを解説します。
认知心理学	Cognitive psychology	認知心理学
思维机制	Thinking mechanisms	思考の仕組み
思考，快与慢	Thinking, Fast and Slow	ファスト＆スロー
提出系统1（直觉）与系统2（理性）两种思维模式，解析人类决策的缺陷	Introduces System 1 (intuition) and System 2 (reasoning), exploring flaws in human decision-making.	システム1（直感）とシステム2（理性）を通じて、人の意思決定の弱点を探ります。
行为经济学	Behavioral economics	行動経済学
认知偏差	Cognitive biases	認知バイアス
超越智商	What Intelligence Tests Miss	知能検査では測れないもの
讨论为什么智商高并不等于决策能力强，如何克服认知缺陷	Explores why high IQ does not guarantee good decisions and how to overcome cognitive limitations.	高い IQ が優れた意思決定を保証しない理由と、認知の限界を克服する方法を探ります。
理性决策	Rational decisions	合理的な意思決定
认知误区	Cognitive pitfalls	認知の落とし穴
思维与决策（第四版）	Thinking and Deciding (4th Edition)	思考と意思決定（第4版）
全面介绍思维与决策领域的核心理论	A comprehensive introduction to core theories of thinking and decision-making.	思考と意思決定の主要理論を幅広く紹介します。
决策科学	Decision science	意思決定科学
系统思考	Systems thinking	システム思考
经济学原理（微观分册）（第8版）	Principles of Economics: Microeconomics (8th Edition)	経済学の原理：ミクロ経済学（第8版）
全球最广泛使用的经济学入门教材之一	One of the world's most widely used introductory economics textbooks.	世界で広く使われている経済学入門教科書の一つです。
经济学基础	Economics fundamentals	経済学の基礎
经典教材	Classic textbook	定番の教科書
错误的行为	Misbehaving	行動経済学の逆襲
行为经济学是产品经理最需要理解的经济学分支	Behavioral economics is a particularly important branch of economics for product managers.	行動経済学は製品担当者にとって特に重要な経済学の分野です。
新制度经济学：一个交易费用分析范式	New Institutional Economics: A Transaction-Cost Framework	新制度派経済学：取引費用の分析枠組み
从交易费用角度理解制度、市场和商业模式的运作	Understand institutions, markets, and business models through transaction costs.	取引費用の視点から、制度、市場、ビジネスモデルの仕組みを理解します。
交易费用理论	Transaction-cost theory	取引費用理論
商业模式	Business models	ビジネスモデル
乌合之众	The Crowd	群衆心理
研究群体如何影响个体行为和决策	Examines how crowds shape individual behavior and decisions.	集団が個人の行動と意思決定に与える影響を考察します。
群体心理学	Crowd psychology	群衆心理学
影响力	Influence	影響力
解析如何影响和改变他人的决策	Explores how to influence and change others' decisions.	他者の意思決定に影響を与える方法を解説します。
行为心理学	Behavioral psychology	行動心理学
说服力	Persuasion	説得力
主权个人	The Sovereign Individual	主権を持つ個人
探讨信息时代对个人、国家和财富的影响	Explores the information age's effects on individuals, states, and wealth.	情報時代が個人、国家、富に与える影響を探ります。
未来趋势	Future trends	未来のトレンド
个人自由	Individual freedom	個人の自由
无限游戏	The Infinite Game	無限のゲーム
区分短期竞争与长期游戏，强调可持续发展	Distinguishes short-term competition from long-term play, emphasizing sustainability.	短期的な競争と長期的なゲームを区別し、持続性を重視します。
战略思维	Strategic thinking	戦略的思考
长期主义	Long-term thinking	長期的な視点
从优秀到卓越	Good to Great	ビジョナリー・カンパニー2
分析企业如何实现长期成功	Analyzes how companies achieve lasting success.	企業が長期的な成功を実現する方法を分析します。
企业成长	Business growth	企業の成長
组织管理	Organization management	組織マネジメント
基业长青	Built to Last	ビジョナリー・カンパニー
研究企业如何保持长期竞争力	Studies how companies sustain long-term competitiveness.	企業が長期的な競争力を維持する方法を研究します。
企业长青法则	Enduring companies	持続する企業
指数型组织	Exponential Organizations	指数関数的な組織
讲解如何构建指数级增长的企业	Explains how to build companies capable of exponential growth.	指数関数的な成長を実現する企業の構築方法を解説します。
数字化增长	Digital growth	デジタル成長
组织创新	Organizational innovation	組織の革新
海星与蜘蛛	The Starfish and the Spider	ヒトデとクモ
对比去中心化与传统组织模式的优劣势	Compares the strengths and weaknesses of decentralized and traditional organizations.	分散型組織と従来型組織の利点・欠点を比較します。
去中心化管理	Decentralized management	分散型マネジメント
组织架构	Organization design	組織設計
精益创业	The Lean Startup	リーン・スタートアップ
强调快速试错、数据驱动优化	Emphasizes rapid experimentation and data-driven improvement.	迅速な試行錯誤とデータに基づく改善を重視します。
创业方法论	Startup methodology	起業の方法論
俞军产品方法论	Yu Jun's Product Methodology	兪軍の製品開発方法論
介绍产品经理的核心思维方式	Introduces core thinking patterns for product managers.	製品担当者の基本的な思考方法を紹介します。
互联网产品思维	Digital product thinking	デジタル製品の思考
用户增长	User growth	ユーザー成長
炼金术	Alchemy	アルケミー
用非线性思维看待市场和消费者心理	Uses nonlinear thinking to explore markets and consumer psychology.	非線形的な思考で市場と消費者心理を考察します。
营销心理学	Marketing psychology	マーケティング心理学
王慧文清华产品课（Allen修订版）	Wang Huiwen's Tsinghua Product Course (Allen Revision)	王慧文の清華大学製品講義（Allen 改訂版）
清华大学产品课程精华，系统讲解产品思维	A condensed Tsinghua University course that systematically explains product thinking.	清華大学の製品講義の要点をまとめ、製品思考を体系的に解説します。
产品思维	Product thinking	製品思考
互联网	Internet	インターネット
启示录	Inspired	INSPIRED
硅谷产品团队的创新思维	Innovation practices from Silicon Valley product teams.	シリコンバレーの製品チームによる革新的な思考。
产品设计	Product design	製品設計
用户体验	User experience	ユーザー体験
史蒂夫·乔布斯传	Steve Jobs	スティーブ・ジョブズ
讲解乔布斯的管理、设计和产品哲学	Explores Jobs's philosophy of management, design, and products.	Jobs の経営、デザイン、製品に関する哲学を探ります。
企业家精神	Entrepreneurship	起業家精神
创新思维	Innovative thinking	革新的な思考
简约至上	Simple and Usable	シンプルで使いやすいデザイン
探讨极简设计法则	Explores principles of minimalist design.	ミニマルなデザインの原則を探ります。
设计哲学	Design philosophy	デザイン哲学
失控	Out of Control	アウト・オブ・コントロール
分析互联网、自组织系统等如何推动社会变革	Analyzes how the internet and self-organizing systems drive social change.	インターネットや自己組織化システムによる社会変革を分析します。
复杂系统	Complex systems	複雑系
科技发展	Technology development	技術の発展
金字塔原理	The Pyramid Principle	考える技術・書く技術
讲解如何清晰表达观点，提高沟通效率	Explains how to communicate ideas clearly and efficiently.	考えを明確に伝え、コミュニケーションを効率化する方法を解説します。
逻辑表达	Logical expression	論理的な表現
故事力	Storytelling	ストーリーテリング
如何通过讲故事提升沟通和说服力	Use storytelling to strengthen communication and persuasion.	物語を使ってコミュニケーションと説得力を高めます。
叙事能力	Narrative skills	物語を伝える力
游戏化实战	Actionable Gamification	実践ゲーミフィケーション
用游戏元素驱动用户行为	Use game elements to motivate user behavior.	ゲームの要素でユーザー行動を促します。
游戏设计	Game design	ゲームデザイン
激励机制	Incentive design	インセンティブ設計
佛畏系统	Hooked	Hooked
讲解如何设计让用户上瘾的产品	Explains how to design habit-forming products.	ユーザーの習慣となる製品を設計する方法を解説します。
行为设计	Behavioral design	行動デザイン
用户习惯	User habits	ユーザーの習慣
加密货币数据、分析和研究平台	Crypto data, analytics, and research platform.	暗号資産のデータ・分析・調査プラットフォーム。
`;
for (const row of stackZh.trim().split('\n')) {
  const [zh, en, ja] = row.split('\t');
  copy[zh] = [en, zh, ja];
}

const oscillatorRows = `
What is the Research Focus set?	什么是研究重点集？	リサーチ対象とは何ですか？
The focus set is a hand-curated watchlist of high-conviction altcoins that run through the full ALT/BTC cycle framework. Each name is scored, graded (S/A/B/F), and given an action label (Focus / Watch / Avoid) based on its oscillator position relative to historical cycle peaks.	重点集是人工精选的山寨币观察列表，使用完整 ALT/BTC 周期框架。根据相对历史高点的震荡指标位置，为各资产评分、评级（S/A/B/F）并标注重点关注、观察或回避。	リサーチ対象は、ALT/BTC のサイクル全体を評価する厳選アルトコインの監視リストです。過去のピークに対する位置に基づき、スコア、評価（S/A/B/F）、行動区分（重点観察・観察・回避）を付けます。
What do the grades mean?	评级代表什么？	評価の意味は何ですか？
S = outperforming BTC this cycle. A = structurally strong oscillator. B = not yet confirmed, worth tracking. F = failed or still in decline — avoid until structure improves.	S：本轮跑赢 BTC；A：震荡结构强势；B：尚未确认、值得跟踪；F：失效或仍在下跌，等待结构改善。	S：今サイクルで BTC より優位。A：構造が強い。B：未確認だが追跡価値あり。F：不成立または下落継続。構造が改善するまで回避。
What is Veteran vs Single-Cycle?	跨周期与单周期有什么区别？	複数サイクルと単一サイクルの違いは？
Veteran coins have existed across multiple Bitcoin halving cycles and have historical peak data to compare against. Single-Cycle names only have data from the current or most recent cycle, so VS Last Top comparisons are not applicable.	跨周期资产经历多个比特币减半周期，可对比历史高点。单周期资产仅有当前或最近周期数据，不适用上轮高点比较。	複数サイクルの資産には、複数の半減期を通じた過去のピークデータがあります。単一サイクル資産は現在または直近のデータのみのため、前回ピークとの比較は適用されません。
How often does this data update?	这些数据多久更新一次？	データの更新頻度は？
The focus set updates weekly via a snapshot refresh. Short-term price moves between refreshes will not be reflected immediately.	重点集通过快照每周更新，刷新之间的短期价格变动不会立即反映。	重点観察対象は週次スナップショットで更新します。更新間の短期的な価格変動は即座には反映されません。
What is Altcoin Breadth?	什么是山寨币市场广度？	アルトコイン市場の広がりとは？
The breadth table covers the top ~500 altcoins from CoinGecko and CoinMarketCap (after removing BTC and stablecoins). It gives a market-wide view of how alts are performing relative to BTC.	广度表覆盖 CoinGecko 与 CoinMarketCap 约前 500 名山寨币（剔除 BTC 和稳定币），观察全市场相对 BTC 的表现。	市場の広がりの表は、CoinGecko と CoinMarketCap の上位約500アルトコイン（BTC とステーブルコインを除く）を対象に、BTC に対する市場全体の成績を示します。
What does the Research tag mean in the table?	表格中的研究标签代表什么？	表のリサーチタグの意味は？
Research-tagged coins are ones that appear in both this breadth universe and your current research pipeline (the focus set). It keeps content work and market monitoring connected in one view.	研究标签表示同时存在于市场广度集合和当前研究重点集中的资产，关联内容研究与行情观察。	リサーチタグは、市場全体の対象と現在の重点リサーチの両方に含まれる資産を示し、内容調査と市場観察を結び付けます。
What does Dual mean?	双榜代表什么？	両ランキングとは？
Dual means the token is ranked in the top 500 on both CoinGecko and CoinMarketCap simultaneously. Higher overlap between the two sources generally indicates better data quality and liquidity.	双榜表示同时进入 CoinGecko 与 CoinMarketCap 前 500 名。两个来源的重合度更高，通常意味着数据质量与流动性更好。	CoinGecko と CoinMarketCap の両方で上位500に入ることを示します。両ソースの重複が大きいほど、一般にデータ品質と流動性が良好です。
What is ALT/BTC and why does it matter?	什么是 ALT/BTC，为什么重要？	ALT/BTC とその重要性は？
ALT/BTC is the exchange rate between an altcoin and Bitcoin. When ALT/BTC is rising, the altcoin is outperforming BTC. USD price is influenced by BTC movements — ALT/BTC strips that out to show real relative strength.	ALT/BTC 是山寨币与比特币的汇率。汇率上升代表山寨币跑赢 BTC；相比受 BTC 影响的美元价格，ALT/BTC 更直接展示相对强弱。	ALT/BTC はアルトコインとビットコインの交換比率です。上昇は BTC に対する優位を示します。BTC の値動きに影響されるドル価格と比べ、相対的な強さを直接表します。
What is the Market Heat Score?	什么是市场热度评分？	市場過熱度スコアとは？
A weighted composite score from 0 to 100 combining 13 on-chain, sentiment, and market indicators. 0 = Extreme Fear (historically the best accumulation windows). 100 = Extreme Greed (historically the best distribution windows).	综合 13 项链上、情绪与市场指标，形成 0–100 的加权评分。0 为极度恐惧，历史上偏向积累窗口；100 为极度贪婪，历史上偏向分配窗口。	13のオンチェーン・心理・市場指標を加重した0〜100のスコアです。0は極度の恐怖で過去の蓄積局面、100は極度の強欲で過去の分配局面に対応します。
What is the difference between Daily Pulse and Weekly Structure?	日度脉搏与周度结构有什么区别？	日次の動向と週次の構造の違いは？
Daily Pulse (4 indicators, 32 pts) tracks fast-moving signals like ETF flows, funding rates, and sentiment. Weekly Structure (9 indicators, 68 pts) tracks slow-moving on-chain cycle signals like MVRV, NUPL, and SOPR. Weekly indicators are weighted heavier because they have a better track record for identifying cycle extremes.	日度脉搏（4 项、32 分）跟踪 ETF 资金流、资金费率与情绪等快速信号；周度结构（9 项、68 分）跟踪 MVRV、NUPL、SOPR 等慢速链上周期指标。周度指标在历史周期极值识别方面表现更好，因此权重更高。	日次（4指標・32点）は ETF フロー、資金調達率、心理など速いシグナルを追跡します。週次（9指標・68点）は MVRV、NUPL、SOPR など遅いサイクル指標を追跡します。過去のサイクル極値の検出実績から、週次指標の重みを大きくしています。
How should I use this score?	如何使用这个评分？	スコアの使い方は？
Use the score as one input among many, not as a trading signal. Low scores suggest the market is undervalued and fearful — historically better times to accumulate. High scores suggest the market is overheated — historically better times to reduce exposure. Always DCA rather than going all-in.	将评分作为众多研究输入之一。低分提示低估与恐惧，历史上更适合积累；高分提示过热，历史上更适合降低敞口。采用分批策略，避免一次性满仓。	多くの判断材料の一つとして使います。低スコアは割安と恐怖、高スコアは過熱を示唆します。過去にはそれぞれ蓄積・リスク縮小に適した局面でした。一括投入ではなく分割購入を行います。
How often does this data refresh?	热度数据多久刷新一次？	過熱度データの更新頻度は？
BTC Heat data is fetched live on every page visit from the Day1Global API. Daily indicators can shift within hours. Weekly on-chain indicators typically move over days to weeks.	每次访问页面时从 Day1Global API 获取实时 BTC 热度数据。日度指标可在数小时内变化，周度链上指标通常在数天至数周间变化。	ページ訪問ごとに Day1Global API から BTC 過熱度を取得します。日次指標は数時間、週次オンチェーン指標は数日〜数週間で変化します。
ETF Daily Net Flow	ETF 每日资金流	ETF の日次フロー
Funding Rate	资金费率	資金調達率
Long/Short Ratio	多空比	ロング・ショート比率
Fear & Greed Index	恐惧与贪婪指数	恐怖・強欲指数
LTH Supply %	长期持有者供应占比	長期保有者の供給比率
365D MA Ratio	365 日均线比率	365日移動平均比率
200W MA Multiplier	200 周均线倍数	200週移動平均倍率
Weekly RSI	周线 RSI	週足 RSI
Volume Change	成交量变化	出来高の変化
Net daily USD flow into spot Bitcoin ETFs (e.g. BlackRock IBIT, Fidelity FBTC). Large inflows signal institutional buying pressure; large outflows signal selling.	比特币现货 ETF 的每日美元净资金流（例如 BlackRock IBIT、Fidelity FBTC）。大量流入提示机构买压，大量流出提示卖压。	ビットコイン現物 ETF（BlackRock IBIT、Fidelity FBTC など）の日次ドル純フロー。大きな流入は機関の買い圧力、大きな流出は売り圧力を示します。
Periodic payment between longs and shorts in perpetual futures. Positive = longs pay shorts (bullish bias). Negative = shorts pay longs (bearish). High positive rates indicate crowded long positions.	永续合约多空双方的定期支付。正费率为多头支付空头，负费率为反向支付。高正费率提示多头拥挤。	無期限先物のロング・ショート間の定期的な支払い。正はロングが支払い、負はショートが支払います。高い正の率はロングの混雑を示します。
Ratio of long to short positions on major exchanges. Above 1.0 = more longs. Extreme long crowding (>2.0) is vulnerable to liquidation cascades.	主要交易所多空仓位比率。高于 1 表示多头更多；高于 2 的极端多头拥挤可能触发连锁清算。	主要取引所のロング・ショート比率。1超はロングが多く、2超の極端な混雑は連鎖清算に弱い状態です。
Composite sentiment index (0–100) aggregating volatility, volume, social media, surveys, dominance, and Google Trends. <15 = extreme fear; >80 = extreme greed.	综合波动、成交量、社交媒体、调查、主导率和 Google Trends 的 0–100 情绪指数。低于 15 为极度恐惧，高于 80 为极度贪婪。	変動、出来高、ソーシャル、調査、ドミナンス、Google Trends を統合した0〜100の心理指数。15未満は極度の恐怖、80超は極度の強欲。
Market Value to Realized Value for Long-Term Holders (coins held >155 days). <1.0 means LTH are underwater — historically only seen at major cycle bottoms.	长期持有者（持币超过 155 天）的市值与已实现价值比。低于 1 表示长期持有者浮亏，历史上多见于主要周期底部。	155日超保有者の市場価値／実現価値比率。1未満は長期保有者の含み損を示し、過去には主要サイクルの底値で見られました。
Net Unrealized Profit/Loss = (Market Cap − Realized Cap) / Market Cap. Negative = network-wide losses (capitulation). >0.75 = euphoria (likely top).	净未实现损益 =（市值 - 已实现市值）/ 市值。负值表示全网络浮亏；高于 0.75 提示狂热与可能的顶部。	純未実現損益＝（時価総額－実現時価総額）／時価総額。負はネットワーク全体の損失、0.75超は熱狂と天井の可能性。
Spent Output Profit Ratio for Long-Term Holders. <1.0 means LTH are selling at a loss — extremely rare and a powerful bottom signal.	长期持有者的支出产出利润率。低于 1 表示长期持有者亏损出售，历史上罕见且构成较强底部信号。	長期保有者の使用済みアウトプット利益率。1未満は損失での売却で、過去には珍しい強い底値シグナルでした。
Spent Output Profit Ratio for Short-Term Holders (coins held <155 days). Persistently <1.0 means recent buyers are panic selling — a bear market signal.	短期持有者（持币少于 155 天）的支出产出利润率。持续低于 1 表示近期买家恐慌出售，是熊市信号。	155日未満保有者の使用済みアウトプット利益率。継続的な1未満は新規購入者の恐慌売りと弱気相場を示します。
Percentage of total BTC supply held by Long-Term Holders. High % = accumulation phase (coins in strong hands). Low % = distribution phase (coins moving to speculators). Inverted indicator.	长期持有者占 BTC 总供应比例。高比例表示积累，低比例表示向投机者分配。该指标反向计分。	BTC 総供給に占める長期保有者の比率。高い比率は蓄積、低い比率は投機家への分配。逆方向にスコア化します。
Current BTC price divided by its 365-day moving average. <1.0 means price is below the annual average — historically a bear market accumulation zone.	当前 BTC 价格除以 365 日均线。低于 1 表示价格低于年均值，历史上属于熊市积累区间。	BTC 価格を365日移動平均で割った値。1未満は年平均を下回り、過去には弱気相場の蓄積ゾーンでした。
Current BTC price divided by the 200-week moving average. The 200WMA has acted as the ultimate floor in every Bitcoin cycle. Ratios >3.5x have marked cycle tops.	当前 BTC 价格除以 200 周均线。200 周均线历史上曾充当周期底部参考，超过 3.5 倍曾出现在周期顶部。	BTC 価格を200週移動平均で割った値。200週線は過去のサイクルの底値参考となり、3.5倍超はピークで見られました。
14-period Relative Strength Index on the weekly chart. <30 = historically rare oversold levels seen only at major cycle bottoms. >80 = late-stage bull market tops.	周线 14 周期 RSI。低于 30 是历史上罕见的超卖状态，多见于周期底部；高于 80 提示牛市后期顶部。	週足の14期間 RSI。30未満は過去の主要底値で見られた珍しい売られ過ぎ、80超は強気相場後期のピーク。
Current 24h trading volume vs. 30-day average. Volume dry-up after a crash signals selling exhaustion. Extreme volume spikes after a rally can indicate a blow-off top.	当前 24 小时成交量与 30 天均值对比。暴跌后缩量提示卖盘耗竭，上涨后极端放量可能提示冲顶。	現在の24時間出来高と30日平均の比較。急落後の出来高減少は売りの枯渇、上昇後の急増は最終的な過熱を示唆します。
Extreme fear — historically a strong accumulation window. Consider building 60–80% of planned BTC allocation.	极度恐惧，历史上较强的积累窗口。可考虑建立计划 BTC 配置的 60–80%。	極度の恐怖。過去には強い蓄積機会でした。予定 BTC 配分の60〜80%の構築を検討。
Market is fearful and undervalued. Batch accumulation recommended (40–60% of allocation).	市场恐惧且低估，模型建议分批积累（计划配置的 40–60%）。	市場は恐怖と割安の状態。モデルは分割蓄積（予定配分の40〜60%）を示します。
Cool market with emerging opportunity. Begin building position (20–40% of allocation).	市场偏冷，机会开始出现。模型建议建立仓位（计划配置的 20–40%）。	市場は落ち着き、機会が現れ始めています。ポジション構築（予定配分の20〜40%）を示します。
Neutral sentiment. Hold current position and monitor for a directional shift.	情绪中性，保持当前仓位并观察方向变化。	心理は中立。現在のポジションを維持し、方向の変化を観察。
Market running hot. Tighten stops and consider trimming 10–20%.	市场偏热，收紧止损并考虑减仓 10–20%。	市場は過熱気味。ストップを厳しくし、10〜20%の縮小を検討。
Overheated — distribution phase likely. Gradually take profits, reduce to 40–60% of peak position.	市场过热，可能进入分配阶段。逐步止盈，降至峰值仓位的 40–60%。	過熱し、分配局面の可能性。段階的に利確し、最大ポジションの40〜60%に縮小。
Extreme greed — historic top signal. Aggressive profit-taking recommended, reduce to 20% or less.	极度贪婪，历史顶部信号。模型建议积极止盈，降至 20% 或以下。	極度の強欲。過去の天井シグナル。モデルは積極的な利確と20%以下への縮小を示します。
Single-cycle or newly listed asset with limited historical context. Keep it on the watchlist, but avoid hard conclusions for now.	单周期或新上市资产，历史背景有限。保留观察，暂不作确定结论。	単一サイクルまたは新規上場で、履歴が限られる資産です。監視を継続し、確定的な結論は避けます。
There is no reliable prior-cycle peak anchor, so this can only be used as a relative-strength watchlist name for now.	缺少可靠的上轮周期高点，目前仅作为相对强弱观察资产。	信頼できる前サイクルのピークがないため、現在は相対強度の観察対象としてのみ扱います。
(onboardDate) · Binance Spot / Upbit / Hyperliquid: presence-only. Prices from Binance 24hr mini-ticker. Fear & Greed from alternative.me. Global from CoinGecko.	（onboardDate）· Binance 现货 / Upbit / Hyperliquid 仅提供上市状态。价格来自 Binance 24 小时行情，恐惧贪婪来自 alternative.me，全球数据来自 CoinGecko。	（onboardDate）・Binance 現物／Upbit／Hyperliquid は上場の有無のみ。価格は Binance の24時間ティッカー、恐怖・強欲は alternative.me、世界データは CoinGecko。
e.g.	例如	例：
科技	Technology	技術
地缘	Geopolitics	地政学
政策	Policy	政策
`;
for (const row of oscillatorRows.trim().split('\n')) {
  const [en, zh, ja] = row.split('\t');
  copy[en] = [en, zh, ja];
}

const chineseRows = `
全部	All	すべて
入门	Getting started	入門
思维与决策	Thinking & decisions	思考と意思決定
经济学	Economics	経済学
认知升级	Cognition	認知の向上
战略管理	Strategic management	戦略マネジメント
创新产品	Product innovation	製品イノベーション
个人成长	Personal growth	自己成長
结构化思维	Structured thinking	構造的思考
游戏化	Gamification	ゲーミフィケーション
豆瓣	Douban	Douban
日报	Daily report	日次レポート
今日核心判断	Today's core view	本日の主要判断
宏观	Macro	マクロ
加密	Crypto	暗号資産
操作建议	Action guidance	行動指針
美股标的动态	US equity updates	米国株の動向
加密标的动态	Crypto asset updates	暗号資産の動向
地缘政治专题	Geopolitics	地政学
推荐阅读	Recommended reading	おすすめ記事
加密货币、宏观经济与 AI 科技领域的研究更新，覆盖核心判断 · 美股 · 加密 · 地缘 · 推荐阅读。	Research updates across crypto, macroeconomics and AI technology, covering core views, US stocks, crypto, geopolitics and recommended reading.	暗号資産、マクロ経済、AI 技術の調査更新。主要判断、米国株、暗号資産、地政学、おすすめ記事を扱います。
暂无周报内容。	No weekly reports yet.	週次レポートはまだありません。
世界杯 · 业务场景	World Cup · Use cases	ワールドカップ・活用場面
伤病 / 阵容	Injuries / Lineups	負傷・メンバー
赛程	Fixtures	試合日程
市场动态	Market dynamics	市場動向
内容选题	Content ideas	コンテンツの企画
影响：	Impact:	影響：
预测：	Prediction:	予測：
竞品 / 同行	Competitors / Peers	競合・同業者
活跃度	Activity	活動状況
叙事方向	Narratives	テーマ
热门帖	Top posts	人気の投稿
Mindshare 排行	Mindshare ranking	注目度ランキング
Meme / 情绪	Memes / Sentiment	ミーム・市場心理
市场情绪	Market sentiment	市場心理
本周 Meme	This week's meme	今週のミーム
可借用梗	Reusable meme ideas	活用できるミーム
热门 meme 帖	Top meme posts	人気のミーム投稿
风险预警	Risk alerts	リスク警告
本周暂无风险信号	No risk signals this week	今週のリスクシグナルはありません
详情	Details	詳細
今日 / 本周操作	Today / This week's actions	本日・今週の行動
今天发什么内容	What to publish today	本日公開するコンテンツ
本周跟进什么	What to follow this week	今週追跡する項目
叙事窗口期	Narrative opportunities	テーマの機会
本周加密情报 Top	This week's top crypto intelligence	今週の主要暗号資産情報
交易所动态	Exchange updates	取引所の動向
公链 / L1·L2	Blockchains / L1 · L2	ブロックチェーン・L1／L2
KOL / 媒体	KOLs / Media	KOL・メディア
科技	Technology	技術
地缘	Geopolitics	地政学
政策	Policy	政策
本周暂无数据	No data this week	今週のデータはありません
买入信号	Buy signals	買いシグナル
蹭热点	Trending topics	話題の活用
数据驱动	Data driven	データ主導
悬念制造	Build suspense	期待を高める
`;
for (const row of chineseRows.trim().split('\n')) {
  const [zh, en, ja] = row.split('\t');
  copy[zh] = [en, zh, ja];
}

export function translateDashboard<T>(value: T, locale: Locale): T {
  if (typeof value !== 'string') return value;
  const index = locale === 'zh-CN' ? 1 : locale === 'ja' ? 2 : 0;
  const direct = copy[value.trim()];
  if (direct) return direct[index] as T;
  const percentages = value.match(/-?\d+(?:\.\d+)?%/g);
  if (percentages) {
    const template = copy[value.replace(/-?\d+(?:\.\d+)?%/g, '{percent}')];
    if (template) {
      let position = 0;
      return template[index].replace(/\{percent\}/g, () => percentages[position++]) as T;
    }
  }
  const showing = value.match(/^Showing (\d+)(?:-(\d+))? of (\d+) (tracked|matched) altcoins(?: \((\d+) tracked\))?\.$/);
  if (showing && locale !== 'en') {
    const range = showing[2] ? `${showing[1]}–${showing[2]}` : showing[1];
    return (locale === 'zh-CN' ? `显示 ${range} / ${showing[3]} 个${showing[4] === 'matched' ? '匹配' : '跟踪'}资产${showing[5] ? `（共跟踪 ${showing[5]} 个）` : ''}。` : `${showing[3]}件中 ${range} を表示${showing[5] ? `（追跡対象 ${showing[5]}件）` : ''}。`) as T;
  }
  const asOf = value.match(/^ \(as of (.+)\)$/);
  if (asOf) return (locale === 'zh-CN' ? `（截至 ${asOf[1]}）` : locale === 'ja' ? `（${asOf[1]} 時点）` : value) as T;
  const days = value.match(/^(\d+) days ago$/);
  if (days) return (locale === 'zh-CN' ? `${days[1]} 天前` : locale === 'ja' ? `${days[1]}日前` : value) as T;
  const grade = value.match(/^([SABF]) Grade$/);
  if (grade) return (locale === 'zh-CN' ? `${grade[1]} 级` : locale === 'ja' ? `${grade[1]} 評価` : value) as T;
  const exchanges = value.match(/^(\d+) exchanges$/);
  if (exchanges) return (locale === 'zh-CN' ? `${exchanges[1]} 家交易所` : locale === 'ja' ? `${exchanges[1]}取引所` : value) as T;
  const yesExchanges = value.match(/^Yes \((\d+) exchanges\)$/);
  if (yesExchanges) return (locale === 'zh-CN' ? `是（${yesExchanges[1]} 家交易所）` : locale === 'ja' ? `はい（${yesExchanges[1]}取引所）` : value) as T;
  const current = value.match(/^Current (.+)$/);
  if (current) return (locale === 'zh-CN' ? `当前 ${translateDashboard(current[1], locale)}` : locale === 'ja' ? `現在 ${translateDashboard(current[1], locale)}` : value) as T;
  const lastFunding = value.match(/^Last 8h min=(.+)$/);
  if (lastFunding) return (locale === 'zh-CN' ? `最近 8 小时最低值=${lastFunding[1]}` : locale === 'ja' ? `直近8時間の最小値=${lastFunding[1]}` : value) as T;
  const sentimentValue = value.match(/^(\d+) \((.+)\)$/);
  if (sentimentValue) return `${sentimentValue[1]} (${translateDashboard(sentimentValue[2], locale)})` as T;
  const positive = value.match(/^(\d+) names are positive over (7|30) days, which helps gauge (short-term alt breadth|medium-term breadth expansion)\.$/);
  if (positive) return (locale === 'zh-CN' ? `${positive[1]} 个资产在 ${positive[2]} 天内上涨，用于观察${positive[2] === '7' ? '短期市场广度' : '中期广度扩张'}。` : locale === 'ja' ? `${positive[2]}日間で${positive[1]}資産が上昇し、${positive[2] === '7' ? '短期の市場の広がり' : '中期の広がりの拡大'}を確認します。` : value) as T;
  const ratioDown = value.match(/^The ratio is down ([\d.-]+%) (.+)$/);
  if (ratioDown && locale !== 'en') {
    const suffixes: Record<string, [string, string]> = {
      'and sits in the mid-decay zone. Neither a clean recovery nor full failure has finished playing out.': ['，处于中度衰退区。尚未确认明确修复或完全失效。', 'で、中程度の衰退ゾーンにあります。明確な回復も完全な不成立もまだ確認されていません。'],
      'from the prior cycle top. Structure is not broken yet, but it is still too close to the 5-year low for clean confirmation.': ['（相对上轮高点）。结构尚未破坏，但仍接近 5 年低点，确认不足。', '（前サイクルのピーク比）。構造はまだ破綻していませんが、5年間の底値に近く、明確な確認はできません。'],
      'versus the previous cycle top. The oscillator mechanism looks structurally broken.': ['（相对上轮高点），震荡机制可能已发生结构性破坏。', '（前サイクルのピーク比）。オシレーターの仕組みは構造的に破綻しているように見えます。'],
    };
    const suffix = suffixes[ratioDown[2]];
    if (suffix) return (locale === 'zh-CN' ? `汇率变动 ${ratioDown[1]}${suffix[0]}` : `比率の変動は ${ratioDown[1]}${suffix[1]}`) as T;
  }
  const perpOnly = value.match(/^Perp only \((.+)\) — no spot$/);
  if (perpOnly) return (locale === 'zh-CN' ? `仅永续（${perpOnly[1]}），无现货` : locale === 'ja' ? `無期限先物のみ（${perpOnly[1]}）、現物なし` : value) as T;
  const spotCount = value.match(/^Spot on (\d+) exchanges$/);
  if (spotCount) return (locale === 'zh-CN' ? `${spotCount[1]} 家交易所现货上市` : locale === 'ja' ? `${spotCount[1]}取引所で現物上場` : value) as T;
  if (value.includes(' · ')) return value.split(' · ').map(part => translateDashboard(part, locale)).join(' · ') as T;
  return value;
}

export function useDashboardI18n() {
  const i18n = useI18n();
  return { ...i18n, d: <T,>(value: T): T => translateDashboard(value, i18n.locale) };
}
