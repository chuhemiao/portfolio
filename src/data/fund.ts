export type AssetCategory =
  | 'quality'
  | 'l1'
  | 'infra'
  | 'ai'
  | 'prediction'
  | 'web3-stock'
  | 'us-stock'
  | 'platform';

export type Asset = {
  name: string;
  ticker?: string;
  category: AssetCategory;
  description: string;
  link?: string;
};

export const philosophy = {
  intro:
    'For most people, ETFs may be a more suitable investment approach. The United States is approving more cryptocurrency ETFs, and the next market wave will still be crypto equities, stablecoins, and Perp DEX, with the market being gradually divided.',
  principle:
    'One principle: Hold BTC in bull markets, accumulate altcoins in bear markets. (Perhaps there are no more bull and bear markets, just volatility)',
  criteria:
    'Criteria for ETF selection: Favored by capitalists and institutions, has user base, has trading volume, team fundamentals are solid, REV value, no major bugs.',
  thought:
    'A thought: After large-scale cryptocurrencies and DAPPs emerge, what are the essential needs? RWA tokenization, stablecoin will be continue war.',
  lastUpdated: '2024/1/1 ~ 2026/02/12'
};

export const assets: Asset[] = [
  // Quality Crypto
  {
    name: 'Bitcoin',
    ticker: 'BTC',
    category: 'quality',
    description: 'Digital gold, the original cryptocurrency and store of value.'
  },
  {
    name: 'Ethereum',
    ticker: 'ETH',
    category: 'quality',
    description:
      'Programmable blockchain, the foundation for DeFi and smart contracts.'
  },
  {
    name: 'Hyperliquid',
    ticker: 'HYPE',
    category: 'quality',
    description: 'High-performance perpetuals DEX with on-chain order book.',
    link: 'https://app.hyperliquid.xyz/trade'
  },

  // L1
  {
    name: 'BNB',
    ticker: 'BNB',
    category: 'l1',
    description: 'Binance ecosystem L1, high throughput and low fees.'
  },
  {
    name: 'Solana',
    ticker: 'SOL',
    category: 'l1',
    description: 'High-speed L1 with growing DeFi and consumer app ecosystem.'
  },
  {
    name: 'SUI',
    ticker: 'SUI',
    category: 'l1',
    description: 'Move-based L1 with object-centric data model.'
  },
  {
    name: 'Canton',
    ticker: 'CC',
    category: 'l1',
    description: 'Privacy-enabled blockchain for institutional use cases.'
  },

  // Infrastructure
  {
    name: 'Chainlink',
    ticker: 'LINK',
    category: 'infra',
    description: 'Decentralized oracle network powering smart contract data.'
  },
  {
    name: 'Aave',
    ticker: 'AAVE',
    category: 'infra',
    description: 'Leading decentralized lending and borrowing protocol.'
  },
  {
    name: 'Sky',
    ticker: 'SKY',
    category: 'infra',
    description: 'Decentralized stablecoin infrastructure (formerly MakerDAO).'
  },
  {
    name: 'Uniswap',
    ticker: 'UNI',
    category: 'infra',
    description: 'The largest decentralized exchange protocol.'
  },
  {
    name: 'Maple',
    ticker: 'SYRUP',
    category: 'infra',
    description: 'Institutional DeFi lending protocol.'
  },

  // AI — top companies and assets worth holding 10+ years
  {
    name: 'Nvidia',
    ticker: 'NVDA',
    category: 'ai',
    description: 'Dominant AI chip maker, powering the entire AI infrastructure stack.'
  },
  {
    name: 'Microsoft',
    ticker: 'MSFT',
    category: 'ai',
    description: 'Azure AI + OpenAI partnership, enterprise AI leader with Copilot ecosystem.'
  },
  {
    name: 'Google',
    ticker: 'GOOGL',
    category: 'ai',
    description: 'DeepMind, Gemini models, and AI-first search transformation.'
  },
  {
    name: 'Anthropic',
    category: 'ai',
    description: 'Claude maker, frontier AI safety research lab. Not yet public.',
    link: 'https://www.anthropic.com/'
  },
  {
    name: 'OpenAI',
    category: 'ai',
    description: 'ChatGPT creator, leading frontier model development. Not yet public.',
    link: 'https://openai.com/'
  },
  {
    name: 'Meta',
    ticker: 'META',
    category: 'ai',
    description: 'Open-source Llama models, massive AI infra investment and social AI integration.'
  },
  {
    name: 'TSMC',
    ticker: 'TSM',
    category: 'ai',
    description: 'Sole manufacturer of advanced AI chips, irreplaceable in the AI supply chain.'
  },
  {
    name: 'Broadcom',
    ticker: 'AVGO',
    category: 'ai',
    description: 'Custom AI accelerators (TPU, ASIC) and networking chips for AI data centers.'
  },
  {
    name: 'AMD',
    ticker: 'AMD',
    category: 'ai',
    description: 'Second-largest AI GPU maker, growing data center AI business with MI series.'
  },
  {
    name: 'Tesla',
    ticker: 'TSLA',
    category: 'ai',
    description: 'Full self-driving AI, Dojo supercomputer, Optimus robotics — AI applied at scale.'
  },

  // Prediction Market
  {
    name: 'Polymarket',
    category: 'prediction',
    description: 'The largest decentralized prediction market platform.',
    link: 'https://polymarket.com/'
  },
  {
    name: 'Opinion Trade',
    category: 'prediction',
    description: 'Macro-focused prediction market for global events.',
    link: 'https://app.opinion.trade/macro'
  },
  {
    name: 'Probable Markets',
    category: 'prediction',
    description: 'Prediction market for real-world event outcomes.',
    link: 'https://probable.markets/'
  },

  // Web3 US Stocks
  {
    name: 'Coinbase',
    ticker: 'COIN',
    category: 'web3-stock',
    description: 'Largest US cryptocurrency exchange, institutional gateway.'
  },

  {
    name: 'Bitcoin Miners',
    ticker: 'BMNR',
    category: 'web3-stock',
    description: 'Bitcoin mining and digital asset infrastructure.'
  },

  {
    name: 'Circle',
    ticker: 'CRCL',
    category: 'web3-stock',
    description: 'USDC stablecoin issuer, global financial infrastructure.'
  },

  // US Stocks
  {
    name: 'FLANNG',
    ticker: 'FLANNG',
    category: 'us-stock',
    description:
      'Facebook, LinkedIn, Apple, Netflix, Nvidia, Google — mega-cap tech basket.'
  },
  {
    name: 'Palantir',
    ticker: 'PLTR',
    category: 'us-stock',
    description: 'AI-powered data analytics for government and enterprise.'
  },
  {
    name: 'Figma',
    category: 'us-stock',
    description: 'Collaborative design platform for product teams.'
  },
  {
    name: 'Datadog',
    ticker: 'DDOG',
    category: 'us-stock',
    description: 'Cloud monitoring and observability platform.'
  },
  {
    name: 'Cloudflare',
    ticker: 'NET',
    category: 'us-stock',
    description: 'Edge network and web security infrastructure.'
  },

  // Platforms for US Stock Purchase
  {
    name: 'Jupiter',
    category: 'platform',
    description: 'Purchase US stocks and crypto equities on Solana.',
    link: 'https://jup.ag/'
  },
  {
    name: 'Stablestock',
    category: 'platform',
    description: 'Emerging US stock purchase platform.',
    link: 'https://app.stablestock.finance/trade/market'
  },
  {
    name: 'Ondo',
    category: 'platform',
    description: 'Compliant US stock purchase platform (in beta whitelist).',
    link: 'https://app.ondo.finance/'
  },
  {
    name: 'Hyperliquid',
    category: 'platform',
    description:
      'After HIP-3, supports mainstream US stock trading and unlisted US AI giants.',
    link: 'https://app.hyperliquid.xyz/trade'
  }
];

export const categoryLabels: Record<AssetCategory, string> = {
  quality: 'Quality Crypto',
  l1: 'L1',
  infra: 'Infrastructure',
  ai: 'AI',
  prediction: 'Prediction',
  'web3-stock': 'Web3 Stocks',
  'us-stock': 'US Stocks',
  platform: 'Platforms'
};
