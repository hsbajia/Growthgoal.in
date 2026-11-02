"use client";

import * as React from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { telLink, whatsappLink, type SiteInfo } from "@/lib/content";

const NAV = [
  { href: "#collection", label: "Collection", hi: "संग्रह" },
  { href: "#craft", label: "The Craft", hi: "कारीगरी" },
  { href: "#bespoke", label: "Custom Orders", hi: "ऑर्डर" },
  { href: "#visit", label: "Visit Us", hi: "संपर्क" },
];

export function SiteHeader({ site }: { site: SiteInfo }) {
  const enquire = whatsappLink(site.whatsapp, `Namaste ${site.name}, I would like to know more about your marble moortis.`);
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${scrolled || open ? "bg-background/85 shadow-[0_1px_0_var(--border)] backdrop-blur-lg" : "bg-transparent"}`} style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-[72px] sm:px-8">
          <a href="#top" aria-label={`${site.name} — home`} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <Logo name={site.short} />
          </a>
          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="group relative text-[13px] font-medium uppercase tracking-[0.16em] text-foreground/75 outline-none transition-colors hover:text-foreground focus-visible:text-foreground">
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={enquire} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex">
              Enquire <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/70 outline-none transition-colors hover:border-gold focus-visible:ring-2 focus-visible:ring-gold lg:hidden">
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" hidden={!open} className="fixed inset-0 z-40 bg-background lg:hidden" style={{ paddingTop: "calc(env(safe-area-inset-top) + 64px)" }}>
        <nav aria-label="Mobile" className="flex h-full flex-col justify-between px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-6">
          <ul className="flex flex-col">
            {NAV.map((item, i) => (
              <li key={item.href} className="border-b border-border/80 animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${60 + i * 60}ms` }}>
                <a href={item.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-5 outline-none">
                  <span className="font-display text-[34px] font-medium leading-none">{item.label}</span>
                  <span className="font-hindi text-sm text-gold">{item.hi}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4">
            <p className="font-hindi text-2xl text-gold">{site.taglineHi}</p>
            <a href={enquire} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-medium text-background">
              Enquire on WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <a href={telLink(site.phone)} className="text-center text-xs text-muted-foreground">{site.phone}</a>
          </div>
        </nav>
      </div>
    </>
  );
}
