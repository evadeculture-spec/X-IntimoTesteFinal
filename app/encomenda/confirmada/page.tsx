import type { Metadata } from "next";
import Link from "next/link";
import { OrderRequestConfirmation } from "@/components/checkout/OrderRequestConfirmation";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { formatPrice } from "@/lib/commerce/format";
import { retrieveCheckoutSession } from "@/lib/commerce/stripe";

export const metadata: Metadata = { title: "Encomenda", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string; session_id?: string }> }) {
  const { ref, session_id } = await searchParams;
  const safeRef = ref && /^XI-\d{6}-[A-Z0-9]{4}$/.test(ref) ? ref : null;

  if (session_id) {
    const session = await retrieveCheckoutSession(session_id);
    const paid = session?.payment_status === "paid" || session?.payment_status === "no_payment_required";
    const pending = session?.status === "complete" && session.payment_status === "unpaid";
    return (
      <div className="wrap confirm">
        {paid ? <ClearCartOnMount /> : null}
        <p className="eyebrow">{paid ? "Pagamento recebido" : pending ? "A aguardar pagamento" : "Encomenda"}</p>
        <h1 className="display page-head__title">
          {paid ? (
            <>
              Obrigado. <em>Está tratado.</em>
            </>
          ) : pending ? (
            <>
              Quase <em>feito.</em>
            </>
          ) : (
            <>
              Não conseguimos <em>confirmar.</em>
            </>
          )}
        </h1>
        {session?.client_reference_id ? (
          <p className="confirm__ref">Ref. {session.client_reference_id}</p>
        ) : null}
        {paid ? (
          <p className="lede">
            Recebemos o pagamento de {formatPrice(session!.amount_total ?? 0)}. Vai receber a confirmação por email e avisamos quando a
            encomenda seguir.
          </p>
        ) : pending ? (
          <>
            <ClearCartOnMount />
            <p className="lede">
              A encomenda foi registada e fica a aguardar o pagamento (por exemplo, a referência Multibanco que recebeu). Assim que o
              pagamento for confirmado, avisamos por email.
            </p>
          </>
        ) : (
          <p className="lede">
            Não foi possível confirmar o estado do pagamento. Se foi cobrado, não volte a pagar — contacte-nos com o seu email e
            verificamos.
          </p>
        )}
        <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
          <Link href="/loja" className="btn">
            Voltar à loja
          </Link>
          <Link href="/contactos" className="btn btn--outline">
            Contactar a loja
          </Link>
        </div>
      </div>
    );
  }

  return <OrderRequestConfirmation refId={safeRef} />;
}
