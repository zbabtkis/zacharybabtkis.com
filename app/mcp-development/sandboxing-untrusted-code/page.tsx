import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'Running Untrusted JavaScript on Your Own Infrastructure',
  description:
    'A VM context isolates scope, not capability. What it takes to run partner, user, or model-generated code server-side: SSRF and DNS rebinding defenses, log exfiltration, timeouts, and the execution contract, from a system I led at ZeroClick.',
};

export default function SandboxingUntrustedCodePage() {
  return (
    <ArticleLayout
      title="Running untrusted JavaScript on your own infrastructure"
      description="What it takes to execute partner, user, or model-generated code server-side without handing over your network, your logs, or your credentials."
      datePublished="2026-07-25"
      slug="/mcp-development/sandboxing-untrusted-code/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'Is Node’s vm module safe for untrusted code?',
          answer:
            'Not by itself. A vm context isolates scope but not capability: the code gets a fresh global namespace. Anything you place on the sandbox global, and anything reachable through those objects, is available to the code. Node’s own documentation says the module is not a security mechanism. It becomes workable only when you inject a small, wrapped API surface, add a wall-clock timeout, and accept that it gives you no memory or CPU ceiling.',
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
            'Never hand the sandbox your platform’s own fetch. Wrap it: resolve DNS yourself, validate the resolved IP address before connecting, and reject private ranges, link-local ranges, and cloud metadata hostnames. Validating the hostname alone isn’t enough, because DNS rebinding lets a hostname resolve to a public address when you check it and a private one when you connect. Enforce HTTPS as well.',
        },
        {
          question: 'How do I let partners test their code safely?',
          answer:
            'Give them the exact sandbox that runs in production, pointed at test credentials. Keep developer conveniences (console output, verbose errors) enabled in the development environment only, and strip them in production. If the test environment behaves differently from production in its injected API surface, partners will ship code that breaks, and you’ll be tempted to loosen production to match.',
        },
      ]}
      ctaTitle="Exposing an execution layer to partners or agents?"
      ctaBody="Before partner code or agent traffic touches your infrastructure, have someone who has done this walk your integration surface. My MCP server audit is $2,000, takes a week, and covers the execution boundary: what you inject, what can be reached through it, and what leaves through your logs and endpoints. The fee is credited toward any follow-on work."
      ctaEmailSubject="MCP server audit: execution layer review"
      ctaSource="sandboxing-article"
    >
      <p>
        Sooner or later a platform ends up executing code it didn&rsquo;t
        write. A partner ships an integration, a user saves an
        automation, or a model generates a script. The code has to run
        somewhere, and the practical answer is usually your own servers.
        At ZeroClick I led a system where partner-authored integration
        code ran on our infrastructure in a Node <code>vm</code> sandbox.
        This article is the list of things that went wrong, what fixed
        them, and the checklist I now apply to any execution layer before
        it faces partners or agents.
      </p>

      <h2>A VM context isolates scope, not capability</h2>
      <p>
        Node&rsquo;s <code>vm</code> module gives the code a fresh global
        namespace, and that&rsquo;s the entire guarantee. It restricts
        which names the code can see. It says nothing about what the code
        can do. Whatever you place on the sandbox global is the attack
        surface, and everything else the process can reach is reachable
        through those objects. Our sandbox injected four globals: an
        access token, a context object, provisioned credentials, and a
        prompt function for asking a human a question mid-run. That short
        list sounds contained. The problem was the fifth thing we handed
        over.
      </p>

      <h2>The network is the biggest capability you hand over</h2>
      <p>
        Integration code needs to make HTTP calls. That&rsquo;s the whole
        point of an integration. Our first version gave the sandbox the
        platform&rsquo;s own <code>fetch</code>, which meant sandboxed
        code could reach anything the host could reach: internal
        services, and the cloud metadata endpoint. On a host with
        workload identity enabled, the metadata endpoint hands over
        service-account credentials to anyone who asks from inside. A
        sandboxed script three lines long could have walked out with a
        token for our own cloud project. We found this in our own review
        and replaced raw <code>fetch</code> with a wrapper that does
        three things:
      </p>
      <ul>
        <li>
          <strong>Resolves DNS first and validates the resolved
          address.</strong> A hostname allowlist alone loses to DNS
          rebinding. The name resolves to a public address when you check
          it and a private one when you connect. Validate the IP you are
          about to dial.
        </li>
        <li>
          <strong>Blocks private and link-local ranges plus metadata
          hostnames.</strong> RFC 1918 space, 169.254.0.0/16, and the
          metadata hostname by name.
        </li>
        <li>
          <strong>Enforces HTTPS.</strong> No plaintext egress from the
          sandbox.
        </li>
      </ul>

      <h2>Logs are an exfiltration channel</h2>
      <p>
        We piped the sandbox&rsquo;s console output into our platform
        logger so partners could debug. Sounds helpful, right? Console
        output carries whatever the sandboxed code chooses to print,
        including credentials it legitimately holds during a run, and
        those lines flow into log aggregation, dashboards, and whoever
        has read access to any of it. Our first fix was a redaction pass
        over known-sensitive values. We replaced it one day later by
        disabling the sandbox console in production entirely and keeping
        it only in development. The lesson generalizes: you can&rsquo;t
        enumerate what an adversary will print, so control the channel
        rather than the content.
      </p>
      <p>
        Error reporting leaks the same way. When a layer that handles
        credentials reports a failure, log the names of the variables
        involved, never their values. &ldquo;Token exchange failed for
        field <code>refreshToken</code>&rdquo; debugs just as well as the
        token itself, and it survives a log breach.
      </p>

      <h2>Time and resources</h2>
      <p>
        Every run gets a wall-clock timeout. Ours was five minutes. The
        subtle part is deciding what resets it. Our sandboxes could
        suspend mid-run to ask a human a question, and answering
        re-armed the timeout. A sandbox waiting on a person is not a
        runaway loop, and killing it for human thinking time punishes
        the exact flows you built the system for. Only real execution
        should burn the clock.
      </p>
      <p>
        What a same-process VM can&rsquo;t give you is a memory or CPU
        ceiling. A tight loop or a large allocation takes down the whole
        process, timeout or not. That&rsquo;s the line where you move to
        a worker thread, a separate process you can kill, or a microVM.
        We stayed same-process because our code came from contracted
        partners rather than anonymous users. That&rsquo;s a threat-model
        call, and you should make it explicitly rather than by default.
      </p>

      <h2>The execution contract</h2>
      <p>
        Make untrusted code conform to your shape. Our integrations
        were a fixed set of named lifecycle
        functions with a defined callback shape, explicit result and error
        conventions, and the four injected globals as the only API.
        Nothing ambient was exposed: no <code>require</code>, no{' '}
        <code>process</code>, no filesystem. The discipline that pays
        off is to enumerate exactly what you inject and treat that list
        as the security review. If the list fits on one screen, a
        reviewer can reason about it. If it doesn&rsquo;t, nobody can.
      </p>

      <h2>Secrets</h2>
      <p>
        Pass the sandbox a scoped, short-lived token for the one job at
        hand, never long-lived platform credentials. And retrieve
        credentials server-side, never through the caller. In
        our system, instructions and results passed through a browser
        context on the way to the model; anything sensitive that touched
        that hop could be tampered with or read by an XSS on the page. The
        credential exchange happened server to server, always.
      </p>

      <h2>The boundary around the sandbox leaks too</h2>
      <p>
        The sandbox itself is only part of the surface. Any endpoint that
        returns results from sandboxed execution needs its own
        authentication. We had a status endpoint that a browser polled to
        show progress. It had been made public to make polling easy, and
        it still returned provisioned credentials in its payload. Anyone
        with a guessable identifier could fetch another tenant&rsquo;s
        secrets. The fix had two parts: the status path never returns
        secrets, and results are fetched separately with a one-time,
        caller-bound token that&rsquo;s consumed atomically on use. Our
        first attempt at &ldquo;one-time&rdquo; minted a fresh token on
        every poll, which meant an unbounded supply of valid tokens and
        defeated the point. One-time means one token that&rsquo;s used
        once and then invalid.
      </p>

      <h2>The checklist</h2>
      <ol>
        <li>
          List every object you inject into the sandbox. That list is
          your attack surface. Review the list rather than the sandboxed
          code.
        </li>
        <li>
          Wrap all network access: resolve DNS, validate the resolved IP,
          block private and link-local ranges and metadata hostnames,
          require HTTPS.
        </li>
        <li>
          Disable sandbox console output in production. Control the
          channel rather than the content.
        </li>
        <li>
          In error reports from credential-handling code, log variable
          names, not values.
        </li>
        <li>
          Set a wall-clock timeout and decide deliberately what re-arms
          it.
        </li>
        <li>
          Know your resource-ceiling story. Same-process means none.
          Decide whether your threat model tolerates that.
        </li>
        <li>
          Fix the entry point, callback shape, and error conventions.
          Make the code fit your contract.
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
        None of these bugs required a sophisticated attacker. Each one
        was an ordinary engineering decision that was reasonable in
        isolation and wrong at the boundary: hand over fetch, pipe the
        console, open the status endpoint. We caught them in-house
        before anyone else did. The way to get that outcome is to review
        the boundary as its own artifact, before the first line of
        partner code arrives.
      </p>
    </ArticleLayout>
  );
}
