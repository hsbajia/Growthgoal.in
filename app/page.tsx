import { Bespoke } from "@/components/site/bespoke";
import { Collections } from "@/components/site/collections";
import { Craft } from "@/components/site/craft";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { MobileCta } from "@/components/site/mobile-cta";
import { Assurance } from "@/components/site/promise";
import { Signature } from "@/components/site/signature";
import { SiteHeader } from "@/components/site/site-header";
import { Visit } from "@/components/site/visit";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <Collections />
        <Craft />
        <Signature />
        <Assurance />
        <Bespoke />
        <Visit />
      </main>
      <MobileCta />
    </>
  );
}
