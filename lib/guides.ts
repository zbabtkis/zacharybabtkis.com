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
      'Dynamic declarativeNetRequest rules: scoping, budgeting, and safely undoing them',
    blurb:
      'The shared rule budget, encoding provenance in rule IDs, and teardown that does not break other features.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/spa-page-identity/',
    title: "Knowing which page you're on inside a single-page app",
    blurb:
      'Why server-rendered metadata goes stale after client navigation, and how to keep a content script current.',
    topic: 'safari-extensions',
  },
  {
    slug: '/safari-extensions/main-world-scripts/',
    title:
      "Running extension code in the page's world, and coordinating across the boundary",
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
    title: 'Pausing a tool call to ask the user a question',
    blurb:
      'MCP elicitation end to end: suspend and resume, timeouts that ignore human thinking time, and the race everyone hits.',
    topic: 'mcp-development',
  },
  {
    slug: '/mcp-development/tool-design-for-agents/',
    title: 'Designing MCP tools that models call correctly',
    blurb:
      'Server instructions, filtering server-side, error results over exceptions, and tool output as prompt surface.',
    topic: 'mcp-development',
  },
  {
    slug: '/mcp-development/sandboxing-untrusted-code/',
    title: 'Running untrusted JavaScript on your own infrastructure',
    blurb:
      'A VM context isolates scope, not capability: SSRF and rebinding defenses, log exfiltration, and the execution contract.',
    topic: 'mcp-development',
  },
  {
    slug: '/ai-agent-enablement/detect-ai-traffic/',
    title: 'How to detect AI crawlers and LLM referral traffic',
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
      'Config, DSL, or code: structuring dozens of third-party integrations',
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
