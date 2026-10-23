import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/loja", "/loja/pijamas", "/produto/robe-polar-mulher", "/checkout", "/apoio/guia-de-tamanhos", "/legal/privacidade", "/contactos"];

for (const path of PAGES) {
  test(`acessibilidade (axe, WCAG 2.2 AA): ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((e) => e.classList.add("is-in")));
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("teclado: saco abre, prende o foco e devolve-o ao fechar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const bagBtn = page.getByRole("button", { name: /Saco de compras/ });
  await bagBtn.focus();
  await page.keyboard.press("Enter");
  const dlg = page.getByRole("dialog", { name: /O seu saco/ });
  await expect(dlg).toBeVisible();
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect(bagBtn).toBeFocused();
});

test("o primeiro Tab mostra a ligação para saltar para o conteúdo", async ({ page }) => {
  await page.goto("/loja");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar para o conteúdo" })).toBeFocused();
});
