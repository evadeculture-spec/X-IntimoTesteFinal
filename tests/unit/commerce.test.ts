import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DEMO_PRODUCTS } from "@/data/demo-catalog";
import { DEMO_SHIPPING_METHODS } from "@/data/store";
import { formatPrice } from "@/lib/commerce/format";
import { computeTotals, methodsFor, regionFromPostalCode, shippingCost } from "@/lib/commerce/pricing";
import { maxQuantity, variantAvailability } from "@/lib/commerce/product";
import { matchesSearch, parseQuery, queryToSearch, runQuery, sortSizes } from "@/lib/commerce/query";
import { validateProducts } from "@/lib/commerce/validate-catalog";
import { EMPTY_CHECKOUT, isValidNif, normalizePhone, normalizePostalCode, validateCheckout } from "@/lib/commerce/validation";
import { verifyWebhookSignature } from "@/lib/commerce/stripe";
import { orderMessage } from "@/lib/commerce/whatsapp";

describe("formatação", () => {
  it("formata euros em pt-PT", () => {
    expect(formatPrice(2990).replace(/\s/g, " ")).toBe("29,90 €");
    expect(formatPrice(123456).replace(/\s/g, " ")).toMatch(/^1.?234,56 €$/);
  });
});

describe("portes e totais", () => {
  it("deteta a região pelo código postal", () => {
    expect(regionFromPostalCode("1000-001")).toBe("continente");
    expect(regionFromPostalCode("9000-018")).toBe("madeira");
    expect(regionFromPostalCode("9400-001")).toBe("madeira"); // Porto Santo
    expect(regionFromPostalCode("9500-123")).toBe("acores");
    expect(regionFromPostalCode("0999-000")).toBeNull();
    expect(regionFromPostalCode("1000")).toBeNull();
  });

  it("filtra métodos por região, levantamento sempre disponível", () => {
    const ids = (r: Parameters<typeof methodsFor>[1]) => methodsFor(DEMO_SHIPPING_METHODS, r).map((m) => m.id);
    expect(ids("continente")).toEqual(["envio-continente", "levantamento"]);
    expect(ids("acores")).toEqual(["envio-ilhas", "levantamento"]);
    expect(ids(null)).toEqual(["levantamento"]);
  });

  it("aplica portes grátis a partir do limite", () => {
    const m = DEMO_SHIPPING_METHODS[0]!;
    expect(shippingCost(m, 4999)).toBe(395);
    expect(shippingCost(m, 5000)).toBe(0);
  });

  it("calcula totais em cêntimos sem erros de vírgula flutuante", () => {
    const t = computeTotals(
      [
        { unitPrice: 1990, quantity: 3 },
        { unitPrice: 750, quantity: 1 },
      ],
      DEMO_SHIPPING_METHODS[0],
    );
    expect(t).toEqual({ subtotal: 6720, shipping: 0, total: 6720, itemCount: 4 });
    expect(computeTotals([{ unitPrice: 1290, quantity: 1 }], DEMO_SHIPPING_METHODS[0]).total).toBe(1685);
    expect(computeTotals([{ unitPrice: 1290, quantity: 1 }]).shipping).toBeNull();
  });
});

describe("validação do checkout", () => {
  it("valida NIF português (dígito de controlo)", () => {
    expect(isValidNif("123456789")).toBe(true);
    expect(isValidNif("123456780")).toBe(false);
    expect(isValidNif("501442600")).toBe(true);
    expect(isValidNif("12345678")).toBe(false);
    expect(isValidNif("412345678")).toBe(false);
  });

  it("normaliza telefone e código postal", () => {
    expect(normalizePhone("912 345 678")).toBe("+351912345678");
    expect(normalizePhone("+351 212 345 678")).toBe("+351212345678");
    expect(normalizePhone("812345678")).toBeNull();
    expect(normalizePhone("+44 7700 900123")).toBe("+447700900123");
    expect(normalizePostalCode("1000123")).toBe("1000-123");
  });

  it("exige morada só no envio para casa", () => {
    const base = { ...EMPTY_CHECKOUT, email: "ana@exemplo.pt", phone: "912345678", firstName: "Ana", lastName: "Silva", acceptTerms: true };
    expect(Object.keys(validateCheckout(base))).toEqual(["address", "postalCode", "city"]);
    expect(validateCheckout({ ...base, delivery: "levantamento" })).toEqual({});
    expect(validateCheckout({ ...base, address: "Rua A, 1", postalCode: "1000-01", city: "Lisboa" }).postalCode).toMatch(/0000-000/);
    expect(validateCheckout({ ...base, delivery: "levantamento", acceptTerms: false }).acceptTerms).toBeTruthy();
    expect(validateCheckout({ ...base, delivery: "levantamento", email: "ana@" }).email).toBeTruthy();
    expect(validateCheckout({ ...base, delivery: "levantamento", nif: "123" }).nif).toBeTruthy();
  });
});

describe("catálogo e pesquisa", () => {
  it("o catálogo de demonstração passa a validação estrutural", () => {
    const { errors } = validateProducts(DEMO_PRODUCTS as unknown[]);
    expect(errors).toEqual([]);
  });

  it("deteta erros no catálogo real", () => {
    const bad = [{ ...DEMO_PRODUCTS[0]!, price: 29.9, compareAtPrice: 100 }, { ...DEMO_PRODUCTS[0]! }];
    const { errors, products } = validateProducts(bad);
    expect(products).toEqual([]);
    expect(errors.join("\n")).toMatch(/cêntimos/);
    expect(errors.join("\n")).toMatch(/slug duplicado/);
  });

  it("pesquisa sem acentos e com plurais", () => {
    const pijama = DEMO_PRODUCTS.find((p) => p.slug === "pijama-flanela-xadrez-homem")!;
    expect(matchesSearch(pijama, "PIJAMAS")).toBe(true);
    expect(matchesSearch(pijama, "algodao")).toBe(true);
    expect(matchesSearch(pijama, "meias")).toBe(false);
  });

  it("filtra, ordena e pagina", () => {
    const q = parseQuery({ publico: "homem", ordem: "preco-asc" });
    const r = runQuery(DEMO_PRODUCTS, q);
    expect(r.items.every((p) => p.audience === "homem")).toBe(true);
    expect(r.items.map((p) => p.price)).toEqual([...r.items.map((p) => p.price)].sort((a, b) => a - b));
    const all = runQuery(DEMO_PRODUCTS, parseQuery({ pagina: "2" }));
    expect(all.pages).toBe(2);
    expect(all.items.length).toBe(DEMO_PRODUCTS.length - 12);
    expect(runQuery(DEMO_PRODUCTS, parseQuery({ pagina: "99" })).page).toBe(2);
  });

  it("filtro de tamanho ignora variantes esgotadas", () => {
    const r = runQuery(DEMO_PRODUCTS, parseQuery({ tamanho: "12A" }));
    for (const p of r.items) expect(p.variants.some((v) => v.size === "12A" && v.stock !== 0)).toBe(true);
  });

  it("serializa a query de volta para URL", () => {
    const q = parseQuery({ publico: "mulher,homem", cor: "azul" });
    expect(queryToSearch(q)).toBe("?publico=mulher%2Chomem&cor=azul");
    expect(queryToSearch(q, { publico: [] })).toBe("?cor=azul");
  });

  it("ordena tamanhos de forma natural", () => {
    expect(sortSizes(["XL", "S", "10A", "2A", "M", "39/42", "35/38"])).toEqual(["S", "M", "XL", "2A", "10A", "35/38", "39/42"]);
  });

  it("disponibilidade por variante", () => {
    expect(variantAvailability({ sku: "a", colourId: "x", size: "S", stock: 0 })).toBe("sold-out");
    expect(variantAvailability({ sku: "a", colourId: "x", size: "S", stock: 2 })).toBe("low");
    expect(variantAvailability({ sku: "a", colourId: "x", size: "S", stock: null })).toBe("untracked");
    expect(maxQuantity({ sku: "a", colourId: "x", size: "S", stock: 40 })).toBe(10);
  });
});

describe("Stripe webhook", () => {
  it("aceita assinatura válida e rejeita adulterada ou antiga", () => {
    const secret = "whsec_test";
    const payload = '{"type":"checkout.session.completed"}';
    const t = 1_700_000_000;
    const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
    const header = `t=${t},v1=${sig}`;
    expect(verifyWebhookSignature(payload, header, secret, 300, t * 1000)).toBe(true);
    expect(verifyWebhookSignature(payload + " ", header, secret, 300, t * 1000)).toBe(false);
    expect(verifyWebhookSignature(payload, header, secret, 300, (t + 3600) * 1000)).toBe(false);
    expect(verifyWebhookSignature(payload, null, secret)).toBe(false);
  });
});

describe("mensagem WhatsApp", () => {
  it("inclui referência, linhas, totais e dados de entrega", () => {
    const msg = orderMessage({
      ref: "XI-261023-ABCD",
      createdAt: "",
      lines: [{ sku: "S1", slug: "x", name: "Meias térmicas", brandName: "Ysabel Mora", colourName: "Cru", size: "35/38", unitPrice: 750, quantity: 2 }],
      shippingMethod: DEMO_SHIPPING_METHODS[0]!,
      subtotal: 1500,
      shipping: 395,
      shippingPending: false,
      total: 1895,
      customer: { ...EMPTY_CHECKOUT, firstName: "Ana", lastName: "Silva", email: "a@b.pt", phone: "+351912345678", address: "Rua A", postalCode: "1000-001", city: "Lisboa", acceptTerms: true },
    });
    expect(msg).toContain("XI-261023-ABCD");
    expect(msg).toContain("Meias térmicas — Cru, tam. 35/38 × 2");
    expect(msg.replace(/\s/g, " ")).toContain("Total: 18,95 €");
    expect(msg).toContain("1000-001 Lisboa");
  });
});
