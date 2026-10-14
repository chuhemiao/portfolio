import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, next) { return next(specifier === './i18n' ? './i18n.ts' : specifier, context); } });
const { localizeThought } = await import('./thought-localization.ts');

const originals = JSON.parse(fs.readFileSync(new URL('../../content/thoughts.json', import.meta.url))).thoughts;
const translations = JSON.parse(fs.readFileSync(new URL('../../content/thought-translations.json', import.meta.url)));
const locales = ['zh-CN', 'en', 'ja'];

test('all 123 source messages have source-bound full translations in each locale', () => {
  assert.equal(originals.length, 123);
  for (const thought of originals) {
    assert.equal(translations[thought.id]?.source, thought.text, thought.id);
    for (const locale of locales) {
      const selected = localizeThought(thought, locale, translations);
      assert.equal(selected.text, translations[thought.id][locale], `${thought.id}: ${locale}`);
      assert.equal(selected.fallbackOriginal, false, `${thought.id}: ${locale}`);
      assert.equal(selected.date, thought.date);
      assert.equal(selected.timestamp, thought.timestamp);
    }
  }
});

test('new and edited source messages remain original with their actual language', () => {
  const fresh = { id: 'future-message', text: '新消息\nhttps://example.com/a?q=1#x', date: '2026-10-13', timestamp: 1 };
  const selected = localizeThought(fresh, 'ja', translations);
  assert.equal(selected.text, fresh.text);
  assert.equal(selected.language, 'zh-CN');
  assert.equal(selected.fallbackOriginal, true);
  assert.equal(localizeThought(fresh, 'zh-CN', translations).fallbackOriginal, false);
  const stale = { ...originals[0], text: `${originals[0].text}\nUpdated source` };
  assert.equal(localizeThought(stale, 'ja', translations).text, stale.text);
  assert.equal(localizeThought(stale, 'ja', translations).fallbackOriginal, true);
});

test('blank or absent translation cannot hide the source or mutate messages', () => {
  const original = Object.freeze({ id: 'x', text: 'A source message\nhttps://example.com', date: '2026-10-13', timestamp: 123 });
  const empty = { x: { source: original.text, en: original.text, ja: '', 'zh-CN': '  ' } };
  for (const locale of ['ja', 'zh-CN']) {
    const selected = localizeThought(original, locale, empty);
    assert.equal(selected.text, original.text);
    assert.equal(selected.language, 'en');
    assert.equal(selected.fallbackOriginal, true);
    selected.text = 'Changed result';
    assert.equal(original.text, 'A source message\nhttps://example.com');
  }
});

test('full translations preserve every message URL', () => {
  const urls = (value) => (value.match(/https?:\/\/[^\s)]+/g) ?? []).sort();
  for (const thought of originals) {
    for (const locale of locales) assert.deepEqual(urls(translations[thought.id][locale]), urls(thought.text), `${thought.id}: ${locale}`);
  }
});
