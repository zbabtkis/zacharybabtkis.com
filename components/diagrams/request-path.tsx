/**
 * Hand-drawn SVG: blocking webRequest puts your code inside the request
 * path; declarativeNetRequest takes it out and asks for a rulebook up front.
 */
export function RequestPathDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-label="Diagram: two request flows. In the blocking webRequest model, a page request stops at your JavaScript, which runs a decision while the request waits, then allows or cancels it; your code sees every request and can decide using anything it knows at that moment. In the declarativeNetRequest model, you register a rulebook ahead of time, and the browser's own network layer matches each request against it; your code is never called and never learns which requests occurred. The consequence is noted: any decision that depended on runtime knowledge has to be precomputed into a rule before the request happens."
      >
        <defs>
          <marker id="rp-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="rp-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>

        {/* ---- top: webRequest ---- */}
        <text x="24" y="28" fontFamily={mono} fontSize="13" fill={ink}>blocking webRequest: your code is in the path</text>

        <rect x="24" y="46" width="96" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="72" y="74" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>request</text>

        <line x1="120" y1="69" x2="196" y2="69" stroke={navy} strokeWidth="1.5" markerEnd="url(#rp-navy)" />

        <rect x="198" y="40" width="180" height="58" rx="6" fill={navy} opacity="0.12" stroke={navy} strokeWidth="1.5" />
        <text x="288" y="64" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>your JavaScript</text>
        <text x="288" y="82" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">decides while it waits</text>

        <line x1="378" y1="69" x2="454" y2="69" stroke={navy} strokeWidth="1.5" markerEnd="url(#rp-navy)" />
        <rect x="456" y="46" width="110" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="511" y="74" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>allow / cancel</text>

        <text x="588" y="62" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">you see every</text>
        <text x="588" y="78" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">request, and can</text>
        <text x="588" y="94" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">count them</text>

        <line x1="24" y1="126" x2="696" y2="126" stroke={rule} strokeWidth="1.5" />

        {/* ---- bottom: DNR ---- */}
        <text x="24" y="156" fontFamily={mono} fontSize="13" fill={ink}>declarativeNetRequest: your code is out of the path</text>

        <rect x="24" y="174" width="180" height="58" rx="6" fill={amber} opacity="0.12" stroke={amber} strokeWidth="1.5" />
        <text x="114" y="198" textAnchor="middle" fontFamily={mono} fontSize="11" fill={amber}>your rulebook</text>
        <text x="114" y="216" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">registered ahead of time</text>

        <line x1="114" y1="232" x2="114" y2="268" stroke={amber} strokeWidth="1.5" markerEnd="url(#rp-amber)" />

        <rect x="24" y="270" width="96" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="72" y="298" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>request</text>

        <line x1="120" y1="293" x2="196" y2="293" stroke={navy} strokeWidth="1.5" markerEnd="url(#rp-navy)" />

        <rect x="198" y="264" width="200" height="58" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="298" y="288" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>the browser matches</text>
        <text x="298" y="306" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">its network layer, not yours</text>

        <line x1="398" y1="293" x2="474" y2="293" stroke={navy} strokeWidth="1.5" markerEnd="url(#rp-navy)" />
        <rect x="476" y="270" width="110" height="46" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="531" y="298" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>allow / block</text>

        <text x="608" y="286" fontFamily={mono} fontSize="10" fill={amber}>your code is</text>
        <text x="608" y="302" fontFamily={mono} fontSize="10" fill={amber}>never called</text>

        <text x="24" y="348" fontFamily={mono} fontSize="12" fill={ink}>Every decision that used runtime knowledge must become a rule before the request happens.</text>
      </svg>
      <figcaption>
        The migration is not an API swap. It moves the decision from request
        time to registration time, and anything your code learned in between
        has to be precomputed.
      </figcaption>
    </figure>
  );
}
