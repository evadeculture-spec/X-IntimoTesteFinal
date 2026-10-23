import type { Metadata } from "next";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { ProductListing } from "@/components/catalog/ProductListing";
import { Crumbs } from "@/components/ui/Crumbs";
import { parseQuery } from "@/lib/commerce/query";
import { siteUrl } from "@/lib/commerce/settings";

export const metadata: Metadata = {
  title: "Loja",
  description: "Toda a loja X Íntimo: pijamas, interiores, roupa térmica e meias para mulher, homem e criança.",
  alternates: { canonical: "/loja" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseQuery(await searchParams);
  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <Crumbs base={siteUrl()} items={[{ href: "/", label: "Início" }, { href: "/loja", label: "Loja" }]} />
          <h1 className="display page-head__title">
            {query.ordem === "novidades" ? (
              <>
                Novi<em>dades.</em>
              </>
            ) : (
              <>
                Toda a <em>loja.</em>
              </>
            )}
          </h1>
          <CategoryTabs />
        </div>
      </header>
      <ProductListing query={query} basePath="/loja" />
    </>
  );
}
