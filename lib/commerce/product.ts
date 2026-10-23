import type { Product, Variant } from "./types";

export type Availability = "available" | "low" | "sold-out" | "untracked";

export const LOW_STOCK = 3;

export function variantAvailability(v: Variant | undefined): Availability {
  if (!v) return "sold-out";
  if (v.stock === null) return "untracked";
  if (v.stock <= 0) return "sold-out";
  if (v.stock <= LOW_STOCK) return "low";
  return "available";
}

export function findVariantFor(p: Product, colourId: string, size: string): Variant | undefined {
  return p.variants.find((v) => v.colourId === colourId && v.size === size);
}

export function isColourSoldOut(p: Product, colourId: string): boolean {
  return p.variants.filter((v) => v.colourId === colourId).every((v) => v.stock !== null && v.stock <= 0);
}

export function isProductSoldOut(p: Product): boolean {
  return p.variants.every((v) => v.stock !== null && v.stock <= 0);
}

export function isOnSale(p: Product): boolean {
  return typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price;
}

/** Máximo que se pode encomendar de uma variante. */
export function maxQuantity(v: Variant | undefined): number {
  if (!v) return 0;
  return v.stock === null ? 10 : Math.min(10, Math.max(0, v.stock));
}
