import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';
import { ConfigVsCodeDiagram } from '@/components/diagrams/config-vs-code';

export const metadata: Metadata = {
  title: 'Config, DSL, or Code: Structuring Dozens of Third-Party Integrations',
  description:
    'Hardcode each integration, let a model generate it at runtime, build a step DSL, or run sandboxed code behind a fixed contract? Two of those were tried and abandoned on a real agent-provisioning system. The fourth held up.',
};

export default function IntegrationConfigVsCodePage() {
  return (
    <ArticleLayout
      title="Fifty integrations are coming. Config, DSL, or code?"
      description="Four ways to represent third-party integrations an agent executes. Two failed on a real system. The fourth, a split of config and sandboxed code, held up."
      datePublished="2026-07-25"
      dateModified="2026-07-28"
      slug="/ai-agent-enablement/integration-config-vs-code/"
      byline="I led agent-provisioning and AI-traffic engineering at ZeroClick"
      faq={[
        {
          question:
            'Should I let an LLM write my integrations at runtime?',
          answer:
            'No. Runtime generation puts a non-deterministic step in your execution path: the same request can produce different steps, you pay model cost and latency on every call, and there’s no artifact to review or diff. Use the model at authoring time instead. Generate a candidate integration from the provider’s docs, have a human review it, and freeze it. You keep the authoring speed and lose the runtime risk.',
        },
        {
          question: 'When is a declarative DSL the right answer?',
          answer:
            'When the thing you’re describing is uniform across providers. Authentication is a good example: mode, endpoints, credentials, scopes, and PKCE cover nearly every provider, so config works. Setup workflows aren’t uniform. Real ones need polling loops, conditionals, generated credentials, and retries, and a DSL that grows those features becomes a programming language with worse tooling. Split the problem: config for the standardized part, code for the rest.',
        },
        {
          question:
            'How do non-engineers add an integration in a code-based model?',
          answer:
            'Through an authoring surface rather than a repo checkout. An internal tool with a code editor per lifecycle hook, a preview that renders exactly what production renders, and a test harness that runs the lifecycle through hand-over and follow-up lets a technical operator or a partner’s engineer author an integration without touching your codebase. The fixed contract is what keeps their code inside guardrails: a handful of injected primitives and named lifecycle hooks.',
        },
        {
          question: 'How do I test integrations against real providers?',
          answer:
            'Run the lifecycle, including the human step. An integration that provisions a resource, waits for it to become healthy, asks the user a question mid-flow, and hands the result over has failure modes a unit test won’t reach. Build a harness that executes provision, hand-over, and follow-up end to end against a sandbox or test account, and make the interactive prompt part of the test run rather than something you stub out. Teardown can stay automatic: ours ran on the platform’s expiry timer, so the harness’s job was to confirm it fired afterward, not to script it.',
        },
      ]}
      ctaTitle="Deciding how your agent layer should execute integrations?"
      ctaBody="The agent-readiness audit is $3,000, fixed. I evaluate your integration architecture, your codebase, and your workflow through an agent's eyes, run a live pilot on your actual code, and hand you a sequenced plan. The fee is credited toward any follow-on work."
      ctaEmailSubject="Agent-Readiness Audit: integration architecture"
      ctaSource="integration-shape-article"
    >
      <p>
        Say you support ten third-party services today and the roadmap
        says fifty. Each provider has its own setup dance: create a
        resource, wait for it to become ready, mint a credential,
        register a callback. An agent or automation layer has to execute
        every one of them reliably, without an engineer watching.
      </p>
      <p>
        Before you write the first integration, you have to decide how
        integrations are expressed. The candidates are hardcoded
        modules, model-generated steps, a declarative DSL (a small step
        language of your own design), and sandboxed code behind a fixed
        contract. That choice sets your maintenance cost and your review
        story. It also decides whether anyone outside the core team can
        ever add a provider.
      </p>
      <p>
        I have direct evidence on this decision. At ZeroClick I
        originated and led an agent auto-provisioning system where each
        supported third-party service had an integration definition an
        agent could execute. The agent provisioned real accounts and
        credentials on real providers. We demoed it to partners and
        advertisers, and it shaped the company&rsquo;s subsequent product
        direction.
      </p>
      <p>
        Before the design that held up, we built and abandoned two
        others. The dead ends are documented, and they map onto the
        options every team weighs.
      </p>

      <h2>Option 1: hardcode each integration</h2>
      <p>
        Hardcoding means a module per provider, written by your
        engineers, living in your repo.{' '}
        <strong>
          This is the right answer more often than architecture
          discussions admit.
        </strong>{' '}
        If you have five providers, they change rarely, and your team
        owns all of them, hardcoding gives you full language power,
        normal code review, normal tests, and zero novel infrastructure.
      </p>
      <p>It stops working on two axes.</p>
      <ul>
        <li>
          The first is count. At dozens of providers, every addition is
          an engineering ticket, and integration work crowds out product
          work.
        </li>
        <li>
          The second is authorship. The people who know a
          provider&rsquo;s setup quirks are often outside your team,
          whether that&rsquo;s a partner&rsquo;s engineers, a solutions
          team, or an operator, and a hardcoded model gives them no way
          in short of a pull request to your codebase.
        </li>
      </ul>

      <h2>Option 2: generate the integration at call time</h2>
      <p>
        This is the tempting one. Providers already publish setup
        documentation, so why not let a model read the docs and produce
        the integration when a request arrives? You&rsquo;d have no
        integration catalog to maintain at all.
      </p>
      <p>
        We tried it and we killed it. Ours was a retrieval pipeline over
        provider documentation, with the model generating the
        integration on the fly. The documented reasons for the kill were
        non-determinism, meaning the same request produced different
        steps on different runs, and cost, because every execution paid
        for model calls and their latency.
      </p>
      <p>
        The deeper problem generalizes past our case.{' '}
        <strong>
          There is no artifact to review, to diff, or to point to when a
          provisioning run misbehaves at 2 a.m.
        </strong>{' '}
        You&rsquo;ve substituted an unreviewable step for a reviewable
        one, in the execution path, against third-party systems that
        create real resources.
      </p>
      <p>
        The salvageable part is the authoring speed. Generate a
        candidate integration from the provider&rsquo;s docs at
        authoring time, have a human review it, freeze it, and execute
        the frozen artifact in production.
      </p>

      <h2>Option 3: a declarative step DSL</h2>
      <p>
        Our second attempt was declarative steps with variable
        interpolation: executable instructions with tool hints and{' '}
        <code>{'${var}'}</code> substitution, run by an executor. It
        handled the first few integrations well. Simple sequences of API
        calls with values threaded between them fit a step list.
      </p>
      <p>
        Everything&rsquo;s good until a real provider arrives. Our
        Supabase integration ran about 150 lines. It polled the provider
        until the project reported a healthy status, generated a
        cryptographically random database password, enumerated the
        account&rsquo;s organizations, then looked up API keys by name
        after creation. A step list expresses none of that.
      </p>
      <p>Here&rsquo;s the shape of that logic, so the gap is concrete:</p>
      <Code lang="js">{`// The setup logic one real provider needed. Try writing this as steps.
async function provision({ request, context }) {
  const dbPassword = generatePassword(); // 24 crypto-random bytes
  const [org] = await request('/v1/organizations');

  const project = await request('/v1/projects', {
    method: 'POST',
    body: {
      name: context.resourceName,
      organization_id: org.id,
      db_pass: dbPassword,
    },
  });

  // The project isn't usable the moment the create call returns.
  // A step executor fires the next request immediately; this waits.
  for (let attempt = 0; attempt < 60; attempt++) {
    const { status } = await request('/v1/projects/' + project.id);
    if (status === 'ACTIVE_HEALTHY') break;
    await sleep(5000);
  }

  // Keys exist only after creation, and you find them by name.
  const keys = await request('/v1/projects/' + project.id + '/api-keys');
  const anonKey = keys.find((key) => key.name === 'anon');

  return { projectId: project.id, dbPassword, anonKey: anonKey.api_key };
}`}</Code>
      <p>
        Without the polling loop, the agent hands the user a project URL
        that isn&rsquo;t live yet and keys fetched from a half-created
        project. So you add a polling keyword to the DSL, then a
        conditional keyword, then retries, then generated values. Each
        addition is reasonable on its own. The sum is a programming
        language with no debugger, no ecosystem, and tooling only your
        team maintains.
      </p>
      <p>
        <strong>
          That&rsquo;s why we killed the DSL: real provisioning needs
          loops, conditionals, and polling that a step format
          can&rsquo;t express.
        </strong>
      </p>

      <h2>Option 4: split by what is standardized</h2>
      <p>
        The design that held up starts from an observation about the
        problem rather than a preference about representation.
        Authentication is standardized across providers: the variation
        across OAuth flows, API keys, and token endpoints is finite. The
        setup dance is not standardized. Every provider&rsquo;s is
        different, and the differences are structural.
      </p>
      <ConfigVsCodeDiagram />
      <p>
        So the integration definition split in two.{' '}
        <strong>
          Authentication became declarative configuration, and the setup
          logic stayed code: plain JavaScript, executed server-side in a
          sandbox, behind a fixed lifecycle contract.
        </strong>{' '}
        A sandbox here means an isolated runtime that sees only the
        capabilities the platform injects.
      </p>
      <p>
        The auth side fits a handful of fields: the auth mode, authorize
        and token endpoints, client credentials, scopes, PKCE (the
        proof-of-possession extension that hardens the OAuth code flow),
        and how the token request itself is authenticated.
      </p>
      <Code lang="ts">{`// One record of auth config drives one shared OAuth implementation.
type AuthConfig = {
  authMode: 'oauth' | 'api_key';
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  usePkce: boolean;
  // Providers split on whether the token request authenticates with
  // a Basic header or credentials in the POST body. Guess wrong and
  // the token endpoint returns 401 invalid_client.
  tokenAuthMethod: 'client_secret_basic' | 'client_secret_post';
};`}</Code>
      <p>
        No per-provider auth code existed anywhere in the system. That
        last field is the whole argument for config in miniature: the
        variation is finite, so it fits a column instead of a code
        branch.
      </p>
      <p>
        The setup logic is expressed as the same four lifecycle hooks
        for every integration: provision the resource, hand it over to
        the user, follow up after hand-over, and tear it down. Provision
        is mandatory. The other three are optional, and an integration
        implements the ones its lifecycle needs. The hooks close over a
        small injected API, and that&rsquo;s the entire interface.
      </p>
      <Code lang="ts">{`// The whole interface between an integration and the platform.
type Integration = {
  provision(api: HookApi): Promise<ProvisionResult>; // required
  claim?(api: HookApi): Promise<ClaimResult>; // hand over to the user
  postClaim?(api: HookApi): Promise<void>; // follow up after hand-over
  deprovision?(api: HookApi): Promise<void>; // tear it down
};

type HookApi = {
  token: string; // provider access token
  context: ActivationContext; // who this run is for, and what it makes
  request: SandboxFetch; // outbound HTTP, egress-controlled
  prompt: PromptFn; // ask the user a question mid-flow
};`}</Code>
      <p>
        The uniformity is what pays. The platform can run, monitor,
        expire, and clean up any integration without knowing what it
        does, because the lifecycle shape is identical across all of
        them. The code inside a hook can be as gnarly as the provider
        demands. The 150-line Supabase recipe lives comfortably in a
        provision hook, and none of that gnarl leaks into platform
        machinery.
      </p>

      <h2>The operational consequences</h2>
      <p>
        The representation choice is the visible decision. What made the
        system workable day to day was a set of practices around it.
      </p>
      <ul>
        <li>
          <strong>Keep the injected surface narrow, and treat it as the
          contract.</strong> Our hooks received four platform
          primitives: a token, a context object, a request function,
          and a way to ask the user a question mid-flow. Integrations
          that drew on a pooled account also received that
          account&rsquo;s credentials. Those primitives, plus standard
          JavaScript built-ins, are the whole capability grant, which is
          what makes the code sandboxable, auditable, and portable
          across integrations.
        </li>
        <li>
          <strong>Build an authoring surface.</strong> Code-as-integration
          only opens authorship beyond your team if authors get tooling.
          We built an internal tool with a code editor per lifecycle
          hook, a preview that renders exactly what production renders
          (same encoding, byte for byte), and a test harness that runs
          the lifecycle through hand-over and follow-up, including the
          human-input step. Teardown needed no harness step, because it
          ran on the platform&rsquo;s own expiry timer. Without this
          tooling, option 4 collapses back into option 1.
        </li>
        <li>
          <strong>Degrade gracefully.</strong> An integration that&rsquo;s
          missing, incomplete, or failing to load should fall back to the
          ordinary experience rather than erroring. Our system had three
          separate fallback levels: definition absent, metadata fetch
          failed, and required fields incomplete. Every one of them
          rendered the normal path. Without the outer guard, one broken
          integration would have taken down every item in the response.
          Instead, users saw a working product, and only the enhancement
          disappeared.
        </li>
        <li>
          <strong>Version and review integration code like code.</strong>{' '}
          It is code, and it runs on your infrastructure, so it gets
          diffs, review, and an audit trail. This is the concrete
          advantage over option 2, and it only exists if your process
          treats the artifacts accordingly.
        </li>
        <li>
          <strong>Take the security posture seriously.</strong> Executing
          integration code written by partners on your servers is a
          distinct threat model, and the sandbox boundary demands its own
          controls: what the injected request function may reach, what
          the code may log, and what credentials it may see. That&rsquo;s
          a separate article&rsquo;s worth of lessons.
        </li>
      </ul>
      <p>Here&rsquo;s the decision in one pass.</p>
      <ul>
        <li>
          Hardcode while the count is small and your team owns every
          provider.
        </li>
        <li>
          Never generate in the execution path. Generate at authoring
          time, review, and freeze.
        </li>
        <li>
          Reserve declarative formats for the parts of the problem that
          are uniform, like authentication.
        </li>
        <li>
          For the setup logic itself, use real code in a sandbox behind
          a fixed lifecycle contract, and invest in the authoring,
          fallback, and review practices that make it operable.
        </li>
      </ul>
    </ArticleLayout>
  );
}
