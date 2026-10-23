import "server-only";
import { BUSINESS, DEMO_SHIPPING_METHODS, SHIPPING_METHODS } from "@/data/store";
import { getCatalog } from "./catalog";

export function shippingMethods() {
  return getCatalog().mode === "demo" ? DEMO_SHIPPING_METHODS : SHIPPING_METHODS;
}

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}

export function whatsappNumber(): string | null {
  const n = process.env.WHATSAPP_NUMBER || BUSINESS.whatsapp;
  return n && /^\d{8,15}$/.test(n) ? n : null;
}

export interface ChannelStatus {
  online: { enabled: boolean; reason?: string };
  whatsapp: { enabled: boolean; number: string | null };
}

/** Canais de conclusão de encomenda disponíveis, com o motivo quando estão desligados. */
export function checkoutChannels(): ChannelStatus {
  const { mode } = getCatalog();
  let reason: string | undefined;
  if (mode === "demo") reason = "O pagamento online está desligado no modo de demonstração.";
  else if (!process.env.STRIPE_SECRET_KEY) reason = "O pagamento online ainda não está configurado.";
  else if (SHIPPING_METHODS.length === 0) reason = "Os métodos de entrega ainda não estão configurados.";
  return {
    online: { enabled: !reason, reason },
    whatsapp: { enabled: true, number: whatsappNumber() },
  };
}
