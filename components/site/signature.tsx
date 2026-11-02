import { ArrowUpRight } from "lucide-react";
import { MarbleDefs, MoortiArt } from "@/components/ui/moorti-art";
import { Reveal } from "@/components/site/reveal";
import { isCutout, whatsappLink, type SiteInfo } from "@/lib/content";

export function Signature({ site }: { site: SiteInfo }) {
  return (
    <section className="relative overflow-hidden py-24 text-ivory marble-dark sm:py-32">
      <MarbleDefs uid="sig" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-gold-soft">
            <span className="h-px w-8 bg-current opacity-60" /> Our belief
          </p>
          <blockquote className="mt-6 text-balance font-display text-[34px] font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
            “A moorti is not made. <em className="font-normal text-gold-gradient">It is revealed</em> — one patient strike at a time.”
          </blockquote>
          <p className="mt-6 font-hindi text-xl text-gold-soft">{site.taglineHi}</p>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ivory/65">
            That is why we never rush a face, never cast a body, and never let a piece leave the workshop until it feels ready to be prayed to.
          </p>
          <a href={whatsappLink(site.whatsapp, `Namaste ${site.name}, I would like to bring a moorti home. Please guide me.`)} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-sm font-medium text-stone outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_10px_30px_-10px_rgba(240,213,142,0.6)] focus-visible:ring-2 focus-visible:ring-gold-soft">
            Bring one home <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>
        <Reveal delay={120} className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px]">
            <div aria-hidden="true" className="absolute inset-[-10%]" style={{ background: "radial-gradient(45% 45% at 50% 48%, rgba(255,214,150,0.38), transparent 72%)" }} />
            <div aria-hidden="true" className="absolute -bottom-[1%] left-[16%] right-[16%] h-[5%] rounded-[50%] bg-black/60 blur-lg" />
            <div className="absolute inset-x-[4%] bottom-[2%] top-0">
              {site.signatureImage
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={site.signatureImage} alt="" loading="lazy" className={`absolute inset-0 size-full ${isCutout(site.signatureImage) ? "object-contain object-bottom" : "rounded-3xl object-cover"}`} />
                : <MoortiArt uid="sig" kind="mandir" tone="white" />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
