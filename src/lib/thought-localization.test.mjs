import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, next) { return next(specifier === './i18n' ? './i18n.ts' : specifier, context); } });
const { localizeThought } = await import('./thought-localization.ts');

const originals = JSON.parse(fs.readFileSync(new URL('../../content/thoughts.json', import.meta.url))).thoughts;
const translations = JSON.parse(fs.readFileSync(new URL('../../content/thought-translations.json', import.meta.url)));
const locales = ['zh-CN', 'en', 'ja'];

// The count used to be asserted as a literal, so every Telegram sync broke this
// test whether or not the new messages were translated. What matters is the
// invariant: each message has a complete translation bound to its exact source.
test('every source message has a source-bound full translation in each locale', () => {
  assert.ok(originals.length > 0, 'no source messages loaded');
  for (const thought of originals) {
    // A photo posted with no caption has nothing to translate. It still has to
    // carry an image, or the sync produced an empty message.
    if (!thought.text.trim()) {
      assert.ok(thought.images?.length, `${thought.id} has neither text nor images`);
      continue;
    }
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
    if (!thought.text.trim()) continue;
    for (const locale of locales) assert.deepEqual(urls(translations[thought.id][locale]), urls(thought.text), `${thought.id}: ${locale}`);
  }
});

// Photo messages carry `caption`, not `text`, so the sync used to drop them
// whole. Now they arrive with images, and a caption-less one has nothing to
// translate — it must not be labelled as awaiting a translation.
test('a photo with no caption is not waiting for a translation', () => {
  const photo = { id: 'photo-only', text: '', date: '2026-11-02', timestamp: 1, images: [{ src: '/thoughts/1.jpg', width: 1200, height: 800 }] };
  for (const locale of locales) {
    const selected = localizeThought(photo, locale, translations);
    assert.equal(selected.fallbackOriginal, false, locale);
    assert.equal(selected.language, locale, locale);
    assert.deepEqual(selected.images, photo.images, locale);
  }
});

test('a captioned photo is translated like any other message, images intact', () => {
  const images = [{ src: '/thoughts/2-1.jpg', width: 900, height: 600 }, { src: '/thoughts/2-2.jpg', width: 900, height: 600 }];
  const captioned = { id: 'captioned', text: 'A caption\nhttps://example.com', date: '2026-11-02', timestamp: 2, images };
  const entry = { captioned: { source: captioned.text, en: captioned.text, ja: '\u30ad\u30e3\u30d7\u30b7\u30e7\u30f3\nhttps://example.com', 'zh-CN': '\u914d\u6587\nhttps://example.com' } };
  const selected = localizeThought(captioned, 'ja', entry);
  assert.equal(selected.text, entry.captioned.ja);
  assert.equal(selected.fallbackOriginal, false);
  assert.deepEqual(selected.images, images);
});
