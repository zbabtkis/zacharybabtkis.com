import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { StatelessMigrationDiagram } from '@/components/diagrams/stateless-migration';

export const metadata: Metadata = {
  title: 'MCP Went Stateless: Migrating a Session-Era Server to the 2026-07-28 Spec',
  description:
    'The MCP 2026-07-28 spec removes the Mcp-Session-Id header, the protocol session, and the initialize handshake. How to migrate a session-era MCP server to the stateless model: the handle pattern, elicitation changes, and what order to do it in.',
};

export default function McpStatelessMigrationPage() {
  return (
    <ArticleLayout
      title="MCP went stateless. Here's how to migrate a session-era server."
      description="What the 2026-07-28 spec removes, what actually breaks, and a working order for moving session state into handles your clients pass back."
      datePublished="2026-07-28"
      dateModified="2026-07-28"
      slug="/mcp-development/mcp-stateless-migration/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'Do I have to migrate my MCP server right away?',
          answer:
            'No. Every client deployed today speaks the 2025 spec versions, and they will for months. The official SDKs are shipping support for both models, so the realistic plan is to add the stateless path alongside the session path and watch your traffic. The moment to delete the session code is when your logs show old-version clients gone, and that date is set by your clients, not by the spec.',
        },
        {
          question: 'What replaces the Mcp-Session-Id header?',
          answer:
            'Nothing at the protocol level, and that is the point. State the server used to look up by session ID now travels in the payload: tools return a handle (a project ID, a job token, whatever names the thing you were tracking), the client keeps it, and the model passes it back as an argument on later calls. Protocol metadata that used to be established in the initialize handshake rides in _meta on every request instead.',
        },
        {
          question: 'Does the 2026-07-28 spec fix the load-balancer problem?',
          answer:
            'Yes. That problem existed because a follow-up request had to reach the exact replica holding the session. With no protocol session, any request can land on any replica, and the new Mcp-Method and Mcp-Name headers exist so a gateway can route on them without inspecting bodies. Sticky sessions, shared session stores, and affinity cookies, all machinery for pinning a client to one replica, stop being requirements and go back to being choices.',
        },
        {
          question: 'How does elicitation work without an open stream?',
          answer:
            'An elicitation is a mid-call question a tool asks the user. The server now returns an input-required result instead of pushing that question down a stream. The client collects the answers and re-issues the original call with the answers and the echoed request state attached, so any replica can pick up the resume. If you built elicitation as suspend-over-a-store, your design just became the protocol’s design, and the migration is mostly renaming.',
        },
      ]}
      ctaTitle="Running a session-era MCP server that has to migrate?"
      ctaBody="I audit MCP servers and plan migrations: what your sessions actually hold, which tools need handles, what your elicitation flows become, and what infrastructure you get to delete. Fixed price, $2,000, one week, credited toward any follow-on work."
      ctaEmailSubject="MCP server audit: stateless migration"
      ctaSource="mcp-migration-article"
    >
      <p>
        At ZeroClick I ran the MCP server that exposed our tools to AI
        agents, and I built it the way the session-era spec expected:
        around a protocol session, the server-side context a client
        sets up once and refers back to on every later request. That
        context lived in one process&rsquo;s memory, and keeping
        requests routed to that process became its own infrastructure
        job.
      </p>
      <p>
        The load balancer had to keep sending each client back to the
        one process holding its session. When that pinning slipped,
        clients saw session-not-found errors. When the balancer cut
        our open streams at its default timeout, they saw 502s. None
        of it had anything to do with what our tools did.
      </p>
      <p>
        If your server has a map keyed by the{' '}
        <code>Mcp-Session-Id</code> header and load-balancer settings
        you tuned to keep clients pinned, you are running the same
        shape of system. The specifics differ, but the state sits in
        one process&rsquo;s memory, and your infrastructure&rsquo;s
        job is reuniting every request with that process.
      </p>
      <p>
        This is a common wall in AI engineering right now. MCP servers
        stopped being demos and became production infrastructure that
        agents call at volume, running on the same horizontally scaled
        web stacks as everything else. A protocol that ties a client
        to one process pulls against that stack, and every team
        scaling past a single replica feels the pull.
      </p>
      <p>
        The MCP spec dated 2026-07-28 removes the cause. The protocol
        session is gone. The <code>Mcp-Session-Id</code> header is
        gone, and so is the <code>initialize</code> handshake, the
        setup call that opened every session. Protocol metadata now
        rides in <code>_meta</code> on every request. Two new headers,{' '}
        <code>Mcp-Method</code> and <code>Mcp-Name</code>, let a load
        balancer route requests without reading bodies. Any request
        can land on any replica.
      </p>
      <p>
        I wrote about{' '}
        <a href="/mcp-development/stateful-mcp-servers/">
          what sessions cost you in production
        </a>{' '}
        before this spec landed, and the protocol adopted the
        conclusion. At ZeroClick I went at the problem from both ends.
        I tuned the pinning by hand, and I also moved state out of the
        process, into identifiers the client carried and a shared
        store for questions waiting on answers.
      </p>
      <p>
        The second approach is the one that survives this migration,
        and it is the model the new spec assumes. The sections below
        walk the move in an order that keeps your server deployable at
        every step, and they cover where the pinned-process machinery
        bites on the way out.
      </p>

      <h2>First, nothing breaks today</h2>
      <p>
        Every client in the wild today speaks the 2025 spec versions,
        and the official SDKs are shipping support for both models.
        Your session-era server keeps working. The migration pressure
        is real, but it is measured in months.
      </p>
      <p>
        <strong>
          Treat this like any other protocol transition: add the new
          path, keep the old one, and let your traffic tell you when
          the old one is dead.
        </strong>{' '}
        The day to delete the session code is the day your logs show
        old-version clients gone. That date is set by your clients, not
        by the spec.
      </p>

      <h2>Inventory what your sessions actually hold</h2>
      <p>
        Say you are staring at a server with a session map and
        wondering how big this job is. Write down, for each thing keyed
        by session ID, what it is.{' '}
        <strong>
          The size of the migration is exactly the size of that list.
        </strong>{' '}
        In the servers I have built and run, it comes down to three
        categories.
      </p>
      <ul>
        <li>
          Routing state is the open stream a follow-up request needs to
          find.
        </li>
        <li>
          Per-client working state is the account, project, or job a
          sequence of tool calls operates on.
        </li>
        <li>
          In-flight questions are elicitations, the mid-call questions
          a tool asks a human, still waiting on an answer.
        </li>
      </ul>
      <p>
        Each category migrates differently, and the first one migrates
        by deletion.
      </p>

      <h2>Routing state migrates by deletion</h2>
      <p>
        If your server has a block like this, it exists so a follow-up
        request can find the process that created its session:
      </p>
      <StatelessMigrationDiagram />
      <Code lang="ts">{`// The bookkeeping the stateless model deletes outright.
const sessions = new Map<
  string, // the Mcp-Session-Id header value
  { transport: Transport; lastActiveAt: number }
>();

setInterval(() => {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [sessionId, session] of sessions) {
    if (session.lastActiveAt < cutoff) sessions.delete(sessionId);
  }
}, SWEEP_INTERVAL_MS);`}</Code>
      <p>
        The map is only half of it. Because the state lives in one
        process&rsquo;s memory, the infrastructure has to keep sending
        every request from a client back to that same process. Load
        balancers call this sticky sessions, and they enforce it with
        an affinity cookie, a cookie whose only purpose is to mark
        which backend process a client belongs to.
      </p>
      <p>
        I tuned that stack by hand at ZeroClick. The cookie&rsquo;s
        time-to-live had to mirror the 30-minute lifetime of the
        session it pointed at, and the pinning only worked because our
        client forwarded cookies. A
        cookie-less client would still have broken. The load-balancer
        bug I spent the most time on was the stream half: it severed
        our SSE streams, the server-sent-event connections the
        transport holds open, at its default 30-second backend timeout,
        and clients saw 502s until I raised it.
      </p>
      <p>
        <strong>
          All of that existed to reunite a request with a process, and
          the new model makes the reunion unnecessary.
        </strong>{' '}
        When your stateless path is carrying the traffic, you delete
        the map, the sweep, and the affinity config, and your balancer
        goes back to plain round-robin. This is the rare migration
        where the after state has fewer moving parts than the before
        state.
      </p>

      <h2>Working state moves into handles</h2>
      <p>
        The session was an implicit argument to every tool call, and
        the migration makes it explicit. A tool that used to stash a
        project in the session now returns a handle, an identifier like
        a project ID or a job token that names the thing you were
        tracking. The client keeps it, and the model passes it back on
        later calls.
      </p>
      <Code lang="ts">{`// Session era: the project was implicit state the server held.
// Stateless: the tool returns a handle, the client carries it.
async function createProject(args: CreateArgs, auth: AuthContext) {
  const project = await projects.create({
    ...args,
    ownerId: auth.userId,
  });
  return { projectId: project.id };
}

// Later calls take the handle back as an argument.
async function addTask(
  { projectId, task }: AddTaskArgs,
  auth: AuthContext,
) {
  const project = await projects.find(projectId);
  if (!project || project.ownerId !== auth.userId) {
    throw new ForbiddenError(); // knowing the handle is not owning it
  }
  return tasks.create(projectId, task);
}`}</Code>
      <p>
        Handles cross a trust boundary, so treat them the way you treat
        any client-supplied identifier.{' '}
        <strong>
          Validate ownership on every call, because knowing the handle
          is not owning the resource.
        </strong>{' '}
        Handles escape easily. They show up in logs, in prompts, and in
        shared agent transcripts.
      </p>
      <p>
        The flow I shipped worked this way. A status endpoint took the
        resource ID in the URL, but every call also had to carry a
        token minted when the resource was authorized, and the server
        re-checked ownership on each request. The ID alone read
        nothing.
      </p>
      <p>
        Design the handle around the resource rather than the
        conversation. A project ID keeps meaning something next week. A
        serialized blob of conversation state does not, and it invites
        clients to depend on its internals.
      </p>

      <h2>Elicitation may already be done</h2>
      <p>
        Mid-call questions were the strongest reason servers held open
        streams. The new spec restructures them: the server returns an
        input-required result, and the client re-issues the call with
        the answers and the echoed request state attached. Any replica
        can pick up the resume.
      </p>
      <Code lang="ts">{`// The return-and-reissue shape, simplified. The tool needs an
// answer, so it returns instead of pushing a question down a stream.
if (!args.answers?.region) {
  return {
    status: 'input-required',
    questions: [
      { name: 'region', message: 'Deploy to which region?' },
    ],
    state: { deploymentId }, // echoed back to you on the re-issue
  };
}

// The client re-issues the original call with the answers and the
// echoed state attached. Any replica can serve the resume, because
// the request carries everything the resume needs.
return deploy(args.answers.region, args.state.deploymentId);`}</Code>
      <p>
        Maybe you built elicitation as a coroutine suspended over an
        external store, the pattern I described in{' '}
        <a href="/mcp-development/mcp-elicitation/">
          the elicitation article
        </a>
        : the tool saves its place in a database and picks back up
        when the answer arrives. If so, the protocol just standardized
        your architecture. Your migration is mostly moving the store
        key from session ID to request state.
      </p>
      <p>
        <strong>
          If your elicitation depends on the open stream itself,
          prototype that part first, because it changes the shape of
          your tool code rather than just its plumbing.
        </strong>{' '}
        My own server sat in both camps: the suspension lived in a
        shared store that survived replica restarts, but delivery still
        pushed the question over the open stream. The store is the half
        that survives this migration.
      </p>

      <h2>The order I would do it in</h2>
      <ol>
        <li>
          Update the SDK and get the new headers and{' '}
          <code>_meta</code> handling in place while the session path
          still carries traffic.
        </li>
        <li>
          Convert working state to handles one tool family at a time,
          starting with the tools that already return a natural
          resource ID.
        </li>
        <li>Restructure elicitation to the return-and-reissue shape.</li>
        <li>
          Watch traffic until old-version clients are gone, then delete
          the session map, the affinity configuration, and the sweeps
          that evict idle sessions.
        </li>
      </ol>
      <p>
        <strong>
          Every step leaves the server deployable, and the deletions
          come last, after the logs prove nothing needs what you are
          deleting.
        </strong>{' '}
        In short, the spec finally agrees with your load balancer. The
        migration is the last session-shaped problem you have to
        solve.
      </p>
    </ArticleLayout>
  );
}
