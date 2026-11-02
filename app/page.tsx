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
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, moortis, categories } = await getContent();
  return (
    <>
      <SiteHeader site={site} />
      <main>
        <Hero items={moortis} site={site} />
        <Marquee />
        <Collections categories={categories} site={site} />
        <Craft image={site.craftImage} />
        <Signature site={site} />
        <Assurance />
        <Bespoke site={site} />
        <Visit site={site} />
      </main>
      <MobileCta site={site} />
    </>
  );
}
