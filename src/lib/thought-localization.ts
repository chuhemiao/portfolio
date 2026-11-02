import { inferLocale, type Locale } from './i18n';

export interface ThoughtImage {
  src: string;
  width: number;
  height: number;
}

export interface Thought {
  id: string;
  text: string;
  date: string;
  timestamp: number;
  images?: ThoughtImage[];
}

export type ThoughtTranslations = Record<string, { source: string } & Record<Locale, string>>;

export function localizeThought(thought: Thought, locale: Locale, translations: ThoughtTranslations) {
  // A photo with no caption has nothing to translate, so it must never be
  // shown as "translation pending".
  if (!thought.text.trim()) return { ...thought, language: locale, fallbackOriginal: false };

  const entry = translations[thought.id];
  const text = entry?.source === thought.text && typeof entry[locale] === 'string' && entry[locale].trim()
    ? entry[locale]
    : thought.text;
  const language = text === thought.text ? inferLocale(thought.text) : locale;
  return { ...thought, text, language, fallbackOriginal: language !== locale && text === thought.text };
}
