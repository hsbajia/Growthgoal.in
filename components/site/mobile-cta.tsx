"use client";

import * as React from "react";
import { MessageCircle, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/data/site";

/** Floating enquiry bar for phones. Appears after the hero, hides near the footer. */
export function MobileCta() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    let nearEnd = false;
    const visit = document.getElementById("visit");
    const observer = visit ? new IntersectionObserver(([entry]) => { nearEnd = !!entry?.isIntersecting; onScroll(); }, { threshold: 0.05 }) : null;
    function onScroll() { setShow(window.scrollY > window.innerHeight * 0.9 && !nearEnd); }
    if (visit && observer) observer.observe(visit);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); observer?.disconnect(); };
  }, []);
  return (
    <div aria-hidden={!show} className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,.85,.3,1)] sm:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 p-1.5 shadow-[0_20px_40px_-15px_rgba(23,19,16,0.45)] backdrop-blur-lg">
        <a tabIndex={show ? 0 : -1} href={whatsappLink(`Namaste ${SITE.name}, I would like to know more about your marble moortis.`)} target="_blank" rel="noreferrer" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background">
          <MessageCircle className="size-4" aria-hidden="true" /> Enquire on WhatsApp
        </a>
        <a tabIndex={show ? 0 : -1} href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} aria-label="Call us" className="inline-flex size-12 items-center justify-center rounded-full border border-border">
          <Phone className="size-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
