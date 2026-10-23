import type { Product } from "@/lib/commerce/types";
import { CareSymbols } from "./CareSymbols";

/** A etiqueta cosida da peça, transposta para o ecrã. */
export function CareLabel({ product, brandName, demo }: { product: Product; brandName: string; demo: boolean }) {
  return (
    <div className="care-label">
      <dl>
        <div>
          <dt>Composição</dt>
          <dd>{product.composition.join(" · ")}</dd>
        </div>
        <div>
          <dt>Conservação</dt>
          <dd>
            <CareSymbols codes={product.care} />
          </dd>
        </div>
        <div className="care-label__pair">
          <dt>Marca</dt>
          <dd>{brandName}</dd>
        </div>
        <div className="care-label__pair">
          <dt>Ref.</dt>
          <dd>{product.ref}</dd>
        </div>
      </dl>
      {demo ? (
        <p style={{ marginTop: "var(--s-4)", fontSize: "var(--t-2xs)", color: "var(--aviso)" }}>
          Composição ilustrativa (modo demonstração)
        </p>
      ) : null}
    </div>
  );
}
