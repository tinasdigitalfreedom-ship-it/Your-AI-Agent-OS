import { useState, ReactNode } from "react";
import { Check, Copy, Loader2 } from "lucide-react";

// Small building blocks shared by every agent page, styled per design.md.

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97a93] mb-3">{children}</p>
);

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-[#1a1416] border border-[#2a2224] rounded-2xl p-6 ${className}`}>{children}</div>
);

export const PrimaryButton = ({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d97a93] px-7 py-3 text-base font-bold text-[#0d0a0c] transition hover:bg-[#e48ea5] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export const ghostClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#2a2224] px-6 py-3 text-base text-[#f5ede7] transition hover:border-[#d97a93]";

export const GhostButton = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className={ghostClass}>
    {children}
  </button>
);

export const Field = ({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => {
  const base =
    "w-full bg-[#0d0a0c] border border-[#2a2224] rounded-xl px-4 py-3 text-base text-[#f5ede7] placeholder:text-[#7a6f6d] focus:outline-none focus:border-[#d97a93]";
  return (
    <label className="block">
      <span className="block text-base font-bold text-[#f5ede7] mb-1">{label}</span>
      {hint && <span className="block text-sm text-[#b8aaa8] mb-2">{hint}</span>}
      {multiline ? (
        <textarea rows={3} className={base} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={base} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
};

export const Choice = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(o)}
        className={`rounded-full px-4 py-2 text-sm border transition ${
          value === o
            ? "bg-[#d97a93] border-[#d97a93] text-[#0d0a0c] font-bold"
            : "border-[#2a2224] text-[#b8aaa8] hover:border-[#d97a93]"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-sm text-[#d97a93] hover:underline"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export const ErrorNote = ({ message }: { message: string }) => (
  <p className="rounded-xl border border-[#d97a93]/40 bg-[#3a2530] px-4 py-3 text-sm text-[#f5ede7]">{message}</p>
);

export const THINKING_ERROR =
  "That didn't go through. It happens. Give it another try in a moment.";
