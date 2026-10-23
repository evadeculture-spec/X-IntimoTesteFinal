import "server-only";
import { randomBytes } from "node:crypto";
import { findVariant, getBrand } from "./catalog";
import { computeTotals, methodsFor, regionFromPostalCode } from "./pricing";
import { maxQuantity } from "./product";
import { shippingMethods } from "./settings";
import type { Cents, ShippingMethod } from "./types";
import { normalizePhone, normalizePostalCode, validateCheckout, type CheckoutErrors, type CheckoutInput } from "./validation";

export interface OrderLine {
  sku: string;
  slug: string;
  name: string;
  brandName: string;
  colourName: string;
  size: string;
  unitPrice: Cents;
  quantity: number;
}

export interface Order {
  ref: string;
  createdAt: string;
  lines: OrderLine[];
  shippingMethod: ShippingMethod;
  subtotal: Cents;
  shipping: Cents;
  /** true quando os portes ainda não estão configurados e serão combinados com a loja. */
  shippingPending: boolean;
  total: Cents;
  customer: CheckoutInput;
}

export const PENDING_SHIPPING: ShippingMethod = {
  id: "a-combinar",
  label: "Entrega a combinar com a loja",
  description: "Os portes são confirmados pela loja antes do envio.",
  price: 0,
  regions: ["continente", "madeira", "acores"],
};

export type BuildOrderResult =
  | { ok: true; order: Order; priceChanged: boolean }
  | { ok: false; status: number; message: string; fieldErrors?: CheckoutErrors; lineErrors?: Record<string, string> };

/** Referência legível, sem caracteres ambíguos: XI-261023-7KQ2 */
export function orderRef(now = new Date()): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(4);
  const suffix = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  const d = now.toISOString().slice(2, 10).replace(/-/g, "");
  return `XI-${d}-${suffix}`;
}

/**
 * Reconstrói a encomenda a partir do catálogo (preços e stock do servidor,
 * nunca do cliente) e valida os dados do cliente.
 */
export function buildOrder(
  rawLines: { sku: string; quantity: number; unitPrice?: number }[],
  input: CheckoutInput,
  shippingMethodId: string,
): BuildOrderResult {
  if (!Array.isArray(rawLines) || rawLines.length === 0)
    return { ok: false, status: 400, message: "O seu saco está vazio." };
  if (rawLines.length > 50) return { ok: false, status: 400, message: "Demasiados artigos num só pedido." };

  const customer: CheckoutInput = {
    ...input,
    postalCode: normalizePostalCode(input.postalCode ?? ""),
    phone: normalizePhone(input.phone ?? "") ?? input.phone,
  };
  const fieldErrors = validateCheckout(customer);
  if (Object.keys(fieldErrors).length)
    return { ok: false, status: 422, message: "Há campos por corrigir.", fieldErrors };

  const lineErrors: Record<string, string> = {};
  let priceChanged = false;
  const lines: OrderLine[] = [];
  for (const raw of rawLines) {
    const found = findVariant(String(raw.sku));
    const qty = Math.floor(Number(raw.quantity));
    if (!found) {
      lineErrors[raw.sku] = "Este artigo já não está disponível.";
      continue;
    }
    const { product, variant } = found;
    const max = maxQuantity(variant);
    if (max === 0) lineErrors[raw.sku] = `${product.name} (${variant.size}) esgotou entretanto.`;
    else if (!(qty >= 1) || qty > max) lineErrors[raw.sku] = `Só temos ${max} unidade(s) de ${product.name} (${variant.size}).`;
    if (raw.unitPrice !== undefined && raw.unitPrice !== product.price) priceChanged = true;
    const colour = product.colours.find((c) => c.id === variant.colourId);
    lines.push({
      sku: variant.sku,
      slug: product.slug,
      name: product.name,
      brandName: getBrand(product.brandId)?.name ?? "",
      colourName: colour?.name ?? "",
      size: variant.size,
      unitPrice: product.price,
      quantity: qty,
    });
  }
  if (Object.keys(lineErrors).length)
    return { ok: false, status: 409, message: "Alguns artigos do saco precisam de atenção.", lineErrors };

  const configured = shippingMethods();
  if (configured.length === 0) {
    if (customer.channel !== "whatsapp")
      return { ok: false, status: 503, message: "O pagamento online ainda não está disponível." };
    const totals = computeTotals(lines, PENDING_SHIPPING);
    return {
      ok: true,
      priceChanged,
      order: {
        ref: orderRef(),
        createdAt: new Date().toISOString(),
        lines,
        shippingMethod: PENDING_SHIPPING,
        subtotal: totals.subtotal,
        shipping: 0,
        shippingPending: true,
        total: totals.total,
        customer,
      },
    };
  }

  const region = customer.delivery === "envio" ? regionFromPostalCode(customer.postalCode) : null;
  const available = methodsFor(configured, region).filter((m) =>
    customer.delivery === "levantamento" ? m.regions === "pickup" : m.regions !== "pickup",
  );
  const method = available.find((m) => m.id === shippingMethodId);
  if (!method)
    return {
      ok: false,
      status: 422,
      message: available.length ? "Escolha um método de entrega." : "Ainda não há entregas configuradas para esta morada.",
      fieldErrors: {},
    };

  const totals = computeTotals(lines, method);
  return {
    ok: true,
    priceChanged,
    order: {
      ref: orderRef(),
      createdAt: new Date().toISOString(),
      lines,
      shippingMethod: method,
      subtotal: totals.subtotal,
      shipping: totals.shipping ?? 0,
      shippingPending: false,
      total: totals.total,
      customer,
    },
  };
}
