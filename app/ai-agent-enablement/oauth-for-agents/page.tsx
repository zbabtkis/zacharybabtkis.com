import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { DeferredOwnershipDiagram } from '@/components/diagrams/deferred-ownership';

export const metadata: Metadata = {
  title: 'OAuth Assumes Your User Already Has an Account',
  description:
    'When an agent sets up a third-party service for a user, OAuth is the wrong shape for the flows that matter most. This guide covers token acquisition strategies, pooled accounts, the claim pattern, and the OAuth mechanics that bite, from the engineer who built agent auto-provisioning at ZeroClick.',
};

export default function OauthForAgentsPage() {
  return (
    <ArticleLayout
      title="OAuth assumes your user already has an account"
      description="The authorization-code flow cannot start an agent-driven trial. These are the token acquisition patterns that can."
      datePublished="2026-07-25"
      slug="/ai-agent-enablement/oauth-for-agents/"
      byline="I led agent-provisioning and AI-traffic engineering at ZeroClick"
      faq={[
        {
          question: 'Can an agent complete an OAuth flow on a user’s behalf?',
          answer:
            'The redirect and consent screen are designed for a human in a browser, and automating them violates most providers’ terms. The workable pattern is to have the agent start the flow and hand the user a URL, then resume once the callback lands server-side. If the user has no account with the provider yet, even that fails, and that’s when you need a platform-owned pool and a deferred claim step instead.',
        },
        {
          question: 'Why not use API keys everywhere?',
          answer:
            'API keys work well when the user already has the service and can paste a key. They fail the same way OAuth does for first-touch flows: a user with no account has no key to paste. Treat both as acquisition strategies behind one interface. The execution path should accept an opaque token and not care how it was obtained.',
        },
        {
          question:
            'How do I hand over a resource my platform created for a user?',
          answer:
            'Provision under your own credentials, then transfer ownership when the user claims it. Send the user a stable link you control, and generate the provider’s invite or transfer link at click time. Those links are typically short-lived and single-use, so one generated at send time is dead before the email is opened. The click-time step also gives you a natural place to record engagement and set a session cookie.',
        },
        {
          question: 'Is this safe from a security standpoint?',
          answer:
            'It can be, with discipline. Exchange tokens server-side only. Never route credentials or provisioning instructions through the agent or the browser. Encrypt pooled account keys at rest. Consume OAuth state with an atomic get-and-delete so it’s single-use, and validate the return destination embedded in state so it can’t smuggle parameters. Time-bound anything provisioned under platform credentials and tear it down automatically.',
        },
      ]}
      ctaTitle="Building flows where agents act on users' behalf?"
      ctaBody="The agent-readiness audit is $3,000, credited toward follow-on work. I evaluate your codebase and auth architecture through an agent's eyes, including the token acquisition, provisioning, and handover patterns this article covers, and you get a sequenced plan with a fixed quote for the build."
      ctaEmailSubject="Agent-Readiness Audit: auth and provisioning"
      ctaSource="oauth-agents-article"
    >
      <p>
        Say you want an agent to set up a third-party service for a user
        in the middle of a conversation. The agent creates the project,
        configures it, and hands over working credentials. The obvious
        answer is OAuth, and everything&rsquo;s fine until you hit the
        assumption buried in the authorization-code flow: the user has to
        authenticate with the provider, which means the user already has
        an account there. Any flow whose value proposition is &ldquo;try
        this service without signing up first&rdquo; can&rsquo;t start
        with OAuth. There&rsquo;s no account to authorize against.
      </p>
      <p>
        I ran into this at ZeroClick, leading a system that let an agent
        set up a third-party service for a user mid-conversation. We
        demoed it to partners and advertisers, and it shaped the
        company&rsquo;s subsequent product direction, though it never
        shipped as a standalone product in that form. The patterns below
        are what survived contact with real providers, real load
        balancers, and real users who open emails hours late.
      </p>

      <h2>OAuth is one strategy for obtaining a token</h2>
      <p>
        The turning point was a refactor we shipped as a breaking change.
        The provisioning path originally assumed OAuth end to end. We
        changed it to accept an opaque access token and stop caring where
        the token came from. Behind that one interface, three acquisition
        strategies became possible: the user completes OAuth, the user
        pastes a platform API key, or the platform supplies credentials
        from a pool of accounts it owns. The execution code is identical
        in all three cases. Which strategy applies is configuration,
        decided per service.
      </p>
      <p>
        This sounds small, but it changes what you can build. The
        pooled-account strategy is the one OAuth can never give you: the
        user tries a fully provisioned service before they have any
        relationship with the provider at all.
      </p>

      <h2>Resource pools are a semaphore over someone else&rsquo;s quota</h2>
      <p>
        Provisioning under your own accounts means living inside the
        provider&rsquo;s limits. Many providers cap free projects per
        account. Ours allowed two, so a single platform account
        can&rsquo;t serve concurrent users. You need a pool, and the pool
        is a concurrency problem: select the least-loaded enabled account
        that&rsquo;s under its cap, increment its counter, and release
        the slot on teardown, all inside a single database transaction.
        Skip the transaction and two concurrent requests read the same
        count, both pick the same account, and you oversubscribe a quota
        you don&rsquo;t control. The pool&rsquo;s API keys are encrypted
        at rest. They&rsquo;re the platform&rsquo;s own credentials, and
        a leak burns every user on that account.
      </p>
      <p>
        The bug worth knowing about in advance is on the release path.
        Ours released the account slot in a code path that ran even when
        teardown had failed, so the slot went back into the pool while
        the project it represented was still alive, and the counter
        drifted under the true usage. Release the slot only after
        teardown succeeds. A failed teardown should hold the slot and
        alert.
      </p>

      <h2>Deferred ownership: the claim pattern</h2>
      <p>
        Provisioning under platform credentials creates a resource the
        user doesn&rsquo;t own. &ldquo;So how does the user end up owning
        it?&rdquo; you ask. You let them try the service, then transfer
        ownership when they decide to keep it. Two design points made
        ours work.
      </p>
      <DeferredOwnershipDiagram />
      <p>
        First, the link you send the user is a stable URL you control,
        with an identifier for the provisioned resource. Never send the
        provider&rsquo;s own transfer link. Second, the provider&rsquo;s
        invite or transfer link gets generated at click time, when the
        user opens yours. Provider transfer links are typically
        short-lived and single-use, and one minted at send time is dead
        by the time anyone opens the email. The click-time hop has a
        second benefit: it&rsquo;s also where you record that the user
        engaged and set a session cookie for the steps that follow.
      </p>

      <h2>Time-bound everything you provision</h2>
      <p>
        Anything created under platform credentials needs a deadline.
        Ours was a two-hour trial window before automatic teardown, cut
        down from an original fifteen days once we saw how the economics
        worked. The stored provisioning context lived slightly longer
        than the deadline itself, three hours against two, so the cleanup
        worker had a grace period to find everything it needed even if it
        ran late.
      </p>
      <p>
        The failure mode here is quiet: a retry path that re-stores the
        context. Ours did, on a failed post-claim step, and every retry
        reset the clock. Resources that should have lived two hours lived
        indefinitely. Deadlines belong in one place, set once at
        provisioning time, and no downstream write should touch them.
      </p>

      <h2>The OAuth mechanics that bite anyway</h2>
      <p>
        For the flows where the user does have an account, OAuth still
        applies, and agent and multi-tenant contexts hit its sharp edges
        harder than a classic web app does.
      </p>
      <ul>
        <li>
          <strong>The redirect URI is a fixed, per-environment value.</strong>{' '}
          Deriving it from the incoming request breaks the moment
          you&rsquo;re behind a load balancer. The host the backend sees
          is the balancer&rsquo;s, and the derived URI stops matching.
          Ours broke this way in production. Providers pin exact
          redirect URIs regardless, so configure it per environment and
          never compute it.
        </li>
        <li>
          <strong>You get one opaque round-trippable field.</strong> The{' '}
          <code>state</code> parameter has to carry both a CSRF nonce and
          where to send the user afterwards. In an agent flow, that return
          destination is a deep link back into the surface the user came
          from. Compose a payload with both, encode it, and on the way back
          validate the return destination strictly. Reject anything that
          could smuggle extra parameters into the redirect.
        </li>
        <li>
          <strong>Store the redirect URI with the state.</strong> The token
          exchange is a different HTTP request from the authorize call, and
          the spec requires it to present an identical{' '}
          <code>redirect_uri</code>. If the value isn&rsquo;t stored
          alongside the state, the exchange has to re-derive it. See the
          previous item for how that ends.
        </li>
        <li>
          <strong>Consume state atomically.</strong> Use get-and-delete in
          one operation, so state is single-use. A read followed by a
          separate delete leaves a window where a replayed callback
          succeeds twice.
        </li>
        <li>
          <strong>Exchange server-side, always.</strong> Tokens and
          provisioning instructions must never route through the agent or
          the browser. Anything that transits the client can be read or
          tampered with there. The client gets a URL to visit and an
          opaque status to poll; the credentials stay on the server.
        </li>
      </ul>

      <h2>Check for scope theater</h2>
      <p>
        Scopes that are registered in the OAuth configuration but never
        enforced by any endpoint give the appearance of authorization
        without the substance. Every token looks scoped; nothing checks
        the scope. We found this in our own gateway and replaced it with
        real per-request verification. Grep for where scopes are
        validated. If the answer is nowhere, the consent screen is
        describing permissions that don&rsquo;t exist.
      </p>

      <h2>The shape that works</h2>
      <p>
        Treat token acquisition as a pluggable strategy: OAuth when the
        account exists, an API key when the user can supply one, a pooled
        platform account when the user has nothing yet. Guard shared
        quotas with transactional pools. Defer ownership with a claim
        step built on stable links and click-time generation. Put a
        deadline on everything provisioned under your credentials, and
        keep the deadline out of reach of retries. The agent never
        touches a credential. That combination let an agent stand up a
        working third-party service for a user who had never heard of the
        provider two minutes earlier, and that&rsquo;s the flow OAuth
        alone can&rsquo;t start.
      </p>
    </ArticleLayout>
  );
}
