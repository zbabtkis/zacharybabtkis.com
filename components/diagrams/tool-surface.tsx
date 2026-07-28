/**
 * Hand-drawn SVG: everything a model can choose from is prompt surface, so
 * the filtering that matters happens on the server, before the list is sent.
 */
export function ToolSurfaceDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 372"
        role="img"
        aria-label="Diagram: two ways to expose tools to a model. In the first, the server sends every tool it has, including ones unusable in the caller's current state, and relies on tool descriptions to tell the model not to pick them; the model still picks them, and each failed call costs a round trip and fills the context with an error. In the second, the server filters by what the caller can actually use before sending the list, so unusable tools are never options, and the failure mode disappears rather than being described away. A closing note observes that tool names, descriptions, and results all occupy the same context window as the user's actual problem."
      >
        <defs>
          <marker id="ts-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
          <marker id="ts-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
        </defs>

        {/* top: describe the constraint */}
        <text x="24" y="28" fontFamily={mono} fontSize="13" fill={amber}>describing the constraint</text>

        <rect x="24" y="44" width="180" height="84" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="114" y="66" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>server sends</text>
        <text x="114" y="84" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>every tool</text>
        <text x="114" y="106" textAnchor="middle" fontFamily={mono} fontSize="10" fill={amber}>&quot;do not call this one</text>
        <text x="114" y="120" textAnchor="middle" fontFamily={mono} fontSize="10" fill={amber}>unless connected&quot;</text>

        <line x1="204" y1="86" x2="266" y2="86" stroke={amber} strokeWidth="1.5" markerEnd="url(#ts-amber)" />

        <rect x="268" y="52" width="150" height="68" rx="6" fill={amber} opacity="0.1" stroke={amber} strokeWidth="1.5" />
        <text x="343" y="82" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>the model</text>
        <text x="343" y="100" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">picks it anyway</text>

        <line x1="418" y1="86" x2="480" y2="86" stroke={amber} strokeWidth="1.5" markerEnd="url(#ts-amber)" />

        <rect x="482" y="52" width="214" height="68" rx="6" fill="none" stroke={amber} strokeWidth="1.5" />
        <text x="589" y="76" textAnchor="middle" fontFamily={mono} fontSize="11" fill={amber}>a round trip spent</text>
        <text x="589" y="94" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">on an error, and the error</text>
        <text x="589" y="110" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">stays in the context</text>

        <line x1="24" y1="152" x2="696" y2="152" stroke={rule} strokeWidth="1.5" />

        {/* bottom: enforce it */}
        <text x="24" y="182" fontFamily={mono} fontSize="13" fill={navy}>enforcing it server-side</text>

        <rect x="24" y="198" width="180" height="84" rx="6" fill={navy} opacity="0.1" stroke={navy} strokeWidth="1.5" />
        <text x="114" y="222" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>server builds</text>
        <text x="114" y="240" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>the list per session</text>
        <text x="114" y="262" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">unusable tools are</text>
        <text x="114" y="276" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">simply not in it</text>

        <line x1="204" y1="240" x2="266" y2="240" stroke={navy} strokeWidth="1.5" markerEnd="url(#ts-navy)" />

        <rect x="268" y="212" width="150" height="56" rx="6" fill={navy} opacity="0.14" stroke={navy} strokeWidth="1.5" />
        <text x="343" y="236" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>the model</text>
        <text x="343" y="254" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">cannot pick it</text>

        <line x1="418" y1="240" x2="480" y2="240" stroke={navy} strokeWidth="1.5" markerEnd="url(#ts-navy)" />

        <rect x="482" y="212" width="214" height="56" rx="6" fill="none" stroke={navy} strokeWidth="1.5" />
        <text x="589" y="236" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>the failure mode is gone</text>
        <text x="589" y="254" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">not described, removed</text>

        <text x="24" y="318" fontFamily={mono} fontSize="12" fill={ink}>Tool names, descriptions, and results share one context window</text>
        <text x="24" y="336" fontFamily={mono} fontSize="12" fill={ink}>with the user&apos;s actual problem.</text>
        <text x="24" y="358" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">Every tool you expose spends part of it before the model has done anything.</text>
      </svg>
      <figcaption>
        A description asks the model to respect a constraint. A filtered
        list makes the constraint unbreakable, and costs nothing at
        inference time.
      </figcaption>
    </figure>
  );
}
