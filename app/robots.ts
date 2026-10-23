import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/commerce/catalog";
import { siteUrl } from "@/lib/commerce/settings";

export default function robots(): MetadataRoute.Robots {
  // Modo demonstração: nada é indexado.
  if (getCatalog().mode === "demo") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/checkout", "/saco", "/encomenda/", "/pesquisa"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
