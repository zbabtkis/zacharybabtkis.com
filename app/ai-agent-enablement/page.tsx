import type { Metadata } from 'next';
import { Faq, CtaBand } from '@/components/sections';
import {
  Chapter,
  StatBand,
  RatesTable,
  OfferBand,
} from '@/components/dossier';
import { CrossLinks } from '@/components/cross-links';
import { Wave, TerminalCard } from '@/components/artifacts';
import { SITE, RECEIPTS, mailto, calLink } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'AI-Agent Development Enablement — Harness Engineering for Teams',
  description:
    'I get engineering teams shipping production software with AI coding agents. I built and shipped a product at a 2M+ user company where the entire codebase was agent-built — then I’ll set your team up to do the same.',
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI-Agent Development Enablement (Harness Engineering)',
  provider: { '@type': 'Person', name: 'Zack Babtkis', url: SITE.url },
  areaServed: 'Worldwide',
  description:
    'Hands-on enablement for engineering teams adopting AI coding agents: harness engineering, agent-ready codebase practices, CLAUDE.md conventions, hooks, MCP integration, security policy, and embedded pairing.',
};

export default function AiAgentEnablementPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <h1>
              I&rsquo;ll get your team shipping production software with AI
              agents. I&rsquo;ve actually done it.
            </h1>
            <p className="lede">
              At ZeroClick — the company behind the two-million-user Pie
              ad blocker — I built and shipped a production product where
              AI agents wrote the entire codebase. It wasn&rsquo;t a prototype. It made money, I owned
              it end to end, and the agents worked inside a harness I
              engineered. Most AI consultants learned this from a course. I
              learned it by shipping.
            </p>
            <div className="hero-actions">
              <a
                className="button"
                href={
                  SITE.calUsername
                    ? calLink('ai-agent-enablement-hero')
                    : mailto('AI enablement — scoping call')
                }
              >
                Book a free scoping call
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <TerminalCard
              lines={[
                <>
                  <span className="dim">$</span> claude
                </>,
                <>
                  <span className="dim">CLAUDE.md loaded · 4 skills · hooks armed</span>
                </>,
                <>
                  <span className="accent">⏺</span> Task 3/11: port billing
                  module
                </>,
                <>
                  {'  '}12 files changed · tests <span className="ok">47/47 ✓</span>
                </>,
                <>
                  <span className="accent">⏺</span> PR #142 opened → review
                  gate
                </>,
                <>
                  <span className="ok">✓ merged after human review</span>
                </>,
              ]}
            />
          </div>
        </div>
      </section>

      <StatBand
        stats={[
          { value: '100%', label: 'of the codebase agent-built on the product I shipped at ZeroClick' },
          {
            value: '10 wks',
            label: 'pie.yt from first commit to public launch, agents writing the code',
            href: RECEIPTS.pieYt,
          },
          { value: '14 yrs', label: 'of engineering standards to hold the output to (ex-PayPal Senior Staff)' },
        ]}
      />

      <Chapter n="01" label="Proof" title="Case study: pie.yt" id="proof">
        <div className="story">
          <p>
            In 2025 I built <a href={RECEIPTS.pieYt}>pie.yt</a>, an ad-free
            YouTube viewer, still live, as ZeroClick&rsquo;s first product
            developed entirely through what we called{' '}
            <strong>harness engineering</strong>: instead of writing the
            code, I engineered the environment — the conventions, context
            files, guardrails, and review gates — that let AI agents write
            production code I would sign my name to. I owned it from
            conception to launch.
          </p>
          <p>
            It shipped, it worked, and it became a growth engine for a
            two-million-user company. The code met the bar I spent five
            years holding as a Senior Staff engineer at PayPal, because the
            harness required it to. That harness is what I build for your
            team.
          </p>
        </div>
        <p className="section-intro" style={{ marginTop: 'var(--space-lg)' }}>
          Solo founder with an AI-built prototype and no team yet? That
          engagement looks different —{' '}
          <a href="/poc-to-production/">see POC to production</a>.
        </p>
      </Chapter>

      <Chapter n="02" label="What changes" title="What agent-ready looks like" id="changes">
        <p className="section-intro">
          Agents usually fail because the codebase and workflow give them
          nothing to hold onto, not because the models are weak.
        </p>
        <div className="compare">
          <div className="panel before">
            <h3>Before: agent-hostile</h3>
            <ul>
              <li>Conventions live in senior engineers&rsquo; heads</li>
              <li>Thin or slow tests, so nothing verifies agent output</li>
              <li>No CLAUDE.md, no context files — every session starts from zero</li>
              <li>Agents get blanket access or no access; security is a standoff</li>
              <li>Each engineer prompts differently; results can&rsquo;t be reproduced</li>
              <li>Token spend untracked and unbounded</li>
            </ul>
          </div>
          <div className="panel after">
            <h3>After: agent-ready</h3>
            <ul>
              <li>CLAUDE.md conventions and skills encode how your team builds</li>
              <li>Fast test gates that agent work must pass before review</li>
              <li>Hooks enforce policy automatically — no relying on the agent&rsquo;s memory</li>
              <li>MCP wiring gives agents your internal tools, scoped and audited</li>
              <li>Subagent patterns for review, testing, and migration work</li>
              <li>Cost controls and metrics: spend per merged PR, not per seat</li>
            </ul>
          </div>
        </div>
      </Chapter>

      <Chapter n="03" label="Deliverables" title="What your team gets" id="deliverables">
        <p className="section-intro">
          Every item below gets committed to your repos and documented.
        </p>
        <ul className="checklist">
          <li>
            <strong>Harness configuration for your actual repos</strong> —
            CLAUDE.md conventions, skills, hooks, and guardrails
          </li>
          <li>
            <strong>MCP integration</strong> — your internal tools, docs,
            and services wired in so agents work with your context, not
            generic knowledge
          </li>
          <li>
            <strong>Security and permissions policy</strong> — what agents
            may touch, enforced technically (scoped credentials, sandboxing,
            allow-lists, human gates on irreversible actions), written with
            your security team
          </li>
          <li>
            <strong>CI integration</strong> — test and review gates that
            agent-written work has to pass before a human reviews it
          </li>
          <li>
            <strong>Cost controls</strong> — budgets, tracking, and the
            metrics that distinguish productive spend from waste
          </li>
          <li>
            <strong>Real merged work</strong> — we ship items from your
            actual backlog together; the first harness-engineered feature is
            the training vehicle
          </li>
          <li>
            <strong>Playbooks your team keeps</strong> — onboarding docs and
            patterns so the practice outlives the engagement
          </li>
        </ul>
      </Chapter>

      <OfferBand
        n="04"
        label="Start here"
        title="Find out what's in the way."
        name="Agent-Readiness Audit"
        price="$3,000"
        timeline="One to two weeks"
        deliverables={[
          'Codebase evaluation through an agent’s eyes: tests, docs, structure, CI — what blocks reliable agent work today',
          'A live pilot: I run a real task from your backlog through an agent harness on your actual code, and you watch',
          'Starter harness config for your repos (CLAUDE.md, conventions, guardrails, review gates)',
          'Security and permissions recommendation your security team can sign off on',
          'A sequenced rollout plan — who starts, on what work, measured how — with a fixed quote for the embedded engagement',
        ]}
        emailSubject="Agent-Readiness Audit"
        source="ai-agent-enablement"
        id="offer"
      />

      <Chapter n="05" label="Rates" title="Engagements, priced per engagement" id="rates">
        <RatesTable
          intro="Never hourly. The audit produces a fixed quote for everything that follows."
          rates={[
            {
              name: 'Agent-Readiness Audit',
              scope:
                'The entry point above. Useful even if you run the rollout yourselves — and the fee is credited if we continue.',
              duration: '1–2 weeks',
              price: '$3,000',
            },
            {
              name: 'Embedded Enablement',
              scope:
                'I set up the harness across your repos and ship real backlog items with your engineers pairing alongside. Your skeptics will come around when they review the merged PRs.',
              duration: '2–4 weeks',
              price: '$15k–$30k',
            },
            {
              name: 'Fractional AI Engineering Lead',
              scope:
                'The tools change monthly; someone senior has to own the practice. A flat retainer keeps the harness current and levels up each team as it onboards.',
              duration: 'ongoing',
              price: '$4k–$7.5k/mo',
            },
          ]}
        />
      </Chapter>

      <Chapter n="06" label="Fit" title="When this won't work" id="fit">
        <div className="prose">
          <p>
            An honest list, because this category is drowning in hype. I
            will tell you in the scoping call — and again in the audit — if
            you&rsquo;re in one of these situations, and I&rsquo;ll decline
            the engagement rather than take money for a rollout that
            won&rsquo;t stick:
          </p>
        </div>
        <ul className="checklist" style={{ marginTop: 'var(--space-md)' }}>
          <li>
            <strong>Leadership wants a headline, not a workflow change.</strong>{' '}
            If nobody senior will spend time in the new workflow, the tools
            will sit unused no matter how well they&rsquo;re set up.
          </li>
          <li>
            <strong>The codebase can&rsquo;t verify anything.</strong> If
            there are close to no tests and no appetite to build a minimum
            verification layer, agent output can&rsquo;t be trusted at
            scale. Fixing that comes first, and it may be all you need from
            me.
          </li>
          <li>
            <strong>You&rsquo;re hoping to replace engineers wholesale.</strong>{' '}
            This multiplies good engineers. It doesn&rsquo;t replace them.
          </li>
          <li>
            <strong>Compliance forbids code leaving your network</strong>{' '}
            and you can&rsquo;t run approved models. Sometimes there&rsquo;s
            a path. Often the timing is just wrong. I&rsquo;ll tell you
            which it is.
          </li>
        </ul>
      </Chapter>

      <Chapter n="07" label="Guides" title="Read before you hire anyone" id="guides">
        <p className="section-intro">
          Written from building agent infrastructure that ran in
          production. If a guide solves your problem outright, you
          don&rsquo;t need me.
        </p>
        <ul className="guide-list">
          {GUIDES.filter(
            (guide) => guide.topic === 'ai-agent-enablement',
          ).map((guide) => (
            <li key={guide.slug}>
              <a href={guide.slug}>
                {guide.title}
                <span>{guide.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </Chapter>

      <Wave />

      <Faq
        items={[
          {
            question: 'Which tools do you set up?',
            answer:
              'I’m deepest in Claude Code and the Claude Agent SDK — the stack I used to ship pie.yt and the agent infrastructure I built at ZeroClick. The harness itself (conventions, context, hooks, gates, CI) is deliberately tool-agnostic, which protects the investment as the tools change.',
          },
          {
            question: 'Will agent-written code pass our review bar?',
            answer:
              'That’s the defining constraint of the engagement. The harness includes the review gates, testing requirements, and conventions that make agent output meet a senior engineer’s bar — mine was a PayPal Senior Staff bar. Where the codebase blocks that, fixing it is sequenced into the plan.',
          },
          {
            question: 'Is this training or consulting?',
            answer:
              'Neither, mostly — it’s embedded engineering. We ship your actual backlog together and the workflow transfers by doing. The first harness-engineered feature your team ships is the training vehicle.',
          },
          {
            question: 'How do we measure whether it worked?',
            answer:
              'We pick metrics up front — typically cycle time on the pilot team, PR throughput and revert rate, cost per merged PR, and the share of merged work that’s agent-authored. You should see movement during the engagement, not after it.',
          },
          {
            question: 'Our security team is nervous. What do agents get access to?',
            answer:
              'Whatever you decide, enforced technically: scoped credentials, sandboxed execution, allow-listed commands, and human gates on anything irreversible. I write this policy with your security team, not around them.',
          },
        ]}
      />

      <CrossLinks current="ai-agent-enablement" />

      <CtaBand
        title="Find out what's in your team's way."
        body="Book a scoping call. Tell me your team size, your stack, and what you've tried. I'll give you a straight answer, including 'you're not ready yet, and here's what to fix first.'"
        emailSubject="AI enablement — scoping call"
        source="ai-agent-enablement"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
