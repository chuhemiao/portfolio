'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { libraryPathScope, librarySafeReferrer } from '@/lib/library/navigation';

export function Analytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [referrer, setReferrer] = useState<string | undefined>();
  useEffect(() => {
    setReferrer(librarySafeReferrer(document.referrer));
    setReady(true);
    // Suppress gtag errors caused by ad blockers
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('gtag') ||
        event.message?.includes('googletagmanager')
      ) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!ready || libraryPathScope(pathname) !== 'other') return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-3VBJPZ1BBY"
        onError={() => {
          // Silently fail if gtag.js is blocked by ad blockers
          console.log('Google Analytics blocked by browser extension');
        }}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3VBJPZ1BBY', ${JSON.stringify({ debug_mode: false, ...(referrer === undefined ? {} : { page_referrer: referrer }) })});
        `}
      </Script>
    </>
  );
}
