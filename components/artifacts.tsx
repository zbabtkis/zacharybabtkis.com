/* Hand-drawn illustrative artifacts. Server-rendered markup + CSS; the
   animated terminals live in terminal-card.tsx (client) and are re-exported
   here so pages keep one import path. */

export { TerminalCard, ToolCallCard } from './terminal-card';
export { Wave } from './wave';


type BrowserWindowProps = {
  url: string;
  children: React.ReactNode;
  variant?: 'default' | 'safari';
};

export function BrowserWindow({
  url,
  children,
  variant = 'default',
}: BrowserWindowProps) {
  return (
    <div className={`browser-window ${variant}`} aria-hidden="true">
      <div className="browser-chrome">
        <span className="traffic">
          <i />
          <i />
          <i />
        </span>
        <span className="url-bar">{url}</span>
        <span className="ext-icon">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <rect width="16" height="16" rx="4" fill="#24418e" />
            <path
              d="M4.25 3.75 H11.75 V5.5 L7.4 10.5 H11.75 V12.25 H4.25 V10.5 L8.6 5.5 H4.25 Z"
              fill="#faf9f6"
            />
          </svg>
        </span>
      </div>
      <div className="browser-body">{children}</div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-hidden="true">
      <span style={{ width: '55%' }} />
      <span style={{ width: '90%' }} />
      <span style={{ width: '80%' }} />
      <span style={{ width: '86%' }} />
      <span style={{ width: '40%' }} />
    </div>
  );
}

export function ExtensionPopup() {
  return (
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
        <span className="ext-badge">ON</span>
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
  );
}

