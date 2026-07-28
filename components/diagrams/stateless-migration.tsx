/**
 * Hand-drawn SVG: the session-era topology, where infrastructure exists to
 * reunite a client with one process, against the stateless one, where the
 * routing problem is deleted rather than solved.
 */
export function StatelessMigrationDiagram() {
  const ink = '#1c1e21';
  const navy = '#24418e';
  const amber = '#c8860a';
  const rule = '#d8d4cb';
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  const replicas = [0, 1, 2];

  return (
    <figure className="diagram">
      <svg
        viewBox="0 0 720 380"
        role="img"
        aria-label="Diagram: two topologies side by side. On the left, the session era: a client's requests all pass through a load balancer that must send them to replica B specifically, because replica B holds the session in memory. The other two replicas are unreachable for that client, and an affinity cookie plus session sweeps are required machinery. On the right, the stateless design: the same client's requests carry their state in the underscore-meta field, so the load balancer sends any request to any replica, and the affinity machinery is deleted rather than tuned."
      >
        <defs>
          <marker id="sm-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={navy} />
          </marker>
          <marker id="sm-rule" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={rule} />
          </marker>
        </defs>

        {/* divider */}
        <line x1="360" y1="20" x2="360" y2="330" stroke={rule} strokeWidth="1.5" />

        {/* ---- left: session era ---- */}
        <text x="24" y="32" fontFamily={mono} fontSize="13" fill={ink}>session era</text>
        <text x="24" y="50" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">one process is the right answer</text>

        <rect x="24" y="66" width="90" height="40" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="69" y="91" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>client</text>

        <line x1="69" y1="106" x2="69" y2="140" stroke={navy} strokeWidth="1.5" markerEnd="url(#sm-navy)" />

        <rect x="24" y="142" width="300" height="38" rx="6" fill={amber} opacity="0.1" stroke={amber} strokeWidth="1.5" />
        <text x="174" y="166" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>load balancer + affinity cookie</text>

        {replicas.map((i) => {
          const x = 30 + i * 100;
          const pinned = i === 1;
          return (
            <g key={i}>
              <line
                x1="174"
                y1="180"
                x2={x + 42}
                y2="222"
                stroke={pinned ? navy : rule}
                strokeWidth="1.5"
                strokeDasharray={pinned ? undefined : '4 4'}
                markerEnd={pinned ? 'url(#sm-navy)' : 'url(#sm-rule)'}
              />
              <rect
                x={x}
                y={224}
                width="84"
                height="52"
                rx="6"
                fill={pinned ? navy : 'none'}
                opacity={pinned ? 0.12 : 1}
                stroke={pinned ? navy : rule}
                strokeWidth="1.5"
              />
              <text x={x + 42} y={247} textAnchor="middle" fontFamily={mono} fontSize="11" fill={pinned ? navy : ink} opacity={pinned ? 1 : 0.45}>
                {['A', 'B', 'C'][i]}
              </text>
              <text x={x + 42} y={265} textAnchor="middle" fontFamily={mono} fontSize="9" fill={ink} opacity={pinned ? 0.7 : 0.35}>
                {pinned ? 'holds session' : 'cannot serve'}
              </text>
            </g>
          );
        })}

        <text x="24" y="300" fontFamily={mono} fontSize="11" fill={amber}>pinning slips, clients see session-not-found</text>
        <text x="24" y="318" fontFamily={mono} fontSize="11" fill={amber}>cookie TTL must mirror session lifetime</text>

        {/* ---- right: stateless ---- */}
        <text x="392" y="32" fontFamily={mono} fontSize="13" fill={ink}>stateless</text>
        <text x="392" y="50" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">every process is the right answer</text>

        <rect x="392" y="66" width="90" height="40" rx="6" fill="none" stroke={ink} strokeWidth="1.5" />
        <text x="437" y="91" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink}>client</text>
        <text x="496" y="84" fontFamily={mono} fontSize="10" fill={navy}>carries its own state</text>
        <text x="496" y="99" fontFamily={mono} fontSize="10" fill={navy}>in _meta</text>

        <line x1="437" y1="106" x2="437" y2="140" stroke={navy} strokeWidth="1.5" markerEnd="url(#sm-navy)" />

        <rect x="392" y="142" width="300" height="38" rx="6" fill="none" stroke={rule} strokeWidth="1.5" />
        <text x="542" y="166" textAnchor="middle" fontFamily={mono} fontSize="11" fill={ink} opacity="0.6">load balancer, routing on Mcp-Method</text>

        {replicas.map((i) => {
          const x = 398 + i * 100;
          return (
            <g key={i}>
              <line x1="542" y1="180" x2={x + 42} y2="222" stroke={navy} strokeWidth="1.5" markerEnd="url(#sm-navy)" />
              <rect x={x} y={224} width="84" height="52" rx="6" fill={navy} opacity="0.12" stroke={navy} strokeWidth="1.5" />
              <text x={x + 42} y={247} textAnchor="middle" fontFamily={mono} fontSize="11" fill={navy}>
                {['A', 'B', 'C'][i]}
              </text>
              <text x={x + 42} y={265} textAnchor="middle" fontFamily={mono} fontSize="9" fill={ink} opacity="0.7">
                serves anything
              </text>
            </g>
          );
        })}

        <text x="392" y="300" fontFamily={mono} fontSize="11" fill={navy}>the session map, the affinity config, and the</text>
        <text x="392" y="318" fontFamily={mono} fontSize="11" fill={navy}>idle-session sweeps all get deleted</text>

        <line x1="24" y1="344" x2="696" y2="344" stroke={rule} strokeWidth="1.5" />
        <text x="24" y="368" fontFamily={mono} fontSize="12" fill={ink}>Routing state does not get migrated. It gets removed, and the requirement goes with it.</text>
      </svg>
      <figcaption>
        The left side is infrastructure whose entire job is undoing a
        constraint the protocol imposed. The migration deletes the
        constraint, so the machinery has nothing left to do.
      </figcaption>
    </figure>
  );
}
