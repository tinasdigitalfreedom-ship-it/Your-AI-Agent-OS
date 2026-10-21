import Anthropic from "@anthropic-ai/sdk";

// The one place the OS talks to AI. The browser sends a prompt, this runs it
// on Claude through Netlify AI Gateway (which supplies the credentials), and
// sends back JSON or text. Nothing secret ever reaches the browser.

interface AiRequest {
  prompt: string;
  response_json_schema?: Record<string, unknown>;
  add_context_from_internet?: boolean;
}

// Tried in order, in case the gateway doesn't serve the newest one yet. The
// last is the model the gateway docs list (retired November 30, 2026). Set
// AI_MODEL in Netlify to force a specific one.
const MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-sonnet-4-5-20250929"];
const OLDEST = MODELS[MODELS.length - 1];

// Netlify stops a function after 60 seconds, so give up a little before that.
const client = new Anthropic({ timeout: 50_000, maxRetries: 0 });

// Structured outputs need every object to list its fields and allow no others.
function strict(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(strict);
  if (!schema || typeof schema !== "object") return schema;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(schema)) out[k] = strict(v);
  if (out.type === "object" && out.properties) {
    out.additionalProperties = false;
    out.required = Object.keys(out.properties as object);
  }
  return out;
}

function lastText(message: Anthropic.Message): string {
  const texts = message.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  return texts.map((b) => b.text).join("").trim();
}

function parseJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = cleaned.search(/[[{]/);
  return JSON.parse(start > 0 ? cleaned.slice(start) : cleaned);
}

async function ask(model: string, body: AiRequest, useWeb: boolean): Promise<unknown> {
  const schema = body.response_json_schema;
  const newModel = model !== OLDEST;
  // Citations from web search can't be combined with a strict output format,
  // so web answers are asked for as JSON in the prompt and parsed here.
  const strictFormat = schema && !useWeb;
  const prompt =
    schema && useWeb
      ? `${body.prompt}\n\nReply with only a JSON object matching this JSON schema, nothing else:\n${JSON.stringify(schema)}`
      : body.prompt;

  // Low effort keeps answers well inside Netlify's 60 second limit.
  // The older fallback model doesn't take an effort setting.
  const outputConfig: Anthropic.OutputConfig = {
    ...(newModel ? { effort: "low" } : {}),
    ...(strictFormat ? { format: { type: "json_schema", schema: strict(schema) as Record<string, unknown> } } : {}),
  };

  const stream = client.messages.stream({
    model,
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
    ...(Object.keys(outputConfig).length ? { output_config: outputConfig } : {}),
    ...(useWeb ? { tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }] } : {}),
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") throw new Error("refusal");
  const text = lastText(message);
  return schema ? parseJson(text) : text;
}

export default async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });

  let body: AiRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "The request wasn't valid JSON." }, { status: 400 });
  }
  if (!body?.prompt || typeof body.prompt !== "string" || body.prompt.length > 40_000) {
    return Response.json({ error: "Missing or too-long prompt." }, { status: 400 });
  }

  const chosen = Netlify.env.get("AI_MODEL");
  const models = chosen ? [chosen] : MODELS;
  const wantsWeb = Boolean(body.add_context_from_internet);

  for (const model of models) {
    // With web search first; if the gateway won't run it, answer without it.
    for (const useWeb of wantsWeb ? [true, false] : [false]) {
      try {
        const result = await ask(model, body, useWeb);
        return Response.json({ result, model, searchedWeb: useWeb });
      } catch (error) {
        const tryNext =
          error instanceof Anthropic.NotFoundError ||
          error instanceof Anthropic.BadRequestError ||
          error instanceof SyntaxError;
        console.error(`AI call failed on ${model} (web: ${useWeb}): ${error instanceof Error ? error.message : error}`);
        if (!tryNext) {
          const status = error instanceof Anthropic.RateLimitError ? 429 : 502;
          return Response.json({ error: "The AI service didn't answer. Try again in a moment." }, { status });
        }
      }
    }
  }
  return Response.json({ error: "The AI service couldn't handle that request." }, { status: 502 });
};
