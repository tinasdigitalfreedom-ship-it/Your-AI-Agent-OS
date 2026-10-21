import { Package, PenLine, Mail, MessageCircle, Rocket, Search, Palette, LucideIcon } from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  path: string;
  live: boolean;
}

// Every helper in the OS. Add a new agent here, give it a page, and it
// shows up in the sidebar and on the home screen.
export const agents: Agent[] = [
  {
    id: "product-helper",
    name: "Product Helper",
    tagline: "Turn what you already know into your first digital product.",
    icon: Package,
    path: "/product-helper",
    live: true,
  },
  {
    id: "research-agent",
    name: "Research Agent",
    tagline: "Check what people want and what they pay before you build.",
    icon: Search,
    path: "/research-agent",
    live: true,
  },
  {
    id: "content-agent",
    name: "Content Agent",
    tagline: "Pins, posts, captions, and video scripts in your own voice.",
    icon: PenLine,
    path: "/content-agent",
    live: true,
  },
  {
    id: "email-agent",
    name: "Email Agent",
    tagline: "Welcome, launch, and follow-up emails that sound like you.",
    icon: Mail,
    path: "/email-agent",
    live: true,
  },
  {
    id: "design-agent",
    name: "Design Agent",
    tagline: "Covers, pins, and mockups. Canva-ready briefs and picture prompts.",
    icon: Palette,
    path: "/design-agent",
    live: true,
  },
  {
    id: "social-agent",
    name: "Social Media Agent",
    tagline: "Plan your week of posts and reply to comments in your own voice.",
    icon: MessageCircle,
    path: "/social-agent",
    live: true,
  },
  {
    id: "launch-helper",
    name: "Launch Helper",
    tagline: "A simple 7-day plan to put your product out there.",
    icon: Rocket,
    path: "/",
    live: false,
  },
];
