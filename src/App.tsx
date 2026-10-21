import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import AgentOS from "./pages/AgentOS";
import OSHome from "./components/os/OSHome";
import ProductHelper from "./components/os/product-helper/ProductHelper";
import ResearchAgent from "./components/os/agents/ResearchAgent";
import ContentAgent from "./components/os/agents/ContentAgent";
import SocialAgent from "./components/os/agents/SocialAgent";
import EmailAgent from "./components/os/agents/EmailAgent";
import DesignAgent from "./components/os/agents/DesignAgent";
import AgentBuilder from "./components/os/agents/AgentBuilder";

// Links from when the agents lived under /os (like /os/social-agent) go to
// the same agent at its new address.
const OldOsLink = () => {
  const { "*": rest } = useParams();
  return <Navigate to={`/${rest ?? ""}`} replace />;
};

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AgentOS />}>
          <Route index element={<OSHome />} />
          <Route path="product-helper" element={<ProductHelper />} />
          <Route path="research-agent" element={<ResearchAgent />} />
          <Route path="content-agent" element={<ContentAgent />} />
          <Route path="social-agent" element={<SocialAgent />} />
          <Route path="email-agent" element={<EmailAgent />} />
          <Route path="design-agent" element={<DesignAgent />} />
          <Route path="agent-builder" element={<AgentBuilder />} />
          <Route path="my-agents/:agentId" element={<AgentBuilder />} />
          <Route path="os/*" element={<OldOsLink />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
