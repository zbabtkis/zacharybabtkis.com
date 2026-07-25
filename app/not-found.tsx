import Link from 'next/link';
import { TerminalCard } from '@/components/artifacts';
import { SERVICES } from '@/lib/site';

export default function NotFound() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-copy">
          <h1>404: this page doesn&rsquo;t exist.</h1>
          <p className="lede">
            The link may be old, or the page moved. Everything worth
            finding is one step away:
          </p>
          <ul className="guide-list" style={{ marginTop: 'var(--space-lg)' }}>
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link href={`/${service.slug}/`}>{service.navLabel}</Link>
              </li>
            ))}
            <li>
              <Link href="/guides/">Guides</Link>
            </li>
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="hero-art">
          <TerminalCard
            title="zsh"
            lines={[
              <>
                <span className="dim">$</span> open ./this-page
              </>,
              <>
                <span className="dim">open: ./this-page: No such file or directory</span>
              </>,
              <>
                <span className="dim">$</span> cd ~
              </>,
              <>
                <span className="ok">✓ home</span>
              </>,
            ]}
          />
        </div>
      </div>
    </section>
  );
}
