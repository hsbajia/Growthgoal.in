"use client";

import * as React from "react";
import { Gem, Hammer, PenLine, Sparkles } from "lucide-react";
import { MarbleDefs, MoortiArt } from "@/components/ui/moorti-art";
import { SectionHeading } from "@/components/site/section-heading";
import { isCutout } from "@/lib/content";

const STEPS = [
  { icon: Gem, title: "Choosing the stone", hi: "पत्थर का चयन", text: "Every block is checked for colour, veining and hidden cracks before a single line is drawn on it." },
  { icon: PenLine, title: "Marking the form", hi: "रेखांकन", text: "Proportions are drawn straight onto the stone by hand, following traditional measures for each deity." },
  { icon: Hammer, title: "Carving", hi: "नक्काशी", text: "Chisel, hammer and patience. The figure is freed slowly, layer by layer, until the face appears." },
  { icon: Sparkles, title: "Finishing", hi: "सजावट", text: "Hours of polishing — then gold leaf, colour and fine detailing by hand, wherever the piece calls for it." },
];

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function Craft({ image }: { image?: string }) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const visualRef = React.useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduce.matches) { setProgress(1); return; }
      const vh = window.innerHeight;
      let p: number;
      if (wide.matches && sectionRef.current) {
        const r = sectionRef.current.getBoundingClientRect();
        p = clamp((vh * 0.55 - r.top) / Math.max(1, r.height - vh * 0.7));
      } else if (visualRef.current) {
        const r = visualRef.current.getBoundingClientRect();
        p = clamp((vh * 0.92 - r.top) / (vh * 0.75));
      } else p = 0;
      setProgress((old) => (Math.abs(old - p) < 0.002 ? old : p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const carve = clamp((progress - 0.08) / 0.8);
  const stepIndex = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
  const current = STEPS[stepIndex]!;

  return (
    <section id="craft" ref={sectionRef} className="relative scroll-mt-20 bg-[#F1EBE2] py-24 sm:py-32">
      <MarbleDefs uid="craft" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)] lg:self-start">
          <div className="flex h-full flex-col justify-center gap-10">
            <div className="lg:hidden">
              <SectionHeading eyebrow="The craft" title={<>From stone <em className="font-normal text-gold-gradient">to soul.</em></>} hindi="पत्थर से प्राण तक" align="left" />
            </div>
            <div ref={visualRef} className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#26201B] to-[#161210] shadow-[0_40px_80px_-40px_rgba(23,19,16,0.6)]">
              <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(55% 40% at 50% 42%, rgba(255,214,150,${0.15 + carve * 0.35}), transparent 72%)` }} />
              <div className={`absolute ${image && !isCutout(image) ? "inset-0" : "inset-x-[14%] bottom-[9%] top-[19%]"}`}>
                {/* the finished moorti, revealed from the top */}
                <div className="absolute inset-0" style={{ clipPath: `inset(0 0 ${((1 - carve) * 100).toFixed(2)}% 0)` }}>
                  {image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={image} alt="" className={`absolute inset-0 size-full ${isCutout(image) ? "object-contain object-bottom" : "object-cover"}`} />
                    : <MoortiArt uid="craft" kind="ganesha" tone="white" accent={progress > 0.78 ? "#C8502E" : undefined} />}
                </div>
                {/* the raw block, chipped away */}
                <div aria-hidden="true" className="absolute inset-x-[4%] bottom-[1%] top-[6%] rounded-[6px] marble-face shadow-[inset_0_0_30px_rgba(0,0,0,0.12)]" style={{ clipPath: `inset(${(carve * 100).toFixed(2)}% 0 0 0)` }}>
                  <svg className="absolute inset-0 size-full text-stone/15" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
                    <path d="M8 20 L22 18 M30 40 L44 37 M60 22 L76 25 M14 62 L30 60 M58 70 L82 66 M40 86 L55 84 M70 48 L90 46" />
                  </svg>
                </div>
                {/* chisel line */}
                {carve > 0.01 && carve < 0.99 && (
                  <div aria-hidden="true" className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-soft to-transparent shadow-[0_0_14px_rgba(240,213,142,0.9)]" style={{ top: `${(6 + carve * 93).toFixed(2)}%` }} />
                )}
              </div>
              <div className="absolute inset-x-0 top-[7%] flex flex-col items-center gap-1 text-center">
                <span className="font-mono text-[10px] tracking-[0.3em] text-ivory/50">{String(stepIndex + 1).padStart(2, "0")} / 04</span>
                <span key={current.title} className="font-display text-xl italic text-ivory animate-in fade-in [animation-duration:400ms]">{current.title}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="hidden lg:block lg:pt-[12vh]">
            <SectionHeading eyebrow="The craft" title={<>From stone <em className="font-normal text-gold-gradient">to soul.</em></>} hindi="पत्थर से प्राण तक" align="left">
              Nothing on our shelves is moulded or cast. Each moorti passes through the same four stages — and the same pair of hands — from block to blessing.
            </SectionHeading>
          </div>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground lg:hidden">
            Nothing on our shelves is moulded or cast. Each moorti passes through the same four stages — and the same pair of hands — from block to blessing.
          </p>
          <ol className="mt-10 flex flex-col gap-4 lg:mt-16 lg:gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const on = i <= stepIndex;
              return (
                <li key={step.title} className={`flex gap-5 rounded-3xl border p-6 transition-colors duration-500 lg:min-h-[38vh] lg:items-center lg:rounded-none lg:border-0 lg:border-t lg:p-0 lg:py-10 ${on ? "border-gold/40 bg-card/70 lg:bg-transparent" : "border-border bg-card/40 lg:bg-transparent"} lg:border-gold/25`}>
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${on ? "border-gold bg-gold text-ivory" : "border-border text-muted-foreground"}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground">STEP {String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1 font-display text-3xl font-medium leading-tight">{step.title}</h3>
                    <p className="font-hindi text-gold">{step.hi}</p>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
