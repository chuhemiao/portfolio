export type AssetCategory =
  | 'ai-infra'
  | 'ai-platform'
  | 'ai-app'
  | 'saas'
  | 'china-em'
  | 'industrial'
  | 'crypto'
  | 'web3-stock'
  | 'prediction'
  | 'crypto-card'
  | 'private';

export type Asset = {
  name: string;
  ticker?: string;
  handle?: string;
  tier?: 'S' | 'A' | 'B' | 'C' | 'D';
  category: AssetCategory;
  description: string;
  link?: string;
  researchLink?: string;
  isPrivate?: boolean;
  hasToken?: boolean;
  tokenTicker?: string;
  coingeckoLink?: string;
};

export const philosophy = {
  intro:
    'Investing in the next future — maybe 2050 will enter a new era. This is not a value portfolio. It is a maximum market-cap-growth portfolio for the next 5-10 years.',
  principle:
    'Three themes: AI Infrastructure (sell the picks) → AI Platform (build the OS) → AI Applications & Traffic (own users + monetize).',
  criteria:
    'High growth over low valuation. AI exposure first. Platform companies first. The Coatue "Fantastic 40" framework — 30 publics + 10 privates & crypto.',
  thought:
    'Confirmed holdings: BTC, ETH — conviction positions, not speculation.',
  lastUpdated: '2026/07/17'
};

export const assets: Asset[] = [
  // AI Infrastructure
  {
    name: 'NVIDIA',
    ticker: 'NVDA',
    category: 'ai-infra',
    description: 'AI compute monopoly. GPU + CUDA ecosystem builds the moat.'
  },
  {
    name: 'TSMC',
    ticker: 'TSM',
    category: 'ai-infra',
    description:
      'Sole supplier of advanced AI chip manufacturing. Irreplaceable.'
  },
  {
    name: 'ASML',
    ticker: 'ASML',
    category: 'ai-infra',
    description:
      'Only EUV lithography machine maker. Crown jewel of semiconductors.'
  },
  {
    name: 'AMD',
    ticker: 'AMD',
    category: 'ai-infra',
    description:
      'Chasing NVDA in GPUs. Growing data center AI share with MI series.'
  },
  {
    name: 'SK Hynix',
    ticker: '000660.KS',
    category: 'ai-infra',
    description: 'Core HBM memory beneficiary. AI storage demand explosion.'
  },
  {
    name: 'Broadcom',
    ticker: 'AVGO',
    category: 'ai-infra',
    description: 'AI ASIC custom chips + semiconductor M&A consolidator.'
  },
  {
    name: 'ARM',
    ticker: 'ARM',
    category: 'ai-infra',
    description:
      'CPU architecture IP dominates mobile, now penetrating AI chips.'
  },
  {
    name: 'Cloudflare',
    ticker: 'NET',
    category: 'ai-infra',
    description:
      'Edge network + AI inference layer. Web security infrastructure.',
    link: 'https://www.cloudflare.com/'
  },

  // AI Platform
  {
    name: 'Microsoft',
    ticker: 'MSFT',
    category: 'ai-platform',
    description:
      'Enterprise software + cloud + AI platform trinity. Cash flow machine.'
  },
  {
    name: 'Google (Alphabet)',
    ticker: 'GOOGL',
    category: 'ai-platform',
    description:
      'AI + search ads dual engine. Monetization pace is the key variable.'
  },
  {
    name: 'Amazon',
    ticker: 'AMZN',
    category: 'ai-platform',
    description:
      'AWS + e-commerce dual flywheel. AI pushing cloud business value higher.'
  },
  {
    name: 'Oracle',
    ticker: 'ORCL',
    category: 'ai-platform',
    description: 'Cloud transition + AI database demand recovery.'
  },

  // AI Apps & Traffic
  {
    name: 'Meta',
    ticker: 'META',
    category: 'ai-app',
    description: 'Ad cash flow + open-source AI (Llama) + XR long bet.'
  },
  {
    name: 'Tesla',
    ticker: 'TSLA',
    category: 'ai-app',
    description:
      'EV + autonomous driving + robotics. Valuation anchored in AI, not cars.'
  },
  {
    name: 'Netflix',
    ticker: 'NFLX',
    category: 'ai-app',
    description: 'Streaming leader + ad-supported tier opens new revenue space.'
  },
  {
    name: 'Spotify',
    ticker: 'SPOT',
    category: 'ai-app',
    description: 'Music platform + AI recommendations + podcast monetization.'
  },
  {
    name: 'Shopify',
    ticker: 'SHOP',
    category: 'ai-app',
    description:
      'Independent commerce infrastructure. Benefits from de-platformization.'
  },
  {
    name: 'Uber',
    ticker: 'UBER',
    category: 'ai-app',
    description:
      'Platform network effects + profitability inflection confirmed.'
  },
  {
    name: 'AppLovin',
    ticker: 'APP',
    category: 'ai-app',
    description: 'Advertising + AI algorithm driving profit explosion.'
  },
  {
    name: 'PayPay',
    ticker: 'PAYPAY',
    category: 'ai-app',
    description: "Japan's leading mobile payment super app. SoftBank ecosystem."
  },
  {
    name: 'Meituan',
    ticker: '3690.HK',
    category: 'ai-app',
    description:
      'China local services platform. Food delivery + instant commerce dominance.'
  },

  // SaaS / Data
  {
    name: 'Palantir',
    ticker: 'PLTR',
    category: 'saas',
    description:
      'AI + data platform. Government and enterprise dual-wheel drive.'
  },
  {
    name: 'SAP',
    ticker: 'SAP',
    category: 'saas',
    description: 'ERP leader. Cloud transition unlocking margin expansion.'
  },
  {
    name: 'ServiceNow',
    ticker: 'NOW',
    category: 'saas',
    description: 'Enterprise automation platform. AI increases ARPU.'
  },
  {
    name: 'Snowflake',
    ticker: 'SNOW',
    category: 'saas',
    description: 'Data cloud platform. AI data layer beneficiary.'
  },
  {
    name: 'Intuit',
    ticker: 'INTU',
    category: 'saas',
    description: 'Tax & financial software + AI automation drives efficiency.'
  },

  // China / Emerging Markets
  {
    name: 'Alibaba',
    ticker: 'BABA',
    category: 'china-em',
    description: 'E-commerce + cloud. Confirmed holding at low valuation.'
  },
  {
    name: 'Tencent',
    ticker: '0700.HK',
    category: 'china-em',
    description: 'Gaming + social cash cow. AI improves efficiency across the board.'
  },
  {
    name: 'Pinduoduo',
    ticker: 'PDD',
    category: 'china-em',
    description:
      'China social commerce + Temu global expansion. Aggressive growth engine.'
  },
  {
    name: 'Xiaomi',
    ticker: '1810.HK',
    category: 'china-em',
    description: 'Phone + IoT + EV new story. Ecosystem play.'
  },

  // Industrial / Other
  {
    name: 'GE Vernova',
    ticker: 'GEV',
    category: 'industrial',
    description: 'Power equipment + energy transition beneficiary.'
  },
  {
    name: 'Intuitive Surgical',
    ticker: 'ISRG',
    category: 'industrial',
    description: 'Surgical robotics monopoly.'
  },
  {
    name: 'CrowdStrike',
    ticker: 'CRWD',
    category: 'industrial',
    description: 'Cloud security leader. AI security demand explosion.'
  },
  {
    name: 'Constellation Energy',
    ticker: 'CEG',
    category: 'industrial',
    description: 'Nuclear power + AI compute electricity demand beneficiary.'
  },

  // Crypto
  {
    name: 'Bitcoin',
    ticker: 'BTC',
    category: 'crypto',
    description:
      'Digital gold. Core institutional asset allocation. Confirmed holding.',
    researchLink: '/blog/bitcoin_2026_report'
  },
  {
    name: 'Ethereum',
    ticker: 'ETH',
    category: 'crypto',
    description:
      'Smart contract base layer. Web3 core infrastructure. Confirmed holding.',
    researchLink: '/blog/eth_outlook_2026'
  },
  {
    name: 'Hyperliquid',
    ticker: 'HYPE',
    category: 'crypto',
    description: 'High-performance perpetuals DEX with on-chain order book.',
    link: 'https://app.hyperliquid.xyz/trade',
    researchLink: '/blog/hyperliquid_report_2026'
  },
  {
    name: 'BNB',
    ticker: 'BNB',
    category: 'crypto',
    description: 'Binance ecosystem token. High throughput chain + exchange flywheel.'
  },
  {
    name: 'Canton',
    ticker: 'CC',
    category: 'crypto',
    description: 'Privacy-enabled blockchain for institutional use cases.',
    researchLink: '/blog/canton_network_report'
  },
  {
    name: 'Uniswap',
    ticker: 'UNI',
    category: 'crypto',
    description: 'The largest decentralized exchange protocol.',
    researchLink: '/blog/uniswap_uni_x'
  },
  {
    name: 'Ondo',
    ticker: 'ONDO',
    category: 'crypto',
    description: 'RWA tokenization protocol. Institutional-grade on-chain assets (OUSG, USDY).'
  },

  // Web3 Stocks
  {
    name: 'Coinbase',
    ticker: 'COIN',
    category: 'web3-stock',
    description:
      'Largest US crypto exchange. Institutional gateway to digital assets.',
    researchLink: '/blog/coinbase_report_2026'
  },
  {
    name: 'Circle',
    ticker: 'CRCL',
    category: 'web3-stock',
    description: 'USDC stablecoin issuer. Global financial infrastructure.',
    researchLink: '/blog/circle_stablecoin_arc'
  },

  // Prediction Markets
  {
    name: 'Polymarket',
    category: 'prediction',
    description:
      'Largest decentralized prediction market on Polygon. No token issued yet.',
    link: 'https://polymarket.com/',
    researchLink: '/blog/polymarket_kalshi_prediction_2026',
    hasToken: false,
    coingeckoLink: 'https://www.coingecko.com/en/exchanges/polymarket'
  },
  {
    name: 'Kalshi',
    category: 'prediction',
    description:
      'US-regulated centralized prediction market, CFTC licensed. No token.',
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
    description:
      'Binary & categorical prediction market on Base. No token yet.',
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

  // Crypto Cards
  {
    name: 'Revolut',
    handle: '@Revolut',
    tier: 'S',
    category: 'crypto-card',
    description:
      'Crypto card mode for Revolut balances, auto-converting crypto at spend time.',
    link: 'https://www.revolut.com/crypto/crypto-card/'
  },
  {
    name: 'Coinbase Card',
    handle: '@coinbase',
    tier: 'S',
    category: 'crypto-card',
    description:
      'Visa debit card for spending cash or crypto from Coinbase with crypto rewards.',
    link: 'https://www.coinbase.com/card'
  },
  {
    name: 'RedotPay',
    handle: '@RedotPay',
    tier: 'S',
    category: 'crypto-card',
    description:
      'Stablecoin card and payment app for everyday USDT/USDC-style spending.',
    link: 'https://www.redotpay.com/'
  },
  {
    name: 'KAST',
    handle: '@KASTxyz',
    tier: 'S',
    category: 'crypto-card',
    description:
      'Stablecoin money app with instant cards for global Web3 spending.',
    link: 'https://www.kast.xyz/crypto-cards'
  },
  {
    name: 'ether.fi Cash',
    handle: '@ether_fi',
    tier: 'A',
    category: 'crypto-card',
    description:
      'DeFi-native credit card connected to on-chain balances and yield-bearing stables.',
    link: 'https://www.ether.fi/cash'
  },
  {
    name: 'Holyheld',
    handle: '@holyheld',
    tier: 'A',
    category: 'crypto-card',
    description:
      'Non-custodial account and card for turning wallet assets into everyday spend.',
    link: 'https://holyheld.com/'
  },
  {
    name: 'Wirex',
    handle: '@wirexapp',
    tier: 'A',
    category: 'crypto-card',
    description:
      'Stablecoin payment infrastructure and card rails for consumer and B2B spend.',
    link: 'https://www.wirexapp.com/stablecoin-and-crypto-card'
  },
  {
    name: 'Gnosis Pay',
    handle: '@gnosispay',
    tier: 'B',
    category: 'crypto-card',
    description:
      'Self-custodial Visa debit card linked to Safe smart accounts.',
    link: 'https://gnosispay.com/card'
  },
  {
    name: 'Kolo',
    handle: '@KoloHub',
    tier: 'B',
    category: 'crypto-card',
    description:
      'Crypto Visa card and USDT wallet with stablecoin top-ups and BTC cashback.',
    link: 'https://kolo.in/'
  },
  {
    name: 'Krak',
    handle: '@Krak',
    tier: 'B',
    category: 'crypto-card',
    description:
      'Kraken money app and card for spending cash or crypto with rewards.',
    link: 'https://krak.app/'
  },
  {
    name: 'Oobit',
    handle: '@oobit',
    tier: 'B',
    category: 'crypto-card',
    description:
      'Tap-to-pay crypto app that converts wallet assets at the point of sale.',
    link: 'https://www.oobit.com/crypto-card'
  },
  {
    name: 'Avalanche Card',
    handle: '@avax',
    tier: 'C',
    category: 'crypto-card',
    description:
      'Crypto-backed Visa card for spending AVAX, USDC, USDT, and WAVAX.',
    link: 'https://www.avalanchecard.com/'
  },
  {
    name: 'Avici',
    handle: '@AviciMoney',
    tier: 'C',
    category: 'crypto-card',
    description:
      'Self-custodial crypto neobank with card spend and Apple Pay support.',
    link: 'https://avici.money/'
  },
  {
    name: 'Solflare Card',
    handle: '@solflare',
    tier: 'C',
    category: 'crypto-card',
    description:
      'Solana self-custody debit card for spending USDC directly from the wallet.',
    link: 'https://www.solflare.com/crypto-card/'
  },
  {
    name: 'COCA',
    handle: '@coca_card',
    tier: 'C',
    category: 'crypto-card',
    description:
      'Non-custodial wallet with virtual and physical cards for stablecoin and fiat spend.',
    link: 'https://www.coca.xyz/'
  },
  {
    name: 'Hawala',
    handle: '@usehawala',
    tier: 'D',
    category: 'crypto-card',
    description:
      'Stablecoin-rails USD/EUR account and global card for cross-border workers.',
    link: 'https://usehawala.com/card'
  },
  {
    name: 'Hyperbeat',
    handle: '@hyperbeat',
    tier: 'D',
    category: 'crypto-card',
    description:
      'Hyperliquid liquid-banking account with Hyperbeat Pay card and credit mode.',
    link: 'https://hyperbeat.org/'
  },

  // Private
  {
    name: 'OpenAI',
    category: 'private',
    description:
      'AI model and ecosystem center. Compute + data + application closed loop.',
    link: 'https://openai.com/',
    isPrivate: true
  },
  {
    name: 'SpaceX',
    category: 'private',
    description:
      'Commercial aerospace + Starlink. Cash flow already validated.',
    isPrivate: true
  },
  {
    name: 'Anthropic',
    category: 'private',
    description: 'Claude model maker. Safety-first AI route.',
    link: 'https://www.anthropic.com/',
    isPrivate: true
  },
  {
    name: 'ByteDance',
    category: 'private',
    description: 'TikTok global traffic dominator.',
    isPrivate: true
  },
  {
    name: 'Stripe',
    category: 'private',
    description: 'Global payment infrastructure.',
    isPrivate: true
  },
  {
    name: 'Databricks',
    category: 'private',
    description: 'Data + AI platform (Lakehouse). Enterprise AI data layer.',
    isPrivate: true
  },
  {
    name: 'Revolut',
    category: 'private',
    description: 'European digital bank super app.',
    isPrivate: true
  },
  {
    name: 'xAI',
    category: 'private',
    description: "Musk's AI company. Compute + data integration play.",
    isPrivate: true
  },
  {
    name: 'Vercel',
    category: 'private',
    description:
      'Frontend cloud + Next.js platform. AI-native deployment infrastructure.',
    link: 'https://vercel.com/',
    isPrivate: true
  }
];

export const categoryLabels: Record<AssetCategory, string> = {
  'ai-infra': 'AI Infrastructure',
  'ai-platform': 'AI Platform',
  'ai-app': 'AI Apps & Traffic',
  saas: 'SaaS / Data',
  'china-em': 'China / EM',
  industrial: 'Industrial',
  crypto: 'Crypto',
  'web3-stock': 'Web3 Stocks',
  prediction: 'Prediction',
  'crypto-card': 'Crypto Cards',
  private: 'Private'
};
