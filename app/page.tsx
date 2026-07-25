import Link from 'next/link';
import { ProofBar, CtaBand } from '@/components/sections';
import {
  Wave,
  BrowserWindow,
  ExtensionPopup,
  PageSkeleton,
} from '@/components/artifacts';
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
          <div className="hero-copy">
            <h1>
              Senior engineer for browser <em>extensions</em> and{' '}
              <span style={{ whiteSpace: 'nowrap' }}>AI-agent</span>{' '}
              infrastructure.
            </h1>
            <p className="lede">
              I&rsquo;m Zack Babtkis, an independent engineer in Los
              Angeles. I spent five years at PayPal as a Senior Staff
              engineer building Honey. After that I helped build Pie, an ad
              blocker that grew past two million users, and stayed on as it
              became ZeroClick, building infrastructure that lets businesses
              sell software and services to AI agents. I take on three kinds
              of contract work. I&rsquo;ve done all three for a living.
            </p>
            <div className="hero-actions">
              <a className="button" href="/contact/">
                Work with me
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <BrowserWindow url="zacharybabtkis.com">
              <PageSkeleton />
              <ExtensionPopup />
            </BrowserWindow>
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

      <Wave />

      <section className="section">
        <div className="wrap">
          <h2>What I&rsquo;m hired for</h2>
          <div className="service-cards">
            <Link className="service-card" href="/safari-extensions/">
              <span className="card-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M16.5 7.5 L13.5 13.5 L7.5 16.5 L10.5 10.5 Z" fill="currentColor" stroke="none" />
                </svg>
              </span>
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
              <span className="card-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 7 V4.5 M15 7 V4.5" strokeLinecap="round" />
                  <rect x="6" y="7" width="12" height="8" rx="2" />
                  <path d="M12 15 V19 M8 19 H16" strokeLinecap="round" />
                </svg>
              </span>
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
              <span className="card-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3.5" y="5" width="17" height="14" rx="2" />
                  <path d="M7 9.5 L10 12 L7 14.5 M12 15 H16.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
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
        source="home"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
