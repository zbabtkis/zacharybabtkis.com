/**
 * Hand-drawn SVG: what one rejection actually costs, counted end to end,
 * against the same release with the reviewer's question answered up front.
 */
export function ReviewCycleDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 356"
        role="img"
        aria-label="Diagram: two release paths compared. The rejected path runs submit, wait for review, receive a rejection, diagnose what the guideline citation means, fix, resubmit, wait for re-review, and often exchange messages in Resolution Center, and the elapsed time adds up to about a week on a fixed release schedule. The answered path runs submit with review notes that address the reviewer's concern before it is raised, then approval, and the elapsed time is the normal review wait. The note underneath states that the reviewer's question gets answered either way; review notes only change whether answering it costs a cycle."
      >
        <defs>
          <marker id="rc-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
          <marker id="rc-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
        </defs>

        {/* rejected path */}
        <text x="24" y="30" fontFamily={mono} fontSize="13" fill={amber}>submitted blind</text>

        {['submit', 'review', 'rejected', 'diagnose', 'fix', 'resubmit', 'review'].map((s, i) => {
          const x = 24 + i * 96;
          return (
            <g key={`${s}-${i}`}>
              <rect x={x} y="46" width="82" height="42" rx="5" fill={amber} opacity="0.1" stroke={amber} strokeWidth="1.5" />
              <rect x={x} y="46" width="82" height="42" rx="5" fill="none" stroke={amber} strokeWidth="1.5" />
              <text x={x + 41} y="72" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink}>
                {s}
              </text>
              {i < 6 && (
                <line x1={x + 82} y1="67" x2={x + 94} y2="67" stroke={amber} strokeWidth="1.5" markerEnd="url(#rc-amber)" />
              )}
            </g>
          );
        })}

        <text x="24" y="112" fontFamily={mono} fontSize="11" fill={ink} opacity="0.7">plus a Resolution Center exchange on top, more often than not</text>

        <line x1="24" y1="130" x2="696" y2="130" stroke={amber} strokeWidth="1.5" />
        <text x="360" y="150" textAnchor="middle" fontFamily={mono} fontSize="12" fill={amber}>about a week, on a fixed release schedule</text>

        <line x1="24" y1="172" x2="696" y2="172" stroke={rule} strokeWidth="1.5" />

        {/* answered path */}
        <text x="24" y="204" fontFamily={mono} fontSize="13" fill={navy}>submitted with the concern already answered</text>

        {['submit + review notes', 'review', 'approved'].map((s, i) => {
          const x = 24 + i * 150;
          return (
            <g key={s}>
              <rect x={x} y="220" width="136" height="42" rx="5" fill={navy} opacity="0.1" stroke={navy} strokeWidth="1.5" />
              <rect x={x} y="220" width="136" height="42" rx="5" fill="none" stroke={navy} strokeWidth="1.5" />
              <text x={x + 68} y="246" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink}>
                {s}
              </text>
              {i < 2 && (
                <line x1={x + 136} y1="241" x2={x + 148} y2="241" stroke={navy} strokeWidth="1.5" markerEnd="url(#rc-navy)" />
              )}
            </g>
          );
        })}

        <line x1="24" y1="278" x2="474" y2="278" stroke={navy} strokeWidth="1.5" />
        <text x="249" y="298" textAnchor="middle" fontFamily={mono} fontSize="12" fill={navy}>the normal review wait, and nothing else</text>

        <text x="24" y="326" fontFamily={mono} fontSize="12" fill={ink}>The reviewer&apos;s question gets answered either way.</text>
        <text x="24" y="344" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">Review notes decide whether answering it costs a cycle.</text>
      </svg>
      <figcaption>
        Review notes are not paperwork. They are the cheapest place to
        answer a question that will otherwise be asked through a rejection.
      </figcaption>
    </figure>
  );
}
