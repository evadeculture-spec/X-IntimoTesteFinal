"use client";

import { formatPrice } from "@/lib/commerce/format";
import { useCart } from "./CartProvider";

/** Progresso para portes grátis — só aparece quando existe uma regra configurada. */
export function FreeShippingMeter() {
  const { subtotal, freeShippingFrom } = useCart();
  if (!freeShippingFrom || subtotal <= 0) return null;
  const missing = freeShippingFrom - subtotal;
  const pct = Math.min(100, Math.round((subtotal / freeShippingFrom) * 100));
  return (
    <div className="ship-meter">
      <p>
        {missing > 0 ? (
          <>
            Faltam <b>{formatPrice(missing)}</b> para portes grátis no Continente.
          </>
        ) : (
          <>Tem portes grátis no Continente.</>
        )}
      </p>
      <span className="ship-meter__bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}
