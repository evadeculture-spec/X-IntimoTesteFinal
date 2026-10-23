import type { Brand, Category, SizeChart } from "@/lib/commerce/types";

/** Famílias de produto que a X Íntimo vende. */
export const CATEGORIES: Category[] = [
  {
    id: "pijamas",
    name: "Pijamas",
    tagline: "Para a noite",
    description:
      "Pijamas, camisas de noite e robes para mulher, homem e criança. Tecidos que se escolhem pelo toque.",
    weave: "flanela",
    tone: "noite",
  },
  {
    id: "interiores",
    name: "Interiores",
    tagline: "Para todos os dias",
    description:
      "Cuecas, boxers, tops e soutiens de uso diário. O essencial que não se nota — e se sente.",
    weave: "canelado",
    tone: "cha",
  },
  {
    id: "termica",
    name: "Roupa térmica",
    tagline: "Para o frio",
    description:
      "Camisolas e leggings térmicas: a camada que fica por baixo e guarda o calor.",
    weave: "favo",
    tone: "aveia",
  },
  {
    id: "meias",
    name: "Meias",
    tagline: "Para os pés",
    description: "Meias de algodão, térmicas e de criança, por pares ou em pack.",
    weave: "malha",
    tone: "rubi",
  },
];

export const AUDIENCES = [
  { id: "mulher", name: "Mulher" },
  { id: "homem", name: "Homem" },
  { id: "crianca", name: "Criança" },
  { id: "unissexo", name: "Unissexo" },
] as const;

/** Marcas revendidas (fonte: versão anterior do site). Descrições neutras. */
export const BRANDS: Brand[] = [
  {
    id: "isa",
    name: "Pijamas Isa",
    description: "Pijamas e roupa de dormir para mulher, homem e criança.",
  },
  {
    id: "ysabel-mora",
    name: "Ysabel Mora",
    description: "Interiores, roupa térmica e meias.",
  },
];

/**
 * Tabelas de tamanhos INDICATIVAS (EN 13402, valores correntes no mercado).
 * ⚠️ Confirmar com as fichas de cada marca antes do lançamento e passar
 * `verified` a `true`.
 */
export const SIZE_CHARTS: SizeChart[] = [
  {
    id: "mulher",
    title: "Mulher — interiores, pijamas e térmica",
    columns: ["Tamanho", "Equivalência", "Peito (cm)", "Cintura (cm)", "Anca (cm)"],
    rows: [
      ["XS", "34", "78–82", "60–64", "86–90"],
      ["S", "36–38", "82–88", "64–70", "90–96"],
      ["M", "40–42", "88–96", "70–78", "96–104"],
      ["L", "44", "96–104", "78–86", "104–110"],
      ["XL", "46–48", "104–112", "86–94", "110–118"],
      ["XXL", "50–52", "112–122", "94–104", "118–128"],
    ],
    note: "Se estiver entre dois tamanhos, nos pijamas escolha o maior; nos interiores e na térmica, o que corresponder à anca.",
    verified: false,
  },
  {
    id: "homem",
    title: "Homem — interiores, pijamas e térmica",
    columns: ["Tamanho", "Peito (cm)", "Cintura (cm)"],
    rows: [
      ["S", "88–94", "74–80"],
      ["M", "94–100", "80–86"],
      ["L", "100–106", "86–94"],
      ["XL", "106–114", "94–102"],
      ["XXL", "114–122", "102–110"],
    ],
    note: "Medidas do corpo, não da peça. Meça por cima de roupa interior leve.",
    verified: false,
  },
  {
    id: "crianca",
    title: "Criança — pijamas",
    columns: ["Tamanho", "Altura (cm)", "Idade aproximada"],
    rows: [
      ["2A", "86–92", "18–24 meses"],
      ["4A", "98–104", "3–4 anos"],
      ["6A", "110–116", "5–6 anos"],
      ["8A", "122–128", "7–8 anos"],
      ["10A", "134–140", "9–10 anos"],
      ["12A", "146–152", "11–12 anos"],
    ],
    note: "Escolha pela altura, não pela idade.",
    verified: false,
  },
  {
    id: "meias",
    title: "Meias — correspondência com o calçado",
    columns: ["Tamanho", "Número de calçado"],
    rows: [
      ["23/26", "23 a 26"],
      ["27/30", "27 a 30"],
      ["31/34", "31 a 34"],
      ["35/38", "35 a 38"],
      ["39/42", "39 a 42"],
      ["43/46", "43 a 46"],
    ],
    note: "As meias são vendidas por intervalos de número de calçado.",
    verified: false,
  },
];
