import type { Metadata } from "next";
import { ProductListing } from "@/components/catalog/ProductListing";
import { parseQuery } from "@/lib/commerce/query";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const q = parseQuery(await searchParams).q;
  return { title: q ? `Pesquisa: ${q}` : "Pesquisa", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseQuery(await searchParams);
  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <p className="eyebrow">Pesquisa</p>
          <h1 className="display page-head__title">{query.q ? <>“{query.q}”</> : <>O que procura?</>}</h1>
          <form role="search" action="/pesquisa" method="get" className="search__form" style={{ marginTop: "var(--s-5)", maxWidth: "40rem" }}>
            <label htmlFor="q-page" className="visually-hidden">
              Pesquisar produtos
            </label>
            <input id="q-page" name="q" type="search" className="search__input" defaultValue={query.q} placeholder="Pijama, meias térmicas…" style={{ fontSize: "var(--t-lg)" }} />
            <button type="submit" className="btn">
              Pesquisar
            </button>
          </form>
        </div>
      </header>
      <ProductListing query={query} basePath="/pesquisa" />
    </>
  );
}
