'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

// One document-level listener instead of onClick handlers scattered
// across server components. Classifies the clicks that matter for
// conversion and reports them; GA enhanced measurement covers the rest.
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      const page = window.location.pathname;

      if (href.includes('cal.com/')) {
        let source = '';
        try {
          source = new URL(href).searchParams.get('utm_source') ?? '';
        } catch {
          source = '';
        }
        track('book_call_click', { source, page });
        return;
      }

      if (href.startsWith('mailto:')) {
        track('email_click', { page });
        return;
      }

      if (anchor.closest('.service-card')) {
        track('service_card_click', { destination: href, page });
        return;
      }

      if (anchor.closest('.work-tile')) {
        track('work_tile_click', { destination: href, page });
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
