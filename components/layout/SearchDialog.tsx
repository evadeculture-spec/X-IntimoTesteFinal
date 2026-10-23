"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/commerce/format";

interface Result {
  slug: string;
  name: string;
  price: number;
  brand: string;
}

const SUGGESTIONS = ["Pijama", "Térmica", "Meias", "Algodão", "Criança", "Boxers"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (open) window.setTimeout(() => input.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpar sugestões
      setResults([]);
      setStatus("idle");
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const json = (await res.json()) as { results: Result[] };
        setResults(json.results);
        setStatus("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("error");
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  const go = (term: string) => {
    onClose();
    router.push(`/pesquisa?q=${encodeURIComponent(term)}`);
  };

  return (
    <Dialog id="pesquisa" open={open} onClose={onClose} title="Pesquisar na loja" variant="sheet" hideTitle>
      <div className="search">
        <form
          role="search"
          className="search__form"
          action="/pesquisa"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) go(q.trim());
          }}
        >
          <label htmlFor="search-input" className="visually-hidden">
            Pesquisar produtos
          </label>
          <input
            ref={input}
            id="search-input"
            name="q"
            type="search"
            className="search__input"
            placeholder="Pijama, meias térmicas…"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-controls={listId}
          />
          <button type="submit" className="icon-btn">
            <Icon name="arrow" label="Pesquisar" />
          </button>
        </form>

        <div id={listId} className="search__results" aria-live="polite">
          {status === "done" && results.length === 0 ? (
            <p className="muted">Sem resultados para “{q.trim()}”. Experimente outra palavra — por exemplo “algodão” ou “criança”.</p>
          ) : null}
          {status === "error" ? <p className="muted">Não foi possível pesquisar agora. Carregue em Enter para ver todos os resultados.</p> : null}
          {results.length ? (
            <ul role="list">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link href={`/produto/${r.slug}`} onClick={onClose}>
                    <span>
                      <span className="mono muted" style={{ display: "block" }}>
                        {r.brand}
                      </span>
                      {r.name}
                    </span>
                    <span className="price">{formatPrice(r.price)}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" className="link-arrow" style={{ marginTop: "var(--s-4)", background: "none", border: 0, borderBottom: "1px solid" }} onClick={() => go(q.trim())}>
                  Ver todos os resultados <Icon name="arrow" className="icon icon--sm" />
                </button>
              </li>
            </ul>
          ) : null}
        </div>

        {q.trim().length < 2 ? (
          <div>
            <p className="eyebrow" style={{ marginTop: "var(--s-5)" }}>
              Sugestões
            </p>
            <ul role="list" className="search__suggest">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" className="chip" onClick={() => go(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
