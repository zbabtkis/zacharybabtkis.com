import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title:
    'MAIN World Content Scripts: Running Extension Code in the Page’s Context',
  description:
    'When a browser extension needs to run code in the page’s own JavaScript world (wrapping fetch, reading in-page state) and how to coordinate across the isolated-world boundary. Registration order, sessionStorage handshakes, and surviving a hostile page.',
};

export default function MainWorldScriptsPage() {
  return (
    <ArticleLayout
      title="Running extension code in the page's world, and coordinating across the boundary"
      description="When an extension needs MAIN-world content scripts, and the patterns that make the two worlds cooperate."
      datePublished="2026-07-25"
      slug="/safari-extensions/main-world-scripts/"
      byline="I shipped Safari and iOS extensions at Honey and Pie"
      faq={[
        {
          question: 'When do I need a MAIN-world content script?',
          answer:
            'Only when you have to touch the page’s own JavaScript objects: wrapping fetch or XHR to see responses the app requested, reading state the app puts on window, or altering data before the app consumes it. If the job is reading or editing the DOM, stay in the isolated world, where you keep extension APIs and messaging.',
        },
        {
          question:
            'How do I send a message from a MAIN-world script to my background worker?',
          answer:
            'You can’t, directly. MAIN-world code has no extension APIs. Bridge through something both sides can reach: a custom DOM event relayed by an isolated-world script, a DOM attribute, or page-scoped storage. The background worker can write into the page with scripting.executeScript, and the MAIN-world script reads what it wrote.',
        },
        {
          question: 'Why did my MAIN-world script run too late to wrap fetch?',
          answer:
            'Wrapping only works if your wrapper is installed before the page makes the call, which means registering at document_start. If you register the script programmatically after a page has already loaded, the page needs a reload. You can’t intercept a response that already came back.',
        },
        {
          question: 'Does Safari support MAIN-world content scripts?',
          answer:
            'Yes. Modern Safari supports the world: "MAIN" option for content scripts and for scripting.executeScript, and I shipped a production feature that relied on it. Auxiliary behavior still differs; for example, storage-quota-sensitive caching we used elsewhere was disabled on Safari. Verify each supporting piece per platform.',
        },
      ]}
      ctaTitle="Porting an extension that lives in both worlds?"
      ctaBody="MAIN-world scripts, registration ordering, and cross-world handshakes are where Safari ports break silently. The Safari port assessment is $2,500, maps every script and channel in your extension to its Safari answer, and is credited toward follow-on work."
      ctaEmailSubject="Safari Port Assessment: MAIN-world scripts"
      ctaSource="main-world-article"
    >
      <p>
        Content scripts run in an isolated world. They share the page&rsquo;s
        DOM but have their own JavaScript environment: their own{' '}
        <code>window</code> bindings, their own <code>fetch</code>, and access
        to extension APIs like messaging and storage. The page&rsquo;s scripts
        can&rsquo;t see them, and they can&rsquo;t see the page&rsquo;s
        scripts. That separation is the point, and for most extensions
        it&rsquo;s all you need.
      </p>
      <p>
        Some jobs need the other side. If the work involves the page&rsquo;s
        own JavaScript objects, meaning the functions it calls and the state
        it keeps, your code has to run in the page&rsquo;s world, called the
        MAIN world.
        And the moment part of your extension lives there, you have a
        coordination problem: MAIN-world code has no extension APIs, and your
        background worker can&rsquo;t reach page variables. The two halves
        have to talk through a channel both can reach. I built and maintained
        this arrangement in Pie Adblock, ZeroClick&rsquo;s Safari and
        Chrome ad blocker with over two million users, where I owned the
        iOS and Safari extension domain. The patterns below are the ones that
        survived production.
      </p>

      <h2>What each world can see</h2>
      <p>
        The isolated world gets the DOM and the extension APIs: runtime
        messaging, storage, everything under the extension namespace. It does
        not get the page&rsquo;s JavaScript objects. A global the app sets, a
        function the app patched, a framework&rsquo;s in-memory state: all
        invisible.
      </p>
      <p>
        The MAIN world is the page&rsquo;s own context. Your script sees
        everything the page defines and can wrap anything the page calls. In
        exchange it loses the extension APIs entirely. No messaging to your
        background worker, no extension storage. It&rsquo;s a guest in someone
        else&rsquo;s runtime, with only the tools the page itself has.
      </p>

      <h2>When you need MAIN</h2>
      <p>Three jobs require it:</p>
      <ul>
        <li>
          <strong>Observing or wrapping page-level APIs.</strong> Say you
          need to inspect a response the app requested rather than one you
          made. You wrap the page&rsquo;s <code>fetch</code>, because the
          isolated world&rsquo;s <code>fetch</code> is a different binding
          and the app&rsquo;s calls never pass through it.
        </li>
        <li>
          <strong>Reading in-page state.</strong> Data the app exposes only as
          JavaScript objects, never serialized into the DOM.
        </li>
        <li>
          <strong>Altering data before the app consumes it.</strong> For
          example, removing fields from a JSON response so the app behaves as
          if they were never there.
        </li>
      </ul>
      <p>
        Registration matters as much as the code. These scripts run with{' '}
        <code>world: &ldquo;MAIN&rdquo;</code> at <code>document_start</code>,
        because a wrapper installed after the app&rsquo;s first call is
        useless. In the system I worked on, they were registered and
        unregistered programmatically as the feature toggled. When a
        script had to be disabled for a page that was already loaded, the tab
        was reloaded, because you can&rsquo;t undo surgery on a response that
        already came back.
      </p>

      <h2>Ordering is a hard constraint</h2>
      <p>
        When two MAIN-world scripts touch the same data, registration order
        decides who wins. The system I maintained had a measurement script
        that read metadata out of a response payload and a blocking script
        that deleted parts of that same payload. The measurement script had to
        be registered first. Register it second and it reports nothing. You
        can&rsquo;t observe a payload you already deleted.
      </p>
      <p>
        This gets awkward the moment scripts toggle independently. If the
        deleting script is unregistered and later re-registered, naive
        re-registration can land it ahead of the observer. The fix is an
        unregister-and-re-register dance: tear down the affected scripts and
        rebuild the registrations in the order you need, every time the set
        changes. It feels heavy. It&rsquo;s also the only way to make the
        ordering a guarantee instead of an accident of startup sequence.
      </p>

      <h2>Coordinating across the boundary</h2>
      <p>
        So how do the two halves talk? Through something both sides can
        reach: a page-scoped storage entry, a DOM attribute, or custom
        events relayed by an isolated-world script.
      </p>
      <p>
        Here&rsquo;s a shape that shipped. The background worker decided, from
        state only it had, that the MAIN-world script should skip its normal
        behavior on one specific page. It executed a tiny function in the tab
        that wrote a session-scoped flag: a page-scoped sessionStorage entry
        whose key included the exact page URL. The MAIN-world script checked
        for that flag before acting and stood down when it found it. One
        write, one read, no messaging required.
      </p>
      <p>
        Notice the URL in the key. It&rsquo;s load-bearing. sessionStorage
        survives soft navigations in a single-page app, so a bare flag set on
        one page would still be there on the next one, and the exemption
        would silently follow the user around. Keying the flag to the exact
        URL scopes it to one page view. When the app navigates internally,
        the new URL doesn&rsquo;t match, and the script resumes normal
        behavior without anyone cleaning up.
      </p>

      <h2>You are a guest in a hostile context</h2>
      <p>
        MAIN-world code shares the runtime with the page, and the page got
        there first or will patch things after you. Two consequences:
      </p>
      <ul>
        <li>
          <strong>Capture native references before you patch.</strong> If your{' '}
          <code>fetch</code> wrapper reads response bodies, save your own
          references to the native <code>Response</code> methods,{' '}
          <code>clone</code> and <code>text</code>, at install time and call
          those. The production wrapper I worked on did this, so later
          page-level patches of the same methods couldn&rsquo;t interfere with
          or observe its reads.
        </li>
        <li>
          <strong>Assume everything you leave behind is visible.</strong> Your
          storage keys and any globals you set live in the page&rsquo;s world.
          Page code can enumerate them. Don&rsquo;t put anything there you
          wouldn&rsquo;t show the page.
        </li>
      </ul>
      <p>
        Guard against double installation with a sentinel. Set a marker when
        your patch installs; bail if it&rsquo;s already there.
        Re-registration, soft navigation, and injection races can all run
        your script twice, and a double-wrapped <code>fetch</code> means
        double-counted events and doubled overhead.
      </p>

      <h2>The DOM as the dedupe store</h2>
      <p>
        When your script marks up or counts things in the page, the marker can
        be the record. On the feature I led, a small badge injected into a
        container doubled as the proof that the container had been handled:
        before processing an element, check for the marker; if present, skip.
        For counting, the element&rsquo;s identity came from a hash of its
        serialized HTML, so when the app re-rendered the same element,
        repeated sightings collapsed to one ID instead of inflating the
        count. There is no side table to keep in sync with a DOM that a
        framework rewrites at will. The DOM itself carries the state.
      </p>

      <h2>Platform caveats</h2>
      <p>
        The registration APIs are broadly shared across Chromium and Safari,
        but the supporting pieces are not. In the codebase I maintained, a
        localStorage caching layer used on Chrome was disabled on Safari
        because storage-quota behavior differs there. That&rsquo;s the general
        rule: the MAIN-world mechanism itself ports, but every storage,
        caching, and lifecycle assumption around it needs verification per
        platform. Test on the Safari versions you support rather
        than assuming parity from a compatibility table.
      </p>
      <p>
        The summary I&rsquo;d give another engineer: keep as much as you can
        in the isolated world, put only the code that needs page objects
        in MAIN, make registration order explicit, and pick one boring
        channel for the two halves to meet: a URL-keyed flag, an attribute,
        or an event.
      </p>
    </ArticleLayout>
  );
}
