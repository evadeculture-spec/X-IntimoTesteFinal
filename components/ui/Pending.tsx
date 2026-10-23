/**
 * Mostra um valor de negócio, ou "por confirmar" quando ainda não foi definido
 * em data/store.ts. Torna visível o que falta antes do lançamento.
 */
export function Pending({ value, label = "por confirmar", children }: { value: unknown; label?: string; children?: React.ReactNode }) {
  if (value === null || value === undefined || value === "") {
    return (
      <span className="pending" title="Informação a confirmar pela loja antes do lançamento">
        {label}
      </span>
    );
  }
  return <>{children ?? String(value)}</>;
}
