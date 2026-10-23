import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/ui/PageHead";
import { Pending } from "@/components/ui/Pending";
import { BUSINESS, POLICIES } from "@/data/store";

/**
 * ⚠️ MINUTAS. Estes textos são uma base estruturada segundo a legislação
 * portuguesa e europeia aplicável e TÊM de ser revistos por um jurista antes do
 * lançamento. Não constituem aconselhamento jurídico.
 */

const Company = () => (
  <>
    <Pending value={BUSINESS.legalName} label="[denominação social]" />, NIPC <Pending value={BUSINESS.nipc} label="[NIPC]" />, com
    sede em <Pending value={BUSINESS.address} label="[morada]" />, email <Pending value={BUSINESS.email} label="[email]" />
  </>
);

const DOCS = {
  termos: {
    title: "Termos e condições",
    body: () => (
      <>
        <h2>1. Identificação</h2>
        <p>
          A loja online X Íntimo é explorada por <Company />.
        </p>
        <h2>2. Preços</h2>
        <p>
          Os preços são apresentados em euros e incluem IVA à taxa legal em vigor. Os portes de envio, quando aplicáveis, são indicados
          antes da conclusão da encomenda.
        </p>
        <h2>3. Encomendas</h2>
        <p>
          A encomenda pode ser concluída com pagamento online, quando disponível, ou através do envio de um pedido por WhatsApp. No
          segundo caso, o contrato só se considera celebrado quando a loja confirmar a disponibilidade e o cliente aceitar o total
          final.
        </p>
        <h2>4. Pagamento</h2>
        <p>
          Os pagamentos online são processados pela Stripe. A X Íntimo não recebe nem guarda dados de cartões de pagamento.
        </p>
        <h2>5. Entrega</h2>
        <p>
          As encomendas são entregues na morada indicada, ou levantadas na loja, no prazo indicado. Salvo acordo em contrário, a
          entrega ocorre no máximo em 30 dias após a celebração do contrato (Decreto-Lei n.º 24/2014).
        </p>
        <h2>6. Direito de livre resolução</h2>
        <p>
          O consumidor pode resolver o contrato no prazo de 14 dias a contar da receção dos bens, sem indicar o motivo
          {POLICIES.returnDays && POLICIES.returnDays > 14 ? ` (prazo alargado pela loja para ${POLICIES.returnDays} dias)` : ""}. Excetua-se
          o fornecimento de bens selados não suscetíveis de devolução por motivos de proteção da saúde ou de higiene, quando abertos após
          a entrega (artigo 17.º do Decreto-Lei n.º 24/2014). O reembolso é efetuado no prazo de 14 dias pelo mesmo meio de pagamento.
        </p>
        <h2>7. Garantia</h2>
        <p>Os bens beneficiam da garantia legal de conformidade de 3 anos (Decreto-Lei n.º 84/2021).</p>
        <h2>8. Reclamações e litígios</h2>
        <p>
          Pode reclamar através do{" "}
          <a className="link" href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener">Livro de Reclamações Eletrónico</a>
          . Ver também <Link className="link" href="/legal/litigios">Resolução de litígios</Link>.
        </p>
      </>
    ),
  },
  privacidade: {
    title: "Política de privacidade",
    body: () => (
      <>
        <h2>Responsável pelo tratamento</h2>
        <p>
          <Company />.
        </p>
        <h2>Que dados tratamos e porquê</h2>
        <ul>
          <li>
            <b>Encomenda:</b> nome, email, telefone, morada de entrega e, se pedir fatura, NIF. Finalidade: processar e entregar a
            encomenda (execução do contrato) e emitir fatura (obrigação legal).
          </li>
          <li>
            <b>Saco de compras:</b> os artigos escolhidos ficam guardados apenas no seu navegador (armazenamento local), não nos nossos
            servidores.
          </li>
          <li>
            <b>Registos técnicos:</b> registos de funcionamento do servidor, sem dados de identificação do cliente.
          </li>
        </ul>
        <h2>Com quem partilhamos</h2>
        <ul>
          <li>Stripe, para processar pagamentos online, quando escolhe essa opção.</li>
          <li>WhatsApp (Meta), quando escolhe enviar o pedido por WhatsApp — a mensagem é enviada por si a partir da sua conta.</li>
          <li>A transportadora, para entregar a encomenda. <Pending value={null} label="[identificar transportadora]" /></li>
          <li>O alojamento do site. <Pending value={null} label="[identificar fornecedor de alojamento]" /></li>
        </ul>
        <h2>Durante quanto tempo</h2>
        <p>
          Os dados das encomendas são conservados pelo tempo necessário à sua execução e, quanto aos dados de faturação, pelo prazo legal
          aplicável. <Pending value={null} label="[confirmar prazos com o contabilista]" />
        </p>
        <h2>Os seus direitos</h2>
        <p>
          Pode pedir o acesso, a retificação, o apagamento, a limitação ou a portabilidade dos seus dados, e opor-se ao tratamento, através
          de <Pending value={BUSINESS.email} label="[email]" />. Tem também o direito de apresentar reclamação à Comissão Nacional de
          Proteção de Dados (<a className="link" href="https://www.cnpd.pt" target="_blank" rel="noopener">cnpd.pt</a>).
        </p>
      </>
    ),
  },
  cookies: {
    title: "Cookies",
    body: () => (
      <>
        <p>Este site não usa cookies de publicidade, de análise ou de redes sociais, nem rastreadores de terceiros.</p>
        <h2>O que guardamos no seu navegador</h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabela — deslize para ver todas as colunas">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tipo</th>
                <th scope="col">Finalidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">xi:saco:v1</th>
                <td>Armazenamento local</td>
                <td style={{ whiteSpace: "normal" }}>Guardar o saco de compras. Estritamente necessário.</td>
              </tr>
              <tr>
                <th scope="row">xi:pedido</th>
                <td>Armazenamento de sessão</td>
                <td style={{ whiteSpace: "normal" }}>Mostrar o resumo do pedido após o checkout. Apaga-se ao fechar o separador.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Por serem estritamente necessários ao serviço pedido, não exigem consentimento. Se no futuro forem adicionadas ferramentas de
          análise ou marketing, só serão ativadas depois do seu consentimento.
        </p>
        <p>
          A página de pagamento da Stripe, quando usada, tem a sua própria política de cookies.
        </p>
      </>
    ),
  },
  litigios: {
    title: "Resolução de litígios",
    body: () => (
      <>
        <p>
          Em caso de litígio de consumo, o consumidor pode recorrer a uma entidade de Resolução Alternativa de Litígios de consumo (Lei
          n.º 144/2015):
        </p>
        <p>
          {BUSINESS.ralEntity ? (
            <a className="link" href={BUSINESS.ralEntity.url} target="_blank" rel="noopener">{BUSINESS.ralEntity.name}</a>
          ) : (
            <Pending value={null} label="[entidade RAL competente — depende da localização da loja]" />
          )}
        </p>
        <p>
          Mais informação no{" "}
          <a className="link" href="https://www.consumidor.gov.pt" target="_blank" rel="noopener">Portal do Consumidor</a>. Pode também
          usar o{" "}
          <a className="link" href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener">Livro de Reclamações Eletrónico</a>.
        </p>
      </>
    ),
  },
} as const;

type Doc = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = DOCS[(await params).doc as Doc];
  return d ? { title: d.title, alternates: { canonical: `/legal/${(await params).doc}` } } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const key = (await params).doc as Doc;
  const doc = DOCS[key];
  if (!doc) notFound();
  const Body = doc.body;
  return (
    <>
      <PageHead eyebrow="Informação legal" title={doc.title} />
      <div className="wrap content">
        <nav className="content__nav" aria-label="Informação legal">
          <ul role="list">
            {(Object.keys(DOCS) as Doc[]).map((k) => (
              <li key={k}>
                <Link className="link" href={`/legal/${k}`} aria-current={k === key ? "page" : undefined}>
                  {DOCS[k].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="prose">
          <p className="notice notice--warn" style={{ marginTop: 0 }}>
            Minuta em revisão: este texto ainda tem de ser validado juridicamente.
          </p>
          <Body />
        </div>
      </div>
    </>
  );
}
