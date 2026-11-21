export const BINANCE_MARKET_SOURCE = 'https://data-api.binance.vision/api/v3';
export const ADGM_PROSPECTUS_DIRECTORY = 'https://www.adgm.com/financial-services-regulatory-authority/listing-authority/approved-prospectuses/';
export const BEP_677_STANDARD = 'https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-677.md';
export const BSC_DEPTH_RPC = 'https://bsc-dataseed-public.bnbchain.org';
export const BSC_DEPTH_QUOTES = {
  USDT: { symbol: 'USDT', contract: '0x55d398326f99059ff775485246999027b3197955', decimals: 18 },
  WBNB: { symbol: 'WBNB', contract: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', decimals: 18 },
} as const;
export const BSC_MULTICALL3 = {
  address: '0xca11bde05977b3631167028862be2a173976ca11',
  runtimeSha256: '2756d7c52baee85cacb504f6ee1df7aad6809ac8d94a4a111d76991f90d36d6e',
  registry: 'https://bscscan.com/address/0xcA11bde05977b3631167028862bE2a173976CA11#code',
};
export const BSC_DEPTH_VENUES = {
  'PancakeSwap v3': {
    factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
    quoter: '0xb048bbc1ee6b733fffcfb9e9cef7375518e25997',
    registry: 'https://developer.pancakeswap.finance/contracts/v3/addresses',
    abi: 'https://github.com/pancakeswap/pancake-v3-contracts/blob/986847948755cba528324d41be19480731c36c2a/projects/v3-periphery/contracts/lens/QuoterV2.sol',
  },
  'Uniswap V3 (BSC)': {
    factory: '0xdb1d10011ad0ff90774d0c6bb92e5c5c8b4461f7',
    quoter: '0x78d78e420da98ad378d7799be8f4af69033eb077',
    registry: 'https://developers.uniswap.org/docs/protocols/v3/deployments/v3-bnb-deployments',
    abi: 'https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/IQuoterV2.sol',
  },
} as const;
export const BSC_METRIC_DEPTH = {
  venue: 'Metric (BSC)',
  factory: '0x2a53833cc95548cf52c7b159110e22d3a9018f32',
  provider: '0x9bb15fe2b214e37d19a6c59ee7b132e787fdfb2a',
  maxBands: 12,
  deployments: 'https://github.com/Metricxyz/sdk#contracts',
  abi: 'https://github.com/Metricxyz/periphery-contracts/blob/main/contracts/lens/MetricOmmPoolDataProvider.sol',
  ladder: 'https://github.com/Metricxyz/periphery-contracts/blob/main/contracts/libraries/LiquidityLadder.sol',
} as const;
export const BSC_PANCAKE_V2 = {
  factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
  feeBps: 25,
  registry: 'https://bscscan.com/address/0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
  model: 'https://www.npmjs.com/package/@pancakeswap/v2-sdk/v/1.2.4',
} as const;
export const BSC_PANCAKE_INFINITY = {
  manager: '0xa0ffb9c1ce1fe56963b0321b32e7a0302114058b',
  quoter: '0xd0737c9762912dd34c3271197e362aa736df0926',
  registry: 'https://github.com/pancakeswap/infinity-periphery/blob/main/script/config/bsc-mainnet.json',
  abi: 'https://github.com/pancakeswap/infinity-periphery/blob/main/src/pool-cl/lens/CLQuoter.sol#L175-L192',
  feeRules: 'https://github.com/pancakeswap/infinity-core/blob/main/src/libraries/ProtocolFeeLibrary.sol',
} as const;
export const BSC_UNISWAP_V4 = {
  manager: '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df',
  positionManager: '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b',
  stateView: '0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4',
  quoter: '0x95c086d7fe28add842ee220fef225a777474d781',
  registry: 'https://developers.uniswap.org/docs/protocols/v4/deployments#bnb-smart-chain-56',
  abi: 'https://github.com/Uniswap/v4-periphery/blob/main/src/base/BaseV4Quoter.sol#L33-L50',
  feeRules: 'https://github.com/Uniswap/v4-core/blob/main/src/libraries/ProtocolFeeLibrary.sol#L29-L39',
} as const;
export const BSC_V4_BAND_RPC = 'https://bsc.publicnode.com/';
const DAY = 86_400_000;
const MINUTE = 60_000;
const MAX_V2_RESERVE = (BigInt(1) << BigInt(112)) - BigInt(1);
const MAX_CL_DELTA = (BigInt(1) << BigInt(127)) - BigInt(1);
const MAX_CL_SQRT_PRICE = (BigInt(1) << BigInt(160)) - BigInt(1);

export type Close = { day: string; close: number; volume?: number };

export function fields(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function number(value: unknown) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(value))) return undefined;
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}

const positive = (value: unknown) => {
  const result = number(value);
  return result !== undefined && result > 0 ? result : undefined;
};
const nonnegative = (value: unknown) => {
  const result = number(value);
  return result !== undefined && result >= 0 ? result : undefined;
};

export function calendarDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export function utcTime(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !calendarDay(value.slice(0, 10))) return undefined;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  return new Date(timestamp).toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') ? timestamp : undefined;
}

export function sourceLink(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 1000) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* A malformed source cannot become a public link. */ }
  return undefined;
}

export function adgmProspectuses(input: unknown, ticker: string, isin: string) {
  const snapshot = fields(input);
  const observed = snapshot.observedAt;
  if (snapshot.version !== 1 || snapshot.source !== ADGM_PROSPECTUS_DIRECTORY || snapshot.issuer !== 'BTech Holdings Limited' ||
    typeof observed !== 'string' || utcTime(observed) === undefined || !/^[A-Z0-9]{12}$/.test(isin)) return null;
  const observedDay = observed.slice(0, 10);
  const row = fields(fields(snapshot.rows)[ticker]);
  if (row.isin !== isin || (row.supplementary !== undefined && !Array.isArray(row.supplementary))) return null;

  function document(value: unknown) {
    const { approvalDay, url } = fields(value);
    const link = sourceLink(url);
    if (!calendarDay(approvalDay) || approvalDay > observedDay || !link || link !== url) return null;
    const address = new URL(link);
    if (address.origin !== 'https://www.adgm.com' || address.search || address.hash || /%2f|%5c/i.test(address.pathname) ||
      !/^\/globalassets\/market-disclosure\/content\/prospectus\/[^/]+\.pdf$/i.test(address.pathname)) return null;
    return { approvalDay, url: link };
  }

  const primary = document(row.primary);
  if (!primary) return null;
  const supplementary = [];
  const seen = new Set([primary.url]);
  for (const field of row.supplementary ?? []) {
    const entry = document(field);
    if (!entry || entry.approvalDay < primary.approvalDay || seen.has(entry.url)) return null;
    seen.add(entry.url);
    supplementary.push(entry);
  }
  const { symbol, kind, page, reviewedSupplementary = [] } = fields(row.certificate);
  const certificate = typeof symbol === 'string' && /^[A-Z0-9.]{1,10}$/.test(symbol) &&
    (kind === 'share' || kind === 'fund-unit' || kind === 'adr' || kind === 'ads') &&
    typeof page === 'number' && Number.isSafeInteger(page) && page > 0 && page <= 1_000 &&
    Array.isArray(reviewedSupplementary) && reviewedSupplementary.length === supplementary.length &&
    supplementary.every(({ url }, index) => reviewedSupplementary[index] === url)
    ? { symbol, kind, url: `${primary.url}#page=${page}` } : undefined;
  return { primary, supplementary, certificate };
}

function positiveAmount(value: unknown, fractionDigits = 18) {
  if (typeof value !== 'string' || !/^(?:0|[1-9]\d{0,59})(?:\.\d{1,18})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  if (fraction.length > fractionDigits) return null;
  const raw = BigInt(`${whole}${fraction.padEnd(fractionDigits, '0')}`);
  return raw > BigInt(0) && raw < (BigInt(1) << BigInt(256)) ? { raw, decimal: value } : null;
}

function fixed18(raw: string) {
  const padded = raw.padStart(19, '0');
  const fraction = padded.slice(-18).replace(/0+$/, '');
  return `${padded.slice(0, -18)}${fraction ? `.${fraction}` : ''}`;
}

function matchesSource(input: unknown, source: Record<string, string | number>) {
  const record = fields(input);
  return Object.entries(source).every(([key, value]) => record[key] === value);
}

function bscSnapshotBlock(input: unknown) {
  const snapshot = fields(input);
  const { number, hash, timestamp } = fields(snapshot.block);
  const sources = fields(snapshot.sources);
  const observed = utcTime(snapshot.observedAt);
  const blockTime = utcTime(timestamp);
  if (snapshot.version !== 1 || snapshot.network !== 'bsc' || snapshot.chainId !== 56 ||
    typeof number !== 'number' || !Number.isSafeInteger(number) || number < 1 ||
    typeof hash !== 'string' || !/^0x[0-9a-f]{64}$/.test(hash) ||
    typeof timestamp !== 'string' || blockTime === undefined || observed === undefined || blockTime > observed ||
    sources.endpoint !== BSC_DEPTH_RPC || !matchesSource(sources.multicall, BSC_MULTICALL3)) return null;
  return { snapshot, sources, block: { number, timestamp } };
}

export function bscTokenDisplayUnits(input: unknown, base: string, ticker: string, isin: string) {
  const data = bscSnapshotBlock(input);
  if (!data || data.sources.standard !== BEP_677_STANDARD || !/^0x[0-9a-f]{40}$/.test(base) || !/^[A-Z0-9]{12}$/.test(isin)) return null;
  const row = fields(fields(data.snapshot.tokens)[base]);
  const { uiMultiplier, newUiMultiplier, effectiveAt, pendingMultiplier, pendingEffectiveAt } = row;
  if (row.ticker !== ticker || row.isin !== isin || row.decimals !== 18 ||
    typeof uiMultiplier !== 'string' || !/^[1-9][0-9]{0,77}$/.test(uiMultiplier) || BigInt(uiMultiplier) >= (BigInt(1) << BigInt(256)) ||
    newUiMultiplier !== uiMultiplier || effectiveAt !== '0' || pendingMultiplier !== '0' || pendingEffectiveAt !== '0') return null;
  return { multiplier: fixed18(uiMultiplier), block: data.block };
}

function bscDepthRecord(input: unknown, base: string, pool: { pool: string; venue: string }, expectedQuote: typeof BSC_DEPTH_QUOTES[keyof typeof BSC_DEPTH_QUOTES]) {
  const data = bscSnapshotBlock(input);
  if (!data || !/^0x[0-9a-f]{40}$/.test(base) || !/^0x[0-9a-f]{40}$/.test(pool.pool)) return null;
  const quote = fields(data.snapshot.quote);
  if (quote.symbol !== expectedQuote.symbol || quote.contract !== expectedQuote.contract || quote.decimals !== expectedQuote.decimals) return null;
  const { snapshot } = data;
  const row = fields(fields(snapshot.pools)[base]);
  if (row.pool !== pool.pool || row.venue !== pool.venue) return null;
  return { ...data, row };
}

function poolIdentifierReused(pools: unknown, base: string, field: 'pool' | 'poolId', identifier: string) {
  return Object.entries(fields(pools)).some(([otherBase, candidate]) => otherBase !== base && fields(candidate)[field] === identifier);
}

export function dexPoolDepth(input: unknown, base: string, pool: { pool: string; venue: string }, quoteContract: string) {
  const quote = Object.values(BSC_DEPTH_QUOTES).find(({ contract }) => contract === quoteContract);
  if (!quote) return null;
  const data = bscDepthRecord(input, base, pool, quote);
  const venue = Object.hasOwn(BSC_DEPTH_VENUES, pool.venue) ? BSC_DEPTH_VENUES[pool.venue as keyof typeof BSC_DEPTH_VENUES] : undefined;
  if (!data || !venue || data.snapshot.limitBps !== 100 || !matchesSource(fields(data.sources.venues)[pool.venue], venue)) return null;
  if (poolIdentifierReused(data.snapshot.pools, base, 'pool', pool.pool)) return null;
  const buy = positiveAmount(quote.symbol === 'USDT' ? data.row.buyInUsdt : data.row.buyInQuote);
  const sell = positiveAmount(quote.symbol === 'USDT' ? data.row.sellOutUsdt : data.row.sellOutQuote);
  if (!buy || !sell) return null;
  if (data.row.marginal !== undefined) {
    const witness = clMarginalAmounts(data.row.marginal, base < quote.contract);
    if (!witness || witness.buyInQuote !== buy.decimal || witness.sellOutQuote !== sell.decimal) return null;
  }
  return { kind: 'marginal' as const, block: data.block, buyInQuote: buy.decimal, sellOutQuote: sell.decimal };
}

function metricBand(input: unknown) {
  const { quoteDepthUsdt, farthestSimulatedBin, simulatedBands, returnedBands, lowerPriceUsdt, upperPriceUsdt } = fields(input);
  const amount = positiveAmount(quoteDepthUsdt);
  const lower = positiveAmount(lowerPriceUsdt, 12);
  const upper = positiveAmount(upperPriceUsdt, 12);
  if (!amount || !lower || !upper || lower.raw > upper.raw ||
    typeof farthestSimulatedBin !== 'number' || !Number.isInteger(farthestSimulatedBin) || farthestSimulatedBin < -32768 || farthestSimulatedBin > 32767 ||
    typeof simulatedBands !== 'number' || !Number.isInteger(simulatedBands) || simulatedBands < 1 ||
    typeof returnedBands !== 'number' || !Number.isInteger(returnedBands) || returnedBands < simulatedBands || returnedBands > BSC_METRIC_DEPTH.maxBands) return null;
  return { quoteDepthUsdt: amount.decimal, farthestSimulatedBin, simulatedBands, returnedBands, lowerPriceUsdt: lower.decimal, upperPriceUsdt: upper.decimal };
}

export function metricPoolDepth(input: unknown, base: string, pool: { pool: string; venue: string }, quoteContract: string) {
  if (quoteContract !== BSC_DEPTH_QUOTES.USDT.contract) return null;
  const data = bscDepthRecord(input, base, pool, BSC_DEPTH_QUOTES.USDT);
  if (!data || pool.venue !== BSC_METRIC_DEPTH.venue || data.snapshot.method !== 'metric-omm-ladder' ||
    !matchesSource(data.sources.metric, BSC_METRIC_DEPTH)) return null;
  const buy = metricBand(data.row.buy);
  const sell = metricBand(data.row.sell);
  return buy && sell ? { kind: 'bands' as const, block: data.block, buyInQuote: buy.quoteDepthUsdt, sellOutQuote: sell.quoteDepthUsdt, buy, sell } : null;
}

export type DexPoolDepth = NonNullable<ReturnType<typeof dexPoolDepth> | ReturnType<typeof metricPoolDepth>>;

function positiveRaw(value: unknown, max: bigint) {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,77}$/.test(value)) return null;
  const amount = BigInt(value);
  return amount <= max ? amount : null;
}

function v2MaxInput(reserveIn: bigint, reserveOut: bigint, maxNumerator: bigint, maxDenominator: bigint) {
  const feeDenominator = BigInt(10_000);
  const feeFactor = feeDenominator - BigInt(BSC_PANCAKE_V2.feeBps);
  const outputFor = (input: bigint) => {
    const withFee = input * feeFactor;
    return withFee * reserveOut / (reserveIn * feeDenominator + withFee);
  };
  const headroom = MAX_V2_RESERVE - reserveIn;
  let low = BigInt(0);
  let high = reserveIn < headroom ? reserveIn : headroom;
  while (low < high) {
    const input = (low + high + BigInt(1)) / BigInt(2);
    const output = outputFor(input);
    if ((reserveIn + input) * reserveOut * maxDenominator <= reserveIn * (reserveOut - output) * maxNumerator) low = input;
    else high = input - BigInt(1);
  }
  const output = outputFor(low);
  return output > BigInt(0) ? { input: low, output } : null;
}

export function pancakeV2Reserves(input: unknown, base: string, ticker: string, isin: string) {
  const data = bscSnapshotBlock(input);
  if (!data || data.snapshot.method !== 'pancakeswap-v2-reserves' || !matchesSource(data.sources.venue, BSC_PANCAKE_V2) ||
    !/^0x[0-9a-f]{40}$/.test(base) || !/^[A-Z0-9]{12}$/.test(isin)) return null;
  const row = fields(fields(data.snapshot.pools)[base]);
  const quote = Object.values(BSC_DEPTH_QUOTES).find(({ contract }) => contract === row.quoteContract);
  const { pool, lastReserveAt } = row;
  const lastUpdate = utcTime(lastReserveAt);
  if (row.ticker !== ticker || row.isin !== isin || !quote || base === quote.contract || row.baseIsToken0 !== (base < quote.contract) ||
    typeof pool !== 'string' || !/^0x[0-9a-f]{40}$/.test(pool) || /^0x0{40}$/.test(pool) || pool === base || pool === quote.contract ||
    row.baseDecimals !== 18 || row.quoteDecimals !== quote.decimals || typeof lastReserveAt !== 'string' ||
    lastUpdate === undefined || lastUpdate > Date.parse(data.block.timestamp)) return null;
  if (poolIdentifierReused(data.snapshot.pools, base, 'pool', pool)) return null;
  const baseRaw = positiveRaw(row.baseReserveRaw, MAX_V2_RESERVE);
  const quoteRaw = positiveRaw(row.quoteReserveRaw, MAX_V2_RESERVE);
  if (!baseRaw || !quoteRaw || !positiveRaw(row.lpSupplyRaw, (BigInt(1) << BigInt(256)) - BigInt(1))) return null;
  const buy = v2MaxInput(quoteRaw, baseRaw, BigInt(101), BigInt(100));
  const sell = v2MaxInput(baseRaw, quoteRaw, BigInt(100), BigInt(99));
  return {
    pool, quote: quote.symbol, block: data.block, lastReserveAt,
    baseReserve: fixed18(baseRaw.toString()), quoteReserve: fixed18(quoteRaw.toString()),
    buyInQuote: buy ? fixed18(buy.input.toString()) : null,
    sellOutQuote: sell ? fixed18(sell.output.toString()) : null,
  };
}

export type PancakeV2Reserves = NonNullable<ReturnType<typeof pancakeV2Reserves>>;

function clPriceBand(input: unknown, start: bigint, baseIsToken0: boolean, quotePricePercent: 99 | 101) {
  const band = fields(input);
  const amountIn = positiveRaw(band.inputRaw, MAX_CL_DELTA);
  const amountOut = positiveRaw(band.outputRaw, MAX_CL_DELTA);
  const reached = positiveRaw(band.sqrtPriceAfter, MAX_CL_SQRT_PRICE);
  const previous = positiveRaw(band.sqrtPriceWithOneLess, MAX_CL_SQRT_PRICE);
  if (!amountIn || !amountOut || !reached || !previous) return null;
  // The marginal price in USDT is proportional to sqrtPrice², or to its inverse when USDT is token0.
  const ascending = baseIsToken0 === (quotePricePercent === 101);
  const denominator = BigInt(baseIsToken0 ? 100 : quotePricePercent);
  const target = start * start * BigInt(baseIsToken0 ? quotePricePercent : 100);
  const crosses = (sqrt: bigint) => ascending ? sqrt * sqrt * denominator >= target : sqrt * sqrt * denominator <= target;
  if (!crosses(reached) || crosses(previous)) return null;
  return { amountIn: fixed18(amountIn.toString()), amountOut: fixed18(amountOut.toString()) };
}

function clMarginalAmounts(input: unknown, baseIsToken0: boolean) {
  const bands = fields(input);
  const start = positiveRaw(bands.sqrtPriceBefore, MAX_CL_SQRT_PRICE);
  if (!start) return null;
  const buy = clPriceBand(bands.buy, start, baseIsToken0, 101);
  const sell = clPriceBand(bands.sell, start, baseIsToken0, 99);
  return buy && sell ? { buyInQuote: buy.amountIn, sellOutQuote: sell.amountOut } : null;
}

function concentratedLiquidityQuotes(input: unknown, base: string, ticker: string, isin: string, method: 'pancakeswap-infinity-cl' | 'uniswap-v4') {
  const snapshots = Array.isArray(input) ? input : [input];
  const matches = snapshots.filter(snapshot => Object.hasOwn(fields(fields(snapshot).pools), base));
  if (matches.length !== 1) return null;
  const data = bscSnapshotBlock(matches[0]);
  const quote = BSC_DEPTH_QUOTES.USDT;
  const isUniswap = method === 'uniswap-v4';
  const venue = isUniswap ? BSC_UNISWAP_V4 : BSC_PANCAKE_INFINITY;
  if (!data || data.snapshot.method !== method || !matchesSource(data.sources.venue, venue) ||
    !matchesSource(data.snapshot.quote, quote) || !/^0x[0-9a-f]{40}$/.test(base) || /^0x0{40}$/.test(base) || base === quote.contract ||
    !/^[A-Z0-9]{12}$/.test(isin) || data.snapshot.buyInputUsdtRaw !== '1000000000000000000' || data.snapshot.sellInputTokenRaw !== '10000000000000000') return null;
  const pools = fields(data.snapshot.pools);
  const row = fields(pools[base]);
  const { poolId, lpFeePips, protocolFeePacked } = row;
  const baseIsToken0 = base < quote.contract;
  if (row.ticker !== ticker || row.isin !== isin || typeof poolId !== 'string' || !/^0x[0-9a-f]{64}$/.test(poolId) || /^0x0{64}$/.test(poolId) ||
    row.token0 !== (baseIsToken0 ? base : quote.contract) || row.token1 !== (baseIsToken0 ? quote.contract : base) || row.baseDecimals !== 18 ||
    row.hooks !== '0x0000000000000000000000000000000000000000' ||
    typeof lpFeePips !== 'number' || !Number.isInteger(lpFeePips) || lpFeePips < 0 || lpFeePips >= 1_000_000 || row.keyFeePips !== lpFeePips ||
    typeof protocolFeePacked !== 'number' || !Number.isInteger(protocolFeePacked) || protocolFeePacked < 0 || protocolFeePacked > 0xffffff) return null;
  const { tickSpacing } = row;
  if (isUniswap ? typeof tickSpacing !== 'number' || !Number.isInteger(tickSpacing) || tickSpacing < 1 || tickSpacing > 32767
    : row.parameters !== '0x0000000000000000000000000000000000000000000000000000000000010000') return null;
  if (snapshots.some(snapshot => poolIdentifierReused(fields(snapshot).pools, base, 'poolId', poolId))) return null;
  const protocolFeePips = protocolFeePacked & 0xfff;
  if ((protocolFeePacked >>> 12) !== protocolFeePips || (isUniswap && protocolFeePips > 1000)) return null;
  const swapFeePips = lpFeePips + protocolFeePips - Math.floor(lpFeePips * protocolFeePips / 1_000_000);
  const fixedBuyOut = positiveRaw(row.buyOutTokenRaw, MAX_CL_DELTA);
  const fixedSellOut = positiveRaw(row.sellOutUsdtRaw, MAX_CL_DELTA);
  if (swapFeePips >= 1_000_000 || !fixedBuyOut || !fixedSellOut) return null;

  const bandSource = fields(data.snapshot.bandSource);
  const bandObservedAt = utcTime(bandSource.observedAt);
  const verifiedBands = !isUniswap || (bandSource.endpoint === BSC_V4_BAND_RPC && bandSource.blockHash === fields(data.snapshot.block).hash &&
    bandObservedAt !== undefined && bandObservedAt >= Date.parse(data.block.timestamp));
  const marginal = data.snapshot.limitBps === 100 && verifiedBands ? clMarginalAmounts(row.marginal, baseIsToken0) : null;
  return {
    poolId, block: data.block, lpFeePips, swapFeePips,
    fixedBuyOut: fixed18(fixedBuyOut.toString()), fixedSellOut: fixed18(fixedSellOut.toString()),
    marginal: marginal ? { buyInUsdt: marginal.buyInQuote, sellOutUsdt: marginal.sellOutQuote } : null,
  };
}

export function pancakeInfinityQuotes(input: unknown, base: string, ticker: string, isin: string) {
  return concentratedLiquidityQuotes(input, base, ticker, isin, 'pancakeswap-infinity-cl');
}

export function uniswapV4Quotes(input: unknown, base: string, ticker: string, isin: string) {
  return concentratedLiquidityQuotes(input, base, ticker, isin, 'uniswap-v4');
}

export function uniswapV4EthDepth(input: unknown, base: string, ticker: string, isin: string) {
  const data = bscSnapshotBlock(input);
  const quote = { symbol: 'ETH', contract: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', decimals: 18 };
  if (!data || data.snapshot.method !== 'uniswap-v4-eth-marginal' || data.snapshot.limitBps !== 100 ||
    !matchesSource(data.sources.venue, BSC_UNISWAP_V4) || !matchesSource(data.snapshot.quote, quote) ||
    !/^0x[0-9a-f]{40}$/.test(base) || base <= quote.contract || !/^[A-Z0-9]{12}$/.test(isin)) return null;
  const { endpoint, blockHash, observedAt } = fields(data.snapshot.bandSource);
  if (endpoint !== 'https://bsc-mainnet.public.blastapi.io' || blockHash !== fields(data.snapshot.block).hash ||
    utcTime(observedAt) !== utcTime(data.snapshot.observedAt)) return null;
  const row = fields(fields(data.snapshot.pools)[base]);
  const { poolId } = row;
  if (row.ticker !== ticker || row.isin !== isin || row.token0 !== quote.contract || row.token1 !== base || row.baseDecimals !== 18 ||
    typeof poolId !== 'string' || !/^0x[0-9a-f]{64}$/.test(poolId) || /^0x0{64}$/.test(poolId) ||
    row.hooks !== '0x0000000000000000000000000000000000000000' || row.tickSpacing !== 300 ||
    row.keyFeePips !== 30_000 || row.lpFeePips !== 30_000 || row.protocolFeePacked !== 4_097_000 ||
    poolIdentifierReused(data.snapshot.pools, base, 'poolId', poolId)) return null;
  const marginal = clMarginalAmounts(row.marginal, false);
  return marginal ? {
    poolId, quote: quote.symbol, feePips: 30_970,
    proof: { kind: 'marginal' as const, block: data.block, ...marginal },
  } : null;
}

export type ConcentratedLiquidityQuotes = NonNullable<ReturnType<typeof concentratedLiquidityQuotes>>;

export function measureOrderBook(input: unknown) {
  const depth = fields(input);
  const levels = (side: unknown) => {
    if (!Array.isArray(side) || !side.length || side.length > 100) return [];
    return side.flatMap((row) => {
      const price = positive(row?.[0]);
      const quantity = positive(row?.[1]);
      return Array.isArray(row) && price !== undefined && quantity !== undefined ? [{ price, quantity }] : [];
    });
  };
  const bids = levels(depth.bids);
  const asks = levels(depth.asks);
  const bestBid = bids[0]?.price;
  const bestAsk = asks[0]?.price;
  if (!bestBid || !bestAsk || bestBid >= bestAsk || !Array.isArray(depth.bids) || !Array.isArray(depth.asks) ||
    bids.length !== depth.bids.length || asks.length !== depth.asks.length ||
    bids.some((level, i) => i > 0 && level.price >= bids[i - 1].price) ||
    asks.some((level, i) => i > 0 && level.price <= asks[i - 1].price) ||
    typeof depth.lastUpdateId !== 'number' || !Number.isSafeInteger(depth.lastUpdateId) || depth.lastUpdateId < 1) return null;

  const midpoint = (bestBid + bestAsk) / 2;
  const bidThreshold = midpoint * 0.99;
  const askThreshold = midpoint * 1.01;
  const sum = (book: typeof bids) => book.reduce((acc, level) => acc + level.price * level.quantity, 0);
  const bidDepth = sum(bids.filter((level) => level.price >= bidThreshold));
  const askDepth = sum(asks.filter((level) => level.price <= askThreshold));
  if (![midpoint, bidDepth, askDepth].every(Number.isFinite)) return null;

  return {
    updateId: depth.lastUpdateId, bestBid, bestAsk, midpoint, spreadBps: (bestAsk - bestBid) / midpoint * 10_000,
    bidDepth, askDepth, bidLevels: bids.length, askLevels: asks.length,
    bidCoversWindow: bids[bids.length - 1].price <= bidThreshold,
    askCoversWindow: asks[asks.length - 1].price >= askThreshold,
  };
}

export function closedBinanceCloses(input: unknown, cutoff: number): Close[] {
  if (!Array.isArray(input) || input.length > 251 || !Number.isSafeInteger(cutoff)) return [];
  const days = new Set<number>();
  const closes: Close[] = [];
  for (const row of input) {
    if (!Array.isArray(row)) continue;
    const [openAt, rawOpen, rawHigh, rawLow, rawClose, rawVolume, closeAt, , trades] = row;
    const open = positive(rawOpen);
    const high = positive(rawHigh);
    const low = positive(rawLow);
    const close = positive(rawClose);
    const volume = positive(rawVolume);
    if (typeof openAt !== 'number' || !Number.isSafeInteger(openAt) || openAt < 0 || openAt % DAY !== 0 ||
      closeAt !== openAt + DAY - 1 || closeAt >= cutoff || !open || !high || !low || !close || !volume ||
      low > Math.min(open, close) || high < Math.max(open, close) || !Number.isSafeInteger(trades) || trades <= 0) continue;
    if (days.has(openAt)) return [];
    days.add(openAt);
    closes.push({ day: new Date(openAt).toISOString().slice(0, 10), close, volume });
  }
  return closes.sort((a, b) => a.day.localeCompare(b.day)).slice(-250);
}

export function nativeMarket(input: unknown, ticker: string, asOf: unknown) {
  const cutoff = utcTime(asOf);
  if (cutoff === undefined || typeof asOf !== 'string') return null;
  const record = fields(input);
  const symbol = `${ticker}USDT`;
  const market = fields(record.exchange);
  if (market.symbol !== symbol || market.baseAsset !== ticker || market.quoteAsset !== 'USDT' ||
    market.isSpotTradingAllowed !== true || !['TRADING', 'HALT', 'BREAK'].includes(String(market.status))) return null;

  const ticker24h = fields(record.ticker24h);
  const closeTime = number(ticker24h.closeTime);
  const price = positive(ticker24h.lastPrice);
  const change = number(ticker24h.priceChangePercent);
  const baseVolume = nonnegative(ticker24h.volume);
  const quoteVolume = nonnegative(ticker24h.quoteVolume);
  const trades = nonnegative(ticker24h.count);
  const quote = ticker24h.symbol === symbol && closeTime !== undefined && Number.isSafeInteger(closeTime) &&
    closeTime >= cutoff - DAY && closeTime <= cutoff + 5000 && price !== undefined && change !== undefined &&
    baseVolume !== undefined && quoteVolume !== undefined && trades !== undefined && Number.isSafeInteger(trades)
    ? { observedAt: new Date(closeTime).toISOString(), price, change, baseVolume, quoteVolume, trades }
    : null;
  const depthAt = utcTime(record.depthObservedAt);
  const book = market.status === 'TRADING' && depthAt !== undefined && typeof record.depthObservedAt === 'string' &&
    depthAt >= cutoff && depthAt <= cutoff + 60 * 60 * 1000 ? measureOrderBook(record.depth) : null;

  return {
    symbol, status: market.status as 'TRADING' | 'HALT' | 'BREAK', asOf,
    quote, book: book ? { ...book, observedAt: record.depthObservedAt as string } : null,
    closes: closedBinanceCloses(record.candles, cutoff),
  };
}

export function priceIndicators(closes: readonly Close[]) {
  const prices = closes.map(({ close }) => close);
  const average = (days: number) => prices.length >= days ? prices.slice(-days).reduce((sum, value) => sum + value, 0) / days : null;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < prices.length; i += 1) {
    const change = prices[i] - prices[i - 1];
    gains = i <= 14 ? gains + Math.max(change, 0) / 14 : (gains * 13 + Math.max(change, 0)) / 14;
    losses = i <= 14 ? losses + Math.max(-change, 0) / 14 : (losses * 13 + Math.max(-change, 0)) / 14;
  }
  return {
    ma20: average(20), ma50: average(50), ma200: average(200),
    rsi14: prices.length > 14 ? (losses > 0 ? 100 - 100 / (1 + gains / losses) : gains > 0 ? 100 : 50) : null,
    drawdownPct: prices.length > 1 ? (prices[prices.length - 1] / Math.max(...prices) - 1) * 100 : null,
  };
}

export function adjustedHistory(input: unknown, symbol: string, exchange: string) {
  const record = fields(input);
  const observedAt = record.observedAt;
  const source = sourceLink(record.source);
  const basis = record.adjustment;
  if (record.symbol !== symbol || record.exchange !== exchange || typeof observedAt !== 'string' || utcTime(observedAt) === undefined || !source ||
    (basis !== 'split' && basis !== 'split-and-dividend') || typeof record.currency !== 'string' || !/^[A-Z]{3}$/.test(record.currency) ||
    !Array.isArray(record.closes) || record.closes.length < 1 || record.closes.length > 1000) return null;
  const closes: Close[] = [];
  for (const value of record.closes) {
    const { day, adjustedClose, volume } = fields(value);
    if (!calendarDay(day) || day >= observedAt.slice(0, 10) || (closes.length && closes[closes.length - 1].day >= day) ||
      typeof adjustedClose !== 'number' || !positive(adjustedClose) || (volume !== undefined && (typeof volume !== 'number' || nonnegative(volume) === undefined))) return null;
    closes.push({ day, close: adjustedClose, ...(typeof volume === 'number' ? { volume } : {}) });
  }
  return { symbol, exchange, observedAt, source, adjustment: basis, currency: record.currency, closes: closes.slice(-250) };
}

function closedMinute(quote: Record<string, unknown>, cutoff: number) {
  const bucket = fields(quote.bucket);
  const instant = utcTime(quote.at);
  return bucket.closed === true && utcTime(bucket.start) === cutoff - MINUTE && utcTime(bucket.end) === cutoff &&
    (quote.at === undefined || (instant !== undefined && instant >= cutoff - MINUTE && instant < cutoff));
}

export function matchedPremium(input: unknown, ticker: string, underlyingSymbol: string, underlyingExchange: string) {
  const evidence = fields(input);
  const token = fields(evidence.token);
  const equity = fields(evidence.equity);
  const fx = fields(evidence.fx);
  const ratio = fields(evidence.ratio);
  const at = utcTime(equity.at);
  const basis = evidence.basis === undefined ? 'instant' : evidence.basis;
  if (at === undefined || (basis !== 'instant' && basis !== 'period-end')) return null;
  const aligned = basis === 'period-end'
    ? at % MINUTE === 0 && closedMinute(token, at) && closedMinute(fx, at)
    : token.bucket === undefined && fx.bucket === undefined && utcTime(token.at) === at && utcTime(fx.at) === at;
  const tokenPrice = positive(token.price);
  const equityPrice = positive(equity.price);
  const usdPerUsdt = positive(fx.usdPerUsdt);
  const sharesPerToken = positive(ratio.sharesPerToken);
  const validFrom = utcTime(ratio.validFrom);
  const validUntil = utcTime(ratio.validUntil);
  const tokenSource = sourceLink(token.source);
  const equitySource = sourceLink(equity.source);
  const fxSource = sourceLink(fx.source);
  const ratioSource = sourceLink(ratio.source);
  if (token.symbol !== `${ticker}USDT` || token.venue !== 'Binance' || token.currency !== 'USDT' ||
    equity.symbol !== underlyingSymbol || equity.exchange !== underlyingExchange || equity.currency !== 'USD' ||
    equity.adjustment !== 'raw' || equity.session !== 'regular-close' || fx.pair !== 'USDT/USD' ||
    ratio.ticker !== ticker || ratio.symbol !== underlyingSymbol || ratio.exchange !== underlyingExchange ||
    !aligned || validFrom === undefined || validUntil === undefined || (basis === 'period-end' ? at - MINUTE : at) < validFrom ||
    at > validUntil || !tokenPrice || !equityPrice || !usdPerUsdt || !sharesPerToken ||
    !tokenSource || !equitySource || !fxSource || !ratioSource) return null;
  const percent = (tokenPrice * usdPerUsdt / (equityPrice * sharesPerToken) - 1) * 100;
  if (!Number.isFinite(percent)) return null;
  return {
    at: new Date(at).toISOString(), basis, windowStart: basis === 'period-end' ? new Date(at - MINUTE).toISOString() : undefined,
    underlyingSymbol, underlyingExchange, percent, tokenPrice, equityPrice, usdPerUsdt,
    sharesPerToken, tokenSource, equitySource, fxSource, ratioSource,
  };
}

export type NativeMarket = NonNullable<ReturnType<typeof nativeMarket>>;
export type AdjustedHistory = NonNullable<ReturnType<typeof adjustedHistory>>;
export type MatchedPremium = NonNullable<ReturnType<typeof matchedPremium>>;

export type Measure = { key: string; amount: number; unit: string; xbrl?: { cik: number; tag: string } };
export type Filing = {
  start: string;
  end: string;
  filed: string;
  form: string;
  period: 'quarter' | 'interim' | 'year';
  url: string;
  unaudited?: true;
  metrics: Measure[];
};
export type StockFundamentals = {
  symbol: string;
  exchange: string;
  cik?: number;
  filings: Filing[];
  fund?: {
    day: string;
    url: string;
    structure?: 'closed-end';
    benchmark?: string;
    feeSource?: string;
    metrics: Measure[];
    split?: { day: string; ratio: string; url: string };
  };
};

export function supplementFilings(preferred: readonly Filing[], supplemental: readonly Filing[]) {
  const selected = new Map<string, { filing: Filing; metric: Measure; pinned: boolean }>();
  for (const [index, filing] of [...preferred, ...supplemental].entries()) {
    const pinned = index < preferred.length;
    for (const metric of filing.metrics) {
      const id = `${filing.start}/${filing.end}/${metric.key}/${metric.unit}`;
      const previous = selected.get(id);
      if (!previous || (!pinned && previous.pinned && !previous.metric.xbrl && supersedesPreliminaryReport(previous.filing, filing, metric))) {
        selected.set(id, { filing, metric, pinned });
      }
    }
  }
  const grouped = new Map<Filing, Measure[]>();
  for (const { filing, metric } of selected.values()) {
    const metrics = grouped.get(filing);
    if (metrics) metrics.push(metric);
    else grouped.set(filing, [metric]);
  }
  return Array.from(grouped, ([filing, metrics]) => ({ ...filing, metrics }));
}

function filingPeriod(start: string, end: string) {
  const days = (Date.parse(end) - Date.parse(start)) / DAY + 1;
  if (days >= 72 && days <= 105) return 'quarter';
  if (days >= 350 && days <= 380) return 'year';
  if (days >= 165 && days <= 290) return 'interim';
  return null;
}

const FORMS = /^(?:10-[KQ]|20-F|40-F|6-K)(?:\/A)?$/;
const METRICS = {
  'us-gaap': {
    revenue: ['Revenues'],
    contractRevenue: ['RevenueFromContractWithCustomerExcludingAssessedTax'],
    netSales: ['SalesRevenueNet'],
    netIncome: ['NetIncomeLoss', 'ProfitLoss'],
    operatingIncome: ['OperatingIncomeLoss'],
    cashFlow: ['NetCashProvidedByUsedInOperatingActivities'],
    dilutedEps: ['EarningsPerShareDiluted'],
  },
  'ifrs-full': {
    revenue: ['Revenue'],
    netIncome: ['ProfitLoss'],
    operatingIncome: ['ProfitLossFromOperatingActivities'],
    cashFlow: ['CashFlowsFromUsedInOperatingActivities'],
    dilutedEps: ['DilutedEarningsLossPerShare'],
  },
};

function supersedesPreliminaryReport(preliminary: Filing, report: Filing, metric: Measure) {
  const { xbrl } = metric;
  if (preliminary.form !== '8-K' || preliminary.unaudited !== true || !xbrl ||
    !/^(?:10-K|10-Q)(?:\/A)?$/.test(report.form) ||
    report.period !== preliminary.period || (report.period === 'year' && (!report.form.startsWith('10-K') || report.unaudited)) ||
    !calendarDay(preliminary.filed) || !calendarDay(report.filed) || report.filed <= preliminary.filed ||
    !calendarDay(report.start) || !calendarDay(report.end) || report.end > report.filed || filingPeriod(report.start, report.end) !== report.period ||
    !Number.isFinite(metric.amount) || metric.unit !== (metric.key === 'dilutedEps' ? 'USD/shares' : 'USD')) return false;

  const tags = METRICS['us-gaap'][metric.key as keyof typeof METRICS['us-gaap']];
  if (!Array.isArray(tags) || !tags.some(tag => xbrl.tag === `us-gaap:${tag}`) || !Number.isSafeInteger(xbrl.cik) || xbrl.cik < 1) return false;

  const issuer = `https://www.sec.gov/Archives/edgar/data/${xbrl.cik}/`;
  if (!preliminary.url.startsWith(issuer) || !report.url.startsWith(issuer)) return false;
  const accession = /^(\d{18})\/(\d{10}-\d{2}-\d{6})-index\.htm$/.exec(report.url.slice(issuer.length));
  return accession !== null && accession[1] === accession[2].replaceAll('-', '');
}

export function secFundamentals(input: unknown, ticker: string, symbol: string, observedDay: string): StockFundamentals | null {
  const row = fields(input);
  const { cik, exchange } = row;
  if (row.ticker !== ticker || row.symbol !== symbol || typeof cik !== 'number' || !Number.isSafeInteger(cik) || cik < 1 ||
    typeof exchange !== 'string' || !/^[A-Za-z0-9 &.-]{1,28}$/.test(exchange) || !calendarDay(observedDay) ||
    row.source !== `https://data.sec.gov/api/xbrl/companyfacts/CIK${String(cik).padStart(10, '0')}.json`) return null;

  const periods = new Map<string, Filing>();
  for (const [taxonomy, tags] of Object.entries(METRICS)) {
    const factTags = fields(fields(row.facts)[taxonomy]);
    for (const [key, allowed] of Object.entries(tags)) {
      if (cik === 1876042 && key === 'contractRevenue') continue;
      for (const tag of allowed) {
        for (const [unit, list] of Object.entries(fields(fields(factTags[tag]).units))) {
          if (!(key === 'dilutedEps' ? /^[A-Z]{3}\/shares$/ : /^[A-Z]{3}$/).test(unit) || !Array.isArray(list) || list.length > 10_000) continue;
          const entries = list.map(fields).sort((a, b) => String(b.filed).localeCompare(String(a.filed)));
          for (const item of entries) {
            const { start, end, filed, form, accn, val } = item;
            if (!calendarDay(start) || !calendarDay(end) || !calendarDay(filed) || start > end || end > filed || filed > observedDay ||
              typeof form !== 'string' || !FORMS.test(form) || typeof accn !== 'string' || !/^\d{10}-\d{2}-\d{6}$/.test(accn) ||
              typeof val !== 'number' || !Number.isFinite(val)) continue;
            const period = filingPeriod(start, end);
            if (!period) continue;
            const currency = unit.slice(0, 3);
            const id = `${start}/${end}/${accn}/${currency}`;
            const filing = periods.get(id) ?? { start, end, filed, form, period, url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accn.replaceAll('-', '')}/${accn}-index.htm`, metrics: [] };
            if (filing.metrics.some((metric) => metric.key === key)) continue;
            if ((key === 'contractRevenue' || key === 'netSales') && filing.metrics.some((metric) => metric.key === 'revenue' && metric.amount === val)) continue;
            filing.metrics.push({ key, amount: val, unit, xbrl: { cik, tag: `${taxonomy}:${tag}` } });
            periods.set(id, filing);
          }
        }
      }
    }
  }

  const matching = [...periods.values()].sort((a, b) => b.end.localeCompare(a.end) || b.filed.localeCompare(a.filed) || b.metrics.length - a.metrics.length);
  const selected = (['quarter', 'interim', 'year'] as const).flatMap((period) => {
    const windows = new Set<string>();
    const limit = period === 'quarter' ? 8 : 3;
    return matching.filter((filing) => {
      if (filing.period !== period) return false;
      const id = `${filing.start}/${filing.end}/${filing.metrics[0].unit.slice(0, 3)}`;
      if (!windows.has(id) && windows.size >= limit) return false;
      windows.add(id);
      return true;
    });
  });
  return { symbol, exchange: exchange.toUpperCase(), cik, filings: supplementFilings([], selected) };
}

type VerifiedMeasure = { filing: Filing; amount: number; unit: string; tag: string };
type TrailingTotal = {
  method: 'four-quarters' | 'fiscal-ytd';
  start: string;
  end: string;
  amount: number;
  unit: string;
  tag: string;
  components: (VerifiedMeasure & { sign: 1 | -1 })[];
};

export function trailingTwelveMonths(input: readonly Filing[], key: 'revenue' | 'netIncome'): TrailingTotal | null {
  const groups = new Map<string, VerifiedMeasure[]>();
  for (const filing of input) {
    if (!calendarDay(filing.start) || !calendarDay(filing.end) || filingPeriod(filing.start, filing.end) !== filing.period) continue;
    for (const { key: kind, amount, unit, xbrl } of filing.metrics) {
      if (kind !== key || !xbrl || !Number.isFinite(amount) || !/^[A-Z]{3}$/.test(unit) ||
        !filing.url.startsWith(`https://www.sec.gov/Archives/edgar/data/${xbrl.cik}/`)) continue;
      const basis = `${xbrl.cik}/${xbrl.tag}/${unit}`;
      const group = groups.get(basis) ?? [];
      group.push({ filing, amount, unit, tag: xbrl.tag });
      groups.set(basis, group);
    }
  }

  const candidates: TrailingTotal[] = [];
  const add = (method: TrailingTotal['method'], start: string, end: string, components: TrailingTotal['components']) => {
    if (filingPeriod(start, end) !== 'year' || !components[0]) return;
    const amount = components.reduce((total, entry) => total + entry.sign * entry.amount, 0);
    if (Number.isFinite(amount)) candidates.push({ method, start, end, amount, unit: components[0].unit, tag: components[0].tag, components });
  };
  const nextDay = (day: string) => new Date(Date.parse(day) + DAY).toISOString().slice(0, 10);
  const yearLater = (earlier: string, later: string) => earlier.slice(5) === later.slice(5) &&
    Number(later.slice(0, 4)) === Number(earlier.slice(0, 4)) + 1;
  for (const group of groups.values()) {
    group.sort((a, b) => b.filing.end.localeCompare(a.filing.end) || b.filing.filed.localeCompare(a.filing.filed));
    const quarters = group.filter(({ filing }) => filing.period === 'quarter');
    for (const latest of quarters) {
      const chain = [latest];
      while (chain.length < 4) {
        const previous = quarters.find(({ filing }) => nextDay(filing.end) === chain[chain.length - 1].filing.start);
        if (!previous) break;
        chain.push(previous);
      }
      if (chain.length === 4) add('four-quarters', chain[3].filing.start, latest.filing.end, chain.map((entry) => ({ ...entry, sign: 1 })));
    }

    for (const current of group) {
      if (current.filing.period === 'year') continue;
      const fiscal = group.find(({ filing }) => filing.period === 'year' && nextDay(filing.end) === current.filing.start);
      if (!fiscal) continue;
      const prior = group.find(({ filing }) => filing.period === current.filing.period &&
        filing.start === fiscal.filing.start && filing.end < fiscal.filing.end &&
        yearLater(filing.start, current.filing.start) && yearLater(filing.end, current.filing.end));
      if (prior) add('fiscal-ytd', nextDay(prior.filing.end), current.filing.end, [
        { ...fiscal, sign: 1 }, { ...current, sign: 1 }, { ...prior, sign: -1 },
      ]);
    }
  }
  return candidates.sort((a, b) => b.end.localeCompare(a.end) || Number(b.method === 'four-quarters') - Number(a.method === 'four-quarters'))[0] ?? null;
}
