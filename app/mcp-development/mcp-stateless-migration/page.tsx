import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

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
            'Yes. That problem existed because a follow-up request had to reach the exact replica holding the session. With no protocol session, any request can land on any replica, and the new Mcp-Method and Mcp-Name headers exist so a gateway can route on them without inspecting bodies. Sticky sessions, shared session stores, and affinity cookies stop being requirements and go back to being choices.',
        },
        {
          question: 'How does elicitation work without an open stream?',
          answer:
            'The server returns an input-required result instead of pushing a request down a stream. The client collects the answers and re-issues the original call with the answers and the echoed request state attached, so any replica can pick up the resume. If you built elicitation as suspend-over-a-store, your design just became the protocol’s design, and the migration is mostly renaming.',
        },
      ]}
      ctaTitle="Running a session-era MCP server that has to migrate?"
      ctaBody="I audit MCP servers and plan migrations: what your sessions actually hold, which tools need handles, what your elicitation flows become, and what infrastructure you get to delete. Fixed price, $2,000, one week, credited toward any follow-on work."
      ctaEmailSubject="MCP server audit: stateless migration"
      ctaSource="mcp-migration-article"
    >
      <p>
        The MCP spec dated 2026-07-28 is final, and it removes the thing
        most production server headaches grew from: the protocol session.
        The <code>Mcp-Session-Id</code> header is gone. The{' '}
        <code>initialize</code> handshake is gone. Protocol metadata now
        travels in <code>_meta</code> on every request, and two new
        headers, <code>Mcp-Method</code> and <code>Mcp-Name</code>, let a
        load balancer route requests without reading bodies. Any request
        can land on any replica. If you have ever debugged
        session-not-found errors behind a load balancer, this is the
        change that removes the cause.
      </p>
      <p>
        I ran session-era MCP servers in production at ZeroClick, and I
        wrote about{' '}
        <a href="/mcp-development/stateful-mcp-servers/">
          what sessions cost you in production
        </a>{' '}
        before this spec landed. The short version: the protocol adopted
        the conclusion. This article is about the part the release notes
        don&rsquo;t cover, which is how you actually get a session-era
        server from here to there.
      </p>

      <h2>First, nothing breaks today</h2>
      <p>
        Every client in the wild today speaks the 2025 spec versions, and
        the official SDKs are shipping support for both models. Your
        session-era server keeps working. The migration pressure is real
        but it is measured in months, so treat this like any other
        protocol transition: add the new path, keep the old one, and let
        your traffic tell you when the old one is dead.
      </p>

      <h2>Inventory what your sessions actually hold</h2>
      <p>
        Say you are staring at a server with a session map and wondering
        how big this job is. The size of the migration is exactly the
        size of this list, so write it down: for each thing keyed by
        session ID, what is it? In the servers I have built and audited,
        it comes down to three categories. Routing state, meaning the open
        stream a follow-up request needs to find. Per-client working
        state, meaning the account, project, or job a sequence of tool
        calls operates on. And in-flight questions, meaning elicitation
        waiting on a human. Each category migrates differently, and the
        first one migrates by deletion.
      </p>

      <h2>Routing state: delete it</h2>
      <p>
        The open-stream bookkeeping, the transport map, the sticky
        sessions at the load balancer, the affinity cookie with the
        carefully tuned TTL: all of that existed to reunite a request
        with a process. The new model makes the reunion unnecessary.
        When your stateless path is carrying the traffic, you get to
        remove infrastructure, and your balancer goes back to plain
        round-robin. This is the rare migration where the after state has
        fewer moving parts than the before state.
      </p>

      <h2>Working state: move it into handles</h2>
      <p>
        The session was an implicit argument to every tool call. The
        migration makes it explicit. A tool that used to stash a project
        in the session now returns a handle, something like a project ID
        or a job token, and the model passes it back on the next call.
        You already trust the client to carry the conversation; now it
        carries the state too.
      </p>
      <p>
        Two things earn attention here. First, handles cross a trust
        boundary, so treat them the way you treat any client-supplied
        identifier: validate ownership on every call, because
        &ldquo;knows the handle&rdquo; is not &ldquo;owns the
        resource.&rdquo; Second, design the handle around the resource
        rather than the conversation. A project ID keeps meaning
        something next week. A serialized blob of conversation state does
        not, and it invites clients to depend on its internals.
      </p>

      <h2>Elicitation: you may already be done</h2>
      <p>
        Mid-call questions were the strongest reason servers held open
        streams. The new spec restructures them: the server returns an
        input-required result, and the client re-issues the call with the
        answers and the echoed request state attached. Any replica can
        pick up the resume. If you built elicitation as a coroutine
        suspended over an external store, the pattern I described in{' '}
        <a href="/mcp-development/mcp-elicitation/">
          the elicitation article
        </a>
        , the protocol just standardized your architecture, and your
        migration is mostly moving the store key from session ID to
        request state. If your elicitation depends on the open stream
        itself, this is the part of the migration to prototype first,
        because it changes the shape of your tool code rather than just
        its plumbing.
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
          starting with the tools that already return a natural resource
          ID.
        </li>
        <li>Restructure elicitation to the return-and-reissue shape.</li>
        <li>
          Watch traffic until old-version clients are gone, then delete
          the session map, the affinity config, and the TTL sweeps.
        </li>
      </ol>
      <p>
        Notice what the order optimizes for: every step leaves the server
        deployable, and the deletions come last, after the logs prove
        nothing needs what you are deleting. In short, the spec finally
        agrees with your load balancer. The migration is the last
        session-shaped problem you have to solve.
      </p>
    </ArticleLayout>
  );
}
