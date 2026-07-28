/**
 * Hand-drawn SVG: every runtime feature spends from one shared
 * dynamic-rule pool, and stale rules quietly eat the headroom.
 */
export function RuleBudgetDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 250"
        role="img"
        aria-label="Diagram: a single horizontal bar represents the extension's shared dynamic-rule budget. Segments for user pauses, a partnership allowlist, and user opt-ins fill part of it. A hatched segment of stale rules from old releases eats more. A small remaining segment is all a new feature has left, with an arrow noting that installs start failing here."
      >
        <text x="24" y="36" fontFamily={mono} fontSize="14" fill={ink}>one shared dynamic-rule budget</text>

        {/* the pool */}
        <rect x="24" y="60" width="672" height="70" rx="8" fill="none" stroke={ink} strokeWidth="1.5" />

        {/* segments */}
        <rect x="26" y="62" width="170" height="66" fill={navy} opacity="0.85" />
        <text x="111" y="100" textAnchor="middle" fontFamily={mono} fontSize="11" fill="#fff">user pauses</text>

        <rect x="196" y="62" width="140" height="66" fill={navy} opacity="0.55" />
        <text x="266" y="100" textAnchor="middle" fontFamily={mono} fontSize="11" fill="#fff">allowlist</text>

        <rect x="336" y="62" width="110" height="66" fill={navy} opacity="0.3" />
        <text x="391" y="100" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>opt-ins</text>

        {/* stale rules, hatched */}
        <defs>
          <pattern id="rb-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke={rule} strokeWidth="4" />
          </pattern>
          <marker id="rb-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>
        <rect x="446" y="62" width="170" height="66" fill="url(#rb-hatch)" />
        <text x="531" y="96" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>stale rules from</text>
        <text x="531" y="112" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>old releases</text>

        {/* remaining sliver */}
        <rect x="616" y="62" width="78" height="66" fill="none" />
        <text x="655" y="100" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.5">free</text>

        {/* failure arrow */}
        <line x1="655" y1="180" x2="655" y2="138" stroke={amber} strokeWidth="1.5" markerEnd="url(#rb-amber)" />
        <text x="655" y="205" textAnchor="middle" fontFamily={mono} fontSize="12" fill={amber}>your new feature has to fit here</text>
        <text x="655" y="225" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">installs start failing when it doesn&apos;t</text>
      </svg>
      <figcaption>
        Every feature spends from the same pool. Without garbage
        collection, rules from old releases keep their share forever.
      </figcaption>
    </figure>
  );
}
