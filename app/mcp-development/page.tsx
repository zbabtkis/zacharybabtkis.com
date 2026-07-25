import type { Metadata } from 'next';
import { Faq, CtaBand } from '@/components/sections';
import {
  Chapter,
  StatBand,
  RatesTable,
  Timeline,
  OfferBand,
} from '@/components/dossier';
import { CrossLinks } from '@/components/cross-links';
import { Wave, ToolCallCard } from '@/components/artifacts';
import { Arrow } from '@/components/arrow';
import { SITE, RECEIPTS } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'MCP Server Development for SaaS',
  description:
    'I build production MCP servers that put your product inside Claude, ChatGPT, and other AI agents, with OAuth, documentation, and Claude/ChatGPT directory listing. Built agent-facing infrastructure at ZeroClick.',
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'MCP Server Development',
  provider: { '@type': 'Person', name: 'Zack Babtkis', url: SITE.url },
  areaServed: 'Worldwide',
  description:
    'Design and development of production Model Context Protocol (MCP) servers for SaaS products, including OAuth, remote hosting, and Claude/ChatGPT directory listing.',
};

export default function McpDevelopmentPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <h1>Your product is invisible to AI agents.</h1>
            <p className="lede">
              Claude has a vetted connectors directory. ChatGPT launched
              with 1,400+ connectable apps. When a customer asks their AI
              assistant to use your product and nothing happens, they end up
              on whichever competitor built the integration. I build MCP
              servers with the auth, logging, and submission work it takes
              to pass directory review and stay reliable.
            </p>
            <div className="hero-actions">
              <a className="button" href="#offer">
                Start with an MCP readiness audit
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <ToolCallCard />
          </div>
        </div>
      </section>

      <StatBand
        stats={[
          {
            value: '2 yrs',
            label: 'spent building agent-facing APIs and MCP servers at ZeroClick, starting the year the protocol launched',
            href: RECEIPTS.zeroclick,
          },
          {
            value: '20M+',
            label: 'combined users of Honey and Pie',
            href: RECEIPTS.pieStore,
          },
          { value: '5 yrs', label: 'Senior Staff engineer at PayPal (Honey)' },
        ]}
      />

      <Chapter n="01" label="Why me" title="I built the side of the stack agents talk to." id="proof">
        <div className="prose">
          <p>
            I spent two years at <a href={RECEIPTS.zeroclick}>ZeroClick</a>,
            a company whose pitch is &ldquo;the OS for selling to
            agents,&rdquo; writing the agent-facing side of the stack: the
            APIs and MCP servers that AI agents consume, the developer
            documentation that integrators build against, and Activation
            Ads, an agent-native ad format I originated. Before that I
            spent five years at PayPal building Honey at consumer scale.
            I learned the protocol shipping to agents in production, and I
            use agent tooling every day, so I know a badly designed tool
            surface when an agent trips over one.
          </p>
        </div>
      </Chapter>

      <OfferBand
        n="02"
        label="Start here"
        title="Know what agents need from you."
        name="MCP Readiness Audit"
        price="$2,000"
        timeline="One week"
        deliverables={[
          'Review of your API for agent consumption: what agents need that it doesn’t expose',
          'Designed MCP tool surface: the tools, their schemas, and the descriptions that make agents use them correctly',
          'Auth architecture recommendation (OAuth flows, scopes, what an agent may do on a user’s behalf)',
          'Claude and ChatGPT directory requirements gap list',
          'Build-vs-buy recommendation and a fixed-bid quote for the implementation',
        ]}
        emailSubject="MCP Readiness Audit"
        source="mcp-development"
        id="offer"
      />

      <Chapter n="03" label="Rates" title="What builds cost" id="rates">
        <RatesTable
          intro="The audit produces a fixed bid. For reference, agencies quote $25k–$50k for SMB implementations and $60k–$120k for production builds. I typically come in under both because you hire one engineer."
          rates={[
            {
              name: 'MCP server for an existing SaaS',
              scope:
                'Tool-surface design, OAuth with scoped permissions, remote hosting, logging, tests, and directory submission for Claude and ChatGPT.',
              duration: '4–7 weeks',
              price: '$18k–$35k',
            },
            {
              name: <>Prototype <Arrow /> production</>,
              scope:
                'Your internal MCP demo hardened into something that survives real auth, rate limits, and multi-tenancy, without a rewrite where possible.',
              duration: '2–3 weeks',
              price: '$8k–$15k',
            },
            {
              name: 'MCP + usage metering',
              scope:
                'For API-first companies that want agents as paying customers: the MCP surface plus metering, quotas, and billing integration.',
              duration: '6–10 weeks',
              price: '$30k–$60k',
            },
          ]}
        />
      </Chapter>

      <Chapter n="04" label="Process" title="How working with me goes" id="process">
        <Timeline
          steps={[
            {
              name: 'Audit',
              description:
                'Fixed price, one week. Tool-surface design, auth plan, and directory gap list. It is useful even if you build in-house.',
            },
            {
              name: 'The build',
              description:
                'Fixed bid. I implement the MCP server in your repos: remote-hosted, with OAuth, rate limiting, logging, and tests.',
            },
            {
              name: 'Listing & handoff',
              description:
                'I drive the Claude and ChatGPT directory submissions, document everything, and train your team to extend the tool surface themselves.',
            },
          ]}
        />
      </Chapter>

      <Chapter n="05" label="Guides" title="Read before you hire anyone" id="guides">
        <p className="section-intro">
          Written from running MCP servers in production, not from the
          spec. If a guide solves your problem outright, you don&rsquo;t
          need me.
        </p>
        <ul className="guide-list">
          {GUIDES.filter((guide) => guide.topic === 'mcp-development').map(
            (guide) => (
              <li key={guide.slug}>
                <a href={guide.slug}>
                  {guide.title}
                  <span>{guide.blurb}</span>
                </a>
              </li>
            ),
          )}
        </ul>
      </Chapter>

      <Wave />

      <Faq
        items={[
          {
            question: 'What does a production MCP server cost?',
            answer:
              'Published market rates for production-grade MCP implementations run $25,000–$120,000 through agencies. My builds typically land under agency pricing because there’s no bench and no project-manager layer. The audit gives you a fixed number for your scope.',
          },
          {
            question: 'MCP, ChatGPT apps, or both?',
            answer:
              'They share most of their design thinking, and MCP increasingly works across both ecosystems. The audit answers this for your product, including whether one MCP server covers both, which it often does.',
          },
          {
            question: 'How do we keep an agent from doing something destructive with a user’s account?',
            answer:
              'Scoped OAuth, capability-level permissions, human confirmation for irreversible actions, and audit logging. This is the part prototype integrations skip and security teams block. I design it in from the first day.',
          },
          {
            question: 'Can’t we just point agents at our existing REST API?',
            answer:
              'You can. Agents will fumble it. Tool design for agents is different from API design for developers: fewer tools with clearer purposes, descriptions the model can follow, and responses shaped for reasoning instead of parsing.',
          },
          {
            question: 'Who owns the code? Will you sign an NDA?',
            answer:
              'Everything is work-for-hire, in your repos, on your infrastructure. You own all of it. NDAs are fine.',
          },
        ]}
      />

      <CrossLinks current="mcp-development" />

      <CtaBand
        title="Your customers are already asking their assistants for this."
        body="Send me a link to your API docs and a sentence about what your customers want their AI assistants to do. I'll tell you within a day what an MCP integration would look like."
        emailSubject="MCP development inquiry"
        source="mcp-development"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
