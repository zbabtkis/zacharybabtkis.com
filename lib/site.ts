export const SITE = {
  url: 'https://zacharybabtkis.com',
  name: 'Zack Babtkis',
  title: 'Zack Babtkis — Senior Software Engineer for Hire',
  description:
    'Independent senior engineer (ex-PayPal/Honey, ex-Pie). Safari & iOS extension porting, MCP server development, and AI-agent engineering enablement.',
  email: 'zackbabtkis@gmail.com',
  linkedin: 'https://www.linkedin.com/in/zacharybabtkis',
  github: 'https://github.com/zbabtkis',
  bookingNote: 'I personally reply within one business day.',
  availability: 'Currently booking September 2026',
  // Cal.com username. Empty string = booking disabled, CTAs fall back to email.
  calUsername: 'zack-babtkis',
  // Existing default event type. Swap to a dedicated 'intro-call' (20 min)
  // slug if one is created — verify https://cal.com/zack-babtkis/<slug> first.
  calEvent: '30min',
};

// Booking link for a 20-minute intro call. `source` is the page slug that
// sent the visitor — it flows through Cal.com into the booking webhook so
// leads stay attributed to the page that produced them.
export function calLink(source: string): string {
  return `https://cal.com/${SITE.calUsername}/${SITE.calEvent}?utm_source=${encodeURIComponent(source)}`;
}

export type Service = {
  slug: string;
  navLabel: string;
  title: string;
};

export const SERVICES: Service[] = [
  {
    slug: 'safari-extensions',
    navLabel: 'Safari Extensions',
    title: 'Chrome → Safari & iOS Extension Porting',
  },
  {
    slug: 'mcp-development',
    navLabel: 'MCP Development',
    title: 'MCP Server Development for SaaS',
  },
  {
    slug: 'ai-agent-enablement',
    navLabel: 'AI Enablement',
    title: 'AI-Agent Development Enablement',
  },
];

export function mailto(subject: string): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;
}
