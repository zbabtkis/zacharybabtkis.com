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
};

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
