import Image from "next/image";
import { ProductPlate } from "@/components/product/ProductPlate";
import type { CartLine } from "@/lib/commerce/types";

export function LineThumb({ line }: { line: Pick<CartLine, "garment" | "weave" | "colourHex" | "imageSrc" | "name"> }) {
  return (
    <span className={`plate-frame${line.imageSrc ? " plate-frame--photo" : ""}`}>
      {line.imageSrc ? (
        <Image src={line.imageSrc} alt="" fill sizes="112px" />
      ) : (
        <ProductPlate garment={line.garment} weave={line.weave} hex={line.colourHex} />
      )}
    </span>
  );
}
