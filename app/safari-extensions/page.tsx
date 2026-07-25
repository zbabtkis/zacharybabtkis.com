import type { Metadata } from 'next';
import {
  ProofBar,
  Symptoms,
  Offer,
  ExampleProjects,
  Process,
  Faq,
  CtaBand,
} from '@/components/sections';
import { CrossLinks } from '@/components/cross-links';
import { Wave, BrowserWindow } from '@/components/artifacts';
import { SITE, RECEIPTS } from '@/lib/site';

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
              compiles. It doesn&rsquo;t give you a working extension, and
              it won&rsquo;t get you through App Store review. I&rsquo;ve
              shipped Safari and iOS extensions used by millions of people
              at Honey and at Pie. I&rsquo;ll port yours, make it work, and
              hand your team a project they can maintain.
            </p>
            <div className="hero-actions">
              <a className="button" href="#offer">
                Start with a port assessment
              </a>
              <span className="availability">{SITE.availability}</span>
            </div>
          </div>
          <div className="hero-art">
            <BrowserWindow url="your-extension — Safari · macOS + iOS" variant="safari">
              <div className="ext-popup" style={{ margin: 0, maxWidth: 'none', boxShadow: 'none', border: 'none' }}>
                <div className="ext-popup-row">
                  <span>webRequest → DeclarativeNetRequest</span>
                  <span className="ok">✓ migrated</span>
                </div>
                <div className="ext-popup-row">
                  <span>Xcode project + signing</span>
                  <span className="ok">✓ archives</span>
                </div>
                <div className="ext-popup-row">
                  <span>App Store review</span>
                  <span className="ok">✓ approved</span>
                </div>
              </div>
            </BrowserWindow>
          </div>
        </div>
      </section>

      <ProofBar
        stats={[
          {
            value: '1st',
            label: 'iOS browser extension at Honey — designed and built it',
            href: RECEIPTS.paypalHoney,
          },
          {
            value: '2M+',
            label: 'users of Pie, where I owned the Safari & iOS extensions',
            href: RECEIPTS.pieStore,
          },
          {
            value: '3',
            label: 'Safari extension eras shipped: classic, App Extension API, MV3/DNR',
          },
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
        close="I've hit every one of these already — first at Honey, then again at Pie."
      />

      <section className="section">
        <div className="wrap">
          <h2>Why me</h2>
          <div className="prose">
            <p>
              At Honey I designed and built the company&rsquo;s first iOS
              browser extension, led a second PayPal-branded one, and ported
              the deprecated Safari classic extension to Apple&rsquo;s Safari
              App Extension API — JavaScript and Swift, through PayPal-scale
              review processes. At Pie I owned everything Safari and iOS:
              the Swift and SwiftUI app shells, Xcode project configuration,
              Xcode Cloud deployment, and the content-blocking work Safari
              forces through DeclarativeNetRequest. The converter tool
              leaves a gap between WebExtension JavaScript and Apple&rsquo;s
              toolchain. Not many engineers work on both sides of it.
              I&rsquo;ve spent years there.
            </p>
          </div>
        </div>
      </section>

      <Wave />

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
          source="safari-extensions"
        />
      </div>

      <ExampleProjects
        intro="Every port is fixed-bid from the assessment, so you know the number before committing. These are the ranges most projects land in."
        items={[
          {
            name: 'Extension → Safari macOS',
            scope:
              'An existing MV3 extension — content scripts, storage, popup UI — ported and shipped, no request-blocking redesign needed.',
            range: '$15k–$25k',
            duration: '4–6 weeks',
          },
          {
            name: 'Content blocker → Safari + iOS',
            scope:
              'Full webRequest → DeclarativeNetRequest redesign, iOS app shell, App Store submission through approval on both platforms.',
            range: '$25k–$45k',
            duration: '6–10 weeks',
          },
          {
            name: 'Safari maintenance retainer',
            scope:
              'App Store review handling, Xcode and macOS/iOS upgrades, Safari API changes — for teams with no Apple experience in-house.',
            range: '$2k–$3.5k/mo',
            duration: 'ongoing',
          },
        ]}
      />

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
              'Most extensions land between four and ten weeks, depending on how much of the API surface needs redesign and whether iOS is included. The assessment gives you a number for your codebase specifically.',
          },
          {
            question: 'Can your team maintain it after handoff?',
            answer:
              'That’s the goal. Your JavaScript stays the source of truth wherever possible, the Swift layer stays thin and documented, and I set up CI so releases don’t depend on one person with a Mac. Teams without Apple experience often keep a light retainer for App Store and Xcode upgrades.',
          },
          {
            question: 'Who owns the code? Will you sign an NDA?',
            answer:
              'Everything is work-for-hire, in your repos from day one. You own all of it. NDAs are fine — I’ll sign yours or provide a mutual template.',
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
