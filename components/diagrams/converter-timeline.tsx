/**
 * Hand-drawn SVG: every checkpoint the converter gives you passes, and all
 * six real failures sit past the last one.
 */
export function ConverterTimelineDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  const checkpoints = ['converter runs', 'Xcode builds', 'extension installs', 'Safari enables it'];
  const failures = [
    'feature detection passes, nothing happens',
    'works after install, stops minutes later',
    'requests you block keep loading',
    'configuration accepted but ignored',
    'storage and messaging fail in the field',
    'builds on your Mac and nowhere else',
  ];

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 400"
        role="img"
        aria-label="Diagram: a timeline of four checkpoints the toolchain gives you: the converter runs, Xcode builds, the extension installs, and Safari enables it. All four pass. Past the last checkpoint sits a shaded region containing six runtime failures: feature detection passing while nothing happens, the extension working right after install then stopping minutes later, requests you intend to block continuing to load, configuration Safari accepts but ignores, storage and messaging failing only in the field, and the project building on your Mac and nowhere else. The point marked is that no checkpoint in the toolchain observes the region where the failures live."
      >
        <defs>
          <marker id="ct-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>

        <text x="24" y="30" fontFamily={mono} fontSize="13" fill={ink}>what the toolchain checks</text>

        {/* the green road */}
        <line x1="88" y1="76" x2="424" y2="76" stroke={navy} strokeWidth="2" />
        {checkpoints.map((c, i) => {
          const x = 88 + i * 112;
          return (
            <g key={c}>
              <circle cx={x} cy="76" r="8" fill={navy} />
              <text x={x} y="106" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink}>
                {c}
              </text>
              <text x={x} y="122" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>
                passes
              </text>
            </g>
          );
        })}

        {/* the cliff */}
        <line x1="492" y1="50" x2="492" y2="330" stroke={amber} strokeWidth="1.5" strokeDasharray="6 5" />
        <line x1="590" y1="70" x2="504" y2="70" stroke={amber} strokeWidth="1.5" markerEnd="url(#ct-amber)" />
        <text x="596" y="60" fontFamily={mono} fontSize="11" fill={amber}>nothing checks</text>
        <text x="596" y="76" fontFamily={mono} fontSize="11" fill={amber}>past here</text>

        {/* failure region */}
        <rect x="24" y="146" width="672" height="180" rx="6" fill={amber} opacity="0.07" stroke={amber} strokeWidth="1.5" />
        <text x="44" y="172" fontFamily={mono} fontSize="12" fill={amber}>where the six failures live</text>

        {failures.map((f, i) => (
          <g key={f}>
            <circle cx="52" cy={196 + i * 22} r="3" fill={amber} />
            <text x="66" y={200 + i * 22} fontFamily={mono} fontSize="11" fill={ink}>
              {i + 1}. {f}
            </text>
          </g>
        ))}

        <line x1="24" y1="352" x2="696" y2="352" stroke={rule} strokeWidth="1.5" />
        <text x="24" y="376" fontFamily={mono} fontSize="12" fill={ink}>The converter reports on packaging. Every failure above is a runtime fact.</text>
        <text x="24" y="394" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">A clean build is evidence about the wrapper, not about the extension.</text>
      </svg>
      <figcaption>
        Four checkpoints pass and none of them observes the region where the
        work breaks. That gap is why the port feels finished long
        before it is.
      </figcaption>
    </figure>
  );
}
