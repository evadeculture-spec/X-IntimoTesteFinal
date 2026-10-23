import "server-only";
import type { Catalog, CatalogMode, CategoryId, Product } from "./types";
import { BRANDS, CATEGORIES, SIZE_CHARTS } from "@/data/taxonomy";
import { DEMO_PRODUCTS } from "@/data/demo-catalog";
import storeCatalog from "@/data/store-catalog.json";
import { validateProducts } from "./validate-catalog";

/**
 * Seleção da fonte de catálogo.
 *  - COMMERCE_CATALOG=store → catálogo real (data/store-catalog.json)
 *  - COMMERCE_CATALOG=demo  → catálogo de demonstração (faixa de aviso + noindex)
 *  - não definido           → real se tiver produtos; caso contrário demonstração
 */
function resolveMode(): CatalogMode {
  const env = process.env.COMMERCE_CATALOG;
  if (env === "store" || env === "demo") return env;
  return (storeCatalog.products as unknown[]).length > 0 ? "store" : "demo";
}

let cached: Catalog | null = null;

export function getCatalog(): Catalog {
  if (cached) return cached;
  const mode = resolveMode();
  let products: Product[];
  if (mode === "store") {
    const raw = storeCatalog.products as unknown[];
    const { products: valid, errors } = validateProducts(raw);
    if (errors.length) {
      // Falha visível no build/arranque em vez de mostrar dados errados.
      throw new Error(`Catálogo inválido (data/store-catalog.json):\n- ${errors.join("\n- ")}`);
    }
    products = valid;
  } else {
    products = DEMO_PRODUCTS;
  }
  cached = { mode, products, brands: BRANDS, categories: CATEGORIES, sizeCharts: SIZE_CHARTS };
  return cached;
}

export const isDemo = () => getCatalog().mode === "demo";

export function getProduct(slug: string): Product | undefined {
  return getCatalog().products.find((p) => p.slug === slug);
}

export function getCategory(id: string) {
  return getCatalog().categories.find((c) => c.id === id);
}

export function getBrand(id: string) {
  return getCatalog().brands.find((b) => b.id === id);
}

export function getSizeChart(id: string) {
  return getCatalog().sizeCharts.find((s) => s.id === id);
}

export function productsIn(categoryId: CategoryId) {
  return getCatalog().products.filter((p) => p.categoryId === categoryId);
}

export function findVariant(sku: string) {
  for (const product of getCatalog().products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

/** Peças relacionadas: mesma família e público, depois complementares. */
export function relatedProducts(product: Product, limit = 4): Product[] {
  const all = getCatalog().products.filter((p) => p.slug !== product.slug);
  const score = (p: Product) =>
    (p.categoryId === product.categoryId ? 2 : 0) + (p.audience === product.audience ? 1 : 0);
  return [...all].sort((a, b) => score(b) - score(a)).slice(0, limit);
}
