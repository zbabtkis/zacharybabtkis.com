'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserWindow } from './artifacts';

/**
 * The hero artifact, matched to the tagline: the same product, plugged
 * into two platforms. Auto-plays the arc once on first view — browser
 * first, then the AI agent — then hands control to the tabs.
 */

function ProductChip({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} aria-hidden="true">
      <rect width="18" height="18" rx="4" fill="#c8860a" />
      <path
        d="M6 4 V7 M12 4 V7 M5 7 H13 V10 A4 4 0 0 1 9 14 A4 4 0 0 1 5 10 Z"
        fill="none"
        stroke="#faf9f6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrowserScene() {
  return (
    <BrowserWindow url="anywhere-on-the-web.com">
      <div className="page-skeleton" aria-hidden="true">
        <span style={{ width: '55%' }} />
        <span style={{ width: '90%' }} />
        <span style={{ width: '80%' }} />
        <span style={{ width: '86%' }} />
        <span style={{ width: '40%' }} />
      </div>
      <div className="ext-popup">
        <div className="ext-popup-head">
          <ProductChip />
          <strong>Your product</strong>
          <span className="ext-badge">ON</span>
        </div>
        <div className="ext-popup-row">
          <span>Chrome</span>
          <span className="ok">✓ shipped</span>
        </div>
        <div className="ext-popup-row">
          <span>Safari · macOS + iOS</span>
          <span className="ok">✓ App Store</span>
        </div>
        <div className="ext-popup-row">
          <span>Working on every page</span>
          <span className="ok">✓</span>
        </div>
      </div>
    </BrowserWindow>
  );
}

function AgentScene() {
  return (
    <div className="terminal" aria-hidden="true">
      <div className="terminal-chrome">
        <span className="traffic">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal-title">agent session</span>
      </div>
      <pre className="terminal-body">
        <div className="terminal-line">
          <span className="dim">user:</span> &ldquo;handle this for
          me&rdquo;
        </div>
        <div className="terminal-line">
          <span className="accent">⏺ tools/call</span>{' '}
          <span className="chip-inline">
            <ProductChip size={13} />
          </span>{' '}
          your_product.search
        </div>
        <div className="terminal-line">
          {'  '}
          <span className="dim">→ 200 · 41ms · OAuth scope: read</span>
        </div>
        <div className="terminal-line">
          <span className="accent">⏺ tools/call</span>{' '}
          <span className="chip-inline">
            <ProductChip size={13} />
          </span>{' '}
          your_product.create
        </div>
        <div className="terminal-line">
          {'  '}
          <span className="dim">→ held for human confirmation ✓</span>
        </div>
        <div className="terminal-line">
          <span className="ok">✓ your product, working for an agent</span>
        </div>
      </pre>
    </div>
  );
}

export function HeroPlug() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'browser' | 'agent'>('browser');
  const [userTook, setUserTook] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        timer = setTimeout(() => {
          setMode((current) => (current === 'browser' ? 'agent' : current));
        }, 2800);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const pick = (next: 'browser' | 'agent') => {
    setUserTook(true);
    setMode(next);
  };

  return (
    <div className="hero-plug" ref={rootRef} data-user={userTook ? '1' : '0'}>
      <div className="plug-tabs" role="tablist" aria-label="Where the product is plugged in">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'browser'}
          className={mode === 'browser' ? 'active' : ''}
          onClick={() => pick('browser')}
        >
          in the browser
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'agent'}
          className={mode === 'agent' ? 'active' : ''}
          onClick={() => pick('agent')}
        >
          with an AI agent
        </button>
      </div>
      <div className="plug-stage">
        <div className="plug-scene" key={mode}>
          {mode === 'browser' ? <BrowserScene /> : <AgentScene />}
        </div>
      </div>
    </div>
  );
}
