import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';

export const metadata: Metadata = {
  title: 'Safari Has No Blocking webRequest: What to Do Instead',
  description:
    'Safari doesn’t support the blocking webRequest API. How to migrate request blocking and rewriting to declarativeNetRequest, what survives the move, and what needs redesign, from the engineer who did it for a 2M-user ad blocker.',
};

export default function WebRequestAlternativePage() {
  return (
    <ArticleLayout
      title="Safari has no blocking webRequest. Here's what to do instead."
      description="Migrating request blocking and rewriting from webRequest to declarativeNetRequest for Safari."
      datePublished="2026-07-24"
      dateModified="2026-07-28"
      slug="/safari-extensions/webrequest-alternative/"
      ctaTitle="Migrating a real extension's blocking layer?"
      ctaBody="I did this migration for an ad blocker with two million users. The port assessment maps every one of your webRequest usages to its Safari answer: kept, redesigned, or cut. You get a fixed quote for the work."
      ctaEmailSubject="Safari Port Assessment: webRequest migration"
      ctaSource="webrequest-article"
    >
      <p>
        You ran the converter, the extension loads in Safari, and the
        request blocking does nothing. No errors. The rules installed
        without complaint, <code>getDynamicRules</code> returns them,
        and ads load anyway. Or worse: a site that worked in Chrome
        breaks outright. You didn&rsquo;t break the port. This is
        Safari&rsquo;s design.
      </p>
      <p>
        I did this migration for Pie Adblock, a 2M+ user ad blocker
        where I owned the Safari and iOS extensions. Everything below
        is what shipped: what ports cleanly, what needs a redesign, and
        how to find the failures that never reach the console.
      </p>

      <h2>The model change</h2>
      <p>
        Start with the first thing to verify, because it explains most
        silent failures. A <code>webRequest</code> listener registered
        with the <code>blocking</code> option never intercepts anything
        in Safari. The request completes no matter what your listener
        returns.
      </p>
      <p>
        In Chrome, historically, your JavaScript could sit in the
        request path: see each request, decide, then block or rewrite
        it. Safari never supported that. What Safari 15 and later does
        support is observation, meaning non-blocking{' '}
        <code>webRequest</code> events that tell you a request
        happened.{' '}
        <strong>
          Extension code in Safari can watch requests, but it can never
          block or modify one in flight.
        </strong>
      </p>
      <p>
        Observe-only uses can stay. Guard them so the same background
        script runs on a build where the API is absent:
      </p>
      <Code lang="js">{`// Safari has never run blocking webRequest: the 'blocking' option
// is unavailable, and the request completes regardless of what a
// listener returns. Since Safari 15 the events do fire as
// notifications, so observe-only uses still work.
//
// Our Safari build omits the webRequest permission entirely, so
// the API object is absent there. Optional chaining turns this
// whole registration into a no-op on that build.
browser.webRequest?.onHeadersReceived.addListener(
  (details) => {
    // Fine anywhere: note that the page produced a response.
    markPageLoaded(details.tabId);
    // No return value from here can block the request in Safari.
  },
  { urls: ['<all_urls>'], types: ['main_frame'] },
);`}</Code>
      <p>
        So how do you block anything? You declare it. Safari implements{' '}
        <code>declarativeNetRequest</code>, DNR for short: you register
        rules ahead of time, built from match patterns, resource types,
        and actions like block or header modification, and the browser
        applies them itself. Your code never hears about individual
        requests.
      </p>
      <p>
        Chrome pushed the same direction with Manifest V3, so if you
        already built DNR rules for Chrome, a meaningful part of the
        Safari migration is done. The differences that remain are rule
        limits, supported action types, and behavior that shifts with
        Safari versions. The rest of this article maps where those
        differences bite.
      </p>

      <h2>What survives the migration cleanly</h2>
      <p>
        <strong>
          A good share of a typical blocking layer ports without
          redesign.
        </strong>{' '}
        Three categories carry over, one of them with a version floor
        worth writing down.
      </p>
      <ul>
        <li>
          Static blocklists survive. Domain and URL-pattern blocking
          translates directly into DNR rules.
        </li>
        <li>
          Header changes survive, with a version floor. Removing or
          setting specific headers is expressible as{' '}
          <code>modifyHeaders</code> rules on Safari 15.4 and later,
          and only with the{' '}
          <code>declarativeNetRequestWithHostAccess</code> permission
          in the manifest. Below that floor, ported header code stops
          rewriting and nothing tells you.
        </li>
        <li>
          User-toggled rule sets survive. Static rulesets are declared
          in the manifest, and <code>updateEnabledRulesets</code> flips
          them on and off at runtime as settings change. Pie&rsquo;s
          cookie-popup blocking and allowlists worked this way, with a
          periodic reconciliation pass keeping browser state in line
          with settings.
        </li>
      </ul>
      <p>
        Here&rsquo;s what a header rewrite looks like on the other side
        of the migration:
      </p>
      <Code lang="js">{`// The MV2 version of this ran in onBeforeSendHeaders and decided
// per request. The Safari version is a declaration the browser
// applies on its own. It needs Safari 15.4 or later plus the
// declarativeNetRequestWithHostAccess permission in the manifest.
// Miss either one and the rule is ignored with no error.
await browser.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      id: SET_REFERER_RULE_ID,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Referer', operation: 'set', value: 'https://partner.example/' },
        ],
      },
      condition: {
        urlFilter: '||api.partner.example^',
        resourceTypes: ['xmlhttprequest'],
      },
    },
  ],
});`}</Code>
      <p>
        Notice what&rsquo;s missing from the list: redirects. They get
        their own section.
      </p>

      <h2>When a redirect rule takes down a whole site</h2>
      <p>
        A redirect rule that behaves in Chrome can break an entire site
        in Safari. Safari&rsquo;s documentation lists the redirect
        action as supported, and a simple from-pattern-to-URL rule may
        pass your tests. Production is where the trouble shows up.
      </p>
      <p>
        On Pie, with our redirect rules loaded, Spotify broke
        completely. We never found the root cause. The fix that shipped
        drops every redirect rule from the Safari build, giving up
        redirect-based blocking there in exchange for sites that work.{' '}
        <strong>
          Verify redirect rules on the real sites your users visit
          before you ship them to Safari, and be ready to cut them.
        </strong>
      </p>

      <h2>What needs a redesign</h2>
      <p>
        <strong>
          Anything that depended on your code hearing about individual
          requests needs a new home.
        </strong>{' '}
        Four categories cover most of the redesign work.
      </p>
      <ul>
        <li>
          Logic that inspects request or response content. DNR matches
          on URL, resource type, and header-level patterns, and it will
          never show your code the payload. Whatever decision you were
          making from content has to move into a content script, into
          heuristics you can express as rules, or out of the product.
        </li>
        <li>
          Rules computed per request at runtime. You can update dynamic
          rules often, just never in the request path. New rules also
          don&rsquo;t affect requests already in flight on the current
          page. The pattern that works is recompile and reload:
          regenerate the rule set when state changes, diff it against
          what&rsquo;s installed, then reload the page so the new rules
          meet a fresh request stream.
        </li>
        <li>
          Counting and telemetry from the request path. Nothing fires
          when a rule matches, so a &ldquo;blocked 47 ads on this
          page&rdquo; counter reads zero while blocking works fine. The
          browser&rsquo;s match feedback can&rsquo;t carry it in
          production: <code>getMatchedRules</code> is quota-limited,
          and <code>onRuleMatchedDebug</code> only works in Chrome with
          the extension loaded unpacked from a local folder. Pie&rsquo;s
          shipped counters came entirely from DOM-level signals,
          injected scripts counting the ad placements they found and
          hid, while the browser&rsquo;s match data ran only in a
          development monitor compiled out of production.
        </li>
        <li>
          Massive filter lists. Chrome&rsquo;s Manifest V3 allows up to
          330,000 enabled static rules; Safari&rsquo;s ceiling is
          smaller and moves by version, raised from 50,000 to 150,000
          in Safari 15. Pie&rsquo;s Chrome build shipped a list of
          roughly 195,000 rules, while the Safari build shipped a
          pruned list of about 43,000 plus a mobile-optimized
          companion. A big list needs a per-browser pruning strategy,
          because over the limit the list fails to load or coverage
          quietly degrades.
        </li>
      </ul>

      <h2>The broken rules already on user devices</h2>
      <p>
        One more trap, and it&rsquo;s the mechanism behind the silent
        failure this article opened with. Safari accepts Chrome-shaped
        rules into its dynamic rule store without an error, and{' '}
        <code>getDynamicRules</code> returns them afterward. They just
        never match, or they match destructively and break the site.
        They also persist on user devices across extension updates.
      </p>
      <p>
        Fixing your rule converter repairs future installs only.{' '}
        <strong>
          The broken rules already sitting on user devices stay there
          until you ship a repair pass that rewrites them.
        </strong>{' '}
        Here&rsquo;s the shape of the one we shipped:
      </p>
      <Code lang="js">{`// Safari accepted these rules without complaint, so the invalid
// ones are sitting in the dynamic store on real devices, doing
// nothing or breaking sites. They survive extension updates.
// This runs once at startup on the Safari build and rewrites them.
async function repairInstalledRules() {
  const rules = await browser.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = [];
  const addRules = [];

  for (const rule of rules) {
    if (rule.action.type === 'allowAllRequests') {
      // Safari refuses the domain-filtered form we relied on. Drop it.
      removeRuleIds.push(rule.id);
    } else if (rule.condition.initiatorDomains) {
      // Rewrite to the older 'domains' key Safari reads.
      const { initiatorDomains, ...rest } = rule.condition;
      removeRuleIds.push(rule.id);
      addRules.push({ ...rule, condition: { ...rest, domains: initiatorDomains } });
    }
  }

  if (removeRuleIds.length === 0) return;
  await browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}`}</Code>
      <p>
        There&rsquo;s no error surface here, so the only way we could
        tell the repair worked at scale was analytics. Every branch in
        the pass reported an identifier we could count. Budget for
        that. You&rsquo;re debugging a system that will never log
        anything on its own. The full set of key renames and rule
        splits Safari needs is in{' '}
        <a href="/safari-extensions/dynamic-dnr-rules/">
          the dynamic rules article
        </a>
        .
      </p>

      <h2>How I approach the migration</h2>
      <ol>
        <li>
          Inventory every <code>webRequest</code> listener and write
          down what each one does for the user, separate from how it
          does it.
        </li>
        <li>
          Sort each listener into four buckets: expressible as static
          rules, expressible as dynamic rules, needs redesign, or not
          portable. Be ruthless about the last bucket early.
        </li>
        <li>
          Build the rule compiler, the code that turns your source of
          truth (filter lists, user settings, server config) into rule
          sets that fit Safari&rsquo;s limits.
        </li>
        <li>
          Rebuild user-visible feedback, counters and badges, from
          signals you still have. On Safari that means the DOM.
        </li>
        <li>
          Test per Safari version, on real sites. Every divergence in
          this article was found by running the real rule set, and none
          of them announced themselves.
        </li>
      </ol>
      <p>
        <strong>
          DNR gives you less power and more predictability.
        </strong>{' '}
        For most extensions the user-facing feature set survives the
        move. The engineering underneath changes enough that the
        blocking layer is the part of a Safari port that most deserves
        a specialist.
      </p>
    </ArticleLayout>
  );
}
