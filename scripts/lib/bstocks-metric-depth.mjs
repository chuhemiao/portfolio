import { BSC_DEPTH_RPC, BSC_METRIC_DEPTH, BSC_MULTICALL3, metricPoolDepth } from '../../src/lib/bstocks-study.ts';
import { BSC_USDT, decimalAmount, decodeAddress, encodeCall, listedPoolScopes, openBscSnapshot, words } from './bstocks-bsc-rpc.mjs';

const SELECTOR = {
  decimals: '313ce567', immutables: 'bcdb4dad', poolIndex: '6c3eab47', indexedPool: '158b67fa',
  lensState: '614937d4', ladder: 'eecdff30',
};
const Q64 = 1n << 64n;
const call = (to, name, ...args) => encodeCall(to, SELECTOR[name], ...args);
const signedWord = (value) => value >= (1n << 255n) ? value - (1n << 256n) : value;
const wordAddress = (value) => value < (1n << 160n) ? `0x${value.toString(16).padStart(40, '0')}` : null;

function validInt16(value) {
  return value >= -32768n && value <= 32767n;
}

function positiveBand(values, bounds, currentBin, direction) {
  let cumulativeOut = 0n;
  let previousIn = 0n;
  let simulatedBands = 0;
  let last;
  for (let i = 0; i < bounds.size; i += 1) {
    const start = bounds.position + 1 + 7 * i;
    const [bin, lower, upper, available, tradeable, out, input] = values.slice(start, start + 7);
    const index = signedWord(bin);
    cumulativeOut += tradeable;
    if (index !== currentBin + BigInt(i * direction) || !validInt16(index) || lower === 0n || upper < lower ||
      tradeable > available || out !== cumulativeOut || (input > 0n && input < previousIn)) return null;
    if (input > 0n) previousIn = input;
    if (input > 0n && tradeable > 0n && out > 0n) {
      simulatedBands += 1;
      last = { index: Number(index), lower, upper, input, out };
    }
  }
  return last ? { simulatedBands, returnedBands: bounds.size, last } : null;
}

function decodeLadder(value, currentBin) {
  const bins = words(value);
  if (!bins || bins.length < 10 || bins[0] !== 32n) return null;
  const [oracleBid, oracleAsk, reference, effectiveBid, effectiveAsk] = bins.slice(1, 6);
  if (bins.slice(1, 6).some((entry) => entry >= (1n << 128n)) || !oracleBid ||
    oracleBid > reference || reference > oracleAsk || !effectiveBid || effectiveAsk < effectiveBid) return null;
  const bounds = (offset) => {
    if (offset % 32n || offset < 224n || offset / 32n > BigInt(bins.length)) return null;
    const position = 1 + Number(offset / 32n);
    const size = bins[position];
    if (size === undefined || size > BigInt(BSC_METRIC_DEPTH.maxBands)) return null;
    const end = position + 1 + Number(size) * 7;
    return end <= bins.length ? { position, size: Number(size), end } : null;
  };
  const askBounds = bounds(bins[6]);
  const bidBounds = bounds(bins[7]);
  if (!askBounds || !bidBounds || askBounds.position !== 8 || askBounds.end !== bidBounds.position || bidBounds.end !== bins.length) return null;
  const asks = positiveBand(bins, askBounds, currentBin, 1);
  const bids = positiveBand(bins, bidBounds, currentBin, -1);
  return asks && bids ? { asks, bids } : null;
}

function priceUsdt(value, baseIsToken0) {
  const [numerator, denominator] = baseIsToken0 ? [value, Q64] : [Q64, value];
  return decimalAmount((numerator * 10n ** 12n + denominator / 2n) / denominator, 12);
}

function summarizeBand({ last, returnedBands, simulatedBands }, buy, baseIsToken0) {
  return {
    quoteDepthUsdt: decimalAmount(buy ? last.input : last.out), farthestSimulatedBin: last.index,
    simulatedBands, returnedBands,
    lowerPriceUsdt: priceUsdt(baseIsToken0 ? last.lower : last.upper, baseIsToken0),
    upperPriceUsdt: priceUsdt(baseIsToken0 ? last.upper : last.lower, baseIsToken0),
  };
}

export async function captureMetric(manifest, catalog) {
  const config = BSC_METRIC_DEPTH;
  const scopes = listedPoolScopes(manifest, catalog, (venue) => venue === config.venue);
  const { block, aggregate, readAt, verifyBlock } = await openBscSnapshot();
  const metadata = await aggregate([
    ['quoteDecimals', call(BSC_USDT, 'decimals')],
    ...scopes.flatMap(({ ticker, pool, base }) => [
      [`${ticker}/decimals`, call(base, 'decimals')], [`${ticker}/immutables`, call(pool, 'immutables')],
      [`${ticker}/index`, call(config.factory, 'poolIndex', pool)], [`${ticker}/state`, call(config.provider, 'lensState', pool)],
    ]),
  ], 8);
  if (words(metadata.get('quoteDecimals'), 1)?.[0] !== 18n) throw new Error('Canonical USDT decimals unavailable');

  const candidates = scopes.flatMap((pool) => {
    const get = (name) => metadata.get(`${pool.ticker}/${name}`);
    const immutable = words(get('immutables'));
    const index = words(get('index'), 1)?.[0];
    const state = words(get('state'), 7);
    if (!immutable || immutable.length < 5 || wordAddress(immutable[0]) !== config.factory || immutable[3] !== 1n || immutable[4] !== 1n ||
      index === undefined || !state || state[0] !== 0n || state[2] >= (1n << 104n) || words(get('decimals'), 1)?.[0] !== 18n) return [];
    const token0 = wordAddress(immutable[1]);
    const token1 = wordAddress(immutable[2]);
    const currentBin = signedWord(state[1]);
    if (!validInt16(currentBin) || ![token0, token1].includes(pool.base) || ![token0, token1].includes(BSC_USDT)) return [];
    return [{ ...pool, index, currentBin, baseIsToken0: token0 === pool.base }];
  });
  const registrations = await aggregate(candidates.map((pool) => [pool.ticker, call(config.factory, 'indexedPool', pool.index)]), 8);
  const registered = candidates.filter((pool) => decodeAddress(registrations.get(pool.ticker)) === pool.pool);
  const scoped = await Promise.all(registered.map(async (scope) => {
    const raw = await readAt(call(config.provider, 'ladder', scope.pool, config.maxBands - 1), '0x989680');
    const ladder = decodeLadder(raw, scope.currentBin);
    if (!ladder) return null;
    const { baseIsToken0 } = scope;
    const [buy, sell] = baseIsToken0 ? [ladder.asks, ladder.bids] : [ladder.bids, ladder.asks];
    return [scope.base, { pool: scope.pool, venue: scope.venue,
      buy: summarizeBand(buy, true, baseIsToken0), sell: summarizeBand(sell, false, baseIsToken0) }];
  }));
  const pools = Object.fromEntries(scoped.filter(Boolean));
  if (!Object.keys(pools).length) throw new Error('No Metric pools returned positive independent depth on both sides');
  await verifyBlock();

  const snapshot = {
    version: 1, network: 'bsc', chainId: 56, quote: { symbol: 'USDT', contract: BSC_USDT, decimals: 18 }, method: 'metric-omm-ladder',
    block, observedAt: new Date().toISOString(), sources: { endpoint: BSC_DEPTH_RPC, multicall: BSC_MULTICALL3, metric: config }, pools,
  };
  if (Object.keys(pools).some((base) => !metricPoolDepth(snapshot, base, manifest.pools[base], BSC_USDT))) throw new Error('Normalized Metric pool depth failed validation');
  return { snapshot, missing: scopes.filter(({ base }) => !Object.hasOwn(pools, base)).map(({ ticker }) => ticker) };
}
