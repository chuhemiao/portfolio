import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { BSC_DEPTH_QUOTES, BSC_DEPTH_RPC, BSC_MULTICALL3 } from '../../src/lib/bstocks-study.ts';

const execFileAsync = promisify(execFile);
export const BSC_USDT = BSC_DEPTH_QUOTES.USDT.contract;

export function address(value) {
  return typeof value === 'string' && /^0x[0-9a-f]{40}$/i.test(value) ? value.toLowerCase() : null;
}

function word(value) {
  return (typeof value === 'string' ? value.slice(2) : value.toString(16)).padStart(64, '0');
}

export function encodeCall(to, selector, ...args) {
  return { to, data: `0x${selector}${args.map(word).join('')}` };
}

export function words(value, length) {
  if (typeof value !== 'string' || !/^0x(?:[0-9a-f]{64})+$/i.test(value)) return null;
  const count = (value.length - 2) / 64;
  if (length !== undefined && count !== length) return null;
  return Array.from({ length: count }, (_, index) => BigInt(`0x${value.slice(2 + 64 * index, 66 + 64 * index)}`));
}

export function decodeAddress(value) {
  return typeof value === 'string' && /^0x0{24}[0-9a-f]{40}$/i.test(value) ? `0x${value.slice(26).toLowerCase()}` : null;
}

export function decimalAmount(value, decimals = 18) {
  const digits = String(value).padStart(decimals + 1, '0');
  const fraction = digits.slice(-decimals).replace(/0+$/, '');
  return `${digits.slice(0, -decimals)}${fraction ? `.${fraction}` : ''}`;
}

export function listedPoolScopes(manifest, catalog, supported, quote = BSC_DEPTH_QUOTES.USDT) {
  if (manifest.version !== 1 || manifest.network !== 'bsc' || manifest.quote?.symbol !== quote.symbol || manifest.quote.contract !== quote.contract) {
    throw new Error('Unexpected verified pool catalog identity');
  }
  const listed = new Map();
  for (const row of catalog) {
    const base = address(row.listing?.contractAddress);
    if (row.issuerSlug !== 'bstocks' || !row.chains.includes('BNB Chain') || !base) continue;
    if (listed.has(base)) throw new Error('Repeated bStocks base contract');
    listed.set(base, row.ticker);
  }
  const scopes = Object.entries(manifest.pools).filter(([, pool]) => supported(pool.venue)).map(([base, pool]) => {
    if (!listed.has(base) || address(base) !== base || address(pool.pool) !== pool.pool || base === quote.contract) throw new Error('Invalid verified bStocks pool identity');
    return { ...pool, ticker: listed.get(base), base };
  });
  if (!scopes.length || new Set(scopes.map(({ pool }) => pool)).size !== scopes.length) throw new Error('Missing or repeated supported pool identities');
  return scopes;
}

function blockIdentity(value) {
  if (![value?.number, value?.timestamp].every((field) => typeof field === 'string' && /^0x[0-9a-f]{1,13}$/i.test(field)) ||
    typeof value?.hash !== 'string' || !/^0x[0-9a-f]{64}$/i.test(value.hash)) throw new Error('Invalid BNB Chain block identity');
  const number = Number(BigInt(value.number));
  const milliseconds = Number(BigInt(value.timestamp)) * 1_000;
  if (!Number.isSafeInteger(number) || number < 1 || milliseconds <= 0 || milliseconds > Date.now()) throw new Error('Invalid BNB Chain block number or timestamp');
  return { tag: value.number, number, hash: value.hash.toLowerCase(), timestamp: new Date(milliseconds).toISOString() };
}

function aggregateData(members) {
  let offset = 32 * members.length;
  const heads = [];
  const bodies = [];
  for (const { to, data } of members) {
    const abi = data.slice(2);
    const body = word(to) + word(1) + word(96) + word(abi.length / 2) + abi.padEnd(Math.ceil(abi.length / 64) * 64, '0');
    heads.push(word(offset));
    bodies.push(body);
    offset += body.length / 2;
  }
  return `0x82ad56cb${word(32)}${word(members.length)}${heads.join('')}${bodies.join('')}`;
}

function aggregateResults(raw, count) {
  if (typeof raw !== 'string' || !/^0x(?:[0-9a-f]{64})+$/i.test(raw)) throw new Error('Invalid aggregate3 response');
  const hex = raw.slice(2);
  const at = (offset) => {
    if (!Number.isSafeInteger(offset) || offset < 0 || offset % 32 || offset * 2 + 64 > hex.length) throw new Error('Invalid aggregate3 offset');
    return BigInt(`0x${hex.slice(offset * 2, offset * 2 + 64)}`);
  };
  if (at(0) !== 32n || at(32) !== BigInt(count)) throw new Error('Unexpected aggregate3 result length');
  return Array.from({ length: count }, (_, index) => {
    const tuple = 64 + Number(at(64 + 32 * index));
    const success = at(tuple);
    const body = tuple + Number(at(tuple + 32));
    const size = Number(at(body));
    if ((success !== 0n && success !== 1n) || !Number.isSafeInteger(size) || (body + 32 + size) * 2 > hex.length) {
      throw new Error('Invalid aggregate3 tuple');
    }
    return success === 1n ? `0x${hex.slice((body + 32) * 2, (body + 32 + size) * 2)}` : null;
  });
}

export async function openBscSnapshot() {
  let requestId = 0;
  const cancelled = new AbortController();
  const signal = AbortSignal.any([cancelled.signal, AbortSignal.timeout(100_000)]);
  async function rpc(method, params) {
    const id = ++requestId;
    try {
      let stdout;
      try {
        ({ stdout } = await execFileAsync('curl', [
          '--proto', '=https', '--silent', '--show-error', '--max-time', '8', '--connect-timeout', '4',
          '--header', 'Content-Type: application/json', '--header', 'Accept: application/json', '--header', 'Accept-Encoding: identity',
          '--data-binary', JSON.stringify({ jsonrpc: '2.0', id, method, params }), '--write-out', '\n%{http_code}', BSC_DEPTH_RPC,
        ], { encoding: 'utf8', maxBuffer: 3_500_000, signal }));
      } catch {
        throw new Error('BNB Chain RPC transport failed or timed out');
      }
      const bodyEnd = stdout.lastIndexOf('\n');
      const status = Number(stdout.slice(bodyEnd + 1));
      if (status !== 200) throw new Error(`BNB Chain RPC returned HTTP ${status}`);
      const response = JSON.parse(stdout.slice(0, bodyEnd));
      if (response?.error) {
        const { code, message } = response.error;
        const detail = typeof message === 'string' ? message.toLowerCase() : '';
        const known = ['execution reverted', 'out of gas', 'gas cap', 'gas required', 'timeout', 'timed out', 'rate limit',
          'too many request', 'missing trie', 'state unavailable', 'pruned', 'historical state'].find((reason) => detail.includes(reason));
        throw new Error(`BNB Chain RPC rejected ${method}${Number.isSafeInteger(code) ? ` (${code})` : ''}${known ? ` · ${known}` : ''}`);
      }
      if (response?.jsonrpc !== '2.0' || response.id !== id || !Object.hasOwn(response, 'result')) {
        throw new Error(`BNB Chain RPC did not complete ${method}`);
      }
      return response.result;
    } catch (error) {
      cancelled.abort();
      throw error;
    }
  }

  const [chain, finalized] = await Promise.all([rpc('eth_chainId', []), rpc('eth_getBlockByNumber', ['finalized', false])]);
  if (chain !== '0x38') throw new Error('Unexpected chain ID for bStocks pool depth');
  const { tag, ...block } = blockIdentity(finalized);
  const code = await rpc('eth_getCode', [BSC_MULTICALL3.address, tag]);
  if (typeof code !== 'string' || !/^0x[0-9a-f]{7616}$/i.test(code) ||
    createHash('sha256').update(Buffer.from(code.slice(2), 'hex')).digest('hex') !== BSC_MULTICALL3.runtimeSha256) {
    throw new Error('Unexpected Multicall3 deployment at the finalized block');
  }

  const readAt = ({ to, data }, gas) => rpc('eth_call', [{ to, data, gas }, tag]);
  async function aggregate(members, width) {
    const results = new Map();
    let offset = 0;
    const workers = Array.from({ length: Math.min(4, Math.ceil(members.length / width)) }, async () => {
      while (offset < members.length && !signal.aborted) {
        const group = members.slice(offset, offset + width);
        offset += width;
        const data = aggregateData(group.map(([, spec]) => spec));
        const raw = await readAt({ to: BSC_MULTICALL3.address, data }, '0x7a1200');
        const values = aggregateResults(raw, group.length);
        group.forEach(([key], index) => results.set(key, values[index]));
      }
    });
    try {
      await Promise.all(workers);
    } catch (error) {
      cancelled.abort();
      throw error;
    }
    return results;
  }

  async function verifyBlock() {
    const same = blockIdentity(await rpc('eth_getBlockByNumber', [tag, false]));
    if (same.tag !== tag || same.hash !== block.hash || same.timestamp !== block.timestamp) throw new Error('BNB Chain finalized block changed');
  }

  return { block, aggregate, readAt, verifyBlock };
}
