// Fills content/thought-translations.json for any Telegram message that has no
// translation yet, or whose source text changed since it was translated.
//
// The sync workflow used to add messages and stop there, so translations were
// only ever filled in by hand and drifted: six messages sat untranslated for
// ten days, and nothing surfaced it because CI ran one test file out of
// sixteen. This runs right after the sync, before the commit.
//
//   node scripts/translate-thoughts.mjs            fill the gaps
//   node scripts/translate-thoughts.mjs --dry-run  list them, call nothing
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const THOUGHTS = path.join(ROOT, 'content/thoughts.json');
const TRANSLATIONS = path.join(ROOT, 'content/thought-translations.json');
const LOCALES = ['zh-CN', 'en', 'ja'];
const MODEL = 'claude-sonnet-5-5';

const urlsIn = (value) => (value.match(/https?:\/\/[^\s)]+/g) ?? []).sort();

const SYSTEM = `You translate short personal posts from a crypto and indie-hacker Telegram channel.

Return ONLY a JSON object with exactly the keys "zh-CN", "en" and "ja". No prose, no code fence.

Rules:
- Translate the meaning, not word by word. These are casual personal notes; keep that register rather than making them formal.
- Every URL must appear in every translation exactly as written in the source, character for character. Never add, drop, shorten or reword a URL.
- Keep line breaks, bullet markers and emoji as they are in the source.
- Markdown links stay as [text](url): translate the text, leave the url untouched.
- Leave tickers, protocol names, company names and code identifiers in their original form.
- For "zh-CN": if the source is already Simplified Chinese, return it unchanged. If it is Traditional Chinese, convert it to Simplified. Otherwise translate into Simplified Chinese.
- Do not explain, annotate or add anything the source does not say.`;

function validate(result, source) {
  if (!result || typeof result !== 'object') return 'not an object';
  for (const locale of LOCALES) {
    const text = result[locale];
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
  const dryRun = process.argv.includes('--dry-run');
  const { thoughts } = JSON.parse(await fs.readFile(THOUGHTS, 'utf8'));
  const translations = JSON.parse(await fs.readFile(TRANSLATIONS, 'utf8'));

  // Missing, or translated from text that has since been edited.
  const pending = thoughts.filter((thought) => translations[thought.id]?.source !== thought.text);

  if (pending.length === 0) {
    console.log(`translate-thoughts: all ${thoughts.length} messages are translated.`);
    return;
  }

  console.log(`translate-thoughts: ${pending.length} of ${thoughts.length} need translating.`);
  for (const thought of pending) {
    console.log(`  ${thought.id}  ${thought.date?.slice(0, 10) ?? ''}  ${thought.text.slice(0, 60).replace(/\n/g, ' ')}`);
  }

  if (dryRun) return;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('translate-thoughts: ANTHROPIC_API_KEY is not set, so these would stay untranslated.');
    process.exit(1);
  }

  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch {
    console.error('translate-thoughts: @anthropic-ai/sdk is not installed.');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const failures = [];
  let written = 0;

  for (const thought of pending) {
    let parsed;
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM,
        messages: [{ role: 'user', content: thought.text }],
      });
      const text = message.content.find((block) => block.type === 'text')?.text ?? '';
      parsed = JSON.parse(text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim());
    } catch (error) {
      failures.push(`${thought.id}: ${String(error).slice(0, 120)}`);
      continue;
    }

    // The same invariant the test asserts, checked before anything is written:
    // a bad translation should not land in the file at all.
    const problem = validate(parsed, thought.text);
    if (problem) {
      failures.push(`${thought.id}: ${problem}`);
      continue;
    }

    translations[thought.id] = {
      source: thought.text,
      'zh-CN': parsed['zh-CN'],
      en: parsed.en,
      ja: parsed.ja,
    };
    written += 1;
  }

  if (written > 0) {
    const ordered = Object.fromEntries(
      Object.keys(translations)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => [key, translations[key]])
    );
    await fs.writeFile(TRANSLATIONS, `${JSON.stringify(ordered, null, 2)}\n`);
  }

  console.log(`translate-thoughts: wrote ${written}, failed ${failures.length}.`);
  for (const failure of failures) console.error(`  ${failure}`);
  if (failures.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error('translate-thoughts failed:', error);
  process.exit(1);
});
