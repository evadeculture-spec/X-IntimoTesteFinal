import type { Audience, CategoryId, ColourFamily, Product } from "./types";

export type SortKey = "relevancia" | "novidades" | "preco-asc" | "preco-desc";

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "relevancia", label: "Sugestão da loja" },
  { id: "novidades", label: "Novidades" },
  { id: "preco-asc", label: "Preço: mais baixo" },
  { id: "preco-desc", label: "Preço: mais alto" },
];

export interface ProductQuery {
  categoria?: CategoryId;
  q?: string;
  publico: Audience[];
  marca: string[];
  tamanho: string[];
  cor: ColourFamily[];
  ordem: SortKey;
  pagina: number;
}

export const PAGE_SIZE = 24;

type Params = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);

export function parseQuery(params: Params, categoria?: CategoryId): ProductQuery {
  const ordem = (list(params.ordem)[0] ?? "relevancia") as SortKey;
  const pagina = Math.max(1, Number.parseInt(list(params.pagina)[0] ?? "1", 10) || 1);
  const q = list(params.q)[0]?.slice(0, 80);
  return {
    categoria,
    q,
    publico: list(params.publico) as Audience[],
    marca: list(params.marca),
    tamanho: list(params.tamanho),
    cor: list(params.cor) as ColourFamily[],
    ordem: SORT_OPTIONS.some((o) => o.id === ordem) ? ordem : "relevancia",
    pagina,
  };
}

/** Normaliza para pesquisa sem acentos nem maiúsculas. */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function matchesSearch(p: Product, q: string, brandName = ""): boolean {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = normalize(
    [p.name, p.summary, brandName, p.categoryId, p.audience, p.composition.join(" "), p.colours.map((c) => c.name).join(" ")].join(" "),
  );
  // Plurais simples: "pijamas" encontra "pijama", "meia" encontra "meias".
  return terms.every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, "")));
}

export interface QueryResult {
  items: Product[];
  total: number;
  pages: number;
  page: number;
  /** Facetas calculadas sobre o conjunto antes dos filtros opcionais. */
  facets: { publico: Audience[]; marca: string[]; tamanho: string[]; cor: ColourFamily[] };
}

export function runQuery(products: Product[], query: ProductQuery, brandName: (id: string) => string = () => ""): QueryResult {
  const base = products.filter(
    (p) => (!query.categoria || p.categoryId === query.categoria) && (!query.q || matchesSearch(p, query.q, brandName(p.brandId))),
  );

  const facets = {
    publico: unique(base.map((p) => p.audience)),
    marca: unique(base.map((p) => p.brandId)),
    tamanho: sortSizes(unique(base.flatMap((p) => p.sizes))),
    cor: unique(base.flatMap((p) => p.colours.map((c) => c.family))),
  };

  const filtered = base.filter(
    (p) =>
      (!query.publico.length || query.publico.includes(p.audience)) &&
      (!query.marca.length || query.marca.includes(p.brandId)) &&
      (!query.tamanho.length || p.variants.some((v) => query.tamanho.includes(v.size) && v.stock !== 0)) &&
      (!query.cor.length || p.colours.some((c) => query.cor.includes(c.family))),
  );

  const sorted = [...filtered];
  switch (query.ordem) {
    case "novidades":
      sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      break;
    case "preco-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "preco-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    default:
      // ordem do catálogo = curadoria da loja; novidades primeiro
      sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  }

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(query.pagina, pages);
  return {
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: sorted.length,
    pages,
    page,
    facets,
  };
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "2A", "4A", "6A", "8A", "10A", "12A"];
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "pt", { numeric: true });
  });
}

/** Serializa uma query para URL, opcionalmente alterando um campo. */
export function queryToSearch(q: ProductQuery, patch: Partial<ProductQuery> = {}): string {
  const m = { ...q, ...patch };
  const sp = new URLSearchParams();
  if (m.q) sp.set("q", m.q);
  if (m.publico.length) sp.set("publico", m.publico.join(","));
  if (m.marca.length) sp.set("marca", m.marca.join(","));
  if (m.tamanho.length) sp.set("tamanho", m.tamanho.join(","));
  if (m.cor.length) sp.set("cor", m.cor.join(","));
  if (m.ordem !== "relevancia") sp.set("ordem", m.ordem);
  if (m.pagina > 1) sp.set("pagina", String(m.pagina));
  const s = sp.toString();
  return s ? `?${s}` : "";
}
