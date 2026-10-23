import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/commerce/stripe";

export const dynamic = "force-dynamic";

/**
 * Webhook Stripe. Configurar no painel Stripe:
 *   URL: https://<domínio>/api/stripe/webhook
 *   Eventos: checkout.session.completed, checkout.session.async_payment_succeeded,
 *            checkout.session.async_payment_failed, checkout.session.expired
 *
 * ⚠️ PONTO DE INTEGRAÇÃO: aqui deve ser registada a encomenda paga (base de dados,
 * email à loja, abate de stock). Enquanto não existir backend, a Stripe é a fonte
 * de verdade das encomendas pagas (painel → Pagamentos).
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook não configurado" }, { status: 503 });

  const payload = await req.text();
  if (!verifyWebhookSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { type: string; data: { object: { client_reference_id?: string; payment_status?: string } } };
  const ref = event.data.object.client_reference_id ?? "?";
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      // Sem dados pessoais nos registos.
      console.info("[stripe:webhook]", event.type, ref, event.data.object.payment_status ?? "");
      break;
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
