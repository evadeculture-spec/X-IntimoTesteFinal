import { NextResponse } from "next/server";
import { buildOrder } from "@/lib/commerce/order";
import { checkoutChannels, siteUrl } from "@/lib/commerce/settings";
import { createCheckoutSession } from "@/lib/commerce/stripe";
import { orderMessage, whatsappLink } from "@/lib/commerce/whatsapp";
import { EMPTY_CHECKOUT, type CheckoutInput } from "@/lib/commerce/validation";

export const dynamic = "force-dynamic";

interface Body {
  lines: { sku: string; quantity: number; unitPrice?: number }[];
  customer: Partial<CheckoutInput>;
  shippingMethodId: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Pedido inválido." }, { status: 400 });
  }

  // Só aceitamos os campos conhecidos, como strings/booleanos.
  const customer = Object.fromEntries(
    Object.entries(EMPTY_CHECKOUT).map(([k, def]) => {
      const v = (body.customer ?? {})[k as keyof CheckoutInput];
      return [k, typeof def === "boolean" ? v === true : typeof v === "string" ? v.slice(0, 500) : def];
    }),
  ) as unknown as CheckoutInput;
  if (customer.delivery !== "levantamento") customer.delivery = "envio";
  if (customer.channel !== "online") customer.channel = "whatsapp";

  const channels = checkoutChannels();
  if (customer.channel === "online" && !channels.online.enabled) {
    return NextResponse.json({ ok: false, message: channels.online.reason }, { status: 503 });
  }

  const result = buildOrder(body.lines, customer, String(body.shippingMethodId ?? ""));
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, fieldErrors: result.fieldErrors, lineErrors: result.lineErrors },
      { status: result.status },
    );
  }
  const { order, priceChanged } = result;
  const summary = {
    ref: order.ref,
    lines: order.lines,
    subtotal: order.subtotal,
    shipping: order.shipping,
    shippingPending: order.shippingPending,
    shippingLabel: order.shippingMethod.label,
    total: order.total,
    delivery: order.customer.delivery,
    firstName: order.customer.firstName,
    email: order.customer.email,
  };

  if (customer.channel === "online") {
    try {
      const session = await createCheckoutSession(order, siteUrl());
      console.info("[checkout] sessão criada", order.ref);
      return NextResponse.json({ ok: true, channel: "online", redirectUrl: session.url, summary, priceChanged });
    } catch {
      return NextResponse.json(
        { ok: false, message: "Não foi possível iniciar o pagamento. Tente novamente dentro de momentos." },
        { status: 502 },
      );
    }
  }

  const message = orderMessage(order);
  const number = channels.whatsapp.number;
  console.info("[checkout] pedido WhatsApp preparado", order.ref);
  return NextResponse.json({
    ok: true,
    channel: "whatsapp",
    summary,
    message,
    whatsappUrl: number ? whatsappLink(number, message) : null,
    priceChanged,
  });
}
