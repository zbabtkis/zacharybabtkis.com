import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'safari-web-extension-converter Ran Fine — So Why Is the Extension Broken?',
  description:
    'The Safari extension converter produces projects that compile but don’t work. The six most common causes: silently missing APIs, background lifecycle, manifest keys Safari ignores, storage differences, signing, and iOS quirks.',
};

export default function ConverterNotWorkingPage() {
  return (
    <ArticleLayout
      title="The converter ran fine. So why is your Safari extension broken?"
      description="Six reasons a converted Chrome extension compiles but doesn't work in Safari, and how to diagnose each."
      datePublished="2026-07-24"
      slug="/safari-extensions/converter-not-working/"
      ctaTitle="Stuck on a converted extension that won't behave?"
      ctaBody="Send me your extension's store link or repo. The port assessment catalogs exactly what's broken and what it takes to fix — one week, fixed price, and the fee credits toward the port."
      ctaEmailSubject="Safari Port Assessment — converter issues"
      ctaSource="converter-article"
    >
      <p>
        <code>xcrun safari-web-extension-converter</code> is honest about
        exactly one thing: packaging. It wraps your extension in an Xcode
        project that builds. It makes no promises that the extension inside
        works, and its warnings cover only a fraction of what differs.
        Here&rsquo;s where converted extensions actually break, in the
        order I usually find them.
      </p>

      <h2>1. APIs that exist but do nothing</h2>
      <p>
        Safari implements the WebExtension namespace broadly enough that
        feature detection often passes — the property is there — while the
        behavior is missing or different. Your code takes the happy path
        and silently no-ops. Don&rsquo;t trust{' '}
        <code>{"typeof browser.x !== 'undefined'"}</code>; test the actual
        behavior of every API you depend on, in the oldest Safari you plan
        to support.
      </p>

      <h2>2. Background script assumptions</h2>
      <p>
        Safari suspends background scripts aggressively. In-memory state,
        <code>setInterval</code> loops, module-level variables holding
        session data — all of it evaporates when the script is torn down
        between events. Symptoms look like flakiness: works right after
        install, breaks &ldquo;randomly&rdquo; later. The fix is
        event-driven structure with state in <code>storage</code>, the same
        discipline Chrome&rsquo;s MV3 service workers require.
      </p>

      <h2>3. Blocking webRequest, quietly gone</h2>
      <p>
        If any part of your extension blocks or modifies requests, that
        layer doesn&rsquo;t function in Safari — request interception is
        declarative-only. This deserves its own migration plan;{' '}
        <a href="/safari-extensions/webrequest-alternative/">
          I wrote one here
        </a>
        .
      </p>

      <h2>4. Manifest keys Safari ignores</h2>
      <p>
        The converter carries your manifest over mostly untouched and warns
        about some unsupported keys — not all. Behavior tied to ignored
        keys just doesn&rsquo;t happen. Commands, some background
        configurations, and Chrome-specific keys are frequent culprits.
        Audit the manifest key by key against what Safari documents, not
        against what the converter accepted.
      </p>

      <h2>5. Storage and messaging edge cases</h2>
      <p>
        Storage quotas and behavior differ from Chrome, and messaging
        between content scripts, background, and popup has timing
        differences — especially around the background script waking up.
        Code that implicitly relied on Chrome&rsquo;s timing works in your
        demo and fails for users. Add explicit retries or handshakes around
        the first message after idle.
      </p>

      <h2>6. It works in Xcode and nowhere else</h2>
      <p>
        The build-and-run flow signs with your development identity. The
        moment someone else needs a build — a teammate, a tester,
        TestFlight — you&rsquo;re into provisioning profiles, entitlements,
        and distribution signing. This isn&rsquo;t an extension problem;
        it&rsquo;s Apple platform work, and it&rsquo;s the single most
        common place JavaScript teams stall. Set up CI with proper signing
        in week one and the whole class of problem disappears.
      </p>

      <h2>How to debug systematically</h2>
      <ol>
        <li>
          Enable the develop menu in Safari and inspect the background
          context and popup directly — the consoles are there, just hidden.
        </li>
        <li>
          Write a one-page inventory of every WebExtension API you call.
          Check each against Safari&rsquo;s documented support and test the
          three or four your product actually depends on.
        </li>
        <li>
          Assume the background script dies constantly. If behavior
          improves with the inspector open (which keeps it alive),
          you&rsquo;ve found your bug class.
        </li>
        <li>Test on iOS hardware, not just the simulator.</li>
      </ol>
    </ArticleLayout>
  );
}
