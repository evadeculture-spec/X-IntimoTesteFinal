import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/commerce/catalog";
import { siteUrl } from "@/lib/commerce/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  const { products, categories, mode } = getCatalog();
  if (mode === "demo") return [];
  const base = siteUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/loja`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: `${base}/loja/${c.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/produto/${p.slug}`, lastModified: new Date(p.publishedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...["/sobre", "/contactos", "/apoio", "/apoio/guia-de-tamanhos", "/legal/termos", "/legal/privacidade", "/legal/cookies", "/legal/litigios"].map((p) => ({
      url: base + p,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
