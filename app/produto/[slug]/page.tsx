import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareLabel } from "@/components/product/CareLabel";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductView } from "@/components/product/ProductView";
import { Crumbs } from "@/components/ui/Crumbs";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { POLICIES } from "@/data/store";
import { getBrand, getCatalog, getCategory, getProduct, getSizeChart, relatedProducts } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { isProductSoldOut } from "@/lib/commerce/product";
import { checkoutChannels, shippingMethods, siteUrl } from "@/lib/commerce/settings";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getCatalog().products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const brand = getBrand(p.brandId)?.name;
  return {
    title: `${p.name}${brand ? ` — ${brand}` : ""}`,
    description: `${p.summary} ${formatPrice(p.price)}. ${p.composition.join(", ")}.`,
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: { type: "website", title: p.name, description: p.summary, images: p.images[0] ? [{ url: p.images[0].src }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const { mode } = getCatalog();
  const brand = getBrand(product.brandId);
  const category = getCategory(product.categoryId)!;
  const chart = getSizeChart(product.sizeChartId);
  const related = relatedProducts(product, 4);
  const base = siteUrl();
  const methods = shippingMethods();
  const home = methods.find((m) => m.regions !== "pickup" && m.regions.includes("continente"));
  const pickup = methods.find((m) => m.regions === "pickup");
  const channels = checkoutChannels();

  const assurance = [
    {
      icon: "truck" as const,
      text: home
        ? `${home.label}: ${formatPrice(home.price)}${home.freeFrom ? ` · grátis a partir de ${formatPrice(home.freeFrom)}` : ""}${mode === "demo" ? " (ilustrativo)" : ""}.`
        : "Portes de envio confirmados pela loja antes do envio.",
    },
    ...(pickup ? [{ icon: "store" as const, text: "Pode levantar na loja, sem custos." }] : []),
    {
      icon: "return" as const,
      text: POLICIES.returnDays
        ? `Trocas e devoluções até ${POLICIES.returnDays} dias.`
        : "Trocas e devoluções: veja as condições.",
      href: "/apoio#devolucoes",
    },
    {
      icon: channels.online.enabled ? ("lock" as const) : ("chat" as const),
      text: channels.online.enabled
        ? "Pagamento seguro: cartão, MB WAY ou Multibanco."
        : "Pedido confirmado pela loja por WhatsApp, sem pagamento antecipado online.",
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.ref,
          description: product.description,
          brand: brand ? { "@type": "Brand", name: brand.name } : undefined,
          category: category.name,
          material: product.composition.join(", "),
          color: product.colours.map((c) => c.name).join(", "),
          image: product.images.map((i) => base + i.src),
          offers: {
            "@type": "Offer",
            url: `${base}/produto/${product.slug}`,
            priceCurrency: "EUR",
            price: (product.price / 100).toFixed(2),
            availability: isProductSoldOut(product) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }}
      />
      <div className="wrap" style={{ paddingTop: "var(--s-4)" }}>
        <Crumbs
          base={base}
          items={[
            { href: "/", label: "Início" },
            { href: `/loja/${category.id}`, label: category.name },
            { href: `/produto/${product.slug}`, label: product.name },
          ]}
        />
      </div>
      <div className="wrap pdp">
        <ProductView product={product} brandName={brand?.name ?? ""} sizeChart={chart}>
          <ul role="list" className="assurance">
            {assurance.map((a) => (
              <li key={a.text}>
                <Icon name={a.icon} />
                <span>
                  {a.text}{" "}
                  {"href" in a && a.href ? (
                    <Link className="link" href={a.href}>
                      Saber mais
                    </Link>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <CareLabel product={product} brandName={brand?.name ?? ""} demo={mode === "demo"} />

          <div className="accordion">
            <details open>
              <summary>Descrição</summary>
              <div className="accordion__body">
                <p>{product.description}</p>
                {product.details?.length ? (
                  <ul style={{ paddingLeft: "1.1rem" }}>
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </details>
            {product.fit ? (
              <details>
                <summary>Ajuste e tamanho</summary>
                <div className="accordion__body">
                  <p>{product.fit}</p>
                  <p>
                    <Link className="link" href="/apoio/guia-de-tamanhos">
                      Ver o guia de tamanhos completo
                    </Link>
                  </p>
                </div>
              </details>
            ) : null}
            <details>
              <summary>Envios e devoluções</summary>
              <div className="accordion__body">
                <p>
                  {home
                    ? "Enviamos para Portugal continental e ilhas. O custo é calculado no checkout, de acordo com a morada."
                    : "Os portes são confirmados pela loja antes do envio, de acordo com a morada."}
                </p>
                <p>
                  As condições de troca e devolução, incluindo as regras de higiene para peças íntimas, estão em{" "}
                  <Link className="link" href="/apoio#devolucoes">
                    Trocas e devoluções
                  </Link>
                  .
                </p>
              </div>
            </details>
          </div>
        </ProductView>
      </div>

      {related.length ? (
        <section className="wrap related" aria-labelledby="relacionados">
          <h2 id="relacionados" className="display section-head__title" style={{ marginBottom: "var(--s-6)" }}>
            Da mesma gaveta
          </h2>
          <div className="rail rail--static">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} sizes="(min-width: 64em) 22vw, 64vw" />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
