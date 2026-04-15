import { expect, test } from "@playwright/test";

test.describe("smoke público", () => {
  test("home responde e contém marca eKite", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/eKite/i);
  });

  test("página de login mostra formulário Entrar", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Entrar", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
  });

  test("página de cadastro carrega", async ({ page }) => {
    await page.goto("/cadastro");
    await expect(page).toHaveTitle(/Criar conta/i);
  });
});
