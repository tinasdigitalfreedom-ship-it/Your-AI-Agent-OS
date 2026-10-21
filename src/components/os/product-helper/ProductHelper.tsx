import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { runAgent } from "../brain";
import { Blueprint, Idea, Profile, SavedProduct, saveProduct, updateSteps } from "../products";
import { Card, Choice, CopyButton, ErrorNote, Eyebrow, Field, GhostButton, ghostClass, PrimaryButton, THINKING_ERROR } from "../ui";

type Step = "about" | "ideas" | "blueprint";

const emptyProfile: Profile = { experience: "", skills: "", helpWho: "", hours: "3 to 5 hours", comfort: "Brand new to this" };

const ideaSchema = {
  type: "object",
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          format: { type: "string" },
          forWho: { type: "string" },
          problem: { type: "string" },
          whyYou: { type: "string" },
          price: { type: "string" },
          buildTime: { type: "string" },
        },
        required: ["title", "format", "forWho", "problem", "whyYou", "price", "buildTime"],
      },
    },
  },
  required: ["ideas"],
};

const blueprintSchema = {
  type: "object",
  properties: {
    nameOptions: { type: "array", items: { type: "string" } },
    promise: { type: "string" },
    outline: {
      type: "array",
      items: {
        type: "object",
        properties: { section: { type: "string" }, whatsInside: { type: "string" } },
        required: ["section", "whatsInside"],
      },
    },
    bonus: { type: "string" },
    price: { type: "string" },
    priceReason: { type: "string" },
    toolsToBuild: { type: "array", items: { type: "string" } },
    whereToSell: { type: "array", items: { type: "string" } },
    salesPage: {
      type: "object",
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        noMore: { type: "array", items: { type: "string" } },
        bullets: { type: "array", items: { type: "string" } },
        callToAction: { type: "string" },
      },
      required: ["headline", "subheadline", "noMore", "bullets", "callToAction"],
    },
    launchSteps: { type: "array", items: { type: "string" } },
    encouragement: { type: "string" },
  },
  required: ["nameOptions", "promise", "outline", "bonus", "price", "priceReason", "toolsToBuild", "whereToSell", "salesPage", "launchSteps", "encouragement"],
};

const describeProfile = (p: Profile) => `Life and work experience: ${p.experience}
Things they are good at: ${p.skills}
Who they want to help: ${p.helpWho || "not sure yet"}
Time per week: ${p.hours}
Comfort with tech: ${p.comfort}`;

const salesPageText = (b: Blueprint) =>
  [b.salesPage.headline, b.salesPage.subheadline, "", ...b.salesPage.noMore, "", ...b.salesPage.bullets.map((x) => `• ${x}`), "", b.salesPage.callToAction].join("\n");

const ProductHelper = () => {
  const [step, setStep] = useState<Step>("about");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [saved, setSaved] = useState<SavedProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof Profile) => (v: string) => setProfile((p) => ({ ...p, [k]: v }));

  const getIdeas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await runAgent<{ ideas: Idea[] }>(
        `Here is a person over 40 who wants to make their first digital product.
${describeProfile(profile)}

Give 3 different digital product ideas built on THEIR experience. Mix formats (for example a printable guide, a checklist or planner, a template pack, a short mini course, a prompt pack). For each:
- title: a clear, friendly working title
- format: what it is and roughly how big (like "12-page printable guide")
- forWho: the specific person who would buy it
- problem: the real problem it solves, in that buyer's words
- whyYou: one or two warm sentences on why this person's age and life experience make them the right one to make it
- price: a realistic starting price
- buildTime: honest time to build it at their hours per week`,
        ideaSchema
      );
      setIdeas(res.ideas);
      setStep("ideas");
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  const getBlueprint = async (chosen: Idea) => {
    setIdea(chosen);
    setLoading(true);
    setError("");
    try {
      const blueprint = await runAgent<Blueprint>(
        `Build a full, beginner-friendly product blueprint.

ABOUT THE CREATOR
${describeProfile(profile)}

THE PRODUCT
${chosen.title} (${chosen.format})
For: ${chosen.forWho}
Problem: ${chosen.problem}

Include:
- nameOptions: 3 product names
- promise: one sentence on what the buyer gets, no income claims
- outline: 4 to 7 sections with what goes in each
- bonus: one simple bonus that is easy to make
- price and priceReason
- toolsToBuild: free or low cost tools and what each is for
- whereToSell: 2 or 3 places, Beacons first since the creator already uses it
- salesPage: headline, subheadline, a "noMore" list of exactly 3 lines that each start with "No more", 4 to 6 bullets, and a plain callToAction with the price
- launchSteps: 7 small steps, one per day, each something they can do in under an hour
- encouragement: 2 or 3 warm sentences to the creator, reminding them their age is their advantage`,
        blueprintSchema
      );
      const product: SavedProduct = {
        id: crypto.randomUUID(),
        title: blueprint.nameOptions[0] || chosen.title,
        profile,
        idea: chosen,
        blueprint,
        completed_steps: [],
        created: new Date().toISOString(),
      };
      saveProduct(product);
      setSaved(product);
      setStep("blueprint");
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  const toggleStep = (i: number) => {
    if (!saved) return;
    const steps = saved.completed_steps.includes(i)
      ? saved.completed_steps.filter((s) => s !== i)
      : [...saved.completed_steps, i];
    updateSteps(saved.id, steps);
    setSaved({ ...saved, completed_steps: steps });
  };

  if (step === "about") {
    return (
      <div>
        <Eyebrow>Product Helper</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          You already know <em className="text-[#d97a93]">something</em> people will pay for.
        </h1>
        <p className="text-lg text-[#b8aaa8] mb-8 max-w-2xl">
          Raising kids. Running a house. Thirty years at a job. Getting through hard seasons.
          That is not "nothing." That is your product. Tell me a little about you and I'll show you three ideas.
        </p>
        <Card className="space-y-6">
          <Field
            label="What have you done in your life?"
            hint="Jobs, hobbies, things you've lived through. All of it counts."
            placeholder="Stay-at-home mom for 20 years, did the books for my husband's shop, love gardening..."
            value={profile.experience}
            onChange={set("experience")}
            multiline
          />
          <Field
            label="What do people come to you for?"
            hint="The thing friends and family always ask you about."
            placeholder="Budgeting on a tight income, meal planning, organizing..."
            value={profile.skills}
            onChange={set("skills")}
            multiline
          />
          <Field
            label="Who would you love to help? (optional)"
            placeholder="Women my age starting over, new grandmas, caregivers..."
            value={profile.helpWho}
            onChange={set("helpWho")}
          />
          <div>
            <span className="block text-base font-bold mb-2">How much time do you have each week?</span>
            <Choice options={["1 to 2 hours", "3 to 5 hours", "6 to 10 hours", "10+ hours"]} value={profile.hours} onChange={set("hours")} />
          </div>
          <div>
            <span className="block text-base font-bold mb-2">How comfortable are you with tech?</span>
            <Choice options={["Brand new to this", "I can find my way around", "Pretty comfortable"]} value={profile.comfort} onChange={set("comfort")} />
          </div>
          {error && <ErrorNote message={error} />}
          <PrimaryButton onClick={getIdeas} loading={loading} disabled={!profile.experience.trim() || !profile.skills.trim()}>
            <Sparkles className="h-4 w-4" /> {loading ? "Thinking about you..." : "Show me my ideas"}
          </PrimaryButton>
        </Card>
      </div>
    );
  }

  if (step === "ideas") {
    return (
      <div>
        <Eyebrow>Your 3 ideas</Eyebrow>
        <h1 className="font-display text-4xl mb-4">Pick the one that feels <em className="text-[#d97a93]">like you</em>.</h1>
        <p className="text-lg text-[#b8aaa8] mb-8">There's no wrong answer. You can always come back and make another.</p>
        <div className="space-y-4">
          {ideas.map((i) => (
            <Card key={i.title}>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="rounded-full bg-[#3a2530] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d97a93]">{i.format}</span>
                <span className="rounded-full bg-[#3a2530] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d97a93]">{i.price}</span>
                <span className="rounded-full bg-[#3a2530] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d97a93]">{i.buildTime}</span>
              </div>
              <h2 className="font-display text-2xl mb-2">{i.title}</h2>
              <p className="text-[#b8aaa8] mb-1"><strong className="text-[#f5ede7]">For:</strong> {i.forWho}</p>
              <p className="text-[#b8aaa8] mb-3"><strong className="text-[#f5ede7]">Solves:</strong> {i.problem}</p>
              <p className="italic text-[#f0e9dd] mb-5">"{i.whyYou}"</p>
              <PrimaryButton onClick={() => getBlueprint(i)} loading={loading && idea?.title === i.title} disabled={loading}>
                {loading && idea?.title === i.title ? "Building your plan..." : "Build this one"}
              </PrimaryButton>
            </Card>
          ))}
        </div>
        {error && <div className="mt-4"><ErrorNote message={error} /></div>}
        <div className="mt-6 flex flex-wrap gap-3">
          <GhostButton onClick={getIdeas}>Give me 3 different ideas</GhostButton>
          <GhostButton onClick={() => setStep("about")}>Change my answers</GhostButton>
        </div>
      </div>
    );
  }

  if (!saved) return null;
  const b = saved.blueprint;
  const done = saved.completed_steps.length;

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Your product blueprint · saved</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-3">{saved.title}</h1>
        <p className="text-lg text-[#b8aaa8]">{b.promise}</p>
      </div>

      <Card className="bg-[#f0e9dd] border-[#f0e9dd]">
        <p className="font-display text-xl text-[#1a1416] italic">{b.encouragement}</p>
      </Card>

      <Card>
        <h2 className="font-display text-2xl mb-3">Name ideas</h2>
        <ul className="space-y-1 text-[#b8aaa8]">{b.nameOptions.map((n) => <li key={n}>• {n}</li>)}</ul>
      </Card>

      <Card>
        <h2 className="font-display text-2xl mb-4">What goes inside</h2>
        <ol className="space-y-3">
          {b.outline.map((o, i) => (
            <li key={o.section}>
              <p className="font-bold">{i + 1}. {o.section}</p>
              <p className="text-[#b8aaa8]">{o.whatsInside}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[#b8aaa8]"><strong className="text-[#d97a93]">Bonus:</strong> {b.bonus}</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-2xl mb-2">Price: {b.price}</h2>
          <p className="text-[#b8aaa8]">{b.priceReason}</p>
        </Card>
        <Card>
          <h2 className="font-display text-2xl mb-2">Where to sell</h2>
          <ul className="space-y-1 text-[#b8aaa8]">{b.whereToSell.map((w) => <li key={w}>• {w}</li>)}</ul>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-2xl mb-2">Tools to build it</h2>
        <ul className="space-y-1 text-[#b8aaa8]">{b.toolsToBuild.map((t) => <li key={t}>• {t}</li>)}</ul>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Sales page draft</h2>
          <CopyButton text={salesPageText(b)} />
        </div>
        <p className="font-display text-2xl mb-2">{b.salesPage.headline}</p>
        <p className="text-[#b8aaa8] mb-4">{b.salesPage.subheadline}</p>
        <div className="mb-4 space-y-1">{b.salesPage.noMore.map((n) => <p key={n} className="font-bold">{n}</p>)}</div>
        <ul className="space-y-1 text-[#b8aaa8] mb-4">{b.salesPage.bullets.map((x) => <li key={x}>• {x}</li>)}</ul>
        <p className="text-[#d97a93] font-bold">{b.salesPage.callToAction}</p>
      </Card>

      <Card>
        <h2 className="font-display text-2xl mb-1">Your 7-day launch plan</h2>
        <p className="text-sm text-[#7a6f6d] mb-4">{done} of {b.launchSteps.length} done. One small step a day.</p>
        <ul className="space-y-3">
          {b.launchSteps.map((s, i) => (
            <li key={s}>
              <button onClick={() => toggleStep(i)} className="flex items-start gap-3 text-left">
                {saved.completed_steps.includes(i)
                  ? <CheckCircle2 className="h-5 w-5 mt-0.5 text-[#d97a93] shrink-0" />
                  : <Circle className="h-5 w-5 mt-0.5 text-[#7a6f6d] shrink-0" />}
                <span className={saved.completed_steps.includes(i) ? "line-through text-[#7a6f6d]" : ""}>
                  <strong>Day {i + 1}.</strong> {s}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-2xl mb-2">Hand it to your team</h2>
        <p className="text-[#b8aaa8] mb-4">Your other agents can already see this product. Pick one to keep going.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/research-agent" className={ghostClass}>Research it</Link>
          <Link to="/design-agent" className={ghostClass}>Design the cover</Link>
          <Link to="/content-agent" className={ghostClass}>Write posts</Link>
          <Link to="/email-agent" className={ghostClass}>Write emails</Link>
        </div>
      </Card>

      <GhostButton onClick={() => { setStep("about"); setSaved(null); }}>Start a new product</GhostButton>
    </div>
  );
};

export default ProductHelper;
