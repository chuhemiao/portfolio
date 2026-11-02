import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_STORAGE_KEY, emptyLibraryState, emptyLibraryItem, decodeLibraryState, readLibraryState, writeLibraryState, updateLibraryLocalItem, libraryLocalItemVisible } from '../../src/lib/library/local-state.ts';

const id = `lib_${'a'.repeat(32)}`;
const other = `lib_${'b'.repeat(32)}`;
const old = `lib_${'c'.repeat(32)}`;
const valid = new Set([id, other]);
function storage() {
  const data = new Map([['theme', 'dark']]);
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}

test('corrupt data is rejected completely, independent of the position of the bad entry', () => {
  for (const entries of [[[id, { ...emptyLibraryItem(), saved: true }], [other, { saved: 'yes' }]], [[other, { saved: 'yes' }], [id, { ...emptyLibraryItem(), saved: true }]]]) {
    const result = decodeLibraryState(JSON.stringify({ version: 1, items: Object.fromEntries(entries) }), valid);
    assert.equal(result.status, 'corrupt');
    assert.deepEqual(result.state, emptyLibraryState(), 'a rejected document must not reveal an order-dependent saved subset');
  }
});

test('saved, later, read, hide, remove and reload use only versioned IDs and status fields', () => {
  const store = storage();
  let state = updateLibraryLocalItem(emptyLibraryState(), id, { saved: true, reading: 'later' }, valid);
  state = updateLibraryLocalItem(state, id, { reading: 'read', hidden: true }, valid);
  assert.equal(writeLibraryState(store, state), 'ok');
  assert.deepEqual(readLibraryState(store, valid).state, state);
  assert.deepEqual(Object.keys(JSON.parse(store.data.get(LIBRARY_STORAGE_KEY))).sort(), ['items', 'version']);
  assert.deepEqual(Object.keys(state.items[id]).sort(), ['hidden', 'reading', 'saved']);
  state = updateLibraryLocalItem(state, id, { saved: false, reading: null, hidden: false }, valid);
  assert.deepEqual(state, emptyLibraryState());
  assert.equal(writeLibraryState(store, state), 'ok');
  assert.equal(store.data.has(LIBRARY_STORAGE_KEY), false);
  assert.equal(store.data.get('theme'), 'dark', 'clear must preserve every other site namespace');
  assert.equal(updateLibraryLocalItem(state, old, { saved: true }, valid), state);
});

test('unknown schema, unexpected content, malformed JSON and oversize values have an empty fallback', () => {
  for (const raw of ['{', JSON.stringify({ version: 2, items: {} }), JSON.stringify({ version: 1, items: {}, q: 'private' }), JSON.stringify({ version: 1, items: { [id]: { ...emptyLibraryItem(), title: 'should not persist' } } }), ' '.repeat(128001)]) {
    assert.deepEqual(decodeLibraryState(raw, valid), { state: emptyLibraryState(), status: 'corrupt' });
  }
  assert.deepEqual(decodeLibraryState(null, valid), { state: emptyLibraryState(), status: 'ok' });
});

test('current public IDs reconcile single aliases and remove missing or split/withdrawn IDs', () => {
  const raw = JSON.stringify({ version: 1, items: { [id]: { ...emptyLibraryItem(), reading: 'read' }, [old]: { saved: true, reading: 'later', hidden: true } } });
  const migrated = decodeLibraryState(raw, valid, { [old]: { status: 'resolved', ids: [id] } });
  assert.equal(migrated.status, 'pruned');
  assert.deepEqual(migrated.state.items[id], { saved: true, reading: 'read', hidden: true });
  assert.deepEqual(Object.keys(migrated.state.items), [id]);
  for (const aliases of [{}, { [old]: { status: 'split', ids: [id, other] } }, { [old]: { status: 'resolved', ids: [old] } }]) {
    assert.equal(decodeLibraryState(raw, valid, aliases).state.items[old], undefined);
  }
});

test('disabled reads, quota writes and rejected clear report failure without claiming persistence', () => {
  const denied = { getItem() { throw new Error('Denied'); } };
  assert.equal(readLibraryState(denied, valid).status, 'unavailable');
  const store = storage();
  const saved = updateLibraryLocalItem(emptyLibraryState(), id, { saved: true }, valid);
  writeLibraryState(store, saved);
  const rejectClear = { ...store, removeItem() { throw new Error('Denied'); } };
  assert.equal(writeLibraryState(rejectClear, emptyLibraryState()), 'unavailable');
  assert.equal(readLibraryState(store, valid).state.items[id].saved, true, 'old durable data can return; UI must announce clear failure');
  const quota = { ...store, setItem() { const error = new Error('Full'); error.name = 'QuotaExceededError'; throw error; } };
  assert.equal(writeLibraryState(quota, saved), 'quota');
  assert.equal(store.data.get('theme'), 'dark');
});

test('row visibility closes saved/read/later/hidden removal transitions used by focus recovery', () => {
  const value = { saved: true, reading: 'later', hidden: false };
  assert.equal(libraryLocalItemVisible(undefined, 'all'), true);
  assert.equal(libraryLocalItemVisible(undefined, 'saved'), false);
  assert.equal(libraryLocalItemVisible(value, 'saved'), true);
  assert.equal(libraryLocalItemVisible({ ...value, saved: false }, 'saved'), false);
  assert.equal(libraryLocalItemVisible(value, 'later'), true);
  assert.equal(libraryLocalItemVisible({ ...value, reading: 'read' }, 'later'), false);
  assert.equal(libraryLocalItemVisible({ ...value, reading: 'read' }, 'read'), true);
  assert.equal(libraryLocalItemVisible({ ...value, hidden: true }, 'all'), false);
  assert.equal(libraryLocalItemVisible({ ...value, hidden: true }, 'saved'), false);
  assert.equal(libraryLocalItemVisible({ ...value, hidden: true }, 'hidden'), true);
  assert.equal(libraryLocalItemVisible(value, 'hidden'), false);
});
