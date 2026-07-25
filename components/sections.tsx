import { SITE, mailto, calLink } from '@/lib/site';

type Stat = {
  value: string;
  label: string;
  href?: string;
};

export function ProofBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="wrap">
      <div className="proof-bar">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            {stat.href ? (
              <span>
                <a href={stat.href}>{stat.label}</a>
              </span>
            ) : (
              <span>{stat.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type ExampleProject = {
  name: React.ReactNode;
  scope: string;
  range: string;
  duration: string;
};

export function ExampleProjects({
  intro,
  items,
}: {
  intro: string;
  items: ExampleProject[];
}) {
  return (
    <section className="section">
      <div className="wrap">
        <h2>Example projects</h2>
        <p className="section-intro">{intro}</p>
        <div className="example-projects">
          {items.map((item) => (
            <div className="example-project" key={item.scope}>
              <div className="example-head">
                <h3>{item.name}</h3>
                <span className="example-range">{item.range}</span>
              </div>
              <p>{item.scope}</p>
              <span className="example-duration">{item.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type OfferProps = {
  title: string;
  name: string;
  price: string;
  timeline: string;
  deliverables: string[];
  emailSubject: string;
  source?: string;
};

export function Offer({
  title,
  name,
  price,
  timeline,
  deliverables,
  emailSubject,
  source,
}: OfferProps) {
  const booking = Boolean(SITE.calUsername);

  return (
    <section className="section">
      <div className="wrap">
        <h2>{title}</h2>
        <div className="offer">
          <div className="offer-head">
            <h3>{name}</h3>
            <span className="price">{price}</span>
          </div>
          <p className="offer-meta">{timeline} · fixed price</p>
          <ul>
            {deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="offer-credit">
            If we continue to a full engagement, the entire fee is credited
            toward the project.
          </p>
          {booking ? (
            <div className="offer-actions">
              <a
                className="button"
                href={calLink(source ? `${source}-offer` : 'offer')}
              >
                Book a free intro call
              </a>
              <a className="button secondary" href={mailto(emailSubject)}>
                Email me instead
              </a>
            </div>
          ) : (
            <a className="button" href={mailto(emailSubject)}>
              Start with the {name.toLowerCase()}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

type Step = {
  name: string;
  description: string;
};

export function Process({ steps }: { steps: Step[] }) {
  return (
    <section className="section process">
      <div className="wrap">
        <h2>How working with me goes</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.name}>
              <strong>{step.name}</strong>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export type FaqItem = {
  question: string;
  answer: string;
};

export function Faq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section className="section">
      <div className="wrap">
        <h2>Questions clients ask</h2>
        <div className="faq">
          {items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

type CtaBandProps = {
  title: string;
  body: string;
  emailSubject: string;
  source?: string;
};

export function CtaBand({ title, body, emailSubject, source }: CtaBandProps) {
  const booking = Boolean(SITE.calUsername);

  return (
    <section className="cta-band">
      <div className="wrap">
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="cta-actions">
          {booking ? (
            <>
              <a className="button" href={calLink(source ?? 'site')}>
                Book a free intro call
              </a>
              <a className="button secondary" href={mailto(emailSubject)}>
                Email me instead
              </a>
            </>
          ) : (
            <a className="button" href={mailto(emailSubject)}>
              Email me about your project
            </a>
          )}
          <span className="cta-promise">
            {SITE.bookingNote} · {SITE.availability}.
          </span>
        </div>
      </div>
    </section>
  );
}
