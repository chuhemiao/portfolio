import type { Locale } from '@/lib/i18n';

export interface Topic {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  whyItMatters: string;
  accentColor: string;
  // Keywords used to filter blog posts by tag matching
  matchKeywords: string[];
  // Related research project types in research-client
  relatedTypes: string[];
}

export const TOPICS: Topic[] = [
  {
    slug: 'stablecoin',
    name: 'Stablecoin',
    emoji: '💵',
    tagline: 'Peg mechanics, yield, and systemic risk',
    description:
      'Algorithmic, collateralized, and hybrid stablecoin designs. Depeg events, yield opportunities, and macro implications across DeFi liquidity layers.',
    whyItMatters:
      'Stablecoins are the reserve currency of DeFi. Their design determines where capital flows, how risk is priced, and whether the broader system is fragile or resilient.',
    accentColor: '#10B981',
    matchKeywords: ['stablecoin', 'stable', 'usdt', 'usdc', 'dai', 'peg', 'depeg'],
    relatedTypes: ['Stablecoin'],
  },
  {
    slug: 'perp-dex',
    name: 'Perp DEX',
    emoji: '📈',
    tagline: 'On-chain perpetual futures market structure',
    description:
      'DEX perpetuals competing with CEX depth. Fee models, oracle design, liquidity pool mechanics, open interest dynamics, and the protocol economics behind on-chain derivatives.',
    whyItMatters:
      'Perpetual futures volume on-chain is growing faster than any other DeFi category. Understanding market structure here is essential for both traders and investors.',
    accentColor: '#6366F1',
    matchKeywords: ['perp', 'perpetual', 'futures', 'hyperliquid', 'gmx', 'dydx', 'vertex', 'drift'],
    relatedTypes: ['Perp DEX'],
  },
  {
    slug: 'cex',
    name: 'CEX',
    emoji: '🏛️',
    tagline: 'Exchange business models and listing intelligence',
    description:
      'Centralized exchange strategy, listing signal patterns, fee wars, proof of reserves, regulatory positioning, and volume attribution across major venues.',
    whyItMatters:
      'CEXs set the price discovery layer for the entire market. Their listing decisions are the clearest leading signal for altcoin narrative rotation.',
    accentColor: '#F59E0B',
    matchKeywords: ['cex', 'exchange', 'binance', 'coinbase', 'okx', 'bybit', 'listing', 'listings'],
    relatedTypes: ['CEX'],
  },
  {
    slug: 'l1-l2',
    name: 'L1 / L2',
    emoji: '⛓️',
    tagline: 'Chain competition and scaling architecture',
    description:
      'Layer-1 consensus design and Layer-2 rollup scaling. Ecosystem development, DeFi TVL, bridging infrastructure, and modular vs monolithic tradeoffs.',
    whyItMatters:
      'Chain selection is a multi-billion dollar bet every cycle. The winner-take-most dynamics of L1 are different from L2, and both require different analytical frameworks.',
    accentColor: '#8B5CF6',
    matchKeywords: ['l1', 'l2', 'solana', 'ethereum', 'arbitrum', 'base', 'optimism', 'rollup', 'chain', 'layer'],
    relatedTypes: ['L1', 'L2'],
  },
  {
    slug: 'ai-crypto',
    name: 'AI × Crypto',
    emoji: '🤖',
    tagline: 'AI infrastructure meets decentralized compute',
    description:
      'AI agents, decentralized training and inference markets, verifiable compute, and the intersection of machine learning systems with blockchain infrastructure.',
    whyItMatters:
      'AI infrastructure is absorbing the next wave of capital. Crypto networks provide the decentralized rails for compute, data, and model verification that centralized platforms cannot.',
    accentColor: '#0EA5E9',
    matchKeywords: ['ai', 'agent', 'llm', 'compute', 'inference', 'depin', 'bittensor', 'akash', 'render'],
    relatedTypes: ['AI', 'DePIN'],
  },
  {
    slug: 'rwa',
    name: 'RWA',
    emoji: '🏦',
    tagline: 'Real-world assets on-chain',
    description:
      'Tokenized treasuries, private credit, real estate, and the regulatory rails enabling institutional capital flows through blockchain settlement layers.',
    whyItMatters:
      'RWA is the bridge between TradFi and DeFi. The first $1T on-chain will come from tokenized real-world assets, and the protocols building that infrastructure are early.',
    accentColor: '#14B8A6',
    matchKeywords: ['rwa', 'real world', 'tokenized', 'treasury', 'credit', 'ondas', 'centrifuge', 'maple'],
    relatedTypes: ['RWA'],
  },
  {
    slug: 'yield',
    name: 'Yield',
    emoji: '🌾',
    tagline: 'DeFi yield sources and protocol economics',
    description:
      'Lending protocols, liquid staking, restaking, yield aggregators, and the protocol revenue mechanics that determine sustainable vs. mercenary capital.',
    whyItMatters:
      'Yield is the fundamental primitive of DeFi. Understanding where yield comes from, who bears the risk, and which protocols capture lasting value is the foundation of DeFi investing.',
    accentColor: '#22C55E',
    // 'liquidity' is generic market vocabulary rather than a yield concept, and it
    // alone matched 91% of the blog. The remaining keywords cover the topic.
    matchKeywords: ['yield', 'lending', 'staking', 'restaking', 'aave', 'compound', 'eigen', 'lido'],
    relatedTypes: ['Lending', 'Yield'],
  },
  {
    slug: 'robotics',
    name: 'Robotics',
    emoji: '🦾',
    tagline: 'Physical AI, humanoid robots, and embodied intelligence',
    description:
      'Humanoid robots, autonomous systems, and the convergence of physical AI with crypto incentive layers. From Boston Dynamics to on-chain robot coordination networks.',
    whyItMatters:
      'Physical AI is the next trillion-dollar compute layer. As robots become economically productive agents, crypto rails will govern their ownership, payments, and task coordination.',
    accentColor: '#64748B',
    matchKeywords: ['robot', 'robotics', 'humanoid', 'physical ai', 'embodied', 'autonomous', 'depin robot'],
    // The registry's `type` has no such sector: these projects sit under
    // AI/DePIN, so there is no honest count to derive. The page
    // falls back to its generic Research Map copy instead.
    relatedTypes: [],
  },
  {
    slug: 'quantum',
    name: 'Quantum',
    emoji: '⚛️',
    tagline: 'Quantum computing, cryptography threats, and post-quantum security',
    description:
      'Quantum computing progress, the threat to current cryptographic standards (ECDSA, RSA), and the race to post-quantum cryptography across blockchain networks.',
    whyItMatters:
      "Quantum computers capable of breaking ECDSA would compromise every existing blockchain's key security model. Post-quantum migration is a long-lead infrastructure risk every serious crypto investor needs to understand.",
    accentColor: '#A855F7',
    matchKeywords: ['quantum', 'post-quantum', 'cryptography', 'ecdsa', 'lattice', 'qkd', 'qubit'],
    // The registry's `type` has no such sector: these projects sit under
    // L1, L2, Infra and Lending, so there is no honest count to derive. The page
    // falls back to its generic Research Map copy instead.
    relatedTypes: [],
  },
  {
    slug: 'market-structure',
    name: 'Market Structure',
    emoji: '🔭',
    tagline: 'Oscillators, breadth, and macro cycle timing',
    description:
      'Altcoin cycle timing, BTC dominance patterns, sector rotation signals, and the quantitative framework driving positioning decisions across market regimes.',
    whyItMatters:
      'Most traders lose money not because they pick wrong assets but because they misread the macro cycle. Market structure analysis is the operating system for everything else.',
    accentColor: '#F97316',
    matchKeywords: ['market structure', 'oscillator', 'btc dominance', 'cycle', 'macro', 'breadth', 'rotation', 'regime'],
    relatedTypes: [],
  },
  {
    slug: 'tokenized-equities',
    name: 'Tokenized Equities',
    emoji: '🏷️',
    tagline: 'On-chain US stocks and what the token actually is',
    description:
      'Issuers, legal wrappers, custody and proof of reserve, redemption terms, trading hours against a closed underlying market, and the gap between headline volume and executable depth.',
    whyItMatters:
      'Most tokenized stocks are a claim on the issuer rather than the share. The same ticker can carry different collateral, redemption rights and bankruptcy recourse depending on who issued it, which makes identity — not price — the first thing to establish.',
    accentColor: '#E0A449',
    matchKeywords: ['tokenized stock', 'tokenized equity', 'xstocks', 'ondo', 'bstocks', 'securitize', 'superstate', 'dinari', 'rwa stock', '代币化股票', '链上美股'],
    // RWA is the nearest registry sector but counts 105 projects against the
    // ~28 that are tokenized equities, so no number is claimed here.
    relatedTypes: [],
  },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

const TOPIC_TRANSLATIONS: Record<string, { name: [string, string]; tagline: [string, string]; description: [string, string]; whyItMatters: [string, string] }> = {
  stablecoin: {
    name: ['稳定币', 'ステーブルコイン'],
    tagline: ['锚定机制、收益与系统风险', 'ペッグの仕組み、利回り、システムリスク'],
    description: ['研究算法、抵押和混合型稳定币设计，关注脱锚事件、收益机会，以及 DeFi 流动性层的宏观影响。', 'アルゴリズム型、担保型、ハイブリッド型の設計を研究。ペッグ乖離、利回り機会、DeFi の流動性とマクロへの影響を追います。'],
    whyItMatters: ['稳定币是 DeFi 的储备货币。其设计影响资金流向、风险定价和整个系统的稳定性。', 'ステーブルコインは DeFi の準備通貨です。設計が資金の流れ、リスク評価、システム全体の安定性を左右します。'],
  },
  'perp-dex': {
    name: ['永续合约 DEX', '無期限先物 DEX'],
    tagline: ['链上永续合约的市场结构', 'オンチェーン無期限先物の市場構造'],
    description: ['研究与中心化交易所竞争的永续合约 DEX，涵盖费率模型、预言机、流动性池、未平仓量与链上衍生品经济机制。', '中央集権型取引所と競う無期限先物 DEX を研究。手数料、オラクル、流動性プール、建玉、オンチェーンデリバティブの経済性を扱います。'],
    whyItMatters: ['链上永续合约交易量快速增长。理解其市场结构，是交易和投资决策的重要基础。', 'オンチェーン無期限先物の取引量は急速に成長しています。市場構造の理解は取引と投資の基礎です。'],
  },
  cex: {
    name: ['中心化交易所', '中央集権型取引所'],
    tagline: ['交易所商业模式与上币情报', '取引所のビジネスモデルと上場情報'],
    description: ['研究中心化交易所战略、上币信号、费率竞争、储备证明、监管定位和主要平台的交易量归因。', '取引所戦略、上場シグナル、手数料競争、準備金証明、規制への対応、主要市場の取引量を研究します。'],
    whyItMatters: ['中心化交易所承担市场价格发现。上币决策也是观察山寨币叙事轮动的重要信号。', '中央集権型取引所は市場の価格発見を担います。上場判断はアルトコインのテーマ変化を追う重要なシグナルです。'],
  },
  'l1-l2': {
    name: ['L1 / L2', 'L1 / L2'],
    tagline: ['公链竞争与扩容架构', 'チェーン間競争とスケーリング設計'],
    description: ['研究 Layer 1 共识与 Layer 2 Rollup 扩容，涵盖生态发展、DeFi TVL、跨链基础设施和模块化与单体架构取舍。', 'Layer 1 のコンセンサスと Layer 2 の Rollup を研究。エコシステム、DeFi TVL、ブリッジ、モジュラー型と一体型の設計を扱います。'],
    whyItMatters: ['每个周期的选链决策都涉及大量资本。L1 与 L2 的竞争格局不同，需要分别分析。', 'チェーン選択には各サイクルで多額の資本が関わります。L1 と L2 の競争は異なり、それぞれの分析が必要です。'],
  },
  'ai-crypto': {
    name: ['AI × Crypto', 'AI × Crypto'],
    tagline: ['AI 基础设施与去中心化算力', 'AI 基盤と分散型コンピューティング'],
    description: ['研究 AI Agent、去中心化训练与推理市场、可验证计算，以及机器学习与区块链基础设施的交集。', 'AI エージェント、分散型の学習・推論市場、検証可能な計算、機械学習とブロックチェーン基盤の接点を研究します。'],
    whyItMatters: ['AI 基础设施吸引新一轮资本。加密网络为算力、数据和模型验证提供去中心化基础设施。', 'AI 基盤に新たな資本が流入しています。暗号資産ネットワークは計算、データ、モデル検証のための分散型基盤を提供します。'],
  },
  rwa: {
    name: ['现实世界资产', '実世界資産'],
    tagline: ['现实世界资产上链', '実世界資産のオンチェーン化'],
    description: ['研究代币化国债、私人信贷、房地产，以及支持机构资金通过区块链结算的监管基础设施。', 'トークン化国債、プライベートクレジット、不動産、機関資金のブロックチェーン決済を支える規制基盤を研究します。'],
    whyItMatters: ['RWA 连接传统金融与 DeFi。资产代币化的增长取决于发行、合规和结算基础设施。', 'RWA は伝統金融と DeFi をつなぎます。資産トークン化の成長には発行、規制対応、決済基盤が必要です。'],
  },
  yield: {
    name: ['收益', '利回り'],
    tagline: ['DeFi 收益来源与协议经济机制', 'DeFi の利回り源とプロトコルの経済性'],
    description: ['研究借贷、流动性质押、再质押、收益聚合器，以及影响资金可持续性的协议收入机制。', 'レンディング、リキッドステーキング、リステーキング、利回りアグリゲーター、資金の持続性を左右する収益構造を研究します。'],
    whyItMatters: ['理解收益从何而来、谁承担风险、哪些协议能够持续捕获价值，是 DeFi 投资的基础。', '利回りの源、リスクの負担者、継続的に価値を獲得するプロトコルの理解は DeFi 投資の基礎です。'],
  },
  robotics: {
    name: ['机器人', 'ロボティクス'],
    tagline: ['物理 AI、人形机器人与具身智能', 'フィジカル AI、ヒューマノイド、身体性知能'],
    description: ['研究人形机器人、自主系统，以及物理 AI 与加密激励机制的结合，包括链上机器人协作网络。', 'ヒューマノイド、自律システム、フィジカル AI と暗号資産インセンティブ、オンチェーンのロボット協調ネットワークを研究します。'],
    whyItMatters: ['机器人逐步成为经济活动参与者，其所有权、支付与任务协作也需要新的基础设施。', 'ロボットが経済活動に参加するにつれ、所有権、決済、タスク調整の新たな基盤が必要になります。'],
  },
  quantum: {
    name: ['量子计算', '量子コンピューティング'],
    tagline: ['量子计算、密码学威胁与后量子安全', '量子計算、暗号技術への脅威、耐量子セキュリティ'],
    description: ['研究量子计算进展、对 ECDSA 和 RSA 等密码标准的威胁，以及区块链网络的后量子密码迁移。', '量子計算の進展、ECDSA や RSA への脅威、ブロックチェーンの耐量子暗号への移行を研究します。'],
    whyItMatters: ['能够破解 ECDSA 的量子计算机会威胁区块链密钥安全。后量子迁移周期较长，需要提前跟踪。', 'ECDSA を破る量子コンピューターはブロックチェーンの鍵の安全性を脅かします。耐量子移行には長い準備期間が必要です。'],
  },
  'tokenized-equities': {
    name: ['链上美股', 'オンチェーン米国株'],
    tagline: ['链上美股，以及你买的那个代币到底是什么', 'オンチェーン米国株と、そのトークンの正体'],
    description: ['研究发行方、法律包装、托管与储备证明、赎回条款、底层市场休市时的交易时段，以及名义成交量与可执行深度之间的差距。', '発行体、法的ラッパー、保管と準備金証明、償還条件、原市場が休場中の取引時間、そして名目出来高と執行可能な板の厚みの差を研究します。'],
    whyItMatters: ['大多数代币化股票是对发行方的债权，而不是股票本身。同一个代码在不同发行方手里，抵押品、赎回权和破产追索都不一样，所以首先要确认的是身份而不是价格。', 'トークン化株式の多くは株式ではなく発行体への請求権です。同じティッカーでも発行体により担保、償還権、破綻時の遡求が異なるため、まず確認すべきは価格ではなく正体です。'],
  },
  'market-structure': {
    name: ['市场结构', '市場構造'],
    tagline: ['震荡指标、市场广度与宏观周期', 'オシレーター、市場の広がり、マクロサイクル'],
    description: ['研究山寨币周期、BTC 市占率、板块轮动信号，以及不同市场环境下的量化仓位决策框架。', 'アルトコインのサイクル、BTC ドミナンス、セクターローテーション、相場環境別のポジショニング手法を研究します。'],
    whyItMatters: ['资产选择之外，宏观周期判断同样影响投资结果。市场结构分析为仓位和风险管理提供背景。', '銘柄選択に加え、マクロサイクルの判断も投資結果に影響します。市場構造の分析はポジションとリスク管理の背景を提供します。'],
  },
};

export function localizedTopic(topic: Topic, locale: Locale): Topic {
  const translation = TOPIC_TRANSLATIONS[topic.slug];
  if (!translation || locale === 'en') return topic;
  const t = (en: string, zh: string, ja: string) => locale === 'zh-CN' ? zh : locale === 'ja' ? ja : en;
  return { ...topic, name: t(topic.name, ...translation.name), tagline: t(topic.tagline, ...translation.tagline), description: t(topic.description, ...translation.description), whyItMatters: t(topic.whyItMatters, ...translation.whyItMatters) };
}
