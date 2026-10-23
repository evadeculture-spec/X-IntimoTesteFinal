import { expect, test, type Page } from "@playwright/test";

const PRODUCT = "/produto/pijama-algodao-riscas-mulher";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

async function pickAvailableSize(page: Page) {
  const sizes = page.locator(".pdp__panel .size:not(.is-out) input");
  await sizes.first().check({ force: true });
}

test("homepage: hero-gaveta leva às categorias, sem erros", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A primeira");
  await expect(page.locator(".demo-strip")).toContainText("Modo demonstração");
  const bands = page.getByRole("navigation", { name: "Famílias de produto" }).getByRole("link");
  await expect(bands).toHaveCount(4);
  await bands.filter({ hasText: "Meias" }).click();
  await expect(page).toHaveURL(/\/loja\/meias$/);
  await expect(page.getByRole("heading", { level: 1, name: "Meias" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("listagem: filtros, ordenação e estado vazio", async ({ page, isMobile }) => {
  await page.goto("/loja");
  await expect(page.locator(".toolbar__count")).toContainText("16 peças");
  if (isMobile) {
    await page.getByRole("button", { name: /Filtrar/ }).click();
    await page.getByRole("dialog", { name: "Filtrar" }).locator("label", { hasText: /^Homem$/ }).click();
    await page.getByRole("button", { name: "Ver resultados" }).click();
  } else {
    await page.locator(".listing__aside label", { hasText: /^Homem$/ }).click();
  }
  await expect(page).toHaveURL(/publico=homem/);
  await expect(page.locator(".toolbar__count")).toContainText("5 peças");
  await page.locator("#ordem").selectOption("preco-desc");
  await expect(page).toHaveURL(/ordem=preco-desc/);
  await page.goto("/pesquisa?q=xyzzy");
  await expect(page.getByText(/Nada encontrado/)).toBeVisible();
});

test("pesquisa no cabeçalho com sugestões", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pesquisar" }).first().click();
  await page.getByLabel("Pesquisar produtos").fill("termica");
  await expect(page.locator(".search__results a").first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/pesquisa\?q=termica/);
  await expect(page.locator(".product-grid .card").first()).toBeVisible();
});

test("produto: exige tamanho, adiciona ao saco e persiste", async ({ page }) => {
  await page.goto(PRODUCT);
  await page.getByTestId("add-to-bag").click();
  await expect(page.locator("#buy-error")).toContainText("Escolha um tamanho");
  await page.locator(".swatch input").nth(1).check({ force: true });
  await expect(page).toHaveURL(/cor=rosa-cha/);
  await pickAvailableSize(page);
  await page.getByTestId("add-to-bag").click();
  await expect(page.locator(".pdp__added")).toContainText("Adicionado ao saco");
  await expect(page.getByRole("button", { name: /Saco de compras, 1 artigo/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /Saco de compras, 1 artigo/ })).toBeVisible();
  await page.getByRole("button", { name: /Saco de compras/ }).click();
  const bag = page.getByRole("dialog", { name: /O seu saco/ });
  await expect(bag).toContainText("Rosa-chá");
  await expect(bag.locator(".ship-meter")).toContainText(/Faltam 20,10\s€ para portes grátis/);
  await bag.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(bag.locator("output")).toHaveText("2");
  await page.keyboard.press("Escape");
  await expect(bag).toBeHidden();
});

test("checkout: validação, portes por região e pedido por WhatsApp", async ({ page }) => {
  await page.goto(PRODUCT);
  await pickAvailableSize(page);
  await page.getByTestId("add-to-bag").click();
  await page.goto("/checkout");

  await expect(page.getByRole("radio", { name: /Pagar agora/ })).toBeDisabled();
  await page.getByTestId("place-order").click();
  const summary = page.locator(".error-summary");
  await expect(summary).toContainText("Há campos por corrigir");
  await expect(summary.getByRole("link")).toHaveCount(8);

  await page.getByLabel("Email").fill("ana@exemplo.pt");
  await page.getByLabel("Telemóvel").fill("912 345 678");
  await page.getByLabel("Nome", { exact: true }).fill("Ana");
  await page.getByLabel("Apelido").fill("Silva");
  await page.getByLabel("Morada", { exact: true }).fill("Rua das Flores, 12");
  await page.getByLabel("Código postal").fill("9500123");
  await page.getByLabel("Localidade").fill("Ponta Delgada");
  await page.getByLabel("Localidade").press("Tab");
  await expect(page.getByLabel("Código postal")).toHaveValue("9500-123");
  await expect(page.getByRole("radio", { name: /Envio para casa — Madeira e Açores/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Envio para casa — Continente/ })).toHaveCount(0);
  await page.getByLabel("NIF para fatura").fill("123456780");
  await page.getByLabel("NIF para fatura").blur();
  await expect(page.locator("#e-nif")).toContainText("Este NIF não é válido");
  await page.getByLabel("NIF para fatura").fill("123456789");
  await page.getByLabel(/Li e aceito/).check();
  await page.getByTestId("place-order").click();

  await expect(page).toHaveURL(/\/encomenda\/confirmada\?ref=XI-/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Falta só");
  await expect(page.locator(".confirm__ref")).toContainText(/XI-\d{6}-/);
  await expect(page.getByText("Modo de teste")).toBeVisible();
  await expect(page.locator(".summary__total")).toContainText("37,85"); // 29,90 + 7,95 (ilhas, ilustrativo)
  await expect(page.getByRole("button", { name: "Saco de compras, vazio" })).toBeVisible();
});

test("API: preços vêm do servidor e stock é validado", async ({ request }) => {
  const base = {
    customer: { email: "a@b.pt", phone: "912345678", firstName: "A", lastName: "B", delivery: "levantamento", acceptTerms: true, channel: "whatsapp" },
    shippingMethodId: "levantamento",
  };
  const res = await request.post("/api/checkout", {
    data: { ...base, lines: [{ sku: "MEIAS-TERMICAS-CRU-35-38", quantity: 1, unitPrice: 1 }] },
  });
  const json = await res.json();
  if (res.status() === 409) {
    expect(json.lineErrors).toBeTruthy(); // variante esgotada no catálogo de demonstração
  } else {
    expect(json.ok).toBe(true);
    expect(json.summary.total).toBe(750);
    expect(json.priceChanged).toBe(true);
  }
  const tooMany = await request.post("/api/checkout", { data: { ...base, lines: [{ sku: "MEIAS-TERMICAS-CRU-35-38", quantity: 99 }] } });
  expect(tooMany.status()).toBe(409);
  const online = await request.post("/api/checkout", {
    data: { ...base, customer: { ...base.customer, channel: "online" }, lines: [{ sku: "MEIAS-TERMICAS-CRU-35-38", quantity: 1 }] },
  });
  expect(online.status()).toBe(503);
  const invalid = await request.post("/api/checkout", { data: { ...base, customer: { ...base.customer, email: "x" }, lines: [{ sku: "X", quantity: 1 }] } });
  expect(invalid.status()).toBe(422);
});

test("páginas institucionais e 404", async ({ page }) => {
  for (const path of ["/sobre", "/contactos", "/apoio", "/apoio/guia-de-tamanhos", "/legal/termos", "/legal/privacidade", "/legal/cookies", "/legal/litigios", "/saco"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  const res = await page.goto("/produto/nao-existe");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Gaveta vazia")).toBeVisible();
});

test("modo demonstração: noindex e robots bloqueados", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \//);
});
