import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'How to Detect AI Crawlers and LLM Referral Traffic',
  description:
    'AI crawlers don’t run your analytics JavaScript, and CDN caching hides them from origin logs. Where AI traffic is actually observable, which signals to trust, and the instrumentation rules that make the numbers usable — from the engineer who built an edge detection SDK.',
};

export default function DetectAiTrafficPage() {
  return (
    <ArticleLayout
      title="How to detect AI crawlers and LLM referral traffic"
      description="Where AI traffic is observable, which signals to trust in what order, and the instrumentation rules that make the measurements usable."
      datePublished="2026-07-25"
      slug="/ai-agent-enablement/detect-ai-traffic/"
      byline="I led agent-provisioning and AI-traffic engineering at ZeroClick"
      faq={[
        {
          question: 'Can I detect ChatGPT traffic in Google Analytics?',
          answer:
            'Half of it. A human who clicks a citation link in an AI product runs your JavaScript like any visitor, so a referral can show up under its referrer or campaign parameters. A crawler fetching your page to answer a question never executes your analytics tag, so that half is invisible to any client-side tool. Crawl detection requires server or edge instrumentation.',
        },
        {
          question: 'How do I tell an AI crawler from an AI referral?',
          answer:
            'By signal type. Referrals arrive with browser evidence: a Referer header from the AI product’s domain, or campaign parameters the provider appended to the citation link. Crawls identify themselves by user-agent, and the request comes from the provider’s infrastructure rather than a person’s browser. Classify with campaign parameters first, then Referer, then user-agent — and record which signal fired.',
        },
        {
          question: 'Should I block AI crawlers?',
          answer:
            'Measure before deciding. The crawlers fall into distinct categories — training crawlers, search indexers, and user-triggered fetches that retrieve your page because someone asked about you — and blocking the last kind removes you from answers that were sending you visitors. Robots.txt controls exist for the providers that document them. Decide per category, with your own traffic data in front of you.',
        },
        {
          question: 'How accurate is user-agent detection for AI traffic?',
          answer:
            'It is honest self-identification, not proof. The major providers do send stable user-agent tokens, but anyone can copy a string, and the token list changes as providers rename agents and launch new ones. Treat user-agent matching as the baseline tier, store the raw user-agent with every event so you can re-classify later, and add IP-range or reverse-DNS verification for the providers that publish them when spoofing matters to you.',
        },
      ]}
      ctaTitle="Do you know what AI systems are doing with your site?"
      ctaBody="The agent-readiness audit answers that with your own data: which AI crawlers and referrals are reaching you, what they can and can’t get to, and what to fix first. $3,000 fixed, one to two weeks, credited toward any follow-on work."
      ctaEmailSubject="Agent-Readiness Audit — AI traffic"
      ctaSource="ai-traffic-article"
    >
      <p>
        AI systems touch your site in two ways, and standard analytics
        misses most of both. I built a detection SDK at ZeroClick that
        classified this traffic at the edge and fed an analytics pipeline.
        Several of the sharpest lessons came from things that broke and got
        fixed. This article is the version I wish I&rsquo;d had on day one:
        where the traffic is observable, which signals to trust in what
        order, and the instrumentation rules that are cheap to follow up
        front and expensive to retrofit.
      </p>

      <h2>Crawls and referrals are opposite events</h2>
      <p>
        Two categories get lumped together as &ldquo;AI traffic.&rdquo; In
        the first, a machine fetches your page — to train on it, to index
        it, or to answer a question someone just asked. In the second, a
        human clicks a citation link inside an AI product and lands on your
        site. Same URL, opposite implications. A crawl means your content
        is being consumed without a visit. A referral means an AI product
        is sending you people. Everything downstream — content strategy,
        access policy, whether to celebrate or worry — depends on keeping
        the two apart.
      </p>
      <p>
        One naming trap from experience: my SDK first labeled the machine
        case <code>origin</code>. Bad choice. In a library that lives at
        the edge and reads headers, &ldquo;origin&rdquo; collides with the
        HTTP Origin header and with CDN-origin terminology, and the
        ambiguity caused enough confusion that I renamed it to{' '}
        <code>crawl</code>. Pick unambiguous names for the taxonomy before
        it reaches a dashboard.
      </p>

      <h2>Where you can observe it</h2>
      <p>
        This is the part most teams get wrong. Client-side analytics tags
        require JavaScript execution, and crawlers do not run your
        JavaScript — so a JS tag can only ever see the referral half. At
        the other end, CDN caching means a crawler&rsquo;s fetch may be
        served from cache and never reach your origin server, so origin
        request logs miss traffic too. The reliable observation point is
        the layer every request passes through: edge middleware or the CDN
        itself. My SDK started with a client-side script-tag install path.
        We abandoned it once the numbers made the blind spot obvious.
      </p>
      <p>
        Running at the edge imposes constraints worth knowing before you
        build: worker-style runtimes want zero dependencies, Web Crypto
        (<code>crypto.subtle</code>) rather than Node&rsquo;s crypto
        module, and code that tolerates being cancelled mid-request.
      </p>

      <h2>The signals, in precedence order</h2>
      <ol>
        <li>
          <strong>Campaign parameters on citation links.</strong> Some
          providers append a source parameter to the links they cite.
          Match these exactly — never by substring — so a hostile value
          like a lookalike domain can&rsquo;t pass.
        </li>
        <li>
          <strong>The Referer header.</strong> Present when a human clicks
          through from an AI product&rsquo;s web interface. Substring
          matching on the header is spoofable — <code>chatgpt.com</code>{' '}
          as a substring also matches a hostile domain that merely contains
          it — so parse the URL and compare the host.
        </li>
        <li>
          <strong>User-agent patterns.</strong> The only signal crawls
          give you. Self-declared and copyable, but the baseline every
          provider supports.
        </li>
      </ol>
      <p>
        The ordering reflects a tradeoff I learned the fast way. The first
        version of my SDK relied on campaign parameters alone. It needed
        Referer support within a day. Parameter tagging is controlled by
        the AI provider, and a provider can change or drop it unilaterally
        — your attribution goes dark without warning. Referer is
        browser-controlled and harder to switch off centrally, but it gets
        stripped by referrer policies and in-app browsers. Use both, in
        that order, and record which one fired.
      </p>

      <h2>Rebuild the URL before you read it</h2>
      <p>
        At the edge you usually sit behind a proxy, and the request URL
        your code sees carries the proxy&rsquo;s host and protocol rather
        than the real ones. Rebuild the URL from the forwarded host and
        protocol headers, and handle comma-separated values — chained
        proxies append, so the header may read{' '}
        <code>https,http</code>. This matters more than it looks: the
        query string carries your campaign parameters, and if URL
        reconstruction is wrong, referral attribution doesn&rsquo;t error.
        It silently reads as zero.
      </p>

      <h2>Signature lists decay</h2>
      <p>
        Whatever user-agent list you start from is a snapshot. Provider
        agent names change, new agents appear, and some published tokens
        are robots.txt controls rather than user agents at all — matching
        those as user-agents classifies nothing. Two design consequences.
        First, keep the pattern list updatable separately from the code;
        my SDK compiled the signatures into the library, which turned
        every pattern update into a release and a customer upgrade.
        Second, verify current agent names against each provider&rsquo;s
        own documentation rather than trusting a blog snapshot — including
        this one. What stays stable is the category structure: training
        crawlers, search indexers, and user-triggered fetches that
        retrieve a page because a person asked about it. Classify into
        those buckets and let the token list churn underneath.
      </p>

      <h2>Two rules that are cheap now and expensive later</h2>
      <ul>
        <li>
          <strong>Emit an event for non-AI traffic too.</strong> A
          detection library&rsquo;s instinct is to report positives. Mine
          did, until someone asked what percentage of traffic was AI and
          the answer was uncomputable — no denominator. Send an explicit
          null classification for ordinary pageviews from day one.
        </li>
        <li>
          <strong>Store the raw user-agent alongside your verdict.</strong>{' '}
          When your patterns improve — and they will — the raw string is
          the only thing that lets you re-classify history instead of
          starting your dataset over.
        </li>
      </ul>

      <h2>Most of the work is filtering, not detecting</h2>
      <p>
        In my SDK, the filtering module grew to roughly six times the size
        of the detection module. Every page a human loads triggers a swarm
        of requests that are not pageviews: static assets, hashed bundle
        files, framework prefetches, API calls. Left unfiltered, they
        drown the signal — one human landing can produce many prefetch
        requests that each look like a separate referral, inflating your
        counts by the prefetch factor. You need layered filters for asset
        extensions, bundler hash patterns, framework internals, API paths,
        and prefetch headers, plus deduplication for the prefetch case.
      </p>
      <p>
        Two cautions. Don&rsquo;t let filtering run ahead of detection in
        a way that collapses &ldquo;not worth recording&rdquo; into
        &ldquo;not AI&rdquo; — those are different verdicts and you&rsquo;ll
        want to tell them apart when the numbers look wrong. And
        don&rsquo;t blanket-filter non-HTML paths, because that discards
        the exact files agents ask for: <code>llms.txt</code>,{' '}
        <code>robots.txt</code>, sitemaps, and markdown docs are AI
        traffic, not noise.
      </p>

      <h2>Verification, and what pattern matching can&rsquo;t do</h2>
      <p>
        Everything above is deterministic string matching, and a
        determined spoofer can defeat it. The next tier is verification:
        several providers publish the IP ranges their crawlers use, and
        some support reverse-DNS confirmation. That work belongs on the
        server, not in a client-side library — checking an IP against
        published ranges, holding reputation across requests, and scoring
        confidence all need state and context a stateless edge function
        doesn&rsquo;t have. My SDK stayed deterministic by design and left
        scoring to the pipeline behind it. One more boundary to know:
        instrumentation that only watches GET requests misses agents that
        POST to your endpoints, which matters more each year as agents act
        rather than just read.
      </p>
      <p>
        The summary I&rsquo;d give a past version of myself: observe at
        the edge, classify crawl versus referral with signals in
        precedence order, keep the denominator and the raw evidence, spend
        real design effort on filtering, and treat every signature list —
        including this article&rsquo;s framing — as something to verify
        against provider documentation before you rely on it.
      </p>
    </ArticleLayout>
  );
}
