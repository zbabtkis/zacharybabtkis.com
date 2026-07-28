import { CtaBand, Faq, type FaqItem } from '@/components/sections';
import { SITE } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

type ArticleLayoutProps = {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
  byline?: string;
  children: React.ReactNode;
  faq?: FaqItem[];
  ctaTitle: string;
  ctaBody: string;
  ctaEmailSubject: string;
  ctaSource: string;
};

export function ArticleLayout({
  title,
  description,
  datePublished,
  dateModified,
  slug,
  byline,
  children,
  faq,
  ctaTitle,
  ctaBody,
  ctaEmailSubject,
  ctaSource,
}: ArticleLayoutProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    url: `${SITE.url}${slug}`,
    author: {
      '@type': 'Person',
      name: 'Zack Babtkis',
      url: SITE.url,
      jobTitle: 'Independent Software Engineering Consultant',
    },
  };

  return (
    <>
      <section className="hero article-hero">
        <div className="wrap">
          <h1>{title}</h1>
          <p className="article-meta">
            By Zack Babtkis.{' '}
            {byline ??
              'I shipped Safari and iOS extensions at Honey and ZeroClick.'}{' '}
            · Updated{' '}
            {new Date(dateModified ?? datePublished).toLocaleDateString(
              'en-US',
              { year: 'numeric', month: 'long' },
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {/* Decorative: the plate carries no information the prose doesn't,
              so it stays out of the accessibility tree. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="article-plate"
            src={`/guide-art/${slug.replace(/^\/|\/$/g, '').replace(/\//g, '--')}.png`}
            alt=""
            width={1200}
            height={480}
          />
          <div className="prose article-prose">{children}</div>
        </div>
      </section>

      {faq ? <Faq items={faq} /> : null}

      <RelatedGuides slug={slug} />

      <CtaBand
        title={ctaTitle}
        body={ctaBody}
        emailSubject={ctaEmailSubject}
        source={ctaSource}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

function RelatedGuides({ slug }: { slug: string }) {
  const topic = slug.split('/')[1];
  const related = GUIDES.filter(
    (guide) => guide.topic === topic && !slug.startsWith(guide.slug.replace(/\/$/, '')),
  ).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="section">
      <div className="wrap">
        <h2>More guides</h2>
        <ul className="guide-list">
          {related.map((guide) => (
            <li key={guide.slug}>
              <a href={guide.slug}>
                {guide.title}
                <span>{guide.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
