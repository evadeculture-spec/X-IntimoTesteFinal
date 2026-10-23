import Link from "next/link";
import { CATEGORIES } from "@/data/taxonomy";

export function EmptyBag({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div style={{ display: "grid", gap: "var(--s-4)" }}>
      <p className="display" style={{ fontSize: "var(--t-xl)" }}>
        Ainda não há nada <em>na gaveta.</em>
      </p>
      <p className="muted">Comece por uma família:</p>
      <ul role="list" style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-2)" }}>
        {CATEGORIES.map((c) => (
          <li key={c.id}>
            <Link className="chip" href={`/loja/${c.id}`} onClick={onNavigate}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
