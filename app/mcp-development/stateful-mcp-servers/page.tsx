import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

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
      slug="/mcp-development/stateful-mcp-servers/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'Do I need sticky sessions for an MCP server?',
          answer:
            'If you run more than one replica of an MCP server using streamable HTTP with in-memory sessions, yes. A follow-up POST in an existing session must reach the replica holding that session’s open SSE stream. Generated-cookie affinity at the load balancer, with a cookie TTL matched to your session lifetime, is the standard fix. The alternative is externalizing transport state to a shared store so any replica can serve any session.',
        },
        {
          question: 'Why do my MCP SSE connections return 502 errors?',
          answer:
            'Most managed load balancers apply a default backend idle timeout (30 seconds on the setup I ran), and an SSE stream that stays quiet longer than that gets cut with a 502 even though nothing is wrong. Raise the backend timeout well past your longest expected quiet period (I used 300 seconds), disable response buffering in any proxy layer, and make sure your framework serves the route from a long-lived runtime rather than an edge or static path.',
        },
        {
          question: 'How do I scale an MCP server horizontally?',
          answer:
            'You’ve got three options, in increasing order of effort: sticky sessions at the load balancer, which works at small replica counts but ties each session to one process; externalized session state in a shared store like Redis, which lets any replica serve any request; or restructuring long-running tools as jobs that return an ID the client polls, so no request holds a stream at all. Start with sticky sessions and move up when deploys or scale-in events start dropping too many sessions.',
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
        Your MCP server works on localhost. It works on a single cloud
        instance. Then you put it behind a load balancer, scale to two
        replicas, and sessions start failing in ways that look random:
        requests that reference a session the server claims doesn&rsquo;t
        exist, streams that die mid-response with a 502. Nothing in your
        code changed. What changed is that your infrastructure assumes a
        stateless service, and an MCP server over streamable HTTP
        isn&rsquo;t one.
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
        back to it and keeps a transport object for that session in
        memory, commonly a map from session ID to transport. Every
        subsequent request in that session assumes the process that
        receives it holds that entry. The stream is how the server pushes
        notifications, progress, and elicitation requests to the client;
        the map entry is how a follow-up POST finds its way back to the
        right stream.
      </p>
      <p>
        That&rsquo;s server-side state, pinned to one process, and your
        load balancer has no idea it exists.
      </p>

      <h2>The second replica breaks it</h2>
      <p>
        With one replica, every request lands on the process holding the
        session, so everything&rsquo;s good. With two, a round-robin load
        balancer sends roughly half of your follow-up requests to a
        replica that has never heard of the session. The request fails,
        the client retries, maybe initializes a new session, and your
        logs fill with session-not-found errors that correlate with
        nothing.
      </p>
      <p>
        The sharpest version of this involves elicitation, the MCP
        mechanism where the server pauses a tool call to ask the human a
        question. I hit it on an MCP server I built at ZeroClick that
        provisioned third-party services inside agent sessions:
        provisioning would pause on a question, the user would answer, and
        the answer POST had to reach the exact instance holding the open
        SSE stream for that session. Behind a multi-replica load balancer
        it often didn&rsquo;t. The fix was generated-cookie session
        affinity at the load balancer: the balancer sets a cookie on the
        first response and routes every request carrying it to the same
        backend. Set the cookie&rsquo;s TTL to match your session
        lifetime. An affinity cookie that outlives the session pins
        clients to a backend for no reason, and one that expires early
        recreates the original bug.
      </p>
      <p>
        The alternative to affinity is externalizing the transport state
        so any replica can serve any session. That&rsquo;s more work, and
        I cover it in the decision guide below. But do one or the other
        before adding the second replica.
      </p>

      <h2>Proxies kill healthy streams</h2>
      <p>
        An SSE stream that carries a slow tool call can sit quiet for
        minutes. Managed load balancers ship with backend idle timeouts
        tuned for request/response traffic. On the setup I ran, the
        default was 30 seconds. When the stream stays quiet past that,
        the balancer cuts it, and the client sees a 502 on a connection
        that was working correctly. The fix is configuration rather
        than code: I raised the
        backend timeout to 300 seconds, sized to the longest quiet period
        a tool call could plausibly produce.
      </p>
      <p>
        While you&rsquo;re in that layer, check two related things.
        Disable response buffering anywhere in front of the stream, since
        a buffering proxy holds SSE events until its buffer fills, which
        defeats the point of streaming. And confirm your framework
        runs the route on a long-lived server runtime. Static
        optimization and edge runtimes are built for short requests;
        a route that holds a stream open needs a process that stays up.
      </p>

      <h2>Your in-memory session map is a leak</h2>
      <p>
        Clients disconnect without saying goodbye. An agent gets killed,
        a laptop lid closes, or a network path dies, and the
        clean-shutdown handler you wrote never fires. Each of those
        leaves an entry in the session map and a transport object nobody
        will ever use again. Under real traffic the map only grows.
      </p>
      <p>
        The fix I shipped was to sweep the map on a TTL (30 minutes in
        my case) and track last-activity time on each session, updating
        it on every request the session receives. Expire sessions whose
        last activity is older than the TTL. Why last activity rather
        than creation time? A session created two hours ago that handled
        a request forty seconds ago is alive, and expiring it would cut
        off a working client mid-conversation. A session created ten
        minutes ago that has been silent ever since is probably a
        disconnected client you&rsquo;ll never hear from again.
      </p>

      <h2>Health checks and draining</h2>
      <p>
        A process holding fifty open streams can pass a naive health
        check while being unable to do useful work, and it can fail one
        while doing its job perfectly. Define healthy as &ldquo;can
        accept and serve a new session.&rdquo; Use a lightweight endpoint
        that exercises nothing long-lived, and keep the health check off
        the streaming path entirely.
      </p>
      <p>
        Deploys are where session affinity collects its price. Every
        session is pinned to a process, so replacing that process severs
        its sessions. If a tool call is paused waiting on a human,
        the work in flight dies with the stream. Configure your platform
        to drain on deploy: stop routing new sessions to the old replica,
        give existing streams a window to finish or expire, then
        terminate. The right drain window is related to your session TTL.
        An abrupt kill turns every deploy into a small outage for
        whoever was mid-session.
      </p>

      <h2>A small polling detail worth stealing</h2>
      <p>
        Somewhere in a stateful MCP system you&rsquo;ll write a
        status-polling loop, a client waiting for a long-running
        operation to finish. Put the sleep at the end of the loop body
        rather than the beginning, so the first status check happens
        immediately. Operations that complete quickly get their result on
        the first check instead of eating a full polling interval for
        nothing. It&rsquo;s a one-line difference and it shaves the
        common case for every caller.
      </p>

      <h2>Decision guide</h2>
      <ul>
        <li>
          <strong>Accept sticky sessions</strong> when you run a small,
          stable replica count and can tolerate losing in-flight sessions
          on deploys and scale-in. It&rsquo;s a load-balancer setting
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
          needs no special configuration. If your tools don&rsquo;t need
          mid-call elicitation, this is often the strongest option.
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
