/**
 * Hand-drawn SVG: a tool call that needs a human answer suspends over a
 * store instead of holding a stream, so any replica can finish the work.
 */
export function ElicitationSuspendDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 330"
        role="img"
        aria-label="Diagram: a tool call arrives at replica A, which reaches the point where it needs a human answer. Instead of holding the connection open, it writes its place to a shared store and returns an input-required result. The human answers on their own timescale, measured in minutes. The client re-issues the call with the answer attached, and replica C, a different process, reads the saved place from the store and finishes the work."
      >
        <defs>
          <marker id="es-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="es-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>

        {/* machine time band */}
        <text x="24" y="28" fontFamily={mono} fontSize="13" fill={ink} opacity="0.7">machine time (milliseconds)</text>
        <line x1="24" y1="38" x2="696" y2="38" stroke={rule} strokeWidth="1.5" />

        {/* replica A */}
        <rect x="24" y="58" width="150" height="62" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="99" y="84" textAnchor="middle" fontFamily={mono} fontSize="12" fill={ink}>replica A</text>
        <text x="99" y="104" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">runs the tool</text>

        <line x1="174" y1="89" x2="256" y2="89" stroke={navy} strokeWidth="1.5" markerEnd="url(#es-arrow)" />
        <text x="215" y="80" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>needs</text>
        <text x="215" y="112" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>an answer</text>

        {/* the store */}
        <rect x="258" y="48" width="180" height="82" rx="6" fill={navy} opacity="0.08" stroke={navy} strokeWidth="1.5" />
        <text x="348" y="76" textAnchor="middle" fontFamily={mono} fontSize="12" fill={navy}>shared store</text>
        <text x="348" y="96" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.7">saved place +</text>
        <text x="348" y="112" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.7">request state</text>

        {/* returns input-required */}
        <line x1="438" y1="89" x2="520" y2="89" stroke={navy} strokeWidth="1.5" markerEnd="url(#es-arrow)" />
        <rect x="522" y="58" width="174" height="62" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="609" y="84" textAnchor="middle" fontFamily={mono} fontSize="12" fill={ink}>input-required</text>
        <text x="609" y="104" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">returned, not streamed</text>

        {/* human time band */}
        <text x="24" y="176" fontFamily={mono} fontSize="13" fill={amber}>human time (seconds to minutes, no connection held)</text>
        <line x1="24" y1="186" x2="696" y2="186" stroke={amber} strokeWidth="1.5" strokeDasharray="6 5" />

        <line x1="609" y1="120" x2="609" y2="206" stroke={amber} strokeWidth="1.5" markerEnd="url(#es-amber)" />
        <rect x="500" y="208" width="196" height="54" rx="6" fill="none" stroke={amber} strokeWidth="1.5" />
        <text x="598" y="232" textAnchor="middle" fontFamily={mono} fontSize="12" fill={ink}>the person answers</text>
        <text x="598" y="250" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">on their own schedule</text>

        {/* resume on a different replica */}
        <line x1="500" y1="235" x2="200" y2="235" stroke={navy} strokeWidth="1.5" markerEnd="url(#es-arrow)" />
        <text x="350" y="226" textAnchor="middle" fontFamily={mono} fontSize="10" fill={navy}>client re-issues the call with the answer</text>

        <rect x="24" y="208" width="150" height="54" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="99" y="232" textAnchor="middle" fontFamily={mono} fontSize="12" fill={ink}>replica C</text>
        <text x="99" y="250" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">a different process</text>

        <line x1="99" y1="208" x2="99" y2="136" stroke={navy} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#es-arrow)" />
        <text x="112" y="160" fontFamily={mono} fontSize="10" fill={navy}>reads the saved place</text>

        <text x="24" y="296" fontFamily={mono} fontSize="12" fill={ink}>Nothing pins the work to replica A, so a deploy mid-question costs nothing.</text>
        <text x="24" y="316" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">The store, not the connection, is what remembers.</text>
      </svg>
      <figcaption>
        The pause is a return value, not a held connection. Once the place
        lives in a store, the replica that started the work no longer has to
        be the one that finishes it.
      </figcaption>
    </figure>
  );
}
