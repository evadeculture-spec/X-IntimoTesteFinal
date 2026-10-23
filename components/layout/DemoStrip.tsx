import Link from "next/link";

export function DemoStrip() {
  return (
    <div className="demo-strip" role="note">
      <div className="wrap">
        <span>
          <strong>
            <span className="demo-strip__long">Modo </span>demonstração
          </strong>
          <span className="demo-strip__long"> — produtos, preços e stock são ilustrativos. Não são cobrados pagamentos.</span>
          <span className="visually-hidden-desktop"> · dados ilustrativos</span>
        </span>
        <Link href="/sobre#demonstracao">Saber mais</Link>
      </div>
    </div>
  );
}
