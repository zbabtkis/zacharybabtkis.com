import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { WorldBoundaryDiagram } from '@/components/diagrams/world-boundary';
import { Code } from '@/components/code';

export const metadata: Metadata = {
  title:
    'MAIN World Content Scripts: Running Extension Code in the Page’s Context',
  description:
    'When a browser extension needs to run code in the page’s own JavaScript world (wrapping fetch, reading in-page state) and how to coordinate across the isolated-world boundary. Registration order, sessionStorage handshakes, and surviving a hostile page.',
};

export default function MainWorldScriptsPage() {
  return (
    <ArticleLayout
      title="When your content script can't see the page's JavaScript"
      description="When an extension needs MAIN-world content scripts, and the patterns that make the two worlds cooperate."
      datePublished="2026-07-25"
      dateModified="2026-07-28"
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
            'Yes. Modern Safari supports the world: "MAIN" option for content scripts and for scripting.executeScript, and I shipped a production feature that relied on it. The surrounding behavior still differs. Safari rejected executeScript arguments Chrome accepted until we round-tripped them through JSON, and storage-quota-sensitive caching we used elsewhere was disabled on Safari. Verify each supporting piece per platform.',
        },
      ]}
      ctaTitle="Porting an extension that lives in both worlds?"
      ctaBody="MAIN-world scripts, registration ordering, and cross-world handshakes are where Safari ports break silently. The Safari port assessment is $2,500, maps every script and channel in your extension to its Safari answer, and is credited toward follow-on work."
      ctaEmailSubject="Safari Port Assessment: MAIN-world scripts"
      ctaSource="main-world-article"
    >
      <p>
        At ZeroClick I owned the iOS and Safari extension domain for Pie
        Adblock, the company&rsquo;s Safari and Chrome ad blocker with over
        two million users. Blocking ads on YouTube meant editing JSON
        responses the video player itself requested: stripping the ad fields
        before the player consumed them, and reading ad metadata from the
        same responses to count what we blocked.
      </p>
      <p>
        A content script can&rsquo;t reach any of that from where it
        normally runs. Content scripts, the code an extension injects into
        web pages, live in an isolated world: a separate JavaScript
        environment attached to the same page, with its own{' '}
        <code>window</code> bindings and its own <code>fetch</code>. The
        player&rsquo;s calls never pass through it, so our code had to run
        in the page&rsquo;s own context, which the extension APIs call the
        MAIN world.
      </p>
      <p>
        That placement worked, and it also produced our quietest failures.
        Blocked-ad stats read zero with no error anywhere. A feature that
        paid users for viewed ads counted the same ad twice. Every one of
        those bugs came from coordinating code across two JavaScript worlds.
      </p>
      <p>
        You may be facing the same shape of problem. If your extension needs
        to see a response the app requested rather than one you made, read
        state the app keeps only in JavaScript objects, or change data
        before the app consumes it, part of your code has to live in the
        page&rsquo;s world. MAIN-world code has no extension APIs, and your
        background worker, the extension&rsquo;s long-lived process outside
        any page, can&rsquo;t reach page variables.
      </p>
      <p>
        Extension work runs into this boundary more often than it used to,
        because modern apps keep less of their state in the DOM.
        Framework-rendered pages hold data in JavaScript objects and load it
        as network responses. The part of the app a content script can see
        keeps shrinking, and more of the jobs extensions are asked to do sit
        on the far side of the boundary.
      </p>
      <p>
        Here&rsquo;s the road map. For the channel between the two worlds,
        Pie used DOM events relayed by an isolated-world script, DOM
        attributes, and page storage in different places. The hardest case
        in this article came down to a sessionStorage handshake, and
        I&rsquo;ll show why that shape needs no cleanup code. The rest walks
        the pitfalls we hit along the way: wrappers installed too late to
        catch anything, registration order zeroing our stats, double
        installs counting responses twice, pages patching functions we
        depended on, and Safari differing where Chrome gave no warning.
      </p>

      <h2>Your script reads a page global and gets undefined</h2>
      <p>
        You open the app, type its global into the DevTools console, and see
        it plainly. Your content script reads the same property off{' '}
        <code>window</code> and gets <code>undefined</code>. Nothing is
        misconfigured. The console and your script are reading from two
        different JavaScript worlds attached to the same document.
      </p>
      <p>
        <strong>
          Each world sees the same DOM but keeps its own JavaScript objects
          and its own capabilities.
        </strong>{' '}
        The split works like this:
      </p>
      <ul>
        <li>
          The isolated world, where content scripts run by default, gets the
          DOM plus the extension APIs: runtime messaging, storage, everything
          under the extension namespace. It never sees the page&rsquo;s
          globals, its patched functions, or its framework state.
        </li>
        <li>
          The MAIN world is the page&rsquo;s own context. A script there sees
          everything the page defines and can wrap anything the page calls.
          In exchange it loses the extension APIs entirely, so there is no
          messaging to the background and no extension storage.
        </li>
      </ul>

      <h2>When you need the MAIN world</h2>
      <p>Most extension work never needs the page&rsquo;s world. Three jobs
        do:</p>
      <WorldBoundaryDiagram />
      <ul>
        <li>
          Observing or wrapping page-level APIs. Say you need to inspect a
          response the app requested rather than one you made. You wrap the
          page&rsquo;s <code>fetch</code>, because the isolated world&rsquo;s{' '}
          <code>fetch</code> is a different binding and the app&rsquo;s calls
          never pass through it.
        </li>
        <li>
          Reading in-page state, meaning data the app exposes only as
          JavaScript objects and never serializes into the DOM.
        </li>
        <li>
          Altering data before the app consumes it, such as removing fields
          from a JSON response so the app behaves as if they were never
          there.
        </li>
      </ul>
      <p>
        <strong>
          If the job is reading or editing the DOM, stay in the isolated
          world and keep your extension APIs.
        </strong>{' '}
        When you do cross over, timing is part of the requirement. These
        scripts register with <code>world: &ldquo;MAIN&rdquo;</code> at{' '}
        <code>document_start</code>, because a wrapper that installs after
        the app&rsquo;s first request never fires. You can&rsquo;t intercept
        a response that already came back.
      </p>

      <h2>The toggle does nothing until the page reloads</h2>
      <p>
        Here&rsquo;s a failure users report before you see it. They flip a
        setting, the extension confirms it, and the open tab doesn&rsquo;t
        change. On Pie Adblock the setting was &ldquo;allow ads on this
        creator&rsquo;s channel,&rdquo; and ads stayed blocked in the open
        tab until the user refreshed by hand.
      </p>
      <p>
        The cause is the registration model.{' '}
        <strong>
          Registering or unregistering a content script changes only future
          document loads; a page that&rsquo;s already open keeps the code it
          started with.
        </strong>{' '}
        And even if you could pull the script out, a <code>fetch</code>{' '}
        wrapper that already rewrote responses can&rsquo;t un-modify what the
        app consumed.
      </p>
      <p>
        The shipped fix accepted the cost. When the user exempted a page, the
        background unregistered the blocking script, wrote the exemption
        flag into the tab with <code>scripting.executeScript</code>, and
        reloaded the tab. On YouTube it re-registered the script five
        seconds later without another reload, because those scriptlets
        re-apply on their own. The price is fixed: every toggle on a loaded
        page costs one full reload.
      </p>

      <h2>Your observer reports zero and throws no errors</h2>
      <p>
        This one hides well. Ad blocking keeps working, the console shows no
        errors, and your detection stats quietly read zero. On Pie Adblock
        the numbers dropped to nothing after an unblock-and-reblock cycle,
        and no log said why.
      </p>
      <p>
        Registered content scripts execute in registration order within a
        world. We had two MAIN-world scripts wrapping the same network
        responses: a measurement script that read ad metadata out of
        YouTube&rsquo;s player payload, and a blocking script that stripped
        the ad fields from that same payload.{' '}
        <strong>
          Registered second, the measurement script only ever sees payloads
          the blocker already stripped, and it reports zero with no error
          anywhere.
        </strong>
      </p>
      <p>
        The stats bug was exactly this. Re-registering the blocking script
        after an unblock landed it ahead of the observer. The fix rebuilds
        the order on every change: before registering the blocker, check
        whether the observer is registered, and if it isn&rsquo;t, tear the
        blocker down, register the observer first, then re-register the
        blocker.
      </p>
      <Code lang="js">{`// Registration order within a world is execution order. The observer
// wraps fetch to read ad metadata; the blocker strips those same
// fields. If the blocker's wrapper installs first, the observer only
// ever sees stripped payloads and reports zero, with no error.
async function registerBlocker() {
  const registered = await chrome.scripting.getRegisteredContentScripts({
    ids: [OBSERVER_ID],
  });

  if (registered.length === 0) {
    // Rebuild the order from scratch: blocker out, observer in first.
    await chrome.scripting
      .unregisterContentScripts({ ids: [BLOCKER_ID] })
      .catch(() => {}); // fine if it wasn't registered yet
    await chrome.scripting.registerContentScripts([observerScript()]);
  }

  await chrome.scripting.registerContentScripts([blockerScript()]);
}`}</Code>
      <p>
        It feels heavy, and it is. The API guarantees nothing about order
        beyond the sequence of your own calls, so the ordering is a
        convention you enforce by hand every time the set changes.
      </p>

      <h2>Telling a MAIN-world script to stand down</h2>
      <p>
        Now the coordination problem in its sharpest form. A user clicks to
        watch an ad in support of a creator, and seconds later the
        extension&rsquo;s own auto-skip fast-forwards the ad they opted
        into. The background knew this page view was exempt. The auto-skip
        script, running in the MAIN world, had no way to ask.
      </p>
      <p>
        So how does the background reach it? Through something both sides
        can touch. MAIN-world code shares the document&rsquo;s DOM and its
        page-scoped storage, so the channels are DOM events relayed by an
        isolated-world script, DOM attributes, or a storage entry. Pie used
        all of these in different places; this feature used the storage
        entry.
      </p>
      <p>
        <strong>
          The background wrote the page&rsquo;s URL into sessionStorage
          under a fixed key, and the MAIN-world script skipped its auto-skip
          only while that stored URL exactly equaled
          window.location.href.
        </strong>{' '}
        A tiny function run in the tab with{' '}
        <code>scripting.executeScript</code> did the write. One write and
        one comparison, with no messaging involved.
      </p>
      <p>
        The comparison is what scopes it. sessionStorage survives soft
        navigations in a single-page app, so a bare boolean flag would
        follow the user to the next video. Storing the URL as the value
        means the next navigation changes <code>window.location.href</code>,
        the equality check fails, and the exemption expires with no cleanup
        code at all.
      </p>
      <Code lang="js">{`// Background side. executeScript runs this in the tab, and
// sessionStorage is shared across worlds, so the MAIN-world
// script can read what we write here.
await chrome.scripting.executeScript({
  target: { tabId },
  func: () => {
    sessionStorage.setItem('exempt-page-url', window.location.href);
  },
});

// MAIN-world side. The stored value is the URL, under a fixed key.
// sessionStorage survives SPA navigation, but the next page has a
// different href, so the exemption expires on its own. No cleanup.
function pageIsExempt() {
  return (
    sessionStorage.getItem('exempt-page-url') === window.location.href
  );
}`}</Code>

      <h2>The page can patch what you depend on</h2>
      <p>
        MAIN-world code shares a runtime the page owns. The page&rsquo;s
        scripts got there first or will patch things after you, and other
        extensions are in the same room. Two failures come from this, and
        both look like flaky behavior on specific sites.
      </p>
      <p>
        The first: response reads that work on most pages break on pages
        where the app, or another extension, patches{' '}
        <code>Response</code> methods after load. Bodies come back mangled
        or reads throw, and nothing in your own code changed.{' '}
        <strong>
          Capture references to the native methods at document_start, before
          page code runs, and call those references directly.
        </strong>{' '}
        Later patches to the prototype can&rsquo;t touch what you already
        hold. The protection only covers what you captured; the rest of the
        prototype chain stays patchable.
      </p>
      <p>
        The second: blocked-ad counts that double or triple after in-app
        navigations. The same script arrived twice, once from its persistent
        registration and once from an <code>executeScript</code> call on a
        soft navigation, and the second arrival wrapped the already-wrapped{' '}
        <code>fetch</code>. Every response then gets processed twice. The
        guard is a sentinel: set a marker when the patch installs, and bail
        if it&rsquo;s already there.
      </p>
      <Code lang="js">{`// Capture natives at document_start, before any page code runs.
// A later patch to Response.prototype can't reach these references.
const nativeClone = window.Response.prototype.clone;
const nativeText = window.Response.prototype.text;

async function readBody(response) {
  return nativeText.call(nativeClone.call(response));
}

// One sentinel, one install. The script can arrive twice: from its
// persistent registration and from an executeScript on soft
// navigation. A second wrap would count every response twice.
if (!window.__observerInstalled) {
  window.__observerInstalled = true;
  window.fetch = new Proxy(window.fetch, {
    async apply(target, thisArg, args) {
      const response = await Reflect.apply(target, thisArg, args);
      inspect(response); // reads through the captured natives
      return response;
    },
  });
}`}</Code>
      <p>
        Notice the sentinel lives on <code>window</code>, in the
        page&rsquo;s world, where page code can see it or clear it.
        That&rsquo;s the accepted trade-off, and it&rsquo;s the general rule
        for everything a MAIN-world script leaves behind: storage keys,
        globals, markers. Assume the page can enumerate all of it, and
        don&rsquo;t put anything there you wouldn&rsquo;t show the page.
      </p>

      <h2>Counts inflate every time the framework re-renders</h2>
      <p>
        When your script marks up elements in a framework-rendered page, the
        failure mode is repetition. On a Pie feature that paid users for
        viewed ads, the same on-screen ad got badged more than once, and
        each re-render fired another paid ad-view claim. Inflated counts had
        a direct cost.
      </p>
      <p>
        The root problem is that React-style frameworks replace DOM nodes at
        will. Any side table mapping elements to processed state goes stale
        the moment a node is rebuilt, and your script meets the same ad
        again as a brand-new element.
      </p>
      <p>
        The fix I shipped keeps the state in the DOM itself.{' '}
        <strong>
          The injected badge is the processed-state record, and the
          element&rsquo;s identity is a hash of its serialized HTML.
        </strong>{' '}
        Before injecting, the script checked for the badge across the
        container, its shadow root, and its parent, and skipped when it
        found one. There is no side table to drift out of sync.
      </p>
      <p>
        For counting, the ad-view ID was a 32-bit hash of the
        container&rsquo;s <code>outerHTML</code>, so identical re-rendered
        markup hashed to the same ID and repeat sightings collapsed
        server-side. The limit is the flip side of the mechanism: any markup
        change in the re-render mints a new ID.
      </p>

      <h2>The same code behaves differently on Safari</h2>
      <p>
        The mechanism ports. Modern Safari supports{' '}
        <code>world: &ldquo;MAIN&rdquo;</code> for registered content
        scripts and for <code>scripting.executeScript</code>, and the
        features above shipped on Safari in production. What breaks is the
        material around it, and it breaks in ways Chrome never shows you.
      </p>
      <ul>
        <li>
          Safari threw a serialization error on{' '}
          <code>executeScript</code> arguments Chrome accepted. Our script
          source wasn&rsquo;t JSON-serializable as passed, and the fix was
          to round-trip the arguments through JSON before the call.
        </li>
        <li>
          A localStorage caching layer we ran on Chrome was disabled on
          Safari in the codebase I maintained, because Safari&rsquo;s
          extension storage quota is far smaller and the cached rule text
          risked exhausting it. Safari rebuilt the data from source files
          instead, and kept the gap the cache existed to close.
        </li>
      </ul>
      <p>
        <strong>
          The MAIN-world mechanism itself ports; every storage, caching, and
          lifecycle assumption around it needs verifying per platform.
        </strong>{' '}
        Test on the Safari versions you support rather than assuming parity
        from a compatibility table.
      </p>
      <p>
        The summary I&rsquo;d give another engineer: keep as much as you can
        in the isolated world, put only the code that needs page objects in
        MAIN, make registration order explicit, and pick one boring channel
        for the two halves to meet. Then run the whole arrangement on real
        Safari, because the parts that differ don&rsquo;t announce
        themselves.
      </p>
    </ArticleLayout>
  );
}
