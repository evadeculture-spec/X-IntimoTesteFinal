"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { findVariantFor, isColourSoldOut, maxQuantity, variantAvailability } from "@/lib/commerce/product";
import type { Product, SizeChart } from "@/lib/commerce/types";
import { FabricSwatch } from "./FabricSwatch";
import { Price } from "./Price";
import { ProductMedia } from "./ProductMedia";

const STOCK_TEXT = {
  available: "Disponível",
  low: "Últimas unidades",
  "sold-out": "Esgotado neste tamanho",
  untracked: "Disponibilidade confirmada na encomenda",
} as const;

export function ProductView({
  product,
  brandName,
  sizeChart,
  children,
}: {
  product: Product;
  brandName: string;
  sizeChart?: SizeChart;
  /** Conteúdo informativo (etiqueta, detalhes) renderizado no servidor. */
  children: React.ReactNode;
}) {
  const { add, open: openBag } = useCart();
  const [colourId, setColourId] = useState(product.colours[0]!.id);

  // Cor pedida no endereço (?cor=…) — lida no cliente para a página poder ser estática.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("cor");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronizar com o URL após montagem
    if (wanted && product.colours.some((c) => c.id === wanted)) setColourId(wanted);
  }, [product.colours]);
  const onlySize = product.sizes.length === 1 ? product.sizes[0] : undefined;
  const [size, setSize] = useState<string | undefined>(onlySize);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const buyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sizeGroupRef = useRef<HTMLFieldSetElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const colour = product.colours.find((c) => c.id === colourId)!;
  const variant = size ? findVariantFor(product, colourId, size) : undefined;
  const availability = size ? variantAvailability(variant) : null;
  const max = maxQuantity(variant);
  const canBuy = !size || (availability !== "sold-out" && max > 0);

  // Ao trocar de cor/tamanho, ajusta a quantidade e limpa avisos.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronizar quantidade com o stock da variante
    setQty((q) => Math.max(1, Math.min(q, max || 1)));
    setAdded(false);
  }, [colourId, size, max]);

  // Mostra a barra fixa (telemóvel) quando o botão principal sai do ecrã.
  useEffect(() => {
    const el = buyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setStickyVisible(!e!.isIntersecting && e!.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pickColour = (id: string) => {
    setColourId(id);
    setSlide(0);
    trackRef.current?.scrollTo({ left: 0 });
    const url = new URL(window.location.href);
    url.searchParams.set("cor", id);
    window.history.replaceState(window.history.state, "", url);
  };

  const media = useMemo(() => {
    const photos = product.images.filter((i) => !i.colourId || i.colourId === colourId);
    if (photos.length) return photos.map((_, i) => ({ kind: "photo" as const, i }));
    return [{ kind: "plate" as const, i: 0 }, { kind: "swatch" as const, i: 1 }];
  }, [product.images, colourId]);

  const renderMedia = (m: (typeof media)[number], big = false) => {
    if (m.kind === "swatch") return <FabricSwatch weave={product.weave} hex={colour.hex} colourName={colour.name} />;
    if (m.kind === "photo") {
      const photos = product.images.filter((i) => !i.colourId || i.colourId === colourId);
      const img = photos[m.i]!;
      return <ProductMedia product={{ ...product, images: [img] }} colour={colour} priority={m.i === 0} sizes={big ? "100vw" : "(min-width: 64em) 58vw, 100vw"} />;
    }
    return <ProductMedia product={product} colour={colour} priority caption sizes={big ? "100vw" : "(min-width: 64em) 58vw, 100vw"} />;
  };

  const submit = () => {
    if (!size) {
      setError("Escolha um tamanho para adicionar ao saco.");
      sizeGroupRef.current?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    if (!variant || !canBuy) {
      setError("Este tamanho está esgotado nesta cor. Escolha outro tamanho ou outra cor.");
      return;
    }
    setError(null);
    add({
      sku: variant.sku,
      slug: product.slug,
      name: product.name,
      brandName,
      colourName: colour.name,
      colourHex: colour.hex,
      size,
      garment: product.garment,
      weave: product.weave,
      imageSrc: product.images.find((i) => i.colourId === colourId)?.src ?? product.images[0]?.src,
      unitPrice: product.price,
      quantity: qty,
      max,
    });
    setAdded(true);
  };

  const sizeOut = (s: string) => variantAvailability(findVariantFor(product, colourId, s)) === "sold-out";

  return (
    <>
      <div className="pdp__gallery">
        <div
          className="gallery__track"
          ref={trackRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
          aria-label="Imagens do produto"
          role="region"
          tabIndex={0}
        >
          {media.map((m, i) => (
            <div key={`${colourId}-${m.kind}-${m.i}`} className="gallery__item">
              {renderMedia(m)}
              <button type="button" className="icon-btn gallery__zoom" onClick={() => setZoom(i)}>
                <Icon name="zoom" label="Ampliar imagem" />
              </button>
            </div>
          ))}
        </div>
        {media.length > 1 ? (
          <div className="gallery__dots">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Imagem ${i + 1} de ${media.length}`}
                aria-current={slide === i}
                onClick={() => trackRef.current?.scrollTo({ left: i * trackRef.current.clientWidth, behavior: "smooth" })}
              />
            ))}
          </div>
        ) : null}
        {product.images.length === 0 ? (
          <p className="mono muted" style={{ paddingInline: "var(--gutter)", fontSize: "var(--t-2xs)" }}>
            Desenho técnico e amostra ilustrativos. Fotografia do produto em breve.
          </p>
        ) : null}
      </div>

      <div className="pdp__panel">
        <div>
          <Link href={`/loja?marca=${product.brandId}`} className="pdp__brand">
            {brandName}
          </Link>
          <h1 className="display pdp__title">{product.name}</h1>
          <p className="pdp__price">
            <Price product={product} />
            <span className="mono muted" style={{ marginLeft: "0.6rem", fontSize: "var(--t-2xs)" }}>
              IVA incluído
            </span>
          </p>
        </div>
        <p className="pdp__summary">{product.summary}</p>

        <fieldset className="picker">
          <legend className="picker__legend">
            <span>
              Cor: <b>{colour.name}</b>
            </span>
          </legend>
          <div className="picker__options">
            {product.colours.map((c) => {
              const out = isColourSoldOut(product, c.id);
              return (
                <label key={c.id} className={`swatch${out ? " is-out" : ""}`} title={c.name}>
                  <input
                    type="radio"
                    name="cor"
                    value={c.id}
                    checked={c.id === colourId}
                    onChange={() => pickColour(c.id)}
                    aria-label={`${c.name}${out ? " (esgotado)" : ""}`}
                  />
                  <span className="swatch__chip" style={{ "--c": c.hex } as React.CSSProperties} />
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset
          className={`picker${error && !size ? " has-error" : ""}`}
          ref={sizeGroupRef}
          aria-describedby={error ? "buy-error" : undefined}
        >
          <legend className="picker__legend">
            <span>
              Tamanho{size ? <>: <b>{size}</b></> : <span className="muted"> — escolha um</span>}
            </span>
          </legend>
          <div className="picker__options">
            {product.sizes.map((s) => {
              const out = sizeOut(s);
              return (
                <label key={s} className={`size${out ? " is-out" : ""}`}>
                  <input
                    type="radio"
                    name="tamanho"
                    value={s}
                    checked={size === s}
                    onChange={() => {
                      setSize(s);
                      setError(null);
                    }}
                    aria-label={`Tamanho ${s}${out ? ", esgotado" : ""}`}
                  />
                  <span className="size__box">{s}</span>
                </label>
              );
            })}
          </div>
          {sizeChart ? (
            <button type="button" className="pdp__guide" onClick={() => setGuideOpen(true)} aria-haspopup="dialog">
              <Icon name="ruler" className="icon icon--sm" /> Guia de tamanhos
            </button>
          ) : null}
        </fieldset>

        <p className={`pdp__stock${availability === "low" ? " pdp__stock--low" : availability === "sold-out" ? " pdp__stock--out" : !availability ? " pdp__stock--idle" : ""}`} aria-live="polite">
          {availability ? STOCK_TEXT[availability] : "Escolha o tamanho para ver a disponibilidade"}
        </p>

        <div className="pdp__buy" ref={buyRef}>
          <div className="qty" role="group" aria-label="Quantidade">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Diminuir quantidade">
              <Icon name="minus" className="icon icon--sm" />
            </button>
            <output aria-live="polite">{qty}</output>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(max || 10, q + 1))}
              disabled={!!size && qty >= max}
              aria-label="Aumentar quantidade"
            >
              <Icon name="plus" className="icon icon--sm" />
            </button>
          </div>
          <button type="button" className="btn btn--lg" onClick={submit} aria-disabled={!canBuy} data-testid="add-to-bag">
            {canBuy ? "Adicionar ao saco" : "Esgotado"}
          </button>
        </div>
        {error ? (
          <p id="buy-error" className="pdp__error" role="alert">
            <Icon name="alert" className="icon icon--sm" /> {error}
          </p>
        ) : null}
        {added ? (
          <div className="pdp__added" role="status">
            <Icon name="check" />
            <span>
              Adicionado ao saco.{" "}
              <button type="button" className="link" style={{ background: "none", border: 0, padding: 0 }} onClick={openBag}>
                Ver saco
              </button>{" "}
              ·{" "}
              <Link href="/checkout" className="link">
                Finalizar encomenda
              </Link>
            </span>
          </div>
        ) : null}

        {children}
      </div>

      <div className={`sticky-buy${stickyVisible ? " is-visible" : ""}`} aria-hidden={!stickyVisible} inert={!stickyVisible}>
        <div className="sticky-buy__info">
          <span>{product.name}</span>
          <span className="mono muted">
            {colour.name}
            {size ? ` · ${size}` : ""} · <Price product={product} />
          </span>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!size) {
              buyRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
              setError("Escolha um tamanho para adicionar ao saco.");
              return;
            }
            submit();
          }}
          aria-disabled={!canBuy}
        >
          {size ? (canBuy ? "Adicionar" : "Esgotado") : "Escolher tamanho"}
        </button>
      </div>

      {sizeChart ? (
        <Dialog id="guia" open={guideOpen} onClose={() => setGuideOpen(false)} title="Guia de tamanhos">
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabela — deslize para ver todas as colunas">
            <table className="table">
              <caption>{sizeChart.title}</caption>
              <thead>
                <tr>
                  {sizeChart.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.rows
                  .filter((r) => product.sizes.includes(r[0]!))
                  .map((r) => (
                    <tr key={r[0]} aria-current={r[0] === size ? "true" : undefined} style={r[0] === size ? { background: "var(--linho)" } : undefined}>
                      {r.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: "var(--s-4)", fontSize: "var(--t-sm)" }}>{sizeChart.note}</p>
          {product.fit ? (
            <p style={{ marginTop: "var(--s-3)", fontSize: "var(--t-sm)" }}>
              <b>Esta peça:</b> {product.fit}
            </p>
          ) : null}
          {!sizeChart.verified ? (
            <p className="notice notice--warn" style={{ marginTop: "var(--s-4)" }}>
              Tabela indicativa, ainda a confirmar com as medidas da marca.
            </p>
          ) : null}
          <p style={{ marginTop: "var(--s-4)" }}>
            <Link className="link" href="/apoio/guia-de-tamanhos">
              Como tirar as medidas
            </Link>
          </p>
        </Dialog>
      ) : null}

      <ZoomDialog open={zoom !== null} onClose={() => setZoom(null)} label={product.name}>
        {zoom !== null && media[zoom] ? renderMedia(media[zoom], true) : null}
      </ZoomDialog>
    </>
  );
}

function ZoomDialog({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="zoom" aria-label={`Imagem ampliada: ${label}`} onClose={onClose} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" className="icon-btn zoom__close" onClick={onClose}>
        <Icon name="close" label="Fechar" />
      </button>
      <div className="zoom__inner" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {children}
      </div>
    </dialog>
  );
}
