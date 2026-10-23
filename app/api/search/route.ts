import { NextResponse } from "next/server";
import { getBrand, getCatalog } from "@/lib/commerce/catalog";
import { matchesSearch } from "@/lib/commerce/query";

/** Sugestões rápidas para a caixa de pesquisa. */
export function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80).trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = getCatalog()
    .products.filter((p) => matchesSearch(p, q, getBrand(p.brandId)?.name))
    .slice(0, 6)
    .map((p) => ({ slug: p.slug, name: p.name, price: p.price, brand: getBrand(p.brandId)?.name ?? "", categoryId: p.categoryId }));
  return NextResponse.json({ results }, { headers: { "Cache-Control": "public, max-age=60" } });
}
