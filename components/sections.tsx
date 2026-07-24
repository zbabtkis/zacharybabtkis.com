import { SITE, mailto } from '@/lib/site';

type Stat = {
  value: string;
  label: string;
};

export function ProofBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="wrap">
      <div className="proof-bar">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type SymptomsProps = {
  title: string;
  items: string[];
  close: string;
};

export function Symptoms({ title, items, close }: SymptomsProps) {
  return (
    <section className="section symptoms">
      <div className="wrap">
        <h2>{title}</h2>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="symptoms-close">{close}</p>
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
};

export function Offer({
  title,
  name,
  price,
  timeline,
  deliverables,
  emailSubject,
}: OfferProps) {
  return (
    <section className="section">
      <div className="wrap">
        <h2>{title}</h2>
        <div className="offer">
          <div className="offer-head">
            <h3>{name}</h3>
            <span className="price">{price}</span>
          </div>
          <p className="offer-meta">{timeline} · fixed price · no surprises</p>
          <ul>
            {deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="offer-credit">
            If we continue to a full engagement, the entire fee is credited
            toward the project.
          </p>
          <a className="button" href={mailto(emailSubject)}>
            Start with the {name.toLowerCase()}
          </a>
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
};

export function CtaBand({ title, body, emailSubject }: CtaBandProps) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="cta-actions">
          <a className="button" href={mailto(emailSubject)}>
            Email me about your project
          </a>
          <span className="cta-promise">
            {SITE.bookingNote} · {SITE.availability}.
          </span>
        </div>
      </div>
    </section>
  );
}
