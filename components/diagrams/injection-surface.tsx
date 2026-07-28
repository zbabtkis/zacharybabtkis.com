/**
 * Hand-drawn SVG: the globals you think you injected into a VM sandbox
 * versus the ones actually reachable, including the prototype chain that
 * leads back to the host realm.
 */
export function InjectionSurfaceDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  const intended = ['ACCESS_TOKEN', 'OAUTH_CREDENTIALS', 'CONTEXT', 'prompt'];
  const alsoThere = [
    'fetch',
    'console',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'Promise',
    'Date',
    'Math',
    'JSON',
    'crypto',
    'process (stub)',
    'module',
    'exports',
  ];

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 400"
        role="img"
        aria-label="Diagram: the left column lists the four globals a team believes it injects into a VM sandbox: an access token, OAuth credentials, a context object, and a prompt function. The right column lists roughly fourteen more that are also present, including fetch, console, timers, Promise, Date, Math, JSON, crypto, a stubbed process object, module and exports. An arrow shows that any host-realm object among them exposes a prototype chain reaching the host's Function constructor, which is an escape path out of the sandbox."
      >
        <text x="24" y="30" fontFamily={mono} fontSize="13" fill={ink}>what you list in the review</text>
        <text x="380" y="30" fontFamily={mono} fontSize="13" fill={amber}>what the code hands over</text>

        {/* intended column */}
        <rect x="24" y="44" width="300" height="130" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        {intended.map((g, i) => (
          <text key={g} x="44" y={72 + i * 26} fontFamily={mono} fontSize="12" fill={navy}>
            {g}
          </text>
        ))}
        <text x="44" y="164" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">4 globals</text>

        {/* actual column */}
        <rect x="380" y="44" width="316" height="286" rx="6" fill={amber} opacity="0.06" stroke={amber} strokeWidth="1.5" />
        {alsoThere.map((g, i) => (
          <text
            key={g}
            x={400 + (i % 2) * 150}
            y={70 + Math.floor(i / 2) * 26}
            fontFamily={mono}
            fontSize="12"
            fill={ink}
          >
            {g}
          </text>
        ))}
        <text x="400" y="284" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">+ the 4 on the left</text>
        <text x="400" y="308" fontFamily={mono} fontSize="12" fill={amber}>roughly 18 keys, not 4</text>

        {/* prototype chain escape */}
        <rect x="24" y="206" width="300" height="124" rx="6" fill="none" stroke={amber} strokeWidth="1.5" strokeDasharray="6 5" />
        <text x="44" y="232" fontFamily={mono} fontSize="12" fill={amber}>the part that is not a list</text>
        <text x="44" y="256" fontFamily={mono} fontSize="11" fill={ink}>any host-realm object you pass in</text>
        <text x="44" y="276" fontFamily={mono} fontSize="11" fill={ink}>carries its prototype chain with it</text>
        <text x="44" y="300" fontFamily={mono} fontSize="11" fill={navy}>Promise.constructor(&apos;return process&apos;)()</text>
        <text x="44" y="320" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">reaches the host realm, not the stub</text>

        <line x1="24" y1="352" x2="696" y2="352" stroke={rule} strokeWidth="1.5" />
        <text x="24" y="376" fontFamily={mono} fontSize="12" fill={ink}>Enumerate the sandbox object in code. Do not enumerate it from memory.</text>
        <text x="24" y="394" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">The gap between the two columns is the part nobody reviews.</text>
      </svg>
      <figcaption>
        The four API globals are the ones anyone can name. The intrinsics
        beside them are the ones that carry a path back to the host realm.
      </figcaption>
    </figure>
  );
}
