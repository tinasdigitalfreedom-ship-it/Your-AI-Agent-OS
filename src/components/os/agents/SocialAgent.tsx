import { useState } from "react";
import { CalendarDays, HandHeart, MessageCircle } from "lucide-react";
import { runAgent } from "../brain";
import { describeProduct, SavedProduct } from "../products";
import ProductPicker from "../ProductPicker";
import { Card, Choice, CopyButton, ErrorNote, Eyebrow, Field, PrimaryButton, THINKING_ERROR } from "../ui";

type Tab = "week" | "reply";

interface Post {
  day: string;
  platform: string;
  pillar: string;
  hook: string;
  caption: string;
  callToAction: string;
  tags: string;
  visual: string;
}

interface WeekPlan {
  pillars: { name: string; why: string }[];
  posts: Post[];
  tip: string;
}

interface Reply {
  handleYourself: boolean;
  why: string;
  reply: string;
  nextStep: string;
}

const weekSchema = {
  type: "object",
  properties: {
    pillars: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, why: { type: "string" } },
        required: ["name", "why"],
      },
    },
    posts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string" },
          platform: { type: "string" },
          pillar: { type: "string" },
          hook: { type: "string" },
          caption: { type: "string" },
          callToAction: { type: "string" },
          tags: { type: "string" },
          visual: { type: "string" },
        },
        required: ["day", "platform", "pillar", "hook", "caption", "callToAction", "tags", "visual"],
      },
    },
    tip: { type: "string" },
  },
  required: ["pillars", "posts", "tip"],
};

const replySchema = {
  type: "object",
  properties: {
    handleYourself: { type: "boolean" },
    why: { type: "string" },
    reply: { type: "string" },
    nextStep: { type: "string" },
  },
  required: ["handleYourself", "why", "reply", "nextStep"],
};

const platformRules: Record<string, string> = {
  Facebook: "Facebook: short lines, a question to invite comments, no hashtags (tags empty).",
  Instagram: "Instagram: strong first line, short lines, 8 to 12 hashtags in tags.",
  Pinterest: "Pinterest: hook is a search-friendly pin title under 100 characters, caption is a 2 or 3 sentence pin description with natural keywords, tags are 3 to 5 keyword phrases.",
};

const places = ["Facebook comment", "Facebook message", "Instagram comment", "Instagram DM"];

const postText = (p: Post) =>
  [p.hook, p.caption, p.callToAction, p.tags].filter(Boolean).join("\n\n");

const SocialAgent = () => {
  const [tab, setTab] = useState<Tab>("week");

  // Plan my week
  const [product, setProduct] = useState<SavedProduct | null>(null);
  const [focus, setFocus] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["Facebook", "Pinterest"]);
  const [howMany, setHowMany] = useState("5 posts");
  const [plan, setPlan] = useState<WeekPlan | null>(null);

  // Reply to a comment
  const [comment, setComment] = useState("");
  const [place, setPlace] = useState("Facebook comment");
  const [reply, setReply] = useState<Reply | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (p: string) =>
    setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const planWeek = async () => {
    setLoading(true);
    setError("");
    try {
      const subject = [product && describeProduct(product), focus && `Focus this week: ${focus}`]
        .filter(Boolean)
        .join("\n");
      const res = await runAgent<WeekPlan>(
        `Plan one week of social media posts for Tina.

${subject || "No product picked. Focus on building trust with people over 40 who want to start earning online."}

Platforms: ${platforms.join(", ")}
How many: ${howMany} for the whole week, spread across the platforms and days (Monday to Sunday).
Platform rules:
${platforms.map((p) => `- ${platformRules[p]}`).join("\n")}

Return:
- pillars: 3 content pillars for the week (for example "My story", "A helpful tip", "Proof it's possible after 40"), each with why it matters to this audience
- posts: each with day, platform, pillar, hook, caption, callToAction, tags, and visual (a plain idea for the picture or graphic, something easy to make in Canva or with a phone)
- tip: one short, practical tip for posting this week

Mix it up: story posts, tip posts, and at most one post that mentions a product or offer. Make people over 40 feel seen and remind them their age is an advantage. Calls to action point to the quiz, the free resource vault, or the Beacons link in bio.`,
        weekSchema
      );
      setPlan(res);
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  const writeReply = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await runAgent<Reply>(
        `Someone left this ${place} for Tina:
"""
${comment}
"""

Write the reply Tina can post or send. Rules:
- Acknowledge them first, then answer. Make them feel seen.
- Keep it short: 1 to 4 sentences for a comment, up to 6 for a private message.
- Give one clear, kind next step when it fits (the quiz, the free resource vault, or the Beacons link in bio). Never push.
- No income claims or promises of results.
- If it's a public comment and the topic is personal, invite them to message privately.

handleYourself is true when Tina should answer personally instead of using this draft: money trouble or desperation, emotional distress, a complaint, a refund or billing question, anything legal or medical, or anything you're unsure about. In that case still write a short, gentle holding reply, and use why to explain what to watch for.
why: one sentence on how you read the message.
nextStep: one plain sentence on what Tina should do after replying.`,
        replySchema
      );
      setReply(res);
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  const tabClass = (t: Tab) =>
    `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition ${
      tab === t ? "bg-[#d97a93] text-[#0d0a0c] font-bold" : "border border-[#2a2224] text-[#b8aaa8] hover:border-[#d97a93]"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Social Media Agent</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          Show up every week. <em className="text-[#d97a93]">Without</em> living on your phone.
        </h1>
        <p className="text-lg text-[#b8aaa8] max-w-2xl">
          No more wondering what to post. No more staring at comments not sure what to say.
          Plan your whole week in one sitting, and answer people kindly in your own voice.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setTab("week"); setError(""); }} className={tabClass("week")}>
          <CalendarDays className="h-4 w-4" /> Plan my week
        </button>
        <button onClick={() => { setTab("reply"); setError(""); }} className={tabClass("reply")}>
          <MessageCircle className="h-4 w-4" /> Reply to a comment
        </button>
      </div>

      {tab === "week" && (
        <>
          <Card className="space-y-6">
            <div>
              <span className="block text-base font-bold mb-2">Feature one of your products? (optional)</span>
              <ProductPicker value={product} onChange={setProduct} />
            </div>
            <Field
              label="Anything on your mind this week? (optional)"
              placeholder="My 59th birthday, a new freebie, a win from a member..."
              value={focus}
              onChange={setFocus}
            />
            <div>
              <span className="block text-base font-bold mb-2">Where are you posting?</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(platformRules).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={platforms.includes(p)}
                    onClick={() => togglePlatform(p)}
                    className={`rounded-full px-4 py-2 text-sm border transition ${
                      platforms.includes(p)
                        ? "bg-[#d97a93] border-[#d97a93] text-[#0d0a0c] font-bold"
                        : "border-[#2a2224] text-[#b8aaa8] hover:border-[#d97a93]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-base font-bold mb-2">How many posts this week?</span>
              <Choice options={["3 posts", "5 posts", "7 posts"]} value={howMany} onChange={setHowMany} />
            </div>
            {error && <ErrorNote message={error} />}
            <PrimaryButton onClick={planWeek} loading={loading} disabled={platforms.length === 0}>
              <CalendarDays className="h-4 w-4" /> {loading ? "Planning your week..." : "Plan my week"}
            </PrimaryButton>
          </Card>

          {plan && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-2xl">This week's themes</h2>
                  <CopyButton text={plan.posts.map((p) => `${p.day} · ${p.platform}\n\n${postText(p)}`).join("\n\n---\n\n")} />
                </div>
                <ul className="space-y-2">
                  {plan.pillars.map((p) => (
                    <li key={p.name}>
                      <span className="font-bold">{p.name}.</span> <span className="text-[#b8aaa8]">{p.why}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-[#7a6f6d]">The copy button above grabs the whole week at once.</p>
              </Card>

              {plan.posts.map((p, i) => (
                <Card key={i}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#3a2530] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d97a93]">{p.day}</span>
                      <span className="rounded-full bg-[#3a2530] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d97a93]">{p.platform}</span>
                      <span className="rounded-full border border-[#2a2224] px-3 py-1 text-xs uppercase tracking-wider text-[#b8aaa8]">{p.pillar}</span>
                    </div>
                    <CopyButton text={postText(p)} />
                  </div>
                  <p className="font-display text-xl mb-3">{p.hook}</p>
                  <p className="whitespace-pre-line text-[#b8aaa8] mb-3">{p.caption}</p>
                  <p className="font-bold text-[#d97a93]">{p.callToAction}</p>
                  {p.tags && <p className="mt-3 text-sm text-[#7a6f6d]">{p.tags}</p>}
                  <p className="mt-4 text-sm text-[#b8aaa8]"><strong className="text-[#f5ede7]">Picture idea:</strong> {p.visual}</p>
                </Card>
              ))}

              <Card className="bg-[#f0e9dd] border-[#f0e9dd]">
                <p className="text-[#1a1416]"><strong>Tip for this week:</strong> {plan.tip}</p>
              </Card>
            </>
          )}
        </>
      )}

      {tab === "reply" && (
        <>
          <Card className="space-y-6">
            <Field
              label="Paste the comment or message"
              placeholder="I'm 61 and I've bought 3 courses already. Is this another one that won't work?"
              value={comment}
              onChange={setComment}
              multiline
            />
            <div>
              <span className="block text-base font-bold mb-2">Where did it come in?</span>
              <Choice options={places} value={place} onChange={setPlace} />
            </div>
            {error && <ErrorNote message={error} />}
            <PrimaryButton onClick={writeReply} loading={loading} disabled={!comment.trim()}>
              <MessageCircle className="h-4 w-4" /> {loading ? "Reading it..." : "Write my reply"}
            </PrimaryButton>
          </Card>

          {reply && (
            <>
              {reply.handleYourself && (
                <Card className="border-[#d97a93]">
                  <p className="flex items-center gap-2 font-bold text-[#d97a93] mb-1">
                    <HandHeart className="h-5 w-5" /> This one needs you
                  </p>
                  <p className="text-[#b8aaa8]">{reply.why} Below is a gentle reply to hold the space until you can answer personally.</p>
                </Card>
              )}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-2xl">Your reply</h2>
                  <CopyButton text={reply.reply} />
                </div>
                <p className="whitespace-pre-line text-[#f5ede7] mb-4">{reply.reply}</p>
                {!reply.handleYourself && <p className="text-sm text-[#7a6f6d] mb-2">{reply.why}</p>}
                <p className="text-sm text-[#b8aaa8]"><strong className="text-[#f5ede7]">Then:</strong> {reply.nextStep}</p>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SocialAgent;
