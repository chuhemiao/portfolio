import type { Metadata } from 'next';
import { localizedDynamicMetadata, localizedPageMetadata } from '../localized-metadata';
import type { Locale } from '../i18n';
import type { LibraryPublicItem } from './types';

export function libraryIndexMetadata(locale: Locale): Metadata {
  return localizedPageMetadata('/library', locale, { referrer: 'no-referrer', robots: { index: false, follow: true, googleBot: { index: false, follow: true } } });
}

export function libraryItemMetadata(item: LibraryPublicItem, locale: Locale): Metadata {
  return localizedDynamicMetadata(`/library/items/${item.slug}`, locale, {
    title: [item.locales.en.title, item.locales['zh-CN'].title, item.locales.ja.title],
    description: [item.locales.en.description, item.locales['zh-CN'].description, item.locales.ja.description],
  }, { referrer: 'no-referrer', robots: { index: true, follow: true } });
}
