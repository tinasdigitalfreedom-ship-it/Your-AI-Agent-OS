export interface Profile {
  experience: string;
  skills: string;
  helpWho: string;
  hours: string;
  comfort: string;
}

export interface Idea {
  title: string;
  format: string;
  forWho: string;
  problem: string;
  whyYou: string;
  price: string;
  buildTime: string;
}

export interface Blueprint {
  nameOptions: string[];
  promise: string;
  outline: { section: string; whatsInside: string }[];
  bonus: string;
  price: string;
  priceReason: string;
  toolsToBuild: string[];
  whereToSell: string[];
  salesPage: {
    headline: string;
    subheadline: string;
    noMore: string[];
    bullets: string[];
    callToAction: string;
  };
  launchSteps: string[];
  encouragement: string;
}

export interface SavedProduct {
  id: string;
  title: string;
  profile: Profile;
  idea: Idea;
  blueprint: Blueprint;
  completed_steps: number[];
  created: string;
}

const KEY = "os-products";

// Products live in this browser so every agent can use them right away.
export function loadProducts(): SavedProduct[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(products: SavedProduct[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(products));
  } catch {
    // Storage can be blocked in private windows. The page still works.
  }
}

export function saveProduct(product: SavedProduct) {
  write([product, ...loadProducts().filter((p) => p.id !== product.id)]);
}

export function updateSteps(id: string, steps: number[]) {
  write(loadProducts().map((p) => (p.id === id ? { ...p, completed_steps: steps } : p)));
}

export function deleteProduct(id: string) {
  write(loadProducts().filter((p) => p.id !== id));
}

// A short summary other agents can drop into their prompts.
export function describeProduct(p: SavedProduct) {
  return `Product: ${p.title}
Format: ${p.idea.format}
For: ${p.idea.forWho}
Problem it solves: ${p.idea.problem}
Promise: ${p.blueprint.promise}
Price: ${p.blueprint.price}
What's inside: ${p.blueprint.outline.map((o) => o.section).join("; ")}`;
}
