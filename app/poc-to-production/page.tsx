import type { Metadata } from 'next';
import { Faq, CtaBand } from '@/components/sections';
import {
  Chapter,
  StatBand,
  Voices,
  RatesTable,
  Timeline,
  OfferBand,
} from '@/components/dossier';
import { CrossLinks } from '@/components/cross-links';
import { Wave, TerminalCard } from '@/components/artifacts';
import { Arrow } from '@/components/arrow';
import { SITE, RECEIPTS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI-Built POC to Production',
  description:
    'You vibe-coded a prototype that works — mostly. I turn AI-built POCs into products that survive real users: tests, auth, data, deployment. Fixed prices, senior engineering.',
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI-Built POC to Production',
  provider: { '@type': 'Person', name: 'Zack Babtkis', url: SITE.url },
  areaServed: 'Worldwide',
  description:
    'Production hardening for AI-built prototypes: security and data review, test coverage, auth, deployment, and the finish-line engineering to launch.',
};

export default function PocToProductionPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <h1>
              Your AI-built POC works. Now it has to survive real users.
            </h1>
            <p className="lede">
              You built something real with Claude, Cursor, or Lovable — it
              demos well, people want it, and you know it isn&rsquo;t ready.
              I take AI-built prototypes to production: tests, auth, data,
              deployment, and the parts the demo skipped. I build with
              agents myself — I shipped a product where they wrote the
              whole codebase — so I know where they cut corners.
            </p>
            <div className="hero-actions">
              <a className="button" href="#offer">
                Start with a readiness audit
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <TerminalCard
              lines={[
                <>
                  <span className="dim">$</span> npm test
                </>,
                <>
                  <span className="dim">
                    …0 tests found (that&rsquo;s the problem)
                  </span>
                </>,
                <>
                  <span className="accent">⏺</span> readiness audit: 14
                  findings, 3 critical
                </>,
                <>
                  <span className="accent">⏺</span> keep 80% · rewrite auth ·
                  add test gates
                </>,
                <>
                  <span className="ok">✓ launched — real users, no 3am pages</span>
                </>,
              ]}
            />
          </div>
        </div>
      </section>

      <StatBand
        stats={[
          {
            value: '100%',
            label: 'of pie.yt written by AI agents — I shipped it to production myself',
            href: RECEIPTS.pieYt,
          },
          {
            value: '10 wks',
            label: 'from its first commit to public launch at a 2M-user company',
          },
          { value: '14 yrs', label: 'of production engineering to hold it to (ex-PayPal Senior Staff)' },
        ]}
      />

      <Chapter n="01" label="The problem" title="Sound familiar?" id="problem">
        <Voices
          items={[
            'It works perfectly — until two people use it at the same time.',
            'There are no tests, so every change breaks something.',
            'The demo logs in. I wouldn’t put a real card on it.',
            'The AI wrote code nobody fully understands.',
            'Customers are ready now, and "give me three months" isn’t an answer.',
          ]}
          close="None of this means your POC was a waste. It did its job: it proved the idea. Production is a different job."
        />
      </Chapter>

      <Chapter n="02" label="Why me" title="I build with agents, and I know where they cut corners." id="proof">
        <div className="prose">
          <p>
            Most senior engineers will tell you to throw the prototype away
            and quote you a six-figure rebuild. I won&rsquo;t, for two
            reasons. First, I build with AI agents every day — at ZeroClick I
            shipped <a href={RECEIPTS.pieYt}>pie.yt</a>, a production
            product whose entire codebase was agent-written, so I know
            exactly what AI-built code gets right, where it cuts corners,
            and how to fix those parts without starting over. Second, I
            spent five years as a Senior Staff engineer at PayPal — I know
            what production-grade means at the level of money and user
            data, and I hold the finished product to that bar.
          </p>
        </div>
      </Chapter>

      <OfferBand
        n="03"
        label="Start here"
        title="Find out what you actually have."
        name="Production Readiness Audit"
        price="$2,500"
        timeline="One week"
        deliverables={[
          'Full review of the codebase through a production lens: security, data handling, auth, error paths, scalability',
          'A keep / fix / rewrite map — most AI-built POCs are more salvageable than founders fear',
          'The critical-risk list: what would hurt you with real users, ranked',
          'Test and deployment plan sized to your product, not enterprise ceremony',
          'A fixed quote for the finish-line work, so the total cost is known before you spend it',
        ]}
        emailSubject="Production Readiness Audit"
        source="poc-to-production"
        id="offer"
      />

      <Chapter n="04" label="Rates" title="What the finish line costs" id="rates">
        <RatesTable
          intro="Fixed-bid from the audit. These are typical ranges — the audit tells you exactly where yours lands."
          rates={[
            {
              name: <>POC <Arrow /> launched product</>,
              scope:
                'Hardening what’s sound, rewriting what isn’t, tests and CI, auth and payments done properly, deployed on real infrastructure with monitoring.',
              duration: '4–8 weeks',
              price: '$20k–$50k',
            },
            {
              name: 'Critical-path rescue',
              scope:
                'Just the parts that block launch — usually auth, data integrity, and deployment — when the budget needs the rest to wait.',
              duration: '2–4 weeks',
              price: '$10k–$20k',
            },
            {
              name: 'Keep-shipping retainer',
              scope:
                'After launch: I stay on a few days a month so features keep shipping at production quality while you find your footing (or your first engineer).',
              duration: 'ongoing',
              price: '$3k–$6k/mo',
            },
          ]}
        />
      </Chapter>

      <Chapter n="05" label="Process" title="How working with me goes" id="process">
        <Timeline
          steps={[
            {
              name: 'Audit',
              description:
                'Fixed price, one week. You learn what you have, what it needs, and what the finish line costs — useful even if someone else does the work.',
            },
            {
              name: 'The finish line',
              description:
                'Fixed bid. I do the production work — with agents where they’re strong, by hand where it counts — and you can watch every PR land.',
            },
            {
              name: 'Launch & handoff',
              description:
                'Deployed, monitored, documented. You get a codebase a future hire can pick up, and the option of a retainer until then.',
            },
          ]}
        />
      </Chapter>

      <Wave />

      <Faq
        items={[
          {
            question: 'Will you just tell me to rewrite it from scratch?',
            answer:
              'Almost never wholesale. AI-built code is usually a mix: solid CRUD and UI, shaky auth, data, and edge cases. The audit maps which is which, and the plan keeps everything that’s sound. A full rewrite recommendation happens only when it’s genuinely cheaper — and the audit shows the math.',
          },
          {
            question: 'My POC is in a stack you might not know.',
            answer:
              'If it came out of Claude, Cursor, Lovable, Replit, or Bolt, it’s almost certainly TypeScript/React/Node or Python — my home turf. If it’s something else, I’ll say so on the intro call rather than learn on your invoice.',
          },
          {
            question: 'Can I keep building with AI while you work?',
            answer:
              'Yes — and I’d rather set you up to do it well. Part of the finish-line work is putting guardrails in place (tests, CI, conventions) so your own agent-built changes stop breaking things. That’s the same harness work I do for engineering teams.',
          },
          {
            question: 'Who owns the code? What about my idea?',
            answer:
              'You own everything — work-for-hire, in your repos from day one. NDAs are fine. Your idea is yours; I build products for clients, I don’t compete with them.',
          },
          {
            question: 'What does this cost, really?',
            answer:
              'The audit is $2,500 and credited toward the project. Most finish-line engagements land between $20k and $50k fixed. If your budget is under about $10k total, the honest answer is the audit alone plus a prioritized plan you can execute incrementally — and I’ll tell you that upfront.',
          },
        ]}
      />

      <CrossLinks current="poc-to-production" />

      <CtaBand
        title="What's the real state of your POC?"
        body="Send me the one-paragraph story: what you built, what it does, and what scares you about real users. I'll tell you within a day whether the audit would pay for itself."
        emailSubject="POC to production inquiry"
        source="poc-to-production"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
