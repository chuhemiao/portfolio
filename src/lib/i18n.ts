export const LOCALES = ['zh-CN', 'en', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export const LANGUAGE_NAMES: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
  ja: '日本語',
};

export const OG_LOCALES: Record<Locale, string> = {
  'zh-CN': 'zh_CN', en: 'en_US', ja: 'ja_JP',
};

export function normalizeLocale(value: unknown): Locale | undefined {
  if (typeof value !== 'string') return undefined;
  if (value === 'zh' || value.toLowerCase() === 'zh-cn') return 'zh-CN';
  if (value === 'en' || value.toLowerCase() === 'en-us') return 'en';
  if (value === 'ja' || value.toLowerCase() === 'ja-jp') return 'ja';
  return undefined;
}

export function inferLocale(text: string): Locale {
  const japaneseText = /[\u3041-\u3096\u30a1-\u30fa]{2,}|[\u3400-\u9fff][\u3041-\u3096\u30a1-\u30fa]|[\u3041-\u3096\u30a1-\u30fa][\u3400-\u9fff]/.test(text);
  return japaneseText ? 'ja' : /[\u3400-\u9fff]/.test(text) ? 'zh-CN' : 'en';
}

export function getTranslator(locale: Locale) {
  return (en: string, zh: string, ja: string): string =>
    locale === 'zh-CN' ? zh : locale === 'ja' ? ja : en;
}

export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(zh-CN|en|ja)(?=\/|$)/, '') || '/';
}

export function localeFromPath(pathname: string): Locale | undefined {
  return normalizeLocale(pathname.split('/')[1]);
}

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  if (!match) return href;
  const pathname = stripLocale(match[1]);
  // Article slugs carry their own language; resolve them through getPostHref.
  if (/^\/blog\/.+/.test(pathname)) return href;
  const routes = /^\/(?:blog|topics(?:\/[^/]+)?|thoughts|research|fear|fund|oscillator|pulse|stack|watch)\/?$/;
  if (pathname !== '/' && !routes.test(pathname)) return href;
  return `/${locale}${pathname === '/' ? '' : pathname}${match[2]}`;
}

export function articleHref(slug: string, locale: Locale): string {
  return `/${locale}/blog/${encodeURIComponent(slug)}`;
}

export function formatLocaleDate(value: string | number | Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC', ...options });
}

export function categoryLabel(category: string, locale: Locale): string {
  const labels: Record<string, [string, string, string]> = {
    all: ['All', '全部', 'すべて'],
    thoughts: ['Thoughts', '思考', '考察'],
    research: ['Research', '研究', 'リサーチ'],
    tech: ['Tech', '技术', '技術'],
    ai: ['AI', 'AI', 'AI'],
    economics: ['Economics', '经济', '経済'],
    investing: ['Investing', '投资', '投資'],
    philosophy: ['Philosophy', '哲学', '哲学'],
    story: ['Story', '故事', 'ストーリー'],
  };
  const label = labels[category];
  return label ? getTranslator(locale)(...label) : category;
}
