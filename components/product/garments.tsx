import type { GarmentKind } from "@/lib/commerce/types";

/**
 * Desenhos técnicos planos ("flats") por tipo de peça, viewBox 0 0 200 240.
 * `outline` = silhueta preenchida com o tecido; `details` = costuras e acabamentos.
 * São ilustrações de apresentação — não representam o modelo exato do produto.
 */
export interface Flat {
  outline: string[];
  details: string[];
  stitches?: string[];
  dots?: [number, number][];
}

const LONG_TOP = "M78 28 Q100 40 122 28 L148 36 L178 128 L160 134 L140 78 L142 150 L58 150 L60 78 L40 134 L22 128 L52 36 Z";

const T = (path: string, dx: number, dy: number, s: number) =>
  path.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(Number(x) * s + dx).toFixed(1)} ${+(Number(y) * s + dy).toFixed(1)}`);

const SHIRT = { outline: LONG_TOP, collar: "M78 28 L88 50 L100 40 L112 50 L122 28", placket: "M100 42 L100 150" };
const TROUSERS = "M59 20 L141 20 L150 225 L110 228 L100 80 L90 228 L50 225 Z";

export const FLATS: Record<GarmentKind, Flat> = {
  pijama: {
    outline: [T(TROUSERS, 62, 70, 0.66), T(SHIRT.outline, 4, 8, 0.7)],
    details: [
      T(SHIRT.collar, 4, 8, 0.7),
      T("M59 32 L141 32", 62, 70, 0.66),
      T("M100 32 L100 80", 62, 70, 0.66),
      T("M48 214 L91 217 M109 217 L151 214", 62, 70, 0.66),
      T("M40 126 L22 120 M160 126 L178 120", 4, 8, 0.7),
    ],
    stitches: [T(SHIRT.placket, 4, 8, 0.7), T("M64 140 L136 140", 4, 8, 0.7)],
    dots: [56, 76, 96, 116].map((y) => [+(100 * 0.7 + 4 + 3).toFixed(1), +(y * 0.7 + 8).toFixed(1)] as [number, number]),
  },
  robe: {
    outline: ["M80 22 Q100 30 120 22 L150 32 L184 140 L164 146 L146 92 L150 226 L50 226 L54 92 L36 146 L16 140 L50 32 Z"],
    details: [
      "M80 22 Q70 72 100 122",
      "M120 22 Q130 72 100 122",
      "M100 122 L112 226",
      "M52 116 L148 116 L148 127 L52 127 Z",
      "M96 127 L86 170 M104 127 L114 168",
      "M38 138 L18 132 M162 138 L182 132",
    ],
    stitches: ["M60 152 L84 152 L84 178 L60 178 Z", "M116 152 L140 152 L140 178 L116 178 Z"],
  },
  "camisa-noite": {
    outline: [
      "M74 18 L80 18 L84 52 Q100 62 116 52 L120 18 L126 18 L132 58 Q140 72 137 92 L158 224 Q100 236 42 224 L63 92 Q60 72 68 58 Z",
    ],
    details: ["M65 86 Q100 98 135 86"],
    stitches: ["M46 216 Q100 228 154 216"],
  },
  top: {
    outline: ["M70 46 L78 46 L86 98 Q100 110 114 98 L122 46 L130 46 L142 118 L144 168 L56 168 L58 118 Z"],
    details: ["M58 144 L142 144", "M100 104 L100 144"],
    stitches: ["M58 160 L142 160", "M66 116 Q84 128 100 106 Q116 128 134 116"],
  },
  cueca: {
    outline: ["M36 76 L164 76 L162 94 Q132 108 116 172 L84 172 Q68 108 38 94 Z"],
    details: ["M37 88 L163 88"],
    stitches: ["M84 172 Q100 160 116 172", "M44 98 Q72 112 86 164 M156 98 Q128 112 114 164"],
  },
  boxer: {
    outline: ["M44 66 L156 66 L157 84 L166 172 L110 178 L100 122 L90 178 L34 172 L43 84 Z"],
    details: ["M43 84 L157 84"],
    stitches: ["M100 88 Q114 104 100 122", "M36 162 L90 168 M110 168 L164 162"],
  },
  camisola: {
    outline: [LONG_TOP],
    details: ["M84 32 Q100 48 116 32", "M40 128 L22 122 M160 128 L178 122"],
    stitches: ["M60 140 L140 140", "M44 120 L26 114 M156 120 L174 114"],
  },
  leggings: {
    outline: ["M64 18 L136 18 L137 40 L128 226 L106 228 L100 92 L94 228 L72 226 L63 40 Z"],
    details: ["M63 40 L137 40"],
    stitches: ["M100 44 L100 92", "M73 212 L94 213 M106 213 L127 212"],
  },
  meia: {
    outline: ["M78 18 L122 18 L123 138 Q125 158 142 170 L170 184 Q190 196 181 214 Q172 230 150 226 L96 214 Q74 208 75 184 Z"],
    details: ["M78 50 L122 50", "M76 186 Q86 168 104 182", "M150 226 Q154 200 172 186"],
    stitches: ["M86 20 L86 48 M94 20 L94 48 M102 20 L102 48 M110 20 L110 48 M118 20 L118 48"],
  },
};
