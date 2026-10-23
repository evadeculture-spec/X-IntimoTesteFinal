import { formatPrice } from "./format";
import type { Order } from "./order";

/** Mensagem do pedido — texto simples, legível no telemóvel da loja. */
export function orderMessage(order: Order): string {
  const c = order.customer;
  const lines = order.lines.map(
    (l, i) => `${i + 1}. ${l.name} — ${l.colourName}, tam. ${l.size} × ${l.quantity} = ${formatPrice(l.unitPrice * l.quantity)}\n   (SKU ${l.sku})`,
  );
  const delivery =
    c.delivery === "levantamento"
      ? "Levantamento na loja"
      : `${c.address}${c.address2 ? ", " + c.address2 : ""}\n${c.postalCode} ${c.city}`;
  return [
    `Olá X Íntimo! Gostaria de fazer este pedido (ref. ${order.ref}):`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    order.shippingPending
      ? "Portes: a confirmar pela loja"
      : `Entrega: ${order.shippingMethod.label} — ${order.shipping === 0 ? "sem custos" : formatPrice(order.shipping)}`,
    `Total: ${formatPrice(order.total)}${order.shippingPending ? " + portes" : ""}`,
    "",
    `Nome: ${c.firstName} ${c.lastName}`,
    `Email: ${c.email}`,
    `Telefone: ${c.phone}`,
    `Entrega: ${delivery}`,
    c.nif ? `NIF para fatura: ${c.nif}` : "",
    c.notes ? `Observações: ${c.notes}` : "",
    "",
    "Aguardo a confirmação de disponibilidade e a forma de pagamento. Obrigado/a!",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
