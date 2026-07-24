import type { Metadata } from 'next';
import { SITE, mailto } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Zack Babtkis about Safari extension porting, MCP server development, or AI-agent enablement. Replies within one business day.',
};

export default function ContactPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Let&rsquo;s talk about your project.</h1>
          <p className="lede">
            Email is the fastest way to reach me. Tell me what you&rsquo;re
            building, what&rsquo;s blocking you, and any timeline you&rsquo;re
            working against — three or four sentences is plenty. {SITE.bookingNote}
          </p>
          <div className="hero-actions">
            <a className="button" href={mailto('Project inquiry')}>
              {SITE.email}
            </a>
            <span className="availability">{SITE.availability}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="prose">
            <h2>What happens next</h2>
            <p>
              I&rsquo;ll reply with a few questions or a link to book a
              20-minute intro call. On the call we figure out whether your
              project and my expertise actually fit — no pitch, no pressure.
              If they do, most engagements start with a fixed-price
              assessment so you get value before committing to anything
              bigger. If they don&rsquo;t, I&rsquo;ll tell you straight and
              point you toward someone better suited.
            </p>
            <h2>Elsewhere</h2>
            <p>
              <a href={SITE.linkedin}>LinkedIn</a> ·{' '}
              <a href={SITE.github}>GitHub</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
