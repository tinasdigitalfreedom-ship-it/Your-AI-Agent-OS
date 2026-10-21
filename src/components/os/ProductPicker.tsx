import { useState } from "react";
import { Link } from "react-router-dom";
import { loadProducts, SavedProduct } from "./products";

// Lets any agent pull in a product made with the Product Helper.
const ProductPicker = ({ value, onChange }: { value: SavedProduct | null; onChange: (p: SavedProduct | null) => void }) => {
  const [products] = useState(loadProducts);
  if (products.length === 0) {
    return (
      <p className="text-sm text-[#b8aaa8]">
        No saved products yet. You can type your topic below, or{" "}
        <Link to="/product-helper" className="text-[#d97a93] underline">make one with the Product Helper</Link>.
      </p>
    );
  }
  return (
    <select
      className="w-full bg-[#0d0a0c] border border-[#2a2224] rounded-xl px-4 py-3 text-base text-[#f5ede7]"
      value={value?.id ?? ""}
      onChange={(e) => onChange(products.find((p) => p.id === e.target.value) ?? null)}
    >
      <option value="">No product, I'll type a topic</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>{p.title}</option>
      ))}
    </select>
  );
};

export default ProductPicker;
