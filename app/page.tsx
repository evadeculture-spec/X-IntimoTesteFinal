import Link from "next/link";
import { HeroDrawer } from "@/components/home/HeroDrawer";
import { SectionHead } from "@/components/home/SectionHead";
import { ThermalIndex } from "@/components/home/ThermalIndex";
import { CareLabel } from "@/components/product/CareLabel";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductMedia } from "@/components/product/ProductMedia";
import { Icon } from "@/components/ui/Icon";
import { Pending } from "@/components/ui/Pending";
import { JsonLd } from "@/components/ui/JsonLd";
import { BUSINESS } from "@/data/store";
import { getBrand, getCatalog, productsIn } from "@/lib/commerce/catalog";
import { checkoutChannels, siteUrl } from "@/lib/commerce/settings";

export default function HomePage() {
  const { products, categories, brands } = getCatalog();
  const counts = Object.fromEntries(categories.map((c) => [c.id, productsIn(c.id).length]));
  const newest = [...products].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5);
  const night = productsIn("pijamas").slice(0, 3);
  const underwear = productsIn("interiores").slice(0, 2);
  const socks = productsIn("meias").slice(0, 2);
  const thermal = productsIn("termica");
  const labelProduct = productsIn("termica")[0] ?? products[0];
  const channels = checkoutChannels();
  const base = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "X Íntimo",
          url: base,
          inLanguage: "pt-PT",
          potentialAction: {
            "@type": "SearchAction",
            target: `${base}/pesquisa?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <HeroDrawer categories={categories} counts={counts} />

      {/* Novidades — grelha assimétrica */}
      {newest.length ? (
        <section className="section wrap" aria-labelledby="novidades">
          <SectionHead
            id="novidades"
            eyebrow="Novidades"
            title={
              <>
                Acabado de <em>chegar.</em>
              </>
            }
            link={{ href: "/loja?ordem=novidades", label: "Ver todas" }}
          />
          <div className="mosaic">
            {newest.map((p, i) => (
              <div key={p.slug} className={i === 0 ? "mosaic__lead" : undefined}>
                <ProductCard
                  product={p}
                  index={i}
                  priority={i === 0}
                  sizes={i === 0 ? "(min-width: 64em) 45vw, 90vw" : "(min-width: 64em) 22vw, 60vw"}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Noite — bloco escuro */}
      {night.length ? (
        <section className="feature feature--noite on-dark weave--flanela" aria-labelledby="noite">
          <div className="wrap feature__grid">
            <div className="feature__copy" data-reveal>
              <p className="eyebrow">Pijamas</p>
              <h2 id="noite" className="display feature__title">
                Dormir bem começa <em>no tecido.</em>
              </h2>
              <p className="lede">
                Flanela escovada para o inverno, malha de algodão para a meia-estação, modal para quem tem calor. Em cada
                peça dizemos-lhe de que é feita e como veste.
              </p>
              <Link href="/loja/pijamas" className="btn btn--outline">
                Ver pijamas <Icon name="arrow" className="icon icon--sm" />
              </Link>
            </div>
            <div className="feature__products">
              {night.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} sizes="(min-width: 64em) 20vw, 60vw" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Antes de escolher — a etiqueta */}
      {labelProduct ? (
        <section className="section wrap read-label" aria-labelledby="ler-etiqueta">
          <div className="read-label__art" aria-hidden="true">
            <div className="read-label__swatch">
              <ProductMedia product={labelProduct} colour={labelProduct.colours[0]!} sizes="(min-width: 64em) 30vw, 80vw" decorative />
            </div>
            <div className="read-label__tag">
              <CareLabel product={labelProduct} brandName={getBrand(labelProduct.brandId)?.name ?? ""} demo={false} />
            </div>
          </div>
          <div className="read-label__copy">
            <p className="eyebrow">Antes de escolher</p>
            <h2 id="ler-etiqueta" className="display section-head__title">
              Leia a peça <em>antes de a vestir.</em>
            </h2>
            <ol role="list" className="steps-list">
              <li data-reveal>
                <span className="steps-list__n mono">01</span>
                <div>
                  <h3>Tamanho</h3>
                  <p>
                    Cada peça tem a sua tabela de medidas. Na dúvida entre dois tamanhos, indicamos qual escolher.{" "}
                    <Link className="link" href="/apoio/guia-de-tamanhos">
                      Guia de tamanhos
                    </Link>
                  </p>
                </div>
              </li>
              <li data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                <span className="steps-list__n mono">02</span>
                <div>
                  <h3>Composição e cuidados</h3>
                  <p>Mostramos a composição e os símbolos de lavagem como vêm na etiqueta: sabe o que vai vestir e como o tratar.</p>
                </div>
              </li>
              <li data-reveal style={{ "--i": 2 } as React.CSSProperties}>
                <span className="steps-list__n mono">03</span>
                <div>
                  <h3>Trocas</h3>
                  <p>
                    Se o tamanho não servir, explicamos como trocar.{" "}
                    <Link className="link" href="/apoio#devolucoes">
                      Trocas e devoluções
                    </Link>
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
      ) : null}

      {/* Díptico: Interiores | Meias */}
      <section className="diptych" aria-label="Interiores e meias">
        {[
          { cat: categories.find((c) => c.id === "interiores")!, items: underwear, title: <>Para todos <em>os dias.</em></> },
          { cat: categories.find((c) => c.id === "meias")!, items: socks, title: <>Do tornozelo <em>para baixo.</em></> },
        ].map(({ cat, items, title }) =>
          items.length ? (
            <div key={cat.id} className={`diptych__panel tone--${cat.tone} weave--${cat.weave}${cat.tone === "rubi" ? " on-dark" : ""}`}>
              <div className="diptych__head">
                <p className="eyebrow">{cat.name}</p>
                <h2 className="display diptych__title">{title}</h2>
                <p className="diptych__desc">{cat.description}</p>
              </div>
              <div className="diptych__products">
                {items.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} sizes="(min-width: 64em) 20vw, 45vw" />
                ))}
              </div>
              <Link href={`/loja/${cat.id}`} className="link-arrow">
                Ver {cat.name.toLowerCase()} <Icon name="arrow" className="icon icon--sm" />
              </Link>
            </div>
          ) : null,
        )}
      </section>

      {/* Térmica — índice */}
      {thermal.length ? (
        <section className="section wrap thermal" aria-labelledby="termica">
          <div className="thermal__head">
            <p className="eyebrow">Roupa térmica</p>
            <h2 id="termica" className="display thermal__title">
              Para o frio, <em>por baixo.</em>
            </h2>
            <p className="lede">A camada que ninguém vê e que faz a diferença num dia de inverno.</p>
            <Link href="/loja/termica" className="link-arrow">
              Toda a roupa térmica <Icon name="arrow" className="icon icon--sm" />
            </Link>
          </div>
          <ThermalIndex products={thermal} />
        </section>
      ) : null}

      {/* Marcas + como comprar */}
      <section className="section wrap how" aria-labelledby="como-comprar">
        <div className="brands-line" data-reveal>
          <p className="eyebrow">Marcas na loja</p>
          <ul role="list">
            {brands.map((b) => (
              <li key={b.id}>
                <Link href={`/loja?marca=${b.id}`} className="display">
                  {b.name}
                </Link>
                <span className="mono muted">{b.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="how__steps">
          <h2 id="como-comprar" className="display section-head__title">
            Como <em>comprar.</em>
          </h2>
          <ol role="list" className="how__list">
            <li>
              <span className="disc">1</span>
              <h3>Escolha cor e tamanho</h3>
              <p>Junte ao saco as peças que quer. O saco fica guardado neste dispositivo.</p>
            </li>
            <li>
              <span className="disc">2</span>
              <h3>Finalize a encomenda</h3>
              <p>
                {channels.online.enabled
                  ? "Pague online com segurança, ou envie-nos o pedido por WhatsApp e combinamos consigo."
                  : "Envie-nos o pedido por WhatsApp, com tudo já escrito. Confirmamos a disponibilidade e a forma de pagamento consigo."}
              </p>
            </li>
            <li>
              <span className="disc">3</span>
              <h3>Receba ou levante</h3>
              <p>Enviamos para casa ou prepara-se para levantar na loja.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Visita */}
      <section className="visit" aria-labelledby="visita">
        <div className="wrap visit__grid">
          <h2 id="visita" className="display visit__title">
            Também nos encontra <em>ao balcão.</em>
          </h2>
          <dl className="visit__info">
            <div>
              <dt className="eyebrow">Morada</dt>
              <dd>
                <Pending value={BUSINESS.address} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Horário</dt>
              <dd>
                <Pending value={BUSINESS.openingHours} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Contacto</dt>
              <dd>
                <Pending value={BUSINESS.phone ?? BUSINESS.email} />
              </dd>
            </div>
          </dl>
          <Link href="/contactos" className="btn btn--outline">
            Contactos e direções
          </Link>
        </div>
      </section>
    </>
  );
}
