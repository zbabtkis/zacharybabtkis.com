import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

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
      slug="/safari-extensions/webrequest-alternative/"
      ctaTitle="Migrating a real extension's blocking layer?"
      ctaBody="I did this migration for an ad blocker with two million users. The port assessment maps every one of your webRequest usages to its Safari answer: kept, redesigned, or cut. You get a fixed quote for the work."
      ctaEmailSubject="Safari Port Assessment: webRequest migration"
      ctaSource="webrequest-article"
    >
      <p>
        You ran the converter, your extension loads in Safari, and your
        request blocking silently does nothing. No errors. The listeners
        never fire with the power you expected. This is not a bug in
        your port. It is Safari&rsquo;s design, and pretending
        otherwise wastes weeks.
      </p>

      <h2>The model change</h2>
      <p>
        In Chrome (historically) your JavaScript could sit in the request
        path: see each request, decide, block or rewrite it. Safari never
        allowed that. Extension code doesn&rsquo;t get to watch the
        network. Instead, Safari implements{' '}
        <code>declarativeNetRequest</code> (DNR): you register rules ahead
        of time, built from match patterns, resource types, and actions
        like block, redirect, or header modification, and the browser
        applies them itself. Chrome pushed the same direction with Manifest
        V3, so if you already built DNR rules for Chrome, a meaningful part
        of your Safari migration is done. The differences that remain are
        in rule limits, supported action types, and versioned behavior.
        Verify those against the Safari versions you support.
      </p>

      <h2>What survives the migration cleanly</h2>
      <ul>
        <li>
          <strong>Static blocklists:</strong> domain and URL-pattern
          blocking translates directly into DNR rules.
        </li>
        <li>
          <strong>Simple redirects:</strong> from-pattern-to-URL rules are
          well supported.
        </li>
        <li>
          <strong>Most header tweaks:</strong> removing or setting
          specific headers is expressible as DNR actions in modern Safari.
        </li>
        <li>
          <strong>User-toggled rule sets:</strong> enable and disable
          rulesets dynamically from your UI.
        </li>
      </ul>

      <h2>What needs a redesign</h2>
      <ul>
        <li>
          <strong>Logic that inspects request or response content.</strong>{' '}
          DNR matches on URL, resource type, and headers-level patterns.
          It will never show your code the payload. Whatever decision you
          were making from content has to move elsewhere: into a content
          script, into heuristics expressible as rules, or out of the
          product.
        </li>
        <li>
          <strong>Rules computed per-request at runtime.</strong> You can
          update dynamic rules frequently, but not in the request path.
          Think &ldquo;recompile the rule set when state changes,&rdquo;
          not &ldquo;decide per request.&rdquo;
        </li>
        <li>
          <strong>Counting and telemetry from the request path.</strong>{' '}
          If your UI shows &ldquo;blocked 47 ads on this page,&rdquo; you
          lose the direct count. At Pie we rebuilt counters from what the
          browser exposes plus DOM-level signals. It is solvable, but it
          is a design task.
        </li>
        <li>
          <strong>Massive filter lists.</strong> Safari enforces rule
          limits, and they differ by version. Big lists need
          prioritization, compilation, and pruning strategy. This is where
          ad-blocker experience earns its keep.
        </li>
      </ul>

      <h2>How I approach the migration</h2>
      <ol>
        <li>
          Inventory every <code>webRequest</code> listener and classify
          what each one accomplishes for the user rather than how it
          does it.
        </li>
        <li>
          Sort into: expressible as static rules · expressible as dynamic
          rules · needs redesign · not portable. Be ruthless about the last
          bucket early.
        </li>
        <li>
          Build the rule compiler: the code that turns your source of
          truth (filter list, user settings, server config) into DNR rule
          sets within Safari&rsquo;s limits.
        </li>
        <li>
          Rebuild user-visible feedback (counters, badges) from signals you
          still have.
        </li>
        <li>Test per Safari version. Behavior varies.</li>
      </ol>
      <p>
        DNR is less powerful and more predictable. For
        most extensions the user-facing feature set survives; the
        engineering underneath is different enough that this is the part of
        a Safari port that deserves a specialist.
      </p>
    </ArticleLayout>
  );
}
