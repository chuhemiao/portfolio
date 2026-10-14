import resources from '../data/weekly-research-localizations.json' with { type: 'json' };
import type { WeeklyReport } from '../data/weekly-research.ts';
import { inferLocale, type Locale } from './i18n';

type WeeklyTranslations = Record<string, { source: WeeklyReport; translations: Record<Locale, WeeklyReport> }>;

function completeShape(source: unknown, translated: unknown): boolean {
  if (typeof source === 'string') return typeof translated === 'string' && translated.trim().length > 0;
  if (Array.isArray(source)) return Array.isArray(translated) && source.length === translated.length && source.every((value, index) => completeShape(value, translated[index]));
  if (source && typeof source === 'object') {
    if (!translated || typeof translated !== 'object' || Array.isArray(translated)) return false;
    const values = translated as Record<string, unknown>;
    return Object.keys(source).length === Object.keys(values).length && Object.entries(source).every(([key, value]) => completeShape(value, values[key]));
  }
  return source === translated;
}

export function getLocalizedWeeklyReport(report: WeeklyReport, locale: Locale, translations: WeeklyTranslations = resources) {
  const entry = translations[report.id];
  const localized = entry?.translations[locale];
  const valid = entry && JSON.stringify(entry.source) === JSON.stringify(report) && localized &&
    localized.id === report.id && localized.generatedAt === report.generatedAt && completeShape(report, localized);
  const selected = valid ? localized : report;
  const language = valid ? locale : inferLocale(JSON.stringify(report));
  return { report: structuredClone(selected), language, fallbackOriginal: !valid && language !== locale };
}
