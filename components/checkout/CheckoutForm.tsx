"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CartLines } from "@/components/cart/CartLines";
import { EmptyBag } from "@/components/cart/EmptyBag";
import { LineThumb } from "@/components/cart/LineThumb";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/commerce/format";
import { computeTotals, methodsFor, regionFromPostalCode } from "@/lib/commerce/pricing";
import type { ChannelStatus } from "@/lib/commerce/settings";
import type { ShippingMethod } from "@/lib/commerce/types";
import {
  EMPTY_CHECKOUT,
  normalizePostalCode,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutInput,
} from "@/lib/commerce/validation";

import { ORDER_STORAGE_KEY } from "@/lib/commerce/storage-keys";

const FIELD_ORDER: (keyof CheckoutInput)[] = [
  "email",
  "phone",
  "firstName",
  "lastName",
  "address",
  "postalCode",
  "city",
  "nif",
  "notes",
  "acceptTerms",
];

const FIELD_LABEL: Partial<Record<keyof CheckoutInput, string>> = {
  email: "Email",
  phone: "Telefone",
  firstName: "Nome",
  lastName: "Apelido",
  address: "Morada",
  postalCode: "Código postal",
  city: "Localidade",
  nif: "NIF",
  notes: "Observações",
  acceptTerms: "Termos e condições",
};

export function CheckoutForm({
  channels,
  methods,
  demo,
  cancelled,
}: {
  channels: ChannelStatus;
  methods: ShippingMethod[];
  demo: boolean;
  cancelled: boolean;
}) {
  const { lines, ready, clear } = useCart();
  const router = useRouter();
  const [input, setInput] = useState<CheckoutInput>({
    ...EMPTY_CHECKOUT,
    channel: channels.online.enabled ? "online" : "whatsapp",
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutInput, boolean>>>({});
  const [methodId, setMethodId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const hasPickup = methods.some((m) => m.regions === "pickup");
  const noMethods = methods.length === 0;
  const region = input.delivery === "envio" ? regionFromPostalCode(normalizePostalCode(input.postalCode)) : null;
  const available = useMemo(
    () =>
      methodsFor(methods, region).filter((m) => (input.delivery === "levantamento" ? m.regions === "pickup" : m.regions !== "pickup")),
    [methods, region, input.delivery],
  );

  // Escolhe automaticamente quando só há uma opção; invalida escolhas que deixaram de se aplicar.
  useEffect(() => {
    if (!available.some((m) => m.id === methodId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derivado das opções disponíveis
      setMethodId(available.length === 1 ? available[0]!.id : "");
    }
  }, [available, methodId]);

  const method = available.find((m) => m.id === methodId) ?? null;
  const totals = computeTotals(lines, method);

  const set = <K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) => {
    const next = { ...input, [key]: value };
    setInput(next);
    if (touched[key] || errors[key]) {
      const e = validateCheckout(next);
      setErrors((old) => ({ ...old, [key]: e[key] }));
    }
  };

  const blur = (key: keyof CheckoutInput) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const e = validateCheckout(input);
    setErrors((old) => ({ ...old, [key]: e[key] }));
  };

  const fieldProps = (key: keyof CheckoutInput) => ({
    id: `f-${key}`,
    name: key,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `e-${key}` : undefined,
    onBlur: () => blur(key),
  });

  const err = (key: keyof CheckoutInput) =>
    errors[key] ? (
      <p id={`e-${key}`} className="field__error">
        <Icon name="alert" className="icon icon--sm" />
        {errors[key]}
      </p>
    ) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const v = validateCheckout(input);
    const methodMissing = !noMethods && !method;
    setErrors(v);
    if (Object.keys(v).some((k) => v[k as keyof CheckoutInput]) || methodMissing) {
      if (methodMissing && !Object.keys(v).length) setServerError("Escolha um método de entrega.");
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ sku: l.sku, quantity: l.quantity, unitPrice: l.unitPrice })),
          customer: input,
          shippingMethodId: methodId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrors(json.fieldErrors ?? {});
        setLineErrors(json.lineErrors ?? {});
        setServerError(json.message ?? "Não foi possível concluir. Tente novamente.");
        if (json.lineErrors) setShowSummary(true);
        window.requestAnimationFrame(() => summaryRef.current?.focus());
        setBusy(false);
        return;
      }
      if (json.channel === "online" && json.redirectUrl) {
        window.location.assign(json.redirectUrl);
        return;
      }
      try {
        window.sessionStorage.setItem(
          ORDER_STORAGE_KEY,
          JSON.stringify({ summary: json.summary, message: json.message, whatsappUrl: json.whatsappUrl, priceChanged: json.priceChanged }),
        );
      } catch {
        /* sem armazenamento: a confirmação mostra o essencial pela referência */
      }
      clear();
      router.push(`/encomenda/confirmada?ref=${encodeURIComponent(json.summary.ref)}`);
    } catch {
      setServerError("Sem ligação. Verifique a internet e tente novamente — o seu saco continua guardado.");
      setBusy(false);
    }
  };

  if (!ready) return <div className="wrap checkout" aria-busy="true"><p className="muted">A carregar…</p></div>;
  if (!lines.length)
    return (
      <div className="wrap checkout">
        <EmptyBag />
      </div>
    );

  const errorList = FIELD_ORDER.filter((k) => errors[k]);
  const summaryBox = (
    <div className="aside-box">
      <h2 className="panel__title">Resumo</h2>
      {Object.keys(lineErrors).length ? (
        <CartLines errors={lineErrors} />
      ) : (
        <ul role="list" className="cart-lines">
          {lines.map((l) => (
            <li key={l.sku} className="cart-line" style={{ gridTemplateColumns: "3.5rem 1fr auto" }}>
              <span style={{ width: "3.5rem" }}>
                <LineThumb line={l} />
              </span>
              <div>
                <p className="cart-line__name">{l.name}</p>
                <p className="cart-line__variant">
                  {l.colourName} · Tam. {l.size} · ×{l.quantity}
                </p>
              </div>
              <p className="cart-line__price price">{formatPrice(l.unitPrice * l.quantity)}</p>
            </li>
          ))}
        </ul>
      )}
      <dl className="summary">
        <div className="summary__row">
          <dt>Subtotal</dt>
          <dd className="price">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="summary__row">
          <dt>Entrega</dt>
          <dd>
            {noMethods ? (
              <span className="muted">a confirmar pela loja</span>
            ) : method ? (
              totals.shipping === 0 ? (
                "Sem custos"
              ) : (
                <span className="price">{formatPrice(totals.shipping!)}</span>
              )
            ) : (
              <span className="muted">{input.delivery === "envio" ? "indique o código postal" : "—"}</span>
            )}
          </dd>
        </div>
        <div className="summary__row summary__total">
          <dt>Total</dt>
          <dd className="price">
            {formatPrice(totals.total)}
            {noMethods ? <span className="muted"> + portes</span> : null}
          </dd>
        </div>
      </dl>
      <p className="mono muted" style={{ fontSize: "var(--t-2xs)" }}>
        IVA incluído à taxa legal em vigor.
      </p>
      <Link href="/saco" className="link" style={{ fontSize: "var(--t-sm)" }}>
        Editar saco
      </Link>
    </div>
  );

  return (
    <div className="wrap checkout">
      <details className="checkout__summary-mobile" open={showSummary} onToggle={(e) => setShowSummary(e.currentTarget.open)}>
        <summary>
          <span>
            Resumo · {totals.itemCount} {totals.itemCount === 1 ? "peça" : "peças"}
          </span>
          <span className="price">{formatPrice(totals.total)}</span>
        </summary>
        <div>{summaryBox}</div>
      </details>

      <form className="checkout__form" onSubmit={submit} noValidate>
        {cancelled ? (
          <p className="notice notice--warn" role="status">
            O pagamento foi cancelado e não houve cobrança. O seu saco continua aqui.
          </p>
        ) : null}
        {demo ? (
          <p className="notice notice--warn">
            Modo demonstração: pode testar o checkout à vontade. Nenhum pagamento é cobrado e nenhuma encomenda é criada na loja.
          </p>
        ) : null}

        <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="error-slot">
          {errorList.length || serverError ? (
            <div className="error-summary" role="alert">
              <h2>{serverError ?? "Há campos por corrigir."}</h2>
              {errorList.length ? (
                <ul>
                  {errorList.map((k) => (
                    <li key={k}>
                      <a href={`#f-${k}`}>
                        {FIELD_LABEL[k]}: {errors[k]}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <fieldset className="checkout__section">
          <legend className="checkout__step">
            <span className="disc">1</span> Contacto
          </legend>
          <div className="field-row field-row--2">
            <div className="field">
              <label className="field__label" htmlFor="f-email">
                Email
              </label>
              <input className="field__input" type="email" autoComplete="email" inputMode="email" value={input.email} onChange={(e) => set("email", e.target.value)} {...fieldProps("email")} />
              {err("email")}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="f-phone">
                Telemóvel
              </label>
              <input className="field__input" type="tel" autoComplete="tel" inputMode="tel" placeholder="912 345 678" value={input.phone} onChange={(e) => set("phone", e.target.value)} {...fieldProps("phone")} />
              {err("phone")}
            </div>
          </div>
        </fieldset>

        <fieldset className="checkout__section">
          <legend className="checkout__step">
            <span className="disc">2</span> Entrega
          </legend>
          {hasPickup || noMethods ? (
            <div className="choices" role="radiogroup" aria-label="Forma de entrega">
              <label className="choice">
                <input type="radio" name="delivery" checked={input.delivery === "envio"} onChange={() => set("delivery", "envio")} />
                <span>
                  <span className="choice__title">Envio para casa</span>
                  <span className="choice__desc">Portugal continental, Madeira e Açores.</span>
                </span>
                <Icon name="truck" />
              </label>
              <label className="choice">
                <input type="radio" name="delivery" checked={input.delivery === "levantamento"} onChange={() => set("delivery", "levantamento")} />
                <span>
                  <span className="choice__title">Levantar na loja</span>
                  <span className="choice__desc">Avisamos quando estiver pronto.</span>
                </span>
                <Icon name="store" />
              </label>
            </div>
          ) : null}

          <div className="field-row field-row--2">
            <div className="field">
              <label className="field__label" htmlFor="f-firstName">
                Nome
              </label>
              <input className="field__input" autoComplete="given-name" value={input.firstName} onChange={(e) => set("firstName", e.target.value)} {...fieldProps("firstName")} />
              {err("firstName")}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="f-lastName">
                Apelido
              </label>
              <input className="field__input" autoComplete="family-name" value={input.lastName} onChange={(e) => set("lastName", e.target.value)} {...fieldProps("lastName")} />
              {err("lastName")}
            </div>
          </div>

          {input.delivery === "envio" ? (
            <>
              <div className="field">
                <label className="field__label" htmlFor="f-address">
                  Morada
                </label>
                <input className="field__input" autoComplete="address-line1" placeholder="Rua, número, andar" value={input.address} onChange={(e) => set("address", e.target.value)} {...fieldProps("address")} />
                {err("address")}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="f-address2">
                  Complemento <span className="opt">(opcional)</span>
                </label>
                <input id="f-address2" name="address2" className="field__input" autoComplete="address-line2" value={input.address2} onChange={(e) => set("address2", e.target.value)} />
              </div>
              <div className="field-row field-row--cp">
                <div className="field">
                  <label className="field__label" htmlFor="f-postalCode">
                    Código postal
                  </label>
                  <input
                    className="field__input"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    placeholder="0000-000"
                    maxLength={8}
                    value={input.postalCode}
                    onChange={(e) => set("postalCode", e.target.value)}
                    {...fieldProps("postalCode")}
                    onBlur={() => {
                      set("postalCode", normalizePostalCode(input.postalCode));
                      blur("postalCode");
                    }}
                  />
                  {err("postalCode")}
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="f-city">
                    Localidade
                  </label>
                  <input className="field__input" autoComplete="address-level2" value={input.city} onChange={(e) => set("city", e.target.value)} {...fieldProps("city")} />
                  {err("city")}
                </div>
              </div>
            </>
          ) : null}

          {!noMethods ? (
            <div className="field">
              <span className="field__label" id="metodo-label">
                Método de entrega
              </span>
              {available.length ? (
                <div className="choices" role="radiogroup" aria-labelledby="metodo-label">
                  {available.map((m) => {
                    const cost = computeTotals(lines, m).shipping ?? 0;
                    return (
                      <label key={m.id} className="choice">
                        <input type="radio" name="metodo" value={m.id} checked={methodId === m.id} onChange={() => setMethodId(m.id)} />
                        <span>
                          <span className="choice__title">{m.label}</span>
                          <span className="choice__desc">{m.description}</span>
                        </span>
                        <span className="price">{cost === 0 ? "Grátis" : formatPrice(cost)}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="field__hint">Indique um código postal válido para ver as opções e o custo de envio.</p>
              )}
            </div>
          ) : (
            <p className="notice">Os portes são confirmados pela loja, consoante a morada, antes do envio.</p>
          )}
        </fieldset>

        <fieldset className="checkout__section">
          <legend className="checkout__step">
            <span className="disc">3</span> Fatura e observações
          </legend>
          <div className="field" style={{ maxWidth: "20rem" }}>
            <label className="field__label" htmlFor="f-nif">
              NIF para fatura <span className="opt">(opcional)</span>
            </label>
            <input className="field__input" inputMode="numeric" autoComplete="off" maxLength={11} value={input.nif} onChange={(e) => set("nif", e.target.value)} {...fieldProps("nif")} />
            {err("nif")}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="f-notes">
              Observações <span className="opt">(opcional)</span>
            </label>
            <textarea className="field__input" maxLength={500} value={input.notes} onChange={(e) => set("notes", e.target.value)} {...fieldProps("notes")} />
            {err("notes")}
          </div>
        </fieldset>

        <fieldset className="checkout__section">
          <legend className="checkout__step">
            <span className="disc">4</span> Como quer concluir
          </legend>
          <div className="choices" role="radiogroup" aria-label="Forma de concluir a encomenda">
            <label className="choice">
              <input
                type="radio"
                name="channel"
                checked={input.channel === "online"}
                disabled={!channels.online.enabled}
                onChange={() => set("channel", "online")}
                aria-describedby="channel-online-desc"
              />
              <span>
                <span className="choice__title">Pagar agora, online</span>
                <span className="choice__desc" id="channel-online-desc">
                  {channels.online.enabled
                    ? "Página de pagamento segura (Stripe): cartão, MB WAY ou Multibanco, conforme disponível."
                    : channels.online.reason}
                </span>
              </span>
              <Icon name="lock" />
            </label>
            <label className="choice">
              <input type="radio" name="channel" checked={input.channel === "whatsapp"} onChange={() => set("channel", "whatsapp")} />
              <span>
                <span className="choice__title">Enviar pedido por WhatsApp</span>
                <span className="choice__desc">
                  Preparamos a mensagem com o pedido completo. A loja confirma a disponibilidade e combina o pagamento consigo. Nada é
                  cobrado agora.
                </span>
              </span>
              <Icon name="chat" />
            </label>
          </div>
        </fieldset>

        <div className="checkout__section">
          <label className="check" htmlFor="f-acceptTerms">
            <input
              type="checkbox"
              checked={input.acceptTerms}
              onChange={(e) => set("acceptTerms", e.target.checked)}
              {...fieldProps("acceptTerms")}
            />
            <span>
              Li e aceito os{" "}
              <Link className="link" href="/legal/termos" target="_blank">
                Termos e Condições
              </Link>{" "}
              e a{" "}
              <Link className="link" href="/legal/privacidade" target="_blank">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {err("acceptTerms")}

          <button type="submit" className={`btn btn--lg btn--block${busy ? " is-busy" : ""}`} aria-busy={busy} data-testid="place-order">
            {busy ? <span className="spinner" aria-hidden="true" /> : null}
            {input.channel === "online" ? `Pagar ${formatPrice(totals.total)}` : "Preparar pedido por WhatsApp"}
          </button>
          <p className="mono muted" style={{ fontSize: "var(--t-2xs)", textAlign: "center" }}>
            {input.channel === "online"
              ? "Será redirecionado para a página segura da Stripe. Não guardamos dados do cartão."
              : "A encomenda só fica confirmada quando a loja lhe responder."}
          </p>
        </div>
      </form>

      <aside className="checkout__aside" aria-label="Resumo da encomenda">
        {summaryBox}
      </aside>
    </div>
  );
}
