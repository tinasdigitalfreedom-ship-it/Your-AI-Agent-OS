import { useState } from "react";
import { Search } from "lucide-react";
import { runAgent } from "../brain";
import { describeProduct, SavedProduct } from "../products";
import ProductPicker from "../ProductPicker";
import { Card, Choice, CopyButton, ErrorNote, Eyebrow, Field, PrimaryButton, THINKING_ERROR } from "../ui";

interface Research {
  summary: string;
  demand: { verdict: string; why: string };
  buyerWords: string[];
  similarProducts: { name: string; price: string; whatTheyOffer: string }[];
  gaps: string[];
  keywords: string[];
  nextStep: string;
}

const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    demand: {
      type: "object",
      properties: { verdict: { type: "string" }, why: { type: "string" } },
      required: ["verdict", "why"],
    },
    buyerWords: { type: "array", items: { type: "string" } },
    similarProducts: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, price: { type: "string" }, whatTheyOffer: { type: "string" } },
        required: ["name", "price", "whatTheyOffer"],
      },
    },
    gaps: { type: "array", items: { type: "string" } },
    keywords: { type: "array", items: { type: "string" } },
    nextStep: { type: "string" },
  },
  required: ["summary", "demand", "buyerWords", "similarProducts", "gaps", "keywords", "nextStep"],
};

const focuses = ["Is anyone looking for this?", "What do buyers struggle with?", "What are similar products priced at?", "All of it"];

const ResearchAgent = () => {
  const [product, setProduct] = useState<SavedProduct | null>(null);
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState("All of it");
  const [result, setResult] = useState<Research | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const subject = product ? describeProduct(product) : `Topic: ${topic}`;
      const res = await runAgent<Research>(
        `Search the internet and do honest market research for a beginner creator over 40.

${subject}

Main question: ${focus}

Return:
- summary: 2 or 3 plain sentences on what you found
- demand: verdict ("Strong", "Some", or "Hard to tell") and why, based on what you actually found
- buyerWords: 5 short phrases real buyers use when they talk about this problem
- similarProducts: 3 to 5 real similar products you found, with price and what they offer. If you could not confirm one, leave it out.
- gaps: 3 things those products miss that this creator, with their life experience, could do better
- keywords: 8 search phrases buyers would type on Pinterest, Google, or Etsy
- nextStep: one small, clear thing to do next
Be honest. If demand looks weak, say so kindly and suggest a better angle.`,
        schema,
        { web: true }
      );
      setResult(res);
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Research Agent</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Check before you <em className="text-[#d97a93]">build</em>.</h1>
        <p className="text-lg text-[#b8aaa8] max-w-2xl">
          No more guessing. No more spending weeks on something nobody wants.
          I'll look around the internet and tell you what people are really searching for and paying.
        </p>
      </div>
      <Card className="space-y-6">
        <div>
          <span className="block text-base font-bold mb-2">Research one of your products</span>
          <ProductPicker value={product} onChange={setProduct} />
        </div>
        {!product && (
          <Field label="Or type a topic" placeholder="Budget planner for retirees, caregiver checklists..." value={topic} onChange={setTopic} />
        )}
        <div>
          <span className="block text-base font-bold mb-2">What do you want to know?</span>
          <Choice options={focuses} value={focus} onChange={setFocus} />
        </div>
        {error && <ErrorNote message={error} />}
        <PrimaryButton onClick={run} loading={loading} disabled={!product && !topic.trim()}>
          <Search className="h-4 w-4" /> {loading ? "Looking around..." : "Do the research"}
        </PrimaryButton>
      </Card>

      {result && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl">Demand: {result.demand.verdict}</h2>
              <CopyButton text={JSON.stringify(result, null, 2)} />
            </div>
            <p className="text-[#b8aaa8] mb-3">{result.demand.why}</p>
            <p>{result.summary}</p>
          </Card>
          <Card>
            <h2 className="font-display text-2xl mb-3">How buyers talk about it</h2>
            <ul className="space-y-1 text-[#b8aaa8]">{result.buyerWords.map((w) => <li key={w}>"{w}"</li>)}</ul>
          </Card>
          <Card>
            <h2 className="font-display text-2xl mb-3">Similar products out there</h2>
            <ul className="space-y-3">
              {result.similarProducts.map((p) => (
                <li key={p.name}>
                  <p className="font-bold">{p.name} <span className="text-[#d97a93]">· {p.price}</span></p>
                  <p className="text-[#b8aaa8]">{p.whatTheyOffer}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[#7a6f6d]">Found on the web. Double check prices before you rely on them.</p>
          </Card>
          <Card>
            <h2 className="font-display text-2xl mb-3">Where you can do better</h2>
            <ul className="space-y-1 text-[#b8aaa8]">{result.gaps.map((g) => <li key={g}>• {g}</li>)}</ul>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Search words to use</h2>
              <CopyButton text={result.keywords.join(", ")} />
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((k) => (
                <span key={k} className="rounded-full bg-[#3a2530] px-3 py-1 text-sm text-[#d97a93]">{k}</span>
              ))}
            </div>
          </Card>
          <Card className="bg-[#f0e9dd] border-[#f0e9dd]">
            <p className="text-[#1a1416]"><strong>Your next step:</strong> {result.nextStep}</p>
          </Card>
        </>
      )}
    </div>
  );
};

export default ResearchAgent;
