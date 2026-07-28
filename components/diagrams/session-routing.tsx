/**
 * Hand-drawn SVG: why a second replica breaks MCP sessions. The session
 * lives in replica A's memory; round-robin sends the follow-up to
 * replica B, which has never heard of it.
 */
export function SessionRoutingDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-label="Diagram: a client sends two requests through a load balancer. Request one reaches replica A, which holds the session. Request two is routed to replica B, which has no session, and fails with 404 session not found."
      >
        {/* Client */}
        <rect x="20" y="120" width="130" height="80" rx="8" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="85" y="155" textAnchor="middle" fontFamily={mono} fontSize="14" fill={ink}>MCP client</text>
        <text x="85" y="177" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>session 4f2a</text>

        {/* Load balancer */}
        <rect x="270" y="120" width="150" height="80" rx="8" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="345" y="150" textAnchor="middle" fontFamily={mono} fontSize="14" fill={ink}>load balancer</text>
        <text x="345" y="172" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">round-robin</text>

        {/* Replica A */}
        <rect x="540" y="30" width="160" height="90" rx="8" fill="none" stroke={navy} strokeWidth="1.5" />
        <text x="620" y="58" textAnchor="middle" fontFamily={mono} fontSize="14" fill={ink}>replica A</text>
        <text x="620" y="80" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>session 4f2a ✓</text>
        <text x="620" y="98" textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>open SSE stream</text>

        {/* Replica B */}
        <rect x="540" y="200" width="160" height="90" rx="8" fill="none" stroke={rule} strokeWidth="1.5" />
        <text x="620" y="232" textAnchor="middle" fontFamily={mono} fontSize="14" fill={ink}>replica B</text>
        <text x="620" y="254" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.55">no session</text>

        {/* client -> LB */}
        <line x1="150" y1="160" x2="262" y2="160" stroke={ink} strokeWidth="1.5" markerEnd="url(#arrow-ink)" />

        {/* LB -> A (request 1, ok) */}
        <line x1="420" y1="140" x2="532" y2="80" stroke={navy} strokeWidth="1.5" markerEnd="url(#arrow-navy)" />
        <text x="470" y="96" fontFamily={mono} fontSize="11" fill={navy}>request 1</text>

        {/* LB -> B (request 2, fails) */}
        <line x1="420" y1="180" x2="532" y2="240" stroke={amber} strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrow-amber)" />
        <text x="452" y="232" fontFamily={mono} fontSize="11" fill={amber}>request 2</text>

        {/* failure label */}
        <text x="620" y="312" textAnchor="middle" fontFamily={mono} fontSize="12" fill={amber}>404 &ldquo;session not found&rdquo;</text>

        <defs>
          <marker id="arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
          </marker>
          <marker id="arrow-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={amber} />
          </marker>
        </defs>
      </svg>
      <figcaption>
        The session lives in one process&rsquo;s memory. Round-robin
        routing sends the follow-up request to a replica that has never
        heard of it.
      </figcaption>
    </figure>
  );
}
