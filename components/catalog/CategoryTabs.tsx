import Link from "next/link";
import { getCatalog } from "@/lib/commerce/catalog";

export function CategoryTabs({ current }: { current?: string }) {
  const { categories } = getCatalog();
  return (
    <nav aria-label="Famílias">
      <ul role="list" className="cat-tabs">
        <li>
          <Link className="chip" href="/loja" aria-current={!current ? "page" : undefined}>
            Tudo
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link className="chip" href={`/loja/${c.id}`} aria-current={current === c.id ? "page" : undefined}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
