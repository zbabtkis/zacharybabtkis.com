/**
 * Hand-drawn SVG: a crawl and a referral are opposite events on the same
 * timeline, and conflating them makes both numbers meaningless.
 */
export function CrawlVsReferralDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-label="Diagram: two opposite events involving the same assistant. In a crawl, the assistant fetches your page with no person present; the signal is the user-agent string, there is no session and no conversion, and the value is that your content becomes available to be cited later. In a referral, a person arrives at your site from an assistant's answer; the signal is the referrer, a real session begins, and conversion is measurable. The two are separated on a timeline showing the crawl happening long before the referral. A closing note warns that counting them together produces a number that describes neither."
      >
        <defs>
          <marker id="cr-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="cr-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>

        {/* crawl */}
        <text x="24" y="30" fontFamily={mono} fontSize="13" fill={navy}>crawl: no person is present</text>

        <rect x="24" y="48" width="130" height="46" rx="6" fill={navy} opacity="0.12" stroke={navy} strokeWidth="1.5" />
        <text x="89" y="76" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>the assistant</text>

        <line x1="154" y1="71" x2="236" y2="71" stroke={navy} strokeWidth="1.5" markerEnd="url(#cr-navy)" />
        <text x="195" y="62" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>fetches</text>

        <rect x="238" y="48" width="130" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="303" y="76" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>your page</text>

        <text x="396" y="60" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">signal: user-agent</text>
        <text x="396" y="76" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">no session, no conversion</text>
        <text x="396" y="92" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">value: you become citable</text>

        <line x1="24" y1="120" x2="696" y2="120" stroke={rule} strokeWidth="1.5" />

        {/* referral */}
        <text x="24" y="150" fontFamily={mono} fontSize="13" fill={amber}>referral: a person is present</text>

        <rect x="24" y="168" width="130" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="89" y="196" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>a person</text>

        <line x1="154" y1="191" x2="236" y2="191" stroke={amber} strokeWidth="1.5" markerEnd="url(#cr-amber)" />
        <text x="195" y="182" textAnchor="middle" fontFamily={mono} fontSize="10" fill={amber}>arrives</text>

        <rect x="238" y="168" width="130" height="46" rx="6" fill={amber} opacity="0.12" stroke={amber} strokeWidth="1.5" />
        <text x="303" y="196" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>your page</text>

        <text x="396" y="180" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">signal: referrer</text>
        <text x="396" y="196" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">a real session begins</text>
        <text x="396" y="212" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">conversion is measurable</text>

        {/* timeline */}
        <line x1="24" y1="256" x2="696" y2="256" stroke={ink} strokeWidth="1.5" />
        <circle cx="140" cy="256" r="6" fill={navy} />
        <text x="140" y="282" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>crawled</text>
        <circle cx="560" cy="256" r="6" fill={amber} />
        <text x="560" y="282" textAnchor="middle" fontFamily={mono} fontSize="10" fill={amber}>referred</text>
        <text x="350" y="248" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.6">days or weeks apart, if the second happens at all</text>

        <text x="24" y="322" fontFamily={mono} fontSize="12" fill={ink}>One is supply and one is demand. A single &quot;AI traffic&quot; number describes neither.</text>
        <text x="24" y="344" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">Separate them at collection time, because you cannot separate them later.</text>
      </svg>
      <figcaption>
        The crawl is what makes the referral possible, which is exactly why
        adding them together destroys the only two numbers worth having.
      </figcaption>
    </figure>
  );
}
