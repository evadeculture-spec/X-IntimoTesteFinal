import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getBrand, getCatalog } from "@/lib/commerce/catalog";
import { plural } from "@/lib/commerce/format";
import { AUDIENCE_LABEL, COLOUR_FAMILY } from "@/lib/commerce/labels";
import { queryToSearch, runQuery, type ProductQuery } from "@/lib/commerce/query";
import { ListingFilters, SortSelect } from "./ListingFilters";

export function ProductListing({ query, basePath }: { query: ProductQuery; basePath: string }) {
  const { products, categories } = getCatalog();
  const result = runQuery(products, query, (id) => getBrand(id)?.name ?? "");
  const selected = { q: query.q, publico: query.publico, marca: query.marca, tamanho: query.tamanho, cor: query.cor, ordem: query.ordem };
  const activeCount = query.publico.length + query.marca.length + query.tamanho.length + query.cor.length;

  const removeHref = (key: "publico" | "marca" | "tamanho" | "cor", value: string) =>
    basePath + queryToSearch(query, { [key]: (query[key] as string[]).filter((v) => v !== value), pagina: 1 } as Partial<ProductQuery>);

  const chips = [
    ...query.publico.map((v) => ({ key: "publico" as const, v, label: AUDIENCE_LABEL[v] ?? v })),
    ...query.tamanho.map((v) => ({ key: "tamanho" as const, v, label: `Tam. ${v}` })),
    ...query.cor.map((v) => ({ key: "cor" as const, v, label: COLOUR_FAMILY[v]?.label ?? v })),
    ...query.marca.map((v) => ({ key: "marca" as const, v, label: getBrand(v)?.name ?? v })),
  ];

  return (
    <div className="wrap listing">
      <ListingFilters
        facets={{ ...result.facets, marca: result.facets.marca.map((id) => ({ id, name: getBrand(id)?.name ?? id })) }}
        selected={selected}
        activeCount={activeCount}
        count={plural(result.total, "peça", "peças")}
      >
        <SortSelect value={query.ordem} selected={selected} />
      </ListingFilters>

      <div className="listing__results">
        <h2 className="visually-hidden">Produtos</h2>
        {chips.length ? (
          <ul role="list" className="active-filters" aria-label="Filtros ativos">
            {chips.map((c) => (
              <li key={c.key + c.v}>
                <Link className="chip" href={removeHref(c.key, c.v)} scroll={false}>
                  {c.label} <span aria-hidden="true">×</span>
                  <span className="visually-hidden"> — remover filtro</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {result.items.length ? (
          <ul role="list" className="product-grid">
            {result.items.map((p, i) => (
              <li key={p.slug}>
                <ProductCard product={p} index={i} priority={i < 2} sizes="(min-width: 64em) 26vw, (min-width: 48em) 33vw, 50vw" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p className="display empty__title">
              {query.q ? (
                <>
                  Nada encontrado para <em>“{query.q}”.</em>
                </>
              ) : (
                <>
                  Nenhuma peça com <em>estes filtros.</em>
                </>
              )}
            </p>
            <p className="muted">
              {activeCount
                ? "Experimente retirar um filtro — por exemplo o tamanho ou a cor."
                : "Experimente outra palavra, ou comece por uma das famílias:"}
            </p>
            <ul role="list" style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-2)" }}>
              {activeCount ? (
                <li>
                  <Link className="btn btn--outline" href={basePath + (query.q ? `?q=${encodeURIComponent(query.q)}` : "")}>
                    Limpar filtros
                  </Link>
                </li>
              ) : null}
              {categories.map((c) => (
                <li key={c.id}>
                  <Link className="chip" href={`/loja/${c.id}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.pages > 1 ? (
          <nav className="pagination" aria-label="Páginas">
            {result.page > 1 ? (
              <Link href={basePath + queryToSearch(query, { pagina: result.page - 1 })} rel="prev">
                <span aria-hidden="true">←</span>
                <span className="visually-hidden">Página anterior</span>
              </Link>
            ) : null}
            {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) =>
              n === result.page ? (
                <span key={n} aria-current="page">
                  {n}
                </span>
              ) : (
                <Link key={n} href={basePath + queryToSearch(query, { pagina: n })} aria-label={`Página ${n}`}>
                  {n}
                </Link>
              ),
            )}
            {result.page < result.pages ? (
              <Link href={basePath + queryToSearch(query, { pagina: result.page + 1 })} rel="next">
                <span aria-hidden="true">→</span>
                <span className="visually-hidden">Página seguinte</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
