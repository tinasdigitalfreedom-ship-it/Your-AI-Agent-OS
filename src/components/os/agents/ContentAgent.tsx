import { useState } from "react";
import { PenLine } from "lucide-react";
import { runAgent } from "../brain";
import { describeProduct, SavedProduct } from "../products";
import ProductPicker from "../ProductPicker";
import { Card, Choice, CopyButton, ErrorNote, Eyebrow, Field, PrimaryButton, THINKING_ERROR } from "../ui";

interface Post {
  hook: string;
  body: string;
  callToAction: string;
  tags: string;
}

const schema = {
  type: "object",
  properties: {
    posts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          hook: { type: "string" },
          body: { type: "string" },
          callToAction: { type: "string" },
          tags: { type: "string" },
        },
        required: ["hook", "body", "callToAction", "tags"],
      },
    },
  },
  required: ["posts"],
};

const platforms: Record<string, string> = {
  "Facebook post": "A Facebook post. Short lines, line breaks, a question to invite comments. tags: leave empty.",
  "Pinterest pin": "A Pinterest pin. hook is the pin title (under 100 characters, search friendly). body is the pin description (2 or 3 sentences with natural keywords). tags: 3 to 5 keyword phrases.",
  "Instagram caption": "An Instagram caption. Strong first line, short lines, ends with a question or a simple ask. tags: 8 to 12 relevant hashtags.",
  "Short video script": "A 30 to 45 second Reel or TikTok script. hook is the first 3 seconds said out loud. body is the spoken script with [on screen text] notes. tags: 5 hashtags.",
};

const goals = ["Get noticed", "Build trust", "Share my story", "Sell my product"];

const ContentAgent = () => {
  const [product, setProduct] = useState<SavedProduct | null>(null);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Facebook post");
  const [goal, setGoal] = useState("Build trust");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const subject = [product && describeProduct(product), topic && `Topic or idea: ${topic}`].filter(Boolean).join("\n");
      const res = await runAgent<{ posts: Post[] }>(
        `Write 3 different pieces of social content.

${subject}

Format: ${platforms[platform]}
Goal: ${goal}

Each one should open with a relatable pain point or question that someone over 40 would feel in their chest.
Make them feel seen. Show what is really possible. Remind them their age and experience are an advantage.
Use the "No more ___." triplet in at least one of them.
callToAction is one plain next step, no pressure. If selling, mention the product and the price. Point to the Beacons link in bio when it fits.`,
        schema
      );
      setPosts(res.posts);
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Content Agent</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">No more staring at a <em className="text-[#d97a93]">blinking cursor</em>.</h1>
        <p className="text-lg text-[#b8aaa8] max-w-2xl">
          Pick where you're posting and what you want it to do. I'll write three options in your voice. You pick, tweak, and post.
        </p>
      </div>
      <Card className="space-y-6">
        <div>
          <span className="block text-base font-bold mb-2">Post about one of your products?</span>
          <ProductPicker value={product} onChange={setProduct} />
        </div>
        <Field
          label={product ? "Anything else to mention? (optional)" : "What do you want to talk about?"}
          placeholder="Why I started over at 59, a tip from my grocery budget..."
          value={topic}
          onChange={setTopic}
          multiline
        />
        <div>
          <span className="block text-base font-bold mb-2">Where is it going?</span>
          <Choice options={Object.keys(platforms)} value={platform} onChange={setPlatform} />
        </div>
        <div>
          <span className="block text-base font-bold mb-2">What should it do?</span>
          <Choice options={goals} value={goal} onChange={setGoal} />
        </div>
        {error && <ErrorNote message={error} />}
        <PrimaryButton onClick={run} loading={loading} disabled={!product && !topic.trim()}>
          <PenLine className="h-4 w-4" /> {loading ? "Writing..." : "Write 3 options"}
        </PrimaryButton>
      </Card>

      {posts.map((p, i) => {
        const full = [p.hook, "", p.body, "", p.callToAction, p.tags && `\n${p.tags}`].filter((x) => x !== undefined && x !== "").join("\n\n");
        return (
          <Card key={i}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7a6f6d]">Option {i + 1}</span>
              <CopyButton text={full} />
            </div>
            <p className="font-display text-xl mb-3">{p.hook}</p>
            <p className="whitespace-pre-line text-[#b8aaa8] mb-3">{p.body}</p>
            <p className="font-bold text-[#d97a93]">{p.callToAction}</p>
            {p.tags && <p className="mt-3 text-sm text-[#7a6f6d]">{p.tags}</p>}
          </Card>
        );
      })}
    </div>
  );
};

export default ContentAgent;
