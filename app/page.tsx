import Link from 'next/link';
import { CtaBand } from '@/components/sections';
import { Chapter, StatBand } from '@/components/dossier';
import { Wave } from '@/components/artifacts';
import { Arrow } from '@/components/arrow';
import { HeroPlug } from '@/components/hero-plug';
import { ServiceIcon } from '@/components/service-icons';
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
              I build software that takes the{' '}
              <em>user&rsquo;s side</em>.
            </h1>
            <p className="lede">
              In browsers, that meant ad blockers, shopping tools, and
              other browser extensions used by over twenty million people
              worldwide. With AI agents, it means integrations and
              harnesses that keep the human in charge. I&rsquo;m Zack
              Babtkis. I was a Senior Staff engineer at PayPal and a
              founding engineer at ZeroClick, and I now consult
              independently.
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
            <HeroPlug />
          </div>
        </div>
      </section>

      <StatBand
        stats={[
          {
            value: '20M+',
            label: 'combined users of Honey and Pie',
            href: RECEIPTS.paypalHoney,
          },
          {
            value: '$4B',
            label: 'Honey’s sale to PayPal',
          },
          { value: '14 yrs', label: 'of production engineering, 2012 to today' },
        ]}
      />

      <Chapter n="01" label="Who you're hiring" title="Zack Babtkis">
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
              You work with me directly: I take the intro call, write the
              code, and deliver the work.
            </p>
            <p style={{ marginTop: 'var(--space-md)' }}>
              I&rsquo;ve also designed, built, and shipped two products
              alone: TrueRate, a Chrome extension that exposed hidden hotel
              fees on the major booking sites, and Unhabit, an iOS Safari
              extension that blocks distracting websites. Together they
              reached tens of thousands of installs.
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
        <div className="door">
          <h3 className="door-label">Agentic AI</h3>
          <div className="service-cards">
            <Link className="service-card" href="/mcp-development/">
              <span className="card-icon">
                <ServiceIcon name="mcp" />
              </span>
              <h3>MCP servers that put your product in front of AI agents</h3>
              <p>
                Your customers are asking for a Claude or ChatGPT
                integration. I built agent-facing APIs at ZeroClick.
                I&rsquo;ll build your MCP server and submit it to the
                Claude and ChatGPT directories.
              </p>
              <span className="card-cta">MCP readiness audit · $2,000</span>
            </Link>
            <Link className="service-card" href="/ai-agent-enablement/">
              <span className="card-icon">
                <ServiceIcon name="harness" />
              </span>
              <h3>AI-agent enablement for engineering teams</h3>
              <p>
                Your team has the AI tools and little shipped to show for
                it. At ZeroClick I shipped a product where AI agents wrote
                the whole codebase. I&rsquo;ll set your team up to work
                that way.
              </p>
              <span className="card-cta">Agent-readiness audit · $3,000</span>
            </Link>
            <Link className="service-card" href="/poc-to-production/">
              <span className="card-icon">
                <ServiceIcon name="poc" />
              </span>
              <h3>Your AI-built POC, taken to production</h3>
              <p>
                You vibe-coded something that works in a demo. I make it
                survive real users: tests, auth, data, deployment.
              </p>
              <span className="card-cta">
                Production readiness audit · $2,500
              </span>
            </Link>
          </div>
        </div>
        <div className="door">
          <h3 className="door-label">Web extensions</h3>
          <div className="service-cards">
            <Link className="service-card" href="/safari-extensions/">
              <span className="card-icon">
                <ServiceIcon name="safari" />
              </span>
              <h3>Chrome <Arrow /> Safari &amp; iOS</h3>
              <p>
                Your extension doesn&rsquo;t exist on Safari or iPhone. I
                built Honey&rsquo;s first iOS extension and owned
                Pie&rsquo;s. I&rsquo;ll port yours and get it through App
                Store review.
              </p>
              <span className="card-cta">Port assessment · $2,500</span>
            </Link>
            <Link className="service-card" href="/contact/">
              <span className="card-icon">
                <ServiceIcon name="extension" />
              </span>
              <h3>A new extension, built from scratch</h3>
              <p>
                Chrome, Safari, or Firefox. I shipped extension features to
                twenty million users at Honey and Pie, and built TrueRate
                alone.
              </p>
              <span className="card-cta">Scoped per project</span>
            </Link>
            <Link className="service-card" href="/contact/">
              <span className="card-icon">
                <ServiceIcon name="app-extension" />
              </span>
              <h3>An extension for your existing iOS or Mac app</h3>
              <p>
                Your app, extended into Safari. I shipped Unhabit&rsquo;s
                iOS Safari extension end to end and built Pie&rsquo;s app
                shells.
              </p>
              <span className="card-cta">Scoped per project</span>
            </Link>
          </div>
        </div>
        <div className="door">
          <h3 className="door-label">Apps</h3>
          <div className="service-cards">
            <Link className="service-card" href="/contact/">
              <span className="card-icon">
                <ServiceIcon name="webapp" />
              </span>
              <h3>Web apps</h3>
              <p>
                I&rsquo;ve built web apps since 2012: seismic dashboards at
                UC Santa Barbara, the DSP dashboard that won a 2015 UX
                Award at Gimbal, financing tools at ProducePay, and pie.yt
                at ZeroClick.
              </p>
              <span className="card-cta">Scoped per project</span>
            </Link>
            <Link className="service-card" href="/contact/">
              <span className="card-icon">
                <ServiceIcon name="apps" />
              </span>
              <h3>iOS &amp; Mac apps</h3>
              <p>
                Swift shells, Xcode Cloud, and App Store review. I shipped
                Pie&rsquo;s iOS and Mac app shells and two products of my
                own.
              </p>
              <span className="card-cta">Scoped per project</span>
            </Link>
          </div>
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
