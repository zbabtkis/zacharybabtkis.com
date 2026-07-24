import Link from 'next/link';
import { ProofBar, CtaBand } from '@/components/sections';
import { SITE } from '@/lib/site';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Zack Babtkis',
  url: SITE.url,
  email: SITE.email,
  jobTitle: 'Independent Software Engineering Consultant',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Los Angeles',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  sameAs: [SITE.linkedin, SITE.github],
  knowsAbout: [
    'Safari Web Extensions',
    'iOS Browser Extensions',
    'Model Context Protocol (MCP)',
    'AI Coding Agents',
    'Browser Extension Development',
  ],
  alumniOf: 'UC Santa Barbara',
};

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>
            Senior engineer for browser extensions and AI-agent
            infrastructure.
          </h1>
          <p className="lede">
            I&rsquo;m Zack Babtkis, an independent engineer in Los Angeles. I
            spent five years at PayPal as a Senior Staff engineer building
            Honey. After that I helped build Pie, an ad blocker that grew
            past two million users, and stayed on as it became ZeroClick,
            building infrastructure that lets businesses sell software and
            services to AI agents. I take on three kinds of contract work.
            I&rsquo;ve done all three for a living.
          </p>
          <div className="hero-actions">
            <a className="button" href="/contact/">
              Work with me
            </a>
            <span className="availability">{SITE.availability}</span>
          </div>
        </div>
      </section>

      <ProofBar
        stats={[
          { value: '2M+', label: 'users of extensions I helped build at Pie' },
          { value: '30,000+', label: 'retailers supported by Honey, acquired by PayPal' },
          { value: '5 yrs', label: 'Senior Staff engineer at PayPal (Honey)' },
          { value: '12+ yrs', label: 'shipping production software' },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <h2>What I&rsquo;m hired for</h2>
          <div className="service-cards">
            <Link className="service-card" href="/safari-extensions/">
              <h3>Chrome → Safari &amp; iOS extension porting</h3>
              <p>
                Your extension works in Chrome and doesn&rsquo;t exist on
                Safari or iPhone. I built Honey&rsquo;s first iOS browser
                extension and owned Pie&rsquo;s Safari and iOS extensions —
                I&rsquo;ll port yours and get it through App Store review.
              </p>
              <span className="card-cta">Port assessment · $2,500 →</span>
            </Link>
            <Link className="service-card" href="/mcp-development/">
              <h3>MCP servers that put your product in front of AI agents</h3>
              <p>
                Your customers are asking for a Claude or ChatGPT
                integration. I spent two years at ZeroClick building APIs and
                MCP servers where AI agents were the customer. I&rsquo;ll
                build yours and get it listed.
              </p>
              <span className="card-cta">MCP readiness audit · $2,000 →</span>
            </Link>
            <Link className="service-card" href="/ai-agent-enablement/">
              <h3>AI-agent enablement for engineering teams</h3>
              <p>
                Your team has the AI tools and little to show for it. At Pie
                I shipped a production product where AI agents wrote the
                whole codebase. I&rsquo;ll set your team up to work that way.
              </p>
              <span className="card-cta">Agent-readiness audit · $3,000 →</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Working on something like this?"
        body="Tell me what you're building and what's in your way. I read every message myself. If I'm not the right person for the job, I'll tell you, and I'll suggest someone who is."
        emailSubject="Project inquiry"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
