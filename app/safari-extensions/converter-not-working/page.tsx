import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

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
            'Because safari-web-extension-converter copies your files without checking whether the APIs you call exist in Safari. The usual causes, in the order I find them: an API that silently doesn’t exist in Safari, background lifecycle differences, manifest keys Safari ignores, storage behavior differences, signing problems, and iOS-specific quirks. The project compiling tells you nothing about whether the extension works.',
        },
        {
          question:
            'How do I debug a converted Safari extension that isn’t working?',
          answer:
            'Turn on Safari’s Develop menu, allow unsigned extensions if you built without signing, and use Web Inspector to open the background context and popup consoles directly. Those consoles are hidden until the Develop menu is on, which is why converted extensions feel undebuggable. One useful trick: if behavior improves while the inspector is open, you’ve found a background-lifecycle bug, because the inspector keeps the script alive.',
        },
        {
          question:
            'Why does my extension work in Chrome but not in Safari?',
          answer:
            'Some Chrome APIs don’t exist in Safari, and calling them fails silently rather than throwing. Blocking webRequest, several permission surfaces, and page overrides are the common ones. Check every chrome.* call your extension makes against Safari’s support before assuming the port is broken. Half of my port assessments come down to a list of exactly these calls.',
        },
      ]}
      ctaTitle="Stuck on a converted extension that won't behave?"
      ctaBody="Send me your extension's store link or repo. The port assessment catalogs what's broken and what it'll take to fix. It takes one week at a fixed price, and the fee credits toward the port."
      ctaEmailSubject="Safari Port Assessment: converter issues"
      ctaSource="converter-article"
    >
      <p>
        <code>xcrun safari-web-extension-converter</code> is honest about
        exactly one thing: packaging. It wraps your extension in an Xcode
        project that builds. It makes no promise that the extension inside
        works, and its warnings cover only a fraction of what differs. So
        where do converted extensions break? Here are the six places, in
        the order I usually find them.
      </p>

      <h2>1. APIs that exist but do nothing</h2>
      <p>
        Safari implements the WebExtension namespace broadly enough that
        feature detection often passes. The property is there while the
        behavior is missing or different, so your code takes the happy
        path and silently no-ops. Don&rsquo;t trust{' '}
        <code>{"typeof browser.x !== 'undefined'"}</code>. Test the real
        behavior of every API you depend on, in the oldest Safari you plan
        to support.
      </p>

      <h2>2. Background script assumptions</h2>
      <p>
        Safari suspends background scripts aggressively. In-memory state,
        <code>setInterval</code> loops, and module-level variables holding
        session data all evaporate when the script gets torn down
        between events. The symptoms look like flakiness: the extension
        works right after install, then breaks &ldquo;randomly&rdquo;
        later. The fix is event-driven structure with state in{' '}
        <code>storage</code>, the same discipline Chrome&rsquo;s MV3
        service workers require.
      </p>

      <h2>3. Blocking webRequest, silently gone</h2>
      <p>
        If any part of your extension blocks or modifies requests, that
        layer doesn&rsquo;t function in Safari, because request
        interception is declarative-only. This deserves its own migration plan;{' '}
        <a href="/safari-extensions/webrequest-alternative/">
          I wrote one here
        </a>
        .
      </p>

      <h2>4. Manifest keys Safari ignores</h2>
      <p>
        The converter carries your manifest over mostly untouched. It
        warns about some unsupported keys, but not all of them, and
        behavior tied to ignored keys simply doesn&rsquo;t happen.
        Commands, some background configurations, and Chrome-specific keys
        are the frequent culprits. Audit the manifest key by key against
        what Safari documents, not against what the converter accepted.
      </p>

      <h2>5. Storage and messaging edge cases</h2>
      <p>
        Storage quotas and behavior differ from Chrome, and messaging
        between content scripts, background, and popup has timing
        differences, especially around the background script waking up.
        Code that implicitly relied on Chrome&rsquo;s timing works in your
        demo and fails for users. Add explicit retries or handshakes around
        the first message after idle.
      </p>

      <h2>6. It works in Xcode and nowhere else</h2>
      <p>
        The build-and-run flow signs with your development identity, so
        everything looks fine on your machine. The moment a teammate, a
        tester, or TestFlight needs a build, you&rsquo;re into
        provisioning profiles, entitlements, and distribution signing.
        This is Apple platform work rather than an extension problem, and
        it&rsquo;s the most common place JavaScript teams stall. Set up CI
        with proper signing in week one and the whole class of problem
        disappears.
      </p>

      <h2>How to debug systematically</h2>
      <ol>
        <li>
          Enable the develop menu in Safari and inspect the background
          context and popup directly. The consoles are hidden until the
          menu is on.
        </li>
        <li>
          Write a one-page inventory of every WebExtension API you call.
          Check each one against Safari&rsquo;s documented support and
          test the three or four your product depends on.
        </li>
        <li>
          Assume the background script dies constantly. Here&rsquo;s a
          quick experiment: if behavior improves with the inspector open
          (the inspector keeps the script alive), you&rsquo;ve found your
          bug class.
        </li>
        <li>Test on iOS hardware rather than only the simulator.</li>
      </ol>
    </ArticleLayout>
  );
}
