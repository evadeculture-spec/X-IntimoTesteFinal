import type { CareCode } from "@/lib/commerce/types";

/** Símbolos de conservação (desenho simplificado dos pictogramas ISO 3758). */
const LABELS: Record<CareCode, string> = {
  "lavar-30": "Lavar a 30 °C",
  "lavar-40": "Lavar a 40 °C",
  "lavar-mao": "Lavar à mão",
  "nao-lixivia": "Não usar lixívia",
  "secar-baixa": "Máquina de secar, temperatura baixa",
  "nao-secar-maquina": "Não usar máquina de secar",
  "passar-baixa": "Passar a ferro, temperatura baixa",
  "passar-media": "Passar a ferro, temperatura média",
  "nao-passar": "Não passar a ferro",
  "nao-limpeza-seco": "Não limpar a seco",
};

const CROSS = <path d="M6 6 30 30M30 6 6 30" />;
const TUB = <path d="M4 10l3 18h22l3-18M4 10c3 3 6 3 8 0 2 3 5 3 8 0 2 3 5 3 8 0 2 3 3 3 4 0" />;
const IRON = <path d="M5 27h26l-2-10c-.6-3-3-5-6-5H11c-2 0-3 1-3 2" />;

function Glyph({ code }: { code: CareCode }) {
  switch (code) {
    case "lavar-30":
    case "lavar-40":
      return (
        <>
          {TUB}
          <text x="18" y="24" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontFamily="var(--f-mono)">
            {code === "lavar-30" ? "30" : "40"}
          </text>
        </>
      );
    case "lavar-mao":
      return (
        <>
          {TUB}
          <path d="M14 22c0-4 2-6 4-6s3 2 3 4" />
        </>
      );
    case "nao-lixivia":
      return (
        <>
          <path d="M18 5 32 30H4L18 5Z" />
          {CROSS}
        </>
      );
    case "secar-baixa":
    case "nao-secar-maquina":
      return (
        <>
          <rect x="5" y="5" width="26" height="26" />
          <circle cx="18" cy="18" r="9" />
          {code === "secar-baixa" ? <circle cx="18" cy="18" r="1.6" fill="currentColor" /> : CROSS}
        </>
      );
    case "passar-baixa":
    case "passar-media":
    case "nao-passar":
      return (
        <>
          {IRON}
          {code === "passar-baixa" ? <circle cx="18" cy="21" r="1.4" fill="currentColor" /> : null}
          {code === "passar-media" ? (
            <>
              <circle cx="15" cy="21" r="1.4" fill="currentColor" />
              <circle cx="21" cy="21" r="1.4" fill="currentColor" />
            </>
          ) : null}
          {code === "nao-passar" ? CROSS : null}
        </>
      );
    case "nao-limpeza-seco":
      return (
        <>
          <circle cx="18" cy="18" r="12" />
          {CROSS}
        </>
      );
  }
}

export function CareSymbols({ codes }: { codes: CareCode[] }) {
  return (
    <ul role="list" className="care-label__symbols">
      {codes.map((c) => (
        <li key={c}>
          <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <Glyph code={c} />
          </svg>
          <span>{LABELS[c]}</span>
        </li>
      ))}
    </ul>
  );
}
