import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap not-found">
      <p className="eyebrow">Erro 404</p>
      <p className="display">
        Gaveta <em>vazia.</em>
      </p>
      <h1 className="lede">Esta página não existe ou mudou de sítio.</h1>
      <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
        <Link href="/loja" className="btn">Ver a loja</Link>
        <Link href="/" className="btn btn--outline">Página inicial</Link>
      </div>
    </div>
  );
}
