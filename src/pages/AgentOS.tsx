import { useEffect, useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Bot, Hammer, LayoutGrid } from "lucide-react";
import { agents } from "@/components/os/agents";
import { loadAgents } from "@/components/os/customAgents";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition ${
    isActive ? "bg-[#d97a93] text-[#0d0a0c] font-bold" : "text-[#b8aaa8] hover:text-[#f5ede7]"
  }`;

const AgentOS = () => {
  const [myAgents, setMyAgents] = useState(loadAgents);

  useEffect(() => {
    const refresh = () => setMyAgents(loadAgents());
    window.addEventListener("os-agents-changed", refresh);
    return () => window.removeEventListener("os-agents-changed", refresh);
  }, []);

  return (
  <div className="min-h-screen bg-[#0d0a0c] text-[#f5ede7] md:flex">
    <Helmet>
      <title>Your Worker Agentic OS | Digital Business After 40</title>
    </Helmet>
    <aside className="md:w-64 md:min-h-screen md:fixed bg-[#1a1416] border-b md:border-b-0 md:border-r border-[#2a2224] p-4 md:p-6">
      <Link to="/" className="block mb-4 md:mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d97a93]">Digital Business After 40</p>
        <p className="font-display text-2xl leading-tight">Your Worker <span className="whitespace-nowrap">Agentic <em className="text-[#d97a93]">OS</em></span></p>
      </Link>
      <nav className="flex md:flex-col gap-1 overflow-x-auto">
        <NavLink to="/" end className={navClass}>
          <LayoutGrid className="h-4 w-4" /> Home
        </NavLink>
        {agents.filter((a) => a.live).map((a) => (
          <NavLink key={a.id} to={a.path} className={navClass}>
            <a.icon className="h-4 w-4" /> {a.name}
          </NavLink>
        ))}
        <NavLink to="/agent-builder" className={navClass}>
          <Hammer className="h-4 w-4" /> Agent Builder
        </NavLink>
        {myAgents.length > 0 && (
          <p className="hidden md:block text-xs uppercase tracking-widest text-[#7a6f6d] mt-6 mb-1 px-4">My agents</p>
        )}
        {myAgents.map((a) => (
          <NavLink key={a.id} to={`/my-agents/${a.id}`} className={navClass}>
            <Bot className="h-4 w-4" /> {a.name}
          </NavLink>
        ))}
      </nav>
      <div className="hidden md:block mt-8">
        <p className="text-xs uppercase tracking-widest text-[#7a6f6d] mb-2">Coming soon</p>
        {agents.filter((a) => !a.live).map((a) => (
          <p key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm text-[#7a6f6d]">
            <a.icon className="h-4 w-4" /> {a.name}
          </p>
        ))}
      </div>
    </aside>
    <main className="flex-1 md:ml-64 px-4 py-8 md:px-10 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
  );
};

export default AgentOS;
