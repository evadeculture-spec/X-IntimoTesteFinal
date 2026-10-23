"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/commerce/format";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { EmptyBag } from "./EmptyBag";
import { FreeShippingMeter } from "./FreeShippingMeter";

export function CartPageView() {
  const { lines, ready, subtotal, count } = useCart();
  if (!ready) {
    return (
      <div className="wrap cart-page" aria-busy="true">
        <p className="muted">A carregar o saco…</p>
      </div>
    );
  }
  if (!lines.length) {
    return (
      <div className="wrap cart-page">
        <EmptyBag />
      </div>
    );
  }
  return (
    <div className="wrap cart-page">
      <section aria-label="Artigos no saco">
        <FreeShippingMeter />
        <CartLines />
        <p style={{ marginTop: "var(--s-5)" }}>
          <Link href="/loja" className="link">
            Continuar a comprar
          </Link>
        </p>
      </section>
      <aside className="aside-box" aria-label="Resumo">
        <h2 className="panel__title">Resumo</h2>
        <dl className="summary">
          <div className="summary__row">
            <dt>Artigos ({count})</dt>
            <dd className="price">{formatPrice(subtotal)}</dd>
          </div>
          <div className="summary__row muted">
            <dt>Portes</dt>
            <dd>calculados no checkout</dd>
          </div>
          <div className="summary__row summary__total">
            <dt>Subtotal</dt>
            <dd className="price">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn btn--lg btn--block">
          Finalizar encomenda
        </Link>
        <p className="mono muted" style={{ fontSize: "var(--t-2xs)" }}>
          Preços com IVA incluído. Os preços e a disponibilidade são confirmados no passo seguinte.
        </p>
      </aside>
    </div>
  );
}
