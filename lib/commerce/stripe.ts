import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Order } from "./order";

/**
 * Integração mínima com Stripe Checkout (página de pagamento alojada pela Stripe).
 * Não guardamos nem recebemos dados de cartão. Os métodos de pagamento
 * (cartão, MB WAY, Multibanco…) são escolhidos no painel Stripe
 * ("dynamic payment methods").
 */
const API = "https://api.stripe.com/v1";

function key(): string {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY não definido");
  return k;
}

function encode(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const name = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null || v === "") return [];
    if (typeof v === "object") return encode(v as Record<string, unknown>, name);
    return [`${encodeURIComponent(name)}=${encodeURIComponent(String(v))}`];
  });
}

async function stripe<T>(path: string, init: { method: "GET" | "POST"; body?: Record<string, unknown>; idempotencyKey?: string }): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.body ? encode(init.body).join("&") : undefined,
    cache: "no-store",
  });
  const json = (await res.json()) as T & { error?: { message?: string; type?: string } };
  if (!res.ok) {
    // Registo sem dados pessoais.
    console.error("[stripe] erro", res.status, json.error?.type);
    throw new Error("Falha a comunicar com o fornecedor de pagamentos.");
  }
  return json;
}

export interface CheckoutSession {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  client_reference_id: string | null;
  metadata: Record<string, string>;
}

export async function createCheckoutSession(order: Order, baseUrl: string): Promise<CheckoutSession> {
  const c = order.customer;
  const lineItems = Object.fromEntries(
    order.lines.map((l, i) => [
      i,
      {
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: l.unitPrice,
          product_data: { name: `${l.name} — ${l.colourName}, ${l.size}`, metadata: { sku: l.sku } },
        },
      },
    ]),
  );
  return stripe<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    idempotencyKey: order.ref,
    body: {
      mode: "payment",
      locale: "pt",
      customer_email: c.email,
      client_reference_id: order.ref,
      line_items: lineItems,
      shipping_options: {
        0: {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: order.shippingMethod.label,
            fixed_amount: { amount: order.shipping, currency: "eur" },
          },
        },
      },
      payment_intent_data:
        c.delivery === "envio"
          ? {
              shipping: {
                name: `${c.firstName} ${c.lastName}`,
                phone: c.phone,
                address: { line1: c.address, line2: c.address2, postal_code: c.postalCode, city: c.city, country: "PT" },
              },
            }
          : undefined,
      metadata: { order_ref: order.ref, delivery: c.delivery, nif: c.nif },
      success_url: `${baseUrl}/encomenda/confirmada?ref=${order.ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelado=1`,
    },
  });
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(id) || !process.env.STRIPE_SECRET_KEY) return null;
  try {
    return await stripe<CheckoutSession>(`/checkout/sessions/${id}`, { method: "GET" });
  } catch {
    return null;
  }
}

/** Verifica o cabeçalho Stripe-Signature (esquema v1, HMAC-SHA256). */
export function verifyWebhookSignature(payload: string, header: string | null, secret: string, toleranceSec = 300, now = Date.now()): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  const signatures = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || !signatures.length) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return signatures.some((sig) => sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}
