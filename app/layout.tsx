import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import Link from 'next/link';
import { SITE, calLink } from '@/lib/site';
import { ConsoleEgg } from '@/components/console-egg';
import { NavServices } from '@/components/nav-services';
import { MobileMenu } from '@/components/mobile-menu';
import './globals.css';

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-display',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
        <ConsoleEgg />
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="site-title">
              Zack Babtkis
              <span className="site-tagline">
                Browser Extensions &amp; Agentic AI
              </span>
            </Link>
            <nav className="site-nav" aria-label="Main">
              <NavServices />
              <Link href="/guides/">Guides</Link>
              <Link href="/tools/safari-manifest-checker/">
                Manifest Checker
              </Link>
              <Link href="/about/">About</Link>
              <Link href="/contact/">Contact</Link>
              <a className="button nav-cta" href={calLink('nav')}>
                Book a call
              </a>
            </nav>
            <MobileMenu />
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <span>
              © {new Date().getFullYear()} Zack Babtkis · Los Angeles, CA
            </span>
            <nav aria-label="Footer">
              <a href="/tools/safari-manifest-checker/">
                Safari Manifest Checker
              </a>
              <a href={SITE.linkedin}>LinkedIn</a>
              <a href={SITE.github}>GitHub</a>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
