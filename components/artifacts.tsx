/* Hand-drawn illustrative artifacts. Pure markup + CSS — no images, no JS. */

export function Wave() {
  return (
    <div className="wave" aria-hidden="true">
      <svg width="100%" height="12" preserveAspectRatio="none">
        <defs>
          <pattern
            id="wavePattern"
            width="30"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 6 Q7.5 0 15 6 Q22.5 12 30 6"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill="url(#wavePattern)" />
      </svg>
    </div>
  );
}

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

export function TerminalCard({ lines }: { lines: React.ReactNode[] }) {
  return (
    <div className="terminal" aria-hidden="true">
      <div className="terminal-chrome">
        <span className="traffic">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal-title">zsh — harness</span>
      </div>
      <pre className="terminal-body">
        {lines.map((line, i) => (
          <div key={i} className="terminal-line">
            {line}
          </div>
        ))}
        <div className="terminal-line">
          <span className="cursor" />
        </div>
      </pre>
    </div>
  );
}

export function ToolCallCard() {
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
          <span className="dim">user:</span> &ldquo;book me something for
          Tuesday&rdquo;
        </div>
        <div className="terminal-line">
          <span className="accent">⏺ tools/call</span> get_availability
        </div>
        <div className="terminal-line">
          {'  '}
          <span className="dim">→ 200 · 38ms · OAuth scope: read</span>
        </div>
        <div className="terminal-line">
          <span className="accent">⏺ tools/call</span> create_booking
        </div>
        <div className="terminal-line">
          {'  '}
          <span className="dim">→ held for human confirmation ✓</span>
        </div>
        <div className="terminal-line">
          <span className="ok">✓ your product, doing the work</span>
        </div>
      </pre>
    </div>
  );
}
