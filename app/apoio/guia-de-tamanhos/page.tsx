import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { getCatalog } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Guia de tamanhos",
  description: "Tabelas de tamanhos e como tirar as medidas: mulher, homem, criança e meias.",
  alternates: { canonical: "/apoio/guia-de-tamanhos" },
};

export default function SizeGuidePage() {
  const { sizeCharts } = getCatalog();
  const unverified = sizeCharts.some((c) => !c.verified);
  return (
    <>
      <PageHead
        eyebrow="Guia de tamanhos"
        title={
          <>
            Medir uma vez, acertar sempre
          </>
        }
        lede="As medidas são do corpo, não da peça. Use uma fita métrica, sem apertar, por cima de roupa interior leve."
      />
      <div className="wrap content">
        <nav className="content__nav" aria-label="Tabelas">
          <ul role="list">
            <li><a className="link" href="#medir">Como medir</a></li>
            {sizeCharts.map((c) => (
              <li key={c.id}><a className="link" href={`#t-${c.id}`}>{c.title.split(" — ")[0]}</a></li>
            ))}
          </ul>
        </nav>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--s-8)", minWidth: 0 }}>
          {unverified ? (
            <p className="notice notice--warn">Tabelas indicativas, a confirmar com as medidas de cada marca antes do lançamento.</p>
          ) : null}
          <section id="medir" className="prose" aria-labelledby="medir-t">
            <h2 id="medir-t" style={{ marginTop: 0 }}>Como medir</h2>
            <dl className="facts">
              <div><dt>Peito</dt><dd>À volta da zona mais saliente do peito, com a fita na horizontal.</dd></div>
              <div><dt>Cintura</dt><dd>À volta da zona mais estreita do tronco, um pouco acima do umbigo.</dd></div>
              <div><dt>Anca</dt><dd>À volta da zona mais larga das ancas, com os pés juntos.</dd></div>
              <div><dt>Criança</dt><dd>Altura, de pé e descalça, encostada a uma parede.</dd></div>
            </dl>
          </section>
          {sizeCharts.map((c) => (
            <section key={c.id} id={`t-${c.id}`} aria-label={c.title}>
              <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabela — deslize para ver todas as colunas">
                <table className="table">
                  <caption>{c.title}</caption>
                  <thead>
                    <tr>{c.columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {c.rows.map((r) => (
                      <tr key={r[0]}>{r.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="muted" style={{ marginTop: "var(--s-3)", fontSize: "var(--t-sm)" }}>{c.note}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
