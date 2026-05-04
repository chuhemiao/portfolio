export interface Topic {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  whyItMatters: string;
  postCount: number;
  projectCount: number;
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
    postCount: 28,
    projectCount: 14,
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
    postCount: 22,
    projectCount: 12,
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
    postCount: 35,
    projectCount: 18,
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
    postCount: 40,
    projectCount: 20,
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
    postCount: 18,
    projectCount: 10,
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
    postCount: 15,
    projectCount: 8,
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
    postCount: 20,
    projectCount: 11,
    accentColor: '#22C55E',
    matchKeywords: ['yield', 'lending', 'staking', 'restaking', 'aave', 'compound', 'eigen', 'lido', 'liquidity'],
    relatedTypes: ['Lending', 'Yield'],
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
    postCount: 25,
    projectCount: 0,
    accentColor: '#F97316',
    matchKeywords: ['market structure', 'oscillator', 'btc dominance', 'cycle', 'macro', 'breadth', 'rotation', 'regime'],
    relatedTypes: [],
  },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
