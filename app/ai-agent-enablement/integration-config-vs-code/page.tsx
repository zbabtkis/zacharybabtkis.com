import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'Config, DSL, or Code: Structuring Dozens of Third-Party Integrations',
  description:
    'Hardcode each integration, let a model generate it at runtime, build a step DSL, or run sandboxed code behind a fixed contract? Two of those were tried and abandoned on a real agent-provisioning system. The fourth held up.',
};

export default function IntegrationConfigVsCodePage() {
  return (
    <ArticleLayout
      title="Config, DSL, or code: structuring dozens of third-party integrations"
      description="Four ways to represent third-party integrations an agent executes. Two failed on a real system. The fourth, a split of config and sandboxed code, held up."
      datePublished="2026-07-25"
      slug="/ai-agent-enablement/integration-config-vs-code/"
      byline="I led agent-provisioning and AI-traffic engineering at ZeroClick"
      faq={[
        {
          question:
            'Should I let an LLM write my integrations at runtime?',
          answer:
            'No. Runtime generation puts a non-deterministic step in your execution path: the same request can produce different steps, you pay model cost and latency on every call, and there is no artifact to review or diff. Use the model at authoring time instead: generate a candidate integration from the provider’s docs, have a human review it, and freeze it. You keep the authoring speed and lose the runtime risk.',
        },
        {
          question: 'When is a declarative DSL the right answer?',
          answer:
            'When the thing you are describing is uniform across providers. Authentication is a good example: mode, endpoints, credentials, scopes, and PKCE cover nearly every provider, so config works. Setup workflows are not uniform. Real ones need polling loops, conditionals, generated credentials, and retries, and a DSL that grows those features becomes a programming language with worse tooling. Split the problem: config for the standardized part, code for the rest.',
        },
        {
          question:
            'How do non-engineers add an integration in a code-based model?',
          answer:
            'Through an authoring surface rather than a repo checkout. An internal tool with a code editor per lifecycle hook, a preview that renders exactly what production renders, and a test harness that runs the full lifecycle lets a technical operator or a partner’s engineer author an integration without touching your codebase. The fixed contract is what keeps their code inside guardrails: a handful of injected primitives and named lifecycle hooks.',
        },
        {
          question: 'How do I test integrations against real providers?',
          answer:
            'Run the full lifecycle, including the human step. An integration that provisions a resource, waits for it to become healthy, asks the user a question mid-flow, and tears everything down afterward has failure modes a unit test will not reach. Build a harness that executes provision, hand-over, follow-up, and teardown end to end against a sandbox or test account, and make the interactive prompt part of the test run rather than something you stub out.',
        },
      ]}
      ctaTitle="Deciding how your agent layer should execute integrations?"
      ctaBody="The agent-readiness audit is $3,000, fixed. I evaluate your integration architecture, your codebase, and your workflow through an agent's eyes, run a live pilot on your actual code, and hand you a sequenced plan. The fee is credited toward any follow-on work."
      ctaEmailSubject="Agent-Readiness Audit: integration architecture"
      ctaSource="integration-shape-article"
    >
      <p>
        You support ten third-party services today and the roadmap says
        fifty. Each provider has its own setup dance: create a resource,
        wait for it to become ready, mint a credential, register a
        callback. An agent or automation layer has to execute every one of
        them reliably, without an engineer watching. Before you write the
        first integration, you have to decide how integrations are
        expressed: hardcoded modules, model-generated steps, a declarative
        DSL, or sandboxed code behind a fixed contract. That choice
        determines your maintenance cost, your review story, and whether
        anyone outside the core team can ever add a provider.
      </p>
      <p>
        I have direct evidence on this decision. At ZeroClick I originated
        and led an agent auto-provisioning system where each supported
        third-party service had an integration definition an agent could
        execute. The agent provisioned real accounts and credentials on
        real providers. We demoed it to partners and advertisers, and it shaped
        the company&rsquo;s subsequent product direction. Before the design
        that held up, we built and abandoned two others. The dead ends are
        documented, and they map onto the options every team weighs.
      </p>

      <h2>Option 1: hardcode each integration</h2>
      <p>
        A module per provider, written by your engineers, living in your
        repo. This is the right answer more often than architecture
        discussions admit. If you have five providers, they change rarely,
        and engineers on your team own all of them, hardcoding gives you
        full language power, normal code review, normal tests, and zero
        novel infrastructure.
      </p>
      <p>
        It stops working on two axes. Count: at dozens of providers, every
        addition is an engineering ticket, and integration work crowds out
        product work. Authorship: the people who know a provider&rsquo;s
        setup quirks are often outside your team, a partner&rsquo;s
        engineers, a solutions team, an operator. A hardcoded model
        gives them no way in short of a pull request to your codebase.
      </p>

      <h2>Option 2: generate the integration at call time</h2>
      <p>
        The tempting version: providers already publish setup
        documentation, so let a model read the docs and produce the
        integration when a request arrives. No integration catalog to
        maintain at all.
      </p>
      <p>
        We tried a retrieval pipeline over provider documentation, with
        the model generating the integration on the fly, and killed
        it. The documented reasons: non-determinism, meaning the same
        request produces different steps on different runs, and cost,
        because every execution pays for model calls and their latency. The
        deeper problem generalizes past our case. There is no artifact
        to review, to diff, or to point to when a
        provisioning run misbehaves at 2 a.m. You have substituted an
        unreviewable step for a reviewable one, in the execution path,
        against third-party systems that create real resources.
      </p>
      <p>
        The salvageable part is the authoring speed. Generate a candidate
        integration from the provider&rsquo;s docs at authoring time, have
        a human review it, freeze it, and execute the frozen artifact in
        production.
      </p>

      <h2>Option 3: a declarative step DSL</h2>
      <p>
        The second attempt was declarative steps with variable
        interpolation: executable instructions with tool hints and{' '}
        <code>{'${var}'}</code> substitution, run by an executor. It
        handled the first few integrations well. Simple sequences of API
        calls with values threaded between them fit a step list.
      </p>
      <p>
        Then a real provider arrives. One of our integrations, the
        Supabase one, ran a couple hundred lines: poll the
        provider until the project reports a healthy status, generate a
        cryptographically random database password, enumerate the
        account&rsquo;s organizations, then look up API keys by name after
        creation. A step list expresses none of that. So you add a polling
        keyword. Then a conditional keyword. Then retries, then generated
        values. Each addition is reasonable alone, and the sum is a
        programming language with no debugger, no ecosystem, and
        tooling only your team maintains. We killed the DSL for this
        reason: real provisioning needs loops, conditionals, and polling that
        a step format can&rsquo;t express.
      </p>

      <h2>Option 4: split by what is standardized</h2>
      <p>
        The design that held up starts from an observation about the
        problem rather than a preference about representation.
        Authentication is standardized across providers. The variation
        across OAuth flows, API keys, and token endpoints fits a schema. The setup
        dance is not standardized. Every provider&rsquo;s is different,
        and the differences are structural.
      </p>
      <p>
        So the integration definition split in two. Authentication became
        declarative configuration: the auth mode, authorize and token
        endpoints, client credentials, scopes, PKCE, and how the token
        request is authenticated. The setup logic stayed code: plain
        JavaScript, executed server-side in a sandbox, behind a fixed
        lifecycle contract. Every integration implements the same four
        hooks: provision the resource, hand it over to the user, follow up
        after hand-over, and tear it down. The hooks close over a small
        injected API, and that is the entire interface.
      </p>
      <p>
        The uniformity is what pays. The platform can run, monitor, retry,
        and expire any integration without knowing what it does, because
        the lifecycle shape is identical across all of them. The code
        inside a hook can be as gnarly as the provider demands. The
        two-hundred-line polling loop lives comfortably in a hook, and
        none of that gnarl leaks into platform machinery.
      </p>

      <h2>The operational consequences</h2>
      <p>
        The representation choice is the visible decision. What made the
        system workable day to day was a set of practices around it.
      </p>
      <ul>
        <li>
          <strong>Keep the injected surface narrow, and treat it as the
          contract.</strong> Our hooks received a token, a context object,
          a request function, and a way to ask the user a question
          mid-flow. That list is the whole capability grant. Everything the
          integration can do, it does through those primitives, which is
          what makes the code sandboxable, auditable, and portable across
          integrations.
        </li>
        <li>
          <strong>Build an authoring surface.</strong> Code-as-integration
          only opens authorship beyond your team if authors get tooling. We
          built an internal tool with a code editor per lifecycle hook, a
          preview that renders exactly what production renders (same
          encoding, byte for byte), and a test harness that runs the full
          lifecycle including the human-input step. Without this, option 4
          collapses back into option 1.
        </li>
        <li>
          <strong>Degrade gracefully.</strong> An integration that is
          missing, incomplete, or failing to load should fall back to the
          ordinary experience rather than erroring. Our system had three
          separate fallback levels: definition absent, metadata fetch
          failed, and required fields incomplete. Every one of them
          rendered the normal path. Users saw a working product; only the
          enhancement disappeared.
        </li>
        <li>
          <strong>Version and review integration code like code.</strong>{' '}
          Because it is code, and it runs on your infrastructure. It gets
          diffs, review, and an audit trail. This is the concrete advantage
          over option 2, and it only exists if your process treats the
          artifacts accordingly.
        </li>
        <li>
          <strong>Take the security posture seriously.</strong> Executing
          integration code written by partners on your servers is a
          distinct threat model, and the sandbox boundary demands its own
          controls: what the injected request function may reach, what the
          code may log, and what credentials it may see. That is a
          separate article&rsquo;s worth of lessons.
        </li>
      </ul>
      <p>
        The decision in one pass: hardcode while the count is small and
        your team owns every provider. Never generate in the execution
        path; generate at authoring time and freeze. Reserve declarative
        formats for the parts of the problem that are uniform,
        like authentication. For the setup logic itself, use real code in
        a sandbox behind a fixed lifecycle contract, and invest in the
        authoring, fallback, and review practices that make it operable.
      </p>
    </ArticleLayout>
  );
}
