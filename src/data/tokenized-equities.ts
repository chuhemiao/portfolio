import type { Locale } from '@/lib/i18n';

/**
 * Tokenized US equities tracker.
 *
 * The category's core trap is treating "an AAPL token" as one asset. It is not.
 * An instrument's identity is: underlying share + issuer + legal wrapper + chain
 * + contract address + venue. Two tokens tracking the same stock can differ in
 * collateral, redemption rights and bankruptcy recourse. So the model is two
 * levels — issuers and instruments — rather than one flat table of tickers.
 *
 * Every prose field is a [en, zh, ja] tuple: this site ships all three locales
 * together, and a page whose chrome is translated but whose body is not reads
 * as broken. Every figure carries the date it was measured.
 */

export type L10n = readonly [en: string, zh: string, ja: string];

export const pick = (value: L10n, locale: Locale) =>
  locale === 'zh-CN' ? value[1] : locale === 'ja' ? value[2] : value[0];

export type Wrapper = 'direct-security' | 'tracker-certificate' | 'debt-claim' | 'price-exposure' | 'unknown';
export type Dividend = 'distributed' | 'reinvested' | 'pass-through' | 'none' | 'unknown';
export type Voting = 'full' | 'proxy' | 'planned' | 'none' | 'unknown';
export type UsAccess = 'blocked' | 'accredited' | 'restricted' | 'allowed' | 'unknown';
export type LiquidityKind = 'cex-orderbook' | 'amm' | 'rfq' | 'mixed' | 'unknown';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'unrated';

/** Enum values render as mono tags; these are their localized labels. */
export const WRAPPER_LABEL: Record<Wrapper, L10n> = {
  'direct-security': ['direct security', '直接证券', '直接証券'],
  'tracker-certificate': ['tracker certificate', '跟踪凭证', 'トラッカー証券'],
  'debt-claim': ['issuer claim', '发行方债权', '発行体への請求権'],
  'price-exposure': ['price exposure', '价格敞口', '価格エクスポージャー'],
  unknown: ['unknown', '未知', '不明'],
};

export const VOTING_LABEL: Record<Voting, L10n> = {
  full: ['full', '完整', '完全'],
  proxy: ['proxy', '代理投票', '代理議決'],
  planned: ['planned', '计划中', '予定'],
  none: ['none', '无', 'なし'],
  unknown: ['unknown', '未知', '不明'],
};

export const DIVIDEND_LABEL: Record<Dividend, L10n> = {
  distributed: ['distributed', '现金分配', '現金分配'],
  reinvested: ['reinvested', '再投资', '再投資'],
  'pass-through': ['pass-through', '经济穿透', '経済的パススルー'],
  none: ['none', '无', 'なし'],
  unknown: ['unknown', '未知', '不明'],
};

export const US_LABEL: Record<UsAccess, L10n> = {
  blocked: ['blocked', '不开放', '利用不可'],
  accredited: ['accredited', '合格投资者', '適格投資家'],
  restricted: ['restricted', '受限', '制限あり'],
  allowed: ['allowed', '开放', '利用可'],
  unknown: ['unknown', '未知', '不明'],
};

export const POR_LABEL: Record<'chainlink-por' | 'attestation' | 'none' | 'unknown', L10n> = {
  'chainlink-por': ['Chainlink PoR', 'Chainlink PoR', 'Chainlink PoR'],
  attestation: ['attestation', '自行披露', '自己開示'],
  none: ['none', '无', 'なし'],
  unknown: ['unknown', '未知', '不明'],
};

export const GRADE_LABEL: Record<Grade, L10n> = {
  A: ['A', 'A', 'A'],
  B: ['B', 'B', 'B'],
  C: ['C', 'C', 'C'],
  D: ['D', 'D', 'D'],
  unrated: ['unrated', '未评级', '未評価'],
};

export const UNKNOWN_LABEL: L10n = ['unknown', '未知', '不明'];

// Who issues the token, as distinct from who sells it. The two come apart:
// Backed issues xStocks and three different exchanges sell them, while Binance
// issues bStocks and sells them itself. Self-issuance puts issuance, custody,
// market making and listing inside one entity with no third party between them,
// which is the main axis the issuer table is sorted on.
export type IssuanceModel =
  | 'exchange-self'
  | 'exchange-onchain'
  | 'broker-self'
  | 'independent'
  | 'unknown';

export const ISSUANCE_LABEL: Record<IssuanceModel, L10n> = {
  'exchange-self': ['exchange self-issued', '交易所自营发行', '取引所の自社発行'],
  'exchange-onchain': ['exchange-issued, on-chain only', '交易所发行·仅链上流通', '取引所発行・オンチェーンのみ'],
  'broker-self': ['broker self-issued', '券商自营发行', 'ブローカーの自社発行'],
  independent: ['independent issuer', '独立发行方', '独立した発行体'],
  unknown: UNKNOWN_LABEL,
};

// A venue is not always somewhere you can buy. Aave and Morpho accept these
// tokens as collateral and nothing more, so they are typed separately rather
// than sitting in the same list as Binance.
export type VenueKind = 'cex' | 'dex' | 'lending' | 'aggregator' | 'broker-app';

export const VENUE_KIND_LABEL: Record<VenueKind, L10n> = {
  cex: ['CEX', '中心化交易所', '中央集権取引所'],
  dex: ['DEX', '链上 DEX', 'オンチェーン DEX'],
  lending: ['collateral only', '仅作抵押品', '担保のみ'],
  aggregator: ['aggregator', '聚合器', 'アグリゲーター'],
  'broker-app': ['broker app', '券商 App', 'ブローカーアプリ'],
};

export type Venue = {
  name: string;
  kind: VenueKind;
  /** The venue is run by the issuer itself, so no third party sits between them. */
  operatedByIssuer?: boolean;
};

// xStocks writes BSC where Ondo and bStocks write BNB Chain. Normalised on the
// way in so grouping by chain does not split one chain into two.
const CHAIN_ALIASES: Record<string, string> = { BSC: 'BNB Chain' };

export const normalizeChain = (chain: string): string => CHAIN_ALIASES[chain] ?? chain;

export type Issuer = {
  slug: string;
  name: string;
  entity?: string;
  jurisdiction: L10n;
  wrapper: Wrapper;
  voting: Voting;
  dividend: Dividend;
  redemption: {
    available: boolean | 'unknown';
    kyc: boolean | 'unknown';
    minimumUsd?: number;
    refusable?: boolean;
  };
  proofOfReserve: { kind: 'chainlink-por' | 'attestation' | 'none' | 'unknown' };
  usPersons: UsAccess;
  chains: string[];
  /**
   * What the issuer or an aggregator publishes, not a count of anything we
   * hold. Where src/data/instruments/ has ingested rows, that count wins —
   * this field said 80 for bStocks while CMC listed 105.
   */
  reportedInstrumentCount?: number;
  onchainValueUsd?: number;
  issuanceModel: IssuanceModel;
  venues: Venue[];
  grade: Grade;
  note: L10n;
};

export type ExchangeView = {
  venue: string;
  kind: VenueKind;
  /** Run by the issuer whose tokens it sells -- true only where every issuer here self-operates. */
  operatedByIssuer: boolean;
  issuers: { slug: string; name: string; issuanceModel: IssuanceModel; grade: Grade; onchainValueUsd?: number }[];
  /**
   * On-chain value of the issuers reachable at this venue. NOT additive across
   * venues: xStocks counts once under Kraken, Bybit and OKX alike, so summing
   * this column returns more than the market holds.
   */
  reachableOnchainValueUsd: number;
};

// Inverts ISSUERS, which records where each issuer sells, into the view a
// reader actually wants: what can I buy at this venue, and who issued it.
// Derived rather than maintained by hand -- the hardcoded postCount and
// projectCount both silently rotted, and this would too.
export function buildExchangeIndex(issuers: readonly Issuer[]): ExchangeView[] {
  const byVenue = new Map<string, ExchangeView>();

  for (const issuer of issuers) {
    for (const venue of issuer.venues) {
      let view = byVenue.get(venue.name);
      if (!view) {
        view = {
          venue: venue.name,
          kind: venue.kind,
          operatedByIssuer: true,
          issuers: [],
          reachableOnchainValueUsd: 0,
        };
        byVenue.set(venue.name, view);
      }
      view.issuers.push({
        slug: issuer.slug,
        name: issuer.name,
        issuanceModel: issuer.issuanceModel,
        grade: issuer.grade,
        onchainValueUsd: issuer.onchainValueUsd,
      });
      view.reachableOnchainValueUsd += issuer.onchainValueUsd ?? 0;
      if (!venue.operatedByIssuer) view.operatedByIssuer = false;
    }
  }

  for (const view of byVenue.values()) {
    view.issuers.sort((a, b) => (b.onchainValueUsd ?? 0) - (a.onchainValueUsd ?? 0));
  }

  return [...byVenue.values()].sort(
    (a, b) => b.reachableOnchainValueUsd - a.reachableOnchainValueUsd || a.venue.localeCompare(b.venue)
  );
}

export type TokenRow = { ticker: string; issuerSlug: string | null; marketCapUsd: number; volume24hUsd: number; change7dPct: number };

/**
 * The instrument layer, between issuer and venue. Metadata only: quotes live in
 * a generated snapshot keyed by ticker, so refreshing prices never touches a
 * reviewed file. `underlying.symbol` is null when there is no listed share to
 * point at — a pre-IPO name, or a wrapper CMC has no ticker for.
 */
export type UnderlyingKind =
  | 'common-stock'
  | 'adr'
  | 'etf'
  | 'leveraged-etf'
  | 'inverse-etf'
  | 'pre-ipo'
  | 'unknown';

export const UNDERLYING_KIND_LABEL: Record<UnderlyingKind, L10n> = {
  'common-stock': ['common stock', '普通股', '普通株'],
  adr: ['ADR', 'ADR', 'ADR'],
  etf: ['ETF', 'ETF', 'ETF'],
  'leveraged-etf': ['leveraged ETF', '杠杆 ETF', 'レバレッジ ETF'],
  'inverse-etf': ['inverse ETF', '反向 ETF', 'インバース ETF'],
  'pre-ipo': ['pre-IPO', 'Pre-IPO', 'Pre-IPO'],
  unknown: ['unknown', '未知', '不明'],
};

export type Instrument = {
  ticker: string;
  issuerSlug: string;
  underlying: {
    symbol: string | null;
    name: string;
    kind: UnderlyingKind;
    leverage?: number;
  };
  listedAt: string;
  chains: string[];
  cmcId?: number;
  cmcSlug?: string;
  nameSource?: 'cmc' | 'derived';
};

/** Five instruments sharing one argument; the unit a research article covers. */
export type InstrumentGroup = {
  slug: string;
  index: number;
  issuerSlug: string;
  tickers: string[];
  /** Short sector name for a table cell or a filter. `title` is the article's
   *  headline, which is a sentence, so it cannot do this job. */
  label: L10n;
  title: L10n;
  thesis: L10n;
  /**
   * Filled when the group's article ships. Per-locale slugs rather than a
   * translationKey: article slugs carry their own language, and resolving a key
   * would mean reading the blog index from a page that needs nothing else in it.
   */
  articleSlugs?: Record<Locale, string>;
};

export type MarketSnapshot = {
  date: string;
  source: string;
  sourceUrl: string;
  scope: L10n;
  metrics: { label: L10n; value: string; delta?: string }[];
};

/* ────────────────────────────────────────────────────────────────────────── */

export const DATA_AS_OF = '2026-10-16';

export const MARKET_SNAPSHOTS: MarketSnapshot[] = [
  {
    date: '2026-10-16',
    source: 'rwa.xyz',
    sourceUrl: 'https://app.rwa.xyz/stocks',
    scope: [
      'Includes shares registered on-chain (Securitize, Exodus, Forward Industries, FGRS)',
      '包含以链上形式登记的股份（Securitize、Exodus、Forward Industries、FGRS）',
      'オンチェーン登記株を含む（Securitize、Exodus、Forward Industries、FGRS）',
    ],
    metrics: [
      { label: ['Distributed value', '分发规模', '流通規模'], value: '$3.50B', delta: '+19~24% / 30d' },
      { label: ['Holders', '持有人', '保有者'], value: '4.42M' },
      { label: ['Monthly transfer volume', '月转账量', '月間送金量'], value: '$10.26B', delta: '−73% / 30d' },
      { label: ['Monthly active addresses', '月活地址', '月間アクティブ'], value: '1.386M', delta: '−60% / 30d' },
    ],
  },
  {
    date: '2026-10-15',
    source: 'CoinGecko via Castle Labs',
    sourceUrl: 'https://castlelabs.io/research/tokenized-stocks',
    scope: ['Third-party wrapped tokens only', '仅统计第三方包装的代币', '第三者ラッパーのトークンのみ'],
    metrics: [
      { label: ['Tokens tracked', '追踪代币数', '対象トークン数'], value: '250' },
      { label: ['Total market cap', '合计市值', '時価総額'], value: '$2.50B' },
      { label: ['24h volume', '24h 成交', '24h 出来高'], value: '$1.02B' },
    ],
  },
];

export const ACTIVITY_DIVERGENCE = {
  asOf: '2026-10-16',
  marketCap: '+19~24%',
  transfers: '−73%',
  activeAddresses: '−60%',
  reading: [
    'New supply is settling into custody rather than circulating. Growth here is accumulation, not adoption.',
    '新增的主要是沉淀在托管里的持仓，而不是在流通。这里的增长是囤积，不是采用。',
    '新規供給は流通せず保管に滞留しています。ここでの成長は採用ではなく蓄積です。',
  ] as L10n,
};

export const UNDERLYING_CONCENTRATION: { underlying: string; valueUsd: number; note?: L10n }[] = [
  { underlying: 'Circle (CRCL)', valueUsd: 350_500_000, note: ['Across 5 issuers', '分布在 5 家发行方', '5 社の発行体に分散'] },
  { underlying: 'Strategy STRC', valueUsd: 225_700_000, note: ['Preferred stock', '优先股', '優先株'] },
  { underlying: 'SpaceX', valueUsd: 211_500_000, note: ['Not publicly listed', '未公开上市', '未上場'] },
  { underlying: 'Strategy (MSTR)', valueUsd: 207_000_000 },
  { underlying: 'NVIDIA (NVDA)', valueUsd: 156_000_000 },
];

export const CONCENTRATION_READING: L10n = [
  'Crypto-linked names, high-beta tech, and companies an ordinary brokerage cannot reach.',
  '三类资产：加密概念股、高波动科技股，以及普通券商买不到的标的。',
  '暗号資産関連、高ベータのテック株、一般の証券会社では買えない銘柄の三種類。',
];

export const ISSUERS: Issuer[] = [
  {
    slug: 'ondo',
    name: 'Ondo Stocks',
    entity: 'Ondo Global Markets (BVI)',
    jurisdiction: ['British Virgin Islands', '英属维尔京群岛', '英領バージン諸島'],
    wrapper: 'debt-claim',
    voting: 'proxy',
    dividend: 'unknown',
    redemption: { available: true, kyc: true, refusable: true },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'blocked',
    chains: ['Ethereum', 'BNB Chain', 'Solana', 'HyperEVM'],
    reportedInstrumentCount: 100,
    onchainValueUsd: 984_000_000,
    issuanceModel: 'independent',
    venues: [{ name: 'LI.FI', kind: 'aggregator' }, { name: 'Jupiter', kind: 'dex' }],
    grade: 'B',
    note: [
      'Renamed from Ondo Global Markets in July 2026. Leads on multi-chain reach and DeFi integration. The company claims over 70% issuer share; on CoinGecko’s basis it is roughly a third — treat the 70% as marketing.',
      '2026 年 7 月从 Ondo Global Markets 更名。多链覆盖和 DeFi 集成领先。公司自称发行方份额超过 70%，但按 CoinGecko 口径约三分之一 —— 那个 70% 应视为宣传口径。',
      '2026 年 7 月に Ondo Global Markets から改称。マルチチェーン対応と DeFi 統合で先行。同社はシェア 70% 超と主張しますが、CoinGecko 基準では約三分の一で、70% は広報上の数字と見るべきです。',
    ],
  },
  {
    slug: 'bstocks',
    name: 'bStocks',
    entity: 'BTech Holdings Limited',
    jurisdiction: ['ADGM (FSRA-listed certificates)', 'ADGM（FSRA 正式上市凭证）', 'ADGM（FSRA 上場証券）'],
    wrapper: 'tracker-certificate',
    voting: 'none',
    dividend: 'pass-through',
    redemption: { available: true, kyc: true, minimumUsd: 5 },
    proofOfReserve: { kind: 'attestation' },
    usPersons: 'blocked',
    chains: ['BNB Chain'],
    onchainValueUsd: 914_000_000,
    issuanceModel: 'exchange-self',
    venues: [{ name: 'Binance', kind: 'cex', operatedByIssuer: true }],
    grade: 'B',
    note: [
      'Launched 2026-06-11 and already second by size. The book turns over about 0.66x of its market cap a day, but the activity sits in the tail: the five largest turn 0.38x against 0.92x for the other 95. Dividends take a 30% US withholding deduction before being reinvested through a multiplier. Single chain: BSC deposits only, so a wrong-network transfer loses the asset.',
      '2026-06-11 上线，规模已居第二。全盘日换手约 0.66×，但活跃度在尾部：最大的 5 个只有 0.38×，其余 95 个是 0.92×。分红先扣 30% 美国预扣税，再按乘数复投。单链：只支持 BSC 充值，转错网络会丢失资产。',
      '2026-06-11 開始で既に規模は二位。全体の日次回転率は約 0.66 倍だが、活発なのはテール側で、上位5銘柄は 0.38 倍、残り95銘柄は 0.92 倍。配当は米国源泉 30% を控除後、乗数で再投資。BSC のみ対応のため、誤ったネットワーク送金は資産を失います。',
    ],
  },
  {
    slug: 'xstocks',
    name: 'xStocks (Backed)',
    entity: 'Backed Assets (JE) Limited',
    jurisdiction: ['Jersey', '泽西岛', 'ジャージー島'],
    wrapper: 'tracker-certificate',
    voting: 'none',
    dividend: 'reinvested',
    redemption: { available: true, kyc: true, minimumUsd: 5000 },
    proofOfReserve: { kind: 'chainlink-por' },
    usPersons: 'blocked',
    chains: ['Solana', 'Ethereum', 'Arbitrum', 'BNB Chain', 'TON', 'Tron', 'Mantle', 'Ink', 'Monad', 'Optimism', 'X Layer', 'Hyperliquid'],
    reportedInstrumentCount: 100,
    onchainValueUsd: 847_000_000,
    issuanceModel: 'independent',
    venues: [{ name: 'Kraken', kind: 'cex', operatedByIssuer: true }, { name: 'Bybit', kind: 'cex' }, { name: 'OKX', kind: 'cex' }],
    grade: 'A',
    note: [
      'Widest chain coverage and the most complete public legal documentation. Acquired by Kraken in Dec 2025, putting issuance and trading on one balance sheet. Chainlink proof of reserve updates daily or on a 10% move. Dividends arrive as rebasing, not cash; primary redemption needs KYC and a $5,000 minimum.',
      '链覆盖最广，公开法律文件也最完整。2025 年 12 月被 Kraken 全资收购，发行端与交易端并入同一张资产负债表。Chainlink 储备证明日更，或储备变动超 10% 时更新。分红以 rebasing 形式到账而非现金；一级赎回需 KYC，最低 $5,000。',
      'チェーン対応が最も広く、法的文書の公開も最も充実。2025 年 12 月に Kraken が買収し、発行と取引を同一の財務基盤に統合。Chainlink の準備金証明は日次、または 10% 変動時に更新。配当は現金ではなくリベースで反映され、一次償還は KYC と最低 $5,000 が必要です。',
    ],
  },
  {
    slug: 'robinhood',
    name: 'Robinhood Stock Tokens',
    entity: 'Robinhood Assets (Jersey) Limited',
    jurisdiction: ['Jersey', '泽西岛', 'ジャージー島'],
    wrapper: 'debt-claim',
    voting: 'planned',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: true },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'blocked',
    chains: ['Robinhood Chain'],
    reportedInstrumentCount: 190,
    onchainValueUsd: 151_000_000,
    issuanceModel: 'broker-self',
    venues: [{ name: 'Robinhood app', kind: 'broker-app', operatedByIssuer: true }],
    grade: 'B',
    note: [
      'Tokenized debt securities today, but the only major issuer publicly planning 1:1 redemption into real shares plus voting rights. If that ships it is the first large issuer to return shareholder rights. In the EU it also runs 2,000+ CFD-style products that cannot be withdrawn on-chain.',
      '目前是代币化债务证券，但它是唯一公开计划支持 1:1 赎回成真股并附带投票权的大型发行方。若落地，将是第一家把股东权利还给持有人的大玩家。在欧盟另有 2,000+ 差价合约式产品，不可提到链上。',
      '現状はトークン化債務証券ですが、1:1 の現物償還と議決権を公表している唯一の大手発行体です。実現すれば株主権を返す最初の大手となります。EU では出金不可の CFD 型商品も 2,000 本以上提供しています。',
    ],
  },
  {
    slug: 'remora',
    name: 'Remora rStocks',
    jurisdiction: ['unknown', '未知', '不明'],
    wrapper: 'unknown',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'unknown',
    chains: [],
    onchainValueUsd: 132_000_000,
    issuanceModel: 'unknown',
    venues: [],
    grade: 'unrated',
    note: [
      'Fifth by size with almost no public structural disclosure. Unrated until the issuing entity, custody and redemption terms can be read from primary documents.',
      '规模第五，但几乎没有公开的结构性披露。在能从正式文件读到发行主体、托管与赎回条款之前，不予评级。',
      '規模は五位ですが構造の開示がほとんどありません。発行主体・保管・償還条件を一次資料で確認できるまで評価は保留します。',
    ],
  },
  {
    slug: 'dinari',
    name: 'Dinari dShares',
    jurisdiction: ['United States', '美国', '米国'],
    wrapper: 'direct-security',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: true, kyc: true },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'accredited',
    chains: ['Ethereum', 'Arbitrum', 'Avalanche', 'Base'],
    reportedInstrumentCount: 724,
    issuanceModel: 'independent',
    venues: [],
    grade: 'B',
    note: [
      'The only issuer here open to US persons at all, and then only to accredited investors. Underlying held with a qualified custodian. Widest instrument coverage in the category — the full S&P 500.',
      '这张表上唯一对美国用户开放的发行方，且仅限合格投资者。底层由合格托管机构持有。标的覆盖最广 —— 完整的标普 500。',
      '米国居住者に開かれている唯一の発行体ですが、適格投資家に限られます。原資産は適格カストディアンが保管。銘柄カバレッジは最広で S&P 500 全体に及びます。',
    ],
  },
  {
    slug: 'backpack',
    name: 'Backpack Securities',
    jurisdiction: ['unknown', '未知', '不明'],
    wrapper: 'unknown',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'unknown',
    chains: ['Solana'],
    onchainValueUsd: 30_980_000,
    issuanceModel: 'exchange-self',
    venues: [{ name: 'Backpack', kind: 'cex', operatedByIssuer: true }],
    grade: 'unrated',
    note: [
      'Exchange issuing its own tokens — the pattern now common to Coinbase, Robinhood and Binance.',
      '交易所自己发行代币 —— Coinbase、Robinhood、Binance 现在都走这条路。',
      '取引所が自ら発行するパターン。Coinbase、Robinhood、Binance も同様です。',
    ],
  },
  {
    slug: 'coinbase',
    name: 'Coinbase (Base)',
    jurisdiction: ['ADGM-regulated', '受 ADGM 监管', 'ADGM 規制下'],
    wrapper: 'direct-security',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: true },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'blocked',
    chains: ['Base'],
    reportedInstrumentCount: 10,
    onchainValueUsd: 7_500_000,
    issuanceModel: 'exchange-onchain',
    venues: [{ name: 'Uniswap', kind: 'dex' }, { name: 'Aerodrome', kind: 'dex' }, { name: 'Aave', kind: 'lending' }, { name: 'Morpho', kind: 'lending' }],
    grade: 'B',
    note: [
      'Launched 2026-08-24 with NVDAc, METAc, AAPLc and GOOGLc; shares held 1:1 by Alpaca. Thirteen contracts deployed, only four with supply. The most DeFi-native of the set: tradable on Uniswap and Aerodrome, usable as Aave collateral, borrowable against on Morpho.',
      '2026-08-24 首发 NVDAc、METAc、AAPLc、GOOGLc，股票由 Alpaca 1:1 持有。共部署 13 个合约，只有 4 个有流通量。DeFi 属性最强：可在 Uniswap 和 Aerodrome 交易，可作 Aave 抵押品，可在 Morpho 借贷。',
      '2026-08-24 に NVDAc、METAc、AAPLc、GOOGLc を開始。株式は Alpaca が 1:1 で保有。13 契約を展開も流通は 4 銘柄のみ。DeFi 親和性が最も高く、Uniswap と Aerodrome で取引、Aave の担保、Morpho での借入に利用できます。',
    ],
  },
  {
    slug: 'reality',
    name: 'Reality rTokens',
    jurisdiction: ['unknown', '未知', '不明'],
    wrapper: 'debt-claim',
    voting: 'none',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'blocked',
    chains: ['Arbitrum', 'Morph'],
    reportedInstrumentCount: 36,
    issuanceModel: 'exchange-self',
    venues: [{ name: 'Bitget', kind: 'cex', operatedByIssuer: true }],
    grade: 'C',
    note: [
      'Shares held through Alpaca Securities; holders do not own the stock directly. Replaced the Ondo tokens Bitget previously listed.',
      '股票通过 Alpaca Securities 持有，用户不直接拥有股份。已替换 Bitget 此前上架的 Ondo 代币。',
      '株式は Alpaca Securities 経由で保有され、利用者が直接所有するわけではありません。Bitget が以前上場していた Ondo トークンを置き換えました。',
    ],
  },
  {
    slug: 'prestocks',
    name: 'ST0x / PreStocks',
    jurisdiction: ['unknown', '未知', '不明'],
    wrapper: 'unknown',
    voting: 'unknown',
    dividend: 'unknown',
    redemption: { available: 'unknown', kyc: 'unknown' },
    proofOfReserve: { kind: 'unknown' },
    usPersons: 'unknown',
    chains: ['Base'],
    onchainValueUsd: 20_350_000,
    issuanceModel: 'unknown',
    venues: [],
    grade: 'unrated',
    note: [
      'Small issuers; PreStocks accounts for the figure shown.',
      '小型发行方，表中数字来自 PreStocks。',
      '小規模発行体で、表の数値は PreStocks のものです。',
    ],
  },
];

/**
 * Hand-collected rows for issuers with no ingested instrument list, dated
 * DATA_AS_OF. The bStocks rows that used to sit here are gone: /stocks now
 * renders that issuer's full list from the quote snapshot, and leaving both in
 * showed two different market caps for CRCLB on one page. Anything added here
 * must belong to an issuer that is absent from src/data/instruments/.
 */
export const TOP_TOKENS: TokenRow[] = [
  { ticker: 'STRCX', issuerSlug: 'xstocks', marketCapUsd: 158_900_000, volume24hUsd: 442_000, change7dPct: -0.4 },
  { ticker: 'MSTRX', issuerSlug: 'xstocks', marketCapUsd: 110_500_000, volume24hUsd: 3_300_000, change7dPct: -8.7 },
  { ticker: 'CRCLX', issuerSlug: 'xstocks', marketCapUsd: 93_200_000, volume24hUsd: 26_700_000, change7dPct: -4.0 },
  { ticker: 'CRCLON', issuerSlug: 'ondo', marketCapUsd: 92_400_000, volume24hUsd: 619_000, change7dPct: -4.6 },
  { ticker: 'TSLAX', issuerSlug: 'xstocks', marketCapUsd: 67_900_000, volume24hUsd: 8_800_000, change7dPct: -3.8 },
];

// The old wording said SPCXB trades roughly its own market cap in a day. The
// snapshot puts it at 0.458x, and SPCXB is no longer one of these rows anyway.
export const TURNOVER_READING: L10n = [
  'Turnover separates these tokens more sharply than size does: it runs from 0.003x on STRCX to 0.286x on CRCLX, a hundredfold spread at market caps of the same order. Both ends are xStocks rows, so this is not a difference between issuers.',
  '换手率比规模更能区分这几个标的：从 STRCX 的 0.003× 到 CRCLX 的 0.286×，规模同在一个量级，换手却相差上百倍。两头都是 xStocks 的标的，所以这不是发行方之间的差别。',
  '回転率は規模以上にこれらの銘柄を分けます。STRCX の 0.003 倍から CRCLX の 0.286 倍まで、時価総額は同じ桁なのに百倍以上の開きがあります。両端はいずれも xStocks の銘柄であり、発行体間の差ではありません。',
];

/** Case study, 2026-09-19 — older than the rest of this file, kept because the
 *  structural point does not expire: one stock, four issuers, four books. */
export const AAPL_CASE_STUDY = {
  asOf: '2026-09-19',
  underlyingClose: '$335.19',
  lede: [
    'A Saturday. The underlying last closed at $335.19, yet all four tokens kept trading. Off-hours quotes are a market maker’s opinion, not a market price.',
    '周六。底层股票最后收于 $335.19，但四个代币仍在交易。非交易时段的报价是做市商的意见，不是市场价格。',
    '土曜日。原資産は $335.19 で引けましたが、四つのトークンは取引を継続。休場中の気配はマーケットメイカーの提示であり市場価格ではありません。',
  ] as L10n,
  rows: [
    {
      ticker: 'AAPLB', issuerSlug: 'bstocks', chain: 'BNB Chain', venue: 'Binance',
      address: '0x431a3bee82e2ca41e49895cbece5bb0f76a89b7a',
      volume24hUsd: 822_000, spreadBps: 0.3, bidDepthUsd: 56_300, askDepthUsd: 8_800, premiumPct: -0.02,
      note: [
        'Tightest quote in the set, but ask depth is a sixth of bid depth. A narrow spread is not two-sided depth.',
        '报价最紧，但卖盘深度只有买盘的六分之一。窄价差不等于两边都有深度。',
        '最も狭い気配ですが、売り板は買い板の六分の一。狭いスプレッドは両側の厚みを意味しません。',
      ] as L10n,
    },
    {
      ticker: 'AAPLX', issuerSlug: 'xstocks', chain: 'Solana / EVM', venue: 'Bybit',
      address: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp',
      volume24hUsd: 158_000, spreadBps: 2.68, bidDepthUsd: 18_000, askDepthUsd: 175_000, premiumPct: 0.32,
      note: [
        'Thick on the ask, thin on the bid — getting in and getting out are not symmetric.',
        '卖盘厚、买盘薄 —— 买得进和卖得出并不对称。',
        '売り板は厚く買い板は薄い。買える量と売れる量は対称ではありません。',
      ] as L10n,
    },
    {
      ticker: 'AAPLON', issuerSlug: 'ondo', chain: 'Ethereum / Solana', venue: 'Gate',
      address: '0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c',
      volume24hUsd: 94_700, spreadBps: 5.65, bidDepthUsd: 16_200, askDepthUsd: 12_000, premiumPct: 0.21,
      note: [
        'Balanced but small. Fine for small limit orders, not for size without live RFQ.',
        '相对均衡但规模小。小额限价单可以，没有实时 RFQ 时不适合放大仓位。',
        'バランスは取れていますが小規模。小口の指値なら可、RFQ なしでのサイズ拡大には不向きです。',
      ] as L10n,
    },
    {
      ticker: 'AAPLG', issuerSlug: null, chain: null, venue: 'Gate',
      volume24hUsd: 445_500, spreadBps: 53.3, bidDepthUsd: 5_600, askDepthUsd: 9_300, premiumPct: -0.02,
      note: [
        'Issuer could not be resolved in the mapping. High volume, 50x the spread, almost no depth — volume alone must never qualify an instrument.',
        '发行方在映射中无法解析。成交量不低，价差却是别人的 50 倍，深度几乎没有 —— 成交量本身永远不能作为入选理由。',
        '発行体をマッピングで特定できず。出来高はあるがスプレッドは 50 倍、板はほぼ無し。出来高だけで採用してはいけません。',
      ] as L10n,
    },
  ],
};

export const METHOD_NOTE: L10n = [
  'Volume is 24h base quantity × last price. Depth is the top 20 levels converted at mid, not full book depth. Contract addresses come from a mapping snapshot marked "observed" — never an issuer whitelist.',
  '成交额为 24h 基础资产数量 × 最新成交价折算；深度为买卖盘前 20 档按中间价估算，不等于完整订单簿。合约地址来自标记为 observed 的映射快照，不是发行方白名单。',
  '出来高は 24h 数量 × 直近価格、板は上位 20 段を仲値換算した推定で全板ではありません。コントラクトアドレスは observed 状態のマッピングであり、発行体のホワイトリストではありません。',
];

export const WATCH_SIGNALS: L10n[] = [
  ['Which venues file for and receive the first TSV approvals.', '首批 TSV 的牌照申请与上线名单。', '最初の TSV 認可を申請・取得する取引場所。'],
  ['When Robinhood’s 1:1 redemption and voting rights actually ship.', 'Robinhood 的 1:1 赎回与投票权何时真正落地。', 'Robinhood の 1:1 償還と議決権がいつ実装されるか。'],
  ['Whether rwa.xyz monthly active addresses stop falling.', 'rwa.xyz 的月活地址能否止跌。', 'rwa.xyz の月間アクティブアドレスが下げ止まるか。'],
  ['Share movement between Ondo, bStocks and xStocks.', 'Ondo、bStocks、xStocks 三家的份额变化。', 'Ondo、bStocks、xStocks のシェア変動。'],
  ['The volume gap between Hyperliquid stock perps and spot tokens.', 'Hyperliquid 股票永续与现货代币之间的成交量差距。', 'Hyperliquid の株式無期限先物と現物トークンの出来高差。'],
];

export const WRAPPER_RUBRIC: { kind: Wrapper; meaning: L10n }[] = [
  {
    kind: 'direct-security',
    meaning: [
      'The token is the registered share. Dividends and voting survive. Usually permissioned and KYC-gated.',
      '代币就是登记在册的股份。分红和投票权都保留。通常是许可制并需要 KYC。',
      'トークン自体が登録株式。配当も議決権も残ります。多くは許可制で KYC が必要です。',
    ],
  },
  {
    kind: 'tracker-certificate',
    meaning: [
      'A bearer debt instrument over a share held by a custodian. Economic exposure only; no voting. Recourse runs to the collateral, not to the company.',
      '针对托管股份的不记名债务凭证。只有经济敞口，没有投票权。追索指向抵押品，而不是公司。',
      'カストディアンが保有する株式に対する無記名債務証券。経済的エクスポージャーのみで議決権なし。遡求先は担保であり企業ではありません。',
    ],
  },
  {
    kind: 'debt-claim',
    meaning: [
      'A claim on the issuer, collateral held off-chain. If the issuer fails you are a creditor, not a shareholder.',
      '对发行方的债权，抵押品在链下。发行方违约时，你是债权人，不是股东。',
      '発行体への請求権で、担保はオフチェーン。発行体が破綻すれば株主ではなく債権者です。',
    ],
  },
  {
    kind: 'price-exposure',
    meaning: [
      'No share held against it. A derivative wearing a ticker.',
      '背后没有任何股票。一个套着股票代码的衍生品。',
      '裏付けとなる株式はありません。ティッカーを被せたデリバティブです。',
    ],
  },
];

/** Compact legend for the grade column; `meaning` is the full definition. */
export const GRADE_RUBRIC: { grade: Grade; short: L10n; meaning: L10n }[] = [
  {
    grade: 'A',
    short: ['documents, reserves and redemption all verifiable', '文件、储备与赎回均可核验', '書類・準備金・償還をすべて検証可能'],
    meaning: [
      'Offering documents, custody, proof of reserve, redemption and official contracts all verifiable; genuine two-sided secondary market.',
      '发行文件、托管、储备证明、赎回机制与官方合约均可核验；二级市场有真实双向流动性。',
      '発行書類・保管・準備金証明・償還・公式コントラクトがすべて検証可能で、二次市場に実質的な両側流動性がある。',
    ],
  },
  {
    grade: 'B',
    short: ['clear, but redemption is gated', '清晰，但赎回受限', '明確だが償還に制限'],
    meaning: [
      'Issuer and underlying clear, but redemption is gated by KYC, RFQ, minimums or geography. Size-limited trading only.',
      '发行方和底层资产清晰，但赎回受 KYC、RFQ、最低金额或地区限制。只适合限额交易。',
      '発行体と原資産は明確だが、償還が KYC・RFQ・最低金額・地域で制限される。限度額付きの取引のみ。',
    ],
  },
  {
    grade: 'C',
    short: ['information or liquidity incomplete', '信息或流动性不完整', '情報または流動性が不十分'],
    meaning: [
      'Price tracking only, or incomplete contract/issuer information, or a very thin book. Not suitable for automated routing.',
      '只有价格跟踪，或合约/发行方信息不完整，或订单簿极薄。不适合自动路由。',
      '価格追従のみ、または契約・発行体情報が不完全、もしくは板が極端に薄い。自動ルーティングには不適。',
    ],
  },
  {
    grade: 'D',
    short: ['cannot be confirmed — exclude', '无法确认，排除', '確認不能のため除外'],
    meaning: [
      'Issuer, underlying, contract or legal rights cannot be confirmed. Exclude.',
      '发行方、底层、合约或法律权利无法确认。排除。',
      '発行体・原資産・契約・法的権利が確認できない。除外。',
    ],
  },
  {
    grade: 'unrated',
    short: ['too little disclosure to grade', '披露不足，暂不评级', '開示不足で評価保留'],
    meaning: [
      'Not enough public structural disclosure to place it on the scale.',
      '公开的结构性披露不足，无法纳入评级。',
      '構造に関する公開情報が不足し、評価対象にできない。',
    ],
  },
];

export const REGULATORY_NOTES: { date: string; title: L10n; summary: L10n; url: string }[] = [
  {
    date: '2026-01-30',
    title: ['SEC Statement on Tokenized Securities', 'SEC 代币化证券声明', 'SEC トークン化証券に関する声明'],
    summary: [
      'Tokenization changes how a security is recorded and transferred; it does not change its legal character. Whether a third-party token carries voting or dividend rights depends on the structure, never on the name.',
      '代币化改变的是证券的记录和转移方式，不改变其法律属性。第三方代币是否带有投票权或分红权，取决于结构，而不是名称。',
      'トークン化は証券の記録・移転方法を変えるだけで、法的性質は変えません。第三者トークンに議決権や配当権があるかは構造次第で、名称では決まりません。',
    ],
    url: 'https://www.sec.gov/newsroom/speeches-statements/corp-fin-statement-tokenized-securities-012826-statement-tokenized-securities',
  },
  {
    date: '2025-12',
    title: ['DTC no-action letter', 'DTC 不行动函', 'DTC ノーアクションレター'],
    summary: [
      'The DTC received SEC no-action relief to run a three-year tokenization pilot.',
      'DTC 获得 SEC 不行动函，开展为期三年的代币化试点。',
      'DTC は SEC のノーアクションを得て三年間のトークン化パイロットを開始しました。',
    ],
    url: 'https://www.dtcc.com/news/2026/may/04/dtcc-advances-development-of-new-tokenization-service',
  },
  {
    date: '2026-09-17',
    title: ['SEC Innovation Exemption', 'SEC Innovation Exemption', 'SEC イノベーション免除'],
    summary: [
      'Qualifying tokenized securities venues may trade tokenized NMS stock through permissioned AMM pools without registering as an exchange or ATS, subject to caps on instruments and volume; market makers are separately relieved of broker registration. It covers both issuer-direct and unaffiliated third-party tokens. Reported five-year term and equal-rights conditions are secondary readings — check the order itself.',
      '符合条件的代币化证券交易场所（TSV）可通过许可制 AMM 流动性池交易代币化 NMS 股票，无需注册为交易所或 ATS，但标的数量和成交量有上限；做市方另有豁免，不必注册为券商。范围同时覆盖发行人自发和无关联第三方发行的代币。外界转述的五年期限与权利对等条件属二手解读，应以命令原文为准。',
      '適格なトークン化証券取引場所（TSV）は、許可制 AMM プールを通じてトークン化 NMS 株を取引でき、取引所や ATS への登録は不要です（銘柄数と出来高に上限）。マーケットメイカーもブローカー登録を免除されます。発行体自身と無関係な第三者の双方を対象とします。五年間という期限や権利同等の条件は二次情報のため、命令原文の確認が必要です。',
    ],
    url: 'https://www.sec.gov/newsroom/press-releases/2026-90-sec-issues-innovation-exemption-facilitate-trading-tokenized-nms-stock-request-comment',
  },
  {
    date: '2026',
    title: ['Nasdaq same-order-book rule approved', 'Nasdaq 同一订单簿规则获批', 'Nasdaq 同一板ルール承認'],
    summary: [
      'Qualifying tokenized stocks and ETFs may trade in the same order book, at the same execution priority, as the traditional share — provided the two are fungible and carry identical rights. DTCC reports 50+ institutions in its tokenization service.',
      '符合条件的代币化股票和 ETF 可以与传统股票在同一个订单簿、按同样的执行优先级交易，前提是两者可互换且权利相同。DTCC 表示已有 50 多家机构加入其代币化服务。',
      '適格なトークン化株式・ETF は、代替可能で権利が同一であることを条件に、従来株と同じ板・同じ執行優先度で取引できます。DTCC は 50 社超が同サービスに参加と公表しています。',
    ],
    url: 'https://www.dechert.com/knowledge/onpoint/2026/3/sec-issues-landmark-interpretation-on-the-application-of-federal.html',
  },
];
