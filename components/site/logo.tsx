import { SITE } from "@/data/site";

export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M20 3 C15 9 15 17 20 24 C25 17 25 9 20 3 Z" />
      <path d="M20 24 C15 21 10 15 9 9 C14 10 18 14 20 18" />
      <path d="M20 24 C25 21 30 15 31 9 C26 10 22 14 20 18" />
      <path d="M20 24 C13 24 6 21 2 15 C8 14 13 17 16 20" />
      <path d="M20 24 C27 24 34 21 38 15 C32 14 27 17 24 20" />
      <path d="M8 26.5 H32" />
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${tone === "light" ? "text-ivory" : "text-foreground"}`}>
      <LotusMark className="h-6 w-8 text-gold" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] font-semibold tracking-tight">{SITE.short}</span>
        <span className="mt-0.5 text-[8.5px] font-medium uppercase tracking-[0.42em] opacity-70">Handicraft</span>
      </span>
    </span>
  );
}
