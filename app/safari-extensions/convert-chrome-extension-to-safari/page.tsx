import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';

export const metadata: Metadata = {
  title: 'Converting a Chrome Extension to Safari and iOS: The Complete Guide',
  description:
    'How to convert a Chrome extension to Safari on macOS and iOS: what the converter does, which APIs break, the DeclarativeNetRequest migration, Xcode signing, and App Store review, from an engineer who shipped this at Honey and Pie.',
};

export default function ConvertGuidePage() {
  return (
    <ArticleLayout
      title="Getting your Chrome extension onto Safari and iPhone: the complete guide"
      description="What the converter does, which APIs break, the DeclarativeNetRequest migration, Xcode signing, and App Store review."
      datePublished="2026-07-24"
      dateModified="2026-07-28"
      slug="/safari-extensions/convert-chrome-extension-to-safari/"
      ctaTitle="Want the answer for your extension specifically?"
      ctaBody="The Safari Port Assessment runs everything in this guide against your actual codebase: a full compatibility catalog, a DNR migration plan, and a fixed quote. It takes one week and costs $2,500."
      ctaEmailSubject="Safari Port Assessment"
      ctaSource="convert-guide"
      faq={[
        {
          question: 'Can every Chrome extension be ported to Safari?',
          answer:
            'Most can, but not all as a straight translation. Extensions built on blocking webRequest, complex background lifecycles, or Chrome-only APIs need parts redesigned around Safari’s model. A small number shouldn’t be ported at all: the ones whose core feature depends on something Safari deliberately doesn’t allow. It’s better to find that out in week one.',
        },
        {
          question: 'Do I need a Mac and an Apple Developer account?',
          answer:
            'Yes to both. The converter and Xcode only run on macOS, and you need an Apple Developer Program membership at $99 per year. On iOS, distribution is App Store only. On macOS, Safari 18.4 added a second path: a notarized app signed with your Developer ID, distributed outside the store. Budget a few days for Apple to approve a new developer account.',
        },
        {
          question: 'How long does a real port take?',
          answer:
            'Plan on 4–6 weeks to shipped-and-approved for a simple extension with no request blocking. Plan on 6–10 weeks for a content blocker or anything built on webRequest, because the blocking layer has to be rebuilt around declarative rules rather than translated. Those are planning ranges, and the spread is exactly why I audit before quoting.',
        },
        {
          question: 'Does the same code run on macOS and iOS Safari?',
          answer:
            'Largely yes. Safari Web Extensions share one WebExtension codebase across macOS and iOS, wrapped in a single app project. But iOS has real differences: the popup becomes a popover with its own lifecycle, some APIs are unavailable or behave differently, and App Review is stricter. Treat iOS as its own QA target and test on a physical device.',
        },
      ]}
    >
      <p>
        At ZeroClick I owned Safari and iOS for Pie, an ad blocker with more
        than two million users. Pie shipped first as a Chrome extension, and
        no Chrome extension reaches an iPhone, so the Safari port was how the
        product got to the phone. Apple ships a command-line tool that
        converts a Chrome extension into a Safari one. We ran it and got an
        Xcode project that compiled on the first try.
      </p>
      <p>
        The build was the easy part. Pie&rsquo;s blocking engine was written
        against an API that Safari accepts without error and quietly
        ignores, so every ad request would have sailed through untouched.
        The rules we rebuilt it on brought their own trouble: some installed
        cleanly and never matched anything, and one bad combination blanked
        all of Spotify.
      </p>
      <p>
        You may be holding the same shape of problem: a working Chrome
        extension, a reason to be on Safari or iPhone, and a converter that
        looks like it does the whole job in one command. That first clean
        build is where most teams get the wrong idea about how the rest of
        the port will go.
      </p>
      <p>
        Ports like this became possible only recently. Safari has supported
        the WebExtension API, the same standard Chrome extensions are built
        on, since Safari 14, and since iOS 15 the iPhone runs it too. So
        every Chrome team now has a plausible Safari port on the table. The
        catch is that Safari runs the shared standard on top of a stricter
        privacy and process model, and the differences fail silently instead
        of throwing.
      </p>
      <p>
        There are two ways to run a port like this. You can translate the
        extension as it stands and patch whatever breaks, or you can audit
        every API it touches and redesign around Safari&rsquo;s model where
        the two diverge. The redesign is what shipped Pie. Blocking moved to
        declarative rules, the lists you hand the browser so its network
        layer does the enforcement. The background script was rewritten to
        survive suspension, and signing moved into CI during the first week.
      </p>
      <p>
        Translate-and-patch fails in specific, repeatable places, and the
        body of this guide covers each one. I&rsquo;d been through this once
        before, at Honey, where I built the company&rsquo;s first iOS
        browser extension and ported the legacy Safari extension to
        Apple&rsquo;s modern API. This guide is the map I wish I&rsquo;d had
        both times.
      </p>

      <h2>What the converter does</h2>
      <p>
        Safari has supported the WebExtension API, the same standard Chrome
        extensions are built on, since Safari 14. The converter&rsquo;s job
        is to wrap your existing extension in the packaging Safari requires:
      </p>
      <Code lang="bash">{`xcrun safari-web-extension-converter /path/to/your-extension`}</Code>
      <p>
        That produces an Xcode project containing a small native app with
        your extension embedded inside it. Notice the first structural
        difference from Chrome: a Safari extension is not a standalone
        artifact you upload to a store. It ships inside a Mac or iOS app and
        gets enabled in Safari&rsquo;s settings.
      </p>
      <p>
        On iOS the app comes from the App Store. On macOS it comes from the
        App Store or, since Safari 18.4, from direct distribution as a
        notarized app, one Apple has scanned and stamped, signed with your
        Developer ID, the certificate tied to your Apple developer account.
      </p>
      <p>
        Now for the part the clean build hides. Xcode compiles the Swift
        wrapper, never your JavaScript, so the extension installs and shows
        up in Safari&rsquo;s settings while individual features fail
        silently at runtime, with nothing in the build log pointing at
        them.{' '}
        <strong>
          The converter copies your JavaScript, manifest, and assets, but it
          does not check whether the APIs you call exist in Safari.
        </strong>{' '}
        You answer that question API by API.
      </p>

      <h2>What breaks, by category</h2>

      <h3>1. Request blocking and modification</h3>
      <p>
        This is the big one, and it announces itself quietly. A blocking{' '}
        <code>webRequest</code> listener that cancels ad requests in Chrome
        registers without error in Safari. Then every request sails through
        untouched. Safari ignores the <code>blocking</code> option and never
        consults your return value, so ads load while your listener code
        appears to run.
      </p>
      <p>
        <strong>
          Blocking <code>webRequest</code> does not exist in Safari.
        </strong>{' '}
        Safari&rsquo;s model is <code>declarativeNetRequest</code>, DNR from
        here on: you hand
        the browser a list of rules up front, and the browser&rsquo;s
        network layer applies them without your JavaScript ever seeing a
        request. Safari&rsquo;s process model and privacy stance never
        allowed extension code to intercept requests synchronously.
      </p>
      <Code lang="js">{`// Registers without error in Safari. Also does nothing there:
// the 'blocking' option is ignored and the return value is never
// read, so this code "runs" while every request goes through.
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (isAd(details.url)) return { cancel: true };
  },
  { urls: ['<all_urls>'] },
  ['blocking'],
);

// Safari's blocking primitive: hand the browser a rule and let its
// network layer evaluate it. Your code never sees the request.
await browser.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      id: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: '||ads.example.com',
        resourceTypes: ['script', 'xmlhttprequest'],
      },
    },
  ],
});`}</Code>
      <p>
        For an ad blocker, privacy tool, or anything with custom filtering,
        that is a redesign. Dynamic blocking logic gets re-expressed as rule
        add and remove operations, and anything that inspected requests at
        runtime needs a different mechanism or gets cut. On Pie, the entire
        blocking engine became DNR, with the filter lists that define what
        to block compiled into rules and
        injected page scripts handling what rules can&rsquo;t express. I
        wrote more about this migration in{' '}
        <a href="/safari-extensions/webrequest-alternative/">
          the webRequest article
        </a>
        .
      </p>

      <h3>2. Background script lifecycle</h3>
      <p>
        The second category shows up as decay. The extension works for a few
        minutes after you enable it, then features stop. Alarms fire into a
        dead context, an open WebSocket is silently gone, and in-memory
        caches come back empty. The failures look random because they depend
        on when Safari suspended your background script, the long-running
        context that holds your extension&rsquo;s logic.
      </p>
      <p>
        Safari on iOS does not run persistent background pages, and you
        shouldn&rsquo;t rely on them on macOS either. macOS still permits
        one for Manifest V2 extensions, but memory pressure on the phone
        means Safari aggressively suspends and kills background contexts,
        so any extension targeting both platforms lives without persistence.
      </p>
      <p>
        <strong>
          The fix is the discipline Manifest V3 pushed on Chrome:
          event-driven code, durable state in extension storage, nothing
          important living only in memory.
        </strong>{' '}
        If you already survived Chrome&rsquo;s MV3 migration, you&rsquo;ve
        done most of this work. Pie shipped this exact shape on Safari as a
        non-persistent background page, Safari&rsquo;s alternative to
        Chrome&rsquo;s service worker.
      </p>
      <Code lang="js">{`// Assume the background context can die between any two events.
// Rehydrate from storage in every handler instead of trusting
// module-level variables to still be there.
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type !== 'pause-domain') return;
  const { paused = [] } = await browser.storage.local.get('paused');
  await browser.storage.local.set({
    paused: [...paused, message.domain],
  });
});

// Timers are the classic casualty. A setTimeout dies with the
// suspended page; an alarm fires even if Safari has to wake the
// background context to deliver it.
browser.alarms.create('refresh-rules', { periodInMinutes: 60 });`}</Code>

      <h3>3. API coverage gaps</h3>
      <p>
        The third category is the one that eats weeks. Safari implements a
        large subset of the WebExtension API, and the costly pattern is an
        API that exists as a property, so feature detection passes, but does
        nothing or behaves subtly differently. Nothing throws. You find out
        from behavior on real sites.
      </p>
      <p>
        DNR is where this bit us hardest on Pie. Rules registered with zero
        console errors and showed up when we listed them, but some never
        matched anything, and one condition combination over-matched badly
        enough to blank all of Spotify. Safari read an older key name where
        Chrome used <code>initiatorDomains</code>, refused the
        domain-filtered <code>allowAllRequests</code> rules we depended on,
        which exempt a page&rsquo;s requests from blocking,
        and mishandled redirect actions.
      </p>
      <p>
        We shipped a translation pass that rewrote every rule set before
        install, plus a runtime layer that detected invalid installed rules
        and repaired them in place. I covered that system in{' '}
        <a href="/safari-extensions/dynamic-dnr-rules/">
          the dynamic rules article
        </a>
        . We also had to polyfill cookie-change detection that Safari
        lacks.{' '}
        <strong>
          The only answer you can trust comes from auditing every API your
          extension touches against the Safari versions you intend to
          support.
        </strong>{' '}
        That audit is the first deliverable of a port assessment.
      </p>

      <h3>4. The native layer nobody on a JS team signed up for</h3>
      <p>
        Past the JavaScript, you now own an Xcode project: bundle
        identifiers, entitlements (the capabilities Apple grants your app),
        provisioning profiles (the files tying your app to your
        certificates and devices), code signing, and a containing app that
        Apple expects to do more than exist. None of it is hard for someone
        who does it weekly. All of it is new to a JavaScript team.
      </p>
      <p>
        Here&rsquo;s how the stall looks in practice. The extension runs
        fine in one engineer&rsquo;s Xcode. Any archive built anywhere else
        fails signing, or produces an app whose extension won&rsquo;t load
        on another machine. The signing material lives in that one
        developer&rsquo;s keychain by default, which is knowledge no
        WebExtension workflow ever required.
      </p>
      <p>
        <strong>
          Set up CI with real signing during the first week of the port.
        </strong>{' '}
        Both mainstream routes work. Pie ran Xcode Cloud, with a post-clone
        script installing the Node toolchain so cloud builds matched local
        ones. I&rsquo;ve built the same flow on GitHub Actions with an
        isolated build keychain and a TestFlight upload step. Either one
        makes the whole class of problem go away.
      </p>

      <h2>iOS: the same codebase, a different product</h2>
      <p>
        Since iOS 15, iPhones and iPads run real Safari Web Extensions: the
        same WebExtension code, in the same wrapper project. This is the
        single biggest reason to port, since your competitors&rsquo; Chrome
        extensions have no presence on the phone at all.
      </p>
      <p>
        Treat iOS as its own target anyway. The port that passes QA on
        desktop Safari can ship to an iPhone and render its popup wrong, or
        misfire its messaging to the background, because the iOS popover is
        a different surface than the desktop popup the code was written
        against.
      </p>
      <ul>
        <li>
          The popup you designed for a desktop window becomes a popover on a
          390-pixel phone, with its own lifecycle.
        </li>
        <li>
          Touch replaces hover, so anything revealed on hover needs another
          trigger.
        </li>
        <li>
          Some APIs available on macOS are missing or behave differently,
          and the whole windowing model differs.
        </li>
        <li>
          The containing app faces iOS App Review, which is stricter than
          the Mac&rsquo;s.
        </li>
      </ul>
      <p>
        <strong>
          Keep one manifest and one JavaScript bundle with two thin native
          targets, and give iOS its own QA pass on a physical device.
        </strong>{' '}
        That&rsquo;s the structure Pie shipped: shared code, small
        per-platform accommodations like a mobile-optimized ruleset, and no
        fork. The simulator won&rsquo;t catch everything.
      </p>

      <h2>App Store review, for extension people</h2>
      <p>
        Your extension ships inside an app, so it goes through App Review.
        The first submission of a converted extension often bounces within
        24 to 48 hours, and each fix-and-resubmit round trip costs another
        review cycle. Here are the rejections I&rsquo;ve seen most, at
        Honey and Pie:
      </p>
      <ul>
        <li>
          The containing app does too little. Apple wants it to have some
          purpose: at minimum, clear instructions and state for enabling the
          extension. A blank window gets flagged.
        </li>
        <li>
          Permissions come without explanation. If your extension wants
          access to all websites, the review notes need to say why in plain
          language, and the app should explain it to users too.
        </li>
        <li>
          The privacy labels don&rsquo;t match reality. Your App Store
          privacy questionnaire has to agree with what the extension
          collects, and an analytics SDK somebody forgot about is the
          classic trap.
        </li>
        <li>
          The metadata mentions other browsers. Keep the store listing about
          the Safari product.
        </li>
      </ul>
      <p>
        Review itself usually takes a day or two now.{' '}
        <strong>
          Thorough review notes, written before the first submission, are
          the cheapest way out of the rejection loop.
        </strong>
      </p>

      <h2>Maintaining both after launch</h2>
      <p>
        The port isn&rsquo;t the end state; two storefronts are.{' '}
        <strong>
          Keep one WebExtension codebase with a thin, well-isolated Safari
          layer, feature-detect instead of forking, and automate the Apple
          release path.
        </strong>{' '}
        Shipping to Safari should never depend on the one person with a
        working Xcode setup. Budget for Safari&rsquo;s annual changes too:
        new macOS and iOS versions move extension behavior more than Chrome
        updates do.
      </p>

      <h2>When not to port</h2>
      <p>
        &ldquo;Should we even port this?&rdquo; you ask. Sometimes the
        answer is no, and that&rsquo;s a legitimate outcome.{' '}
        <strong>
          If your extension&rsquo;s core value depends on capabilities
          Safari deliberately doesn&rsquo;t offer, such as deep request
          inspection or Chrome-only surfaces, a port produces a worse
          product under your brand.
        </strong>
      </p>
      <p>
        Some extensions shouldn&rsquo;t be ported at all. Going in, expect
        that answer for roughly one in five. Finding out costs a week and
        saves a quarter.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>
          The converter&rsquo;s clean first build proves the packaging works
          and nothing else.
        </li>
        <li>
          Blocking <code>webRequest</code> is the most common redesign, and
          background-script suspension is the most common source of bugs
          that look random.
        </li>
        <li>iOS is the prize, and it&rsquo;s a real second target.</li>
        <li>
          The Apple toolchain of signing, CI, and App Review is where
          JavaScript teams lose the most time. It&rsquo;s also the easiest
          part to hand to someone who lives there.
        </li>
      </ul>
    </ArticleLayout>
  );
}
