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
      'Getting your Chrome extension onto Safari and iPhone: the complete guide',
    blurb:
      'What the converter does, what breaks, DNR, signing, and App Review.',
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
  {
    slug: '/safari-extensions/dynamic-dnr-rules/',
    title:
      'When your dynamic rules stop installing, collide, or change meaning in Safari',
    blurb:
      'The shared rule budget, encoding provenance in rule IDs, and teardown that does not break other features.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/spa-page-identity/',
    title: "The site never reloads, and your extension can't tell where it is",
    blurb:
      'Why server-rendered metadata goes stale after client navigation, and how to keep a content script current.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/main-world-scripts/',
    title:
      "When your content script can't see the page's JavaScript",
    blurb:
      'MAIN vs isolated world, registration order, and passing state between halves that cannot message each other.',
    topic: 'safari-extensions',
  },
  {
    slug: '/mcp-development/stateful-mcp-servers/',
    title: "Your MCP server is stateful. Your load balancer doesn't know that.",
    blurb:
      'Sessions, sticky routing, proxy timeouts, and what breaks at two replicas.',
    topic: 'mcp-development',
  },
  {
    slug: '/mcp-development/mcp-stateless-migration/',
    title: "MCP went stateless. Here's how to migrate a session-era server.",
    blurb:
      'The 2026-07-28 spec removes sessions. The handle pattern, elicitation changes, and the order to migrate in.',
    topic: 'mcp-development',
  },
  {
    slug: '/mcp-development/mcp-elicitation/',
    title: 'How to pause an MCP tool call, ask the user, and resume',
    blurb:
      'MCP elicitation end to end: suspend and resume, timeouts that ignore human thinking time, and the race everyone hits.',
    topic: 'mcp-development',
  },
  {
    slug: '/mcp-development/tool-design-for-agents/',
    title: 'Why models ignore your MCP tools, and the design that fixes it',
    blurb:
      'Server instructions, filtering server-side, error results over exceptions, and tool output as prompt surface.',
    topic: 'mcp-development',
  },
  {
    slug: '/mcp-development/sandboxing-untrusted-code/',
    title: "You have to run untrusted JavaScript. A VM sandbox isn't enough.",
    blurb:
      'A VM context isolates scope, not capability: SSRF and rebinding defenses, log exfiltration, and the execution contract.',
    topic: 'mcp-development',
  },
  {
    slug: '/ai-agent-enablement/detect-ai-traffic/',
    title: 'How to tell humans, AI crawlers, and AI agents apart in your traffic',
    blurb:
      'Why analytics tags and origin logs both miss it, which signals to trust, and the two rules that make the numbers usable.',
    topic: 'ai-agent-enablement',
  },
  {
    slug: '/ai-agent-enablement/oauth-for-agents/',
    title: 'OAuth assumes your user already has an account',
    blurb:
      'Token strategies, pooled accounts, deferred ownership, and the OAuth mechanics that bite in agent flows.',
    topic: 'ai-agent-enablement',
  },
  {
    slug: '/ai-agent-enablement/integration-config-vs-code/',
    title:
      'Fifty integrations are coming. Config, DSL, or code?',
    blurb:
      'Three architectures I tried and abandoned, and the split between declarative auth and executable setup that held up.',
    topic: 'ai-agent-enablement',
  },
];

export const TOPIC_LABELS: Record<Guide['topic'], string> = {
  'safari-extensions': 'Safari & iOS extensions',
  'mcp-development': 'MCP development',
  'ai-agent-enablement': 'AI-agent engineering',
};
