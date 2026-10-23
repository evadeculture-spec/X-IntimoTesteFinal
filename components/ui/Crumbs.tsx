import Link from "next/link";
import { JsonLd } from "./JsonLd";

export function Crumbs({ items, base }: { items: { href?: string; label: string }[]; base: string }) {
  return (
    <nav className="crumbs" aria-label="Localização">
      <ol role="list">
        {items.map((it, i) => (
          <li key={i}>
            {it.href && i < items.length - 1 ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.label,
            ...(it.href ? { item: base + it.href } : {}),
          })),
        }}
      />
    </nav>
  );
}
