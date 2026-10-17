/**
 * Tokenized US equities tracker.
 *
 * The category's core trap is treating "an AAPL token" as one asset. It is not.
 * An instrument's identity is: underlying share + issuer + legal wrapper + chain
 * + contract address + venue. Two tokens tracking the same stock can differ in
 * collateral, redemption rights and bankruptcy recourse. So the model is two
 * levels — issuers and instruments — rather than one flat table of tickers.
 *
 * Every figure carries the date it was measured. Market data in this category
 * moves within days; the page renders the as-of date beside the numbers.
 */

export type Wrapper =
  | 'direct-security' // Token is the registered security.
  | 'tracker-certificate' // Bearer debt instrument tracking the share.
  | 'debt-claim' // Claim on the issuer, collateral held off-chain.
  | 'price-exposure' // Economic exposure only, no share held against it.
  | 'unknown';

export type Dividend = 'distributed' | 'reinvested' | 'pass-through' | 'none' | 'unknown';
export type Voting = 'full' | 'proxy' | 'planned' | 'none' | 'unknown';
export type UsAccess = 'blocked' | 'accredited' | 'restricted' | 'allowed' | 'unknown';
export type LiquidityKind = 'cex-orderbook' | 'amm' | 'rfq' | 'mixed' | 'unknown';

/** Internal research grade, not a regulatory rating. See GRADE_RUBRIC. */
export type Grade = 'A' | 'B' | 'C' | 'D' | 'unrated';

export type Issuer = {
  slug: string;
  name: string;
  entity?: string;
  jurisdiction: string;
  wrapper: Wrapper;
  voting: Voting;
  dividend: Dividend;
  redemption: {
    available: boolean | 'unknown';
    kyc: boolean | 'unknown';
    minimumUsd?: number;
    hours?: string;
    refusable?: boolean;
    note?: string;
  };
  proofOfReserve: { kind: 'chainlink-por' | 'attestation' | 'none' | 'unknown'; cadence?: string; note?: string };
  custody?: string;
  usPersons: UsAccess;
  chains: string[];
  instrumentCount?: number;
  onchainValueUsd?: number;
  distribution: string[];
  grade: Grade;
  note?: string;
  sources: string[];
};

export type TokenRow = {
  ticker: string;
  issuerSlug: string | null;
  marketCapUsd: number;
  volume24hUsd: number;
  change7dPct: number;
};

export type Instrument = {
  ticker: string;
  underlying: string;
  issuerSlug: string | null;
  chain: string;
  /** Observed in a token mapping snapshot — NOT an issuer whitelist. */
  address?: string;
  venue: string;
  liquidity: LiquidityKind;
  volume24hUsd?: number;
  spreadBps?: number;
  /** Top-20 levels converted at mid. Not full book depth. */
  bidDepthUsd?: number;
  askDepthUsd?: number;
  premiumPct?: number;
  note?: string;
};

export type Venue = {
  name: string;
  tokens: string;
  terms: string;
  hours: string;
};

export type RiskRow = { risk: string; severity: 'high' | 'medium' | 'low'; detail: string };

export type MarketSnapshot = {
  date: string;
  source: string;
  sourceUrl: string;
  scope: string;
  metrics: { label: string; value: string; delta?: string; note?: string }[];
};

/* ────────────────────────────────────────────────────────────────────────── */

export const DATA_AS_OF = '2026-10-16';

/** Two methodologies, two totals. The gap is scope, not error. */
export const MARKET_SNAPSHOTS: MarketSnapshot[] = [
  {
    date: '2026-10-16',
    source: 'rwa.xyz',
    sourceUrl: 'https://app.rwa.xyz/stocks',
    scope: 'Includes shares registered on-chain (Securitize, Exodus, Forward Industries, FGRS)',
    metrics: [
      { label: 'Distributed value', value: '$3.50B', delta: '+19~24% / 30d' },
      { label: 'Holders', value: '4.42M' },
      { label: 'Monthly transfer volume', value: '$10.26B', delta: '−73% / 30d' },
      { label: 'Monthly active addresses', value: '1.386M', delta: '−60% / 30d' },
    ],
  },
  {
    date: '2026-10-15',
    source: 'CoinGecko via Castle Labs',
    sourceUrl: 'https://castlelabs.io/research/tokenized-stocks',
    scope: 'Third-party wrapped tokens only',
    metrics: [
      { label: 'Tokens tracked', value: '250' },
      { label: 'Total market cap', value: '$2.50B' },
      { label: '24h volume', value: '$1.02B' },
    ],
  },
];

/** Market cap is rising while usage falls — the single most important
 *  divergence in the category right now. */
export const ACTIVITY_DIVERGENCE = {
  asOf: '2026-10-16',
  marketCap: '+19~24%',
  transfers: '−73%',
  activeAddresses: '−60%',
  reading:
    'New supply is settling into custody rather than circulating. Growth here is accumulation, not adoption.',
};

/** Demand concentrates in crypto-linked names, high-beta tech, and companies
 *  ordinary brokerages cannot reach. */
export const UNDERLYING_CONCENTRATION = [
  { underlying: 'Circle (CRCL)', valueUsd: 350_500_000, note: 'Across 5 issuers' },
  { underlying: 'Strategy STRC (preferred)', valueUsd: 225_700_000 },
  { underlying: 'SpaceX', valueUsd: 211_500_000, note: 'Not listed on any public exchange' },
  { underlying: 'Strategy (MSTR)', valueUsd: 207_000_000 },
  { underlying: 'NVIDIA (NVDA)', valueUsd: 156_000_000 },
];

export const ISSUERS: Issuer[] = [
  {
    slug: 'ondo',
    name: 'Ondo Stocks',
    entity: 'Ondo Global Markets (BVI)',
    jurisdiction: 'British Virgin Islands',
    wrapper: 'debt-claim',
    voting: 'proxy',
    dividend: 'unknown',
    redemption: { available: true, kyc: true, refusable: true, note: 'No guarantee a secondary market exists; redemption may be refused on compliance grounds.' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'blocked',
    chains: ['Ethereum', 'BNB Chain', 'Solana', 'HyperEVM'],
    instrumentCount: 100,
    onchainValueUsd: 984_000_000,
    distribution: ['LI.FI', 'Jupiter'],
    grade: 'B',
    note: 'Renamed from Ondo Global Markets in July 2026. Leads on multi-chain reach and DeFi integration. The company claims over 70% issuer share; on CoinGecko’s basis it is roughly a third — treat the 70% as marketing.',
    sources: [
      'https://docs.ondo.finance/ondo-stocks/secondary-market-restrictions',
      'https://finance.yahoo.com/markets/crypto/articles/ondo-global-markets-tops-1b-103215556.html',
    ],
  },
  {
    slug: 'bstocks',
    name: 'bStocks',
    entity: 'BTech Holdings Limited',
    jurisdiction: 'ADGM (FSRA-listed certificates)',
    wrapper: 'tracker-certificate',
    voting: 'none',
    dividend: 'pass-through',
    redemption: { available: true, kyc: true, minimumUsd: 5, note: '1:1 free conversion between Binance stock positions and bStocks.' },
    proofOfReserve: { kind: 'attestation', note: 'Binance publishes a collateral page.' },
    custody: '1:1 custody',
    usPersons: 'blocked',
    chains: ['BNB Chain'],
    instrumentCount: 80,
    onchainValueUsd: 914_000_000,
    distribution: ['Binance'],
    grade: 'B',
    note: 'Launched 2026-06-11 and already second by size. Highest turnover in the category — SPCXB trades roughly its own market cap in a day. Dividends take a 30% US withholding deduction before being reinvested through a multiplier. Single chain: BSC deposits only, so a wrong-network transfer loses the asset.',
    sources: [],
  },
  {
    slug: 'xstocks',
    name: 'xStocks (Backed)',
    entity: 'Backed Assets (JE) Limited',
    jurisdiction: 'Jersey',
    wrapper: 'tracker-certificate',
    voting: 'none',
    dividend: 'reinvested',
    redemption: { available: true, kyc: true, minimumUsd: 5000, hours: 'Primary issue/redeem 24/5; secondary 24/7 by venue' },
    proofOfReserve: { kind: 'chainlink-por', cadence: 'Daily, or when reserves move more than 10%', note: 'A third-party network firm reads custodian balances and counts securities in settlement.' },
    custody: 'Regulated custodian and broker, segregated accounts, tri-party Account Control Agreement, independent Security Agent',
    usPersons: 'blocked',
    chains: ['Solana', 'Ethereum', 'Arbitrum', 'BSC', 'TON', 'Tron', 'Mantle', 'Ink', 'Monad', 'Optimism', 'X Layer', 'Hyperliquid'],
    instrumentCount: 100,
    onchainValueUsd: 847_000_000,
    distribution: ['Kraken', 'Bybit', 'OKX'],
    grade: 'A',
    note: 'Widest chain coverage in the category and the most complete public legal documentation. Acquired by Kraken in Dec 2025, putting issuance and trading on one balance sheet. Dividends arrive as rebasing, not cash. No voting rights; Jersey issuer.',
    sources: [
      'https://docs.xstocks.fi/docs/product-legal-overview',
      'https://docs.xstocks.fi/docs/frequently-asked-questions',
      'https://backed.fi/news-updates/chainlink-proof-of-reserve-is-now-active',
    ],
  },
  {
    slug: 'robinhood',
    name: 'Robinhood Stock Tokens',
    entity: 'Robinhood Assets (Jersey) Limited',
    jurisdiction: 'Jersey',
    wrapper: 'debt-claim',
    voting: 'planned',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: true, note: 'Plans 1:1 redemption into real shares.' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'blocked',
    chains: ['Robinhood Chain'],
    instrumentCount: 190,
    onchainValueUsd: 151_000_000,
    distribution: ['Robinhood app'],
    grade: 'B',
    note: 'Tokenized debt securities today, but the only major issuer publicly planning 1:1 redemption into real shares plus voting rights. If that ships it is the first large issuer to return shareholder rights. In the EU it also runs 2,000+ CFD-style products that cannot be withdrawn on-chain.',
    sources: ['https://docs.robinhood.com/chain/stock-tokens/'],
  },
  {
    slug: 'remora',
    name: 'Remora rStocks',
    jurisdiction: 'unknown',
    wrapper: 'unknown',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'unknown',
    chains: [],
    onchainValueUsd: 132_000_000,
    distribution: [],
    grade: 'unrated',
    note: 'Fifth by size with almost no public structural disclosure. Unrated until the issuing entity, custody and redemption terms can be read from primary documents.',
    sources: [],
  },
  {
    slug: 'dinari',
    name: 'Dinari dShares',
    jurisdiction: 'United States',
    wrapper: 'direct-security',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: true, kyc: true },
    proofOfReserve: { kind: 'unknown', note: 'Underlying held with a qualified custodian.' },
    custody: 'Qualified custodian',
    usPersons: 'accredited',
    chains: ['Ethereum', 'Arbitrum', 'Avalanche', 'Base'],
    instrumentCount: 724,
    distribution: [],
    grade: 'B',
    note: 'The only issuer here open to US persons at all, and then only to accredited investors. Widest instrument coverage in the category — the full S&P 500.',
    sources: [],
  },
  {
    slug: 'backpack',
    name: 'Backpack Securities',
    jurisdiction: 'unknown',
    wrapper: 'unknown',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'unknown',
    chains: ['Solana'],
    onchainValueUsd: 30_980_000,
    distribution: ['Backpack'],
    grade: 'unrated',
    note: 'Exchange issuing its own tokens — the pattern now common to Coinbase, Robinhood and Binance.',
    sources: [],
  },
  {
    slug: 'coinbase',
    name: 'Coinbase (Base)',
    jurisdiction: 'ADGM-regulated',
    wrapper: 'direct-security',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: true },
    proofOfReserve: { kind: 'unknown', note: 'Shares held 1:1 by Alpaca.' },
    custody: 'Alpaca',
    usPersons: 'blocked',
    chains: ['Base'],
    instrumentCount: 10,
    onchainValueUsd: 7_500_000,
    distribution: ['Uniswap', 'Aerodrome', 'Aave', 'Morpho'],
    grade: 'B',
    note: 'Launched 2026-08-24 with NVDAc, METAc, AAPLc and GOOGLc. Thirteen contracts deployed, only four with supply. The most DeFi-native of the set: tradable on Uniswap and Aerodrome, usable as Aave collateral, borrowable against on Morpho.',
    sources: ['https://www.coindesk.com/business/2026/08/24/coinbase-debuts-tokenized-stocks-on-base-network-joining-race-to-bring-equities-on-blockchain'],
  },
  {
    slug: 'reality',
    name: 'Reality rTokens',
    jurisdiction: 'unknown',
    wrapper: 'debt-claim',
    voting: 'none',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    custody: 'Alpaca Securities',
    usPersons: 'blocked',
    chains: ['Arbitrum', 'Morph'],
    instrumentCount: 36,
    distribution: ['Bitget'],
    grade: 'C',
    note: 'Shares held through Alpaca; holders do not own the stock directly. Replaced the Ondo tokens Bitget previously listed.',
    sources: [],
  },
  {
    slug: 'prestocks',
    name: 'ST0x / PreStocks',
    jurisdiction: 'unknown',
    wrapper: 'unknown',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'unknown',
    chains: ['Base'],
    onchainValueUsd: 20_350_000,
    distribution: [],
    grade: 'unrated',
    note: 'Small issuers; PreStocks accounts for the figure shown.',
    sources: [],
  },
];

/** Leaderboard, 2026-10-15, CoinGecko via Castle Labs. */
export const TOP_TOKENS: TokenRow[] = [
  { ticker: 'STRCX', issuerSlug: 'xstocks', marketCapUsd: 158_900_000, volume24hUsd: 442_000, change7dPct: -0.4 },
  { ticker: 'CRCLB', issuerSlug: 'bstocks', marketCapUsd: 143_400_000, volume24hUsd: 38_200_000, change7dPct: -4.7 },
  { ticker: 'SPCXB', issuerSlug: 'bstocks', marketCapUsd: 120_900_000, volume24hUsd: 108_900_000, change7dPct: -12 },
  { ticker: 'MSTRX', issuerSlug: 'xstocks', marketCapUsd: 110_500_000, volume24hUsd: 3_300_000, change7dPct: -8.7 },
  { ticker: 'CRCLX', issuerSlug: 'xstocks', marketCapUsd: 93_200_000, volume24hUsd: 26_700_000, change7dPct: -4.0 },
  { ticker: 'CRCLON', issuerSlug: 'ondo', marketCapUsd: 92_400_000, volume24hUsd: 619_000, change7dPct: -4.6 },
  { ticker: 'TSLAX', issuerSlug: 'xstocks', marketCapUsd: 67_900_000, volume24hUsd: 8_800_000, change7dPct: -3.8 },
  { ticker: 'SNDKB', issuerSlug: 'bstocks', marketCapUsd: 53_800_000, volume24hUsd: 48_300_000, change7dPct: -20 },
];

/** Case study, 2026-09-19, a Saturday. The underlying last closed at $335.19 on
 *  2026-09-18 20:04 UTC, yet all four tokens kept trading. Older than the rest
 *  of this file, kept because the structural point does not expire: one stock,
 *  four issuers, four completely different books. */
export const AAPL_CASE_STUDY = {
  asOf: '2026-09-19',
  underlyingClose: '$335.19',
  rows: [
    {
      ticker: 'AAPLB', underlying: 'AAPL', issuerSlug: 'bstocks', chain: 'BNB Chain',
      address: '0x431a3bee82e2ca41e49895cbece5bb0f76a89b7a', venue: 'Binance', liquidity: 'cex-orderbook' as LiquidityKind,
      volume24hUsd: 822_000, spreadBps: 0.3, bidDepthUsd: 56_300, askDepthUsd: 8_800, premiumPct: -0.02,
      note: 'Tightest quote in the set, but ask depth is a sixth of bid depth. A narrow spread is not two-sided depth.',
    },
    {
      ticker: 'AAPLX', underlying: 'AAPL', issuerSlug: 'xstocks', chain: 'Solana / EVM',
      address: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', venue: 'Bybit', liquidity: 'cex-orderbook' as LiquidityKind,
      volume24hUsd: 158_000, spreadBps: 2.68, bidDepthUsd: 18_000, askDepthUsd: 175_000, premiumPct: 0.32,
      note: 'Thick on the ask, thin on the bid — getting in and getting out are not symmetric.',
    },
    {
      ticker: 'AAPLON', underlying: 'AAPL', issuerSlug: 'ondo', chain: 'Ethereum / Solana',
      address: '0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c', venue: 'Gate', liquidity: 'cex-orderbook' as LiquidityKind,
      volume24hUsd: 94_700, spreadBps: 5.65, bidDepthUsd: 16_200, askDepthUsd: 12_000, premiumPct: 0.21,
      note: 'Balanced but small. Fine for small limit orders, not for size without live RFQ.',
    },
    {
      ticker: 'AAPLG', underlying: 'AAPL', issuerSlug: null, chain: 'unknown',
      venue: 'Gate', liquidity: 'unknown' as LiquidityKind,
      volume24hUsd: 445_500, spreadBps: 53.3, bidDepthUsd: 5_600, askDepthUsd: 9_300, premiumPct: -0.02,
      note: 'Issuer could not be resolved in the mapping. High volume, 50x the spread, almost no depth — volume alone must never qualify an instrument.',
    },
  ] satisfies Instrument[],
};

export const VENUES: Venue[] = [
  { name: 'Kraken', tokens: 'xStocks', terms: 'Zero commission buying with USDG/USD (spread may apply), $1 minimum', hours: '24/5 in-platform; 24/7 once withdrawn on-chain' },
  { name: 'Binance', tokens: 'Own bStocks', terms: '1:1 free conversion with Binance stock positions, $5 minimum, collateral page published', hours: '24/7' },
  { name: 'Bybit', tokens: 'xStocks', terms: '0.20% maker/taker at VIP0; Solana and Mantle withdrawals', hours: '24/7' },
  { name: 'OKX', tokens: 'xStocks', terms: '40+ instruments, wired into OKX DEX and X Layer', hours: '—' },
  { name: 'Bitget', tokens: 'Reality rTokens', terms: '0.1%, or 0.05% paid in BGB; replaced the Ondo tokens listed previously', hours: '—' },
  { name: 'Robinhood', tokens: 'Own Stock Tokens', terms: 'Plus 2,000+ CFD-style products in the EU that cannot be withdrawn', hours: '—' },
  { name: 'Backpack', tokens: 'Own Backpack Securities', terms: 'Solana', hours: '—' },
];

/** The largest venue for "24/7 US stock exposure" holds no shares at all. */
export const PERPS_NOTE = {
  title: 'Perps are the biggest venue, and they are not spot',
  body:
    'Under Hyperliquid’s HIP-3 framework, Trade[XYZ] had 92 markets by June 2026, about 98% of HIP-3 volume and roughly 300,000 users. These are synthetic: no custodied shares, no redemption. They compete for the same users as every spot token on this page.',
  url: 'https://www.kucoin.com/news/flash/trade-xyz-builds-92-markets-and-98-hip-3-volume-on-hyperliquid-in-8-months',
};

export const RISKS: RiskRow[] = [
  { risk: 'No shareholder rights', severity: 'high', detail: 'xStocks, Ondo, bStocks and Reality all state plainly that holders get no direct ownership or voting.' },
  { risk: 'Issuer and custody risk', severity: 'high', detail: 'Issuing entities sit in Jersey, the BVI and ADGM, leaning on custodians such as Alpaca.' },
  { risk: 'Fragmented liquidity', severity: 'medium', detail: 'The same stock has five or six versions across chains; spreads widen while the underlying market is shut.' },
  { risk: 'Wrong-network transfers', severity: 'medium', detail: 'bStocks accepts BSC deposits only — sending on another network loses the asset.' },
  { risk: 'Tax treatment', severity: 'medium', detail: 'bStocks dividends take a 30% US withholding deduction first.' },
  { risk: 'Speculative turnover', severity: 'medium', detail: 'SPCXB and SNDKB turn over at extreme rates, with weekly drawdowns around −20%.' },
];

export const WATCH_SIGNALS = [
  'Which venues file for and receive the first TSV approvals.',
  'When Robinhood’s 1:1 redemption and voting rights actually ship.',
  'Whether rwa.xyz monthly active addresses stop falling.',
  'Share movement between Ondo, bStocks and xStocks.',
  'The volume gap between Hyperliquid stock perps and spot tokens.',
];

/** What the token legally is — the question most products answer badly. */
export const WRAPPER_RUBRIC: { kind: Wrapper; label: string; meaning: string }[] = [
  { kind: 'direct-security', label: 'Direct security', meaning: 'The token is the registered share. Dividends and voting survive. Usually permissioned and KYC-gated.' },
  { kind: 'tracker-certificate', label: 'Tracker certificate', meaning: 'A bearer debt instrument over a share held by a custodian. Economic exposure only; no voting. Recourse runs to the collateral, not to the company.' },
  { kind: 'debt-claim', label: 'Issuer claim', meaning: 'A claim on the issuer, collateral held off-chain. If the issuer fails you are a creditor, not a shareholder.' },
  { kind: 'price-exposure', label: 'Price exposure', meaning: 'No share held against it. A derivative wearing a ticker.' },
];

export const RISK_WEIGHTS = [
  { dimension: 'Legal structure and holder rights', weight: 25, question: 'Share, certificate, debt claim, or price exposure?' },
  { dimension: 'Underlying, custody and proof of reserve', weight: 25, question: 'Is there verifiable 1:1 collateral in segregated custody?' },
  { dimension: 'Redemption and bankruptcy recourse', weight: 20, question: 'If the issuer defaults, can holders reach the collateral?' },
  { dimension: 'Contract and technical permissions', weight: 15, question: 'Are mint, freeze, upgrade and bridge rights disclosed?' },
  { dimension: 'Secondary liquidity', weight: 15, question: 'Spread, depth, slippage, RFQ fill rate, exit routes.' },
];

export const GRADE_RUBRIC: { grade: Grade; meaning: string }[] = [
  { grade: 'A', meaning: 'Offering documents, custody, proof of reserve, redemption and official contracts all verifiable; genuine two-sided secondary market.' },
  { grade: 'B', meaning: 'Issuer and underlying clear, but redemption is gated by KYC, RFQ, minimums or geography. Size-limited trading only.' },
  { grade: 'C', meaning: 'Price tracking only, or incomplete contract/issuer information, or a very thin book. Not suitable for automated routing.' },
  { grade: 'D', meaning: 'Issuer, underlying, contract or legal rights cannot be confirmed. Exclude.' },
];

export const VETO_CHECKS = [
  { check: 'Issuer', pass: 'Verifiable legal entity, site and offering documents', veto: 'Anonymous team, social accounts only, no issuing entity' },
  { check: 'Underlying', pass: 'Named stock/ETF, ISIN or equivalent, clear ratio', veto: '"Tracks AAPL" with no stated underlying' },
  { check: 'Custody', pass: 'Named regulated custodian, segregated accounts, bankruptcy remoteness', veto: 'No custodian, only "fully reserved"' },
  { check: 'Proof of reserve', pass: 'Public PoR, stated cadence, reconcilable against on-chain supply', veto: 'Marketing claims with no supply-to-collateral view' },
  { check: 'Redemption', pass: 'Stated cash/in-kind redemption, KYC, minimum, timing, fees', veto: 'No redemption terms, or exit depends on one opaque secondary market' },
  { check: 'Contract', pass: 'Official address, verified code, disclosed mint/freeze/upgrade rights', veto: 'Address absent from the issuer site, or unbounded mint authority' },
  { check: 'Instrument type', pass: 'Spot token with a clear wrapper relationship', veto: 'Labelled as stock but actually a perpetual or leveraged product' },
  { check: 'Jurisdiction', pass: "User's region permitted and the venue licensed for it", veto: 'Offering documents bar the region but it is sold anyway' },
];

export const REGULATORY_NOTES = [
  {
    date: '2026-01-30',
    title: 'SEC Statement on Tokenized Securities',
    summary: 'Tokenization changes how a security is recorded and transferred; it does not change its legal character. Whether a third-party token carries voting or dividend rights depends on the structure, never on the name.',
    url: 'https://www.sec.gov/newsroom/speeches-statements/corp-fin-statement-tokenized-securities-012826-statement-tokenized-securities',
  },
  {
    date: '2025-12',
    title: 'DTC no-action letter',
    summary: 'The DTC received SEC no-action relief to run a three-year tokenization pilot.',
    url: 'https://www.dtcc.com/news/2026/may/04/dtcc-advances-development-of-new-tokenization-service',
  },
  {
    date: '2026-09-17',
    title: 'SEC Innovation Exemption',
    summary:
      'Qualifying tokenized securities venues may trade tokenized NMS stock through permissioned AMM pools without registering as an exchange or ATS, subject to caps on instruments and volume; market makers are separately relieved of broker registration. It covers both issuer-direct and unaffiliated third-party tokens. Reported five-year term and equal-rights conditions are secondary readings — check the order itself.',
    url: 'https://www.sec.gov/newsroom/press-releases/2026-90-sec-issues-innovation-exemption-facilitate-trading-tokenized-nms-stock-request-comment',
  },
  {
    date: '2026',
    title: 'Nasdaq same-order-book rule approved',
    summary:
      'Qualifying tokenized stocks and ETFs may trade in the same order book, at the same execution priority, as the traditional share — provided the two are fungible and carry identical rights. DTCC reports 50+ institutions in its tokenization service.',
    url: 'https://www.dechert.com/knowledge/onpoint/2026/3/sec-issues-landmark-interpretation-on-the-application-of-federal.html',
  },
];

/** The structural fork this market now faces. */
export const TWO_PATHS = [
  {
    label: 'Offshore wrappers',
    who: 'xStocks, bStocks, Ondo',
    pros: '24/7 trading, self-custody, composable into DeFi',
    cons: 'No shareholder rights; closed to US persons',
  },
  {
    label: 'Onshore licensed',
    who: 'Nasdaq/DTC rails, TSVs, Dinari, Robinhood’s planned redeemable version',
    pros: 'Full rights, access to US liquidity',
    cons: 'Permissioned, and the licence is the bottleneck',
  },
];
