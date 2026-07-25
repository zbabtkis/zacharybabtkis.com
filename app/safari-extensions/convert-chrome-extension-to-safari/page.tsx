import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'Converting a Chrome Extension to Safari and iOS: The Complete Guide',
  description:
    'How to convert a Chrome extension to Safari on macOS and iOS: what the converter actually does, which APIs break, the DeclarativeNetRequest migration, Xcode signing, and App Store review — from an engineer who shipped this at Honey and Pie.',
};

export default function ConvertGuidePage() {
  return (
    <ArticleLayout
      title="Converting a Chrome extension to Safari and iOS: the complete guide"
      description="What the converter actually does, which APIs break, the DeclarativeNetRequest migration, Xcode signing, and App Store review."
      datePublished="2026-07-24"
      slug="/safari-extensions/convert-chrome-extension-to-safari/"
      ctaTitle="Want the answer for your extension specifically?"
      ctaBody="The Safari Port Assessment does everything in this guide against your actual codebase: a full compatibility catalog, a DNR migration plan, and a fixed quote — in one week, for $2,500."
      ctaEmailSubject="Safari Port Assessment"
      ctaSource="convert-guide"
      faq={[
        {
          question: 'Can every Chrome extension be ported to Safari?',
          answer:
            'Most can, but not all as a straight translation. Extensions built on blocking webRequest, complex background lifecycles, or Chrome-only APIs need parts redesigned around Safari’s model. A small number — those whose core feature depends on something Safari deliberately doesn’t allow — shouldn’t be ported at all, and it’s better to know that in week one.',
        },
        {
          question: 'Do I need a Mac and an Apple Developer account?',
          answer:
            'Yes to both. The converter and Xcode only run on macOS, and distribution goes through the App Store, which requires an Apple Developer Program membership ($99/year). Budget a few days for Apple to approve a new developer account.',
        },
        {
          question: 'How long does a real port take?',
          answer:
            'A simple extension with no request blocking: often 4–6 weeks to shipped-and-approved. A content blocker or anything built on webRequest: 6–10 weeks, because the blocking layer gets redesigned. The wide range is exactly why I audit before quoting.',
        },
        {
          question: 'Does the same code run on macOS and iOS Safari?',
          answer:
            'Largely yes — Safari Web Extensions share the WebExtension codebase across both, wrapped in one app project. But iOS has real differences: popovers behave differently than desktop popups, some APIs are unavailable, and testing on device matters. Treat iOS as its own QA target, not a free checkbox.',
        },
      ]}
    >
      <p>
        Apple ships a command-line tool that converts a Chrome extension into
        a Safari one. Run it, and you get an Xcode project that compiles on
        the first try. This is where most teams get the wrong idea about how
        the rest of the port will go.
      </p>
      <p>
        I&rsquo;ve done this work twice at production scale — at Honey,
        where I built the company&rsquo;s first iOS browser extension and
        ported the legacy Safari extension to Apple&rsquo;s modern API, and
        at ZeroClick, where I owned Safari and iOS for its
        two-million-user Pie ad blocker. This guide is the map I wish I&rsquo;d had: what the
        converter actually does, what breaks, and what the real work looks
        like.
      </p>

      <h2>What the converter actually does</h2>
      <p>
        Safari has supported the WebExtension API — the same standard Chrome
        extensions are built on — since Safari 14. The converter wraps your
        existing extension in the packaging Safari requires:
      </p>
      <pre>
        <code>xcrun safari-web-extension-converter /path/to/your-extension</code>
      </pre>
      <p>
        That produces an Xcode project containing a small native app with
        your extension embedded inside it. This is the first structural
        difference from Chrome: a Safari extension is not a standalone
        artifact you upload to a store. It ships inside a Mac or iOS app,
        and users get it from the App Store, then enable it in
        Safari&rsquo;s settings.
      </p>
      <p>
        The converter copies your JavaScript, your manifest, and your
        assets. It does not check whether the APIs you call actually exist
        in Safari. Everything compiles; whether it <em>works</em> is a
        different question, answered API by API.
      </p>

      <h2>What breaks, by category</h2>

      <h3>1. Request blocking and modification</h3>
      <p>
        This is the big one. If your extension blocks or rewrites network
        requests with the blocking <code>webRequest</code> API, that
        capability does not exist in Safari. Safari&rsquo;s model is{' '}
        <code>declarativeNetRequest</code>: you hand the browser a list of
        rules and it applies them, without your JavaScript ever seeing the
        request. That&rsquo;s a redesign, not a translation — your dynamic
        blocking logic has to be re-expressed as declarative rules, and
        anything that genuinely required inspecting requests at runtime
        needs a different approach or has to be cut. Ad blockers, privacy
        tools, and anything with custom filtering live in this category. (I
        wrote more about this migration in{' '}
        <a href="/safari-extensions/webrequest-alternative/">
          the webRequest article
        </a>
        .)
      </p>

      <h3>2. Background script lifecycle</h3>
      <p>
        Safari does not run persistent background pages. If your extension
        assumes its background script lives forever — in-memory state,
        long-lived timers, an open WebSocket — it will break in ways that
        look random: the script gets suspended, state evaporates, events
        arrive with nobody listening. The fix is the same discipline
        Manifest V3 pushed on Chrome: event-driven code, state in storage,
        nothing important living only in memory. If you already survived
        Chrome&rsquo;s MV3 migration, you&rsquo;ve done most of this work.
      </p>

      <h3>3. API coverage gaps</h3>
      <p>
        Safari implements a large subset of the WebExtension API, not all
        of it. The pattern that costs teams weeks: an API exists as a
        property (so feature detection passes) but does nothing, or behaves
        subtly differently. Storage quotas differ. Some <code>tabs</code>{' '}
        and <code>windows</code> behaviors differ, especially on iOS where
        the whole windowing model is different. The only trustworthy answer
        is an audit of every API your extension touches against the Safari
        version range you intend to support — which is precisely the first
        deliverable of a port assessment.
      </p>

      <h3>4. The native layer nobody on a JS team signed up for</h3>
      <p>
        Past the JavaScript, you now own an Xcode project: bundle
        identifiers, entitlements, provisioning profiles, code signing, and
        a containing app that Apple expects to do something more than exist.
        None of this is hard for someone who does it weekly. All of it is
        alien to a JavaScript team, and it&rsquo;s where ports stall — the
        extension &ldquo;works&rdquo; but nobody can produce a signed build
        that installs on someone else&rsquo;s machine. Set up CI (Xcode
        Cloud or GitHub Actions with proper signing) early, not as a
        finishing touch.
      </p>

      <h2>iOS: the same codebase, a different product</h2>
      <p>
        Since iOS 15, iPhones and iPads run real Safari Web Extensions —
        your same WebExtension code, in the same wrapper project. This is
        the single biggest reason to port: your competitors&rsquo; Chrome
        extensions have zero presence on the phone. But treat iOS as its
        own target. The popup you designed for a 1440-pixel desktop becomes
        a popover on a 390-pixel phone. Touch replaces hover. Some APIs
        available on macOS are missing or behave differently. And your
        containing app now faces iOS App Review, which is stricter than the
        Mac&rsquo;s. Plan a real iOS QA pass on device — the simulator
        won&rsquo;t catch everything.
      </p>

      <h2>App Store review, for extension people</h2>
      <p>
        Your extension ships inside an app, so it goes through App Review.
        The rejections I&rsquo;ve seen most, at Honey and Pie and since:
      </p>
      <ul>
        <li>
          <strong>The containing app does too little.</strong> Apple wants
          the app to have some purpose — at minimum, clear instructions and
          state for enabling the extension. A blank window gets flagged.
        </li>
        <li>
          <strong>Permissions without explanation.</strong> If your
          extension wants access to all websites, the review notes need to
          say why, in plain language, and the app should explain it to
          users too.
        </li>
        <li>
          <strong>Privacy labels that don&rsquo;t match reality.</strong>{' '}
          Your App Store privacy questionnaire has to agree with what the
          extension actually collects. Analytics SDKs people forgot about
          are a classic trap.
        </li>
        <li>
          <strong>Metadata mentioning other browsers.</strong> Keep the
          store listing about the Safari product.
        </li>
      </ul>
      <p>
        Review times are usually a day or two now, but a rejection loop can
        eat weeks if you&rsquo;re learning the guidelines by trial and
        error. Writing honest, thorough review notes up front is the
        cheapest insurance there is.
      </p>

      <h2>Maintaining both after launch</h2>
      <p>
        The port isn&rsquo;t the end state; two storefronts are. The setup
        that works: keep one WebExtension codebase with a thin,
        well-isolated Safari layer, feature-detect rather than fork, and
        automate the Apple release path so shipping to Safari doesn&rsquo;t
        depend on the one person with a working Xcode setup. Budget for
        Safari&rsquo;s annual changes — new macOS and iOS versions move
        extension behavior more than Chrome updates do.
      </p>

      <h2>When not to port</h2>
      <p>
        An honest section, because it&rsquo;s a real outcome: if your
        extension&rsquo;s core value depends on capabilities Safari
        doesn&rsquo;t offer — deep request inspection, APIs Apple
        doesn&rsquo;t implement, or Chrome-specific surfaces — a port
        produces a worse product under your brand, and you shouldn&rsquo;t
        ship it. Roughly one in five extensions I assess gets a
        &ldquo;don&rsquo;t port, and here&rsquo;s why&rdquo; answer. That
        answer costs a week and saves a quarter.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>The converter gives you packaging, not compatibility.</li>
        <li>
          Blocking <code>webRequest</code> is the most common redesign;
          persistent background state is the most common source of weird
          bugs.
        </li>
        <li>iOS is the prize, and it&rsquo;s a real second target.</li>
        <li>
          The Apple toolchain — signing, CI, App Review — is where JS teams
          lose the most time, and the easiest part to hand to someone who
          lives there.
        </li>
      </ul>
    </ArticleLayout>
  );
}
