import type { GarmentKind, Weave } from "@/lib/commerce/types";
import { FLATS } from "./garments";

/** Luminância relativa (WCAG) de um hex. */
export function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function WeavePattern({ id, weave, hex, scale }: { id: string; weave: Weave; hex: string; scale?: number }) {
  const t = scale ? `scale(${scale})` : undefined;
  const dark = "rgba(20,16,12,0.16)";
  const light = "rgba(255,255,255,0.14)";
  switch (weave) {
    case "canelado":
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="6" height="6" fill={hex} />
          <path d="M1.5 0V6" stroke={dark} strokeWidth="1.3" />
          <path d="M4.5 0V6" stroke={light} strokeWidth="1" />
        </pattern>
      );
    case "flanela":
      return (
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="28" height="28" fill={hex} />
          <rect width="14" height="28" fill="rgba(20,16,12,0.10)" />
          <rect width="28" height="14" fill={light} />
          <path d="M21 0V28M0 21H28" stroke={dark} strokeWidth="0.8" />
        </pattern>
      );
    case "favo":
      return (
        <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="7" height="7" fill={hex} />
          <rect x="1" y="1" width="5" height="5" fill="none" stroke={dark} strokeWidth="0.9" />
          <rect x="2.2" y="2.2" width="2.6" height="2.6" fill={light} />
        </pattern>
      );
    case "malha":
      return (
        <pattern id={id} width="6" height="8" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="6" height="8" fill={hex} />
          <path d="M0 0L3 4L6 0M0 4L3 8L6 4" fill="none" stroke={dark} strokeWidth="0.8" />
        </pattern>
      );
    default:
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="10" height="10" fill={hex} />
        </pattern>
      );
  }
}

export interface ProductPlateProps {
  garment: GarmentKind;
  weave: Weave;
  hex: string;
  /** Rótulo acessível; vazio = decorativo. */
  label?: string;
  className?: string;
}

/** Caixa do desenho (a partir das coordenadas das silhuetas), para enquadrar todas as peças da mesma forma. */
const FIT_CACHE = new Map<GarmentKind, { x: number; y: number; w: number; h: number; zoom: number }>();
function fittedBox(garment: GarmentKind) {
  const hit = FIT_CACHE.get(garment);
  if (hit) return hit;
  const nums = FLATS[garment].outline.join(" ").match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // A peça ocupa ~70% da largura ou ~74% da altura da prancha (4:5), o que for mais restritivo.
  const w = Math.max((x1 - x0) / 0.7, ((y1 - y0) / 0.74) * 0.8);
  const h = w * 1.25;
  const box = { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2 - h * 0.02, w, h, zoom: 200 / w };
  FIT_CACHE.set(garment, box);
  return box;
}

/**
 * Prancha de produto: desenho técnico plano sobre fundo de linho, preenchido
 * com o tecido da cor escolhida. Todas as peças são enquadradas pela mesma
 * regra (caixa ajustada), com traço e textura à mesma escala visual.
 * Substituída automaticamente pela fotografia real quando o produto tiver imagens.
 */
export function ProductPlate({ garment, weave, hex, label, className }: ProductPlateProps) {
  const flat = FLATS[garment];
  const box = fittedBox(garment);
  const id = `w-${weave}-${hex.replace("#", "")}-${garment}`;
  const isDark = luminance(hex) < 0.18;
  const detail = isDark ? "rgba(255,255,255,0.55)" : "rgba(27,25,23,0.55)";
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg
      className={`plate ${className ?? ""}`}
      viewBox={`${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <WeavePattern id={id} weave={weave} hex={hex} scale={1 / box.zoom} />
        <linearGradient id="plate-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      {flat.outline.map((d, i) => (
        <g key={i}>
          <path d={d} fill={`url(#${id})`} />
          <path d={d} fill="url(#plate-shade)" stroke="var(--plate-ink, #1B1917)" strokeWidth="1.4" strokeLinejoin="round" {...ns} />
        </g>
      ))}
      {flat.details.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={detail} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...ns} />
      ))}
      {flat.stitches?.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={detail} strokeWidth="1" strokeDasharray="2.4 2.6" strokeLinecap="round" {...ns} />
      ))}
      {flat.dots?.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.9 / Math.max(1, box.zoom * 0.8)} fill={isDark ? "#EDE6DA" : "#1B1917"} opacity="0.75" />
      ))}
    </svg>
  );
}
