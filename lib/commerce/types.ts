/**
 * Modelo de dados do comércio.
 * Valores monetários são sempre inteiros em cêntimos de euro (EUR).
 */

export type Cents = number;

export type CategoryId = "pijamas" | "interiores" | "termica" | "meias";
export type Audience = "mulher" | "homem" | "crianca" | "unissexo";

/** Tipo de peça — determina o desenho técnico usado enquanto não há fotografia. */
export type GarmentKind =
  | "pijama"
  | "robe"
  | "camisa-noite"
  | "top"
  | "cueca"
  | "boxer"
  | "camisola"
  | "leggings"
  | "meia";

/** Textura de tecido usada nas amostras (placeholders) e nas faixas da homepage. */
export type Weave = "canelado" | "flanela" | "favo" | "malha" | "liso";

export type ColourFamily =
  | "preto"
  | "branco"
  | "cru"
  | "cinzento"
  | "azul"
  | "rosa"
  | "vermelho"
  | "verde"
  | "castanho"
  | "estampado";

export interface Colour {
  id: string;
  name: string;
  hex: string;
  family: ColourFamily;
}

/** Símbolos de conservação (ISO 3758). */
export type CareCode =
  | "lavar-30"
  | "lavar-40"
  | "lavar-mao"
  | "nao-lixivia"
  | "secar-baixa"
  | "nao-secar-maquina"
  | "passar-baixa"
  | "passar-media"
  | "nao-passar"
  | "nao-limpeza-seco";

export interface Variant {
  sku: string;
  colourId: string;
  size: string;
  /** Unidades disponíveis. `null` = stock não controlado (confirmado na encomenda). */
  stock: number | null;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  colourId?: string;
}

export interface Product {
  slug: string;
  ref: string;
  name: string;
  brandId: string;
  categoryId: CategoryId;
  audience: Audience;
  garment: GarmentKind;
  weave: Weave;
  price: Cents;
  /** Preço anterior — só preencher quando existe uma redução real. */
  compareAtPrice?: Cents;
  summary: string;
  description: string;
  composition: string[];
  care: CareCode[];
  fit?: string;
  details?: string[];
  colours: Colour[];
  /** Tamanhos por ordem de apresentação. */
  sizes: string[];
  variants: Variant[];
  sizeChartId: string;
  images: ProductImage[];
  isNew?: boolean;
  /** ISO date — usado para ordenar "Novidades". */
  publishedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  /** Linha curta, tom editorial. */
  tagline: string;
  description: string;
  weave: Weave;
  /** Token de cor da família (ver styles/tokens.css). */
  tone: "noite" | "cha" | "aveia" | "rubi";
}

export interface SizeChart {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
  note: string;
  /** false enquanto a tabela não for confirmada com as fichas das marcas. */
  verified: boolean;
}

export type CatalogMode = "demo" | "store";

export interface Catalog {
  mode: CatalogMode;
  products: Product[];
  brands: Brand[];
  categories: Category[];
  sizeCharts: SizeChart[];
}

/* ---------- Saco & encomendas ---------- */

export interface CartLine {
  sku: string;
  slug: string;
  name: string;
  brandName: string;
  colourName: string;
  colourHex: string;
  size: string;
  garment: GarmentKind;
  weave: Weave;
  imageSrc?: string;
  /** Preço unitário visto pelo cliente (recalculado no servidor). */
  unitPrice: Cents;
  quantity: number;
  /** Máximo encomendável no momento em que foi adicionado. */
  max: number;
}

export type ShippingRegion = "continente" | "madeira" | "acores";

export interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  price: Cents;
  /** Portes grátis a partir deste subtotal (opcional). */
  freeFrom?: Cents;
  regions: ShippingRegion[] | "pickup";
}
