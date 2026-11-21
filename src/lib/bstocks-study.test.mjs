import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import roster from '../data/instruments/bstocks.json' with { type: 'json' };
import poolRegistry from '../data/instruments/bstocks-dex-pools.json' with { type: 'json' };
import depthSnapshot from '../data/instruments/bstocks-dex-depth.json' with { type: 'json' };
import metricSnapshot from '../data/instruments/bstocks-metric-depth.json' with { type: 'json' };
import wbnbPools from '../data/instruments/bstocks-wbnb-pools.json' with { type: 'json' };
import wbnbSnapshot from '../data/instruments/bstocks-wbnb-depth.json' with { type: 'json' };
import displayUnitsSnapshot from '../data/instruments/bstocks-display-units.json' with { type: 'json' };
import v2Snapshot from '../data/instruments/bstocks-v2-reserves.json' with { type: 'json' };
import depthOnlySnapshot from '../data/instruments/bstocks-v3-depth-only.json' with { type: 'json' };
import infinitySnapshot from '../data/instruments/bstocks-infinity-quotes.json' with { type: 'json' };
import infinityFollowUpSnapshot from '../data/instruments/bstocks-infinity-quotes-followup.json' with { type: 'json' };
import uniswapV4Snapshots from '../data/instruments/bstocks-uniswap-v4-quotes.json' with { type: 'json' };
import uniswapV4EthSnapshot from '../data/instruments/bstocks-uniswap-v4-eth-depth.json' with { type: 'json' };
import prospectusSnapshot from '../data/instruments/bstocks-prospectuses.json' with { type: 'json' };
import primary from '../data/instruments/bstocks-primary-facts.json' with { type: 'json' };
import sec from '../data/instruments/bstocks-sec.json' with { type: 'json' };
import { ADGM_PROSPECTUS_DIRECTORY, BEP_677_STANDARD, BSC_DEPTH_VENUES, BSC_PANCAKE_INFINITY, BSC_PANCAKE_V2, BSC_UNISWAP_V4, adgmProspectuses, adjustedHistory, bscTokenDisplayUnits, closedBinanceCloses, dexPoolDepth, matchedPremium, measureOrderBook, metricPoolDepth, nativeMarket, pancakeInfinityQuotes, pancakeV2Reserves, priceIndicators, secFundamentals, supplementFilings, trailingTwelveMonths, uniswapV4EthDepth, uniswapV4Quotes } from './bstocks-study.ts';

const day = 86_400_000;
const nov19 = Date.parse('2026-11-19T00:00:00Z');
const moment = '2026-11-19T21:00:00Z';
const cutoff = '2026-11-20T10:39:19.519Z';
const bar = (start) => [start, '100', '110', '95', '103', '10', start + day - 1, '1000', 42];
const infinitySnapshots = [infinitySnapshot, infinityFollowUpSnapshot];

test('daily token history keeps only completely closed traded UTC bars and rejects duplicates', () => {
  const partial = bar(nov19 - day);
  partial[6] -= 1;
  const noTrades = bar(nov19 - 3 * day);
  noTrades[8] = 0;
  assert.deepEqual(closedBinanceCloses([bar(nov19), bar(nov19 + day), partial, noTrades], Date.parse(cutoff)), [{ day: '2026-11-19', close: 103, volume: 10 }]);
  assert.deepEqual(closedBinanceCloses([bar(nov19), bar(nov19)], Date.parse(cutoff)), []);
});

test('spread and depth use midpoint and count only the notional within the measured window', () => {
  const book = { lastUpdateId: 391, bids: [['99.5', '8'], ['98', '3']], asks: [['100.5', '6'], ['102', '1']] };
  const metric = measureOrderBook(book);
  assert.equal(metric.midpoint, 100);
  assert.equal(metric.spreadBps, 100);
  assert.equal(metric.bidDepth, 796);
  assert.equal(metric.askDepth, 603);
  assert.equal(metric.bidCoversWindow && metric.askCoversWindow, true);
  const limited = measureOrderBook({ ...book, bids: [book.bids[0]] });
  assert.equal(limited.bidCoversWindow, false);
  assert.equal(limited.askCoversWindow, true);
  assert.equal(measureOrderBook({ ...book, asks: [['99.4', '1']] }), null);
});

test('the finalized display-unit snapshot binds each exact scale to its chain, symbol and ISIN', () => {
  const listed = roster.filter(({ chains }) => chains.includes('BNB Chain'));
  const items = new Map(listed.map(({ ticker, listing }) => {
    const address = listing.contractAddress.toLowerCase();
    const row = bscTokenDisplayUnits(displayUnitsSnapshot, address, ticker, listing.isin);
    assert.equal(row?.block.timestamp, displayUnitsSnapshot.block.timestamp, ticker);
    return [ticker, row.multiplier];
  }));
  assert.deepEqual(Object.keys(displayUnitsSnapshot.tokens).sort(), listed.map(({ listing }) => listing.contractAddress.toLowerCase()).sort());
  assert.equal(items.get('CRCLB'), '1');
  assert.equal(items.get('MUUB'), '1.003951968068627743');
  assert.equal(items.get('SNDKB'), '8');

  const { ticker, listing } = listed.find(({ ticker }) => ticker === 'MUUB');
  const base = listing.contractAddress.toLowerCase();
  const captured = displayUnitsSnapshot.tokens[base];
  const read = (modified = displayUnitsSnapshot) => bscTokenDisplayUnits(modified, base, ticker, listing.isin);
  const replace = (patch) => ({ ...displayUnitsSnapshot, tokens: { [base]: { ...captured, ...patch } } });
  assert.equal(read(replace({ uiMultiplier: '1', newUiMultiplier: '1' })).multiplier, '0.000000000000000001');
  for (const raw of ['0', '1e18', '01000000000000000000', (1n << 256n).toString(), 1e18]) {
    assert.equal(read(replace({ uiMultiplier: raw, newUiMultiplier: raw })), null);
  }
  for (const patch of [{ decimals: 6 }, { ticker: 'MUB' }, { isin: 'AE000A4AU3B0' }, { newUiMultiplier: '1' },
    { effectiveAt: '1795180000' }, { pendingMultiplier: '1' }, { pendingEffectiveAt: '1795180000' }]) {
    assert.equal(read(replace(patch)), null);
  }
  assert.equal(read({ ...displayUnitsSnapshot, chainId: 1 }), null);
  assert.equal(read({ ...displayUnitsSnapshot, tokens: {} }), null);
  assert.equal(read({ ...displayUnitsSnapshot, sources: { ...displayUnitsSnapshot.sources, standard: 'https://example.test/' } }), null);
  assert.equal(bscTokenDisplayUnits(displayUnitsSnapshot, base, ticker, 'AE000A4AU3B0'), null);
});

test('ADGM approved prospectuses preserve all exact issuer listings and supplemental documents', () => {
  assert.deepEqual(Object.keys(prospectusSnapshot.rows).sort(), roster.map(({ ticker }) => ticker).sort());
  const links = [];
  const supplements = {};
  const terms = new Map();
  for (const { ticker, listing, underlying } of roster) {
    const { primary, supplementary, certificate } = adgmProspectuses(prospectusSnapshot, ticker, listing.isin);
    links.push(primary.url, ...supplementary.map(({ url }) => url));
    if (supplementary.length) supplements[ticker] = supplementary.map(({ approvalDay }) => approvalDay);
    if (certificate) {
      assert.equal(certificate.symbol, underlying.symbol, ticker);
      assert.ok(certificate.url.startsWith(`${primary.url}#page=`), ticker);
      terms.set(ticker, certificate);
    }
  }
  assert.equal(links.length, 116);
  assert.equal(new Set(links).size, 116);
  assert.deepEqual(supplements, { AGPUB: ['2026-10-27'], BNCB: ['2026-10-23'], INTWB: ['2026-11-06'] });
  assert.equal(terms.size, 112);
  assert.deepEqual(roster.filter(({ ticker }) => !terms.has(ticker)).map(({ ticker }) => ticker), ['ASMLB']);
  for (const [ticker, kind, page] of [
    ['TSLAB', 'share', 14], ['CRWVB', 'share', 14], ['MUB', 'share', 14], ['NVDAB', 'share', 14],
    ['BRKBB', 'share', 14], ['MELIB', 'share', 14],
    ['AGPUB', 'share', 14], ['BNCB', 'share', 14], ['INTWB', 'fund-unit', 14], ['QQQB', 'fund-unit', 14],
    ['BABAB', 'adr', 85], ['TSMB', 'adr', 14], ['ARMB', 'ads', 14],
  ]) {
    assert.equal(terms.get(ticker)?.kind, kind, ticker);
    assert.equal(terms.get(ticker).url, `${prospectusSnapshot.rows[ticker].primary.url}#page=${page}`);
  }
  assert.equal(terms.has('ASMLB'), false);

  const { primary, supplementary, isin, certificate } = prospectusSnapshot.rows.INTWB;
  const replace = (patch) => ({ ...prospectusSnapshot, rows: { INTWB: { primary, supplementary, isin, certificate, ...patch } } });
  const read = (input) => adgmProspectuses(input, 'INTWB', isin);
  assert.equal(adgmProspectuses(prospectusSnapshot, 'INTWB', prospectusSnapshot.rows.BNCB.isin), null);
  assert.equal(read({ ...prospectusSnapshot, issuer: 'Different issuer' }), null);
  assert.equal(read({ ...prospectusSnapshot, source: primary.url }), null);
  for (const url of [primary.url.replace('www.adgm.com', 'www.adgm.com.example.test'), `${primary.url}?other=1`, `${primary.url}#page=2`]) {
    assert.equal(read(replace({ primary: { ...primary, url } })), null);
  }
  for (const approvalDay of ['2026-11-31', '2026-11-21']) {
    assert.equal(read(replace({ primary: { ...primary, approvalDay } })), null);
  }
  assert.equal(read(replace({ supplementary: [primary] })), null);
  assert.equal(read(replace({ supplementary: [{ ...supplementary[0], approvalDay: '2020-01-01' }] })), null);
  for (const patch of [{ page: 0 }, { page: 1.5 }, { page: '14' }, { kind: 'unknown' }, { reviewedSupplementary: [] }]) {
    const retained = read(replace({ certificate: { ...certificate, ...patch } }));
    assert.equal(retained.certificate, undefined);
    assert.deepEqual(retained.supplementary, supplementary);
  }
  const updatedSupplement = { ...supplementary[0], url: supplementary[0].url.replace('.pdf', '-amendment.pdf') };
  const unreviewed = read(replace({ supplementary: [updatedSupplement] }));
  assert.deepEqual(unreviewed.supplementary, [updatedSupplement]);
  assert.equal(unreviewed.certificate, undefined);
});

test('pool depth is an exact positive quote linked to its chain, block, issuer contract and v3 venue', () => {
  const base = roster.find(({ ticker }) => ticker === 'CRCLB').listing.contractAddress.toLowerCase();
  const pool = poolRegistry.pools[base];
  const quote = poolRegistry.quote.contract;
  const read = (snapshot = depthSnapshot, contract = base, pair = pool) => dexPoolDepth(snapshot, contract, pair, quote);
  const captured = depthSnapshot.pools[base];
  assert.equal(read().buyInQuote, captured.buyInUsdt);
  assert.equal(read().sellOutQuote, captured.sellOutUsdt);
  assert.equal(read().block.timestamp, depthSnapshot.block.timestamp);
  assert.equal(read(depthSnapshot, quote), null);
  assert.equal(read(depthSnapshot, base, { ...pool, venue: 'Uniswap V3 (BSC)' }), null);
  assert.equal(read(depthSnapshot, base, { ...pool, pool: base }), null);
  assert.equal(read({ ...depthSnapshot, chainId: 1 }), null);
  assert.equal(read({ ...depthSnapshot, limitBps: 200 }), null);
  assert.equal(read({ ...depthSnapshot, quote: { ...depthSnapshot.quote, contract: base } }), null);
  assert.equal(read({ ...depthSnapshot, quote: { ...depthSnapshot.quote, decimals: 6 } }), null);
  assert.equal(read({ ...depthSnapshot, block: { ...depthSnapshot.block, number: 0 } }), null);
  assert.equal(read({ ...depthSnapshot, block: { ...depthSnapshot.block, hash: 'invalid' } }), null);
  assert.equal(read({ ...depthSnapshot, block: { ...depthSnapshot.block, timestamp: '2099-01-01T00:00:00Z' } }), null);
  assert.equal(read({ ...depthSnapshot, sources: { ...depthSnapshot.sources, multicall: {} } }), null);
  const withSell = (sellOutUsdt) => ({ ...depthSnapshot, pools: { [base]: { ...captured, sellOutUsdt } } });
  for (const amount of [0, '0', '0.000', '-0.01', '1e6', '05', '1.0000000000000000001', '9'.repeat(60)]) {
    assert.equal(read(withSell(amount)), null, String(amount));
  }
  const singleUnit = '0.000000000000000001';
  assert.equal(read(withSell(singleUnit)).sellOutQuote, singleUnit);
});

test('the verified BNCB pool preserves WBNB amounts and rejects mixed quote identities', () => {
  const base = roster.find(({ ticker }) => ticker === 'BNCB').listing.contractAddress.toLowerCase();
  const pool = wbnbPools.pools[base];
  const quote = wbnbPools.quote.contract;
  const row = wbnbSnapshot.pools[base];
  const proof = dexPoolDepth(wbnbSnapshot, base, pool, quote);
  assert.equal(proof.buyInQuote, row.buyInQuote);
  assert.equal(proof.sellOutQuote, row.sellOutQuote);
  assert.equal(proof.block.number, wbnbSnapshot.block.number);
  assert.equal(Object.hasOwn(poolRegistry.pools, base), false);
  assert.equal(dexPoolDepth(wbnbSnapshot, base, pool, poolRegistry.quote.contract), null);
  assert.equal(dexPoolDepth(depthSnapshot, base, pool, quote), null);
  assert.equal(dexPoolDepth({ ...wbnbSnapshot, quote: { ...wbnbSnapshot.quote, symbol: 'USDT' } }, base, pool, quote), null);
  const mislabelled = { pool: row.pool, venue: row.venue, buyInUsdt: row.buyInQuote, sellOutUsdt: row.sellOutQuote };
  assert.equal(dexPoolDepth({ ...wbnbSnapshot, pools: { [base]: mislabelled } }, base, pool, quote), null);
  assert.equal(metricPoolDepth(wbnbSnapshot, base, pool, quote), null);
});

test('the V2 reserve model preserves native units, exact band limits and dust without inventing executable amounts', () => {
  const values = new Map(Object.entries(v2Snapshot.pools).map(([contract, { ticker, isin }]) => {
    const listing = roster.find((row) => row.ticker === ticker)?.listing;
    assert.equal(listing?.contractAddress.toLowerCase(), contract);
    assert.equal(listing?.isin, isin);
    assert.ok(!poolRegistry.pools[contract] && !wbnbPools.pools[contract]);
    const pool = pancakeV2Reserves(v2Snapshot, contract, ticker, isin);
    assert.ok(pool?.buyInQuote && pool.sellOutQuote && pool.block.number === v2Snapshot.block.number, ticker);
    return [ticker, pool];
  }));
  assert.equal(values.size, 23);
  assert.equal([...values.values()].filter(({ quote }) => quote === 'WBNB').length, 22);
  const tiny = values.get('SMCIB');
  assert.deepEqual([tiny.quote, tiny.quoteReserve, tiny.buyInQuote, tiny.sellOutQuote],
    ['WBNB', '0.000000460500777836', '0.000000002299650804', '0.00000000230541461']);
  const gpro = values.get('GPROB');
  assert.deepEqual([gpro.quote, gpro.quoteReserve, gpro.buyInQuote, gpro.sellOutQuote],
    ['USDT', '0.011570838899114576', '0.000057782506055193', '0.000057927331162136']);

  const [base, funded] = Object.entries(v2Snapshot.pools).find(([, { ticker }]) => ticker === 'SMCIB');
  const read = (snapshot) => pancakeV2Reserves(snapshot, base, funded.ticker, funded.isin);
  const mutate = (patch) => ({ ...v2Snapshot, pools: { [base]: { ...funded, ...patch } } });
  const dust = read(mutate({ baseReserveRaw: '1', quoteReserveRaw: '1' }));
  assert.equal(dust.quoteReserve, '0.000000000000000001');
  assert.equal(dust.buyInQuote, null);
  assert.equal(dust.sellOutQuote, null);
  for (const patch of [{ baseReserveRaw: '0' }, { quoteReserveRaw: String(1n << 112n) }, { quoteReserveRaw: 100 }, { lpSupplyRaw: '0' },
    { baseIsToken0: !funded.baseIsToken0 }, { quoteDecimals: 6 }, { quoteContract: base }, { isin: 'AE000A4AU3B0' },
    { lastReserveAt: '2099-01-01T00:00:00Z' }, { pool: '0x' + '0'.repeat(40) }]) assert.equal(read(mutate(patch)), null);
  assert.equal(read({ ...v2Snapshot, chainId: 1 }), null);
  assert.equal(read({ ...v2Snapshot, sources: { ...v2Snapshot.sources, venue: { ...BSC_PANCAKE_V2, feeBps: 30 } } }), null);
  assert.equal(read(wbnbSnapshot), null);
});

test('V2 rejects a pool address reused by two bStocks without hiding a separate reserve pool', () => {
  const rows = new Map(Object.entries(v2Snapshot.pools).map(([base, row]) => [row.ticker, { base, row }]));
  const smci = rows.get('SMCIB');
  const alab = rows.get('ALABB');
  const malformed = { ...v2Snapshot, pools: { ...v2Snapshot.pools, [smci.base]: { ...smci.row, pool: alab.row.pool } } };
  const read = (snapshot, ticker) => {
    const { base, row } = rows.get(ticker);
    return pancakeV2Reserves(snapshot, base, row.ticker, row.isin);
  };
  assert.equal(read(malformed, 'SMCIB'), null);
  assert.equal(read(malformed, 'ALABB'), null);
  const unaffected = read(v2Snapshot, 'GPROB');
  assert.ok(unaffected?.quoteReserve);
  assert.deepEqual(read(malformed, 'GPROB'), unaffected);
});

test('V3 rejects a pool address reused by two bStocks in the supplemental depth snapshot', () => {
  const [agpu, ibm] = Object.keys(depthOnlySnapshot.pools);
  const malformed = { ...depthOnlySnapshot, pools: { ...depthOnlySnapshot.pools, [agpu]: { ...depthOnlySnapshot.pools[agpu], pool: depthOnlySnapshot.pools[ibm].pool } } };
  const read = (snapshot, base) => dexPoolDepth(snapshot, base, snapshot.pools[base], snapshot.quote.contract);
  assert.ok(read(depthOnlySnapshot, agpu)?.buyInQuote);
  assert.ok(read(depthOnlySnapshot, ibm)?.sellOutQuote);
  assert.equal(read(malformed, agpu), null);
  assert.equal(read(malformed, ibm), null);
});

test('supplemental Metric comparisons keep separate blocks, accept both bounds and preserve their own quote units', () => {
  const aapl = { ...depthOnlySnapshot, ...depthOnlySnapshot.aaplComparison };
  const [[aaplBase, aaplPool]] = Object.entries(aapl.pools);
  const [[snxxBase, snxxPool]] = Object.entries(uniswapV4EthSnapshot.pools);
  for (const [base, row] of [[aaplBase, aaplPool], [snxxBase, snxxPool]]) {
    const listing = roster.find(({ ticker }) => ticker === row.ticker).listing;
    assert.deepEqual([listing.contractAddress.toLowerCase(), listing.isin], [base, row.isin]);
    assert.equal(poolRegistry.pools[base].venue, 'Metric (BSC)');
  }
  assert.deepEqual(dexPoolDepth(aapl, aaplBase, aaplPool, aapl.quote.contract), {
    kind: 'marginal', block: { number: 134791428, timestamp: '2026-11-21T00:30:00.000Z' },
    buyInQuote: '304.407748155524647306', sellOutQuote: '257.763487718438641462',
  });
  assert.equal(depthOnlySnapshot.block.number, 134751421);
  for (const patch of [{ buyInUsdt: '1' }, { marginal: { ...aaplPool.marginal, sell: null } },
    { marginal: { ...aaplPool.marginal, buy: { ...aaplPool.marginal.buy, sqrtPriceAfter: aaplPool.marginal.buy.sqrtPriceWithOneLess } } }]) {
    assert.equal(dexPoolDepth({ ...aapl, pools: { [aaplBase]: { ...aaplPool, ...patch } } }, aaplBase, aaplPool, aapl.quote.contract), null);
  }
  const read = (snapshot) => uniswapV4EthDepth(snapshot, snxxBase, snxxPool.ticker, snxxPool.isin);
  assert.deepEqual(read(uniswapV4EthSnapshot), {
    poolId: snxxPool.poolId, quote: 'ETH', feePips: 30970,
    proof: { kind: 'marginal', block: { number: 134792232, timestamp: '2026-11-21T00:36:02.000Z' },
      buyInQuote: '0.000069089389859405', sellOutQuote: '0.000067285285189624' },
  });
  assert.equal(uniswapV4Quotes(uniswapV4EthSnapshot, snxxBase, snxxPool.ticker, snxxPool.isin), null);
  assert.equal(read({ ...uniswapV4EthSnapshot, quote: aapl.quote }), null);
  assert.equal(read({ ...uniswapV4EthSnapshot, bandSource: { ...uniswapV4EthSnapshot.bandSource, blockHash: aapl.block.hash } }), null);
  for (const patch of [{ hooks: snxxBase }, { token0: snxxBase }, { protocolFeePacked: 4096000 }, { marginal: { ...snxxPool.marginal, buy: null } }]) {
    assert.equal(read({ ...uniswapV4EthSnapshot, pools: { [snxxBase]: { ...snxxPool, ...patch } } }), null);
  }
});

test('Infinity quotes bind chain and pool identity, preserve raw amounts and require both marginal bounds', () => {
  const exactRaw = (amount) => {
    const [whole, fraction = ''] = amount.split('.');
    return BigInt(whole + fraction.padEnd(18, '0')).toString();
  };
  const values = new Map(Object.entries(infinitySnapshot.pools).map(([base, row]) => {
    const { ticker, isin } = row;
    const listing = roster.find((instrument) => instrument.ticker === ticker)?.listing;
    assert.deepEqual([listing?.contractAddress.toLowerCase(), listing?.isin], [base, isin]);
    assert.ok([poolRegistry, wbnbPools, v2Snapshot, depthOnlySnapshot].every(({ pools }) => !Object.hasOwn(pools, base)), ticker);
    const quote = pancakeInfinityQuotes(infinitySnapshot, base, ticker, isin);
    assert.deepEqual(quote?.block, { number: 134779979, timestamp: '2026-11-20T23:04:07.000Z' }, ticker);
    assert.deepEqual([exactRaw(quote.fixedBuyOut), exactRaw(quote.fixedSellOut)], [row.buyOutTokenRaw, row.sellOutUsdtRaw], ticker);
    assert.ok(quote.lpFeePips >= 769076 && quote.lpFeePips <= 949809);
    assert.ok(quote.swapFeePips >= 770000 && quote.swapFeePips <= 950010);
    return [ticker, quote];
  }));
  assert.deepEqual([...values.keys()].sort(), ['APPB', 'AVGOB', 'BRKBB', 'CRMB', 'CRWDB', 'CYPHB', 'HIMSB', 'LITEB', 'NBISB', 'PLTRB', 'SECZB', 'SHAZB']);
  assert.equal(new Set([...values.values()].map(({ poolId }) => poolId)).size, 12);
  assert.equal([...values.values()].filter(quote => quote.marginal).length, 12);
  for (const [ticker, marginal] of Object.entries({
    APPB: { buyInUsdt: '0.119335274083145996', sellOutUsdt: '1.498730461406309578' },
    AVGOB: { buyInUsdt: '57.091574269727876085', sellOutUsdt: '7.459107883991700338' },
    BRKBB: { buyInUsdt: '0.144520147464271022', sellOutUsdt: '300.008395136310637339' },
    NBISB: { buyInUsdt: '0.381106507907911005', sellOutUsdt: '0.07664167211079785' },
    PLTRB: { buyInUsdt: '5.005916163781117334', sellOutUsdt: '0.452790805235458716' },
  })) assert.deepEqual(values.get(ticker).marginal, marginal, ticker);
  const app = values.get('APPB');
  assert.deepEqual([app.fixedBuyOut, app.fixedSellOut, app.lpFeePips, app.swapFeePips],
    ['0.000147013072826549', '0.281374980815797654', 934056, 934320]);
  const sec = values.get('SECZB');
  assert.deepEqual([sec.lpFeePips, sec.swapFeePips], [949809, 950010]);

  const [base, captured] = Object.entries(infinitySnapshot.pools).find(([, { ticker }]) => ticker === 'NBISB');
  const read = (snapshot) => pancakeInfinityQuotes(snapshot, base, captured.ticker, captured.isin);
  const replace = (patch) => ({ ...infinitySnapshot, pools: { [base]: { ...captured, ...patch } } });
  assert.equal(read(replace({ buyOutTokenRaw: '1' })).fixedBuyOut, '0.000000000000000001');
  for (const patch of [{ isin: 'AE000A4AVFW5' }, { ticker: 'PLTRB' }, { token0: base, token1: captured.token0 },
    { hooks: base }, { parameters: '0x' + '0'.repeat(64) }, { poolId: base }, { poolId: '0x' + '0'.repeat(64) },
    { baseDecimals: 6 }, { keyFeePips: captured.lpFeePips + 1 }, { protocolFeePacked: 16388001 },
    { buyOutTokenRaw: '0' }, { sellOutUsdtRaw: '1e18' }, { sellOutUsdtRaw: (1n << 127n).toString() }]) assert.equal(read(replace(patch)), null);
  for (const patch of [{ chainId: 1 }, { quote: { ...infinitySnapshot.quote, decimals: 6 } }, { sellInputTokenRaw: '1000000000000000000' },
    { sources: { ...infinitySnapshot.sources, venue: { ...BSC_PANCAKE_INFINITY, quoter: base } } }]) assert.equal(read({ ...infinitySnapshot, ...patch }), null);
  const { marginal } = captured;
  for (const patch of [{ buy: { ...marginal.buy, sqrtPriceAfter: marginal.buy.sqrtPriceWithOneLess } },
    { sell: { ...marginal.sell, sqrtPriceWithOneLess: marginal.sell.sqrtPriceAfter } }, { sell: null }]) {
    const fallback = read(replace({ marginal: { ...marginal, ...patch } }));
    assert.equal(fallback.marginal, null);
    assert.equal(exactRaw(fallback.fixedBuyOut), captured.buyOutTokenRaw);
  }
  assert.equal(read({ ...infinitySnapshot, limitBps: 200 }).marginal, null);
});

test('Infinity rejects a pool ID reused by two bStocks without removing unrelated quotes', () => {
  const rows = new Map(Object.entries(infinitySnapshot.pools).map(([base, row]) => [row.ticker, { base, row }]));
  const app = rows.get('APPB');
  const avgo = rows.get('AVGOB');
  const malformed = { ...infinitySnapshot, pools: { ...infinitySnapshot.pools, [app.base]: { ...app.row, poolId: avgo.row.poolId } } };
  const read = (snapshot, ticker) => {
    const { base, row } = rows.get(ticker);
    return pancakeInfinityQuotes(snapshot, base, row.ticker, row.isin);
  };
  assert.equal(read(malformed, 'APPB'), null);
  assert.equal(read(malformed, 'AVGOB'), null);
  const unaffected = read(infinitySnapshot, 'PLTRB');
  assert.ok(unaffected?.marginal);
  assert.deepEqual(read(malformed, 'PLTRB'), unaffected);
});

test('Infinity keeps the observed block for each capture and rejects reused pool IDs across captures', () => {
  const rows = new Map(infinitySnapshots.flatMap(({ pools }) => Object.entries(pools)).map(([base, row]) => [row.ticker, { base, row }]));
  const read = (captures, ticker) => {
    const { base, row } = rows.get(ticker);
    return pancakeInfinityQuotes(captures, base, ticker, row.isin);
  };
  assert.equal(rows.size, 14);
  for (const [ticker, buy, sell, lpFeePips, swapFeePips, buyInUsdt, sellOutUsdt] of [
    ['DELLB', '0.000017808568631013', '0.049414958313246922', 989964, 990005, '0.243908373989597199', '0.002450084298400312'],
    ['BBB', '0.00866102679386456', '0.009846961148101529', 879618, 880100, '0.008281254584749275', '0.000997899573029856'],
  ]) {
    const { base, row } = rows.get(ticker);
    const { listing, chains } = roster.find((instrument) => instrument.ticker === ticker);
    assert.deepEqual([base, row.isin], [listing.contractAddress.toLowerCase(), listing.isin]);
    assert.ok(chains.includes('BNB Chain'));
    assert.ok([poolRegistry, wbnbPools, v2Snapshot, depthOnlySnapshot, infinitySnapshot].every(({ pools }) => !Object.hasOwn(pools, base)), ticker);
    assert.deepEqual(read(infinitySnapshots, ticker), {
      poolId: row.poolId, block: { number: 134782313, timestamp: '2026-11-20T23:21:37.000Z' },
      lpFeePips, swapFeePips, fixedBuyOut: buy, fixedSellOut: sell, marginal: { buyInUsdt, sellOutUsdt },
    });
  }
  for (const { ticker } of Object.values(infinitySnapshot.pools)) {
    assert.deepEqual(read(infinitySnapshots, ticker), read(infinitySnapshot, ticker), ticker);
    assert.equal(read(infinitySnapshots, ticker).block.number, 134779979, ticker);
  }
  const bbb = rows.get('BBB');
  const avgo = rows.get('AVGOB');
  const malformed = { ...infinityFollowUpSnapshot, pools: { ...infinityFollowUpSnapshot.pools, [bbb.base]: { ...bbb.row, poolId: avgo.row.poolId } } };
  const mixed = [malformed, infinitySnapshot];
  assert.equal(read(mixed, 'BBB'), null);
  assert.equal(read(mixed, 'AVGOB'), null);
  for (const ticker of ['DELLB', 'PLTRB']) assert.deepEqual(read(mixed, ticker), read(infinitySnapshots, ticker));
  assert.equal(read([...infinitySnapshots, infinityFollowUpSnapshot], 'BBB'), null);
});

test('Uniswap v4 preserves both pinned captures and rejects ambiguous or mismatched pool proofs', () => {
  const existing = new Set([poolRegistry, wbnbPools, depthOnlySnapshot, v2Snapshot, ...infinitySnapshots].flatMap(({ pools }) => Object.keys(pools)));
  const bases = new Map();
  const amounts = new Map();
  const poolIds = new Set();
  const exact = (value) => {
    const [whole, fraction = ''] = value.split('.');
    return BigInt(whole + fraction.padEnd(18, '0')).toString();
  };
  const [early, late] = uniswapV4Snapshots;
  assert.deepEqual([early.block.number, late.block.number], [134784374, 134784767]);
  assert.deepEqual(uniswapV4Snapshots.map(({ pools }) => Object.keys(pools).length), [8, 23]);
  for (const snapshot of uniswapV4Snapshots) {
    for (const [base, row] of Object.entries(snapshot.pools)) {
      const { ticker, isin } = row;
      const { listing, chains } = roster.find(item => item.ticker === ticker);
      assert.deepEqual([listing.contractAddress.toLowerCase(), listing.isin], [base, isin], ticker);
      assert.ok(chains.includes('BNB Chain') && !existing.has(base) && !poolIds.has(row.poolId), ticker);
      existing.add(base);
      poolIds.add(row.poolId);
      bases.set(ticker, { base, row });
      const quote = uniswapV4Quotes(uniswapV4Snapshots, base, ticker, isin);
      assert.deepEqual(quote?.block, { number: snapshot.block.number, timestamp: snapshot.block.timestamp }, ticker);
      assert.equal(quote.poolId, row.poolId, ticker);
      assert.deepEqual([exact(quote.fixedBuyOut), exact(quote.fixedSellOut)], [row.buyOutTokenRaw, row.sellOutUsdtRaw], ticker);
      assert.equal(quote.swapFeePips, row.lpFeePips + 1000 - Math.floor(row.lpFeePips / 1000), ticker);
      if (row.marginal) assert.deepEqual([exact(quote.marginal.buyInUsdt), exact(quote.marginal.sellOutUsdt)],
        [row.marginal.buy.inputRaw, row.marginal.sell.outputRaw], ticker);
      amounts.set(ticker, quote);
    }
  }
  assert.equal(existing.size, 113);
  assert.deepEqual([...amounts].filter(([, quote]) => !quote.marginal).map(([ticker]) => ticker), ['USDEB']);
  const arm = amounts.get('ARMB');
  assert.deepEqual(arm.marginal, { buyInUsdt: '3.593832047560317595', sellOutUsdt: '3.540397032832219432' });
  assert.deepEqual([arm.lpFeePips, arm.swapFeePips], [18800, 19782]);
  const usde = amounts.get('USDEB');
  assert.deepEqual([usde.fixedBuyOut, usde.fixedSellOut, usde.swapFeePips], ['0.080085664898842641', '0.103512397710184551', 89512]);
  const stx = amounts.get('STXB');
  assert.deepEqual([stx.lpFeePips, stx.swapFeePips], [880000, 880120]);
  const { base: adbBase, row: adbRow } = bases.get('ADBEB');
  const { base: botBase, row: botRow } = bases.get('BOTB');
  const read = (snapshots, ticker) => {
    const { base, row } = bases.get(ticker);
    return uniswapV4Quotes(snapshots, base, ticker, row.isin);
  };
  const wdcFallback = read([early, { ...late, bandSource: null }], 'WDCB');
  assert.equal(wdcFallback.marginal, null);
  assert.deepEqual([wdcFallback.fixedBuyOut, wdcFallback.fixedSellOut], ['0.00038279455894296', '1.037264631477089513']);
  const change = (patch) => ({ ...early, pools: { ...early.pools, [adbBase]: { ...adbRow, ...patch } } });
  for (const patch of [{ hooks: adbBase }, { tickSpacing: 0 }, { tickSpacing: 32768 }, { tickSpacing: 1.5 },
    { token0: adbBase, token1: adbRow.token0 }, { keyFeePips: adbRow.lpFeePips + 1 }, { protocolFeePacked: 4101097 }, { isin: 'AE000A4AVF84' }]) {
    assert.equal(read([change(patch), late], 'ADBEB'), null);
  }
  const corrupted = [early, { ...late, pools: { ...late.pools, [botBase]: { ...botRow, poolId: adbRow.poolId } } }];
  assert.equal(read(corrupted, 'BOTB'), null);
  assert.equal(read(corrupted, 'ADBEB'), null);
  assert.deepEqual(read(corrupted, 'ARMB'), arm);
  assert.deepEqual(read(corrupted, 'USDEB'), usde);
  assert.equal(read([...uniswapV4Snapshots, early], 'ADBEB'), null);
  assert.equal(pancakeInfinityQuotes(uniswapV4Snapshots, adbBase, adbRow.ticker, adbRow.isin), null);
  assert.equal(read([{ ...early, sources: { ...early.sources, venue: { ...BSC_UNISWAP_V4, stateView: adbBase } } }, late], 'ADBEB'), null);
  const band = adbRow.marginal;
  for (const faulty of [
    change({ marginal: { ...band, sell: null } }),
    change({ marginal: { ...band, buy: { ...band.buy, sqrtPriceAfter: band.buy.sqrtPriceWithOneLess } } }),
    { ...early, bandSource: { ...early.bandSource, blockHash: late.block.hash } },
  ]) {
    const fixed = read([faulty, late], 'ADBEB');
    assert.equal(fixed.marginal, null);
    assert.equal(exact(fixed.fixedSellOut), adbRow.sellOutUsdtRaw);
  }
});

test('bStocks chain collectors keep the last output if the provider rejects reads or reports another chain', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'bstocks-pool-depth-'));
  try {
    const curl = join(scratch, 'curl');
    const out = join(scratch, 'depth.json');
    writeFileSync(out, '{"saved":true}\n');
    writeFileSync(curl, `#!${process.execPath}
      import assert from 'node:assert/strict';
      const args = process.argv.slice(2);
      assert.equal(args.at(-1), 'https://bsc-dataseed-public.bnbchain.org');
      assert.equal(args[args.indexOf('--proto') + 1], '=https');
      assert.equal(args[args.indexOf('--max-time') + 1], '8');
      const { method, id } = JSON.parse(args[args.indexOf('--data-binary') + 1]);
      assert.ok(['eth_chainId', 'eth_getBlockByNumber'].includes(method));
      const payload = JSON.stringify({ jsonrpc: '2.0', id, result: method === 'eth_chainId' ? '0x1' : {} });
      process.stdout.write(payload + '\\n' + (process.env.BSTOCKS_DEPTH_TEST === 'limit' ? '429' : '200'));
    `, { mode: 0o755 });
    for (const script of ['scripts/capture-bstocks-dex-depth.mjs', 'scripts/capture-bstocks-display-units.mjs']) {
      for (const [mode, error] of [['limit', /RPC returned HTTP 429/], ['chain', /Unexpected chain ID/]]) {
        const result = spawnSync(process.execPath, [
          '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', script, '--out', out,
        ], { encoding: 'utf8', env: { ...process.env, PATH: scratch, BSTOCKS_DEPTH_TEST: mode }, timeout: 10_000 });
        assert.equal(result.status, 1, result.stderr);
        assert.match(result.stderr, error);
        assert.equal(readFileSync(out, 'utf8'), '{"saved":true}\n');
      }
    }
    for (const [options, error] of [[['--quote', 'BNB'], /--quote USDT or WBNB/], [['--method', 'metric', '--quote', 'WBNB'], /Metric capture requires USDT/]]) {
      const result = spawnSync(process.execPath, [
        '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'scripts/capture-bstocks-dex-depth.mjs', '--out', out, ...options,
      ], { encoding: 'utf8', env: { ...process.env, PATH: scratch }, timeout: 10_000 });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, error);
      assert.equal(readFileSync(out, 'utf8'), '{"saved":true}\n');
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test('Metric requires separate verified price bands and their exact fee-adjusted cumulative quote amounts', () => {
  const base = roster.find(({ ticker }) => ticker === 'AAPLB').listing.contractAddress.toLowerCase();
  const pool = poolRegistry.pools[base];
  const quote = poolRegistry.quote.contract;
  const captured = metricSnapshot.pools[base];
  const read = (snapshot) => metricPoolDepth(snapshot, base, pool, quote);
  const proof = read(metricSnapshot);
  assert.equal(proof.kind, 'bands');
  assert.equal(proof.block.timestamp, metricSnapshot.block.timestamp);
  assert.equal(proof.buyInQuote, captured.buy.quoteDepthUsdt);
  assert.equal(proof.sellOutQuote, captured.sell.quoteDepthUsdt);
  assert.equal(dexPoolDepth(metricSnapshot, base, pool, quote), null);
  assert.equal(read(depthSnapshot), null);
  assert.equal(read({ ...metricSnapshot, method: 'price-impact' }), null);
  assert.equal(read({ ...metricSnapshot, sources: { ...metricSnapshot.sources, metric: {} } }), null);
  for (const buy of [{ ...captured.buy, lowerPriceUsdt: '999999' }, { ...captured.buy, quoteDepthUsdt: '0' },
    { ...captured.buy, returnedBands: 13 }, { ...captured.buy, simulatedBands: 13 }, { ...captured.buy, farthestSimulatedBin: 32768 },
    { ...captured.buy, upperPriceUsdt: '0.1234567890123' }]) {
    assert.equal(read({ ...metricSnapshot, pools: { [base]: { ...captured, buy } } }), null);
  }
});

test('exchange identity and trading status control native quote and depth', () => {
  const raw = {
    exchange: { symbol: 'CRCLBUSDT', baseAsset: 'CRCLB', quoteAsset: 'USDT', status: 'TRADING', isSpotTradingAllowed: true },
    ticker24h: { symbol: 'CRCLBUSDT', closeTime: Date.parse(cutoff) - 1000, lastPrice: '103', priceChangePercent: '-1.2', volume: '2', quoteVolume: '204', count: 2 },
    depth: { lastUpdateId: 391, bids: [['102', '1']], asks: [['103', '2']] },
    depthObservedAt: cutoff,
    candles: [bar(nov19)],
  };
  assert.equal(nativeMarket(raw, 'CRCLB', cutoff).quote.quoteVolume, 204);
  assert.equal(nativeMarket(raw, 'CRCLB', cutoff).book.bestBid, 102);
  assert.equal(nativeMarket(raw, 'ANTB', cutoff), null);
  assert.equal(nativeMarket({ ...raw, exchange: { ...raw.exchange, status: 'BREAK' } }, 'CRCLB', cutoff).book, null);
  assert.equal(nativeMarket({ ...raw, ticker24h: { ...raw.ticker24h, symbol: 'CRCLUSDT' } }, 'CRCLB', cutoff).quote, null);
});

test('technicals report insufficient samples and Wilder RSI distinguishes a flat series', () => {
  const one = [{ day: '2026-11-19', close: 93.99 }];
  assert.deepEqual(Object.values(priceIndicators(one)), [null, null, null, null, null]);
  const points = Array.from({ length: 20 }, (_, i) => ({ day: new Date(nov19 - (19 - i) * day).toISOString().slice(0, 10), close: 81 + i }));
  const result = priceIndicators(points);
  assert.equal(result.ma20, 90.5);
  assert.equal(result.rsi14, 100);
  assert.equal(result.ma50, null);
  assert.equal(priceIndicators(points.map((point) => ({ ...point, close: 100 }))).rsi14, 50);
});

test('verified adjusted input requires an explicit basis, matching security and verified completed dates', () => {
  const series = { symbol: 'MUU', exchange: 'NASDAQ', observedAt: cutoff, currency: 'USD', adjustment: 'split-and-dividend', source: 'https://example.test/authorized-bars', closes: [{ day: '2026-11-19', adjustedClose: 13.37, volume: 501 }] };
  assert.equal(adjustedHistory(series, 'MUU', 'NASDAQ').closes[0].close, 13.37);
  assert.equal(adjustedHistory({ ...series, adjustment: 'unknown' }, 'MUU', 'NASDAQ'), null);
  assert.equal(adjustedHistory(series, 'MU', 'NASDAQ'), null);
  assert.equal(adjustedHistory({ ...series, source: 'javascript:alert(1)' }, 'MUU', 'NASDAQ'), null);
  assert.equal(adjustedHistory({ ...series, closes: [{ day: '2026-11-31', adjustedClose: 13.37 }] }, 'MUU', 'NASDAQ'), null);
  assert.equal(adjustedHistory({ ...series, closes: [{ day: '2026-11-20', adjustedClose: 13.37 }] }, 'MUU', 'NASDAQ'), null);
});

test('premium uses raw matched close, exact USDT FX and a ratio effective that instant', () => {
  const source = 'https://example.test/authorized-data';
  const evidence = {
    token: { symbol: 'CRCLBUSDT', price: 202, venue: 'Binance', currency: 'USDT', at: moment, source },
    equity: { symbol: 'CRCL', exchange: 'NYSE', price: 50, currency: 'USD', adjustment: 'raw', session: 'regular-close', at: moment, source },
    fx: { pair: 'USDT/USD', usdPerUsdt: 0.995, at: moment, source },
    ratio: { ticker: 'CRCLB', symbol: 'CRCL', exchange: 'NYSE', sharesPerToken: 4, validFrom: '2026-11-18T00:00:00Z', validUntil: '2026-11-20T00:00:00Z', source },
  };
  assert.ok(Math.abs(matchedPremium(evidence, 'CRCLB', 'CRCL', 'NYSE').percent - 0.495) < 1e-12);
  assert.equal(matchedPremium({ ...evidence, equity: { ...evidence.equity, adjustment: 'split' } }, 'CRCLB', 'CRCL', 'NYSE'), null);
  assert.equal(matchedPremium({ ...evidence, fx: { ...evidence.fx, at: cutoff } }, 'CRCLB', 'CRCL', 'NYSE'), null);
  assert.equal(matchedPremium({ ...evidence, ratio: { ...evidence.ratio, validUntil: '2026-11-18T23:59:59Z' } }, 'CRCLB', 'CRCL', 'NYSE'), null);
  assert.equal(matchedPremium(evidence, 'CRCLB', 'CRCL', 'NASDAQ'), null);
});

test('period-end premium uses complete, co-terminal one-minute buckets and a ratio valid through them', () => {
  const source = 'https://example.test/authorized-data';
  const bucket = { start: '2026-11-19T20:59:00Z', end: moment, closed: true };
  const evidence = {
    basis: 'period-end',
    token: { symbol: 'CRCLBUSDT', price: 102, venue: 'Binance', currency: 'USDT', bucket, source },
    equity: { symbol: 'CRCL', exchange: 'NYSE', price: 100, currency: 'USD', adjustment: 'raw', session: 'regular-close', at: moment, source },
    fx: { pair: 'USDT/USD', usdPerUsdt: 0.99, bucket, source },
    ratio: { ticker: 'CRCLB', symbol: 'CRCL', exchange: 'NYSE', sharesPerToken: 1, validFrom: bucket.start, validUntil: cutoff, source },
  };
  const verify = (row) => matchedPremium(row, 'CRCLB', 'CRCL', 'NYSE');
  const result = verify(evidence);
  assert.ok(Math.abs(result.percent - 0.98) < 1e-9);
  assert.equal(result.basis, 'period-end');
  assert.equal(result.windowStart, '2026-11-19T20:59:00.000Z');
  assert.equal(result.at, '2026-11-19T21:00:00.000Z');
  assert.equal(verify({ ...evidence, token: { ...evidence.token, at: '2026-11-19T20:59:54.123Z' } }).percent, result.percent);

  for (const rejected of [
    { ...evidence, basis: 'instant' },
    { ...evidence, token: { ...evidence.token, at: moment } },
    { ...evidence, token: { ...evidence.token, bucket: { ...bucket, closed: false } } },
    { ...evidence, token: { ...evidence.token, bucket: { ...bucket, start: '2026-11-19T20:58:00Z' } } },
    { ...evidence, fx: { ...evidence.fx, bucket: { ...bucket, end: '2026-11-19T20:59:59.999Z' } } },
    { ...evidence, equity: { ...evidence.equity, session: 'extended' } },
    { ...evidence, ratio: { ...evidence.ratio, validFrom: '2026-11-19T20:59:30Z' } },
  ]) assert.equal(verify(rejected), null);
});

test('SEC recognizes true CRCL revenue and keeps YTD cash flow outside the quarter', () => {
  const base = { start: '2026-07-01', end: '2026-09-30', filed: '2026-11-04', form: '10-Q', accn: '0001876042-26-000311' };
  const units = (rows) => ({ units: { USD: rows } });
  const evidence = {
    ticker: 'CRCLB', symbol: 'CRCL', exchange: 'NYSE', cik: 1876042, source: 'https://data.sec.gov/api/xbrl/companyfacts/CIK0001876042.json',
    facts: { 'us-gaap': {
      Revenues: units([{ ...base, val: 864888000 }]),
      RevenueFromContractWithCustomerExcludingAssessedTax: units([{ ...base, val: 207264000 }]),
      NetCashProvidedByUsedInOperatingActivities: units([{ ...base, start: '2026-01-01', val: 522978000 }]),
    } },
  };
  const facts = secFundamentals(evidence, 'CRCLB', 'CRCL', '2026-11-20');
  assert.deepEqual(facts.filings[0].metrics, [{ key: 'revenue', amount: 864888000, unit: 'USD', xbrl: { cik: 1876042, tag: 'us-gaap:Revenues' } }]);
  assert.equal(facts.filings[1].period, 'interim');
  assert.equal(facts.filings[1].metrics[0].amount, 522978000);
  assert.equal(secFundamentals(evidence, 'CRCLB', 'MU', '2026-11-20'), null);
  const contractOnly = { ...evidence, ticker: 'TESTB', symbol: 'TEST', cik: 1234, source: 'https://data.sec.gov/api/xbrl/companyfacts/CIK0000001234.json', facts: { 'us-gaap': { RevenueFromContractWithCustomerExcludingAssessedTax: units([{ ...base, val: 207264000 }]) } } };
  assert.deepEqual(secFundamentals(contractOnly, 'TESTB', 'TEST', '2026-11-20').filings[0].metrics, [{
    key: 'contractRevenue', amount: 207264000, unit: 'USD', xbrl: { cik: 1234, tag: 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax' },
  }]);
  assert.equal(primary.ANTB.filings[0].form, '424B4');
  assert.equal(primary.ANTB.filings[0].period, 'interim');
  assert.equal(primary.MUUB.fund.metrics.find(({ key }) => key === 'nav').amount, 13.39);
});

test('Circle keeps distinct primary and SEC facts for the same exact accounting periods', () => {
  const filings = supplementFilings(primary.CRCLB.filings, sec.CRCLB.filings);
  const exact = (start) => filings.filter((report) => report.start === start && report.end === '2026-09-30');
  const [quarter, quarterSec] = exact('2026-07-01');
  assert.equal(quarter.metrics.find(({ key }) => key === 'revenue').amount, 864888000);
  assert.ok(quarter.url.endsWith('/crcl-20260930.htm'));
  assert.ok(quarterSec.url.endsWith('/0001876042-26-000311-index.htm'));
  assert.deepEqual(quarterSec.metrics.map(({ key, amount }) => [key, amount]), [['operatingIncome', 208334000]]);

  const [yearToDate, ytdSec] = exact('2026-01-01');
  assert.deepEqual(yearToDate.metrics.map(({ key, amount }) => [key, amount]), [['cashFlow', 522978000]]);
  assert.equal(ytdSec.period, 'interim');
  assert.deepEqual(ytdSec.metrics.map(({ key, amount }) => [key, amount]), [
    ['revenue', 2260336000], ['netIncome', 329498000], ['operatingIncome', 287695000], ['dilutedEps', 1.23],
  ]);
  const [laterPartial, original] = sec.CRCLB.filings.filter(({ start, end }) => start === '2026-04-01' && end === '2026-06-30');
  assert.ok(laterPartial.url.endsWith('/0001876042-26-000311-index.htm'));
  assert.ok(original.url.endsWith('/0001876042-26-000248-index.htm'));
  assert.deepEqual(laterPartial.metrics.map(({ key }) => key), ['netIncome']);
  assert.equal(original.metrics.find(({ key }) => key === 'revenue').amount, 701315000);
});

test('later statutory US GAAP facts supersede exact preliminary 8-K metrics without moving the latest period', () => {
  const formal = (preliminary, cik, form, amount) => {
    const accession = `${String(cik).padStart(10, '0')}-26-000099`;
    return {
      ...preliminary, form, filed: '2026-11-20', unaudited: undefined,
      url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replaceAll('-', '')}/${accession}-index.htm`,
      metrics: [{ key: 'revenue', amount, unit: 'USD', xbrl: { cik, tag: 'us-gaap:Revenues' } }],
    };
  };
  const [amatQuarter, amatAnnual] = primary.AMATB.filings;
  const laterAnnual = formal(amatAnnual, primary.AMATB.cik, '10-K', 34_445_000_000);
  const [revenue] = laterAnnual.metrics;
  laterAnnual.metrics.push({ ...revenue, key: 'netSales', amount: 11, xbrl: { ...revenue.xbrl, tag: 'us-gaap:SalesRevenueNet' } });
  const [originalQuarter, audited, remainingAnnual] = supplementFilings([amatQuarter, amatAnnual], [laterAnnual]);
  assert.equal(originalQuarter.period, 'quarter');
  assert.deepEqual(audited, laterAnnual);
  assert.equal(remainingAnnual.url, amatAnnual.url);
  assert.deepEqual(remainingAnnual.metrics, amatAnnual.metrics.filter(metric => metric.key !== 'revenue'));

  for (const candidate of [
    { ...laterAnnual, filed: amatAnnual.filed },
    { ...laterAnnual, period: 'interim' },
    { ...laterAnnual, form: '10-Q' },
    { ...laterAnnual, url: laterAnnual.url.replace('/6951/', '/6952/') },
    { ...laterAnnual, metrics: [{ ...revenue, unit: 'EUR' }] },
    { ...laterAnnual, metrics: [{ ...revenue, xbrl: undefined }] },
    { ...laterAnnual, metrics: [{ ...revenue, xbrl: { ...revenue.xbrl, tag: 'ifrs-full:Revenue' } }] },
  ]) {
    const [winner] = supplementFilings([amatAnnual], [candidate]);
    assert.equal(winner.url, amatAnnual.url);
    assert.equal(winner.metrics[0].amount, 34_446_000_000);
  }

  const [nvdaQuarter, nvdaInterim] = primary.NVDAB.filings;
  const cik = primary.NVDAB.cik;
  const fullQuarter = formal(nvdaQuarter, cik, '10-Q', 4);
  fullQuarter.metrics = nvdaQuarter.metrics.map(metric => ({ ...metric, xbrl: { cik, tag: `us-gaap:${{
    revenue: 'Revenues', operatingIncome: 'OperatingIncomeLoss', netIncome: 'NetIncomeLoss',
    cashFlow: 'NetCashProvidedByUsedInOperatingActivities', dilutedEps: 'EarningsPerShareDiluted',
  }[metric.key]}` }, amount: metric.key === 'revenue' ? 4 : metric.amount }));
  const laterInterim = formal(nvdaInterim, cik, '10-Q', 9);
  const previousQuarters = [
    ['2025-10-27', '2026-01-25', '2026-02-25'], ['2026-01-26', '2026-04-26', '2026-05-20'], ['2026-04-27', '2026-07-26', '2026-08-26'],
  ].map(([start, end, filed], i) => ({ ...formal({ ...nvdaQuarter, start, end }, cik, '10-Q', i + 1), filed }));
  const merged = supplementFilings([nvdaQuarter, nvdaInterim], [laterInterim, ...previousQuarters, fullQuarter]);
  assert.deepEqual(merged[0], fullQuarter);
  assert.deepEqual(merged[1], laterInterim);
  assert.equal(merged[2].url, nvdaInterim.url);
  assert.equal(merged[2].metrics.some(metric => metric.key === 'revenue'), false);
  const trailing = trailingTwelveMonths(merged, 'revenue');
  assert.equal(trailing.amount, 10);
  assert.equal(trailing.components.length, 4);
  assert.equal(trailing.components[0].filing.form, '10-Q');
  assert.equal(trailingTwelveMonths(supplementFilings([nvdaQuarter, nvdaInterim], previousQuarters), 'revenue'), null);
});

const exactQuarter = ([start, end]) => ({
  start, end, period: 'quarter', filed: '2026-10-23', form: '10-Q',
  url: 'https://www.sec.gov/Archives/edgar/data/1234/000000123426000003/0000001234-26-000003-index.htm',
  metrics: [{ key: 'revenue', amount: 250, unit: 'USD', xbrl: { cik: 1234, tag: 'us-gaap:Revenues' } }],
});

test('trailing four quarters require contiguous periods with the same issuer, XBRL tag and currency', () => {
  const quarters = [['2026-07-01', '2026-09-30'], ['2026-04-01', '2026-06-30'], ['2026-01-01', '2026-03-31'], ['2025-10-01', '2025-12-31']]
    .map(exactQuarter);
  const result = trailingTwelveMonths(quarters, 'revenue');
  assert.equal(result.amount, 1000);
  assert.equal(result.method, 'four-quarters');
  assert.equal(result.components.length, 4);
  const [newest, ...rest] = quarters;
  const [metric] = newest.metrics;
  for (const rejected of [
    { ...newest, start: '2026-07-02' },
    { ...newest, url: newest.url.replace('/1234/', '/1235/') },
    { ...newest, metrics: [{ ...metric, unit: 'EUR' }] },
    { ...newest, metrics: [{ ...metric, xbrl: { ...metric.xbrl, tag: 'ifrs-full:Revenue' } }] },
    { ...newest, metrics: [{ ...metric, xbrl: undefined }] },
  ]) assert.equal(trailingTwelveMonths([rejected, ...rest], 'revenue'), null);
});

test('Tesla full fiscal year plus aligned SEC YTD figures yields traceable trailing revenue', () => {
  const result = trailingTwelveMonths(sec.TSLAB.filings, 'revenue');
  assert.deepEqual([result.amount, result.start, result.end, result.method, result.unit, result.tag],
    [103570000000, '2025-10-01', '2026-09-30', 'fiscal-ytd', 'USD', 'us-gaap:Revenues']);
  const [fiscal, current, prior] = result.components;
  assert.deepEqual(result.components.map(({ amount, sign }) => [amount, sign]), [[94827000000, 1], [78669000000, 1], [69926000000, -1]]);
  assert.match(fiscal.filing.url, /0001628280-26-003952-index\.htm$/);
  assert.match(current.filing.url, /0001628280-26-066775-index\.htm$/);
  assert.equal(prior.filing.url, current.filing.url);
  const shifted = { ...prior.filing, end: '2025-09-29' };
  const wrongTag = { ...prior.filing, metrics: [{ ...prior.filing.metrics[0], xbrl: { cik: 1318605, tag: 'us-gaap:SalesRevenueNet' } }] };
  const wrongIssuer = { ...prior.filing, url: prior.filing.url.replace('/1318605/', '/1876042/') };
  for (const rejected of [shifted, wrongTag, wrongIssuer]) {
    assert.equal(trailingTwelveMonths([fiscal.filing, current.filing, rejected], 'revenue'), null);
  }
});

test('ETF venue identities, issuer NAV, gross fees and market price remain separate', () => {
  const lookup = (ticker) => roster.find((instrument) => instrument.ticker === ticker);
  assert.equal(lookup('SPYB').underlying.exchange, 'NYSE ARCA');
  assert.equal(primary.SPYB.fund.day, '2026-11-18');
  assert.deepEqual(primary.SPYB.fund.metrics.map(({ key, amount }) => [key, amount]),
    [['nav', 730.54], ['fundMidpoint', 730.32], ['grossExpense', 0.0945]]);
  assert.equal(primary.EWTB.fund.metrics.find(({ key }) => key === 'nav').amount, 84.11);
  assert.match(primary.EWTB.fund.feeSource, /ishares\.com\/us\/products\/etf-investments$/);
  assert.equal(lookup('DRAMB').underlying.exchange, 'CBOE BZX');
  assert.equal(lookup('SKHYB').underlying.kind, 'adr');
  assert.equal(lookup('BOTB').underlying.kind, 'common-stock');
  assert.equal(lookup('UVXYB').underlying.leverage, 1.5);
  assert.equal(Object.values(primary).filter(({ fund }) => fund).length, 25);
});

test('stock detail keeps verified pool, Binance and underlying chart sources separate', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'bstocks-route-'));
  const root = resolve('.');
  const destination = join(scratch, '.generated/bstocks-study.json');
  const labels = { en: 'Open token price and volume chart', 'zh-CN': '展开代币价格与成交量图', ja: 'トークンの価格・出来高チャートを表示' };
  const indicatorHints = { en: 'Moving average and RSI (14)', 'zh-CN': '均线和 RSI（14）', ja: '移動平均線と RSI（14）' };
  const adjustmentHints = { en: 'adjust for dividends', 'zh-CN': '股息复权', ja: '配当調整' };
  const technicalLabels = { en: 'View technical indicators on TradingView', 'zh-CN': '在 TradingView 查看技术指标', ja: 'TradingView でテクニカル指標を見る' };
  const technicalSources = {
    CRCLB: ['NYSE:CRCL', 'NYSE-CRCL', true], MUUB: ['NASDAQ:MUU', 'NASDAQ-MUU', true],
    AAPLB: ['NASDAQ:AAPL', 'NASDAQ-AAPL', false], SPYB: ['AMEX:SPY', 'AMEX-SPY', false],
    SNDKB: ['NASDAQ:SNDK', 'NASDAQ-SNDK', false], DRAMB: ['CBOE:DRAM', 'CBOE-DRAM', false],
  };
  const underlyingQuotes = Object.fromEntries(roster.map(({ ticker, underlying }) => [ticker, underlying.symbol]));
  assert.equal(new Set(Object.values(underlyingQuotes)).size, 113);
  const underlyingQuoteLabels = {
    en: ['Underlying market', 'Open Binance underlying quote', 'View the underlying on Binance', 'displayed in English', 'USD quotes'],
    'zh-CN': ['原资产行情', '展开 Binance 原资产报价', '在 Binance 查看原资产', '组件内容为英文', '美元报价'],
    ja: ['原資産の相場', 'Binance の原資産価格を表示', 'Binance で原資産を確認', 'ウィジェットは英語で表示', '米ドル建ての価格'],
  };
  const poolHeadings = { en: 'On-chain market', 'zh-CN': '链上市场', ja: 'オンチェーン市場' };
  const unitHeadings = { en: 'Display units per raw on-chain token', 'zh-CN': '每个链上原始代币对应的显示单位', ja: 'オンチェーンの未調整トークン1枚あたりの表示単位' };
  const premiumHeadings = { en: 'Token premium / discount', 'zh-CN': '代币溢折价', ja: 'トークンのプレミアム・ディスカウント' };
  const reserveHeadings = { en: 'PancakeSwap v2 pool reserves', 'zh-CN': 'PancakeSwap v2 池储备', ja: 'PancakeSwap v2 のプールリザーブ' };
  const clLabels = {
    en: ['depth at ±1%', 'fixed-size quotes', 'High total swap fee (incl. protocol)', 'Total swap fee (incl. protocol)', 'raw ERC-20 token units'],
    'zh-CN': ['±1% 深度', '固定金额报价', '高额交易总费率（含协议费）', '交易总费率（含协议费）', 'ERC-20 合约原始单位'],
    ja: ['の ±1% 取引深度', 'の固定数量見積もり', '高いスワップ手数料（プロトコル手数料込み）', 'スワップ手数料（プロトコル手数料込み）', 'ERC-20 トークンの未調整単位'],
  };
  const infinityByTicker = new Map(infinitySnapshots.flatMap(({ pools }) => Object.entries(pools)).map(([base, row]) =>
    [row.ticker, pancakeInfinityQuotes(infinitySnapshots, base, row.ticker, row.isin)]));
  const uniswapByTicker = new Map(uniswapV4Snapshots.flatMap(({ pools }) => Object.entries(pools)).map(([base, row]) =>
    [row.ticker, uniswapV4Quotes(uniswapV4Snapshots, base, row.ticker, row.isin)]));
  const prospectusLabels = {
    en: ['Issuer prospectuses', 'Primary prospectus', 'Supplementary prospectus', 'ADGM approval date'],
    'zh-CN': ['发行方招股文件', '主招股文件', '补充招股文件', 'ADGM 核准日期'],
    ja: ['発行体の目論見書', '本目論見書', '補足目論見書', 'ADGM の承認日'],
  };
  const qualifiedUnits = {
    en: { share: 'share.', 'fund-unit': 'fund.', adr: 'ADR.', ads: 'ADS.' },
    'zh-CN': { share: '1 股', 'fund-unit': '基金份额。', adr: '美国存托凭证（ADR）', ads: '美国存托股份（ADS）' },
    ja: { share: 'の1株に', 'fund-unit': 'ファンドの1口に', adr: '米国預託証券（ADR）', ads: '米国預託株式（ADS）' },
  };
  const actions = {
    SNDKB: {
      kind: 'split',
      labels: { en: ['8-for-1 split legally effective', 'scheduled trading resumption'], 'zh-CN': ['原股票 1 拆 8 法定生效', '公告的计划复牌时间'], ja: ['1株を8株にする分割が法的に発効', '発表した取引再開予定'] },
      times: ['2026-11-19T21:01:00Z', '2026-11-20T01:00:00Z', '2026-11-20T00:59:59.600Z', '2026-11-20T01:00:00.050Z', '2026-11-20T09:00:00Z'],
      sources: ['https://www.sec.gov/Archives/edgar/data/2023554/000162828026075127/sndk-20261119.htm', 'https://www.binance.com/en/support/announcement/detail/ec32e6657ae341b3b57f1b154c330c6d', 'https://bnbscan.com/blocks/134603490', 'https://bnbscan.com/blocks/134603491'],
      change: '1 → 8',
    },
    MUB: {
      kind: 'dividend',
      labels: {
        en: ['0.15 USD per underlying share', 'net of applicable taxes and costs', 'For on-chain holders', 'adjustment to the display multiplier', 'spot trading would continue as usual'],
        'zh-CN': ['原股票每股派息 0.15 USD', '股息扣除适用税费和成本后将再投资', '链上持有者', '显示乘数调整', '现货交易按公告照常进行'],
        ja: ['原株式1株当たり 0.15 USD', '税金と費用を差し引いた配当を再投資', 'オンチェーン保有者', '表示倍率の調整', '現物取引は通常どおり継続'],
      },
      times: ['2026-09-30', '2026-10-14T00:00:00Z', '2026-10-13T23:59:59.900Z', '2026-10-14T00:00:00.350Z'],
      sources: ['https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fourth-Quarter-and-Full-Year-2026-Results/', 'https://www.binance.com/en/support/announcement/detail/d1cd2ab0a2064dedb14121df74538cf8', 'https://bnbscan.com/blocks/127494945', 'https://bnbscan.com/blocks/127494946'],
      change: '1.000107512568805603 → 1.000217357013353696',
    },
  };
  const checkTechnicalSource = (html, locale, ticker) => {
    const links = [...html.matchAll(/href="([^"]*\/technicals\/)"/gu)].map(([, href]) => href);
    const expected = technicalSources[ticker];
    const context = `${ticker} (${locale})`;
    assert.equal(html.includes(technicalLabels[locale]), Boolean(expected), context);
    if (!expected) {
      assert.deepEqual(links, [], context);
      return;
    }
    const [symbol, instrument, localized] = expected;
    const host = localized ? { en: 'www', 'zh-CN': 'cn', ja: 'jp' }[locale] : 'www';
    const source = `https://${host}.tradingview.com/symbols/${instrument}/technicals/`;
    assert.deepEqual(links, [source], context);
    const chart = html.split(`data-underlying-symbol="${symbol}"`)[1]?.split('</div>', 1)[0];
    const link = chart?.split(`<a href="${source}" target="_blank" rel="noopener noreferrer"`)[1]?.split('</a>', 1)[0];
    assert.ok(link?.endsWith(`>${technicalLabels[locale]} ↗`), context);
  };
  const checkUnderlyingQuote = (html, locale, ticker) => {
    const [heading, open, source, language, currency] = underlyingQuoteLabels[locale];
    const symbol = underlyingQuotes[ticker];
    const context = `${ticker} (${locale})`;
    const widgets = [...html.matchAll(/data-binance-underlying-quote="([^"]+)"/gu)].map(([, id]) => id);
    assert.deepEqual(widgets, symbol ? [symbol] : [], context);
    assert.doesNotMatch(html, /<iframe\b[^>]*\bsrcdoc=|public\.bnbstatic\.com\/unpkg\/growth-external-widget|<binance-stock-widget\b/iu, context);
    if (!symbol) return;
    const market = html.split(`>${heading} · ${symbol}</h2>`)[1]?.split('</section>', 1)[0];
    const widget = market?.split(`data-binance-underlying-quote="${symbol}"`)[1]?.split('</div>', 1)[0];
    assert.ok(widget?.includes(open) && widget.includes(language) && widget.includes(currency), context);
    assert.doesNotMatch(widget, /<details\b[^>]*\bopen=/u, context);
    const anchor = `<a href="https://www.binance.com/en/stocks/EQ_${symbol}" target="_blank" rel="noopener noreferrer"`;
    assert.ok(widget.split(anchor)[1]?.split('</a>', 1)[0].endsWith(`>${source} ↗`), context);
  };
  const checkProspectuses = (html, locale, ticker) => {
    const { primary, supplementary = [] } = prospectusSnapshot.rows[ticker];
    const card = html.split('data-bstock-prospectuses="true"')[1]?.split('</ul>', 1)[0];
    const [heading, baseLabel, supplementLabel, approvalLabel] = prospectusLabels[locale];
    assert.ok(card?.includes(heading) && card.includes(baseLabel) && card.includes(approvalLabel), `${ticker} (${locale})`);
    assert.equal(card.includes(supplementLabel), !!supplementary.length);
    assert.deepEqual([...card.matchAll(/href="([^"]+)"/gu)].map(([, href]) => href), [ADGM_PROSPECTUS_DIRECTORY, primary.url, ...supplementary.map(({ url }) => url)]);
    assert.deepEqual([...card.matchAll(/datetime="([^"]+)"/giu)].map(([, date]) => date), [primary.approvalDay, ...supplementary.map(({ approvalDay }) => approvalDay)]);
  };
  const checkDisplayUnits = (html, locale, ticker) => {
    const { listing } = roster.find((row) => row.ticker === ticker);
    const { multiplier, block } = bscTokenDisplayUnits(displayUnitsSnapshot, listing.contractAddress.toLowerCase(), ticker, listing.isin);
    const card = html.split('data-bstock-display-units="true">')[1]?.split('</div>', 1)[0];
    assert.ok(card?.includes(unitHeadings[locale]), `${ticker} (${locale})`);
    assert.ok(card.includes(`font-mono">${multiplier}</span>`) && card.includes(`https://bscscan.com/block/${block.number}`));
    assert.equal(card.match(/datetime="([^"]+)"/iu)?.[1], block.timestamp);
    assert.ok(card.includes(BEP_677_STANDARD));
    const certificate = adgmProspectuses(prospectusSnapshot, ticker, listing.isin).certificate;
    assert.deepEqual([...card.matchAll(/href="(https:\/\/www\.adgm\.com\/[^"\s]+)"/gu)].map(([, url]) => url), certificate ? [certificate.url] : []);
    if (certificate) {
      const text = card.split(`href="${certificate.url}"`)[0].split('<p ').at(-1);
      assert.ok(text.includes(certificate.symbol) && text.includes(qualifiedUnits[locale][certificate.kind]), `${ticker} (${locale})`);
    }
    assert.match(html.split(premiumHeadings[locale])[1], /^ <span[^>]+>—<\/span>/u);
    const action = actions[ticker];
    assert.equal(html.includes('data-bstock-corporate-action='), Boolean(action), `${ticker} (${locale})`);
    if (action) {
      const timeline = html.split(`data-bstock-corporate-action="${action.kind}"`)[1]?.split('</section>', 1)[0];
      assert.ok(timeline?.includes(action.change), `${ticker} (${locale})`);
      assert.ok(action.labels[locale].every(label => timeline.includes(label)), `${ticker} (${locale})`);
      assert.deepEqual([...timeline.matchAll(/dateTime="([^"]+)"/giu)].map(([, at]) => at), action.times);
      assert.deepEqual([...new Set([...timeline.matchAll(/href="([^"]+)"/gu)].map(([, url]) => url))], action.sources);
    }
  };
  const checkV2Reserves = (html, locale, ticker) => {
    const { listing } = roster.find((row) => row.ticker === ticker);
    const reserve = pancakeV2Reserves(v2Snapshot, listing.contractAddress.toLowerCase(), ticker, listing.isin);
    const card = html.split('data-v2-reserves="true">')[1]?.split('</section>', 1)[0];
    assert.equal(Boolean(card), Boolean(reserve), `${ticker} (${locale})`);
    if (!reserve) return;
    assert.ok(card.includes(reserveHeadings[locale]) && card.includes(`${ticker}/${reserve.quote} · BNB Chain`));
    for (const amount of [reserve.quoteReserve, reserve.buyInQuote, reserve.sellOutQuote]) assert.ok(card.includes(`${amount} ${reserve.quote}`));
    assert.ok(card.includes(`${reserve.baseReserve} ${ticker}`));
    assert.ok(card.includes(`https://bscscan.com/address/${reserve.pool}`));
    assert.ok(card.includes(`https://bscscan.com/block/${reserve.block.number}`) && card.includes(reserve.block.timestamp) && card.includes(reserve.lastReserveAt));
    assert.ok(card.includes(BSC_PANCAKE_V2.model) && card.includes('0.25%'));
    assert.doesNotMatch(card, /geckoterminal|tradingview|<iframe/u);
    assert.match(html.split(premiumHeadings[locale])[1], /^ <span[^>]+>—<\/span>/u);
  };
  const comparisons = {
    AAPLB: {
      venue: 'PancakeSwap v3', quote: 'USDT', rate: '0.01%', block: 134791428, at: '2026-11-21T00:30:00.000Z',
      values: ['304.407748155524647306 USDT', '257.763487718438641462 USDT'],
      source: BSC_DEPTH_VENUES['PancakeSwap v3'].registry, address: '0x0905edec2928b701fb6c6354e4eee4960895a82f',
    },
    SNXXB: {
      venue: 'Uniswap v4', quote: 'ETH', rate: '3.097%', block: 134792232, at: '2026-11-21T00:36:02.000Z',
      values: ['0.000069089389859405 ETH', '0.000067285285189624 ETH'],
      source: BSC_UNISWAP_V4.registry, address: BSC_UNISWAP_V4.manager,
      poolId: '0x372005ec1edb74181486915b392f91baa03d6d680ac74417564e508acc04a354',
    },
  };
  const checkPoolComparison = (html, locale, ticker) => {
    const expected = comparisons[ticker];
    const rows = [...html.matchAll(/data-pool-depth-comparison="true">([\s\S]*?)<\/section>/gu)];
    const context = `${ticker} (${locale})`;
    assert.equal(rows.length, expected ? 1 : 0, context);
    if (!expected) return;
    const [, panel] = rows[0];
    const [band, title] = {
      en: ['Metric pool depth by price band', `${expected.venue} pool depth at ±1%`],
      'zh-CN': ['Metric 分档深度', `${expected.venue} 交易池 ±1% 深度`],
      ja: ['Metric の価格帯別取引深度', `${expected.venue} プールの ±1% 取引深度`],
    }[locale];
    assert.ok(html.includes(band) && panel.includes(title), context);
    assert.equal(panel.match(/datetime="([^"]+)"/iu)?.[1], expected.at, context);
    for (const exact of [expected.source, expected.rate, `${ticker}/${expected.quote} · BNB Chain`,
      `https://bscscan.com/block/${expected.block}`, `https://bscscan.com/address/${expected.address}`, ...expected.values]) {
      assert.ok(panel.includes(exact), `${context} ${exact}`);
    }
    if (expected.poolId) assert.ok(panel.includes(expected.poolId), context);
    if (expected.quote === 'ETH') assert.doesNotMatch(panel, /\b(?:USDT|USD)\b/u, context);
    assert.doesNotMatch(panel, /GeckoTerminal|TradingView|<iframe\b/u, context);
  };
  const checkClMarket = (html, locale, ticker) => {
    checkPoolComparison(html, locale, ticker);
    const uniswap = uniswapByTicker.get(ticker);
    const quote = uniswap ?? infinityByTicker.get(ticker);
    const panels = [...html.matchAll(/data-(uniswap-v4|infinity)-quotes="(marginal|fixed)">([\s\S]*?)<\/section>/gu)];
    const context = `${ticker} (${locale})`;
    assert.equal(panels.length, quote ? 1 : 0, context);
    if (!quote) return;
    const [, protocol, mode, card] = panels[0];
    const venue = uniswap ? 'Uniswap v4' : 'PancakeSwap Infinity CL';
    const source = uniswap ? BSC_UNISWAP_V4 : BSC_PANCAKE_INFINITY;
    assert.equal(protocol, uniswap ? 'uniswap-v4' : 'infinity', context);
    const { marginal, block, poolId, fixedBuyOut, fixedSellOut, lpFeePips, swapFeePips } = quote;
    assert.equal(mode, marginal ? 'marginal' : 'fixed', context);
    const [band, fixed, highFee, normalFee, rawUnits] = clLabels[locale];
    assert.ok(card.includes(`${venue} ${marginal ? band : fixed}`) && card.includes(swapFeePips >= 500_000 ? highFee : normalFee) && card.includes(rawUnits), context);
    assert.ok(card.includes(`${ticker}/USDT · BNB Chain`) && card.includes(poolId));
    assert.ok(card.includes(`${lpFeePips / 10_000}%`) && card.includes(`${swapFeePips / 10_000}%`));
    assert.deepEqual([...card.matchAll(/href="https:\/\/bscscan\.com\/block\/(\d+)"/gu)].map(([, number]) => number), [String(block.number)], context);
    assert.equal(card.match(/datetime="([^"]+)"/iu)?.[1], block.timestamp, context);
    assert.ok(card.includes(`https://bscscan.com/address/${source.manager}`) && card.includes(source.abi), context);
    if (uniswap) assert.ok(card.includes('V4Quoter') && card.includes(source.registry), context);
    if (marginal) {
      assert.ok(card.includes(`${marginal.buyInUsdt} USDT`) && card.includes(`${marginal.sellOutUsdt} USDT`));
      assert.ok(!card.includes(`${fixedBuyOut} ${ticker}`));
    } else {
      assert.ok(card.includes('1 USDT') && card.includes(`0.01 ${ticker}`));
      assert.ok(card.includes(`${fixedBuyOut} ${ticker}`) && card.includes(`${fixedSellOut} USDT`));
      assert.doesNotMatch(card, /[±+−]1%/u);
    }
    assert.doesNotMatch(card, /GeckoTerminal|TradingView|<iframe\b/u);
    assert.ok(!html.includes('data-v2-reserves=') && !html.includes(poolHeadings[locale]), context);
  };
  const poolMarkets = {
    CRCLB: ['0x29967c54c5bf12e8158c8894376064b30ebab297', 'PancakeSwap v3'],
    ANTB: ['0x5afb6e189a268c6adfc9da13ca13e3ba91171a31', 'PancakeSwap v3'],
    DRAMB: ['0xfb540645cb0f5e2cb08933e68735fbdab3ca74cf', 'Metric (BSC)'],
    NVDAB: ['0xcc2bffaec373a6004bb6ccc8a62cdd66061f7c6a', 'PancakeSwap v3'],
    SNDKB: ['0xe4b5403f5103b02d1e8193b0d7d76d49f3f8ad77', 'PancakeSwap v3'],
    SKHYB: ['0xd7d30f434b12f7ed9b0ae11ff1c754745a10ad52', 'PancakeSwap v3'],
    MUB: ['0x0742bffd9b916e452eb6af32536452830f16958c', 'Metric (BSC)'],
    MSFTB: ['0x6a1d40c050289cc8dad85ae2c1ad705222f596d2', 'Uniswap V3 (BSC)'],
  };
  const underlyings = {
    CRCLB: 'NYSE:CRCL', MUUB: 'NASDAQ:MUU', ANTB: 'NASDAQ:ANT', DRAMB: 'CBOE:DRAM', SNDKB: 'NASDAQ:SNDK',
    PYPLB: 'NASDAQ:PYPL', COINB: 'NASDAQ:COIN', NVDAB: 'NASDAQ:NVDA',
    SKHYB: 'NASDAQ:SKHY', MUB: 'NASDAQ:MU', MSFTB: 'NASDAQ:MSFT', CBRSB: 'NASDAQ:CBRS',
    AMDB: 'NASDAQ:AMD', ASMLB: 'NASDAQ:ASML', ORCLB: 'NYSE:ORCL', PLTRB: 'NASDAQ:PLTR', JPMB: 'NYSE:JPM',
    IWMB: 'AMEX:IWM', SMHB: 'NASDAQ:SMH', SECZB: 'NYSE:SECZ', SKDDB: 'NASDAQ:SKDD',
  };
  const onchain = roster.filter(({ listing }) => [poolRegistry, wbnbPools].some(({ pools }) => Object.hasOwn(pools, listing.contractAddress.toLowerCase())));
  const onchainTickers = new Set(onchain.map(({ ticker }) => ticker));
  const hostedWithoutPool = roster.map(({ ticker }) => ticker).filter((ticker) => !onchainTickers.has(ticker));
  const hostedSpot = new Set(['ANTB', 'CRCLB', 'DRAMB', 'SNDKB', ...hostedWithoutPool]);
  const depthOnly = new Map(Object.values(depthOnlySnapshot.pools).map((row) => [row.ticker, row]));
  assert.deepEqual([...depthOnly.keys()], ['AGPUB', 'IBMB']);
  assert.ok([...depthOnly.keys()].every((ticker) => hostedWithoutPool.includes(ticker)));
  const args = ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--input-type=module'];
  const render = (tickers = Object.keys(underlyings)) => JSON.parse(execFileSync(process.execPath, [...args, '--eval', String.raw`
    import { registerHooks } from 'node:module';
    import { existsSync, readFileSync } from 'node:fs';
    import { dirname, extname, join, resolve } from 'node:path';
    import { fileURLToPath, pathToFileURL } from 'node:url';
    import ts from 'typescript';
    import { createElement } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';

    const root = process.cwd();
    const source = pathToFileURL(join(root, 'src') + '/').href;
    registerHooks({
      resolve(specifier, context, next) {
        if (specifier === 'next/link') {
          const url = pathToFileURL(join(root, 'node_modules/next/link.js')).href;
          return { url: 'data:text/javascript,' + encodeURIComponent('import module from ' + JSON.stringify(url) + '; export default module.default ?? module;'), shortCircuit: true };
        }
        if (specifier === 'next/navigation') return next('next/navigation.js', context);
        const file = specifier.startsWith('@/') ? join(root, 'src', specifier.slice(2))
          : specifier.startsWith('.') && context.parentURL?.startsWith(source) ? resolve(dirname(fileURLToPath(context.parentURL)), specifier) : null;
        if (specifier.startsWith('@/') && file?.endsWith('.json')) return next(pathToFileURL(file).href, context);
        if (file && !extname(file)) {
          for (const extension of ['.ts', '.tsx']) {
            if (existsSync(file + extension)) return next(pathToFileURL(file + extension).href, context);
          }
        }
        return next(specifier, context);
      },
      load(url, context, next) {
        if (!url.startsWith(source) || !url.endsWith('.tsx')) return next(url, context);
        const compiled = ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        }).outputText;
        return { format: 'module', shortCircuit: true, source: compiled };
      },
    });
    process.chdir(process.argv[1]);
    if (process.argv[2] === '--binance-underlying-admission') {
      const { getInstrument, getInstruments } = await import(new URL('data/instruments.ts', source));
      const { BstocksStudyView } = await import(new URL('components/stocks/bstocks-study-view.tsx', source));
      const { BinanceUnderlyingQuote } = await import(new URL('components/stocks/binance-underlying-quote.tsx', source));
      const circle = getInstrument('bstocks', 'CRCLB');
      const berkshire = getInstrument('bstocks', 'BRKBB');
      const newListing = { ...circle, ticker: 'NEWCRCLB', underlying: { ...circle.underlying, exchange: 'NYSE' } };
      getInstruments('bstocks').push(newListing);
      const variants = {
        authorized: circle,
        dottedSymbol: berkshire,
        futureListing: newListing,
        unknownTicker: { ...circle, ticker: 'UNKNOWN' },
        wrongIsin: { ...circle, listing: { ...circle.listing, isin: berkshire.listing.isin } },
        wrongContract: { ...circle, listing: { ...circle.listing, contractAddress: berkshire.listing.contractAddress } },
        wrongVenue: { ...circle, underlying: { ...circle.underlying, exchange: 'NASDAQ' } },
        wrongSymbol: { ...berkshire, underlying: { ...berkshire.underlying, symbol: 'BRK-B', exchange: 'NYSE' } },
        wrongChain: { ...circle, chains: ['Ethereum'] },
      };
      const result = Object.fromEntries(Object.entries(variants).map(([name, instrument]) => {
        const html = renderToStaticMarkup(createElement(BstocksStudyView, { instrument, locale: 'en' }));
        return [name, html.match(/data-binance-underlying-quote="([^"]+)"/u)?.[1] ?? null];
      }));
      result.invalidWidgetSymbol = renderToStaticMarkup(createElement(BinanceUnderlyingQuote, { locale: 'en', symbol: 'BRK-B' }));
      console.log(JSON.stringify(result));
      process.exit(0);
    }
    const route = new URL('app/(localized)/[locale]/stocks/[issuer]/[ticker]/page.tsx', source);
    const { default: Page } = await import(route.href);
    const rendered = {};
    for (const locale of ['en', 'zh-CN', 'ja']) {
      rendered[locale] = {};
      for (const ticker of process.argv.slice(2)) {
        rendered[locale][ticker] = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale, ticker, issuer: 'bstocks' }) }));
      }
    }
    console.log(JSON.stringify(rendered));
  `, scratch, ...tickers], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 20_000 }));
  const frameSymbols = (html, locale, ticker) => {
    const [pool, venue] = poolMarkets[ticker] ?? [];
    const supplemental = depthOnly.get(ticker);
    const poolLinks = [];
    const symbols = [];
    for (const [tag, source] of html.matchAll(/<iframe\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
      const url = new URL(source.replaceAll('&amp;', '&'));
      assert.match(tag, /loading="lazy"/u);
      assert.match(tag, /title="[^"]+"/u);
      assert.match(tag, /referrerpolicy="no-referrer"/iu);
      if (url.origin === 'https://www.geckoterminal.com') {
        assert.equal(url.searchParams.size, 4);
        assert.deepEqual(Object.fromEntries(url.searchParams), { embed: '1', info: '0', swaps: '0', resolution: '1d' });
        assert.ok(tag.includes(`title="${ticker}/USDT ${venue}`));
        poolLinks.push(url.origin + url.pathname);
        continue;
      }
      assert.equal(url.origin, 'https://www.tradingview-widget.com');
      const config = JSON.parse(decodeURIComponent(url.hash.slice(1)));
      assert.equal(config.locale, locale === 'zh-CN' ? 'zh_CN' : locale);
      const spot = config.symbol.startsWith('BINANCE:');
      const studies = spot ? ['MASimple@tv-basicstudies'] : ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'];
      assert.deepEqual([config.interval, config.timezone, config.studies], ['D', 'Etc/UTC', studies]);
      assert.equal(config.withdateranges, spot ? undefined : true, config.symbol);
      symbols.push(config.symbol);
    }
    assert.equal(html.includes(poolHeadings[locale]), Boolean(pool || supplemental), `${ticker} pool heading (${locale})`);
    const expectedPoolLink = pool && `https://www.geckoterminal.com/bsc/pools/${pool}`;
    assert.deepEqual(poolLinks, pool ? [expectedPoolLink] : []);
    if (expectedPoolLink) assert.ok(html.includes(`href="${expectedPoolLink}"`));
    if (supplemental) {
      const panel = html.split(`>${poolHeadings[locale]}</h2>`)[1].split('</section>', 1)[0];
      const label = { en: 'PancakeSwap v3 pool depth at ±1%', 'zh-CN': 'PancakeSwap v3 交易池 ±1% 深度', ja: 'PancakeSwap v3 プールの ±1% 取引深度' }[locale];
      assert.ok(panel.includes(label) && panel.includes(`${ticker}/USDT`));
      assert.ok(panel.includes(`href="https://bscscan.com/address/${supplemental.pool}"`));
      assert.ok(panel.includes(`href="https://bscscan.com/block/${depthOnlySnapshot.block.number}"`) && panel.includes(depthOnlySnapshot.block.timestamp));
      for (const amount of [supplemental.buyInUsdt, supplemental.sellOutUsdt]) assert.ok(panel.includes(`${amount} USDT`));
      assert.doesNotMatch(panel, /GeckoTerminal|<iframe/u);
      assert.match(html.split(premiumHeadings[locale])[1], /^ <span[^>]+>—<\/span>/u);
    }
    return symbols;
  };
  const marketRow = (ticker, candles) => {
    const symbol = `${ticker}USDT`;
    const status = ticker === 'SNDKB' ? 'BREAK' : 'TRADING';
    return {
      isin: roster.find((row) => row.ticker === ticker).listing.isin,
      market: nativeMarket({
        exchange: { symbol, baseAsset: ticker, quoteAsset: 'USDT', status, isSpotTradingAllowed: true },
        ticker24h: { symbol, closeTime: Date.parse(cutoff) - 1000, lastPrice: '103.37', priceChangePercent: '1.5', volume: '4', quoteVolume: '412', count: 2 },
        depth: { lastUpdateId: 391, bids: [['102', '1']], asks: [['104', '2']] },
        depthObservedAt: cutoff,
        candles,
      }, ticker, cutoff),
    };
  };

  try {
    mkdirSync(join(scratch, '.generated'));
    assert.deepEqual(render(['--binance-underlying-admission']), {
      authorized: 'CRCL', dottedSymbol: 'BRK.B', futureListing: null, unknownTicker: null,
      wrongIsin: null, wrongContract: null, wrongVenue: null, wrongSymbol: null, wrongChain: null, invalidWidgetSymbol: '',
    });
    writeFileSync(destination, JSON.stringify({ version: 1, rows: { CRCLB: marketRow('CRCLB', []), SNDKB: marketRow('SNDKB', []) } }));
    const withoutBars = render();
    for (const [locale, pages] of Object.entries(withoutBars)) {
      for (const [ticker, symbol] of Object.entries(underlyings)) {
        const html = pages[ticker];
        const spot = hostedSpot.has(ticker);
        assert.deepEqual(frameSymbols(html, locale, ticker), spot ? [`BINANCE:${ticker}USDT`, symbol] : [symbol]);
        assert.equal(html.includes(labels[locale]), spot);
        assert.equal(html.includes(`https://www.tradingview.com/symbols/${ticker}USDT/?exchange=BINANCE`), spot);
        const underlyingChart = html.split(`data-underlying-symbol="${symbol}"`)[1]?.split('</details>', 1)[0];
        assert.equal(underlyingChart?.split(indicatorHints[locale]).length, 2, `${ticker} (${locale})`);
        assert.equal(underlyingChart?.split(adjustmentHints[locale]).length, 2, `${ticker} (${locale})`);
        checkTechnicalSource(html, locale, ticker);
        checkUnderlyingQuote(html, locale, ticker);
        checkProspectuses(html, locale, ticker);
        checkDisplayUnits(html, locale, ticker);
        checkV2Reserves(html, locale, ticker);
        checkClMarket(html, locale, ticker);
      }
      assert.match(pages.CRCLB, /103\.37 USDT/u);
      assert.match(pages.CRCLB, /102 \/ 104 USDT/u);
      assert.match(pages.MUUB, /Direxion/u);
      assert.ok(pages.CBRSB.includes('0001628280-26-073494-index.htm'));
      assert.ok(pages.CBRSB.includes('210,809,000 USD'));
      const skhyReports = [...pages.SKHYB.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
        .map(([, content]) => content).filter((content) => content.includes('d166755d6k.htm'));
      const quarter = skhyReports.find((report) => report.includes('2026-07-01'));
      const interim = skhyReports.find((report) => report.includes('2026-01-01'));
      const epsLabel = { en: 'Diluted EPS per ordinary share', 'zh-CN': '每普通股摊薄收益', ja: '普通株式1株当たり希薄化後利益' }[locale];
      assert.ok(quarter?.includes('104,615,483,000,000 KRW'));
      assert.ok(quarter.includes(epsLabel) && quarter.includes('54,454 KRW/shares'));
      assert.ok(!quarter.includes('145,634,314,000,000 KRW'));
      assert.ok(interim?.includes('145,634,314,000,000 KRW'));
      assert.ok(interim.includes(epsLabel) && interim.includes('242,279 KRW/shares'));
    }
    assert.match(withoutBars.en.NVDAB, /No verified daily closes are available/u);
    assert.match(withoutBars.en.MUUB, /A Binance market snapshot is unavailable/u);
    assert.match(withoutBars.en.MUUB, /20-for-1 forward split/u);
    assert.match(withoutBars.en.SNDKB, /Trading paused/u);
    assert.match(withoutBars.en.SNDKB, /SanDisk split and trading pause/u);
    assert.match(withoutBars.en.MUB, /A Binance market snapshot is unavailable/u);
    assert.doesNotMatch(withoutBars.en.SNDKB, /102 \/ 104 USDT/u);
    assert.doesNotMatch(withoutBars.en.CRCLB, /Token series uses closed UTC spot candles/u);

    const remaining = hostedWithoutPool.filter((ticker) => !Object.hasOwn(underlyings, ticker));
    for (let offset = 0; offset < remaining.length; offset += 20) {
      const batch = remaining.slice(offset, offset + 20);
      for (const [locale, pages] of Object.entries(render(batch))) {
        for (const ticker of batch) {
          const html = pages[ticker];
          assert.deepEqual(frameSymbols(html, locale, ticker).filter((symbol) => symbol.startsWith('BINANCE:')), [`BINANCE:${ticker}USDT`]);
          assert.ok(html.includes(labels[locale]));
          assert.ok(html.includes(`https://www.tradingview.com/symbols/${ticker}USDT/?exchange=BINANCE`));
          checkTechnicalSource(html, locale, ticker);
          checkUnderlyingQuote(html, locale, ticker);
          checkProspectuses(html, locale, ticker);
          checkDisplayUnits(html, locale, ticker);
          checkV2Reserves(html, locale, ticker);
          checkClMarket(html, locale, ticker);
        }
      }
    }

    const fundFigures = {
      DRAMB: ['0.65%', '0.65%'], INTWB: ['1.56%', '1.55%', '2×'], MVLLB: ['1.99%', '1.97%', '2×'],
      QQQB: ['0.18%'], SKDDB: ['2.2%', '2.2%', '-2×'], SKUUB: ['1.5%', '1.5%', '2×'],
      SMHB: ['447.43 USD/shares', '0.35%'], SQQQB: ['49.41 USD/shares', '0.94%', '0.94%', '-3×'],
      TQQQB: ['49.02 USD/shares', '0.94%', '0.78%', '3×'], UVXYB: ['25.59 USD/shares', '1.5×'],
      SNXXB: ['9.38 USD/shares', '1.54%', '1.54%', '2×'], BOTB: ['11.8 USD/shares'],
    };
    const companyQuarter = {
      AGPUB: ['0001171843-26-007507-index.htm', '11,503,607 USD', '6,825,897 USD', '0.52 USD/shares'],
      CYPHB: ['0001104659-26-127609-index.htm', '9,913,000 USD', '306,005,000 USD', '2,606,000 USD', '1.13 USD/shares'],
      QNTB: ['0001628280-26-072454-index.htm', '9,050,000 USD', '-16,952,000 USD', '-132,815,000 USD', '-0.46 USD/shares'],
      SECZB: ['0001628280-26-073910-index.htm', '18,610,270 USD', '-66,146,567 USD', '-23,572,563 USD', '-0.41 USD/shares'],
      SHAZB: ['0001493152-26-052382-index.htm', '9,930,669 USD', '-43,772,652 USD', '-37,461,270 USD', '-66,090,364 USD', '-1.14 USD/shares'],
      USDEB: ['0001213900-26-120713-index.htm', '477,993 USD', '-100,174,338 USD', '-1,931,290 USD', '-4.17 USD/shares'],
    };
    const newerReports = {
      AMATB: {
        form: '8-K', date: '2026-11-12', start: '2026-07-27', secondStart: '2025-10-27', end: '2026-10-25', source: '/000162828026073360/exhibit991q42026earningsre.htm',
        quarter: ['10,409,000,000 USD', '3,658,000,000 USD', '2,718,000,000 USD', '3,300,000,000 USD', '3.4 USD/shares'],
        year: ['34,446,000,000 USD', '11,087,000,000 USD', '10,088,000,000 USD', '8,868,000,000 USD', '12.62 USD/shares'],
      },
      ASMLB: {
        date: '2026-10-14', start: '2026-06-29', end: '2026-09-27', source: '/000162828026065813/financial_statementsxusx.htm',
        quarter: ['11,662,000,000 EUR', '5,172,800,000 EUR', '4,960,400,000 EUR', '11,797,600,000 EUR', '12.93 EUR/shares'],
        interim: ['29,755,400,000 EUR', '11,786,800,000 EUR', '10,634,700,000 EUR', '11,315,000,000 EUR', '27.64 EUR/shares'],
      },
      NBISB: {
        date: '2026-11-12', start: '2026-07-01', end: '2026-09-30', source: '/000110465926126238/nbis-ex99d2.htm',
        quarter: ['980,800,000 USD', '50,400,000 USD', '-37,500,000 USD', '-0.13 USD/shares'],
        interim: ['1,962,100,000 USD', '-253,500,000 USD', '393,300,000 USD', '4,231,100,000 USD', '1.39 USD/shares'],
      },
      NUB: {
        date: '2026-11-12', start: '2026-07-01', end: '2026-09-30', source: '/000129281426005272/nufs3q26_6k.htm',
        quarter: ['5,820,364,000 USD', '1,091,558,000 USD', '0.2235 USD/shares'],
        interim: ['16,301,539,000 USD', '3,024,078,000 USD', '-1,049,562,000 USD', '0.6166 USD/shares'],
      },
      NVDAB: {
        form: '8-K', date: '2026-11-17', start: '2026-07-27', secondStart: '2026-01-26', end: '2026-10-25', source: '/000104581026000088/q3fy27pr.htm',
        quarter: ['115,844,000,000 USD', '77,520,000,000 USD', '65,287,000,000 USD', '48,253,000,000 USD', '2.7 USD/shares'],
        interim: ['293,681,000,000 USD', '194,791,000,000 USD', '183,297,000,000 USD', '122,675,000,000 USD', '7.55 USD/shares'],
      },
      TSMB: {
        date: '2026-11-13', start: '2026-07-01', end: '2026-09-30', source: '/000104617926000801/a2026q3consolidatedreport-.htm',
        quarter: ['1,494,243,284,000 TWD', '876,445,164,000 TWD', '763,340,827,000 TWD', '29.43 TWD/shares'],
        interim: ['3,898,726,974,000 TWD', '2,302,013,957,000 TWD', '2,042,923,054,000 TWD', '2,402,116,725,000 TWD', '78.75 TWD/shares'],
      },
    };
    const fiscalDetails = (html, start, source, end = '2026-09-30') => [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
      .map(([, details]) => details).find((details) => details.includes(`${start} – ${end}`) && details.includes(source));
    const figures = (html) => [...html.matchAll(/<dd\b[^>]*title="([^"]+)"/g)].map(([, value]) => value);
    const fundamentalsHeadings = { en: 'Underlying fundamentals', 'zh-CN': '原资产基本面', ja: '原資産のファンダメンタルズ' };
    const referenceLabels = { en: 'Reference asset or index', 'zh-CN': '参考标的或指数', ja: '参照資産・指数' };
    const structureLabels = { en: 'Closed-end fund', 'zh-CN': '封闭式基金', ja: 'クローズドエンド型ファンド' };
    const unauditedLabels = { en: 'Unaudited interim statement', 'zh-CN': '未经审计的中期报表', ja: '未監査の期中財務諸表' };
    const fullYearUnauditedLabels = { en: 'Unaudited full-year statement', 'zh-CN': '未经审计的全年财务报表', ja: '未監査の通期財務諸表' };
    const cohortTitles = { en: 'Five verified U.S. listings', 'zh-CN': '五个已核实的美国挂牌标的', ja: '米国上場を確認した5銘柄' };
    const timeBasis = { en: 'match the observation time', 'zh-CN': '对齐观测时点', ja: '観測時刻と通貨をそろえ' };
    const articleSuffix = { en: '-en', 'zh-CN': '', ja: '-ja' };
    for (const [ticker, report] of Object.entries(newerReports)) {
      const { cik, filings, exchange, symbol } = primary[ticker];
      const annual = sec[ticker];
      const form = report.form ?? '6-K';
      assert.deepEqual([cik, exchange, symbol], [annual.cik, annual.exchange, annual.symbol], ticker);
      assert.deepEqual(filings.map(row => [row.form, row.period, row.unaudited]), [[form, 'quarter', true], [form, report.year ? 'year' : 'interim', true]], ticker);
      assert.ok(filings.every(row => row.metrics.every(item => item.xbrl === undefined)), ticker);
      const merged = supplementFilings(filings, annual.filings);
      for (const key of ['revenue', 'netIncome']) assert.deepEqual(trailingTwelveMonths(merged, key), trailingTwelveMonths(annual.filings, key), ticker);
    }
    for (const [locale, pages] of Object.entries(render([...Object.keys(fundFigures), ...Object.keys(companyQuarter), ...Object.keys(newerReports), 'BSPB']))) {
      const section = (ticker) => pages[ticker].split(`>${fundamentalsHeadings[locale]}</h2>`)[1].split('</section>', 1)[0];
      checkDisplayUnits(pages.DRAMB, locale, 'DRAMB');
      for (const [ticker, expected] of Object.entries(fundFigures)) {
        const disclosure = section(ticker);
        const fund = primary[ticker].fund;
        assert.ok(disclosure.includes(`href="${fund.url}"`) && disclosure.includes(fund.day), ticker);
        assert.deepEqual(figures(disclosure), expected, `${ticker} (${locale})`);
        if (fund.benchmark) assert.ok(disclosure.includes(referenceLabels[locale]));
        if (fund.split) assert.ok(disclosure.includes(fund.split.day) && disclosure.includes(fund.split.ratio));
      }
      assert.ok(section('BOTB').includes(structureLabels[locale]));
      assert.ok(!section('QQQB').includes(structureLabels[locale]));
      for (const [ticker, [source, ...expected]] of Object.entries(companyQuarter)) {
        const quarter = fiscalDetails(section(ticker), '2026-07-01', source);
        assert.ok(quarter, ticker);
        assert.deepEqual(figures(quarter), expected, `${ticker} (${locale})`);
      }
      const ordinaryEps = { en: 'Diluted EPS per ordinary share', 'zh-CN': '每普通股摊薄收益', ja: '普通株式1株当たり希薄化後利益' }[locale];
      for (const [ticker, report] of Object.entries(newerReports)) {
        const disclosure = section(ticker);
        const quarter = fiscalDetails(disclosure, report.start, report.source, report.end);
        const second = fiscalDetails(disclosure, report.secondStart ?? '2026-01-01', report.source, report.end);
        const form = report.form ?? '6-K';
        const interimLabel = unauditedLabels[locale];
        const annualLabel = fullYearUnauditedLabels[locale];
        for (const [markup, expected, label] of [[quarter, report.quarter, interimLabel], [second, report.year ?? report.interim, report.year ? annualLabel : interimLabel]]) {
          assert.ok(markup?.includes(report.date) && markup.includes(label) && markup.includes(`>${form}`), `${ticker} (${locale})`);
          assert.ok(!markup.includes(label === interimLabel ? annualLabel : interimLabel), `${ticker} (${locale}) report type`);
          assert.deepEqual(figures(markup), expected, `${ticker} (${locale})`);
          if (ticker === 'TSMB' || ticker === 'ASMLB') assert.ok(markup.includes(ordinaryEps), `${ticker} (${locale})`);
        }
        assert.ok(disclosure.includes(`href="${sec[ticker].filings[0].url}"`), `${ticker} (${locale}) historical filing`);
      }
      const bspQuarter = fiscalDetails(section('BSPB'), '2026-07-01', 'bsp_ex99-2.htm');
      const bspInterim = fiscalDetails(section('BSPB'), '2026-01-01', 'bsp_ex99-2.htm');
      assert.ok(bspQuarter?.includes(unauditedLabels[locale]) && bspInterim?.includes(unauditedLabels[locale]));
      assert.deepEqual(figures(bspQuarter), ['780,222,000 USD', '171,731,000 USD', '90,215,000 USD', '261,391,000 USD', '0.13 USD/shares']);
      assert.deepEqual(figures(bspInterim), ['2,085,698,000 USD', '532,153,000 USD', '294,647,000 USD', '515,631,000 USD', '0.45 USD/shares']);
      for (const ticker of ['QNTB', 'AGPUB', 'SHAZB', 'BOTB', 'SECZB']) {
        const html = pages[ticker];
        assert.ok(html.includes(cohortTitles[locale]) && html.includes(timeBasis[locale]), `${ticker} (${locale})`);
        assert.ok(html.includes(`href="/${locale}/blog/bstocks-no-public-anchor${articleSuffix[locale]}"`));
      }
    }

    const rows = Object.fromEntries(Object.keys(underlyings).map((ticker) => [ticker, marketRow(ticker, [bar(nov19)])]));
    writeFileSync(destination, JSON.stringify({ version: 1, rows }));
    for (const [locale, pages] of Object.entries(render())) {
      for (const [ticker, symbol] of Object.entries(underlyings)) {
        assert.deepEqual(frameSymbols(pages[ticker], locale, ticker), [symbol]);
        assert.ok(!pages[ticker].includes(labels[locale]));
        checkTechnicalSource(pages[ticker], locale, ticker);
        checkUnderlyingQuote(pages[ticker], locale, ticker);
      }
      assert.match(pages.CRCLB, /<svg\b[^>]*\brole="img"/u);
    }

    const poolHeadlines = { en: 'pool depth at ±1%', 'zh-CN': '交易池 ±1% 深度', ja: 'プールの ±1% 取引深度' };
    const bandHeadlines = { en: 'Metric pool depth by price band', 'zh-CN': 'Metric 分档深度', ja: 'Metric の価格帯別取引深度' };
    const buyLabels = { en: 'Buy to +1% · USDT paid', 'zh-CN': '买入至 +1% · 支付 USDT', ja: '買いで +1% 到達 · 支払う USDT' };
    const sellLabels = { en: 'Sell to −1% · USDT received', 'zh-CN': '卖出至 −1% · 收到 USDT', ja: '売りで −1% 到達 · 受け取る USDT' };
    const marginalLabels = { en: 'marginal price', 'zh-CN': '池内边际价格', ja: 'プールの限界価格' };
    const aliasDetails = { en: 'GeckoTerminal uses a different symbol', 'zh-CN': 'GeckoTerminal 对同一代币使用另一个简称', ja: 'GeckoTerminal では同じトークンが別の記号で表示されます' };
    for (const [locale, pages] of Object.entries(render(onchain.map(({ ticker }) => ticker)))) {
      for (const { ticker, listing } of onchain) {
        const base = listing.contractAddress.toLowerCase();
        const pool = poolRegistry.pools[base] ?? wbnbPools.pools[base];
        const depth = depthSnapshot.pools[base];
        const metric = metricSnapshot.pools[base];
        const wbnb = wbnbSnapshot.pools[base];
        const quote = wbnb ? 'WBNB' : 'USDT';
        const html = pages[ticker];
        checkTechnicalSource(html, locale, ticker);
        checkUnderlyingQuote(html, locale, ticker);
        checkProspectuses(html, locale, ticker);
        checkDisplayUnits(html, locale, ticker);
        checkClMarket(html, locale, ticker);
        assert.ok(!html.includes('data-v2-reserves='), `${ticker} (${locale})`);
        const poolMarkup = html.split(`>${poolHeadings[locale]}</h2>`)[1]?.split('</section>', 1)[0];
        assert.ok(poolMarkup?.includes(`https://www.geckoterminal.com/bsc/pools/${pool.pool}?embed=1&amp;info=0&amp;swaps=0&amp;resolution=1d`));
        assert.equal(poolMarkup.includes(poolHeadlines[locale]), Boolean(depth || wbnb), `${ticker} (${locale})`);
        assert.equal(poolMarkup.includes(bandHeadlines[locale]), Boolean(metric), `${ticker} (${locale})`);
        assert.equal(poolMarkup.includes(`https://bscscan.com/block/${depthSnapshot.block.number}`), Boolean(depth));
        assert.equal(poolMarkup.includes(`https://bscscan.com/block/${metricSnapshot.block.number}`), Boolean(metric));
        assert.equal(poolMarkup.includes(`https://bscscan.com/block/${wbnbSnapshot.block.number}`), Boolean(wbnb));
        const amounts = [];
        if (depth) {
          assert.ok(poolMarkup.includes(buyLabels[locale]) && poolMarkup.includes(sellLabels[locale]) && poolMarkup.includes(marginalLabels[locale]));
          assert.ok(poolMarkup.includes(depthSnapshot.block.timestamp));
          amounts.push(depth.buyInUsdt, depth.sellOutUsdt);
        }
        if (wbnb) {
          assert.ok(poolMarkup.includes(buyLabels[locale].replace('USDT', 'WBNB')) && poolMarkup.includes(sellLabels[locale].replace('USDT', 'WBNB')));
          assert.ok(poolMarkup.includes(wbnbSnapshot.block.timestamp) && poolMarkup.includes(aliasDetails[locale]));
          assert.ok(poolMarkup.includes(`title="${ticker}/WBNB ${pool.venue}`) && html.includes(`${ticker}/USDT`));
          amounts.push(wbnb.buyInQuote, wbnb.sellOutQuote);
        }
        if (metric) {
          assert.ok(poolMarkup.includes(metricSnapshot.block.timestamp));
          assert.ok(poolMarkup.includes(metricSnapshot.sources.metric.ladder));
          for (const step of [metric.buy, metric.sell]) {
            const count = { en: `${step.simulatedBands} of ${step.returnedBands} returned bands independently simulated`,
              'zh-CN': `返回 ${step.returnedBands} 档，实际独立试算 ${step.simulatedBands} 档`, ja: `取得した ${step.returnedBands} 価格帯のうち ${step.simulatedBands} 件を個別に試算` }[locale];
            assert.ok(poolMarkup.includes(count));
            assert.ok(poolMarkup.includes(`${step.farthestSimulatedBin} · ≈ ${step.lowerPriceUsdt}–${step.upperPriceUsdt} USDT/${ticker}`));
            amounts.push(step.quoteDepthUsdt);
          }
        }
        for (const amount of amounts) {
          const [whole, fraction] = amount.split('.');
          const grouped = new Intl.NumberFormat(locale).format(BigInt(whole));
          const exact = `${grouped}${fraction ? `.${fraction}` : ''}`;
          assert.ok(poolMarkup.includes(`${exact} ${quote}`), `${ticker} (${locale}), ${amount}`);
          if (wbnb) assert.ok(!html.includes(`${exact} USDT`) && !html.includes(`${exact} USD`));
        }
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test('refreshing legacy CMC metadata cannot remove or change an official bStock listing', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'bstocks-cmc-'));
  try {
    const instruments = join(scratch, 'src/data/instruments');
    mkdirSync(instruments, { recursive: true });
    const input = join(scratch, 'cmc.json');
    const canonical = readFileSync(new URL('../data/instruments/bstocks.json', import.meta.url));
    const instrument = join(instruments, 'bstocks.json');
    writeFileSync(instrument, canonical);
    writeFileSync(input, JSON.stringify({ data: { cryptoCurrencyList: [{ id: 1, symbol: 'CRCLB', name: 'Circle Tokenized bStocks', quotes: [{ name: 'USD', price: 50 }] }] } }));
    execFileSync(process.execPath, [resolve('scripts/sync-instruments.mjs'), '--from', input, '--metadata'], { cwd: scratch });
    assert.deepEqual(readFileSync(instrument), canonical);
    assert.equal(JSON.parse(readFileSync(join(instruments, 'quotes.json'), 'utf8')).rows.CRCLB.priceUsd, 50);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test('underlying imports preserve identity, reject regressions in historical coverage and replace valid rebases atomically', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'bstocks-adjusted-'));
  const file = 'scripts/sync-bstocks-study.mjs';
  const run = (input, ...flags) => execFileSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', join(scratch, file), '--underlying', input, ...flags], { cwd: scratch, stdio: 'pipe' });
  try {
    for (const dir of ['scripts/lib', 'src/lib', 'src/data/instruments']) mkdirSync(join(scratch, dir), { recursive: true });
    for (const name of [file, 'scripts/lib/write-snapshot.mjs', 'src/lib/bstocks-study.ts', 'src/data/instruments/bstocks.json', 'src/data/instruments/bstocks-primary-facts.json']) {
      copyFileSync(resolve(name), join(scratch, name));
    }
    const source = 'https://example.test/authorized-data';
    const history = { symbol: 'CRCL', exchange: 'NYSE', observedAt: cutoff, currency: 'USD', adjustment: 'split-and-dividend', source, closes: [{ day: '2026-08-28', adjustedClose: 51 }] };
    const premium = {
      token: { symbol: 'CRCLBUSDT', venue: 'Binance', currency: 'USDT', price: 52, at: moment, source },
      equity: { symbol: 'CRCL', exchange: 'NYSE', currency: 'USD', adjustment: 'raw', session: 'regular-close', price: 50, at: moment, source },
      fx: { pair: 'USDT/USD', usdPerUsdt: 1, at: moment, source },
      ratio: { ticker: 'CRCLB', symbol: 'CRCL', exchange: 'NYSE', sharesPerToken: 1, validFrom: moment, validUntil: cutoff, source },
    };
    const input = join(scratch, 'input.json');
    const destination = join(scratch, '.generated/bstocks-study.json');
    writeFileSync(input, JSON.stringify({ rows: { CRCLB: { history, premium } } }));
    assert.match(run(input, '--dry-run').toString(), /validated without writing:.*1 local underlying/);
    assert.equal(existsSync(destination), false);
    assert.match(run(input).toString(), /1 local underlying/);
    const accepted = readFileSync(destination, 'utf8');
    const record = JSON.parse(accepted).rows.CRCLB;
    assert.equal(record.isin, 'AE000A4AU3B0');
    assert.equal(record.history.closes[0].close, 51);
    assert.ok(Math.abs(record.premium.percent - 4) < 1e-8);
    const bucket = { start: '2026-11-19T20:59:00Z', end: moment, closed: true };
    const period = {
      ...premium, basis: 'period-end',
      token: { ...premium.token, at: undefined, bucket }, fx: { ...premium.fx, at: undefined, bucket },
      ratio: { ...premium.ratio, validFrom: bucket.start },
    };
    writeFileSync(input, JSON.stringify({ rows: { CRCLB: { premium: period } } }));
    assert.match(run(input, '--dry-run').toString(), /validated without writing/);
    assert.equal(readFileSync(destination, 'utf8'), accepted);
    writeFileSync(input, JSON.stringify({ rows: { CRCLB: { history: { ...history, adjustment: 'unknown' } } } }));
    assert.throws(() => run(input), /Invalid adjusted history for CRCLB/);
    assert.equal(readFileSync(destination, 'utf8'), accepted);

    const series = (last, length, adjustedClose) => Array.from({ length }, (_, index) => ({
      day: new Date(Date.parse(last) - (length - index - 1) * day).toISOString().slice(0, 10), adjustedClose,
    }));
    const apply = (next) => {
      writeFileSync(input, JSON.stringify({ rows: { CRCLB: { history: next } } }));
      return run(input).toString();
    };
    const complete = { ...history, adjustment: 'split', closes: series('2026-09-01', 250, 50) };
    assert.match(apply(complete), /1 local underlying/);
    const retained = readFileSync(destination, 'utf8');
    assert.equal(JSON.parse(retained).rows.CRCLB.history.closes.length, 250);

    const observedAt = '2026-11-20T10:39:20Z';
    for (const rejected of [series('2020-09-02', 5, 105), series('2026-08-31', 250, 60), series('2026-09-02', 249, 70)]) {
      assert.throws(() => apply({ ...complete, observedAt, closes: rejected }), /Reduced adjusted history coverage for CRCLB/);
      assert.equal(readFileSync(destination, 'utf8'), retained);
    }

    const rolling = { ...complete, observedAt, adjustment: 'split-and-dividend', closes: series('2026-09-02', 250, 51) };
    assert.match(apply(rolling), /1 local underlying/);
    const replacement = JSON.parse(readFileSync(destination, 'utf8')).rows.CRCLB.history;
    assert.equal(replacement.adjustment, 'split-and-dividend');
    assert.deepEqual(replacement.closes, rolling.closes.map(({ day, adjustedClose }) => ({ day, close: adjustedClose })));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
