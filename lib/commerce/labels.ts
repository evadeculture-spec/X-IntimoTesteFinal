import type { Audience, ColourFamily } from "./types";

export const AUDIENCE_LABEL: Record<Audience, string> = {
  mulher: "Mulher",
  homem: "Homem",
  crianca: "Criança",
  unissexo: "Unissexo",
};

export const COLOUR_FAMILY: Record<ColourFamily, { label: string; hex: string }> = {
  preto: { label: "Preto", hex: "#1d1c1b" },
  branco: { label: "Branco", hex: "#f6f4ef" },
  cru: { label: "Cru", hex: "#eadfcb" },
  cinzento: { label: "Cinzento", hex: "#8f8c87" },
  azul: { label: "Azul", hex: "#2b3a5c" },
  rosa: { label: "Rosa", hex: "#ddb9a8" },
  vermelho: { label: "Vermelho", hex: "#8a2a2a" },
  verde: { label: "Verde", hex: "#2f4a3a" },
  castanho: { label: "Castanho", hex: "#9a7653" },
  estampado: { label: "Estampado", hex: "#c9b79a" },
};
