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
          <h1>Your Chrome extension doesn&rsquo;t work in Safari. I fix that.</h1>
          <p className="lede">
            Apple&rsquo;s converter gets you an Xcode project that compiles.
            It doesn&rsquo;t get you a working product — and it definitely
            doesn&rsquo;t get you through App Store review. I&rsquo;ve
            shipped Safari and iOS extensions used by millions at Honey
            (acquired by PayPal) and Pie (2M+ users). I&rsquo;ll port yours,
            make it genuinely work, and hand you a maintainable project your
            team can own.
          </p>
          <div className="hero-actions">
            <a className="button" href="#offer">
              Start with a port assessment
            </a>
            <span className="availability">{SITE.availability}</span>
          </div>
        </div>
      </section>

      <ProofBar
        stats={[
          { value: '1st', label: 'iOS browser extension at Honey — designed and built it' },
          { value: '2M+', label: 'users of Pie, where I owned the Safari & iOS extensions' },
          { value: '2', label: 'Safari API migrations shipped (legacy → App Extension, MV3/DNR)' },
          { value: '5 yrs', label: 'Senior Staff engineer at PayPal (Honey)' },
        ]}
      />

      <Symptoms
        title="Sound familiar?"
        items={[
          'You ran xcrun safari-web-extension-converter, and half your extension silently does nothing.',
          'Your webRequest-based blocking or rewriting has no Safari equivalent, and nobody on the team knows DeclarativeNetRequest.',
          'The Xcode project builds on one machine, won’t archive on another, and code signing errors mean nothing to your JS team.',
          'App Store review keeps rejecting the extension with guideline citations that don’t explain what to change.',
          'It works on macOS Safari but breaks on iPhone, and you can’t tell if it’s your bug or Apple’s.',
          'Users keep asking "when is this coming to Safari?" and you keep not answering.',
        ]}
        close="Every one of these has bitten me before it bit you. That's the point of hiring me."
      />

      <section className="section">
        <div className="wrap">
          <h2>Why me, specifically</h2>
          <div className="prose">
            <p>
              At Honey I designed and built the company&rsquo;s first iOS
              browser extension, led a second PayPal-branded one, and ported
              the deprecated Safari classic extension to Apple&rsquo;s Safari
              App Extension API — JavaScript and Swift, through PayPal-scale
              review processes. At Pie I was the team&rsquo;s owner for
              everything Safari and iOS: Swift and SwiftUI app shells, Xcode
              project configuration, Xcode Cloud deployment pipelines, and
              the content-blocking work Safari forces through
              DeclarativeNetRequest. That combination — deep WebExtension
              JavaScript plus real Apple toolchain fluency — is exactly the
              gap the converter tool leaves, and very few engineers have
              both.
            </p>
          </div>
        </div>
      </section>

      <div id="offer">
        <Offer
          title="Start small: know exactly what a port will take"
          name="Safari Port Assessment"
          price="$2,500"
          timeline="One week"
          deliverables={[
            'I run your extension through conversion and catalog every API that breaks, with the Safari-equivalent approach for each',
            'DeclarativeNetRequest migration plan if you do content blocking or request interception',
            'App Store review risk assessment — what will get flagged and how to preempt it',
            'Effort estimate and fixed-bid quote for the full port (macOS and iOS separately)',
            'A written go/no-go recommendation you can take to your team — even if the answer is "don’t port"',
          ]}
          emailSubject="Safari Port Assessment"
        />
      </div>

      <Process
        steps={[
          {
            name: 'Assessment',
            description:
              'Fixed price, one week. You get the full technical picture and a quote before committing to anything.',
          },
          {
            name: 'The port',
            description:
              'Fixed bid based on the assessment. I build the Safari macOS and/or iOS extension, handle Xcode and signing, and set up CI (Xcode Cloud or your choice).',
          },
          {
            name: 'App Store & handoff',
            description:
              'I drive App Store submission through approval, document the Safari-specific parts, and hand off to your team — with an optional maintenance retainer.',
          },
        ]}
      />

      <Faq
        items={[
          {
            question: 'Do we need our own Apple Developer account?',
            answer:
              'Yes — the extension ships under your account and your brand, which you keep full control of. If you don’t have one, setting it up is part of the engagement (it takes Apple a few days, so we start early).',
          },
          {
            question: 'Our extension uses webRequest to block or modify traffic. Is a Safari port even possible?',
            answer:
              'Usually yes, but not as a straight translation — Safari requires DeclarativeNetRequest for content blocking, which is a rules-based model rather than code that inspects requests. I’ve shipped this migration at production scale at Pie. The assessment tells you exactly which behaviors survive, which need redesign, and which are dead ends before you spend real money.',
          },
          {
            question: 'How long does a full port take?',
            answer:
              'Most extensions land between four and ten weeks, depending on how much of the API surface needs redesign and whether iOS is included. The assessment gives you a real number for your codebase, not a brochure estimate.',
          },
          {
            question: 'Can your team maintain it after handoff?',
            answer:
              'That’s the goal. Your JavaScript stays the source of truth wherever possible, the Swift layer stays thin and documented, and I set up CI so releases don’t require a Mac ritual. Teams without any Apple experience often keep a light retainer for App Store and Xcode upgrades.',
          },
          {
            question: 'Who owns the code? Will you sign an NDA?',
            answer:
              'You own everything, full stop — work-for-hire, in your repos from day one. NDAs are fine; I’ll sign yours or provide a mutual one.',
          },
        ]}
      />

      <CtaBand
        title="Your users are on Safari and iPhone. Meet them there."
        body="Send me your extension's Chrome Web Store link and a sentence about what it does. I'll tell you within a day whether a port makes sense to explore."
        emailSubject="Safari port inquiry"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
