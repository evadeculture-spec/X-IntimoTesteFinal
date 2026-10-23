"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bagLabel, useCart } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { SearchDialog } from "./SearchDialog";

export function HeaderActions() {
  const { count, open, bump, ready } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const onCheckout = pathname.startsWith("/checkout");

  return (
    <div className="site-header__end">
      <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-haspopup="dialog">
        <Icon name="search" label="Pesquisar" />
      </button>
      {onCheckout ? (
        <Link href="/saco" className="icon-btn" aria-label={bagLabel(count)}>
          <Icon name="bag" />
          {ready && count > 0 ? <span className="disc bag-count" aria-hidden="true">{count}</span> : null}
        </Link>
      ) : (
        <button type="button" className="icon-btn" onClick={open} aria-haspopup="dialog" aria-label={bagLabel(count)}>
          <Icon name="bag" />
          {ready && count > 0 ? (
            <span key={bump} className={`disc bag-count${bump ? " is-bump" : ""}`} aria-hidden="true">
              {count}
            </span>
          ) : null}
        </button>
      )}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </div>
  );
}

export function MenuButton({ nav }: { nav: { href: string; label: string; tagline: string }[] }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fechar ao navegar
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button type="button" className="icon-btn menu-toggle" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon name="menu" label="Menu" />
      </button>
      <Dialog id="menu" open={isOpen} onClose={() => setOpen(false)} title="Menu" side="start">
        <nav aria-label="Secções da loja">
          <ul role="list" className="mobile-nav__list">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)}>
                  <span className="display">{n.label}</span>
                  <span className="mono muted">{n.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul role="list" className="mobile-nav__secondary">
            <li>
              <Link className="link" href="/loja" onClick={() => setOpen(false)}>Toda a loja</Link>
            </li>
            <li>
              <Link className="link" href="/apoio/guia-de-tamanhos" onClick={() => setOpen(false)}>Guia de tamanhos</Link>
            </li>
            <li>
              <Link className="link" href="/apoio" onClick={() => setOpen(false)}>Envios, devoluções e apoio</Link>
            </li>
            <li>
              <Link className="link" href="/contactos" onClick={() => setOpen(false)}>Contactos e loja</Link>
            </li>
          </ul>
        </nav>
      </Dialog>
    </>
  );
}
