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
    <nav aria-label={t('Site language', '网站语言', 'サイトの言語')} className="shrink-0">
      <div className="relative inline-flex h-[34px] items-center gap-1 rounded border border-border pl-2.5 pr-1 transition-colors hover:border-border-strong">
        <LanguagesIcon aria-hidden="true" className="size-3.5 text-subtle" />
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
          className="w-[5.75rem] cursor-pointer appearance-none bg-transparent py-1.5 pl-1 pr-5 font-mono text-[12px] text-muted-foreground outline-none"
        >
          {LOCALES.map((language) => (
            <option key={language} value={language} lang={language} className="bg-background text-foreground">
              {LANGUAGE_NAMES[language]}{article && language !== locale && !translations[language] ? ` (${t('Browse articles', '浏览文章', '記事一覧')})` : ''}
            </option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute right-2 size-3 text-subtle" />
      </div>
    </nav>
  );
}
