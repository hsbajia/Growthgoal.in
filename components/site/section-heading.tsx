import { Reveal } from "@/components/site/reveal";

export function SectionHeading({ eyebrow, title, hindi, children, align = "center", tone = "dark" }: { eyebrow: string; title: React.ReactNode; hindi?: string; children?: React.ReactNode; align?: "center" | "left"; tone?: "dark" | "light" }) {
  return (
    <Reveal className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
      <p className={`flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] ${tone === "light" ? "text-gold-soft" : "text-gold"}`}>
        <span className="h-px w-8 bg-current opacity-60" /> {eyebrow}
      </p>
      <h2 className={`text-balance font-display text-[40px] font-medium leading-[1] tracking-tight sm:text-5xl lg:text-6xl ${tone === "light" ? "text-ivory" : ""}`}>{title}</h2>
      {hindi && <p className={`font-hindi text-lg ${tone === "light" ? "text-gold-soft" : "text-gold"}`}>{hindi}</p>}
      {children && <div className={`max-w-xl text-[15px] leading-relaxed ${tone === "light" ? "text-ivory/70" : "text-muted-foreground"}`}>{children}</div>}
    </Reveal>
  );
}
