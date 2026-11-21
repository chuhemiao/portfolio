import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs, promisify } from 'node:util';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const endpoint = 'https://api.mainnet-beta.solana.com';
const wallet = '3nGNwiz1qevPjhEoQi1dLj16oTkjmbevTnpV9piWY7Kq';
const program = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK';
const pool = 'HnhpJPJgBG2KwniMTNW8cVBHvk1hFog3RC3kjnyc23tD';
const usdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const cards = 'CARDSccUMFKoPRZxt5vt3ksUbxEFEcnZ3H2pd3dKxYjp';
const cardsAccount = 'Hcu94gZNyNGQedXixRPAiEfAAWK2rwW7sKiD7SoWjNXL';
const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const discriminator = createHash('sha256').update('global:swap_v2').digest().subarray(0, 8);
const batchSize = 6;
const interval = 10_100;
const scale = 1_000_000;
const transactionOptions = { encoding: 'jsonParsed', commitment: 'finalized', maxSupportedTransactionVersion: 0 };
const scope = { endpoint, wallet, program, pool, usdc, cards, cardsAccount, tokenProgram, commitment: 'finalized', instruction: 'swap_v2', direction: 'USDC-to-CARDS', decimals: 6 };
const execFileAsync = promisify(execFile);

function rawAmount(value) {
  if (typeof value !== 'string' || !/^(?:0|[1-9]\d{0,19})$/.test(value)) return null;
  const integer = BigInt(value);
  return integer <= (1n << 64n) - 1n ? integer : null;
}

function exactReceiptUnits(raw) {
  return raw > 0n && raw <= BigInt(Number.MAX_SAFE_INTEGER) && BigInt(Math.round((Number(raw) / scale) * scale)) === raw;
}

function decodeBase58(value, maxLength) {
  if (typeof value !== 'string' || !value.length || value.length > maxLength) return null;
  let number = 0n;
  for (const character of value) {
    const digit = base58.indexOf(character);
    if (digit === -1) return null;
    number = number * 58n + BigInt(digit);
  }
  const leading = value.match(/^1*/)[0].length;
  const hex = number ? number.toString(16) : '';
  return Buffer.concat([Buffer.alloc(leading), Buffer.from(hex.padStart(hex.length + hex.length % 2, '0'), 'hex')]);
}

function walletBalances(entries, keys) {
  if (!Array.isArray(entries)) return null;
  const balances = new Map();
  for (const entry of entries) {
    const account = keys[entry?.accountIndex]?.pubkey;
    if (entry?.owner !== wallet && account !== cardsAccount) continue;
    if (entry.mint !== usdc && entry.mint !== cards) continue;
    const amount = rawAmount(entry.uiTokenAmount?.amount);
    if (!account || entry.owner !== wallet || entry.programId !== tokenProgram || entry.uiTokenAmount.decimals !== 6 ||
      amount === null || balances.has(account)) return null;
    balances.set(account, { mint: entry.mint, amount });
  }
  return balances;
}

function checkedTransfer(instruction, authority, source, destination, mint) {
  const info = instruction?.parsed?.info;
  return instruction?.programId === tokenProgram && instruction.stackHeight === 2 && instruction.parsed?.type === 'transferChecked' &&
    info?.authority === authority && info.source === source && info.destination === destination && info.mint === mint &&
    info.tokenAmount?.decimals === 6 ? rawAmount(info.tokenAmount.amount) : null;
}

export function classifyCollectorBuyback(entry, receipt) {
  const unsupported = reason => ({ status: 'unsupported', reason });
  if (receipt == null) return { status: 'unavailable', reason: 'missing-receipt' };
  const { slot, blockTime, transaction, meta } = receipt;
  const { accountKeys: keys, instructions } = transaction?.message ?? {};
  if (slot !== entry.slot || blockTime !== entry.blockTime || transaction?.signatures?.[0] !== entry.signature || meta?.err !== null ||
    !Array.isArray(keys) || !keys.every(key => typeof key?.pubkey === 'string' && typeof key.signer === 'boolean') ||
    !Array.isArray(instructions) || !instructions.every(ix => typeof ix?.programId === 'string')) return unsupported('receipt-identity-or-shape');
  if (!keys.some(key => key.pubkey === wallet && key.signer)) return { status: 'excluded', reason: 'wallet-not-signer' };
  const pre = walletBalances(meta.preTokenBalances, keys);
  const post = walletBalances(meta.postTokenBalances, keys);
  if (!pre || !post) return unsupported('wallet-balances');
  const changes = new Map();
  for (const account of new Set([...pre.keys(), ...post.keys()])) {
    const old = pre.get(account);
    const current = post.get(account);
    if (old && current && old.mint !== current.mint) return unsupported('wallet-balance-mint');
    const delta = (current?.amount ?? 0n) - (old?.amount ?? 0n);
    if (delta) changes.set(account, { mint: (old ?? current).mint, delta });
  }
  const swaps = instructions.flatMap((ix, index) => ix.programId === program && Array.isArray(ix.accounts) && ix.accounts[2] === pool ? [index] : []);
  if (!swaps.length) return keys.some(key => key.pubkey === pool) || [...changes.values()].some(change => change.mint === cards && change.delta > 0n)
    ? unsupported('potential-alternate-route') : { status: 'excluded', reason: 'outside-direct-swap-scope' };
  const [index] = swaps;
  const swap = instructions[index];
  const data = decodeBase58(swap.data, 56);
  const [payer, , , input, output, inputVault, outputVault, , classic, , , inputMint, outputMint] = swap.accounts;
  if (swaps.length !== 1 || data?.length !== 41 || !data.subarray(0, 8).equals(discriminator) || data[40] !== 1 ||
    payer !== wallet || output !== cardsAccount || classic !== tokenProgram || inputMint !== usdc || outputMint !== cards) {
    return unsupported('swap-instruction');
  }
  const groups = meta.innerInstructions;
  if (!Array.isArray(groups) || !groups.every(group => Number.isSafeInteger(group?.index) && Array.isArray(group.instructions))) {
    return unsupported('inner-instructions');
  }
  const legs = groups.filter(group => group.index === index).flatMap(group => group.instructions);
  const paid = checkedTransfer(legs[0], wallet, input, inputVault, usdc);
  const received = checkedTransfer(legs[1], pool, outputVault, output, cards);
  const allInstructions = [...instructions, ...groups.flatMap(group => group.instructions)];
  if (legs.length !== 2 || allInstructions.filter(ix => ix?.programId === tokenProgram).length !== 2 ||
    allInstructions.filter(ix => ix?.programId === program).length !== 1 || !paid || !received ||
    paid !== data.readBigUInt64LE(8) || received < data.readBigUInt64LE(16) ||
    changes.size !== 2 || changes.get(input)?.delta !== -paid || changes.get(input)?.mint !== usdc ||
    changes.get(output)?.delta !== received || changes.get(output)?.mint !== cards ||
    ![input, output].every(account => pre.has(account) && post.has(account)) ||
    !exactReceiptUnits(paid) || !exactReceiptUnits(received)) return unsupported('swap-payment-or-delivery');
  return { status: 'verified', paidRaw: paid.toString(), receivedRaw: received.toString(), instructionIndex: index };
}

export async function readSolanaBatch(calls, signal) {
  if (!calls.length || calls.length > batchSize || calls.some(call => !['getSignaturesForAddress', 'getTransaction'].includes(call.method))) {
    throw new Error('Invalid Collector Crypt public RPC batch');
  }
  const requests = calls.map(({ method, params }, index) => ({ jsonrpc: '2.0', id: index + 1, method, params }));
  const body = JSON.stringify(requests.length === 1 ? requests[0] : requests);
  let stdout;
  try {
    ({ stdout } = await execFileAsync('curl', [
      '--disable', '--silent', '--show-error', '--max-time', '25', '--max-filesize', '4000000',
      '--header', 'Content-Type: application/json', '--data-binary', body,
      '--write-out', '\n%{http_code}\n%header{retry-after}', endpoint,
    ], { encoding: 'utf8', maxBuffer: 4_000_000, signal }));
  } catch {
    throw new Error(signal?.aborted ? 'Solana RPC read cancelled' : 'Solana RPC transport failed or timed out');
  }
  const trailer = stdout.match(/\n(\d{3})\n([^\n]*)$/);
  if (!trailer) throw new Error('Solana RPC response is missing HTTP status');
  const [, status, retryAfter] = trailer;
  if (status !== '200') {
    const delay = /^\d{1,6}$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now();
    throw Object.assign(new Error(`Solana RPC HTTP ${status}`), { retryDelay: Number.isFinite(delay) ? delay : 0 });
  }
  const result = JSON.parse(stdout.slice(0, trailer.index));
  const replies = Array.isArray(result) ? result : [result];
  const byId = new Map(replies.map(item => [item?.id, item]));
  if (replies.length !== requests.length || byId.size !== replies.length || requests.some(({ id }) => {
    const reply = byId.get(id);
    return reply?.jsonrpc !== '2.0' || Number(Object.hasOwn(reply, 'result')) + Number(Object.hasOwn(reply, 'error')) !== 1;
  })) throw new Error('Solana RPC response does not match the requested batch');
  return requests.map(({ id }) => byId.get(id));
}

function cutover(value) {
  const iso = /^\d{4}-\d\d-\d\d$/.test(value ?? '') ? `${value}T00:00:00Z` : value;
  const time = Date.parse(iso);
  if (!Number.isFinite(time) || new Date(time).toISOString().replace('.000Z', 'Z') !== iso?.replace('.000Z', 'Z') || time % 1000) {
    throw new Error('Supply UTC bounds as YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ');
  }
  return time / 1000;
}

function validateHistory(entries, existing) {
  if (!Array.isArray(entries)) throw new Error('Invalid Solana finalized signature history');
  const seen = new Set(existing.map(row => row.signature));
  let previous = existing.at(-1);
  for (const row of entries) {
    if (decodeBase58(row?.signature, 88)?.length !== 64 || !Number.isSafeInteger(row.slot) || row.slot < 1 ||
      !Number.isSafeInteger(row.blockTime) || row.blockTime < 1 || row.confirmationStatus !== 'finalized' || !Object.hasOwn(row, 'err') ||
      seen.has(row.signature) || (previous && (row.slot > previous.slot || row.blockTime > previous.blockTime))) {
      throw new Error('Unverified, unordered or duplicate Solana signature history');
    }
    seen.add(row.signature);
    previous = row;
  }
}

function bracketed(index, from, to) {
  return index[0]?.blockTime >= to && index.at(-1)?.blockTime < from;
}

function summarize(state) {
  const target = state.index.filter(row => row.blockTime >= state.from && row.blockTime < state.to);
  const outcomes = new Map(state.results.map(result => [result.signature, result]));
  const counts = { successful: 0, failed: 0, verified: 0, excluded: 0, unsupported: 0, unavailable: 0, unchecked: 0 };
  let paid = 0n;
  let received = 0n;
  const receipts = [];
  for (const row of target) {
    if (row.err !== null) { counts.failed++; continue; }
    counts.successful++;
    const outcome = outcomes.get(row.signature);
    counts[outcome?.status ?? 'unchecked']++;
    if (outcome?.status !== 'verified') continue;
    paid += BigInt(outcome.paidRaw);
    received += BigInt(outcome.receivedRaw);
    receipts.push({
      project: 'collector-crypt', chain: 'solana', kind: 'tokenBuybacks', transaction: row.signature, eventIndex: null,
      settledAt: new Date(row.blockTime * 1000).toISOString(),
      paid: { amount: Number(outcome.paidRaw) / scale, asset: 'USDC' },
      received: { amount: Number(outcome.receivedRaw) / scale, asset: 'CARDS' },
      source: { title: 'Solana Explorer', url: `https://explorer.solana.com/tx/${row.signature}` },
    });
  }
  const indexBracketed = bracketed(state.index, state.from, state.to);
  return { completeWithinScope: indexBracketed && !(counts.unsupported + counts.unavailable + counts.unchecked), indexBracketed,
    indexedSignatures: state.index.length, counts, paidUsdcRaw: paid.toString(), receivedCardsRaw: received.toString(), receipts };
}

function resumeState(input, initial) {
  const state = { version: input?.version, scope: input?.scope, from: input?.from, to: input?.to,
    nextRequestAt: input?.nextRequestAt, inFlight: input?.inFlight === undefined ? false : input.inFlight,
    index: input?.index, results: input?.results };
  if (state.version !== initial.version || JSON.stringify(state.scope) !== JSON.stringify(initial.scope) || state.from !== initial.from ||
    state.to !== initial.to || !Number.isSafeInteger(state.nextRequestAt) || state.nextRequestAt < 0 ||
    typeof state.inFlight !== 'boolean' || !Array.isArray(state.results)) {
    throw new Error('Checkpoint identity differs from the requested Collector Crypt scope and UTC range');
  }
  validateHistory(state.index, []);
  if (state.index.length && state.index[0].blockTime < state.to) throw new Error('Checkpoint history lacks the exclusive UTC end bound');
  const eligible = new Set(state.index.filter(row => row.blockTime >= state.from && row.blockTime < state.to && row.err === null).map(row => row.signature));
  for (const outcome of state.results) {
    if (!eligible.delete(outcome?.signature) || !['verified', 'excluded', 'unsupported', 'unavailable'].includes(outcome?.status) ||
      (outcome.status === 'verified' && (!Number.isSafeInteger(outcome.instructionIndex) || outcome.instructionIndex < 0 ||
        ![outcome.paidRaw, outcome.receivedRaw].every(value => exactReceiptUnits(rawAmount(value)))))) {
      throw new Error('Invalid or repeated Collector Crypt outcome in checkpoint');
    }
  }
  if (state.results.length && !bracketed(state.index, state.from, state.to)) throw new Error('Checkpoint outcomes lack bracketed signature history');
  return state;
}

async function capture({ from, to, output, maxCalls, signal }) {
  const initial = { version: 1, scope, from, to, nextRequestAt: 0, inFlight: false, index: [], results: [] };
  const existing = await readFile(output, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  const state = existing === null ? initial : resumeState(JSON.parse(existing), initial);
  let calls = 0;
  const save = () => writeSnapshot(output, { ...state, summary: summarize(state) });
  const request = async operations => {
    await sleep(Math.max(state.inFlight ? interval : 0, state.nextRequestAt - Date.now()), undefined, { signal });
    state.inFlight = true;
    await save();
    calls++;
    try {
      const replies = await readSolanaBatch(operations, signal);
      state.inFlight = false;
      state.nextRequestAt = Date.now() + interval;
      return replies;
    } catch (error) {
      state.inFlight = false;
      state.nextRequestAt = Date.now() + Math.max(interval, error.retryDelay ?? 0);
      await save();
      throw error;
    }
  };
  while (calls < maxCalls && !bracketed(state.index, from, to)) {
    const before = state.index.at(-1)?.signature;
    const [reply] = await request([{ method: 'getSignaturesForAddress', params: [wallet, { commitment: 'finalized', limit: 1000, ...(before ? { before } : {}) }] }]);
    validateHistory(reply.result, state.index);
    if (!reply.result.length || (!before && reply.result[0].blockTime < to)) throw new Error('Finalized history does not bracket the requested UTC range');
    state.index.push(...reply.result.map(({ signature, slot, blockTime, confirmationStatus, err }) => ({ signature, slot, blockTime, confirmationStatus, err })));
    await save();
  }
  if (!bracketed(state.index, from, to)) return summarize(state);
  const outcomes = new Map(state.results.map(result => [result.signature, result]));
  const successful = state.index.filter(row => row.blockTime >= from && row.blockTime < to && row.err === null);
  const pending = [
    ...successful.filter(row => !outcomes.has(row.signature)),
    ...successful.filter(row => outcomes.get(row.signature)?.status === 'unavailable'),
  ];
  for (let offset = 0; offset < pending.length && calls < maxCalls; offset += batchSize) {
    const batch = pending.slice(offset, offset + batchSize);
    const responses = await request(batch.map(row => ({ method: 'getTransaction', params: [row.signature, transactionOptions] })));
    batch.forEach((row, index) => outcomes.set(row.signature, { signature: row.signature, ...classifyCollectorBuyback(row, responses[index].result) }));
    state.results = [...outcomes.values()];
    await save();
    if (batch.every(row => outcomes.get(row.signature).status === 'unavailable')) break;
  }
  return summarize(state);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: {
      from: { type: 'string' }, to: { type: 'string' }, out: { type: 'string' }, 'max-calls': { type: 'string' }, help: { type: 'boolean' },
    } });
    if (values.help) {
      console.log('node scripts/capture-collector-cards-buybacks.mjs --from UTC --to UTC --out CHECKPOINT.json [--max-calls N]');
      console.log('The finalized UTC window includes --from and excludes --to. Repeat the same command and output path to resume.');
      console.log('Coverage applies to the verified direct Raydium CLMM USDC-to-CARDS swap scope. Results stay in the candidate checkpoint for review.');
    } else {
      const from = cutover(values.from);
      const to = cutover(values.to);
      const maxCalls = values['max-calls'] === undefined ? Infinity : Number(values['max-calls']);
      if (!values.out || from >= to || to > Date.now() / 1000 ||
        (values['max-calls'] !== undefined && (!Number.isSafeInteger(maxCalls) || maxCalls < 1))) throw new Error('Invalid UTC range, output or call budget');
      const output = resolve(values.out);
      await mkdir(dirname(output), { recursive: true });
      const lockPath = `${output}.lock`;
      const lock = await open(lockPath, 'wx');
      const stop = new AbortController();
      const interrupt = () => stop.abort();
      process.once('SIGINT', interrupt);
      process.once('SIGTERM', interrupt);
      try {
        const { receipts, ...summary } = await capture({ from, to, output, maxCalls, signal: stop.signal });
        console.log(JSON.stringify({ ...summary, receiptCount: receipts.length }, null, 2));
      } finally {
        process.off('SIGINT', interrupt);
        process.off('SIGTERM', interrupt);
        await lock.close();
        await unlink(lockPath);
      }
    }
  } catch (error) {
    console.error(`Collector Crypt capture stopped: ${error.message}`);
    process.exitCode = 1;
  }
}
