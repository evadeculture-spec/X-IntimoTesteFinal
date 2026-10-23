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
  /** Texto de etiqueta no canto (ex.: referência e cor). */
  caption?: string;
  /** Rótulo acessível; vazio = decorativo. */
  label?: string;
  className?: string;
}

/**
 * Prancha de produto: desenho técnico plano sobre fundo de linho, preenchido
 * com o tecido da cor escolhida. Substituída automaticamente pela fotografia
 * real quando o produto tiver imagens.
 */
export function ProductPlate({ garment, weave, hex, caption, label, className }: ProductPlateProps) {
  const flat = FLATS[garment];
  const id = `w-${weave}-${hex.replace("#", "")}`;
  const isDark = luminance(hex) < 0.18;
  const detail = isDark ? "rgba(255,255,255,0.55)" : "rgba(27,25,23,0.55)";
  return (
    <svg
      className={`plate ${className ?? ""}`}
      viewBox="0 0 200 250"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <WeavePattern id={id} weave={weave} hex={hex} />
        <linearGradient id="plate-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <g transform="translate(0 4)">
        {flat.outline.map((d, i) => (
          <g key={i}>
            <path d={d} fill={`url(#${id})`} />
            <path d={d} fill="url(#plate-shade)" stroke="var(--plate-ink, #1B1917)" strokeWidth="1.3" strokeLinejoin="round" />
          </g>
        ))}
        {flat.details.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={detail} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {flat.stitches?.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={detail} strokeWidth="0.9" strokeDasharray="2.2 2.4" strokeLinecap="round" />
        ))}
        {flat.dots?.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.9" fill={isDark ? "#EDE6DA" : "#1B1917"} opacity="0.75" />
        ))}
      </g>
      {caption ? (
        <text x="12" y="242" className="plate__caption">
          {caption}
        </text>
      ) : null}
    </svg>
  );
}
