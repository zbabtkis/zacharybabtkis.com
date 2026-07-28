import { SITE, mailto, calLink } from '@/lib/site';

/* Editorial-dossier primitives: type and rules instead of boxes. */

export function Chapter({
  label,
  title,
  children,
  id,
}: {
  // Kicker above the title. Use it only when it adds information the
  // title doesn't carry; never restate the title.
  label?: string;
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="chapter" id={id}>
      <div className="wrap">
        {label ? <p className="chapter-no">{label}</p> : null}
        <h2 className="chapter-title">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function StatBand({
  stats,
}: {
  stats: { value: string; label: string; href?: string }[];
}) {
  return (
    <section className="stat-band-section">
      <div className="wrap">
        <div className="stat-band">
          {stats.map((stat) => (
            <div className="big-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              {stat.href ? (
                <a href={stat.href}>{stat.label}</a>
              ) : (
                <span>{stat.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type Rate = {
  name: React.ReactNode;
  scope: string;
  duration: string;
  price: string;
};

export function RatesTable({ intro, rates }: { intro: string; rates: Rate[] }) {
  return (
    <>
      <p className="section-intro">{intro}</p>
      <div className="table-scroll">
        <table className="rates-table">
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.scope}>
                <td>
                  <strong>{rate.name}</strong>
                  <span>{rate.scope}</span>
                </td>
                <td className="rate-duration">{rate.duration}</td>
                <td className="rate-price">{rate.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Timeline({
  steps,
}: {
  steps: { name: string; description: string }[];
}) {
  return (
    <ol className="timeline">
      {steps.map((step) => (
        <li key={step.name}>
          <strong>{step.name}</strong>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function OfferBand({
  label,
  title,
  name,
  price,
  timeline,
  deliverables,
  emailSubject,
  source,
  id,
}: {
  label: string;
  title: string;
  name: string;
  price: string;
  timeline: string;
  deliverables: string[];
  emailSubject: string;
  source: string;
  id?: string;
}) {
  const booking = Boolean(SITE.calUsername);

  return (
    <section className="offer-band" id={id}>
      <div className="wrap">
        <p className="chapter-no">{label}</p>
        <div className="offer-band-grid">
          <div className="offer-band-copy">
            <h2 className="chapter-title">{title}</h2>
            <ul className="checklist">
              {deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="offer-band-price">
            <span className="offer-band-name">{name}</span>
            <strong>{price}</strong>
            <span className="offer-band-meta">
              {timeline} · fixed price · credited toward the project
            </span>
            {booking ? (
              <>
                <a className="button" href={calLink(`${source}-offer`)}>
                  Book a free intro call
                </a>
                <a className="button secondary" href={mailto(emailSubject)}>
                  Email me instead
                </a>
              </>
            ) : (
              <a className="button" href={mailto(emailSubject)}>
                Start with the {name.toLowerCase()}
              </a>
            )}
            <span className="founding-note">
              Founding-client terms: I discount the first two projects in
              this service in exchange for a named case study and a
              testimonial. Ask on the call.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
