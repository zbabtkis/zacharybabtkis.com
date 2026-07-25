// One icon per service, shared by the nav dropdown and the homepage cards.
// All icons use the same 24-unit grid and stroke style.

export type ServiceIconName =
  | 'safari'
  | 'extension'
  | 'app-extension'
  | 'mcp'
  | 'harness'
  | 'poc'
  | 'webapp'
  | 'apps';

const PATHS: Record<ServiceIconName, React.ReactNode> = {
  // Safari compass
  safari: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M16.5 7.5 L13.5 13.5 L7.5 16.5 L10.5 10.5 Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  // Puzzle piece: a new extension from zero
  extension: (
    <>
      <path d="M9 5 h3 a2 2 0 1 1 4 0 h3 v4 a2 2 0 1 0 0 4 v6 h-6 a2 2 0 1 0 -4 0 H5 v-5 a2 2 0 1 1 0 -4 V5 h4" />
    </>
  ),
  // App window with a puzzle notch: extension added to an existing app
  'app-extension': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M4 9 H20 M9 4 V9" />
      <path d="M13 15 h2 a1.5 1.5 0 1 1 3 0 h2" transform="translate(-4 -1)" />
    </>
  ),
  // Plug: MCP
  mcp: (
    <>
      <path d="M9 7 V4.5 M15 7 V4.5" strokeLinecap="round" />
      <rect x="6" y="7" width="12" height="8" rx="2" />
      <path d="M12 15 V19 M8 19 H16" strokeLinecap="round" />
    </>
  ),
  // Terminal prompt: harness engineering
  harness: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path
        d="M7 9.5 L10 12 L7 14.5 M12 15 H16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  // Launch arc: POC to production
  poc: (
    <>
      <path d="M5 19 C5 13, 8 6, 12 4 C16 6, 19 13, 19 19" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" />
      <path d="M8 19 L12 16 L16 19" strokeLinejoin="round" />
    </>
  ),
  // Browser window: web apps
  webapp: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9 H20.5" />
      <circle cx="6.2" cy="7" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="8.2" cy="7" r="0.4" fill="currentColor" stroke="none" />
      <path d="M7 13 H17 M7 16 H13" strokeLinecap="round" />
    </>
  ),
  // Phone in front of a laptop: iOS and Mac apps
  apps: (
    <>
      <path d="M4 17 V7 a2 2 0 0 1 2 -2 h10" />
      <path d="M2.5 19.5 H13" strokeLinecap="round" />
      <rect x="14" y="8" width="7" height="12" rx="1.8" />
      <path d="M16.8 17.5 h1.4" strokeLinecap="round" />
    </>
  ),
};

export function ServiceIcon({
  name,
  size = 26,
}: {
  name: ServiceIconName;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
