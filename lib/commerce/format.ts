import type { Cents } from "./types";

const eur = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

/** 2990 → "29,90 €" */
export function formatPrice(cents: Cents): string {
  return eur.format(cents / 100);
}

const date = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" });
export function formatDate(d: Date | string): string {
  return date.format(typeof d === "string" ? new Date(d) : d);
}

/** Plural simples pt-PT: plural(1, "peça", "peças") */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
