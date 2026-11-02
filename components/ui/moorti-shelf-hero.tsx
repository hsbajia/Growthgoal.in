"use client";

/**
 * Moorti shelf hero — adapted from the clothing rail gallery (product-rail-gallery.tsx).
 * Pieces stand on a marble shelf, turned slightly away. Hover / focus / tap turns a piece to face
 * you under a spotlight; neighbours shuffle aside with spring physics. Drag a piece along the
 * shelf, swipe on phones, and open any piece to turn it around on a turntable.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Move3d, X } from "lucide-react";
import { MarbleDefs, MoortiArt, moortiMask, MVB_W, MVB_H, type MarbleTone, type MoortiKind } from "@/components/ui/moorti-art";

export interface ShelfPiece {
  id: string;
  name: string;
  nameHi?: string;
  description?: string;
  kind?: MoortiKind;
  tone?: MarbleTone;
  accent?: string;
  /** Front photo: transparent cut-out on a 4:5 canvas, base touching the bottom edge. */
  image?: string;
  backImage?: string;
  tag?: string;
  details?: string[];
  price?: string;
}

export interface MoortiShelfLabels {
  front: string;
  back: string;
  close: string;
  show: string;
  previous: string;
  next: string;
  drag: string;
}

export interface MoortiShelfHeroProps extends Omit<React.ComponentProps<"section">, "children"> {
  items: ShelfPiece[];
  /** Content above the shelf (eyebrow, heading…). */
  intro?: React.ReactNode;
  /** Shown under the shelf while no piece is facing front. */
  caption?: string;
  /** Rendered under the caption. */
  action?: React.ReactNode;
  /** Rendered in the detail view, e.g. an enquiry button. */
  detailAction?: (item: ShelfPiece, close: () => void) => React.ReactNode;
  autoplay?: boolean;
  interval?: number;
  labels?: MoortiShelfLabels;
  onOpenChange?: (index: number | null) => void;
}

const ASPECT = MVB_W / MVB_H;
const REST = -34;
const REST_SCALE = 0.8;
const PERSPECTIVE = 900;
const GAP = 0.018;
const REST_W = 0.56;
const ACTIVE_W = 0.9;
const MAX_H = 350;
const MIN_WIDE_H = 215;
const CAROUSEL_H = 360;
const DEFAULT_LABELS: MoortiShelfLabels = { front: "Front", back: "Back", close: "Close", show: "Show", previous: "Previous", next: "Next", drag: "Drag to turn" };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function easeOf(angle: number) {
  const e = clamp(1 - angle / REST, 0, 1);
  return e * e * (3 - 2 * e);
}
function footprint(h: number, angle: number) {
  return h * ASPECT * (REST_W + (ACTIVE_W - REST_W) * easeOf(angle));
}

function Photo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className="pointer-events-none absolute inset-0 size-full select-none object-contain object-bottom" />;
}

function PieceArt({ uid, item, side }: { uid: string; item: ShelfPiece; side: "front" | "back" }) {
  if (item.image) return <Photo src={(side === "back" ? item.backImage : undefined) ?? item.image} alt="" />;
  return <MoortiArt uid={uid} kind={item.kind ?? "ganesha"} side={side} tone={item.tone} accent={item.accent} />;
}

function maskFor(item: ShelfPiece) {
  return item.image ? `url("${item.image}")` : moortiMask(item.kind ?? "ganesha");
}

type Sim = {
  x: number[]; vx: number[]; tx: number[];
  turn: number[]; vturn: number[]; tturn: number[];
  rock: number[]; vrock: number[];
  drag: number; grab: number; free: number; last: number; raf: number;
};

const emptySim = (): Sim => ({ x: [], vx: [], tx: [], turn: [], vturn: [], tturn: [], rock: [], vrock: [], drag: -1, grab: 0, free: 0, last: 0, raf: 0 });

export function MoortiShelfHero({
  items,
  intro,
  caption,
  action,
  detailAction,
  autoplay = false,
  interval = 2800,
  labels = DEFAULT_LABELS,
  onOpenChange,
  className,
  ...rest
}: MoortiShelfHeroProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const slots = React.useRef<(HTMLButtonElement | null)[]>([]);
  const rocks = React.useRef<(HTMLSpanElement | null)[]>([]);
  const turns = React.useRef<(HTMLSpanElement | null)[]>([]);
  const dims = React.useRef<(HTMLSpanElement | null)[]>([]);
  const lights = React.useRef<(HTMLSpanElement | null)[]>([]);
  const shadows = React.useRef<(HTMLSpanElement | null)[]>([]);
  const sim = React.useRef(emptySim());
  const [size, setSize] = React.useState({ width: 0, h: 300, carousel: false });
  const [active, setActive] = React.useState<number | null>(null);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const [lifted, setLifted] = React.useState<number | null>(null);
  const returnFocus = React.useRef<number | null>(null);
  const pendingOpen = React.useRef(-1);
  const navigated = React.useRef(false);
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, moved: false, kind: "", swipe: 0, lastX: 0, lastT: 0, v: 0 });
  const live = React.useRef({ active: null as number | null, size, reduced, count, openIndex: null as number | null, carouselIndex: 0 });
  live.current = { ...live.current, active, size, reduced, count, openIndex };

  const carouselIndex = size.carousel ? (active ?? live.current.carouselIndex) : null;

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => { setPlaying(autoplay); }, [autoplay]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      const restK = ASPECT * REST_W + GAP;
      const activeK = ASPECT * ACTIVE_W + GAP;
      const fit = (width - 24) / (count * restK + (activeK - restK));
      const carousel = fit < MIN_WIDE_H;
      const h = carousel ? Math.min(CAROUSEL_H, Math.max(250, width * 0.88)) : Math.min(MAX_H, fit);
      setSize((old) => (Math.abs(old.width - width) < 0.5 && old.carousel === carousel && Math.abs(old.h - h) < 0.5 ? old : { width, h: Math.round(h), carousel }));
    };
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => { const box = entries[0]; if (box) measure(box.contentRect.width); });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  const targets = React.useCallback((h: number, width: number, carousel: boolean, front: number | null) => {
    const feet = items.map((_, i) => footprint(h, i === front ? 0 : REST) + h * GAP);
    if (carousel) {
      const centre = front ?? 0;
      const xs = feet.map(() => 0);
      xs[centre] = width / 2;
      for (let i = centre + 1; i < feet.length; i++) xs[i] = (xs[i - 1] ?? 0) + ((feet[i - 1] ?? 0) + (feet[i] ?? 0)) / 2;
      for (let i = centre - 1; i >= 0; i--) xs[i] = (xs[i + 1] ?? 0) - ((feet[i + 1] ?? 0) + (feet[i] ?? 0)) / 2;
      return xs;
    }
    const total = feet.reduce((sum, f) => sum + f, 0);
    let cursor = (width - total) / 2;
    return feet.map((f) => { const x = cursor + f / 2; cursor += f; return x; });
  }, [items]);

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const { h } = live.current.size;
    const w = h * ASPECT;
    const slot = slots.current[i];
    if (!slot) return;
    const angle = s.turn[i] ?? REST;
    const e = easeOf(angle);
    const scale = REST_SCALE + (1 - REST_SCALE) * e;
    slot.style.transform = `translate3d(${((s.x[i] ?? 0) - w / 2).toFixed(2)}px,0,0)`;
    const rk = rocks.current[i];
    if (rk) rk.style.transform = `rotate(${(s.rock[i] ?? 0).toFixed(3)}deg)`;
    const tu = turns.current[i];
    if (tu) tu.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${angle.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    const dim = dims.current[i];
    if (dim) dim.style.opacity = ((1 - e) * 0.26).toFixed(3);
    const light = lights.current[i];
    if (light) light.style.opacity = e.toFixed(3);
    const shadow = shadows.current[i];
    if (shadow) shadow.style.transform = `scale(${(0.72 + 0.28 * e).toFixed(3)}, ${(0.8 + 0.2 * e).toFixed(3)})`;
  }, []);

  const step = React.useCallback((now: number) => {
    const s = sim.current;
    const n = live.current.count;
    const dt = s.last ? Math.min(0.034, (now - s.last) / 1000) : 1 / 60;
    s.last = now;
    const { h, width, carousel } = live.current.size;
    let busy = false;
    const sub = 2;
    const sdt = dt / sub;
    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < n; i++) {
        const before = s.vx[i] ?? 0;
        if (i !== s.drag) {
          const restoring = now > s.free;
          const stiff = restoring ? 120 : 0;
          const damp = restoring ? 2 * Math.sqrt(120) * 0.88 : 4;
          const ax = -stiff * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - damp * before;
          s.vx[i] = before + ax * sdt;
          s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * sdt;
        }
        const accel = ((s.vx[i] ?? 0) - before) / sdt;
        const ta = -140 * ((s.turn[i] ?? 0) - (s.tturn[i] ?? 0)) - 2 * Math.sqrt(140) * 0.8 * (s.vturn[i] ?? 0);
        s.vturn[i] = (s.vturn[i] ?? 0) + ta * sdt;
        s.turn[i] = (s.turn[i] ?? 0) + (s.vturn[i] ?? 0) * sdt;
        const ra = -70 * (s.rock[i] ?? 0) - 6 * (s.vrock[i] ?? 0) - clamp(accel, -6000, 6000) * 0.0011;
        s.vrock[i] = (s.vrock[i] ?? 0) + ra * sdt;
        s.rock[i] = clamp((s.rock[i] ?? 0) + (s.vrock[i] ?? 0) * sdt, -4, 4);
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n - 1; i++) {
          const a = s.x[i] ?? 0;
          const b = s.x[i + 1] ?? 0;
          const minGap = (footprint(h, s.turn[i] ?? REST) + footprint(h, s.turn[i + 1] ?? REST)) / 2 + h * 0.008;
          const overlap = minGap - (b - a);
          if (overlap <= 0) continue;
          if (i === s.drag) s.x[i + 1] = b + overlap;
          else if (i + 1 === s.drag) s.x[i] = a - overlap;
          else { s.x[i] = a - overlap / 2; s.x[i + 1] = b + overlap / 2; }
          const va = s.vx[i] ?? 0;
          const vb = s.vx[i + 1] ?? 0;
          if (va > vb) {
            const shared = (va + vb) / 2;
            if (i !== s.drag) s.vx[i] = shared;
            if (i + 1 !== s.drag) s.vx[i + 1] = shared;
          }
        }
      }
      if (!carousel && n > 0) {
        const edge = h * 0.04;
        const first = edge + footprint(h, s.turn[0] ?? REST) / 2;
        const last = width - edge - footprint(h, s.turn[n - 1] ?? REST) / 2;
        if ((s.x[0] ?? 0) < first) { s.x[0] = first; s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3; }
        if ((s.x[n - 1] ?? 0) > last) { s.x[n - 1] = last; s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3; }
      }
    }
    for (let i = 0; i < n; i++) {
      paint(i);
      if (Math.abs(s.vx[i] ?? 0) > 0.4 || (now > s.free && Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25) || Math.abs((s.turn[i] ?? 0) - (s.tturn[i] ?? 0)) > 0.05 || Math.abs(s.vturn[i] ?? 0) > 0.05 || Math.abs(s.rock[i] ?? 0) > 0.01 || Math.abs(s.vrock[i] ?? 0) > 0.03) busy = true;
    }
    if (s.drag >= 0 || now < s.free) busy = true;
    if (busy) s.raf = requestAnimationFrame(step);
    else {
      s.raf = 0; s.last = 0;
      for (let i = 0; i < n; i++) { if (now > s.free) s.x[i] = s.tx[i] ?? 0; s.rock[i] = 0; s.vrock[i] = 0; paint(i); }
    }
  }, [paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (live.current.reduced) {
      for (let i = 0; i < live.current.count; i++) { s.x[i] = s.tx[i] ?? 0; s.turn[i] = s.tturn[i] ?? REST; s.vx[i] = 0; s.vturn[i] = 0; s.rock[i] = 0; s.vrock[i] = 0; paint(i); }
      return;
    }
    if (!s.raf) { s.last = 0; s.raf = requestAnimationFrame(step); }
  }, [paint, step]);

  const nudge = React.useCallback((i: number, amount: number) => {
    const s = sim.current;
    if (live.current.reduced || i < 0 || i >= live.current.count) return;
    s.vrock[i] = (s.vrock[i] ?? 0) + amount;
    kick();
  }, [kick]);

  React.useLayoutEffect(() => {
    if (!size.width) return;
    const s = sim.current;
    const front = size.carousel ? (active ?? live.current.carouselIndex) : active;
    const xs = targets(size.h, size.width, size.carousel, front);
    const fresh = s.x.length !== count;
    for (let i = 0; i < count; i++) {
      s.tx[i] = (xs[i] ?? 0) + (size.carousel ? pointer.current.swipe : 0);
      s.tturn[i] = i === front ? 0 : REST;
      if (fresh || reduced) {
        s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0;
        s.turn[i] = s.tturn[i] ?? REST; s.vturn[i] = 0;
        s.rock[i] = 0; s.vrock[i] = 0;
      }
    }
    if (fresh) { s.x.length = count; for (let i = 0; i < count; i++) paint(i); }
    kick();
  }, [size, active, count, reduced, targets, paint, kick]);

  // A gentle "settling" wobble when the shelf first appears.
  const settled = React.useRef(false);
  React.useEffect(() => {
    if (!size.width || settled.current || reduced) return;
    settled.current = true;
    const timers = items.map((_, i) => window.setTimeout(() => nudge(i, 26 - i * 1.5), 160 + i * 70));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [size.width, reduced, items, nudge]);

  React.useEffect(() => () => { cancelAnimationFrame(sim.current.raf); sim.current.raf = 0; }, []);

  React.useLayoutEffect(() => {
    if (openIndex !== null || lifted !== null || returnFocus.current === null) return;
    const index = returnFocus.current;
    returnFocus.current = null;
    slots.current[index]?.focus({ preventScroll: true });
  }, [openIndex, lifted]);

  const choose = React.useCallback((index: number | null) => {
    setActive((old) => {
      if (old === index) return old;
      if (index !== null) { nudge(index - 1, -16); nudge(index + 1, 16); }
      if (index !== null) live.current.carouselIndex = index;
      return index;
    });
  }, [nudge]);

  const stop = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    if (!playing || reduced || openIndex !== null || count === 0 || !size.width) return;
    let timer = window.setTimeout(function advance() {
      const current = live.current.active;
      choose(current === null ? 0 : (current + 1) % live.current.count);
      timer = window.setTimeout(advance, interval);
    }, active === null ? 1200 : interval);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, openIndex, count, interval, size.width, choose, active]);

  const open = React.useCallback((index: number) => {
    stop();
    navigated.current = false;
    setActive(index);
    setOpenIndex(index);
    onOpenChange?.(index);
  }, [onOpenChange, stop]);

  const navigate = React.useCallback((delta: number) => {
    setOpenIndex((old) => {
      if (old === null) return old;
      const next = (old + delta + live.current.count) % live.current.count;
      navigated.current = true;
      live.current.carouselIndex = next;
      setActive(next);
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  const close = React.useCallback(() => {
    setOpenIndex((index) => {
      if (index !== null) { returnFocus.current = index; nudge(index, index % 2 ? 22 : -22); }
      return null;
    });
    onOpenChange?.(null);
  }, [onOpenChange, nudge]);

  const sourceRect = React.useCallback(() => {
    const index = live.current.openIndex;
    return index === null ? null : turns.current[index]?.getBoundingClientRect() ?? null;
  }, []);
  const onLift = React.useCallback((lift: boolean) => setLifted(lift ? live.current.openIndex : null), []);

  function nearest(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    if (y < 0 || y > box.height) return null;
    const s = sim.current;
    const { h } = live.current.size;
    let best = null as number | null;
    let distance = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      const half = footprint(h, s.turn[i] ?? REST) / 2 + 4;
      const d = Math.abs(x - (s.x[i] ?? 0));
      if (d < half && d < distance) { best = i; distance = d; }
    }
    return best;
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const stage = stageRef.current;
    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      const now = performance.now();
      if (!p.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - p.y)) {
        p.moved = true;
        stop();
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        if (!live.current.size.carousel && p.index >= 0) {
          s.drag = p.index;
          s.grab = event.clientX - stage.getBoundingClientRect().left - (s.x[p.index] ?? 0);
        }
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX; p.lastT = now;
        if (s.drag >= 0) {
          s.vx[s.drag] = p.v * 1000;
          s.x[s.drag] = event.clientX - stage.getBoundingClientRect().left - s.grab;
          s.free = now + 900;
          kick();
        } else if (live.current.size.carousel) {
          p.swipe = dx;
          const xs = targets(live.current.size.h, live.current.size.width, true, live.current.active ?? live.current.carouselIndex);
          for (let i = 0; i < live.current.count; i++) s.tx[i] = (xs[i] ?? 0) + dx;
          kick();
        }
      }
      return;
    }
    if (event.pointerType !== "mouse" || live.current.size.carousel || live.current.openIndex !== null) return;
    const hit = nearest(event.clientX, event.clientY);
    if (hit !== null) { stop(); choose(hit); }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    pendingOpen.current = -1;
    pointer.current = { id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY, moved: false, kind: event.pointerType, swipe: 0, lastX: event.clientX, lastT: performance.now(), v: 0 };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    if (s.drag >= 0) {
      s.drag = -1;
      s.free = performance.now() + 700;
      kick();
      return;
    }
    if (p.moved && live.current.size.carousel) {
      const dx = event.clientX - p.x;
      const current = live.current.active ?? live.current.carouselIndex;
      const dir = Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
      pointer.current.swipe = 0;
      choose(clamp(current + dir, 0, live.current.count - 1));
      for (let i = 0; i < live.current.count; i++) nudge(i, clamp(-p.v * 12, -16, 16));
      return;
    }
    if (cancelled || p.moved || p.index < 0) return;
    stop();
    const touch = p.kind !== "mouse";
    if (touch && live.current.active !== p.index) choose(p.index);
    else pendingOpen.current = p.index;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = active ?? focusIndex;
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : clamp(from + (event.key === "ArrowRight" ? 1 : -1), 0, count - 1);
    setFocusIndex(next);
    choose(next);
    slots.current[next]?.focus({ preventScroll: true });
  };

  const shownIndex = active ?? carouselIndex;
  const current = shownIndex === null ? null : items[shownIndex];
  const h = size.h;
  const boxW = h * ASPECT;
  const topPad = Math.round(h * 0.1);
  const surface = Math.max(10, Math.round(h * 0.05));
  const face = Math.max(16, Math.round(h * 0.065));
  const sink = Math.round(surface * 0.4);
  const shelfY = topPad + h + surface;
  const boxTop = shelfY - h - sink;
  const stageH = shelfY + face + Math.round(h * 0.09);

  return (
    <section
      {...rest}
      data-slot="moorti-shelf-hero"
      data-mode={size.carousel ? "carousel" : "shelf"}
      aria-roledescription="moorti shelf"
      className={`relative isolate w-full ${className ?? ""}`}
    >
      <MarbleDefs uid={uid} />
      {intro}

      <div
        ref={stageRef}
        role="group"
        aria-label="Moorti collection"
        className="relative w-full touch-pan-y select-none"
        style={{ height: stageH, overflowX: "clip" }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onPointerLeave={(event) => { if (event.pointerType === "mouse" && pointer.current.id < 0 && !size.carousel && !document.activeElement?.matches("[data-piece]:focus-visible")) choose(null); }}
        onKeyDown={onKeyDown}
      >
        {/* Marble shelf */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0" style={{ top: shelfY - surface, height: surface + face }}>
          <div className="absolute inset-x-0 top-0 marble-surface" style={{ height: surface }} />
          <div className="absolute inset-x-0 marble-face" style={{ top: surface, height: face }}>
            <span className="absolute inset-x-0 top-[3px] h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
            <span className="absolute inset-x-0 bottom-[4px] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>
          <div className="absolute inset-x-[4%] h-6 rounded-[50%] bg-stone/25 blur-xl" style={{ top: surface + face }} />
        </div>

        {items.map((item, i) => {
          const facing = active === i;
          const mask = maskFor(item);
          return (
            <button
              key={item.id}
              ref={(node) => { slots.current[i] = node; }}
              type="button"
              data-piece={i}
              data-front={facing || undefined}
              tabIndex={i === (active ?? focusIndex) ? 0 : -1}
              aria-label={`${item.name}${item.tag ? `, ${item.tag}` : ""}`}
              aria-describedby={`${uid}-caption`}
              aria-pressed={facing}
              className="absolute left-0 cursor-pointer rounded-2xl outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              style={{ top: boxTop, width: boxW, height: h, zIndex: facing ? 30 : 10 + i, visibility: lifted === i ? "hidden" : undefined, transform: `translate3d(${((sim.current.x[i] ?? 0) - boxW / 2).toFixed(2)}px,0,0)` }}
              onFocus={() => { setFocusIndex(i); if (pointer.current.id < 0) { stop(); choose(i); } }}
              onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) open(i); }}
            >
              {/* spotlight */}
              <span ref={(node) => { lights.current[i] = node; }} aria-hidden="true" className="pointer-events-none absolute -inset-x-[45%] -top-[18%] bottom-[-6%] opacity-0" style={{ background: "radial-gradient(42% 46% at 50% 52%, rgba(255,226,170,0.55), rgba(255,226,170,0.18) 55%, transparent 75%), radial-gradient(30% 6% at 50% 97%, rgba(255,214,140,0.7), transparent 80%)" }} />
              {/* contact shadow */}
              <span ref={(node) => { shadows.current[i] = node; }} aria-hidden="true" className="pointer-events-none absolute bottom-[-1.5%] left-[14%] right-[14%] h-[5%] origin-bottom rounded-[50%] bg-stone/45 blur-[6px]" />
              <span ref={(node) => { rocks.current[i] = node; }} className="absolute inset-0" style={{ transformOrigin: "50% 100%" }}>
                <span ref={(node) => { turns.current[i] = node; }} className="absolute inset-0 will-change-transform" style={{ transformOrigin: "50% 100%", transform: `perspective(${PERSPECTIVE}px) rotateY(${REST}deg) scale(${REST_SCALE})` }}>
                  <PieceArt uid={uid} item={item} side="front" />
                  <span ref={(node) => { dims.current[i] = node; }} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-stone" style={{ opacity: 0.26, WebkitMask: `${mask} bottom center / contain no-repeat`, mask: `${mask} bottom center / contain no-repeat` }} />
                </span>
              </span>
              {item.tag && (
                <span aria-hidden="true" className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-[3px] font-display text-[11px] font-semibold leading-none tracking-wide text-stone/80 brass-plate" style={{ top: h + sink + Math.round(face * 0.2) }}>
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {size.carousel && count > 1 && (
        <div className="relative z-10 mt-2 flex justify-center gap-1.5" role="group" aria-label={labels.show}>
          {items.map((item, i) => (
            <button key={item.id} type="button" aria-label={`${labels.show} ${item.name}`} aria-current={carouselIndex === i} onClick={() => { stop(); choose(i); }} className={`h-1.5 rounded-full outline-none transition-[width,background-color] duration-300 focus-visible:ring-2 focus-visible:ring-gold ${carouselIndex === i ? "w-6 bg-gold" : "w-1.5 bg-stone/20 hover:bg-stone/40"}`} />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-5 px-6 pb-4 pt-5 text-center">
        <div id={`${uid}-caption`} aria-live="polite" className="min-h-[5.5rem]">
          {current ? (
            <div key={current.id} className="animate-in fade-in slide-in-from-bottom-1 [animation-duration:350ms] motion-reduce:animate-none">
              <p className="font-display text-2xl font-medium leading-tight sm:text-[28px]">{current.name}</p>
              {current.nameHi && <p className="mt-0.5 font-hindi text-[15px] text-gold">{current.nameHi}</p>}
              {current.description && <p className="mx-auto mt-1.5 max-w-[44ch] text-[13.5px] leading-relaxed text-muted-foreground">{current.description}</p>}
            </div>
          ) : (
            <p className="mx-auto max-w-[40ch] pt-4 text-sm text-muted-foreground">{caption}</p>
          )}
        </div>
        {action}
      </div>

      {openIndex !== null && items[openIndex] && (
        <Detail
          key={items[openIndex].id}
          uid={uid}
          item={items[openIndex]}
          index={openIndex}
          total={count}
          labels={labels}
          reduced={reduced}
          fly={!navigated.current}
          source={sourceRect}
          onLift={onLift}
          onNavigate={navigate}
          onClose={close}
          renderAction={detailAction ? (dismiss) => detailAction(items[openIndex]!, dismiss) : undefined}
        />
      )}
    </section>
  );
}

function Detail({ uid, item, index, total, labels, reduced, fly, source, onLift, onNavigate, onClose, renderAction }: {
  uid: string;
  item: ShelfPiece;
  index: number;
  total: number;
  labels: MoortiShelfLabels;
  reduced: boolean;
  fly: boolean;
  source: () => DOMRect | null;
  onLift: (lifted: boolean) => void;
  onNavigate: (delta: number) => void;
  onClose: () => void;
  renderAction?: (close: () => void) => React.ReactNode;
}) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const figureRef = React.useRef<HTMLDivElement | null>(null);
  const spinRef = React.useRef<HTMLDivElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const [side, setSide] = React.useState<"front" | "back">("front");
  const [shown, setShown] = React.useState(!fly);
  const angle = React.useRef({ value: 0, target: 0, velocity: 0, raf: 0, last: 0, dragging: false, startX: 0, startAngle: 0 });
  const closing = React.useRef(false);
  const titleId = `${uid}-detail-title`;
  const init = React.useRef({ fly, reduced, source, onLift });

  const spin = React.useCallback(() => {
    const a = angle.current;
    const node = spinRef.current;
    const loop = (now: number) => {
      const dt = a.last ? Math.min(0.034, (now - a.last) / 1000) : 1 / 60;
      a.last = now;
      const accel = -90 * (a.value - a.target) - 2 * Math.sqrt(90) * 0.82 * a.velocity;
      a.velocity += accel * dt;
      a.value += a.velocity * dt;
      if (node) node.style.transform = `rotateY(${a.value.toFixed(2)}deg)`;
      if (Math.abs(a.value - a.target) < 0.05 && Math.abs(a.velocity) < 0.05) { a.value = a.target; if (node) node.style.transform = `rotateY(${a.value}deg)`; a.raf = 0; a.last = 0; return; }
      a.raf = requestAnimationFrame(loop);
    };
    if (reduced) { a.value = a.target; if (node) node.style.transform = `rotateY(${a.value}deg)`; return; }
    if (!a.raf) a.raf = requestAnimationFrame(loop);
  }, [reduced]);

  const turnTo = React.useCallback((next: "front" | "back") => {
    const a = angle.current;
    const base = Math.round(a.value / 360) * 360;
    a.target = base + (next === "back" ? 180 : 0);
    if (Math.abs(a.target - a.value) > 180) a.target -= 360 * Math.sign(a.target - a.value);
    setSide(next);
    spin();
  }, [spin]);

  // Mount: lock scroll, fly the piece in from the shelf (once).
  React.useLayoutEffect(() => {
    const { fly: shouldFly, reduced: still, source: from, onLift: lift } = init.current;
    const figure = figureRef.current;
    const rect = from();
    const spinState = angle.current;
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lift(true);
    let animation: Animation | null = null;
    if (figure && !still) {
      if (shouldFly && rect && rect.width > 0) {
        const to = figure.getBoundingClientRect();
        const scale = rect.height / to.height;
        const dx = rect.left + rect.width / 2 - (to.left + to.width / 2);
        const dy = rect.bottom - to.bottom;
        animation = figure.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
          { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 40}px) scale(${((scale + 1) / 2) * 1.03})`, offset: 0.5 },
          { transform: "none" },
        ], { duration: 700, easing: "cubic-bezier(.22,.85,.3,1)" });
      } else {
        animation = figure.animate([{ opacity: 0, transform: "translateY(12px) scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.22,.85,.3,1)" });
      }
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => { cancelAnimationFrame(raf); animation?.cancel(); document.body.style.overflow = overflow; cancelAnimationFrame(spinState.raf); lift(false); };
  }, []);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const figure = figureRef.current;
    const to = source();
    if (!figure || !to || reduced || to.width === 0) { onClose(); return; }
    const from = figure.getBoundingClientRect();
    const scale = to.height / from.height;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.bottom - from.bottom;
    const animation = figure.animate([
      { transform: "none" },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 30}px) scale(${(scale + 1) / 2})`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
    ], { duration: 560, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
    animation.onfinish = () => onClose();
  }, [source, reduced, onClose]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      if ((event.target as HTMLElement).closest("[data-turntable]")) { turnTo(side === "front" ? "back" : "front"); return; }
      event.preventDefault();
      onNavigate(event.key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? [])];
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const navButton = "inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-sm outline-none backdrop-blur transition-colors hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-gold";

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain text-foreground" onKeyDown={onKeyDown}>
      <div aria-hidden="true" className={`fixed inset-0 bg-background/[0.94] backdrop-blur-xl transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} onClick={dismiss}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(50% 45% at 35% 40%, rgba(255,226,170,0.35), transparent 70%)" }} />
      </div>
      <button ref={closeRef} type="button" onClick={dismiss} aria-label={labels.close} className={`fixed right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground outline-none backdrop-blur transition-[opacity,color] duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none sm:right-6 sm:top-6 ${shown ? "opacity-100" : "opacity-0"}`}>
        {labels.close}
        <X className="size-3.5" aria-hidden="true" />
      </button>

      <div className="relative mx-auto grid min-h-full w-full max-w-6xl items-center gap-6 px-5 pb-10 pt-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,24rem)] md:gap-12 md:px-10 md:py-16">
        <div className="relative flex flex-col items-center">
          <div ref={figureRef} className="relative aspect-[4/5] h-[min(46svh,420px)] origin-bottom md:h-[min(68vh,600px)]">
            <div aria-hidden="true" className="absolute -bottom-[3%] left-[2%] right-[2%] h-[9%] rounded-[50%] marble-surface shadow-[0_18px_30px_-12px_rgba(23,19,16,0.45)]" />
            <div
              data-turntable
              tabIndex={0}
              role="slider"
              aria-label={labels.drag}
              aria-valuetext={side === "front" ? labels.front : labels.back}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={side === "front" ? 0 : 1}
              className="absolute inset-0 cursor-grab touch-pan-y rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gold active:cursor-grabbing"
              style={{ perspective: "1400px" }}
              onPointerDown={(event) => { const a = angle.current; a.dragging = true; a.startX = event.clientX; a.startAngle = a.value; cancelAnimationFrame(a.raf); a.raf = 0; a.last = 0; event.currentTarget.setPointerCapture(event.pointerId); }}
              onPointerMove={(event) => { const a = angle.current; if (!a.dragging) return; a.value = a.startAngle + (event.clientX - a.startX) * 0.6; if (spinRef.current) spinRef.current.style.transform = `rotateY(${a.value.toFixed(2)}deg)`; }}
              onPointerUp={() => { const a = angle.current; if (!a.dragging) return; a.dragging = false; const facing = ((a.value % 360) + 360) % 360; turnTo(facing > 90 && facing < 270 ? "back" : "front"); }}
              onPointerCancel={() => { angle.current.dragging = false; turnTo(side); }}
            >
              <div ref={spinRef} className="absolute inset-0 [transform-style:preserve-3d]">
                {(["front", "back"] as const).map((faceSide) => (
                  <div key={faceSide} className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: faceSide === "back" ? "rotateY(180deg)" : undefined }}>
                    {item.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={(faceSide === "back" ? item.backImage : undefined) ?? item.image} alt={faceSide === "front" ? item.name : ""} draggable={false} className="pointer-events-none absolute inset-0 size-full select-none object-contain object-bottom" />
                      : <MoortiArt uid={uid} kind={item.kind ?? "ganesha"} side={faceSide} tone={item.tone} accent={item.accent} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className={`mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}>
            <Move3d className="size-3.5" aria-hidden="true" /> {labels.drag}
          </p>
        </div>

        <div className={`flex flex-col gap-4 text-center transition-[opacity,transform] delay-150 duration-500 motion-reduce:transition-none md:text-left ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</p>
          <div>
            <h3 id={titleId} className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">{item.name}</h3>
            {item.nameHi && <p className="mt-2 font-hindi text-lg text-gold">{item.nameHi}</p>}
          </div>
          {item.description && <p className="text-[15px] leading-relaxed text-muted-foreground">{item.description}</p>}
          {item.details && item.details.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 md:justify-start">
              {item.details.map((detail) => <li key={detail} className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">{detail}</li>)}
            </ul>
          )}
          {item.price && <p className="font-display text-xl text-foreground/90">{item.price}</p>}
          <div role="group" aria-label={`${labels.front} / ${labels.back}`} className="inline-flex justify-center gap-6 md:justify-start">
            {(["front", "back"] as const).map((faceSide) => (
              <button key={faceSide} type="button" aria-pressed={side === faceSide} onClick={() => turnTo(faceSide)} className={`relative pb-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold ${side === faceSide ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {faceSide === "front" ? labels.front : labels.back}
                <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-300 motion-reduce:transition-none ${side === faceSide ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            ))}
          </div>
          {renderAction && <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">{renderAction(dismiss)}</div>}
          <div className="mt-2 flex items-center justify-center gap-3 md:justify-start">
            <button type="button" className={navButton} aria-label={labels.previous} onClick={() => onNavigate(-1)}><ChevronLeft className="size-5" aria-hidden="true" /></button>
            <button type="button" className={navButton} aria-label={labels.next} onClick={() => onNavigate(1)}><ChevronRight className="size-5" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default MoortiShelfHero;
