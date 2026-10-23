import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";
import { Pending } from "@/components/ui/Pending";
import { POLICIES } from "@/data/store";
import { getCatalog } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { checkoutChannels, shippingMethods } from "@/lib/commerce/settings";

export const metadata: Metadata = {
  title: "Envios, trocas e pagamentos",
  description: "Como enviamos, como trocar ou devolver e como pagar na X Íntimo.",
  alternates: { canonical: "/apoio" },
};

export default function SupportPage() {
  const methods = shippingMethods();
  const channels = checkoutChannels();
  const demo = getCatalog().mode === "demo";
  return (
    <>
      <PageHead
        eyebrow="Apoio"
        title={
          <>
            Envios, trocas <em>e pagamentos.</em>
          </>
        }
      />
      <div className="wrap content">
        <nav className="content__nav" aria-label="Nesta página">
          <ul role="list">
            <li><a className="link" href="#envios">Envios</a></li>
            <li><a className="link" href="#devolucoes">Trocas e devoluções</a></li>
            <li><a className="link" href="#pagamentos">Pagamentos</a></li>
            <li><Link className="link" href="/apoio/guia-de-tamanhos">Guia de tamanhos</Link></li>
          </ul>
        </nav>
        <div className="prose">
          <h2 id="envios" style={{ marginTop: 0 }}>Envios</h2>
          {methods.length ? (
            <>
              {demo ? <p className="notice notice--warn">Valores ilustrativos (modo demonstração).</p> : null}
              <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabela — deslize para ver todas as colunas">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Método</th>
                      <th scope="col">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map((m) => (
                      <tr key={m.id}>
                        <th scope="row" style={{ fontFamily: "var(--f-sans)", whiteSpace: "normal" }}>{m.label}</th>
                        <td>
                          {m.price === 0 ? "Sem custos" : formatPrice(m.price)}
                          {m.freeFrom ? ` · grátis a partir de ${formatPrice(m.freeFrom)}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>Os portes são confirmados pela loja antes do envio, consoante a morada. <Pending value={null} label="tabela de portes por confirmar" /></p>
          )}
          <p>
            Prazo de envio após confirmação: <Pending value={POLICIES.dispatchTime} />
            {POLICIES.dispatchTime ? " dias úteis" : ""}. Por lei, a entrega tem de acontecer no máximo em 30 dias, salvo acordo em
            contrário.
          </p>

          <h2 id="devolucoes">Trocas e devoluções</h2>
          <p>
            Nas compras feitas à distância, tem 14 dias a contar da receção para desistir da compra, sem ter de indicar o motivo (direito
            de livre resolução, Decreto-Lei n.º 24/2014).
            {POLICIES.returnDays && POLICIES.returnDays > 14 ? ` Na X Íntimo, alargamos este prazo para ${POLICIES.returnDays} dias.` : ""}
          </p>
          <p>
            Por razões de proteção da saúde e de higiene, peças íntimas fornecidas seladas podem não ser aceites se o selo tiver sido
            retirado após a entrega. <Pending value={POLICIES.hygieneNote} label="regra da loja por confirmar" />
          </p>
          <p>
            Portes da devolução: <Pending value={POLICIES.returnShippingPaidBy} label="por confirmar" />
            {POLICIES.returnShippingPaidBy ? (POLICIES.returnShippingPaidBy === "loja" ? " — por nossa conta." : " — por conta do cliente.") : ""}
          </p>
          <p>
            Para trocar um tamanho ou devolver, <Link className="link" href="/contactos">contacte-nos</Link> com a referência do pedido.
            Todos os artigos têm a garantia legal de conformidade de 3 anos (Decreto-Lei n.º 84/2021).
          </p>

          <h2 id="pagamentos">Pagamentos</h2>
          {channels.online.enabled ? (
            <p>
              O pagamento online é feito na página segura da Stripe. Conforme disponível, pode pagar com cartão, MB WAY ou referência
              Multibanco. Não guardamos dados do cartão.
            </p>
          ) : (
            <p>
              De momento, as encomendas são confirmadas por WhatsApp: envia-nos o pedido, confirmamos a disponibilidade e indicamos as
              formas de pagamento. Nada é cobrado no site.
            </p>
          )}
          <p>Todos os preços estão em euros e incluem IVA à taxa legal em vigor.</p>
        </div>
      </div>
    </>
  );
}
