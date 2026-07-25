export type Guide = {
  slug: string;
  title: string;
  blurb: string;
  topic: 'safari-extensions' | 'mcp-development' | 'ai-agent-enablement';
};

export const GUIDES: Guide[] = [
  {
    slug: '/safari-extensions/convert-chrome-extension-to-safari/',
    title:
      'Converting a Chrome extension to Safari and iOS: the complete guide',
    blurb:
      'What the converter does, what breaks, DNR, signing, and App Review — the full map.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/webrequest-alternative/',
    title: "Safari has no blocking webRequest. Here's what to do instead.",
    blurb:
      'The declarativeNetRequest migration: what survives, what needs redesign.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/converter-not-working/',
    title: 'The converter ran fine. So why is your extension broken?',
    blurb:
      'Six silent failure modes of converted extensions and how to diagnose each.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/app-store-rejection/',
    title: 'Safari extension rejected? The usual reasons, and the fixes.',
    blurb:
      'App Review rejections translated into fixes, plus review notes that pass.',
    topic: 'safari-extensions',
  },
];

export const TOPIC_LABELS: Record<Guide['topic'], string> = {
  'safari-extensions': 'Safari & iOS extensions',
  'mcp-development': 'MCP development',
  'ai-agent-enablement': 'AI-agent engineering',
};
