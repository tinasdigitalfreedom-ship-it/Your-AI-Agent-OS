import { useState } from "react";
import { Palette } from "lucide-react";
import { runAgent } from "../brain";
import { describeProduct, SavedProduct } from "../products";
import ProductPicker from "../ProductPicker";
import { Card, Choice, CopyButton, ErrorNote, Eyebrow, Field, PrimaryButton, THINKING_ERROR } from "../ui";

interface Brief {
  headlineText: string;
  supportingText: string;
  layout: string;
  colors: { name: string; hex: string }[];
  fonts: string;
  canvaSearch: string[];
  imagePrompt: string;
  tips: string[];
}

const schema = {
  type: "object",
  properties: {
    headlineText: { type: "string" },
    supportingText: { type: "string" },
    layout: { type: "string" },
    colors: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, hex: { type: "string" } },
        required: ["name", "hex"],
      },
    },
    fonts: { type: "string" },
    canvaSearch: { type: "array", items: { type: "string" } },
    imagePrompt: { type: "string" },
    tips: { type: "array", items: { type: "string" } },
  },
  required: ["headlineText", "supportingText", "layout", "colors", "fonts", "canvaSearch", "imagePrompt", "tips"],
};

const assets: Record<string, string> = {
  "Product cover": "an ebook or guide cover, portrait, 1600 x 2400 px",
  "Pinterest pin": "a Pinterest pin, 1000 x 1500 px, big readable text",
  "Instagram post": "a square Instagram post, 1080 x 1080 px",
  "Product mockup": "a mockup showing the product on a tablet or as printed pages on a desk",
};

const styles = ["Dark and elegant", "Soft and warm", "Bright and cheerful", "Clean and simple"];

const DesignAgent = () => {
  const [product, setProduct] = useState<SavedProduct | null>(null);
  const [topic, setTopic] = useState("");
  const [asset, setAsset] = useState("Product cover");
  const [style, setStyle] = useState("Dark and elegant");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const subject = [product && describeProduct(product), topic && `Notes: ${topic}`].filter(Boolean).join("\n");
      const res = await runAgent<Brief>(
        `Create a simple design brief a beginner can follow in Canva.

${subject}

Make: ${assets[asset]}
Style: ${style}

Return:
- headlineText and supportingText: the exact words to put on the design (short, readable)
- layout: plain step by step description of where things go
- colors: 3 to 4 colors with hex codes
- fonts: 2 free Canva fonts that pair well
- canvaSearch: 4 search terms to find a matching Canva template
- imagePrompt: a detailed prompt for an AI image generator for the background or main image. No text in the image. If people are shown, show real, confident women over 40.
- tips: 3 short tips so the design looks polished, not homemade`,
        schema
      );
      setBrief(res);
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Design Agent</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">You don't have to be a <em className="text-[#d97a93]">designer</em>.</h1>
        <p className="text-lg text-[#b8aaa8] max-w-2xl">
          Tell me what you need. I'll give you the exact words, colors, and fonts to use in Canva, plus a ready-to-paste prompt for the main picture.
        </p>
      </div>
      <Card className="space-y-6">
        <div>
          <span className="block text-base font-bold mb-2">Design for one of your products?</span>
          <ProductPicker value={product} onChange={setProduct} />
        </div>
        <Field
          label={product ? "Anything else? (optional)" : "What is the design about?"}
          placeholder="My budget planner for women starting over..."
          value={topic}
          onChange={setTopic}
        />
        <div>
          <span className="block text-base font-bold mb-2">What are we making?</span>
          <Choice options={Object.keys(assets)} value={asset} onChange={setAsset} />
        </div>
        <div>
          <span className="block text-base font-bold mb-2">What feel?</span>
          <Choice options={styles} value={style} onChange={setStyle} />
        </div>
        {error && <ErrorNote message={error} />}
        <PrimaryButton onClick={run} loading={loading} disabled={!product && !topic.trim()}>
          <Palette className="h-4 w-4" /> {loading ? "Designing..." : "Make my design brief"}
        </PrimaryButton>
      </Card>

      {brief && (
        <>
          <Card>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7a6f6d] mb-2">Words on the design</p>
            <p className="font-display text-3xl mb-1">{brief.headlineText}</p>
            <p className="text-[#b8aaa8]">{brief.supportingText}</p>
          </Card>
          <Card>
            <h2 className="font-display text-2xl mb-2">Layout</h2>
            <p className="whitespace-pre-line text-[#b8aaa8]">{brief.layout}</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h2 className="font-display text-2xl mb-3">Colors</h2>
              <ul className="space-y-2">
                {brief.colors.map((c) => (
                  <li key={c.hex} className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full border border-[#2a2224]" style={{ background: c.hex }} />
                    <span>{c.name}</span>
                    <span className="text-sm text-[#7a6f6d]">{c.hex}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="font-display text-2xl mb-2">Fonts</h2>
              <p className="text-[#b8aaa8] mb-4">{brief.fonts}</p>
              <h2 className="font-display text-xl mb-2">Search Canva for</h2>
              <ul className="space-y-1 text-[#b8aaa8]">{brief.canvaSearch.map((s) => <li key={s}>• {s}</li>)}</ul>
            </Card>
          </div>
          <Card>
            <h2 className="font-display text-2xl mb-2">Make it look polished</h2>
            <ul className="space-y-1 text-[#b8aaa8]">{brief.tips.map((t) => <li key={t}>• {t}</li>)}</ul>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl">Main image</h2>
              <CopyButton text={brief.imagePrompt} />
            </div>
            <p className="text-[#b8aaa8] mb-3">{brief.imagePrompt}</p>
            <p className="text-sm text-[#7a6f6d]">
              Copy this and paste it into Canva's Magic Media (Apps, then Magic Media) or any AI image tool you like.
            </p>
          </Card>
        </>
      )}
    </div>
  );
};

export default DesignAgent;
