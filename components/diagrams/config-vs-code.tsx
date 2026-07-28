/**
 * Hand-drawn SVG: the split that actually holds. Standardized parts become
 * config; the genuinely bespoke remainder stays code, and shrinks over time.
 */
export function ConfigVsCodeDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  const standardized = ['OAuth handshake', 'token refresh', 'pagination', 'rate-limit backoff', 'retry policy', 'error shapes'];
  const bespoke = ['what &quot;a customer&quot; means here', 'which call order works', 'the undocumented required field'];

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 380"
        role="img"
        aria-label="Diagram: integrations split along what is standardized rather than along whole integrations. The left column holds the standardized parts, which become configuration handled once by shared machinery: the OAuth handshake, token refresh, pagination, rate-limit backoff, retry policy, and error shapes. The right column holds the bespoke remainder, which stays code: what a customer means in this particular system, which call order works, and the undocumented required field. Below, the operational consequence is given: a config change ships without a deploy and cannot take the process down, while a code change needs review, tests, and a release. The closing note says the remainder should be small enough to name precisely."
      >
        <text x="24" y="28" fontFamily={mono} fontSize="13" fill={ink}>split by what is standardized, not by whole integrations</text>

        {/* config side */}
        <rect x="24" y="46" width="324" height="200" rx="6" fill={navy} opacity="0.08" stroke={navy} strokeWidth="1.5" />
        <text x="44" y="72" fontFamily={mono} fontSize="12" fill={navy}>config: the same everywhere</text>
        {standardized.map((s, i) => (
          <g key={s}>
            <circle cx="52" cy={98 + i * 24} r="3" fill={navy} />
            <text x="66" y={102 + i * 24} fontFamily={mono} fontSize="11" fill={ink}>
              {s}
            </text>
          </g>
        ))}
        <text x="44" y="238" fontFamily={mono} fontSize="10" fill={ink} opacity="0.65">written once, in shared machinery</text>

        {/* code side */}
        <rect x="372" y="46" width="324" height="200" rx="6" fill="none" stroke={amber} strokeWidth="1.5" />
        <text x="392" y="72" fontFamily={mono} fontSize="12" fill={amber}>code: different every time</text>
        {bespoke.map((s, i) => (
          <g key={s}>
            <circle cx="400" cy={102 + i * 30} r="3" fill={amber} />
            <text x="414" y={106 + i * 30} fontFamily={mono} fontSize="11" fill={ink}>
              {s.replace(/&quot;/g, '"')}
            </text>
          </g>
        ))}
        <text x="392" y="212" fontFamily={mono} fontSize="10" fill={ink} opacity="0.65">no DSL removes this, it only hides it</text>
        <text x="392" y="238" fontFamily={mono} fontSize="10" fill={ink} opacity="0.65">and hiding it makes debugging worse</text>

        <line x1="24" y1="268" x2="696" y2="268" stroke={rule} strokeWidth="1.5" />

        {/* consequence */}
        <text x="24" y="296" fontFamily={mono} fontSize="12" fill={navy}>a config change: ships without a deploy, cannot take the process down</text>

        <text x="24" y="332" fontFamily={mono} fontSize="12" fill={amber}>a code change: review, tests, a release</text>

        <text x="24" y="368" fontFamily={mono} fontSize="11" fill={ink} opacity="0.7">The remainder should be small enough to name precisely.</text>
      </svg>
      <figcaption>
        Splitting by integration gives every partner its own copy of the
        same OAuth bug. Splitting by what is standardized leaves only the
        part that was ever really unique.
      </figcaption>
    </figure>
  );
}
