import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = { title: "Saco de compras", robots: { index: false } };

export default function BagPage() {
  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <p className="eyebrow">Saco de compras</p>
          <h1 className="display page-head__title">
            O seu <em>saco.</em>
          </h1>
        </div>
      </header>
      <CartPageView />
    </>
  );
}
