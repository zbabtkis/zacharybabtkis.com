import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { ReviewCycleDiagram } from '@/components/diagrams/review-cycle';

export const metadata: Metadata = {
  title: 'Safari Extension Rejected by App Review? The Usual Reasons, and the Fixes',
  description:
    'Why Safari extensions get rejected in App Store review (minimal app functionality, permission justification, privacy label mismatches) and how to write review notes that pass, from an engineer who shipped through PayPal-scale review.',
};

export default function AppStoreRejectionPage() {
  return (
    <ArticleLayout
      title="Safari extension rejected? The usual reasons, and the fixes."
      description="The common App Review rejections for Safari extensions and how to resolve each one."
      datePublished="2026-07-24"
      dateModified="2026-07-28"
      slug="/safari-extensions/app-store-rejection/"
      ctaTitle="In a rejection loop right now?"
      ctaBody="I've shipped extensions through App Review at Honey and Pie, including the rejections. Send me the rejection notice. I'll tell you within a day whether it's a quick fix or a structural problem."
      ctaEmailSubject="Safari extension App Store rejection"
      ctaSource="rejection-article"
    >
      <p>
        At ZeroClick I built the iOS app that carried the Safari
        extension for Pie Adblock, our ad blocker. The extension itself was JavaScript. But Safari
        extensions ship inside a native container app, the app you
        submit to the store, and every build of that app must
        pass App Review, Apple&rsquo;s approval process for everything
        on the App Store. A one-line JavaScript fix could not reach
        users until a full app binary cleared review.
      </p>
      <p>
        Before Pie I shipped through the same process at Honey, coupon
        automation across 30,000+ retailers that went through review
        under PayPal. Both products touched money, the category
        reviewers examine hardest. And a rejection of the containing app
        blocks the extension entirely. Nothing ships until the reviewer
        is satisfied.
      </p>
      <p>
        You may be facing the same shape of problem if you&rsquo;re
        porting a Chrome extension to Safari, wrapping an extension in a
        thin app for the first time, or staring at a rejection notice
        that cites a guideline number and nothing else. The rejection
        reasons are more predictable than the notices make them look.
      </p>
      <p>
        This is a structural fact of the platform, so it helps to know
        where the escape hatches are. On macOS a notarized app, one
        signed and malware-checked by Apple but distributed yourself,
        can skip the store. On iOS there is no way around review. Teams
        arriving from Chrome hit this hardest, because App Review judges
        the container app and the store listing, surfaces a browser
        extension team has never had to defend.
      </p>
      <p>
        There are two ways to handle review. Resubmitting blind loses:
        each unanswered reviewer question costs a full cycle. What
        worked for us was answering the reviewer&rsquo;s concern before
        it was asked, in the review notes, the free-text explanation you
        attach to a submission, and then fixing the whole class of
        problem instead of the cited instance.
      </p>
      <p>
        Here&rsquo;s the translation table I&rsquo;ve built shipping
        extensions through review at Honey and Pie, roughly in order of
        how often each one bites. Each section covers the rejection, the
        concern behind it, and the fix. The costs of guessing are
        covered along the way.
      </p>

      <h2>&ldquo;Your app provides minimal functionality&rdquo;</h2>
      <p>
        You submit a thin wrapper app around your extension, and the
        rejection comes back citing Guideline 4.2 (Design: Minimum
        Functionality), sometimes 4.2.2, saying the app provides a
        limited feature set. You may be wondering why Apple cares about
        an app whose whole job is carrying an extension. It cares. The
        container app cannot be an empty shell.
      </p>
      <p>
        It doesn&rsquo;t need features, just a purpose: explain what the
        extension does, show whether it&rsquo;s enabled, and walk the
        user through turning it on in Safari settings. A blank window
        with your logo doesn&rsquo;t pass. An onboarding flow that
        reflects live extension state does.
      </p>
      <p>
        Then you hit the second problem.{' '}
        <strong>
          iOS gives your app no API to ask whether its Safari extension
          is enabled, so live extension state is something you build
          yourself.
        </strong>{' '}
        macOS has an API for this; iOS does not. Your status screen
        shows &ldquo;not enabled&rdquo; even after the user enabled the
        extension, because the app has no way to check.
      </p>
      <p>
        The bridge that works: have the extension record that it ran, in
        an app group, a storage sandbox shared between an app and its
        extensions. The extension&rsquo;s native handler, the Swift side
        of a Safari extension, only executes when the extension is
        enabled, so execution itself is the signal. Here&rsquo;s the extension side:
      </p>
      <Code lang="swift">{`// Safari only runs this handler if the user has enabled the
// extension. So the fact that we're executing at all is the
// signal. Record it where the container app can read it.
class ExtensionRequestHandler: NSObject, NSExtensionRequestHandling {
  let shared = UserDefaults(suiteName: "group.com.example.shared")

  func beginRequest(with context: NSExtensionContext) {
    shared?.set(true, forKey: "extensionDidRun")
    // ...handle the actual message...
  }
}`}</Code>
      <p>
        The app side re-reads that flag every time it returns to the
        foreground, which is exactly when the user comes back from
        flipping the toggle in Safari settings:
      </p>
      <Code lang="swift">{`// Re-check on every return to foreground. The user just came
// back from Settings, and this is the moment to advance the
// onboarding step from "enable" to "done".
.onReceive(NotificationCenter.default.publisher(
  for: UIScene.willEnterForegroundNotification)) { _ in
    let shared = UserDefaults(suiteName: "group.com.example.shared")
    isEnabled = shared?.bool(forKey: "extensionDidRun") ?? false
}`}</Code>
      <p>
        One limitation to know about: this infers state from the
        extension having run and written the flag. It is not a query of
        the OS. If the user enables and later disables the extension,
        the flag stays stale until you add your own freshness logic.
        For satisfying 4.2, inference is enough.
      </p>

      <h2>Broad permissions without justification</h2>
      <p>
        The symptom has two halves. Users install the extension and it
        silently does nothing, because Safari&rsquo;s host permissions,
        the right to read and alter pages on a site, are off by default
        until the user taps through the &ldquo;Allow on All
        Websites&rdquo; prompts. And review bounces the build asking why
        all-sites access is needed, which costs you a full cycle.
      </p>
      <p>
        The first fix is requesting the narrowest permissions your
        product needs. But some categories cannot narrow. An ad blocker
        or a coupon tool needs every site by nature.{' '}
        <strong>
          When your product cannot narrow its permissions, the fix is
          justification, in the review notes and in the UI the user
          sees.
        </strong>
      </p>
      <p>
        In practice that means a dedicated permissions step in
        onboarding: tell the user what to grant and why, with
        instructions matched to their iOS version, since the Settings
        path moves between releases. Then track the grant the same way
        as enablement, with a flag the extension writes once permissions
        let it run on a page. &ldquo;This extension needs access to
        shopping sites to find coupons at checkout&rdquo; passes.
        Unexplained all-sites access invites a rejection.
      </p>

      <h2>Privacy labels that don&rsquo;t match the binary</h2>
      <p>
        The notice comes as a rejection or through App Store Connect,
        the dashboard where you manage your store listing. It says your
        app collects data types not declared in its privacy label, the
        data-collection disclosure on that listing. You grep
        your own code and find nothing. The culprit is almost always a
        bundled SDK: an analytics or attribution library someone added
        two years ago, sending device identifiers your label says you
        don&rsquo;t collect.
      </p>
      <p>
        Labels are self-declared, but reviewers compare them against
        what the binary observably does, and third-party SDKs collect
        identifiers whether or not your first-party code does.{' '}
        <strong>
          Audit what leaves the app and the extension, network request
          by network request, before you fill in the labels.
        </strong>{' '}
        Repeat the audit when an SDK updates, because that&rsquo;s when
        the label drifts.
      </p>

      <h2>Rejected on metadata alone</h2>
      <p>
        The binary passes and the submission still comes back, with a
        Guideline 2.3.x citation pointing at your metadata, the store
        listing content: a screenshot or a description line. Store
        listings that lean on other brands
        (&ldquo;works like the Chrome version&rdquo;), screenshots
        showing other browsers, and names that collide with trademarks
        all draw this class of rejection. Extensions ported from Chrome
        trip it naturally, because their marketing was written against
        the Chrome original.
      </p>
      <p>
        <strong>
          Keep the listing about what the Safari product does for the
          user, and strip cross-browser references and other-browser
          screenshots before you submit.
        </strong>{' '}
        The fix is listing-only, so at least the resubmission is cheap.
      </p>

      <h2>The iOS-specific tier</h2>
      <p>
        iOS review is stricter than macOS, and the sharpest scrutiny
        lands on anything that touches money. If your extension deals in
        coupons, cashback, or price tracking, expect the reviewer to ask
        how the money works: how cashback is funded, whether purchases
        route through the app, whether you&rsquo;re steering around
        in-app purchase, Apple&rsquo;s own payment system. Each
        unanswered question costs a review round.
      </p>
      <p>
        Guideline 3.1 exists to protect Apple&rsquo;s payment system.
        Coupon and cashback extensions are compliant precisely because
        the transaction happens on the merchant&rsquo;s website in
        Safari, which is physical-goods commerce outside in-app purchase
        scope. But a reviewer unfamiliar with the category cannot see
        that without being walked through it.{' '}
        <strong>
          Write the review notes as if the reviewer knows nothing about
          your category and needs to see, step by step, that everything
          happens on the merchant&rsquo;s site.
        </strong>{' '}
        Honey and Pie were both money-touching extensions, and this is
        the review regime they shipped through.
      </p>

      <h2>Review notes are a product surface</h2>
      <p>
        The expensive failure mode here is resubmitting blind. Apple&rsquo;s
        published turnaround is 24 to 48 hours for most submissions, but
        a rejection costs you the whole cycle: diagnose, fix, rebuild,
        resubmit, wait for re-review, and often an exchange in
        Resolution Center, the message thread with the review team in
        App Store Connect, on top. Count it end to end at a company that
        ships on a fixed release schedule and a single rejection can eat
        a week.{' '}
        <strong>
          Review notes cost an hour and are the cheapest insurance
          against that cycle.
        </strong>
      </p>
      <ReviewCycleDiagram />
      <p>
        Reviewers are fast and pattern-driven; your notes are the
        pattern you hand them. Good notes cover four things:
      </p>
      <ul>
        <li>
          They describe what the extension does in one paragraph.
        </li>
        <li>
          They give a demo path, with test credentials if the product
          needs an account.
        </li>
        <li>
          They explain each permission the extension requests and why.
        </li>
        <li>
          They preemptively answer whatever looks unusual about your
          product, before the reviewer has to ask.
        </li>
      </ul>

      <h2>If you&rsquo;re already in the loop</h2>
      <p>
        <strong>
          Most rejections come down to what the reviewer understood, and
          the guideline number cited is often the nearest label rather
          than the real issue.
        </strong>{' '}
        That shapes the recovery sequence:
      </p>
      <ol>
        <li>
          Read the citation, then work out the{' '}
          <em>reviewer&rsquo;s</em> concern behind it before you touch
          any code.
        </li>
        <li>
          Respond in Resolution Center with specifics before
          resubmitting blind. Reviewers can approve based on a
          clarification alone, without a new binary.
        </li>
        <li>
          Fix the whole class: if one permission drew fire, audit all of
          them before the next round.
        </li>
        <li>
          If review is factually wrong, appeal to the App Review Board,
          Apple&rsquo;s channel for disputing a rejection. It exists for
          exactly this, and a factual case gives it something to work
          with.
        </li>
      </ol>
    </ArticleLayout>
  );
}
