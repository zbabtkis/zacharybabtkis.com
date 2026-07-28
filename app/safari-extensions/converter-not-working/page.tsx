import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { ConverterTimelineDiagram } from '@/components/diagrams/converter-timeline';

export const metadata: Metadata = {
  title: 'safari-web-extension-converter Ran Fine. So Why Is the Extension Broken?',
  description:
    'safari-web-extension-converter ran but the converted extension is not working? The six most common causes: silently missing APIs, background lifecycle, manifest keys Safari ignores, storage differences, signing, and iOS quirks.',
};

export default function ConverterNotWorkingPage() {
  return (
    <ArticleLayout
      title="The converter ran fine. So why is your Safari extension broken?"
      description="Six reasons a converted Chrome extension compiles but doesn't work in Safari, and how to diagnose each."
      datePublished="2026-07-24"
      dateModified="2026-07-28"
      slug="/safari-extensions/converter-not-working/"
      faq={[
        {
          question:
            'Why does my converted Safari extension not work when the converter ran fine?',
          answer:
            'Because safari-web-extension-converter copies your files into an Xcode wrapper without checking whether the APIs you call work in Safari. Its warnings cover only the manifest keys and APIs on its known-unsupported list, so behavioral differences pass through silently and fail at runtime. The usual causes, in the order I find them: APIs that exist but never fire, background lifecycle differences, configuration Safari accepts and ignores, storage and messaging differences, and signing. The project compiling tells you nothing about whether the extension works.',
        },
        {
          question:
            'How do I debug a converted Safari extension that isn’t working?',
          answer:
            'Turn on Safari’s Develop menu in Settings under Advanced. For a local unsigned build, also enable Develop > Allow Unsigned Extensions, and expect to enable it again after every Safari relaunch, because it resets when Safari quits. Then use Web Inspector to open the background context and popup consoles directly. Those consoles are hidden until the Develop menu is on, which is why converted extensions feel undebuggable. One useful check: if behavior improves while the inspector is open, you’ve found a background-lifecycle bug, because the inspector keeps the background alive.',
        },
        {
          question:
            'Why does my extension work in Chrome but not in Safari?',
          answer:
            'Some Chrome APIs are missing from Safari outright, and some exist but never do anything. Blocking webRequest is the biggest gap: Safari only observes requests, so any code that blocks or modifies them is inert. Other APIs, like cookies.onChanged, let you register a listener cleanly and then never fire it. Check every chrome.* call your extension makes against Safari’s documented support, then test the handful your product depends on, because feature detection won’t catch the second kind. Building exactly that inventory is where my port assessment starts.',
        },
      ]}
      ctaTitle="Stuck on a converted extension that won't behave?"
      ctaBody="Send me your extension's store link or repo. The Safari port assessment is $2,500 at a fixed price, credited toward the port if you hire me for it. I catalog what's broken, what Safari will never support, and what it'll take to fix."
      ctaEmailSubject="Safari Port Assessment: converter issues"
      ctaSource="converter-article"
    >
      <p>
        When I ported Pie Adblock, our ad-blocking extension, from
        Chrome to Safari and iOS, the work started with Apple&rsquo;s
        converter. <code>xcrun safari-web-extension-converter</code>{' '}
        ran, printed a warning or two, and handed me an Xcode project
        that built. The extension installed. Then I opened Safari, and
        the features that mattered did nothing, with an empty console.
      </p>
      <p>
        For an ad blocker, those features were the product. Users
        logged in on our website and the extension kept showing them
        logged out. Blocking rules Safari had stored without complaint
        turned out to be silently broken, and in some cases they broke
        sites. None of it produced an error.
      </p>
      <p>
        You may be in the same spot. The converter succeeded, Xcode
        builds, the extension installs, and the features your users
        depend on do nothing. Nothing in that chain checked whether
        the APIs you call work in Safari, so the project compiling
        tells you nothing about whether the extension works.
      </p>
      <p>
        This stall is common in extension engineering right now.
        Safari supports the WebExtension API, so a working Chrome
        codebase looks portable, and Apple&rsquo;s converter makes the
        port feel mechanical. But the converter delivers one thing:
        packaging. It copies your files into an Xcode wrapper and
        flags only the manifest keys and APIs on its known-unsupported
        list. Everything off that list passes through silently and
        fails at runtime.
      </p>
      <p>
        On Pie&rsquo;s port, conversion was step zero. What failed was
        everything I trusted by default: typeof feature checks,{' '}
        <code>setInterval</code> timers, the rules Safari accepted
        without complaint, and signing from a local machine. What
        worked was a layer of Safari-specific runtime code and build
        setup the converter never hinted at. The six places converted
        extensions break are below, in the order I find them, with the
        fix we shipped for each.
      </p>

      <ConverterTimelineDiagram />
      <h2>1. Feature detection passes and nothing happens</h2>
      <p>
        Here&rsquo;s the version of this that bit me. A user logs in on
        the website, and the extension keeps showing them logged out.
        There is no error anywhere. The listener registered without
        complaint. It just never ran.
      </p>
      <p>
        Pie&rsquo;s login-state sync depended on{' '}
        <code>browser.cookies.onChanged</code>. Safari exposes it: the
        property exists and <code>addListener</code> succeeds. The event
        never fires, through at least Safari 18.{' '}
        <strong>
          Feature detection like{' '}
          <code>{"typeof browser.x !== 'undefined'"}</code> passes while
          the behavior is missing, so your code takes the happy path and
          fails silently.
        </strong>
      </p>
      <p>
        The fix we shipped was a Safari-only polyfill: a content script
        registered on our login pages that polls{' '}
        <code>document.cookie</code> every 500ms for the login cookie
        and messages the background when it changes. It watches one
        named cookie on specific pages, and it&rsquo;s polling rather
        than an event. Within those limits it holds up.
      </p>
      <Code lang="js">{`// Safari exposes browser.cookies.onChanged and addListener
// succeeds. The event just never fires (through Safari 18 at
// least). So the Safari build registers this content script on
// our login pages and polls instead.
let lastSeen = readSessionCookie();

setInterval(() => {
  const current = readSessionCookie();
  if (current === lastSeen) return;
  lastSeen = current;
  // Tell the background the login state changed. This message
  // is the event Safari never delivered.
  browser.runtime.sendMessage({ type: 'session-cookie-changed', value: current });
}, 500);

function readSessionCookie() {
  const match = document.cookie.match(/(?:^|;\\s*)session=([^;]*)/);
  return match ? match[1] : null;
}`}</Code>
      <p>
        Don&rsquo;t trust typeof checks. Test the real behavior of every
        API you depend on, in the oldest Safari you plan to support.
      </p>

      <h2>2. It works right after install, then stops minutes later</h2>
      <p>
        This one presents as flakiness. The extension behaves for a few
        minutes after install, then features driven by timers or cached
        state stop on their own. There is no crash and no console error.
        And when you attach the inspector to look, everything works
        again.
      </p>
      <p>
        Safari runs your background as a non-persistent page it tears
        down between events, most aggressively on iOS. Every{' '}
        <code>setInterval</code> loop and module-level variable is gone
        on the next wake. The inspector pins the background alive, which
        is why the bug hides while you&rsquo;re watching.{' '}
        <strong>
          If behavior improves with the inspector open, you&rsquo;ve
          found a background-lifecycle bug.
        </strong>
      </p>
      <p>
        The structure that survives teardown is event-driven.
        Pie&rsquo;s Safari build runs its periodic work off a{' '}
        <code>browser.alarms</code> listener, with the last-run time
        persisted to extension storage instead of held in a variable.
        Anything you need across wakes goes in storage.
      </p>
      <Code lang="js">{`// setInterval dies with the background page. Alarms don't:
// Safari wakes the background to deliver them.
browser.alarms.create('heartbeat', { periodInMinutes: 1 });

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'heartbeat') return;

  // The last-run time lives in storage. A module-level variable
  // here would read as undefined on the next wake.
  const { lastHeartbeat = 0 } = await browser.storage.local.get('lastHeartbeat');

  await runPeriodicWork(lastHeartbeat);
  await browser.storage.local.set({ lastHeartbeat: Date.now() });
});`}</Code>

      <h2>3. Requests you&rsquo;re supposed to block keep loading</h2>
      <p>
        If your extension blocks or modifies requests, watch for this
        symptom: everything it should block loads normally, your{' '}
        <code>onBeforeRequest</code> handlers never fire, and nothing
        throws.{' '}
        <strong>
          Safari never shipped blocking <code>webRequest</code>, so the
          entire interception layer of a Chrome extension has no
          equivalent code path.
        </strong>
      </p>
      <p>
        Safari&rsquo;s <code>webRequest</code> is observe-only. Blocking
        and modification go through <code>declarativeNetRequest</code>,
        rules you hand the browser ahead of time, or through Content
        Blockers. Pie&rsquo;s Safari adblock runs entirely on
        declarative rules, plus a conversion pass that rewrites them for
        Safari&rsquo;s dialect before install. This gap deserves its own
        migration plan;{' '}
        <a href="/safari-extensions/webrequest-alternative/">
          I wrote one here
        </a>
        .
      </p>

      <h2>4. Configuration Safari accepts but ignores</h2>
      <p>
        Safari ignores manifest keys it doesn&rsquo;t support without
        erroring. The converter warns about some of them; others, like{' '}
        <code>commands</code> on iOS, are documented as unsupported and
        draw no warning at all. Behavior tied to an ignored key simply
        never happens, and nothing tells you.
      </p>
      <p>
        The same silence extends to <code>declarativeNetRequest</code>{' '}
        rule fields, and that&rsquo;s where it cost us. Pie shipped
        dynamic rules using <code>initiatorDomains</code> and{' '}
        <code>allowAllRequests</code>. Safari stored them without
        complaint. Matching was silently broken, and in some cases sites
        broke, with nothing in the console.
      </p>
      <p>
        We had to ship a self-repair pass for clients already in the
        field: scan the installed rules, delete the{' '}
        <code>allowAllRequests</code> rules, rewrite{' '}
        <code>initiatorDomains</code> to <code>domains</code>, and
        record that the repair ran. That was remediation for versions
        we&rsquo;d already shipped; prevention lives in rewriting rules
        before they ever install.{' '}
        <strong>
          Audit your manifest and rules key by key against Safari&rsquo;s
          documentation, because what Safari accepts proves nothing.
        </strong>
      </p>

      <h2>5. Storage and messaging fail only in the field</h2>
      <p>
        Two symptoms belong here. The first popup-to-background or
        content-to-background message after Safari has been idle gets no
        response. Or writes quietly stop persisting once a quota is hit.
        Both work in your demo, because your demo never idles and never
        fills storage.
      </p>
      <p>
        Safari&rsquo;s storage quotas and write behavior differ from
        Chrome&rsquo;s, and a message sent while the background page is
        unloading or waking can be dropped or answered late. Code that
        implicitly assumed Chrome&rsquo;s always-on timing fails only
        for users.
      </p>
      <p>
        On Pie we instrumented instead of assuming.{' '}
        <strong>
          A storage health check ran with every heartbeat: a can-I-write
          probe plus quota reporting, shipped home as telemetry.
        </strong>{' '}
        A fallback layer dual-wrote to session storage when local
        storage was flaky, and every message send tolerated a receiver
        that couldn&rsquo;t answer. I&rsquo;d also put a retry around
        the first message after idle. We never needed a dedicated helper
        for it, but the failure mode is real.
      </p>
      <Code lang="js">{`// Don't assume writes persist. Probe on a schedule and report
// the result home with your telemetry.
async function checkStorageHealth() {
  const key = 'storage-health-probe';
  const value = String(Date.now());
  try {
    await browser.storage.local.set({ [key]: value });
    const readBack = await browser.storage.local.get(key);
    return { canWrite: readBack[key] === value };
  } catch (error) {
    // A quota or write failure lands here, not in feature code.
    return { canWrite: false };
  }
}`}</Code>

      <h2>6. It builds on your Mac and nowhere else</h2>
      <p>
        This one arrives on a schedule. You ship fine from your own
        machine for weeks. Then a teammate, a tester, or TestFlight
        needs a build, and you hit provisioning profiles, entitlements,
        and distribution signing all at once. On CI the box can&rsquo;t
        even run <code>npm</code>, because Node isn&rsquo;t installed on
        Xcode Cloud runners.
      </p>
      <p>
        Xcode&rsquo;s build-and-run flow auto-signs with your personal
        development identity, which hides everything distribution needs:
        app-group entitlements shared between the app and extension
        targets, per-target provisioning profiles, version syncing, and
        building your JavaScript bundle inside Apple&rsquo;s CI
        environment.
      </p>
      <p>
        I set up Xcode Cloud CI about two weeks into Pie&rsquo;s Apple
        effort: a post-clone script that installs Node, authenticates to
        our package registry, and builds the web bundle for each build
        action. My commit history shows a string of follow-up fixes
        before it stabilized.{' '}
        <strong>
          Set up CI with distribution signing in your first week or two,
          before the first outside build request lands, and this whole
          class of problem disappears.
        </strong>{' '}
        It&rsquo;s Apple platform work rather than extension code, and
        it&rsquo;s where JavaScript teams stall.
      </p>

      <h2>How to debug systematically</h2>
      <p>
        <strong>
          Every debugging surface Safari has is hidden behind the
          off-by-default Develop menu, which is why converted extensions
          feel undebuggable.
        </strong>{' '}
        Your errors are being thrown into a console you can&rsquo;t see
        yet.
      </p>
      <ol>
        <li>
          Enable the Develop menu in Safari&rsquo;s Settings, under the
          Advanced tab. For an unsigned local build, also turn on
          Develop &gt; Allow Unsigned Extensions, and expect to turn it
          on again after every Safari relaunch, because it resets when
          Safari quits.
        </li>
        <li>
          Use Web Inspector to open the background context and the
          popup consoles directly from the Develop menu.
        </li>
        <li>
          Write a one-page inventory of every WebExtension API you
          call. Check each against Safari&rsquo;s documented support,
          then test the three or four your product depends on, because
          documentation won&rsquo;t catch the exists-but-never-fires
          cases.
        </li>
        <li>
          Assume the background dies constantly. If behavior improves
          with the inspector open, the inspector is keeping the
          background alive and you&rsquo;ve found your bug class.
        </li>
        <li>
          Test on iOS hardware rather than only the simulator, because
          background teardown is most aggressive there.
        </li>
      </ol>
    </ArticleLayout>
  );
}
