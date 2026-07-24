import type { Metadata } from 'next';
import {
  ProofBar,
  Symptoms,
  Offer,
  Process,
  Faq,
  CtaBand,
} from '@/components/sections';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI-Agent Development Enablement for Engineering Teams',
  description:
    'I get engineering teams shipping production software with AI coding agents. I shipped a production product at a 2M-user company where agents wrote the code — I’ll set your team up to do the same.',
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI-Agent Development Enablement',
  provider: { '@type': 'Person', name: 'Zack Babtkis', url: SITE.url },
  areaServed: 'Worldwide',
  description:
    'Hands-on enablement for engineering teams adopting AI coding agents: harness configuration, agent-ready codebase practices, CI integration, and embedded pairing.',
};

export default function AiAgentEnablementPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>
            Your team bought the AI tools. The shipping didn&rsquo;t follow.
          </h1>
          <p className="lede">
            Licenses are easy. What&rsquo;s hard is the distance between
            &ldquo;installed Claude Code&rdquo; and a team that reliably
            ships production software with agents. I&rsquo;ve crossed that
            distance personally: at Pie — a two-million-user company — I
            built and shipped a production web product where AI agents I
            directed wrote the code, end to end. Most AI consultants learned
            this from a course. I learned it by shipping.
          </p>
          <div className="hero-actions">
            <a className="button" href="#offer">
              Start with an agent-readiness audit
            </a>
            <span className="availability">{SITE.availability}</span>
          </div>
        </div>
      </section>

      <ProofBar
        stats={[
          { value: '1st', label: 'fully agent-built product shipped at Pie — I owned it, conception to launch' },
          { value: '2M+', label: 'users at the company where I shipped it' },
          { value: 'Daily', label: 'agent-driven development is how I work, not a demo I give' },
          { value: '12+ yrs', label: 'engineering standards to hold the output to' },
        ]}
      />

      <Symptoms
        title="Sound familiar?"
        items={[
          'Everyone has a Claude Code or Copilot license; your cycle time hasn’t moved.',
          'One or two enthusiasts get real results and nobody can replicate what they’re doing.',
          'Agent-written PRs keep failing review, so seniors quietly went back to writing everything by hand.',
          'Nobody has decided what agents may touch, so security and platform teams block everything by default.',
          'Your codebase fights the tools — thin tests, tribal knowledge, no conventions an agent can follow.',
          'Leadership is asking for an "AI strategy" and what you have is a pile of subscriptions.',
        ]}
        close="None of this is fixed by another license. It's fixed by workflow, codebase readiness, and someone who has actually done it."
      />

      <section className="section">
        <div className="wrap">
          <h2>Why me, specifically</h2>
          <div className="prose">
            <p>
              At Pie I pioneered what we called harness engineering: instead
              of writing the code, I built the environment — the conventions,
              context files, guardrails, and review gates — that let AI
              agents write production code I would sign my name to. The
              first product built that way shipped to real users and became
              a growth engine. That experience is the difference between
              teaching the tool and teaching the practice: I know where
              agents fail, what codebases need before agents can succeed in
              them, and how to make the workflow stick with engineers who
              are rightly skeptical. I&rsquo;m also a twelve-year engineer —
              ex-PayPal Senior Staff — so the bar for &ldquo;good
              enough&rdquo; is a senior engineer&rsquo;s bar, not a
              demo&rsquo;s.
            </p>
          </div>
        </div>
      </section>

      <div id="offer">
        <Offer
          title="Start small: find out what's actually in the way"
          name="Agent-Readiness Audit"
          price="$3,000"
          timeline="One to two weeks"
          deliverables={[
            'Codebase evaluation: tests, docs, structure, and CI through an agent’s eyes — what blocks reliable agent work today',
            'A live pilot: I run a real task from your backlog through an agent harness on your actual code, and you watch',
            'Starter harness config for your repos (context files, conventions, guardrails, review gates)',
            'Security and permissions recommendation: what agents may touch, and how that’s enforced',
            'A rollout plan sequenced for your team — who starts, on what work, measured how',
          ]}
          emailSubject="Agent-Readiness Audit"
        />
      </div>

      <Process
        steps={[
          {
            name: 'Audit',
            description:
              'Fixed price. You get the readiness picture, a live demonstration on your own code, and a rollout plan — useful even if you run the rollout yourselves.',
          },
          {
            name: 'Embedded enablement',
            description:
              'Two to four weeks. I set up the harness across your repos, ship real backlog items with your engineers pairing alongside, and turn the skeptics by results rather than slides.',
          },
          {
            name: 'Handoff or retainer',
            description:
              'Your team runs it; I document everything. Many teams keep a fractional retainer for harness upkeep as the tools evolve monthly.',
          },
        ]}
      />

      <Faq
        items={[
          {
            question: 'Which tools do you set up?',
            answer:
              'I’m deepest in Claude Code and the Claude Agent SDK, and the practices transfer to Cursor, Copilot, and whatever ships next quarter. The harness — conventions, context, guardrails, CI — is tool-agnostic by design, which is what protects the investment.',
          },
          {
            question: 'Will agent-written code pass our review bar?',
            answer:
              'That’s the defining constraint of the whole engagement. The harness includes the review gates, testing requirements, and conventions that make agent output meet a senior engineer’s bar — mine was a PayPal Senior Staff bar. Where the codebase itself blocks that (missing tests, tribal knowledge), fixing it is part of the plan.',
          },
          {
            question: 'Is this training or consulting?',
            answer:
              'Neither, mostly — it’s embedded engineering. We ship your actual backlog together, and the workflow transfers by doing. Slides don’t change engineering culture; merged PRs do.',
          },
          {
            question: 'How do we measure whether it worked?',
            answer:
              'We pick the metrics up front — typically cycle time on the pilot team, PR throughput and revert rate, and the share of merged work that’s agent-authored. You should see movement during the engagement, not after it.',
          },
          {
            question: 'Our security team is nervous. What do agents get access to?',
            answer:
              'Whatever you decide, enforced technically: scoped credentials, sandboxed execution, allow-listed commands, and human gates on anything irreversible. I write this policy with your security team, not around them.',
          },
        ]}
      />

      <CtaBand
        title="The teams that figure this out first compound. Every month matters."
        body="Tell me your team size, your stack, and what you've tried so far. I'll tell you within a day whether an audit would find anything worth fixing."
        emailSubject="AI enablement inquiry"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
