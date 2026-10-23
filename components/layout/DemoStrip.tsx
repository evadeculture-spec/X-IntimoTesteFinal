import Link from "next/link";

export function DemoStrip() {
  return (
    <div className="demo-strip" role="note">
      <div className="wrap">
        <span>
          <strong>Modo demonstração</strong> — produtos, preços e stock são ilustrativos.
        </span>
        <span>
          Não são cobrados pagamentos. <Link href="/sobre#demonstracao">Saber mais</Link>
        </span>
      </div>
    </div>
  );
}
