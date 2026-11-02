import type { LibraryPublicAlias } from './types';

export const LIBRARY_STORAGE_KEY = 'kkdemian:library:v1';
const MAX_ENTRIES = 1000;
const MAX_BYTES = 128_000;
const ID = /^lib_[a-f0-9]{32}$/u;
export type LibraryReadingState = 'later' | 'read';
export type LibraryLocalView = 'all' | 'saved' | 'later' | 'read' | 'hidden';
export type LibraryLocalItem = { saved: boolean; reading: LibraryReadingState | null; hidden: boolean };
export type LibraryLocalState = { version: 1; items: Record<string, LibraryLocalItem> };
export type LibraryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type LibraryStorageStatus = 'ok' | 'corrupt' | 'unavailable' | 'quota' | 'pruned';
export const emptyLibraryState = (): LibraryLocalState => ({ version: 1, items: {} });
export const emptyLibraryItem = (): LibraryLocalItem => ({ saved: false, reading: null, hidden: false });

export function decodeLibraryState(raw: string | null, validIds: ReadonlySet<string>, aliases: Record<string, LibraryPublicAlias> = {}) {
  const state = emptyLibraryState();
  if (raw === null) return { state, status: 'ok' as LibraryStorageStatus };
  try {
    if (raw.length > MAX_BYTES) throw new Error('Too large');
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || Object.keys(parsed).some(key => !['version', 'items'].includes(key)) || !parsed.items || typeof parsed.items !== 'object' || Array.isArray(parsed.items)) throw new Error('Invalid version');
    const entries = Object.entries(parsed.items);
    if (entries.length > MAX_ENTRIES) throw new Error('Too many IDs');
    let pruned = false;
    for (const [id, entry] of entries) {
      const value = entry as LibraryLocalItem;
      if (!ID.test(id) || !value || Object.keys(value).some(key => !['saved', 'reading', 'hidden'].includes(key)) || typeof value.saved !== 'boolean' || typeof value.hidden !== 'boolean' || ![null, 'later', 'read'].includes(value.reading)) throw new Error('Invalid item state');
      const alias = aliases[id];
      const target = validIds.has(id) ? id : alias?.status === 'resolved' && alias.ids.length === 1 && validIds.has(alias.ids[0]) ? alias.ids[0] : null;
      if (target !== id) pruned = true;
      if (!target || !(value.saved || value.reading || value.hidden)) continue;
      const previous = state.items[target];
      state.items[target] = previous ? { saved: previous.saved || value.saved, hidden: previous.hidden || value.hidden, reading: previous.reading === 'read' || value.reading === 'read' ? 'read' : previous.reading ?? value.reading } : { saved: value.saved, reading: value.reading, hidden: value.hidden };
    }
    return { state, status: (pruned ? 'pruned' : 'ok') as LibraryStorageStatus };
  } catch { return { state: emptyLibraryState(), status: 'corrupt' as LibraryStorageStatus }; }
}

export function readLibraryState(storage: LibraryStorage, validIds: ReadonlySet<string>, aliases: Record<string, LibraryPublicAlias> = {}) {
  try { return decodeLibraryState(storage.getItem(LIBRARY_STORAGE_KEY), validIds, aliases); }
  catch { return { state: emptyLibraryState(), status: 'unavailable' as LibraryStorageStatus }; }
}

export function writeLibraryState(storage: LibraryStorage, state: LibraryLocalState): LibraryStorageStatus {
  try {
    const raw = JSON.stringify(state);
    if (raw.length > MAX_BYTES || Object.keys(state.items).length > MAX_ENTRIES) return 'quota';
    if (Object.keys(state.items).length) storage.setItem(LIBRARY_STORAGE_KEY, raw);
    else storage.removeItem(LIBRARY_STORAGE_KEY);
    return 'ok';
  } catch (error) { return error instanceof Error && error.name === 'QuotaExceededError' ? 'quota' : 'unavailable'; }
}

export function updateLibraryLocalItem(state: LibraryLocalState, id: string, patch: Partial<LibraryLocalItem>, validIds: ReadonlySet<string>) {
  if (!validIds.has(id) || !ID.test(id)) return state;
  const value = { ...emptyLibraryItem(), ...state.items[id], ...patch };
  const items = { ...state.items };
  if (value.saved || value.reading || value.hidden) items[id] = value;
  else delete items[id];
  return { version: 1 as const, items };
}

export function libraryLocalItemVisible(item: LibraryLocalItem | undefined, view: LibraryLocalView) {
  if (view === 'hidden') return Boolean(item?.hidden);
  if (item?.hidden) return false;
  return view === 'all' || (view === 'saved' ? Boolean(item?.saved) : item?.reading === view);
}
