import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { SITE, whatsappLink } from "@/data/site";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Visit() {
  const items = [
    { icon: MapPin, label: "Workshop", value: SITE.address },
    { icon: Clock, label: "Open", value: SITE.hours },
    { icon: Phone, label: "Call", value: SITE.phone, href: `tel:${SITE.phone.replace(/[^+\d]/g, "")}` },
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  ];
  return (
    <section id="visit" className="relative scroll-mt-20 overflow-hidden bg-stone pt-24 text-ivory sm:pt-32">
      <div aria-hidden="true" className="absolute inset-0 marble-dark" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <SectionHeading eyebrow="Visit the workshop" title={<>Come see them <em className="font-normal text-gold-gradient">being carved.</em></>} hindi="पधारिए" align="left" tone="light">
            Choosing a moorti is personal. Visit us, meet the artisans, and pick the piece that feels right — or video-call us and we’ll walk you through the shelves.
          </SectionHeading>
          <Reveal className="grid gap-px overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/10 sm:grid-cols-2">
            {items.map(({ icon: Icon, label, value, href }) => {
              const body = (
                <>
                  <Icon className="size-5 text-gold-soft" aria-hidden="true" />
                  <span className="mt-4 block text-[11px] uppercase tracking-[0.24em] text-ivory/50">{label}</span>
                  <span className="mt-1 block text-[15px] leading-snug text-ivory/90">{value}</span>
                </>
              );
              return href ? (
                <a key={label} href={href} className="bg-stone/90 p-6 outline-none transition-colors hover:bg-stone/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold">{body}</a>
              ) : (
                <div key={label} className="bg-stone/90 p-6">{body}</div>
              );
            })}
          </Reveal>
        </div>

        <Reveal className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-gold/25 bg-gradient-to-r from-gold/15 to-transparent p-7 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="font-display text-3xl font-medium leading-tight sm:text-4xl">Have a moorti in mind?</p>
            <p className="mt-1 text-ivory/60">Send a photo on WhatsApp — we’ll tell you what’s possible.</p>
          </div>
          <a href={whatsappLink(`Namaste ${SITE.name}, I have a moorti in mind. Sharing a photo.`)} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-sm font-medium text-stone outline-none transition-transform hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-gold-soft">
            Chat on WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>

        <footer className="mt-20 flex flex-col gap-8 border-t border-ivory/10 py-10 pb-[calc(env(safe-area-inset-bottom)+96px)] sm:pb-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <Logo tone="light" />
            <p className="max-w-xs text-sm text-ivory/50">{SITE.description}</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ivory/70">
            <a href="#collection" className="hover:text-ivory">Collection</a>
            <a href="#craft" className="hover:text-ivory">The Craft</a>
            <a href="#bespoke" className="hover:text-ivory">Custom Orders</a>
            <a href={SITE.instagram} className="inline-flex items-center gap-1.5 hover:text-ivory"><InstagramIcon className="size-4" /> Instagram</a>
          </nav>
          <p className="text-xs text-ivory/40">© {new Date().getFullYear()} {SITE.name}</p>
        </footer>
      </div>
    </section>
  );
}
