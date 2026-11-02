import { Hand, PackageCheck, Ruler, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

const POINTS = [
  { icon: Hand, title: "Hand-carved, never cast", text: "Every line is cut by an artisan — no moulds, no resin, no shortcuts." },
  { icon: Ruler, title: "Any size, made to order", text: "From 4 inches for a car to life-size for a temple — tell us the space." },
  { icon: Sparkles, title: "Gold leaf & hand-painting", text: "Traditional finishes in real gold leaf and colours that last." },
  { icon: PackageCheck, title: "Packed with care", text: "Wooden crates and soft padding, so your moorti arrives as it left." },
];

export function Assurance() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {POINTS.map((point, i) => {
          const Icon = point.icon;
          return (
            <Reveal key={point.title} delay={i * 80} className="flex gap-4 sm:flex-col">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-medium leading-tight">{point.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{point.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
