import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Pending } from "@/components/ui/Pending";
import { JsonLd } from "@/components/ui/JsonLd";
import { BUSINESS } from "@/data/store";
import { siteUrl, whatsappNumber } from "@/lib/commerce/settings";

export const metadata: Metadata = {
  title: "Contactos",
  description: "Contactos e morada da loja X Íntimo.",
  alternates: { canonical: "/contactos" },
};

export default function ContactPage() {
  const wa = whatsappNumber();
  return (
    <>
      {BUSINESS.address ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            name: BUSINESS.brandName,
            url: siteUrl(),
            address: BUSINESS.address,
            telephone: BUSINESS.phone ?? undefined,
            email: BUSINESS.email ?? undefined,
            openingHours: BUSINESS.openingHours ?? undefined,
          }}
        />
      ) : null}
      <PageHead
        eyebrow="Contactos"
        title={
          <>
            Fale <em>connosco.</em>
          </>
        }
        lede="Dúvidas sobre tamanhos, uma encomenda ou uma troca: respondemos por WhatsApp, telefone ou email."
      />
      <div className="wrap content">
        <div />
        <div>
          <dl className="facts">
            <div>
              <dt>WhatsApp</dt>
              <dd>{wa ? <a className="link" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">+{wa}</a> : <Pending value={null} />}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{BUSINESS.phone ? <a className="link" href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a> : <Pending value={null} />}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{BUSINESS.email ? <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> : <Pending value={null} />}</dd>
            </div>
            <div>
              <dt>Loja</dt>
              <dd><Pending value={BUSINESS.address} /></dd>
            </div>
            <div>
              <dt>Horário</dt>
              <dd><Pending value={BUSINESS.openingHours} /></dd>
            </div>
            <div>
              <dt>Empresa</dt>
              <dd>
                <Pending value={BUSINESS.legalName} label="denominação social por confirmar" /> · NIPC <Pending value={BUSINESS.nipc} />
              </dd>
            </div>
            <div>
              <dt>Reclamações</dt>
              <dd>
                <a className="link" href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener">Livro de Reclamações Eletrónico</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
