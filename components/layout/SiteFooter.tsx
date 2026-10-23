import Link from "next/link";
import { BUSINESS } from "@/data/store";
import { CATEGORIES } from "@/data/taxonomy";
import { Pending } from "@/components/ui/Pending";
import { LogoMark } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer on-dark">
      <div className="wrap">
        <div className="site-footer__top">
          <div className="site-footer__lead">
            <LogoMark className="logo__mark" />
            <p className="display" style={{ marginTop: "var(--s-4)" }}>
              Tudo o que se veste <em>primeiro.</em>
            </p>
          </div>
          <div className="site-footer__cols">
            <div>
              <h2>Loja</h2>
              <ul role="list">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <Link href={`/loja/${c.id}`}>{c.name}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/loja">Toda a loja</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2>Apoio</h2>
              <ul role="list">
                <li>
                  <Link href="/apoio/guia-de-tamanhos">Guia de tamanhos</Link>
                </li>
                <li>
                  <Link href="/apoio#envios">Envios</Link>
                </li>
                <li>
                  <Link href="/apoio#devolucoes">Trocas e devoluções</Link>
                </li>
                <li>
                  <Link href="/apoio#pagamentos">Pagamentos</Link>
                </li>
                <li>
                  <Link href="/contactos">Contactos</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2>Informação legal</h2>
              <ul role="list">
                <li>
                  <Link href="/legal/termos">Termos e condições</Link>
                </li>
                <li>
                  <Link href="/legal/privacidade">Política de privacidade</Link>
                </li>
                <li>
                  <Link href="/legal/cookies">Cookies</Link>
                </li>
                <li>
                  <Link href="/legal/litigios">Resolução de litígios</Link>
                </li>
                <li>
                  <a href="https://www.livroreclamacoes.pt/Inicio/" rel="noopener" target="_blank">
                    Livro de Reclamações<span className="visually-hidden"> (abre numa nova janela)</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2>A loja</h2>
              <ul role="list">
                <li>
                  <Link href="/sobre">Sobre a X Íntimo</Link>
                </li>
                <li>
                  <Pending value={BUSINESS.address} label="morada por confirmar" />
                </li>
                <li>
                  <Pending value={BUSINESS.openingHours} label="horário por confirmar" />
                </li>
                <li>
                  {BUSINESS.email ? <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> : <Pending value={null} label="email por confirmar" />}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="site-footer__base">
          <p>
            © {year} <Pending value={BUSINESS.legalName} label="denominação social por confirmar" /> ·{" "}
            NIPC <Pending value={BUSINESS.nipc} />
          </p>
          <p>Preços em euros, com IVA incluído.</p>
        </div>
      </div>
    </footer>
  );
}
