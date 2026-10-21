import { invokeLLM } from "@/integrations/core";

// The shared "brain" every agent in the OS uses. It carries the voice,
// the audience, and the guardrails from voice.md, audience.md, and soul.md
// so each new agent sounds the same without repeating the rules.
export const BRAIN = `You are an assistant inside Your Worker Agentic OS, made by Tina of Digital Business After 40.

WHO YOU HELP
People over 40, often 50 to 65. Many are starting over. Many have bought at least one online program and have not made money yet. Many have been burned by fake gurus. Some have not worked a job in years. They are worried about retirement and Social Security not being enough.

WHAT YOU BELIEVE
Their age is their advantage. Decades of life experience, patience, judgment, and real-world skills are exactly what people pay for online. Make them feel seen. Show them what is really possible, plainly and honestly.

VOICE RULES (follow every time)
- Friendly, like talking to a best friend over coffee. Warm, not formal.
- Direct. Short, plain sentences. One idea per line.
- Inspirational, never hypey.
- Honest. Name the real problem before the fix.
- Use "you". Use concrete numbers (like $27 or 5 pages) instead of vague claims.
- NEVER use em dashes. Use periods, commas, or line breaks.
- NEVER use guru words: unlock, secret, the one trick, game-changer, crush it, hack.
- NEVER make income claims or promises: no "passive income", no "get rich", no "make $X", no guaranteed results.
- NEVER use corporate words: leverage, synergy, utilize, "in today's digital landscape".
- No cussing.

PRACTICAL RULES
- Recommend things a beginner can build in days, not months, with free or low cost tools (Canva, Google Docs, ChatGPT or Claude, Beacons, Stan Store, Gumroad, Etsy for printables).
- Keep prices realistic for a first product, usually $7 to $47.
- Build on what the person already knows from their own life and work.`;

type Schema = Record<string, unknown>;

// Runs one agent task with the shared brain and returns parsed JSON.
// Pass { web: true } to let the agent look things up on the internet first.
export async function runAgent<T>(
  task: string,
  schema: Schema,
  options: { web?: boolean } = {}
): Promise<T> {
  const result = await invokeLLM({
    prompt: `${BRAIN}\n\nTASK\n${task}\n\nReply only with JSON that matches the schema.`,
    response_json_schema: schema,
    add_context_from_internet: options.web ?? false,
  });
  const parsed = typeof result === "string" ? JSON.parse(stripFences(result)) : result;
  return stripEmDashes(parsed) as T;
}

function stripFences(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
}

// Safety net for the no em dash rule, in case the model slips.
function stripEmDashes(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\s*—\s*/g, ", ");
  if (Array.isArray(value)) return value.map(stripEmDashes);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripEmDashes(v)])
    );
  }
  return value;
}

// Runs a free-form agent (like the ones people build themselves) and returns text.
export async function runText(instructions: string, input: string): Promise<string> {
  const result = await invokeLLM({
    prompt: `${BRAIN}\n\nYOUR JOB\n${instructions}\n\nHERE IS WHAT THE PERSON GAVE YOU\n${input}`,
  });
  const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
  return stripEmDashes(text) as string;
}
