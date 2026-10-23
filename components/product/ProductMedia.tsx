import Image from "next/image";
import type { Colour, Product } from "@/lib/commerce/types";
import { ProductPlate } from "./ProductPlate";

/** Imagem real do produto (se existir para a cor) ou prancha de desenho técnico. */
export function ProductMedia({
  product,
  colour,
  sizes = "(min-width: 64em) 25vw, 50vw",
  priority,
  caption,
  decorative,
}: {
  product: Product;
  colour: Colour;
  sizes?: string;
  priority?: boolean;
  caption?: boolean;
  decorative?: boolean;
}) {
  const img = product.images.find((i) => i.colourId === colour.id) ?? (product.images.length ? product.images[0] : undefined);
  if (img) {
    return (
      <span className="plate-frame plate-frame--photo">
        <Image src={img.src} alt={decorative ? "" : img.alt} fill sizes={sizes} priority={priority} />
      </span>
    );
  }
  return (
    <span className="plate-frame">
      <ProductPlate
        garment={product.garment}
        weave={product.weave}
        hex={colour.hex}
        caption={caption ? `${product.ref} · ${colour.name}` : undefined}
        label={decorative ? undefined : `Desenho ilustrativo: ${product.name}, ${colour.name}`}
      />
    </span>
  );
}
