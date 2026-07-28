/**
 * Hand-drawn SVG: the MAIN/isolated world boundary inside one page.
 * Both worlds share the DOM; neither can call the other's JavaScript.
 */
export function WorldBoundaryDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 340"
        role="img"
        aria-label="Diagram: one web page contains two JavaScript worlds. The isolated world holds the extension's content script and its browser APIs. The MAIN world holds the page's own JavaScript and window variables. A barrier between them blocks direct calls. Both connect downward to the same shared DOM, which is the only bridge."
      >
        {/* page frame */}
        <rect x="16" y="16" width="688" height="308" rx="10" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="36" y="44" fontFamily={mono} fontSize="13" fill={ink} opacity="0.6">the web page</text>

        {/* isolated world */}
        <rect x="48" y="66" width="280" height="130" rx="8" fill="none" stroke={navy} strokeWidth="1.5" />
        <text x="188" y="94" textAnchor="middle" fontFamily={mono} fontSize="14" fill={navy}>isolated world</text>
        <text x="188" y="120" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>your content script</text>
        <text x="188" y="140" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>browser.* APIs ✓</text>
        <text x="188" y="160" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.55">page variables ✗</text>

        {/* MAIN world */}
        <rect x="392" y="66" width="280" height="130" rx="8" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="532" y="94" textAnchor="middle" fontFamily={mono} fontSize="14" fill={ink}>MAIN world</text>
        <text x="532" y="120" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>the page&apos;s JavaScript</text>
        <text x="532" y="140" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>window variables ✓</text>
        <text x="532" y="160" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.55">browser.* APIs ✗</text>

        {/* barrier */}
        <line x1="360" y1="72" x2="360" y2="190" stroke={amber} strokeWidth="3" strokeDasharray="8 6" />
        <text x="360" y="215" textAnchor="middle" fontFamily={mono} fontSize="11" fill={amber}>no direct calls</text>

        {/* shared DOM */}
        <rect x="48" y="240" width="624" height="56" rx="8" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="360" y="274" textAnchor="middle" fontFamily={mono} fontSize="14" fill={ink}>shared DOM: the one bridge both worlds can touch</text>

        {/* connectors */}
        <line x1="188" y1="196" x2="188" y2="232" stroke={navy} strokeWidth="1.5" markerEnd="url(#wb-navy)" />
        <line x1="532" y1="196" x2="532" y2="232" stroke={ink} strokeWidth="1.5" markerEnd="url(#wb-ink)" />

        <defs>
          <marker id="wb-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="wb-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
          </marker>
        </defs>
      </svg>
      <figcaption>
        Two JavaScript worlds share one page. Each sees things the other
        cannot, and the DOM is the only surface they both touch.
      </figcaption>
    </figure>
  );
}
