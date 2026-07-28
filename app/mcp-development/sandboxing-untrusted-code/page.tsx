import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';

export const metadata: Metadata = {
  title: 'Running Untrusted JavaScript on Your Own Infrastructure',
  description:
    'A VM context isolates scope, not capability. What it takes to run partner, user, or model-generated code server-side: SSRF and DNS rebinding defenses, log exfiltration, timeouts, and the execution contract, from a system I led at ZeroClick.',
};

export default function SandboxingUntrustedCodePage() {
  return (
    <ArticleLayout
      title="You have to run untrusted JavaScript. A VM sandbox isn't enough."
      description="What it takes to execute partner, user, or model-generated code server-side without handing over your network, your logs, or your credentials."
      datePublished="2026-07-25"
      dateModified="2026-07-28"
      slug="/mcp-development/sandboxing-untrusted-code/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'Is Node’s vm module safe for untrusted code?',
          answer:
            'Not by itself. A vm context isolates scope, not capability: the code gets a fresh global namespace and nothing more is promised. Anything you place on that global, and anything reachable through those objects, is available to the code, and Node’s own documentation says the module is not a security mechanism. It becomes workable only when you inject a small, wrapped API surface, add a wall-clock timeout, and accept that it gives you no memory or CPU ceiling.',
        },
        {
          question: 'What should I use instead of the vm module?',
          answer:
            'It depends on your threat model. For partner code you review and contract with, a same-process VM with a wrapped fetch, no ambient globals, and a timeout can be acceptable. If you need memory or CPU limits, move to a worker thread or a separate process you can kill. For fully adversarial code, such as anonymous users or model-generated scripts run at scale, use a microVM such as Firecracker, which brings its own kernel, or a container hardened with gVisor or seccomp plus network policy. A plain container shares the host kernel and is not an isolation boundary by itself. The injection-surface discipline is the same at every tier; the tiers differ in what happens when the code misbehaves.',
        },
        {
          question:
            'How do I stop sandboxed code from calling my internal services?',
          answer:
            'Never hand the sandbox your platform’s own fetch. Wrap it: resolve DNS yourself, check the resolved address before you connect, and reject private ranges, link-local ranges, and cloud metadata hostnames. A hostname allowlist alone loses to DNS rebinding, where a name resolves to a public address when you check it and a private one when you connect, so connect to the address you validated rather than re-resolving the name. Enforce HTTPS too.',
        },
        {
          question: 'How do I let partners test their code safely?',
          answer:
            'Give them the exact sandbox that runs in production, pointed at test credentials. Keep developer conveniences such as console output and verbose errors enabled in the development environment only, and strip them in production. If the test environment behaves differently from production in its injected API surface, partners will ship code that breaks, and you will be tempted to loosen production to match.',
        },
      ]}
      ctaTitle="Exposing an execution layer to partners or agents?"
      ctaBody="Before partner code or agent traffic touches your infrastructure, have someone who has done this walk your integration surface. My MCP server audit is $2,000, takes a week, and covers the execution boundary: what you inject, what can be reached through it, and what leaves through your logs and endpoints. The fee is credited toward any follow-on work."
      ctaEmailSubject="MCP server audit: execution layer review"
      ctaSource="sandboxing-article"
    >
      <p>
        Sooner or later your platform runs code it didn&rsquo;t write. A
        partner ships an integration, a user saves an automation, or a
        model generates a script, and it has to execute somewhere. The
        practical answer is usually your own servers. At ZeroClick I led
        the execution layer for partner-authored integrations, which ran
        on our infrastructure inside a Node <code>vm</code> sandbox. This
        is the list of things that went wrong, what fixed each one, and
        the checklist I now run against any execution layer before it
        faces partners or agents.
      </p>

      <h2>A VM context isolates scope, not capability</h2>
      <p>
        Node&rsquo;s <code>vm</code> module gives your code a fresh global
        namespace, and that is the whole guarantee. It controls which
        names the code can see. It says nothing about what the code can
        do.{' '}
        <strong>
          Whatever you place on that global is the attack surface, and
          everything reachable through those objects comes with it.
        </strong>
      </p>
      <p>
        It is tempting to count only the API you meant to expose. Our
        sandbox handed the code four things by design: a scoped access
        token, a context object, the provisioned credentials for the run,
        and a <code>prompt</code> function for asking a human a question
        mid-run. That short list is not the real list.
      </p>
      <p>
        So what is actually on that global? Everything we added so
        ordinary code would run: <code>fetch</code>, <code>console</code>,
        timers, <code>Promise</code>, <code>Date</code>, <code>Math</code>,{' '}
        <code>JSON</code>, and <code>crypto</code>, plus a neutered{' '}
        <code>process</code> stub whose <code>exit</code> throws. Count the
        keys and you are closer to fifteen than four, and every one of
        them is part of the surface.
      </p>
      <p>
        Here is why the utilities matter as much as the credentials. Any
        host object you pass into a <code>vm</code> context carries its
        prototype chain with it, and that chain leads back to the{' '}
        <code>Function</code> constructor in your realm. Give the sandbox a
        bare <code>Promise</code> and the code can climb from it to your
        process.
      </p>
      <Code lang="js">{`const vm = require('node:vm');

// A context that looks locked down: one harmless utility injected.
const context = vm.createContext({ Promise });

// Untrusted code climbs the prototype chain of the object you gave it.
// Promise.constructor is the Function constructor from YOUR realm.
vm.runInContext(
  "Promise.constructor('return process')().exit(1)",
  context,
);
// The sandboxed script just called process.exit on your host.`}</Code>
      <p>
        The injected surface is not the four names you think about. It is
        every object on the global, and each host object is a potential
        way out. That is the frame for everything below.
      </p>

      <h2>Sandboxed code can reach everything your server can</h2>
      <p>
        Integration code needs to make HTTP calls. That is the point of an
        integration. The trouble is in how you grant the ability. A
        three-line script can fetch{' '}
        <code>
          http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
        </code>{' '}
        and receive a bearer token for your cloud project, with no error
        and no alert.
      </p>
      <p>
        That address is the cloud metadata server. On a host with workload
        identity enabled, it hands service-account credentials to any
        process that asks from inside the pod, authenticating by network
        position alone. Anything sharing the pod&rsquo;s network is
        &ldquo;inside.&rdquo;
      </p>
      <p>
        Our first version gave the sandbox the platform&rsquo;s own{' '}
        <code>fetch</code>, bound straight to the host. For about five
        weeks, partner code could reach any internal service the pod could
        reach, and the metadata server along with them. We caught it in our
        own review and replaced raw <code>fetch</code> with a wrapper.{' '}
        <strong>
          Never hand the sandbox your platform&rsquo;s own{' '}
          <code>fetch</code>: wrap it so it resolves DNS, checks the
          resolved address, and refuses private ranges and metadata hosts.
        </strong>
      </p>
      <ul>
        <li>It enforces HTTPS. No plaintext egress from the sandbox.</li>
        <li>
          It rejects the metadata hostnames by name, both the GCE and GKE
          forms.
        </li>
        <li>
          It resolves DNS itself and rejects any answer in a private or
          link-local range: RFC 1918 space, 127.0.0.0/8, 169.254.0.0/16,
          0.0.0.0/8, and the IPv6 equivalents.
        </li>
        <li>
          It fails closed. A DNS error rejects the request rather than
          letting it through.
        </li>
      </ul>
      <Code lang="js">{`import dns from 'node:dns/promises';
import net from 'node:net';

const BLOCKED = [/^127\\./, /^10\\./, /^169\\.254\\./, /^192\\.168\\./,
  /^172\\.(1[6-9]|2\\d|3[01])\\./, /^0\\./];
const METADATA_HOSTS = new Set([
  'metadata.google.internal',
  'metadata.gke.internal',
]);

async function safeFetch(url) {
  const { protocol, hostname } = new URL(url);
  if (protocol !== 'https:') throw new Error('https only');
  if (METADATA_HOSTS.has(hostname)) throw new Error('metadata blocked');

  const ip = net.isIP(hostname)
    ? hostname
    : (await dns.lookup(hostname)).address; // fails closed on DNS error
  if (BLOCKED.some((range) => range.test(ip))) {
    throw new Error('private range');
  }
  return fetch(url); // see the gap below: this re-resolves the name
}`}</Code>
      <p>
        One gap worth naming. If you validate the resolved address and then
        call <code>fetch</code> on the original URL, the fetch resolves the
        name a second time, and a low-TTL record can answer with a public
        address for your check and a private one for the connection. To
        close it, pin the connection to the address you validated instead
        of handing the URL back to a resolver.
      </p>

      <h2>Anything the sandbox prints lands in your logs</h2>
      <p>
        A partner is debugging their integration and logs the token
        response they just received. The refresh token is now a plaintext
        string in your log aggregator, searchable by everyone with read
        access. Nobody attacked anything. Someone printed a variable.
      </p>
      <p>
        We had piped the sandbox&rsquo;s console straight into the platform
        logger so partners could debug. Console output carries whatever the
        code chooses to print, including the credentials it legitimately
        holds during a run, and those lines flowed into log aggregation and
        every dashboard built on it.
      </p>
      <p>
        Our first fix was a redaction pass over the values we knew were
        sensitive: the access token and the two OAuth tokens. We replaced
        it the same day, minutes later, by disabling the sandbox console in
        production and keeping it only in development.{' '}
        <strong>
          You cannot enumerate what an adversary will print, so control the
          channel rather than the content.
        </strong>
      </p>
      <p>
        Error reporting leaks the same way. Our GraphQL bridge logged the
        full variables object whenever a mutation failed, and those
        variables carried session and provisioning tokens. The fix was one
        line: log <code>Object.keys(variables)</code>, not the values.
        &ldquo;Provisioning failed for fields <code>sessionToken</code>,{' '}
        <code>tenantApiKey</code>&rdquo; debugs as well as the values do,
        and it survives a log breach.
      </p>

      <h2>The timeout fires while a human is still reading</h2>
      <p>
        A provisioning run pauses to ask the user for a project name. The
        user is reading the question. At minute five the run dies with a
        timeout error, and the work so far is gone.
      </p>
      <p>
        Every run needs a wall-clock timeout. Ours was five minutes. The
        subtle part is deciding what resets it. Our runs could suspend
        mid-execution to ask a human a question, and a run waiting on a
        person is not a runaway loop.
      </p>
      <p>
        So the answer re-arms the timer. Each time an elicitation comes
        back, the five-minute budget starts fresh, and the segments where
        code is actually running draw it down.{' '}
        <strong>
          Decide deliberately what re-arms your timeout, because the naive
          version kills the interactive flows you built the system for.
        </strong>
      </p>
      <Code lang="js">{`const TIMEOUT_MS = 5 * 60 * 1000;
let timer;

function armTimeout(reject) {
  clearTimeout(timer);
  timer = setTimeout(
    () => reject(new Error('execution timed out')),
    TIMEOUT_MS,
  );
}

// The injected prompt re-arms the clock when the answer comes back,
// so each execution segment gets a fresh budget.
const prompt = (question) =>
  askHuman(question).then((answer) => {
    armTimeout(rejectRun);
    return answer;
  });`}</Code>
      <p>
        Two caveats the tidy version hides. Time spent waiting still counts
        until the answer arrives, so a person who sits on one question past
        five minutes trips it anyway. And the rejection abandons the
        promise; it cannot halt code already running in the context, which
        is the next problem.
      </p>

      <h2>A shared process has no memory or CPU ceiling</h2>
      <p>
        One partner uploads <code>while (true) {'{}'}</code> in their
        provisioning code, and the API pod stops answering health checks
        for every tenant on the box until an orchestrator restarts it. The
        wall-clock timer did not save you, because it bounds synchronous
        execution and nothing else.
      </p>
      <p>
        <strong>
          A same-process VM gives you no memory or CPU ceiling, so one
          tight loop or large allocation takes down the whole process.
        </strong>{' '}
        That is the line where you move to a worker thread, a separate
        process you can kill, or a microVM that brings its own kernel.
      </p>
      <p>
        We stayed same-process because our code came from contracted
        partners we reviewed, not anonymous submissions, and it was
        authored through an internal admin dashboard rather than a
        self-serve signup. That is a threat-model call. Make it explicitly
        rather than by inheriting the default.
      </p>

      <h2>The execution contract</h2>
      <p>
        Make untrusted code conform to a shape you defined. Our
        integrations were a fixed set of named lifecycle functions with a
        defined callback shape and explicit result and error conventions.
        The code filled in the functions; it did not get to decide the
        interface.
      </p>
      <p>
        On the capability side, nothing ambient was exposed: no{' '}
        <code>require</code> to pull in packages, no real{' '}
        <code>process</code> object, no filesystem. The only things
        reachable were the ones we put on the global, which loops back to
        the first section.{' '}
        <strong>
          Enumerate exactly what you inject and treat that list as the
          security review.
        </strong>
      </p>
      <p>
        If the list fits on one screen, a reviewer can hold it in their
        head and reason about each entry. If it runs to fifteen keys and
        nobody wrote them down, the four you remember are not the ones that
        will bite you.
      </p>

      <h2>A secret on the browser hop is a secret an XSS can read</h2>
      <p>
        The provisioning flow has a browser leg. OAuth pages redirect
        through it and a status endpoint gets polled for progress. Put a
        credential on that leg and any script injected into the page, or
        any XSS, reads it straight out of the response.
      </p>
      <p>
        So keep secrets off it.{' '}
        <strong>
          Pass the sandbox a scoped, short-lived token for the one job at
          hand, and exchange credentials server to server, never through
          the caller.
        </strong>
      </p>
      <p>
        The sandbox got a per-run access token and the per-recipe
        credentials it needed, each scoped to a single offer and expiring
        in minutes, never a long-lived platform credential. The browser saw
        status and a redeemable reference. The tenant&rsquo;s own backend
        redeemed that reference against its API key to receive the
        credentials. The exchange happened server to server, always.
      </p>

      <h2>Your status endpoint is handing out other tenants&rsquo; secrets</h2>
      <p>
        Curl the status URL with another tenant&rsquo;s offer ID, no auth
        header, and the JSON comes back with their freshly provisioned API
        keys. That was a real state of our system for a while.
      </p>
      <p>
        The endpoint had been made public so the browser could poll it
        without ceremony, and its success payload still carried the
        provisioned credentials. Anyone holding an offer identifier, which
        is caller-supplied rather than a random capability token, could
        pull another tenant&rsquo;s secrets.
      </p>
      <p>
        The fix had two parts. Status stopped returning secrets. Results
        moved behind a one-time, caller-bound token, redeemed server-side.{' '}
        <strong>
          Any endpoint that returns results from sandboxed execution needs
          its own authentication, and status paths return status, never
          secrets.
        </strong>
      </p>
      <p>
        Getting one-time right took a second try. Our first attempt minted
        a fresh token on every poll, which turned &ldquo;one-time&rdquo;
        into an unlimited supply. The redemption is worth stating precisely
        too: it reads the token from Redis and then deletes it, two round
        trips rather than an atomic read-and-delete, so two concurrent
        redemptions can both win the race. One-time means one token, used
        once, and if you want the guarantee under concurrency you need a
        single atomic operation.
      </p>

      <h2>The checklist</h2>
      <ol>
        <li>
          List every object you inject into the sandbox, not just the API
          you meant to expose. That list is your attack surface. Review the
          list, not the sandboxed code.
        </li>
        <li>
          Wrap all network access: enforce HTTPS, reject metadata hosts by
          name, resolve DNS and reject private and link-local ranges, fail
          closed, and connect to the address you validated.
        </li>
        <li>
          Disable sandbox console output in production. Control the channel,
          not the content.
        </li>
        <li>
          In error reports from credential-handling code, log variable
          names, not values.
        </li>
        <li>
          Set a wall-clock timeout and decide deliberately what re-arms it.
        </li>
        <li>
          Know your resource-ceiling story. Same-process means none. Decide
          whether your threat model tolerates that.
        </li>
        <li>
          Fix the entry points, callback shape, and error conventions. Make
          the code fit your contract.
        </li>
        <li>
          Scope every token to the run. Exchange credentials server-side,
          never through the caller.
        </li>
        <li>
          Authenticate every endpoint that touches execution results.
          Status paths return status, never secrets.
        </li>
      </ol>
      <p>
        None of these bugs needed a sophisticated attacker. Each was an
        ordinary engineering decision that read as reasonable in isolation
        and turned wrong at the boundary: hand over <code>fetch</code>, pipe
        the console, open the status endpoint. We found every one of them
        in-house, before a partner or an outsider did. The way to keep it
        that way is to review the boundary as its own artifact, before the
        first line of code you didn&rsquo;t write ever runs.
      </p>
    </ArticleLayout>
  );
}
