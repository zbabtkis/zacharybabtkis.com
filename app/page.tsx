import Link from 'next/link';
import { CtaBand } from '@/components/sections';
import { Chapter, StatBand } from '@/components/dossier';
import { Wave } from '@/components/artifacts';
import { Arrow } from '@/components/arrow';
import { HeroDemo } from '@/components/hero-demo';
import { WorkWall } from '@/components/work-wall';
import { SITE, RECEIPTS, calLink } from '@/lib/site';

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
              Angeles — ex-PayPal Senior Staff, founding engineer at Pie.
            </p>
            <div className="hero-actions">
              <a
                className="button"
                href={SITE.calUsername ? calLink('home-hero') : '/contact/'}
              >
                Book a free intro call
              </a>
              <a className="button secondary" href="/contact/">
                Contact
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <HeroDemo />
          </div>
        </div>
      </section>

      <StatBand
        stats={[
          {
            value: '20M+',
            label: 'users of extensions I helped build at Honey and Pie',
            href: RECEIPTS.paypalHoney,
          },
          {
            value: '$4B',
            label: 'Honey’s sale to PayPal — I led the extension’s PayPal integrations',
          },
          { value: '14 yrs', label: 'shipping production software' },
        ]}
      />

      <Chapter n="01" label="Who you're hiring" title="One engineer, start to finish.">
        <div className="bio-grid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zack-portrait.jpg"
            alt="Zack Babtkis in Bilbao, in front of the Guggenheim"
            width={640}
            height={800}
          />
          <div className="bio-copy">
            <p>
              I&rsquo;m not an agency; the person on the intro call is the
              person who writes the code. I&rsquo;ve spent fourteen years on
              platform work people use every day — browser extensions,
              Apple&rsquo;s toolchain, and now the infrastructure AI agents
              buy through.
            </p>
            <p style={{ marginTop: 'var(--space-md)' }}>
              I&rsquo;ve also designed, built, and shipped two products
              alone: TrueRate, a Chrome extension that exposed hidden hotel
              fees on the major booking sites, and Unhabit, an iOS Safari
              extension that blocks distracting websites.
            </p>
            <p className="bio-links">
              <a href={SITE.linkedin}>LinkedIn</a> ·{' '}
              <a href={SITE.github}>GitHub</a> ·{' '}
              <a href="/about/">the longer story</a> · references on request
            </p>
          </div>
        </div>
      </Chapter>

      <Chapter n="02" label="Services" title="What I'm hired for">
        <div className="service-cards grid-2x2">
          <Link className="service-card" href="/safari-extensions/">
            <span className="card-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M16.5 7.5 L13.5 13.5 L7.5 16.5 L10.5 10.5 Z" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <h3>Chrome <Arrow /> Safari &amp; iOS</h3>
            <p>
              Your extension doesn&rsquo;t exist on Safari or iPhone. I
              built Honey&rsquo;s first iOS extension and owned
              Pie&rsquo;s — I&rsquo;ll port yours and get it through App
              Store review.
            </p>
            <span className="card-cta">Port assessment · $2,500</span>
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
              integration. I built agent-facing APIs at ZeroClick —
              I&rsquo;ll build your MCP server and take it through directory
              submission.
            </p>
            <span className="card-cta">MCP readiness audit · $2,000</span>
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
              Your team has the AI tools and little shipped to show for
              it. At Pie I shipped a product where AI agents wrote the whole
              codebase — I&rsquo;ll set your team up to work that way.
            </p>
            <span className="card-cta">Agent-readiness audit · $3,000</span>
          </Link>
          <Link className="service-card" href="/poc-to-production/">
            <span className="card-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 19 C5 13, 8 6, 12 4 C16 6, 19 13, 19 19" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2" />
                <path d="M8 19 L12 16 L16 19" strokeLinejoin="round" />
              </svg>
            </span>
            <h3>Your AI-built POC, taken to production</h3>
            <p>
              You vibe-coded something that works — mostly. I make it
              survive real users: tests, auth, data, deployment.
            </p>
            <span className="card-cta">Production readiness audit · $2,500</span>
          </Link>
        </div>
      </Chapter>

      <Wave />

      <Chapter n="03" label="Track record" title="Where I've shipped">
        <WorkWall bare />
      </Chapter>

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
