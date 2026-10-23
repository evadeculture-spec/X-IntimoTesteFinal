import type { ShippingMethod } from "@/lib/commerce/types";

/**
 * Dados da empresa e regras comerciais.
 *
 * `null` = POR CONFIRMAR. Enquanto um campo estiver a `null`, o site mostra
 * "por confirmar" no lugar do valor e `npm run check:launch` assinala-o.
 * Não inventar valores: preencher apenas com dados verificados.
 */
export const BUSINESS = {
  brandName: "X Íntimo",
  /** Denominação social completa (ex.: "Nome, Lda."). */
  legalName: null as string | null,
  /** NIPC / NIF da empresa. */
  nipc: null as string | null,
  /** Morada da loja física / sede. */
  address: null as string | null,
  /** Horário da loja física. */
  openingHours: null as string | null,
  email: null as string | null,
  /** Telefone para mostrar ao público, ex.: "+351 2xx xxx xxx". */
  phone: null as string | null,
  /** Número de WhatsApp em formato internacional só com dígitos, ex.: "3519xxxxxxxx". */
  whatsapp: null as string | null,
  instagram: null as string | null,
  facebook: null as string | null,
  /**
   * Entidade de Resolução Alternativa de Litígios de consumo (Lei 144/2015).
   * Depende da localização da loja — confirmar com o jurista/contabilista.
   */
  ralEntity: null as { name: string; url: string } | null,
} as const;

/** Política comercial — preencher com as regras reais da loja. */
export const POLICIES = {
  /** Dias para devolução (o mínimo legal para compras online é 14 dias). */
  returnDays: null as number | null,
  /** Quem paga os portes da devolução. */
  returnShippingPaidBy: null as "cliente" | "loja" | null,
  /** Prazo de envio após confirmação, em dias úteis, ex.: "2 a 4". */
  dispatchTime: null as string | null,
  /** Peças íntimas por higiene: condições de devolução (selo, embalagem). */
  hygieneNote: null as string | null,
};

/**
 * Métodos de entrega REAIS. Vazio = ainda não configurado:
 * o pagamento online fica desligado e os portes aparecem como "a confirmar".
 */
export const SHIPPING_METHODS: ShippingMethod[] = [];

/**
 * Métodos de entrega usados SÓ no modo demonstração, para testar o checkout.
 * Valores ilustrativos — não são as tarifas da loja.
 */
export const DEMO_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "envio-continente",
    label: "Envio para casa — Continente",
    description: "Valor ilustrativo (modo demonstração).",
    price: 395,
    freeFrom: 5000,
    regions: ["continente"],
  },
  {
    id: "envio-ilhas",
    label: "Envio para casa — Madeira e Açores",
    description: "Valor ilustrativo (modo demonstração).",
    price: 795,
    regions: ["madeira", "acores"],
  },
  {
    id: "levantamento",
    label: "Levantamento na loja",
    description: "Sem custos. Avisamos quando estiver pronto.",
    price: 0,
    regions: "pickup",
  },
];
