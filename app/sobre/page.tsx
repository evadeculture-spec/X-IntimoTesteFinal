import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";
import { Pending } from "@/components/ui/Pending";
import { BUSINESS } from "@/data/store";
import { getCatalog } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A X Íntimo: loja de interiores, pijamas, roupa térmica e meias.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  const { brands, mode } = getCatalog();
  return (
    <>
      <PageHead
        eyebrow="Sobre"
        title={
          <>
            Uma loja de primeira camada
          </>
        }
      />
      <div className="wrap content">
        <nav className="content__nav" aria-label="Nesta página">
          <ul role="list">
            <li><a className="link" href="#loja">A loja</a></li>
            <li><a className="link" href="#marcas">As marcas</a></li>
            <li><a className="link" href="#demonstracao">Sobre este site</a></li>
          </ul>
        </nav>
        <div className="prose">
          {/* ⚠️ CONTEÚDO A ESCREVER COM A FAMÍLIA: história verdadeira da loja (ano de abertura, cidade, quem atende). Não inventar. */}
          <h2 id="loja" style={{ marginTop: 0 }}>A loja</h2>
          <p>
            A X Íntimo vende interiores, pijamas, roupa térmica e meias para mulher, homem e criança. Escolhemos as peças pelo tecido,
            pelo corte e pela forma como aguentam o uso — e conhecemos os tamanhos de cada marca, para o poder aconselhar.
          </p>
          <p>
            A loja física fica em <Pending value={BUSINESS.address} label="morada por confirmar" />. A loja online leva a mesma
            seleção até sua casa.
          </p>
          <p className="notice notice--warn">
            História da loja por escrever: este texto deve ser completado com a família (desde quando existe, onde, quem atende).
          </p>

          <h2 id="marcas">As marcas</h2>
          <ul>
            {brands.map((b) => (
              <li key={b.id}>
                <Link className="link" href={`/loja?marca=${b.id}`}>{b.name}</Link> — {b.description}
              </li>
            ))}
          </ul>

          <h2 id="demonstracao">Sobre este site</h2>
          {mode === "demo" ? (
            <p>
              Está a ver o site em <b>modo demonstração</b>. Os produtos, preços, cores, composições e stock são ilustrativos e servem
              para testar a experiência de compra. Não há pagamentos e nenhuma encomenda é enviada à loja sem que o próprio cliente envie
              a mensagem. As imagens dos produtos são desenhos técnicos, não fotografias.
            </p>
          ) : (
            <p>Os preços incluem IVA. As imagens dos produtos sem fotografia são desenhos técnicos ilustrativos.</p>
          )}
        </div>
      </div>
    </>
  );
}
