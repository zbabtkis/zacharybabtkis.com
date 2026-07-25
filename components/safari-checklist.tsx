'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserWindow } from './artifacts';

const STEPS = [
  { label: 'webRequest to DeclarativeNetRequest', done: '✓ migrated' },
  { label: 'Xcode project + signing', done: '✓ archives' },
  { label: 'App Store review', done: '✓ approved' },
];

/**
 * The Safari-page hero artifact: the port checklist completes itself when
 * scrolled into view. Reduced motion renders it complete.
 */
export function SafariChecklist() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        const reducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
          setDoneCount(STEPS.length);
        } else {
          setStarted(true);
        }
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || doneCount >= STEPS.length) return;

    const timer = setTimeout(
      () => setDoneCount((count) => count + 1),
      doneCount === 0 ? 500 : 750,
    );
    return () => clearTimeout(timer);
  }, [started, doneCount]);

  return (
    <div ref={rootRef}>
      <BrowserWindow url="your-extension · Safari · macOS + iOS" variant="safari">
        <div
          className="ext-popup"
          style={{ margin: 0, maxWidth: 'none', boxShadow: 'none', border: 'none' }}
        >
          {STEPS.map((step, i) => (
            <div className="ext-popup-row" key={step.label}>
              <span>{step.label}</span>
              {i < doneCount ? (
                <span className="ok row-done">{step.done}</span>
              ) : (
                <span className="pending">…</span>
              )}
            </div>
          ))}
        </div>
      </BrowserWindow>
    </div>
  );
}
