import type { Product } from "./types";

const CATEGORY_IDS = ["pijamas", "interiores", "termica", "meias"];
const AUDIENCES = ["mulher", "homem", "crianca", "unissexo"];
const GARMENTS = ["pijama", "robe", "camisa-noite", "top", "cueca", "boxer", "camisola", "leggings", "meia"];
const WEAVES = ["canelado", "flanela", "favo", "malha", "liso"];

/** Validação estrutural do catálogo real (ficheiro editado à mão). */
export function validateProducts(raw: unknown[]): { products: Product[]; errors: string[] } {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const skus = new Set<string>();

  raw.forEach((item, i) => {
    const p = item as Partial<Product>;
    const at = `produto #${i + 1} (${p?.slug ?? "sem slug"})`;
    const req = <K extends keyof Product>(k: K) => {
      if (p[k] === undefined || p[k] === null || p[k] === "") errors.push(`${at}: falta "${String(k)}"`);
    };
    (["slug", "ref", "name", "brandId", "categoryId", "audience", "garment", "weave", "price", "summary",
      "description", "composition", "care", "colours", "sizes", "variants", "sizeChartId", "publishedAt"] as const).forEach(req);
    if (p.slug) {
      if (!/^[a-z0-9-]+$/.test(p.slug)) errors.push(`${at}: slug só pode ter a-z, 0-9 e "-"`);
      if (slugs.has(p.slug)) errors.push(`${at}: slug duplicado`);
      slugs.add(p.slug);
    }
    if (p.categoryId && !CATEGORY_IDS.includes(p.categoryId)) errors.push(`${at}: categoryId inválido`);
    if (p.audience && !AUDIENCES.includes(p.audience)) errors.push(`${at}: audience inválido`);
    if (p.garment && !GARMENTS.includes(p.garment)) errors.push(`${at}: garment inválido`);
    if (p.weave && !WEAVES.includes(p.weave)) errors.push(`${at}: weave inválido`);
    if (p.price !== undefined && (!Number.isInteger(p.price) || p.price <= 0))
      errors.push(`${at}: price tem de ser inteiro em cêntimos (> 0)`);
    if (p.compareAtPrice !== undefined && p.price !== undefined && p.compareAtPrice <= p.price)
      errors.push(`${at}: compareAtPrice tem de ser maior que price (só para reduções reais)`);
    const colourIds = new Set((p.colours ?? []).map((c) => c.id));
    (p.variants ?? []).forEach((v) => {
      if (skus.has(v.sku)) errors.push(`${at}: SKU duplicado ${v.sku}`);
      skus.add(v.sku);
      if (!colourIds.has(v.colourId)) errors.push(`${at}: variante ${v.sku} com cor desconhecida`);
      if (!(p.sizes ?? []).includes(v.size)) errors.push(`${at}: variante ${v.sku} com tamanho desconhecido`);
      if (v.stock !== null && (!Number.isInteger(v.stock) || v.stock < 0)) errors.push(`${at}: stock inválido em ${v.sku}`);
    });
  });

  return { products: errors.length ? [] : (raw as Product[]).map((p) => ({ ...p, images: p.images ?? [] })), errors };
}
