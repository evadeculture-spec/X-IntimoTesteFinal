import type { Weave } from "@/lib/commerce/types";
import { WeavePattern } from "./ProductPlate";

const WEAVE_LABEL: Record<Weave, string> = {
  canelado: "Malha canelada",
  flanela: "Flanela",
  favo: "Malha favo",
  malha: "Malha jersey",
  liso: "Tecido liso",
};

/** Grande plano ilustrativo do tecido (amostra), na cor escolhida. */
export function FabricSwatch({ weave, hex, colourName }: { weave: Weave; hex: string; colourName: string }) {
  const id = `macro-${weave}-${hex.replace("#", "")}`;
  return (
    <span className="plate-frame">
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label={`Amostra ilustrativa do tecido: ${WEAVE_LABEL[weave]}, ${colourName}`}>
        <defs>
          <WeavePattern id={id} weave={weave} hex={hex} scale={4.5} />
          <radialGradient id="macro-light" cx="0.3" cy="0.25" r="0.9">
            <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#000" stopOpacity="0.22" />
          </radialGradient>
        </defs>
        <rect width="200" height="250" fill={`url(#${id})`} />
        <rect width="200" height="250" fill="url(#macro-light)" />
      </svg>
      <span className="swatch-macro__label">
        {WEAVE_LABEL[weave]} · {colourName}
      </span>
    </span>
  );
}
