/**
 * Hand-drawn SVG: the claim pattern. An agent provisions against a pooled
 * identity now, and a human takes ownership later, or the resource expires.
 */
export function DeferredOwnershipDiagram() {
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
        aria-label="Diagram: the claim pattern for agent provisioning. At agent time, no human is at a keyboard, so the agent borrows a slot from a pool of pre-authorized credentials, provisions the resource, and receives a claim link. The resource works immediately but is owned by nobody. At human time, later, one of two things happens: the person opens the claim link, authenticates as themselves, and ownership transfers to their account, or nobody claims it and the time bound expires, releasing the slot back to the pool. A closing note states that the expiry is what makes the pattern safe, because an unclaimed resource cannot accumulate."
      >
        <defs>
          <marker id="do-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="do-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>

        {/* agent time */}
        <text x="24" y="28" fontFamily={mono} fontSize="13" fill={navy}>agent time: nobody is at a keyboard</text>

        <rect x="24" y="46" width="140" height="52" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="94" y="70" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>the agent</text>
        <text x="94" y="88" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.6">cannot do a redirect</text>

        <line x1="164" y1="72" x2="216" y2="72" stroke={navy} strokeWidth="1.5" markerEnd="url(#do-navy)" />

        <rect x="218" y="46" width="160" height="52" rx="6" fill={navy} opacity="0.12" stroke={navy} strokeWidth="1.5" />
        <text x="298" y="70" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>borrow a pool slot</text>
        <text x="298" y="88" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.7">pre-authorized, counted</text>

        <line x1="378" y1="72" x2="430" y2="72" stroke={navy} strokeWidth="1.5" markerEnd="url(#do-navy)" />

        <rect x="432" y="46" width="264" height="52" rx="6" fill="none" stroke={navy} strokeWidth="1.5" />
        <text x="564" y="70" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>resource provisioned + claim link</text>
        <text x="564" y="88" textAnchor="middle" fontFamily={mono} fontSize="10" fill={amber}>works now, owned by nobody</text>

        <line x1="24" y1="126" x2="696" y2="126" stroke={rule} strokeWidth="1.5" strokeDasharray="6 5" />
        <text x="360" y="146" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">an unbounded gap, which is the whole risk</text>

        {/* human time */}
        <text x="24" y="182" fontFamily={mono} fontSize="13" fill={amber}>human time: later, one of two things</text>

        <line x1="200" y1="196" x2="200" y2="226" stroke={navy} strokeWidth="1.5" markerEnd="url(#do-navy)" />
        <rect x="24" y="228" width="320" height="80" rx="6" fill={navy} opacity="0.1" stroke={navy} strokeWidth="1.5" />
        <text x="184" y="252" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>the person opens the claim link</text>
        <text x="184" y="272" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">authenticates as themselves</text>
        <text x="184" y="292" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">ownership transfers, slot released</text>

        <line x1="520" y1="196" x2="520" y2="226" stroke={amber} strokeWidth="1.5" markerEnd="url(#do-amber)" />
        <rect x="376" y="228" width="320" height="80" rx="6" fill={amber} opacity="0.1" stroke={amber} strokeWidth="1.5" />
        <text x="536" y="252" textAnchor="middle" fontFamily={mono} fontSize="11" fill={amber}>nobody claims it</text>
        <text x="536" y="272" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">the time bound expires</text>
        <text x="536" y="292" textAnchor="middle" fontFamily={mono} fontSize="10" fill={ink} opacity="0.75">resource torn down, slot released</text>

        <text x="24" y="340" fontFamily={mono} fontSize="12" fill={ink}>The expiry is the safety property.</text>
        <text x="24" y="358" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">Without it, unclaimed resources accumulate against your quota forever.</text>
        <text x="24" y="376" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">Both branches end the same way: the slot goes back.</text>
      </svg>
      <figcaption>
        The agent never holds an identity it should not have. It borrows a
        counted slot, and every path returns it.
      </figcaption>
    </figure>
  );
}
