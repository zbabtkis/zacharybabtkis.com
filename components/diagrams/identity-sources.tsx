/**
 * Hand-drawn SVG: two entry paths hand you page identity from different
 * sources, in different string forms, and the lookup only matches one.
 */
export function IdentitySourcesDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 392"
        role="img"
        aria-label="Diagram: two entry paths to the same page produce identity from different sources. A direct page load reads server-rendered metadata and yields a display name. An in-app navigation reads the DOM after the view swaps and yields a URL handle, the at-name from the address. Because the lookup is keyed by handle, the in-app path matches and the direct load misses, and the two forms are not derivable from one another. Below, a normalization step takes both sources into one canonical form before the lookup, so both paths match. A final note says to test all three transitions: direct load, in-app navigation to the page, and navigation away and back."
      >
        <defs>
          <marker id="is-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="is-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>

        <text x="24" y="28" fontFamily={mono} fontSize="13" fill={ink}>same page, two entry paths</text>

        {/* path A */}
        <rect x="24" y="46" width="200" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="124" y="66" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>direct load</text>
        <text x="124" y="83" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.6">user pastes the URL</text>

        <line x1="124" y1="92" x2="124" y2="126" stroke={navy} strokeWidth="1.5" markerEnd="url(#is-navy)" />
        <rect x="24" y="128" width="200" height="46" rx="6" fill={navy} opacity="0.1" stroke={navy} strokeWidth="1.5" />
        <text x="124" y="148" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>server-rendered metadata</text>
        <text x="124" y="165" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>&quot;Display Name&quot;</text>

        {/* path B */}
        <rect x="496" y="46" width="200" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="596" y="66" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>in-app navigation</text>
        <text x="596" y="83" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.6">user clicks a link</text>

        <line x1="596" y1="92" x2="596" y2="126" stroke={navy} strokeWidth="1.5" markerEnd="url(#is-navy)" />
        <rect x="496" y="128" width="200" height="46" rx="6" fill={navy} opacity="0.1" stroke={navy} strokeWidth="1.5" />
        <text x="596" y="148" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>scraped from the DOM</text>
        <text x="596" y="165" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>&quot;@handle&quot;</text>

        {/* the mismatch */}
        <rect x="248" y="112" width="224" height="78" rx="6" fill={amber} opacity="0.1" stroke={amber} strokeWidth="1.5" />
        <text x="360" y="136" textAnchor="middle" fontFamily={mono} fontSize="11" fill={amber}>lookup keyed by handle</text>
        <text x="360" y="158" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink}>direct load: misses</text>
        <text x="360" y="176" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink}>in-app nav: matches</text>

        <line x1="224" y1="151" x2="244" y2="151" stroke={amber} strokeWidth="1.5" markerEnd="url(#is-amber)" />
        <line x1="496" y1="151" x2="476" y2="151" stroke={amber} strokeWidth="1.5" markerEnd="url(#is-amber)" />

        <text x="360" y="212" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.7">neither form is derivable from the other</text>

        <line x1="24" y1="232" x2="696" y2="232" stroke={rule} strokeWidth="1.5" />

        {/* the fix */}
        <text x="24" y="260" fontFamily={mono} fontSize="13" fill={navy}>the fix: one canonical form, before the lookup</text>

        <line x1="124" y1="174" x2="300" y2="286" stroke={navy} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#is-navy)" />
        <line x1="596" y1="174" x2="420" y2="286" stroke={navy} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#is-navy)" />

        <rect x="286" y="288" width="148" height="44" rx="6" fill={navy} opacity="0.14" stroke={navy} strokeWidth="1.5" />
        <text x="360" y="308" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>normalize</text>
        <text x="360" y="324" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">every source, one key</text>

        <text x="24" y="360" fontFamily={mono} fontSize="12" fill={ink}>Test three transitions: direct load, navigate to it, navigate away and back.</text>
        <text x="24" y="378" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">The bugs concentrate there.</text>
      </svg>
      <figcaption>
        The two paths do not disagree about which page you are on. They
        disagree about how to spell it, which is harder to see and just as
        broken.
      </figcaption>
    </figure>
  );
}
