export const SITE = {
  url: 'https://zacharybabtkis.com',
  name: 'Zack Babtkis',
  title: 'Zack Babtkis: Engineering for Browser Extensions and Agentic AI',
  description:
    'Independent engineer, formerly PayPal Senior Staff (Honey) and founding engineer at ZeroClick. Websites, apps, browser extensions, and infrastructure and integrations for agentic AI.',
  email: 'zack@zacharybabtkis.com',
  linkedin: 'https://www.linkedin.com/in/zacharybabtkis',
  github: 'https://github.com/zbabtkis',
  bookingNote: 'I personally reply within one business day.',
  availability: 'Taking new projects now',
  // Cal.com username. Empty string = booking disabled, CTAs fall back to email.
  calUsername: 'zack-babtkis',
  calEvent: 'intro-call',
  // GA4 Measurement ID (G-XXXXXXXXXX). Empty string = no analytics loaded.
  gaId: 'G-EC3QXC3DT6',
};

// Booking link for a 20-minute intro call. `source` is the page slug that
// sent the visitor — it flows through Cal.com into the booking webhook so
// leads stay attributed to the page that produced them.
export function calLink(source: string): string {
  return `https://cal.com/${SITE.calUsername}/${SITE.calEvent}?utm_source=${encodeURIComponent(source)}`;
}

// Publicly verifiable proof — every claim on the site should link to one of
// these wherever it appears. URLs verified live 2026-07-24.
export const RECEIPTS = {
  pieStore:
    'https://chromewebstore.google.com/detail/pie-adblock-a-powerful-fr/jpkfgepcmmchgfbjblnodjhldacghenp',
  honeyStore:
    'https://chromewebstore.google.com/detail/honey-automatic-coupons-r/bmnlcjabgnpnenekpadlanbbkooimhnj',
  paypalHoney:
    'https://www.paypal.com/us/digital-wallet/ways-to-pay/paypal-honey',
  pieYt: 'https://pie.yt',
  pieOrg: 'https://www.pie.org',
  zeroclick: 'https://www.zeroclick.ai',
};

export type Service = {
  slug: string;
  navLabel: string;
  title: string;
};

export const SERVICES: Service[] = [
  {
    slug: 'safari-extensions',
    navLabel: 'Safari & iOS extension porting',
    title: 'Safari & iOS extension porting',
  },
  {
    slug: 'mcp-development',
    navLabel: 'MCP server development',
    title: 'MCP Server Development for SaaS',
  },
  {
    slug: 'ai-agent-enablement',
    navLabel: 'AI-agent enablement for teams',
    title: 'AI-Agent Development Enablement',
  },
  {
    slug: 'poc-to-production',
    navLabel: 'AI-built POC to production',
    title: 'AI-Built POC to Production',
  },
];

export function mailto(subject: string): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
}

// Services grouped by category for the nav dropdown and the homepage.
// Within each group, items are ordered by how much experience backs them.
// Items without a dedicated page link to /contact/.
export type ServiceGroupItem = {
  name: string;
  href: string;
  icon:
    | 'safari'
    | 'extension'
    | 'app-extension'
    | 'mcp'
    | 'harness'
    | 'poc'
    | 'webapp'
    | 'apps';
};

export type ServiceGroup = {
  key: string;
  label: string;
  items: ServiceGroupItem[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: 'agentic',
    label: 'Agentic AI',
    items: [
      { name: 'MCP server development', href: '/mcp-development/', icon: 'mcp' },
      {
        name: 'AI enablement for teams',
        href: '/ai-agent-enablement/',
        icon: 'harness',
      },
      {
        name: 'Prototype to production',
        href: '/poc-to-production/',
        icon: 'poc',
      },
    ],
  },
  {
    key: 'extensions',
    label: 'Web extensions',
    items: [
      {
        name: 'Safari & iOS porting',
        href: '/safari-extensions/',
        icon: 'safari',
      },
      { name: 'New extension from scratch', href: '/contact/', icon: 'extension' },
      {
        name: 'Extension for your existing app',
        href: '/contact/',
        icon: 'app-extension',
      },
    ],
  },
  {
    key: 'apps',
    label: 'Apps',
    items: [
      { name: 'Web apps', href: '/contact/', icon: 'webapp' },
      { name: 'iOS & Mac apps', href: '/contact/', icon: 'apps' },
    ],
  },
];
