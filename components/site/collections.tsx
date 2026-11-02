import { ArrowUpRight } from "lucide-react";
import { MarbleDefs, MoortiArt } from "@/components/ui/moorti-art";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { CATEGORIES } from "@/data/moortis";
import { SITE, whatsappLink } from "@/data/site";

const MORE = ["Radha Krishna", "Lakshmi", "Hanuman", "Durga Maa", "Sai Baba", "Ram Darbar", "Jain Tirthankar", "Gau Mata"];

export function Collections() {
  return (
    <section id="collection" className="relative scroll-mt-20 py-24 sm:py-32">
      <MarbleDefs uid="col" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="The collection" title={<>Every deity, <em className="font-normal text-gold-gradient">every size.</em></>} hindi="हर मूर्ति, आपके घर के लिए">
          From palm-sized moortis for a car dashboard to life-size pieces for temples — browse by family, or tell us what you have in mind.
        </SectionHeading>
      </div>

      <div className="mt-14 sm:mt-16">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] sm:px-8 md:mx-auto md:grid md:max-w-7xl md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat, i) => (
            <Reveal as="li" key={cat.id} delay={(i % 3) * 90} className="w-[74vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none">
              <a href={whatsappLink(`Namaste ${SITE.name}, I would like to see your ${cat.name} collection.`)} target="_blank" rel="noreferrer" className="group block rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                <div className="relative aspect-[4/5] overflow-hidden rounded-b-[24px] rounded-t-[999px] border border-border bg-gradient-to-b from-[#F1EADF] to-[#E4D9C7] shadow-[0_30px_60px_-30px_rgba(23,19,16,0.35)]">
                  <div aria-hidden="true" className="absolute inset-3 rounded-b-[18px] rounded-t-[999px] border border-gold/30" />
                  <div aria-hidden="true" className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(55% 45% at 50% 45%, rgba(255,226,170,0.6), transparent 70%)" }} />
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[14%] marble-face" />
                  <div className="absolute inset-x-[13%] bottom-[11%] top-[16%] transition-transform duration-700 ease-[cubic-bezier(.22,.85,.3,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.04]">
                    <MoortiArt uid="col" kind={cat.kind} tone={cat.tone} accent={cat.accent} />
                  </div>
                  <span className="absolute left-1/2 top-[8%] -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex items-end justify-between gap-3 px-2 pt-5">
                  <div>
                    <h3 className="font-display text-[28px] font-medium leading-none">{cat.name}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      <span className="font-hindi text-gold">{cat.nameHi}</span> · {cat.line}
                    </p>
                  </div>
                  <span className="mb-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-300 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal className="mx-auto mt-14 flex max-w-4xl flex-col items-center gap-5 px-5 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Also made on request</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {MORE.map((m) => <li key={m} className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm">{m}</li>)}
        </ul>
      </Reveal>
    </section>
  );
}
