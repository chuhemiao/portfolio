import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import primary from './instruments/bstocks-primary-facts.json' with { type: 'json' };
import sec from './instruments/bstocks-sec.json' with { type: 'json' };
import dexPools from './instruments/bstocks-dex-pools.json' with { type: 'json' };
import depthSnapshot from './instruments/bstocks-dex-depth.json' with { type: 'json' };
import metricSnapshot from './instruments/bstocks-metric-depth.json' with { type: 'json' };
import wbnbPools from './instruments/bstocks-wbnb-pools.json' with { type: 'json' };
import wbnbSnapshot from './instruments/bstocks-wbnb-depth.json' with { type: 'json' };
import displayUnitsSnapshot from './instruments/bstocks-display-units.json' with { type: 'json' };
import v2ReserveSnapshot from './instruments/bstocks-v2-reserves.json' with { type: 'json' };
import v3DepthOnlySnapshot from './instruments/bstocks-v3-depth-only.json' with { type: 'json' };
import infinitySnapshot from './instruments/bstocks-infinity-quotes.json' with { type: 'json' };
import infinityFollowUpSnapshot from './instruments/bstocks-infinity-quotes-followup.json' with { type: 'json' };
import uniswapV4Snapshots from './instruments/bstocks-uniswap-v4-quotes.json' with { type: 'json' };
import uniswapV4EthSnapshot from './instruments/bstocks-uniswap-v4-eth-depth.json' with { type: 'json' };
import prospectusSnapshot from './instruments/bstocks-prospectuses.json' with { type: 'json' };
import { BSC_DEPTH_QUOTES, BSC_DEPTH_VENUES, BSC_METRIC_DEPTH, BSC_UNISWAP_V4, adgmProspectuses, bscTokenDisplayUnits, dexPoolDepth, metricPoolDepth, pancakeInfinityQuotes, pancakeV2Reserves, supplementFilings, uniswapV4EthDepth, uniswapV4Quotes, type AdjustedHistory, type MatchedPremium, type NativeMarket, type StockFundamentals } from '@/lib/bstocks-study';
import { getInstrument } from './instruments';
import type { Instrument } from './tokenized-equities';

type LocalStock = { isin: string; market?: NativeMarket; history?: AdjustedHistory; premium?: MatchedPremium };
let cache: Record<string, LocalStock> | undefined;

function localFiles(): Record<string, LocalStock> {
  if (cache) return cache;
  try {
    const data = JSON.parse(readFileSync(join(process.cwd(), '.generated', 'bstocks-study.json'), 'utf8'));
    cache = data?.version === 1 && data.rows && typeof data.rows === 'object' && !Array.isArray(data.rows) ? data.rows : {};
  } catch {
    cache = {};
  }
  return cache ?? {};
}

const reviewed = primary as Record<string, StockFundamentals>;
const imported = sec as Record<string, StockFundamentals & { isin: string; observedAt: string }>;
const corporateActions = [
  {
    kind: 'split',
    ticker: 'SNDKB',
    isin: 'AE000A4AVAX4',
    symbol: 'SNDK',
    contract: '0x3ee4df61bd4f867e349beae8bfe07bc31b4850fb',
    sharesAfterSplit: 8,
    legalAt: '2026-11-19T21:01:00Z',
    issuerSource: 'https://www.sec.gov/Archives/edgar/data/2023554/000162828026075127/sndk-20261119.htm',
    snapshotAt: '2026-11-20T01:00:00Z',
    scheduledResumeAt: '2026-11-20T09:00:00Z',
    announcement: 'https://www.binance.com/en/support/announcement/detail/ec32e6657ae341b3b57f1b154c330c6d',
    before: { number: 134603490, timestamp: '2026-11-20T00:59:59.600Z', displayUnits: '1' },
    after: { number: 134603491, timestamp: '2026-11-20T01:00:00.050Z', displayUnits: '8' },
  },
  {
    kind: 'dividend',
    ticker: 'MUB',
    isin: 'AE000A4AVAY2',
    symbol: 'MU',
    contract: '0xcdf2f3e0fa43c47a6662a91c9e4a7c5f69762699',
    dividendPerShareUsd: 0.15,
    declaredOn: '2026-09-30',
    issuerSource: 'https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fourth-Quarter-and-Full-Year-2026-Results/',
    snapshotAt: '2026-10-14T00:00:00Z',
    announcement: 'https://www.binance.com/en/support/announcement/detail/d1cd2ab0a2064dedb14121df74538cf8',
    before: { number: 127494945, timestamp: '2026-10-13T23:59:59.900Z', displayUnits: '1.000107512568805603' },
    after: { number: 127494946, timestamp: '2026-10-14T00:00:00.350Z', displayUnits: '1.000217357013353696' },
  },
] as const;

export type BstockCorporateAction = typeof corporateActions[number];
const bnbPools = new Map(([[wbnbPools, BSC_DEPTH_QUOTES.WBNB], [dexPools, BSC_DEPTH_QUOTES.USDT]] as const).flatMap(([manifest, quote]) => {
  if (manifest.version !== 1 || manifest.network !== 'bsc' || manifest.quote.symbol !== quote.symbol || manifest.quote.contract !== quote.contract) return [];
  return Object.entries(manifest.pools).map(([base, pool]) => [base, { ...pool, quote }] as const);
}));
const depthOnlyPools = v3DepthOnlySnapshot.pools as Record<string, (typeof v3DepthOnlySnapshot.pools)[keyof typeof v3DepthOnlySnapshot.pools]>;
const aaplComparison = { ...v3DepthOnlySnapshot, ...v3DepthOnlySnapshot.aaplComparison };
const aaplV3Pool = aaplComparison.pools['0x431a3bee82e2ca41e49895cbece5bb0f76a89b7a'];
const infinitySnapshots = [infinitySnapshot, infinityFollowUpSnapshot];
const BINANCE_UNDERLYING_QUOTES = new Set(Object.entries({
  NASDAQ: [
    'AAOIB:AAOI', 'AAPLB:AAPL', 'ADBEB:ADBE', 'AGPUB:AGPU', 'ALABB:ALAB', 'AMATB:AMAT',
    'AMDB:AMD', 'AMZNB:AMZN', 'ANTB:ANT', 'APPB:APP', 'ARMB:ARM', 'ASMLB:ASML',
    'ASTSB:ASTS', 'AVGOB:AVGO', 'AXTIB:AXTI', 'BNCB:BNC', 'BOTB:BOT', 'BSPB:BSP',
    'CBRSB:CBRS', 'COINB:COIN', 'CRDOB:CRDO', 'CRWDB:CRWD', 'CRWVB:CRWV', 'CYPHB:CYPH',
    'DJTB:DJT', 'EWZSB:EWZS', 'FLNCB:FLNC', 'FWDIB:FWDI', 'GOOGLB:GOOGL', 'GPROB:GPRO',
    'HOODB:HOOD', 'INTCB:INTC', 'INTWB:INTW', 'IRENB:IREN', 'LITEB:LITE', 'MDBB:MDB',
    'MELIB:MELI', 'METAB:META', 'MRNAB:MRNA', 'MRVLB:MRVL', 'MSFTB:MSFT', 'MSTRB:MSTR',
    'MUB:MU', 'MUUB:MUU', 'MVLLB:MVLL', 'NBISB:NBIS', 'NFLXB:NFLX', 'NVDAB:NVDA',
    'PDDB:PDD', 'PENGB:PENG', 'PLTRB:PLTR', 'PYPLB:PYPL', 'QCOMB:QCOM', 'QNTB:QNT',
    'QQQB:QQQ', 'RKLBB:RKLB', 'SHAZB:SHAZ', 'SKDDB:SKDD', 'SKHYB:SKHY', 'SKUUB:SKUU',
    'SMCIB:SMCI', 'SMHB:SMH', 'SNDKB:SNDK', 'SPCXB:SPCX', 'SQQQB:SQQQ', 'STXB:STX',
    'TQQQB:TQQQ', 'TSLAB:TSLA', 'USARB:USAR', 'USDEB:USDE', 'WDCB:WDC', 'WENB:WEN', 'ZMB:ZM',
  ],
  NYSE: [
    'AMCB:AMC', 'BABAB:BABA', 'BBB:BB', 'BEB:BE', 'BMNRB:BMNR', 'BRKBB:BRK.B',
    'COHRB:COHR', 'CRCLB:CRCL', 'CRMB:CRM', 'DELLB:DELL', 'GEVB:GEV', 'GLWB:GLW',
    'GMEB:GME', 'GSB:GS', 'HIMSB:HIMS', 'HPEB:HPE', 'IBMB:IBM', 'JPMB:JPM',
    'LLYB:LLY', 'NOKB:NOK', 'NUB:NU', 'ORCLB:ORCL', 'RDDTB:RDDT', 'SECZB:SECZ', 'TSMB:TSM', 'VSTB:VST',
  ],
  'NYSE ARCA': [
    'EWJB:EWJ', 'EWTB:EWT', 'EWYB:EWY', 'EWZB:EWZ', 'IWMB:IWM', 'KORUB:KORU',
    'KSTRB:KSTR', 'SOXLB:SOXL', 'SOXSB:SOXS', 'SPYB:SPY', 'TMFB:TMF',
  ],
  'CBOE BZX': ['DRAMB:DRAM', 'SNXXB:SNXX', 'UVXYB:UVXY'],
}).flatMap(([exchange, listings]) => listings.map(listing => `${exchange}:${listing}`)));

export function getBstockStudy(instrument: Instrument) {
  const { ticker, listing, underlying } = instrument;
  if (instrument.issuerSlug !== 'bstocks' || !listing) return null;
  const pinned = reviewed[ticker]?.symbol === underlying.symbol ? reviewed[ticker] : undefined;
  const secRow = imported[ticker]?.isin === listing.isin && imported[ticker].symbol === underlying.symbol ? imported[ticker] : undefined;
  const local = localFiles()[ticker];
  const now = local?.isin === listing.isin ? local : undefined;
  const facts = pinned ?? secRow;
  const filings = pinned?.cik && secRow && pinned.cik === secRow.cik
    ? supplementFilings(pinned.filings, secRow.filings)
    : facts?.filings ?? [];
  const exchange = underlying.exchange ?? facts?.exchange;
  const history = now?.history?.symbol === underlying.symbol && now.history.exchange === exchange ? now.history : undefined;
  const premium = now?.premium?.underlyingSymbol === underlying.symbol && now.premium.underlyingExchange === exchange ? now.premium : undefined;
  const base = listing.contractAddress?.toLowerCase() ?? '';
  const onBnb = instrument.chains.includes('BNB Chain');
  const registered = getInstrument('bstocks', ticker);
  const binanceUnderlying = onBnb && base && underlying.symbol && registered?.underlying.symbol === underlying.symbol &&
    registered.listing?.isin === listing.isin && registered.listing.contractAddress?.toLowerCase() === base &&
    BINANCE_UNDERLYING_QUOTES.has(`${exchange}:${ticker}:${underlying.symbol}`) ? underlying.symbol : undefined;
  const corporateAction = onBnb ? corporateActions.find(action => ticker === action.ticker && underlying.symbol === action.symbol &&
    listing.isin === action.isin && base === action.contract) : undefined;
  const pool = onBnb ? bnbPools.get(base) : undefined;
  const displayUnits = onBnb ? bscTokenDisplayUnits(displayUnitsSnapshot, base, ticker, listing.isin) : null;
  const prospectuses = adgmProspectuses(prospectusSnapshot, ticker, listing.isin);
  const terms = prospectuses?.certificate;
  const certificate = terms && terms.symbol === underlying.symbol ? terms : undefined;
  const depth = pool?.venue === BSC_METRIC_DEPTH.venue ? metricPoolDepth(metricSnapshot, base, pool, pool.quote.contract)
    : pool ? dexPoolDepth(pool.quote.symbol === 'WBNB' ? wbnbSnapshot : depthSnapshot, base, pool, pool.quote.contract) : null;
  const depthOnly = onBnb && !pool ? depthOnlyPools[base] : undefined;
  const usdt = BSC_DEPTH_QUOTES.USDT;
  const depthOnlyProof = depthOnly?.ticker === ticker && depthOnly.isin === listing.isin &&
    depthOnly.token0 === usdt.contract && depthOnly.token1 === base && depthOnly.feePips === 10_000
    ? dexPoolDepth(v3DepthOnlySnapshot, base, depthOnly, usdt.contract) : null;
  const supplementalDepth = depthOnly && depthOnlyProof ? { pool: depthOnly.pool, venue: depthOnly.venue, proof: depthOnlyProof } : null;
  const aaplDepth = pool?.venue === BSC_METRIC_DEPTH.venue && aaplV3Pool.ticker === ticker && aaplV3Pool.isin === listing.isin &&
    aaplV3Pool.token0 === base && aaplV3Pool.token1 === usdt.contract && aaplV3Pool.venue === 'PancakeSwap v3' && aaplV3Pool.feePips === 100 && aaplV3Pool.marginal
    ? dexPoolDepth(aaplComparison, base, aaplV3Pool, usdt.contract) : null;
  const ethDepth = pool?.venue === BSC_METRIC_DEPTH.venue && ticker === 'SNXXB' ? uniswapV4EthDepth(uniswapV4EthSnapshot, base, ticker, listing.isin) : null;
  const poolDepthComparison = aaplDepth ? {
    address: aaplV3Pool.pool, venue: 'PancakeSwap v3', quote: usdt.symbol, proof: aaplDepth, feePips: aaplV3Pool.feePips,
    registry: BSC_DEPTH_VENUES['PancakeSwap v3'].registry,
  } : ethDepth ? {
    address: ethDepth.poolId, venue: 'Uniswap v4', quote: ethDepth.quote, proof: ethDepth.proof, feePips: ethDepth.feePips,
    registry: BSC_UNISWAP_V4.registry, manager: BSC_UNISWAP_V4.manager,
  } : null;
  const v2Reserves = onBnb && !pool && !supplementalDepth ? pancakeV2Reserves(v2ReserveSnapshot, base, ticker, listing.isin) : null;
  const needsClPool = onBnb && !pool && !supplementalDepth && !v2Reserves;
  const infinityQuotes = needsClPool ? pancakeInfinityQuotes(infinitySnapshots, base, ticker, listing.isin) : null;
  const uniswapQuotes = needsClPool && !infinityQuotes ? uniswapV4Quotes(uniswapV4Snapshots, base, ticker, listing.isin) : null;
  return { market: now?.market, facts, filings, exchange, history, premium, pool, depth, supplementalDepth, poolDepthComparison, v2Reserves, infinityQuotes, uniswapQuotes, displayUnits, certificate, prospectuses, corporateAction, binanceUnderlying };
}
