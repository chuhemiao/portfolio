'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import { useI18n } from '@/components/locale-provider';
import { LANGUAGE_NAMES, LOCALES, localizeHref, stripLocale, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const [translations, setTranslations] = useState<Partial<Record<Locale, string>>>({});

  useEffect(() => {
    const links: Partial<Record<Locale, string>> = {};
    for (const language of LOCALES) {
      const link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${language}"]`);
      if (link) {
        const url = new URL(link.href);
        links[language] = url.pathname;
      }
    }
    setTranslations(links);
  }, [pathname]);

  return <LanguageNavigation pathname={pathname} translations={translations} />;
}

export function LanguageSwitcherFallback() {
  return <LanguageNavigation pathname={usePathname()} translations={{}} />;
}

function LanguageNavigation({ pathname, translations }: { pathname: string; translations: Partial<Record<Locale, string>> }) {
  const { locale, t } = useI18n();
  const article = /^\/blog\/.+/.test(stripLocale(pathname));

  return (
    <nav aria-label={t('Site language', '网站语言', 'サイトの言語')} className="relative z-40 mx-auto flex w-full max-w-6xl justify-end px-4 pt-3 sm:px-6 lg:px-8">
      <div className="relative inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/90 pl-3 pr-2 shadow-sm">
        <LanguagesIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
        <select
          aria-label={t('Site language', '网站语言', 'サイトの言語')}
          value={locale}
          onChange={(event) => {
            const language = event.target.value as Locale;
            const target = article
              ? translations[language] ?? `/${language}/blog`
              : localizeHref(pathname, language);
            window.location.assign(target + window.location.search + window.location.hash);
          }}
          className="w-24 cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-1 pr-6 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {LOCALES.map((language) => (
            <option key={language} value={language} lang={language} className="bg-background text-foreground">
              {LANGUAGE_NAMES[language]}{article && language !== locale && !translations[language] ? ` (${t('Browse articles', '浏览文章', '記事一覧')})` : ''}
            </option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute right-3 size-3 text-muted-foreground" />
      </div>
    </nav>
  );
}
