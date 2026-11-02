import { getTranslator, type Locale } from '../i18n';
import type { LibraryKind, LibraryPublicItem } from './types';

export function libraryItemHref(slug: string, locale: Locale) {
  return `/${locale}/library/items/${encodeURIComponent(slug)}`;
}

export function libraryKindLabel(kind: LibraryKind, locale: Locale) {
  const labels: Record<LibraryKind, [string, string, string]> = {
    spec: ['Specification', '规范', '仕様'], paper: ['Paper', '论文', '論文'],
    book: ['Book', '书籍', '書籍'], article: ['Article', '文章', '記事'], video: ['Video', '视频', '動画'],
  };
  return getTranslator(locale)(...labels[kind]);
}

export function libraryLevelLabel(level: string, locale: Locale) {
  const labels: Record<string, [string, string, string]> = {
    beginner: ['Beginner', '入门', '入門'], intermediate: ['Intermediate', '进阶', '中級'],
    advanced: ['Advanced', '高阶', '上級'], unknown: ['Unspecified', '未标注', '未指定'],
  };
  return getTranslator(locale)(...(labels[level] ?? labels.unknown));
}

export function libraryLanguageLabel(language: string, locale: Locale) {
  const labels: Record<string, [string, string, string]> = {
    en: ['English', '英语', '英語'], 'zh-CN': ['Chinese', '中文', '中国語'],
    ja: ['Japanese', '日语', '日本語'], und: ['Unspecified', '未标注', '未指定'],
  };
  return labels[language] ? getTranslator(locale)(...labels[language]) : language;
}

export function libraryPublicationDate(item: Pick<LibraryPublicItem, 'original_published_at' | 'date_precision'>, locale: Locale) {
  if (!item.original_published_at || item.date_precision === 'unknown') return getTranslator(locale)('Publication date unknown', '出版日期未知', '公開日不明');
  const value = item.original_published_at;
  if (item.date_precision === 'year') return value.slice(0, 4);
  const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC', year: 'numeric', month: 'short', ...(item.date_precision === 'day' ? { day: 'numeric' } : {}) };
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function libraryValidityLabel(status: LibraryPublicItem['validity_status'], locale: Locale) {
  const labels: Record<typeof status, [string, string, string]> = {
    current: ['Current', '现行版本', '現行版'], historical: ['Historical reference', '历史资料', '過去の資料'],
    superseded: ['Superseded', '已有后续版本', '後継版あり'], disputed: ['Disputed', '存在争议', '議論あり'], unknown: ['Validity not assessed', '时效未评估', '現行性は未評価'],
  };
  return getTranslator(locale)(...labels[status]);
}
