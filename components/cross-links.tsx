import Link from 'next/link';
import { SERVICES } from '@/lib/site';

const BLURBS: Record<string, string> = {
  'safari-extensions':
    'I port Chrome extensions to Safari, macOS, and iOS — the way I did at Honey and Pie.',
  'mcp-development':
    'I build production MCP servers that put SaaS products inside Claude and ChatGPT.',
  'ai-agent-enablement':
    'I get engineering teams shipping production software with AI coding agents.',
};

export function CrossLinks({ current }: { current: string }) {
  const others = SERVICES.filter((service) => service.slug !== current);

  return (
    <section className="cross-links">
      <div className="wrap">
        <h2>Other things I&rsquo;m hired for</h2>
        <div className="service-cards">
          {others.map((service) => (
            <Link
              key={service.slug}
              className="service-card"
              href={`/${service.slug}/`}
            >
              <h3>{service.title}</h3>
              <p>{BLURBS[service.slug]}</p>
              <span className="card-cta">Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
