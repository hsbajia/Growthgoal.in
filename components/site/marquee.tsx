import { LotusMark } from "@/components/site/logo";

const WORDS = ["Ganesha", "गणेश", "Radha Krishna", "राधा कृष्ण", "Shivling", "शिवलिंग", "Buddha", "बुद्ध", "Home Mandirs", "मंदिर", "Nandi", "नंदी", "Lakshmi", "लक्ष्मी", "Custom orders"];

export function Marquee() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {WORDS.map((word, i) => (
        <li key={i} className="flex items-center">
          <span className={`whitespace-nowrap px-6 ${/[ऀ-ॿ]/.test(word) ? "font-hindi text-xl text-gold-soft" : "font-display text-2xl italic text-ivory/90 sm:text-3xl"}`}>{word}</span>
          <LotusMark className="h-3.5 w-5 text-gold/70" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden border-y border-gold/20 py-5 marble-dark">
      <div className="flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
