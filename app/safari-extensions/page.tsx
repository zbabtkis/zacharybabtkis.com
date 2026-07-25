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
import { SafariChecklist } from '@/components/safari-checklist';
import { SITE, RECEIPTS } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Chrome to Safari & iOS Extension Porting',
  description:
    'I port Chrome extensions to Safari, macOS, and iOS — and get them through App Store review. I built Honey’s first iOS browser extension and owned Pie’s Safari extensions (2M+ users).',
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Chrome to Safari & iOS Extension Porting',
  provider: { '@type': 'Person', name: 'Zack Babtkis', url: SITE.url },
  areaServed: 'Worldwide',
  description:
    'Porting Chrome extensions to Safari Web Extensions on macOS and iOS, including DeclarativeNetRequest migration, Xcode project setup, and App Store submission.',
};

export default function SafariExtensionsPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <h1>
              Your Chrome extension doesn&rsquo;t work in Safari. I fix
              that.
            </h1>
            <p className="lede">
              Apple&rsquo;s converter gives you an Xcode project that
              compiles — not a working extension, and not App Store
              approval. I&rsquo;ve shipped both, at Honey and at Pie.
            </p>
            <div className="hero-actions">
              <a className="button" href="#offer">
                Start with a port assessment
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <SafariChecklist />
          </div>
        </div>
      </section>

      <StatBand
        stats={[
          {
            value: '1st',
            label: 'iOS browser extension at Honey — designed and built it',
            href: RECEIPTS.paypalHoney,
          },
          {
            value: '2M+',
            label: 'users of Pie, where I owned Safari & iOS',
            href: RECEIPTS.pieStore,
          },
          {
            value: '3',
            label: 'Safari extension eras shipped: classic, App Extension, MV3/DNR',
          },
          { value: '5 yrs', label: 'Senior Staff engineer at PayPal (Honey)' },
        ]}
      />

      <Chapter n="01" label="The problem" title="Sound familiar?" id="problem">
        <Voices
          items={[
            'We ran the converter, and half the extension silently does nothing.',
            'Our blocking is built on webRequest, and nobody here knows DeclarativeNetRequest.',
            'It builds on one machine and won’t archive on another.',
            'App Store review keeps rejecting us, and the citations explain nothing.',
            'Users keep asking when we’re coming to Safari. We keep not answering.',
          ]}
          close="I've hit every one of these already — first at Honey, then again at Pie."
        />
      </Chapter>

      <Chapter n="02" label="Why me" title="The converter leaves a gap. I've spent years in it." id="proof">
        <div className="prose">
          <p>
            At Honey I built the company&rsquo;s first iOS browser extension
            and ported its legacy Safari extension to Apple&rsquo;s modern
            API. At Pie I owned everything Safari and iOS — Swift app
            shells, Xcode Cloud deployment, and the content-blocking work
            Safari forces through DeclarativeNetRequest. I&rsquo;ve also
            taken an iOS Safari extension through App Review alone:{' '}
            <a href="https://unhabit.en.softonic.com/iphone">Unhabit</a>, a
            distraction blocker I designed, built, and shipped end to end.
            The gap between WebExtension JavaScript and Apple&rsquo;s
            toolchain is exactly where ports stall, and not many engineers
            work on both sides of it.
          </p>
        </div>
      </Chapter>

      <OfferBand
        n="03"
        label="Start here"
        title="Know exactly what a port will take."
        name="Safari Port Assessment"
        price="$2,500"
        timeline="One week"
        deliverables={[
          'Every API that breaks, cataloged — with the Safari-equivalent approach for each',
          'DeclarativeNetRequest migration plan, if you block or intercept requests',
          'App Store review risk assessment',
          'Fixed-bid quote for the full port (macOS and iOS separately)',
          'A written go/no-go recommendation — even if the answer is "don’t port"',
        ]}
        emailSubject="Safari Port Assessment"
        source="safari-extensions"
        id="offer"
      />

      <Chapter n="04" label="Rates" title="What ports cost" id="rates">
        <RatesTable
          intro="Fixed-bid from the assessment — you know the number before committing. These are the ranges most projects land in."
          rates={[
            {
              name: 'Extension → Safari macOS',
              scope:
                'Existing MV3 extension, no request-blocking redesign. Ported and shipped.',
              duration: '4–6 weeks',
              price: '$15k–$25k',
            },
            {
              name: 'Content blocker → Safari + iOS',
              scope:
                'Full webRequest → DNR redesign, iOS app shell, App Store approval on both platforms.',
              duration: '6–10 weeks',
              price: '$25k–$45k',
            },
            {
              name: 'Safari maintenance retainer',
              scope:
                'App Store review, Xcode and OS upgrades, Safari API changes.',
              duration: 'ongoing',
              price: '$2k–$3.5k/mo',
            },
          ]}
        />
      </Chapter>

      <Chapter n="05" label="Process" title="How working with me goes" id="process">
        <Timeline
          steps={[
            {
              name: 'Assessment',
              description:
                'Fixed price, one week. The full technical picture and a quote before you commit to anything.',
            },
            {
              name: 'The port',
              description:
                'Fixed bid. I build the Safari macOS and/or iOS extension, handle Xcode and signing, and set up CI.',
            },
            {
              name: 'App Store & handoff',
              description:
                'I drive submission through approval, document the Safari layer, and hand off — retainer optional.',
            },
          ]}
        />
      </Chapter>

      <Chapter n="06" label="Guides" title="Read before you hire anyone" id="guides">
        <p className="section-intro">
          Written from shipping this work, not from the docs. If a guide
          solves your problem outright, you don&rsquo;t need me.
        </p>
        <ul className="guide-list">
          {GUIDES.filter((guide) => guide.topic === 'safari-extensions').map(
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

      <Faq
        items={[
          {
            question: 'Do we need our own Apple Developer account?',
            answer:
              'Yes — the extension ships under your account and your brand. Setting one up takes Apple a few days, so we start early.',
          },
          {
            question: 'Our extension uses webRequest to block or modify traffic. Is a port even possible?',
            answer:
              'Usually, but as a redesign rather than a translation — Safari requires DeclarativeNetRequest. I shipped this migration at Pie. The assessment tells you what survives, what needs redesign, and what doesn’t make it.',
          },
          {
            question: 'How long does a full port take?',
            answer:
              'Four to ten weeks for most extensions, depending on API surface and whether iOS is included. The assessment gives you a number for your codebase.',
          },
          {
            question: 'Can your team maintain it after handoff?',
            answer:
              'That’s the goal: your JavaScript stays the source of truth, the Swift layer stays thin and documented, and CI means releases don’t depend on one person with a Mac.',
          },
          {
            question: 'Who owns the code? Will you sign an NDA?',
            answer:
              'Everything is work-for-hire, in your repos from day one. NDAs are fine.',
          },
        ]}
      />

      <CrossLinks current="safari-extensions" />

      <CtaBand
        title="Your users are already on Safari and iPhone."
        body="Send me your extension's Chrome Web Store link and a sentence about what it does. I'll tell you within a day whether a port is worth exploring."
        emailSubject="Safari port inquiry"
        source="safari-extensions"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
