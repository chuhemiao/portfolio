import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { BSC_DEPTH_QUOTES, BSC_DEPTH_RPC, BSC_DEPTH_VENUES, BSC_MULTICALL3, dexPoolDepth } from '../src/lib/bstocks-study.ts';
import { decimalAmount, decodeAddress, encodeCall, listedPoolScopes, openBscSnapshot, words } from './lib/bstocks-bsc-rpc.mjs';
import { captureMetric } from './lib/bstocks-metric-depth.mjs';
import { writeSnapshot } from './lib/write-snapshot.mjs';
const SWAP_CAP = (1n << 128n) - 1n;
const CROSS_CHECK = new Set(['CRCLB', 'ANTB', 'MSFTB', 'SPCXB', 'BNCB']);
const SELECTOR = {
  factory: 'c45a0155', token0: '0dfe1681', token1: 'd21220a7', fee: 'ddca3f43', slot0: '3850c7bd',
  liquidity: '1a686502', decimals: '313ce567', getPool: '1698ee82', exactInput: 'c6a5026a', exactOutput: 'bd21704a',
};

const call = (to, name, ...args) => encodeCall(to, SELECTOR[name], ...args);

function sqrtFloor(value) {
  let estimate = 1n << BigInt(Math.ceil(value.toString(2).length / 2));
  for (;;) {
    const next = (estimate + value / estimate) / 2n;
    if (next >= estimate) return estimate;
    estimate = next;
  }
}

function priceLimit(spot, numerator, denominator, roundUp) {
  const square = spot * spot * numerator;
  const floor = sqrtFloor(square / denominator);
  return roundUp && floor * floor * denominator < square ? floor + 1n : floor;
}

function swapLimits(spot, quoteIsToken0) {
  const buy = quoteIsToken0 ? priceLimit(spot, 100n, 101n, true) : priceLimit(spot, 101n, 100n, false);
  const sell = quoteIsToken0 ? priceLimit(spot, 100n, 99n, false) : priceLimit(spot, 99n, 100n, true);
  const min = 4_295_128_739n;
  const max = 1461446703485210103287273052203988822378723970342n;
  return [buy, sell].some((limit) => limit <= min || limit >= max || limit === spot) ? null : { buy, sell };
}

function quoteCall(pool, quoteContract, side, method, amount) {
  const [input, output] = side === 'buy' ? [quoteContract, pool.base] : [pool.base, quoteContract];
  return call(pool.source.quoter, method, input, output, amount, pool.fee, pool.limits[side]);
}

function quoteAmount(value, limit) {
  const quote = words(value, 4);
  return quote && quote[0] > 0n && quote[1] === limit && quote[2] < (1n << 32n) ? quote[0] : null;
}

async function captureV3(manifest, catalog, quote) {
  const scopes = listedPoolScopes(manifest, catalog, (venue) => Object.hasOwn(BSC_DEPTH_VENUES, venue), quote)
    .map((pool) => ({ ...pool, source: BSC_DEPTH_VENUES[pool.venue] }));
  const { block, aggregate, verifyBlock } = await openBscSnapshot();
  const venueSources = new Map(scopes.map(({ venue, source }) => [venue, source]));
  const scopeReads = ['token0', 'token1', 'factory', 'fee', 'slot0', 'liquidity'];
  const metadata = await aggregate([
    ['quoteDecimals', call(quote.contract, 'decimals')],
    ...[...venueSources].map(([venue, source]) => [venue, call(source.quoter, 'factory')]),
    ...scopes.flatMap(({ ticker, pool, base }) => [
      ...scopeReads.map((kind) => [`${ticker}/${kind}`, call(pool, kind)]), [`${ticker}/decimals`, call(base, 'decimals')],
    ]),
  ], 18);
  if (words(metadata.get('quoteDecimals'), 1)?.[0] !== BigInt(quote.decimals) ||
    [...venueSources].some(([venue, source]) => decodeAddress(metadata.get(venue)) !== source.factory)) {
    throw new Error(`Canonical ${quote.symbol} decimals or v3 Quoter factory mismatch`);
  }

  const candidates = scopes.flatMap((pool) => {
    const value = (kind) => metadata.get(`${pool.ticker}/${kind}`);
    const token0 = decodeAddress(value('token0'));
    const token1 = decodeAddress(value('token1'));
    const slot = words(value('slot0'), 7);
    const fee = words(value('fee'), 1)?.[0];
    const decimals = words(value('decimals'), 1)?.[0];
    const liquidity = words(value('liquidity'), 1)?.[0];
    if (!token0 || !token1 || token0 >= token1 || ![token0, token1].includes(pool.base) || ![token0, token1].includes(quote.contract) ||
      decodeAddress(value('factory')) !== pool.source.factory || !fee || fee >= 1_000_000n || !liquidity ||
      decimals === undefined || decimals > 255n || !slot || slot[0] < 4_295_128_739n || slot[0] >= (1n << 160n) || slot[6] !== 1n) return [];
    const tick = slot[1] >= (1n << 255n) ? slot[1] - (1n << 256n) : slot[1];
    const limits = swapLimits(slot[0], token0 === quote.contract);
    return tick < -887272n || tick > 887272n || !limits ? [] : [{ ...pool, token0, token1, fee, limits }];
  });

  const registrations = await aggregate(candidates.map((pool) => [pool.ticker, call(pool.source.factory, 'getPool', pool.token0, pool.token1, pool.fee)]), 15);
  const registered = candidates.filter((pool) => decodeAddress(registrations.get(pool.ticker)) === pool.pool);
  const quotes = await aggregate(registered.flatMap((pool) => [
    [`${pool.ticker}/buy`, quoteCall(pool, quote.contract, 'buy', 'exactOutput', SWAP_CAP)],
    [`${pool.ticker}/sell`, quoteCall(pool, quote.contract, 'sell', 'exactInput', SWAP_CAP)],
  ]), 4);
  const complete = registered.flatMap((pool) => {
    const buy = quoteAmount(quotes.get(`${pool.ticker}/buy`), pool.limits.buy);
    const sell = quoteAmount(quotes.get(`${pool.ticker}/sell`), pool.limits.sell);
    return buy && sell ? [{ ...pool, buy, sell }] : [];
  });

  const opposite = await aggregate(complete.filter(({ ticker }) => CROSS_CHECK.has(ticker)).flatMap((pool) => [
    [`${pool.ticker}/buy`, quoteCall(pool, quote.contract, 'buy', 'exactInput', pool.buy)],
    [`${pool.ticker}/sell`, quoteCall(pool, quote.contract, 'sell', 'exactOutput', pool.sell)],
  ]), 4);
  const verified = complete.filter(({ ticker, limits }) => !CROSS_CHECK.has(ticker) ||
    (quoteAmount(opposite.get(`${ticker}/buy`), limits.buy) && quoteAmount(opposite.get(`${ticker}/sell`), limits.sell)));
  if (!verified.length) throw new Error('No pools completed both verified depth bounds');

  await verifyBlock();
  const [buyKey, sellKey] = quote.symbol === 'USDT' ? ['buyInUsdt', 'sellOutUsdt'] : ['buyInQuote', 'sellOutQuote'];
  const pools = Object.fromEntries(verified.map(({ base, pool, venue, buy, sell }) => [base, {
    pool, venue, [buyKey]: decimalAmount(buy, quote.decimals), [sellKey]: decimalAmount(sell, quote.decimals),
  }]));
  const snapshot = {
    version: 1, network: 'bsc', chainId: 56, quote, limitBps: 100,
    block, observedAt: new Date().toISOString(), sources: { endpoint: BSC_DEPTH_RPC, multicall: BSC_MULTICALL3, venues: Object.fromEntries(venueSources) }, pools,
  };
  if (verified.some(({ base }) => !dexPoolDepth(snapshot, base, manifest.pools[base], quote.contract))) throw new Error('Normalized pool depth failed validation');
  return { snapshot, missing: scopes.filter(({ base }) => !Object.hasOwn(pools, base)).map(({ ticker }) => ticker) };
}

const { values } = parseArgs({ options: { out: { type: 'string' }, method: { type: 'string', default: 'v3' }, quote: { type: 'string', default: 'USDT' } } });
if (!values.out || !['v3', 'metric'].includes(values.method) || !Object.hasOwn(BSC_DEPTH_QUOTES, values.quote)) {
  throw new Error('Supply --out <snapshot.json> with optional --method v3 or metric and --quote USDT or WBNB');
}
const quote = BSC_DEPTH_QUOTES[values.quote];
if (values.method === 'metric' && quote.symbol !== 'USDT') throw new Error('Metric capture requires USDT');
const manifestFile = quote.symbol === 'USDT' ? 'bstocks-dex-pools.json' : 'bstocks-wbnb-pools.json';
const [manifest, catalog] = await Promise.all([manifestFile, 'bstocks.json'].map(async (file) =>
  JSON.parse(await readFile(new URL(`../src/data/instruments/${file}`, import.meta.url), 'utf8'))));
const { snapshot, missing } = await (values.method === 'metric' ? captureMetric : captureV3)(manifest, catalog, quote);
await writeSnapshot(values.out, snapshot);
console.log(`Verified depth for ${Object.keys(snapshot.pools).length} pools at BNB Chain block ${snapshot.block.number}.`);
if (missing.length) console.log(`No complete observation for ${missing.join(', ')}.`);
