// Translations for the Telegram messages are written locally, by whoever next
// works on content, not by an API call in CI.
//
//   pnpm translate:thoughts                      list messages without a current translation
//   pnpm translate:thoughts -- --apply new.json  merge { "<id>": { "en": "...", "ja": "..." } }
//
// "zh-CN" may be left out when the source is already Simplified Chinese.
// Entries are bound to the exact source text, so an edited message shows up
// as pending again.
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const THOUGHTS = path.join(ROOT, 'content/thoughts.json');
const TRANSLATIONS = path.join(ROOT, 'content/thought-translations.json');
const LOCALES = ['zh-CN', 'en', 'ja'];

const urlsIn = (value) => (value.match(/https?:\/\/[^\s)]+/g) ?? []).sort();
const hasKana = (value) => /[぀-ヿ]/.test(value);
const hasHan = (value) => /[一-鿿]/.test(value);

function validate(entry, source) {
  for (const locale of LOCALES) {
    const text = entry[locale];
    if (typeof text !== 'string' || !text.trim()) return `${locale} is empty`;
    const got = urlsIn(text);
    const want = urlsIn(source);
    if (got.length !== want.length || got.some((url, i) => url !== want[i])) {
      return `${locale} changed the URLs (${want.join(', ') || 'none'} -> ${got.join(', ') || 'none'})`;
    }
  }
  return null;
}

async function main() {
  const { thoughts } = JSON.parse(await fs.readFile(THOUGHTS, 'utf8'));
  const translations = JSON.parse(await fs.readFile(TRANSLATIONS, 'utf8'));
  const byId = new Map(thoughts.map((thought) => [thought.id, thought]));

  const applyAt = process.argv.indexOf('--apply');
  if (applyAt !== -1) {
    const incoming = JSON.parse(await fs.readFile(process.argv[applyAt + 1], 'utf8'));
    const problems = [];
    for (const [id, given] of Object.entries(incoming)) {
      const source = byId.get(id)?.text;
      if (!source?.trim()) {
        problems.push(`${id}: no message with text`);
        continue;
      }
      const zh = given['zh-CN'] ?? (hasHan(source) && !hasKana(source) ? source : undefined);
      const entry = { source, 'zh-CN': zh, en: given.en, ja: given.ja };
      const problem = validate(entry, source);
      if (problem) problems.push(`${id}: ${problem}`);
      else translations[id] = entry;
    }
    if (problems.length) {
      console.error(`translate-thoughts: nothing written.\n  ${problems.join('\n  ')}`);
      process.exit(1);
    }
    const ordered = Object.fromEntries(
      Object.keys(translations)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => [key, translations[key]])
    );
    await fs.writeFile(TRANSLATIONS, `${JSON.stringify(ordered, null, 2)}\n`);
    console.log(`translate-thoughts: wrote ${Object.keys(incoming).length}.`);
  }

  // A photo posted with no caption has nothing to translate.
  const pending = thoughts.filter((thought) => thought.text.trim() && translations[thought.id]?.source !== thought.text);
  if (pending.length === 0) {
    console.log('translate-thoughts: every message is translated.');
    return;
  }
  console.log(`translate-thoughts: ${pending.length} pending.`);
  for (const thought of pending) {
    console.log(`\n#${thought.id}  ${thought.date.slice(0, 10)}${translations[thought.id] ? '  (source edited)' : ''}\n${thought.text}`);
  }
}

main().catch((error) => {
  console.error('translate-thoughts failed:', error);
  process.exit(1);
});
