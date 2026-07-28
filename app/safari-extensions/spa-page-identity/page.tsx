import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

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
      slug="/safari-extensions/spa-page-identity/"
      byline="I shipped Safari and iOS extensions at Honey and Pie"
      faq={[
        {
          question:
            'How do I reliably detect SPA navigation from a content script?',
          answer:
            'Prefer the app’s own navigation events when it emits them. YouTube fires yt-page-data-updated after each in-app navigation. When the app emits nothing usable, run a throttled MutationObserver on the document, re-extract your identity key on each batch of mutations, and act only when the key changes. Watching the URL alone tells you a navigation started, not that the new page’s DOM is ready to read.',
        },
        {
          question: 'Why not poll every second?',
          answer:
            'Polling forces a trade between latency and waste, and it still needs the same extraction and diffing logic an observer needs, so you save nothing by polling. The real trap is what you compare rather than how often. Diff a stable identity key such as a URL handle, never visible display text, which changes for reasons that have nothing to do with navigation.',
        },
        {
          question:
            'What do I do when the host site changes its DOM and my selectors break?',
          answer:
            'Ship selectors as remote configuration with a per-platform kill switch instead of hardcoding them. At Pie the DOM selectors lived in a remotely deployed config file because YouTube ships DOM changes weekly and an extension store review cycle to push a fix is a multi-day outage. Also monitor extraction: when your selector starts returning nothing, you want to know before your users tell you.',
        },
        {
          question: 'How do I test SPA navigation flows?',
          answer:
            'Test each entry path as its own case: direct load of the target page, in-app navigation to it, and in-app navigation away and back. The two paths hand you identity from different sources: server-rendered metadata on direct load, scraped DOM after navigation. A lookup keyed under only one form will pass the first case and fail the second. Bugs concentrate at the transitions, so test the transitions.',
        },
      ]}
      ctaTitle="Porting an extension that has to track SPA state?"
      ctaBody="Page-identity code is the kind of logic that breaks silently in a Safari port. My port assessment maps how your extension detects and tracks page state, which parts carry over to Safari, and which need redesign. The price is a fixed $2,500, credited toward the follow-on work."
      ctaEmailSubject="Safari Port Assessment: SPA page identity"
      ctaSource="spa-identity-article"
    >
      <p>
        A content script runs once. It reads the page, works out what
        it&rsquo;s looking at, and acts. Then the user clicks a link, the
        single-page app swaps the view without a full page load, and every
        fact your script gathered is stale. The URL changed. The content
        changed. Your code never ran again.
      </p>
      <p>
        I dealt with this on Pie Adblock, ZeroClick&rsquo;s ad blocker
        with over two million users, where I led a feature that had to behave differently
        depending on whose video was playing on YouTube or Twitch.
        Extracting the identity was the easy part. Keeping it correct
        across client-side navigation was most of the work, and the
        failure modes below all shipped to production at some point
        before we understood them.
      </p>

      <h2>Server-rendered metadata is only true once</h2>
      <p>
        The obvious place to read page identity is server-rendered
        metadata: meta tags, embedded JSON, structured data. It&rsquo;s
        clean, stable, and authoritative for exactly one URL: the one the
        user landed on. Single-page
        apps render that metadata on the server and then never touch it
        again. Navigate in-app and the tags keep describing the first
        page.
      </p>
      <p>
        On YouTube, the page-author meta tag never updates on in-app
        navigation. Our rule was explicit: trust the meta tag only while
        the current URL still equals the URL the page originally loaded
        with. The moment those diverge, the tag is a fossil, and the
        identity has to come from the live DOM. In our case that meant the
        channel link in the video&rsquo;s owner row. That gives two
        sources, ordered by a staleness condition you can check.
      </p>

      <h2>Two sources give you two different keys</h2>
      <p>
        Switching sources introduces a second problem. The meta tag gave
        us a human display name. The DOM anchor gave us the URL handle.
        Those are different strings for the same channel, and neither is
        derivable from the other. Any lookup table (an allowlist, a
        partner list, a settings map) has to be keyed under both forms.
        We learned this from a real bug: matching succeeded when the user
        landed directly on a page and failed after in-app navigation to
        the same page, because each path surfaced a different form of the
        same identity.
      </p>
      <p>
        The general rule: when identity can arrive from multiple
        surfaces, enumerate every form each surface produces and key your
        data under all of them. Deduplicate at write time, not at match
        time.
      </p>

      <h2>Detecting that navigation happened</h2>
      <p>
        So how do you find out the user went somewhere? Some apps tell
        you. YouTube dispatches its own{' '}
        <code>yt-page-data-updated</code> event after each in-app
        navigation, and listening for it is the cheapest correct answer.
        Twitch emits no equivalent, so there we fell back to a throttled{' '}
        <code>MutationObserver</code> on the document body: on each batch
        of mutations, re-extract the channel handle and compare it to the
        last known value. Only a change in the extracted identity counts
        as a navigation.
      </p>
      <p>
        The diff target matters. An earlier version of that observer
        watched visible text and had to be replaced. Display text mutates
        constantly: counters tick, labels localize, overlays come and go.
        None of it means the user went anywhere. Visible text is
        not an identity key. Extract the stable key, diff the key, ignore
        everything else.
      </p>

      <h2>The timing squeeze</h2>
      <p>
        Two clocks run against you. The element you need may not exist
        yet when your script runs at <code>document_start</code>. And the
        decision you need to make may be required before the page
        finishes loading. In our case, ad-handling behavior had to be
        set before any page script ran, but the identity that determined
        the behavior was only knowable after the page rendered. The
        information arrives after the deadline.
      </p>
      <p>
        There are two ways out. Act coarsely early and refine:
        apply a safe default at load, then correct course once the
        identity resolves. Or force a reload once you know: accept one
        wasted load, record the decision, and make it correctly from the
        top on the second load. We shipped the reload path, which adds
        its own constraint: the reload destroys your content script, so
        the decision has to survive in the background script or extension
        storage rather than in the page.
      </p>

      <h2>Selectors are configuration, not code</h2>
      <p>
        Every selector you write against someone else&rsquo;s app is a
        liability with someone else&rsquo;s release schedule. YouTube
        ships DOM changes weekly. An extension store review cycle to fix
        a broken selector is days long, and for those days your feature
        is down. We shipped our DOM selectors as remote configuration
        with a per-platform kill switch: when a selector broke, we pushed
        a config update in minutes, and when a platform&rsquo;s
        extraction went bad in a way config couldn&rsquo;t fix, we turned
        that platform off rather than let the feature misbehave.
      </p>

      <h2>Observer lifecycle</h2>
      <p>
        A tempting structure is one <code>MutationObserver</code> per
        selector you care about, each scoped to its own subtree. It reads
        well and fails in practice. Per-selector observers have to be
        torn down and reconnected on every navigation, because the
        subtrees they watched were replaced. Miss a disconnect and you
        leak observers that fire against detached nodes. Miss a reconnect
        and you silently drop events until the next full load. One shared
        observer on the document, multiplexing all the checks and
        throttled to a sane cadence, survives navigation without any
        per-navigation ceremony, because the document node is the one
        thing the SPA never replaces.
      </p>

      <h2>The shape of the solution</h2>
      <p>
        Treat page identity as a computed value with an explicit source
        order and an explicit invalidation rule. Server metadata is valid
        while the URL still matches the original load; after that, the
        DOM is the source. Key lookups under every form the identity can
        take. Detect navigation from the app&rsquo;s own events where
        they exist, from an identity-diffing observer where they
        don&rsquo;t. Decide up front whether early decisions get refined
        or the page gets reloaded, and keep the state somewhere that
        survives either answer. And ship the selectors as data you can
        update without a store release, because the host app will keep
        changing.
      </p>
    </ArticleLayout>
  );
}
