import Link from "next/link";
import type { Category } from "@/lib/commerce/types";
import { plural } from "@/lib/commerce/format";
import { Icon } from "@/components/ui/Icon";

export function HeroDrawer({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <h1 id="hero-title" className="display hero__title">
            A primeira <em>camada.</em>
          </h1>
          <p className="lede hero__lede">
            O que se veste antes de tudo merece ser bem escolhido. Peças de marcas em que confiamos, para mulher, homem e
            criança.
          </p>
          <div className="hero__cta">
            <Link href="/loja" className="btn btn--lg">
              Entrar na loja <Icon name="arrow" className="icon icon--sm" />
            </Link>
          </div>
        </div>

        <nav className="drawer-stack" aria-label="Famílias de produto">
          <ol role="list">
            {categories.map((c, i) => (
              <li key={c.id}>
                <Link href={`/loja/${c.id}`} className={`band band--${c.tone} weave--${c.weave}`}>
                  <span className="band__pull" aria-hidden="true" />
                  <span className="band__index mono" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="band__name">{c.name}</span>
                  <span className="band__tag mono">{c.tagline}</span>
                  <span className="band__count mono">{plural(counts[c.id] ?? 0, "peça", "peças")}</span>
                  <Icon name="arrow" className="icon band__arrow" />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
