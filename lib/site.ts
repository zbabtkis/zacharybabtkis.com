export const SITE = {
  url: 'https://zacharybabtkis.com',
  name: 'Zack Babtkis',
  title: 'Zack Babtkis — Engineering for Browsers and Agentic AI',
  description:
    'Independent engineer, ex-PayPal Senior Staff (Honey), founding engineer at ZeroClick. Websites, apps, browser extensions, and infrastructure and integrations for agentic AI.',
  email: 'zackbabtkis@gmail.com',
  linkedin: 'https://www.linkedin.com/in/zacharybabtkis',
  github: 'https://github.com/zbabtkis',
  bookingNote: 'I personally reply within one business day.',
  availability: 'Currently booking September 2026',
  // Cal.com username. Empty string = booking disabled, CTAs fall back to email.
  calUsername: 'zack-babtkis',
  calEvent: 'intro-call',
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
