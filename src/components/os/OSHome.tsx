import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Hammer, Trash2 } from "lucide-react";
import { agents } from "./agents";
import { deleteProduct, loadProducts } from "./products";
import { loadAgents } from "./customAgents";
import { Card, Eyebrow } from "./ui";

const OSHome = () => {
  const [products, setProducts] = useState(loadProducts);
  const [myAgents] = useState(loadAgents);

  return (
    <div className="space-y-10">
      <div>
        <Eyebrow>Your Worker Agentic OS</Eyebrow>
        <h1 className="font-display text-4xl md:text-6xl mb-4">
          Your age is your <em className="text-[#d97a93]">advantage</em>.
        </h1>
        <p className="text-lg text-[#b8aaa8] max-w-2xl">
          You've got decades of know-how. Now you've got a team to help you use it.
          Each agent does one job, in your voice, so you're never starting from a blank page again.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {agents.map((a) => {
          const body = (
            <Card className={`h-full ${a.live ? "hover:border-[#d97a93] transition" : "opacity-50"}`}>
              <a.icon className="h-6 w-6 text-[#d97a93] mb-3" />
              <p className="font-display text-2xl mb-1">{a.name}</p>
              <p className="text-[#b8aaa8] mb-3">{a.tagline}</p>
              {a.live ? (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[#d97a93]">Open <ArrowRight className="h-4 w-4" /></span>
              ) : (
                <span className="text-xs uppercase tracking-widest text-[#7a6f6d]">Coming soon</span>
              )}
            </Card>
          );
          return a.live ? <Link key={a.id} to={a.path}>{body}</Link> : <div key={a.id}>{body}</div>;
        })}
        <Link to="/agent-builder" className="sm:col-span-2">
          <Card className="bg-[#f0e9dd] border-[#f0e9dd] text-[#1a1416] hover:opacity-95">
            <Hammer className="h-6 w-6 text-[#d97a93] mb-3" />
            <p className="font-display text-2xl mb-1">Build your own agent</p>
            <p>Learn the 4 parts of every agent, then make one for your own business. No code.</p>
          </Card>
        </Link>
      </div>

      {myAgents.length > 0 && (
        <div>
          <h2 className="font-display text-3xl mb-4">Agents you built</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {myAgents.map((a) => (
              <Link key={a.id} to={`/my-agents/${a.id}`}>
                <Card className="hover:border-[#d97a93] transition">
                  <p className="font-display text-xl">{a.name}</p>
                  <p className="text-sm text-[#b8aaa8]">{a.job}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 className="font-display text-3xl mb-4">Your products</h2>
          <div className="space-y-3">
            {products.map((p) => (
              <Card key={p.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-xl">{p.title}</p>
                  <p className="text-sm text-[#b8aaa8]">
                    {p.idea.format} · {p.blueprint.price} · {p.completed_steps.length} of {p.blueprint.launchSteps.length} launch steps done
                  </p>
                </div>
                <button
                  aria-label={`Delete ${p.title}`}
                  onClick={() => { deleteProduct(p.id); setProducts(loadProducts()); }}
                  className="text-[#7a6f6d] hover:text-[#d97a93]"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OSHome;
