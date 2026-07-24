import type { Metadata } from 'next';
import {
  ProofBar,
  Symptoms,
  Offer,
  Faq,
  CtaBand,
} from '@/components/sections';
import { CrossLinks } from '@/components/cross-links';
import { SITE, mailto } from '@/lib/site';

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
          <h1>
            I&rsquo;ll get your team shipping production software with AI
            agents. I&rsquo;ve actually done it.
          </h1>
          <p className="lede">
            At Pie — a company with two million users — I built and shipped a
            production product where the entire codebase was agent-built. Not
            a demo, not a prototype: a revenue product, owned end to end,
            written by AI agents working inside a harness I engineered. Most
            AI consultants learned this from a course. I learned it by
            shipping.
          </p>
          <div className="hero-actions">
            <a className="button" href={mailto('AI enablement — scoping call')}>
              Book a scoping call
            </a>
            <span className="availability">{SITE.availability}</span>
          </div>
        </div>
      </section>

      <ProofBar
        stats={[
          { value: '100%', label: 'of the codebase agent-built on the product I shipped at Pie' },
          { value: '2M+', label: 'users at the company where it shipped as a growth engine' },
          { value: 'Daily', label: 'agent-driven development is how I work, not a demo I give' },
          { value: '12+ yrs', label: 'engineering standards to hold the output to (ex-PayPal Senior Staff)' },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <h2>The proof, not the pitch</h2>
          <div className="story">
            <p className="story-kicker">Case study: pie.yt</p>
            <p>
              In 2025 I built pie.yt, an ad-free YouTube viewer, as
              Pie&rsquo;s first product developed entirely through what we
              called <strong>harness engineering</strong>: instead of writing
              the code, I engineered the environment — the conventions,
              context files, guardrails, and review gates — that let AI
              agents write production code I would sign my name to. I owned
              it from conception to launch.
            </p>
            <p>
              It shipped. It worked. It became a growth engine and an
              acquisition channel for a two-million-user company — and it
              proved that agent-built software can meet a PayPal Senior
              Staff engineer&rsquo;s bar when the harness holds it there.
              That harness is what I build for your team.
            </p>
          </div>
        </div>
      </section>

      <Symptoms
        title="Sound familiar?"
        items={[
          'Everyone has a Claude Code or Copilot license; your cycle time hasn’t moved.',
          'One or two enthusiasts get real results and nobody can replicate what they’re doing.',
          'Agent-written PRs keep failing review, so seniors quietly went back to writing everything by hand.',
          'Nobody has decided what agents may touch, so security blocks everything by default — or worse, nothing.',
          'Costs are climbing with no way to tell productive token spend from waste.',
          'Leadership is asking for an "AI strategy" and what you have is a pile of subscriptions.',
        ]}
        close="The market has named this gap precisely: the distance between installing the tool and running it well across a team is wide. Crossing it is the engagement."
      />

      <section className="section">
        <div className="wrap">
          <h2>What agent-ready actually looks like</h2>
          <p className="section-intro">
            Agents don&rsquo;t fail because the models are weak. They fail
            because the codebase and workflow give them nothing to hold onto.
            The transformation looks like this:
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
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>What your team gets</h2>
          <p className="section-intro">
            Engineering leaders are rightly wary of AI-consultant vaporware,
            so here is the concrete deliverables list:
          </p>
          <ul className="checklist">
            <li>
              <strong>Harness configuration for your actual repos</strong> —
              CLAUDE.md conventions, skills, hooks, and guardrails, committed
              and documented, not slideware
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
              <strong>CI integration</strong> — the test and review gates that
              make &ldquo;agent-written&rdquo; and &ldquo;production
              quality&rdquo; the same thing
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
        </div>
      </section>

      <div id="offer">
        <Offer
          title="Start small: find out what's actually in the way"
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
        />
      </div>

      <section className="section">
        <div className="wrap">
          <h2>Engagements — priced per engagement, never hourly</h2>
          <div className="process">
            <ol>
              <li>
                <strong>Agent-Readiness Audit · $3,000 fixed</strong>
                <p>
                  The entry point above. Useful even if you run the rollout
                  yourselves — and the fee is credited if we continue.
                </p>
              </li>
              <li>
                <strong>Embedded Enablement · 2–4 weeks, fixed quote</strong>
                <p>
                  I set up the harness across your repos and ship real backlog
                  items with your engineers pairing alongside. Skeptics get
                  turned by merged PRs, not slides. Quoted from the audit.
                </p>
              </li>
              <li>
                <strong>Fractional AI Engineering Lead · monthly retainer</strong>
                <p>
                  The tools change monthly; someone senior has to own the
                  practice. A flat retainer keeps the harness current, reviews
                  agent workflows, and levels up each team as it onboards.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>When this won&rsquo;t work</h2>
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
              become shelfware with better branding.
            </li>
            <li>
              <strong>The codebase can&rsquo;t verify anything.</strong> If
              there are effectively no tests and no appetite to build the
              minimum verification layer, agent output can&rsquo;t be trusted
              at scale — fixing that comes first, and it may be all you need
              from me.
            </li>
            <li>
              <strong>You&rsquo;re hoping to replace engineers wholesale.</strong>{' '}
              Harness engineering multiplies good engineers. It does not
              substitute for having them.
            </li>
            <li>
              <strong>Compliance forbids code leaving your network</strong> and
              you can&rsquo;t run approved models. Sometimes there&rsquo;s a
              path; often the timing is just wrong. I&rsquo;ll say which.
            </li>
          </ul>
        </div>
      </section>

      <Faq
        items={[
          {
            question: 'Which tools do you set up?',
            answer:
              'I’m deepest in Claude Code and the Claude Agent SDK — the stack I used to ship pie.yt and the agent infrastructure I built at ZeroClick. The harness itself (conventions, context, hooks, gates, CI) is deliberately tool-agnostic, which is what protects the investment when the tool landscape shifts next quarter.',
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
        title="The teams that figure this out first compound. Every month matters."
        body="Book a scoping call: tell me your team size, your stack, and what you've tried. I'll tell you honestly — including if the answer is 'you're not ready yet, and here's what to fix first.'"
        emailSubject="AI enablement — scoping call"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
