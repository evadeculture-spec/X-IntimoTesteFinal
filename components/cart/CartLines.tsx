"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/commerce/format";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "./CartProvider";
import { LineThumb } from "./LineThumb";

export function CartLines({ errors = {}, onNavigate }: { errors?: Record<string, string>; onNavigate?: () => void }) {
  const { lines, setQuantity, remove } = useCart();
  return (
    <ul role="list" className="cart-lines">
      {lines.map((l) => (
        <li key={l.sku} className="cart-line">
          <Link href={`/produto/${l.slug}`} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
            <LineThumb line={l} />
          </Link>
          <div>
            <Link href={`/produto/${l.slug}`} className="cart-line__name" onClick={onNavigate}>
              {l.name}
            </Link>
            <p className="cart-line__variant">
              {l.colourName} · Tam. {l.size}
            </p>
            <div className="cart-line__actions">
              <div className="qty qty--sm" role="group" aria-label={`Quantidade de ${l.name}`}>
                <button
                  type="button"
                  onClick={() => setQuantity(l.sku, l.quantity - 1)}
                  disabled={l.quantity <= 1}
                  aria-label="Diminuir quantidade"
                >
                  <Icon name="minus" className="icon icon--sm" />
                </button>
                <output aria-live="polite" aria-label="Quantidade">
                  {l.quantity}
                </output>
                <button
                  type="button"
                  onClick={() => setQuantity(l.sku, l.quantity + 1)}
                  disabled={l.quantity >= l.max}
                  aria-label="Aumentar quantidade"
                >
                  <Icon name="plus" className="icon icon--sm" />
                </button>
              </div>
              <button type="button" className="cart-line__remove" onClick={() => remove(l.sku)}>
                Remover<span className="visually-hidden"> {l.name}</span>
              </button>
            </div>
          </div>
          <p className="cart-line__price price">
            {formatPrice(l.unitPrice * l.quantity)}
            {l.quantity > 1 ? (
              <span className="mono muted" style={{ display: "block" }}>
                {l.quantity} × {formatPrice(l.unitPrice)}
              </span>
            ) : null}
          </p>
          {errors[l.sku] ? (
            <p className="cart-line__error" role="alert">
              {errors[l.sku]}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
