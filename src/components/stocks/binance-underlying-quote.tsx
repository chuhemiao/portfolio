'use client';

import { useState } from 'react';
import { getTranslator, type Locale } from '@/lib/i18n';

const WIDGET_SCRIPT = 'https://public.bnbstatic.com/unpkg/growth-external-widget/stock-widget@0.0.1.min.js';

export function BinanceUnderlyingQuote({ symbol, locale }: { symbol: string; locale: Locale }) {
  const [loaded, setLoaded] = useState(false);
  const t = getTranslator(locale);
  if (symbol.length > 10 || !/^[A-Z0-9]+(?:\.[A-Z0-9]+)?$/.test(symbol)) return null;
  return (
    <details className='border border-border bg-surface' onToggle={(event) => {
      if (event.currentTarget.open) setLoaded(true);
    }}>
      <summary className='cursor-pointer px-4 py-3 text-sm font-medium'>
        {t('Open Binance underlying quote', '展开 Binance 原资产报价', 'Binance の原資産価格を表示')}
      </summary>
      {loaded ? <iframe
        title={t(`${symbol} underlying quote from Binance`, `Binance 提供的 ${symbol} 原资产报价`, `Binance が提供する ${symbol} の原資産価格`)}
        sandbox='allow-scripts'
        referrerPolicy='no-referrer'
        height={128}
        className='block h-32 w-full border-0'
        srcDoc={`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><style>html,body{margin:0}binance-stock-widget{display:block}</style><script defer src="${WIDGET_SCRIPT}"></script></head><body><binance-stock-widget symbol="${symbol}" theme="light" layout="banner" transparent="false" powered-by="Powered by" disclaimer="Disclaimer"></binance-stock-widget></body></html>`}
      /> : null}
    </details>
  );
}
