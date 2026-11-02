'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getTranslator, type Locale } from '@/lib/i18n';
import { LIBRARY_STORAGE_KEY, emptyLibraryItem, emptyLibraryState, libraryLocalItemVisible, readLibraryState, updateLibraryLocalItem, writeLibraryState, type LibraryLocalItem, type LibraryLocalState, type LibraryLocalView, type LibraryStorageStatus } from '@/lib/library/local-state';
import type { LibraryPublicAlias } from '@/lib/library/types';

type LocalContext = { state: LibraryLocalState; ready: boolean; update: (id: string, patch: Partial<LibraryLocalItem>, message: string) => void; clear: () => void };
const Context = createContext<LocalContext | null>(null);

export function LibraryLocalProvider({ ids, aliases, locale, children }: { ids: string[]; aliases: Record<string, LibraryPublicAlias>; locale: Locale; children: React.ReactNode }) {
  const [state, setState] = useState(emptyLibraryState);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<LibraryStorageStatus>('ok');
  const [message, setMessage] = useState('');
  const current = useRef(state);
  const validIds = useMemo(() => new Set(ids), [ids]);
  const t = getTranslator(locale);
  useEffect(() => {
    const restore = () => {
      try {
        const restored = readLibraryState(window.localStorage, validIds, aliases);
        if (restored.status !== 'unavailable') { current.current = restored.state; setState(restored.state); }
        setStatus(restored.status);
        if (restored.status === 'pruned') {
          const written = writeLibraryState(window.localStorage, restored.state);
          if (written !== 'ok') setStatus(written);
        }
      } catch { setStatus('unavailable'); }
      setReady(true);
    };
    const sync = (event: StorageEvent) => { if (event.key === LIBRARY_STORAGE_KEY || event.key === null) restore(); };
    restore();
    window.addEventListener('storage', sync);
    window.addEventListener('pageshow', restore);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('pageshow', restore); };
  }, [validIds, aliases]);

  const persist = (next: LibraryLocalState, announcement: string) => {
    current.current = next; setState(next);
    let written: LibraryStorageStatus;
    try { written = writeLibraryState(window.localStorage, next); } catch { written = 'unavailable'; }
    setStatus(written);
    setMessage(written === 'ok' ? announcement : t('Applied to this page only. Browser storage was not updated; previously stored data may return after refresh.', '操作仅在当前页面生效。浏览器存储未更新，旧数据可能在刷新后恢复。', 'このページにのみ反映しました。ブラウザの保存領域は更新できず、再読み込み後に以前のデータが戻る場合があります。'));
  };
  const value = {
    state, ready,
    update: (id: string, patch: Partial<LibraryLocalItem>, announcement: string) => persist(updateLibraryLocalItem(current.current, id, patch, validIds), announcement),
    clear: () => persist(emptyLibraryState(), t('Local reading data cleared.', '已清空本地阅读状态。', 'このライブラリの読書データを消去しました。')),
  };
  const notices: Record<LibraryStorageStatus, string> = {
    ok: '',
    corrupt: t('Stored reading data could not be read and was ignored. New changes will replace this Library data only.', '已忽略损坏或不兼容的阅读数据。下一次操作只会替换本资料库的数据。', '保存済みの読書データが破損しているか非対応のため無視しました。次の操作でこのライブラリのデータだけを置き換えます。'),
    unavailable: t('Browser storage is unavailable. Changes work in this page only. Previously stored data may return after refresh; retry clearing when storage is available.', '浏览器存储不可用，操作仅在当前页面生效。旧数据可能在刷新后恢复，存储恢复后可重试清空。', 'ブラウザの保存領域を利用できず、このページにのみ反映しています。再読み込み後に以前のデータが戻る場合があります。保存領域が使える状態で消去を再試行できます。'),
    quota: t('Browser storage is full. Changes were not saved; previously stored data may return after refresh.', '浏览器存储已满，最新操作未持久保存。旧数据可能在刷新后恢复。', 'ブラウザの保存領域がいっぱいで、変更を保存できません。再読み込み後に以前のデータが戻る場合があります。'),
    pruned: t('Removed or replaced resource IDs were reconciled with the current Library.', '已按当前资料库更新被替换的资源，并清理失效或撤稿 ID。', '現在のライブラリに合わせて、置換された資料を更新し、無効・取り下げ済みの ID を整理しました。'),
  };
  return <Context.Provider value={value}>
    {status !== 'ok' && <div className="mb-4 border border-border bg-surface p-3 text-sm leading-6 text-muted-foreground"><p role="status">{notices[status]}</p>{(status === 'unavailable' || status === 'quota') && <button type="button" onClick={value.clear} className="mt-2 py-2 text-xs text-brand">{t('Retry clearing local reading data', '重试清空本地阅读状态', '読書データの消去を再試行')}</button>}</div>}
    <p className="sr-only" role="status" aria-live="polite">{message}</p>
    {children}
  </Context.Provider>;
}

export function useLibraryLocalState() {
  const context = useContext(Context);
  if (!context) throw new Error('Library local controls require their feature provider.');
  return context;
}

export function LibraryItemActions({ id, title, locale, compact = false, view, onDisappear }: { id: string; title: string; locale: Locale; compact?: boolean; view?: LibraryLocalView; onDisappear?: () => void }) {
  const { state, ready, update } = useLibraryLocalState();
  const item = state.items[id] ?? emptyLibraryItem();
  const t = getTranslator(locale);
  const save = item.saved ? t('Remove saved', '取消保存', '保存を解除') : t('Save', '保存', '保存');
  const change = (patch: Partial<LibraryLocalItem>, announcement: string) => {
    update(id, patch, announcement);
    if (view && !libraryLocalItemVisible({ ...item, ...patch }, view)) onDisappear?.();
  };
  return <div className="flex flex-wrap items-center gap-2 text-xs">
    <button type="button" disabled={!ready} aria-pressed={item.saved} aria-label={`${save}: ${title}`} onClick={() => change({ saved: !item.saved }, item.saved ? t('Removed from saved.', '已取消保存。', '保存を解除しました。') : t('Saved in this browser.', '已保存到此浏览器。', 'このブラウザに保存しました。'))} className="rounded-sm border border-border px-2.5 py-2 text-muted-foreground hover:border-brand hover:text-brand disabled:opacity-50">{item.saved ? '✓ ' : '+ '}{save}</button>
    <label className={compact ? 'sr-only' : 'text-muted-foreground'} htmlFor={`reading-${id}`}>{t('Reading status', '阅读状态', '読書状況')}</label>
    <select id={`reading-${id}`} aria-label={`${t('Reading status', '阅读状态', '読書状況')}: ${title}`} disabled={!ready} value={item.reading ?? ''} onChange={event => change({ reading: (event.target.value || null) as LibraryLocalItem['reading'] }, t('Reading status updated.', '已更新阅读状态。', '読書状況を更新しました。'))} className="min-w-0 rounded-sm border border-border bg-background px-2 py-2 text-muted-foreground disabled:opacity-50">
      <option value="">{t('Unmarked', '未标记', '未設定')}</option><option value="later">{t('Read later', '稍后阅读', 'あとで読む')}</option><option value="read">{t('Read', '已读', '既読')}</option>
    </select>
    <button type="button" disabled={!ready} aria-pressed={item.hidden} aria-label={`${item.hidden ? t('Unhide', '取消隐藏', '非表示を解除') : t('Hide', '隐藏', '非表示')}: ${title}`} onClick={() => change({ hidden: !item.hidden }, item.hidden ? t('Resource is visible again.', '资源已恢复显示。', '資料を再表示しました。') : t('Hidden. Use the Hidden view to restore it.', '已隐藏，可在“已隐藏”视图恢复。', '非表示にしました。「非表示」の一覧から戻せます。'))} className="rounded-sm px-2 py-2 text-subtle hover:text-foreground disabled:opacity-50">{item.hidden ? t('Unhide', '取消隐藏', '再表示') : t('Hide', '隐藏', '非表示')}</button>
  </div>;
}
