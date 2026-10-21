export interface CustomAgent {
  id: string;
  name: string;
  job: string;
  forWho: string;
  input: string;
  output: string;
  rules: string;
}

const KEY = "os-custom-agents";

export function loadAgents(): CustomAgent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAgent(agent: CustomAgent) {
  try {
    localStorage.setItem(KEY, JSON.stringify([agent, ...loadAgents().filter((a) => a.id !== agent.id)]));
    window.dispatchEvent(new Event("os-agents-changed"));
  } catch {
    // Storage can be blocked in private windows.
  }
}

export function deleteAgent(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadAgents().filter((a) => a.id !== id)));
    window.dispatchEvent(new Event("os-agents-changed"));
  } catch {
    // Ignore.
  }
}

// The agent's instructions, the same words whether it runs here or in ChatGPT or Claude.
export function instructionsFor(a: CustomAgent) {
  return `You are "${a.name}".
Your job: ${a.job}
You help: ${a.forWho}
The person will give you: ${a.input}
You give back: ${a.output}
Rules to always follow: ${a.rules || "Be warm, plain, and honest."}`;
}

// A version to paste into ChatGPT (custom GPT), a Claude Project, or any AI tool.
export function portableInstructions(a: CustomAgent) {
  return `${instructionsFor(a)}
Write like a friendly person, in short plain sentences. No hype, no income promises, no em dashes.
If something is missing, ask one simple question before you start.`;
}
