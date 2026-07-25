import Link from 'next/link';
import { CtaBand } from '@/components/sections';
import { Chapter, StatBand } from '@/components/dossier';
import { Wave } from '@/components/artifacts';
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

const CAREER = [
  { year: '2012', text: <>UC Santa Barbara — real-time seismic data visualization</> },
  { year: '2014', text: <>Gimbal — real-time location adtech infrastructure</> },
  { year: '2018', text: <>ProducePay — lead engineer, produce financing</> },
  {
    year: '2019',
    text: (
      <>
        <strong>Honey → PayPal</strong> — Senior Staff engineer through the
        $4B acquisition; built its first iOS extension
      </>
    ),
  },
  {
    year: '2024',
    text: (
      <>
        <strong>Pie</strong>
        {' — founding engineer; owned Safari & iOS, led the Creator Network to 2M+ users'}
      </>
    ),
  },
  {
    year: '2025',
    text: (
      <>
        <strong>ZeroClick</strong> — agent-commerce infrastructure; shipped
        pie.yt, a product AI agents wrote end to end
      </>
    ),
  },
  { year: 'Now', text: <>Independent — Los Angeles</> },
];

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
              I&rsquo;m Zack Babtkis — ex-PayPal Senior Staff, founding
              engineer at Pie. I take on four kinds of contract work, and
              I&rsquo;ve done every one of them for a living.
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
            label: 'users across the products I’ve built at Honey and Pie',
            href: RECEIPTS.paypalHoney,
          },
          {
            value: '$4B',
            label: 'Honey’s exit to PayPal — I built through the acquisition',
          },
          {
            value: '$100Ms',
            label: 'per year in revenue across products I’ve built on',
          },
          { value: '12+', label: 'years shipping production software' },
        ]}
      />

      <Chapter n="01" label="Who you're hiring" title="One engineer. The same one, the whole way through.">
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
              I&rsquo;m not an agency — the person on the intro call is the
              person who writes the code. Fourteen years of it, mostly on
              platform work people use every day: browser extensions,
              Apple&rsquo;s toolchain, and now the infrastructure AI agents
              buy through.
            </p>
            <ul className="career-line">
              {CAREER.map((entry) => (
                <li key={entry.year}>
                  <span className="year">{entry.year}</span>
                  <span>{entry.text}</span>
                </li>
              ))}
            </ul>
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
            <h3>Chrome → Safari &amp; iOS extension porting</h3>
            <p>
              Your extension doesn&rsquo;t exist on Safari or iPhone. I
              built Honey&rsquo;s first iOS extension and owned
              Pie&rsquo;s — I&rsquo;ll port yours through App Store review.
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
              Customers are asking for the Claude or ChatGPT integration. I
              built agent-facing APIs at ZeroClick — I&rsquo;ll build yours
              and take it through directory submission.
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
              Licenses without results. At Pie I shipped a product where AI
              agents wrote the whole codebase — I&rsquo;ll set your team up
              to work that way.
            </p>
            <span className="card-cta">Agent-readiness audit · $3,000 →</span>
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
            <span className="card-cta">Production readiness audit · $2,500 →</span>
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
