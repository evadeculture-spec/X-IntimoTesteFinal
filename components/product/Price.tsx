import { formatPrice } from "@/lib/commerce/format";
import { isOnSale } from "@/lib/commerce/product";
import type { Product } from "@/lib/commerce/types";

export function Price({ product, className = "" }: { product: Pick<Product, "price" | "compareAtPrice">; className?: string }) {
  const sale = isOnSale(product as Product);
  return (
    <span className={`price${sale ? " price--sale" : ""} ${className}`}>
      {sale ? <span className="visually-hidden">Preço atual: </span> : null}
      <span className="price__now">{formatPrice(product.price)}</span>
      {sale ? (
        <>
          <span className="visually-hidden">, preço anterior: </span>
          <s className="price__was">{formatPrice(product.compareAtPrice!)}</s>
        </>
      ) : null}
    </span>
  );
}
