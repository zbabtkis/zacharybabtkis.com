import type { Metadata } from 'next';
import { ManifestChecker } from '@/components/manifest-checker';
import { Faq } from '@/components/sections';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Safari WebExtension Manifest Checker: Will Your Chrome Extension Work in Safari?',
  description:
    'Free tool: paste your Chrome extension’s manifest.json and get an instant Safari and iOS compatibility report covering blocking webRequest, background lifecycle, unsupported APIs, and App Store considerations.',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Safari WebExtension Manifest Checker',
  url: `${SITE.url}/tools/safari-manifest-checker/`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Zack Babtkis', url: SITE.url },
  description:
    'Instant Safari and iOS compatibility report for Chrome extension manifests.',
};

export default function ManifestCheckerPage() {
  return (
    <>
      <section className="hero article-hero">
        <div className="wrap">
          <h1>Will your Chrome extension work in Safari?</h1>
          <p className="lede">
            Paste your manifest.json and find out in five seconds which
            APIs carry over, which need a redesign, and which don&rsquo;t
            exist in Safari at all. The checks come from the checklist I
            use on paid port assessments. Everything runs in your browser;
            nothing is uploaded.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ManifestChecker />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="prose">
            <h2>What this checks, and what it can&rsquo;t</h2>
            <p>
              The manifest declares what your extension is allowed to do,
              so it reveals the structural port risks: blocking
              webRequest, persistent backgrounds, page overrides, and APIs
              Safari doesn&rsquo;t implement. What it can&rsquo;t see is
              your code: background lifecycle assumptions, API behavior
              differences, storage timing, and everything iOS. That half is
              what the{' '}
              <a href="/safari-extensions/">paid port assessment</a> covers,
              and why this tool is free.
            </p>
          </div>
        </div>
      </section>

      <Faq
        items={[
          {
            question: 'Is my manifest uploaded anywhere?',
            answer:
              'No. The analysis is JavaScript running in your browser tab. There is no server, no storage, and no analytics on the manifest contents.',
          },
          {
            question: 'My extension passed. Does that mean the port is easy?',
            answer:
              'It means the manifest has no structural blockers. That is a signal, not a guarantee. Most port pain lives in code the manifest can’t show: background lifecycle, API behavior differences, and App Store review. That’s what the one-week assessment covers.',
          },
          {
            question: 'It flagged blockers. Is the port dead?',
            answer:
              'Usually not. Most blockers have Safari-shaped redesigns: blocking webRequest becomes declarativeNetRequest, and chrome.identity becomes web-based OAuth. The question is cost, which is what the assessment answers with a fixed bid.',
          },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
