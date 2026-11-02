import type { MarbleTone, MoortiKind } from "@/components/ui/moorti-art";

/**
 * Moortis shown on the shelf in the hero.
 *
 * To use real photos: add `image` (front) and optionally `backImage`.
 * Best results: transparent PNG/WebP cut-outs on a 4:5 portrait canvas (e.g. 960 × 1200),
 * base of the moorti touching the bottom edge, same scale for front and back.
 * Without `image`, the built-in marble illustration for `kind` is shown.
 */
export interface Moorti {
  id: string;
  name: string;
  nameHi?: string;
  description?: string;
  kind?: MoortiKind;
  tone?: MarbleTone;
  /** Paint colour for the dhoti / robe / saddle cloth of the illustration. */
  accent?: string;
  image?: string;
  backImage?: string;
  /** Short label on the shelf, e.g. the height. */
  tag?: string;
  details?: string[];
  price?: string;
}

export const HERO_MOORTIS: Moorti[] = [
  {
    id: "vighnaharta-ganesha",
    name: "Vighnaharta Ganesha",
    nameHi: "विघ्नहर्ता गणेश",
    kind: "ganesha",
    tone: "white",
    accent: "#C8502E",
    tag: '12"',
    description: "Seated on a lotus, crowned in gold leaf, with a hand-painted dhoti.",
    details: ["White marble", "Gold leaf", "Hand-painted", '12" tall'],
    price: "Price on request",
  },
  {
    id: "nandi",
    name: "Nandi",
    nameHi: "नंदी",
    kind: "nandi",
    tone: "white",
    accent: "#9F1D20",
    tag: '10"',
    description: "Shiva’s faithful companion, resting with a bell and a red-and-gold jhool.",
    details: ["White marble", "Painted jhool", '10" tall'],
    price: "Price on request",
  },
  {
    id: "dhyana-buddha",
    name: "Dhyana Buddha",
    nameHi: "ध्यान बुद्ध",
    kind: "buddha",
    tone: "green",
    tag: '18"',
    description: "In deep meditation, carved in green marble for a quiet corner of the home.",
    details: ["Green marble", "Matte finish", '18" tall'],
    price: "Price on request",
  },
  {
    id: "home-mandir",
    name: "Home Mandir",
    nameHi: "घर का मंदिर",
    kind: "mandir",
    tone: "white",
    tag: '24"',
    description: "A domed marble mandir with carved pillars, a temple bell and gold detailing.",
    details: ["White marble", "Gold inlay", "Made to size", '24" tall'],
    price: "Price on request",
  },
  {
    id: "shivling",
    name: "Shivling with Jalahari",
    nameHi: "शिवलिंग",
    kind: "shivling",
    tone: "black",
    tag: '9"',
    description: "Black marble with a gold tripundra and a rudraksha mala at the base.",
    details: ["Black marble", "Gold work", '9" tall'],
    price: "Price on request",
  },
  {
    id: "royal-haathi",
    name: "Royal Haathi",
    nameHi: "शाही हाथी",
    kind: "haathi",
    tone: "pink",
    accent: "#1F5B57",
    tag: '8"',
    description: "A trunk-raised elephant for good fortune — a favourite for gifting.",
    details: ["Pink marble", "Painted jhool", '8" tall'],
    price: "Price on request",
  },
  {
    id: "mangalmurti-ganesha",
    name: "Mangalmurti Ganesha",
    nameHi: "मंगलमूर्ति गणेश",
    kind: "ganesha",
    tone: "ivory",
    accent: "#7E1A35",
    tag: '15"',
    description: "Warm ivory marble with a deep maroon dhoti and gold ornaments.",
    details: ["Ivory marble", "Gold leaf", '15" tall'],
    price: "Price on request",
  },
  {
    id: "shanti-buddha",
    name: "Shanti Buddha",
    nameHi: "शांति बुद्ध",
    kind: "buddha",
    tone: "white",
    accent: "#D9772B",
    tag: '21"',
    description: "White marble with a saffron robe and a gold border, finished by hand.",
    details: ["White marble", "Hand-painted", '21" tall'],
    price: "Price on request",
  },
];

export interface Category {
  id: string;
  name: string;
  nameHi: string;
  line: string;
  kind: MoortiKind;
  tone: MarbleTone;
  accent?: string;
  /** Photo for the card (transparent cut-out works best). */
  image?: string;
}

export const CATEGORIES: Category[] = [
  { id: "ganesha", name: "Ganesha", nameHi: "गणेश", line: "For new beginnings", kind: "ganesha", tone: "white", accent: "#C8502E" },
  { id: "shiv", name: "Shiv Parivar", nameHi: "शिव परिवार", line: "Shivling, Nandi and more", kind: "shivling", tone: "black" },
  { id: "mandir", name: "Marble Mandirs", nameHi: "मंदिर", line: "Made to fit your home", kind: "mandir", tone: "white" },
  { id: "buddha", name: "Buddha", nameHi: "बुद्ध", line: "Stillness in stone", kind: "buddha", tone: "ivory", accent: "#D9772B" },
  { id: "sacred-animals", name: "Sacred Animals", nameHi: "नंदी · हाथी", line: "Nandi, haathi, gau mata", kind: "nandi", tone: "white", accent: "#9F1D20" },
  { id: "gifting", name: "Décor & Gifting", nameHi: "उपहार", line: "Pieces that are remembered", kind: "haathi", tone: "pink", accent: "#1F5B57" },
];
