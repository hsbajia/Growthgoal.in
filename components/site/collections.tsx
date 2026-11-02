import { ArrowUpRight } from "lucide-react";
import { MarbleDefs, MoortiArt } from "@/components/ui/moorti-art";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { isCutout, whatsappLink, type Category, type SiteInfo } from "@/lib/content";

const MORE = ["Radha Krishna", "Lakshmi", "Hanuman", "Durga Maa", "Sai Baba", "Ram Darbar", "Jain Tirthankar", "Gau Mata"];

export function Collections({ categories, site }: { categories: Category[]; site: SiteInfo }) {
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
          {categories.map((cat, i) => (
            <Reveal as="li" key={cat.id} delay={(i % 3) * 90} className="w-[74vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none">
              <a href={whatsappLink(site.whatsapp, `Namaste ${site.name}, I would like to see your ${cat.name} collection.`)} target="_blank" rel="noreferrer" className="group block rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#EFE9DF]">
                  <div aria-hidden="true" className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(55% 45% at 50% 45%, rgba(255,226,170,0.6), transparent 70%)" }} />
                  <div aria-hidden="true" className="absolute bottom-[8%] left-[22%] right-[22%] h-[4%] rounded-[50%] bg-stone/25 blur-md" />
                  <div className="absolute inset-x-[12%] bottom-[9%] top-[12%] transition-transform duration-700 ease-[cubic-bezier(.22,.85,.3,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.04]">
                    {cat.image && isCutout(cat.image)
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={cat.image} alt={cat.name} loading="lazy" className="absolute inset-0 size-full object-contain object-bottom" />
                      : !cat.image && <MoortiArt uid="col" kind={cat.kind} tone={cat.tone} accent={cat.accent} />}
                  </div>
                  {cat.image && !isCutout(cat.image) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  )}
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
