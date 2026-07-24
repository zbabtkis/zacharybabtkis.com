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
          <h1>Senior engineering for extensions and the agent era.</h1>
          <p className="lede">
            I&rsquo;m Zack Babtkis — an independent engineer in Los Angeles.
            I spent five years as a Senior Staff engineer at PayPal building
            Honey, then helped take Pie&rsquo;s ad blocker past two million
            users while building infrastructure that sells to AI agents. I
            take on three kinds of contracts — and I&rsquo;ve shipped all
            three at production scale.
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
                Claude and ChatGPT users are asking for your integration. I
                build production MCP servers — I built agent-facing APIs at
                ZeroClick, the company building the OS for selling to agents.
              </p>
              <span className="card-cta">MCP readiness audit · $2,000 →</span>
            </Link>
            <Link className="service-card" href="/ai-agent-enablement/">
              <h3>AI-agent enablement for engineering teams</h3>
              <p>
                Your team bought the AI tools; the productivity didn&rsquo;t
                follow. I shipped a production product at a 2M-user company
                where agents I directed wrote the code — I&rsquo;ll set your
                team up to do the same.
              </p>
              <span className="card-cta">Agent-readiness audit · $3,000 →</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Have a project in one of these lanes?"
        body="Tell me what you're building and where it hurts. I read every message myself, and if I'm not the right person I'll say so and point you somewhere better."
        emailSubject="Project inquiry"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
