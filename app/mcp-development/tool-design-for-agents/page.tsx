import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';
import { Code } from '@/components/code';

export const metadata: Metadata = {
  title: 'Designing MCP Tools That Models Call Correctly',
  description:
    'Models skip your tools, call them in the wrong order, or mangle the parameters. The fix is in tool design: server instructions, server-side filtering, a two-tool surface, error results, and tool output written as a prompt.',
};

export default function ToolDesignForAgentsPage() {
  return (
    <ArticleLayout
      title="Designing MCP tools that models call correctly"
      description="Server instructions, server-side filtering, two-tool surfaces, and results written as prompts: the design decisions that determine whether a model uses your MCP server."
      datePublished="2026-07-25"
      slug="/mcp-development/tool-design-for-agents/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'How many tools is too many for one MCP server?',
          answer:
            'There’s no hard limit, but selection accuracy drops as the count rises, because every tool description competes for the model’s attention on every turn. A discovery tool plus an execute tool covers a wide range of products. Add a third tool only when it has a distinct job. Steps of one job belong inside a single tool.',
        },
        {
          question: 'Why won’t the model call my tool at all?',
          answer:
            'Usually the server never told the model when it’s relevant. Tool descriptions say what a tool does; server-level instructions say when this server applies. Add concrete trigger situations, meaning the user phrasings that should activate the server, and state the order to call tools in. If the model still skips it, your tool’s description likely overlaps with a built-in capability the model prefers.',
        },
        {
          question: 'Should tool descriptions be written for humans?',
          answer:
            'Write them for the model, and accept that humans will read them too. That means concrete trigger conditions, explicit parameter semantics, and a stated relationship to the other tools on the server (“call this after search_x”). Marketing language and human-oriented API prose are noise to the model and often cause the wrong tool to be picked.',
        },
        {
          question: 'How do I test tool selection?',
          answer:
            'Run realistic prompts against a real model with your server connected, rather than unit tests against the handlers. Check three things separately: does the model pick the server up at all for prompts that should trigger it, does it pick the right tool among several, and does it recover when a tool returns an error result. Each failure has a different fix: instructions, descriptions, and error formatting respectively.',
        },
      ]}
      ctaTitle="Is your MCP server designed for the model that has to call it?"
      ctaBody="I audit MCP servers against these failure modes: whether models pick the server up, pick the right tool, survive your error paths, and can act on your results. Fixed price, $2,000, one week, credited toward any follow-on implementation work."
      ctaEmailSubject="MCP Server Audit"
      ctaSource="tool-design-article"
    >
      <p>
        Your MCP server works in testing. Then you connect it to a real
        model and watch it fail in ways your handlers never see: the
        model ignores the server entirely, calls tools in the wrong
        order, or invents a parameter value that was never on offer.
        None of these are model bugs. Every one of them traces back to a
        design decision you control. What follows is what held up in
        production, drawn from an MCP server I built that let agents set
        up third-party services for a user. That server was demoed to
        partners and advertisers and seeded the company&rsquo;s next
        product direction.
      </p>

      <h2>Server instructions decide whether your tools get called</h2>
      <p>
        Why does a model ignore a server for prompts that should
        obviously trigger it? Usually because nothing told it when the
        server applies. The text that fixes this is the server-level
        instructions field, and it&rsquo;s the most valuable text
        you&rsquo;ll write. Tool descriptions tell the model what a tool
        does once it has already decided your server is relevant. The
        instructions decide that first question. Two things belong there:
        concrete trigger situations, and the order to call your tools in.
        The shape looks like this:
      </p>
      <Code lang="text">{`Use this server when the user wants to try, set up, or
provision a third-party service — e.g. "set up a database
for this project" or "I need an email API."

Call sequence:
1. search_offers — find services matching the user's need
2. activate_offer — provision the selected service`}</Code>
      <p>
        Notice the example utterances. Models act on examples more
        reliably than on category descriptions. &ldquo;Use this when the
        user wants to set up a service&rdquo; is weaker than three
        example utterances that should trigger the server. And naming
        the call order up front removes the most common sequencing
        failure: the model calling the execute tool cold, with an
        identifier it guessed.
      </p>

      <h2>Filter server-side so the model cannot pick something unusable</h2>
      <p>
        In the system I built, the discovery tool returned only
        actionable items. Every result it surfaced could be
        executed by the second tool. Options that existed in the catalog
        but couldn&rsquo;t be provisioned were filtered out before the
        model ever saw them. This closes off a whole failure class: the
        model can&rsquo;t hallucinate a usable option from an unusable
        one, because the unusable ones are never in its context. Any
        validation you can do server-side before returning results is
        validation the model never gets a chance to fail.
      </p>

      <h2>Two tools, one hidden protocol</h2>
      <p>
        A discovery call followed by an execute call maps to how a model
        reasons: first find out what exists, then act on one of the
        results. Two tools beat one god-tool with a mode parameter, and
        they beat five granular tools that force the model to orchestrate
        your internal protocol.
      </p>
      <p>
        That second half matters as much as the first. The execute tool
        in my system internally kicked off a provisioning job, polled for
        status, surfaced any human-input requests, redeemed a one-time
        token, and returned the result. That&rsquo;s five distinct
        protocol steps, and the model saw one synchronous call. Every
        step you expose as a separate tool is a step the model can skip,
        reorder, or retry incorrectly. Hide the protocol behind a single
        tool and expose only the intent.
      </p>

      <h2>Tool results are prompt surface</h2>
      <p>
        A tool result goes straight into the model&rsquo;s context as
        text. That makes it the best place to steer the next call, better
        placed than the system prompt, because it arrives at the
        moment the model is deciding what to do next. Two habits follow
        from this. First, format identifiers so the model can lift them
        back out: my discovery tool returned markdown with each
        item&rsquo;s ID set off clearly, so copying an ID into the
        execute call was a mechanical operation rather than an extraction
        problem. Second, end the result with an explicit next-step
        sentence, such as &ldquo;to provision one of these, call the
        execute tool with its ID.&rdquo; The model follows directions it
        just read.
      </p>

      <h2>Pass-through payloads travel better as strings</h2>
      <p>
        When a tool result contains structured data the model must hand
        back on the next call, an opaque JSON string round-trips more
        reliably than a nested object. Ask a model to reconstruct a
        nested parameter and it drops fields, renames keys, and coerces
        types. Ask it to pass back a string it was given and it mostly
        passes back the string. In my system, user-input specifications
        moved between the two tools as a single JSON string parameter for
        exactly this reason. Reserve structured parameters for values the
        model is deciding; use strings for values it&rsquo;s carrying.
      </p>

      <h2>Return errors instead of throwing them</h2>
      <p>
        A thrown exception ends the turn. An error result, the MCP{' '}
        <code>isError</code> flag plus a human-readable message, stays in
        context, and the model reads it like any other tool output. My
        server returned errors as results with a plain-language
        explanation of what went wrong, and models routinely corrected
        the input and retried without any human in the loop! Write the
        message for the model: state what was wrong and what a valid
        call looks like.
      </p>

      <h2>When the caller is a model, return instructions</h2>
      <p>
        The strangest-looking design choice held up best. A successful
        execute call in my system didn&rsquo;t return a raw payload of
        credentials and endpoints for the model to interpret. It returned
        a block of instructions, prose written for the model with the
        live values interpolated into it: here is your API key, here is
        the endpoint, do this next. A payload asks the model to figure
        out what the fields mean and what to do with them. Instructions
        ask it to follow directions, which is the thing models do best.
        If your tool&rsquo;s consumer is an agent, the most useful
        return type is often a prompt.
      </p>

      <h2>Build the server per session</h2>
      <p>
        Construct the server instance with the caller&rsquo;s credentials
        and context bound in at session setup, rather than resolving
        identity inside each tool handler. Two things fall out of this.
        Tools can&rsquo;t be invoked with the wrong tenant&rsquo;s
        identity, because the identity was fixed before any tool existed;
        there&rsquo;s no tenant parameter for the model to get wrong. And
        request-scoped values, like the client IP you need for downstream
        calls, are available wherever a handler needs them without
        threading them through every signature.
      </p>

      <h2>What to test</h2>
      <p>
        Handler unit tests tell you the tools work when called correctly.
        The failures above all happen before or between correct calls, so
        test with a real model connected. Test three questions
        separately: does the model pick the server up at all when a
        prompt should trigger it; does it pick the right tool when
        several could plausibly apply; and does it recover when a tool
        returns an error result. Each maps to a different artifact:
        server instructions, tool descriptions, and error formatting. A
        failure tells you which text to rewrite. Run the prompts your
        users will type rather than the ones your tools were designed
        around. The gap between those two sets is where integrations
        fail.
      </p>
    </ArticleLayout>
  );
}
