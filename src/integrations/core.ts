// Talks to the app's own AI function on Netlify (netlify/functions/ai.mts).

interface InvokeLLMParams {
  prompt: string;
  response_json_schema?: Record<string, unknown>;
  add_context_from_internet?: boolean;
}

export async function invokeLLM(params: InvokeLLMParams): Promise<unknown> {
  const res = await fetch("/.netlify/functions/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);
  return data.result;
}
