import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/article';

export const metadata: Metadata = {
  title: 'MCP Elicitation: Pausing a Tool Call to Ask the User a Question',
  description:
    'How to pause an MCP tool call mid-execution to collect input from a human: the elicitation request shape, the suspend-and-resume mechanics, the timeout design, and the read-your-writes race, from an engineer who shipped it in production.',
};

export default function McpElicitationPage() {
  return (
    <ArticleLayout
      title="Pausing a tool call to ask the user a question"
      description="MCP elicitation in practice: suspending tool execution on human input, resuming cleanly, and the races and timeouts you have to design for."
      datePublished="2026-07-25"
      slug="/mcp-development/mcp-elicitation/"
      byline="I built and shipped MCP servers and agent tooling at ZeroClick"
      faq={[
        {
          question: 'What is MCP elicitation?',
          answer:
            'Elicitation is the Model Context Protocol feature that lets a server request structured input from the user during a tool call. The request carries a human-readable message and a JSON Schema describing the expected fields. The client renders a form from the schema, collects the answer, and returns it to the server, which resumes the tool call where it left off.',
        },
        {
          question: 'What if the client doesn’t support elicitation?',
          answer:
            'Elicitation is an optional client capability, so design for its absence. Declare required inputs up front so the host can collect them before execution starts, and have the tool fail with a clear message naming the missing field when a mid-call question has no way to reach the user. A clear failure lets the model retry with the argument filled in; a hang teaches the user to distrust the tool.',
        },
        {
          question: 'How long can a tool call wait for a human?',
          answer:
            'As long as your timeout design allows. The key is separating machine time from human time: keep a bounded budget for actual execution, but re-arm it whenever an elicitation answer arrives. In the system I built, execution had a five-minute budget that reset on every answered question, so a user could think for twenty minutes without killing the call. You still want an outer deadline that abandons the job and cleans up.',
        },
        {
          question: 'How do I test flows that need human input?',
          answer:
            'Make the answer path an API, not just a UI. If answers arrive through an endpoint that writes to the pending-request store, tests can play the human: start the call, poll until it reaches the awaiting-input state, post a canned answer, and assert the call resumes and completes. That same seam lets you test the failure cases without a browser in the loop: wrong session token, empty answers, timeouts.',
        },
      ]}
      ctaTitle="Does your MCP server hold up when a human enters the loop?"
      ctaBody="I audit MCP servers for the failure modes this article describes (elicitation, timeouts, races, auth on the answer path) plus tool-surface design and directory readiness. Fixed price, $2,000, one week, credited toward any follow-on work."
      ctaEmailSubject="MCP server audit: elicitation"
      ctaSource="elicitation-article"
    >
      <p>
        A tool call is halfway done and hits a question only the human can
        answer. Which email address should the invite go to? Which region
        should the project deploy in? Sometimes the third-party provider
        forces the question with an interactive step in the middle of an
        otherwise automated flow. The obvious move is to fail the call and
        let the model retry with more arguments. That throws away every
        step already completed: accounts created, resources allocated,
        minutes of polling. The better move is to pause, ask, and resume.
      </p>

      <h2>Elicitation is the protocol answer</h2>
      <p>
        MCP has a mechanism for this. The server sends the client
        an elicitation request: a human-readable message plus a JSON
        Schema describing the fields it wants back. The client renders a
        form from the schema, the user fills it in, and the answer flows
        back to the server, which continues the tool call.
      </p>
      <p>
        The schema is what makes this practical. I built a service at
        ZeroClick that provisioned third-party accounts from inside an
        agent session, and its first version asked questions as a plain
        string. Reshaping the request to MCP&rsquo;s form,{' '}
        <code>message</code> plus <code>requestedSchema</code>, meant one
        payload drove two different renderers: an HTML form in a web view
        and a native form drawn by the MCP client itself. No translation
        layer was needed between them. The server describes what it
        needs once; every surface that can render a JSON Schema can
        collect it.
      </p>

      <h2>Implementing the pause</h2>
      <p>
        The shape that works is a coroutine suspended over an external
        store. The executing code calls something like{' '}
        <code>await prompt(message, schema)</code> and stops. Under the
        hood:
      </p>
      <ol>
        <li>
          The pending question is written to a shared store (Redis, a
          database row, anything both the executor and the answer
          endpoint can reach), keyed by the job.
        </li>
        <li>
          The job&rsquo;s status moves to an awaiting-input state, so
          anything polling the job knows a question is outstanding and
          can surface the form.
        </li>
        <li>
          A poller checks the store for an answer. In my implementation
          it checked every second, with a bounded deadline.
        </li>
        <li>
          When the answer lands, the poller resolves the promise and
          execution resumes on the next line, with the answer in hand.
        </li>
      </ol>
      <p>
        Nothing about the executing code knows it was suspended. It wrote{' '}
        <code>const email = await prompt(...)</code> and got an email
        back. All the machinery lives underneath that one awaited call:
        the store, the status transition, the polling. That is the
        property to preserve when you build this: the flow author writes
        straight-line code, and the runtime handles the suspension.
      </p>

      <h2>Machine time and human time are different budgets</h2>
      <p>
        Long-running tool calls need execution timeouts. But a naive
        timeout kills exactly the calls elicitation exists to save. The
        system I built gave each execution a five-minute budget. That is
        plenty for API calls and polling loops, and a hard stop for
        runaway code. A user who takes six minutes to decide on a project name
        would blow that budget while the code did nothing at all.
      </p>
      <p>
        The fix is to re-arm the execution timeout every time an elicitation
        answer arrives. Machine work stays bounded at five minutes per
        stretch; human thinking time never counts against it. The call
        can wait as long as the person needs, and a hung API call still
        dies on schedule. You will likely still want an outer deadline
        after which an abandoned job gets cleaned up. That deadline is a
        product decision rather than an execution budget.
      </p>

      <h2>The read-your-writes race</h2>
      <p>
        Here is the bug everyone building this hits. The answer endpoint
        wrote the user&rsquo;s response into the pending-request record.
        The status view the client polls was a separate projection, and
        it still reported the job as awaiting input until a background
        pass caught up. In that window the client saw an unanswered
        question, re-rendered the form, and asked the user a question
        they had just answered.
      </p>
      <p>
        The fix is to write the answer into both places in the same
        operation: the request record the executor polls, and the status
        projection the client polls. Once those two views can never
        disagree, a useful invariant falls out: the client can safely
        treat &ldquo;pending&rdquo; as &ldquo;has no answer content
        yet&rdquo; and filter on that alone. Any elicitation with content
        is answered; any without is open. If you find yourself
        adding a flag to mark answers as &ldquo;really answered,&rdquo;
        you have two sources of truth and the race is still there.
      </p>

      <h2>Two kinds of input</h2>
      <p>
        Not every question should pause execution. Split your inputs into
        known-unknowns and unknown-unknowns.
      </p>
      <p>
        Known-unknowns are fields you can name before the flow starts: an
        email address, a workspace name, a plan tier. Declare these on
        the flow itself and collect them before execution begins. The
        payoff is threefold: missing input fails fast instead of
        minutes in; the user answers everything in one pass instead of
        being interrupted repeatedly; and the host application can
        prefill fields it already knows, skipping the question entirely.
        The system I built evolved this way. The first version
        hardcoded a single required email prompt, and later versions
        replaced it with a declared list of required inputs, looping over
        them and skipping any already present in context.
      </p>
      <p>
        Unknown-unknowns only surface mid-execution: the provider
        returned three options and someone has to pick one, or a step
        that is usually automatic demanded verification this time. These
        are what mid-call elicitation is for. If you find a flow
        eliciting the same field on every run, that field is a
        known-unknown. Move it up front.
      </p>

      <h2>Authenticate the answer</h2>
      <p>
        The answer path is a write endpoint: &ldquo;here is the answer
        for job X.&rdquo; If it accepts any caller who knows a job ID,
        anyone who obtains or guesses an ID can inject answers into
        someone else&rsquo;s flow. Elicitation answers frequently
        become credentials, resource names, and destinations. In the
        system I built, responding to an elicitation required a session
        token proving the caller owned the job. It took two validators:
        one for trusted server contexts, and a separate one for browser
        contexts, because a form running in a user&rsquo;s browser must
        never hold a private API key. Whatever your setup, the rule is
        the same: bind answers to the session that asked the question.
      </p>

      <h2>One question at a time</h2>
      <p>
        When a flow has several questions, resist answering them in
        parallel. Later questions often depend on earlier answers. The
        region choice determines which plans exist, and the account
        chosen determines which projects can be named. Process elicitations
        sequentially: ask, wait, resume, and let the next question be
        computed with the previous answer in scope. Parallel forms look
        faster and produce contradictions. The up-front declared inputs
        are where you batch; the mid-flight questions are where you
        serialize.
      </p>

      <h2>What this buys you</h2>
      <p>
        A tool call that can pause on a human stops being a gamble. The
        agent starts work it cannot fully specify, the person supplies
        the missing pieces when they matter, and nothing already
        done gets thrown away. The mechanics fit in an afternoon of
        reading: a promise suspended over a shared store, a status the
        client can poll, a timeout that respects human time, one atomic
        write for the answer, and a token proving who is answering. Get
        those five right and the rest is product design.
      </p>
    </ArticleLayout>
  );
}
