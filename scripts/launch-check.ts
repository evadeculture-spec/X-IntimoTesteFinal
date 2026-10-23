/**
 * Verificação de prontidão para lançamento: lista o que falta configurar.
 * Uso: npm run check:launch   (sai com código 1 se houver bloqueios)
 */
import { readFileSync } from "node:fs";
import { BUSINESS, POLICIES, SHIPPING_METHODS } from "../data/store.ts";
import { SIZE_CHARTS } from "../data/taxonomy.ts";

const blockers: string[] = [];
const warnings: string[] = [];

const catalog = JSON.parse(readFileSync(new URL("../data/store-catalog.json", import.meta.url), "utf8")) as { products: { slug: string; images?: unknown[] }[] };
const mode = process.env.COMMERCE_CATALOG ?? (catalog.products.length ? "store" : "demo");

if (mode === "demo") blockers.push("Catálogo real vazio (data/store-catalog.json) ou COMMERCE_CATALOG=demo — o site está em modo demonstração.");
const noPhotos = catalog.products.filter((p) => !p.images?.length).length;
if (noPhotos) warnings.push(`${noPhotos} produto(s) sem fotografia (é mostrado o desenho técnico).`);

const required: [string, unknown][] = [
  ["BUSINESS.legalName (denominação social)", BUSINESS.legalName],
  ["BUSINESS.nipc", BUSINESS.nipc],
  ["BUSINESS.address", BUSINESS.address],
  ["BUSINESS.email", BUSINESS.email],
  ["BUSINESS.ralEntity (entidade RAL)", BUSINESS.ralEntity],
  ["POLICIES.returnDays", POLICIES.returnDays],
  ["POLICIES.returnShippingPaidBy", POLICIES.returnShippingPaidBy],
  ["POLICIES.dispatchTime", POLICIES.dispatchTime],
];
for (const [k, v] of required) if (v === null || v === undefined || v === "") blockers.push(`Falta ${k} em data/store.ts`);
for (const [k, v] of [["BUSINESS.openingHours", BUSINESS.openingHours], ["BUSINESS.phone", BUSINESS.phone], ["POLICIES.hygieneNote", POLICIES.hygieneNote]] as const)
  if (!v) warnings.push(`Recomendado: ${k} em data/store.ts`);

if (!process.env.WHATSAPP_NUMBER && !BUSINESS.whatsapp) blockers.push("Número de WhatsApp não definido (WHATSAPP_NUMBER ou BUSINESS.whatsapp).");
if (!process.env.NEXT_PUBLIC_SITE_URL) blockers.push("NEXT_PUBLIC_SITE_URL não definido (domínio final, para URLs canónicos e sitemap).");

if (!SHIPPING_METHODS.length) warnings.push("SHIPPING_METHODS vazio: portes 'a combinar' e pagamento online desligado.");
if (!process.env.STRIPE_SECRET_KEY) warnings.push("STRIPE_SECRET_KEY não definido: só o canal WhatsApp fica ativo.");
else if (!process.env.STRIPE_WEBHOOK_SECRET) blockers.push("STRIPE_SECRET_KEY definido mas falta STRIPE_WEBHOOK_SECRET.");

const unverified = SIZE_CHARTS.filter((c) => !c.verified).map((c) => c.id);
if (unverified.length) blockers.push(`Tabelas de tamanhos por confirmar: ${unverified.join(", ")} (data/taxonomy.ts → verified: true).`);

blockers.push("Textos legais (app/legal/[doc]/page.tsx) marcados como minuta — validar com jurista e retirar o aviso.");
blockers.push("História da loja em app/sobre/page.tsx por escrever com a família.");

console.log(`\nX Íntimo — prontidão para lançamento (modo: ${mode})\n`);
if (blockers.length) console.log("BLOQUEIOS\n" + blockers.map((b) => `  ✗ ${b}`).join("\n") + "\n");
if (warnings.length) console.log("AVISOS\n" + warnings.map((w) => `  • ${w}`).join("\n") + "\n");
if (!blockers.length) console.log("✓ Sem bloqueios.\n");
process.exit(blockers.length ? 1 : 0);
