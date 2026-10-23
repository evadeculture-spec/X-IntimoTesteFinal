import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCatalog } from "@/lib/commerce/catalog";
import { checkoutChannels, shippingMethods } from "@/lib/commerce/settings";

export const metadata: Metadata = { title: "Finalizar encomenda", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ cancelado?: string }> }) {
  const { cancelado } = await searchParams;
  return (
    <>
      <header className="page-head page-head--compact">
        <div className="wrap">
          <p className="eyebrow">Checkout</p>
          <h1 className="display page-head__title">
            Finalizar encomenda
          </h1>
        </div>
      </header>
      <CheckoutForm
        channels={checkoutChannels()}
        methods={shippingMethods()}
        demo={getCatalog().mode === "demo"}
        cancelled={cancelado === "1"}
      />
    </>
  );
}
