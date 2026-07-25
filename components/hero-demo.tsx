'use client';

import { useState } from 'react';
import { BrowserWindow } from './artifacts';

/**
 * The home hero artifact, working: toggle the extension off and the page
 * behind it fills with ads; toggle it back on and they vanish. The whole
 * premise of an ad-blocking extension, in one click.
 */
export function HeroDemo() {
  const [on, setOn] = useState(true);

  return (
    <BrowserWindow url="zacharybabtkis.com">
      <div className="page-skeleton" aria-hidden="true">
        <span style={{ width: '55%' }} />
        {on ? (
          <span style={{ width: '90%' }} />
        ) : (
          <span className="ad-block" style={{ width: '90%' }}>
            AD
          </span>
        )}
        <span style={{ width: '80%' }} />
        {on ? (
          <span style={{ width: '86%' }} />
        ) : (
          <span className="ad-block" style={{ width: '86%' }}>
            AD
          </span>
        )}
        <span style={{ width: '40%' }} />
      </div>
      <div className="ext-popup">
        <div className="ext-popup-head">
          <svg viewBox="0 0 16 16" width="18" height="18">
            <rect width="16" height="16" rx="4" fill="#24418e" />
            <path
              d="M4.25 3.75 H11.75 V5.5 L7.4 10.5 H11.75 V12.25 H4.25 V10.5 L8.6 5.5 H4.25 Z"
              fill="#faf9f6"
            />
          </svg>
          <strong>Your extension</strong>
          <button
            type="button"
            className={`ext-badge${on ? '' : ' off'}`}
            onClick={() => setOn((value) => !value)}
            aria-label={on ? 'Turn extension off' : 'Turn extension on'}
          >
            {on ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="ext-popup-row">
          <span>Chrome</span>
          <span className="ok">✓ shipped</span>
        </div>
        <div className="ext-popup-row">
          <span>Safari · macOS</span>
          <span className="ok">✓ shipped</span>
        </div>
        <div className="ext-popup-row">
          <span>Safari · iOS</span>
          <span className="ok">✓ App Store</span>
        </div>
      </div>
      <p className="demo-hint">try the toggle</p>
    </BrowserWindow>
  );
}
