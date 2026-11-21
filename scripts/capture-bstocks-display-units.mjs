import { readFile } from 'node:fs/promises';
import { parseArgs, TextDecoder } from 'node:util';
import { BEP_677_STANDARD, BSC_DEPTH_RPC, BSC_MULTICALL3, bscTokenDisplayUnits } from '../src/lib/bstocks-study.ts';
import { address, encodeCall, openBscSnapshot, words } from './lib/bstocks-bsc-rpc.mjs';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const { values } = parseArgs({ options: { out: { type: 'string' } } });
if (!values.out) throw new Error('Supply --out <snapshot.json>');

const catalog = JSON.parse(await readFile(new URL('../src/data/instruments/bstocks.json', import.meta.url), 'utf8'));
const scopes = catalog.filter(({ issuerSlug, chains }) => issuerSlug === 'bstocks' && chains.includes('BNB Chain')).map(({ ticker, listing }) => {
  const base = address(listing?.contractAddress);
  if (!base || !/^[A-Z0-9]+$/.test(ticker) || !/^[A-Z0-9]{12}$/.test(listing?.isin ?? '')) throw new Error(`Incomplete listing identity for ${ticker}`);
  return { base, ticker, isin: listing.isin };
});
if (!scopes.length || ['base', 'ticker', 'isin'].some((key) => new Set(scopes.map((scope) => scope[key])).size !== scopes.length)) {
  throw new Error('Missing or repeated bStocks listing identities');
}

const selectors = {
  symbol: '95d89b41', decimals: '313ce567', uiMultiplier: 'a60bf13d', newUiMultiplier: 'dc767007', effectiveAt: '97a4064f', pending: '6fe968a3',
};
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
function symbolFromAbi(value) {
  const output = words(value, 3);
  if (!output || output[0] !== 32n || output[1] < 1n || output[1] > 32n) return null;
  const length = Number(output[1]);
  const bytes = Buffer.from(value.slice(130), 'hex');
  if (bytes.subarray(length).some((byte) => byte !== 0)) return null;
  try {
    return decoder.decode(bytes.subarray(0, length));
  } catch {
    return null;
  }
}

const { block, aggregate, verifyBlock } = await openBscSnapshot();
const observations = await aggregate(scopes.flatMap(({ base }) => Object.entries(selectors).map(([name, selector]) =>
  [`${base}/${name}`, encodeCall(base, selector)])), 90);
const tokens = Object.fromEntries(scopes.map(({ base, ticker, isin }) => {
  const raw = (field) => observations.get(`${base}/${field}`);
  const scalar = (field) => words(raw(field), 1)?.[0]?.toString();
  const pending = words(raw('pending'), 2);
  if (symbolFromAbi(raw('symbol')) !== ticker || scalar('decimals') !== '18') throw new Error(`On-chain symbol or precision mismatch for ${ticker}`);
  return [base, {
    ticker, isin, decimals: 18,
    uiMultiplier: scalar('uiMultiplier'), newUiMultiplier: scalar('newUiMultiplier'), effectiveAt: scalar('effectiveAt'),
    pendingMultiplier: pending?.[0].toString(), pendingEffectiveAt: pending?.[1].toString(),
  }];
}));
await verifyBlock();
const snapshot = {
  version: 1, network: 'bsc', chainId: 56, block, observedAt: new Date().toISOString(),
  sources: { endpoint: BSC_DEPTH_RPC, multicall: BSC_MULTICALL3, standard: BEP_677_STANDARD }, tokens,
};
for (const { base, ticker, isin } of scopes) {
  if (!bscTokenDisplayUnits(snapshot, base, ticker, isin)) throw new Error(`Display-unit state could not be verified for ${ticker}`);
}

await writeSnapshot(values.out, snapshot);
console.log(`Verified ${scopes.length} bStocks display-unit multipliers at BNB Chain block ${block.number} (${block.timestamp}).`);
