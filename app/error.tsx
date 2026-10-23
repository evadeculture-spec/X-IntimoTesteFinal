"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[erro]", error.digest ?? error.message);
  }, [error]);
  return (
    <div className="wrap not-found">
      <p className="eyebrow">Erro</p>
      <h1 className="display" style={{ fontSize: "var(--t-2xl)" }}>
        Algo correu <em>mal.</em>
      </h1>
      <p className="lede">Não conseguimos carregar esta página. O seu saco continua guardado.</p>
      <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={reset}>Tentar novamente</button>
        <Link href="/" className="btn btn--outline">Página inicial</Link>
      </div>
    </div>
  );
}
