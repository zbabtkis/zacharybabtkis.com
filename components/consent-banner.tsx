'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'analytics-consent';

// Google Consent Mode holds EEA/UK/CH visitors at denied-by-default
// server-side (see the inline consent script in the layout). This banner
// only decides who gets ASKED: the timezone heuristic over-asks a little
// (Europe/* includes some non-EEA zones) and that costs nothing, while a
// missed EU visitor simply stays denied. Preview with ?consent=eu.
function shouldAsk(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return false;
    if (window.location.search.includes('consent=eu')) return true;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    return timeZone.startsWith('Europe/');
  } catch {
    return false;
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (shouldAsk()) setVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!visible) return null;

  const choose = (choice: 'granted' | 'denied') => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Storage unavailable: the choice still applies for this page view.
    }
    window.gtag?.('consent', 'update', { analytics_storage: choice });
    setVisible(false);
  };

  return (
    <div className="consent-banner" role="dialog" aria-label="Cookie consent">
      <p>
        I use Google Analytics to see which pages are useful. No ads, no
        selling data. <a href="/privacy/">Privacy policy</a>
      </p>
      <div className="consent-actions">
        <button
          className="button secondary"
          type="button"
          onClick={() => choose('denied')}
        >
          Decline
        </button>
        <button
          className="button"
          type="button"
          onClick={() => choose('granted')}
        >
          Allow
        </button>
      </div>
    </div>
  );
}
