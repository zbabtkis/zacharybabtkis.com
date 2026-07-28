import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { IdentitySourcesDiagram } from '@/components/diagrams/identity-sources';

export const metadata: Metadata = {
  title: 'Knowing Which Page You’re On Inside a Single-Page App',
  description:
    'Content scripts go stale the moment a single-page app navigates. How to extract a page identity, keep it current across client-side navigation, and survive the host site changing its DOM, from extension work against YouTube and Twitch at a 2M-user ad blocker.',
};

export default function SpaPageIdentityPage() {
  return (
    <ArticleLayout
      title="The site never reloads, and your extension can't tell where it is"
      description="How a content script extracts a page identity and keeps it current across client-side navigation."
      datePublished="2026-07-25"
      dateModified="2026-07-28"
      slug="/safari-extensions/spa-page-identity/"
      byline="I shipped Safari and iOS extensions at Honey and Pie"
      faq={[
        {
          question:
            'How do I reliably detect SPA navigation from a content script?',
          answer:
            'Prefer the app’s own navigation events when it emits them. YouTube fires yt-page-data-updated after each in-app navigation. When the app emits nothing usable, run a throttled MutationObserver on the document body, re-extract your identity key, the stable string that says which page this is, on each batch of mutations, and act only when the key changes. Watching the URL alone tells you a navigation started. It says nothing about whether the new page’s DOM is ready to read.',
        },
        {
          question: 'Why not poll every second?',
          answer:
            'Polling forces a trade between latency and waste, and it still needs the same extraction and diffing logic an observer needs. You save nothing by polling. The real trap is what you compare rather than how often. Diff a stable identity key, such as the unique name in the page’s URL, never visible display text, which changes for reasons that have nothing to do with navigation.',
        },
        {
          question:
            'What do I do when the host site changes its DOM and my selectors break?',
          answer:
            'Ship selectors as remote configuration with a per-platform kill switch instead of hardcoding them. On Pie Adblock the DOM selectors lived in a remotely deployed config file, because host sites change their markup on their own schedule and an extension store review cycle to push a fix is a multi-day outage. Our Twitch selectors broke more than once, and each fix shipped as a config change rather than a release. Also monitor extraction: when a selector starts returning nothing, you want to know before your users tell you.',
        },
        {
          question: 'How do I test SPA navigation flows?',
          answer:
            'Test each entry path as its own case: direct load of the target page, in-app navigation to it, and in-app navigation away and back. The paths hand you identity from different sources, server-rendered metadata on direct load and scraped DOM after navigation, and those sources can return different string forms of the same identity. Ours did. Our lookup was keyed by the handle, the @name in the channel’s URL, which only the DOM path produced, so in-app navigation matched and direct loads missed. Normalize every path to one form, then test the transitions, because that is where the bugs concentrate.',
        },
      ]}
      ctaTitle="Porting an extension that has to track SPA state?"
      ctaBody="Page-identity code is the kind of logic that breaks silently in a Safari port. My port assessment maps how your extension detects and tracks page state, which parts carry over to Safari, and which need redesign. The price is a fixed $2,500, credited toward the follow-on work."
      ctaEmailSubject="Safari Port Assessment: SPA page identity"
      ctaSource="spa-identity-article"
    >
      <p>
        At ZeroClick I led a feature on Pie Adblock, our 2M+ user ad
        blocker, that let users allow ads on specific creators&rsquo;
        channels on YouTube and Twitch. Someone who wanted to support
        a creator could opt in for that channel while ads stayed
        blocked everywhere else. Every decision the extension made
        depended on knowing whose channel was on screen at that
        moment.
      </p>
      <p>
        Extracting the channel identity was the easy part. Keeping it
        correct was most of the work, because a content script, the
        code an extension injects into the page, runs once. Both sites
        are single-page apps. The user clicks a link and the view
        swaps without a full page load. The URL changes, and the
        script that worked out the current channel never runs again.
      </p>
      <p>
        You may be facing the same shape of problem if your extension
        reads anything from a page the site can replace without
        reloading: which product is on screen, which video, which
        profile. Whatever your script learned at load time describes a
        page the user may have already left.
      </p>
      <p>
        Teams keep hitting this because the platform moved underneath
        them. Extensions were designed for pages that reload on every
        navigation, and most large sites now render once and route on
        the client. Any code that reads a page and acts on what it
        finds inherits the gap, whether it is a content script or an
        AI agent driving a browser.
      </p>
      <p>
        We tried more than one answer, and every failure mode below
        shipped to production before we understood it. Trusting the
        server-rendered metadata broke after the first in-app
        navigation. Diffing visible text fired on re-renders and was
        replaced two days after it shipped. What held up was treating
        page identity as a computed value with an explicit source
        order, an explicit staleness rule, and one canonical form.
        Each section below starts from how a failure looked in
        production and ends with the fix that shipped.
      </p>

      <h2>Detection works on the first page, then never updates</h2>
      <p>
        Here&rsquo;s how the failure presents: identity detection works
        on the first video, then the user clicks to another one and
        your extension keeps reporting the previous channel. No error
        anywhere. The cause on YouTube is server-rendered metadata. The
        page-author meta tag describes the URL the user landed on, and
        the SPA router swaps content without ever touching it.
      </p>
      <p>
        Server-rendered metadata, whether meta tags, embedded JSON, or
        structured data, is clean and authoritative for exactly one
        URL.{' '}
        <strong>
          Our rule on Pie Adblock was explicit: trust the meta tag only
          while the current URL still equals the URL the page
          originally loaded with.
        </strong>{' '}
        The moment those diverge, the tag is a fossil, and the identity
        has to come from the live DOM. For us that meant the channel
        link in the video&rsquo;s owner row, the strip under the
        player that names the channel.
      </p>
      <Code lang="js">{`// These belong in remote config, not code. More on that below.
const AUTHOR_META_SELECTOR = '[itemprop=author] [itemprop=name]';
const OWNER_LINK_SELECTOR = '#owner a';

// The meta tag is rendered on the server for the URL the user landed
// on, and the SPA never rewrites it. So it is only trustworthy while
// the URL still matches the original load.
const initialUrl = window.location.href;

function getChannelIdentity() {
  if (window.location.href === initialUrl) {
    const meta = document.querySelector(AUTHOR_META_SELECTOR);
    if (meta) return meta.getAttribute('content');
  }

  // After any in-app navigation, read the live owner row instead.
  // Note this branch returns a URL handle while the meta branch
  // returns a display name. That mismatch is the next section.
  const ownerLink = document.querySelector(OWNER_LINK_SELECTOR);
  if (ownerLink) return new URL(ownerLink.href).pathname.replace('/@', '');

  // The owner row may not have rendered yet. Null means "not knowable
  // yet", and callers have to treat it that way.
  return null;
}`}</Code>
      <p>
        Two sources, ordered by a staleness condition you can check.
        That structure held up. The comment in the middle marks the
        part that didn&rsquo;t, and we found out about it in
        production.
      </p>

      <h2>The same page matches on one entry path and misses on the other</h2>
      <p>
        This bug presents as per-user flakiness: the feature works for
        people who navigate to a page inside the app and fails for
        people who land on it directly, or the reverse. Nothing throws.
        The lookup returns false and the feature quietly declines to
        run.
      </p>
      <IdentitySourcesDiagram />
      <p>
        The cause is that the two sources emit different string forms
        of the same identity. On YouTube the meta tag carries the
        channel&rsquo;s display name while the owner-row link carries
        the URL handle, the unique @name in the channel&rsquo;s
        address, and neither is derivable from the other. Our
        lookup table was keyed by handle, the form the post-navigation
        DOM path produced. So matching succeeded after in-app
        navigation and failed on direct load, where the meta path
        handed us a display name.
      </p>
      <p>
        <strong>
          The fix that shipped normalized both extraction paths to one
          canonical form before any lookup ran.
        </strong>{' '}
        We added the display name to the data our backend returned,
        re-keyed the lookup by it, and re-pointed the DOM fallback at
        an attribute that carries the display name too. After that,
        every path produced the same key.
      </p>
      <Code lang="js">{`// Every extraction path must produce the SAME string form before
// any lookup runs. We converged on the display name, because both
// of our sources could be made to produce it.
const supportedChannels = new Set(channels.map((c) => c.channelName));

function isSupportedChannel() {
  const name = getChannelName(); // every path returns a display name
  return name !== null && supportedChannels.has(name);
}`}</Code>
      <p>
        Pick the canonical form deliberately. A stable machine
        identifier beats display text when every path can produce one.
        When it can&rsquo;t, converge on whatever form all paths can
        produce, and do the conversion at extraction time so the rest
        of the pipeline only ever sees one shape.
      </p>

      <h2>Navigation happens and your script never hears about it</h2>
      <p>
        On Twitch this failure is stark. The script&rsquo;s initial run
        at page load is the only run it ever gets, so the user browses
        from one channel to another, the check never re-fires, and your
        state stays frozen on whichever channel loaded first. There is
        nothing in the console to point at.
      </p>
      <p>
        So how do you find out the user went somewhere? Some apps tell
        you. YouTube dispatches its own{' '}
        <code>yt-page-data-updated</code> event after each in-app
        navigation, and listening for it is the cheapest correct
        answer. Twitch emits nothing usable, so there we fell back to a
        throttled <code>MutationObserver</code>, the browser API that
        calls you back when the DOM changes, watching the document
        body.
      </p>
      <p>
        <strong>
          Only a change in the extracted identity counts as a
          navigation.
        </strong>{' '}
        An earlier version of that observer diffed the visible
        channel-name text, and it had to be replaced two days after it
        shipped. Display text mutates on re-renders, reads back empty
        while an element is briefly absent, and changes for cosmetic
        reasons. None of that means the user went anywhere.
      </p>
      <Code lang="js">{`// YouTube announces its own navigations. Listen and re-check.
window.addEventListener('yt-page-data-updated', maybeChannelChanged);

// Twitch announces nothing, so watch the body and treat a change in
// the extracted identity, and only that, as a navigation.
let lastHandle = null;

const observer = new MutationObserver(
  // throttle() caps the callback at one run per 500ms, because a
  // busy page produces mutation batches constantly.
  throttle(() => {
    const handle = getChannelIdentity();
    if (handle && handle !== lastHandle) {
      lastHandle = handle;
      maybeChannelChanged();
    }
  }, 500),
);

observer.observe(document.body, { childList: true, subtree: true });`}</Code>
      <p>
        The throttle costs you up to half a second of latency, and
        extraction returns null until the app renders the container it
        reads from. Both prices were acceptable. Spurious triggers were
        the expensive failure, and diffing the identity instead of the
        text eliminated them.
      </p>

      <h2>The decision is due before the identity is knowable</h2>
      <p>
        The user opts in to seeing ads on a creator&rsquo;s channel,
        loads a video, and no ad plays. Nothing looks broken in the
        settings. The ad that runs before the video was stripped at{' '}
        <code>document_start</code>, the earliest moment an extension
        can inject code, before your script could possibly know whose
        channel this was. Toggling the blocker mid-page does nothing.
      </p>
      <p>
        Two clocks run against you. Blocking is enforced by rules and
        injected scripts that must be in place before the page&rsquo;s
        own scripts execute, and the identity that decides the behavior
        is only extractable from the rendered DOM. The input arrives
        after the enforcement deadline. There are two ways out.
      </p>
      <ul>
        <li>
          Act coarsely early, then refine: apply a safe default at
          load and correct course once the identity resolves.
        </li>
        <li>
          Force a reload once you know: accept one wasted page load,
          record the decision somewhere durable, and make it correctly
          from the top of the second load.
        </li>
      </ul>
      <p>
        <strong>
          We shipped the reload path, and it works because the decision
          outlives the page: the reload destroys the content script, so
          the decision has to survive in the background script, the
          extension&rsquo;s long-lived process that persists across
          page loads, or in extension storage.
        </strong>{' '}
        Our background script recorded which tab was in which mode,
        tore down the blocking for that site, and reloaded the tab. On
        the second load the content script asked the background what
        had been decided instead of deciding again.
      </p>

      <h2>A selector breaks overnight and the fix waits in store review</h2>
      <p>
        The host site ships a markup change, your{' '}
        <code>querySelector</code> starts returning null, and identity
        detection dies silently for the entire user base. The corrected
        build then waits days in extension-store review. Every selector
        you write against someone else&rsquo;s app is a liability on
        someone else&rsquo;s release schedule.
      </p>
      <p>
        <strong>
          Ship your DOM selectors as remote configuration with a
          per-platform kill switch.
        </strong>{' '}
        On Pie Adblock the selectors lived in a remotely deployed
        config file, so a broken selector was a config push rather than
        a release. Our Twitch selectors broke more than once, and each
        fix shipped as a config change the same day it was written.
      </p>
      <p>
        The kill switch earns its place the day extraction goes bad in
        a way config can&rsquo;t repair. Every decision to allow ads
        on a channel checked a per-platform disabled flag first, so we could turn
        one platform off remotely rather than let the feature misbehave
        while we worked on a real fix.
      </p>

      <h2>Your observer goes quiet after the first navigation</h2>
      <p>
        A scoped <code>MutationObserver</code> that works at page load
        and never fires again after an in-app navigation has usually
        been orphaned. The SPA replaced the subtree it was watching, so
        the observer is attached to a detached node, watching a tree
        nobody renders. The UI keeps showing the previous page&rsquo;s
        state until a full reload, and the console shows nothing.
      </p>
      <p>
        <strong>
          Attach navigation detection to <code>document.body</code>,
          because the body is the one node the SPA never replaces.
        </strong>{' '}
        That&rsquo;s the observer from the Twitch section. It ran one
        identity diff, and it survived every navigation with no
        reconnection ceremony, because its target was never swapped out
        from under it.
      </p>
      <p>
        Scoped observers are workable only when something owns their
        lifecycle. We ran both patterns in the same codebase: the
        navigation detector was the single body-level observer, and the
        on-page UI for the channel feature observed a smaller container safely because a React
        hook created that observer on mount and disconnected it on
        unmount. A scoped observer with no lifecycle owner is the
        version that goes quiet.
      </p>

      <h2>The shape of the solution</h2>
      <p>
        <strong>
          Treat page identity as a computed value with an explicit
          source order, an explicit invalidation rule, and one
          canonical form.
        </strong>{' '}
        Everything above reduces to a short list of commitments.
      </p>
      <ul>
        <li>
          Server metadata is valid while the URL still matches the
          original load; after that, the live DOM is the source.
        </li>
        <li>
          Normalize every extraction path to one canonical key before
          anything does a lookup.
        </li>
        <li>
          Detect navigation from the app&rsquo;s own events where they
          exist, and from an identity-diffing observer on the body
          where they don&rsquo;t.
        </li>
        <li>
          Decide up front whether early decisions get refined or the
          page gets reloaded, and keep the decision where it survives
          the reload.
        </li>
        <li>
          Ship the selectors as remote data with a kill switch, because
          the host app will keep changing.
        </li>
      </ul>
      <p>
        Extracting the identity is one selector call. The rest of this
        article is what it takes for that call to keep telling the
        truth.
      </p>
    </ArticleLayout>
  );
}
