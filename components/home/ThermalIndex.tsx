import Link from "next/link";
import type { Product } from "@/lib/commerce/types";
import { plural } from "@/lib/commerce/format";
import { Price } from "@/components/product/Price";
import { ProductMedia } from "@/components/product/ProductMedia";

const AUD: Record<string, string> = { mulher: "Mulher", homem: "Homem", crianca: "Criança", unissexo: "Unissexo" };

/** Índice tipográfico: a família apresentada como uma lista de inventário. */
export function ThermalIndex({ products }: { products: Product[] }) {
  return (
    <ol role="list" className="index-list">
      {products.map((p, i) => (
        <li key={p.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
          <Link href={`/produto/${p.slug}`} className="index-row">
            <span className="index-row__n mono" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="index-row__name">{p.name}</span>
            <span className="index-row__meta mono">
              {AUD[p.audience]} · {plural(p.colours.length, "cor", "cores")}
            </span>
            <span className="index-row__price">
              <Price product={p} />
            </span>
            <span className="index-row__peek" aria-hidden="true">
              <ProductMedia product={p} colour={p.colours[0]!} sizes="160px" decorative />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
