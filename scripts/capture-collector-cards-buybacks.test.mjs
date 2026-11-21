import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { classifyCollectorBuyback } from './capture-collector-cards-buybacks.mjs';

const wallet = '3nGNwiz1qevPjhEoQi1dLj16oTkjmbevTnpV9piWY7Kq';
const program = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK';
const pool = 'HnhpJPJgBG2KwniMTNW8cVBHvk1hFog3RC3kjnyc23tD';
const usdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const cards = 'CARDSccUMFKoPRZxt5vt3ksUbxEFEcnZ3H2pd3dKxYjp';
const cardsAccount = 'Hcu94gZNyNGQedXixRPAiEfAAWK2rwW7sKiD7SoWjNXL';
const token = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const signature = (suffix) => `${'1'.repeat(63)}${suffix}`;
const at = (day) => Date.parse(day) / 1000;
const indexed = (suffix, slot, blockTime, err = null) => ({ signature: signature(suffix), slot, blockTime, confirmationStatus: 'finalized', err });

function swap() {
  const entry = indexed('2', 17, at('2026-11-15T16:39:11Z'));
  const balance = (accountIndex, mint, amount) => ({ accountIndex, mint, owner: wallet, programId: token, uiTokenAmount: { amount, decimals: 6 } });
  const transfer = (authority, source, destination, mint, amount) => ({ programId: token, stackHeight: 2,
    parsed: { type: 'transferChecked', info: { authority, source, destination, mint, tokenAmount: { amount, decimals: 6 } } } });
  const tx = {
    slot: entry.slot, blockTime: entry.blockTime,
    transaction: { signatures: [entry.signature], message: {
      accountKeys: [wallet, 'fixture-input', cardsAccount, pool].map(pubkey => ({ pubkey, signer: pubkey === wallet })),
      instructions: [{ programId: 'fixture-compute' }, { programId: program,
        data: 'ASCsAbe1UnEyPuKEogMGVM37bqNkaEsv5m7ec29ssQkAwGHdqgJfyakY',
        accounts: [wallet, 'fixture-config', pool, 'fixture-input', cardsAccount, 'fixture-usdc-vault', 'fixture-cards-vault',
          'fixture-observation', token, 'fixture-token-extension', 'fixture-memo', usdc, cards] }],
    } },
    meta: { err: null,
      preTokenBalances: [balance(1, usdc, '23899373'), balance(2, cards, '7')],
      postTokenBalances: [balance(1, usdc, '3'), balance(2, cards, '142623244')],
      innerInstructions: [{ index: 1, instructions: [
        transfer(wallet, 'fixture-input', 'fixture-usdc-vault', usdc, '23899370'),
        transfer(pool, 'fixture-cards-vault', cardsAccount, cards, '142623237'),
      ] }],
    },
  };
  return [entry, tx];
}

test('binds a verified exact-input swap to its signature, instruction, classic SPL legs and wallet deltas', () => {
  const [entry, receipt] = swap();
  assert.deepEqual(classifyCollectorBuyback(entry, receipt), { status: 'verified', paidRaw: '23899370', receivedRaw: '142623237', instructionIndex: 1 });
  for (const alter of [
    tx => { tx.blockTime++; },
    tx => { tx.transaction.message.instructions[1].data = 'Nonsense'; },
    tx => { tx.transaction.message.instructions[1].programId = 'fixture-unknown-program'; },
    tx => { tx.meta.innerInstructions[0].instructions[1].parsed.info.authority = wallet; },
    tx => { tx.meta.innerInstructions[0].instructions[0].parsed.info.tokenAmount.decimals = 9; },
    tx => { tx.meta.postTokenBalances[1].uiTokenAmount.amount = '142623245'; },
    tx => { tx.meta.innerInstructions[0].instructions.push(tx.meta.innerInstructions[0].instructions[0]); },
  ]) {
    const invalid = structuredClone(receipt);
    alter(invalid);
    assert.equal(classifyCollectorBuyback(entry, invalid).status, 'unsupported');
  }
  assert.equal(classifyCollectorBuyback(entry, null).status, 'unavailable');
  receipt.transaction.message.accountKeys[0].signer = false;
  assert.equal(classifyCollectorBuyback(entry, receipt).status, 'excluded');
});

const clockStart = Date.parse('2027-01-01');

function cliFixture(t, replies) {
  const root = mkdtempSync(join(tmpdir(), 'collector-pulse-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const checkpoint = join(root, 'candidate.json');
  const fixtures = join(root, 'fixture.json');
  const events = join(root, 'events.jsonl');
  const clock = join(root, 'clock.mjs');
  const cli = fileURLToPath(new URL('./capture-collector-cards-buybacks.mjs', import.meta.url));
  writeFileSync(fixtures, JSON.stringify(replies));
  writeFileSync(clock, `import { appendFileSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import timers from 'node:timers/promises';
let clock = ${clockStart};
Date.now = () => clock;
timers.setTimeout = async (delay) => {
  appendFileSync(process.env.PULSE_CARDS_TEST_EVENTS, JSON.stringify({ delay }) + '\\n');
  clock += delay;
};
syncBuiltinESMExports();
`);
  writeFileSync(join(root, 'curl'), `#!${process.execPath}
const assert = require('node:assert/strict');
const { appendFileSync, readFileSync } = require('node:fs');
const fixture = JSON.parse(readFileSync(process.env.PULSE_CARDS_TEST_REPLIES, 'utf8'));
const checkpoint = JSON.parse(readFileSync(process.env.PULSE_CARDS_TEST_CHECKPOINT, 'utf8'));
const request = JSON.parse(process.argv[process.argv.indexOf('--data-binary') + 1]);
const calls = Array.isArray(request) ? request : [request];
assert.equal(process.argv.at(-1), 'https://api.mainnet-beta.solana.com');
appendFileSync(process.env.PULSE_CARDS_TEST_EVENTS, JSON.stringify({
  inFlight: checkpoint.inFlight, signatures: calls.filter(call => call.method === 'getTransaction').map(call => call.params[0]),
}) + '\\n');
const replies = calls.map(({ id, method, params }) => {
  const options = params[1];
  assert.equal(options.commitment, 'finalized');
  let result;
  if (method === 'getSignaturesForAddress') {
    assert.equal(params[0], '${wallet}');
    assert.equal(options.limit, 1000);
    const cursor = options.before ?? '';
    assert.ok(Object.hasOwn(fixture.pages, cursor));
    result = fixture.pages[cursor];
  } else {
    assert.equal(method, 'getTransaction');
    assert.equal(options.encoding, 'jsonParsed');
    assert.ok(Object.hasOwn(fixture.transactions, params[0]));
    result = fixture.transactions[params[0]];
  }
  return { jsonrpc: '2.0', id, result };
});
process.stdout.write(JSON.stringify(Array.isArray(request) ? replies : replies[0]) + '\\n200\\n');
`, { mode: 0o755 });
  return {
    read: () => readFileSync(checkpoint, 'utf8'),
    seed: state => writeFileSync(checkpoint, JSON.stringify(state)),
    run(to = '2026-11-16') {
      writeFileSync(events, '');
      const execution = spawnSync(process.execPath, ['--import', pathToFileURL(clock).href, cli, '--from', '2026-11-09', '--to', to,
        '--out', checkpoint, '--max-calls', '1'], { encoding: 'utf8', env: { ...process.env, PATH: `${root}:${process.env.PATH}`,
          PULSE_CARDS_TEST_REPLIES: fixtures, PULSE_CARDS_TEST_CHECKPOINT: checkpoint, PULSE_CARDS_TEST_EVENTS: events } });
      return { execution, events: readFileSync(events, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) };
    },
  };
}

function runStage(fixture) {
  const { execution, events } = fixture.run();
  assert.equal(execution.status, 0, execution.stderr);
  return { state: JSON.parse(fixture.read()), events };
}

test('CLI checkpoints both UTC bounds before counting receipts and resumes its exact scope', t => {
  const [entry, receipt] = swap();
  const upper = indexed('3', 18, at('2026-11-16'));
  const failed = indexed('4', 16, at('2026-11-09'), { InstructionError: [0, 'fixture'] });
  const lower = indexed('5', 15, at('2026-11-08T23:59:59Z'));
  const fixture = cliFixture(t, { pages: { '': [upper, entry], [entry.signature]: [failed, lower] }, transactions: { [entry.signature]: receipt } });
  const { state: first } = runStage(fixture);
  assert.ok(first.nextRequestAt > clockStart + 8000);
  assert.equal(first.summary.indexBracketed, false);
  assert.equal(first.summary.indexedSignatures, 2);
  assert.equal(first.summary.completeWithinScope, false);
  assert.deepEqual(first.results, []);
  const { inFlight, ...legacy } = first;
  assert.equal(inFlight, false);
  fixture.seed(legacy);
  const { state: second } = runStage(fixture);
  assert.equal(second.summary.indexBracketed, true);
  assert.equal(second.summary.indexedSignatures, 4);
  assert.equal(second.summary.counts.failed, 1);
  assert.equal(second.summary.counts.unchecked, 1);
  const { state: last } = runStage(fixture);
  assert.equal(last.summary.completeWithinScope, true);
  assert.deepEqual(last.summary.counts, { successful: 1, failed: 1, verified: 1, excluded: 0, unsupported: 0, unavailable: 0, unchecked: 0 });
  const [observed] = last.summary.receipts;
  assert.equal(observed.transaction, entry.signature);
  assert.equal(observed.eventIndex, null);
  assert.deepEqual(observed.paid, { asset: 'USDC', amount: 23.89937 });
  assert.deepEqual(observed.received, { asset: 'CARDS', amount: 142.623237 });
  const frozen = fixture.read();
  const { execution: wrongRange } = fixture.run('2026-11-15');
  assert.equal(wrongRange.status, 1);
  assert.match(wrongRange.stderr, /Checkpoint identity differs/);
  assert.equal(fixture.read(), frozen);
});

test('persistent missing receipts cannot starve later unattempted rows on restart', t => {
  const [entry, receipt] = swap();
  const upper = indexed('3', 24, at('2026-11-16'));
  const lower = indexed('4', 16, at('2026-11-08T23:59:59Z'));
  const missing = [...'56789A'].map((suffix, index) => indexed(suffix, 23 - index, entry.blockTime + 6 - index));
  const transactions = Object.fromEntries(missing.map(row => [row.signature, null]));
  transactions[entry.signature] = receipt;
  const fixture = cliFixture(t, { pages: { '': [upper, ...missing, entry, lower] }, transactions });
  runStage(fixture);
  const first = runStage(fixture);
  assert.equal(first.state.summary.counts.unavailable, 6);
  assert.equal(first.state.summary.counts.unchecked, 1);
  assert.equal(first.state.summary.completeWithinScope, false);
  const second = runStage(fixture);
  assert.equal(second.events.at(-1).signatures[0], entry.signature);
  assert.equal(second.state.summary.counts.unavailable, 6);
  assert.equal(second.state.summary.counts.unchecked, 0);
  assert.equal(second.state.summary.counts.verified, 1);
  assert.equal(second.state.summary.completeWithinScope, false);
  assert.deepEqual(second.state.summary.receipts.map(row => row.transaction), [entry.signature]);
});

test('an interrupted checkpoint waits a full fresh interval before sending another read', t => {
  const [entry, receipt] = swap();
  const upper = indexed('3', 18, at('2026-11-16'));
  const lower = indexed('4', 16, at('2026-11-08T23:59:59Z'));
  const fixture = cliFixture(t, { pages: { '': [upper, entry, lower] }, transactions: { [entry.signature]: receipt } });
  const { state: indexedState } = runStage(fixture);
  fixture.seed({ ...indexedState, nextRequestAt: clockStart - 1, inFlight: true });
  const { state, events } = runStage(fixture);
  assert.deepEqual(events, [{ delay: 10_100 }, { inFlight: true, signatures: [entry.signature] }]);
  assert.equal(state.inFlight, false);
  assert.equal(state.nextRequestAt, clockStart + 20_200);
  assert.equal(state.summary.completeWithinScope, true);
});
