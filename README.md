# Your AI Agent OS

AI agents that do the work for you.

Built for people over 40 building a business online. Your age is your advantage.

Made by Tina, Digital Business After 40.

## The agents

- **Product Helper:** turn what you already know into your first digital product.
- **Research Agent:** check what people want and what they pay before you build.
- **Content Agent:** pins, posts, captions, and video scripts in your own voice.
- **Social Media Agent:** plan a week of posts and reply to comments.
- **Email Agent:** welcome, launch, and follow-up emails that sound like you.
- **Design Agent:** Canva-ready briefs and picture prompts.
- **Agent Builder:** learn the 4 parts of an agent and build your own.

## How it runs

It's a Vite + React site on Netlify. The AI runs in one Netlify function,
`netlify/functions/ai.mts`, which uses Claude through Netlify AI Gateway, so
there's no API key to manage. Details are in `docs/agentic-os.md`.

The voice and audience rules every agent follows come from `voice.md`,
`audience.md`, and `soul.md`, and live in `src/components/os/brain.ts`.

## Run it on your computer

```sh
npm install
npm run dev
```
