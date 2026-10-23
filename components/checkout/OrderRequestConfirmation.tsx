"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/commerce/format";
import { ORDER_STORAGE_KEY } from "@/lib/commerce/storage-keys";

interface Stored {
  summary: {
    ref: string;
    lines: { sku: string; name: string; colourName: string; size: string; quantity: number; unitPrice: number }[];
    subtotal: number;
    shipping: number;
    shippingPending: boolean;
    shippingLabel: string;
    total: number;
    firstName: string;
  };
  message: string;
  whatsappUrl: string | null;
  priceChanged?: boolean;
}

export function OrderRequestConfirmation({ refId }: { refId: string | null }) {
  const [data, setData] = useState<Stored | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(ORDER_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Stored) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura do sessionStorage após montagem
      setData(parsed && (!refId || parsed.summary.ref === refId) ? parsed : null);
    } catch {
      setData(null);
    }
  }, [refId]);

  if (data === undefined) return <div className="wrap confirm" aria-busy="true" />;

  if (!data) {
    return (
      <div className="wrap confirm">
        <p className="eyebrow">Pedido</p>
        <h1 className="display page-head__title">
          Este pedido já não está aqui
        </h1>
        <p className="lede">
          {refId ? `A referência ${refId} já não está disponível neste separador.` : "Não encontrámos um pedido recente."} Se já
          enviou a mensagem à loja, aguarde a resposta. Se não, pode voltar a fazer o pedido.
        </p>
        <Link href="/loja" className="btn">
          Voltar à loja
        </Link>
      </div>
    );
  }

  const { summary, message, whatsappUrl } = data;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="wrap confirm">
      <p className="eyebrow">Pedido preparado</p>
      <h1 className="display page-head__title">
        Falta só um passo, {summary.firstName}.
      </h1>
      <p className="confirm__ref">Ref. {summary.ref}</p>
      <p className="lede">
        Envie-nos a mensagem com o pedido. A encomenda fica confirmada quando a loja responder com a disponibilidade e a forma de
        pagamento — nada foi cobrado.
      </p>
      {data.priceChanged ? (
        <p className="notice notice--warn">Alguns preços foram atualizados desde que juntou as peças ao saco. A mensagem já usa os preços atuais.</p>
      ) : null}

      {whatsappUrl ? (
        <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
          <a href={whatsappUrl} className="btn btn--lg btn--brand" target="_blank" rel="noopener noreferrer">
            <Icon name="chat" /> Enviar pedido por WhatsApp
            <span className="visually-hidden"> (abre o WhatsApp)</span>
          </a>
          <button type="button" className="btn btn--lg btn--outline" onClick={copy}>
            {copied ? "Mensagem copiada" : "Copiar mensagem"}
          </button>
        </div>
      ) : (
        <div className="notice notice--warn">
          <p>
            <b>Modo de teste:</b> o número de WhatsApp da loja ainda não está configurado (WHATSAPP_NUMBER). Este é o texto que seria
            enviado.{" "}
            <button type="button" className="link" style={{ background: "none", border: 0, padding: 0 }} onClick={copy}>
              {copied ? "Copiado" : "Copiar"}
            </button>
          </p>
        </div>
      )}

      <section aria-labelledby="resumo-pedido">
        <h2 id="resumo-pedido" className="panel__title" style={{ marginBottom: "var(--s-3)" }}>
          Resumo
        </h2>
        <dl className="summary">
          {summary.lines.map((l) => (
            <div key={l.sku} className="summary__row">
              <dt>
                {l.name} <span className="mono muted">· {l.colourName} · {l.size} · ×{l.quantity}</span>
              </dt>
              <dd className="price">{formatPrice(l.unitPrice * l.quantity)}</dd>
            </div>
          ))}
          <div className="summary__row">
            <dt>{summary.shippingLabel}</dt>
            <dd>{summary.shippingPending ? "a confirmar" : summary.shipping === 0 ? "Sem custos" : formatPrice(summary.shipping)}</dd>
          </div>
          <div className="summary__row summary__total">
            <dt>Total</dt>
            <dd className="price">
              {formatPrice(summary.total)}
              {summary.shippingPending ? " + portes" : ""}
            </dd>
          </div>
        </dl>
      </section>

      <div className="accordion">
        <details>
          <summary>Ver a mensagem</summary>
          <pre className="confirm__message">{message}</pre>
        </details>
      </div>

      <Link href="/loja" className="link">
        Continuar a ver a loja
      </Link>
    </div>
  );
}
