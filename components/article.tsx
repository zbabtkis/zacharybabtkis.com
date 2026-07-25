import { CtaBand, Faq, type FaqItem } from '@/components/sections';
import { SITE } from '@/lib/site';

type ArticleLayoutProps = {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
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
            By Zack Babtkis — I shipped Safari and iOS extensions at Honey
            and Pie · Updated{' '}
            {new Date(dateModified ?? datePublished).toLocaleDateString(
              'en-US',
              { year: 'numeric', month: 'long' },
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="prose article-prose">{children}</div>
        </div>
      </section>

      {faq ? <Faq items={faq} /> : null}

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
