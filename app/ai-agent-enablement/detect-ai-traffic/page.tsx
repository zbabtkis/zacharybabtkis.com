import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';

export const metadata: Metadata = {
  title: 'How to Detect AI Crawlers and LLM Referral Traffic',
  description:
    'AI crawlers don’t run your analytics JavaScript, and CDN caching hides them from origin logs. This guide covers where AI traffic is observable, which signals to trust, and the instrumentation rules that make the numbers usable, from the engineer who built an edge detection SDK.',
};

export default function DetectAiTrafficPage() {
  return (
    <ArticleLayout
      title="How to tell humans, AI crawlers, and AI agents apart in your traffic"
      description="This guide covers where AI traffic is observable, which signals to trust in what order, and the instrumentation rules that make the measurements usable."
      datePublished="2026-07-25"
      dateModified="2026-07-28"
      slug="/ai-agent-enablement/detect-ai-traffic/"
      byline="I led agent-provisioning and AI-traffic engineering at ZeroClick"
      faq={[
        {
          question: 'Can I detect ChatGPT traffic in Google Analytics?',
          answer:
            'You can see part of it. A human who clicks a citation link runs your JavaScript like any visitor, and agentic browsers such as ChatGPT agent mode or Claude in Chrome execute JavaScript too. What client-side tools can’t see is the HTTP fetchers: GPTBot or ClaudeBot fetching your page to answer a question never executes your analytics tag. Detecting fetchers takes server or edge instrumentation.',
        },
        {
          question: 'How do I tell an AI crawler from an AI referral?',
          answer:
            'The two differ by signal type. Referrals arrive with browser evidence: a Referer header from the AI product’s domain, or campaign parameters the provider appended to the citation link. Crawls identify themselves by user-agent, and the request comes from the provider’s infrastructure rather than a person’s browser. Classify with campaign parameters first, then Referer, then user-agent, and record which signal fired.',
        },
        {
          question: 'Should I block AI crawlers?',
          answer:
            'Measure before deciding. The crawlers fall into distinct categories: training crawlers, search indexers, and user-triggered fetches that retrieve your page because someone asked about you. Block that last kind and you’ve removed yourself from answers that were sending you visitors. Robots.txt controls exist for the providers that document them. Decide per category, with your own traffic data in front of you.',
        },
        {
          question: 'How accurate is user-agent detection for AI traffic?',
          answer:
            'It is self-declared identification rather than proof. The major providers do send stable user-agent tokens, but anyone can copy a string, and the token list changes as providers rename agents and launch new ones. Treat user-agent matching as the baseline tier, store the raw user-agent with every event so you can re-classify later, and add IP-range or reverse-DNS verification for the providers that publish them when spoofing matters to you.',
        },
      ]}
      ctaTitle="Do you know what AI systems are doing with your site?"
      ctaBody="The agent-readiness audit answers that with your own data: which AI crawlers and referrals are reaching you, what they can and can't get to, and what to fix first. $3,000 fixed, one to two weeks, credited toward any follow-on work."
      ctaEmailSubject="Agent-Readiness Audit: AI traffic"
      ctaSource="ai-traffic-article"
    >
      <p>
        Your analytics say AI traffic barely exists. Meanwhile GPTBot and
        ClaudeBot fetch your content every day, and a growing share of
        your visitors arrive from answers those fetches fed. Both
        readings come from the same site. The gap is instrumentation: AI
        systems touch your site in two ways, and standard analytics
        misses most of both.
      </p>
      <p>
        I built a detection SDK at ZeroClick that classified this
        traffic at the edge and fed an analytics pipeline, and several
        of the sharpest lessons came from things that broke. This
        article is the version I wish I&rsquo;d had on day one: where
        the traffic is observable, which signals to trust in what order,
        and the instrumentation rules that are cheap up front and
        expensive to retrofit.
      </p>

      <h2>Crawls and referrals are opposite events</h2>
      <p>
        Two categories get lumped together as &ldquo;AI traffic,&rdquo;
        and they mean opposite things. In the first, a machine fetches
        your page to train on it, to index it, or to answer a question
        someone just asked. In the second, a human clicks a citation
        link inside an AI product and lands on your site.{' '}
        <strong>
          A crawl means your content is being consumed without a visit,
          and a referral means an AI product is sending you people.
        </strong>{' '}
        Everything downstream depends on keeping the two apart: content
        strategy, access policy, whether to celebrate or worry.
      </p>
      <p>
        A third category is growing fast enough to need its own bucket.
        Agentic browsers such as ChatGPT&rsquo;s agent mode,
        Perplexity&rsquo;s Comet, and Claude in Chrome drive a real
        browser on a user&rsquo;s behalf. They execute JavaScript and
        fire analytics tags, so they look like visitors while a machine
        does the clicking. Detect them separately: by user agent where
        the product declares one, by behavior where it doesn&rsquo;t.
      </p>
      <p>
        Quick aside on naming: my SDK first labeled the machine case{' '}
        <code>origin</code>, and that was a mistake. In a library that
        lives at the edge and reads headers, the word collides with the
        HTTP Origin header and with CDN-origin terminology. I renamed it
        to <code>crawl</code> the same day, before the first release.
        Pick unambiguous names before your taxonomy reaches a dashboard.
      </p>

      <h2>Where you can observe it</h2>
      <p>
        Sites instrumented with only a JavaScript analytics tag report
        near-zero AI crawl traffic while their content is being fetched
        constantly. The tag requires JavaScript execution, and HTTP
        fetchers like GPTBot and ClaudeBot never run your JavaScript. A
        client-side tag sees referrals and agentic browsers and misses
        fetchers entirely.
      </p>
      <p>
        Origin logs have their own blind spot. CDN caching means a
        crawler&rsquo;s fetch may be served from cache and never reach
        your origin server at all. So where can you watch from?{' '}
        <strong>
          The one reliable observation point is the layer every request
          passes through: edge middleware or the CDN itself.
        </strong>
      </p>
      <p>
        The product my SDK fed briefly offered a script-tag install
        path during onboarding. The SDK itself was edge-side from its
        first spec, because a script tag can&rsquo;t see fetchers. If
        your instrumentation runs in the page, the machine half of your
        AI traffic doesn&rsquo;t exist in your data.
      </p>
      <p>
        Running at the edge imposes constraints worth knowing before you
        build. Worker-style runtimes want zero dependencies, Web Crypto
        (<code>crypto.subtle</code>) rather than Node&rsquo;s crypto
        module, and code that tolerates being cancelled mid-request.
      </p>

      <h2>The signals, in precedence order</h2>
      <p>
        On day one, my SDK classified referrals by campaign parameters
        alone, and referral counts from every AI product except ChatGPT
        read as zero. The other products appended no{' '}
        <code>utm_source</code> to their links. Referer support went in
        the next day. The ordering below is what that taught me.
      </p>
      <ol>
        <li>
          Campaign parameters on citation links come first. Some
          providers append a source parameter to the links they cite.
          Match these by exact equality, never by substring, so a
          lookalike value can&rsquo;t pass.
        </li>
        <li>
          The Referer header comes second. It shows up when a human
          clicks through from an AI product&rsquo;s web interface.
          Parse it as a URL and compare the host, because a substring
          check accepts any hostile domain that merely contains the
          string.
        </li>
        <li>
          User-agent patterns come last. They are the only signal crawls
          give you. The string is self-declared and copyable, but
          it&rsquo;s the baseline every provider supports.
        </li>
      </ol>
      <p>
        <strong>
          Classify with campaign parameters first, then Referer, then
          user-agent, and record which signal fired.
        </strong>{' '}
        Both referral signals are provider-controlled. A provider can
        drop its campaign parameters unilaterally, and one
        Referrer-Policy header on its domain silences the Referer for
        every click. They fail independently, though, so use both.
      </p>
      <p>
        The Referer rule is one my own code broke. My SDK
        substring-matched the raw header against values like{' '}
        <code>chatgpt.com</code>, so a referer of{' '}
        <code>https://chatgpt.com.evil.example/</code> would pass the
        check and get classified as an OpenAI referral. The exact-match
        discipline held for campaign parameters and never made it to the
        Referer path. Here&rsquo;s the shape both checks should take:
      </p>
      <Code lang="ts">{`type ReferralMatch = { provider: string; signal: 'utm' | 'referer' };

function classifyReferral(
  url: URL,
  referer: string | null,
): ReferralMatch | null {
  // Campaign parameters: exact equality only. A substring
  // check lets a lookalike value pass.
  const utmSource = url.searchParams.get('utm_source')?.toLowerCase();
  if (utmSource === 'chatgpt.com') {
    return { provider: 'openai', signal: 'utm' };
  }

  // Referer: parse and compare the host. Substring matching
  // accepts https://chatgpt.com.evil.example/ as OpenAI.
  if (referer) {
    let host: string;
    try {
      host = new URL(referer).hostname;
    } catch {
      return null;
    }
    if (host === 'chatgpt.com' || host.endsWith('.chatgpt.com')) {
      return { provider: 'openai', signal: 'referer' };
    }
  }

  return null;
}`}</Code>

      <h2>Rebuild the URL before you read it</h2>
      <p>
        At the edge you usually sit behind a proxy, and the request URL
        your code sees carries the proxy&rsquo;s internal host and
        protocol rather than the real ones. Mine broke behind a Shopify
        storefront&rsquo;s proxy. The query string carries your campaign
        parameters, so a misread URL means the source parameter never
        matches.{' '}
        <strong>
          Wrong URL reconstruction doesn&rsquo;t produce an error, only
          a referral count that reads as zero.
        </strong>
      </p>
      <p>
        Rebuild the URL from the forwarded host and protocol headers,
        and handle comma-separated values, because chained proxies
        append and the header can read <code>https,http</code>. My own
        SDK handled the comma case in only one of its two runtime paths.
        That&rsquo;s the kind of gap an audit finds and error logs never
        will.
      </p>
      <Code lang="ts">{`// req.url behind a proxy carries the proxy's internal host and
// protocol. Rebuild from the forwarded headers before reading
// campaign parameters off the query string.
function requestUrl(req: Request): URL {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host');
  if (!host) return url;

  // Chained proxies append, so the header can read "https,http".
  const proto =
    req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || 'https';

  return new URL(url.pathname + url.search, \`\${proto}://\${host}\`);
}`}</Code>

      <h2>Signature lists decay</h2>
      <p>
        Google AI crawl counts can read as zero while Google&rsquo;s
        fetches hit your site all day. My SDK shipped this bug. Its
        signature list matched Google-Extended as a user agent, and
        Google-Extended is a robots.txt control token with no user
        agent of its own. That signature could never match a real
        request.
      </p>
      <p>
        Whatever user-agent list you start from is a snapshot. Provider
        agent names change, new agents appear, and published token
        lists mix real user-agent strings with robots.txt-only
        controls. Two design consequences follow.
      </p>
      <ul>
        <li>
          Keep the pattern list updatable separately from the code. My
          SDK compiled the signatures into the library, which turned
          every pattern update into a release and a customer upgrade.
        </li>
        <li>
          Verify current agent names against each provider&rsquo;s own
          documentation rather than a blog snapshot, including this
          one.
        </li>
      </ul>
      <p>
        <strong>
          What stays stable is the category structure: training
          crawlers, search indexers, and user-triggered fetches.
        </strong>{' '}
        The last kind retrieves a page because a person just asked
        about it. Classify into those buckets and let the token list
        churn underneath.
      </p>

      <h2>Two rules that are cheap now and expensive later</h2>
      <p>
        <strong>
          Emit an event for non-AI traffic too, and store the raw
          user-agent with every verdict.
        </strong>{' '}
        Both rules cost a few lines on day one. Skipping either costs
        you the dataset later.
      </p>
      <ul>
        <li>
          Send an explicit null classification for ordinary pageviews.
          My SDK left the verdict field off non-AI events, and the gap
          surfaced when someone asked what percentage of our traffic
          was AI. Absolute counts have no denominator.
        </li>
        <li>
          Store the raw user-agent alongside your verdict. Your
          patterns will improve, and the raw string is the only thing
          that lets you re-classify history instead of starting the
          dataset over.
        </li>
      </ul>
      <Code lang="ts">{`const detection = detectAi(request); // null when nothing matched

track({
  url: url.href,
  // "Not AI" is a verdict. An absent field is not.
  ai_detection: detection ?? { type: null, provider: null },
  // The raw string lets you re-classify history later.
  user_agent: request.headers.get('user-agent'),
});`}</Code>

      <h2>Most of the work is filtering</h2>
      <p>
        One human landing from ChatGPT can register as several
        referrals, because framework prefetches carry the same URL and
        referer. Every page a human loads triggers a swarm of requests
        that aren&rsquo;t pageviews: static assets, hashed bundle
        files, framework internals, API calls. Left unfiltered, they
        drown the signal.
      </p>
      <p>
        <strong>
          In my SDK, the filtering module grew to roughly six times the
          size of the detection module.
        </strong>{' '}
        Detecting AI traffic was the small problem. Deciding which
        requests count as page visits was the big one. The filters
        ended up layered.
      </p>
      <ul>
        <li>Extension lists catch static assets.</li>
        <li>
          A hash pattern catches bundler output like{' '}
          <code>/app.3f2a9c1b.js</code>.
        </li>
        <li>Path lists catch framework internals and API routes.</li>
        <li>
          Prefetch headers from Next.js, Remix, and the other
          frameworks mark speculative navigations, which get suppressed
          rather than counted.
        </li>
      </ul>
      <p>
        The first caution: don&rsquo;t let filtering run ahead of
        detection in a way that collapses &ldquo;not worth
        recording&rdquo; into &ldquo;not AI.&rdquo; Those are different
        verdicts, and you&rsquo;ll want to tell them apart when the
        numbers look wrong.
      </p>
      <p>
        The second caution is a mistake my own filter makes. Its
        asset-extension list includes txt, xml, md, and json, so{' '}
        <code>robots.txt</code>, <code>llms.txt</code>, sitemaps, and
        markdown docs get dropped unless the consumer opts them back
        in. Those are the files agents ask for. They&rsquo;re AI
        traffic rather than noise.
      </p>

      <h2>Verification, and what pattern matching can&rsquo;t do</h2>
      <p>
        A spoofer sending ChatGPT-User in its user-agent is
        indistinguishable from OpenAI at the string-matching tier.
        Everything above is deterministic. So what do you do about
        spoofing? The next tier is verification: several providers
        publish the IP ranges their crawlers use, and some support
        reverse-DNS confirmation.
      </p>
      <p>
        <strong>
          Verification belongs on the server, behind the deterministic
          edge layer.
        </strong>{' '}
        Checking an IP against published ranges, holding reputation
        across requests, and scoring confidence all need state a
        stateless edge function doesn&rsquo;t have. My SDK stayed
        deterministic by design and left scoring to the pipeline behind
        it.
      </p>
      <p>
        One more boundary is worth knowing, because it&rsquo;s a limit
        of my own code too. My SDK only tracked GET requests, so an
        agent that POSTs to your endpoints was invisible to it. That
        blind spot matters more each year as agents act rather than
        read.
      </p>
      <p>
        If I could send a note back to myself on day one, it would say
        this. Observe at the edge. Classify crawl versus referral with
        signals in precedence order. Keep the denominator and the raw
        evidence. Spend real design effort on filtering. And treat
        every signature list, including this article&rsquo;s, as
        something to verify against provider documentation, because
        mine still carries a signature that can never match.
      </p>
    </ArticleLayout>
  );
}
