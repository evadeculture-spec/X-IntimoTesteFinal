"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { AUDIENCE_LABEL, COLOUR_FAMILY } from "@/lib/commerce/labels";
import type { Audience, ColourFamily } from "@/lib/commerce/types";

export interface FacetData {
  publico: Audience[];
  marca: { id: string; name: string }[];
  tamanho: string[];
  cor: ColourFamily[];
}

export interface Selected {
  q?: string;
  publico: string[];
  marca: string[];
  tamanho: string[];
  cor: string[];
  ordem: string;
}

function toSearch(form: HTMLFormElement): string {
  const fd = new FormData(form);
  const sp = new URLSearchParams();
  for (const key of ["q", "publico", "marca", "tamanho", "cor", "ordem"]) {
    const vals = fd.getAll(key).map(String).filter(Boolean);
    if (vals.length && !(key === "ordem" && vals[0] === "relevancia")) sp.set(key, vals.join(","));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Agrupa tamanhos por sistema (roupa adulta, criança, meias) para não os misturar. */
function sizeGroups(sizes: string[]) {
  const groups = [
    { label: "Adulto", sizes: sizes.filter((s) => /^X{0,2}[SML]$|^X{1,2}L$/.test(s)) },
    { label: "Criança", sizes: sizes.filter((s) => /^\d+A$/.test(s)) },
    { label: "Meias (calçado)", sizes: sizes.filter((s) => s.includes("/")) },
  ].filter((g) => g.sizes.length);
  const known = new Set(groups.flatMap((g) => g.sizes));
  const rest = sizes.filter((s) => !known.has(s));
  if (rest.length) groups.push({ label: "Outros", sizes: rest });
  return groups.length === 1 ? [{ label: "", sizes: groups[0]!.sizes }] : groups;
}

function Fields({ facets, selected, prefix }: { facets: FacetData; selected: Selected; prefix: string }) {
  const opt = (name: string, value: string, label: React.ReactNode, checked: boolean, extra = "") => (
    <label key={value} className={`fopt ${extra}`} htmlFor={`${prefix}-${name}-${value}`}>
      <input id={`${prefix}-${name}-${value}`} type="checkbox" name={name} value={value} defaultChecked={checked} />
      <span className="fopt__box">{label}</span>
    </label>
  );
  return (
    <>
      {selected.q ? <input type="hidden" name="q" value={selected.q} /> : null}
      <input type="hidden" name="ordem" value={selected.ordem} />
      {facets.publico.length > 1 ? (
        <fieldset>
          <legend>Para quem</legend>
          <div className="filters__opts">
            {facets.publico.map((a) => opt("publico", a, AUDIENCE_LABEL[a], selected.publico.includes(a)))}
          </div>
        </fieldset>
      ) : null}
      {facets.tamanho.length ? (
        <fieldset>
          <legend>Tamanho</legend>
          {sizeGroups(facets.tamanho).map((g) => (
            <div key={g.label} className="filters__group">
              {g.label ? <p className="filters__sub">{g.label}</p> : null}
              <div className="filters__opts">
                {g.sizes.map((s) => opt("tamanho", s, s, selected.tamanho.includes(s), "fopt--size"))}
              </div>
            </div>
          ))}
        </fieldset>
      ) : null}
      {facets.cor.length > 1 ? (
        <fieldset>
          <legend>Cor</legend>
          <div className="filters__opts">
            {facets.cor.map((c) =>
              opt(
                "cor",
                c,
                <>
                  <span className="fopt__dot" style={{ "--c": COLOUR_FAMILY[c].hex } as React.CSSProperties} aria-hidden="true" />
                  {COLOUR_FAMILY[c].label}
                </>,
                selected.cor.includes(c),
              ),
            )}
          </div>
        </fieldset>
      ) : null}
      {facets.marca.length > 1 ? (
        <fieldset>
          <legend>Marca</legend>
          <div className="filters__opts">
            {facets.marca.map((b) => opt("marca", b.id, b.name, selected.marca.includes(b.id)))}
          </div>
        </fieldset>
      ) : null}
    </>
  );
}

export function ListingFilters({
  facets,
  selected,
  activeCount,
  count,
  children,
}: {
  facets: FacetData;
  selected: Selected;
  activeCount: number;
  count: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const id = useId();
  const key = JSON.stringify(selected);

  const apply = (form: HTMLFormElement) => {
    startTransition(() => router.replace(`${pathname}${toSearch(form)}`, { scroll: false }));
  };

  const clearHref = selected.q ? `${pathname}?q=${encodeURIComponent(selected.q)}` : pathname;

  return (
    <>
      <aside className="listing__aside" aria-label="Filtros">
        <form
          key={key}
          className="filters filters--live"
          action={pathname}
          method="get"
          onChange={(e) => apply(e.currentTarget)}
          onSubmit={(e) => {
            e.preventDefault();
            apply(e.currentTarget);
          }}
          aria-busy={pending}
        >
          <Fields facets={facets} selected={selected} prefix={`${id}-a`} />
          <div className="filters__actions">
            <button type="submit" className="btn btn--outline filters__submit">
              Aplicar filtros
            </button>
            {activeCount ? (
              <a href={clearHref} className="link" style={{ fontSize: "var(--t-sm)" }}>
                Limpar filtros
              </a>
            ) : null}
          </div>
        </form>
      </aside>

      <div className="toolbar">
        <p className="toolbar__count" aria-live="polite">
          {count}
        </p>
        <div className="toolbar__actions">
          <button type="button" className="btn btn--outline filters-toggle" onClick={() => setOpen(true)} aria-haspopup="dialog" style={{ minHeight: "2.5rem", paddingInline: "0.9rem" }}>
            <Icon name="filter" className="icon icon--sm" /> Filtrar{activeCount ? ` (${activeCount})` : ""}
          </button>
          {children}
        </div>
      </div>

      <Dialog id="filtros" open={open} onClose={() => setOpen(false)} title="Filtrar">
        <form
          key={key}
          className="filters"
          action={pathname}
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            apply(e.currentTarget);
            setOpen(false);
          }}
        >
          <Fields facets={facets} selected={selected} prefix={`${id}-m`} />
          <div className="filters__actions">
            <button type="submit" className="btn btn--lg btn--block">
              Ver resultados
            </button>
            {activeCount ? (
              <a href={clearHref} className="btn btn--outline btn--block">
                Limpar filtros
              </a>
            ) : null}
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function SortSelect({ value, selected }: { value: string; selected: Selected }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <form action={pathname} method="get" className="sort-form">
      {selected.q ? <input type="hidden" name="q" value={selected.q} /> : null}
      {(["publico", "marca", "tamanho", "cor"] as const).map((k) =>
        selected[k].length ? <input key={k} type="hidden" name={k} value={selected[k].join(",")} /> : null,
      )}
      <label className="visually-hidden" htmlFor="ordem">
        Ordenar por
      </label>
      <select
        id="ordem"
        name="ordem"
        className="field__input"
        defaultValue={value}
        onChange={(e) => router.replace(`${pathname}${toSearch(e.currentTarget.form!)}`, { scroll: false })}
      >
        <option value="relevancia">Sugestão da loja</option>
        <option value="novidades">Novidades</option>
        <option value="preco-asc">Preço: mais baixo</option>
        <option value="preco-desc">Preço: mais alto</option>
      </select>
      <noscript>
        <button type="submit" className="btn btn--outline">
          Ordenar
        </button>
      </noscript>
    </form>
  );
}
