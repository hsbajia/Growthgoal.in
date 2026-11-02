"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import MoortiShelfHero from "@/components/ui/moorti-shelf-hero";
import { whatsappLink, type Moorti, type SiteInfo } from "@/lib/content";

export function Hero({ items, site }: { items: Moorti[]; site: SiteInfo }) {
  return (
    <div id="top" className="relative overflow-hidden pt-[calc(env(safe-area-inset-top)+64px)] sm:pt-[72px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 40% at 50% 58%, rgba(255,236,205,0.6), transparent 70%)" }} />

      <MoortiShelfHero
        items={items}
        autoplay
        intro={
          <header className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-8 text-center sm:pt-12">
            <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground animate-in fade-in [animation-duration:900ms] sm:text-[11px] sm:tracking-[0.32em]">
              <span className="hidden h-px w-8 bg-gold/60 sm:block" /> {site.tagline} <span className="hidden h-px w-8 bg-gold/60 sm:block" />
            </p>
            <h1 className="mt-4 text-balance font-display text-[44px] font-medium leading-[0.95] tracking-tight animate-in fade-in slide-in-from-bottom-3 [animation-duration:900ms] sm:text-6xl lg:text-7xl">
              Stone, shaped into <em className="font-normal text-gold-gradient">devotion.</em>
            </h1>
            <p className="mt-3 font-hindi text-lg text-gold animate-in fade-in [animation-delay:200ms] [animation-duration:900ms] fill-mode-both sm:text-xl">{site.taglineHi}</p>
          </header>
        }
        caption="Hover along the shelf — or tap a moorti — to bring it into the light."
        action={
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <a href="#collection" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto">
              Explore the collection <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <a href={whatsappLink(site.whatsapp, `Namaste ${site.name}, I would like to know more about your marble moortis.`)} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/15 bg-card/60 px-7 py-3.5 text-sm font-medium outline-none backdrop-blur transition-colors hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-gold sm:w-auto">
              Enquire on WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        }
        detailAction={(item, close) => (
          <>
            <a href={whatsappLink(site.whatsapp, `Namaste ${site.name}, I am interested in "${item.name}"${item.tag ? ` (${item.tag})` : ""}. Please share price and availability.`)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold">
              Enquire on WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <button type="button" onClick={() => { close(); window.setTimeout(() => document.getElementById("bespoke")?.scrollIntoView({ behavior: "smooth" }), 650); }} className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-foreground/15 px-6 py-3.5 text-sm font-medium outline-none transition-colors hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-gold">
              Get it in a custom size
            </button>
          </>
        )}
      />
    </div>
  );
}
