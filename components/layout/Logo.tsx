/**
 * Logótipo X Íntimo — círculo tijolo + "X" em pincelada + "Intimo" em serifa.
 * Redesenhado em vetor a partir da identidade existente (ver versão anterior do site).
 * ⚠️ Substituir pela arte final oficial quando estiver disponível.
 */
export function LogoMark({ className = "logo__mark" }: { className?: string }) {
  return (
    <svg viewBox="0 0 118 108" className={className} aria-hidden="true" focusable="false">
      <circle cx="50" cy="55" r="41" fill="#B5341F" />
      <g stroke="#1B1917" strokeWidth="15" strokeLinecap="round" fill="none">
        <path d="M23 15 Q54 55 86 95" />
        <path d="M88 17 Q50 55 12 101" />
      </g>
      <circle cx="12" cy="101" r="5" fill="#1B1917" />
    </svg>
  );
}

export function Logo() {
  return (
    <>
      <LogoMark />
      <span className="logo__word">Intimo</span>
    </>
  );
}
