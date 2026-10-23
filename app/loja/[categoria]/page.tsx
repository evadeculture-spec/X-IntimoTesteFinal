import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { ProductListing } from "@/components/catalog/ProductListing";
import { Crumbs } from "@/components/ui/Crumbs";
import { getCatalog, getCategory } from "@/lib/commerce/catalog";
import { parseQuery } from "@/lib/commerce/query";
import { siteUrl } from "@/lib/commerce/settings";

type Params = { categoria: string };

export function generateStaticParams(): Params[] {
  return getCatalog().categories.map((c) => ({ categoria: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const cat = getCategory((await params).categoria);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/loja/${cat.id}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cat = getCategory((await params).categoria);
  if (!cat) notFound();
  const query = parseQuery(await searchParams, cat.id);
  const dark = cat.tone === "noite" || cat.tone === "rubi";
  return (
    <>
      <header className={`page-head page-head--tone tone--${cat.tone} weave--${cat.weave}${dark ? " on-dark" : ""}`}>
        <div className="wrap">
          <Crumbs
            base={siteUrl()}
            items={[
              { href: "/", label: "Início" },
              { href: "/loja", label: "Loja" },
              { href: `/loja/${cat.id}`, label: cat.name },
            ]}
          />
          <div className="page-head__row">
            <div>
              <h1 className="display page-head__title">{cat.name}</h1>
              <p className="lede page-head__lede">{cat.description}</p>
            </div>
            <p className="mono">{cat.tagline}</p>
          </div>
          <CategoryTabs current={cat.id} />
        </div>
      </header>
      <ProductListing query={query} basePath={`/loja/${cat.id}`} />
    </>
  );
}
