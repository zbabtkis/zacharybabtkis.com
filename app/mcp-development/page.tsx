import type { Metadata } from 'next';
import {
  ProofBar,
  Symptoms,
  Offer,
  Process,
  Faq,
  CtaBand,
} from '@/components/sections';
import { CrossLinks } from '@/components/cross-links';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'MCP Server Development for SaaS',
  description:
    'I build production MCP servers that put your product inside Claude, ChatGPT, and every AI agent — with real auth, real docs, and directory listing. Built agent-facing infrastructure at ZeroClick.',
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
          <h1>Your product is invisible to AI agents.</h1>
          <p className="lede">
            Claude has a vetted connectors directory. ChatGPT launched with
            1,400+ connectable apps. When a customer asks their AI assistant
            to use your product and nothing happens, they end up on whichever
            competitor built the integration. I build MCP servers with the
            auth, logging, and directory-approval work it takes to get
            listed and stay reliable.
          </p>
          <div className="hero-actions">
            <a className="button" href="#offer">
              Start with an MCP readiness audit
            </a>
            <span className="availability">{SITE.availability}</span>
          </div>
        </div>
      </section>

      <ProofBar
        stats={[
          { value: '2024', label: 'building MCP servers since the protocol’s first year' },
          { value: 'Prod', label: 'agent-facing APIs & MCP at ZeroClick — "the OS for selling to agents"' },
          { value: '2M+', label: 'users at Pie — I know consumer-scale traffic' },
          { value: '5 yrs', label: 'Senior Staff engineer at PayPal (Honey)' },
        ]}
      />

      <Symptoms
        title="Sound familiar?"
        items={[
          'Customers keep asking for a ChatGPT or Claude integration and it’s sitting unowned in the backlog.',
          'Competitors are already listed in the Claude connectors directory and you’re not.',
          'You have a great REST API, but agents fumble it — wrong endpoints, hallucinated parameters, abandoned sessions.',
          'Someone built an internal MCP prototype and it can’t survive real auth, rate limits, or multi-tenancy.',
          'Security keeps blocking the project because nobody can answer what an agent is allowed to do on a user’s behalf.',
          'You’re not sure whether you need MCP, a ChatGPT app, or both — and don’t want to build the wrong one.',
        ]}
        close="I did this work at ZeroClick, where the agents were the customer."
      />

      <section className="section">
        <div className="wrap">
          <h2>Why me</h2>
          <div className="prose">
            <p>
              I spent two years at ZeroClick, a company whose pitch is
              &ldquo;the OS for selling to agents,&rdquo; writing the
              agent-facing side of the stack: the APIs and MCP servers that
              AI agents consume, the developer documentation that
              integrators build against, and Activation Ads, an agent-native
              ad format I originated that provisions third-party services
              inside an agent&rsquo;s workflow. Before that I spent a decade
              building consumer-scale infrastructure at Honey and Pie. Most
              agencies selling MCP work learned the protocol from the docs.
              I learned it shipping to agents in production, and I use agent
              tooling every day, so I know a badly designed tool surface
              when an agent trips over one.
            </p>
          </div>
        </div>
      </section>

      <div id="offer">
        <Offer
          title="Start small: know exactly what agents need from you"
          name="MCP Readiness Audit"
          price="$2,000"
          timeline="One week"
          deliverables={[
            'Review of your API and product for agent consumption — what agents need that your API doesn’t expose',
            'Designed MCP tool surface: the tools, their schemas, and the descriptions that make agents use them correctly',
            'Auth architecture recommendation (OAuth flows, scopes, what an agent may do on a user’s behalf)',
            'Claude connectors directory & ChatGPT apps requirements gap list — exactly what stands between you and listing',
            'Build-vs-buy recommendation and a fixed-bid quote for the implementation',
          ]}
          emailSubject="MCP Readiness Audit"
        />
      </div>

      <Process
        steps={[
          {
            name: 'Audit',
            description:
              'Fixed price, one week. You get the tool-surface design, auth plan, and directory gap list — useful even if you build in-house.',
          },
          {
            name: 'The build',
            description:
              'Fixed bid. I implement the MCP server — remote-hosted with OAuth, rate limiting, logging, and tests — in your infrastructure, in your repos.',
          },
          {
            name: 'Listing & handoff',
            description:
              'I drive directory submission (Claude connectors / ChatGPT apps), document everything, and train your team to extend the tool surface themselves.',
          },
        ]}
      />

      <Faq
        items={[
          {
            question: 'What does a production MCP server cost?',
            answer:
              'Published market rates for production-grade MCP implementations run $25,000–$120,000 through agencies. My builds typically land well under agency pricing because there’s no bench and no project-manager layer — the audit gives you a fixed number for your scope.',
          },
          {
            question: 'MCP, ChatGPT apps, or both?',
            answer:
              'They share most of their design thinking, and MCP increasingly works across both ecosystems. The audit answers this concretely for your product — including whether one well-designed MCP server covers you everywhere, which it often does.',
          },
          {
            question: 'How do we keep an agent from doing something destructive with a user’s account?',
            answer:
              'Scoped OAuth, capability-level permissions, human confirmation for irreversible actions, and audit logging. This is the part prototype integrations skip and security teams block. I design it in from the first day.',
          },
          {
            question: 'Can’t we just point agents at our existing REST API?',
            answer:
              'You can. Agents will fumble it. Tool design for agents is different from API design for developers: fewer tools with clearer purposes, descriptions the model can follow, and responses shaped for reasoning instead of parsing. Most failed integrations fail on that design gap.',
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
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
