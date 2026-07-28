import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { SessionRoutingDiagram } from '@/components/diagrams/session-routing';

export const metadata: Metadata = {
  title: 'Your MCP Server Is Stateful. Your Load Balancer Doesn’t Know That.',
  description:
    'MCP over streamable HTTP holds an open SSE stream per session, server-side state your load balancer can’t see. Why replicas break sessions, why proxies 502 healthy streams, and how to fix both, from an engineer who ran MCP in production at ZeroClick.',
};

export default function StatefulMcpServersPage() {
  return (
    <ArticleLayout
      title="Your MCP server is stateful. Your load balancer doesn’t know that."
      description="Why MCP over streamable HTTP breaks behind multiple replicas, and what session affinity, proxy timeouts, and TTL sweeps have to do with it."
      datePublished="2026-07-25"
      dateModified="2026-07-28"
      slug="/mcp-development/stateful-mcp-servers/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'Do I need sticky sessions for an MCP server?',
          answer:
            'If you run more than one replica of an MCP server using streamable HTTP with in-memory sessions, yes. A follow-up POST in an existing session must reach the replica holding that session’s open server-sent events (SSE) stream. Generated-cookie affinity, where the load balancer sets a cookie on the first response and routes every request carrying it to the same backend, is the standard fix. Match the cookie’s lifetime to your session lifetime. The alternative is externalizing transport state to a shared store so any replica can serve any session.',
        },
        {
          question: 'Why do my MCP SSE connections return 502 errors?',
          answer:
            'Most managed load balancers apply a default backend idle timeout (30 seconds on the setup I ran), and a server-sent events (SSE) stream that stays quiet longer than that gets cut with a 502 even though nothing is wrong. Raise the backend timeout well past your longest expected quiet period (I used 300 seconds), disable response buffering in any proxy layer, and make sure your framework serves the route from a long-lived runtime rather than an edge or static path.',
        },
        {
          question: 'How do I scale an MCP server horizontally?',
          answer:
            'You’ve got three options, in increasing order of effort: sticky sessions at the load balancer, which works at small replica counts but ties each session to one process; externalized session state in a shared store like Redis, which lets any replica serve any request; or restructuring long-running tools as jobs that return an ID the client polls, so no request holds a stream at all. Start with sticky sessions and move up when deploys, or the autoscaler removing replicas, start dropping too many sessions.',
        },
        {
          question: 'Should I use stdio or HTTP transport in production?',
          answer:
            'stdio is for local, single-user setups. The client launches your server as a child process, and state lives for exactly as long as the process does, so none of these problems exist. The moment your server runs remotely and serves multiple clients, you are on HTTP transport, and everything in this article applies. Don’t benchmark your production architecture against how the server behaved under stdio on your laptop.',
        },
      ]}
      ctaTitle="Running an MCP server that has to survive production?"
      ctaBody="I audit MCP servers for these failure modes: transport state, load balancer configuration, session lifecycle, timeout and health-check behavior, and tool-surface design. Fixed price, $2,000, credited toward any follow-on work."
      ctaEmailSubject="MCP Server Audit: stateful transport"
      ctaSource="stateful-mcp-article"
    >
      <p>
        At ZeroClick I built an MCP server that let agents provision
        third-party services inside their sessions. A tool call would
        pause partway through to ask the user a question, the user would
        answer, and the work would continue. It ran fine on localhost
        and fine on a single cloud instance.
      </p>
      <p>
        Then we put it behind a load balancer, scaled to two replicas,
        and the core of that flow broke. The moment a user answered a
        question, the call died with a session error or hung until it
        timed out. Nothing in the code had changed. What changed was the
        assumption underneath it: the infrastructure treats every
        service as stateless, and this server isn&rsquo;t one.
      </p>
      <p>
        You may be heading for the same wall if this sounds like your
        setup: an MCP server over streamable HTTP, the transport where
        the server holds a long-lived stream open back to the client,
        and a plan to run more than one replica. The failures look
        random from the outside. Requests reference a session the server
        insists doesn&rsquo;t exist, and streams die mid-response with a
        502.
      </p>
      <p>
        AI engineering keeps producing this collision. Teams stand up an
        MCP server, deploy it the way they deploy the rest of their
        services, and meet these failures the first time real agent
        traffic arrives. The protocol holds per-session state in one
        process&rsquo;s memory, and standard web infrastructure assumes
        no such thing exists.
      </p>
      <p>
        There are three ways out. Sticky sessions, where the load
        balancer pins each client to one backend, are the cheapest.
        Externalizing session state to a shared store lets any replica
        serve any request. Restructuring long-running work as jobs the
        client polls removes the state entirely.
      </p>
      <p>
        Sticky sessions won at ZeroClick, backed by a raised proxy
        timeout and a sweep that expires idle sessions, and the same
        system ran a job-and-poll surface alongside MCP. Each section
        below ends with the fix that
        shipped, and the decision guide at the end covers where the
        other two approaches win and what they cost.
      </p>
      <p>
        Quick version note before the details, as of July 2026. The MCP
        2026-07-28 spec removes protocol-level sessions and the{' '}
        <code>Mcp-Session-Id</code> header entirely, so that any request
        can land on any replica. That&rsquo;s the protocol adopting the
        conclusion this article argues for. Everything below applies to
        the 2025 spec versions that every deployed SDK and client speaks
        today, and to any server that keeps its own state in memory
        regardless of spec version. Migrating a session-era server to
        the new model is its own project.
      </p>

      <h2>A session is an open stream in one process&rsquo;s memory</h2>
      <p>
        From the outside, streamable HTTP looks like ordinary
        request/response. It isn&rsquo;t. When a client initializes a
        session, the server typically opens a server-sent-events stream
        back to it, a long-lived HTTP response the server keeps writing
        messages into. It also keeps a transport object, the SDK&rsquo;s
        per-session connection record, in memory, commonly in a map from
        session ID to transport.
      </p>
      <p>
        The stream is how the server pushes notifications, progress
        updates, and questions back to the client. The map entry is how a
        follow-up POST finds its way to the right stream. Every request
        in the session assumes the process receiving it holds that entry.
      </p>
      <p>
        <strong>
          That&rsquo;s server-side state, pinned to one process, and your
          load balancer has no idea it exists.
        </strong>
      </p>

      <h2>The second replica breaks it</h2>
      <p>
        With one replica, every request lands on the process holding the
        session, so nothing looks wrong. With two, a round-robin load
        balancer, one that rotates requests across replicas in turn,
        sends roughly half of your follow-up requests to a
        replica that has never heard of the session. Those requests fail
        with a 404 &ldquo;session not found&rdquo; error, the client
        retries or starts a new session, and your logs fill with errors
        that correlate with nothing.
      </p>
      <SessionRoutingDiagram />
      <p>
        The sharpest version of this involves elicitation, the MCP
        mechanism where the server pauses a tool call to ask the human a
        question. That is exactly what broke in the provisioning flow
        from the opening. The question went out, the user answered, and
        the call either died with a session error or hung until it timed
        out.
      </p>
      <p>
        Why? The question travels to the client over the session&rsquo;s
        open SSE stream. The answer comes back as a separate HTTP POST,
        and only the instance holding that stream can match the answer to
        the tool call waiting on it. Behind a multi-replica load
        balancer, the answer often landed somewhere else.
      </p>
      <p>
        <strong>
          The fix was generated-cookie session affinity at the load
          balancer: the balancer sets a cookie on the first response and
          routes every request carrying it to the same backend.
        </strong>{' '}
        Set the cookie&rsquo;s TTL, its time-to-live, to match your
        session lifetime. A
        cookie that outlives the session pins clients to a backend for no
        reason, and one that expires early recreates the original bug.
      </p>
      <Code lang="yaml">{`# GCP BackendConfig. Three settings from this article in one
# object: affinity here, the timeout and health check below.
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: mcp-backend
spec:
  sessionAffinity:
    affinityType: GENERATED_COOKIE
    affinityCookieTtlSec: 1800  # 30 min, matched to the session TTL
  timeoutSec: 300               # next section
  healthCheck:
    requestPath: /health/ready  # off the streaming path, see below
    timeoutSec: 2`}</Code>
      <p>
        One caveat worth knowing before you rely on this. Cookie affinity
        only works when the MCP client stores and returns cookies. The
        client I served did, through a fetch wrapper that persisted them.
        A client that ignores cookies silently falls back to round-robin
        routing, and you&rsquo;re back where you started.
      </p>
      <p>
        The alternative to affinity is externalizing the transport state
        so any replica can serve any session. That&rsquo;s more work, and
        I cover it in the decision guide below. Do one or the other
        before adding the second replica.
      </p>

      <h2>Proxies kill healthy streams</h2>
      <p>
        Here&rsquo;s a failure that shows up even with one replica. Long
        tool calls die with a 502 roughly thirty seconds into a quiet
        stream. Short calls work fine, the server logs show nothing, and
        the connection was healthy when it dropped.
      </p>
      <p>
        An SSE stream carrying a slow tool call can sit quiet for
        minutes, and managed load balancers ship with backend idle
        timeouts tuned for request/response traffic. On the setup I ran,
        the default was 30 seconds. Anything quiet past that got cut at
        the balancer.{' '}
        <strong>
          I raised the backend timeout to 300 seconds, sized to the
          longest quiet period a tool call could plausibly produce, and
          the 502s stopped.
        </strong>{' '}
        That&rsquo;s the <code>timeoutSec</code> line in the config
        above.
      </p>
      <p>
        While you&rsquo;re in that layer, check two related things.
        Disable response buffering anywhere in front of the stream, since
        a buffering proxy holds SSE events until its buffer fills, which
        defeats the point of streaming. And confirm the route runs on a
        long-lived server runtime. In my case that meant pinning the
        Next.js route to the Node runtime and forcing it dynamic, because
        static optimization and edge runtimes are built for short
        requests.
      </p>

      <h2>Your in-memory session map is a leak</h2>
      <p>
        Under real traffic, your server&rsquo;s memory grows and keeps
        growing. Take a heap dump and you&rsquo;ll find the session map,
        full of transport objects for clients that will never return.
        Clients disconnect without saying goodbye: an agent gets killed,
        a laptop lid closes, a network path dies, and the clean-shutdown
        handler you wrote never fires.
      </p>
      <p>
        <strong>
          The fix I shipped was a periodic sweep over the map with a
          30-minute TTL keyed on last-activity time, updated on every
          request the session receives.
        </strong>{' '}
        Expire sessions whose last activity is older than the TTL, and
        close their transports when you do.
      </p>
      <Code lang="ts">{`const SESSION_TTL_MS = 30 * 60 * 1000;
const sessions = new Map<
  string,
  { transport: Transport; lastActiveAt: number }
>();

// On every request that carries a session ID:
sessions.get(sessionId).lastActiveAt = Date.now();

// Sweep once a minute. Close what you expire, or the
// transport and its stream outlive the map entry.
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of sessions) {
    if (now - entry.lastActiveAt > SESSION_TTL_MS) {
      entry.transport.close();
      sessions.delete(id);
    }
  }
}, 60 * 1000);`}</Code>
      <p>
        Why last activity rather than creation time? A session created
        two hours ago that handled a request forty seconds ago is alive,
        and expiring it would cut off a working client mid-conversation.
        A session created ten minutes ago that has been silent ever since
        is probably a disconnected client you&rsquo;ll never hear from
        again.
      </p>

      <h2>Health checks and draining</h2>
      <p>
        A process holding fifty open streams can pass a naive health
        check while being unable to do useful work, and it can fail one
        while doing its job perfectly.{' '}
        <strong>
          Define healthy as &ldquo;can accept and serve a new
          session.&rdquo;
        </strong>{' '}
        Use a lightweight endpoint that exercises nothing long-lived, and
        keep the check off the streaming path entirely. Mine was a
        dedicated readiness route with a two-second check timeout,
        separate from the MCP route.
      </p>
      <p>
        Deploys are where session affinity collects its price. Every
        session is pinned to a process, so replacing that process severs
        its sessions. If a tool call is paused waiting on a human, the
        work in flight dies with the stream.
      </p>
      <p>
        Configure your platform to drain on deploy: stop routing new
        sessions to the old replica, give existing streams a window to
        finish or expire, then terminate. The right drain window is
        related to your session TTL. An abrupt kill turns every deploy
        into a small outage for whoever was mid-session.
      </p>

      <h2>A small polling detail worth stealing</h2>
      <p>
        Somewhere in a stateful MCP system you&rsquo;ll write a
        status-polling loop, a client waiting for a long-running
        operation to finish.{' '}
        <strong>
          Put the sleep at the end of the loop body rather than the
          beginning, so the first status check happens immediately.
        </strong>{' '}
        Operations that complete quickly return on the first check
        instead of eating a full polling interval for nothing.
      </p>
      <Code lang="ts">{`const deadline = Date.now() + TIMEOUT_MS;

while (Date.now() < deadline) {
  const status = await getJobStatus(jobId);
  if (status.state !== 'pending') return status;

  // Sleep last. A job that's already done returns on the
  // first check instead of paying a full interval for it.
  await sleep(POLL_INTERVAL_MS);
}
throw new Error('timed out waiting for job');`}</Code>
      <p>
        This one was caught in code review on my provisioning server.
        Every call, even the instant ones, took at least two seconds to
        return, because the loop slept before its first check. Moving one
        line removed a flat latency floor from the happy path.
      </p>

      <h2>Decision guide</h2>
      <ul>
        <li>
          <strong>Accept sticky sessions</strong> when you run a small,
          stable replica count and can tolerate losing in-flight sessions
          on deploys and scale-in, when the autoscaler removes a
          replica. It&rsquo;s a load-balancer setting
          plus a TTL sweep. It&rsquo;s the cheapest correct answer and
          where I&rsquo;d start.
        </li>
        <li>
          <strong>Externalize session state</strong> when deploys are
          frequent, replicas autoscale, or dropped sessions are
          expensive. Transport state moves to a shared store such as
          Redis so any replica can resume any session. You pay in
          architecture: the SDK&rsquo;s in-memory transport model no
          longer maps cleanly, and you own the serialization and
          resumption logic.
        </li>
        <li>
          <strong>Use a job-and-poll design</strong> when the real
          problem is long-running work rather than interactivity. Have
          the tool call return a job ID immediately and let the client
          poll a status endpoint, or take a callback. No request holds a
          stream, every request becomes stateless, and the load balancer
          needs no special configuration. The provisioning system in this
          article ran a plain REST surface alongside MCP built exactly
          this way: an initiate call, then status polls until done. If
          your tools don&rsquo;t need to pause mid-call and ask the user
          questions, this is often the strongest option.
        </li>
      </ul>
      <p>
        Whichever you choose, choose it deliberately. The failure mode of
        not choosing is the default one: in-memory state, round-robin
        routing, and a bug report that says the server works fine on
        localhost.
      </p>
    </ArticleLayout>
  );
}
