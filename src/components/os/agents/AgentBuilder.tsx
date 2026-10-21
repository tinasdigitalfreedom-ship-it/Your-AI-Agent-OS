import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Brain, ClipboardList, Hammer, Inbox, Send, Sparkles, Trash2, Wand2 } from "lucide-react";
import { runAgent, runText } from "../brain";
import { CustomAgent, deleteAgent, instructionsFor, loadAgents, portableInstructions, saveAgent } from "../customAgents";
import { Card, CopyButton, ErrorNote, Eyebrow, Field, GhostButton, PrimaryButton, THINKING_ERROR } from "../ui";

const blank: Omit<CustomAgent, "id"> = { name: "", job: "", forWho: "", input: "", output: "", rules: "" };

// The starting point for anyone who isn't sure what to build first.
const examples: Omit<CustomAgent, "id">[] = [
  {
    name: "Product Helper",
    job: "Turn what I already know into my first digital product.",
    forWho: "People like me, over 40 and starting over.",
    input: "My life and work experience, what people always ask me for help with, and how many hours a week I have.",
    output: "3 product ideas with a price for each. Then, for the one I pick, a simple outline and a 7-day launch checklist.",
    rules: "Keep prices between $7 and $47. No income promises. Only use free or cheap tools like Canva and Google Docs.",
  },
];

const parts = [
  { icon: Brain, title: "The brain", text: "The AI itself. It already knows how to read and write. It just needs direction, like a smart new helper on their first day." },
  { icon: ClipboardList, title: "The job", text: "One clear task. \"Turn what I know into a product.\" Not \"run my business.\" Small jobs work best." },
  { icon: Inbox, title: "What you give it", text: "The information it needs every time. Your life experience. What people always ask you for help with. Your hours each week." },
  { icon: Send, title: "What it gives back", text: "Exactly what you want handed back. 3 product ideas with prices. An outline you can follow." },
];

const fillSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    job: { type: "string" },
    forWho: { type: "string" },
    input: { type: "string" },
    output: { type: "string" },
    rules: { type: "string" },
  },
  required: ["name", "job", "forWho", "input", "output", "rules"],
};

const AgentBuilder = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const existing = agentId ? loadAgents().find((a) => a.id === agentId) : undefined;

  const [draft, setDraft] = useState<Omit<CustomAgent, "id">>(existing ?? blank);
  const [savedId, setSavedId] = useState<string | null>(existing?.id ?? null);
  const [idea, setIdea] = useState("");
  const [tryInput, setTryInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [filling, setFilling] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const found = agentId ? loadAgents().find((a) => a.id === agentId) : undefined;
    setDraft(found ?? blank);
    setSavedId(found?.id ?? null);
    setAnswer("");
    setTryInput("");
  }, [agentId]);

  const set = (k: keyof typeof blank) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const ready = draft.name.trim() && draft.job.trim() && draft.input.trim() && draft.output.trim();
  const agent: CustomAgent = { id: savedId ?? "draft", ...draft };

  const fillIn = async () => {
    setFilling(true);
    setError("");
    try {
      const res = await runAgent<typeof blank>(
        `A small business owner over 40 wants to build their own AI agent. Here is what they said, in their own words:
"${idea}"

Fill in a simple agent plan for them. Keep each field to one or two plain sentences a beginner understands.
- name: a short friendly name ending in Helper, Writer, or Agent
- job: one clear task
- forWho: who the results are for
- input: what they will paste or type in each time
- output: exactly what the agent hands back
- rules: 2 or 3 rules that keep it on brand and safe`,
        fillSchema
      );
      setDraft(res);
    } catch {
      setError(THINKING_ERROR);
    }
    setFilling(false);
  };

  const save = () => {
    const id = savedId ?? crypto.randomUUID();
    saveAgent({ id, ...draft });
    setSavedId(id);
    navigate(`/my-agents/${id}`, { replace: true });
  };

  const tryIt = async () => {
    setRunning(true);
    setError("");
    try {
      setAnswer(await runText(instructionsFor(agent), tryInput));
    } catch {
      setError(THINKING_ERROR);
    }
    setRunning(false);
  };

  const remove = () => {
    if (savedId) deleteAgent(savedId);
    navigate("/agent-builder");
  };

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{existing ? "My agent" : "Agent Builder"}</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          {existing ? existing.name : <>Build your own <em className="text-[#d97a93]">agent</em>.</>}
        </h1>
        {!existing && (
          <p className="text-lg text-[#b8aaa8] max-w-2xl">
            You've spent decades training people, explaining things, and getting jobs done right.
            Building an agent is the same thing. You're just training a helper that never gets tired.
            No code. No tech degree. If you can write a to-do list, you can do this.
          </p>
        )}
      </div>

      {!existing && (
        <>
          <Card>
            <h2 className="font-display text-2xl mb-1">Every agent has 4 parts</h2>
            <p className="text-[#b8aaa8] mb-5">That's it. Really. Here's what each one means.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {parts.map((p, i) => (
                <div key={p.title} className="rounded-xl bg-[#0d0a0c] border border-[#2a2224] p-4">
                  <p className="flex items-center gap-2 font-bold mb-1">
                    <p.icon className="h-5 w-5 text-[#d97a93]" /> {i + 1}. {p.title}
                  </p>
                  <p className="text-sm text-[#b8aaa8]">{p.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-2xl">Not sure where to start?</h2>
            <p className="text-[#b8aaa8]">Tell me, in one sentence, a task you're tired of doing. I'll fill in the plan for you.</p>
            <Field
              label="The task I'm tired of doing"
              placeholder="Figuring out what product to make from what I know..."
              value={idea}
              onChange={setIdea}
            />
            <PrimaryButton onClick={fillIn} loading={filling} disabled={!idea.trim()}>
              <Wand2 className="h-4 w-4" /> {filling ? "Filling it in..." : "Help me fill this in"}
            </PrimaryButton>
            <p className="text-sm text-[#7a6f6d] pt-2">Or start from the example:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((e) => (
                <button
                  key={e.name}
                  onClick={() => setDraft(e)}
                  className="rounded-full border border-[#2a2224] px-4 py-2 text-sm text-[#b8aaa8] hover:border-[#d97a93]"
                >
                  {e.name}
                </button>
              ))}
            </div>
          </Card>
        </>
      )}

      <Card className="space-y-5">
        <h2 className="font-display text-2xl flex items-center gap-2"><Hammer className="h-5 w-5 text-[#d97a93]" /> Your agent's plan</h2>
        <Field label="Step 1. Give it a name" placeholder="Product Helper" value={draft.name} onChange={set("name")} />
        <Field label="Step 2. What is its one job?" hint="Keep it small and clear." placeholder="Turn what I already know into my first digital product." value={draft.job} onChange={set("job")} multiline />
        <Field label="Step 3. Who is the work for?" placeholder="People like me, over 40 and starting over." value={draft.forWho} onChange={set("forWho")} />
        <Field label="Step 4. What will you give it each time?" placeholder="My experience, what people ask me for help with, and my hours each week." value={draft.input} onChange={set("input")} multiline />
        <Field label="Step 5. What should it give back?" placeholder="3 product ideas with prices, then an outline and launch checklist for the one I pick." value={draft.output} onChange={set("output")} multiline />
        <Field label="House rules (optional)" hint="Things it should always or never do." placeholder="Prices between $7 and $47. No income promises. Free tools only." value={draft.rules} onChange={set("rules")} multiline />
        {error && <ErrorNote message={error} />}
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={save} disabled={!ready}>
            <Sparkles className="h-4 w-4" /> {savedId ? "Save changes" : "Save my agent"}
          </PrimaryButton>
          {savedId && (
            <GhostButton onClick={remove}><Trash2 className="h-4 w-4" /> Delete</GhostButton>
          )}
        </div>
      </Card>

      {ready && (
        <>
          <Card className="space-y-4">
            <h2 className="font-display text-2xl">Try it out</h2>
            <p className="text-[#b8aaa8]">Give it what it needs: {draft.input}</p>
            <Field label="Your input" value={tryInput} onChange={setTryInput} multiline />
            <PrimaryButton onClick={tryIt} loading={running} disabled={!tryInput.trim()}>
              {running ? "Working..." : `Run ${draft.name}`}
            </PrimaryButton>
            {answer && (
              <div className="rounded-xl bg-[#0d0a0c] border border-[#2a2224] p-4">
                <div className="flex justify-end mb-2"><CopyButton text={answer} /></div>
                <p className="whitespace-pre-line text-[#f5ede7]">{answer}</p>
              </div>
            )}
            <p className="text-sm text-[#7a6f6d]">
              Not quite right? That's normal. Change one step above, then try again. That's how every agent gets good.
            </p>
          </Card>

          <Card className="bg-[#f0e9dd] border-[#f0e9dd] text-[#1a1416]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl">Take it with you</h2>
              <CopyButton text={portableInstructions(agent)} />
            </div>
            <p className="mb-3">
              Copy these instructions and paste them into a ChatGPT custom GPT, a Claude Project, or any AI tool you like.
              Your agent goes wherever you go.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-white/60 rounded-xl p-4 font-body">{portableInstructions(agent)}</pre>
          </Card>
        </>
      )}
    </div>
  );
};

export default AgentBuilder;
