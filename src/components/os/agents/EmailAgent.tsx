import { useState } from "react";
import { Mail } from "lucide-react";
import { runAgent } from "../brain";
import { describeProduct, SavedProduct } from "../products";
import ProductPicker from "../ProductPicker";
import { Card, Choice, CopyButton, ErrorNote, Eyebrow, Field, PrimaryButton, THINKING_ERROR } from "../ui";

interface Email {
  sendWhen: string;
  subject: string;
  preview: string;
  body: string;
}

const schema = {
  type: "object",
  properties: {
    emails: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sendWhen: { type: "string" },
          subject: { type: "string" },
          preview: { type: "string" },
          body: { type: "string" },
        },
        required: ["sendWhen", "subject", "preview", "body"],
      },
    },
  },
  required: ["emails"],
};

const kinds: Record<string, string> = {
  "Welcome series": "3 welcome emails for someone who just joined the list. Email 1: warm hello and who I am. Email 2: my story and why age is an advantage. Email 3: one helpful tip and a soft mention of the product.",
  "Launch series": "3 launch emails. Email 1: the problem and that something is coming. Email 2: the product is here, what is inside, the price. Email 3: a kind, honest reminder with a real fact (price or a real deadline if given), no fake urgency.",
  "Follow-up": "2 follow-up emails for people who clicked but did not buy. Answer the worry \"is this real or another scam\" honestly. Kind, no pressure.",
  "One email": "1 single email about the topic.",
};

const EmailAgent = () => {
  const [product, setProduct] = useState<SavedProduct | null>(null);
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState("Welcome series");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const subject = [product && describeProduct(product), topic && `Notes: ${topic}`].filter(Boolean).join("\n");
      const res = await runAgent<{ emails: Email[] }>(
        `Write emails from Tina in first person.

${subject}

What to write: ${kinds[kind]}

Email rules: open with a rhetorical question or a relatable moment. Short lines with line breaks, not dense paragraphs. Use a "No more ___." triplet in at least one email. End with one direct, specific next step. Subject lines are plain and curious, not clickbait. Sign off as Tina.
sendWhen says when to send it (for example "Right after they sign up" or "Day 3").`,
        schema
      );
      setEmails(res.emails);
    } catch {
      setError(THINKING_ERROR);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Email Agent</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Emails that sound like <em className="text-[#d97a93]">you</em>, not a robot.</h1>
        <p className="text-lg text-[#b8aaa8] max-w-2xl">
          Your list is the one thing no app can take away from you. Let's write to them like a friend would.
        </p>
      </div>
      <Card className="space-y-6">
        <div>
          <span className="block text-base font-bold mb-2">Which product is this for?</span>
          <ProductPicker value={product} onChange={setProduct} />
        </div>
        <Field
          label={product ? "Anything else to include? (optional)" : "What are the emails about?"}
          placeholder="Doors close Friday, I'm adding a free bonus..."
          value={topic}
          onChange={setTopic}
          multiline
        />
        <div>
          <span className="block text-base font-bold mb-2">What kind of emails?</span>
          <Choice options={Object.keys(kinds)} value={kind} onChange={setKind} />
        </div>
        {error && <ErrorNote message={error} />}
        <PrimaryButton onClick={run} loading={loading} disabled={!product && !topic.trim()}>
          <Mail className="h-4 w-4" /> {loading ? "Writing..." : "Write my emails"}
        </PrimaryButton>
      </Card>

      {emails.map((e, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7a6f6d]">Email {i + 1} · {e.sendWhen}</span>
            <CopyButton text={`Subject: ${e.subject}\nPreview: ${e.preview}\n\n${e.body}`} />
          </div>
          <p className="font-display text-xl">{e.subject}</p>
          <p className="text-sm text-[#7a6f6d] mb-4">{e.preview}</p>
          <p className="whitespace-pre-line text-[#b8aaa8]">{e.body}</p>
        </Card>
      ))}
    </div>
  );
};

export default EmailAgent;
