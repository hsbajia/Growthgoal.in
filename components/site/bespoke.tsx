"use client";

import * as React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { whatsappLink, type SiteInfo } from "@/lib/content";

const DEITIES = ["Ganesha", "Radha Krishna", "Lakshmi", "Shivling / Shiv Parivar", "Hanuman", "Buddha", "Durga Maa", "Sai Baba", "Home Mandir", "Something else"];
const SIZES = ['Up to 6"', '6" – 12"', '12" – 18"', '18" – 24"', '24" – 36"', 'Above 36"', "Not sure yet"];
const MARBLES = ["White", "Ivory", "Black", "Green", "Pink", "Not sure"];

const field = "h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/25";

export function Bespoke({ site }: { site: SiteInfo }) {
  const [marble, setMarble] = React.useState("White");
  const [sent, setSent] = React.useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `Namaste ${site.name}, I would like a custom moorti.`,
      `Name: ${data.get("name") || "-"}`,
      `Phone: ${data.get("phone") || "-"}`,
      `Moorti: ${data.get("deity") || "-"}`,
      `Size: ${data.get("size") || "-"}`,
      `Marble: ${marble}`,
      data.get("note") ? `Note: ${data.get("note")}` : "",
    ].filter(Boolean);
    window.open(whatsappLink(site.whatsapp, lines.join("\n")), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <section id="bespoke" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeading eyebrow="Custom orders" title={<>Your deity. <em className="font-normal text-gold-gradient">Your size.</em></>} hindi="आपकी आस्था, आपके नाप में" align="left">
            Share a photo, a size or just a feeling — we’ll suggest the stone, sketch the form, and keep you updated with photos while it’s being carved.
          </SectionHeading>
          <Reveal as="ol" className="flex flex-col gap-4">
            {["Tell us the deity, size and space", "Get a sketch, stone options and a quote", "Watch it take shape — photos at every stage", "Delivered and ready for sthapana"].map((t, i) => (
              <li key={t} className="flex items-center gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-lg text-gold">{i + 1}</span>
                <span className="text-[15px]">{t}</span>
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal delay={100}>
          <form onSubmit={onSubmit} className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0_40px_80px_-50px_rgba(23,19,16,0.45)] sm:p-9">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <h3 className="font-display text-3xl font-medium">Request a custom moorti</h3>
            <p className="mt-1 text-sm text-muted-foreground">We reply on WhatsApp, usually the same day.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Your name
                <input name="name" required autoComplete="name" className={field} placeholder="Full name" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Phone / WhatsApp
                <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" className={field} placeholder="+91" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Which moorti?
                <select name="deity" className={field} defaultValue={DEITIES[0]}>
                  {DEITIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Height
                <select name="size" className={field} defaultValue={SIZES[1]}>
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <fieldset className="mt-5">
              <legend className="text-sm font-medium">Marble</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MARBLES.map((m) => (
                  <button key={m} type="button" aria-pressed={marble === m} onClick={() => setMarble(m)} className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold ${marble === m ? "border-foreground bg-foreground text-background" : "border-border hover:border-gold"}`}>
                    {marble === m && <Check className="size-3.5" aria-hidden="true" />} {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-5 flex flex-col gap-1.5 text-sm font-medium">
              Anything else? <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea name="note" rows={3} className={`${field} h-auto resize-none py-3`} placeholder="Where will it be placed? Any reference photo?" />
            </label>
            <button type="submit" className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
              Send on WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" />
            </button>
            <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-muted-foreground">{sent ? "WhatsApp opened in a new tab — just press send." : ""}</p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
