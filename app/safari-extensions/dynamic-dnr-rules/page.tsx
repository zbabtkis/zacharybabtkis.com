import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'Dynamic declarativeNetRequest Rules: Scoping, Budgeting, and Safely Undoing Them',
  description:
    'How to manage dynamic declarativeNetRequest rules at runtime: the shared rule budget, encoding provenance in rule IDs, provenance-aware teardown, and the ways Safari silently changes what your rules mean, from an engineer who ran this in a 2M-user ad blocker.',
};

export default function DynamicDnrRulesPage() {
  return (
    <ArticleLayout
      title="Dynamic declarativeNetRequest rules: scoping, budgeting, and safely undoing them"
      description="Managing declarativeNetRequest rules at runtime: budgets, rule-ID provenance, selective teardown, and Safari divergence."
      datePublished="2026-07-25"
      slug="/safari-extensions/dynamic-dnr-rules/"
      byline="I shipped Safari and iOS extensions at Honey and Pie"
      faq={[
        {
          question: 'How many dynamic declarativeNetRequest rules can an extension have?',
          answer:
            'Chrome allows 30,000 dynamic "safe" rules (block, allow, allowAllRequests, upgradeScheme) since Chrome 121, and 5,000 for rules that redirect or modify headers. Safari enforces its own, smaller budgets that differ by version. The practical consequence is the same everywhere: every subsystem that adds rules at runtime spends from one shared pool, so you need to know what each operation costs in rules and garbage-collect stale ones.',
        },
        {
          question: 'How do I debug which rule matched a request?',
          answer:
            'In Chrome, an unpacked extension with the declarativeNetRequestFeedback permission can listen to onRuleMatchedDebug and see every match. Safari has no equivalent, so you fall back to reading your installed rules with getDynamicRules, decoding your own rule-ID scheme to see which subsystem installed what, and testing behavior against real sites. This is one of the reasons encoding provenance in rule IDs pays off. Without it, a dump of installed rules is only integers and match patterns.',
        },
        {
          question: 'When should I use static rulesets instead of dynamic rules?',
          answer:
            'Use static rulesets for anything you know at build time: filter lists, baseline blocking, rules that only need to be toggled on or off as a set. They don’t spend your dynamic budget and they’re validated at package time. Reserve dynamic rules for state you can’t know until runtime: per-site pauses, user opt-ins, server-driven allowlists. If a rule’s content never changes and only its enabled state does, it belongs in a static ruleset.',
        },
        {
          question: 'Do dynamic DNR rules behave the same in Safari as in Chrome?',
          answer:
            'No. In the versions I shipped against, Safari used the older domains key where Chrome used initiatorDomains, dropped allowAllRequests rules that carried domain filters, dropped redirect actions, and required rules combining requestDomains with domain scoping to be split into several single-domain rules. The same rule set can mean something materially different per platform, so treat parity as a claim to verify per browser version, not an assumption.',
        },
      ]}
      ctaTitle="Porting runtime rule management to Safari?"
      ctaBody="I ran this system in production on Pie Adblock, ZeroClick's two-million-user ad blocker, whose pause, allowlist, and partnership features all drew from one dynamic-rule pool across Chrome and Safari. The Safari port assessment is $2,500, credited toward follow-on work: I inventory your dynamic-rule usage, flag every rule Safari will drop, rewrite, or split, and hand you a fixed quote for the port."
      ctaEmailSubject="Safari Port Assessment: dynamic DNR rules"
      ctaSource="dynamic-dnr-article"
    >
      <p>
        Static <code>declarativeNetRequest</code> rulesets are the easy
        half of the API. You compile a filter list at build time, ship it
        in the package, and the browser validates it before your extension
        ever runs. The hard half is dynamic rules: the ones you add and
        remove at runtime in response to user state. A user pauses
        blocking on one site. A feature temporarily allows requests
        somewhere. Server config changes an allowlist. Each of those is an{' '}
        <code>updateDynamicRules</code> call, and the API gives you almost
        no structure for managing what accumulates. At Pie, a 2M+ user ad
        blocker where I owned the Safari and iOS extension domain, dynamic
        rules were where every hard DNR problem lived. Here&rsquo;s what
        held up.
      </p>

      <h2>Every feature spends from one budget</h2>
      <p>
        The dynamic-rule budget belongs to your extension as a whole, not
        to any one feature. Chrome allows 30,000 dynamic rules for
        &ldquo;safe&rdquo; actions since Chrome 121 and 5,000 for
        redirect and header-modifying rules; Safari&rsquo;s budgets are
        smaller and vary by version. A per-site pause, a partnership
        allowlist, and a user opt-in system all draw from the same pool.
        At Pie, a single site pause cost two rules, so the accounting
        mattered: every runtime feature needed a known per-operation cost
        in rules, and something had to reclaim rules that outlived their
        purpose. If you don&rsquo;t garbage-collect, rules installed by a
        previous release sit in the pool forever, invisible, until a new
        feature starts failing to install rules and nobody knows why.
      </p>

      <h2>Rule IDs are the only metadata you get</h2>
      <p>
        A dynamic rule is identified by an integer. There&rsquo;s no label
        field, no tag, no metadata slot. Six months from now,{' '}
        <code>getDynamicRules</code> hands you back integers and match
        conditions, and nothing in the payload tells you which subsystem
        installed a rule or why. So where does the metadata live? The ID
        is the only field you have, which means the integer has to carry
        the answer: encode provenance in the ID itself.
      </p>
      <p>
        At Pie we kept an enum of leading digits. One prefix meant
        &ldquo;paused by the user.&rdquo; Another meant &ldquo;paused
        automatically by a partnership feature.&rdquo; Another meant
        &ldquo;allowed by a per-channel user opt-in.&rdquo; The remaining
        digits held a timestamp or a hash. That scheme turned an opaque
        integer namespace into a queryable one. A predicate like
        &ldquo;is this domain paused, and by whom?&rdquo; became a matter
        of listing installed rules and decoding IDs, with no parallel
        bookkeeping store that could drift out of sync with what the
        browser had installed.
      </p>

      <h2>Teardown must be provenance-aware</h2>
      <p>
        The ID scheme earns its keep at removal time. Several independent
        features can each pause or allow the same site, and everything
        works until their cleanup paths collide. A user pauses
        blocking on a domain; later, an automatic feature pauses the same
        domain for its own reasons. If that feature&rsquo;s cleanup step
        removes &ldquo;the rules for this domain,&rdquo; it tears down the
        user&rsquo;s pause along with its own, and silently re-enables
        blocking the user explicitly turned off. We hit this class
        of bug on Pie Adblock: a partnership feature that auto-paused blocking on
        specific sites had to check for an existing user pause first,
        because its automatic re-arm would otherwise have flipped the
        blocker back on about ten seconds after the user turned it off.
      </p>
      <p>
        The rule that came out of it: removal code never deletes by match
        condition. It lists dynamic rules, filters to its own ID
        namespace, and removes only those. Each subsystem tears down what
        it installed and nothing else.
      </p>

      <h2>A domain is the finest scope you get</h2>
      <p>
        <code>allow</code> and <code>allowAllRequests</code> rules scope
        by URL pattern and initiator domain. That sounds flexible until
        you need something finer than a domain. You can&rsquo;t express
        &ldquo;this rule applies to one section of a site.&rdquo; At Pie
        I led a partnership feature that had to let ads through on
        specific channels of a video platform. On YouTube, ad media is
        served from the same hosts as the video content itself, and the
        blocking that matters happens at the response level, not the URL
        level. There was no URL to allow. The only thing DNR could
        express was all of youtube.com or nothing.
      </p>
      <p>
        The design consequence generalizes: any decision finer than a
        domain has to move out of DNR and into content scripts and
        extension state. DNR becomes a coarse switch. In the shipped
        design, a content script identified the channel after the page
        loaded, the background flipped a domain-wide pause for that tab
        for a few seconds, and separate state tracked which tab was in
        which mode. The rules themselves never knew channels existed. If
        you find yourself trying to encode application logic into match
        patterns, stop. Put the logic where it can see the page, and let
        DNR handle the on/off.
      </p>

      <h2>Safari changes what your rules mean</h2>
      <p>
        The same rule JSON does not mean the same thing in Safari. Our
        conversion layer on Pie Adblock handled, among other things:{' '}
        <code>initiatorDomains</code> translated to the older{' '}
        <code>domains</code> key; <code>allowAllRequests</code> rules
        with domain filters dropped entirely, because Safari didn&rsquo;t
        support them; redirect actions dropped; and rules combining{' '}
        <code>requestDomains</code> arrays with domain scoping split into
        several single-domain rules, each with a synthetic hashed ID
        under its own namespace prefix.
      </p>
      <p>
        The <code>allowAllRequests</code> case deserves emphasis. A pause
        implemented as a two-rule pair on Chrome sheds half of itself on
        Safari. The code comment in our converter said we hoped the
        remaining <code>allow</code> rule covered the same ground. That
        hope was load-bearing. A Safari pause was a semantically
        different operation from a Chrome pause built from the same
        source rules. The rule splitting also multiplies rule count, so
        your budget math changes per platform too. Verify behavior on
        each browser and version you support; parity is a claim to test,
        not a property of the API.
      </p>

      <h2>Patterns that held up in production</h2>
      <p>
        <strong>Recompute, don&rsquo;t react.</strong> Build a rule
        compiler: a function from current state (user settings, server
        config, active pauses) to the rule set that should exist. When
        state changes, recompute and diff against what&rsquo;s installed.
        You can&rsquo;t make rule decisions per request anyway; DNR
        doesn&rsquo;t run your code in the request path.
      </p>
      <p>
        <strong>Watermark your IDs.</strong> Because IDs can carry
        timestamps, they double as garbage-collection watermarks. On
        startup, compare installed rule IDs against the last ruleset
        update and drop anything stale. This is what keeps rules from a
        release two versions ago from leaking budget indefinitely.
      </p>
      <p>
        <strong>Keep automatic pauses out of the UI.</strong> When a
        feature pauses blocking on the user&rsquo;s behalf, don&rsquo;t
        flip the &ldquo;your protection is paused&rdquo; indicator. At
        Pie the auto-pause set no user-facing flag, because showing one
        would have told users their protection was off when, from their
        point of view, it wasn&rsquo;t. Provenance-encoded IDs make this
        distinction cheap to maintain.
      </p>
      <p>
        <strong>Test per browser version.</strong> Every divergence in
        the Safari section above was discovered by running the real rule
        set on real Safari, not by reading documentation. Budgets,
        supported keys, and action types all vary by version.
      </p>
      <p>
        Each of these patterns exists because a bug forced it. The API
        surface is small: <code>updateDynamicRules</code>,{' '}
        <code>getDynamicRules</code>, and an integer namespace. The
        structure it doesn&rsquo;t provide, you have to build: an ID
        scheme, a budget ledger, and a teardown discipline that respects
        both.
      </p>
    </ArticleLayout>
  );
}
