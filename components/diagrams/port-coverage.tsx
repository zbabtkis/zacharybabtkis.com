/**
 * Hand-drawn SVG: where a Chrome extension's API surface lands after the
 * converter runs. Three bands, and only the first one is free.
 */
export function PortCoverageDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  const bands = [
    {
      y: 62,
      h: 66,
      fill: navy,
      op: 0.14,
      stroke: navy,
      label: 'carries over as written',
      items: 'storage · messaging · content scripts · most manifest keys',
      cost: 'no work',
    },
    {
      y: 140,
      h: 66,
      fill: amber,
      op: 0.12,
      stroke: amber,
      label: 'accepted, then ignored at runtime',
      items: 'blocking webRequest · persistent background · some DNR shapes',
      cost: 'silent: no error, no console line, feature simply dead',
    },
    {
      y: 218,
      h: 66,
      fill: '#fff',
      op: 1,
      stroke: ink,
      label: 'needs a redesign before it ships',
      items: 'request-path blocking · long-lived in-memory state · signing',
      cost: 'weeks, and the converter never mentions it',
    },
  ];

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 340"
        role="img"
        aria-label="Diagram: a Chrome extension's API surface splits into three bands after conversion. The first band carries over as written and covers storage, messaging, content scripts, and most manifest keys, costing no work. The second band is accepted by Safari and then ignored at runtime, covering blocking webRequest, persistent background pages, and some declarativeNetRequest shapes; these fail silently with no error and no console output. The third band needs a redesign before it ships and covers request-path blocking, long-lived in-memory state, and signing, costing weeks that the converter never warns about. Only the first band is what a clean first build actually proves."
      >
        <text x="24" y="30" fontFamily={mono} fontSize="13" fill={ink}>your Chrome API surface, after the converter runs</text>
        <text x="24" y="48" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">the build succeeding tells you about the first band only</text>

        {bands.map((b) => (
          <g key={b.label}>
            <rect x="24" y={b.y} width="672" height={b.h} rx="6" fill={b.fill} opacity={b.op} stroke={b.stroke} strokeWidth="1.5" />
            <rect x="24" y={b.y} width="672" height={b.h} rx="6" fill="none" stroke={b.stroke} strokeWidth="1.5" />
            <text x="44" y={b.y + 24} fontFamily={mono} fontSize="12" fill={b.stroke === ink ? ink : b.stroke}>
              {b.label}
            </text>
            <text x="44" y={b.y + 44} fontFamily={mono} fontSize="11" fill={ink} opacity="0.75">
              {b.items}
            </text>
            <text x="44" y={b.y + 60} fontFamily={mono} fontSize="10" fill={ink} opacity="0.55">
              {b.cost}
            </text>
          </g>
        ))}

        <line x1="24" y1="300" x2="696" y2="300" stroke={rule} strokeWidth="1.5" />
        <text x="24" y="324" fontFamily={mono} fontSize="12" fill={ink}>Audit every API the extension touches before you trust the first clean build.</text>
      </svg>
      <figcaption>
        The converter reports on the manifest keys it knows about. The
        middle band is the expensive one, because nothing in the toolchain
        tells you it exists.
      </figcaption>
    </figure>
  );
}
