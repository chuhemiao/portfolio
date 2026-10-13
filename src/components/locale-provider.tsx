'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, getTranslator, localizeHref, type Locale } from '@/lib/i18n';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: getTranslator(locale), href: (url: string) => localizeHref(url, locale) };
}
