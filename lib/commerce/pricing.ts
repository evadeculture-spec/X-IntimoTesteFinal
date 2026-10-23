import type { Cents, ShippingMethod, ShippingRegion } from "./types";

/** Região pelo código postal: 9000–9499 Madeira (inclui Porto Santo), 9500–9999 Açores. */
export function regionFromPostalCode(cp: string): ShippingRegion | null {
  const m = /^(\d{4})-\d{3}$/.exec(cp.trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1000) return null;
  if (n >= 9000 && n < 9500) return "madeira";
  if (n >= 9500) return "acores";
  return "continente";
}

export function methodsFor(methods: ShippingMethod[], region: ShippingRegion | null): ShippingMethod[] {
  return methods.filter((m) => m.regions === "pickup" || (region !== null && m.regions.includes(region)));
}

export function shippingCost(method: ShippingMethod, subtotal: Cents): Cents {
  if (method.freeFrom !== undefined && subtotal >= method.freeFrom) return 0;
  return method.price;
}

export interface Totals {
  subtotal: Cents;
  shipping: Cents | null;
  total: Cents;
  itemCount: number;
}

export function computeTotals(
  lines: { unitPrice: Cents; quantity: number }[],
  method?: ShippingMethod | null,
): Totals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const shipping = method ? shippingCost(method, subtotal) : null;
  return {
    subtotal,
    shipping,
    total: subtotal + (shipping ?? 0),
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  };
}
