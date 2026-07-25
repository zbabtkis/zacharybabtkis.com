import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'Safari Extension Rejected by App Review? The Usual Reasons, and the Fixes',
  description:
    'Why Safari extensions get rejected in App Store review — minimal app functionality, permission justification, privacy label mismatches — and how to write review notes that pass, from an engineer who shipped through PayPal-scale review.',
};

export default function AppStoreRejectionPage() {
  return (
    <ArticleLayout
      title="Safari extension rejected? The usual reasons, and the fixes."
      description="The common App Review rejections for Safari extensions and how to resolve each one."
      datePublished="2026-07-24"
      slug="/safari-extensions/app-store-rejection/"
      ctaTitle="In a rejection loop right now?"
      ctaBody="I've shipped extensions through App Review at Honey and Pie, including the rejections. Send me the rejection notice — I'll tell you within a day whether it's a quick fix or a structural problem."
      ctaEmailSubject="Safari extension App Store rejection"
      ctaSource="rejection-article"
    >
      <p>
        Safari extensions ship inside apps, so they live and die by App
        Review — and App Review rejections cite guidelines, not fixes.
        Here&rsquo;s the translation table I&rsquo;ve built shipping
        extensions through review at Honey and Pie, roughly in order of how
        often each one bites.
      </p>

      <h2>&ldquo;Your app provides minimal functionality&rdquo;</h2>
      <p>
        The containing app can&rsquo;t be an empty shell. It doesn&rsquo;t
        need features — it needs a purpose: explain what the extension
        does, show whether it&rsquo;s enabled, and walk the user through
        turning it on in Safari settings. A well-designed onboarding screen
        with live extension state satisfies this. A blank window with your
        logo doesn&rsquo;t.
      </p>

      <h2>Broad permissions without justification</h2>
      <p>
        An extension that requests access to all websites is asking for a
        lot, and review treats it that way. Two fixes, used together:
        request the narrowest permissions your product genuinely needs, and
        explain the remainder — in the review notes <em>and</em> in the
        user-facing UI. &ldquo;This extension needs access to shopping
        sites to find coupons at checkout&rdquo; passes; unexplained
        all-sites access invites rejection or a request for justification
        that stalls you a cycle.
      </p>

      <h2>Privacy labels that don&rsquo;t match the binary</h2>
      <p>
        Your App Store privacy questionnaire is checked against what the
        app and extension actually do. The classic failure: an analytics
        SDK someone added two years ago collects identifiers your label
        says you don&rsquo;t collect. Audit what actually leaves the
        extension — network request by network request — before filling in
        the labels, not after the rejection.
      </p>

      <h2>Metadata problems</h2>
      <p>
        Store listings that lean on other brands (&ldquo;works like the
        Chrome version!&rdquo;), screenshots showing other browsers, or
        names that collide with trademarks all draw metadata rejections.
        Keep the listing about what the Safari product does for the user.
      </p>

      <h2>The iOS-specific tier</h2>
      <p>
        iOS review is stricter than macOS. Expect extra attention on
        anything that touches payments (guideline 3.1 territory), content
        filtering, and background behavior claims. If your extension
        interacts with purchases or money — coupons, cashback, price
        tracking — write the review notes as if the reviewer knows nothing
        about your category and needs to see, step by step, that
        everything happens on the merchant&rsquo;s site, not through
        payment mechanisms Apple polices.
      </p>

      <h2>Review notes are a product surface</h2>
      <p>
        The highest-leverage hour in the whole submission: write review
        notes that include what the extension does in one paragraph, a
        demo path with any test credentials, an explanation of each
        permission, and a preemptive answer to whatever looks unusual about
        your product. Reviewers are fast and pattern-driven; your notes are
        the pattern you hand them. At PayPal scale we treated review notes
        like release engineering, because a rejection cycle costs a week
        and notes cost an hour.
      </p>

      <h2>If you&rsquo;re already in the loop</h2>
      <ol>
        <li>
          Read the citation, then diagnose the <em>reviewer&rsquo;s</em>{' '}
          concern behind it — the guideline number is often the nearest
          label, not the actual issue.
        </li>
        <li>
          Respond in Resolution Center with specifics before resubmitting
          blind; sometimes the answer alone clears it.
        </li>
        <li>
          Fix the class, not the instance — if one permission drew fire,
          audit all of them before the next round.
        </li>
        <li>
          If you believe review is simply wrong, appeal — it works more
          often than people think, when the case is factual.
        </li>
      </ol>
    </ArticleLayout>
  );
}
