# Your Worker Agentic OS

The site opens straight to the agents. It's a home base with a team of AI helpers. Each one does one job, in Tina's voice.

## The agents

| Agent | Page | What it does |
|---|---|---|
| Product Helper | `/product-helper` | Asks about your life and skills, gives 3 product ideas, then builds a full plan: outline, price, sales page draft, 7-day launch checklist. |
| Research Agent | `/research-agent` | Searches the web: is anyone looking for this, what buyers say, similar products and prices, keywords. |
| Content Agent | `/content-agent` | 3 options for a Facebook post, Pinterest pin, Instagram caption, or short video script. |
| Social Media Agent | `/social-agent` | Plans a week of posts for Facebook, Instagram, and Pinterest, and writes replies to comments and messages. Flags money trouble, complaints, and refunds for Tina to answer herself. |
| Email Agent | `/email-agent` | Welcome series, launch series, follow-ups, or one email. |
| Design Agent | `/design-agent` | Canva-ready brief (words, layout, colors, fonts, template search terms) and a picture prompt to paste into Canva Magic Media. |
| Agent Builder | `/agent-builder` | Teaches the 4 parts of an agent and lets people build, test, and save their own. |

Products made with the Product Helper show up in every other agent's "pick a product" menu, so the team works together.

## How it's built (for adding agents later)

- `src/components/os/brain.ts` is the shared brain. It holds the voice and audience rules from `voice.md`, `audience.md`, and `soul.md`. Every agent goes through it, so they all sound the same. It also strips em dashes as a safety net.
- `src/components/os/agents.ts` is the list of agents. Add one there, give it a page in `src/components/os/agents/`, add a route in `src/App.tsx`, and it shows up in the sidebar and on the home screen. "Launch Helper" is listed as coming soon.
- Saved products and the agents people build are kept in the browser (localStorage).

## Hosting on Netlify

The whole site, with every agent, runs on Netlify.

- **AI:** `netlify/functions/ai.mts` is the only code that talks to AI. The browser calls it at `/.netlify/functions/ai` (see `src/integrations/core.ts`). It uses Claude through **Netlify AI Gateway**, so there's no API key to manage; usage is billed as Netlify credits. It tries `claude-opus-5-5` first, then backup models. Set an `AI_MODEL` environment variable in Netlify to force one model.
- **Web search:** the Research Agent asks Claude to search the web. If the gateway won't run search, it still answers from what Claude knows.
- **Build:** `netlify.toml` runs `npm run build`, publishes `dist`, and sends every page to the app.

## Teaching people to build their own agents

The Agent Builder explains it in plain words. Every agent has 4 parts:

1. **The brain.** The AI. It knows how to read and write. It needs direction.
2. **The job.** One small, clear task.
3. **What you give it.** The info it needs every time.
4. **What it gives back.** Exactly what you want handed back.

People can fill those in themselves, start from the Product Helper example, or type one sentence and have it filled in for them. Then they test it right on the page and copy the instructions to use in ChatGPT, Claude, or any AI tool.
