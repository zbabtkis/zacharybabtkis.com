import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { RuleBudgetDiagram } from '@/components/diagrams/rule-budget';

export const metadata: Metadata = {
  title: 'Dynamic declarativeNetRequest Rules: Limits, Rule Ownership, and Safari Differences',
  description:
    'Why your dynamic declarativeNetRequest rules stop installing, how to tell which feature installed which rule, and why the same rules behave differently in Safari than in Chrome. Rule budgets, ID provenance, and safe teardown, from an engineer who ran this in a 2M-user ad blocker.',
};

export default function DynamicDnrRulesPage() {
  return (
    <ArticleLayout
      title="When your dynamic rules stop installing, collide, or change meaning in Safari"
      description="Why dynamic rules stop installing, how to tell which feature owns which rule, and why Safari runs the same rules differently. Budgets, rule-ID provenance, selective teardown."
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
            'In Chrome you can watch matches live: load the extension unpacked (straight from a local folder, in developer mode), add the declarativeNetRequestFeedback permission, and the onRuleMatchedDebug event reports every rule match as it happens. Safari has no equivalent event. It does implement getMatchedRules, an after-the-fact query for recent matches, but bug reports against Safari’s version show it returning matches without the rule IDs, and the ID is the whole answer you’re after. So on Safari you fall back to reading your installed rules with getDynamicRules, decoding your own rule-ID scheme to see which subsystem installed what, and testing behavior against real sites. This is one of the reasons encoding provenance in rule IDs pays off. Without it, a dump of installed rules is only integers and match patterns.',
        },
        {
          question: 'When should I use static rulesets instead of dynamic rules?',
          answer:
            'Use static rulesets for anything you know at build time: filter lists, baseline blocking, rules that only need to be toggled on or off as a set. They don’t spend your dynamic budget and they’re validated at package time. Reserve dynamic rules for state you can’t know until runtime: per-site pauses, user opt-ins, server-driven allowlists. If a rule’s content never changes and only its enabled state does, it belongs in a static ruleset.',
        },
        {
          question: 'Do dynamic DNR rules behave the same in Safari as in Chrome?',
          answer:
            'No. In the versions I shipped against, Safari used the older domains key where Chrome used initiatorDomains, refused domain-filtered allowAllRequests rules (so we dropped allowAllRequests entirely on Safari), mishandled redirect actions, and broke sites when requestDomains and domains appeared in the same rule, which forced us to split those into single-domain rules. The same rule set can mean something materially different per platform, so treat parity as a claim to verify per browser version, not an assumption.',
        },
      ]}
      ctaTitle="Porting runtime rule management to Safari?"
      ctaBody="I ran this system in production on Pie Adblock, ZeroClick's two-million-user ad blocker, whose pause, allowlist, and partnership features all drew from one dynamic-rule pool across Chrome and Safari. The Safari port assessment is $2,500, credited toward follow-on work: I inventory your dynamic-rule usage, flag every rule Safari will drop, rewrite, or split, and hand you a fixed quote for the port."
      ctaEmailSubject="Safari Port Assessment: dynamic DNR rules"
      ctaSource="dynamic-dnr-article"
    >
      <p>
        Your extension needs to change what it blocks while it&rsquo;s
        running. A user pauses blocking on one site. A feature
        temporarily allows requests somewhere. Server config changes an
        allowlist. Static <code>declarativeNetRequest</code> rulesets,
        the filter lists you compile at build time and ship in the
        package, cover none of that: the browser validates them before
        your extension ever runs, and their content is fixed.
      </p>
      <p>
        Runtime state means dynamic rules, the ones you add and remove
        with <code>updateDynamicRules</code>, and that API gives you
        almost no structure for managing what accumulates. Everything
        below comes from running dynamic rules in production on Pie
        Adblock, a 2M+ user ad blocker where I owned the Safari and iOS
        extensions. These are the patterns that held up.
      </p>

      <h2>Why dynamic rules suddenly stop installing</h2>
      <p>
        When <code>updateDynamicRules</code> starts failing months into
        production, the first thing to check is the shared budget.{' '}
        <strong>
          The dynamic-rule budget belongs to your extension as a whole,
          not to any one feature.
        </strong>{' '}
        Chrome allows 30,000 dynamic rules for &ldquo;safe&rdquo;
        actions since Chrome 121 and 5,000 for redirect and
        header-modifying rules. Safari&rsquo;s budgets are smaller and
        vary by version.
      </p>
      <p>
        A per-site pause, a partnership allowlist, and a user opt-in
        system all draw from the same pool, so any one of them can
        starve the rest. Staying under the budget takes two things: a
        known per-operation cost in rules for every runtime feature, and
        something that reclaims rules that have outlived their purpose.
      </p>
      <RuleBudgetDiagram />
      <p>
        The per-operation cost is easy to underestimate. On Pie Adblock,
        a single site pause cost two rules: an <code>allow</code> rule
        covering requests the site&rsquo;s pages initiated, and an{' '}
        <code>allowAllRequests</code> rule so the pages and frames
        themselves loaded untouched. Reclamation matters just as much.
        If you don&rsquo;t garbage-collect, rules installed by a
        previous release sit in the pool forever, invisible, until a new
        feature starts failing to install rules and nobody can tell why.
      </p>
      <p>Here&rsquo;s the shape of that pause, so the two-rule cost is
        concrete:</p>
      <Code lang="js">{`// Pausing blocking on one site is two rules: one for the requests
// the site's pages make, one so the pages and frames themselves load.
const [allowId, framesId] = nextRuleIds('pausedByUser'); // next section

await chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      id: allowId,
      priority: 10000,
      action: { type: 'allow' },
      condition: { initiatorDomains: [domain] },
    },
    {
      id: framesId,
      priority: 10001,
      action: { type: 'allowAllRequests' },
      condition: {
        initiatorDomains: [domain],
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    },
  ],
});`}</Code>

      <h2>You can&rsquo;t tell which feature installed which rule</h2>
      <p>
        Six months from now, <code>getDynamicRules</code> hands you back
        integers and match conditions, and nothing in the payload tells
        you which subsystem installed a rule or why. A dynamic rule is
        identified by an integer. There&rsquo;s no label field, no tag,
        no metadata slot.{' '}
        <strong>
          The ID is the only field you have, which means the integer has
          to carry the answer: encode provenance in the ID itself.
        </strong>
      </p>
      <p>
        Here&rsquo;s the scheme that ran on Pie Adblock: an enum of
        two-digit prefixes. One meant &ldquo;paused by the user.&rdquo;
        Another meant &ldquo;paused automatically by a partnership
        feature.&rdquo; Another meant &ldquo;ads allowed because the
        user opted in for one creator&rsquo;s channel.&rdquo; The digits
        after the prefix depended on the subsystem.
      </p>
      <ul>
        <li>Pause rules filled the remaining digits with six random
          digits.</li>
        <li>Rules converted from filter-list text used a hash of the
          rule text, so converting the same rule twice produced the same
          ID.</li>
        <li>Our hosted ruleset, the rules the extension downloads from a
          server at runtime, used plain unix timestamps as IDs. Unix
          timestamps currently start with 17, so the timestamp doubled
          as its own prefix and let us expire any rule older than the
          last merge into the static ruleset.</li>
      </ul>
      <p>
        That scheme turned an opaque integer namespace into a queryable
        one. A question like &ldquo;is this domain paused, and by
        whom?&rdquo; became a matter of listing installed rules and
        decoding IDs, with no parallel bookkeeping store that could
        drift out of sync with what the browser had installed.
      </p>
      <p>The whole scheme fits in a dozen lines. Pick any two-digit
        prefixes; the value is in the discipline, not the numbers:</p>
      <Code lang="js">{`// Two digits of "who installed this and why", then digits that
// vary by subsystem: random for pauses, a content hash for
// converted filter rules so reconverting yields the same ID.
const PREFIX = {
  pausedByUser: '10',
  pausedAutomatically: '11',
  allowedForOptIn: '12',
};

function makeRuleId(reason) {
  const suffix = String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
  return Number(PREFIX[reason] + suffix);
}

// The payoff: "is this domain paused, and by whom?" is answerable
// from the browser's own list. No side table to drift out of sync.
async function pausedByUser(domain) {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  return rules.some(
    (rule) =>
      String(rule.id).startsWith(PREFIX.pausedByUser) &&
      (rule.condition.initiatorDomains || []).includes(domain),
  );
}`}</Code>

      <h2>When one feature&rsquo;s cleanup removes another&rsquo;s rules</h2>
      <p>
        Watch for this symptom: blocking that turns itself back on, or a
        user setting that unwinds on its own. The usual cause is two
        independent features that can each pause or allow the same site,
        with cleanup paths that collide.
      </p>
      <p>
        We hit this class of bug on Pie Adblock with a partnership
        feature I built. It let ads through on YouTube while a
        participating creator&rsquo;s video played, by pausing blocking
        on the domain and re-arming it on a ten-second timer. The
        teardown removed every allow rule matching the domain. So if the
        user had already paused blocking on YouTube themselves, the
        timer fired, swept the user&rsquo;s pause rules out with the
        feature&rsquo;s own, and flipped the blocker back on ten seconds
        after the user turned it off. The fix that shipped was a guard
        up front: before auto-pausing, the feature checked whether a
        pause the user owns was already in place, and if so, stood down.
      </p>
      <p>
        The guard stopped the bleeding, but the durable rule is broader,
        and the ID scheme from the last section is what makes it cheap
        to follow: cleanup code lists dynamic rules, filters to its own
        ID namespace, and removes only those.{' '}
        <strong>
          Deleting by match condition is what lets one feature sweep
          away another&rsquo;s rules.
        </strong>{' '}
        Each subsystem tears down what it installed and nothing else.
      </p>

      <h2>You need per-page behavior but rules only scope to domains</h2>
      <p>
        Say your extension needs different behavior on specific pages of
        a site: one channel, one section, one path.{' '}
        <code>declarativeNetRequest</code> can&rsquo;t express that.{' '}
        <code>allow</code> and <code>allowAllRequests</code> rules scope
        by URL pattern and initiator domain, the domain of the page that
        made the request, and there is no way to say &ldquo;this rule
        applies to one section of a site.&rdquo;
      </p>
      <p>
        I hit the hardest version of this at Pie with a partnership
        feature I led that had to let ads through on specific
        creators&rsquo; channels on YouTube. YouTube gives a URL-based
        blocker nothing to grab. Ad media streams from the same
        googlevideo.com hosts that serve the video itself, and the ad
        instructions ride inside the same player response that carries
        the video data. Our blocking there worked by rewriting those
        responses in a content script, a script the extension injects
        into the page itself, stripping fields like{' '}
        <code>adPlacements</code> out of the JSON before the player read
        them. Block the URL and you block the video. So there was no ad
        URL to allow, either. The only thing DNR could express was all
        of youtube.com or nothing.
      </p>
      <p>
        The design consequence generalizes.{' '}
        <strong>
          Any decision finer than a domain has to live in content
          scripts and extension state, and the blocking layer becomes a
          coarse on/off switch.
        </strong>{' '}
        Here&rsquo;s how the shipped feature worked:
      </p>
      <ol>
        <li>A content script listened for YouTube&rsquo;s page-load
          events and read the channel from the rendered page. The
          channel isn&rsquo;t knowable until the page exists.</li>
        <li>If the user had opted in to that creator, the script
          messaged the background.</li>
        <li>The background paused our response rewriting for all of
          youtube.com, reloaded the tab, and re-armed everything on a
          five-second timer.</li>
        <li>A separate map in the background, keyed by tab ID, tracked
          which tab was in which mode, because the pause covered the
          whole domain.</li>
      </ol>
      <p>
        Notice that no DNR rule changed hands. On YouTube there were
        none to change, and the rules themselves never knew channels
        existed. If you find yourself trying to encode application logic
        into match patterns, stop. Put the logic where it can see the
        page, and keep the blocking layer as the on/off.
      </p>

      <h2>The same rules behave differently in Safari</h2>
      <p>
        When a rule set that works in Chrome breaks sites in Safari, or
        quietly does nothing there, you&rsquo;re not misreading the
        documentation.{' '}
        <strong>
          The same rule JSON does not mean the same thing in Safari.
        </strong>{' '}
        On Pie Adblock we ran every rule set through a conversion pass
        before install. Here&rsquo;s what it had to do:
      </p>
      <ul>
        <li>It renamed <code>initiatorDomains</code> to the older{' '}
          <code>domains</code> key Safari still read.</li>
        <li>It dropped every <code>allowAllRequests</code> rule, because
          Safari refused the domain-filtered kind we depended on.</li>
        <li>It dropped redirect rules outright. Safari applied ours
          badly enough to break Spotify completely, and we never found
          the root cause.</li>
        <li>It split any rule carrying a <code>requestDomains</code>{' '}
          array into one rule per domain, because a Safari bug made{' '}
          <code>requestDomains</code> and <code>domains</code> in the
          same rule take down the whole site. The first domain kept the
          original rule ID. Each additional clone got a deterministic
          hashed ID under its own prefix, so re-running the pass
          produced the same IDs every time.</li>
      </ul>
      <p>A sketch of that pass, simplified but structurally accurate:</p>
      <Code lang="js">{`// Run on every rule set, right before install, Safari build only.
function toSafariRules(rules) {
  return rules.flatMap((rule) => {
    const condition = { ...rule.condition };

    // Safari reads the older 'domains' key, not 'initiatorDomains'.
    if (condition.initiatorDomains) {
      condition.domains = condition.initiatorDomains;
      delete condition.initiatorDomains;
    }

    // Safari mangles redirects and refuses the allowAllRequests
    // rules we depend on. Dropping them beats shipping breakage.
    if (rule.action.type === 'redirect') return [];
    if (rule.action.type === 'allowAllRequests') return [];

    // requestDomains + domains in one rule takes down the whole
    // site in Safari, so each request domain becomes its own rule
    // with a deterministic ID hashed from the rule's content.
    if (condition.requestDomains) {
      const domains = condition.requestDomains;
      delete condition.requestDomains;
      return domains.map((requestDomain, i) => ({
        ...rule,
        id: i === 0 ? rule.id : hashRuleId(rule, requestDomain),
        condition: { ...condition, urlFilter: '||' + requestDomain },
      }));
    }

    return [{ ...rule, condition }];
  });
}`}</Code>
      <p>
        The <code>allowAllRequests</code> case deserves emphasis. A pause
        implemented as a two-rule pair on Chrome sheds half of itself on
        Safari, so a Safari pause was a semantically different operation
        from a Chrome pause built from the same source rules. The rule
        splitting cuts the other way and multiplies rule count, so your
        budget math changes per platform too. Verify behavior on each
        browser and version you support before you trust it.
      </p>

      <h2>Patterns that held up in production</h2>
      <p>
        <strong>Recompute, don&rsquo;t react.</strong> Build a rule
        compiler: a function from current state (user settings, server
        config, active pauses) to the rule set that should exist. When
        state changes, recompute and diff against what&rsquo;s installed.
        That&rsquo;s how Pie Adblock&rsquo;s filter pipeline worked:
        convert the newest filter text into rules, list what the browser
        already had with <code>getDynamicRules</code>, then add and
        remove only the difference. Settings toggles did the same math
        against the list of enabled rulesets.
      </p>
      <p>
        You can&rsquo;t make rule decisions per request anyway. DNR is
        declarative by design: you hand the browser the rulebook ahead
        of time, the browser matches every request against it on its
        own, and your code never hears about individual requests. Chrome
        frames that as a privacy feature. The practical consequence is
        that your only lever is the installed rule set, so keep the code
        that produces it a straight function of state.
      </p>
      <p>
        <strong>Watermark your IDs.</strong> The hosted-ruleset trick
        above generalizes: when IDs carry timestamps, they double as
        garbage-collection watermarks. On startup, compare installed rule
        IDs against the last ruleset update and drop anything stale. This
        is what keeps rules from a release two versions ago from leaking
        budget indefinitely.
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
