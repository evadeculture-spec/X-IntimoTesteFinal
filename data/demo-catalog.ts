/**
 * ⚠️ CATÁLOGO DE DEMONSTRAÇÃO — NÃO É INVENTÁRIO REAL.
 *
 * Nomes, preços, cores, composições e stock são ILUSTRATIVOS e servem apenas para
 * desenvolver e testar a experiência. Este ficheiro só é usado quando
 * COMMERCE_CATALOG=demo (ou quando não há catálogo real). Nesse modo o site
 * mostra uma faixa de aviso, fica `noindex` e o pagamento online é desligado.
 *
 * O catálogo real vive em data/store-catalog.json (ver docs/LAUNCH.md).
 */
import type { CareCode, Colour, Product } from "@/lib/commerce/types";

const C = {
  noite: { id: "azul-noite", name: "Azul-noite", hex: "#26304A", family: "azul" },
  marinho: { id: "marinho", name: "Marinho", hex: "#1F2A44", family: "azul" },
  celeste: { id: "celeste", name: "Celeste", hex: "#A9BDD3", family: "azul" },
  cha: { id: "rosa-cha", name: "Rosa-chá", hex: "#DDB9A8", family: "rosa" },
  cru: { id: "cru", name: "Cru", hex: "#EADFCB", family: "cru" },
  branco: { id: "branco", name: "Branco", hex: "#F6F4EF", family: "branco" },
  preto: { id: "preto", name: "Preto", hex: "#1D1C1B", family: "preto" },
  mescla: { id: "cinzento-mescla", name: "Cinzento mescla", hex: "#9A9792", family: "cinzento" },
  grafite: { id: "grafite", name: "Grafite", hex: "#4A4846", family: "cinzento" },
  garrafa: { id: "verde-garrafa", name: "Verde-garrafa", hex: "#2F4A3A", family: "verde" },
  bordeaux: { id: "bordeaux", name: "Bordeaux", hex: "#6E2230", family: "vermelho" },
  tijolo: { id: "tijolo", name: "Tijolo", hex: "#A8432D", family: "vermelho" },
  camelo: { id: "camelo", name: "Camelo", hex: "#B08A63", family: "castanho" },
} satisfies Record<string, Colour>;

const ADULT_F = ["XS", "S", "M", "L", "XL", "XXL"];
const ADULT_M = ["S", "M", "L", "XL", "XXL"];
const KIDS = ["2A", "4A", "6A", "8A", "10A", "12A"];
const SOCKS = ["35/38", "39/42", "43/46"];
const SOCKS_KIDS = ["23/26", "27/30", "31/34"];

const CARE_COTTON: CareCode[] = ["lavar-40", "nao-lixivia", "secar-baixa", "passar-media", "nao-limpeza-seco"];
const CARE_DELICATE: CareCode[] = ["lavar-30", "nao-lixivia", "nao-secar-maquina", "passar-baixa", "nao-limpeza-seco"];
const CARE_THERMAL: CareCode[] = ["lavar-30", "nao-lixivia", "nao-secar-maquina", "nao-passar", "nao-limpeza-seco"];

/** Stock determinístico e variado (inclui esgotados e últimas unidades) para testar estados. */
function demoStock(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const r = h % 10;
  if (r === 0) return 0;
  if (r <= 2) return 1 + (h % 3);
  return 4 + (h % 12);
}

type Draft = Omit<Product, "variants" | "images" | "ref"> & { images?: Product["images"] };

function product(draft: Draft, index: number): Product {
  const variants = draft.colours.flatMap((colour) =>
    draft.sizes.map((size) => {
      const sku = `${draft.slug}-${colour.id}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
      return { sku, colourId: colour.id, size, stock: demoStock(sku) };
    }),
  );
  return {
    ...draft,
    ref: `DEMO-${String(index + 1).padStart(3, "0")}`,
    images: draft.images ?? [],
    variants,
  };
}

const drafts: Draft[] = [
  {
    slug: "pijama-algodao-riscas-mulher",
    name: "Pijama de algodão às riscas",
    brandId: "isa",
    categoryId: "pijamas",
    audience: "mulher",
    garment: "pijama",
    weave: "malha",
    price: 2990,
    summary: "Camisa de botões e calça comprida, em malha de algodão leve.",
    description:
      "Um pijama clássico de duas peças: camisa com gola e botões, calça com cós elástico e cordão. A malha de algodão é macia e respira, para as noites de meia-estação.",
    composition: ["100% algodão"],
    care: CARE_COTTON,
    fit: "Corte direito, folgado. Se gosta de um caimento mais justo, escolha um tamanho abaixo.",
    details: ["Camisa com cinco botões", "Calça com cós elástico e cordão", "Bolso no peito"],
    colours: [C.noite, C.cha],
    sizes: ADULT_F.slice(1, 5),
    sizeChartId: "mulher",
    isNew: true,
    publishedAt: "2026-10-10",
  },
  {
    slug: "pijama-flanela-xadrez-homem",
    name: "Pijama de flanela xadrez",
    brandId: "isa",
    categoryId: "pijamas",
    audience: "homem",
    garment: "pijama",
    weave: "flanela",
    price: 3490,
    summary: "Flanela de algodão escovada, quente sem pesar.",
    description:
      "Flanela de algodão escovada dos dois lados, para as noites frias. Camisa de botões com gola clássica e calça com cós elástico.",
    composition: ["100% algodão flanelado"],
    care: CARE_COTTON,
    fit: "Corte clássico, com folga nos ombros.",
    details: ["Gola de pijama clássica", "Punhos simples", "Calça com braguilha de botão"],
    colours: [C.garrafa, C.grafite],
    sizes: ADULT_M.slice(1),
    sizeChartId: "homem",
    publishedAt: "2026-09-20",
  },
  {
    slug: "camisa-de-noite-modal",
    name: "Camisa de noite em modal",
    brandId: "isa",
    categoryId: "pijamas",
    audience: "mulher",
    garment: "camisa-noite",
    weave: "liso",
    price: 2490,
    summary: "Modal fluido, alças largas e comprimento a meio da perna.",
    description:
      "Uma camisa de noite simples e fresca em modal, uma fibra de origem vegetal com toque sedoso. Alças largas, decote redondo e comprimento a meio da perna.",
    composition: ["92% modal", "8% elastano"],
    care: CARE_DELICATE,
    fit: "Caimento solto. Fica a meio da perna num corpo de altura média.",
    colours: [C.cru, C.preto],
    sizes: ADULT_F.slice(1, 5),
    sizeChartId: "mulher",
    isNew: true,
    publishedAt: "2026-10-14",
  },
  {
    slug: "robe-polar-mulher",
    name: "Robe polar com cinto",
    brandId: "isa",
    categoryId: "pijamas",
    audience: "mulher",
    garment: "robe",
    weave: "flanela",
    price: 3990,
    compareAtPrice: 4490,
    summary: "Robe comprido em polar macio, com bolsos e cinto.",
    description:
      "Para vestir por cima do pijama nas manhãs frias. Polar macio, gola xaile, dois bolsos de chapa e cinto da mesma cor.",
    composition: ["100% poliéster (polar)"],
    care: CARE_THERMAL,
    fit: "Corte amplo. Pensado para vestir por cima de outra peça.",
    details: ["Gola xaile", "Dois bolsos de chapa", "Cinto com passadores"],
    colours: [C.cha, C.noite],
    sizes: ["S", "M", "L", "XL"],
    sizeChartId: "mulher",
    publishedAt: "2026-09-02",
  },
  {
    slug: "pijama-crianca-estrelas",
    name: "Pijama de criança estrelas",
    brandId: "isa",
    categoryId: "pijamas",
    audience: "crianca",
    garment: "pijama",
    weave: "malha",
    price: 1990,
    summary: "Algodão interlock com estampado de estrelas pequenas.",
    description:
      "Pijama de duas peças em algodão interlock, espesso e elástico, que aguenta muitas lavagens. Camisola de manga comprida e calça com punho.",
    composition: ["100% algodão interlock"],
    care: CARE_COTTON,
    colours: [C.celeste, C.cru],
    sizes: KIDS,
    sizeChartId: "crianca",
    publishedAt: "2026-08-28",
  },
  {
    slug: "top-canelado-sem-aro",
    name: "Top canelado sem aro",
    brandId: "ysabel-mora",
    categoryId: "interiores",
    audience: "mulher",
    garment: "top",
    weave: "canelado",
    price: 1290,
    summary: "Malha canelada elástica, suporte suave, sem aro nem fechos.",
    description:
      "Um top para todos os dias: sem aro, sem fechos e sem costuras laterais que se notem. A malha canelada adapta-se ao corpo e dá um suporte leve.",
    composition: ["92% algodão", "8% elastano"],
    care: CARE_DELICATE,
    fit: "Ajustado. Suporte leve, indicado para peito pequeno a médio.",
    details: ["Sem aro", "Alças fixas", "Elástico macio por baixo do peito"],
    colours: [C.preto, C.cru, C.cha],
    sizes: ADULT_F.slice(0, 5),
    sizeChartId: "mulher",
    isNew: true,
    publishedAt: "2026-10-18",
  },
  {
    slug: "cuecas-algodao-pack-3",
    name: "Cuecas de algodão, pack de 3",
    brandId: "ysabel-mora",
    categoryId: "interiores",
    audience: "mulher",
    garment: "cueca",
    weave: "malha",
    price: 990,
    summary: "Corte clássico de cintura média, em malha de algodão.",
    description:
      "Três cuecas de corte clássico, de cintura média e cobertura total. Algodão com um pouco de elastano para manter a forma.",
    composition: ["95% algodão", "5% elastano"],
    care: CARE_COTTON,
    fit: "Cintura média, cobertura total.",
    colours: [C.branco, C.preto, C.mescla],
    sizes: ADULT_F.slice(1),
    sizeChartId: "mulher",
    publishedAt: "2026-07-15",
  },
  {
    slug: "boxers-algodao-pack-2",
    name: "Boxers de algodão, pack de 2",
    brandId: "ysabel-mora",
    categoryId: "interiores",
    audience: "homem",
    garment: "boxer",
    weave: "malha",
    price: 1490,
    summary: "Boxer de perna média, cós elástico macio.",
    description:
      "Dois boxers de perna média em algodão elástico. Cós revestido, que não marca, e costuras planas.",
    composition: ["95% algodão", "5% elastano"],
    care: CARE_COTTON,
    fit: "Ajustado, perna média.",
    colours: [C.preto, C.marinho, C.mescla],
    sizes: ADULT_M,
    sizeChartId: "homem",
    publishedAt: "2026-08-05",
  },
  {
    slug: "slips-homem-pack-3",
    name: "Slips de homem, pack de 3",
    brandId: "ysabel-mora",
    categoryId: "interiores",
    audience: "homem",
    garment: "cueca",
    weave: "canelado",
    price: 1190,
    summary: "Slip clássico em malha canelada de algodão.",
    description: "Três slips de corte clássico em malha canelada de algodão, com cós macio.",
    composition: ["100% algodão"],
    care: CARE_COTTON,
    colours: [C.branco, C.preto],
    sizes: ADULT_M,
    sizeChartId: "homem",
    publishedAt: "2026-06-20",
  },
  {
    slug: "camisola-termica-mulher",
    name: "Camisola térmica de manga comprida",
    brandId: "ysabel-mora",
    categoryId: "termica",
    audience: "mulher",
    garment: "camisola",
    weave: "favo",
    price: 1490,
    summary: "Camada base fina, que guarda o calor e não se vê por baixo da roupa.",
    description:
      "Camisola térmica de decote redondo, fina o suficiente para usar por baixo de uma camisa. A malha retém o calor do corpo sem fazer volume.",
    composition: ["60% poliamida", "35% viscose", "5% elastano"],
    care: CARE_THERMAL,
    fit: "Justa ao corpo — é assim que funciona melhor.",
    colours: [C.cru, C.preto],
    sizes: ADULT_F.slice(1, 5),
    sizeChartId: "mulher",
    publishedAt: "2026-10-01",
  },
  {
    slug: "leggings-termicas-mulher",
    name: "Leggings térmicas",
    brandId: "ysabel-mora",
    categoryId: "termica",
    audience: "mulher",
    garment: "leggings",
    weave: "favo",
    price: 1690,
    summary: "Interior escovado e cós alto, para usar sozinhas ou por baixo.",
    description:
      "Leggings térmicas de cós alto com o interior escovado. Usam-se por baixo de calças ou com uma camisola comprida.",
    composition: ["88% poliéster", "12% elastano"],
    care: CARE_THERMAL,
    fit: "Justas, cós alto.",
    colours: [C.preto, C.grafite],
    sizes: ADULT_F.slice(1, 5),
    sizeChartId: "mulher",
    publishedAt: "2026-09-25",
  },
  {
    slug: "camisola-termica-homem",
    name: "Camisola térmica de homem",
    brandId: "ysabel-mora",
    categoryId: "termica",
    audience: "homem",
    garment: "camisola",
    weave: "favo",
    price: 1690,
    summary: "Manga comprida, decote redondo e malha favo que retém o calor.",
    description:
      "Camisola térmica de homem, de manga comprida. A malha favo cria pequenas bolsas de ar que guardam o calor.",
    composition: ["70% algodão", "30% poliéster"],
    care: CARE_THERMAL,
    fit: "Ajustada.",
    colours: [C.mescla, C.preto, C.camelo],
    sizes: ADULT_M,
    sizeChartId: "homem",
    isNew: true,
    publishedAt: "2026-10-12",
  },
  {
    slug: "ceroulas-termicas-homem",
    name: "Ceroulas térmicas",
    brandId: "ysabel-mora",
    categoryId: "termica",
    audience: "homem",
    garment: "leggings",
    weave: "favo",
    price: 1690,
    summary: "Calça térmica interior, com punho no tornozelo.",
    description: "Ceroulas térmicas em malha favo, com cós elástico largo e punho no tornozelo.",
    composition: ["70% algodão", "30% poliéster"],
    care: CARE_THERMAL,
    colours: [C.mescla, C.preto],
    sizes: ADULT_M,
    sizeChartId: "homem",
    publishedAt: "2026-09-10",
  },
  {
    slug: "meias-termicas",
    name: "Meias térmicas",
    brandId: "ysabel-mora",
    categoryId: "meias",
    audience: "unissexo",
    garment: "meia",
    weave: "canelado",
    price: 750,
    summary: "Meia de cano médio com interior felpudo.",
    description:
      "Meias térmicas de cano médio com o interior felpudo e um punho que não aperta. Para casa, para a rua e para dormir.",
    composition: ["75% acrílico", "22% poliamida", "3% elastano"],
    care: CARE_THERMAL,
    colours: [C.mescla, C.cru, C.tijolo],
    sizes: SOCKS,
    sizeChartId: "meias",
    isNew: true,
    publishedAt: "2026-10-16",
  },
  {
    slug: "meias-algodao-pack-3",
    name: "Meias de algodão, pack de 3",
    brandId: "ysabel-mora",
    categoryId: "meias",
    audience: "unissexo",
    garment: "meia",
    weave: "malha",
    price: 890,
    summary: "Três pares de meia clássica, de cano médio, em algodão penteado.",
    description: "Meia clássica de algodão penteado, com reforço no calcanhar e na biqueira.",
    composition: ["80% algodão", "18% poliamida", "2% elastano"],
    care: CARE_COTTON,
    colours: [C.preto, C.marinho, C.bordeaux],
    sizes: SOCKS,
    sizeChartId: "meias",
    publishedAt: "2026-07-30",
  },
  {
    slug: "meias-crianca-antiderrapantes",
    name: "Meias de criança antiderrapantes",
    brandId: "ysabel-mora",
    categoryId: "meias",
    audience: "crianca",
    garment: "meia",
    weave: "canelado",
    price: 590,
    summary: "Sola com pontos antiderrapantes, para andar em casa.",
    description: "Meias de algodão com pontos antiderrapantes na sola, para os primeiros passos e para andar em casa.",
    composition: ["78% algodão", "20% poliamida", "2% elastano"],
    care: CARE_COTTON,
    colours: [C.celeste, C.cha],
    sizes: SOCKS_KIDS,
    sizeChartId: "meias",
    publishedAt: "2026-08-12",
  },
];

export const DEMO_PRODUCTS: Product[] = drafts.map(product);
