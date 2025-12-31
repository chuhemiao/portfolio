'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export function Analytics() {
  useEffect(() => {
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
          gtag('config', 'G-3VBJPZ1BBY', {
            'debug_mode': false
          });
        `}
      </Script>
    </>
  );
}
