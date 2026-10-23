"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { formatPrice, plural } from "@/lib/commerce/format";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { EmptyBag } from "./EmptyBag";

export function CartDrawer() {
  const { isOpen, close, lines, count, subtotal } = useCart();
  const pathname = usePathname();

  // Fecha ao mudar de página.
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <Dialog
      id="saco"
      open={isOpen}
      onClose={close}
      title={count ? `O seu saco · ${plural(count, "peça", "peças")}` : "O seu saco"}
      footer={
        lines.length ? (
          <>
            <dl className="summary">
              <div className="summary__row summary__total" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
                <dt>Subtotal</dt>
                <dd className="price">{formatPrice(subtotal)}</dd>
              </div>
              <div className="summary__row muted">
                <dt>Portes</dt>
                <dd>calculados no passo seguinte</dd>
              </div>
            </dl>
            <div style={{ display: "grid", gap: "var(--s-2)", marginTop: "var(--s-4)" }}>
              <Link href="/checkout" className="btn btn--lg btn--block">
                Finalizar encomenda
              </Link>
              <Link href="/saco" className="btn btn--outline btn--block">
                Ver saco completo
              </Link>
            </div>
          </>
        ) : null
      }
    >
      {lines.length ? <CartLines onNavigate={close} /> : <EmptyBag onNavigate={close} />}
    </Dialog>
  );
}
