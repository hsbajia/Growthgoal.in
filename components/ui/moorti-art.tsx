import * as React from "react";

/**
 * Hand-drawn marble moorti illustrations (SVG).
 * Used as placeholders until real photos are added. Every piece is drawn on a
 * 240 × 300 canvas with the base of the plinth at the bottom.
 */

export type MoortiKind = "ganesha" | "buddha" | "shivling" | "nandi" | "haathi" | "mandir";
export type MarbleTone = "white" | "ivory" | "black" | "green" | "pink";

export const MVB_W = 240;
export const MVB_H = 300;
export const MOORTI_KINDS: MoortiKind[] = ["ganesha", "buddha", "shivling", "nandi", "haathi", "mandir"];
const TONES: MarbleTone[] = ["white", "ivory", "black", "green", "pink"];

type Mode = "over" | "paint" | "gold" | "goldLine" | "line" | "shade" | "dark" | "red" | "saffron" | "ivory" | "hair" | "surface" | "glow";
type Layer = { d: string; mode: Mode; w?: number; dash?: string };
type Drawing = { parts: string[]; layers: Layer[]; mirror?: boolean };

const PALETTE: Record<MarbleTone, { hi: string; base: string; low: string; vein: string; veinOpacity: number; line: string; lineHi: string; shade: string }> = {
  white: { hi: "#FFFEFB", base: "#F1EDE6", low: "#D3CABD", vein: "#7A6E61", veinOpacity: 0.38, line: "#5E5348", lineHi: "#FFFFFF", shade: "#3B2F22" },
  ivory: { hi: "#FCF4E6", base: "#EEDFC6", low: "#CDB690", vein: "#8A6C45", veinOpacity: 0.32, line: "#6A5236", lineHi: "#FFF8EC", shade: "#3E2C16" },
  black: { hi: "#57534F", base: "#2E2C2A", low: "#141312", vein: "#E2DBD0", veinOpacity: 0.42, line: "#000000", lineHi: "#8E877E", shade: "#000000" },
  green: { hi: "#77A487", base: "#41705A", low: "#1F3E2E", vein: "#D6EADB", veinOpacity: 0.42, line: "#0E2418", lineHi: "#9CC7AA", shade: "#06130B" },
  pink: { hi: "#FCEBE5", base: "#EFCDC3", low: "#CB9C90", vein: "#8E584B", veinOpacity: 0.3, line: "#6E4036", lineHi: "#FFF3EF", shade: "#3E1E17" },
};

/* ---------- path helpers ---------- */
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

function lotusRow(x0: number, x1: number, base: number, ht: number, n: number) {
  const w = (x1 - x0) / n;
  let d = `M${x0},${base}`;
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w;
    const m = a + w / 2;
    const b = a + w;
    d += ` C${(a + 1).toFixed(1)},${(base - ht * 0.55).toFixed(1)} ${(m - w * 0.3).toFixed(1)},${base - ht} ${m.toFixed(1)},${base - ht} C${(m + w * 0.3).toFixed(1)},${base - ht} ${(b - 1).toFixed(1)},${(base - ht * 0.55).toFixed(1)} ${b.toFixed(1)},${base}`;
  }
  return `${d} Z`;
}
function lotusVeins(x0: number, x1: number, base: number, ht: number, n: number): Layer[] {
  const w = (x1 - x0) / n;
  return Array.from({ length: n }, (_, i) => {
    const m = x0 + i * w + w / 2;
    return { d: `M${m.toFixed(1)},${base - ht * 0.78} C${(m - 1).toFixed(1)},${base - ht * 0.4} ${m.toFixed(1)},${base - ht * 0.2} ${m.toFixed(1)},${base - 2}`, mode: "line" as const };
  });
}

/* ---------- shared pieces ---------- */
const PLINTH = [rr(36, 276, 168, 20, 4), rr(48, 264, 144, 14, 3)];
const PLINTH_LAYERS: Layer[] = [
  { d: "M40,284 H200", mode: "line" },
  { d: "M52,271 H188", mode: "goldLine", w: 1.3 },
  { d: "M50,266 H190", mode: "shade", w: 4 },
];
const LOTUS_BACK = lotusRow(50, 190, 266, 30, 8);
const LOTUS_FRONT = lotusRow(58, 182, 268, 24, 7);
const LOTUS_LAYERS: Layer[] = [...lotusVeins(58, 182, 268, 24, 7), { d: "M58,266 C90,270 150,270 182,266", mode: "goldLine", w: 1.4 }];

/* ---------- Ganesha ---------- */
const G = {
  lap: "M60,248 C56,226 72,210 96,206 L144,206 C168,210 184,226 180,248 C160,254 80,254 60,248 Z",
  armUL: "M88,142 C72,142 56,130 48,112 L58,106 C64,120 74,128 92,130 Z",
  handUL: ell(50, 102, 8, 8),
  armUR: "M152,142 C168,142 184,130 192,112 L182,106 C176,120 166,128 148,130 Z",
  handUR: ell(190, 102, 8, 8),
  earL: "M100,92 C82,78 62,84 60,106 C58,128 76,140 94,128 Z",
  earR: "M140,92 C158,78 178,84 180,106 C182,128 164,140 146,128 Z",
  torso: "M84,150 C82,136 98,126 120,126 C142,126 158,136 156,150 L160,202 C140,210 100,210 80,202 Z",
  belly: ell(120, 180, 31, 27),
  armLL: "M86,150 C74,164 72,184 84,198 L96,192 C88,182 88,168 94,158 Z",
  armLR: "M154,150 C166,160 170,176 164,188 L154,184 C158,176 156,166 148,158 Z",
  palm: "M148,166 C148,158 160,156 165,162 L166,182 C162,187 151,187 149,182 Z",
  head: "M96,108 C94,88 104,76 120,76 C136,76 146,88 144,108 C144,120 136,128 128,131 L112,131 C104,128 96,120 96,108 Z",
  headBack: "M96,106 C94,86 104,76 120,76 C136,76 146,86 144,106 C144,120 134,132 120,132 C106,132 96,120 96,106 Z",
  trunk: "M110,120 C108,142 106,156 116,166 C124,174 138,172 142,162 C144,156 140,151 136,153 C132,155 132,161 126,161 C119,159 119,146 124,131 C126,125 128,122 130,120 Z",
  crown: "M100,88 L103,60 C107,47 113,39 120,28 C127,39 133,47 137,60 L140,88 C128,84 112,84 100,88 Z",
  crownTop: ell(120, 25, 4, 5),
};

const ganeshaFront: Drawing = {
  parts: [...PLINTH, LOTUS_BACK, LOTUS_FRONT, G.lap, G.armUL, G.handUL, G.armUR, G.handUR, G.earL, G.earR, G.torso, G.belly, G.armLL, G.armLR, G.palm, G.head, G.trunk, G.crown, G.crownTop],
  layers: [
    ...PLINTH_LAYERS,
    ...LOTUS_LAYERS,
    { d: G.lap, mode: "paint" },
    { d: "M102,128 C110,134 130,134 138,128", mode: "shade", w: 6 },
    { d: "M92,202 C104,210 136,210 148,202", mode: "shade", w: 6 },
    { d: "M113,138 C117,140 121,140 124,137", mode: "line" },
    { d: "M112,146 C116,148 120,148 123,146", mode: "line" },
    { d: "M114,154 C117,157 121,157 124,154", mode: "line" },
    { d: "M117,184 C119,187 121,187 123,184", mode: "line" },
    { d: "M153,168 L153,180", mode: "line" },
    { d: "M157,166 L157,181", mode: "line" },
    { d: "M161,167 L161,180", mode: "line" },
    { d: "M72,100 C70,112 76,122 88,124", mode: "line" },
    { d: "M168,100 C170,112 164,122 152,124", mode: "line" },
    { d: "M70,222 C96,230 144,230 170,222", mode: "line" },
    { d: "M92,142 C100,158 140,158 148,142", mode: "goldLine", w: 2.6 },
    { d: "M62,246 C82,252 158,252 178,246", mode: "goldLine", w: 2 },
    { d: "M92,204 C104,210 136,210 148,204", mode: "goldLine", w: 2.4 },
    { d: "M78,160 L90,157", mode: "goldLine", w: 2.4 },
    { d: "M150,157 L162,160", mode: "goldLine", w: 2.4 },
    { d: "M46,98 L40,70", mode: "goldLine", w: 2.4 },
    { d: G.crown, mode: "gold" },
    { d: G.crownTop, mode: "gold" },
    { d: "M101,80 C112,77 128,77 139,80", mode: "line" },
    { d: "M104,64 C114,61 126,61 136,64", mode: "line" },
    { d: "M120,40 L120,80", mode: "line" },
    { d: ell(120, 157, 4, 5), mode: "gold" },
    { d: "M34,72 C34,62 44,58 50,64 L42,74 Z", mode: "gold" },
    { d: "M190,94 C184,86 186,76 190,70 C194,76 196,86 190,94 Z", mode: "gold" },
    { d: ell(96, 196, 11, 5.5), mode: "gold" },
    { d: ell(91, 190, 3.6, 3.6), mode: "ivory" },
    { d: ell(99, 189, 3.6, 3.6), mode: "ivory" },
    { d: "M130,124 C135,127 139,132 140,138 C136,135 132,132 128,129 Z", mode: "ivory" },
    { d: ell(108, 103, 3, 1.7), mode: "dark" },
    { d: ell(132, 103, 3, 1.7), mode: "dark" },
    { d: "M117,90 C117,88 123,88 123,90 L120,99 Z", mode: "red" },
  ],
};

const ganeshaBack: Drawing = {
  parts: [...PLINTH, LOTUS_BACK, LOTUS_FRONT, G.lap, G.armUL, G.handUL, G.armUR, G.handUR, G.torso, G.earL, G.earR, G.headBack, G.crown, G.crownTop],
  layers: [
    ...PLINTH_LAYERS,
    ...LOTUS_LAYERS,
    { d: G.lap, mode: "paint" },
    { d: "M100,132 C110,138 130,138 140,132", mode: "shade", w: 6 },
    { d: "M120,138 C119,160 121,182 120,204", mode: "line" },
    { d: "M96,150 C102,160 104,172 100,184", mode: "line" },
    { d: "M144,150 C138,160 136,172 140,184", mode: "line" },
    { d: "M62,246 C82,252 158,252 178,246", mode: "goldLine", w: 2 },
    { d: "M84,204 C100,210 140,210 156,204", mode: "goldLine", w: 2.4 },
    { d: "M110,132 L120,142 L130,132", mode: "goldLine", w: 1.8 },
    { d: G.crown, mode: "gold" },
    { d: G.crownTop, mode: "gold" },
    { d: "M101,80 C112,77 128,77 139,80", mode: "line" },
    { d: "M104,64 C114,61 126,61 136,64", mode: "line" },
  ],
};

/* ---------- Buddha ---------- */
const B = {
  legs: "M52,250 C50,228 66,214 96,208 L144,208 C174,214 190,228 188,250 C168,256 72,256 52,250 Z",
  torso: "M84,120 C70,126 64,148 66,178 C68,198 76,208 88,212 L152,212 C164,208 172,198 174,178 C176,148 170,126 156,120 C144,114 96,114 84,120 Z",
  robe: "M84,120 C70,126 64,148 66,178 C68,198 76,208 88,212 L152,212 C164,208 172,198 174,178 C175,160 173,146 168,136 C156,140 146,136 140,124 C132,118 108,116 96,117 Z",
  neck: rr(110, 100, 20, 22, 6),
  earL: "M101,72 C95,72 93,82 94,92 C95,101 99,106 103,103 Z",
  earR: "M139,72 C145,72 147,82 146,92 C145,101 141,106 137,103 Z",
  head: "M100,80 C100,61 108,52 120,52 C132,52 140,61 140,80 C140,97 132,108 120,108 C108,108 100,97 100,80 Z",
  hair: "M100,74 C100,60 108,52 120,52 C132,52 140,60 140,74 C134,67 106,67 100,74 Z",
  bun: ell(120, 49, 9, 8),
  hands: ell(120, 214, 24, 8),
};
const curls: Layer[] = [];
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 7 - row; col++) {
    const x = 104 + row * 2.6 + col * 5.2 + (row % 2) * 1.3;
    curls.push({ d: ell(x, 66 - row * 4.5, 1.3, 1.3), mode: "surface" });
  }
}

const buddhaFront: Drawing = {
  parts: [...PLINTH, LOTUS_BACK, LOTUS_FRONT, B.legs, B.torso, B.neck, B.earL, B.earR, B.head, B.bun, B.hands],
  layers: [
    ...PLINTH_LAYERS,
    ...LOTUS_LAYERS,
    { d: B.robe, mode: "paint" },
    { d: B.legs, mode: "paint" },
    { d: B.hands, mode: "over" },
    { d: "M108,108 C114,113 126,113 132,108", mode: "shade", w: 5 },
    { d: "M84,210 C100,216 140,216 156,210", mode: "shade", w: 6 },
    { d: "M98,219 C110,224 130,224 142,219", mode: "shade", w: 4 },
    { d: "M80,132 C88,160 104,186 124,206", mode: "line" },
    { d: "M74,150 C80,172 92,192 106,208", mode: "line" },
    { d: "M152,150 C153,170 156,190 160,206", mode: "line" },
    { d: "M70,226 C96,232 130,232 170,224", mode: "line" },
    { d: "M62,238 C90,244 150,244 180,236", mode: "line" },
    { d: "M106,75 C110,72 115,72 118,74", mode: "line" },
    { d: "M122,74 C125,72 130,72 134,75", mode: "line" },
    { d: "M108,81 C111,83 115,83 117,81", mode: "line" },
    { d: "M123,81 C125,83 129,83 132,81", mode: "line" },
    { d: "M120,80 L118.5,90 C119.5,92 121,92 122,90", mode: "line" },
    { d: "M115,97 C118,99 122,99 125,97", mode: "line" },
    { d: "M112,110 C117,112 123,112 128,110", mode: "line" },
    { d: "M102,213 C110,209 130,209 138,213", mode: "line" },
    { d: B.hair, mode: "hair" },
    { d: B.bun, mode: "hair" },
    ...curls,
    { d: "M96,118 C114,138 138,148 168,136", mode: "goldLine", w: 2.4 },
    { d: "M54,248 C74,254 166,254 186,248", mode: "goldLine", w: 2 },
    { d: ell(120, 77, 1.4, 1.4), mode: "red" },
  ],
};

const buddhaBack: Drawing = {
  parts: [...PLINTH, LOTUS_BACK, LOTUS_FRONT, B.legs, B.torso, B.neck, B.earL, B.earR, B.head, B.bun],
  layers: [
    ...PLINTH_LAYERS,
    ...LOTUS_LAYERS,
    { d: B.torso, mode: "paint" },
    { d: B.legs, mode: "paint" },
    { d: "M84,210 C100,216 140,216 156,210", mode: "shade", w: 6 },
    { d: "M90,122 C104,150 128,178 150,206", mode: "line" },
    { d: "M140,122 C148,146 156,172 160,200", mode: "line" },
    { d: "M84,140 C92,164 104,186 118,206", mode: "line" },
    { d: B.head, mode: "hair" },
    { d: B.bun, mode: "hair" },
    { d: "M90,124 C110,150 130,150 160,128", mode: "goldLine", w: 2.4 },
    { d: "M54,248 C74,254 166,254 186,248", mode: "goldLine", w: 2 },
  ],
};

/* ---------- Shivling ---------- */
const S = {
  jalahari: "M46,242 C46,228 80,220 120,220 C150,220 172,224 184,230 L220,236 C228,238 228,246 220,248 L184,252 C172,260 150,264 120,264 C80,264 46,256 46,242 Z",
  lingam: "M90,234 L90,140 C90,106 104,90 120,90 C136,90 150,106 150,140 L150,234 C140,240 100,240 90,234 Z",
};
const shivFrontLayers: Layer[] = [
  ...PLINTH_LAYERS,
  { d: "M54,238 C64,230 96,228 120,228 C146,228 170,231 182,236 C170,242 146,244 120,244 C94,244 66,242 54,238 Z", mode: "surface" },
  { d: "M92,232 C104,240 136,240 148,232", mode: "shade", w: 6 },
  { d: "M50,240 C56,230 90,226 120,226 C150,226 178,230 186,236", mode: "line" },
  { d: "M152,240 L220,242", mode: "line" },
  { d: "M48,246 C60,258 100,263 120,263 C150,263 172,259 184,253", mode: "goldLine", w: 1.6 },
  { d: "M92,222 C106,230 134,230 148,222", mode: "goldLine", w: 4, dash: "0.01 6" },
  { d: ell(70, 238, 5.5, 4), mode: "saffron" },
  { d: ell(80, 242, 4.5, 3.4), mode: "saffron" },
  { d: ell(166, 236, 5, 3.8), mode: "saffron" },
];
const shivlingFront: Drawing = {
  parts: [...PLINTH, S.jalahari, S.lingam],
  layers: [
    ...shivFrontLayers,
    { d: "M96,142 C110,137 130,137 144,142", mode: "goldLine", w: 2.6 },
    { d: "M95,151 C110,146 130,146 145,151", mode: "goldLine", w: 2.6 },
    { d: "M95,160 C110,155 130,155 145,160", mode: "goldLine", w: 2.6 },
    { d: ell(120, 151, 4.5, 4.5), mode: "red" },
  ],
};
const shivlingBack: Drawing = { parts: shivlingFront.parts, layers: shivFrontLayers, mirror: true };

/* ---------- Nandi ---------- */
const N = {
  body: "M64,262 C54,240 60,208 86,194 C108,182 150,180 176,190 C202,200 210,228 206,262 Z",
  tail: "M204,232 C214,236 216,250 212,262 L207,262 C210,250 208,240 201,238 Z",
  hump: "M90,200 C88,178 104,166 120,174 C127,178 129,186 127,194 Z",
  neck: "M90,198 C78,206 70,222 72,242 L98,238 C96,222 100,208 106,198 Z",
  leg: "M84,262 C80,248 90,240 106,242 L142,246 C150,248 150,258 142,260 L106,262 Z",
  hornL: "M62,172 C57,158 61,147 70,143 C68,153 70,161 73,170 Z",
  hornR: "M76,172 C78,158 86,151 94,151 C88,159 84,166 82,174 Z",
  head: "M58,216 C46,212 40,198 43,184 C47,172 59,166 71,170 C81,174 89,188 91,202 C85,214 71,220 58,216 Z",
  snout: "M44,192 C36,198 36,210 44,216 C50,219 57,216 59,209 Z",
  ear: "M80,180 C90,175 99,177 103,184 C95,189 86,189 80,184 Z",
  jhool: "M122,188 C142,184 168,186 186,196 L192,238 C166,246 138,246 120,238 Z",
};
const nandiFront: Drawing = {
  parts: [...PLINTH, N.body, N.tail, N.hump, N.neck, N.leg, N.hornL, N.hornR, N.head, N.snout, N.ear],
  layers: [
    ...PLINTH_LAYERS,
    { d: N.jhool, mode: "paint" },
    { d: "M58,216 C66,222 80,222 90,214", mode: "shade", w: 6 },
    { d: "M66,260 C110,266 170,266 204,260", mode: "shade", w: 6 },
    { d: "M44,212 C48,214 52,214 56,212", mode: "line" },
    { d: "M106,244 C104,252 106,258 110,262", mode: "line" },
    { d: "M80,214 C84,222 86,230 86,238", mode: "line" },
    { d: "M120,238 C138,246 166,246 192,238", mode: "goldLine", w: 2 },
    { d: "M122,188 C142,184 168,186 186,196", mode: "goldLine", w: 2 },
    { d: "M124,226 C142,232 166,232 190,226", mode: "goldLine", w: 3, dash: "0.01 5" },
    { d: "M80,206 C86,222 98,230 110,230", mode: "goldLine", w: 2.4 },
    { d: "M96,232 C96,226 104,226 104,232 L106,240 L94,240 Z", mode: "gold" },
    { d: ell(58, 192, 2.6, 1.7), mode: "dark" },
    { d: ell(44, 206, 1.6, 1.2), mode: "dark" },
    { d: rr(138, 250, 10, 8, 3), mode: "dark" },
    { d: "M52,180 L56,180 L54,188 Z", mode: "red" },
  ],
};
const nandiBack: Drawing = { ...nandiFront, mirror: true };

/* ---------- Haathi ---------- */
const H = {
  legBR: rr(186, 228, 18, 36, 6),
  legBL: rr(122, 232, 18, 32, 6),
  body: "M88,238 C72,232 68,200 82,180 C98,160 142,154 174,164 C198,172 208,194 206,220 C204,232 198,238 190,240 Z",
  tail: "M204,206 C212,214 214,228 210,238 L206,238 C208,228 206,218 200,212 Z",
  legFL: rr(94, 226, 22, 38, 6),
  legFR: rr(160, 226, 22, 38, 6),
  head: "M60,196 C52,172 64,150 86,148 C104,146 116,160 114,182 C112,200 100,212 84,214 C72,214 64,208 60,196 Z",
  trunk: "M62,196 C50,200 42,190 40,176 C38,160 32,148 24,142 C20,140 20,134 26,134 C38,136 48,150 52,166 C54,178 58,186 66,184 Z",
  ear: "M86,160 C102,150 124,156 126,176 C128,196 116,206 100,200 C94,192 90,176 86,160 Z",
  jhool: "M112,166 C138,158 168,160 188,170 L194,214 C168,222 136,222 114,214 Z",
};
const haathiFront: Drawing = {
  parts: [...PLINTH, H.legBR, H.legBL, H.body, H.tail, H.legFL, H.legFR, H.head, H.trunk, H.ear],
  layers: [
    ...PLINTH_LAYERS,
    { d: H.jhool, mode: "paint" },
    { d: "M90,236 C120,244 170,244 200,236", mode: "shade", w: 6 },
    { d: "M112,170 C116,186 114,200 108,210", mode: "shade", w: 5 },
    { d: "M34,146 C38,144 40,142 40,138", mode: "line" },
    { d: "M42,160 C46,158 48,156 48,152", mode: "line" },
    { d: "M46,174 C50,173 52,171 52,168", mode: "line" },
    { d: "M96,166 C108,164 118,170 118,182", mode: "line" },
    { d: "M114,214 C136,222 168,222 194,214", mode: "goldLine", w: 2.2 },
    { d: "M112,166 C138,158 168,160 188,170", mode: "goldLine", w: 2 },
    { d: "M118,219 C140,227 166,227 190,219", mode: "goldLine", w: 3, dash: "0.01 5" },
    { d: "M94,254 H116", mode: "goldLine", w: 2 },
    { d: "M160,254 H182", mode: "goldLine", w: 2 },
    { d: "M68,156 C76,150 88,148 98,150 L94,170 C86,168 78,168 72,170 Z", mode: "gold" },
    { d: "M60,198 C52,208 42,210 34,206 C42,204 50,200 56,192 Z", mode: "ivory" },
    { d: ell(74, 176, 2.6, 1.6), mode: "dark" },
  ],
};
const haathiBack: Drawing = { ...haathiFront, mirror: true };

/* ---------- Mandir ---------- */
const M = {
  platform: rr(46, 248, 148, 18, 2),
  wall: rr(80, 136, 80, 112, 1),
  pillarL: rr(64, 140, 16, 108, 2),
  pillarR: rr(160, 140, 16, 108, 2),
  capL: rr(60, 134, 24, 8, 2),
  capR: rr(156, 134, 24, 8, 2),
  baseL: rr(60, 240, 24, 8, 2),
  baseR: rr(156, 240, 24, 8, 2),
  roof: rr(50, 122, 140, 14, 2),
  cornice: rr(56, 114, 128, 10, 2),
  sideL: "M52,122 C52,110 58,103 66,101 C74,103 80,110 80,122 Z",
  sideR: "M160,122 C160,110 166,103 174,101 C182,103 188,110 188,122 Z",
  dome: "M76,114 C76,86 96,64 120,52 C144,64 164,86 164,114 Z",
  amalaka: ell(120, 50, 11, 5),
  kalash: "M114,46 C109,40 111,31 120,29 C129,31 131,40 126,46 Z",
};
const mandirShared: Layer[] = [
  ...PLINTH_LAYERS,
  { d: "M64,138 H176", mode: "shade", w: 5 },
  { d: "M58,125 H182", mode: "shade", w: 3 },
  { d: "M100,112 C100,90 108,72 120,56", mode: "line" },
  { d: "M140,112 C140,90 132,72 120,56", mode: "line" },
  { d: "M120,112 L120,56", mode: "line" },
  { d: "M88,112 C88,94 98,78 110,64", mode: "line" },
  { d: "M152,112 C152,94 142,78 130,64", mode: "line" },
  { d: "M70,144 V236", mode: "line" },
  { d: "M74,144 V236", mode: "line" },
  { d: "M166,144 V236", mode: "line" },
  { d: "M170,144 V236", mode: "line" },
  { d: "M58,119 H182", mode: "goldLine", w: 1.4 },
  { d: "M52,129 H188", mode: "goldLine", w: 1.2 },
  { d: "M64,150 H80", mode: "goldLine", w: 1.6 },
  { d: "M64,230 H80", mode: "goldLine", w: 1.6 },
  { d: "M160,150 H176", mode: "goldLine", w: 1.6 },
  { d: "M160,230 H176", mode: "goldLine", w: 1.6 },
  { d: "M50,257 H190", mode: "goldLine", w: 1.2 },
  { d: "M80,106 C100,100 140,100 160,106", mode: "goldLine", w: 1.4 },
  { d: "M120,29 L120,6", mode: "goldLine", w: 1.6 },
  { d: M.kalash, mode: "gold" },
  { d: ell(66, 99, 3, 3), mode: "gold" },
  { d: ell(174, 99, 3, 3), mode: "gold" },
  { d: "M109,50 H131", mode: "goldLine", w: 1.6 },
  { d: "M120,8 L144,13.5 L120,19 Z", mode: "saffron" },
];
const mandirFront: Drawing = {
  parts: [...PLINTH, M.platform, M.wall, M.pillarL, M.pillarR, M.capL, M.capR, M.baseL, M.baseR, M.roof, M.cornice, M.sideL, M.sideR, M.dome, M.amalaka, M.kalash],
  layers: [
    ...mandirShared,
    { d: "M88,248 L88,186 C88,166 102,154 120,150 C138,154 152,166 152,186 L152,248 Z", mode: "dark" },
    { d: ell(120, 226, 30, 26), mode: "glow" },
    { d: "M88,248 L88,186 C88,166 102,154 120,150 C138,154 152,166 152,186 L152,248", mode: "goldLine", w: 2 },
    { d: "M120,151 L120,160", mode: "goldLine", w: 1 },
    { d: "M117,160 L123,160 L124,168 L116,168 Z", mode: "gold" },
    { d: "M110,236 C112,242 128,242 130,236 Z", mode: "gold" },
    { d: "M120,218 C115,225 116,232 120,234 C124,232 125,225 120,218 Z", mode: "saffron" },
  ],
};
const mandirBack: Drawing = {
  parts: mandirFront.parts,
  layers: [
    ...mandirShared,
    { d: rr(92, 156, 56, 80, 3), mode: "line" },
    { d: rr(100, 166, 40, 60, 2), mode: "line" },
    { d: ell(120, 196, 10, 10), mode: "goldLine", w: 1.4 },
  ],
};

const DRAWINGS: Record<MoortiKind, { front: Drawing; back: Drawing }> = {
  ganesha: { front: ganeshaFront, back: ganeshaBack },
  buddha: { front: buddhaFront, back: buddhaBack },
  shivling: { front: shivlingFront, back: shivlingBack },
  nandi: { front: nandiFront, back: nandiBack },
  haathi: { front: haathiFront, back: haathiBack },
  mandir: { front: mandirFront, back: mandirBack },
};

/** CSS mask (data URI) of the front silhouette, used for shadows and dimming. */
const maskCache = new Map<string, string>();
export function moortiMask(kind: MoortiKind) {
  const cached = maskCache.get(kind);
  if (cached) return cached;
  const paths = DRAWINGS[kind].front.parts.map((d) => `<path d='${d}'/>`).join("");
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${MVB_W} ${MVB_H}' preserveAspectRatio='xMidYMax meet'>${paths}</svg>`)}")`;
  maskCache.set(kind, url);
  return url;
}

/** Shared SVG definitions. Render once per group of <MoortiArt> using the same uid. */
export function MarbleDefs({ uid }: { uid: string }) {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute" focusable="false">
      <defs>
        {MOORTI_KINDS.map((kind) => (["front", "back"] as const).map((side) => (
          <clipPath key={`${kind}-${side}`} id={`${uid}-sil-${kind}-${side}`}>
            {DRAWINGS[kind][side].parts.map((d, i) => <path key={i} d={d} />)}
          </clipPath>
        )))}
        {TONES.map((tone) => {
          const p = PALETTE[tone];
          return (
            <React.Fragment key={tone}>
              <linearGradient id={`${uid}-tone-${tone}`} x1="0.2" x2="0.8" y1="0" y2="1">
                <stop offset="0" stopColor={p.hi} />
                <stop offset="0.55" stopColor={p.base} />
                <stop offset="1" stopColor={p.low} />
              </linearGradient>
              <filter id={`${uid}-vein-${tone}`} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.006 0.026" numOctaves="4" seed="9" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.25" result="a" />
                <feComponentTransfer in="a" result="v">
                  <feFuncA type="table" tableValues="0 0 0 0 0.95 0.15 0 0 0 0 0.6 0.05 0 0" />
                </feComponentTransfer>
                <feFlood floodColor={p.vein} />
                <feComposite in2="v" operator="in" />
              </filter>
            </React.Fragment>
          );
        })}
        <radialGradient id={`${uid}-light`} cx="0.36" cy="0.22" r="0.85">
          <stop offset="0" stopColor="white" stopOpacity="0.42" />
          <stop offset="0.42" stopColor="white" stopOpacity="0" />
          <stop offset="0.8" stopColor="black" stopOpacity="0.08" />
          <stop offset="1" stopColor="black" stopOpacity="0.22" />
        </radialGradient>
        <linearGradient id={`${uid}-gold`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F6E2A6" />
          <stop offset="0.35" stopColor="#D2A54B" />
          <stop offset="0.7" stopColor="#9A6E24" />
          <stop offset="1" stopColor="#E8C77A" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#FFD38A" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#F2A541" stopOpacity="0.35" />
          <stop offset="1" stopColor="#F2A541" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.5" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}

export interface MoortiArtProps {
  uid: string;
  kind: MoortiKind;
  side?: "front" | "back";
  tone?: MarbleTone;
  /** Paint colour for robes, dhoti or saddle cloth. Leave empty for plain marble. */
  accent?: string;
  className?: string;
}

/** A single marble moorti, drawn in SVG. Needs <MarbleDefs uid={uid} /> on the page. */
export function MoortiArt({ uid, kind, side = "front", tone = "white", accent, className }: MoortiArtProps) {
  const art = DRAWINGS[kind][side];
  const p = PALETTE[tone];
  const fill = `url(#${uid}-tone-${tone})`;
  const soft = `url(#${uid}-soft)`;
  const layers = art.layers;
  const of = (mode: Mode) => layers.filter((l) => l.mode === mode);
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${MVB_W} ${MVB_H}`} preserveAspectRatio="xMidYMax meet" className={className ?? "absolute inset-0 size-full overflow-visible"}>
      <g transform={art.mirror ? `translate(${MVB_W} 0) scale(-1 1)` : undefined}>
        <g clipPath={`url(#${uid}-sil-${kind}-${side})`}>
          {art.parts.map((d, i) => (
            <React.Fragment key={i}>
              <path d={d} fill={fill} />
              <path d={d} fill="none" stroke={p.shade} strokeOpacity="0.26" strokeWidth="6" filter={soft} />
            </React.Fragment>
          ))}
          <rect x="-120" y="-60" width="480" height="420" fill="black" filter={`url(#${uid}-vein-${tone})`} opacity={p.veinOpacity} transform="rotate(-28 120 150)" />
          {accent && of("paint").map((l, i) => (
            <React.Fragment key={`p${i}`}>
              <path d={l.d} fill={accent} fillOpacity="0.92" />
              <path d={l.d} fill="none" stroke="black" strokeOpacity="0.28" strokeWidth="5" filter={soft} />
            </React.Fragment>
          ))}
          {of("over").map((l, i) => (
            <React.Fragment key={`o${i}`}>
              <path d={l.d} fill={fill} />
              <path d={l.d} fill="none" stroke={p.shade} strokeOpacity="0.26" strokeWidth="5" filter={soft} />
            </React.Fragment>
          ))}
          {of("hair").map((l, i) => <path key={`h${i}`} d={l.d} fill="#232A3B" fillOpacity="0.92" />)}
          {of("surface").map((l, i) => <path key={`s${i}`} d={l.d} fill="white" fillOpacity={tone === "black" || tone === "green" ? 0.12 : 0.35} />)}
          {of("dark").map((l, i) => <path key={`d${i}`} d={l.d} fill="#1F1812" fillOpacity="0.88" />)}
          {of("glow").map((l, i) => <path key={`g${i}`} d={l.d} fill={`url(#${uid}-glow)`} />)}
          <g fill="none" strokeLinecap="round" filter={soft}>
            {of("shade").map((l, i) => <path key={`sh${i}`} d={l.d} stroke={p.shade} strokeOpacity="0.3" strokeWidth={l.w ?? 5} />)}
          </g>
          <rect width={MVB_W} height={MVB_H} fill={`url(#${uid}-light)`} />
          <rect width={MVB_W} height={MVB_H} filter={`url(#${uid}-grain)`} opacity="0.1" style={{ mixBlendMode: "multiply" }} />
        </g>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {of("line").map((l, i) => (
            <React.Fragment key={`l${i}`}>
              <path d={l.d} stroke={p.lineHi} strokeOpacity="0.55" strokeWidth="0.9" transform="translate(0.5 0.7)" />
              <path d={l.d} stroke={p.line} strokeOpacity="0.42" strokeWidth="0.9" />
            </React.Fragment>
          ))}
          {of("goldLine").map((l, i) => (
            <path key={`gl${i}`} d={l.d} stroke={`url(#${uid}-gold)`} strokeWidth={l.w ?? 2} strokeDasharray={l.dash} />
          ))}
        </g>
        {of("gold").map((l, i) => (
          <React.Fragment key={`go${i}`}>
            <path d={l.d} fill={`url(#${uid}-gold)`} />
            <path d={l.d} fill="none" stroke="#6B4A14" strokeOpacity="0.45" strokeWidth="0.6" />
          </React.Fragment>
        ))}
        {of("ivory").map((l, i) => <path key={`iv${i}`} d={l.d} fill="#FFF7E6" stroke="#8C7A5E" strokeOpacity="0.4" strokeWidth="0.6" />)}
        {of("red").map((l, i) => <path key={`r${i}`} d={l.d} fill="#B4231B" />)}
        {of("saffron").map((l, i) => <path key={`sa${i}`} d={l.d} fill="#E2792C" stroke="#9A4512" strokeOpacity="0.4" strokeWidth="0.5" />)}
      </g>
    </svg>
  );
}
