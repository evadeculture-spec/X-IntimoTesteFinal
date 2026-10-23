import Link from "next/link";
import { getBrand } from "@/lib/commerce/catalog";
import { plural } from "@/lib/commerce/format";
import { isOnSale, isProductSoldOut } from "@/lib/commerce/product";
import type { Product } from "@/lib/commerce/types";
import { Price } from "./Price";
import { ProductMedia } from "./ProductMedia";

export function ProductCard({
  product,
  priority,
  sizes,
  headingLevel = 3,
  index = 0,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  headingLevel?: 2 | 3;
  index?: number;
}) {
  const [first, second] = product.colours;
  const soldOut = isProductSoldOut(product);
  const sale = isOnSale(product);
  const H = `h${headingLevel}` as const;
  const pct = sale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <article className={`card${soldOut ? " is-sold-out" : ""}`} data-reveal style={{ "--i": index % 4 } as React.CSSProperties}>
      <div className="card__media">
        {soldOut ? (
          <span className="stamp stamp--ink">Esgo&shy;tado</span>
        ) : sale ? (
          <span className="stamp">
            <span className="visually-hidden">Redução de </span>−{pct}%
          </span>
        ) : product.isNew ? (
          <span className="stamp">Novo</span>
        ) : null}
        <ProductMedia product={product} colour={first!} priority={priority} sizes={sizes} decorative />
        {second ? (
          <span className="card__alt" aria-hidden="true">
            <ProductMedia product={product} colour={second} sizes={sizes} decorative />
          </span>
        ) : null}
      </div>
      <div className="card__meta">
        <span className="card__brand">{getBrand(product.brandId)?.name}</span>
        <H className="card__name">
          <Link className="card__link" href={`/produto/${product.slug}`}>
            {product.name}
          </Link>
        </H>
        <span className="card__price">
          <Price product={product} />
        </span>
      </div>
      <div className="card__foot">
        <span className="dots" aria-hidden="true">
          {product.colours.map((c) => (
            <span key={c.id} style={{ "--c": c.hex } as React.CSSProperties} />
          ))}
        </span>
        <span className="card__note">
          {product.colours.length > 1 ? plural(product.colours.length, "cor", "cores") : first!.name} · {product.sizes[0]}–
          {product.sizes.at(-1)}
        </span>
      </div>
    </article>
  );
}
