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
  researchLink?: string;
  hasToken?: boolean;
  tokenTicker?: string;
  coingeckoLink?: string;
};

export const philosophy = {
  intro:
    'For most people, ETFs may be a more suitable investment approach. The United States is approving more cryptocurrency ETFs, and the next market wave will still be crypto equities, stablecoins, and Perp DEX, with the market being gradually divided.',
  principle:
    'One principle: Hold BTC in bull markets, accumulate altcoins in bear markets. (Perhaps there are no more bull and bear markets, just volatility)',
  criteria:
    'Criteria for ETF selection: Favored by capitalists and institutions, has user base, has trading volume, team fundamentals are solid, REV value, no major bugs.',
  thought:
    'A thought: After large-scale cryptocurrencies and DAPPs emerge, what are the essential needs? RWA tokenization, stablecoin, prediction will be continue war.',
  lastUpdated: '2024/1/1 ~ 2026/03/02'
};

export const assets: Asset[] = [
  // Quality Crypto
  {
    name: 'Bitcoin',
    ticker: 'BTC',
    category: 'quality',
    description: 'Digital gold, the original cryptocurrency and store of value.',
    researchLink: '/blog/bitcoin_2026_report'
  },
  {
    name: 'Ethereum',
    ticker: 'ETH',
    category: 'quality',
    description:
      'Programmable blockchain, the foundation for DeFi and smart contracts.',
    researchLink: '/blog/eth_outlook_2026'
  },
  {
    name: 'Hyperliquid',
    ticker: 'HYPE',
    category: 'quality',
    description: 'High-performance perpetuals DEX with on-chain order book.',
    link: 'https://app.hyperliquid.xyz/trade',
    researchLink: '/blog/hyperliquid_report_2026'
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
    description: 'Move-based L1 with object-centric data model.',
    researchLink: '/blog/sui_report_2026'
  },
  {
    name: 'Canton',
    ticker: 'CC',
    category: 'l1',
    description: 'Privacy-enabled blockchain for institutional use cases.',
    researchLink: '/blog/canton_network_report'
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
    description: 'Leading decentralized lending and borrowing protocol.',
    researchLink: '/blog/aave_defi_lend'
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
    description: 'The largest decentralized exchange protocol.',
    researchLink: '/blog/uniswap_uni_x'
  },
  {
    name: 'Maple',
    ticker: 'SYRUP',
    category: 'infra',
    description: 'Institutional DeFi lending protocol.',
    researchLink: '/blog/maple_finance_syrup'
  },
  {
    name: 'Ondo',
    ticker: 'ONDO',
    category: 'infra',
    description:
      'RWA tokenization protocol offering institutional-grade on-chain assets (OUSG, USDY).'
  },

  // AI — top companies and assets worth holding 10+ years
  {
    name: 'Nvidia',
    ticker: 'NVDA',
    category: 'ai',
    description:
      'Dominant AI chip maker, powering the entire AI infrastructure stack.'
  },
  {
    name: 'Microsoft',
    ticker: 'MSFT',
    category: 'ai',
    description:
      'Azure AI + OpenAI partnership, enterprise AI leader with Copilot ecosystem.'
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
    description:
      'Claude maker, frontier AI safety research lab. Not yet public.',
    link: 'https://www.anthropic.com/'
  },
  {
    name: 'OpenAI',
    category: 'ai',
    description:
      'ChatGPT creator, leading frontier model development. Not yet public.',
    link: 'https://openai.com/'
  },
  {
    name: 'Meta',
    ticker: 'META',
    category: 'ai',
    description:
      'Open-source Llama models, massive AI infra investment and social AI integration.'
  },
  {
    name: 'TSMC',
    ticker: 'TSM',
    category: 'ai',
    description:
      'Sole manufacturer of advanced AI chips, irreplaceable in the AI supply chain.'
  },
  {
    name: 'Broadcom',
    ticker: 'AVGO',
    category: 'ai',
    description:
      'Custom AI accelerators (TPU, ASIC) and networking chips for AI data centers.'
  },
  {
    name: 'AMD',
    ticker: 'AMD',
    category: 'ai',
    description:
      'Second-largest AI GPU maker, growing data center AI business with MI series.'
  },
  {
    name: 'Tesla',
    ticker: 'TSLA',
    category: 'ai',
    description:
      'Full self-driving AI, Dojo supercomputer, Optimus robotics — AI applied at scale.'
  },

  // Prediction Market
  {
    name: 'Polymarket',
    category: 'prediction',
    description: 'The largest decentralized prediction market on Polygon. No token issued yet.',
    link: 'https://polymarket.com/',
    researchLink: '/blog/polymarket_kalshi_prediction_2026',
    hasToken: false,
    coingeckoLink: 'https://www.coingecko.com/en/exchanges/polymarket'
  },
  {
    name: 'Kalshi',
    category: 'prediction',
    description: 'US-regulated centralized prediction market, CFTC licensed. No token.',
    link: 'https://kalshi.com/',
    hasToken: false
  },
  {
    name: 'Opinion Trade',
    category: 'prediction',
    description: 'Macro-focused prediction market on BNB Smart Chain.',
    link: 'https://app.opinion.trade/macro',
    researchLink: '/blog/opinion_labs_pred',
    hasToken: true,
    tokenTicker: 'OPNT',
    coingeckoLink: 'https://www.coingecko.com/en/coins/opinion-trade'
  },
  {
    name: 'Limitless',
    category: 'prediction',
    description: 'Binary & categorical prediction market on Base. No token yet.',
    link: 'https://limitless.exchange/',
    hasToken: false,
    coingeckoLink: 'https://www.coingecko.com/en/exchanges/limitless-exchange'
  },
  {
    name: 'Football.fun',
    category: 'prediction',
    description: 'Sports-focused scalar prediction market on Base. AMM model.',
    link: 'https://www.football.fun/',
    hasToken: false
  },

  // Web3 US Stocks
  {
    name: 'Coinbase',
    ticker: 'COIN',
    category: 'web3-stock',
    description: 'Largest US cryptocurrency exchange, institutional gateway.',
    researchLink: '/blog/coinbase_report_2026'
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
    description: 'USDC stablecoin issuer, global financial infrastructure.',
    researchLink: '/blog/circle_stablecoin_arc'
  },

  // US Stocks
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
    link: 'https://jup.ag/',
    researchLink: '/blog/jupiter_ag_defi_solana'
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
    link: 'https://app.hyperliquid.xyz/trade',
    researchLink: '/blog/hyperliquid_report_2026'
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
