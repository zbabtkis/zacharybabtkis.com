import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What zacharybabtkis.com collects and why: Google Analytics for traffic measurement, Cal.com for bookings, email for contact. No ads, no selling of data.',
};

export default function PrivacyPage() {
  return (
    <>
      <section className="hero article-hero">
        <div className="wrap">
          <h1>Privacy</h1>
          <p className="lede">
            This is a one-person consulting site. I collect the minimum I
            need to see whether the site works and to respond when you
            contact me. No ads, no selling of data.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="prose">
            <h2>Analytics</h2>
            <p>
              I use Google Analytics 4 to measure traffic and engagement:
              which pages get visited, roughly where visitors come from,
              and which links get clicked. Google Analytics sets cookies
              (such as <code>_ga</code>) to distinguish repeat visits. I
              see aggregated reports; I do not see your name or exact
              address, and I do not use this data for advertising.
            </p>
            <p>
              If you are visiting from the EEA, the UK, or Switzerland,
              analytics cookies stay off unless you allow them in the
              consent bar. If you allowed them and change your mind, clear
              this site&rsquo;s data in your browser and the question will
              be asked again.
            </p>

            <h2>Booking and contact</h2>
            <p>
              Booking a call happens through Cal.com, which collects the
              name, email address, and any notes you enter, and shares
              them with me so the meeting can happen. Cal.com has its own{' '}
              <a href="https://cal.com/privacy">privacy policy</a>.
              Emailing me sends an ordinary email. I keep correspondence
              for as long as a project might need it and share it with no
              one.
            </p>

            <h2>The manifest checker</h2>
            <p>
              The <a href="/tools/safari-manifest-checker/">Safari
              WebExtension Manifest Checker</a> runs entirely in your
              browser. Manifests you paste are never uploaded or stored.
              Analytics records that a check ran and how many findings it
              produced, not the manifest contents.
            </p>

            <h2>Questions</h2>
            <p>
              Write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>{' '}
              and I&rsquo;ll answer within one business day.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
